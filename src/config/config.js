import dotenv from 'dotenv';

dotenv.config();

const config = {
    // OpenAI Configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    },

    // Dev.to Configuration
    devto: {
        apiKey: process.env.DEVTO_API_KEY,
    },

    // Scheduling Configuration
    schedule: {
        cronExpression: process.env.POST_SCHEDULE || '0 9 * * *', // Default: 9 AM daily
    },

    // Content Configuration
    content: {
        topics: (process.env.CONTENT_TOPICS || 'AgenticAI,GenerativeAI,LLM,CloudAI,DataScience,ML').split(','),
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/agent.log',
    },
};

// Validate required configuration
function validateConfig() {
    const missingVars = [];

    if (!config.openai.apiKey) {
        missingVars.push('OPENAI_API_KEY');
    }

    if (!config.devto.apiKey) {
        missingVars.push('DEVTO_API_KEY');
    }

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}\n` +
            'Please set these in your Railway environment variables or .env file.'
        );
    }
}

export { config, validateConfig };
