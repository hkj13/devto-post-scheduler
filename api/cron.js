import OpenAI from 'openai';
import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';

/**
 * Vercel Serverless Function - Cron endpoint
 * Self-contained function for serverless environment
 */

// Comprehensive topic categories with detailed subtopics
const TOPIC_CATEGORIES = {
    AgenticAI: [
        "Building autonomous AI agents with LangChain",
        "Multi-agent systems and coordination patterns",
        "ReAct pattern: Reasoning and Acting in AI agents",
        "Tool use and function calling in AI agents",
        "Agent memory systems: short-term vs long-term",
        "AutoGPT architecture and self-improving agents",
        "Agent orchestration frameworks comparison",
        "Building AI agents with CrewAI",
        "Agentic RAG: Retrieval-augmented generation for agents",
        "Agent evaluation and benchmarking methods",
        "Human-in-the-loop agent systems",
        "Agent security and sandboxing",
        "Planning and task decomposition in agents",
        "Agent debugging and observability",
        "Production deployment of AI agents",
    ],
    GenerativeAI: [
        "Diffusion models explained: From DDPM to Stable Diffusion",
        "ControlNet and guided image generation",
        "Fine-tuning Stable Diffusion with LoRA",
        "Text-to-video generation: Runway, Pika, Sora",
        "Audio generation with MusicLM and AudioCraft",
        "3D generation with NeRF and Gaussian Splatting",
        "Prompt engineering techniques for image generation",
        "Inpainting and outpainting techniques",
        "Style transfer with generative models",
        "Generative AI for game development",
        "AI-powered design tools: Figma AI, Canva AI",
        "Deepfakes detection and ethical AI",
        "Multimodal generation: text + image + audio",
        "Real-time generative AI applications",
        "Generative AI APIs comparison: OpenAI, Anthropic, Google",
    ],
    LLM: [
        "Transformer architecture deep dive",
        "Attention mechanisms: Self, Cross, Multi-head",
        "Tokenization strategies: BPE, WordPiece, SentencePiece",
        "LLM fine-tuning: Full, LoRA, QLoRA techniques",
        "Prompt engineering: Chain-of-thought, Few-shot, Zero-shot",
        "RAG implementation patterns and best practices",
        "Vector databases for LLM applications",
        "LLM evaluation metrics: Perplexity, BLEU, ROUGE",
        "Hallucination detection and mitigation",
        "Context window optimization techniques",
        "Structured output and JSON mode in LLMs",
        "LLM inference optimization: Quantization, Pruning",
        "Serving LLMs at scale: vLLM, TensorRT-LLM",
        "Open source LLMs: Llama, Mistral, Phi comparison",
        "Building chatbots with conversation memory",
        "LLM security: Prompt injection, jailbreaks",
        "Semantic search and embeddings",
        "LLM-powered code generation",
    ],
    CloudComputing: [
        "AWS Lambda best practices and patterns",
        "Kubernetes architecture and components",
        "Docker containerization strategies",
        "Serverless vs containers: When to use what",
        "Multi-cloud architecture patterns",
        "Cloud cost optimization strategies",
        "Infrastructure as Code with Terraform",
        "CI/CD pipelines with GitHub Actions",
        "Cloud security: IAM, VPC, encryption",
        "Microservices communication patterns",
        "Service mesh with Istio and Linkerd",
        "Cloud-native databases: DynamoDB, Cosmos DB",
        "Event-driven architecture with Kafka",
        "API Gateway patterns and rate limiting",
        "Cloud monitoring with Prometheus and Grafana",
        "Edge computing and CDN optimization",
        "Disaster recovery and high availability",
        "Cloud migration strategies",
    ],
    SystemDesign: [
        "Designing Twitter/X-like social platforms",
        "Building real-time chat systems",
        "URL shortener system design",
        "Rate limiter implementation patterns",
        "Distributed caching with Redis",
        "Message queues: RabbitMQ vs Kafka vs SQS",
        "Database sharding strategies",
        "CAP theorem and distributed systems",
        "Load balancing algorithms",
        "Consistent hashing explained",
        "CQRS and Event Sourcing patterns",
        "GraphQL vs REST API design",
        "WebSocket vs Server-Sent Events",
        "Designing notification systems",
        "Search engine architecture",
        "Video streaming platform design",
        "Payment system architecture",
        "Idempotency in distributed systems",
    ],
    DataScience: [
        "Feature engineering best practices",
        "Time series forecasting techniques",
        "A/B testing statistical methods",
        "ML model deployment with MLflow",
        "Data pipeline with Apache Airflow",
        "Pandas performance optimization",
        "Exploratory data analysis workflows",
        "Handling imbalanced datasets",
        "Cross-validation strategies",
        "Hyperparameter tuning: Grid, Random, Bayesian",
        "Model interpretability: SHAP, LIME",
        "Data versioning with DVC",
        "Real-time ML inference patterns",
        "Feature stores: Feast, Tecton",
        "MLOps best practices",
    ],
    WebDevelopment: [
        "React Server Components deep dive",
        "Next.js App Router patterns",
        "State management: Zustand vs Jotai vs Redux",
        "TypeScript advanced patterns",
        "Web performance optimization techniques",
        "Authentication with NextAuth/Auth.js",
        "Building design systems",
        "CSS-in-JS vs Tailwind CSS",
        "Progressive Web Apps (PWA) guide",
        "Web accessibility (a11y) essentials",
        "Testing React apps with Vitest",
        "Monorepo setup with Turborepo",
        "Edge functions and middleware",
        "Real-time apps with WebSockets",
        "SEO optimization for SPAs",
    ],
    ProductManagement: [
        "Product discovery frameworks",
        "OKRs vs KPIs: Metrics that matter",
        "User research interview techniques",
        "Prioritization: RICE, MoSCoW, Kano",
        "Building product roadmaps",
        "A/B testing for product decisions",
        "Product-led growth strategies",
        "Stakeholder management techniques",
        "Writing effective PRDs",
        "Agile vs Waterfall in 2024",
        "Jobs-to-be-done framework",
        "Product analytics tools comparison",
        "Feature flagging strategies",
        "Pricing strategy frameworks",
        "Go-to-market planning",
    ],
    DevOps: [
        "GitOps with ArgoCD and Flux",
        "Observability: Logs, Metrics, Traces",
        "SRE practices and error budgets",
        "Chaos engineering principles",
        "Blue-green vs Canary deployments",
        "Secret management with Vault",
        "Container security scanning",
        "Performance testing with k6",
        "Infrastructure monitoring strategies",
        "Incident management best practices",
        "Platform engineering principles",
        "Developer experience (DX) optimization",
    ],
};

