import OpenAI from 'openai';
import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';

/**
 * Vercel Serverless Function - Cron endpoint
 * Self-contained function for serverless environment
 */

// High-level topic categories for AI to explore autonomously
const TOPIC_CATEGORIES = [
    "Agentic AI & Autonomous Systems",
    "Generative AI & Diffusion Models",
    "Large Language Models (LLMs)",
    "Cloud Computing & Infrastructure",
    "System Design & Architecture",
    "Data Science & Machine Learning",
    "Web Development & Frontend",
    "Backend Development & APIs",
    "Product Management & Strategy",
    "DevOps & Platform Engineering",
    "Mobile Development",
    "Blockchain & Web3",
    "Cybersecurity",
    "Database Systems",
    "Software Testing & QA",
];

// Configuration from environment
function getConfig() {
    return {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        },
        devto: {
            apiKey: process.env.DEVTO_API_KEY,
            enabled: process.env.DEVTO_ENABLED === 'true',
        },
        twitter: {
            apiKey: process.env.TWITTER_API_KEY,
            apiSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
            enabled: process.env.TWITTER_ENABLED === 'true',
        },
    };
}

// Get category for today using rotation
function getCategoryForToday() {
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday
    
    // Monday = Tech Recap
    if (dayOfWeek === 1) {
        return { isRecap: true };
    }
    
    // Rotate through categories based on date
    const startOfYear = new Date(now.getUTCFullYear(), 0, 0);
    const diff = now - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hour = now.getUTCHours();
    
    // Create index based on day and time slot (3 posts per day)
    const timeSlot = hour < 8 ? 0 : hour < 16 ? 1 : 2;
    const index = (dayOfYear * 3 + timeSlot) % TOPIC_CATEGORIES.length;
    
    return { isRecap: false, category: TOPIC_CATEGORIES[index] };
}

