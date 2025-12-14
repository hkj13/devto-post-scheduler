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
        enabled: process.env.DEVTO_ENABLED !== 'false', // Default: enabled
    },

    // Medium Configuration
    medium: {
        apiKey: process.env.MEDIUM_API_KEY,
        enabled: process.env.MEDIUM_ENABLED === 'true', // Default: disabled
    },

    // Twitter Configuration
    twitter: {
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        enabled: process.env.TWITTER_ENABLED === 'true', // Default: disabled
        postType: process.env.TWITTER_POST_TYPE || 'single', // 'single' or 'thread'
    },

    // Scheduling Configuration
    schedule: {
        cronExpression: process.env.POST_SCHEDULE || '0 9 * * *', // Default: 9 AM daily
    },

    // Content Configuration
    content: {
        topics: (process.env.CONTENT_TOPICS || 'AgenticAI,GenerativeAI,LLM,CloudComputing,DataScience,MachineLearning,DevOps,Kubernetes,Docker,Microservices,SystemDesign,SoftwareArchitecture,APIDesign,WebDevelopment,React,NextJS,NodeJS,Python,Rust,Go,TypeScript,CyberSecurity,BlockchainDev,ProductManagement,TechLeadership,StartupTech,OpenSource,TechCareers,CICD,Observability,DatabaseDesign,GraphQL,ServerlessComputing,EdgeComputing,MLOps,DataEngineering,TechTrends2025').split(','),
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
    const enabledPlatforms = [];

    // OpenAI is always required
    if (!config.openai.apiKey) {
        missingVars.push('OPENAI_API_KEY');
    }

    // Check enabled platforms
    if (config.devto.enabled) {
        enabledPlatforms.push('Dev.to');
        if (!config.devto.apiKey) {
            missingVars.push('DEVTO_API_KEY (Dev.to is enabled)');
        }
    }

    if (config.medium.enabled) {
        enabledPlatforms.push('Medium');
        if (!config.medium.apiKey) {
            missingVars.push('MEDIUM_API_KEY (Medium is enabled)');
        }
    }

    if (config.twitter.enabled) {
        enabledPlatforms.push('Twitter');
        if (!config.twitter.bearerToken) {
            missingVars.push('TWITTER_BEARER_TOKEN (Twitter is enabled)');
        }
    }

    // At least one platform must be enabled
    if (enabledPlatforms.length === 0) {
        throw new Error(
            'No platforms enabled! Please enable at least one platform:\n' +
            '  - Set DEVTO_ENABLED=true for Dev.to\n' +
            '  - Set MEDIUM_ENABLED=true for Medium\n' +
            '  - Set TWITTER_ENABLED=true for Twitter'
        );
    }

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}\n` +
            'Please set these in your Railway environment variables or .env file.'
        );
    }

    return enabledPlatforms;
}

export { config, validateConfig };
