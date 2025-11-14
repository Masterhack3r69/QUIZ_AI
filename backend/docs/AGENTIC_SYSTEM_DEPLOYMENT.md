# Multi-AI Agentic System Deployment Guide

## Overview

This guide covers deploying the multi-AI agentic quiz generation system from development to production, including phased rollout strategies, feature flag management, monitoring setup, and troubleshooting.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Phased Rollout Strategy](#phased-rollout-strategy)
4. [Feature Flag Management](#feature-flag-management)
5. [Monitoring Setup](#monitoring-setup)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### 1. Configuration Files

Ensure all required configuration files exist:

```bash
backend/config/
├── ai-tasks.development.json    ✓
├── ai-tasks.production.json     ✓
├── ai-prompts.json              ✓
└── ai-tasks.testing.json        ✓ (optional)
```

### 2. Environment Variables

Verify all required environment variables are set:

```bash
# Required
✓ MONGODB_URI
✓ JWT_SECRET
✓ NODE_ENV
✓ PORT
✓ FRONTEND_URL

# Agentic Pipeline
✓ AI_TASK_CONFIG
✓ ENABLE_AGENTIC_PIPELINE
✓ ENABLE_QUALITY_VALIDATION
✓ ENABLE_QUESTION_IMPROVEMENT

# AI Providers (at least one required)
✓ GEMINI_API_KEY (recommended)
✓ OPENROUTER_API_KEY (optional)
✓ OLLAMA_BASE_URL (optional, for local)
```

### 3. Dependencies

Install and verify all dependencies:

```bash
cd backend
pnpm install

# Verify critical packages
pnpm list | grep -E "(express|mongoose|@google/generative-ai)"
```

### 4. Database

Ensure MongoDB is accessible and properly configured:

```bash
# Test connection
mongosh $MONGODB_URI --eval "db.adminCommand('ping')"

# Verify collections exist
mongosh $MONGODB_URI --eval "db.getCollectionNames()"
```

### 5. AI Provider Access

Test each configured AI provider:

```bash
# Test Gemini
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

# Test OpenRouter
curl -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"meta-llama/llama-3.2-3b-instruct:free","messages":[{"role":"user","content":"Hello"}]}'

# Test Ollama (if using)
curl http://localhost:11434/api/tags
```

### 6. Run Tests

Execute the test suite to verify functionality:

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# Specific agentic system tests
pnpm test -- --grep "agentic"
```

---

## Environment Setup

### Development Environment

**Purpose:** Local development and testing

**Configuration:**

```bash
# .env.development
NODE_ENV=development
AI_TASK_CONFIG=development
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=true

# Use Ollama for free local testing
OLLAMA_BASE_URL=http://localhost:11434

# Optional: Add API keys for fallback
GEMINI_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
```

**Setup Steps:**

1. Install Ollama locally
2. Pull required models: `ollama pull llama3.2:3b`
3. Start backend: `pnpm dev`
4. Test with sample content

### Staging Environment

**Purpose:** Pre-production testing with production-like configuration

**Configuration:**

```bash
# .env.staging
NODE_ENV=production
AI_TASK_CONFIG=production
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=true

# Use API providers (no Ollama)
GEMINI_API_KEY=your_staging_key
OPENROUTER_API_KEY=your_staging_key

# Staging database
MONGODB_URI=mongodb://staging-db:27017/quiz_ai
```

**Setup Steps:**

1. Deploy to staging server
2. Configure environment variables
3. Run smoke tests
4. Monitor logs for errors
5. Test with real content samples

### Production Environment

**Purpose:** Live system serving real users

**Configuration:**

```bash
# .env.production
NODE_ENV=production
AI_TASK_CONFIG=production
ENABLE_AGENTIC_PIPELINE=false  # Start disabled
ENABLE_QUALITY_VALIDATION=false
ENABLE_QUESTION_IMPROVEMENT=false

# Production API keys
GEMINI_API_KEY=your_production_key
OPENROUTER_API_KEY=your_production_key

# Production database
MONGODB_URI=mongodb://prod-db:27017/quiz_ai

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

**Setup Steps:**

1. Deploy application
2. Configure environment variables
3. Verify health checks pass
4. Keep agentic pipeline disabled initially
5. Follow phased rollout plan

---

## Phased Rollout Strategy

### Phase 1: Infrastructure Validation (Week 1)

**Goal:** Verify all components work in production without affecting users

**Steps:**

1. **Deploy with Feature Flags Disabled**
   ```bash
   ENABLE_AGENTIC_PIPELINE=false
   ```

2. **Verify Deployment**
   - Check application starts successfully
   - Verify existing quiz generation still works
   - Monitor error logs
   - Test health endpoints

3. **Test Provider Connectivity**
   ```bash
   # Use admin endpoint to test providers
   curl -X POST http://your-domain/api/admin/test-providers \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

4. **Success Criteria**
   - ✓ Application runs stable for 24 hours
   - ✓ No increase in error rates
   - ✓ All AI providers accessible
   - ✓ Existing functionality unaffected

### Phase 2: Internal Testing (Week 2)

**Goal:** Enable agentic pipeline for internal testing only

**Steps:**

1. **Enable for Admin Users**
   ```javascript
   // In quiz.routes.js
   const useAgenticPipeline = 
     process.env.ENABLE_AGENTIC_PIPELINE === 'true' && 
     (req.user.role === 'admin' || req.user.email.endsWith('@yourdomain.com'));
   ```

2. **Create Test Quizzes**
   - Generate 10-20 quizzes with various content types
   - Compare quality with baseline system
   - Measure response times
   - Check for errors

3. **Collect Feedback**
   - Question quality assessment
   - Response time acceptability
   - Any errors or issues
   - Feature completeness

4. **Success Criteria**
   - ✓ 90%+ of generated questions pass quality threshold
   - ✓ Response time < 60 seconds for typical quiz
   - ✓ Zero critical errors
   - ✓ Positive feedback from internal users

### Phase 3: Canary Deployment (Week 3)

**Goal:** Enable for 10% of production traffic

**Steps:**

1. **Implement Percentage-Based Rollout**
   ```javascript
   // In quiz.routes.js
   const useAgenticPipeline = 
     process.env.ENABLE_AGENTIC_PIPELINE === 'true' && 
     Math.random() < 0.10; // 10% of requests
   ```

2. **Monitor Key Metrics**
   - Success rate (target: >95%)
   - Average response time (target: <60s)
   - Error rate (target: <2%)
   - Quality scores (target: >70)

3. **A/B Comparison**
   - Compare agentic vs baseline quality
   - Measure user satisfaction
   - Track completion rates
   - Monitor performance

4. **Success Criteria**
   - ✓ Error rate < 2%
   - ✓ Quality scores ≥ baseline
   - ✓ No user complaints
   - ✓ Performance acceptable

### Phase 4: Gradual Increase (Week 4)

**Goal:** Increase to 50% of traffic

**Steps:**

1. **Increase Rollout Percentage**
   ```javascript
   const rolloutPercentage = parseFloat(process.env.AGENTIC_ROLLOUT_PERCENTAGE || '0.50');
   const useAgenticPipeline = 
     process.env.ENABLE_AGENTIC_PIPELINE === 'true' && 
     Math.random() < rolloutPercentage;
   ```

2. **Monitor at Scale**
   - Track API usage and costs
   - Monitor rate limits
   - Check fallback frequency
   - Measure quality consistency

3. **Optimize Configuration**
   - Adjust timeouts if needed
   - Fine-tune provider selection
   - Optimize retry logic
   - Update prompts based on feedback

4. **Success Criteria**
   - ✓ Stable performance at 50% traffic
   - ✓ Costs within budget
   - ✓ Quality maintained
   - ✓ No scalability issues

### Phase 5: Full Rollout (Week 5)

**Goal:** Enable for 100% of traffic

**Steps:**

1. **Enable Fully**
   ```bash
   ENABLE_AGENTIC_PIPELINE=true
   ENABLE_QUALITY_VALIDATION=true
   ENABLE_QUESTION_IMPROVEMENT=true
   AGENTIC_ROLLOUT_PERCENTAGE=1.0
   ```

2. **Monitor Closely**
   - Watch for any issues at full scale
   - Track all metrics continuously
   - Be ready for quick rollback
   - Collect user feedback

3. **Optimize Performance**
   - Identify bottlenecks
   - Optimize slow operations
   - Reduce unnecessary API calls
   - Improve caching

4. **Success Criteria**
   - ✓ System stable at 100% traffic
   - ✓ All metrics within targets
   - ✓ Positive user feedback
   - ✓ Cost-effective operation

---

## Feature Flag Management

### Available Feature Flags

#### 1. ENABLE_AGENTIC_PIPELINE

**Purpose:** Master switch for entire agentic system

**Values:**
- `true` - Use agentic pipeline for quiz generation
- `false` - Use legacy single-AI system

**When to Enable:**
- After successful testing
- When all providers are configured
- When monitoring is in place

**When to Disable:**
- During incidents
- If quality degrades
- If costs exceed budget
- For emergency rollback

#### 2. ENABLE_QUALITY_VALIDATION

**Purpose:** Control question quality validation step

**Values:**
- `true` - Validate all generated questions
- `false` - Skip validation (faster but lower quality)

**Impact:**
- Enabled: +10-15s per quiz, higher quality
- Disabled: Faster generation, may include low-quality questions

**Use Cases:**
- Enable: Production, quality-critical scenarios
- Disable: Development, speed testing, cost optimization

#### 3. ENABLE_QUESTION_IMPROVEMENT

**Purpose:** Control automatic question improvement

**Values:**
- `true` - Improve low-quality questions automatically
- `false` - Use questions as-is from generation

**Impact:**
- Enabled: +15-20s for quizzes with low-quality questions
- Disabled: Faster but may include subpar questions

**Use Cases:**
- Enable: Production, quality-critical scenarios
- Disable: When speed is priority, cost optimization

### Dynamic Feature Flags

For more granular control, implement dynamic flags:

```javascript
// backend/src/config/feature-flags.js
class FeatureFlags {
  constructor() {
    this.flags = {
      agenticPipeline: {
        enabled: process.env.ENABLE_AGENTIC_PIPELINE === 'true',
        rolloutPercentage: parseFloat(process.env.AGENTIC_ROLLOUT_PERCENTAGE || '1.0'),
        enabledForRoles: ['admin', 'teacher'],
        enabledForEmails: [] // Specific email whitelist
      },
      qualityValidation: {
        enabled: process.env.ENABLE_QUALITY_VALIDATION === 'true',
        threshold: parseInt(process.env.QUALITY_THRESHOLD || '70')
      },
      questionImprovement: {
        enabled: process.env.ENABLE_QUESTION_IMPROVEMENT === 'true',
        maxImprovements: parseInt(process.env.MAX_IMPROVEMENTS || '5')
      }
    };
  }

  isEnabled(flagName, context = {}) {
    const flag = this.flags[flagName];
    if (!flag || !flag.enabled) return false;

    // Check rollout percentage
    if (flag.rolloutPercentage && Math.random() > flag.rolloutPercentage) {
      return false;
    }

    // Check role-based access
    if (flag.enabledForRoles && context.user) {
      if (!flag.enabledForRoles.includes(context.user.role)) {
        return false;
      }
    }

    // Check email whitelist
    if (flag.enabledForEmails && flag.enabledForEmails.length > 0) {
      if (!flag.enabledForEmails.includes(context.user?.email)) {
        return false;
      }
    }

    return true;
  }
}

module.exports = new FeatureFlags();
```

### Feature Flag Best Practices

1. **Start Conservative**
   - Begin with flags disabled
   - Enable gradually
   - Monitor closely

2. **Document Changes**
   - Log when flags are toggled
   - Track who made changes
   - Note reasons for changes

3. **Test Both Paths**
   - Ensure system works with flags on/off
   - Test all combinations
   - Verify graceful degradation

4. **Clean Up**
   - Remove flags after full rollout
   - Simplify code once stable
   - Archive old implementations

---

## Monitoring Setup

### 1. Application Logging

Configure structured logging for the agentic system:

```javascript
// backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/agentic.log', level: 'info' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log AI requests
logger.logAIRequest = (taskName, provider, duration, success, metadata = {}) => {
  logger.info('AI Request', {
    type: 'ai_request',
    task: taskName,
    provider,
    duration,
    success,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

module.exports = logger;
```

### 2. Metrics Collection

Track key performance indicators:

```javascript
// backend/src/services/metrics-collector.js
class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: { total: 0, success: 0, failure: 0 },
      providers: {},
      tasks: {},
      responseTime: [],
      qualityScores: []
    };
  }

  recordRequest(taskName, provider, duration, success, qualityScore) {
    // Update counters
    this.metrics.requests.total++;
    if (success) this.metrics.requests.success++;
    else this.metrics.requests.failure++;

    // Track by provider
    if (!this.metrics.providers[provider]) {
      this.metrics.providers[provider] = { requests: 0, failures: 0, totalTime: 0 };
    }
    this.metrics.providers[provider].requests++;
    this.metrics.providers[provider].totalTime += duration;
    if (!success) this.metrics.providers[provider].failures++;

    // Track by task
    if (!this.metrics.tasks[taskName]) {
      this.metrics.tasks[taskName] = { requests: 0, avgTime: 0, avgQuality: 0 };
    }
    this.metrics.tasks[taskName].requests++;

    // Track response times
    this.metrics.responseTime.push(duration);
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime.shift(); // Keep last 1000
    }

    // Track quality scores
    if (qualityScore) {
      this.metrics.qualityScores.push(qualityScore);
      if (this.metrics.qualityScores.length > 1000) {
        this.metrics.qualityScores.shift();
      }
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: (this.metrics.requests.success / this.metrics.requests.total * 100).toFixed(2),
      avgResponseTime: this.calculateAverage(this.metrics.responseTime),
      avgQualityScore: this.calculateAverage(this.metrics.qualityScores),
      providerStats: this.calculateProviderStats()
    };
  }

  calculateAverage(arr) {
    if (arr.length === 0) return 0;
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
  }

  calculateProviderStats() {
    const stats = {};
    for (const [provider, data] of Object.entries(this.metrics.providers)) {
      stats[provider] = {
        requests: data.requests,
        failureRate: ((data.failures / data.requests) * 100).toFixed(2),
        avgResponseTime: (data.totalTime / data.requests).toFixed(2)
      };
    }
    return stats;
  }

  reset() {
    this.metrics = {
      requests: { total: 0, success: 0, failure: 0 },
      providers: {},
      tasks: {},
      responseTime: [],
      qualityScores: []
    };
  }
}

module.exports = new MetricsCollector();
```

### 3. Health Check Endpoint

Create endpoint to monitor system health:

```javascript
// backend/src/routes/health.routes.js
const express = require('express');
const router = express.Router();
const metricsCollector = require('../services/metrics-collector');
const AITaskRouter = require('../services/ai-task-router');

router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    agenticPipeline: {
      enabled: process.env.ENABLE_AGENTIC_PIPELINE === 'true',
      providers: await checkProviders(),
      metrics: metricsCollector.getMetrics()
    }
  };

  const isHealthy = health.agenticPipeline.providers.some(p => p.available);
  res.status(isHealthy ? 200 : 503).json(health);
});

