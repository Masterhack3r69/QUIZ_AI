/**
 * Base AI Provider Class
 * 
 * Abstract base class for all AI provider implementations.
 * Defines the interface and common utilities for AI providers.
 */

class BaseAIProvider {
  /**
   * @param {string} name - Provider name (e.g., 'openrouter', 'gemini', 'ollama')
   * @param {Object} config - Provider configuration
   */
  constructor(name, config) {
    if (this.constructor === BaseAIProvider) {
      throw new Error('BaseAIProvider is an abstract class and cannot be instantiated directly');
    }

    this.name = name;
    this.config = config;
  }

  /**
   * Generate AI completion for the given prompt
   * Must be implemented by subclasses
   * 
   * @param {string} prompt - The prompt to send to the AI
   * @param {Object} options - Generation options
   * @param {number} [options.temperature=0.7] - Sampling temperature (0-1)
   * @param {number} [options.maxTokens=2000] - Maximum tokens to generate
   * @param {number} [options.timeout=30000] - Request timeout in milliseconds
   * @param {boolean} [options.jsonMode=false] - Whether to request JSON output
   * @param {string} [options.model] - Override default model
   * @returns {Promise<Object>} Standardized response object
   * @throws {Error} Must be implemented by subclass
   */
  async generateCompletion(prompt, options = {}) {
    throw new Error(`generateCompletion() must be implemented by ${this.constructor.name}`);
  }

  /**
   * Parse raw provider response into standardized format
   * Must be implemented by subclasses
   * 
   * @param {*} response - Raw response from the provider
   * @returns {Object} Standardized response with { text, tokensUsed, model }
   * @throws {Error} Must be implemented by subclass
   */
  parseResponse(response) {
    throw new Error(`parseResponse() must be implemented by ${this.constructor.name}`);
  }

  /**
   * Check if the provider is available and properly configured
   * Must be implemented by subclasses
   * 
   * @returns {Promise<boolean>} True if provider is available
   */
  async isAvailable() {
    throw new Error(`isAvailable() must be implemented by ${this.constructor.name}`);
  }

  /**
   * Check if provider has required credentials
   * 
   * @returns {boolean} True if credentials are present
   */
  hasRequiredCredentials() {
    // Default implementation - can be overridden
    return this.config.enabled !== false;
  }

  /**
   * Get the model to use for this request
   * 
   * @param {Object} options - Request options
   * @returns {string} Model identifier
   */
  getModel(options = {}) {
    if (options.model) {
      return options.model;
    }

    if (this.config.model) {
      return this.config.model;
    }

    if (this.config.models && this.config.models.free) {
      return this.config.models.free;
    }

    throw new Error(`No model configured for provider ${this.name}`);
  }

  /**
   * Create standardized response object
   * 
   * @param {string} text - Generated text
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Standardized response
   */
  createStandardResponse(text, metadata = {}) {
    return {
      success: true,
      provider: this.name,
      text: text,
      tokensUsed: metadata.tokensUsed || null,
      model: metadata.model || this.getModel(),
      executionTime: metadata.executionTime || null,
      ...metadata
    };
  }

  /**
   * Create standardized error response
   * 
   * @param {Error} error - The error that occurred
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Standardized error response
   */
  createErrorResponse(error, metadata = {}) {
    return {
      success: false,
      provider: this.name,
      error: error.message,
      errorType: error.constructor.name,
      ...metadata
    };
  }

  /**
   * Handle common errors and throw appropriate exceptions
   * 
   * @param {Error} error - The error to handle
   * @throws {AIProviderError} Wrapped error with provider context
   */
  handleError(error) {
    // Check for common error types
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      throw new AIProviderRateLimitError(this.name, error);
    }

    if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
      throw new AIProviderTimeoutError(this.name, error);
    }

    if (error.message.includes('authentication') || error.message.includes('401') || error.message.includes('403')) {
      throw new AIProviderAuthError(this.name, error);
    }

    if (error.message.includes('not found') || error.message.includes('404')) {
      throw new AIProviderNotFoundError(this.name, error);
    }

    // Generic provider error
    throw new AIProviderError(this.name, error);
  }

  /**
   * Log provider activity
   * 
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      provider: this.name,
      level,
      message,
      ...data
    };

    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      default:
        console.log(logMessage, data);
    }
  }
}

/**
 * Custom Error Classes for AI Providers
 */

class AIProviderError extends Error {
  constructor(provider, originalError) {
    super(`AI Provider ${provider} failed: ${originalError.message}`);
    this.name = 'AIProviderError';
    this.provider = provider;
    this.originalError = originalError;
  }
}

class AIProviderRateLimitError extends AIProviderError {
  constructor(provider, originalError) {
    super(provider, originalError);
    this.name = 'AIProviderRateLimitError';
  }
}

class AIProviderTimeoutError extends AIProviderError {
  constructor(provider, originalError) {
    super(provider, originalError);
    this.name = 'AIProviderTimeoutError';
  }
}

class AIProviderAuthError extends AIProviderError {
  constructor(provider, originalError) {
    super(provider, originalError);
    this.name = 'AIProviderAuthError';
  }
}

class AIProviderNotFoundError extends AIProviderError {
  constructor(provider, originalError) {
    super(provider, originalError);
    this.name = 'AIProviderNotFoundError';
  }
}

export default BaseAIProvider;
export {
  AIProviderError,
  AIProviderRateLimitError,
  AIProviderTimeoutError,
  AIProviderAuthError,
  AIProviderNotFoundError
};
