-- Track review answers by client session and mark them consumed at completion.
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

UPDATE user_progress
SET session_id = gen_random_uuid()
WHERE session_id IS NULL;

ALTER TABLE user_progress
  ALTER COLUMN session_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_progress_session
  ON user_progress (user_id, session_id, completed_at);