async function checkProviders() {
  const taskRouter = new AITaskRouter();
  const providers = ['openrouter', 'gemini', 'ollama'];
  
  return Promise.all(providers.map(async (name) => {
    try {
      const provider = taskRouter.providers[name];
      const available = provider && await provider.isAvailable();
      return { name, available, error: null };
    } catch (error) {
      return { name, available: false, error: error.message };
    }
  }));
}

module.exports = router;
```

### 4. Monitoring Dashboard

Set up monitoring tools:

**Option A: Built-in Admin Dashboard**

Access at `/api/admin/ai-usage` (requires authentication)

**Option B: External Monitoring (Recommended)**

- **Grafana + Prometheus:** For metrics visualization
- **ELK Stack:** For log aggregation and analysis
- **Datadog/New Relic:** For comprehensive APM

**Key Metrics to Monitor:**

1. **Request Metrics**
   - Total requests per hour
   - Success rate (target: >95%)
   - Error rate (target: <5%)

2. **Performance Metrics**
   - Average response time (target: <60s)
   - P95 response time (target: <90s)
   - P99 response time (target: <120s)

3. **Quality Metrics**
   - Average quality score (target: >75)
   - Questions requiring improvement (target: <30%)
   - Validation pass rate (target: >70%)

4. **Provider Metrics**
   - Requests per provider
   - Fallback frequency
   - Provider failure rate
   - API costs per provider

5. **System Metrics**
   - CPU usage
   - Memory usage
   - Database connections
   - API rate limit status

### 5. Alerting Rules

Configure alerts for critical issues:

```yaml
# Example alert configuration
alerts:
  - name: High Error Rate
    condition: error_rate > 10%
    duration: 5m
    severity: critical
    action: notify_team, disable_feature_flag

  - name: Slow Response Time
    condition: avg_response_time > 90s
    duration: 10m
    severity: warning
    action: notify_team

  - name: Provider Unavailable
    condition: all_providers_down
    duration: 1m
    severity: critical
    action: notify_team, rollback

  - name: Low Quality Scores
    condition: avg_quality_score < 60
    duration: 15m
    severity: warning
    action: notify_team, review_prompts

  - name: Rate Limit Approaching
    condition: api_usage > 80% of limit
    duration: 5m
    severity: warning
    action: notify_team, switch_provider
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: High Error Rate After Deployment

