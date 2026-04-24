-- ============================================================
-- MicroLearn Platform — Initial Schema
-- ============================================================

-- TABLA: cards (contenido público, sin RLS restrictivo)
CREATE TABLE IF NOT EXISTS cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  topic       TEXT NOT NULL,           -- texto libre, extensible (no enum fijo)
  subtopic    TEXT NOT NULL DEFAULT '',
  difficulty  TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points      INTEGER NOT NULL DEFAULT 10,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cards_topic ON cards (topic);
CREATE INDEX IF NOT EXISTS idx_cards_difficulty ON cards (difficulty);
CREATE INDEX IF NOT EXISTS idx_cards_topic_subtopic ON cards (topic, subtopic);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards_read_authenticated"
  ON cards FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- TABLA: badges (contenido público)
-- ============================================================
CREATE TABLE IF NOT EXISTS badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  level       TEXT NOT NULL CHECK (level IN ('basic', 'intermediate', 'advanced')),
  condition   JSONB NOT NULL
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_read_authenticated"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- TABLA: user_progress (RLS por usuario)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id     UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  correct     BOOLEAN NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_card ON user_progress (user_id, card_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_reviewed_at ON user_progress (user_id, reviewed_at);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_progress_own"
  ON user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLA: user_stats (RLS por usuario, 1 fila por usuario)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_stats (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points    INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  current_streak  INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak  INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_study_date DATE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_stats_own"
  ON user_stats FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLA: user_badges (RLS por usuario)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges (user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges_own"
  ON user_badges FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLA: user_preferences (RLS por usuario, 1 fila por usuario)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_topics      TEXT[] NOT NULL DEFAULT '{}',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_preferences_own"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
