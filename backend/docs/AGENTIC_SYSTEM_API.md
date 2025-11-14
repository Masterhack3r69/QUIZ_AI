# Multi-AI Agentic System API Documentation

## Overview

This document describes the API endpoints, request/response formats, and error handling for the multi-AI agentic quiz generation system.

## Table of Contents

1. [Quiz Generation API](#quiz-generation-api)
2. [Admin Monitoring API](#admin-monitoring-api)
3. [Health Check API](#health-check-api)
4. [Error Responses](#error-responses)
5. [Usage Examples](#usage-examples)

---

## Quiz Generation API

### Create Quiz with Agentic Pipeline

**Endpoint:** `POST /api/quizzes`

**Description:** Creates a new quiz using the multi-AI agentic pipeline. The system automatically extracts concepts, generates questions, validates quality, and improves low-quality questions.

**Authentication:** Required (JWT Bearer token)

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Biology Quiz - Photosynthesis",
  "content": "Educational content text here...",
  "questionCount": 10,
  "difficulty": "medium",
  "distribution": {
    "multipleChoice": 7,
    "trueFalse": 2,
    "fillInBlank": 1,
    "matching": 0
  },
  "timer": 30,
  "expiresAt": "2024-12-31T23:59:59Z",
  "settings": {
    "randomizeQuestions": true,
    "randomizeOptions": true,
    "showExplanations": true
  }
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Quiz title |
| `content` | string | Yes | Educational content to generate questions from (max 15,000 chars) |
| `questionCount` | number | Yes | Total number of questions to generate (1-50) |
| `difficulty` | string | No | Overall difficulty: "easy", "medium", "hard" (default: "medium") |
| `distribution` | object | No | Question type distribution (must sum to questionCount) |
| `timer` | number | No | Time limit in minutes (default: 30) |
| `expiresAt` | string | No | ISO 8601 date when quiz expires |
| `settings` | object | No | Additional quiz settings |

**Response (Success):**

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "quiz": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Biology Quiz - Photosynthesis",
      "code": "ABC123",
      "questionCount": 10,
      "timer": 30,
      "expiresAt": "2024-12-31T23:59:59Z",
      "createdBy": "507f1f77bcf86cd799439012",
      "createdAt": "2024-11-14T10:30:00Z",
      "status": "active"
    },
    "questions": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "type": "multipleChoice",
        "question": "What is the primary product of photosynthesis that plants use for energy?",
        "options": [
          "Glucose",
          "Oxygen",
          "Chlorophyll",
          "Carbon dioxide"
        ],
        "correctAnswer": 0,
        "explanation": "Glucose is the primary energy-storing product of photosynthesis...",
        "difficulty": "medium",
        "conceptTested": "Photosynthesis products",
        "qualityScore": 88,
        "metadata": {
          "generatedBy": "agentic-pipeline",
          "validated": true,
          "improved": false
        }
      }
      // ... more questions
    ],
    "metadata": {
      "agenticPipeline": {
        "used": true,
        "extractedConcepts": {
          "mainTopics": ["Photosynthesis", "Plant Biology"],
          "keyConcepts": 8,
          "criticalFacts": 12
        },
        "qualityMetrics": {
          "averageScore": 82.5,
          "questionsImproved": 2,
          "validationPassed": 10
        },
        "performance": {
          "totalTime": 45.2,
          "extractionTime": 8.1,
          "generationTime": 22.3,
          "validationTime": 10.5,
          "improvementTime": 4.3
        },
        "providersUsed": {
          "content-extraction": "openrouter",
          "question-generation": "openrouter",
          "quality-validation": "gemini",
          "question-improvement": "openrouter"
        }
      }
    }
  },
  "message": "Quiz created successfully with agentic pipeline"
}
```

**Response (Fallback to Legacy System):**

If agentic pipeline is disabled or fails, the system falls back to the legacy single-AI approach:

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "quiz": { /* same structure */ },
    "questions": [ /* same structure */ ],
    "metadata": {
      "agenticPipeline": {
        "used": false,
        "reason": "Feature flag disabled"
      },
      "legacySystem": {
        "used": true,
        "provider": "gemini"
      }
    }
  },
  "message": "Quiz created successfully"
}
```

**Error Responses:**

