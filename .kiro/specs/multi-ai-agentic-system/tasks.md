# Implementation Plan

- [x] 1. Set up configuration system and infrastructure





  - Create configuration files for AI task assignments and provider settings
  - Implement configuration loader with environment-based selection
  - Add validation for configuration files on startup
  - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.2, 10.3, 10.4_


- [x] 1.1 Create AI task configuration files

  - Create `backend/config/ai-tasks.development.json` with free providers (Ollama primary, OpenRouter/Gemini fallback)
  - Create `backend/config/ai-tasks.production.json` with optimized provider selection (OpenRouter primary, Gemini/Ollama fallback)
  - Define task configurations for all five agents with timeout and retry settings
  - _Requirements: 1.1, 1.2, 10.1, 10.2_


- [x] 1.2 Create AI prompts configuration file


  - Create `backend/config/ai-prompts.json` with all five agent prompts from documentation
  - Include system roles, prompt templates, required variables, and output formats
  - Add prompt for content extraction agent with JSON schema
  - Add prompt for question generation agent with distractor strategies
  - Add prompt for quality validation agent with scoring criteria
  - Add prompt for question improvement agent with improvement guidelines
  - _Requirements: 8.1, 8.2, 8.3_


- [x] 1.3 Implement configuration loader service

  - Create `backend/src/services/config-loader.js` to load and parse JSON configs
  - Implement environment-based config selection (AI_TASK_CONFIG env variable)
  - Add validation to ensure all required fields are present
  - Add error handling for missing or malformed config files
  - _Requirements: 1.1, 10.1, 10.2, 10.3, 10.4_

- [x] 2. Implement AI provider adapters




  - Create base provider interface and three concrete implementations
  - Implement unified response format across all providers
  - Add error handling and availability checks
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 2.1 Create base AI provider class


  - Create `backend/src/services/ai-providers/base-provider.js` with abstract methods
  - Define interface for `generateCompletion()`, `parseResponse()`, and `isAvailable()`
  - Add common error handling utilities
  - Define standardized response format
  - _Requirements: 6.4_

- [x] 2.2 Implement OpenRouter provider adapter


  - Create `backend/src/services/ai-providers/openrouter-provider.js` extending base provider
  - Implement API calls to OpenRouter with free models (meta-llama/llama-3.2-3b-instruct:free)
  - Add authentication with OPENROUTER_API_KEY environment variable
  - Handle JSON mode and response parsing
  - Add error handling for rate limits and API errors
  - _Requirements: 6.1, 6.4, 6.5, 6.6_

- [x] 2.3 Implement Gemini provider adapter


  - Create `backend/src/services/ai-providers/gemini-provider.js` extending base provider
  - Integrate with existing GoogleGenAI client from quiz.utils.js
  - Use gemini-2.0-flash-exp model for free tier
  - Handle JSON mode and structured output
  - Add error handling for rate limits and API errors
  - _Requirements: 6.2, 6.4, 6.5, 6.6_

- [x] 2.4 Implement Ollama provider adapter


  - Create `backend/src/services/ai-providers/ollama-provider.js` extending base provider
  - Implement API calls to local Ollama instance
  - Use llama3.2:1b model for fast local inference
  - Handle streaming responses if needed
  - Add availability check (ping Ollama server)
  - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [x] 3. Implement task router service





  - Create task router to manage provider selection and fallback logic
  - Implement retry mechanism with exponential backoff
  - Add comprehensive logging and error handling
  - _Requirements: 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5, 10.5_


- [x] 3.1 Create task router core logic

  - Create `backend/src/services/ai-task-router.js` with provider management
  - Implement `executeTask()` method that routes to configured provider
  - Load task configurations and initialize provider instances
  - Add provider availability checking before execution
  - _Requirements: 1.4, 6.4, 6.5_


- [x] 3.2 Implement fallback mechanism


  - Add logic to try fallback providers when primary fails
  - Track which providers were attempted for logging
  - Throw TaskExecutionError if all providers fail
  - Log all fallback events with provider names and error details
  - _Requirements: 1.5, 7.1, 7.2, 7.3, 7.5_




- [x] 3.3 Implement retry logic with exponential backoff

  - Create `retryWithBackoff()` method for transient failures
  - Implement exponential backoff (1s, 2s, 4s delays)
  - Add configurable max retries from task config
  - Handle timeout errors separately from other failures
  - _Requirements: 7.4, 7.5_





