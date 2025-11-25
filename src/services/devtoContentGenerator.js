import OpenAI from 'openai';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';
import newsSearch from './newsSearch.js';

// Initialize OpenAI client
let openaiClient = null;

function getOpenAIClient() {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: config.openai.apiKey,
        });
    }
    return openaiClient;
}

/**
 * Generate content using OpenAI (force GPT-4 Turbo for latest knowledge)
 */
async function generateWithGPT4(prompt, maxTokens = 800) {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // FORCE GPT-4 Turbo for latest knowledge
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
    });
    return response.choices[0].message.content.trim();
}

/**
 * Generate cover image using DALL-E 3
 */
async function generateCoverImage(topic) {
    try {
        logger.info(`Generating cover image for: ${topic}`);
        const openai = getOpenAIClient();
        
        const imagePrompt = `A modern, clean tech illustration about ${topic}. 
Developer-friendly, minimalist, vibrant colors (blue, purple, cyan accents). 
Abstract geometric shapes, circuit patterns, or network diagrams. 
No text, no people faces. 
Suitable for Dev.to technical article cover image about ${topic}.
High quality, eye-catching, professional.`;

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
        });

        const imageUrl = response.data[0].url;
        logger.info('Cover image generated successfully');
        return imageUrl;
    } catch (error) {
        logger.warn('Failed to generate cover image:', error.message);
        return null;
    }
}

/**
 * Generate tags based on topic
 */
function generateTags(topic) {
    const tagMap = {
        'AgenticAI': ['ai', 'machinelearning', 'agentic', 'automation'],
        'GenerativeAI': ['ai', 'generativeai', 'gpt', 'machinelearning'],
        'LLM': ['ai', 'machinelearning', 'llm', 'nlp'],
        'CloudAI': ['ai', 'cloud', 'machinelearning', 'cloudcomputing'],
        'DataScience': ['datascience', 'machinelearning', 'python', 'analytics'],
        'ML': ['machinelearning', 'ai', 'datascience', 'python'],
        'MLOps': ['mlops', 'machinelearning', 'devops', 'ai'],
        'DeepLearning': ['deeplearning', 'ai', 'neuralnetworks', 'machinelearning'],
        'NLP': ['nlp', 'ai', 'machinelearning', 'language'],
        'RAG': ['ai', 'rag', 'llm', 'machinelearning'],
        'ComputerVision': ['computervision', 'ai', 'machinelearning', 'deeplearning'],
    };

    return tagMap[topic] || ['ai', 'machinelearning', 'tech', 'programming'];
}

/**
 * Generate a quick tech insight with current date context
 */
async function generateQuickInsight(topic, withImage = true) {
    try {
        logger.info(`Generating quick insight on: ${topic}`);

        // Get current date info
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        logger.info(`Current context: ${currentMonth}`);

        // Get latest news context
        const latestNews = await newsSearch.getLatestContext(topic);
        logger.info(`Latest news context: ${latestNews ? 'fetched' : 'not available'}`);

        // Generate TITLE FIRST (short and strict)
        logger.info('Step 1: Generating title...');
        const titlePrompt = `Generate a catchy, SEO-friendly title about ${topic}.

CONTEXT: It is ${currentMonth}. Focus on ${currentYear} developments.

Requirements:
- Maximum 60 characters
- Make it compelling and click-worthy
- Must be relevant to ${currentYear} (do NOT mention years before ${currentYear - 1})
- Return ONLY the title, nothing else
- No quotes around the title

Examples:
- "5 LLM Tricks That Transformed My Workflow"
- "Why AgenticAI is Dominating ${currentYear}"
- "RAG in ${currentYear}: The Complete Guide"`;

        const title = await generateWithGPT4(titlePrompt, 30);
        const cleanTitle = title.replace(/^["']|["']$/g, ''); // Remove quotes
        logger.info(`Generated title: "${cleanTitle}" (${cleanTitle.length} chars)`);

        // Generate CONTENT with date context
        logger.info('Step 2: Generating content...');
        const contentPrompt = `Write a technical insight about ${topic} for Dev.to.

IMPORTANT CONTEXT:
- Today's date: ${currentMonth}
- You are writing in ${currentYear}
- Focus on ${currentYear} developments and current state
${latestNews}

Requirements:
- Length: 400-600 words
- Tone: Informative, engaging, current
- Reference ${currentYear} developments, trends, and technologies
- Include 2-3 key takeaways or practical tips
- Use markdown formatting (headings ##, lists, **bold**, *italic*)
- Focus on what's happening NOW in ${currentYear}
- Be specific with examples, numbers, and facts
- DO NOT reference years before ${currentYear - 1} unless for brief historical context
- IMPORTANT: Do NOT use code blocks with triple backticks (\`\`\`)
- IMPORTANT: Do NOT use {% raw %} or any Liquid template tags
- Use inline code with single backticks only
- Make it feel fresh and current

Make it valuable and easy to read in 3-4 minutes.`;

        const content = await generateWithGPT4(contentPrompt, 900);
        logger.info(`Generated content: ${content.length} characters`);

        const tags = generateTags(topic);
        logger.info(`Tags: ${tags.join(', ')}`);

        // Generate cover image if requested
        let coverImage = null;
        if (withImage) {
            logger.info('Step 3: Generating cover image...');
            coverImage = await generateCoverImage(topic);
            if (coverImage) {
                logger.info(`Cover image URL: ${coverImage.substring(0, 80)}...`);
            } else {
                logger.warn('No cover image generated, continuing without it');
            }
        }

        return {
            title: cleanTitle,
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
    generateQuickInsight,
};
