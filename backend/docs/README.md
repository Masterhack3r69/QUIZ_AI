# Multi-AI Agentic System Documentation

## Overview

The multi-AI agentic system is an advanced quiz generation pipeline that uses specialized AI agents for different tasks. Instead of a single AI handling everything, the system employs five specialized agents working together to create high-quality quiz questions.

## What Makes It Different?

### Traditional Approach (Legacy System)
- Single AI model generates all questions
- No quality validation
- No automatic improvement
- Limited provider options
- All-or-nothing approach

### Agentic Approach (New System)
- **5 Specialized Agents** - Each focused on one task
- **Quality Validation** - Every question is evaluated
- **Automatic Improvement** - Low-quality questions are enhanced
- **Multiple AI Providers** - OpenRouter, Gemini, Ollama
- **Automatic Fallback** - Switches providers if one fails
- **Configuration-Driven** - Easy to optimize for cost, speed, or quality

## The Five Agents

### 1. Content Extraction Agent
**Purpose:** Analyzes educational content and extracts key concepts

**What it does:**
- Identifies 3-5 main topics
- Extracts 5-10 key concepts with difficulty levels
- Finds 5-10 critical testable facts
- Generates 3-5 learning objectives
- Notes exceptions to rules (great for questions)

**Example:**
```
Input: "Photosynthesis is the process by which plants..."
Output: {
  mainTopics: ["Photosynthesis", "Plant Biology"],
  keyConcepts: [
    { name: "Light-dependent reactions", difficulty: "medium" },
    { name: "Calvin cycle", difficulty: "hard" }
  ],
  criticalFacts: [
    { fact: "Chlorophyll absorbs light energy", category: "process" }
  ]
}
```

### 2. Question Generation Agent
**Purpose:** Creates multiple-choice questions with educational distractors

**What it does:**
- Generates requested number of questions
- Supports 4 question types (multiple choice, true/false, fill-in-blank, matching)
- Creates 3 types of distractors:
  - **Verbatim Trap:** Uses exact phrases from content in wrong context
  - **Close Concept:** Related but incorrect answer
  - **Common Misconception:** Typical student errors
- Distributes questions across difficulty levels (30% easy, 50% medium, 20% hard)

**Example:**
```
Question: "What is the primary product of photosynthesis that plants use for energy?"
A) Glucose (CORRECT)
B) Oxygen (Verbatim trap - produced but not used for energy)
C) Chlorophyll (Close concept - involved but not the product)
D) Carbon dioxide (Common misconception - this is a reactant)
```

### 3. Quality Validation Agent
**Purpose:** Evaluates question quality across multiple criteria

**What it does:**
- Scores each question 0-100
- Evaluates 4 criteria:
  - **Clarity** (0-25): Is the question clear and unambiguous?
  - **Correctness** (0-25): Is there one definitively correct answer?
  - **Distractor Quality** (0-25): Are wrong answers plausible?
  - **Educational Value** (0-25): Does it test important knowledge?
- Assigns grade: excellent (85-100), good (70-84), fair (50-69), poor (<50)
- Identifies specific issues and provides improvement suggestions

**Example:**
```
Score: 72/100 (Good)
Issues:
- Distractor C is too obviously wrong
- Question could be more specific
Suggestions:
- Make distractor C more plausible by using a related concept
- Add context to clarify what aspect is being tested
```

### 4. Question Improvement Agent
**Purpose:** Enhances low-quality questions based on validation feedback

**What it does:**
- Takes original question and validation feedback
- Addresses all identified issues
- Improves weak distractors
- Enhances clarity
- Maintains the core concept being tested
- Returns improved question with expected score >85

**Example:**
```
Before (Score: 65):
Q: "What does photosynthesis do?"
A) Makes food (vague)
B) Nothing (obviously wrong)

After (Score: 90):
Q: "What is the primary product of photosynthesis that plants use for energy?"
A) Glucose (specific, clear)
B) Oxygen (plausible distractor)
```

### 5. Analytics Agent
**Purpose:** Analyzes quiz performance and provides insights

**What it does:**
- Calculates class statistics
- Identifies struggling students
- Finds difficult questions
- Detects common misconceptions
- Provides actionable recommendations

**Example:**
```
Insights:
- 40% of students confused oxygen with glucose
- Question 5 was too difficult (25% correct)
- Students who got Q3 right also got Q7 right (related concepts)
Recommendations:
- Review the difference between products and reactants
- Consider rewording Question 5
- Lab activity on photosynthesis recommended
```

## How It Works Together

### The Pipeline Flow

```
1. Teacher uploads content
   ↓
2. Content Extraction Agent analyzes it
   → Extracts: topics, concepts, facts, objectives
   ↓
3. Question Generation Agent creates questions
   → Input: extracted concepts + distribution
   → Output: 10 raw questions
   ↓
4. Quality Validation Agent evaluates each question
   → Scores all 10 questions
   → Identifies 3 questions with score < 70
   ↓
5. Question Improvement Agent (for low-quality questions)
   → Improves the 3 low-quality questions
   → New scores: all above 85
   ↓
6. Final validated questions returned
   → 7 original good questions + 3 improved questions
   → All meet quality threshold
   → Quiz created successfully
```

### Example Timeline

For a typical 10-question quiz:

| Step | Agent | Time | Provider |
|------|-------|------|----------|
| Extract concepts | Content Extraction | 8s | OpenRouter |
| Generate 10 questions | Question Generation | 22s | OpenRouter |
| Validate 10 questions | Quality Validation | 11s | Gemini (parallel) |
| Improve 3 questions | Question Improvement | 12s | OpenRouter (parallel) |
| **Total** | | **~45s** | |

