# 🚀 AutoContent Studio - Self-Service Setup Guide

**Congratulations on your purchase!** 🎉

This guide will get you up and running in **15 minutes**. Everything is automated - just follow these steps.

---

## ✅ What You'll Get Running

- ✅ AI-generated blog posts daily
- ✅ Posted to Dev.to, Medium, and Twitter automatically
- ✅ GPT-4 content + DALL-E cover images
- ✅ Runs 24/7 on the cloud (Railway)

---

## 🎯 Setup Steps (15 minutes)

### Step 1: Get Your API Keys (5 minutes)

You need 2 API keys to start. Get them here:

#### A) OpenAI API Key (Required)
1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-proj-...`)
5. **Cost:** ~$5-15/month for content generation

#### B) Dev.to API Key (Required)
1. Go to: https://dev.to/settings/extensions
2. Generate API Key
3. Copy it
4. **Cost:** FREE!

#### C) Medium Integration Token (Optional)
1. Go to: https://medium.com/me/settings/security
2. Scroll to "Integration tokens"
3. Generate token
4. **Cost:** FREE!

#### D) Twitter Bearer Token (Optional)
1. Go to: https://developer.twitter.com/
2. Create app (need Elevated Access)
3. Get Bearer Token
4. **Cost:** FREE!

---

### Step 2: Deploy on Railway (5 minutes)

Railway hosts your automation for FREE (starter plan).

**Click this link to deploy:**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/c5xDfM?referralCode=alphasec)

**OR manually:**

1. Go to: https://railway.app/
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Connect: `https://github.com/hkj13/automated-post-scheduler`
5. Click **"Deploy"**

---

### Step 3: Configure Environment Variables (3 minutes)

In Railway dashboard → Your Project → **Variables** tab:

**Add these variables:**

```bash
# REQUIRED
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
DEVTO_API_KEY=YOUR_DEVTO_KEY_HERE

# Platform Control (enable/disable)
DEVTO_ENABLED=true
MEDIUM_ENABLED=false
TWITTER_ENABLED=false

# Optional: Medium (if you want it)
MEDIUM_API_KEY=your_medium_token
MEDIUM_ENABLED=true

# Optional: Twitter (if you want it)
TWITTER_BEARER_TOKEN=your_twitter_token
TWITTER_ENABLED=true
TWITTER_POST_TYPE=single

# Schedule (when to post)
POST_SCHEDULE=0 9 * * *

# Content Topics (comma-separated)
CONTENT_TOPICS=AgenticAI,GenerativeAI,LLM,CloudAI,DataScience,ML

# Optional
POST_ON_STARTUP=false
LOG_LEVEL=info
```

**Save changes** → Railway auto-deploys!

---

### Step 4: Verify It's Working (2 minutes)

1. Go to Railway → Your project → **Deployments** tab
2. Check logs - should see:
   ```
   ✅ Configuration validated successfully
   ✅ Dev.to API key verified
   🚀 AutoContent Studio started successfully!
   ```

3. **First post:** Tomorrow at 9 AM UTC (or your scheduled time)

**Want to test immediately?**
- Add: `POST_ON_STARTUP=true` to variables
- Restart deployment
- Check Dev.to in 2 minutes!

---

## 🎉 You're Done!

**What happens now:**

- Every day at 9 AM UTC, a new post is generated
- Posted automatically to your enabled platforms
- Check Railway logs to see activity
- Check your Dev.to/Medium/Twitter for published posts

**No manual work needed!** 🎊

---

## ⚙️ Customization

### Change Posting Schedule

Edit `POST_SCHEDULE` variable in Railway:

```bash
# Daily at 9 AM UTC
POST_SCHEDULE=0 9 * * *

# Daily at 6 PM UTC
POST_SCHEDULE=0 18 * * *

# Every 12 hours
POST_SCHEDULE=0 */12 * * *

# Monday, Wednesday, Friday at 9 AM
POST_SCHEDULE=0 9 * * 1,3,5
```