// Configuration from environment
function getConfig() {
    return {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        },
        devto: {
            apiKey: process.env.DEVTO_API_KEY,
            enabled: process.env.DEVTO_ENABLED === 'true',
        },
        twitter: {
            apiKey: process.env.TWITTER_API_KEY,
            apiSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
            enabled: process.env.TWITTER_ENABLED === 'true',
        },
    };
}

// Get a unique topic using date-based rotation (no repetition)
function getTopicForToday() {
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday
    
    // Monday = Tech Recap
    if (dayOfWeek === 1) {
        return { isRecap: true, topic: 'Weekly Tech Recap' };
    }
    
    // Get all subtopics flattened
    const allTopics = [];
    for (const [category, subtopics] of Object.entries(TOPIC_CATEGORIES)) {
        for (const subtopic of subtopics) {
            allTopics.push({ category, subtopic });
        }
    }
    
    // Use day of year + hour to pick unique topic (rotates through all ~150 topics)
    const startOfYear = new Date(now.getUTCFullYear(), 0, 0);
    const diff = now - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hour = now.getUTCHours();
    
    // Create index based on day and time slot (3 posts per day)
    const timeSlot = hour < 8 ? 0 : hour < 16 ? 1 : 2;
    const index = (dayOfYear * 3 + timeSlot) % allTopics.length;
    
    return { isRecap: false, ...allTopics[index] };
}

// Generate Weekly Tech Recap (runs on Mondays)
async function generateWeeklyRecap(config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 7);
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - 1);
    
    const dateRange = `${lastMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    
    const prompt = `Create a "Weekly Tech Recap" for ${dateRange} covering the LATEST news and developments.

You are a tech journalist. Research and summarize the most important tech and product news from this past week.

Include sections on:
1. **AI & Machine Learning** - Latest model releases, breakthroughs, company announcements
2. **Developer Tools** - New frameworks, languages updates, IDE improvements
3. **Cloud & Infrastructure** - AWS/GCP/Azure updates, Kubernetes news
4. **Product & Startups** - Funding rounds, product launches, acquisitions
5. **Open Source** - Notable releases, trending repos

FORMAT:
1. DEV.TO ARTICLE:
- Title: "Weekly Tech Recap: [Key Highlight] (${dateRange})" - under 60 chars
- Content: 1000-1500 words, markdown, organized by sections above
- Include specific names, versions, and details
- Tags: ["techrecap", "news", "ai", "webdev"]

2. TWITTER THREAD (7-8 tweets):
- Tweet 1: "🗞️ Weekly Tech Recap (${dateRange}) - Here's what you missed! 🧵"
- Tweets 2-7: One highlight per tweet with emoji
- Tweet 8: "Follow for weekly recaps! #TechNews #DevNews"

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article...",
  "tags": ["techrecap", "news", "ai", "webdev"],
  "thread": ["tweet1", "tweet2", ...]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

