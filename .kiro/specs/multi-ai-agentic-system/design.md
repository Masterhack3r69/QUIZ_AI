# Design Document

## Overview

The multi-AI agentic system transforms quiz generation from a single-AI approach to a specialized multi-agent pipeline. Each agent focuses on a specific task and uses the most appropriate AI provider based on configuration. The system is designed for flexibility, reliability, and cost-effectiveness, with automatic fallback mechanisms and support for free AI providers.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Quiz Creation API                        │
│                  (Existing Endpoint)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Agentic Pipeline Orchestrator               │
│  - Coordinates agent execution                               │
│  - Manages data flow between agents                          │
│  - Handles errors and retries                                │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         ▼               ▼               ▼              ▼
    ┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
    │Content │     │Question│     │Quality │     │Question│
    │Extract │     │Generate│     │Validate│     │Improve │
    │ Agent  │     │ Agent  │     │ Agent  │     │ Agent  │
    └───┬────┘     └───┬────┘     └───┬────┘     └───┬────┘
        │              │              │              │
        └──────────────┴──────────────┴──────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Task Router                             │
│  - Routes tasks to AI providers                              │
│  - Implements fallback logic                                 │
│  - Manages retries and timeouts                              │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐     ┌─────────┐     ┌─────────┐
    │OpenRouter│     │ Gemini  │     │ Ollama  │
    │  (Free)  │     │  (Free) │     │ (Local) │
    └─────────┘     └─────────┘     └─────────┘
```

### Data Flow

```
1. Teacher uploads content
   ↓
2. Content Extraction Agent analyzes content
   → Extracts: topics, concepts, facts, objectives
   ↓
3. Question Generation Agent creates questions
   → Input: extracted concepts + distribution
   → Output: raw questions (all types)
   ↓
4. Quality Validation Agent evaluates each question
   → Scores: clarity, correctness, distractors, value
   → Identifies: issues and improvement suggestions
   ↓
5. Question Improvement Agent (for low-quality questions)
   → Input: question + validation feedback
   → Output: improved question
   ↓
6. Final validated questions returned to API
   → Saved to database
   → Quiz created
```

## Components and Interfaces

### 1. Configuration System

**File: `backend/config/ai-tasks.json`**

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
      "model": "meta-llama/llama-3.2-3b-instruct:free"
    },
    "quality-validation": {
      "primary": "openrouter",
      "fallback": ["gemini", "ollama"],
      "maxRetries": 2,
      "timeout": 30000,
      "model": "meta-llama/llama-3.2-3b-instruct:free"
    },
    "question-improvement": {
      "primary": "openrouter",
      "fallback": ["gemini", "ollama"],
      "maxRetries": 2,
      "timeout": 45000,
      "model": "meta-llama/llama-3.2-3b-instruct:free"
    }
  },
  "providers": {
    "openrouter": {
      "enabled": true,
      "baseURL": "https://openrouter.ai/api/v1",
      "models": {
        "free": "meta-llama/llama-3.2-3b-instruct:free",
        "fast": "google/gemini-flash-1.5:free",
        "quality": "meta-llama/llama-3.1-8b-instruct:free"
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

**File: `backend/config/ai-prompts.json`**

```json
{
  "content-extraction": {
    "systemRole": "You are an expert educational content analyzer specializing in identifying key learning concepts.",
    "template": "TASK: Analyze the following educational content...",
    "variables": ["content"],
    "outputFormat": "json"
  },
  "question-generation": {
    "systemRole": "You are an expert educational assessment designer with 20+ years of experience.",
    "template": "TASK: Generate {questionCount} high-quality questions...",
    "variables": ["concepts", "questionCount", "difficulty", "distribution"],
    "outputFormat": "json"
  }
}
```

### 2. Task Router Service

**File: `backend/src/services/ai-task-router.js`**

```javascript
class AITaskRouter {
  constructor() {
    this.config = this.loadConfig();
    this.providers = this.initializeProviders();
  }

  async executeTask(taskName, prompt, options = {}) {
    // Get task configuration
    // Try primary provider
    // On failure, try fallback providers
    // Return result or throw error
  }

  async executeWithProvider(provider, prompt, options) {
    // Execute prompt with specific provider
    // Handle provider-specific formatting
    // Parse and validate response
  }

