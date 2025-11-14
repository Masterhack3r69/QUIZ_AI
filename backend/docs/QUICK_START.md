# Quick Start Guide - Multi-AI Agentic System

## 5-Minute Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB running
- At least one AI provider API key (Gemini recommended)

### Step 1: Install Dependencies
```bash
cd backend
pnpm install
```

### Step 2: Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

**Minimum required variables:**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/quiz_ai

# Authentication
JWT_SECRET=your_secure_random_string_here

# AI Provider (at least one)
GEMINI_API_KEY=your_gemini_api_key_here

# Agentic Pipeline
ENABLE_AGENTIC_PIPELINE=true
AI_TASK_CONFIG=development
```

### Step 3: Start Server
```bash
pnpm dev
```

### Step 4: Test the System
```bash
# Check health
curl http://localhost:5000/api/health

# Should return: { "status": "healthy", ... }
```

### Step 5: Create Your First Quiz

**Option A: Using curl**
```bash
curl -X POST http://localhost:5000/api/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Quiz",
    "content": "Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. This process occurs in chloroplasts and requires sunlight, water, and carbon dioxide. The main product is glucose, which plants use for energy, and oxygen is released as a byproduct.",
    "questionCount": 5
  }'
```

**Option B: Using the frontend**
1. Login as a teacher
2. Click "Create New Quiz"
3. Paste content or upload a file
4. Set question count to 5
5. Click "Generate Quiz"

## What Happens Next?

The system will:
1. **Extract concepts** from your content (~8 seconds)
2. **Generate 5 questions** with educational distractors (~15 seconds)
3. **Validate quality** of each question (~5 seconds)
4. **Improve** any low-quality questions (~10 seconds if needed)
5. **Return** your quiz with all questions scoring 70+ quality

**Total time:** ~40-50 seconds for a 5-question quiz

## Understanding the Response

```json
{
  "success": true,
  "data": {
    "quiz": {
      "_id": "...",
      "title": "Test Quiz",
      "code": "ABC123",  // Share this with students
      "questionCount": 5
    },
    "questions": [
      {
        "question": "What is the primary product of photosynthesis?",
        "options": ["Glucose", "Oxygen", "Chlorophyll", "Carbon dioxide"],
        "correctAnswer": 0,
        "qualityScore": 88,  // Quality validation score
        "metadata": {
          "validated": true,
          "improved": false  // Was not improved (already good)
        }
      }
      // ... 4 more questions
    ],
    "metadata": {
      "agenticPipeline": {
        "used": true,
        "performance": {
          "totalTime": 42.5,  // Total generation time
          "extractionTime": 8.1,
          "generationTime": 18.3,
          "validationTime": 6.2,
          "improvementTime": 9.9
        },
        "qualityMetrics": {
          "averageScore": 84.2,  // Average quality across all questions
          "questionsImproved": 1  // How many needed improvement
        }
      }
    }
  }
}
```

## Common First-Time Issues

### "All providers unavailable"
**Problem:** No AI providers are accessible

**Solution:**
```bash
# Check your API key is set
echo $GEMINI_API_KEY

# If empty, add to .env:
GEMINI_API_KEY=your_key_here

# Restart server
pnpm dev
```

### "Authentication required"
**Problem:** No JWT token provided

**Solution:**
1. First, register/login as a teacher
2. Get your JWT token from the login response
3. Use it in the Authorization header:
   ```bash
   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

### "Request timeout"
**Problem:** AI provider is slow or unresponsive

**Solution:**
```bash
# Increase timeout in config/ai-tasks.development.json
{
  "question-generation": {
    "timeout": 90000  // Increase from 60000 to 90000
  }
}
```

### "Content too long"
**Problem:** Input content exceeds 15,000 characters

**Solution:**
- Break content into smaller chunks
- Or increase limit in content-extraction-agent.js
- Or summarize content before submitting

## Next Steps

### For Development
1. ✅ System is running
2. 📖 Read [Configuration Guide](./AGENTIC_SYSTEM_CONFIGURATION.md) to optimize settings
3. 🧪 Experiment with different providers and models
4. 📊 Check `/api/admin/ai-usage` to see usage statistics

### For Production
1. ✅ System is running in development
2. 🚀 Follow [Deployment Guide](./AGENTIC_SYSTEM_DEPLOYMENT.md) for production setup
3. 🔧 Configure production AI providers
4. 📈 Set up monitoring and alerts
5. 🎯 Use phased rollout strategy

### For Understanding
1. ✅ System is working
2. 📚 Read [Main Documentation](./README.md) to understand the architecture
3. 📡 Review [API Documentation](./AGENTIC_SYSTEM_API.md) for all endpoints
4. 🔍 Explore the code in `backend/src/services/`

## Useful Commands

### Development
```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Check logs
tail -f logs/agentic.log
```

### Monitoring
```bash
# Check system health
curl http://localhost:5000/api/health

# Get usage statistics (requires admin token)
curl http://localhost:5000/api/admin/ai-usage \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Test all providers
curl -X POST http://localhost:5000/api/admin/test-providers \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Debugging
```bash
# View all logs
tail -f logs/agentic.log

# View errors only
tail -f logs/error.log

# Search for specific task
grep "question-generation" logs/agentic.log

# Check provider usage
grep "provider:" logs/agentic.log | sort | uniq -c
```

## Configuration Presets

### Fastest (Development)
```bash
AI_TASK_CONFIG=development
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=false  # Skip validation for speed
ENABLE_QUESTION_IMPROVEMENT=false  # Skip improvement for speed
```
**Result:** ~20 seconds per quiz, lower quality

### Balanced (Recommended)
```bash
AI_TASK_CONFIG=development
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=true
```
**Result:** ~45 seconds per quiz, good quality

### Highest Quality (Production)
```bash
AI_TASK_CONFIG=production
ENABLE_AGENTIC_PIPELINE=true
ENABLE_QUALITY_VALIDATION=true
ENABLE_QUESTION_IMPROVEMENT=true
```
**Result:** ~60 seconds per quiz, excellent quality

## Getting Help

### Documentation
- 📖 [Main Documentation](./README.md) - System overview
- ⚙️ [Configuration Guide](./AGENTIC_SYSTEM_CONFIGURATION.md) - Setup and config
- 🚀 [Deployment Guide](./AGENTIC_SYSTEM_DEPLOYMENT.md) - Production deployment
- 📡 [API Documentation](./AGENTIC_SYSTEM_API.md) - API reference

### Troubleshooting
1. Check logs: `logs/error.log` and `logs/agentic.log`
2. Verify health: `curl http://localhost:5000/api/health`
3. Test providers: `curl -X POST http://localhost:5000/api/admin/test-providers`
4. Review configuration files in `backend/config/`

### Support
- GitHub Issues: [Report a bug]
- Email: dev-team@yourdomain.com
- Slack: #agentic-system channel

## Success Checklist

- [ ] Server starts without errors
- [ ] Health check returns "healthy"
- [ ] At least one AI provider is available
- [ ] Can create a test quiz successfully
- [ ] Questions have quality scores >70
- [ ] Response time is acceptable (<60s)
- [ ] Logs show successful AI requests
- [ ] No errors in error.log

**All checked?** You're ready to go! 🎉

---

**Need more details?** Check out the [full documentation](./README.md).
