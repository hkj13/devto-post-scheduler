import OpenAI from 'openai';
import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';

/**
 * Vercel Serverless Function - Cron endpoint
 * Self-contained function for serverless environment
 */

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
        content: {
            topics: (process.env.CONTENT_TOPICS || 'AgenticAI,GenerativeAI,LLM,CloudComputing,DataScience').split(','),
        },
    };
}

// Generate article using OpenAI
async function generateArticle(topic, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const prompt = `Write a concise, engaging technical article about "${topic}" for Dev.to.
    
Requirements:
- Title: Catchy, specific, under 60 characters
- Length: 800-1200 words
- Include practical code examples if relevant
- Use markdown formatting
- Be informative and actionable
- End with a call-to-action for engagement

Return as JSON: {"title": "...", "content": "...", "tags": ["tag1", "tag2", "tag3", "tag4"]}`;

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

// Generate Twitter thread content from article
async function generateTwitterThread(article, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const prompt = `Convert this article into a Twitter/X thread (5-7 tweets).

Article Title: ${article.title}
Article Content: ${article.content.substring(0, 3000)}

Requirements:
- First tweet: Hook that grabs attention (start with emoji)
- Middle tweets: Key insights/tips (one idea per tweet)
- Last tweet: Call-to-action for engagement
- Each tweet max 270 characters
- Include relevant emojis
- Make it valuable standalone content (not a redirect)

Return as JSON: {"tweets": ["tweet1", "tweet2", "tweet3", ...]}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

// Post to Twitter as a thread
async function postToTwitter(article, config) {
    const client = new TwitterApi({
        appKey: config.twitter.apiKey,
        appSecret: config.twitter.apiSecret,
        accessToken: config.twitter.accessToken,
        accessSecret: config.twitter.accessTokenSecret,
    });

    // Generate thread content
    const threadData = await generateTwitterThread(article, config);
    const tweets = threadData.tweets;
    
    // Post first tweet
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

        // Pick random topic
        const topic = config.content.topics[Math.floor(Math.random() * config.content.topics.length)];
        console.log(`📋 Topic: ${topic}`);

        // Generate article
        const article = await generateArticle(topic, config);
        console.log(`✅ Generated: "${article.title}"`);

        // Post to platforms
        const results = [];

        if (config.devto.enabled && config.devto.apiKey) {
            try {
                const result = await postToDevto(article, config);
                results.push(result);
                console.log(`✅ Posted to Dev.to: ${result.url}`);
            } catch (e) {
                console.error('Dev.to error:', e.message);
                results.push({ platform: 'devto', error: e.message });
            }
        }

        if (config.twitter.enabled && config.twitter.apiKey) {
            try {
                const result = await postToTwitter(article, config);
                results.push(result);
                console.log(`✅ Posted to Twitter`);
            } catch (e) {
                console.error('Twitter error:', e.message);
                results.push({ platform: 'twitter', error: e.message });
            }
        }

        return res.status(200).json({
            success: true,
            topic,
            title: article.title,
            platforms: results
        });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}