**Symptoms:**
- Error rate >10%
- Many failed quiz generations
- User complaints

**Diagnosis:**
```bash
# Check logs
tail -f logs/error.log | grep "agentic"

# Check provider status
curl http://your-domain/api/health

# Review metrics
curl http://your-domain/api/admin/ai-usage
```

**Solutions:**
1. Verify all API keys are correct
2. Check provider rate limits
3. Increase timeouts if needed
4. Enable more fallback providers
5. Temporarily disable agentic pipeline

#### Issue 2: Slow Response Times

**Symptoms:**
- Quiz generation takes >2 minutes
- Users experiencing timeouts
- High P95/P99 latency

**Diagnosis:**
```bash
# Check which task is slow
grep "duration" logs/agentic.log | sort -k5 -n

# Check provider response times
curl http://your-domain/api/admin/ai-usage | jq '.providerStats'
```

**Solutions:**
1. Switch to faster models (Gemini Flash)
2. Reduce timeout values
3. Disable question improvement temporarily
4. Use local Ollama for some tasks
5. Optimize prompts to be more concise

#### Issue 3: Low Quality Scores

**Symptoms:**
- Average quality score <60
- Many questions requiring improvement
- Teacher complaints about question quality

**Diagnosis:**
```bash
# Check quality distribution
grep "quality_score" logs/agentic.log | awk '{print $NF}' | sort -n

# Review failed validations
grep "requiresImprovement: true" logs/agentic.log
```

