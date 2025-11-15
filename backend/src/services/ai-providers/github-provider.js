/**
 * GitHub Models AI Provider
 * 
 * Implements AI provider interface for GitHub Models API
 * Uses Azure AI Inference SDK to access models like DeepSeek-R1
 */

import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import BaseAIProvider from './base-provider.js';

class GitHubProvider extends BaseAIProvider {
  constructor(config) {
    super('github', config);
    
    this.token = process.env.GITHUB_TOKEN;
    this.endpoint = config.endpoint || 'https://models.github.ai/inference';
    this.client = null;
    
    // Initialize client if token is available
    if (this.token) {
      this.client = ModelClient(this.endpoint, new AzureKeyCredential(this.token));
    }
  }

  /**
   * Generate AI completion using GitHub Models API
   * 
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Standardized response
   */
  async generateCompletion(prompt, options = {}) {
    const startTime = Date.now();

    try {
      // Check if token is available
      if (!this.token || !this.client) {
        throw new Error('GITHUB_TOKEN environment variable is not set');
      }

      const model = this.getModel(options);
      const temperature = options.temperature ?? 0.7;
      const maxTokens = options.maxTokens ?? 2000;
      const timeout = options.timeout ?? 180000; // Increase default timeout to 180 seconds (3 minutes) for free models

      this.log('info', 'Generating completion', {
        model,
        temperature,
        maxTokens,
        promptLength: prompt.length
      });

      // Build request body
      const requestBody = {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: temperature,
        model: model
      };

      // Add JSON mode if requested
      if (options.jsonMode) {
        requestBody.response_format = { type: 'json_object' };
      }

      // Generate content (the SDK handles timeout internally)
      const response = await this.client.path('/chat/completions').post({
        body: requestBody,
        timeout: timeout
      });

      // Check for unexpected response
      if (isUnexpected(response)) {
        throw new Error(response.body.error?.message || 'Unexpected response from GitHub Models API');
      }

      const executionTime = Date.now() - startTime;

      // Parse and return standardized response
      const parsedResponse = this.parseResponse(response);
      
      this.log('info', 'Completion generated successfully', {
        executionTime,
        tokensUsed: parsedResponse.tokensUsed
      });

      return this.createStandardResponse(parsedResponse.text, {
        tokensUsed: parsedResponse.tokensUsed,
        model: parsedResponse.model,
        executionTime
      });

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      this.log('error', 'Failed to generate completion', {
        error: error.message,
        executionTime
      });

      this.handleError(error);
    }
  }

  /**
   * Parse GitHub Models API response into standardized format
   * 
   * @param {Object} response - Raw GitHub Models API response
   * @returns {Object} Parsed response with text and metadata
   */
  parseResponse(response) {
    try {
      // Extract text from response
      const choice = response.body.choices?.[0];
      
      if (!choice || !choice.message || !choice.message.content) {
        throw new Error('Empty or invalid response from GitHub Models API');
      }

      const text = choice.message.content;

      // Extract token usage if available
      let tokensUsed = null;
      if (response.body.usage) {
        tokensUsed = response.body.usage.total_tokens || 
                     (response.body.usage.prompt_tokens || 0) + 
                     (response.body.usage.completion_tokens || 0);
      }

      // Extract model from response
      const model = response.body.model || this.getModel();

      return {
        text: text.trim(),
        tokensUsed: tokensUsed,
        model: model
      };

    } catch (error) {
      throw new Error(`Failed to parse GitHub Models response: ${error.message}`);
    }
  }

  /**
   * Check if GitHub provider is available
   * 
   * @returns {Promise<boolean>} True if available
   */
  async isAvailable() {
    try {
      // Check if enabled in config
      if (this.config.enabled === false) {
        this.log('info', 'Provider is disabled in configuration');
        return false;
      }

      // Check if token is present
      if (!this.token) {
        this.log('warn', 'GITHUB_TOKEN not set');
        return false;
      }

      // Check if client is initialized
      if (!this.client) {
        this.log('warn', 'GitHub client not initialized');
        return false;
      }

      this.log('info', 'Provider is available');
      return true;

    } catch (error) {
      this.log('error', 'Provider availability check failed', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check if provider has required credentials
   * 
   * @returns {boolean} True if token is present
   */
  hasRequiredCredentials() {
    return !!this.token && !!this.client && this.config.enabled !== false;
  }

  /**
   * Handle GitHub-specific errors
   * 
   * @param {Error} error - The error to handle
   * @throws {AIProviderError} Wrapped error
   */
  handleError(error) {
    // Check for GitHub-specific error patterns
    const errorMessage = error.message || '';

    // Rate limit errors
    if (errorMessage.includes('rate limit') || 
        errorMessage.includes('429')) {
      super.handleError(new Error('GitHub Models API rate limit exceeded'));
    }

    // Authentication errors
    if (errorMessage.includes('token') || 
        errorMessage.includes('authentication') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')) {
      super.handleError(new Error('GitHub Models API authentication failed'));
    }

    // Model not found
    if (errorMessage.includes('model not found') || 
        errorMessage.includes('404')) {
      super.handleError(new Error('GitHub model not found'));
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('ETIMEDOUT')) {
      super.handleError(new Error('GitHub Models API request timeout'));
    }

    // Default error handling
    super.handleError(error);
  }

  /**
   * Get the model to use for this request
   * Overrides base implementation to provide GitHub-specific default
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

    // Default to GPT-4o
    return 'gpt-4o';
  }
}

export default GitHubProvider;
