# Vercel Deployment Guide

## Quick Setup

### 1. Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### 2. Deploy to Vercel
```bash
cd /Users/hk/CascadeProjects/devto-post-scheduler
vercel
```

Follow the prompts to link/create your project.

### 3. Add Environment Variables in Vercel Dashboard

Go to: https://vercel.com/[your-username]/[project-name]/settings/environment-variables

Add these variables:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DEVTO_API_KEY` - Your Dev.to API key
- `DEVTO_ENABLED` - `true`
- `CRON_SECRET` - A random secret string (e.g., generate with `openssl rand -hex 32`)

Optional (if using other platforms):
- `MEDIUM_API_KEY`, `MEDIUM_ENABLED`
- `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`, `TWITTER_ENABLED`

### 4. Set Up External Cron (Free)

Since Vercel free tier limits cron jobs, use **cron-job.org** (free):

1. Go to https://cron-job.org and create a free account
2. Create a new cron job:
   - **URL**: `https://your-vercel-app.vercel.app/api/cron`
   - **Schedule**: Every 8 hours (for 3 posts/day) or customize
   - **Headers**: Add `x-cron-secret: YOUR_CRON_SECRET_VALUE`
3. Save and enable the job

### 5. Test the Endpoint

```bash
# Test health endpoint
curl https://your-vercel-app.vercel.app/api/health

# Test cron endpoint (with secret)
curl -H "x-cron-secret: YOUR_CRON_SECRET" https://your-vercel-app.vercel.app/api/cron
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET/POST /api/cron` | Trigger content generation and posting |

## Recommended Cron Schedules

For ~3 posts/day (optimal global reach):
- **06:00 UTC** - Asia/Europe morning
- **14:00 UTC** - US morning (9 AM EST)
- **18:00 UTC** - US afternoon peak

In cron-job.org, create 3 separate jobs or use: `0 6,14,18 * * *`

## Local Development

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/cron
```

## Migrating from Railway

1. Delete or pause your Railway deployment
2. Your environment variables are the same - just copy them to Vercel
3. The cron is now handled externally via cron-job.org

## Cost Comparison

| Platform | Cost |
|----------|------|
| Railway | $5+/month after trial |
| Vercel + cron-job.org | **FREE** |
