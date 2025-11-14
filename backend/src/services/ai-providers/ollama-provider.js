/**
 * Ollama AI Provider
 * 
 * Implements AI provider interface for local Ollama instance
 * Uses llama3.2:1b model for fast local inference
 * Supports streaming responses
 */

import axios from 'axios';
import BaseAIProvider from './base-provider.js';

class OllamaProvider extends BaseAIProvider {
  constructor(config) {
    super('ollama', config);
    
    this.baseURL = config.baseURL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Generate AI completion using Ollama API
   * 
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Standardized response
   */
  async generateCompletion(prompt, options = {}) {
    const startTime = Date.now();

    try {
      const model = this.getModel(options);
      const temperature = options.temperature ?? 0.7;
      const timeout = options.timeout ?? 30000;

      this.log('info', 'Generating completion', {
        model,
        temperature,
        promptLength: prompt.length
      });

      // Build request payload
      const payload = {
        model: model,
        prompt: prompt,
        stream: false, // Non-streaming for simplicity
        options: {
          temperature: temperature,
          num_predict: options.maxTokens ?? 2000
        }
      };

      // Add JSON format if requested
      if (options.jsonMode) {
        payload.format = 'json';
      }

      // Make API request
      const response = await this.client.post('/api/generate', payload, {
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
   * Parse Ollama API response into standardized format
   * 
   * @param {Object} response - Raw Ollama API response
   * @returns {Object} Parsed response with text and metadata
   */
  parseResponse(response) {
    try {
      // Ollama response format
      if (!response.response) {
        throw new Error('No response field in Ollama response');
      }

      const text = response.response;

      if (!text || typeof text !== 'string') {
        throw new Error('Empty or invalid response from Ollama');
      }

      // Calculate token usage if available
      let tokensUsed = null;
      if (response.prompt_eval_count && response.eval_count) {
        tokensUsed = response.prompt_eval_count + response.eval_count;
      }

      return {
        text: text.trim(),
        tokensUsed: tokensUsed,
        model: response.model || this.getModel()
      };

    } catch (error) {
      throw new Error(`Failed to parse Ollama response: ${error.message}`);
    }
  }

  /**
   * Check if Ollama provider is available
   * Pings the Ollama server to verify connectivity
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

      // Ping Ollama server
      const response = await this.client.get('/api/tags', {
        timeout: 5000
      });

      // Check if the configured model is available
      const model = this.getModel();
      const models = response.data.models || [];
      const modelAvailable = models.some(m => m.name === model || m.name.startsWith(model));

      if (!modelAvailable) {
        this.log('warn', `Model ${model} not found in Ollama. Available models:`, {
          models: models.map(m => m.name)
        });
        return false;
      }

      this.log('info', 'Provider is available', {
        model,
        modelsCount: models.length
      });
      return true;

    } catch (error) {
      this.log('error', 'Provider availability check failed', {
        error: error.message,
        baseURL: this.baseURL
      });
      return false;
    }
  }

  /**
   * Check if provider has required credentials
   * Ollama runs locally and doesn't require API keys
   * 
   * @returns {boolean} True if enabled
   */
  hasRequiredCredentials() {
    return this.config.enabled !== false;
  }

  /**
   * Handle Ollama-specific errors
   * 
   * @param {Error} error - The error to handle
   * @throws {AIProviderError} Wrapped error
   */
  handleError(error) {
    // Check for axios errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Model not found
      if (status === 404) {
        const errorMsg = data.error || 'Model not found in Ollama';
        super.handleError(new Error(errorMsg));
      }

      // Other API errors
      const errorMsg = data.error || `Ollama API error: ${status}`;
      super.handleError(new Error(errorMsg));
    }

    // Connection errors
    if (error.code === 'ECONNREFUSED') {
      super.handleError(new Error('Cannot connect to Ollama server. Is Ollama running?'));
    }

    if (error.code === 'ENOTFOUND') {
      super.handleError(new Error(`Ollama server not found at ${this.baseURL}`));
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      super.handleError(new Error('Ollama request timeout'));
    }

    // Default error handling
    super.handleError(error);
  }

  /**
   * Get the model to use for this request
   * Overrides base implementation to provide Ollama-specific default
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

    // Default to fast local model
    return 'llama3.2:1b';
  }

  /**
   * Pull a model from Ollama registry
   * Useful for ensuring model is available before use
   * 
   * @param {string} modelName - Name of model to pull
   * @returns {Promise<boolean>} True if successful
   */
  async pullModel(modelName) {
    try {
      this.log('info', `Pulling model: ${modelName}`);

      const response = await this.client.post('/api/pull', {
        name: modelName,
        stream: false
      }, {
        timeout: 300000 // 5 minutes for model download
      });

      this.log('info', `Model pulled successfully: ${modelName}`);
      return true;

    } catch (error) {
      this.log('error', `Failed to pull model: ${modelName}`, {
        error: error.message
      });
      return false;
    }
  }

  /**
   * List available models in Ollama
   * 
   * @returns {Promise<Array>} List of available models
   */
  async listModels() {
    try {
      const response = await this.client.get('/api/tags', {
        timeout: 5000
      });

      return response.data.models || [];

    } catch (error) {
      this.log('error', 'Failed to list models', {
        error: error.message
      });
      return [];
    }
  }
}

export default OllamaProvider;
