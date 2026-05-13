-- ============================================================
-- Migration 002: Add structured question + options to cards
-- ============================================================

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS question   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS options    JSONB,
  ADD COLUMN IF NOT EXISTS correct_answer TEXT NOT NULL DEFAULT 'A';

-- Backfill: existing cards get a default question = title
-- (so they don't break until seed is re-run)
UPDATE cards
SET
  question = title,
  options = jsonb_build_array(
    jsonb_build_object('id', 'A', 'text', title, 'isCorrect', true),
    jsonb_build_object('id', 'B', 'text', title || ' (con variacion)', 'isCorrect', false),
    jsonb_build_object('id', 'C', 'text', 'Otro concepto relacionado', 'isCorrect', false),
    jsonb_build_object('id', 'D', 'text', 'Ninguna de las anteriores', 'isCorrect', false)
  ),
  correct_answer = 'A'
WHERE question = '';
