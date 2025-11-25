import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Search for latest tech news using Google News RSS
 * @param {string} topic - Topic to search for
 * @returns {Promise<Array>} - Array of news items
 */
async function searchLatestNews(topic) {
    try {
        logger.info(`Searching for latest news about: ${topic}`);
        
        // Use Google News RSS (free, no API key needed)
        const searchQuery = encodeURIComponent(topic);
        const url = `https://news.google.com/rss/search?q=${searchQuery}+tech+ai&hl=en-US&gl=US&ceid=US:en`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
            },
            timeout: 5000,
        });

        // Parse RSS XML (simple parsing)
        const items = response.data.match(/<item>[\s\S]*?<\/item>/g) || [];
        
        const news = items.slice(0, 5).map(item => {
            const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
            const linkMatch = item.match(/<link>(.*?)<\/link>/);
            const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
            
            return {
                title: titleMatch ? titleMatch[1] : '',
                link: linkMatch ? linkMatch[1] : '',
                pubDate: pubDateMatch ? pubDateMatch[1] : '',
            };
        }).filter(item => item.title);

        logger.info(`Found ${news.length} recent news items`);
        return news;
    } catch (error) {
        logger.warn('Failed to fetch latest news:', error.message);
        return [];
    }
}

/**
 * Get latest trends for a topic
 * @param {string} topic - Topic to research
 * @returns {Promise<string>} - Summary of latest trends
 */
async function getLatestContext(topic) {
    try {
        const news = await searchLatestNews(topic);
        
        if (news.length === 0) {
            return '';
        }

        const newsContext = news.map((item, i) => 
            `${i + 1}. ${item.title} (${new Date(item.pubDate).toLocaleDateString()})`
        ).join('\n');

        return `\n\nLATEST NEWS CONTEXT (Use this to write current, relevant content):\n${newsContext}\n`;
    } catch (error) {
        logger.warn('Could not get latest context:', error.message);
        return '';
    }
}

export default {
    searchLatestNews,
    getLatestContext,
};