  async retryWithBackoff(fn, maxRetries, baseDelay) {
    // Implement exponential backoff retry logic
  }
}
```

**Interface:**
```typescript
interface TaskRouterOptions {
  forceProvider?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

interface TaskResult {
  success: boolean;
  data: any;
  provider: string;
  executionTime: number;
  tokensUsed?: number;
}
```

### 3. AI Provider Adapters

**File: `backend/src/services/ai-providers/base-provider.js`**

```javascript
class BaseAIProvider {
  constructor(config) {
    this.config = config;
  }

  async generateCompletion(prompt, options) {
    throw new Error('Must be implemented by subclass');
  }

  parseResponse(response) {
    throw new Error('Must be implemented by subclass');
  }

  isAvailable() {
    return this.config.enabled && this.hasRequiredCredentials();
  }
}
```

**File: `backend/src/services/ai-providers/openrouter-provider.js`**

```javascript
class OpenRouterProvider extends BaseAIProvider {
  async generateCompletion(prompt, options) {
    // Call OpenRouter API
    // Handle free tier models
    // Return standardized response
  }
}
```

**File: `backend/src/services/ai-providers/gemini-provider.js`**

```javascript
class GeminiProvider extends BaseAIProvider {
  async generateCompletion(prompt, options) {
    // Call Gemini API
    // Handle JSON mode
    // Return standardized response
  }
}
```

**File: `backend/src/services/ai-providers/ollama-provider.js`**

```javascript
class OllamaProvider extends BaseAIProvider {
  async generateCompletion(prompt, options) {
    // Call Ollama local API
    // Handle streaming if needed
    // Return standardized response
  }
}
```

### 4. Agent Services

**File: `backend/src/services/agents/content-extraction-agent.js`**

```javascript
class ContentExtractionAgent {
  constructor(taskRouter, promptManager) {
    this.taskRouter = taskRouter;
    this.promptManager = promptManager;
  }

  async extractConcepts(content) {
    // Build prompt from template
    // Execute via task router
    // Validate and parse response
    // Return structured concepts
  }

  validateExtractedConcepts(concepts) {
    // Ensure all required fields present
    // Validate data types
    // Check minimum counts
  }
}
```

**Output Interface:**
```typescript
interface ExtractedConcepts {
  mainTopics: string[];
  keyConcepts: Array<{
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    testable: boolean;
  }>;
  criticalFacts: Array<{
    fact: string;
    category: 'definition' | 'date' | 'process' | 'relationship';
    importance: 'high' | 'medium' | 'low';
  }>;
  learningObjectives: string[];
  exceptions: Array<{
    rule: string;
    exception: string;
    context: string;
  }>;
}
```

**File: `backend/src/services/agents/question-generation-agent.js`**

```javascript
class QuestionGenerationAgent {
  constructor(taskRouter, promptManager) {
    this.taskRouter = taskRouter;
    this.promptManager = promptManager;
  }

  async generateQuestions(concepts, distribution, totalQuestions) {
    // Build prompt with concepts and requirements
    // Execute via task router
    // Parse and validate questions
    // Ensure distribution matches request
    // Return questions array
  }

  validateQuestionFormat(question) {
    // Type-specific validation
    // Ensure all required fields
    // Validate answer formats
  }

  adjustDistribution(questions, requestedDistribution) {
    // Handle cases where AI didn't generate enough of a type
    // Redistribute to available types
    // Ensure minimum quality standards
  }
}
```

**File: `backend/src/services/agents/quality-validation-agent.js`**

```javascript
class QualityValidationAgent {
  constructor(taskRouter, promptManager) {
    this.taskRouter = taskRouter;
    this.promptManager = promptManager;
  }

  async validateQuestion(question) {
    // Build validation prompt
    // Execute via task router
    // Parse quality scores
    // Return validation result
  }

  async validateBatch(questions) {
    // Validate multiple questions in parallel
    // Aggregate results
    // Identify questions needing improvement
  }
}
```

**Output Interface:**
```typescript
interface ValidationResult {
  score: number;
  grade: 'excellent' | 'good' | 'fair' | 'poor';
  clarity: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  correctness: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  distractorQuality: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  educationalValue: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  passesQuality: boolean;
  requiresImprovement: boolean;
}
```

**File: `backend/src/services/agents/question-improvement-agent.js`**

```javascript
class QuestionImprovementAgent {
  constructor(taskRouter, promptManager) {
    this.taskRouter = taskRouter;
    this.promptManager = promptManager;
  }

