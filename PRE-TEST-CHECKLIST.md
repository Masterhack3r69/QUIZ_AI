# ✅ Pre-Test Checklist

Before running the AI agent test, make sure everything is configured correctly.

## 🔍 Quick Check

Run this command to verify your setup:

```bash
cd backend
node -e "require('dotenv').config(); console.log('✓ Node.js:', process.version); console.log('✓ OpenRouter API:', process.env.OPENROUTER_API_KEY ? 'Configured' : '❌ Missing'); console.log('✓ Gemini API:', process.env.GEMINI_API_KEY ? 'Configured' : '❌ Missing'); console.log('✓ MongoDB:', process.env.MONGODB_URI || '❌ Missing');"
```

## 📋 Detailed Checklist

### 1. Node.js & Dependencies
- [ ] Node.js installed (v16 or higher)
- [ ] Backend dependencies installed (`pnpm install`)
- [ ] No package errors

**Check**:
```bash
node --version
cd backend && pnpm list
```

### 2. Environment Variables
- [ ] `.env` file exists in `backend/` folder
- [ ] `OPENROUTER_API_KEY` is set
- [ ] `GEMINI_API_KEY` is set (backup)
- [ ] `MONGODB_URI` is set

**Check**:
```bash
cd backend
cat .env | grep -E "OPENROUTER_API_KEY|GEMINI_API_KEY|MONGODB_URI"
```

**Your Current Config**:
```
✓ OPENROUTER_API_KEY=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
✓ GEMINI_API_KEY=AIzaSyD6qCgYSJ3Ub3Zg_K2DsfRnxkBy-WqcQE4
✓ MONGODB_URI=mongodb://localhost:27017/quiz_ai
```

### 3. AI Agent Configuration
- [ ] `ENABLE_AGENTIC_PIPELINE` set to `true`
- [ ] `ENABLE_QUALITY_VALIDATION` set to `true`
- [ ] `ENABLE_QUESTION_IMPROVEMENT` set to `true`

**Current Status**: ⚠️ **DISABLED** (needs to be enabled)

**Enable Now**:
```bash
cd backend
node scripts/enable-ai-agents.js
```

### 4. MongoDB (Optional for Direct Test)
- [ ] MongoDB installed (if testing locally)
- [ ] MongoDB running (if testing locally)

**Note**: The direct test (`test-ai-agent-direct.js`) doesn't require MongoDB!

**Check MongoDB**:
```bash
# Windows
net start MongoDB

# Or check if running
tasklist | findstr mongod
```

### 5. Internet Connection
- [ ] Internet connection active
- [ ] Can reach OpenRouter API
- [ ] Can reach Google Gemini API

**Test Connection**:
```bash
curl -I https://openrouter.ai
curl -I https://generativelanguage.googleapis.com
```

### 6. Test Scripts
- [ ] `test-ai-agent-direct.js` exists
- [ ] `test-ai-agent-live.js` exists
- [ ] `enable-ai-agents.js` exists

**Check**:
```bash
dir backend\scripts\test-*.js
```

### 7. Test Account (For Live Test Only)
- [ ] Account exists: jdedusma@gmail.com
- [ ] Password known: 3Quetrasi
- [ ] Backend server running (for live test)

## 🚀 Ready to Test?

### If All Checks Pass:

**Option 1: Direct Test (Recommended)**
```bash
cd backend
node scripts/test-ai-agent-direct.js
```

**Option 2: Windows Batch File**
```bash
test-ai-agents.bat
```

### If Some Checks Fail:

#### Missing API Keys
→ Add them to `backend/.env`:
```
OPENROUTER_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

#### AI Agents Disabled
→ Run enable script:
```bash
cd backend
node scripts/enable-ai-agents.js
```

#### MongoDB Not Running
→ For direct test: **Not needed!**
→ For live test: Start MongoDB:
```bash
net start MongoDB
```

#### Dependencies Missing
→ Install them:
```bash
cd backend
pnpm install
```

## 🎯 Minimum Requirements

To run the **direct test** (easiest option):

✅ **Required**:
- Node.js installed
- Backend dependencies installed
- OpenRouter or Gemini API key
- Internet connection

❌ **NOT Required**:
- MongoDB running
- Backend server running
- Test account created

## 📊 Expected Results

When everything is configured correctly:

```
✓ Node.js: v18.17.0
✓ OpenRouter API: Configured
✓ Gemini API: Configured
✓ MongoDB: mongodb://localhost:27017/quiz_ai
✓ AI Agents: Enabled
✓ Dependencies: Installed
✓ Internet: Connected

🎉 Ready to test!
```

## 🐛 Common Issues

### Issue: "Cannot find module"
**Solution**: Install dependencies
```bash
cd backend
pnpm install
```

### Issue: "AI provider not available"
**Solution**: Check API keys and internet
```bash
# Verify API key is set
echo %OPENROUTER_API_KEY%

# Test internet
ping google.com
```

### Issue: "ENABLE_AGENTIC_PIPELINE is false"
**Solution**: Enable AI agents
```bash
cd backend
node scripts/enable-ai-agents.js
```

### Issue: "MongoDB connection failed"
**Solution**: For direct test, ignore this!
For live test, start MongoDB:
```bash
net start MongoDB
```

## 💡 Pro Tips

1. **Start with direct test**: No server or database needed
2. **Check logs**: Look in `backend/logs/` for details
3. **Test internet**: Make sure APIs are reachable
4. **Use Gemini as backup**: If OpenRouter fails
5. **Read error messages**: They usually tell you what's wrong

## 📞 Need Help?

If you're stuck:

1. Check error messages carefully
2. Review `TEST-AI-AGENT-GUIDE.md`
3. Look at `backend/logs/` for details
4. Verify all environment variables
5. Test API keys manually

## ✅ Final Check

Before running the test, confirm:

- [ ] I can run `node --version` successfully
- [ ] I have at least one AI provider API key
- [ ] I have internet connection
- [ ] I'm in the correct directory
- [ ] I've read the expected output

**If all checked, you're ready!** 🚀

Run:
```bash
cd backend
node scripts/test-ai-agent-direct.js
```

---

**Good luck! The test should complete in 45-60 seconds.** ⏱️