See [Error Responses](#error-responses) section below.

---

## Admin Monitoring API

### Get AI Usage Statistics

**Endpoint:** `GET /api/admin/ai-usage`

**Description:** Returns comprehensive usage statistics, performance metrics, and cost estimates for the agentic pipeline.

**Authentication:** Required (Admin role only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | ISO 8601 start date for filtering (default: 24 hours ago) |
| `endDate` | string | No | ISO 8601 end date for filtering (default: now) |
| `groupBy` | string | No | Group results by: "hour", "day", "provider", "task" |

**Example Request:**
```http
GET /api/admin/ai-usage?startDate=2024-11-01T00:00:00Z&endDate=2024-11-14T23:59:59Z&groupBy=day
```

**Response (Success):**

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRequests": 1250,
      "successfulRequests": 1198,
      "failedRequests": 52,
      "successRate": 95.84,
      "averageResponseTime": 42.3,
      "p95ResponseTime": 78.5,
      "p99ResponseTime": 105.2,
      "averageQualityScore": 81.2,
      "totalCostEstimate": 0.00,
      "period": {
        "start": "2024-11-01T00:00:00Z",
        "end": "2024-11-14T23:59:59Z"
      }
    },
    "providers": {
      "openrouter": {
        "requests": 850,
        "successRate": 96.5,
        "failureRate": 3.5,
        "averageResponseTime": 38.2,
        "totalTokens": 2450000,
        "estimatedCost": 0.00,
        "rateLimitHits": 5,
        "modelsUsed": {
          "qwen/qwen-2.5-72b-instruct:free": 600,
          "meta-llama/llama-3.1-8b-instruct:free": 250
        }
      },
      "gemini": {
        "requests": 320,
        "successRate": 98.1,
        "failureRate": 1.9,
        "averageResponseTime": 28.5,
        "totalTokens": 980000,
        "estimatedCost": 0.00,
        "rateLimitHits": 0,
        "modelsUsed": {
          "gemini-2.0-flash-exp": 320
        }
      },
      "ollama": {
        "requests": 80,
        "successRate": 92.5,
        "failureRate": 7.5,
        "averageResponseTime": 65.3,
        "totalTokens": 0,
        "estimatedCost": 0.00,
        "rateLimitHits": 0,
        "modelsUsed": {
          "llama3.2:3b": 80
        }
      }
    },
    "tasks": {
      "content-extraction": {
        "requests": 250,
        "successRate": 97.2,
        "averageResponseTime": 28.5,
        "averageQualityScore": null,
        "primaryProvider": "openrouter",
        "fallbackUsed": 8
      },
      "question-generation": {
        "requests": 250,
        "successRate": 95.6,
        "averageResponseTime": 52.3,
        "averageQualityScore": 78.5,
        "primaryProvider": "openrouter",
        "fallbackUsed": 12
      },
      "quality-validation": {
        "requests": 2500,
        "successRate": 96.8,
        "averageResponseTime": 18.2,
        "averageQualityScore": 81.2,
        "primaryProvider": "gemini",
        "fallbackUsed": 15
      },
      "question-improvement": {
        "requests": 750,
        "successRate": 94.2,
        "averageResponseTime": 35.8,
        "averageQualityScore": 87.3,
        "primaryProvider": "openrouter",
        "fallbackUsed": 22
      },
      "analytics": {
        "requests": 50,
        "successRate": 98.0,
        "averageResponseTime": 42.1,
        "averageQualityScore": null,
        "primaryProvider": "gemini",
        "fallbackUsed": 1
      }
    },
    "qualityMetrics": {
      "averageScore": 81.2,
      "scoreDistribution": {
        "excellent": 420,
        "good": 1580,
        "fair": 380,
        "poor": 120
      },
      "improvementRate": 30.0,
      "questionsImproved": 750,
      "averageImprovement": 15.3
    },
    "errors": {
      "total": 52,
      "byType": {
        "timeout": 18,
        "rateLimit": 12,
        "invalidResponse": 8,
        "providerError": 10,
        "validationError": 4
      },
      "byProvider": {
        "openrouter": 30,
        "gemini": 6,
        "ollama": 16
      }
    },
    "rateLimits": {
      "openrouter": {
        "limit": 200,
        "used": 850,
        "remaining": 0,
        "resetAt": "2024-11-15T00:00:00Z",
        "status": "exceeded"
      },
      "gemini": {
        "limit": 1500,
        "used": 320,
        "remaining": 1180,
        "resetAt": "2024-11-15T00:00:00Z",
        "status": "ok"
      }
    },
    "recommendations": [
      "OpenRouter rate limit exceeded 5 times. Consider distributing load to Gemini.",
      "Ollama has 7.5% failure rate. Check local instance health.",
      "30% of questions required improvement. Consider optimizing generation prompts.",
      "Average quality score is 81.2. System is performing well."
    ]
  },
  "timestamp": "2024-11-14T15:30:00Z"
}
```

### Test AI Providers

**Endpoint:** `POST /api/admin/test-providers`

**Description:** Tests connectivity and functionality of all configured AI providers.

**Authentication:** Required (Admin role only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
```