**Solutions:**
1. Review and improve prompts
2. Use higher-quality models
3. Adjust quality threshold
4. Enable question improvement
5. Add more examples to prompts

#### Issue 4: Provider Rate Limits

**Symptoms:**
- 429 errors in logs
- Frequent fallback to secondary providers
- Inconsistent performance

**Diagnosis:**
```bash
# Check rate limit errors
grep "rate limit" logs/error.log

# Check provider usage
curl http://your-domain/api/admin/ai-usage | jq '.providers'
```

**Solutions:**
1. Distribute load across multiple providers
2. Implement request queuing
3. Add delays between requests
4. Upgrade to paid tier if needed
5. Use local Ollama for high-volume tasks

#### Issue 5: Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Application crashes
- Slow performance

**Diagnosis:**
```bash
# Monitor memory
watch -n 5 'curl http://your-domain/api/health | jq .memory'

# Check for memory leaks
node --inspect server.js
# Use Chrome DevTools to profile
```

**Solutions:**
1. Restart application periodically
2. Implement proper cleanup in agents
3. Limit concurrent requests
4. Clear caches regularly
5. Review for circular references

---

## Rollback Procedures

### Emergency Rollback

If critical issues occur, immediately disable the agentic pipeline:

**Step 1: Disable Feature Flag**
```bash
# Update environment variable
export ENABLE_AGENTIC_PIPELINE=false

# Or update .env file
echo "ENABLE_AGENTIC_PIPELINE=false" >> .env

# Restart application
pm2 restart quiz-backend
```

