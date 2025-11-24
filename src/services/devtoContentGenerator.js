import { generateContent, generateImage } from './openai.js';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';

/**
 * Generate a technical article for Dev.to
 * @param {string} topic - Main topic for the article
 * @returns {Object} - Article with title, content, and tags
 */
async function generateArticle(topic) {
    try {
        logger.info(`Generating Dev.to article on topic: ${topic}`);

        const prompt = `Write a comprehensive technical article about ${topic} for Dev.to.

Requirements:
- Target audience: Developers and tech professionals
- Length: 800-1200 words
- Tone: Informative, engaging, professional
- Include practical examples (NO code blocks, use inline code instead)
- Structure: Introduction, 2-3 main sections, conclusion
- Use markdown formatting (headings, lists, bold, italic)
- Focus on latest trends and best practices in ${topic}
- IMPORTANT: Do NOT use code blocks with triple backticks
- IMPORTANT: Do NOT use {% raw %} or any Liquid template tags
- Use inline code with single backticks only

Topics to cover:
- What is ${topic} and why it matters
- Key concepts and technologies
- Practical applications
- Best practices
- Future trends

Write in clean markdown format with headings, bold text, lists, and inline code only.`;

        const content = await generateContent(prompt);

        // Generate a catchy title
        const titlePrompt = `Generate a catchy, SEO-friendly title for an article about ${topic}. 
Make it compelling and under 60 characters. Return ONLY the title, nothing else.`;
        
        const title = await generateContent(titlePrompt);

        // Generate relevant tags
        const tags = generateTags(topic);

        logger.info('Article generated successfully');
        logger.info(`Title: ${title}`);
        logger.info(`Tags: ${tags.join(', ')}`);

        return {
            title: title.trim(),
            content: content,
            tags: tags,
        };
    } catch (error) {
        logger.error('Error generating article:', error);
        throw error;
    }
}

/**
 * Generate relevant tags for the topic
 * @param {string} topic - Article topic
 * @returns {string[]} - Array of tags (max 4)
 */
function generateTags(topic) {
    const topicLower = topic.toLowerCase();
    const tagMap = {
        'agenticai': ['ai', 'machinelearning', 'automation', 'agents'],
        'generativeai': ['ai', 'machinelearning', 'generativeai', 'llm'],
        'llm': ['ai', 'machinelearning', 'llm', 'nlp'],
        'cloudai': ['ai', 'cloud', 'machinelearning', 'devops'],
        'datascience': ['datascience', 'machinelearning', 'python', 'analytics'],
        'ml': ['machinelearning', 'ai', 'python', 'datascience'],
        'ai': ['ai', 'machinelearning', 'deeplearning', 'python'],
        'analytics': ['analytics', 'datascience', 'python', 'bi'],
        'aichatbots': ['ai', 'chatbots', 'nlp', 'automation'],
        'predictiveanalytics': ['datascience', 'machinelearning', 'analytics', 'python'],
        'webdevelopment': ['webdev', 'javascript', 'programming', 'frontend'],
        'businessintelligence': ['bi', 'analytics', 'datascience', 'sql'],
        'mlops': ['mlops', 'machinelearning', 'devops', 'ai'],
        'deeplearning': ['deeplearning', 'ai', 'machinelearning', 'neural networks'],
        'nlp': ['nlp', 'ai', 'machinelearning', 'python'],
        'computervision': ['computervision', 'ai', 'machinelearning', 'opencv'],
        'rag': ['ai', 'llm', 'rag', 'machinelearning'],
    };

    // Find matching tags
    for (const [key, tags] of Object.entries(tagMap)) {
        if (topicLower.includes(key)) {
            return tags;
        }
    }

    // Default tags
    return ['ai', 'machinelearning', 'tech', 'programming'];
}

/**
 * Generate a quick tech insight (shorter article)
 * @param {string} topic - Topic for the insight
 * @param {boolean} withImage - Whether to generate a cover image (default: true)
 * @returns {Object} - Short article with optional cover image
 */
async function generateQuickInsight(topic, withImage = true) {
    try {
        logger.info(`Generating quick insight on: ${topic}`);

        const prompt = `Write a concise technical insight about ${topic} for Dev.to.

Requirements:
- Length: 300-500 words
- Tone: Quick, actionable, insightful
- Include 1-2 key takeaways
- Use markdown formatting (headings, lists, bold, italic)
- Focus on a specific aspect or recent development in ${topic}
- IMPORTANT: Do NOT use code blocks with triple backticks
- IMPORTANT: Do NOT use {% raw %} or any Liquid template tags
- Use inline code with single backticks only

Make it valuable and easy to read in 2-3 minutes.`;

        const content = await generateContent(prompt);

        const titlePrompt = `Generate a short, catchy title for a quick insight about ${topic}. 
Under 50 characters. Return ONLY the title.`;
        
        const title = await generateContent(titlePrompt);

        const tags = generateTags(topic);

        // Generate cover image if requested
        let coverImage = null;
        if (withImage) {
            try {
                logger.info('Generating cover image for article...');
                coverImage = await generateImage(topic, content);
                if (coverImage) {
                    logger.info('Cover image generated successfully');
                }
            } catch (error) {
                logger.warn('Failed to generate cover image, continuing without it:', error.message);
            }
        }

        return {
            title: title.trim(),
            content: content,
            tags: tags,
            coverImage: coverImage,
        };
    } catch (error) {
        logger.error('Error generating quick insight:', error);
        throw error;
    }
}

export default {
    generateArticle,
    generateQuickInsight,
    generateTags,
};