**Response (Success):**

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "name": "openrouter",
        "available": true,
        "responseTime": 1250,
        "testResult": "success",
        "model": "qwen/qwen-2.5-72b-instruct:free",
        "error": null
      },
      {
        "name": "gemini",
        "available": true,
        "responseTime": 850,
        "testResult": "success",
        "model": "gemini-2.0-flash-exp",
        "error": null
      },
      {
        "name": "ollama",
        "available": false,
        "responseTime": null,
        "testResult": "failed",
        "model": "llama3.2:3b",
        "error": "Connection refused: ECONNREFUSED localhost:11434"
      }
    ],
    "summary": {
      "total": 3,
      "available": 2,
      "unavailable": 1
    }
  },
  "timestamp": "2024-11-14T15:30:00Z"
}
```

### Reset Usage Statistics

**Endpoint:** `POST /api/admin/ai-usage/reset`

**Description:** Resets all usage statistics and metrics (useful for testing).

**Authentication:** Required (Admin role only)

**Response (Success):**

Status: `200 OK`

```json
{
  "success": true,
  "message": "Usage statistics reset successfully",
  "timestamp": "2024-11-14T15:30:00Z"
}
```

---

## Health Check API

### System Health Check

**Endpoint:** `GET /api/health`

**Description:** Returns overall system health including agentic pipeline status and provider availability.

**Authentication:** Not required

**Response (Healthy):**

Status: `200 OK`

```json
{
  "status": "healthy",
  "timestamp": "2024-11-14T15:30:00Z",
  "uptime": 86400,
  "memory": {
    "rss": 125829120,
    "heapTotal": 83881984,
    "heapUsed": 62345678,
    "external": 1234567
  },
  "agenticPipeline": {
    "enabled": true,
    "providers": [
      {
        "name": "openrouter",
        "available": true,
        "error": null
      },
      {
        "name": "gemini",
        "available": true,
        "error": null
      },
      {
        "name": "ollama",
        "available": false,
        "error": "Connection refused"
      }
    ],
    "metrics": {
      "successRate": "95.84",
      "avgResponseTime": "42.30",
      "avgQualityScore": "81.20"
    }
  },
  "database": {
    "connected": true,
    "responseTime": 12
  }
}
```

**Response (Unhealthy):**

Status: `503 Service Unavailable`

```json
{
  "status": "unhealthy",
  "timestamp": "2024-11-14T15:30:00Z",
  "uptime": 86400,
  "agenticPipeline": {
    "enabled": true,
    "providers": [
      {
        "name": "openrouter",
        "available": false,
        "error": "Rate limit exceeded"
      },
      {
        "name": "gemini",
        "available": false,
        "error": "Invalid API key"
      },
      {
        "name": "ollama",
        "available": false,
        "error": "Connection refused"
      }
    ]
  },
  "database": {
    "connected": false,
    "error": "Connection timeout"
  }
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error context
    }
  },
  "timestamp": "2024-11-14T15:30:00Z"
}
```

### Common Error Codes

#### 400 Bad Request

**INVALID_REQUEST**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "field": "questionCount",
      "issue": "Must be between 1 and 50"
    }
  }
}
```

**CONTENT_TOO_LONG**
```json
{
  "success": false,
  "error": {
    "code": "CONTENT_TOO_LONG",
    "message": "Content exceeds maximum length",
    "details": {
      "maxLength": 15000,
      "actualLength": 18500
    }
  }
}
```

**INVALID_DISTRIBUTION**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DISTRIBUTION",
    "message": "Question distribution does not sum to total question count",
    "details": {
      "requested": 10,
      "distribution": {
        "multipleChoice": 5,
        "trueFalse": 3,
        "fillInBlank": 1
      },
      "sum": 9
    }
  }
}
```

#### 401 Unauthorized

**AUTHENTICATION_REQUIRED**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication token required"
  }
}
```

**INVALID_TOKEN**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired authentication token"
  }
}
```

#### 403 Forbidden

**INSUFFICIENT_PERMISSIONS**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Admin access required for this endpoint",
    "details": {
      "required": "admin",
      "actual": "teacher"
    }
  }
}
```

#### 500 Internal Server Error

