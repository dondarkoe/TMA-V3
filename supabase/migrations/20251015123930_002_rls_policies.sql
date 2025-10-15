/*
  # Row Level Security Policies

  1. Security Configuration
    - Enable RLS on all tables
    - Create policies for user data access
    - Admin policies for management operations
    - Public read policies where appropriate

  2. Policy Strategy
    - Users can only access their own data
    - Admin users have full access to all data
    - AI assistants table has public read for active assistants
    - All policies use auth.uid() for user identification
*/

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mix_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE koe_lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ark_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shotlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shotlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_production_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sound_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brain_dump_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_dump_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_ai_configs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin policies for users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audio Files policies
CREATE POLICY "Users can view their own audio files" ON audio_files
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio files" ON audio_files
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio files" ON audio_files
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio files" ON audio_files
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin policies for audio files
CREATE POLICY "Admins can view all audio files" ON audio_files
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Analyses policies
CREATE POLICY "Users can view their own analyses" ON analyses
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" ON analyses
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" ON analyses
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" ON analyses
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Mix Comparisons policies
CREATE POLICY "Users can view their own mix comparisons" ON mix_comparisons
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mix comparisons" ON mix_comparisons
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mix comparisons" ON mix_comparisons
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mix comparisons" ON mix_comparisons
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Chat Sessions policies
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON chat_sessions
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON chat_sessions
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Chat Messages policies (linked through chat_sessions)
CREATE POLICY "Users can view messages in their own chat sessions" ON chat_messages
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their own chat sessions" ON chat_messages
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their own chat sessions" ON chat_messages
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- KOE Lab Sessions policies
CREATE POLICY "Users can view their own KOE lab sessions" ON koe_lab_sessions
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KOE lab sessions" ON koe_lab_sessions
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KOE lab sessions" ON koe_lab_sessions
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own KOE lab sessions" ON koe_lab_sessions
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ARK Profiles policies
CREATE POLICY "Users can view their own ARK profiles" ON ark_profiles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ARK profiles" ON ark_profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ARK profiles" ON ark_profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ARK profiles" ON ark_profiles
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Shotlist Items policies
CREATE POLICY "Users can view their own shotlist items" ON shotlist_items
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shotlist items" ON shotlist_items
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shotlist items" ON shotlist_items
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shotlist items" ON shotlist_items
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- User Shotlists policies
CREATE POLICY "Users can view their own shotlists" ON user_shotlists
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shotlists" ON user_shotlists
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shotlists" ON user_shotlists
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shotlists" ON user_shotlists
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Content Ideas policies
CREATE POLICY "Users can view their own content ideas" ON content_ideas
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content ideas" ON content_ideas
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content ideas" ON content_ideas
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content ideas" ON content_ideas
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Artist Production Styles policies
CREATE POLICY "Users can view their own artist production styles" ON artist_production_styles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own artist production styles" ON artist_production_styles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artist production styles" ON artist_production_styles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artist production styles" ON artist_production_styles
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Sound Recipes policies
CREATE POLICY "Users can view their own sound recipes" ON sound_recipes
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sound recipes" ON sound_recipes
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sound recipes" ON sound_recipes
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sound recipes" ON sound_recipes
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Saved Progressions policies
CREATE POLICY "Users can view their own saved progressions" ON saved_progressions
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved progressions" ON saved_progressions
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved progressions" ON saved_progressions
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved progressions" ON saved_progressions
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- User Brain Dump Entries policies
CREATE POLICY "Users can view their own brain dump entries" ON user_brain_dump_entries
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brain dump entries" ON user_brain_dump_entries
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brain dump entries" ON user_brain_dump_entries
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brain dump entries" ON user_brain_dump_entries
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Brain Dump Insights policies (linked through user_brain_dump_entries)
CREATE POLICY "Users can view insights for their own brain dumps" ON brain_dump_insights
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_brain_dump_entries
      WHERE user_brain_dump_entries.id = brain_dump_insights.brain_dump_id 
      AND user_brain_dump_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert insights for their own brain dumps" ON brain_dump_insights
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_brain_dump_entries
      WHERE user_brain_dump_entries.id = brain_dump_insights.brain_dump_id 
      AND user_brain_dump_entries.user_id = auth.uid()
    )
  );

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON conversations
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- AI Assistants policies (public read, admin write)
CREATE POLICY "Anyone can view active AI assistants" ON ai_assistants
  FOR SELECT 
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage AI assistants" ON ai_assistants
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Global AI Config policies (authenticated read, admin write)
CREATE POLICY "Authenticated users can view active configs" ON global_ai_configs
  FOR SELECT 
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage global AI configs" ON global_ai_configs
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );