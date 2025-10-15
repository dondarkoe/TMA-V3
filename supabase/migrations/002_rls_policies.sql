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

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policies for users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audio Files policies
CREATE POLICY "Users can view their own audio files" ON audio_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio files" ON audio_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio files" ON audio_files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio files" ON audio_files
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policies for audio files
CREATE POLICY "Admins can view all audio files" ON audio_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Analyses policies
CREATE POLICY "Users can view their own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" ON analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" ON analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policies for analyses
CREATE POLICY "Admins can view all analyses" ON analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Mix Comparisons policies
CREATE POLICY "Users can view their own mix comparisons" ON mix_comparisons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mix comparisons" ON mix_comparisons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mix comparisons" ON mix_comparisons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mix comparisons" ON mix_comparisons
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policies for mix comparisons
CREATE POLICY "Admins can view all mix comparisons" ON mix_comparisons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Chat Sessions policies
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policies for chat sessions
CREATE POLICY "Admins can view all chat sessions" ON chat_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Chat Messages policies (linked through chat_sessions)
CREATE POLICY "Users can view messages in their own chat sessions" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their own chat sessions" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their own chat sessions" ON chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Admin policies for chat messages
CREATE POLICY "Admins can view all chat messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- KOE Lab Sessions policies
CREATE POLICY "Users can view their own KOE lab sessions" ON koe_lab_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KOE lab sessions" ON koe_lab_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KOE lab sessions" ON koe_lab_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own KOE lab sessions" ON koe_lab_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ARK Profiles policies
CREATE POLICY "Users can view their own ARK profiles" ON ark_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ARK profiles" ON ark_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ARK profiles" ON ark_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ARK profiles" ON ark_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Shotlist Items policies
CREATE POLICY "Users can view their own shotlist items" ON shotlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shotlist items" ON shotlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shotlist items" ON shotlist_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shotlist items" ON shotlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- User Shotlists policies
CREATE POLICY "Users can view their own shotlists" ON user_shotlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shotlists" ON user_shotlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shotlists" ON user_shotlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shotlists" ON user_shotlists
  FOR DELETE USING (auth.uid() = user_id);

-- Content Ideas policies
CREATE POLICY "Users can view their own content ideas" ON content_ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content ideas" ON content_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content ideas" ON content_ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content ideas" ON content_ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Artist Production Styles policies
CREATE POLICY "Users can view their own artist production styles" ON artist_production_styles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own artist production styles" ON artist_production_styles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artist production styles" ON artist_production_styles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artist production styles" ON artist_production_styles
  FOR DELETE USING (auth.uid() = user_id);

-- Sound Recipes policies
CREATE POLICY "Users can view their own sound recipes" ON sound_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sound recipes" ON sound_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sound recipes" ON sound_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sound recipes" ON sound_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Saved Progressions policies
CREATE POLICY "Users can view their own saved progressions" ON saved_progressions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved progressions" ON saved_progressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved progressions" ON saved_progressions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved progressions" ON saved_progressions
  FOR DELETE USING (auth.uid() = user_id);

-- User Brain Dump Entries policies
CREATE POLICY "Users can view their own brain dump entries" ON user_brain_dump_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brain dump entries" ON user_brain_dump_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brain dump entries" ON user_brain_dump_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brain dump entries" ON user_brain_dump_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Brain Dump Insights policies (linked through user_brain_dump_entries)
CREATE POLICY "Users can view insights for their own brain dumps" ON brain_dump_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_brain_dump_entries
      WHERE user_brain_dump_entries.id = brain_dump_insights.brain_dump_id 
      AND user_brain_dump_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert insights for their own brain dumps" ON brain_dump_insights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_brain_dump_entries
      WHERE user_brain_dump_entries.id = brain_dump_insights.brain_dump_id 
      AND user_brain_dump_entries.user_id = auth.uid()
    )
  );

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- AI Assistants policies (public read, admin write)
CREATE POLICY "Anyone can view active AI assistants" ON ai_assistants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage AI assistants" ON ai_assistants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Global AI Config policies (admin only)
CREATE POLICY "Admins can manage global AI configs" ON global_ai_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );