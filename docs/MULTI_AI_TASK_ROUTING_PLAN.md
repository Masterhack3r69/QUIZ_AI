# Multi-AI Task Routing System - Design Plan

## 🎯 Vision

Create a flexible, configuration-driven system where different AI models handle different tasks based on their strengths, **without requiring code changes**.

## 📋 Core Concept

Instead of using one AI for everything, we assign specialized tasks to the best AI for that job:

- **OpenAI** → Reading, analysis, context extraction (best at understanding)
- **Gemini** → Question generation, quality validation (fast and reliable)
- **Groq** → Batch processing, simple tasks (extremely fast)
- **Ollama** → Development/testing, simple tasks (free, unlimited)
- **Anthropic** → Complex reasoning, long content (highest quality)

## 🏗️ Architecture

### 1. Configuration File (No Code Changes Needed!)

```yaml
# config/ai-task-assignments.yaml

tasks:
  content-extraction:
    primary: openai
    fallback: [gemini, groq]
    reason: "OpenAI excels at understanding and extracting meaning"
    
  question-generation:
    primary: gemini
    fallback: [openai, groq]
    reason: "Gemini is fast and reliable for structured output"
    
  quality-validation:
    primary: gemini
    fallback: [openai]
    reason: "Gemini provides consistent quality scoring"
    
  question-improvement:
    primary: openai
    fallback: [anthropic, gemini]
    reason: "OpenAI best at refining and improving content"
    
  analytics-insights:
    primary: anthropic
    fallback: [openai, gemini]
    reason: "Anthropic excels at complex analysis"
    
  simple-extraction:
    primary: groq
    fallback: [ollama, gemini]
    reason: "Groq is fastest for simple tasks"
    
  batch-processing:
    primary: groq
    fallback: [gemini]
    reason: "Groq handles high throughput efficiently"
    
  development-testing:
    primary: ollama
    fallback: [groq, gemini]
    reason: "Ollama is free for unlimited testing"
```

### 2. Model Profiles

```yaml
# config/ai-model-profiles.yaml

models:
  openai:
    name: "OpenAI GPT-4"
    strengths:
      - Deep understanding
      - Context extraction
      - Complex reasoning
      - Content improvement
    limitations:
      - Cost (medium-high)
      - Speed (medium)
    max_input: 15000 chars
    max_output: 4096 tokens
    cost_per_1m_tokens: $0.15
    
  gemini:
    name: "Google Gemini 1.5 Flash"
    strengths:
      - Fast generation
      - Reliable JSON output
      - Good quality
      - Low cost
    limitations:
      - Rate limits (free tier)
    max_input: 30000 chars
    max_output: 8192 tokens
    cost_per_1m_tokens: $0.075
    
  anthropic:
    name: "Claude 3.5 Sonnet"
    strengths:
      - Highest quality
      - Very long context (100k+)
      - Complex analysis
      - Nuanced understanding
    limitations:
      - Cost (high)
    max_input: 100000 chars
    max_output: 4096 tokens
    cost_per_1m_tokens: $3.00
    
  groq:
    name: "Groq Llama 3.1 70B"
    strengths:
      - Extremely fast
      - Low cost
      - Good for batch
      - Reliable JSON
    limitations:
      - Shorter context
    max_input: 8000 chars
    max_output: 4096 tokens
    cost_per_1m_tokens: $0.05
    
  ollama:
    name: "Ollama (Local)"
    strengths:
      - FREE
      - Unlimited usage
      - Privacy (local)
      - No rate limits
    limitations:
      - Slower on CPU
      - Limited context
      - Lower quality
    max_input: 2000 chars
    max_output: 2048 tokens
    cost_per_1m_tokens: $0.00
```

### 3. Task Workflow Example

```
Quiz Generation Workflow:
┌─────────────────────────────────────────────────────────┐
│ 1. Content Upload (17,000 chars)                       │
│    Teacher uploads PDF                                  │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Content Extraction                                   │
│    AI: OpenAI (best at understanding)                   │
│    Task: Extract key concepts, topics, facts            │
│    Input: 17,000 chars → Output: Structured concepts    │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Question Generation                                  │
│    AI: Gemini (fast, reliable JSON)                     │
│    Task: Generate 20 questions from concepts            │
│    Input: Concepts → Output: 20 questions               │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Quality Validation                                   │
│    AI: Gemini (consistent scoring)                      │
│    Task: Validate each question quality                 │
│    Input: 20 questions → Output: Quality scores         │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Question Improvement (if needed)                     │
│    AI: OpenAI (best at refinement)                      │
│    Task: Improve low-quality questions                  │
│    Input: 5 low-quality → Output: 5 improved            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Final Quiz Ready                                     │
│    20 high-quality questions                            │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Implementation Plan

### Phase 1: Configuration System

**File: `config/ai-tasks.json`**
```json
{
  "tasks": {
    "content-extraction": {
      "primary": "openai",
      "fallback": ["gemini", "groq"],
      "maxRetries": 3,
      "timeout": 30000
    },
    "question-generation": {
      "primary": "gemini",
      "fallback": ["openai"],
      "maxRetries": 2,
      "timeout": 60000
    }
  }
}
```

### Phase 2: Task Router Service

**File: `backend/src/services/ai-task-router.js`**

```javascript
class AITaskRouter {
  constructor() {
    this.config = loadConfig('config/ai-tasks.json');
  }
  
  async executeTask(taskName, prompt, options) {
    const taskConfig = this.config.tasks[taskName];
    const primaryAI = taskConfig.primary;
    
    // Try primary AI
    try {
      return awai
t this.executeWithAI(primaryAI, prompt, options);
    } catch (error) {
      // Try fallback AIs
      for (const fallbackAI of taskConfig.fallback) {
        try {
          return await this.executeWithAI(fallbackAI, prompt, options);
        } catch (e) {
          continue;
        }
      }
      throw error;
    }
  }
}
```

### Phase 3: Admin UI (Future)

Teachers can configure task assignments through UI:

```
┌─────────────────────────────────────────────────────┐
│ AI Task Configuration                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Content Extraction:                                 │
│   Primary:   [OpenAI ▼]                            │
│   Fallback:  [Gemini ▼] [Groq ▼]                  │
│                                                     │
│ Question Generation:                                │
│   Primary:   [Gemini ▼]                            │
│   Fallback:  [OpenAI ▼]                            │
│                                                     │
│ Quality Validation:                                 │
│   Primary:   [Gemini ▼]                            │
│   Fallback:  [OpenAI ▼]                            │
│                                                     │
│ [Save Configuration]                                │
└─────────────────────────────────────────────────────┘
```

## 📊 Use Case Examples

### Use Case 1: Cost Optimization

**Goal**: Minimize costs while maintaining quality

```yaml
tasks:
  content-extraction:
    primary: groq        # Fast and cheap
    fallback: [gemini]
    
  question-generation:
    primary: gemini      # Good quality, low cost
    fallback: [groq]
    
  quality-validation:
    primary: gemini      # Consistent, low cost
    fallback: [groq]
    
  question-improvement:
    primary: openai      # Only use expensive AI when needed
    fallback: [gemini]
```

**Result**: ~$0.10 per quiz (vs $0.50 with OpenAI only)

### Use Case 2: Maximum Quality

**Goal**: Best possible questions, cost is secondary

```yaml
tasks:
  content-extraction:
    primary: anthropic   # Best understanding
    fallback: [openai]
    
  question-generation:
    primary: openai      # High quality
    fallback: [anthropic]
    
  quality-validation:
    primary: anthropic   # Most thorough
    fallback: [openai]
    
  question-improvement:
    primary: anthropic   # Best refinement
    fallback: [openai]
```

**Result**: Highest quality, ~$1.50 per quiz

### Use Case 3: Development/Testing

**Goal**: Free, unlimited testing

```yaml
tasks:
  content-extraction:
    primary: ollama      # Free
    fallback: [groq, gemini]
    
  question-generation:
    primary: ollama      # Free
    fallback: [groq, gemini]
    
  quality-validation:
    primary: ollama      # Free
    fallback: [groq]
    
  question-improvement:
    primary: ollama      # Free
    fallback: [groq]
```

**Result**: $0.00 cost, good for development

### Use Case 4: Speed Priority

**Goal**: Fastest generation possible

```yaml
tasks:
  content-extraction:
    primary: groq        # Fastest
    fallback: [gemini]
    
  question-generation:
    primary: groq        # Fastest
    fallback: [gemini]
    
  quality-validation:
    primary: groq        # Fastest
    fallback: [gemini]
    
  question-improvement:
    primary: groq        # Fastest
    fallback: [gemini]
```

**Result**: ~5-10 seconds per quiz (vs 30-60 seconds)

## 🎛️ Configuration Options

### Environment-Based Configuration

```bash
# .env
AI_TASK_CONFIG=production  # or development, testing, cost-optimized