- [x] 3.4 Add request logging and monitoring

  - Log every AI request with task name, provider, timestamp
  - Log response time and token usage
  - Log success/failure status
  - Add structured logging for easy parsing
  - _Requirements: 11.1, 11.2_

- [x] 4. Implement prompt manager service





  - Create prompt manager to load and format prompts
  - Implement variable substitution for prompt templates
  - Add validation for required variables
  - _Requirements: 8.1, 8.2, 8.4, 8.5_


- [x] 4.1 Create prompt manager class

  - Create `backend/src/services/prompt-manager.js` to manage prompts
  - Load prompts from `config/ai-prompts.json` on initialization
  - Implement `getPrompt()` method with variable substitution
  - Add caching for loaded prompts
  - _Requirements: 8.1, 8.2_


- [x] 4.2 Implement variable substitution


  - Create `formatPrompt()` method to replace {variable} placeholders
  - Support nested variables and arrays
  - Handle special formatting (JSON stringification, escaping)
  - _Requirements: 8.2, 8.5_



- [x] 4.3 Add prompt validation

  - Create `validateVariables()` method to check required variables
  - Throw clear error if variables are missing
  - Validate variable types match expected format
  - _Requirements: 8.5_

- [x] 5. Implement content extraction agent




  - Create agent to analyze content and extract concepts
  - Integrate with task router and prompt manager
  - Validate and parse AI responses
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 5.1 Create content extraction agent class


  - Create `backend/src/services/agents/content-extraction-agent.js`
  - Initialize with task router and prompt manager dependencies
  - Implement `extractConcepts()` method as main entry point
  - _Requirements: 2.1_

- [x] 5.2 Implement concept extraction logic

  - Build prompt using prompt manager with content variable
  - Execute prompt via task router with 'content-extraction' task
  - Parse JSON response into structured format
  - Handle content truncation for large inputs (max 15,000 chars)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 5.3 Add response validation

  - Create `validateExtractedConcepts()` method
  - Ensure mainTopics array has 3-5 items
  - Ensure keyConcepts array has 5-10 items with required fields
  - Ensure criticalFacts array has 5-10 items
  - Ensure learningObjectives array has 3-5 items
  - Throw ValidationError if response is invalid
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Implement question generation agent





  - Create agent to generate questions from concepts
  - Support all four question types with proper distribution
  - Validate question formats
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 6.1 Create question generation agent class


  - Create `backend/src/services/agents/question-generation-agent.js`
  - Initialize with task router and prompt manager dependencies
  - Implement `generateQuestions()` method with concepts, distribution, and count parameters
  - _Requirements: 3.1_

- [x] 6.2 Implement question generation logic


  - Build prompt with extracted concepts and question requirements
  - Include distribution requirements in prompt (counts per type)
  - Execute prompt via task router with 'question-generation' task
  - Parse JSON array response
  - _Requirements: 3.1, 3.2, 3.7_

- [x] 6.3 Implement question format validation


  - Create `validateQuestionFormat()` method for type-specific validation
  - Validate multiple choice: 4 options, correctAnswer 0-3
  - Validate true/false: boolean correctAnswer
  - Validate fill-in-blank: string correctAnswer, caseSensitive boolean
  - Validate matching: leftColumn, rightColumn, correctPairs arrays
  - Filter out invalid questions
  - _Requirements: 3.2, 3.3, 3.6_

- [x] 6.4 Implement distribution adjustment logic


  - Create `adjustDistribution()` method to handle mismatches
  - Count generated questions by type
  - If AI didn't generate enough of a type, redistribute to available types
  - Ensure minimum 1 question per requested type if possible
  - Log warnings when distribution can't be met exactly
  - _Requirements: 3.7_

- [x] 7. Implement quality validation agent




  - Create agent to evaluate question quality
  - Score questions across four criteria
  - Identify questions needing improvement
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7.1 Create quality validation agent class


  - Create `backend/src/services/agents/quality-validation-agent.js`
  - Initialize with task router and prompt manager dependencies
  - Implement `validateQuestion()` method for single question validation
  - Implement `validateBatch()` method for parallel validation
  - _Requirements: 4.1_