// AI autonomously chooses specific topic and approach
async function chooseTopicAndApproach(category, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const prompt = `You are a technical content strategist. Choose a SPECIFIC, IN-DEPTH topic within "${category}".

Requirements:
1. Pick a specific subtopic that's:
   - Practical and actionable
   - Has tutorial/walkthrough potential
   - Includes code examples or step-by-step guides
   - Covers recent tools/frameworks (2024-2026)

2. Choose the content type:
   - "tutorial": Step-by-step guide with code
   - "deep-dive": Technical explanation with examples
   - "comparison": Tool/framework comparison with use cases
   - "best-practices": Patterns and anti-patterns
   - "case-study": Real-world implementation

3. Define the depth level:
   - "beginner": Fundamentals with simple examples
   - "intermediate": Practical implementation details
   - "advanced": Performance, scaling, edge cases

Return as JSON:
{
  "topic": "Specific topic title (e.g., 'Building RAG with LangChain and Pinecone')",
  "contentType": "tutorial|deep-dive|comparison|best-practices|case-study",
  "depthLevel": "beginner|intermediate|advanced",
  "keyPoints": ["point1", "point2", "point3"],
  "toolsToMention": ["tool1", "tool2"]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.9, // Higher temperature for more variety
    });

    return JSON.parse(response.choices[0].message.content);
}

// Generate Weekly Tech Recap (runs on Mondays)
async function generateWeeklyRecap(config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 7);
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - 1);
    
    const dateRange = `${lastMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    
    const prompt = `Create a "Weekly Tech Recap" for ${dateRange} covering the LATEST news and developments.

You are a tech journalist. Research and summarize the most important tech and product news from this past week.

Include sections on:
1. **AI & Machine Learning** - Latest model releases, breakthroughs, company announcements
2. **Developer Tools** - New frameworks, languages updates, IDE improvements
3. **Cloud & Infrastructure** - AWS/GCP/Azure updates, Kubernetes news
4. **Product & Startups** - Funding rounds, product launches, acquisitions
5. **Open Source** - Notable releases, trending repos

FORMAT:
1. DEV.TO ARTICLE:
- Title: "Weekly Tech Recap: [Key Highlight] (${dateRange})" - under 60 chars
- Content: 1000-1500 words, markdown, organized by sections above
- Include specific names, versions, and details
- Tags: ["techrecap", "news", "ai", "webdev"]

2. TWITTER THREAD (7-8 tweets):
- Tweet 1: "🗞️ Weekly Tech Recap (${dateRange}) - Here's what you missed! 🧵"
- Tweets 2-7: One highlight per tweet with emoji
- Tweet 8: "Follow for weekly recaps! #TechNews #DevNews"

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article...",
  "tags": ["techrecap", "news", "ai", "webdev"],
  "thread": ["tweet1", "tweet2", ...]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

// Generate content based on AI-chosen topic and approach
async function generateContent(topicData, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const contentTypeInstructions = {
        tutorial: `Create a STEP-BY-STEP TUTORIAL with:
- Prerequisites and setup instructions
- Numbered steps with code examples for each
- Expected output/results after each step
- Troubleshooting common issues
- Final working example`,
        
        'deep-dive': `Create an IN-DEPTH TECHNICAL EXPLANATION with:
- How it works under the hood
- Architecture diagrams (described in text)
- Code examples showing internals
- Performance characteristics
- When to use vs alternatives`,
        
        comparison: `Create a DETAILED COMPARISON with:
- Side-by-side feature comparison table
- Code examples for each option
- Use case scenarios for each
- Pros and cons
- Recommendation based on needs`,
        
        'best-practices': `Create a BEST PRACTICES GUIDE with:
- Do's and Don'ts with examples
- Common anti-patterns to avoid
- Code examples of good vs bad
- Real-world scenarios
- Checklist for implementation`,
        
        'case-study': `Create a REAL-WORLD CASE STUDY with:
- Problem statement
- Solution architecture
- Implementation details with code
- Challenges faced and solutions
- Results and metrics`
    };
    
    const depthInstructions = {
        beginner: "Explain concepts from scratch. Include definitions, simple examples, and avoid jargon.",
        intermediate: "Assume basic knowledge. Focus on practical implementation, patterns, and real-world usage.",
        advanced: "Cover edge cases, performance optimization, scaling, and production considerations."
    };
    
    const prompt = `Create content about: "${topicData.topic}"

CONTENT TYPE: ${topicData.contentType}
${contentTypeInstructions[topicData.contentType]}

DEPTH LEVEL: ${topicData.depthLevel}
${depthInstructions[topicData.depthLevel]}

KEY POINTS TO COVER:
${topicData.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

TOOLS/FRAMEWORKS TO MENTION: ${topicData.toolsToMention.join(', ')}

FORMAT FOR TWO PLATFORMS:

1. DEV.TO ARTICLE:
- Title: Actionable and specific, under 60 characters
- Content: 1200-1800 words, markdown format
- Include 3-5 code blocks with syntax highlighting
- Add a "What You'll Learn" section at the start
- Include a "Next Steps" section at the end
- Tags: 4 relevant tags (lowercase, no spaces)

2. TWITTER THREAD (6-8 tweets):
- Tweet 1: Hook with emoji + "A thread 🧵"
- Tweets 2-6: Key takeaways with code snippets (max 270 chars)
- Tweet 7: "Want to learn more?" + link placeholder
- Tweet 8: Hashtags and call-to-action

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article...",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "thread": ["tweet1", "tweet2", "tweet3", "tweet4", "tweet5", "tweet6", "tweet7", "tweet8"]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

// Post to Dev.to
async function postToDevto(article, config) {
    const response = await axios.post(
        'https://dev.to/api/articles',
        {
            article: {
                title: article.title,
                body_markdown: article.content,
                published: true,
                tags: article.tags.slice(0, 4),
            },
        },
        {
            headers: {
                'api-key': config.devto.apiKey,
                'Content-Type': 'application/json',
            },
        }
    );
    return { platform: 'devto', url: response.data.url, id: response.data.id };
}

// Post to Twitter as a thread (uses pre-generated thread from OpenAI)
async function postToTwitter(content, config) {
    const client = new TwitterApi({
        appKey: config.twitter.apiKey,
        appSecret: config.twitter.apiSecret,
        accessToken: config.twitter.accessToken,
        accessSecret: config.twitter.accessTokenSecret,
    });

    // Use the thread generated by OpenAI
    const tweets = content.thread || [];
    
    // Post thread
    let lastTweetId = null;
    const postedTweets = [];
    
    for (let i = 0; i < tweets.length; i++) {
        const tweetText = tweets[i].substring(0, 280);
        
        const options = lastTweetId 
            ? { reply: { in_reply_to_tweet_id: lastTweetId } }
            : {};
        
        const response = await client.v2.tweet(tweetText, options);
        lastTweetId = response.data.id;
        postedTweets.push(response.data.id);
    }
    
    return { platform: 'twitter', threadId: postedTweets[0], tweetCount: postedTweets.length };
}

export default async function handler(req, res) {
    // Verify the request
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && req.headers['x-cron-secret'] !== cronSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const config = getConfig();
        console.log('🚀 Starting content generation...');

        // Validate
        if (!config.openai.apiKey) {
            throw new Error('OPENAI_API_KEY is required');
        }

        const enabledPlatforms = [];
        if (config.devto.enabled) enabledPlatforms.push('Dev.to');
        if (config.twitter.enabled) enabledPlatforms.push('Twitter');

        if (enabledPlatforms.length === 0) {
            throw new Error('No platforms enabled. Set DEVTO_ENABLED=true or TWITTER_ENABLED=true');
        }

        console.log(`📱 Enabled platforms: ${enabledPlatforms.join(', ')}`);

        // Get category for today (uses date-based rotation)
        const categoryData = getCategoryForToday();
        let content, topicInfo;
        
        if (categoryData.isRecap) {
            // Monday = Weekly Tech Recap
            console.log(`📰 Generating Weekly Tech Recap...`);
            content = await generateWeeklyRecap(config);
            topicInfo = { type: 'weekly_recap', category: 'recap', topic: 'Weekly Tech Recap' };
        } else {
            // AI autonomously chooses specific topic and approach
            console.log(`� Category: ${categoryData.category}`);
            console.log(`🤖 AI choosing specific topic and approach...`);
            
            const topicData = await chooseTopicAndApproach(categoryData.category, config);
            console.log(`📋 Topic: ${topicData.topic}`);
            console.log(`📝 Type: ${topicData.contentType} (${topicData.depthLevel})`);
            
            content = await generateContent(topicData, config);
            topicInfo = { 
                type: 'autonomous', 
                category: categoryData.category, 
                topic: topicData.topic,
                contentType: topicData.contentType,
                depthLevel: topicData.depthLevel
            };
        }
        
        console.log(`✅ Generated: "${content.title}"`);
        console.log(`📝 Article: ${content.content.length} chars`);
        console.log(`🧵 Thread: ${content.thread?.length || 0} tweets`);

        // Post to platforms
        const results = [];

        if (config.devto.enabled && config.devto.apiKey) {
            try {
                const result = await postToDevto(content, config);
                results.push(result);
                console.log(`✅ Posted to Dev.to: ${result.url}`);
            } catch (e) {
                console.error('Dev.to error:', e.message);
                results.push({ platform: 'devto', error: e.message });
            }
        }

        if (config.twitter.enabled && config.twitter.apiKey) {
            try {
                const result = await postToTwitter(content, config);
                results.push(result);
                console.log(`✅ Posted to Twitter: ${result.tweetCount} tweets`);
            } catch (e) {
                console.error('Twitter error:', e.message);
                results.push({ platform: 'twitter', error: e.message });
            }
        }

        return res.status(200).json({
            success: true,
            ...topicInfo,
            title: content.title,
            platforms: results
        });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}
