# Process Logging System

## Overview

The AI quiz generation pipeline includes a comprehensive logging system that displays the entire process from subject detection to final question generation with color-coded, structured output.

## Features

### ✅ Step-by-Step Logging
- Each pipeline step is clearly labeled and timed
- Progress indicators show current status
- Duration tracking for performance monitoring

### ✅ Color-Coded Output
- **Blue** - Headers and step titles
- **Green** - Success messages and high scores
- **Yellow** - Warnings and medium scores
- **Red** - Errors and low scores
- **Cyan** - Information and data
- **Magenta** - Results and summaries

### ✅ Detailed Information
- Subject detection results with confidence scores
- Content extraction statistics
- Question generation distribution
- Quality validation metrics
- Improvement tracking

### ✅ Verbose Mode
- Sample questions display
- Keyword scores breakdown
- Low-quality question details
- Improvement summaries

## Usage

### Basic Usage

```javascript
import ProcessLogger from './utils/process-logger.js';

const logger = new ProcessLogger({
  enabled: true,      // Enable/disable logging
  verbose: false      // Show detailed information
});

// Log header
logger.logHeader('My Process');

// Log step
logger.logStepStart(1, 'Step Name', 'Description...');
// ... do work ...
logger.logStepComplete({ result: 'data' });

// Log summary
logger.logSummary();
```

### With Agentic Pipeline

The agentic pipeline automatically uses the process logger:

```javascript
import AgenticPipeline from './services/agentic-pipeline.js';

const pipeline = new AgenticPipeline(null, {
  enableLogging: true,      // Enable process logging
  verboseLogging: true,     // Show detailed information
  enableSubjectDetection: true,
  enableQualityValidation: true,
  enableQuestionImprovement: true
});

const result = await pipeline.generateQuiz(content, {
  totalQuestions: 10,
  distribution: { multipleChoice: 8, trueFalse: 2 },
  difficulty: 'medium'
});
```

### Standalone Test

Run the complete process test to see logging in action:

```bash
cd backend
node src/examples/test-complete-process.js
```

## Log Output Example

```
================================================================================
  AI Question Generation Pipeline - Complete Process
================================================================================

━━━ Step 0: Subject Detection ━━━
Analyzing content to identify academic subject...

📊 Subject Detection Result:
   Subject: mathematics
   Confidence: 95%
   Method: keyword-analysis
   Recommended Prompt: math-question-generation

✓ Subject Detection completed in 2ms

━━━ Step 1: Content Extraction ━━━
Extracting key concepts, facts, and learning objectives...

ℹ Using subject context: This is MATHEMATICS content. Focus on problem-solving...

📝 Content Extraction Result:
   Main Topics: 3
   Key Concepts: 8
   Critical Facts: 5
   Learning Objectives: 4

✓ Content Extraction completed in 2.5s

━━━ Step 2: Question Generation ━━━
Generating questions using specialized prompt...

ℹ Using prompt: math-question-generation
ℹ Distribution: {"multipleChoice":8,"trueFalse":2}

❓ Question Generation Result:
   Prompt Used: math-question-generation
   Questions Generated: 10
   
   Distribution:
     multipleChoice       8 / 8 requested
     trueFalse           2 / 2 requested

✓ Question Generation completed in 5.2s

━━━ Step 3: Quality Validation ━━━
Validating question quality and identifying issues...

ℹ Validating 10 questions...

✅ Quality Validation Result:
   Questions Validated: 10
   Average Score: 87/100
   Pass Rate: 90%
   Questions Passing: 9 / 10
   
   Grade Distribution:
     excellent  ████████ 8
     good       █ 1
     fair       █ 1

✓ Quality Validation completed in 8.5s

━━━ Step 4: Question Improvement ━━━
Improving 1 low-quality questions...

ℹ Improving questions in batches...

🔧 Question Improvement Result:
   Questions Improved: 1
   Average Score Increase: +18 points

✓ Question Improvement completed in 3.2s

━━━ Step 5: Final Merging ━━━
Combining improved questions into final set...

ℹ Final question count: 10

✓ Final Merging completed in 5ms

================================================================================
  Process Summary
================================================================================

Total Duration: 19.4s

Steps Completed:
  1. Subject Detection              2ms (0.0%)
  2. Content Extraction             2.5s (12.9%)
  3. Question Generation            5.2s (26.8%)
  4. Quality Validation             8.5s (43.8%)
  5. Question Improvement           3.2s (16.5%)
  6. Final Merging                  5ms (0.0%)

✓ Process completed successfully
```

## Logger Methods

### Header & Steps

```javascript
// Log header
logger.logHeader('Process Title');

// Log step start
logger.logStepStart(stepNumber, 'Step Name', 'Optional description');

// Log step completion
logger.logStepComplete({ key: 'value' });
```

### Specialized Logging

```javascript
// Subject detection
logger.logSubjectDetection(detection);

// Content extraction
logger.logContentExtraction(concepts);

// Question generation
logger.logQuestionGeneration(questions, distribution, promptKey);

// Quality validation
logger.logQualityValidation(validationResults);

// Question improvement
logger.logQuestionImprovement(improvementResults);
```

