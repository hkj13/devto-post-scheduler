import logger from '../utils/logger.js';
import { config } from '../config/config.js';
import devto from './devto.js';
import medium from './medium.js';
import twitter from './twitter.js';

/**
 * Multi-Platform Poster
 * Posts content to all enabled platforms
 */

/**
 * Post article to all enabled platforms
 * @param {Object} article - Article object with title, content, tags, coverImage
 * @returns {Promise<Object>} - Results from all platforms
 */
async function postToAllPlatforms(article) {
    logger.info('🚀 Starting multi-platform posting...');
    
    const results = {
        success: [],
        failed: [],
        urls: [],
    };

    // Post to Dev.to
    if (config.devto.enabled) {
        try {
            logger.info('📝 Posting to Dev.to...');
            const devtoResult = await devto.postArticle(
                article.title,
                article.content,
                article.tags,
                true, // publish immediately
                article.coverImage
            );
            
            results.success.push('Dev.to');
            results.urls.push({
                platform: 'Dev.to',
                url: devtoResult.url,
                id: devtoResult.id,
            });
            
            logger.info(`✅ Dev.to: ${devtoResult.url}`);
        } catch (error) {
            logger.error(`❌ Dev.to failed: ${error.message}`);
            results.failed.push({
                platform: 'Dev.to',
                error: error.message,
            });
        }
    }

    // Post to Medium
    if (config.medium.enabled) {
        try {
            logger.info('📝 Posting to Medium...');
            
            // Format content with cover image
            const mediumContent = medium.formatContentWithImage(
                article.content,
                article.coverImage
            );
            
            const mediumResult = await medium.postArticle(
                article.title,
                mediumContent,
                article.tags,
                'markdown',
                'public'
            );
            
            results.success.push('Medium');
            results.urls.push({
                platform: 'Medium',
                url: mediumResult.url,
                id: mediumResult.id,
            });
            
            logger.info(`✅ Medium: ${mediumResult.url}`);
        } catch (error) {
            logger.error(`❌ Medium failed: ${error.message}`);
            results.failed.push({
                platform: 'Medium',
                error: error.message,
            });
        }
    }

    // Post to Twitter
    if (config.twitter.enabled) {
        try {
            logger.info('📝 Posting to Twitter...');
            
            let twitterResult;
            
            if (config.twitter.postType === 'thread') {
                // Post as thread
                const devtoUrl = results.urls.find(r => r.platform === 'Dev.to')?.url || '';
                const tweets = twitter.generateThreadFromArticle(
                    article.title,
                    article.content,
                    devtoUrl
                );
                twitterResult = await twitter.postThread(tweets);
                
                results.success.push('Twitter (Thread)');
                results.urls.push({
                    platform: 'Twitter',
                    url: twitterResult[0].url, // First tweet URL
                    id: twitterResult[0].id,
                    type: 'thread',
                    count: twitterResult.length,
                });
            } else {
                // Post single tweet
                const devtoUrl = results.urls.find(r => r.platform === 'Dev.to')?.url || '';
                const tweetText = twitter.generateTweetFromArticle(
                    article.title,
                    article.content,
                    devtoUrl
                );
                twitterResult = await twitter.postTweet(tweetText);
                
                results.success.push('Twitter');
                results.urls.push({
                    platform: 'Twitter',
                    url: twitterResult.url,
                    id: twitterResult.id,
                    type: 'single',
                });
            }
            
            logger.info(`✅ Twitter: ${results.urls[results.urls.length - 1].url}`);
        } catch (error) {
            logger.error(`❌ Twitter failed: ${error.message}`);
            results.failed.push({
                platform: 'Twitter',
                error: error.message,
            });
        }
    }

    // Summary
    logger.info('='.repeat(70));
    logger.info('📊 MULTI-PLATFORM POSTING SUMMARY');
    logger.info('='.repeat(70));
    logger.info(`✅ Successful: ${results.success.join(', ')}`);
    if (results.failed.length > 0) {
        logger.warn(`❌ Failed: ${results.failed.map(f => f.platform).join(', ')}`);
    }
    logger.info('\n🔗 Published URLs:');
    results.urls.forEach(r => {
        logger.info(`   ${r.platform}: ${r.url}`);
    });
    logger.info('='.repeat(70));

    return results;
}

/**
 * Verify all enabled platform APIs
 * @returns {Promise<Object>} - Verification results
 */
async function verifyAllPlatforms() {
    logger.info('Verifying API keys for enabled platforms...');
    
    const verifications = {
        passed: [],
        failed: [],
    };

    if (config.devto.enabled) {
        const isValid = await devto.verifyApiKey();
        if (isValid) {
            verifications.passed.push('Dev.to');
        } else {
            verifications.failed.push('Dev.to');
        }
    }

    if (config.medium.enabled) {
        const isValid = await medium.verifyApiKey();
        if (isValid) {
            verifications.passed.push('Medium');
        } else {
            verifications.failed.push('Medium');
        }
    }

    if (config.twitter.enabled) {
        const isValid = await twitter.verifyApiKey();
        if (isValid) {
            verifications.passed.push('Twitter');
        } else {
            verifications.failed.push('Twitter');
        }
    }

    logger.info(`Verified platforms: ${verifications.passed.join(', ')}`);
    if (verifications.failed.length > 0) {
        logger.warn(`Failed verifications: ${verifications.failed.join(', ')}`);
    }

    return verifications;
}

export default {
    postToAllPlatforms,
    verifyAllPlatforms,
};
