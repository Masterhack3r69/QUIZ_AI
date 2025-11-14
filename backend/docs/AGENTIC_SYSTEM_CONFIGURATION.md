# Multi-AI Agentic System Configuration Guide

## Overview

The multi-AI agentic system uses a configuration-driven approach to route different AI tasks to appropriate providers. This guide covers all configuration options, environment variables, and setup instructions.

## Table of Contents

1. [Configuration Files](#configuration-files)
2. [Environment Variables](#environment-variables)
3. [AI Provider Setup](#ai-provider-setup)
4. [Task Configuration](#task-configuration)
5. [Example Configurations](#example-configurations)

---

## Configuration Files

### AI Task Configuration

Location: `backend/config/ai-tasks.{environment}.json`

The system loads configuration based on the `AI_TASK_CONFIG` environment variable:
- `development` → `ai-tasks.development.json`
- `production` → `ai-tasks.production.json`
- Custom → `ai-tasks.{custom}.json`

#### Configuration Structure

```json
{
  "tasks": {
    "task-name": {
      "primary": "provider-name",
      "fallback": ["provider1", "provider2"],
      "maxRetries": 2,
      "timeout": 30000,
      "model": "optional-model-override"
    }
  },
  "providers": {
    "provider-name": {
      "enabled": true,
      "baseURL": "https://api.example.com",
      "model": "model-name",
      "models": {
        "free": "free-model-name",
        "fast": "fast-model-name",
        "quality": "quality-model-name"
      }
    }
  }
}
```

#### Task Configuration Options

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `primary` | string | Yes | Primary AI provider to use for this task |
| `fallback` | array | Yes | Ordered list of fallback providers if primary fails |
| `maxRetries` | number | Yes | Maximum retry attempts with exponential backoff |
| `timeout` | number | Yes | Request timeout in milliseconds |
| `model` | string | No | Override the default model for this specific task |

#### Provider Configuration Options

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | Yes | Whether this provider is available |
| `baseURL` | string | Varies | API endpoint (required for OpenRouter, Ollama) |
| `model` | string | Yes | Default model to use |
| `models` | object | No | Named model presets (free, fast, quality) |

### AI Prompts Configuration

Location: `backend/config/ai-prompts.json`

Contains optimized prompts for each agent with variable substitution support.

#### Prompt Structure

```json
{
  "agents": {
    "agent-name": {
      "name": "Human-readable agent name",
      "role": "Agent's role description",
      "systemPrompt": "System message for the AI",
      "template": "Prompt template with {variables}",
      "requiredVariables": ["var1", "var2"],
      "outputFormat": "json",
      "outputSchema": {
        "field": "type"
      }
    }
  }
}
```

#### Available Agents

1. **content-extraction** - Analyzes content and extracts key concepts
2. **question-generation** - Creates quiz questions from concepts
3. **quality-validation** - Evaluates question quality
4. **question-improvement** - Enhances low-quality questions
5. **analytics** - Analyzes quiz performance data

---

## Environment Variables

### Required Variables

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/quiz_ai

# JWT Authentication
JWT_SECRET=your_secure_jwt_secret_key

# Node Environment
NODE_ENV=development|production

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Agentic Pipeline Variables

```bash
# Feature Flags
ENABLE_AGENTIC_PIPELINE=true|false
ENABLE_QUALITY_VALIDATION=true|false
ENABLE_QUESTION_IMPROVEMENT=true|false

# Configuration Selection
AI_TASK_CONFIG=development|production|custom

# AI Provider API Keys
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Ollama Configuration (for local models)
OLLAMA_BASE_URL=http://localhost:11434
```

### Optional Variables

```bash
# Email Service (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
```

---

## AI Provider Setup

### 1. OpenRouter (Free Tier)

OpenRouter provides access to multiple free AI models through a single API.

#### Setup Steps

1. **Create Account**
   - Visit https://openrouter.ai/
   - Sign up for a free account
   - No credit card required for free models

2. **Get API Key**
   - Go to https://openrouter.ai/keys
   - Create a new API key
   - Copy the key (starts with `sk-or-v1-...`)

3. **Configure Environment**
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

4. **Available Free Models**
   - `meta-llama/llama-3.2-3b-instruct:free` - Fast, good quality
   - `meta-llama/llama-3.1-8b-instruct:free` - Higher quality
   - `google/gemini-flash-1.5:free` - Very fast
   - `qwen/qwen-2.5-72b-instruct:free` - Highest quality
   - `mistralai/mistral-7b-instruct:free` - Balanced

#### Rate Limits (Free Tier)
- 200 requests per day
- 20 requests per minute
- Automatic fallback to other providers if limit reached

### 2. Google Gemini (Free Tier)

Google's Gemini API offers generous free tier limits.

#### Setup Steps

1. **Get API Key**
   - Visit https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create API key

2. **Configure Environment**
   ```bash
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. **Available Models**
   - `gemini-2.0-flash-exp` - Experimental, fast and free
   - `gemini-1.5-flash` - Stable, fast
   - `gemini-1.5-pro` - Higher quality

#### Rate Limits (Free Tier)
- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per day

### 3. Ollama (Local/Free)

Run AI models locally on your machine - completely free, no API keys needed.

#### Setup Steps

1. **Install Ollama**
   
   **macOS/Linux:**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
   
   **Windows:**
   - Download from https://ollama.com/download
   - Run the installer
   
   **Docker:**
   ```bash
   docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
   ```

2. **Download Models**
   ```bash
   # Fast, small model (1GB)
   ollama pull llama3.2:1b
   
   # Better quality (2GB)
   ollama pull llama3.2:3b
   
   # High quality (4.7GB)
   ollama pull llama3.1:8b
   ```

3. **Verify Installation**
   ```bash
   ollama list
   curl http://localhost:11434/api/tags
   ```

4. **Configure Environment**
   ```bash
   OLLAMA_BASE_URL=http://localhost:11434
   ```

#### System Requirements
- **Minimum:** 8GB RAM, 4GB disk space
- **Recommended:** 16GB RAM, 10GB disk space
- **GPU:** Optional but significantly faster (NVIDIA CUDA or Apple Silicon)

#### Available Models
- `llama3.2:1b` - Fastest, lowest resource usage
- `llama3.2:3b` - Good balance of speed and quality
- `llama3.1:8b` - Best quality, slower
- `mistral:7b` - Alternative high-quality model
- `qwen2.5:7b` - Excellent for structured output

---

## Task Configuration

### Available Tasks

#### 1. content-extraction
Analyzes educational content and extracts key concepts for quiz generation.

**Recommended Settings:**
```json
{
  "primary": "openrouter",
  "fallback": ["gemini", "ollama"],
  "maxRetries": 2,
  "timeout": 30000
}
```

**Why:** Requires good comprehension but not extremely fast. OpenRouter's free models work well.

#### 2. question-generation
Generates multiple-choice questions with educational distractors.

**Recommended Settings:**
```json
{
  "primary": "openrouter",
  "fallback": ["gemini", "ollama"],
  "maxRetries": 2,
  "timeout": 60000,
  "model": "qwen/qwen-2.5-72b-instruct:free"
}
```

**Why:** Most critical task requiring highest quality. Longer timeout for complex generation.

#### 3. quality-validation
Evaluates question quality across multiple criteria.

**Recommended Settings:**
```json
{
  "primary": "openrouter",
  "fallback": ["gemini", "ollama"],
  "maxRetries": 2,
  "timeout": 30000
}
```

**Why:** Requires analytical capability. Medium priority.

#### 4. question-improvement
Enhances low-quality questions based on validation feedback.

**Recommended Settings:**
```json
{
  "primary": "openrouter",
  "fallback": ["gemini", "ollama"],
  "maxRetries": 2,
  "timeout": 45000
}
```

**Why:** Requires creativity and understanding. Moderate timeout.

#### 5. analytics
Analyzes quiz performance and provides insights.

**Recommended Settings:**
```json
{
  "primary": "openrouter",
  "fallback": ["gemini", "ollama"],
  "maxRetries": 2,
  "timeout": 45000
}
```

**Why:** Requires data analysis capability. Not time-critical.

---

## Example Configurations

### Development Configuration (Free, Local-First)

**File:** `config/ai-tasks.development.json`

```json
{
  "tasks": {
    "content-extraction": {
      "primary": "ollama",
      "fallback": ["openrouter", "gemini"],
      "maxRetries": 2,
      "timeout": 30000
    },
    "question-generation": {
      "primary": "ollama",
      "fallback": ["openrouter", "gemini"],
      "maxRetries": 2,
      "timeout": 60000
    },
    "quality-validation": {
      "primary": "ollama",
      "fallback": ["openrouter", "gemini"],
      "maxRetries": 2,
      "timeout": 30000
    },
    "question-improvement": {
      "primary": "ollama",
      "fallback": ["openrouter", "gemini"],
      "maxRetries": 2,
      "timeout": 45000
    },
    "analytics": {
      "primary": "ollama",
      "fallback": ["openrouter", "gemini"],
      "maxRetries": 2,
      "timeout": 45000
    }
  },
  "providers": {
    "ollama": {
      "enabled": true,
      "baseURL": "http://localhost:11434",
      "model": "llama3.2:3b"
    },
    "openrouter": {
      "enabled": true,
      "baseURL": "https://openrouter.ai/api/v1",
      "models": {
        "free": "qwen/qwen-2.5-72b-instruct:free",
        "fast": "mistralai/mistral-7b-instruct:free"
      }
    },
    "gemini": {
      "enabled": true,
      "model": "gemini-2.0-flash-exp"
    }
  }
}
```

**Use Case:** Local development, testing, no API costs

### Production Configuration (Quality-Optimized)

**File:** `config/ai-tasks.production.json`

```json
{
  "tasks": {
    "content-extraction": {
      "primary": "openrouter",
      "fallback": ["gemini", "ollama"],
      "maxRetries": 3,
      "timeout": 30000,
      "model": "meta-llama/llama-3.2-3b-instruct:free"
    },
    "question-generation": {
      "primary": "openrouter",
      "fallback": ["gemini", "ollama"],
      "maxRetries": 2,
      "timeout": 60000,
      "model": "qwen/qwen-2.5-72b-instruct:free"
    },
    "quality-validation": {
      "primary": "openrouter",
      "fallback": ["gemini", "ollama"],
      "maxRetries": 2,
      "timeout": 30000,
      "model": "meta-llama/llama-3.1-8b-instruct:free"
    },
    "question-improvement": {
      "primary": "openrouter",
      "fallback": ["gemini", "ollama"],
      "maxRetries": 2,
      "timeout": 45000,
      "model": "meta-llama/llama-3.1-8b-instruct:free"
    },
    "analytics": {
      "primary": "gemini",
      "fallback": ["openrouter", "ollama"],
      "maxRetries": 2,
      "timeout": 45000
    }
  },
  "providers": {
    "openrouter": {
      "enabled": true,
      "baseURL": "https://openrouter.ai/api/v1",
      "models": {
        "free": "qwen/qwen-2.5-72b-instruct:free",
        "quality": "meta-llama/llama-3.1-8b-instruct:free"
      }
    },
    "gemini": {
      "enabled": true,
      "model": "gemini-2.0-flash-exp"
    },
    "ollama": {
      "enabled": false,
      "baseURL": "http://localhost:11434",
      "model": "llama3.2:1b"
    }
  }
}
```

**Use Case:** Production deployment, best quality, API-based

### Cost-Optimized Configuration (Minimal API Usage)

**File:** `config/ai-tasks.cost-optimized.json`

```json
{
  "tasks": {
    "content-extraction": {
      "primary": "ollama",
      "fallback": ["gemini"],
      "maxRetries": 2,
      "timeout": 30000
    },
    "question-generation": {
      "primary": "gemini",
      "fallback": ["ollama"],
      "maxRetries": 2,
      "timeout": 60000
    },
    "quality-validation": {
      "primary": "ollama",
      "fallback": ["gemini"],
      "maxRetries": 1,
      "timeout": 30000
    },
    "question-improvement": {
      "primary": "gemini",
      "fallback": ["ollama"],
      "maxRetries": 1,
      "timeout": 45000
    },
    "analytics": {
      "primary": "ollama",
      "fallback": ["gemini"],
      "maxRetries": 1,
      "timeout": 45000
    }
  },
  "providers": {
    "ollama": {
      "enabled": true,
      "baseURL": "http://localhost:11434",
      "model": "llama3.2:3b"
    },
    "gemini": {
      "enabled": true,
      "model": "gemini-2.0-flash-exp"
    },
    "openrouter": {
      "enabled": false
    }
  }
}
```

**Use Case:** Minimize API costs, use local models when possible, Gemini for critical tasks

### Speed-Optimized Configuration (Fast Response)

**File:** `config/ai-tasks.speed-optimized.json`

```json
{
  "tasks": {
    "content-extraction": {
      "primary": "gemini",
      "fallback": ["ollama"],
      "maxRetries": 1,
      "timeout": 15000
    },
    "question-generation": {
      "primary": "gemini",
      "fallback": ["openrouter"],
      "maxRetries": 1,
      "timeout": 30000
    },
    "quality-validation": {
      "primary": "gemini",
      "fallback": ["ollama"],
      "maxRetries": 1,
      "timeout": 15000
    },
    "question-improvement": {
      "primary": "gemini",
      "fallback": ["openrouter"],
      "maxRetries": 1,
      "timeout": 20000
    },
    "analytics": {
      "primary": "gemini",
      "fallback": ["ollama"],
      "maxRetries": 1,
      "timeout": 20000
    }
  },
  "providers": {
    "gemini": {
      "enabled": true,
      "model": "gemini-2.0-flash-exp"
    },
    "openrouter": {
      "enabled": true,
      "baseURL": "https://openrouter.ai/api/v1",
      "models": {
        "fast": "google/gemini-flash-1.5:free"
      }
    },
    "ollama": {
      "enabled": true,
      "baseURL": "http://localhost:11434",
      "model": "llama3.2:1b"
    }
  }
}
```

**Use Case:** Prioritize speed over quality, reduced timeouts, fewer retries

---

## Configuration Best Practices

### 1. Provider Selection Strategy

**Primary Provider:**
- Choose based on task requirements (speed vs quality)
- Consider rate limits and availability
- Use local (Ollama) for development

**Fallback Order:**
- List providers from most to least preferred
- Ensure at least one fallback is always available
- Mix API and local providers for reliability

### 2. Timeout Configuration

**Guidelines:**
- Content extraction: 30s (moderate complexity)
- Question generation: 60s (most complex)
- Quality validation: 30s (analytical)
- Question improvement: 45s (creative)
- Analytics: 45s (data processing)

**Adjust based on:**
- Provider speed (Gemini faster than Ollama)
- Model size (larger models need more time)
- Network latency (local vs API)

### 3. Retry Strategy

**Recommended:**
- Critical tasks: `maxRetries: 3`
- Standard tasks: `maxRetries: 2`
- Non-critical tasks: `maxRetries: 1`

**Exponential Backoff:**
- Retry 1: 1 second delay
- Retry 2: 2 seconds delay
- Retry 3: 4 seconds delay

### 4. Model Selection

**By Task Priority:**
- **High:** question-generation → Use best available model
- **Medium:** content-extraction, quality-validation → Use balanced model
- **Low:** analytics → Use fast model

**By Provider:**
- **OpenRouter:** Qwen 2.5 72B (best quality), Llama 3.1 8B (balanced)
- **Gemini:** 2.0 Flash Exp (fastest), 1.5 Pro (best quality)
- **Ollama:** Llama 3.2 3B (balanced), Llama 3.1 8B (best quality)

### 5. Environment-Specific Settings

**Development:**
- Use Ollama primary (free, fast iteration)
- Enable all providers for testing
- Shorter timeouts for quick feedback

**Staging:**
- Use API providers (test production config)
- Enable comprehensive logging
- Standard timeouts

**Production:**
- Use quality-optimized models
- Longer timeouts for reliability
- Multiple fallbacks for uptime

---

## Troubleshooting

### Provider Not Available

**Symptoms:** Tasks fail immediately with "Provider not available"

**Solutions:**
1. Check provider is enabled in config
2. Verify API key is set in environment
3. For Ollama: Ensure service is running (`ollama list`)
4. Check network connectivity to API endpoints

### Rate Limit Errors

**Symptoms:** "Rate limit exceeded" or 429 errors

**Solutions:**
1. System automatically falls back to next provider
2. Check usage at provider dashboard
3. Consider using multiple providers
4. Adjust `maxRetries` to reduce API calls

### Timeout Errors

**Symptoms:** Tasks fail with "Request timeout"

**Solutions:**
1. Increase timeout in task configuration
2. Use faster model (e.g., Gemini Flash)
3. Check network latency
4. For Ollama: Ensure sufficient system resources

### Invalid JSON Responses

**Symptoms:** "Failed to parse AI response"

**Solutions:**
1. Check prompt templates in `ai-prompts.json`
2. Verify model supports JSON mode
3. Review logs for actual response
4. Try different model (some handle JSON better)

### Ollama Connection Failed

**Symptoms:** "Cannot connect to Ollama"

**Solutions:**
```bash
# Check if Ollama is running
ollama list

# Start Ollama service
ollama serve

# Test connection
curl http://localhost:11434/api/tags

# Check firewall settings
# Ensure port 11434 is accessible
```

---

## Next Steps

- [Deployment Guide](./AGENTIC_SYSTEM_DEPLOYMENT.md) - Production deployment instructions
- [API Documentation](./AGENTIC_SYSTEM_API.md) - API endpoints and usage
- [Monitoring Guide](./AGENTIC_SYSTEM_MONITORING.md) - Performance monitoring and analytics