### Messages

```javascript
// Success message
logger.logSuccess('Operation completed');

// Info message
logger.logInfo('Processing data...');

// Warning message
logger.logWarning('Low confidence detected');

// Error message
logger.logError('Step Name', error);
```

### Progress & Summary

```javascript
// Progress bar
logger.logProgress(current, total, 'Processing');

// Final summary
logger.logSummary();
```

## Configuration

### Enable/Disable Logging

```javascript
// Disable all logging
const logger = new ProcessLogger({ enabled: false });

// Enable with verbose mode
const logger = new ProcessLogger({ 
  enabled: true, 
  verbose: true 
});
```

### In Agentic Pipeline

```javascript
const pipeline = new AgenticPipeline(null, {
  enableLogging: true,       // Enable logging
  verboseLogging: false      // Disable verbose mode
});
```

### Environment Variable

```javascript
// Set via environment
const logger = new ProcessLogger({
  enabled: process.env.ENABLE_LOGGING !== 'false',
  verbose: process.env.VERBOSE_LOGGING === 'true'
});
```

## Verbose Mode Details

When `verbose: true`, the logger shows:

### Subject Detection
- Keyword scores for all subjects
- Top 5 matching subjects with bar charts

### Content Extraction
- Full list of main topics
- Sample key concepts (first 3)
- Concept difficulty levels

### Question Generation
- Sample questions (first 2)
- Question types and difficulty
- Full distribution breakdown

### Quality Validation
- Low-quality question details
- Specific issues for each question
- Grade distribution visualization

### Question Improvement
- Before/after comparisons
- Specific improvements made
- Score increases per question

## Color Reference

```javascript
colors.green    // Success, high scores (>85)
colors.yellow   // Warnings, medium scores (70-85)
colors.red      // Errors, low scores (<70)
colors.cyan     // Information, data
colors.blue     // Headers, titles
colors.magenta  // Results, summaries
colors.dim      // Secondary information
colors.bright   // Emphasis
```

## Performance Impact

- **Minimal overhead** - Logging adds <1ms per operation
- **Conditional execution** - Disabled logging has zero overhead
- **Efficient formatting** - Color codes are simple ANSI sequences
- **No file I/O** - All output to console (fast)

## Best Practices

### 1. Use in Development
```javascript
const isDevelopment = process.env.NODE_ENV === 'development';

const pipeline = new AgenticPipeline(null, {
  enableLogging: isDevelopment,
  verboseLogging: isDevelopment
});
```

### 2. Disable in Production
```javascript
const pipeline = new AgenticPipeline(null, {
  enableLogging: false  // Disable for production
});
```

### 3. Use Verbose for Debugging
```javascript
const pipeline = new AgenticPipeline(null, {
  enableLogging: true,
  verboseLogging: true  // Enable when debugging issues
});
```

### 4. Log Important Steps Only
```javascript
// In custom code, log only critical steps
logger.logStepStart(1, 'Critical Operation');
// ... work ...
logger.logStepComplete();

// Skip logging for minor operations
```

## Integration Examples

### Express API Route

```javascript
app.post('/api/quiz/generate', async (req, res) => {
  const logger = new ProcessLogger({
    enabled: req.query.debug === 'true',
    verbose: req.query.verbose === 'true'
  });

  const pipeline = new AgenticPipeline(null, {
    enableLogging: logger.enabled,
    verboseLogging: logger.verbose
  });

  const result = await pipeline.generateQuiz(content, options);
  res.json(result);
});
```

### CLI Tool

```javascript
import { program } from 'commander';

program
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-q, --quiet', 'Disable logging')
  .action(async (options) => {
    const pipeline = new AgenticPipeline(null, {
      enableLogging: !options.quiet,
      verboseLogging: options.verbose
    });

    await pipeline.generateQuiz(content, quizOptions);
  });
```

### Testing

```javascript
describe('Quiz Generation', () => {
  it('should generate questions', async () => {
    const pipeline = new AgenticPipeline(null, {
      enableLogging: false  // Disable for clean test output
    });

    const result = await pipeline.generateQuiz(content, options);
    expect(result.questions).toHaveLength(10);
  });
});
```

## Troubleshooting

### Colors Not Showing

If colors don't display in your terminal:

```javascript
// Force color support
process.env.FORCE_COLOR = '1';

// Or disable colors
const logger = new ProcessLogger({ 
  enabled: true,
  useColors: false  // Plain text output
});
```

### Too Much Output

Disable verbose mode:

```javascript
const logger = new ProcessLogger({ 
  enabled: true,
  verbose: false  // Less detailed output
});
```

### Missing Logs

Ensure logging is enabled:

```javascript
const pipeline = new AgenticPipeline(null, {
  enableLogging: true  // Must be true
});
```

## Files

- **`backend/src/utils/process-logger.js`** - Logger implementation
- **`backend/src/examples/test-complete-process.js`** - Complete example
- **`backend/src/services/agentic-pipeline.js`** - Integrated logging
- **`backend/docs/PROCESS_LOGGING.md`** - This documentation