- [x] 7.2 Implement question validation logic

  - Build validation prompt with question details
  - Execute prompt via task router with 'quality-validation' task
  - Parse JSON response with scores and feedback
  - Calculate overall score and grade
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7.3 Implement batch validation

  - Process multiple questions in parallel using Promise.all()
  - Limit concurrency to avoid rate limits (max 5 concurrent)
  - Aggregate validation results
  - Identify questions with score < 70 for improvement
  - _Requirements: 4.4_

- [x] 7.4 Add validation result parsing

  - Parse clarity, correctness, distractorQuality, educationalValue scores
  - Extract issues and suggestions arrays
  - Set passesQuality flag based on score threshold (>= 70)
  - Set requiresImprovement flag for low scores
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 8. Implement question improvement agent


  - Create agent to improve low-quality questions
  - Apply validation feedback to enhance questions
  - Track improvements made
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 8.1 Create question improvement agent class


  - Create `backend/src/services/agents/question-improvement-agent.js`
  - Initialize with task router and prompt manager dependencies
  - Implement `improveQuestion()` method for single question improvement
  - Implement `improveBatch()` method for parallel improvement
  - _Requirements: 5.1_



- [x] 8.2 Implement question improvement logic
  - Build improvement prompt with original question and validation feedback
  - Include specific issues and suggestions from validation
  - Execute prompt via task router with 'question-improvement' task

  - Parse improved question from JSON response
  - _Requirements: 5.1, 5.2, 5.3, 5.4_


- [x] 8.3 Implement batch improvement
  - Process multiple questions in parallel using Promise.all()

  - Pair each question with its validation feedback
  - Limit concurrency to avoid rate limits (max 5 concurrent)
  - Track which questions were improved

  - _Requirements: 5.6_

- [x] 8.4 Add improvement tracking


  - Parse improvements array from response
  - Parse changesSummary and expectedScore
  - Log all improvements made for monitoring
  - Validate improved question format matches original type
  - _Requirements: 5.5, 5.6_

- [x] 9. Implement agentic pipeline orchestrator




  - Create orchestrator to coordinate all agents
  - Implement full quiz generation workflow
  - Handle errors and edge cases
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 9.1 Create pipeline orchestrator class


  - Create `backend/src/services/agentic-pipeline.js`
  - Initialize with all agent instances and configuration
  - Implement `generateQuiz()` method as main entry point
  - _Requirements: 9.1, 9.5_

- [x] 9.2 Implement quiz generation workflow


  - Step 1: Call content extraction agent with raw content
  - Step 2: Call question generation agent with concepts and distribution
  - Step 3: Call quality validation agent to evaluate all questions
  - Step 4: Identify low-quality questions (score < 70)
  - Step 5: Call question improvement agent for low-quality questions
  - Step 6: Merge improved questions back into final set
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 9.3 Implement question merging logic


  - Create `mergeFinalQuestions()` method
  - Replace low-quality questions with improved versions
  - Ensure all final questions meet minimum threshold (score >= 70)
  - Maintain requested question distribution
  - Return final validated question array
  - _Requirements: 9.5_

- [x] 9.4 Add pipeline error handling


  - Wrap each agent call in try-catch
  - Log errors with context (which agent, what input)
  - Provide fallback behavior (use original questions if improvement fails)
  - Throw clear error if critical steps fail (extraction, generation)
  - _Requirements: 9.5_

- [x] 10. Integrate agentic pipeline with existing quiz API




  - Update quiz creation endpoint to use agentic pipeline
  - Add feature flag for gradual rollout
  - Maintain backward compatibility
  - _Requirements: 9.5, 9.6_

- [x] 10.1 Add feature flag configuration


  - Add ENABLE_AGENTIC_PIPELINE environment variable to .env
  - Add ENABLE_QUALITY_VALIDATION environment variable
  - Add ENABLE_QUESTION_IMPROVEMENT environment variable
  - Default all to false for safe rollout
  - _Requirements: 9.6_

- [x] 10.2 Update quiz creation endpoint


  - Modify `backend/src/routes/quiz.routes.js` POST /api/quizzes endpoint
  - Check ENABLE_AGENTIC_PIPELINE feature flag
  - If enabled, use agentic pipeline instead of direct generateQuestions()
  - If disabled, use existing quiz.utils.js generateQuestions()
  - Ensure response format remains the same
  - _Requirements: 9.5, 9.6_

