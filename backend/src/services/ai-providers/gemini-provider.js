/**
 * Google Gemini AI Provider
 * 
 * Implements AI provider interface for Google Gemini API
 * Uses gemini-2.0-flash-exp model for free tier
 * Integrates with existing GoogleGenAI client
 */

import { GoogleGenAI } from '@google/genai';
import BaseAIProvider from './base-provider.js';

class GeminiProvider extends BaseAIProvider {
  constructor(config) {
    super('gemini', config);
    
    this.apiKey = process.env.GEMINI_API_KEY;
    this.client = null;
    
    // Initialize client if API key is available
    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Generate AI completion using Gemini API
   * 
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Standardized response
   */
  async generateCompletion(prompt, options = {}) {
    const startTime = Date.now();

    try {
      // Check if API key is available
      if (!this.apiKey || !this.client) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
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

      // Build generation config
      const generationConfig = {
        temperature: temperature,
        maxOutputTokens: maxTokens
      };

      // Add JSON mode if requested
      if (options.jsonMode) {
        generationConfig.responseMimeType = 'application/json';
      }

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Generate content with timeout
      const generatePromise = this.client.models.generateContent({
        model: model,
        contents: prompt,
        generationConfig: generationConfig
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

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
   * Parse Gemini API response into standardized format
   * 
   * @param {Object} response - Raw Gemini API response
   * @returns {Object} Parsed response with text and metadata
   */
  parseResponse(response) {
    try {
      // Extract text from Gemini response
      let text = '';

      // Gemini response structure: response.text or response.candidates[0].content.parts[0].text
      if (typeof response.text === 'function') {
        text = response.text();
      } else if (response.text) {
        text = response.text;
      } else if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          text = candidate.content.parts[0].text;
        }
      }

      if (!text || typeof text !== 'string') {
        throw new Error('Empty or invalid response from Gemini');
      }

      // Extract token usage if available
      let tokensUsed = null;
      if (response.usageMetadata) {
        tokensUsed = response.usageMetadata.totalTokenCount || 
                     (response.usageMetadata.promptTokenCount || 0) + 
                     (response.usageMetadata.candidatesTokenCount || 0);
      }

      return {
        text: text.trim(),
        tokensUsed: tokensUsed,
        model: this.getModel()
      };

    } catch (error) {
      throw new Error(`Failed to parse Gemini response: ${error.message}`);
    }
  }

  /**
   * Check if Gemini provider is available
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
        this.log('warn', 'GEMINI_API_KEY not set');
        return false;
      }

      // Check if client is initialized
      if (!this.client) {
        this.log('warn', 'Gemini client not initialized');
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
   * @returns {boolean} True if API key is present
   */
  hasRequiredCredentials() {
    return !!this.apiKey && !!this.client && this.config.enabled !== false;
  }

  /**
   * Handle Gemini-specific errors
   * 
   * @param {Error} error - The error to handle
   * @throws {AIProviderError} Wrapped error
   */
  handleError(error) {
    // Check for Gemini-specific error patterns
    const errorMessage = error.message || '';

    // Rate limit errors
    if (errorMessage.includes('quota') || 
        errorMessage.includes('rate limit') || 
        errorMessage.includes('429')) {
      super.handleError(new Error('Gemini API rate limit exceeded'));
    }

    // Authentication errors
    if (errorMessage.includes('API key') || 
        errorMessage.includes('authentication') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')) {
      super.handleError(new Error('Gemini API authentication failed'));
    }

    // Model not found
    if (errorMessage.includes('model not found') || 
        errorMessage.includes('404')) {
      super.handleError(new Error('Gemini model not found'));
    }

    // Safety/content filtering errors
    if (errorMessage.includes('safety') || 
        errorMessage.includes('blocked') ||
        errorMessage.includes('SAFETY')) {
      super.handleError(new Error('Content blocked by Gemini safety filters'));
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('ETIMEDOUT')) {
      super.handleError(new Error('Gemini API request timeout'));
    }

    // Default error handling
    super.handleError(error);
  }

  /**
   * Get the model to use for this request
   * Overrides base implementation to provide Gemini-specific default
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

    // Default to free tier model
    return 'gemini-2.0-flash-exp';
  }
}

export default GeminiProvider;
