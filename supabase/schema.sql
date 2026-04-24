-- Supabase Schema for MicroLearn Platform

-- Table: cards (flashcard content)
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  topic TEXT CHECK (topic IN ('javascript', 'typescript')) NOT NULL,
  subtopic TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
  points_value INT NOT NULL
);

-- Table: user_progress (review history)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  card_id UUID REFERENCES cards NOT NULL,
  correct BOOLEAN NOT NULL,
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

-- Table: user_stats (points, streak)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  total_points INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_study_date DATE
);

-- Table: badges (badge catalog)
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT CHECK (level IN ('basic', 'intermediate', 'advanced')) NOT NULL,
  condition TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- Table: user_badges (unlocked badges)
CREATE TABLE user_badges (
  user_id UUID REFERENCES auth.users NOT NULL,
  badge_id UUID REFERENCES badges NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- Table: user_preferences (onboarding)
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  selected_topics TEXT[] NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL_security;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_stats
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for cards (public read)
CREATE POLICY "Anyone can view cards" ON cards
  FOR SELECT USING (true);

-- RLS for badges (public read)
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);