- [x] 10.3 Initialize agentic pipeline in server startup


  - Create pipeline instance in `backend/src/server.js` or main app file
  - Initialize all agents with task router and prompt manager
  - Make pipeline available to routes
  - Add startup validation (check configs load correctly)
  - _Requirements: 9.5_

- [x] 10.4 Add backward compatibility layer


  - Ensure agentic pipeline returns same question format as existing system
  - Map agent output to existing database schema
  - Handle all four question types consistently
  - Test with existing frontend components
  - _Requirements: 9.6_

- [x] 11. Add comprehensive logging and monitoring





  - Implement structured logging for all AI operations
  - Track usage statistics and costs
  - Add admin endpoint for monitoring
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_


- [x] 11.1 Implement usage tracking

  - Create `backend/src/services/usage-tracker.js` service
  - Track requests per provider with timestamps
  - Track token usage per request
  - Calculate estimated costs based on provider pricing
  - Store in-memory with periodic persistence
  - _Requirements: 11.1, 11.2, 11.3_



- [x] 11.2 Add structured logging

  - Use consistent log format: [timestamp] [level] [component] message {data}
  - Log all AI requests: task, provider, duration, tokens, success/failure
  - Log fallback events with reason
  - Log validation failures with question details
  - Log improvement actions with before/after scores
  - _Requirements: 11.1, 7.3_


- [x] 11.3 Create admin monitoring endpoint

  - Add GET /api/admin/ai-usage endpoint
  - Return usage statistics: requests per provider, success rates, avg response times
  - Return cost estimates per provider
  - Return quality metrics: avg validation scores, improvement rates
  - Require admin authentication
  - _Requirements: 11.5_




- [x] 11.4 Add rate limit warnings





  - Monitor request counts against known free tier limits
  - Log warning when approaching 80% of limit
  - Log error when limit exceeded
  - Include limit info in admin endpoint
  - _Requirements: 11.4_

- [x] 12. Create comprehensive test suite




  - Write unit tests for all components
  - Write integration tests for pipeline
  - Write end-to-end tests for quiz generation
  - _Requirements: All requirements_

- [x] 12.1 Write unit tests for task router






  - Test provider selection logic
  - Test fallback mechanism with mocked providers
  - Test retry with exponential backoff
  - Test timeout handling
  - Mock all AI provider responses
  - _Requirements: 1.4, 1.5, 7.1, 7.4, 7.5_

- [x] 12.2 Write unit tests for AI provider adapters






  - Test OpenRouter adapter with mocked API
  - Test Gemini adapter with mocked API
  - Test Ollama adapter with mocked API
  - Test error handling for each provider
  - Test response parsing and standardization
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

- [x] 12.3 Write unit tests for agents






  - Test content extraction agent with mocked task router
  - Test question generation agent with mocked task router
  - Test quality validation agent with mocked task router
  - Test question improvement agent with mocked task router
  - Test validation logic for each agent
  - _Requirements: 2.1-2.6, 3.1-3.7, 4.1-4.5, 5.1-5.6_

- [x] 12.4 Write integration tests for pipeline







  - Test full quiz generation flow with test providers
  - Test with different question distributions
  - Test error recovery (agent failures)
  - Test quality improvement workflow
  - Use real config files but test AI providers
  - _Requirements: 9.1-9.5_

- [ ]* 12.5 Write end-to-end tests
  - Test quiz creation API with agentic pipeline enabled
  - Test with real content samples
  - Validate final question quality
  - Test feature flag toggling
  - Compare output with baseline (existing system)
  - _Requirements: 9.5, 9.6, 10.1-10.4_

- [ ] 13. Create documentation and deployment guide
  - Document configuration options
  - Create setup guide for different environments
  - Document monitoring and troubleshooting
  - _Requirements: All requirements_

- [ ] 13.1 Create configuration documentation
  - Document all config file options in README
  - Provide example configs for different scenarios (dev, prod, cost-optimized)
  - Document environment variables
  - Document provider setup (API keys, Ollama installation)
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 13.2 Create deployment guide
  - Document phased rollout strategy
  - Document feature flag usage
  - Document monitoring setup
  - Document troubleshooting common issues
  - _Requirements: All requirements_

- [ ] 13.3 Create API documentation
  - Document admin monitoring endpoint
  - Document usage statistics format
  - Document error responses
  - Update existing quiz API documentation
  - _Requirements: 11.5_
