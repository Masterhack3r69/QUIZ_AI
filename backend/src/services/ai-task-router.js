/**
 * AI Task Router Service
 * 
 * Central service that routes AI tasks to appropriate providers based on configuration.
 * Implements fallback logic, retry mechanisms with exponential backoff, and comprehensive logging.
 */

import configLoader from './config-loader.js';
import OpenRouterProvider from './ai-providers/openrouter-provider.js';
import GeminiProvider from './ai-providers/gemini-provider.js';
import OllamaProvider from './ai-providers/ollama-provider.js';
import GitHubProvider from './ai-providers/github-provider.js';
import usageTracker from './usage-tracker.js';
import {
  AIProviderError,
  AIProviderRateLimitError,
  AIProviderTimeoutError
} from './ai-providers/base-provider.js';

/**
 * Custom error for task execution failures
 */
class TaskExecutionError extends Error {
  constructor(taskName, attemptedProviders, errors = []) {
    const errorDetails = errors.map(e => `${e.provider}: ${e.error}`).join('; ');
    super(`Task "${taskName}" failed after trying providers: ${attemptedProviders.join(', ')}. Errors: ${errorDetails}`);
    this.name = 'TaskExecutionError';
    this.taskName = taskName;
    this.attemptedProviders = attemptedProviders;
    this.errors = errors;
  }
}

class AITaskRouter {
  constructor() {
    this.config = null;
    this.providers = {};
    this.initialized = false;
  }

  /**
   * Initialize the task router
   * Loads configuration and initializes provider instances
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Load configuration
      this.config = configLoader.loadAITasksConfig();
      
      // Initialize provider instances
      this.providers = {
        github: new GitHubProvider(this.config.providers.github),
        openrouter: new OpenRouterProvider(this.config.providers.openrouter),
        gemini: new GeminiProvider(this.config.providers.gemini),
        ollama: new OllamaProvider(this.config.providers.ollama)
      };

      this.log('info', 'Task router initialized', {
        tasks: Object.keys(this.config.tasks).length,
        providers: Object.keys(this.providers).length
      });

      this.initialized = true;
    } catch (error) {
      this.log('error', 'Failed to initialize task router', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute a task using the configured provider with fallback support
   * 
   * @param {string} taskName - Name of the task (e.g., 'content-extraction')
   * @param {string} prompt - The prompt to send to the AI
   * @param {Object} options - Additional options
   * @param {string} [options.forceProvider] - Force a specific provider
   * @param {number} [options.temperature] - Sampling temperature
   * @param {number} [options.maxTokens] - Maximum tokens to generate
   * @param {boolean} [options.jsonMode] - Request JSON output
   * @returns {Promise<Object>} Task result with provider info
   * @throws {TaskExecutionError} If all providers fail
   */
  async executeTask(taskName, prompt, options = {}) {
    await this.initialize();

    const startTime = Date.now();
    const taskConfig = this.getTaskConfig(taskName);
    const attemptedProviders = [];
    const errors = [];

    // Check rate limits before executing
    this.checkRateLimits();

    this.log('info', `Executing task: ${taskName}`, {
      taskName,
      promptLength: prompt.length,
      options: {
        forceProvider: options.forceProvider,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        jsonMode: options.jsonMode
      }
    });

    // If forceProvider is specified, only try that provider
    if (options.forceProvider) {
      const provider = this.providers[options.forceProvider];
      if (!provider) {
        throw new Error(`Unknown provider: ${options.forceProvider}`);
      }

      try {
        const result = await this.executeWithProvider(
          provider,
          prompt,
          taskConfig,
          options
        );
        
        this.logTaskSuccess(taskName, options.forceProvider, Date.now() - startTime, result);
        return result;
      } catch (error) {
        this.logTaskFailure(taskName, options.forceProvider, error);
        throw new TaskExecutionError(taskName, [options.forceProvider], [
          { provider: options.forceProvider, error: error.message }
        ]);
      }
    }

    // Try primary provider first
    const primaryProvider = taskConfig.primary;
    const fallbackProviders = taskConfig.fallback || [];
    const providersToTry = [primaryProvider, ...fallbackProviders];

    // Try each provider in order
    for (const providerName of providersToTry) {
      const provider = this.providers[providerName];
      
      if (!provider) {
        this.log('warn', `Provider not found: ${providerName}`, { taskName });
        continue;
      }

      attemptedProviders.push(providerName);

      try {
        // Check if provider is available before attempting
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          this.log('warn', `Provider not available: ${providerName}`, { taskName });
          errors.push({
            provider: providerName,
            error: 'Provider not available'
          });
          continue;
        }

        // Execute with this provider
        const result = await this.executeWithProvider(
          provider,
          prompt,
          taskConfig,
          options
        );

        // Log success
        this.logTaskSuccess(taskName, providerName, Date.now() - startTime, result);

        // Log fallback event if we didn't use primary
        if (providerName !== primaryProvider) {
          this.logFallbackEvent(taskName, primaryProvider, providerName, attemptedProviders);
        }

        return result;

      } catch (error) {
        // Log the failure
        this.logTaskFailure(taskName, providerName, error);
        
        errors.push({
          provider: providerName,
          error: error.message
        });

        // If this is not the last provider, log fallback attempt
        const isLastProvider = providerName === providersToTry[providersToTry.length - 1];
        if (!isLastProvider) {
          this.log('warn', `Provider ${providerName} failed, trying fallback`, {
            taskName,
            error: error.message,
            nextProvider: providersToTry[providersToTry.indexOf(providerName) + 1]
          });
        }
      }
    }