## AI Providers

### OpenRouter (Free Tier)
- Access to multiple free models
- Best for: Question generation, content extraction
- Models: Qwen 2.5 72B, Llama 3.1 8B, Mistral 7B
- Rate limit: 200 requests/day

### Google Gemini (Free Tier)
- Fast and reliable
- Best for: Quality validation, analytics
- Model: Gemini 2.0 Flash Exp
- Rate limit: 1,500 requests/day

### Ollama (Local/Free)
- Runs on your computer
- Best for: Development, cost optimization
- Models: Llama 3.2 1B/3B, Llama 3.1 8B
- No rate limits, no API costs

## Configuration

The system is highly configurable through JSON files:

### Task Configuration
```json
{
  "question-generation": {
    "primary": "openrouter",
    "fallback": ["gemini", "ollama"],
    "maxRetries": 2,
    "timeout": 60000,
    "model": "qwen/qwen-2.5-72b-instruct:free"
  }
}
```

### Provider Configuration
```json
{
  "openrouter": {
    "enabled": true,
    "baseURL": "https://openrouter.ai/api/v1",
    "models": {
      "free": "qwen/qwen-2.5-72b-instruct:free",
      "quality": "meta-llama/llama-3.1-8b-instruct:free"
    }
  }
}
```

## Feature Flags

Control which features are enabled:

```bash
# Master switch
ENABLE_AGENTIC_PIPELINE=true

# Individual features
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=true

# Configuration selection
AI_TASK_CONFIG=production
```

## Benefits

### Quality
- **Higher Quality Questions:** Multi-stage validation and improvement
- **Consistent Standards:** Every question meets minimum threshold
- **Educational Distractors:** Wrong answers that test understanding

### Reliability
- **Automatic Fallback:** Switches providers if one fails
- **Retry Logic:** Handles transient failures automatically
- **Multiple Providers:** Not dependent on single AI service

### Flexibility
- **Configuration-Driven:** Change providers without code changes
- **Environment-Specific:** Different configs for dev/staging/prod
- **Cost Optimization:** Use free providers strategically

### Observability
- **Comprehensive Logging:** Track every AI request
- **Usage Statistics:** Monitor costs and performance
- **Quality Metrics:** Track question quality over time

## Documentation

### For Setup and Configuration
📖 [Configuration Guide](./AGENTIC_SYSTEM_CONFIGURATION.md)
- All configuration options explained
- Environment variable reference
- AI provider setup instructions
- Example configurations for different scenarios

### For Deployment
🚀 [Deployment Guide](./AGENTIC_SYSTEM_DEPLOYMENT.md)
- Pre-deployment checklist
- Phased rollout strategy
- Feature flag management
- Monitoring setup
- Troubleshooting common issues

### For API Usage
📡 [API Documentation](./AGENTIC_SYSTEM_API.md)
- Quiz generation endpoint
- Admin monitoring endpoints
- Health check endpoints
- Error response formats
- Usage examples

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env

# Edit .env and add:
ENABLE_AGENTIC_PIPELINE=true
GEMINI_API_KEY=your_key_here
AI_TASK_CONFIG=development
```

### 3. Start Development Server
```bash
pnpm dev
```

### 4. Test the System
```bash
# Create a quiz
curl -X POST http://localhost:5000/api/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Quiz",
    "content": "Your educational content here...",
    "questionCount": 5
  }'
```

## Monitoring

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Usage Statistics (Admin)
```bash
curl http://localhost:5000/api/admin/ai-usage \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Logs
```bash
# View all logs
tail -f logs/agentic.log

# View errors only
tail -f logs/error.log | grep "agentic"
```

## Performance

### Typical Performance
- **Content Extraction:** 5-10 seconds
- **Question Generation:** 15-30 seconds (depends on count)
- **Quality Validation:** 1-2 seconds per question (parallel)
- **Question Improvement:** 3-5 seconds per question (parallel)
- **Total for 10 questions:** 40-60 seconds

### Optimization Tips
1. Use Gemini for fast tasks (validation)
2. Use OpenRouter quality models for generation
3. Enable parallel processing for validation/improvement
4. Use local Ollama for development
5. Adjust timeouts based on provider speed

## Troubleshooting

### Common Issues

**"All providers unavailable"**
- Check API keys are set correctly
- Verify network connectivity
- Check provider status pages
- Try local Ollama as fallback

**"Request timeout"**
- Increase timeout in task config
- Use faster model (Gemini Flash)
- Check network latency
- Reduce content length

**"Low quality scores"**
- Review and improve prompts
- Use higher-quality models
- Enable question improvement
- Adjust quality threshold

**"Rate limit exceeded"**
- System automatically falls back
- Distribute load across providers
- Consider paid tier for high volume
- Use local Ollama for development

## Support

### Resources
- [Configuration Guide](./AGENTIC_SYSTEM_CONFIGURATION.md) - Setup and configuration
- [Deployment Guide](./AGENTIC_SYSTEM_DEPLOYMENT.md) - Production deployment
- [API Documentation](./AGENTIC_SYSTEM_API.md) - API reference

### Getting Help
- Check logs: `logs/error.log`, `logs/agentic.log`
- Review metrics: `/api/admin/ai-usage`
- Test providers: `/api/health`
- GitHub Issues: [Report a bug]
- Email: dev-team@yourdomain.com

## Version

**Current Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** November 2024

---

**Ready to deploy?** Start with the [Configuration Guide](./AGENTIC_SYSTEM_CONFIGURATION.md) to set up your AI providers.
