import axios from 'axios';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';

/**
 * Twitter/X API Service (v2)
 * Docs: https://developer.twitter.com/en/docs/twitter-api
 */

const TWITTER_API_BASE = 'https://api.twitter.com/2';

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
        
        const response = await axios.post(
            `${TWITTER_API_BASE}/tweets`,
            { text: tweetText },
            {
                headers: {
                    'Authorization': `Bearer ${config.twitter.bearerToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const tweet = response.data.data;
        logger.info(`✅ Tweet posted successfully!`);
        logger.info(`Tweet ID: ${tweet.id}`);
        
        const tweetUrl = `https://twitter.com/user/status/${tweet.id}`;
        logger.info(`Tweet URL: ${tweetUrl}`);

        return {
            id: tweet.id,
            text: tweet.text,
            url: tweetUrl,
        };
    } catch (error) {
        logger.error('Error posting to Twitter:', error.response?.data || error.message);
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
        
        const postedTweets = [];
        let previousTweetId = null;

        for (let i = 0; i < tweets.length; i++) {
            const tweetText = tweets[i].length > 280 ? tweets[i].substring(0, 277) + '...' : tweets[i];
            
            const payload = {
                text: tweetText,
            };

            // Add reply reference for threading
            if (previousTweetId) {
                payload.reply = {
                    in_reply_to_tweet_id: previousTweetId,
                };
            }

            const response = await axios.post(
                `${TWITTER_API_BASE}/tweets`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${config.twitter.bearerToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const tweet = response.data.data;
            postedTweets.push({
                id: tweet.id,
                text: tweet.text,
                url: `https://twitter.com/user/status/${tweet.id}`,
            });

            previousTweetId = tweet.id;
            logger.info(`✅ Posted tweet ${i + 1}/${tweets.length}`);

            // Small delay between tweets to avoid rate limits
            if (i < tweets.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        logger.info('✅ Thread posted successfully!');
        return postedTweets;
    } catch (error) {
        logger.error('Error posting thread:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Verify Twitter API access
 */
async function verifyApiKey() {
    try {
        logger.info('Verifying Twitter API access...');
        
        // Try to get user info
        const response = await axios.get(
            `${TWITTER_API_BASE}/users/me`,
            {
                headers: {
                    'Authorization': `Bearer ${config.twitter.bearerToken}`,
                },
            }
        );

        logger.info(`✅ Twitter API verified. Username: @${response.data.data.username}`);
        return true;
    } catch (error) {
        logger.error('Twitter API verification failed');
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
