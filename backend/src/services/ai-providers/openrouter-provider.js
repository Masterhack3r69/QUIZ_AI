/**
 * OpenRouter AI Provider
 * 
 * Implements AI provider interface for OpenRouter API
 * Supports free models like meta-llama/llama-3.2-3b-instruct:free
 */

import axios from 'axios';
import BaseAIProvider from './base-provider.js';

class OpenRouterProvider extends BaseAIProvider {
  constructor(config) {
    super('openrouter', config);
    
    this.baseURL = config.baseURL || 'https://openrouter.ai/api/v1';
    this.apiKey = process.env.OPENROUTER_API_KEY;
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Quiz AI Generator'
      }
    });
  }

  /**
   * Generate AI completion using OpenRouter API
   * 
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Standardized response
   */
  async generateCompletion(prompt, options = {}) {
    const startTime = Date.now();

    try {
      // Check if API key is available
      if (!this.apiKey) {
        throw new Error('OPENROUTER_API_KEY environment variable is not set');
      }

      const model = this.getModel(options);
      const temperature = options.temperature ?? 0.7;
      const maxTokens = options.maxTokens ?? 2000;
      const timeout = options.timeout ?? 30000;

      this.log('info', 'Generating completion', {
        model,
        temperature,
        maxTokens,
        promptLength: prompt.length
      });

      // Build request payload
      const payload = {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens
      };

      // Add JSON mode if requested
      if (options.jsonMode) {
        payload.response_format = { type: 'json_object' };
      }

      // Make API request
      const response = await this.client.post('/chat/completions', payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
          'X-Title': 'Quiz AI Generator'
        },
        timeout: timeout
      });

      const executionTime = Date.now() - startTime;

      // Parse and return standardized response
      const parsedResponse = this.parseResponse(response.data);
      
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
   * Parse OpenRouter API response into standardized format
   * 
   * @param {Object} response - Raw OpenRouter API response
   * @returns {Object} Parsed response with text and metadata
   */
  parseResponse(response) {
    try {
      // OpenRouter follows OpenAI's response format
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No choices in response');
      }

      const choice = response.choices[0];
      const text = choice.message?.content || '';

      if (!text) {
        throw new Error('Empty response from OpenRouter');
      }

      return {
        text: text.trim(),
        tokensUsed: response.usage?.total_tokens || null,
        model: response.model || this.getModel()
      };

    } catch (error) {
      throw new Error(`Failed to parse OpenRouter response: ${error.message}`);
    }
  }

  /**
   * Check if OpenRouter provider is available
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

      // Check if API key is present
      if (!this.apiKey) {
        this.log('warn', 'OPENROUTER_API_KEY not set');
        return false;
      }

      // Optionally ping the API to verify connectivity
      // For now, just check credentials
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
   * @returns {boolean} True if API key is present
   */
  hasRequiredCredentials() {
    return !!this.apiKey && this.config.enabled !== false;
  }

  /**
   * Handle OpenRouter-specific errors
   * 
   * @param {Error} error - The error to handle
   * @throws {AIProviderError} Wrapped error
   */
  handleError(error) {
    // Check for axios errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Rate limit error
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const errorMsg = data.error?.message || 'Rate limit exceeded';
        const enhancedError = new Error(`${errorMsg}${retryAfter ? ` (retry after ${retryAfter}s)` : ''}`);
        super.handleError(enhancedError);
      }

      // Authentication error
      if (status === 401 || status === 403) {
        const errorMsg = data.error?.message || 'Authentication failed';
        super.handleError(new Error(errorMsg));
      }

      // Model not found
      if (status === 404) {
        const errorMsg = data.error?.message || 'Model not found';
        super.handleError(new Error(errorMsg));
      }

      // Other API errors
      const errorMsg = data.error?.message || `OpenRouter API error: ${status}`;
      super.handleError(new Error(errorMsg));
    }

    // Network or timeout errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      super.handleError(new Error('Request timeout'));
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      super.handleError(new Error('Cannot connect to OpenRouter API'));
    }

    // Default error handling
    super.handleError(error);
  }
}

export default OpenRouterProvider;
