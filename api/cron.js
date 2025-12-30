import OpenAI from 'openai';
import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';

/**
 * Vercel Serverless Function - Cron endpoint
 * Self-contained function for serverless environment
 */

// ============================================
// TECHNICAL TOPICS - For tutorials and tech trends
// ============================================
const TECH_CATEGORIES = [
    // AI & ML Deep Dives
    "Agentic AI & Autonomous Agents",
    "Generative AI & Diffusion Models", 
    "Large Language Models (LLMs)",
    "RAG & Vector Databases",
    "Fine-tuning & Model Optimization",
    "Prompt Engineering & AI Workflows",
    
    // Quantum Computing
    "Quantum Computing & Quantum ML",
    
    // Data Science
    "Data Science & Analytics",
    "Machine Learning Engineering",
    "MLOps & Model Deployment",
    "Feature Engineering & Data Pipelines",
    
    // Development
    "Cloud Computing & Infrastructure",
    "System Design & Architecture",
    "Web Development & Frontend",
    "Backend Development & APIs",
    "DevOps & Platform Engineering",
    "Database Systems & Data Modeling",
];

// ============================================
// BUSINESS/MBA TOPICS - For business posts
// ============================================
const BUSINESS_CATEGORIES = [
    // Strategy & Management
    "Business Strategy & Competitive Analysis",
    "Startup Fundamentals & Entrepreneurship",
    "Venture Capital & Fundraising",
    "Growth Strategy & Scaling",
    
    // Product & Marketing
    "Product Management & Strategy",
    "Product-Market Fit & Validation",
    "Digital Marketing & Growth Hacking",
    "Customer Acquisition & Retention",
    
    // Operations & Finance
    "Business Operations & Efficiency",
    "Financial Modeling & Analysis",
    "Unit Economics & Metrics",
    "Business Model Innovation",
    
    // Leadership & Organization
    "Leadership & Team Building",
    "Organizational Design & Culture",
    "Decision Making Frameworks",
    "Negotiation & Communication",
];

