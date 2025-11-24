# 🚀 Dev.to AI Post Scheduler

Automated AI-powered technical content posting to Dev.to. Generate and publish high-quality tech articles about AI, ML, Data Science, and emerging technologies using GPT-4 Turbo and DALL-E 3.

![Dev.to](https://img.shields.io/badge/Dev.to-0A0A0A?style=for-the-badge&logo=dev.to&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)

## ✨ Features

- 🤖 **AI-Generated Content** - GPT-4 Turbo creates 300-500 word technical articles
- 🎨 **AI Cover Images** - DALL-E 3 generates professional cover images
- 📅 **Automated Scheduling** - Cron-based daily posting
- 🏷️ **Smart Tags** - Automatic tag generation (ai, machinelearning, etc.)
- 🔒 **Liquid-Safe** - Avoids syntax errors in Dev.to's template engine
- 📊 **Multi-Topic** - AgenticAI, LLM, MLOps, RAG, and more

## 📋 Prerequisites

### 1. Dev.to API Key

1. Go to [Dev.to Settings - Extensions](https://dev.to/settings/extensions)
2. Generate an API Key
3. Copy the key

### 2. OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Go to [API Keys](https://platform.openai.com/api-keys)
3. Create a new key

## 🚀 Quick Start

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/hkj13/devto-post-scheduler.git
cd devto-post-scheduler

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your API keys
# OPENAI_API_KEY=your-key
# DEVTO_API_KEY=your-key

# 5. Test (doesn't post)
npm test

# 6. Start the scheduler
npm start
```

### Railway Deployment

1. **Push to GitHub** (already done!)

2. **Deploy on Railway**:
   - Go to [Railway.app](https://railway.app/new)
   - Select "Deploy from GitHub repo"
   - Choose `hkj13/devto-post-scheduler`

3. **Set Environment Variables** in Railway dashboard:
   ```
   OPENAI_API_KEY=sk-proj-your-key
   DEVTO_API_KEY=your-key
   POST_SCHEDULE=0 9 * * *
   CONTENT_TOPICS=AgenticAI,GenerativeAI,LLM,CloudAI,DataScience,ML
   ```

4. **Verify**:
   - Check logs for: `🚀 Dev.to AI Agent started successfully!`

## 📅 Posting Schedule

Default: Posts daily at 9:00 AM UTC

### Custom Schedules (Cron Format)

```bash
POST_SCHEDULE=0 9 * * *      # Daily at 9 AM
POST_SCHEDULE=0 9,17 * * *   # Twice daily (9 AM, 5 PM)
POST_SCHEDULE=0 9 * * 1-5    # Weekdays only
POST_SCHEDULE=0 */6 * * *    # Every 6 hours
```

## 🎯 Content Topics

Articles are automatically generated about:

- **AgenticAI** - Autonomous AI systems
- **GenerativeAI** - GPT, Claude, DALL-E
- **LLM** - Large Language Models
- **CloudAI** - AI in cloud computing
- **DataScience** - Data analysis and ML
- **ML/MLOps** - Machine Learning operations
- **DeepLearning** - Neural networks
- **NLP** - Natural Language Processing
- **RAG** - Retrieval Augmented Generation
- **ComputerVision** - Image/video AI

## 🖼️ Cover Images

Automatically generated using DALL-E 3:
- Professional tech illustrations
- Vibrant developer-friendly colors
- Abstract geometric patterns
- Clean, modern design

## 🏗️ Project Structure

```
devto-post-scheduler/
├── src/
│   ├── services/
│   │   ├── devto.js                 # Dev.to API
│   │   ├── devtoContentGenerator.js # Article generation
│   │   └── openai.js                # OpenAI integration
│   ├── config/
│   │   └── config.js                # Configuration
│   ├── utils/
│   │   └── logger.js                # Logging
│   └── index.js                     # Main entry point
├── .env.example                     # Template
├── .gitignore
├── package.json
└── README.md
```

## 💰 Cost Estimates

**Per Article:**
- GPT-4 Turbo (content): ~$0.02-0.03
- DALL-E 3 (image): ~$0.04
- **Total**: ~$0.06-0.07 per article

**Monthly (1 post/day):**
- ~$2-3 on OpenAI
- $0 on Dev.to (free API)

## 🛠️ Troubleshooting

### "Missing required environment variables"
- Ensure `OPENAI_API_KEY` and `DEVTO_API_KEY` are set
- In Railway: Check Variables tab

### "Dev.to API key is invalid"
- Generate a new key at [Dev.to Settings](https://dev.to/settings/extensions)
- Update environment variables

### Image Generation Fails
- Articles will still post without images
- Check OpenAI API key and credits

## 📊 Monitoring

**Railway Logs:**
```
✅ Configuration validated successfully
✅ Dev.to API verified. Username: hkj13
🚀 Dev.to AI Agent started successfully!
📅 Scheduling posts with cron expression: 0 9 * * *
⏰ Waiting for scheduled posting time...
```

**View Published Articles:**
https://dev.to/hkj13

## 🔒 Security

- ✅ Never commit `.env` file
- ✅ Use environment variables for all secrets
- ✅ Rotate API keys regularly
- ✅ Monitor API usage

## 📝 Scripts

```bash
npm start      # Start the scheduler
npm test       # Test content generation (no posting)
npm run dev    # Development mode with auto-reload
```

## 📈 Success Indicators

- ✅ Railway logs show "Article published successfully"
- ✅ New articles appear on your Dev.to profile
- ✅ Articles have proper formatting and tags
- ✅ Cover images are displayed
- ✅ No Liquid syntax errors

## 🤝 Contributing

Contributions welcome! Feel free to:
- Add new content topics
- Improve AI prompts
- Enhance image generation
- Add new features

## 📝 License

MIT

---

**Built with ❤️ using GPT-4 Turbo and DALL-E 3**

🌐 Live Articles: [Dev.to/hkj13](https://dev.to/hkj13)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/hkj13/devto-post-scheduler)