// Generate article AND thread in single OpenAI call
async function generateContent(topic, category, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const prompt = `Create DEEP, SPECIFIC content about "${topic}" (Category: ${category}) for two platforms.

IMPORTANT: This should be an IN-DEPTH technical article, not a surface-level overview.
- Include specific code examples, commands, or configurations
- Cover practical use cases and real-world scenarios
- Mention specific tools, libraries, or services by name
- Include tips, gotchas, and best practices

1. DEV.TO ARTICLE:
- Title: Specific and actionable, under 60 characters
- Content: 1000-1500 words, markdown, multiple code examples
- Tags: 4 relevant tags (lowercase, no spaces)

2. TWITTER THREAD (5-6 tweets from the same content):
- Tweet 1: Hook with emoji, mention "thread 🧵"
- Tweets 2-5: Key insights/tips from the article (max 270 chars each)
- Tweet 6: Call-to-action with hashtags

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article...",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "thread": ["tweet1", "tweet2", "tweet3", "tweet4", "tweet5", "tweet6"]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

// Post to Dev.to
async function postToDevto(article, config) {
    const response = await axios.post(
        'https://dev.to/api/articles',
        {
            article: {
                title: article.title,
                body_markdown: article.content,
                published: true,
                tags: article.tags.slice(0, 4),
            },
        },
        {
            headers: {
                'api-key': config.devto.apiKey,
                'Content-Type': 'application/json',
            },
        }
    );
    return { platform: 'devto', url: response.data.url, id: response.data.id };
}

// Post to Twitter as a thread (uses pre-generated thread from OpenAI)
async function postToTwitter(content, config) {
    const client = new TwitterApi({
        appKey: config.twitter.apiKey,
        appSecret: config.twitter.apiSecret,
        accessToken: config.twitter.accessToken,
        accessSecret: config.twitter.accessTokenSecret,
    });

    // Use the thread generated by OpenAI
    const tweets = content.thread || [];
    
    // Post thread
    let lastTweetId = null;
    const postedTweets = [];
    
    for (let i = 0; i < tweets.length; i++) {
        const tweetText = tweets[i].substring(0, 280);
        
        const options = lastTweetId 
            ? { reply: { in_reply_to_tweet_id: lastTweetId } }
            : {};
        
        const response = await client.v2.tweet(tweetText, options);
        lastTweetId = response.data.id;
        postedTweets.push(response.data.id);
    }
    
    return { platform: 'twitter', threadId: postedTweets[0], tweetCount: postedTweets.length };
}

export default async function handler(req, res) {
    // Verify the request
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && req.headers['x-cron-secret'] !== cronSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const config = getConfig();
        console.log('🚀 Starting content generation...');

        // Validate
        if (!config.openai.apiKey) {
            throw new Error('OPENAI_API_KEY is required');
        }

        const enabledPlatforms = [];
        if (config.devto.enabled) enabledPlatforms.push('Dev.to');
        if (config.twitter.enabled) enabledPlatforms.push('Twitter');

        if (enabledPlatforms.length === 0) {
            throw new Error('No platforms enabled. Set DEVTO_ENABLED=true or TWITTER_ENABLED=true');
        }

        console.log(`📱 Enabled platforms: ${enabledPlatforms.join(', ')}`);

        // Get topic for today (uses date-based rotation to avoid repetition)
        const topicData = getTopicForToday();
        let content;
        
        if (topicData.isRecap) {
            // Monday = Weekly Tech Recap
            console.log(`📰 Generating Weekly Tech Recap...`);
            content = await generateWeeklyRecap(config);
        } else {
            // Regular topic-based content
            console.log(`📋 Category: ${topicData.category}`);
            console.log(`📋 Topic: ${topicData.subtopic}`);
            content = await generateContent(topicData.subtopic, topicData.category, config);
        }
        
        console.log(`✅ Generated: "${content.title}"`);
        console.log(`📝 Article: ${content.content.length} chars`);
        console.log(`🧵 Thread: ${content.thread?.length || 0} tweets`);

        // Post to platforms
        const results = [];

        if (config.devto.enabled && config.devto.apiKey) {
            try {
                const result = await postToDevto(content, config);
                results.push(result);
                console.log(`✅ Posted to Dev.to: ${result.url}`);
            } catch (e) {
                console.error('Dev.to error:', e.message);
                results.push({ platform: 'devto', error: e.message });
            }
        }

        if (config.twitter.enabled && config.twitter.apiKey) {
            try {
                const result = await postToTwitter(content, config);
                results.push(result);
                console.log(`✅ Posted to Twitter: ${result.tweetCount} tweets`);
            } catch (e) {
                console.error('Twitter error:', e.message);
                results.push({ platform: 'twitter', error: e.message });
            }
        }

        return res.status(200).json({
            success: true,
            type: topicData.isRecap ? 'weekly_recap' : 'topic',
            category: topicData.category || 'recap',
            topic: topicData.subtopic || 'Weekly Tech Recap',
            title: content.title,
            platforms: results
        });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}
