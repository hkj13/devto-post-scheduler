import cron from 'node-cron';
import { config, validateConfig } from './config/config.js';
import logger from './utils/logger.js';
import devtoContentGenerator from './services/devtoContentGenerator.js';
import multiPlatformPoster from './services/multiPlatformPoster.js';

/**
 * Main function to generate and post content to all enabled platforms
 */
async function createAndPost() {
    try {
        logger.info('=====================================');
        logger.info('🚀 Starting multi-platform content generation...');

        // Pick a random topic
        const topics = config.content.topics;
        const topic = topics[Math.floor(Math.random() * topics.length)];

        logger.info(`📋 Selected topic: ${topic}`);

        // Generate article with cover image
        const article = await devtoContentGenerator.generateQuickInsight(topic, true);

        logger.info(`✅ Generated article: "${article.title}"`);
        logger.info(`   Content length: ${article.content.length} characters`);
        logger.info(`   Tags: ${article.tags.join(', ')}`);
        if (article.coverImage) {
            logger.info(`   Cover image: ✅`);
        }

        // Post to all enabled platforms
        const results = await multiPlatformPoster.postToAllPlatforms(article);

        logger.info('✅ Multi-platform posting complete!');
        logger.info('=====================================');

        return results;
    } catch (error) {
        logger.error('Failed to create and post content:', error);
        throw error;
    }
}

/**
 * Test mode - generate and display content without posting
 */
async function testMode() {
    try {
        logger.info('Running in TEST MODE - content will NOT be posted');
        logger.info('=====================================');

        const topic = config.content.topics[0];
        const article = await devtoContentGenerator.generateQuickInsight(topic, false);

        console.log('\n' + '='.repeat(60));
        console.log('GENERATED DEV.TO ARTICLE');
        console.log('='.repeat(60));
        console.log(`Topic: ${topic}`);
        console.log(`Title: ${article.title}`);
        console.log(`Tags: ${article.tags.join(', ')}`);
        console.log('='.repeat(60));
        console.log(article.content);
        console.log('='.repeat(60));
        console.log(`Character count: ${article.content.length}`);
        console.log('='.repeat(60) + '\n');

        logger.info('Test completed successfully');
    } catch (error) {
        logger.error('Test mode failed:', error);
        process.exit(1);
    }
}

/**
 * Initialize and start the agent
 */
async function startAgent() {
    try {
        logger.info('🔄 AutoContent Studio v2.1.0 starting...');
        
        // Validate configuration
        const enabledPlatforms = validateConfig();
        logger.info('✅ Configuration validated successfully');
        logger.info(`📱 Enabled platforms: ${enabledPlatforms.join(', ')}`);

        // Check if running in test mode
        if (process.argv.includes('--test-mode')) {
            await testMode();
            return;
        }

        // Verify all enabled platform API keys (warn but don't block on failures)
        const verifications = await multiPlatformPoster.verifyAllPlatforms();
        if (verifications.failed.length > 0) {
            logger.warn(`⚠️ Some platforms failed verification: ${verifications.failed.join(', ')}`);
            logger.warn('Continuing anyway - will attempt posting to all platforms.');
        }

        // Schedule the posting job
        logger.info(`📅 Scheduling posts with cron expression: ${config.schedule.cronExpression}`);

        cron.schedule(config.schedule.cronExpression, async () => {
            try {
                await createAndPost();
            } catch (error) {
                logger.error('Scheduled job failed:', error);
            }
        });

        logger.info('🚀 AutoContent Studio started successfully!');
        logger.info(`📱 Posting to: ${enabledPlatforms.join(' + ')}`);
        logger.info('⏰ Waiting for scheduled posting time...');
        logger.info('Press Ctrl+C to stop the agent');

        // Optional: Post immediately on startup for testing
        if (process.env.POST_ON_STARTUP === 'true') {
            logger.info('📝 Posting initial content...');
            await createAndPost();
        }
    } catch (error) {
        logger.error('❌ Failed to start agent:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('\n👋 Shutting down Dev.to AI Agent...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('\n👋 Shutting down Dev.to AI Agent...');
    process.exit(0);
});

// Start the agent
startAgent().catch((error) => {
    logger.error('Unhandled error:', error);
    process.exit(1);
});
