# AI Provider Rate Limits

## Overview

The quiz generation system uses AI providers (GitHub Models, OpenAI, etc.) to generate and validate questions. These providers have rate limits to prevent abuse and ensure fair usage.

## Common Rate Limit Errors

### GitHub Models
```
Rate limit of 2 per 0s exceeded for UserConcurrentRequests. 
Please wait 0 seconds before retrying.
```

**Meaning**: GitHub Models limits concurrent requests to 2 at a time per user.

### OpenAI
```
Rate limit reached for requests
```

**Meaning**: You've exceeded your requests per minute (RPM) or tokens per minute (TPM) quota.

## How We Handle Rate Limits

### 1. Concurrency Control

The system processes AI requests in controlled batches:

```javascript
// Default concurrency: 2 concurrent requests
const concurrency = options.concurrency || 2;
```

**Agents with concurrency control:**
- Quality Validation Agent
- Question Improvement Agent

### 2. Batch Processing with Delays

Between batches, we add a 500ms delay to avoid hitting rate limits:

```javascript
// Process in batches
for (let i = 0; i < questions.length; i += concurrency) {
  const batch = questions.slice(i, i + concurrency);
  
  // Process batch in parallel
  const results = await Promise.all(
    batch.map(item => processItem(item))
  );
  
  // Wait 500ms before next batch
  if (i + concurrency < questions.length) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
```

### 3. Configurable Concurrency

You can adjust concurrency per request:

```javascript
// Lower concurrency for stricter rate limits
await agent.validateBatch(questions, {
  concurrency: 1  // Process one at a time
});

// Higher concurrency for generous rate limits
await agent.validateBatch(questions, {
  concurrency: 5  // Process 5 at a time
});
```

## Rate Limit Guidelines by Provider

### GitHub Models (Free Tier)
- **Concurrent Requests**: 2 per user
- **Recommended Concurrency**: 2
- **Recommended Delay**: 500ms between batches
- **Best For**: Development and testing

### OpenAI (Tier 1)
- **Requests Per Minute**: 500 RPM
- **Tokens Per Minute**: 30,000 TPM
- **Recommended Concurrency**: 5-10
- **Recommended Delay**: 100-200ms between batches
- **Best For**: Production with moderate usage

### OpenAI (Tier 2+)
- **Requests Per Minute**: 5,000+ RPM
- **Tokens Per Minute**: 450,000+ TPM
- **Recommended Concurrency**: 10-20
- **Recommended Delay**: None needed
- **Best For**: High-volume production

## Configuration

### Environment Variables

Set your preferred concurrency in the agentic pipeline:

```javascript
// backend/src/services/agentic-pipeline.js
const DEFAULT_CONCURRENCY = process.env.AI_CONCURRENCY || 2;
```

### Per-Request Override

```javascript
// In your quiz generation code
const result = await agenticPipeline.generateQuiz(content, {
  totalQuestions: 10,
  distribution: { multipleChoice: 8, trueFalse: 2 },
  concurrency: 3  // Override default
});
```

## Troubleshooting

### Still Getting Rate Limit Errors?

1. **Reduce Concurrency**
   ```javascript
   concurrency: 1  // Process one at a time
   ```

2. **Increase Delay Between Batches**
   ```javascript
   await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second
   ```

3. **Use Exponential Backoff**
   ```javascript
   let retries = 0;
   const maxRetries = 3;
   
   while (retries < maxRetries) {
     try {
       return await makeRequest();
     } catch (error) {
       if (error.message.includes('Rate limit')) {
         retries++;
         const delay = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
         await new Promise(resolve => setTimeout(resolve, delay));
       } else {
         throw error;
       }
     }
   }
   ```

4. **Switch to a Different Provider**
   ```javascript
   forceProvider: 'openai'  // Instead of 'github'
   ```

### Monitoring Rate Limits

Check the logs for rate limit information:

```bash
# Look for rate limit warnings
grep "Rate limit" backend/logs/*.log

# Monitor concurrent requests
grep "Processing batch" backend/logs/*.log
```

## Best Practices

1. **Start Conservative**: Use concurrency of 2 for new providers
2. **Monitor Logs**: Watch for rate limit errors in production
3. **Gradual Increase**: Slowly increase concurrency if no errors occur
4. **Provider Fallback**: Configure multiple providers for redundancy
5. **Cache Results**: Cache AI responses when possible to reduce requests

## Provider-Specific Notes

### GitHub Models
- Free tier has strict limits
- Best for development/testing
- Consider upgrading for production
- Rate limits reset every second

### OpenAI
- Tier-based rate limits
- Limits increase with usage history
- Monitor usage in OpenAI dashboard
- Consider batch API for large jobs

### Local Models (Ollama)
- No rate limits
- Limited by hardware
- Best for privacy-sensitive data
- Slower than cloud providers

## Future Improvements

- [ ] Automatic rate limit detection and adjustment
- [ ] Request queuing system
- [ ] Provider load balancing
- [ ] Rate limit metrics dashboard
- [ ] Adaptive concurrency based on error rates
