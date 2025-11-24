import OpenAI from 'openai';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

// Lazy-load OpenAI client
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
 * Topic-specific prompts for content generation
 * Focus on latest tech trends, comparisons, and insights
 */
const topicPrompts = {
    AgenticAI: 'latest developments in agentic AI systems, comparing different frameworks like AutoGPT, LangChain agents, and CrewAI, with practical insights',
    LLMComparison: 'comparing latest LLM models (GPT-4, Claude, Gemini, Llama) focusing on performance, cost, and real-world use cases',
    MLOps: 'modern MLOps practices, tools comparison (MLflow vs Kubeflow vs Weights & Biases), and deployment strategies',
    RAG: 'Retrieval Augmented Generation techniques, vector databases comparison (Pinecone, Weaviate, Chroma), and best practices',
    FineTuning: 'LLM fine-tuning approaches, comparing PEFT, LoRA, QLoRA, with practical cost-benefit analysis',
    AITools: 'latest AI developer tools and frameworks, productivity comparisons, and emerging technologies',
    DataEngineering: 'modern data engineering stack, comparing tools like dbt, Airflow, Prefect, and best practices',
    CloudAI: 'comparing cloud AI services (AWS Bedrock, Azure OpenAI, Google Vertex AI) with practical insights',
};

/**
 * Generate LinkedIn post content using OpenAI
 * @param {string} topic - The topic to generate content about
 * @returns {Promise<string>} - Generated post content
 */
async function generateContent(topic) {
    try {
        logger.info(`Generating content for topic: ${topic}`);

        const topicPrompt = topicPrompts[topic] || topicPrompts.AI;

        const systemPrompt = `You are a tech professional sharing insights on your personal LinkedIn profile. You're passionate about AI/ML, data science, and emerging technologies.

Your task is to create SHORT, informative LinkedIn posts that:
- Share latest tech updates, comparisons, and practical insights
- Are authentic and conversational (personal, curious tone)
- Provide real value to other tech professionals and learners
- Are 100-150 words (short and punchy)
- Start with an attention-grabbing insight or question
- Focus on practical takeaways and comparisons
- End with a thought-provoking question to encourage discussion
- Use short paragraphs (1-2 sentences each) for readability
- Are professional but approachable
- DO NOT mention any company names or promotional content
- DO NOT include emojis or excessive formatting
- DO NOT include hashtags (they will be added separately)
- Write in first person ("I recently explored...", "I found...")`;


        const userPrompt = `Create a SHORT LinkedIn post about ${topicPrompt}.

Make it insightful and valuable for tech professionals. Focus on:
1. A compelling hook or surprising insight
2. Latest developments or comparisons (be specific with tools/models/frameworks)
3. Practical takeaway or key learning
4. A discussion question at the end

Remember: Keep it concise (100-150 words), informative, and personal. No company mentions, no sales pitch. Share knowledge like a curious practitioner.`;

        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: config.openai.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7, // Balanced creativity and accuracy
            max_tokens: 300, // Keep it short
        });

        const content = response.choices[0].message.content.trim();
        logger.info('Content generated successfully');

        return content;
    } catch (error) {
        logger.error('Error generating content with OpenAI:', error);
        throw error;
    }
}

/**
 * Generate an image for LinkedIn post using DALL-E
 * @param {string} topic - The topic to generate an image for
 * @param {string} postContent - The post content for context
 * @returns {Promise<string>} - URL of the generated image
 */
async function generateImage(topic, postContent) {
    try {
        logger.info(`Generating image for topic: ${topic}`);

        // Create a prompt for image generation
        const imagePrompt = `A modern, clean, and professional tech illustration about ${topic}. 
Style: Developer-friendly, minimalist, vibrant colors (blue, purple, cyan accents). 
Abstract geometric shapes, circuit patterns, or network diagrams. 
No text, no people faces. 
Suitable for Dev.to technical article cover image about ${topic}.
High quality, eye-catching, professional.`;

        const openai = getOpenAIClient();
        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
        });

        const imageUrl = response.data[0].url;
        logger.info('Image generated successfully');

        return imageUrl;
    } catch (error) {
        logger.error('Error generating image with DALL-E:', error);
        // Don't throw - just return null and post without image
        return null;
    }
}

export { generateContent, generateImage };
