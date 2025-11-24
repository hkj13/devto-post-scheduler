import cron from 'node-cron';
import { config, validateConfig } from './config/config.js';
import logger from './utils/logger.js';
import devto from './services/devto.js';
import devtoContentGenerator from './services/devtoContentGenerator.js';

/**
 * Main function to generate and post content to Dev.to
 */
async function createAndPost() {
    try {
        logger.info('=====================================');
        logger.info('Starting Dev.to content generation process...');

        // Pick a random topic
        const topics = config.content.topics;
        const topic = topics[Math.floor(Math.random() * topics.length)];

        logger.info(`Selected topic: ${topic}`);

        // Generate article with cover image
        const article = await devtoContentGenerator.generateQuickInsight(topic, true);

        logger.info(`Generated article: "${article.title}"`);
        logger.info(`Content length: ${article.content.length} characters`);
        logger.info(`Tags: ${article.tags.join(', ')}`);
        if (article.coverImage) {
            logger.info(`Cover image: ${article.coverImage}`);
        }

        // Post to Dev.to
        const result = await devto.postArticle(
            article.title,
            article.content,
            article.tags,
            true, // publish immediately
            article.coverImage // include cover image
        );

        logger.info('✅ Article published successfully!');
        logger.info(`Article URL: ${result.url}`);
        logger.info(`Article ID: ${result.id}`);
        logger.info('=====================================');

        return result;
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
        // Validate configuration
        validateConfig();
        logger.info('✅ Configuration validated successfully');

        // Check if running in test mode
        if (process.argv.includes('--test-mode')) {
            await testMode();
            return;
        }

        // Verify Dev.to API key
        const isValid = await devto.verifyApiKey();
        if (!isValid) {
            throw new Error('Dev.to API key is invalid. Please update your environment variables.');
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

        logger.info('🚀 Dev.to AI Agent started successfully!');
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
