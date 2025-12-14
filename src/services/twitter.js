import { TwitterApi } from 'twitter-api-v2';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';

/**
 * Twitter/X API Service (v2) with OAuth 1.0a
 * Docs: https://developer.twitter.com/en/docs/twitter-api
 */

let twitterClient = null;

/**
 * Get Twitter client with OAuth 1.0a authentication
 */
function getTwitterClient() {
    if (!twitterClient) {
        twitterClient = new TwitterApi({
            appKey: config.twitter.apiKey,
            appSecret: config.twitter.apiSecret,
            accessToken: config.twitter.accessToken,
            accessSecret: config.twitter.accessTokenSecret,
        });
    }
    return twitterClient;
}

/**
 * Post a tweet
 * @param {string} text - Tweet text (max 280 characters)
 * @returns {Promise<Object>} - Tweet data
 */
async function postTweet(text) {
    try {
        logger.info('Posting tweet to Twitter...');
        
        // Truncate if too long
        const tweetText = text.length > 280 ? text.substring(0, 277) + '...' : text;
        
        const client = getTwitterClient();
        const tweet = await client.v2.tweet(tweetText);

        logger.info(`✅ Tweet posted successfully!`);
        logger.info(`Tweet ID: ${tweet.data.id}`);
        
        const tweetUrl = `https://twitter.com/i/status/${tweet.data.id}`;
        logger.info(`Tweet URL: ${tweetUrl}`);

        return {
            id: tweet.data.id,
            text: tweet.data.text,
            url: tweetUrl,
        };
    } catch (error) {
        logger.error('Error posting to Twitter:', error.message);
        throw error;
    }
}

/**
 * Post a thread (multiple tweets)
 * @param {string[]} tweets - Array of tweet texts
 * @returns {Promise<Object[]>} - Array of tweet data
 */
async function postThread(tweets) {
    try {
        logger.info(`Posting thread with ${tweets.length} tweets...`);
        
        const client = getTwitterClient();
        const postedTweets = [];
        let previousTweetId = null;

        for (let i = 0; i < tweets.length; i++) {
            const tweetText = tweets[i].length > 280 ? tweets[i].substring(0, 277) + '...' : tweets[i];
            
            let tweet;
            if (previousTweetId) {
                // Reply to previous tweet for threading
                tweet = await client.v2.reply(tweetText, previousTweetId);
            } else {
                // First tweet in thread
                tweet = await client.v2.tweet(tweetText);
            }

            postedTweets.push({
                id: tweet.data.id,
                text: tweet.data.text,
                url: `https://twitter.com/i/status/${tweet.data.id}`,
            });

            previousTweetId = tweet.data.id;
            logger.info(`✅ Posted tweet ${i + 1}/${tweets.length}`);

            // Small delay between tweets to avoid rate limits
            if (i < tweets.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        logger.info('✅ Thread posted successfully!');
        return postedTweets;
    } catch (error) {
        logger.error('Error posting thread:', error.message);
        throw error;
    }
}

/**
 * Verify Twitter API access
 */
async function verifyApiKey() {
    try {
        logger.info('Verifying Twitter API access...');
        
        const client = getTwitterClient();
        const me = await client.v2.me();

        logger.info(`✅ Twitter API verified. Username: @${me.data.username}`);
        return true;
    } catch (error) {
        logger.error('Twitter API verification failed:', error.message);
        return false;
    }
}

/**
 * Generate tweet from article (summary + link)
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @param {string} url - Article URL
 * @returns {string} - Tweet text
 */
function generateTweetFromArticle(title, content, url) {
    // Create engaging tweet
    const hook = "📝 New article:";
    const maxTitleLength = 220 - hook.length - url.length - 10; // Reserve space
    
    const truncatedTitle = title.length > maxTitleLength 
        ? title.substring(0, maxTitleLength) + '...'
        : title;
    
    const tweet = `${hook} ${truncatedTitle}\n\n${url}\n\n#AI #TechBlog #Development`;
    
    return tweet.substring(0, 280); // Ensure it fits
}

/**
 * Generate thread from article content
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @param {string} url - Article URL
 * @returns {string[]} - Array of tweet texts
 */
function generateThreadFromArticle(title, content, url) {
    const tweets = [];
    
    // First tweet: Hook + title
    tweets.push(`🧵 Thread: ${title}\n\nLet me break this down... 👇`);
    
    // Extract key points from content (simple approach)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Create 2-3 middle tweets with key points
    let currentTweet = '';
    let tweetCount = 0;
    
    for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (currentTweet.length + trimmed.length + 3 < 270 && tweetCount < 3) {
            currentTweet += (currentTweet ? '. ' : '') + trimmed;
        } else if (currentTweet) {
            tweets.push(currentTweet + '.');
            currentTweet = trimmed;
            tweetCount++;
        }
        
        if (tweetCount >= 3) break;
    }
    
    if (currentTweet && tweetCount < 3) {
        tweets.push(currentTweet + '.');
    }
    
    // Final tweet: CTA + link
    tweets.push(`Read the full article here:\n\n${url}\n\n#AI #MachineLearning #TechBlog`);
    
    return tweets.slice(0, 5); // Max 5 tweets in thread
}

export default {
    postTweet,
    postThread,
    verifyApiKey,
    generateTweetFromArticle,
    generateThreadFromArticle,
};