**AGENTIC_PIPELINE_FAILED**
```json
{
  "success": false,
  "error": {
    "code": "AGENTIC_PIPELINE_FAILED",
    "message": "Failed to generate quiz using agentic pipeline",
    "details": {
      "stage": "question-generation",
      "attemptedProviders": ["openrouter", "gemini", "ollama"],
      "lastError": "All providers failed or unavailable",
      "fallbackUsed": true
    }
  }
}
```

**CONTENT_EXTRACTION_FAILED**
```json
{
  "success": false,
  "error": {
    "code": "CONTENT_EXTRACTION_FAILED",
    "message": "Failed to extract concepts from content",
    "details": {
      "provider": "openrouter",
      "error": "Request timeout after 30000ms"
    }
  }
}
```

**QUESTION_GENERATION_FAILED**
```json
{
  "success": false,
  "error": {
    "code": "QUESTION_GENERATION_FAILED",
    "message": "Failed to generate questions",
    "details": {
      "provider": "gemini",
      "error": "Rate limit exceeded",
      "retryAfter": "2024-11-15T00:00:00Z"
    }
  }
}
```

**VALIDATION_FAILED**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Question validation failed",
    "details": {
      "questionsValidated": 8,
      "questionsFailed": 2,
      "error": "Provider timeout"
    }
  }
}
```

#### 503 Service Unavailable

**ALL_PROVIDERS_UNAVAILABLE**
```json
{
  "success": false,
  "error": {
    "code": "ALL_PROVIDERS_UNAVAILABLE",
    "message": "All AI providers are currently unavailable",
    "details": {
      "providers": {
        "openrouter": "Rate limit exceeded",
        "gemini": "API key invalid",
        "ollama": "Connection refused"
      }
    }
  }
}
```

---

## Usage Examples

### Example 1: Create Quiz with Default Settings

```bash
curl -X POST http://localhost:5000/api/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "Quick Biology Quiz",
    "content": "Photosynthesis is the process by which plants convert light energy into chemical energy...",
    "questionCount": 5
  }'
```

### Example 2: Create Quiz with Custom Distribution

```bash
curl -X POST http://localhost:5000/api/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "Advanced Biology Quiz",
    "content": "...",
    "questionCount": 15,
    "difficulty": "hard",
    "distribution": {
      "multipleChoice": 10,
      "trueFalse": 3,
      "fillInBlank": 2,
      "matching": 0
    },
    "timer": 45,
    "settings": {
      "randomizeQuestions": true,
      "randomizeOptions": true,
      "showExplanations": false
    }
  }'
```

### Example 3: Get Usage Statistics

```bash
curl -X GET "http://localhost:5000/api/admin/ai-usage?startDate=2024-11-01T00:00:00Z&groupBy=day" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 4: Test Providers

```bash
curl -X POST http://localhost:5000/api/admin/test-providers \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 5: Check System Health

```bash
curl -X GET http://localhost:5000/api/health
```

### Example 6: Using with JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_TOKEN = 'your_jwt_token_here';

// Create quiz
async function createQuiz() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/quizzes`,
      {
        title: 'My Quiz',
        content: 'Educational content here...',
        questionCount: 10,
        difficulty: 'medium'
      },
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Quiz created:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data.error);
    } else {
      console.error('Network error:', error.message);
    }
    throw error;
  }
}

// Get usage statistics
async function getUsageStats() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/ai-usage`,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        params: {
          startDate: '2024-11-01T00:00:00Z',
          endDate: '2024-11-14T23:59:59Z',
          groupBy: 'day'
        }
      }
    );

    console.log('Usage stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error.response?.data || error.message);
    throw error;
  }
}

// Check health
async function checkHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('System health:', response.data);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error.message);
    throw error;
  }
}
```

---

## Rate Limits

### Free Tier Limits

**OpenRouter:**
- 200 requests per day
- 20 requests per minute
- Automatic fallback when exceeded

**Gemini:**
- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per day

**Ollama:**
- No rate limits (local)
- Limited by system resources

### Handling Rate Limits

The system automatically handles rate limits through:
1. Fallback to alternative providers
2. Exponential backoff retry logic
3. Request queuing (future enhancement)

---

## Versioning

Current API Version: `v1`

All endpoints are prefixed with `/api/` and follow semantic versioning.

**Breaking changes** will be introduced in new versions (e.g., `/api/v2/`).

**Non-breaking changes** (new fields, new endpoints) will be added to current version.

---

## Support

For API support:
- Documentation: `/docs/`
- Issues: GitHub Issues
- Email: api-support@yourdomain.com

---

## Changelog

### v1.0.0 (2024-11-14)
- Initial release of agentic pipeline API
- Quiz generation with multi-AI agents
- Admin monitoring endpoints
- Health check endpoints
