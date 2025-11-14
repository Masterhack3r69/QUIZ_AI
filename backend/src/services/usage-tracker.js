/**
 * Usage Tracker Service
 * 
 * Tracks AI provider usage, token consumption, and estimated costs.
 * Stores data in-memory with periodic persistence to file system.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Provider pricing information (per 1M tokens)
 * Free tier limits and estimated costs for paid usage
 */
const PROVIDER_PRICING = {
  openrouter: {
    name: 'OpenRouter',
    models: {
      'meta-llama/llama-3.2-3b-instruct:free': {
        inputCost: 0, // Free
        outputCost: 0, // Free
        freeLimit: null // No explicit limit, but rate limited
      },
      'google/gemini-flash-1.5:free': {
        inputCost: 0,
        outputCost: 0,
        freeLimit: null
      }
    },
    rateLimits: {
      requestsPerMinute: 20,
      requestsPerDay: 200
    }
  },
  gemini: {
    name: 'Google Gemini',
    models: {
      'gemini-2.0-flash-exp': {
        inputCost: 0, // Free tier
        outputCost: 0, // Free tier
        freeLimit: 1500 // 1500 requests per day
      },
      'gemini-1.5-flash': {
        inputCost: 0.075, // $0.075 per 1M input tokens
        outputCost: 0.30, // $0.30 per 1M output tokens
        freeLimit: 1500
      }
    },
    rateLimits: {
      requestsPerMinute: 15,
      requestsPerDay: 1500
    }
  },
  ollama: {
    name: 'Ollama (Local)',
    models: {
      'llama3.2:1b': {
        inputCost: 0, // Local, no cost
        outputCost: 0,
        freeLimit: null
      }
    },
    rateLimits: {
      requestsPerMinute: null, // Limited by hardware
      requestsPerDay: null
    }
  }
};

class UsageTracker {
  constructor() {
    this.usage = {
      requests: [],
      summary: {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        byProvider: {},
        byTask: {}
      }
    };
    
    this.persistenceInterval = null;
    this.persistenceFile = path.join(__dirname, '../../data/usage-stats.json');
    this.initialized = false;
  }

  /**
   * Initialize the usage tracker
   * Loads existing data and starts periodic persistence
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Load existing usage data
      await this.loadUsageData();
      
      // Start periodic persistence (every 5 minutes)
      this.startPeriodicPersistence(5 * 60 * 1000);
      
      this.initialized = true;
      this.log('info', 'Usage tracker initialized', {
        totalRequests: this.usage.summary.totalRequests,
        providers: Object.keys(this.usage.summary.byProvider).length
      });
    } catch (error) {
      this.log('error', 'Failed to initialize usage tracker', {
        error: error.message
      });
      // Continue anyway - we can track in memory
      this.initialized = true;
    }
  }

  /**
   * Track an AI request
   * 
   * @param {Object} requestData - Request information
   * @param {string} requestData.taskName - Name of the task
   * @param {string} requestData.provider - Provider used
   * @param {string} requestData.model - Model used
   * @param {number} requestData.tokensUsed - Total tokens used
   * @param {number} requestData.inputTokens - Input tokens
   * @param {number} requestData.outputTokens - Output tokens
   * @param {number} requestData.executionTime - Time taken in ms
   * @param {boolean} requestData.success - Whether request succeeded
   * @param {string} [requestData.error] - Error message if failed
   */
  async trackRequest(requestData) {
    await this.initialize();

    const timestamp = new Date().toISOString();
    const cost = this.calculateCost(
      requestData.provider,
      requestData.model,
      requestData.inputTokens || 0,
      requestData.outputTokens || 0
    );

    const request = {
      timestamp,
      taskName: requestData.taskName,
      provider: requestData.provider,
      model: requestData.model,
      tokensUsed: requestData.tokensUsed || 0,
      inputTokens: requestData.inputTokens || 0,
      outputTokens: requestData.outputTokens || 0,
      executionTime: requestData.executionTime,
      success: requestData.success,
      error: requestData.error,
      estimatedCost: cost
    };

    // Add to requests array
    this.usage.requests.push(request);

    // Update summary
    this.updateSummary(request);

    // Keep only last 1000 requests in memory
    if (this.usage.requests.length > 1000) {
      this.usage.requests = this.usage.requests.slice(-1000);
    }

    this.log('debug', 'Request tracked', {
      taskName: request.taskName,
      provider: request.provider,
      success: request.success,
      cost: cost
    });
  }

