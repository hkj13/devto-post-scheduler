-- AutoContent Studio Database Schema
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  topmate_payment_id TEXT,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired'))
);

-- Create user_config table
CREATE TABLE IF NOT EXISTS user_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  openai_api_key TEXT,
  devto_api_key TEXT,
  medium_api_key TEXT,
  twitter_bearer_token TEXT,
  platforms_enabled JSONB DEFAULT '{"devto": false, "medium": false, "twitter": false}'::jsonb,
  content_topics TEXT[] DEFAULT ARRAY['AgenticAI', 'GenerativeAI', 'LLM'],
  post_schedule TEXT DEFAULT '0 9 * * *',
  railway_deployment_id TEXT,
  automation_status TEXT DEFAULT 'pending' CHECK (automation_status IN ('pending', 'deploying', 'active', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create posts table (for tracking published posts)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platforms JSONB,
  urls JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_config_user_id ON user_config(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can view own config" ON user_config;
DROP POLICY IF EXISTS "Users can update own config" ON user_config;
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;

-- Create RLS policies
-- Users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- User config table
CREATE POLICY "Users can view own config" ON user_config
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON user_config
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" ON user_config
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Posts table
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_config
DROP TRIGGER IF EXISTS update_user_config_updated_at ON user_config;
CREATE TRIGGER update_user_config_updated_at
  BEFORE UPDATE ON user_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON user_config TO anon, authenticated;
GRANT ALL ON posts TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables created: users, user_config, posts';
  RAISE NOTICE 'RLS policies enabled';
END $$;
