-- Migración: corrige discrepancias entre schema original y código de la aplicación

-- 1. Agregar session_id a user_progress (requerido por submitAnswer y completeSession)
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Índice para acelerar queries por session_id
CREATE INDEX IF NOT EXISTS idx_user_progress_session_id
  ON user_progress (session_id);

-- 2. Cambiar badges.condition de TEXT a JSONB para que Supabase lo devuelva como objeto
--    (el código lo trata como BadgeConditionJson, no como string)
ALTER TABLE badges
  ALTER COLUMN condition TYPE JSONB USING condition::jsonb;

-- 3. Agregar columna updated_at a user_stats (usada en upserts del código)
ALTER TABLE user_stats
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 4. Agregar columna updated_at a user_preferences (usada en upserts del código)
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 5. RLS: permitir upsert en user_stats (el código hace upsert, no solo insert/update)
CREATE POLICY IF NOT EXISTS "Users can upsert own stats" ON user_stats
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. RLS: permitir upsert en user_preferences
CREATE POLICY IF NOT EXISTS "Users can upsert own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. RLS: permitir update en user_progress (para marcar completed_at)
CREATE POLICY IF NOT EXISTS "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);
