import axios from 'axios';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';

/**
 * Verify Dev.to API key
 */
async function verifyApiKey() {
    try {
        logger.info('Verifying Dev.to API key...');

        const response = await axios.get('https://dev.to/api/users/me', {
            headers: {
                'api-key': config.devto.apiKey,
            },
        });

        logger.info(`✅ Dev.to API verified. Username: ${response.data.username}`);
        return true;
    } catch (error) {
        logger.error('Dev.to API verification failed:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Post article to Dev.to
 * @param {string} title - Article title
 * @param {string} content - Article content (markdown)
 * @param {string[]} tags - Article tags (max 4)
 * @param {boolean} published - Whether to publish immediately (default: true)
 * @param {string} coverImage - Optional cover image URL
 */
async function postArticle(title, content, tags = [], published = true, coverImage = null) {
    try {
        logger.info('Posting article to Dev.to...');

        // Dev.to allows max 4 tags
        const devtoTags = tags.slice(0, 4);

        const article = {
            article: {
                title: title,
                published: published,
                body_markdown: content,
                tags: devtoTags,
                series: null, // Optional: can be used for series of articles
            },
        };

        // Add cover image if provided
        if (coverImage) {
            article.article.main_image = coverImage;
            logger.info(`Adding cover image: ${coverImage}`);
        }

        const response = await axios.post(
            'https://dev.to/api/articles',
            article,
            {
                headers: {
                    'api-key': config.devto.apiKey,
                    'Content-Type': 'application/json',
                },
            }
        );

        logger.info(`✅ Article posted successfully!`);
        logger.info(`Article URL: ${response.data.url}`);
        logger.info(`Article ID: ${response.data.id}`);

        return {
            id: response.data.id,
            url: response.data.url,
            published: response.data.published,
        };
    } catch (error) {
        logger.error('Error posting to Dev.to:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        throw error;
    }
}

/**
 * Get user's published articles
 * @param {number} perPage - Number of articles per page (default: 30)
 */
async function getMyArticles(perPage = 30) {
    try {
        const response = await axios.get('https://dev.to/api/articles/me/published', {
            headers: {
                'api-key': config.devto.apiKey,
            },
            params: {
                per_page: perPage,
            },
        });

        return response.data;
    } catch (error) {
        logger.error('Error fetching articles:', error.response?.data || error.message);
        throw error;
    }
}

export default {
    verifyApiKey,
    postArticle,
    getMyArticles,
};