  /**
   * Update summary statistics
   * 
   * @param {Object} request - Request data
   */
  updateSummary(request) {
    // Update totals
    this.usage.summary.totalRequests++;
    this.usage.summary.totalTokens += request.tokensUsed;
    this.usage.summary.totalCost += request.estimatedCost;

    // Update by provider
    if (!this.usage.summary.byProvider[request.provider]) {
      this.usage.summary.byProvider[request.provider] = {
        requests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        avgExecutionTime: 0,
        totalExecutionTime: 0
      };
    }

    const providerStats = this.usage.summary.byProvider[request.provider];
    providerStats.requests++;
    if (request.success) {
      providerStats.successfulRequests++;
    } else {
      providerStats.failedRequests++;
    }
    providerStats.totalTokens += request.tokensUsed;
    providerStats.totalCost += request.estimatedCost;
    providerStats.totalExecutionTime += request.executionTime;
    providerStats.avgExecutionTime = providerStats.totalExecutionTime / providerStats.requests;

    // Update by task
    if (!this.usage.summary.byTask[request.taskName]) {
      this.usage.summary.byTask[request.taskName] = {
        requests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0,
        avgExecutionTime: 0,
        totalExecutionTime: 0
      };
    }

    const taskStats = this.usage.summary.byTask[request.taskName];
    taskStats.requests++;
    if (request.success) {
      taskStats.successfulRequests++;
    } else {
      taskStats.failedRequests++;
    }
    taskStats.totalTokens += request.tokensUsed;
    taskStats.totalExecutionTime += request.executionTime;
    taskStats.avgExecutionTime = taskStats.totalExecutionTime / taskStats.requests;
  }

  /**
   * Calculate estimated cost for a request
   * 
   * @param {string} provider - Provider name
   * @param {string} model - Model name
   * @param {number} inputTokens - Input tokens
   * @param {number} outputTokens - Output tokens
   * @returns {number} Estimated cost in USD
   */
  calculateCost(provider, model, inputTokens, outputTokens) {
    const providerPricing = PROVIDER_PRICING[provider];
    if (!providerPricing) {
      return 0;
    }

    const modelPricing = providerPricing.models[model];
    if (!modelPricing) {
      // Use first model pricing as fallback
      const firstModel = Object.values(providerPricing.models)[0];
      if (!firstModel) {
        return 0;
      }
      return (inputTokens * firstModel.inputCost / 1000000) + 
             (outputTokens * firstModel.outputCost / 1000000);
    }

    return (inputTokens * modelPricing.inputCost / 1000000) + 
           (outputTokens * modelPricing.outputCost / 1000000);
  }

