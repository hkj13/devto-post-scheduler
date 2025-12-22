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
    const hour = now.getUTCHours();
    
    // Monday first post (before 8 AM UTC) = Tech Recap
    // Other Monday posts = regular topics
    const timeSlot = hour < 8 ? 0 : hour < 16 ? 1 : 2;
    
    if (dayOfWeek === 1 && timeSlot === 0) {
        return { isRecap: true };
    }
    
    // Rotate through categories based on date
    const startOfYear = new Date(now.getUTCFullYear(), 0, 0);
    const diff = now - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Create index based on day and time slot (3 posts per day)
    const index = (dayOfYear * 3 + timeSlot) % TOPIC_CATEGORIES.length;
    
    return { isRecap: false, category: TOPIC_CATEGORIES[index] };
}

// Get recent topic history from Dev.to API
async function getRecentTopics(config) {
    try {
        const response = await axios.get('https://dev.to/api/articles/me/published', {
            headers: { 'api-key': config.devto.apiKey },
            params: { per_page: 30 } // Last 30 articles
        });
        
        return response.data.map(article => ({
            title: article.title,
            tags: article.tag_list,
            published_at: article.published_at
        }));
    } catch (error) {
        console.warn('Could not fetch recent topics:', error.message);
        return [];
    }
}

// AI autonomously chooses specific topic and approach (with history awareness)
async function chooseTopicAndApproach(category, recentTopics, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    // Build context of recent topics
    const recentTopicsContext = recentTopics.length > 0 
        ? `\n\nRECENT TOPICS TO AVOID (last 30 posts):\n${recentTopics.map(t => `- ${t.title} [${t.tags.join(', ')}]`).join('\n')}\n\nIMPORTANT: Choose a DIFFERENT topic that hasn't been covered recently.`
        : '';
    
    const prompt = `You are a technical content strategist. Choose a SPECIFIC, IN-DEPTH topic within "${category}".
${recentTopicsContext}

Requirements:
1. Pick a specific subtopic that's:
   - Practical and actionable
   - Has tutorial/walkthrough potential
   - Includes code examples or step-by-step guides
   - Covers recent tools/frameworks (2024-2025)
   - NOT similar to any recent topics listed above

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

// Search for real tech news using web search
async function searchRealTechNews(dateRange) {
    const searchQueries = [
        `tech news ${dateRange} AI machine learning releases`,
        `developer tools releases ${dateRange}`,
        `cloud computing AWS Azure GCP news ${dateRange}`,
        `startup funding rounds ${dateRange}`,
        `open source releases ${dateRange} GitHub trending`,
    ];
    
    const allNews = [];
    
    for (const query of searchQueries) {
        try {
            // Use a simple approach: construct search URL and note that real implementation 
            // would need actual web scraping or news API
            const searchUrl = `https://news.ycombinator.com/search?q=${encodeURIComponent(query)}&dateRange=pastWeek`;
            allNews.push({ query, note: 'Real-time search would be implemented here' });
        } catch (error) {
            console.warn(`Search failed for: ${query}`);
        }
    }
    
    return allNews;
}

// Generate Weekly Tech Recap with REAL news (runs on Mondays)
async function generateWeeklyRecap(config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 7);
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - 1);
    
    const dateRange = `${lastMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    
    const prompt = `CRITICAL: You are creating a FACTUAL tech news recap for ${dateRange}.

⚠️ STRICT RULES - MUST FOLLOW:
1. DO NOT invent company names, product names, or version numbers
2. DO NOT make up funding amounts or acquisition details
3. DO NOT fabricate specific metrics or statistics
4. If you don't have verified information, write about GENERAL TRENDS instead
5. Use phrases like "Industry reports suggest..." or "Developers are discussing..." for trends
6. NEVER claim specific version releases unless you're 100% certain

ACCEPTABLE CONTENT APPROACH:
Instead of fake news, focus on:
- General industry trends and discussions in the tech community
- Ongoing developments in AI, cloud, and developer tools
- Common challenges developers are facing
- Emerging patterns in software development
- Technology adoption trends

STRUCTURE:
Write a thoughtful analysis of current tech trends and community discussions, NOT fake news announcements.

Sections:
1. **AI & ML Trends** - What the community is discussing, not fake product launches
2. **Developer Experience** - Common topics in developer communities
3. **Cloud & Infrastructure** - General adoption patterns and discussions
4. **Startup Ecosystem** - Overall funding climate and trends
5. **Open Source** - Community activity and popular topics

FORMAT:
1. DEV.TO ARTICLE:
- Title: "Tech Trends & Community Insights (${dateRange})" - under 60 chars
- Content: 1000-1500 words, markdown
- Focus on REAL trends, not fabricated news
- Tags: ["techtrends", "community", "insights", "webdev"]

2. TWITTER THREAD (7-8 tweets):
- Tweet 1: "� Tech Community Insights (${dateRange}) - What developers are talking about 🧵"
- Tweets 2-7: One trend/insight per tweet
- Tweet 8: "What trends are you seeing? #TechCommunity #DevDiscussion"

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article...",
  "tags": ["techtrends", "community", "insights", "webdev"],
  "thread": ["tweet1", "tweet2", ...]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7, // Lower temperature for more factual content
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
            console.log(`📂 Category: ${categoryData.category}`);
            
            // Fetch recent topics to avoid repetition
            console.log(`📚 Fetching recent topic history...`);
            const recentTopics = await getRecentTopics(config);
            console.log(`📊 Found ${recentTopics.length} recent posts`);
            
            console.log(`🤖 AI choosing specific topic and approach...`);
            const topicData = await chooseTopicAndApproach(categoryData.category, recentTopics, config);
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
