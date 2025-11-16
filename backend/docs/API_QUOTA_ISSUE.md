# API Quota Issue - Quick Fix

## Problem

You're seeing this error:
```
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count
```

This means your **Gemini API free tier quota** has been exceeded.

## Quick Solutions

### Option 1: Use GitHub Models (Recommended)

GitHub Models is free and has generous limits:

1. Get a GitHub token: https://github.com/settings/tokens
2. Add to your `.env`:
   ```
   GITHUB_TOKEN=your_github_token_here
   ```
3. The system will automatically use GitHub Models

### Option 2: Wait for Gemini Quota Reset

Gemini free tier resets:
- **Per minute**: Wait 1 minute
- **Per day**: Wait until next day

### Option 3: Upgrade Gemini API

Get a paid Gemini API key:
1. Go to: https://ai.google.dev/
2. Upgrade to paid tier
3. Update your `.env` with new key

### Option 4: Use OpenAI

If you have OpenAI credits:

1. Add to your `.env`:
   ```
   OPENAI_API_KEY=your_openai_key_here
   ```
2. The system will use OpenAI as fallback

## Current Provider Priority

The system tries providers in this order:
1. **GitHub Models** (if `GITHUB_TOKEN` is set)
2. **Gemini** (if `GEMINI_API_KEY` is set)
3. **OpenAI** (if `OPENAI_API_KEY` is set)
4. **Mock** (fallback for testing)

## Check Your Current Setup

```bash
# In backend directory
node -e "console.log('GitHub Token:', process.env.GITHUB_TOKEN ? 'Set ✓' : 'Not set ✗'); console.log('Gemini Key:', process.env.GEMINI_API_KEY ? 'Set ✓' : 'Not set ✗'); console.log('OpenAI Key:', process.env.OPENAI_API_KEY ? 'Set ✓' : 'Not set ✗');"
```

## Recommended: Use GitHub Models

GitHub Models is the best option for development:
- ✅ Free
- ✅ Generous rate limits
- ✅ Good quality
- ✅ No credit card required

Get your token here: https://github.com/settings/tokens

Select scopes:
- `repo` (if using private repos)
- `read:user`

Then add to `.env`:
```
GITHUB_TOKEN=ghp_your_token_here
```

Restart your server and it will work!