  async improveQuestion(question, validationFeedback) {
    // Build improvement prompt
    // Include original question and feedback
    // Execute via task router
    // Parse improved question
    // Return improved version
  }

  async improveBatch(questionsWithFeedback) {
    // Improve multiple questions in parallel
    // Track improvements made
    // Return improved questions
  }
}
```

### 5. Pipeline Orchestrator

**File: `backend/src/services/agentic-pipeline.js`**

```javascript
class AgenticPipeline {
  constructor(agents, config) {
    this.contentExtractionAgent = agents.contentExtraction;
    this.questionGenerationAgent = agents.questionGeneration;
    this.qualityValidationAgent = agents.qualityValidation;
    this.questionImprovementAgent = agents.questionImprovement;
    this.config = config;
  }

  async generateQuiz(content, options) {
    // Step 1: Extract concepts
    const concepts = await this.contentExtractionAgent.extractConcepts(content);
    
    // Step 2: Generate questions
    const rawQuestions = await this.questionGenerationAgent.generateQuestions(
      concepts,
      options.distribution,
      options.totalQuestions
    );
    
    // Step 3: Validate questions
    const validationResults = await this.qualityValidationAgent.validateBatch(rawQuestions);
    
    // Step 4: Improve low-quality questions
    const lowQualityQuestions = this.identifyLowQuality(rawQuestions, validationResults);
    const improvedQuestions = await this.questionImprovementAgent.improveBatch(lowQualityQuestions);
    
    // Step 5: Merge and return final questions
    return this.mergeFinalQuestions(rawQuestions, improvedQuestions, validationResults);
  }

  identifyLowQuality(questions, validationResults) {
    // Find questions with score < 70
    // Pair with validation feedback
  }

  mergeFinalQuestions(original, improved, validations) {
    // Replace low-quality with improved versions
    // Ensure all questions pass minimum threshold
    // Return final set
  }
}
```

### 6. Prompt Manager

**File: `backend/src/services/prompt-manager.js`**

```javascript
class PromptManager {
  constructor() {
    this.prompts = this.loadPrompts();
  }

  getPrompt(agentName, variables = {}) {
    // Load prompt template
    // Substitute variables
    // Return formatted prompt
  }

  validateVariables(template, variables) {
    // Ensure all required variables provided
    // Throw error if missing
  }

