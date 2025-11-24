# 🚂 Railway Deployment Checklist

## ✅ Pre-Deployment

- ✅ Clean codebase (NO LinkedIn dependencies)
- ✅ Code pushed to GitHub: https://github.com/hkj13/devto-post-scheduler
- ✅ All files are Dev.to-focused only
- ✅ Testing completed locally

## 🚀 Railway Setup Steps

### 1. Create New Deployment

1. Go to: https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select repository: `hkj13/devto-post-scheduler`
4. Wait for Railway to detect Node.js project

### 2. Set Environment Variables

In Railway dashboard → **Variables** tab, add:

```env
OPENAI_API_KEY=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

DEVTO_API_KEY=Y29seos1Cz5rgNchWPKuywBX

POST_SCHEDULE=0 9 * * *

CONTENT_TOPICS=AgenticAI,GenerativeAI,LLM,CloudAI,DataScience,ML,MLOps,DeepLearning,NLP,RAG,ComputerVision

LOG_LEVEL=info
```

**Optional (for testing):**
```env
POST_ON_STARTUP=true
```

### 3. Verify Deployment

Check **Logs** tab for:

```
✅ Configuration validated successfully
✅ Dev.to API verified. Username: hkj13
🚀 Dev.to AI Agent started successfully!
📅 Scheduling posts with cron expression: 0 9 * * *
⏰ Waiting for scheduled posting time...
```

### 4. What You Should See

✅ **No LinkedIn errors** (all removed!)
✅ **Clean startup** with only Dev.to references
✅ **Scheduled posting** at 9 AM UTC daily
✅ **Auto-generated articles** with cover images

## 🔍 Troubleshooting

### If you see LinkedIn errors:
**This should NOT happen anymore!** The codebase is completely clean.

### If deployment fails:
1. Check environment variables are set correctly
2. Verify both API keys are valid
3. Check Railway logs for specific errors

### If no articles are posting:
1. Check cron schedule is correct
2. Verify OpenAI has sufficient credits
3. Check Dev.to API key permissions

## 📊 Expected Behavior

**On Startup:**
- Validates environment variables
- Verifies Dev.to API key
- Starts cron scheduler
- Waits for scheduled time

**At Scheduled Time (9 AM UTC):**
- Picks random topic
- Generates article with GPT-4
- Generates cover image with DALL-E
- Posts to Dev.to
- Logs success

## 🎯 Cost per Deployment

**Railway:**
- Free tier available
- $5/month for hobby plan

**OpenAI (per article):**
- ~$0.06-0.07 per article
- ~$2-3 per month (1/day)

## ✅ Final Checklist

Before going live:

- [ ] Railway deployment shows "Active"
- [ ] Logs show successful startup
- [ ] No LinkedIn-related errors
- [ ] Environment variables are set
- [ ] API keys are valid
- [ ] First article posted successfully

## 📝 Monitoring

**Check Articles:**
https://dev.to/hkj13

**Railway Logs:**
Projects → devto-post-scheduler → Logs

**OpenAI Usage:**
https://platform.openai.com/usage

---

## 🚀 You're All Set!

The deployment is clean, focused, and ready to go. Just redeploy on Railway and it will work perfectly!
