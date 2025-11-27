# AutoContent Studio Dashboard

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Railway API (for deploying customer automation)
RAILWAY_API_TOKEN=your_railway_token

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  topmate_payment_id TEXT,
  subscription_status TEXT DEFAULT 'active'
);

-- Create user_config table
CREATE TABLE user_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  devto_api_key TEXT,
  medium_api_key TEXT,
  twitter_bearer_token TEXT,
  openai_api_key TEXT,
  platforms_enabled JSONB DEFAULT '{"devto": false, "medium": false, "twitter": false}',
  content_topics TEXT[] DEFAULT ARRAY['AgenticAI', 'GenerativeAI', 'LLM'],
  post_schedule TEXT DEFAULT '0 9 * * *',
  railway_deployment_id TEXT,
  automation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create posts table (for tracking)
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platforms JSONB,
  urls JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own config" ON user_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own config" ON user_config FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard.

---

## 📁 Project Structure

```
dashboard/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx             # Home (redirects)
│   ├── login/
│   │   └── page.tsx         # Login page
│   ├── dashboard/
│   │   └── page.tsx         # Main dashboard
│   └── api/
│       ├── auth/
│       │   ├── login/       # Login API
│       │   └── register/    # Registration API
│       └── config/
│           ├── save/        # Save user config
│           └── deploy/      # Deploy automation
├── components/              # Reusable components
└── lib/                     # Utilities
```

---

## 🔑 How It Works

### Customer Flow:
1. Customer pays ₹2,999 on Topmate
2. You create their account (email + temp password)
3. Customer logs into dashboard
4. Connects platforms (pastes API keys)
5. Configures topics and schedule
6. Clicks "Start Automation"
7. System deploys Railway automation for them
8. Posts start automatically!

### Admin Flow:
1. Get Topmate payment notification
2. Run: `npm run create-user -- email@example.com`
3. Email customer: "Your login: email@example.com, password: [temp]"
4. Customer self-onboards

---

## 🎯 Next Steps

After basic dashboard works:
- [ ] Add admin panel for creating users
- [ ] Add webhook to auto-create users from Topmate
- [ ] Add analytics dashboard
- [ ] Add post history view
- [ ] Add billing/subscription management
- [ ] Add platform OAuth (no API keys needed)

---

## 💰 Cost Per Customer

- Railway hosting: ~$0.50/customer/month
- Database queries: Minimal (Supabase free tier)
- Total: **~$0.50/customer**

**At ₹2,999/month per customer, you have 98%+ profit margin!**
