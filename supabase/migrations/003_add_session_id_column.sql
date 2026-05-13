-- ============================================================
-- Agregar columna session_id a user_progress
--解决: Error "Could not find the 'session_id' column of 'user_progress'"
-- ============================================================

-- Agregar columna session_id si no existe (tipo TEXT para flexibilidad)
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Agregar columna completed_at si no existe
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Crear índice para acelerar queries por session
CREATE INDEX IF NOT EXISTS idx_user_progress_session_id
ON user_progress (session_id);

-- Verificar que las columnas existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' AND column_name = 'session_id'
  ) THEN
    RAISE EXCEPTION 'Column session_id was not added';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' AND column_name = 'completed_at'
  ) THEN
    RAISE EXCEPTION 'Column completed_at was not added';
  END IF;
END $$;

-- Comentario para documentación
COMMENT ON COLUMN user_progress.session_id IS 'UUID de la sesión de review';
COMMENT ON COLUMN user_progress.completed_at IS 'Timestamp de cuándo se completó la sesión';