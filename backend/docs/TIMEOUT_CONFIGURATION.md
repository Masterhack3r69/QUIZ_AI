# Timeout Configuration

## Overview

The system has been configured with extended timeouts to accommodate free AI models that may have slower response times. The GitHub Models API provides access to powerful models but with rate limits and potentially slower response times for free tier usage.

## Timeout Settings

### 1. AI Task Router (`backend/config/ai-tasks.development.json`)

| Task | Timeout | Reason |
|------|---------|--------|
| content-extraction | 120s (2 min) | Analyzing large content and extracting concepts |
| question-generation | 180s (3 min) | Generating multiple questions with detailed options |
| quality-validation | 120s (2 min) | Evaluating question quality with detailed feedback |
| question-improvement | 120s (2 min) | Improving low-quality questions |
| analytics | 120s (2 min) | Analyzing quiz performance data |

### 2. GitHub Provider (`backend/src/services/ai-providers/github-provider.js`)

- **Default timeout**: 180s (3 minutes)
- **Reason**: Free models may have slower response times, especially for complex prompts

### 3. Express Server (`backend/src/server.js`)

- **Server timeout**: 300s (5 minutes)
- **Keep-alive timeout**: 310s
- **Headers timeout**: 320s
- **Reason**: Allow enough time for complete quiz generation pipeline (15 questions with validation)

### 4. Test Scripts (`backend/scripts/test-ai-agent-live.js`)

- **Axios timeout**: 300s (5 minutes)
- **Reason**: Match server timeout for end-to-end testing

## Why Extended Timeouts?

### Free Model Characteristics

The GitHub Models API (free tier) has:
- **Large context window**: 1049k input tokens, 33k output tokens
- **Rate limits**: 2 concurrent requests per user
- **Slower response times**: Free models may be throttled or queued

### Pipeline Complexity

A full quiz generation with 15 questions involves:
1. **Content Extraction**: ~6-10 seconds
2. **Question Generation**: ~10-15 seconds (for 15 questions)
3. **Quality Validation**: ~5-8 seconds per question × 15 = 75-120 seconds
4. **Question Improvement**: ~10-15 seconds per low-quality question

**Total estimated time**: 2-4 minutes for 15 questions with full validation

## Rate Limiting

The GitHub provider has rate limits:
- **Concurrent requests**: 2 per user
- **Behavior**: Additional requests are queued and retried after 1 second

The quality validation agent processes questions in batches of 5 but respects the 2-concurrent-request limit, so some requests will be queued.

## Recommendations

### For Development
- Use smaller question counts (3-5) for faster testing
- Disable quality validation/improvement for quick iterations
- Current settings are appropriate

### For Production
- Consider upgrading to paid tier for faster response times
- Implement request queuing and progress indicators
- Add WebSocket support for real-time progress updates
- Cache frequently used content extractions

### Optimization Tips

1. **Reduce question count**: Generate 5-10 questions instead of 15
2. **Disable validation**: Set `ENABLE_QUALITY_VALIDATION=false` for faster generation
3. **Batch processing**: Process multiple quizzes in parallel (respecting rate limits)
4. **Caching**: Cache concept extractions for similar content

## Monitoring

Watch for these timeout-related issues:

```bash
# Check server logs for timeout errors
grep "timeout" backend/logs/*.log

# Monitor AI task execution times
grep "executionTime" backend/logs/*.log

# Check rate limit warnings
grep "rate limit" backend/logs/*.log
```

## Configuration Files

All timeout settings are centralized in:
- `backend/config/ai-tasks.development.json` - Task-specific timeouts
- `backend/src/services/ai-providers/github-provider.js` - Provider default timeout
- `backend/src/server.js` - Server-level timeouts
- `backend/scripts/test-ai-agent-live.js` - Test script timeout

## Testing

To test with current timeout settings:

```bash
# Small quiz (3 questions) - ~20-30 seconds
node src/examples/test-small-quiz.js

# Full quiz (15 questions) - ~2-4 minutes
node scripts/test-ai-agent-live.js
```

## Troubleshooting

### If requests still timeout:

1. **Check rate limits**: You may be hitting concurrent request limits
2. **Increase timeouts further**: Edit `ai-tasks.development.json`
3. **Reduce question count**: Generate fewer questions per quiz
4. **Disable validation**: Turn off quality validation temporarily
5. **Check network**: Ensure stable connection to GitHub Models API

### Error Messages

- `"Request timeout"` - Increase timeout in task configuration
- `"Rate limit exceeded"` - Wait before retrying or reduce concurrent requests
- `"ETIMEDOUT"` - Network issue or API unavailable