**Step 2: Verify Rollback**
```bash
# Check health endpoint
curl http://your-domain/api/health | jq '.agenticPipeline.enabled'
# Should return: false

# Test quiz generation
curl -X POST http://your-domain/api/quizzes \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"test content"}'
```

**Step 3: Monitor**
- Watch error rates return to normal
- Verify quiz generation works
- Check user reports

### Partial Rollback

If only specific features are problematic:

**Disable Quality Validation Only:**
```bash
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=false
ENABLE_QUESTION_IMPROVEMENT=false
```

**Disable Question Improvement Only:**
```bash
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=false
```

### Gradual Rollback

Reduce rollout percentage instead of full disable:

```bash
# Reduce to 50%
AGENTIC_ROLLOUT_PERCENTAGE=0.50

# Reduce to 10%
AGENTIC_ROLLOUT_PERCENTAGE=0.10

# Disable completely
AGENTIC_ROLLOUT_PERCENTAGE=0.0
```

---

## Post-Deployment

### Week 1: Close Monitoring

- Check metrics every 4 hours
- Review all error logs daily
- Collect user feedback
- Be ready for quick rollback

### Week 2-4: Optimization

- Analyze performance data
- Optimize slow operations
- Fine-tune prompts
- Adjust provider selection

### Month 2+: Maintenance

- Monthly performance reviews
- Quarterly prompt updates
- Regular cost analysis
- Continuous improvement

---

## Support and Resources

### Documentation
- [Configuration Guide](./AGENTIC_SYSTEM_CONFIGURATION.md)
- [API Documentation](./AGENTIC_SYSTEM_API.md)
- [Monitoring Guide](./AGENTIC_SYSTEM_MONITORING.md)

### Getting Help
- Check logs first: `logs/error.log`, `logs/agentic.log`
- Review metrics: `/api/admin/ai-usage`
- Test providers: `/api/health`
- Contact: dev-team@yourdomain.com

### Emergency Contacts
- On-call engineer: [phone/slack]
- DevOps team: [contact]
- Product owner: [contact]
