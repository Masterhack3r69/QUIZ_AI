# Agentic Pipeline Integration

## Overview

The agentic pipeline has been integrated with the existing quiz API, allowing for gradual rollout and backward compatibility. The system uses feature flags to control when the agentic pipeline is used versus the traditional question generation approach.

## Feature Flags

Three environment variables control the agentic pipeline behavior:

### `ENABLE_AGENTIC_PIPELINE`
- **Default**: `false`
- **Description**: Master switch for the agentic pipeline. When `false`, the system uses traditional question generation.
- **Values**: `true` | `false`

### `ENABLE_QUALITY_VALIDATION`
- **Default**: `false`
- **Description**: Enables quality validation of generated questions. Only applies when agentic pipeline is enabled.
- **Values**: `true` | `false`

### `ENABLE_QUESTION_IMPROVEMENT`
- **Default**: `false`
- **Description**: Enables automatic improvement of low-quality questions. Only applies when agentic pipeline is enabled.
- **Values**: `true` | `false`

### `AI_TASK_CONFIG`
- **Default**: `development`
- **Description**: Specifies which AI task configuration to use.
- **Values**: `development` | `production`

## Configuration Files

The agentic pipeline uses configuration files to determine which AI providers to use for each task:

- `backend/config/ai-tasks.development.json` - Uses free providers (Ollama primary, OpenRouter/Gemini fallback)
- `backend/config/ai-tasks.production.json` - Uses optimized providers (OpenRouter primary, Gemini/Ollama fallback)

## Usage

### Enable Agentic Pipeline (Basic)

```bash
# In .env file
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=false
ENABLE_QUESTION_IMPROVEMENT=false
```

This enables the agentic pipeline for question generation but skips quality validation and improvement steps.

### Enable Full Agentic Pipeline

```bash
# In .env file
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=true
```

This enables all agentic features including quality validation and automatic question improvement.

### Disable Agentic Pipeline (Traditional Mode)

```bash
# In .env file
ENABLE_AGENTIC_PIPELINE=false
```

This uses the traditional question generation approach (existing system).

## Rollout Strategy

### Phase 1: Testing (Development)
```bash
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=false
ENABLE_QUESTION_IMPROVEMENT=false
AI_TASK_CONFIG=development
```

Test basic agentic pipeline functionality with free providers.

### Phase 2: Quality Testing
```bash
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=false
AI_TASK_CONFIG=development
```

Test quality validation without automatic improvements.

### Phase 3: Full Testing
```bash
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=true
AI_TASK_CONFIG=development
```

Test complete agentic pipeline with all features.

### Phase 4: Production Rollout
```bash
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=true
AI_TASK_CONFIG=production
```

Deploy to production with optimized provider configuration.

## Backward Compatibility

The integration maintains full backward compatibility:

1. **Same API Interface**: All quiz creation endpoints work exactly the same way
2. **Same Response Format**: Questions are returned in the same format regardless of which system generates them
3. **Automatic Fallback**: If the agentic pipeline fails, the system automatically falls back to traditional generation
4. **Database Schema**: No changes to the database schema are required

## Affected Endpoints

The following endpoints now support agentic pipeline:

- `POST /api/quiz/test-create` - Test quiz creation (no auth)
- `POST /api/quiz/generate-questions` - Generate questions from content
- `POST /api/quiz/create` - Create quiz (main endpoint)

## How It Works

1. **Request Received**: Quiz creation endpoint receives content and distribution
2. **Feature Flag Check**: System checks `ENABLE_AGENTIC_PIPELINE` environment variable
3. **Pipeline Selection**:
   - If enabled and pipeline available: Use agentic pipeline
   - If disabled or pipeline unavailable: Use traditional generation
4. **Question Generation**:
   - Agentic: Multi-agent workflow (extraction → generation → validation → improvement)
   - Traditional: Direct AI generation with Gemini
5. **Format Conversion**: Agentic results are converted to match existing format
6. **Response**: Questions returned in standard format

## Monitoring

The system logs all pipeline decisions and operations:

```
[Quiz Routes] Using agentic pipeline for question generation
[AgenticCompatibility] Generating questions with agentic pipeline
[AgenticCompatibility] Questions generated successfully
```

Or when using traditional generation:

```
[Quiz Routes] Using traditional question generation
```

## Error Handling

The system includes multiple layers of error handling:

1. **Pipeline Initialization**: If pipeline fails to initialize, system logs error and continues with traditional generation
2. **Question Generation**: If agentic generation fails, system automatically falls back to traditional generation
3. **Format Conversion**: Invalid questions are filtered out during conversion
4. **Validation**: Distribution mismatches are logged but don't cause failures

## Testing

Run the integration tests:

```bash
cd backend
npm test -- agentic-integration.test.js
```

Tests cover:
- Format conversion from agentic to quiz format
- All question types (multiple choice, true/false, fill-in-blank, matching)
- Invalid question filtering
- Distribution validation
- Fallback behavior
- Error handling

## Performance Considerations

- **Agentic Pipeline**: Slower but higher quality (multi-agent workflow)
- **Traditional Generation**: Faster but simpler (single AI call)
- **Quality Validation**: Adds ~2-5 seconds per batch of questions
- **Question Improvement**: Adds ~3-7 seconds per low-quality question

## Cost Considerations

- **Development Config**: Uses free providers (Ollama, OpenRouter free tier)
- **Production Config**: May use paid providers for better quality
- **Quality Validation**: Additional AI calls increase cost
- **Question Improvement**: Additional AI calls increase cost

## Troubleshooting

### Pipeline Not Initializing

Check logs for initialization errors:
```
[Server] Failed to initialize Agentic Pipeline: <error message>
```

Common causes:
- Missing configuration files
- Invalid AI provider credentials
- Network issues with AI providers

### Questions Not Generated

Check if pipeline is enabled:
```bash
echo $ENABLE_AGENTIC_PIPELINE
```

Check logs for generation errors:
```
[AgenticCompatibility] Agentic generation failed, using fallback: <error>
```

### Distribution Mismatch

Check logs for distribution warnings:
```
[AgenticCompatibility] Distribution mismatch
```

This is non-critical - the system will use the closest possible distribution.

## Future Enhancements

- [ ] A/B testing framework to compare agentic vs traditional quality
- [ ] Admin UI for toggling feature flags
- [ ] Real-time monitoring dashboard
- [ ] Cost tracking and optimization
- [ ] Caching layer for repeated content
- [ ] Custom quality thresholds per teacher