[Learn cron syntax →](https://crontab.guru/)

### Change Content Topics

Edit `CONTENT_TOPICS` variable:

```bash
# AI & ML focus
CONTENT_TOPICS=AgenticAI,LLM,MachineLearning,DeepLearning

# Cloud & DevOps
CONTENT_TOPICS=CloudComputing,DevOps,Kubernetes,Docker

# Data Science
CONTENT_TOPICS=DataScience,Analytics,BigData,Python

# Mix everything
CONTENT_TOPICS=AgenticAI,GenerativeAI,LLM,CloudAI,DataScience,ML,MLOps
```

### Enable/Disable Platforms

In Railway variables:

```bash
# Dev.to only
DEVTO_ENABLED=true
MEDIUM_ENABLED=false
TWITTER_ENABLED=false

# All 3 platforms
DEVTO_ENABLED=true
MEDIUM_ENABLED=true
TWITTER_ENABLED=true
```

---

## 📊 Monitor Your Posts

### Check Logs (Railway)
- Railway Dashboard → Your project → **Logs**
- See when posts are created
- View URLs of published articles

### Check Published Content
- **Dev.to:** https://dev.to/yourusername
- **Medium:** https://medium.com/@yourusername
- **Twitter:** https://twitter.com/yourusername

---

## 🆘 Troubleshooting

### "Missing required environment variables" Error
**Solution:** Make sure you added `OPENAI_API_KEY` and `DEVTO_API_KEY` in Railway variables

### "API key is invalid" Error
**Solution:** 
- Dev.to: Regenerate API key at https://dev.to/settings/extensions
- OpenAI: Check your key hasn't expired

### "No posts appearing" Issue
**Solution:**
- Check Railway logs for errors
- Verify `POST_SCHEDULE` is set correctly
- Try `POST_ON_STARTUP=true` to test immediately
- Check your OpenAI account has credits

### Medium/Twitter Not Posting
**Solution:**
- Make sure `MEDIUM_ENABLED=true` or `TWITTER_ENABLED=true`
- Verify API keys are correct
- Check Railway logs for specific errors

---

## 💰 Costs Breakdown

### Monthly Running Costs:

| Service | Cost | Notes |
|---------|------|-------|
| **Railway** | $0-5 | Free tier available, $5 for hobby |
| **OpenAI** | $5-15 | GPT-4 + DALL-E usage |
| **Dev.to** | FREE | No cost |
| **Medium** | FREE | No cost |
| **Twitter** | FREE | API is free |
| **Total** | **$5-20/month** | Minimal operating cost |

**Your subscription:** ₹2,999/month covers all features and support.

---

## 🎓 Advanced Features

### Post Immediately on Startup

Great for testing:
```bash
POST_ON_STARTUP=true
```

### Use Different AI Model

```bash
OPENAI_MODEL=gpt-4-turbo-preview  # Latest (default)
OPENAI_MODEL=gpt-4                 # Standard GPT-4
```

### Detailed Logging

```bash
LOG_LEVEL=debug  # More detailed logs
LOG_LEVEL=info   # Standard (default)
```

---

## 📞 Need Help?

### Quick Fixes:
1. **Restart Railway deployment** (fixes 80% of issues)
2. **Check environment variables** are correct
3. **View Railway logs** for error messages

### Still Stuck?

**Email:** contact@grolytix.com  
**Response:** Within 24 hours  
**Include:** Screenshot of Railway logs + describe issue

---

## 🔄 Updates & Maintenance

**Automatic updates:**
- Railway auto-deploys from GitHub
- New features added regularly
- No manual updates needed!

**Stay informed:**
- Watch the GitHub repo: https://github.com/hkj13/automated-post-scheduler
- Check for new features

---

## 🎁 Bonus Resources

### Documentation
- **Full setup guide:** https://github.com/hkj13/automated-post-scheduler/blob/main/MULTI-PLATFORM-SETUP.md
- **Railway docs:** https://docs.railway.app/

### API Documentation
- **Dev.to API:** https://developers.forem.com/api
- **Medium API:** https://github.com/Medium/medium-api-docs
- **Twitter API:** https://developer.twitter.com/en/docs
- **OpenAI API:** https://platform.openai.com/docs

### Community
- **GitHub Issues:** Report bugs or request features
- **Email support:** contact@grolytix.com

---

## ✅ Setup Checklist

Use this to track your progress:

- [ ] Got OpenAI API key
- [ ] Got Dev.to API key
- [ ] Created Railway account
- [ ] Deployed project on Railway
- [ ] Added environment variables
- [ ] Verified deployment is running
- [ ] Checked logs show "started successfully"
- [ ] Saw first post published (or tested with POST_ON_STARTUP)
- [ ] Customized topics and schedule
- [ ] Enabled additional platforms (optional)

**All checked?** You're fully set up! 🎉

---

## 🚀 Next Steps

1. **Wait for first post** (scheduled time)
2. **Check your platforms** for published content
3. **Monitor Railway logs** to see activity
4. **Engage with readers** who comment
5. **Enjoy your automated content!** ☕

---

**Congratulations!** You've successfully set up AutoContent Studio.

Your content marketing is now on autopilot. Focus on growing your audience while AI handles the content creation.

**Questions?** Email contact@grolytix.com

---

© 2025 AutoContent Studio | Powered by Grolytix  
**Subscription:** ₹2,999/month | Cancel anytime by emailing contact@grolytix.com
