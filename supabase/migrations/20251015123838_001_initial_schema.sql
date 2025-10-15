/*
  # Initial Schema for TMA Engine OS
  
  1. New Tables
    - users: User profiles and authentication data
    - audio_files: Audio file storage and metadata
    - analyses: Audio analysis results
    - mix_comparisons: Mix comparison data
    - chat_sessions: KOE chat session data
    - chat_messages: Individual chat messages
    - koe_lab_sessions: KOE lab experiment sessions
    - ark_profiles: ARK creative intelligence profiles
    - shotlist_items: Individual shotlist items
    - user_shotlists: User shotlist collections
    - content_ideas: Content strategy ideas and scripts
    - artist_production_styles: Artist style references
    - sound_recipes: Production recipes and templates
    - saved_progressions: Saved chord progressions
    - user_brain_dump_entries: Brain dump text entries
    - brain_dump_insights: AI-generated insights from brain dumps
    - ai_assistants: AI assistant configurations
    - conversations: User conversations with AI
    - global_ai_configs: Global AI configuration settings
  
  2. Security
    - All tables will have RLS enabled in the next migration
    - Proper indexing for performance optimization
    - Automatic updated_at timestamp triggers
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest', 'basic', 'pro', 'premium')),
  email_verified BOOLEAN DEFAULT FALSE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  ark_onboarding_complete BOOLEAN DEFAULT FALSE,
  membership_level TEXT DEFAULT 'guest' CHECK (membership_level IN ('guest', 'basic', 'pro', 'premium')),
  preferred_daw TEXT,
  music_journey_stage TEXT DEFAULT 'intermediate',
  avatar_url TEXT,
  bio TEXT,
  social_links JSONB,
  preferences JSONB
);

-- Audio Files table
CREATE TABLE IF NOT EXISTS audio_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  duration_seconds FLOAT,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  koe_summary JSONB,
  analysis_result JSONB,
  genre TEXT,
  key_signature TEXT,
  tempo INTEGER,
  created_by TEXT
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  audio_file_id UUID REFERENCES audio_files(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  analysis_type TEXT,
  results JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_by TEXT
);

-- Mix Comparisons table
CREATE TABLE IF NOT EXISTS mix_comparisons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_a_id UUID REFERENCES audio_files(id) ON DELETE CASCADE,
  file_b_id UUID REFERENCES audio_files(id) ON DELETE CASCADE,
  comparison_results JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  winner TEXT,
  created_by TEXT
);

-- Chat Sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  project_objective TEXT,
  genre TEXT,
  current_mode TEXT,
  recipe_id TEXT,
  current_step_number INTEGER DEFAULT 0,
  daw TEXT,
  last_buttons JSONB,
  linked_analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  linked_comparison_id UUID REFERENCES mix_comparisons(id) ON DELETE SET NULL,
  session_state JSONB,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  content TEXT NOT NULL,
  message_order INTEGER NOT NULL,
  metadata JSONB
);

-- KOE Lab Sessions table
CREATE TABLE IF NOT EXISTS koe_lab_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  settings JSONB,
  results JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_by TEXT
);

-- ARK Profile table
CREATE TABLE IF NOT EXISTS ark_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creative_intelligence_score FLOAT,
  emotional_intelligence_score FLOAT,
  pattern_recognition_score FLOAT,
  creative_readiness_level TEXT,
  preferences JSONB,
  created_by TEXT
);

-- Shotlist Items table
CREATE TABLE IF NOT EXISTS shotlist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  shot_type TEXT,
  duration_seconds INTEGER,
  order_index INTEGER,
  created_by TEXT
);

-- User Shotlists table
CREATE TABLE IF NOT EXISTS user_shotlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  shotlist_items JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by TEXT
);

-- Content Ideas table
CREATE TABLE IF NOT EXISTS content_ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT,
  hooks JSONB,
  script TEXT,
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'in_progress', 'completed', 'published')),
  created_by TEXT
);

-- Artist Production Styles table
CREATE TABLE IF NOT EXISTS artist_production_styles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  style_description TEXT,
  characteristics JSONB,
  reference_tracks JSONB,
  created_by TEXT
);

-- Sound Recipes table
CREATE TABLE IF NOT EXISTS sound_recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB,
  instructions TEXT,
  genre TEXT,
  created_by TEXT
);

-- Saved Progressions table
CREATE TABLE IF NOT EXISTS saved_progressions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_signature TEXT,
  progression JSONB,
  tempo INTEGER,
  genre TEXT,
  created_by TEXT
);

-- User Brain Dump Entries table
CREATE TABLE IF NOT EXISTS user_brain_dump_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  entry_type TEXT DEFAULT 'text' CHECK (entry_type IN ('text', 'audio', 'image')),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed')),
  extracted_themes JSONB,
  emotional_tone TEXT,
  created_by TEXT
);

-- Brain Dump Insights table
CREATE TABLE IF NOT EXISTS brain_dump_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  brain_dump_id UUID REFERENCES user_brain_dump_entries(id) ON DELETE CASCADE,
  insight_type TEXT,
  content TEXT,
  confidence_score FLOAT,
  created_by TEXT
);

-- AI Assistants table
CREATE TABLE IF NOT EXISTS ai_assistants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assistant_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  persona TEXT,
  icon TEXT,
  color_class TEXT,
  system_prompt TEXT,
  capabilities JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ai_assistant_id UUID REFERENCES ai_assistants(id) ON DELETE SET NULL,
  title TEXT,
  context JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_by TEXT
);

-- Global AI Config table
CREATE TABLE IF NOT EXISTS global_ai_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  config_id TEXT UNIQUE NOT NULL,
  app_id TEXT,
  universal_prompt TEXT,
  config_value JSONB,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_membership_level ON users(membership_level);
CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON audio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_analysis_status ON audio_files(analysis_status);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_mix_comparisons_user_id ON mix_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_order ON chat_messages(chat_session_id, message_order);
CREATE INDEX IF NOT EXISTS idx_content_ideas_user_id ON content_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brain_dump_entries_user_id ON user_brain_dump_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistants_assistant_id ON ai_assistants(assistant_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audio_files_updated_at ON audio_files;
CREATE TRIGGER update_audio_files_updated_at BEFORE UPDATE ON audio_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analyses_updated_at ON analyses;
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mix_comparisons_updated_at ON mix_comparisons;
CREATE TRIGGER update_mix_comparisons_updated_at BEFORE UPDATE ON mix_comparisons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_koe_lab_sessions_updated_at ON koe_lab_sessions;
CREATE TRIGGER update_koe_lab_sessions_updated_at BEFORE UPDATE ON koe_lab_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ark_profiles_updated_at ON ark_profiles;
CREATE TRIGGER update_ark_profiles_updated_at BEFORE UPDATE ON ark_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shotlist_items_updated_at ON shotlist_items;
CREATE TRIGGER update_shotlist_items_updated_at BEFORE UPDATE ON shotlist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_shotlists_updated_at ON user_shotlists;
CREATE TRIGGER update_user_shotlists_updated_at BEFORE UPDATE ON user_shotlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_ideas_updated_at ON content_ideas;
CREATE TRIGGER update_content_ideas_updated_at BEFORE UPDATE ON content_ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artist_production_styles_updated_at ON artist_production_styles;
CREATE TRIGGER update_artist_production_styles_updated_at BEFORE UPDATE ON artist_production_styles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sound_recipes_updated_at ON sound_recipes;
CREATE TRIGGER update_sound_recipes_updated_at BEFORE UPDATE ON sound_recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_progressions_updated_at ON saved_progressions;
CREATE TRIGGER update_saved_progressions_updated_at BEFORE UPDATE ON saved_progressions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_brain_dump_entries_updated_at ON user_brain_dump_entries;
CREATE TRIGGER update_user_brain_dump_entries_updated_at BEFORE UPDATE ON user_brain_dump_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brain_dump_insights_updated_at ON brain_dump_insights;
CREATE TRIGGER update_brain_dump_insights_updated_at BEFORE UPDATE ON brain_dump_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_assistants_updated_at ON ai_assistants;
CREATE TRIGGER update_ai_assistants_updated_at BEFORE UPDATE ON ai_assistants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_global_ai_configs_updated_at ON global_ai_configs;
CREATE TRIGGER update_global_ai_configs_updated_at BEFORE UPDATE ON global_ai_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();