  formatPrompt(template, variables) {
    // Replace {variable} placeholders
    // Handle special formatting
  }
}
```

## Data Models

### Configuration Models

```typescript
interface TaskConfig {
  primary: string;
  fallback: string[];
  maxRetries: number;
  timeout: number;
  model?: string;
}

interface ProviderConfig {
  enabled: boolean;
  baseURL?: string;
  apiKey?: string;
  model?: string;
  models?: Record<string, string>;
}

interface AgenticConfig {
  tasks: Record<string, TaskConfig>;
  providers: Record<string, ProviderConfig>;
}
```

### Agent Data Models

```typescript
// Question types
interface MultipleChoiceQuestion {
  type: 'multipleChoice';
  question: string;
  options: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  conceptTested?: string;
}

interface TrueFalseQuestion {
  type: 'trueFalse';
  question: string;
  correctAnswer: boolean;
  explanation?: string;
}

interface FillInBlankQuestion {
  type: 'fillInBlank';
  question: string;
  correctAnswer: string;
  caseSensitive: boolean;
  explanation?: string;
}

interface MatchingQuestion {
  type: 'matching';
  question: string;
  leftColumn: string[];
  rightColumn: string[];
  correctPairs: Array<{ left: number; right: number }>;
  explanation?: string;
}

type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillInBlankQuestion | MatchingQuestion;
```

## Error Handling

### Error Types

```typescript
class AIProviderError extends Error {
  constructor(provider: string, originalError: Error) {
    super(`AI Provider ${provider} failed: ${originalError.message}`);
    this.provider = provider;
    this.originalError = originalError;
  }
}

class TaskExecutionError extends Error {
  constructor(taskName: string, attemptedProviders: string[]) {
    super(`Task ${taskName} failed after trying providers: ${attemptedProviders.join(', ')}`);
    this.taskName = taskName;
    this.attemptedProviders = attemptedProviders;
  }
}

class ValidationError extends Error {
  constructor(message: string, validationDetails: any) {
    super(message);
    this.validationDetails = validationDetails;
  }
}
```

### Error Handling Strategy

1. **Provider-Level Errors**
   - Catch API errors (network, auth, rate limit)
   - Log error details
   - Attempt next fallback provider
   - If all fail, throw TaskExecutionError

2. **Validation Errors**
   - Invalid JSON responses
   - Missing required fields
   - Malformed data
   - Log warning and attempt retry or fallback

3. **Timeout Handling**
   - Set timeout per task configuration
   - Cancel request on timeout
   - Attempt fallback provider
   - Log timeout event

4. **Rate Limit Handling**
   - Detect rate limit errors
   - Implement exponential backoff
   - Switch to fallback provider if available
   - Log rate limit events for monitoring

## Testing Strategy

### Unit Tests

1. **Task Router Tests**
   - Test provider selection logic
   - Test fallback mechanism
   - Test retry with backoff
   - Mock AI provider responses

2. **Agent Tests**
   - Test prompt building
   - Test response parsing
   - Test validation logic
   - Mock task router

3. **Provider Adapter Tests**
   - Test API call formatting
   - Test response parsing
   - Test error handling
   - Mock external APIs

### Integration Tests

1. **Pipeline Tests**
   - Test full quiz generation flow
   - Test with different distributions
   - Test error recovery
   - Use test AI providers

2. **Configuration Tests**
   - Test config loading
   - Test environment-based selection
   - Test validation
   - Test hot-reload (future)

### End-to-End Tests

1. **Quiz Generation E2E**
   - Upload real content
   - Generate quiz with agentic system
   - Validate final questions
   - Compare with baseline quality

2. **Provider Fallback E2E**
   - Simulate primary provider failure
   - Verify fallback works
   - Verify final result quality

### Performance Tests

1. **Latency Tests**
   - Measure time per agent
   - Measure total pipeline time
   - Compare with single-AI approach
   - Identify bottlenecks

2. **Throughput Tests**
   - Test concurrent quiz generation
   - Test provider rate limits
   - Test system under load

## Deployment Considerations

### Environment Variables

```bash
# AI Provider Configuration
AI_TASK_CONFIG=production  # or development, testing

# OpenRouter
OPENROUTER_API_KEY=your_key_here

# Google Gemini
GEMINI_API_KEY=your_key_here

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b

# Feature Flags
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=true
```

### Configuration Files

- `config/ai-tasks.development.json` - Free providers only
- `config/ai-tasks.testing.json` - Fast providers for CI/CD
- `config/ai-tasks.production.json` - Optimized for quality and cost

### Monitoring

1. **Metrics to Track**
   - Requests per provider
   - Success/failure rates
   - Average response times
   - Token usage and costs
   - Quality scores over time

2. **Logging**
   - Log all AI requests (task, provider, duration)
   - Log fallback events
   - Log validation failures
   - Log improvement actions

3. **Alerts**
   - High failure rate for any provider
   - Approaching rate limits
   - Degraded quality scores
   - Increased latency

## Migration Strategy

### Phase 1: Infrastructure (Week 1)
- Create configuration system
- Implement task router
- Create provider adapters
- Add comprehensive logging

### Phase 2: Agents (Week 2)
- Implement content extraction agent
- Implement question generation agent
- Implement quality validation agent
- Implement question improvement agent

### Phase 3: Integration (Week 3)
- Create pipeline orchestrator
- Integrate with existing quiz API
- Add feature flag for gradual rollout
- Comprehensive testing

### Phase 4: Optimization (Week 4)
- Performance tuning
- Cost optimization
- Quality improvements
- Documentation

### Rollout Plan

1. **Development**: Test with Ollama only
2. **Staging**: Test with OpenRouter free tier
3. **Production Canary**: 10% of quiz generation
4. **Production Full**: 100% after validation

## Future Enhancements

1. **Analytics Agent**
   - Analyze quiz performance
   - Provide teacher insights
   - Identify struggling students

2. **Adaptive Learning**
   - Learn from validation feedback
   - Improve prompts automatically
   - Optimize provider selection

3. **Caching Layer**
   - Cache extracted concepts
   - Cache validated questions
   - Reduce API calls

4. **Admin UI**
   - Configure providers through UI
   - View usage statistics
   - Adjust task assignments

5. **A/B Testing**
   - Test different prompts
   - Compare provider quality
   - Optimize configurations
