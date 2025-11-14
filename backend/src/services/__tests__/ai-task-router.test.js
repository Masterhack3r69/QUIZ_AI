/**
 * AI Task Router Tests
 * 
 * Tests for the task router service including provider selection,
 * fallback logic, retry mechanisms, and error handling.
 */

import aiTaskRouter from '../ai-task-router.js';

describe('AITaskRouter', () => {
  beforeAll(async () => {
    // Set environment to development for testing
    process.env.AI_TASK_CONFIG = 'development';
    
    // Initialize the router before tests
    await aiTaskRouter.initialize();
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      const stats = aiTaskRouter.getStatistics();
      
      expect(stats.initialized).toBe(true);
      expect(stats.tasks).toContain('content-extraction');
      expect(stats.tasks).toContain('question-generation');
      expect(stats.providers).toContain('openrouter');
      expect(stats.providers).toContain('gemini');
      expect(stats.providers).toContain('ollama');
    });

    test('should load task configurations', () => {
      const taskConfig = aiTaskRouter.getTaskConfig('content-extraction');
      
      expect(taskConfig).toBeDefined();
      expect(taskConfig.primary).toBeDefined();
      expect(Array.isArray(taskConfig.fallback)).toBe(true);
      expect(taskConfig.maxRetries).toBeGreaterThan(0);
      expect(taskConfig.timeout).toBeGreaterThan(0);
    });
  });

  describe('Task Execution', () => {
    test('should throw error for unknown task', async () => {
      await expect(
        aiTaskRouter.executeTask('unknown-task', 'test prompt')
      ).rejects.toThrow('Unknown task');
    });

    test('should throw error for unknown forced provider', async () => {
      await expect(
        aiTaskRouter.executeTask('content-extraction', 'test prompt', {
          forceProvider: 'unknown-provider'
        })
      ).rejects.toThrow('Unknown provider');
    });
  });

  describe('Retry Logic', () => {
    test('should not retry on authentication errors', () => {
      const authError = new Error('authentication failed');
      authError.name = 'AIProviderAuthError';
      
      const shouldNotRetry = aiTaskRouter.shouldNotRetry(authError);
      expect(shouldNotRetry).toBe(true);
    });

    test('should not retry on not found errors', () => {
      const notFoundError = new Error('model not found');
      notFoundError.name = 'AIProviderNotFoundError';
      
      const shouldNotRetry = aiTaskRouter.shouldNotRetry(notFoundError);
      expect(shouldNotRetry).toBe(true);
    });

    test('should retry on rate limit errors', () => {
      const rateLimitError = new Error('rate limit exceeded');
      rateLimitError.name = 'AIProviderRateLimitError';
      
      const shouldNotRetry = aiTaskRouter.shouldNotRetry(rateLimitError);
      expect(shouldNotRetry).toBe(false);
    });

    test('should retry on timeout errors', () => {
      const timeoutError = new Error('request timeout');
      timeoutError.name = 'AIProviderTimeoutError';
      
      const shouldNotRetry = aiTaskRouter.shouldNotRetry(timeoutError);
      expect(shouldNotRetry).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    test('sleep should delay execution', async () => {
      const startTime = Date.now();
      await aiTaskRouter.sleep(100);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    test('getStatistics should return router info', () => {
      const stats = aiTaskRouter.getStatistics();
      
      expect(stats).toHaveProperty('initialized');
      expect(stats).toHaveProperty('tasks');
      expect(stats).toHaveProperty('providers');
      expect(stats).toHaveProperty('availableProviders');
    });
  });
});
