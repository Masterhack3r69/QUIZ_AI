# AI Provider Adapters

This directory contains AI provider implementations for the multi-AI agentic system.

## Overview

The AI provider system uses a unified interface to interact with different AI services:
- **OpenRouter**: Free models via OpenRouter API (meta-llama/llama-3.2-3b-instruct:free)
- **Gemini**: Google's Gemini API (gemini-2.0-flash-exp)
- **Ollama**: Local Ollama instance (llama3.2:1b)

## Architecture

```
BaseAIProvider (abstract)
├── OpenRouterProvider
├── GeminiProvider
└── OllamaProvider
```

## Usage

### Basic Usage

```javascript
import { createProvider } from './services/ai-providers/index.js';

// Create a provider instance
const provider = createProvider('openrouter', {
  enabled: true,
  baseURL: 'https://openrouter.ai/api/v1',
  model: 'meta-llama/llama-3.2-3b-instruct:free'
});

// Check availability
const isAvailable = await provider.isAvailable();

// Generate completion
const response = await provider.generateCompletion('What is AI?', {
  temperature: 0.7,
  maxTokens: 500,
  jsonMode: false
});

console.log(response.text);
```

### Initialize All Providers

```javascript
import { initializeProviders } from './services/ai-providers/index.js';
import configLoader from './services/config-loader.js';

// Load configuration
const config = configLoader.loadAITasksConfig();

// Initialize all providers
const providers = initializeProviders(config.providers);

// Use a specific provider
const gemini = providers.gemini;
const response = await gemini.generateCompletion('Explain quantum computing');
```

## Provider Interface

All providers implement the following interface:

### Methods

#### `generateCompletion(prompt, options)`
Generate AI completion for the given prompt.

**Parameters:**
- `prompt` (string): The prompt to send to the AI
- `options` (object):
  - `temperature` (number, default: 0.7): Sampling temperature (0-1)
  - `maxTokens` (number, default: 2000): Maximum tokens to generate
  - `timeout` (number, default: 30000): Request timeout in milliseconds
  - `jsonMode` (boolean, default: false): Request JSON output
  - `model` (string, optional): Override default model

**Returns:** Promise<Object>
```javascript
{
  success: true,
  provider: 'openrouter',
  text: 'Generated text...',
  tokensUsed: 150,
  model: 'meta-llama/llama-3.2-3b-instruct:free',
  executionTime: 1234
}
```

#### `isAvailable()`
Check if the provider is available and properly configured.

**Returns:** Promise<boolean>

#### `parseResponse(response)`
Parse raw provider response into standardized format.

**Parameters:**
- `response` (any): Raw response from the provider

**Returns:** Object with `{ text, tokensUsed, model }`

## Error Handling

The system includes specialized error classes:

- `AIProviderError`: Base error class
- `AIProviderRateLimitError`: Rate limit exceeded
- `AIProviderTimeoutError`: Request timeout
- `AIProviderAuthError`: Authentication failed
- `AIProviderNotFoundError`: Model or resource not found

```javascript
import { AIProviderError } from './services/ai-providers/index.js';

try {
  const response = await provider.generateCompletion(prompt);
} catch (error) {
  if (error instanceof AIProviderRateLimitError) {
    console.log('Rate limit hit, trying fallback...');
  } else if (error instanceof AIProviderTimeoutError) {
    console.log('Request timed out');
  }
}
```

## Configuration

Providers are configured via `config/ai-tasks.{env}.json`:

```json
{
  "providers": {
    "openrouter": {
      "enabled": true,
      "baseURL": "https://openrouter.ai/api/v1",
      "models": {
        "free": "meta-llama/llama-3.2-3b-instruct:free"
      }
    },
    "gemini": {
      "enabled": true,
      "model": "gemini-2.0-flash-exp"
    },
    "ollama": {
      "enabled": true,
      "baseURL": "http://localhost:11434",
      "model": "llama3.2:1b"
    }
  }
}
```

## Environment Variables

### OpenRouter
- `OPENROUTER_API_KEY`: API key for OpenRouter (required)

### Gemini
- `GEMINI_API_KEY`: API key for Google Gemini (required)

### Ollama
- `OLLAMA_BASE_URL`: Base URL for Ollama server (default: http://localhost:11434)

## Provider-Specific Features

### OpenRouter
- Supports free tier models
- Automatic rate limit detection
- Retry-After header support

### Gemini
- JSON mode via `responseMimeType`
- Safety filter handling
- Token usage tracking

### Ollama
- Local inference (no API key needed)
- Model availability checking
- Model pulling capability
- List available models

### Ollama-Specific Methods

```javascript
// Pull a model
await ollamaProvider.pullModel('llama3.2:1b');

// List available models
const models = await ollamaProvider.listModels();
console.log(models);
```

## Testing

To test a provider:

```javascript
import { createProvider } from './services/ai-providers/index.js';

async function testProvider() {
  const provider = createProvider('gemini', {
    enabled: true,
    model: 'gemini-2.0-flash-exp'
  });

  // Check availability
  const available = await provider.isAvailable();
  console.log(`Provider available: ${available}`);

  if (available) {
    // Test generation
    const response = await provider.generateCompletion(
      'Write a haiku about coding',
      { temperature: 0.9, maxTokens: 100 }
    );
    
    console.log('Response:', response.text);
    console.log('Tokens used:', response.tokensUsed);
    console.log('Execution time:', response.executionTime, 'ms');
  }
}

testProvider().catch(console.error);
```

## Logging

All providers include built-in logging:

```
[2024-01-15T10:30:45.123Z] [INFO] [openrouter] Generating completion
[2024-01-15T10:30:46.456Z] [INFO] [openrouter] Completion generated successfully
[2024-01-15T10:30:47.789Z] [ERROR] [gemini] Failed to generate completion
```

## Best Practices

1. **Always check availability** before using a provider
2. **Handle errors gracefully** with try-catch blocks
3. **Use appropriate timeouts** based on expected response time
4. **Enable JSON mode** when expecting structured output
5. **Monitor token usage** to optimize costs
6. **Log all operations** for debugging and monitoring

## Next Steps

These providers will be used by:
1. **Task Router** - Routes tasks to appropriate providers with fallback
2. **Agent Services** - Content extraction, question generation, etc.
3. **Pipeline Orchestrator** - Coordinates multi-agent workflows