// Detailed subtopics for focused content
const SUBTOPICS = {
    // === TECH SUBTOPICS ===
    "Agentic AI & Autonomous Agents": [
        "Multi-agent systems", "Agent orchestration", "Tool use & function calling",
        "ReAct pattern", "Agent frameworks (CrewAI, LangGraph, AutoGen)",
        "Agent memory systems", "Planning & reasoning", "Agent evaluation",
        "Human-in-the-loop agents", "Agent deployment patterns"
    ],
    "Generative AI & Diffusion Models": [
        "Diffusion model architecture", "Image generation pipelines", 
        "ControlNet & LoRA fine-tuning", "Video generation models",
        "Audio & music generation", "3D generation", "Inpainting & outpainting",
        "Prompt engineering for images", "Model merging & optimization"
    ],
    "Large Language Models (LLMs)": [
        "Transformer architecture deep dive", "Open-source vs closed-source LLMs",
        "Tokenization strategies", "Attention mechanisms & variants",
        "Context window optimization", "Inference optimization techniques",
        "Quantization methods (GGUF, GPTQ, AWQ)", "LLM serving & deployment",
        "Benchmarking & evaluation", "Multimodal LLMs"
    ],
    "RAG & Vector Databases": [
        "RAG architecture patterns", "Vector database comparison",
        "Embedding models & selection", "Chunking strategies",
        "Hybrid search (dense + sparse)", "Reranking techniques",
        "Knowledge graphs + RAG", "Evaluation metrics (RAGAS)",
        "Production RAG pipelines", "Multi-modal RAG"
    ],
    "Quantum Computing & Quantum ML": [
        "Quantum computing fundamentals", "Quantum gates & circuits",
        "Quantum algorithms (Grover, Shor)", "Quantum machine learning",
        "Variational quantum circuits", "Quantum advantage use cases",
        "Hybrid classical-quantum systems", "Quantum error correction",
        "Quantum SDKs (Qiskit, Cirq, PennyLane)"
    ],
    "Data Science & Analytics": [
        "Exploratory data analysis", "Statistical modeling",
        "A/B testing & experimentation", "Causal inference",
        "Time series forecasting", "Anomaly detection",
        "Customer segmentation", "Churn prediction",
        "Recommendation systems", "Feature importance analysis"
    ],
    
    // === BUSINESS SUBTOPICS ===
    "Business Strategy & Competitive Analysis": [
        "Porter's Five Forces", "SWOT & PESTEL analysis",
        "Blue Ocean Strategy", "Competitive moats",
        "Market sizing (TAM/SAM/SOM)", "Strategic positioning",
        "First-mover vs fast-follower", "Platform business models"
    ],
    "Startup Fundamentals & Entrepreneurship": [
        "Lean Startup methodology", "MVP development",
        "Customer discovery", "Pivot strategies",
        "Founder-market fit", "Co-founder dynamics",
        "Early-stage hiring", "Startup legal basics"
    ],
    "Venture Capital & Fundraising": [
        "VC landscape & terminology", "Pitch deck essentials",
        "Valuation methods", "Term sheets explained",
        "Due diligence process", "Cap table management",
        "Fundraising stages (Pre-seed to Series D)", "Alternative funding"
    ],
    "Product Management & Strategy": [
        "Product discovery techniques", "User research methods",
        "Roadmap planning", "Prioritization frameworks (RICE, ICE)",
        "OKRs & KPIs", "Go-to-market strategy",
        "Product-led growth", "Feature flags & experimentation"
    ],
    "Financial Modeling & Analysis": [
        "Revenue modeling", "Cost structure analysis",
        "Cash flow forecasting", "Break-even analysis",
        "Scenario planning", "Financial statements basics",
        "Valuation methods (DCF, comparables)", "Unit economics"
    ],
    "Leadership & Team Building": [
        "Leadership styles", "Building high-performing teams",
        "Delegation frameworks", "Feedback & 1:1s",
        "Remote team management", "Conflict resolution",
        "Performance management", "Scaling culture"
    ],
    "Decision Making Frameworks": [
        "First principles thinking", "Mental models",
        "Decision trees", "Probabilistic thinking",
        "Reversible vs irreversible decisions", "OODA loop",
        "Pre-mortem analysis", "Second-order thinking"
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

// ============================================
// POST SCHEDULE PATTERN
// ============================================
// Daily 3 posts:
//   - Slot 0 (morning): Latest Trends & Insights (alternating Tech/Business days)
//   - Slot 1 (afternoon): Startup, Business & MBA content
//   - Slot 2 (evening): Technical Tutorial
// Monday Slot 0: Weekly Tech + Business Recap

function getPostSchedule() {
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday
    const hour = now.getUTCHours();
    
    // Determine time slot: 0 = morning, 1 = afternoon, 2 = evening
    const timeSlot = hour < 8 ? 0 : hour < 16 ? 1 : 2;
    
    // Calculate day of year for rotation
    const startOfYear = new Date(now.getUTCFullYear(), 0, 0);
    const diff = now - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Monday first post = Weekly Recap (Tech + Business)
    if (dayOfWeek === 1 && timeSlot === 0) {
        return { postType: 'weekly_recap', isRecap: true };
    }
    
    // Determine if today is a "tech trends" or "business trends" day (alternating)
    const isTechTrendsDay = dayOfYear % 2 === 0;
    
    let postType, category, categoryType;
    
    switch (timeSlot) {
        case 0:
            // Morning: Latest Trends & Insights (alternating tech/business)
            postType = 'trends';
            if (isTechTrendsDay) {
                categoryType = 'tech';
                const techIndex = dayOfYear % TECH_CATEGORIES.length;
                category = TECH_CATEGORIES[techIndex];
            } else {
                categoryType = 'business';
                const bizIndex = dayOfYear % BUSINESS_CATEGORIES.length;
                category = BUSINESS_CATEGORIES[bizIndex];
            }
            break;
            
        case 1:
            // Afternoon: Startup, Business & MBA content
            postType = 'business';
            categoryType = 'business';
            const bizIndex = dayOfYear % BUSINESS_CATEGORIES.length;
            category = BUSINESS_CATEGORIES[bizIndex];
            break;
            
        case 2:
            // Evening: Technical Tutorial
            postType = 'tutorial';
            categoryType = 'tech';
            const techIndex = dayOfYear % TECH_CATEGORIES.length;
            category = TECH_CATEGORIES[techIndex];
            break;
    }
    
    return { 
        postType, 
        category,
        categoryType,
        isRecap: false,
        timeSlot,
        isTechTrendsDay,
        dayOfYear 
    };
}

// Get recent topic history from Dev.to API
async function getRecentTopics(config) {
    try {
        const response = await axios.get('https://dev.to/api/articles/me/published', {
            headers: { 'api-key': config.devto.apiKey },
            params: { per_page: 30 } // Last 30 articles
        });
        
        return response.data.map(article => ({
            title: article.title,
            tags: article.tag_list,
            published_at: article.published_at
        }));
    } catch (error) {
        console.warn('Could not fetch recent topics:', error.message);
        return [];
    }
}

// AI autonomously chooses specific topic and approach (with history awareness)
async function chooseTopicAndApproach(category, recentTopics, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    // Build context of recent topics
    const recentTopicsContext = recentTopics.length > 0 
        ? `\n\nRECENT TOPICS TO AVOID (last 30 posts):\n${recentTopics.map(t => `- ${t.title} [${t.tags.join(', ')}]`).join('\n')}\n\nIMPORTANT: Choose a DIFFERENT topic that hasn't been covered recently.`
        : '';
    
    const prompt = `You are a technical content strategist. Choose a SPECIFIC, IN-DEPTH topic within "${category}".
${recentTopicsContext}

Requirements:
1. Pick a specific subtopic that's:
   - Practical and actionable
   - Has tutorial/walkthrough potential
   - Includes code examples or step-by-step guides
   - Covers recent tools/frameworks (2024-2025)
   - NOT similar to any recent topics listed above

2. Choose the content type:
   - "tutorial": Step-by-step guide with code
   - "deep-dive": Technical explanation with examples
   - "comparison": Tool/framework comparison with use cases
   - "best-practices": Patterns and anti-patterns
   - "case-study": Real-world implementation

3. Define the depth level:
   - "beginner": Fundamentals with simple examples
   - "intermediate": Practical implementation details
   - "advanced": Performance, scaling, edge cases

Return as JSON:
{
  "topic": "Specific topic title (e.g., 'Building RAG with LangChain and Pinecone')",
  "contentType": "tutorial|deep-dive|comparison|best-practices|case-study",
  "depthLevel": "beginner|intermediate|advanced",
  "keyPoints": ["point1", "point2", "point3"],
  "toolsToMention": ["tool1", "tool2"]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.9, // Higher temperature for more variety
    });

    return JSON.parse(response.choices[0].message.content);
}

// Search for real tech news using Tavily AI
// Tavily's `days` parameter filters results from the last N days
async function searchTavilyNews(category, days = 7) {
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    
    if (!tavilyApiKey) {
        console.warn('TAVILY_API_KEY not set, skipping real-time news search');
        return [];
    }
    
    const categoryQueries = {
        // AI & ML Categories
        'Agentic AI & Autonomous Agents': 'agentic AI autonomous agents multi-agent LangGraph CrewAI AutoGPT news',
        'Generative AI & Diffusion Models': 'generative AI Stable Diffusion DALL-E Midjourney Sora image video generation news',
        'Large Language Models (LLMs)': 'LLM GPT-4 Claude Gemini Llama open source language model releases news',
        'RAG & Vector Databases': 'RAG retrieval augmented generation Pinecone Weaviate vector database news',
        'Fine-tuning & Model Optimization': 'LLM fine-tuning LoRA QLoRA model optimization quantization news',
        'Prompt Engineering & AI Workflows': 'prompt engineering LangChain LlamaIndex AI workflows news',
        
        // Quantum
        'Quantum Computing & Quantum ML': 'quantum computing IBM Quantum Google Sycamore quantum machine learning news',
        
        // Data Science
        'Data Science & Analytics': 'data science analytics machine learning Pandas scikit-learn news',
        'Machine Learning Engineering': 'MLOps machine learning engineering PyTorch TensorFlow deployment news',
        'MLOps & Model Deployment': 'MLOps model deployment Kubeflow MLflow model serving news',
        'Feature Engineering & Data Pipelines': 'feature engineering data pipelines Airflow dbt data engineering news',
        
        // Product
        'Product Management & Strategy': 'product management strategy product-led growth roadmap prioritization news',
        'Product Analytics & Metrics': 'product analytics metrics A/B testing experimentation Amplitude Mixpanel news',
        'Growth Engineering': 'growth engineering growth hacking product growth viral loops news',
        
        // Development
        'Cloud Computing & Infrastructure': 'AWS Azure GCP cloud infrastructure serverless Kubernetes news',
        'System Design & Architecture': 'system design architecture microservices distributed systems scaling news',
        'Web Development & Frontend': 'React Next.js Vue JavaScript TypeScript frontend web development news',
        'Backend Development & APIs': 'backend API Node.js Python Go REST GraphQL microservices news',
        'DevOps & Platform Engineering': 'DevOps platform engineering CI/CD Terraform infrastructure as code news',
        'Database Systems & Data Modeling': 'database PostgreSQL MongoDB Redis data modeling schema design news',
        
        // Business Categories
        'Business Strategy & Competitive Analysis': 'business strategy competitive analysis Porter Five Forces market positioning news',
        'Startup Fundamentals & Entrepreneurship': 'startup entrepreneurship lean startup MVP founder news',
        'Venture Capital & Fundraising': 'venture capital fundraising Series A B C startup funding news',
        'Growth Strategy & Scaling': 'growth strategy scaling startup growth hacking news',
        'Product-Market Fit & Validation': 'product market fit validation customer discovery startup news',
        'Digital Marketing & Growth Hacking': 'digital marketing growth hacking SEO social media startup news',
        'Customer Acquisition & Retention': 'customer acquisition retention CAC LTV churn startup news',
        'Business Operations & Efficiency': 'business operations efficiency startup operations scaling news',
        'Financial Modeling & Analysis': 'financial modeling analysis startup finance valuation news',
        'Unit Economics & Metrics': 'unit economics metrics startup KPIs SaaS metrics news',
        'Business Model Innovation': 'business model innovation platform economy subscription news',
        'Leadership & Team Building': 'leadership team building startup culture hiring news',
        'Organizational Design & Culture': 'organizational design culture remote work startup news',
        'Decision Making Frameworks': 'decision making frameworks mental models first principles news',
        'Negotiation & Communication': 'negotiation communication business skills leadership news',
    };
    
    const query = categoryQueries[category] || `${category} latest news trends`;
    
    try {
        const response = await axios.post('https://api.tavily.com/search', {
            api_key: tavilyApiKey,
            query: query,
            search_depth: 'basic',
            max_results: 5,
            days: days, // Filter: only results from last N days
            include_answer: false,
            include_raw_content: false,
        });
        
        if (response.data && response.data.results) {
            return response.data.results.map(result => ({
                title: result.title,
                url: result.url,
                content: result.content,
                published_date: result.published_date || 'recent',
            }));
        }
    } catch (error) {
        console.warn(`Tavily search failed for ${category}:`, error.message);
    }
    
    return [];
}

// Search multiple categories for weekly recap (8 searches = 8 credits for comprehensive coverage)
async function searchWeeklyNews() {
    const categories = [
        // Tech categories
        'Large Language Models (LLMs)',
        'Agentic AI & Autonomous Agents',
        'Cloud Computing & Infrastructure',
        'DevOps & Platform Engineering',
        // Business categories
        'Venture Capital & Fundraising',
        'Startup Fundamentals & Entrepreneurship',
        'Product Management & Strategy',
        'Business Strategy & Competitive Analysis',
    ];
    
    const allNews = [];
    
    for (const category of categories) {
        const news = await searchTavilyNews(category, 7); // Last 7 days
        allNews.push(...news.map(n => ({ ...n, category })));
    }
    
    return allNews;
}

// Generate Weekly Tech + Business Recap with REAL news (runs on Mondays)
async function generateWeeklyRecap(config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 7);
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - 1);
    
    const dateRange = `${lastMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    
    // Fetch real news from Tavily (8 searches = 8 credits for comprehensive coverage)
    console.log('🔍 Searching for real tech + business news from last 7 days...');
    const realNews = await searchWeeklyNews();
    console.log(`📰 Found ${realNews.length} real news articles`);
    
    // Build context from real news
    const newsContext = realNews.length > 0
        ? `\n\nREAL NEWS ARTICLES FROM THIS WEEK:\n${realNews.map((n, i) => 
            `${i + 1}. [${n.category}] ${n.title}\n   Source: ${n.url}\n   Summary: ${n.content.substring(0, 200)}...`
        ).join('\n\n')}\n\nUse ONLY the above verified news articles. Do not invent any information.`
        : '\n\nNo real-time news available. Write about general trends instead.';
    
    const prompt = `CRITICAL: You are creating a FACTUAL TECH + BUSINESS news recap for ${dateRange}.
${newsContext}

⚠️ STRICT RULES - MUST FOLLOW:
1. Use ONLY the news articles provided above - cite sources with URLs
2. DO NOT invent any information not in the provided articles
3. If articles mention specific versions/numbers, include them
4. Attribute information to sources (e.g., "According to [Source]...")
5. If no real news is available, write about general trends

STRUCTURE:
Organize the verified news into clear sections (BOTH Tech AND Business):

## 🔧 TECH
1. **AI & Machine Learning** - LLMs, agents, generative AI announcements
2. **Cloud & DevOps** - Infrastructure, platform updates
3. **Developer Tools** - New releases, framework updates

## 💼 BUSINESS
4. **Startup & Funding** - Funding rounds, acquisitions, IPOs
5. **Product & Strategy** - Product launches, business moves
6. **Industry Insights** - Market trends, leadership changes

FORMAT:
1. DEV.TO ARTICLE:
- Title: "Weekly Recap: Tech + Business (${dateRange})" - under 60 chars
- Content: 1500-2000 words, markdown (longer for comprehensive coverage)
- Include source URLs for each news item
- Organize by sections above (both tech AND business)
- Tags: ["weeklyrecap", "technews", "startup", "business"]

2. TWITTER THREAD (8-10 tweets, max 250 chars each):
- Tweet 1: "🗞️ Weekly Tech + Business Recap (${dateRange}) 🧵"
- Tweets 2-4: Top tech news (short, punchy)
- Tweets 5-7: Top business/startup news
- Tweets 8-9: Key insights
- Tweet 10: "Full article with sources 👆 #TechNews #StartupNews"

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article...",
  "tags": ["weeklyrecap", "technews", "ai", "webdev"],
  "thread": ["tweet1", "tweet2", ...]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7, // Lower temperature for more factual content
    });

    return JSON.parse(response.choices[0].message.content);
}

// Generate content based on AI-chosen topic and approach
async function generateContent(topicData, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const contentTypeInstructions = {
        tutorial: `Create a STEP-BY-STEP TUTORIAL with:
- Prerequisites and setup instructions
- Numbered steps with code examples for each
- Expected output/results after each step
- Troubleshooting common issues
- Final working example`,
        
        'deep-dive': `Create an IN-DEPTH TECHNICAL EXPLANATION with:
- How it works under the hood
- Architecture diagrams (described in text)
- Code examples showing internals
- Performance characteristics
- When to use vs alternatives`,
        
        comparison: `Create a DETAILED COMPARISON with:
- Side-by-side feature comparison table
- Code examples for each option
- Use case scenarios for each
- Pros and cons
- Recommendation based on needs`,
        
        'best-practices': `Create a BEST PRACTICES GUIDE with:
- Do's and Don'ts with examples
- Common anti-patterns to avoid
- Code examples of good vs bad
- Real-world scenarios
- Checklist for implementation`,
        
        'case-study': `Create a REAL-WORLD CASE STUDY with:
- Problem statement
- Solution architecture
- Implementation details with code
- Challenges faced and solutions
- Results and metrics`
    };
    
    const depthInstructions = {
        beginner: "Explain concepts from scratch. Include definitions, simple examples, and avoid jargon.",
        intermediate: "Assume basic knowledge. Focus on practical implementation, patterns, and real-world usage.",
        advanced: "Cover edge cases, performance optimization, scaling, and production considerations."
    };
    
    const prompt = `Create content about: "${topicData.topic}"

CONTENT TYPE: ${topicData.contentType}
${contentTypeInstructions[topicData.contentType]}

DEPTH LEVEL: ${topicData.depthLevel}
${depthInstructions[topicData.depthLevel]}

KEY POINTS TO COVER:
${topicData.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

TOOLS/FRAMEWORKS TO MENTION: ${topicData.toolsToMention.join(', ')}

FORMAT FOR TWO PLATFORMS:

1. DEV.TO ARTICLE:
- Title: Actionable and specific, under 60 characters
- Content: 1200-1800 words, markdown format
- Include 3-5 code blocks with syntax highlighting
- Add a "What You'll Learn" section at the start
- Include a "Next Steps" section at the end
- Tags: 4 relevant tags (lowercase, no spaces)

2. TWITTER THREAD (6-8 tweets):
- Tweet 1: Hook with emoji + "A thread 🧵"
- Tweets 2-6: Key takeaways with code snippets (max 270 chars)
- Tweet 7: "Want to learn more?" + link placeholder
- Tweet 8: Hashtags and call-to-action

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article...",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "thread": ["tweet1", "tweet2", "tweet3", "tweet4", "tweet5", "tweet6", "tweet7", "tweet8"]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
}

// Generate Trends & Insights post (1 Tavily credit)
async function generateTrends(category, categoryType, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    // Fetch real news/trends for this category (1 credit)
    console.log(`🔍 Searching latest ${category} trends...`);
    const news = await searchTavilyNews(category, 3);
    console.log(`📰 Found ${news.length} trend articles`);
    
    const newsContext = news.length > 0
        ? `REAL NEWS & TRENDS:\n${news.map((n, i) => 
            `${i + 1}. ${n.title}\n   Source: ${n.url}\n   Summary: ${n.content.substring(0, 300)}...`
        ).join('\n\n')}\n\nUse these verified sources.`
        : 'No real-time news found. Write about emerging trends and insights.';
    
    const typeLabel = categoryType === 'tech' ? '🔧 Tech' : '💼 Business';
    
    const prompt = `Create a TRENDS & INSIGHTS article about "${category}".

${newsContext}

TYPE: ${typeLabel} Trends

⚠️ RULES:
1. Use verified sources when available
2. Focus on actionable insights, not just news
3. Include analysis and implications
4. ${categoryType === 'tech' ? 'Include technical details and code snippets where relevant' : 'Include business frameworks and strategic insights'}

FORMAT:
1. DEV.TO ARTICLE:
- Title: "${category}: Key Trends & Insights" or similar, under 60 chars
- Content: 1000-1500 words, markdown
- Sections: Overview, Key Trends, Analysis, What This Means, Action Items
- Tags: ["trends", "${categoryType}", related tags]

2. TWITTER THREAD (5-6 tweets, max 250 chars each):
- Tweet 1: "📊 ${category} Trends - What you need to know 🧵"
- Tweets 2-5: Key insights (short, punchy)
- Tweet 6: "What trends are you seeing? #${categoryType === 'tech' ? 'TechTrends' : 'BusinessTrends'}"

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article...",
  "tags": ["trends", "tag2", "tag3", "tag4"],
  "thread": ["tweet1", "tweet2", ...]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content);
}

// Generate Business/MBA content post (1 Tavily credit for real examples)
async function generateBusinessContent(category, recentTopics, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    // Search for real business examples (1 credit)
    console.log(`🔍 Searching real ${category} examples...`);
    const examples = await searchTavilyNews(category, 30); // Last 30 days for business content
    console.log(`📚 Found ${examples.length} business examples`);
    
    const examplesContext = examples.length > 0
        ? `REAL BUSINESS EXAMPLES:\n${examples.map((e, i) => 
            `${i + 1}. ${e.title}\n   Source: ${e.url}\n   Summary: ${e.content.substring(0, 300)}...`
        ).join('\n\n')}\n\nReference these real examples where relevant.`
        : 'Use well-known business cases from major companies.';
    
    const recentTitles = recentTopics.map(t => `- ${t.title}`).join('\n');
    
    const prompt = `Create a BUSINESS/MBA article about "${category}".

${examplesContext}

RECENT POSTS TO AVOID:
${recentTitles || 'None'}

TARGET AUDIENCE: Tech professionals, founders, product managers, MBA students

CONTENT STYLE:
- Explain business concepts clearly with practical examples
- Include frameworks and mental models
- Use real company case studies (from search results above)
- Make it actionable with templates/checklists where appropriate
- NO code, but can include tables/diagrams in markdown

TITLE FORMAT:
- "[Framework/Concept]: A Practical Guide for Tech Leaders"
- "[Topic] Explained: What Every Founder Should Know"
- "Mastering [Skill]: An MBA Perspective"

FORMAT:
1. DEV.TO ARTICLE:
- Title: Clear and professional, under 60 chars
- Content: 1200-1800 words, markdown
- Sections: Introduction, Core Concepts, Framework/Model, Real Examples, Application, Key Takeaways
- Include at least one table or framework visualization
- Tags: ["business", "startup", "strategy", related tag]

2. TWITTER THREAD (6-7 tweets, max 250 chars each):
- Tweet 1: "💼 [Topic] - What I learned from [Company/MBA] 🧵"
- Tweets 2-5: Key frameworks/insights
- Tweet 6-7: How to apply + hashtags

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article...",
  "tags": ["business", "startup", "tag3", "tag4"],
  "thread": ["tweet1", "tweet2", ...]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.8,
    });

    return JSON.parse(response.choices[0].message.content);
}

// Generate Latest News post for a specific category (1 Tavily credit)
async function generateLatestNews(category, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    // Fetch real news for this category (1 credit)
    console.log(`🔍 Searching latest ${category} news...`);
    const news = await searchTavilyNews(category, 3); // Last 3 days for freshness
    console.log(`📰 Found ${news.length} news articles`);
    
    const newsContext = news.length > 0
        ? `REAL NEWS ARTICLES:\n${news.map((n, i) => 
            `${i + 1}. ${n.title}\n   Source: ${n.url}\n   Summary: ${n.content.substring(0, 300)}...`
        ).join('\n\n')}\n\nUse ONLY these verified articles.`
        : 'No real-time news found. Write about recent developments and trends instead.';
    
    const prompt = `Create a NEWS UPDATE article about the latest in "${category}".

${newsContext}

⚠️ RULES:
1. Use ONLY the news articles above - cite sources
2. DO NOT invent information
3. Include source URLs
4. If no news available, discuss recent industry trends

FORMAT:
1. DEV.TO ARTICLE:
- Title: "${category}: Latest News & Updates" or similar, under 60 chars
- Content: 800-1200 words, markdown
- Include source links
- Tags: ["news", category-related tags]

2. TWITTER THREAD (5-6 tweets):
- Tweet 1: "🚀 Latest in ${category}! Here's what's happening 🧵"
- Tweets 2-5: Key news items
- Tweet 6: "Follow for daily tech updates! #TechNews"

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article...",
  "tags": ["news", "tag2", "tag3", "tag4"],
  "thread": ["tweet1", "tweet2", ...]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content);
}

// Generate Tutorial post with structured naming
async function generateTutorial(category, recentTopics, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const recentTitles = recentTopics.map(t => `- ${t.title}`).join('\n');
    
    const prompt = `You are creating a TUTORIAL article for "${category}".

RECENT POSTS TO AVOID:
${recentTitles || 'None'}

TITLE FORMAT (IMPORTANT):
Use this searchable structure: "[Technology] - [Specific Topic] - Explained/Tutorial/Guide"
Examples:
- "Python - List Comprehensions - Explained"
- "React - Custom Hooks - Complete Tutorial"
- "Docker - Multi-Stage Builds - Guide"
- "Machine Learning - Feature Engineering - Explained"
- "AWS - Lambda Functions - Step by Step"

REQUIREMENTS:
1. Pick a specific, actionable topic NOT in recent posts
2. Write for intermediate developers
3. Include 4-6 code examples
4. Step-by-step instructions
5. Practical use cases

FORMAT:
1. DEV.TO ARTICLE:
- Title: Follow the "[Tech] - [Topic] - Type" format, under 60 chars
- Content: 1200-1800 words, markdown
- Sections: Introduction, Prerequisites, Step-by-Step, Code Examples, Best Practices, Conclusion
- Tags: 4 relevant tags

2. TWITTER THREAD (6-8 tweets):
- Tweet 1: "📚 [Topic] Tutorial - A thread 🧵"
- Tweets 2-6: Key concepts with code
- Tweet 7-8: Call to action + hashtags

Return as JSON:
{
  "title": "Article title in structured format",
  "content": "Full markdown article...",
  "tags": ["tutorial", "tag2", "tag3", "tag4"],
  "thread": ["tweet1", "tweet2", ...]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.8,
    });

    return JSON.parse(response.choices[0].message.content);
}

// Search for real company case studies via Tavily (1 credit)
async function searchRealCaseStudies(category) {
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    
    if (!tavilyApiKey) {
        console.warn('TAVILY_API_KEY not set, skipping case study search');
        return [];
    }
    
    const companyKeywords = {
        "Agentic AI & Autonomous Agents": "OpenAI GPT agents Anthropic Claude autonomous AI implementation case study",
        "Generative AI & Diffusion Models": "Stability AI Midjourney Adobe Firefly generative AI implementation",
        "Large Language Models (LLMs)": "OpenAI ChatGPT Anthropic Claude Google Gemini LLM deployment case study",
        "RAG & Vector Databases": "Pinecone Weaviate company RAG implementation vector search case study",
        "Quantum Computing & Quantum ML": "IBM Quantum Google Sycamore IonQ quantum computing implementation",
        "Data Science & Analytics": "Netflix Spotify Airbnb data science machine learning case study",
        "Product Management & Strategy": "Stripe Notion Figma product management growth case study",
        "Cloud Computing & Infrastructure": "AWS Azure GCP migration case study infrastructure",
        "System Design & Architecture": "Netflix Uber Airbnb system design architecture scaling",
    };
    
    const query = companyKeywords[category] || `${category} real company case study implementation`;
    
    try {
        const response = await axios.post('https://api.tavily.com/search', {
            api_key: tavilyApiKey,
            query: query,
            search_depth: 'basic',
            max_results: 5,
            days: 365, // Case studies can be from the past year
            include_answer: false,
            include_raw_content: false,
        });
        
        if (response.data && response.data.results) {
            return response.data.results.map(result => ({
                title: result.title,
                url: result.url,
                content: result.content,
            }));
        }
    } catch (error) {
        console.warn(`Tavily case study search failed:`, error.message);
    }
    
    return [];
}

// Generate Case Study post using REAL company examples (1 Tavily credit)
async function generateCaseStudy(category, recentTopics, config) {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    // Search for real case studies (1 credit)
    console.log(`🔍 Searching real ${category} case studies...`);
    const realCaseStudies = await searchRealCaseStudies(category);
    console.log(`📚 Found ${realCaseStudies.length} real case studies`);
    
    const caseStudyContext = realCaseStudies.length > 0
        ? `REAL COMPANY CASE STUDIES TO REFERENCE:\n${realCaseStudies.map((cs, i) => 
            `${i + 1}. ${cs.title}\n   Source: ${cs.url}\n   Summary: ${cs.content.substring(0, 400)}...`
        ).join('\n\n')}\n\nIMPORTANT: Write about ONE of these REAL companies. Use verified facts from the sources.`
        : 'No real case studies found. Use well-known public examples from major tech companies.';
    
    const recentTitles = recentTopics.map(t => `- ${t.title}`).join('\n');
    
    const prompt = `Create a CASE STUDY article about a REAL company for "${category}".

${caseStudyContext}

RECENT POSTS TO AVOID:
${recentTitles || 'None'}

⚠️ CRITICAL RULES:
1. Write about a REAL company from the search results above
2. Use VERIFIED facts and cite sources
3. DO NOT invent metrics, numbers, or company names
4. Include the source URL in the article
5. Focus on publicly available technical details

WELL-KNOWN COMPANIES TO CONSIDER (if no search results):
- AI/ML: OpenAI, Anthropic, Google DeepMind, Meta AI
- Data: Netflix, Spotify, Airbnb, Uber, LinkedIn
- Infrastructure: Stripe, Cloudflare, Datadog
- Product: Notion, Figma, Slack, Discord

FORMAT:
1. DEV.TO ARTICLE:
- Title: "How [Company] Built [X]: A ${category} Case Study" - under 60 chars
- Content: 1500-2000 words, markdown
- Sections: About [Company], The Challenge, Technical Solution, Implementation, Results, Lessons Learned
- Include source citations with URLs
- 2-3 code examples (based on public info)
- Tags: ["casestudy", company-name, technology tags]

2. TWITTER THREAD (6-7 tweets, max 250 chars each):
- Tweet 1: "� How [Company] solved [X] - A thread 🧵"
- Tweets 2-5: Key technical decisions (short, punchy)
- Tweet 6-7: Results + source link

Return as JSON:
{
  "title": "Article title",
  "content": "Full markdown article with source citations...",
  "tags": ["casestudy", "tag2", "tag3", "tag4"],
  "thread": ["tweet1", "tweet2", ...]
}`;

    const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7, // Lower for more factual content
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

// Split long tweet into multiple tweets (handles cut-off issue)
function splitTweet(text, maxLength = 275) {
    if (text.length <= maxLength) return [text];
    
    const tweets = [];
    let remaining = text;
    
    while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
            tweets.push(remaining);
            break;
        }
        
        // Find a good break point (space, punctuation)
        let breakPoint = maxLength;
        const lastSpace = remaining.lastIndexOf(' ', maxLength);
        const lastPeriod = remaining.lastIndexOf('. ', maxLength);
        const lastComma = remaining.lastIndexOf(', ', maxLength);
        
        // Prefer sentence breaks, then commas, then spaces
        if (lastPeriod > maxLength * 0.5) {
            breakPoint = lastPeriod + 1;
        } else if (lastComma > maxLength * 0.5) {
            breakPoint = lastComma + 1;
        } else if (lastSpace > maxLength * 0.5) {
            breakPoint = lastSpace;
        }
        
        tweets.push(remaining.substring(0, breakPoint).trim() + '...');
        remaining = '...' + remaining.substring(breakPoint).trim();
    }
    
    return tweets;
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
    const rawTweets = content.thread || [];
    
    // Process tweets - split any that are too long
    const tweets = [];
    for (const tweet of rawTweets) {
        const splitTweets = splitTweet(tweet, 275);
        tweets.push(...splitTweets);
    }
    
    console.log(`🐦 Posting ${tweets.length} tweets (from ${rawTweets.length} original)`);
    
    // Post thread
    let lastTweetId = null;
    const postedTweets = [];
    
    for (let i = 0; i < tweets.length; i++) {
        const tweetText = tweets[i].substring(0, 280); // Safety limit
        
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

        // Get post schedule for today
        const schedule = getPostSchedule();
        let content, topicInfo;
        
        console.log(`📅 Post Type: ${schedule.postType}`);
        if (schedule.category) console.log(`📂 Category: ${schedule.category}`);
        
        // Fetch recent topics to avoid repetition (for tutorials and case studies)
        const recentTopics = await getRecentTopics(config);
        console.log(`📊 Found ${recentTopics.length} recent posts`);
        
        switch (schedule.postType) {
            case 'weekly_recap':
                // Monday morning = Weekly Tech + Business Recap (8 Tavily credits)
                console.log(`📰 Generating Weekly Tech + Business Recap...`);
                content = await generateWeeklyRecap(config);
                topicInfo = { 
                    type: 'weekly_recap', 
                    category: 'recap', 
                    topic: 'Weekly Tech + Business Recap',
                    tavilyCredits: 8
                };
                break;
                
            case 'trends':
                // Morning = Latest Trends & Insights (alternating tech/business) - 1 Tavily credit
                const trendsLabel = schedule.categoryType === 'tech' ? '🔧 Tech' : '💼 Business';
                console.log(`📊 Generating ${trendsLabel} Trends for ${schedule.category}...`);
                content = await generateTrends(schedule.category, schedule.categoryType, config);
                topicInfo = { 
                    type: 'trends', 
                    category: schedule.category,
                    categoryType: schedule.categoryType,
                    topic: content.title,
                    tavilyCredits: 1
                };
                break;
                
            case 'business':
                // Afternoon = Startup, Business & MBA content (1 Tavily credit)
                console.log(`� Generating Business/MBA content for ${schedule.category}...`);
                content = await generateBusinessContent(schedule.category, recentTopics, config);
                topicInfo = { 
                    type: 'business', 
                    category: schedule.category, 
                    topic: content.title,
                    tavilyCredits: 1
                };
                break;
                
            case 'tutorial':
                // Evening = Technical Tutorial (no Tavily)
                console.log(`📚 Generating Technical Tutorial for ${schedule.category}...`);
                content = await generateTutorial(schedule.category, recentTopics, config);
                topicInfo = { 
                    type: 'tutorial', 
                    category: schedule.category, 
                    topic: content.title,
                    tavilyCredits: 0
                };
                break;
                
            default:
                throw new Error(`Unknown post type: ${schedule.postType}`);
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
            ...topicInfo,
            title: content.title,
            platforms: results
        });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}
