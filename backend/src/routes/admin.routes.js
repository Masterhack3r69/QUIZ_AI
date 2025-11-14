/**
 * Admin Routes
 * 
 * Administrative endpoints for monitoring and management.
 * Requires admin authentication.
 */

import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import usageTracker from '../services/usage-tracker.js';
import aiTaskRouter from '../services/ai-task-router.js';

const router = express.Router();

/**
 * GET /api/admin/ai-usage
 * 
 * Get AI provider usage statistics and monitoring data.
 * Requires admin authentication.
 * 
 * Query parameters:
 * - provider: Filter by specific provider (optional)
 * - taskName: Filter by specific task (optional)
 * - startDate: Start date for filtering (ISO string, optional)
 * - endDate: End date for filtering (ISO string, optional)
 */
router.get('/ai-usage', protect, async (req, res) => {
  try {
    // Parse query parameters
    const options = {};
    
    if (req.query.provider) {
      options.provider = req.query.provider;
    }
    
    if (req.query.taskName) {
      options.taskName = req.query.taskName;
    }
    
    if (req.query.startDate) {
      options.startDate = new Date(req.query.startDate);
    }
    
    if (req.query.endDate) {
      options.endDate = new Date(req.query.endDate);
    }

    // Get usage statistics
    const statistics = usageTracker.getStatistics(options);
    
    // Get rate limit warnings
    const rateLimitWarnings = usageTracker.getRateLimitWarnings();
    
    // Get router statistics
    const routerStats = aiTaskRouter.getStatistics();

    // Build response
    const response = {
      success: true,
      data: {
        // Overall statistics
        overview: {
          totalRequests: statistics.totalRequests,
          successfulRequests: statistics.successfulRequests,
          failedRequests: statistics.failedRequests,
          successRate: statistics.successRate,
          totalTokens: statistics.totalTokens,
          totalCost: statistics.totalCost,
          avgExecutionTime: statistics.avgExecutionTime
        },
        
        // Per-provider statistics
        providers: Object.entries(statistics.byProvider).map(([name, stats]) => ({
          name,
          requests: stats.requests,
          successfulRequests: stats.successfulRequests,
          failedRequests: stats.failedRequests,
          successRate: stats.requests > 0 
            ? Math.round((stats.successfulRequests / stats.requests) * 100 * 100) / 100 
            : 0,
          totalTokens: stats.totalTokens,
          totalCost: stats.totalCost,
          avgExecutionTime: Math.round(stats.avgExecutionTime * 100) / 100
        })),
        
        // Per-task statistics
        tasks: Object.entries(statistics.byTask).map(([name, stats]) => ({
          name,
          requests: stats.requests,
          successfulRequests: stats.successfulRequests,
          failedRequests: stats.failedRequests,
          successRate: stats.requests > 0 
            ? Math.round((stats.successfulRequests / stats.requests) * 100 * 100) / 100 
            : 0,
          totalTokens: stats.totalTokens,
          avgExecutionTime: Math.round(stats.avgExecutionTime * 100) / 100
        })),
        
        // Rate limit warnings
        rateLimits: {
          warnings: rateLimitWarnings,
          hasWarnings: rateLimitWarnings.length > 0,
          hasErrors: rateLimitWarnings.some(w => w.severity === 'error'),
          limits: usageTracker.getRateLimitInfo()
        },
        
        // Router configuration
        configuration: {
          initialized: routerStats.initialized,
          availableTasks: routerStats.tasks,
          configuredProviders: routerStats.providers,
          availableProviders: routerStats.availableProviders
        },
        
        // Metadata
        metadata: {
          queriedAt: new Date().toISOString(),
          filters: options
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('[AdminRoutes] Failed to get AI usage statistics', {
      error: error.message,
      errorType: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI usage statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/ai-usage/quality-metrics
 * 
 * Get quality-related metrics from the agentic pipeline.
 * Requires admin authentication.
 * 
 * Query parameters:
 * - startDate: Start date for filtering (ISO string, optional)
 * - endDate: End date for filtering (ISO string, optional)
 */
router.get('/ai-usage/quality-metrics', protect, async (req, res) => {
  try {
    // Parse query parameters
    const options = {};
    
    if (req.query.startDate) {
      options.startDate = new Date(req.query.startDate);
    }
    
    if (req.query.endDate) {
      options.endDate = new Date(req.query.endDate);
    }

    // Get validation task statistics
    const validationStats = usageTracker.getStatistics({
      ...options,
      taskName: 'quality-validation'
    });
    
    // Get improvement task statistics
    const improvementStats = usageTracker.getStatistics({
      ...options,
      taskName: 'question-improvement'
    });

    // Build response
    const response = {
      success: true,
      data: {
        validation: {
          totalValidations: validationStats.totalRequests,
          successfulValidations: validationStats.successfulRequests,
          failedValidations: validationStats.failedRequests,
          avgExecutionTime: validationStats.avgExecutionTime
        },
        improvement: {
          totalImprovements: improvementStats.totalRequests,
          successfulImprovements: improvementStats.successfulRequests,
          failedImprovements: improvementStats.failedRequests,
          avgExecutionTime: improvementStats.avgExecutionTime,
          improvementRate: validationStats.totalRequests > 0
            ? Math.round((improvementStats.totalRequests / validationStats.totalRequests) * 100 * 100) / 100
            : 0
        },
        metadata: {
          queriedAt: new Date().toISOString(),
          filters: options
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('[AdminRoutes] Failed to get quality metrics', {
      error: error.message,
      errorType: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quality metrics',
      error: error.message
    });
  }
});

/**
 * POST /api/admin/ai-usage/reset
 * 
 * Reset all usage statistics.
 * Requires admin authentication.
 * USE WITH CAUTION - This will delete all usage data.
 */
router.post('/ai-usage/reset', protect, async (req, res) => {
  try {
    await usageTracker.reset();

    res.json({
      success: true,
      message: 'Usage statistics reset successfully',
      resetAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AdminRoutes] Failed to reset usage statistics', {
      error: error.message,
      errorType: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Failed to reset usage statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/health
 * 
 * Health check endpoint for admin monitoring.
 * Requires admin authentication.
 */
router.get('/health', protect, async (req, res) => {
  try {
    const routerStats = aiTaskRouter.getStatistics();
    const rateLimitWarnings = usageTracker.getRateLimitWarnings();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        taskRouter: {
          status: routerStats.initialized ? 'operational' : 'not_initialized',
          availableProviders: routerStats.availableProviders.length,
          configuredProviders: routerStats.providers.length
        },
        usageTracker: {
          status: 'operational'
        }
      },
      alerts: rateLimitWarnings.filter(w => w.severity === 'error'),
      warnings: rateLimitWarnings.filter(w => w.severity === 'warning')
    };

    // Set status to degraded if there are errors
    if (health.alerts.length > 0) {
      health.status = 'degraded';
    }

    // Set status to unhealthy if task router not initialized
    if (!routerStats.initialized) {
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('[AdminRoutes] Health check failed', {
      error: error.message,
      errorType: error.name
    });

    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