    // All providers failed
    const totalTime = Date.now() - startTime;
    this.log('error', `Task failed: all providers exhausted`, {
      taskName,
      attemptedProviders,
      totalTime,
      errors
    });

    throw new TaskExecutionError(taskName, attemptedProviders, errors);
  }

  /**
   * Execute task with a specific provider, including retry logic
   * 
   * @param {BaseAIProvider} provider - The provider instance
   * @param {string} prompt - The prompt to send
   * @param {Object} taskConfig - Task configuration
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Provider response
   */
  async executeWithProvider(provider, prompt, taskConfig, options) {
    const maxRetries = taskConfig.maxRetries || 2;
    const timeout = options.timeout || taskConfig.timeout || 30000;
    const model = options.model || taskConfig.model;

    // Build provider options
    const providerOptions = {
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      timeout: timeout,
      jsonMode: options.jsonMode,
      model: model
    };

    // Execute with retry logic
    return await this.retryWithBackoff(
      async () => {
        return await provider.generateCompletion(prompt, providerOptions);
      },
      maxRetries,
      1000, // Base delay: 1 second
      provider.name
    );
  }

  /**
   * Retry a function with exponential backoff
   * 
   * @param {Function} fn - Async function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds (doubles each retry)
   * @param {string} providerName - Provider name for logging
   * @returns {Promise<*>} Function result
   * @throws {Error} Last error if all retries fail
   */
  async retryWithBackoff(fn, maxRetries, baseDelay, providerName) {
    let lastError;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attempt++;

        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          this.log('info', `Not retrying due to error type: ${error.name}`, {
            provider: providerName,
            error: error.message
          });
          throw error;
        }

        // If we've exhausted retries, throw the error
        if (attempt > maxRetries) {
          this.log('warn', `Max retries (${maxRetries}) exceeded`, {
            provider: providerName,
            error: error.message
          });
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        
        this.log('info', `Retry attempt ${attempt}/${maxRetries} after ${delay}ms`, {
          provider: providerName,
          error: error.message
        });

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Determine if an error should not be retried
   * 
   * @param {Error} error - The error to check
   * @returns {boolean} True if should not retry
   */
  shouldNotRetry(error) {
    // Don't retry authentication errors
    if (error.name === 'AIProviderAuthError') {
      return true;
    }

    // Don't retry not found errors (model doesn't exist)
    if (error.name === 'AIProviderNotFoundError') {
      return true;
    }

    // Don't retry validation errors
    if (error.name === 'ValidationError') {
      return true;
    }

    // Retry rate limits and timeouts
    return false;
  }

  /**
   * Get task configuration
   * 
   * @param {string} taskName - Name of the task
   * @returns {Object} Task configuration
   */
  getTaskConfig(taskName) {
    if (!this.config || !this.config.tasks[taskName]) {
      throw new Error(`Unknown task: ${taskName}`);
    }
    return this.config.tasks[taskName];
  }

  /**
   * Log task success
   * 
   * @param {string} taskName - Name of the task
   * @param {string} provider - Provider used
   * @param {number} executionTime - Time taken in ms
   * @param {Object} result - Task result
   */
  logTaskSuccess(taskName, provider, executionTime, result) {
    this.log('info', `Task completed successfully`, {
      taskName,
      provider,
      executionTime,
      tokensUsed: result.tokensUsed,
      model: result.model,
      success: true
    });

    // Track usage
    usageTracker.trackRequest({
      taskName,
      provider,
      model: result.model,
      tokensUsed: result.tokensUsed,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      executionTime,
      success: true
    });
  }

  /**
   * Log task failure
   * 
   * @param {string} taskName - Name of the task
   * @param {string} provider - Provider that failed
   * @param {Error} error - The error
   */
  logTaskFailure(taskName, provider, error) {
    this.log('error', `Task failed with provider`, {
      taskName,
      provider,
      error: error.message,
      errorType: error.name,
      success: false
    });

    // Track failed request
    usageTracker.trackRequest({
      taskName,
      provider,
      model: 'unknown',
      tokensUsed: 0,
      inputTokens: 0,
      outputTokens: 0,
      executionTime: 0,
      success: false,
      error: error.message
    });
  }

  /**
   * Log fallback event
   * 
   * @param {string} taskName - Name of the task
   * @param {string} primaryProvider - Primary provider that failed
   * @param {string} fallbackProvider - Fallback provider used
   * @param {Array<string>} attemptedProviders - All providers attempted
   */
  logFallbackEvent(taskName, primaryProvider, fallbackProvider, attemptedProviders) {
    this.log('warn', `Fallback provider used`, {
      taskName,
      primaryProvider,
      fallbackProvider,
      attemptedProviders,
      fallbackEvent: true
    });
  }

  /**
   * Structured logging
   * 
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {Object} data - Additional structured data
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      component: 'AITaskRouter',
      message,
      ...data
    };

    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [AITaskRouter] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, JSON.stringify(data, null, 2));
        break;
      case 'warn':
        console.warn(logMessage, JSON.stringify(data, null, 2));
        break;
      default:
        console.log(logMessage, JSON.stringify(data, null, 2));
    }
  }

  /**
   * Sleep utility
   * 
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check rate limits and log warnings
   */
  checkRateLimits() {
    const warnings = usageTracker.getRateLimitWarnings();
    
    warnings.forEach(warning => {
      if (warning.severity === 'error') {
        this.log('error', `Rate limit exceeded: ${warning.message}`, {
          provider: warning.provider,
          type: warning.type,
          current: warning.current,
          limit: warning.limit,
          percentUsed: warning.percentUsed
        });
      } else if (warning.severity === 'warning') {
        this.log('warn', `Approaching rate limit: ${warning.message}`, {
          provider: warning.provider,
          type: warning.type,
          current: warning.current,
          limit: warning.limit,
          percentUsed: warning.percentUsed
        });
      }
    });
  }

  /**
   * Get router statistics
   * 
   * @returns {Object} Router statistics
   */
  getStatistics() {
    return {
      initialized: this.initialized,
      tasks: this.config ? Object.keys(this.config.tasks) : [],
      providers: Object.keys(this.providers),
      availableProviders: Object.entries(this.providers)
        .filter(([_, provider]) => provider.hasRequiredCredentials())
        .map(([name, _]) => name)
    };
  }
}

// Export singleton instance
const aiTaskRouter = new AITaskRouter();

export default aiTaskRouter;
export { TaskExecutionError };