# Loads config/ai-tasks.production.json
# or config/ai-tasks.development.json
```

### Per-Task Override

```javascript
// In code, can override for specific needs
await taskRouter.executeTask('question-generation', prompt, {
  forceProvider: 'anthropic',  // Override config
  reason: 'User requested highest quality'
});
```

### Dynamic Selection

```javascript
// Router can auto-select based on content
if (contentLength > 50000) {
  useProvider = 'anthropic';  // Only one with 100k context
} else if (contentLength > 10000) {
  useProvider = 'gemini';     // Good for medium content
} else {
  useProvider = 'groq';       // Fast for small content
}
```

## 📈 Benefits

### 1. **Flexibility**
- Change AI assignments without code changes
- Test different configurations easily
- Optimize for cost, speed, or quality

### 2. **Reliability**
- Automatic fallback if primary AI fails
- No single point of failure
- Graceful degradation

### 3. **Cost Control**
- Use expensive AIs only where needed
- Free options for development
- Optimize per use case

### 4. **Performance**
- Fast AIs for simple tasks
- Powerful AIs for complex tasks
- Parallel execution possible

### 5. **Scalability**
- Add new AIs without code changes
- Easy to test new models
- Provider-agnostic architecture

## 🚀 Migration Path

### Current State
```
All tasks → Single AI (Gemini or Ollama)
```

### Phase 1: Add Task Router
```
All tasks → Task Router → Single AI
(No behavior change, just infrastructure)
```

### Phase 2: Add Configuration
```
All tasks → Task Router → Config → Appropriate AI
(Start using different AIs per task)
```

### Phase 3: Add Fallbacks
```
All tasks → Task Router → Config → Primary AI
                                 ↓ (if fails)
                                 → Fallback AI
```

### Phase 4: Add UI
```
Teacher → UI → Updates Config → Task Router → AIs
(Teachers can configure without developer)
```

## 📝 Configuration File Structure

### Simple Version (Start Here)

```json
{
  "content-extraction": "openai",
  "question-generation": "gemini",
  "quality-validation": "gemini",
  "question-improvement": "openai"
}
```

### Advanced Version (Future)

```json
{
  "tasks": {
    "content-extraction": {
      "primary": {
        "provider": "openai",
        "model": "gpt-4o-mini",
        "temperature": 0.3,
        "maxTokens": 4096
      },
      "fallback": [
        {
          "provider": "gemini",
          "model": "gemini-1.5-flash",
          "condition": "if primary fails"
        },
        {
          "provider": "groq",
          "model": "llama-3.1-70b",
          "condition": "if both fail"
        }
      ],
      "rules": {
        "maxRetries": 3,
        "timeout": 30000,
        "contentLengthLimit": 15000,
        "fallbackOnTimeout": true
      }
    }
  }
}
```

## 🎯 Recommended Starting Configuration

```json
{
  "tasks": {
    "content-extraction": {
      "primary": "gemini",
      "fallback": ["groq", "ollama"],
      "reason": "Gemini is fast and handles large content well"
    },
    "question-generation": {
      "primary": "gemini",
      "fallback": ["groq"],
      "reason": "Gemini produces reliable JSON output"
    },
    "quality-validation": {
      "primary": "gemini",
      "fallback": ["groq"],
      "reason": "Gemini provides consistent quality scores"
    },
    "question-improvement": {
      "primary": "gemini",
      "fallback": ["groq"],
      "reason": "Gemini is good at refinement"
    }
  }
}
```

**Why this configuration?**
- Uses free Gemini tier for most tasks
- Groq as fast fallback
- Ollama for development
- Can upgrade to OpenAI/Anthropic later for specific tasks

## 🔄 Easy Swapping Example

Want to use OpenAI for content extraction? Just change config:

**Before:**
```json
"content-extraction": {
  "primary": "gemini"
}
```

**After:**
```json
"content-extraction": {
  "primary": "openai"
}
```

**No code changes needed!** ✨

## 📊 Performance Comparison

| Configuration | Speed | Quality | Cost/Quiz | Best For |
|--------------|-------|---------|-----------|----------|
| All Groq | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | $0.05 | Speed priority |
| All Gemini | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $0.10 | Balanced |
| All OpenAI | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $0.50 | Quality priority |
| All Anthropic | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $1.50 | Max quality |
| All Ollama | ⚡⚡ | ⭐⭐ | $0.00 | Development |
| **Mixed (Recommended)** | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $0.15 | **Best overall** |

## 🎓 Summary

This system allows you to:

1. ✅ **Configure AI assignments** without touching code
2. ✅ **Optimize for cost, speed, or quality** by changing config
3. ✅ **Automatic fallbacks** if primary AI fails
4. ✅ **Easy testing** of different AI combinations
5. ✅ **Future-proof** - add new AIs by updating config

**Next Steps:**
1. Create `config/ai-tasks.json` file
2. Implement task router to read config
3. Update agents to use task router
4. Test different configurations
5. (Future) Build UI for teachers to configure

**The beauty**: Teachers can optimize their AI usage without needing a developer! 🚀
