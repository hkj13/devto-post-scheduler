import axios from 'axios';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';

/**
 * Medium API Service
 * Docs: https://github.com/Medium/medium-api-docs
 */

const MEDIUM_API_BASE = 'https://api.medium.com/v1';

/**
 * Get authenticated user info
 */
async function getUser() {
    try {
        const response = await axios.get(`${MEDIUM_API_BASE}/me`, {
            headers: {
                'Authorization': `Bearer ${config.medium.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        
        logger.info(`Medium user verified: ${response.data.data.username}`);
        return response.data.data;
    } catch (error) {
        logger.error('Failed to get Medium user:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Post article to Medium
 * @param {string} title - Article title
 * @param {string} content - Article content (markdown or HTML)
 * @param {string[]} tags - Article tags (max 5)
 * @param {string} contentFormat - 'markdown' or 'html' (default: markdown)
 * @param {string} publishStatus - 'public', 'draft', or 'unlisted' (default: public)
 * @param {string} canonicalUrl - Optional canonical URL
 */
async function postArticle(title, content, tags = [], contentFormat = 'markdown', publishStatus = 'public', canonicalUrl = null) {
    try {
        logger.info('Posting article to Medium...');
        
        // Get user ID first
        const user = await getUser();
        const userId = user.id;

        // Prepare article data
        const articleData = {
            title: title,
            contentFormat: contentFormat,
            content: content,
            tags: tags.slice(0, 5), // Medium allows max 5 tags
            publishStatus: publishStatus,
        };

        // Add canonical URL if provided
        if (canonicalUrl) {
            articleData.canonicalUrl = canonicalUrl;
        }

        const response = await axios.post(
            `${MEDIUM_API_BASE}/users/${userId}/posts`,
            articleData,
            {
                headers: {
                    'Authorization': `Bearer ${config.medium.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        const article = response.data.data;
        logger.info(`✅ Article posted to Medium successfully!`);
        logger.info(`Article URL: ${article.url}`);
        logger.info(`Article ID: ${article.id}`);

        return {
            id: article.id,
            title: article.title,
            url: article.url,
            publishStatus: article.publishStatus,
            tags: article.tags,
        };
    } catch (error) {
        logger.error('Error posting to Medium:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Verify Medium API key
 */
async function verifyApiKey() {
    try {
        logger.info('Verifying Medium API key...');
        await getUser();
        logger.info('✅ Medium API key verified');
        return true;
    } catch (error) {
        logger.error('Medium API key verification failed');
        return false;
    }
}

/**
 * Convert content for Medium (add cover image as first element)
 */
function formatContentWithImage(content, imageUrl) {
    if (!imageUrl) {
        return content;
    }
    
    // Add image at the top
    return `![Cover Image](${imageUrl})\n\n${content}`;
}

export default {
    getUser,
    postArticle,
    verifyApiKey,
    formatContentWithImage,
};
