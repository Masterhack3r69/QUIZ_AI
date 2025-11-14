/**
 * AI Providers Index
 * 
 * Exports all AI provider implementations and utilities
 */

import BaseAIProvider, {
  AIProviderError,
  AIProviderRateLimitError,
  AIProviderTimeoutError,
  AIProviderAuthError,
  AIProviderNotFoundError
} from './base-provider.js';

import OpenRouterProvider from './openrouter-provider.js';
import GeminiProvider from './gemini-provider.js';
import OllamaProvider from './ollama-provider.js';

export {
  // Base class
  BaseAIProvider,
  
  // Provider implementations
  OpenRouterProvider,
  GeminiProvider,
  OllamaProvider,
  
  // Error classes
  AIProviderError,
  AIProviderRateLimitError,
  AIProviderTimeoutError,
  AIProviderAuthError,
  AIProviderNotFoundError
};

/**
 * Factory function to create provider instances
 * 
 * @param {string} providerName - Name of the provider (openrouter, gemini, ollama)
 * @param {Object} config - Provider configuration
 * @returns {BaseAIProvider} Provider instance
 * @throws {Error} If provider name is unknown
 */
export function createProvider(providerName, config) {
  switch (providerName.toLowerCase()) {
    case 'openrouter':
      return new OpenRouterProvider(config);
    
    case 'gemini':
      return new GeminiProvider(config);
    
    case 'ollama':
      return new OllamaProvider(config);
    
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

/**
 * Initialize all configured providers
 * 
 * @param {Object} providersConfig - Providers configuration object
 * @returns {Object} Map of provider name to provider instance
 */
export function initializeProviders(providersConfig) {
  const providers = {};
  
  for (const [name, config] of Object.entries(providersConfig)) {
    try {
      providers[name] = createProvider(name, config);
      console.log(`✓ Initialized provider: ${name}`);
    } catch (error) {
      console.error(`✗ Failed to initialize provider ${name}:`, error.message);
    }
  }
  
  return providers;
}
