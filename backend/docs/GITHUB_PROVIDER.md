# GitHub Models AI Provider

## Overview

The GitHub Models provider integrates with GitHub's AI inference API using the Azure AI Inference SDK. This allows you to access various AI models through GitHub's infrastructure.

## Setup

### 1. Install Dependencies

The required packages are already installed:
- `@azure-rest/ai-inference` - Azure AI Inference REST client
- `@azure/core-auth` - Azure authentication

### 2. Get GitHub Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token (classic) with appropriate permissions
3. Copy the token

### 3. Configure Environment

Add to your `.env` file:

```env
GITHUB_TOKEN=your_github_token_here
```

### 4. Update Configuration

The provider is already configured in `backend/config/ai-tasks.development.json`:

```json
{
  "providers": {
    "github": {
      "enabled": true,
      "endpoint": "https://models.inference.ai.azure.com",
      "model": "gpt-4o"
    }
  }
}
```

## Available Models

GitHub Models supports various AI models:

- `gpt-4o` - OpenAI GPT-4 Optimized (recommended)
- `gpt-4o-mini` - Smaller, faster GPT-4 variant
- `gpt-4` - OpenAI GPT-4
- `gpt-3.5-turbo` - OpenAI GPT-3.5 Turbo
- And more...

## Usage

### Basic Usage

```javascript
import { GitHubProvider } from './services/ai-providers/index.js';

const provider = new GitHubProvider({
  enabled: true,
  endpoint: 'https://models.inference.ai.azure.com',
  model: 'gpt-4o'
});

// Generate completion
const response = await provider.generateCompletion(
  'What is the capital of France?',
  {
    temperature: 0.7,
    maxTokens: 100
  }
);

console.log(response.text);
```

### With JSON Mode

```javascript
const response = await provider.generateCompletion(
  'Generate a JSON object with name and age fields',
  {
    temperature: 0.3,
    maxTokens: 200,
    jsonMode: true
  }
);
```

### Custom Model

```javascript
const response = await provider.generateCompletion(
  'Your prompt here',
  {
    model: 'gpt-4o-mini',
    temperature: 0.5,
    maxTokens: 500
  }
);
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | true | Enable/disable the provider |
| `endpoint` | string | `https://models.inference.ai.azure.com` | API endpoint |
| `model` | string | `gpt-4o` | Default model to use |

## Generation Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `temperature` | number | 0.7 | Sampling temperature (0-1) |
| `maxTokens` | number | 2000 | Maximum tokens to generate |
| `timeout` | number | 90000 | Request timeout in milliseconds |
| `jsonMode` | boolean | false | Request JSON-formatted output |
| `model` | string | - | Override default model |

## Testing

Run the quick test:

```bash
node src/examples/quick-test-github.js
```

Run comprehensive tests:

```bash
node src/examples/test-github-provider.js
```

## Integration with Task Router

The GitHub provider is integrated with the AI task router and can be used as the primary provider for all tasks:

```json
{
  "tasks": {
    "content-extraction": {
      "primary": "github",
      "fallback": ["openrouter", "gemini", "ollama"]
    },
    "question-generation": {
      "primary": "github",
      "fallback": ["openrouter", "gemini", "ollama"]
    }
  }
}
```

## Error Handling

The provider includes comprehensive error handling:

- **Rate Limit Errors**: Automatically detected and wrapped
- **Authentication Errors**: Token validation and error reporting
- **Timeout Errors**: Configurable timeout with proper error handling
- **Model Not Found**: Validates model availability

## Response Format

All responses follow the standardized format:

```javascript
{
  success: true,
  provider: 'github',
  text: 'Generated text...',
  tokensUsed: 150,
  model: 'gpt-4o-2024-11-20',
  executionTime: 2500
}
```

## Troubleshooting

### Provider Not Available

Check that:
1. `GITHUB_TOKEN` is set in `.env`
2. Token has appropriate permissions
3. Provider is enabled in config

### Request Timeout

Increase timeout in generation options:

```javascript
const response = await provider.generateCompletion(prompt, {
  timeout: 120000 // 2 minutes
});
```

### Model Not Found

Verify the model name is correct and available through GitHub Models.

## Best Practices

1. **Use appropriate timeouts**: Complex prompts may need longer timeouts
2. **Enable JSON mode**: When expecting structured output
3. **Set temperature wisely**: Lower (0.3) for factual, higher (0.8) for creative
4. **Monitor token usage**: Track costs and optimize prompts
5. **Use fallback providers**: Configure fallbacks for reliability

## Security Notes

- Never commit `.env` file with real tokens
- Rotate tokens regularly
- Use minimal required permissions
- Monitor API usage and costs