  /**
   * Get usage statistics
   * 
   * @param {Object} options - Query options
   * @param {string} [options.provider] - Filter by provider
   * @param {string} [options.taskName] - Filter by task
   * @param {Date} [options.startDate] - Start date for filtering
   * @param {Date} [options.endDate] - End date for filtering
   * @returns {Object} Usage statistics
   */
  getStatistics(options = {}) {
    let requests = this.usage.requests;

    // Apply filters
    if (options.provider) {
      requests = requests.filter(r => r.provider === options.provider);
    }
    if (options.taskName) {
      requests = requests.filter(r => r.taskName === options.taskName);
    }
    if (options.startDate) {
      requests = requests.filter(r => new Date(r.timestamp) >= options.startDate);
    }
    if (options.endDate) {
      requests = requests.filter(r => new Date(r.timestamp) <= options.endDate);
    }

    // Calculate statistics
    const totalRequests = requests.length;
    const successfulRequests = requests.filter(r => r.success).length;
    const failedRequests = requests.filter(r => !r.success).length;
    const totalTokens = requests.reduce((sum, r) => sum + r.tokensUsed, 0);
    const totalCost = requests.reduce((sum, r) => sum + r.estimatedCost, 0);
    const avgExecutionTime = totalRequests > 0 
      ? requests.reduce((sum, r) => sum + r.executionTime, 0) / totalRequests 
      : 0;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      totalTokens,
      totalCost,
      avgExecutionTime,
      byProvider: this.usage.summary.byProvider,
      byTask: this.usage.summary.byTask
    };
  }

  /**
   * Get rate limit warnings
   * 
   * @returns {Array<Object>} Array of warnings
   */
  getRateLimitWarnings() {
    const warnings = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Check each provider
    for (const [providerName, providerPricing] of Object.entries(PROVIDER_PRICING)) {
      const rateLimits = providerPricing.rateLimits;
      if (!rateLimits) continue;

      const providerRequests = this.usage.requests.filter(r => r.provider === providerName);

      // Check daily limit
      if (rateLimits.requestsPerDay) {
        const requestsToday = providerRequests.filter(
          r => new Date(r.timestamp) >= oneDayAgo
        ).length;

        const percentUsed = (requestsToday / rateLimits.requestsPerDay) * 100;

        if (percentUsed >= 100) {
          warnings.push({
            provider: providerName,
            type: 'daily_limit_exceeded',
            severity: 'error',
            message: `Daily rate limit exceeded for ${providerPricing.name}`,
            current: requestsToday,
            limit: rateLimits.requestsPerDay,
            percentUsed: percentUsed
          });
        } else if (percentUsed >= 80) {
          warnings.push({
            provider: providerName,
            type: 'daily_limit_warning',
            severity: 'warning',
            message: `Approaching daily rate limit for ${providerPricing.name}`,
            current: requestsToday,
            limit: rateLimits.requestsPerDay,
            percentUsed: percentUsed
          });
        }
      }

      // Check per-minute limit
      if (rateLimits.requestsPerMinute) {
        const requestsLastMinute = providerRequests.filter(
          r => new Date(r.timestamp) >= oneMinuteAgo
        ).length;

        const percentUsed = (requestsLastMinute / rateLimits.requestsPerMinute) * 100;

        if (percentUsed >= 100) {
          warnings.push({
            provider: providerName,
            type: 'minute_limit_exceeded',
            severity: 'error',
            message: `Per-minute rate limit exceeded for ${providerPricing.name}`,
            current: requestsLastMinute,
            limit: rateLimits.requestsPerMinute,
            percentUsed: percentUsed
          });
        } else if (percentUsed >= 80) {
          warnings.push({
            provider: providerName,
            type: 'minute_limit_warning',
            severity: 'warning',
            message: `Approaching per-minute rate limit for ${providerPricing.name}`,
            current: requestsLastMinute,
            limit: rateLimits.requestsPerMinute,
            percentUsed: percentUsed
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Get rate limit information for all providers
   * 
   * @returns {Array<Object>} Array of rate limit info per provider
   */
  getRateLimitInfo() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const limitInfo = [];

    // Get info for each provider
    for (const [providerName, providerPricing] of Object.entries(PROVIDER_PRICING)) {
      const rateLimits = providerPricing.rateLimits;
      if (!rateLimits) continue;

      const providerRequests = this.usage.requests.filter(r => r.provider === providerName);

      const info = {
        provider: providerName,
        name: providerPricing.name,
        limits: {}
      };

      // Daily limit info
      if (rateLimits.requestsPerDay) {
        const requestsToday = providerRequests.filter(
          r => new Date(r.timestamp) >= oneDayAgo
        ).length;

        info.limits.daily = {
          limit: rateLimits.requestsPerDay,
          current: requestsToday,
          remaining: Math.max(0, rateLimits.requestsPerDay - requestsToday),
          percentUsed: Math.round((requestsToday / rateLimits.requestsPerDay) * 100 * 100) / 100,
          resetAt: new Date(now.getTime() + (24 * 60 * 60 * 1000) - (now.getTime() % (24 * 60 * 60 * 1000))).toISOString()
        };
      }

      // Per-minute limit info
      if (rateLimits.requestsPerMinute) {
        const requestsLastMinute = providerRequests.filter(
          r => new Date(r.timestamp) >= oneMinuteAgo
        ).length;

        info.limits.perMinute = {
          limit: rateLimits.requestsPerMinute,
          current: requestsLastMinute,
          remaining: Math.max(0, rateLimits.requestsPerMinute - requestsLastMinute),
          percentUsed: Math.round((requestsLastMinute / rateLimits.requestsPerMinute) * 100 * 100) / 100,
          resetAt: new Date(now.getTime() + 60000 - (now.getTime() % 60000)).toISOString()
        };
      }

      limitInfo.push(info);
    }

    return limitInfo;
  }

  /**
   * Load usage data from file
   */
  async loadUsageData() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.persistenceFile);
      await fs.mkdir(dataDir, { recursive: true });

      // Try to load existing data
      const data = await fs.readFile(this.persistenceFile, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Merge with current data
      this.usage = {
        requests: parsed.requests || [],
        summary: parsed.summary || this.usage.summary
      };

      this.log('info', 'Usage data loaded', {
        requests: this.usage.requests.length,
        totalRequests: this.usage.summary.totalRequests
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, that's okay
        this.log('info', 'No existing usage data found, starting fresh');
      } else {
        this.log('error', 'Failed to load usage data', {
          error: error.message
        });
      }
    }
  }

  /**
   * Persist usage data to file
   */
  async persistUsageData() {
    try {
      const dataDir = path.dirname(this.persistenceFile);
      await fs.mkdir(dataDir, { recursive: true });

      await fs.writeFile(
        this.persistenceFile,
        JSON.stringify(this.usage, null, 2),
        'utf-8'
      );

      this.log('debug', 'Usage data persisted', {
        requests: this.usage.requests.length
      });
    } catch (error) {
      this.log('error', 'Failed to persist usage data', {
        error: error.message
      });
    }
  }

  /**
   * Start periodic persistence
   * 
   * @param {number} intervalMs - Interval in milliseconds
   */
  startPeriodicPersistence(intervalMs) {
    if (this.persistenceInterval) {
      clearInterval(this.persistenceInterval);
    }

    this.persistenceInterval = setInterval(async () => {
      await this.persistUsageData();
    }, intervalMs);

    // Also persist on process exit
    process.on('SIGINT', async () => {
      await this.persistUsageData();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.persistUsageData();
      process.exit(0);
    });
  }

  /**
   * Stop periodic persistence
   */
  stopPeriodicPersistence() {
    if (this.persistenceInterval) {
      clearInterval(this.persistenceInterval);
      this.persistenceInterval = null;
    }
  }

  /**
   * Reset all usage data
   */
  async reset() {
    this.usage = {
      requests: [],
      summary: {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        byProvider: {},
        byTask: {}
      }
    };

    await this.persistUsageData();
    this.log('info', 'Usage data reset');
  }

  /**
   * Structured logging
   * 
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [UsageTracker] ${message}`;

    if (level === 'debug' && process.env.NODE_ENV === 'production') {
      return; // Skip debug logs in production
    }

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
}

// Export singleton instance
const usageTracker = new UsageTracker();

export default usageTracker;
export { PROVIDER_PRICING };
