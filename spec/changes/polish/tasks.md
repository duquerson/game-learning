# Implementation Tasks: Polish & Backend Enhancements

## Phase 1: Badge Category Field

- [x] 1. Add category column to badges table
  - Create Supabase migration: `ALTER TABLE badges ADD COLUMN category text`
  - Update seed data with categories for all 9 badges
  - **Files**: New migration file in `supabase/migrations/`

- [x] 2. Update Badge TypeScript interface
  - Add `category: BadgeCategory` to Badge type ('achievement' | 'streak' | 'mastery')
  - Export `BadgeCategory` type
  - **Files**: `src/types/app.ts`

- [x] 3. Update BadgeItem component to display category
  - Show category label (logro/racha/maestría) with chip style
  - **Files**: `src/components/badges/BadgeItem.vue`

## Phase 2: Theme DB Persistence

- [x] 4. Add theme column to user_preferences table
  - Create Supabase migration: `ALTER TABLE user_preferences ADD COLUMN theme text`
  - **Files**: New migration file

- [x] 5. Create theme server action
  - Create `auth.updateTheme` action with zod validation ('light' | 'dark')
  - Upsert theme in `user_preferences`
  - **Files**: `src/actions/index.ts`

- [x] 6. Update useTheme composable for DB sync
  - After toggling theme, call `auth.updateTheme` action
  - **Files**: `src/composables/useTheme.ts`

## Phase 3: Retry Buttons & Error Handling

- [x] 7. Add specific user-facing error messages
  - NETWORK_ERROR: "Sin conexión. Verifica tu internet."
  - SESSION_EXPIRED: "Tu sesión expiró. Inicia sesión de nuevo."
  - **Files**: `src/lib/errors.ts`

- [x] 8. Add rate limit and timeout error types
  - Add `RATE_LIMIT | TIMEOUT` to `AppErrorCode` type
  - Update `mapSupabaseError` to detect 429 and 408 responses
  - Add user-facing messages for each
  - **Files**: `src/lib/errors.ts`

## Phase 4: Points Value Sync

- [x] 9. Update BASE_POINTS to match story spec
  - Change `BASE_POINTS` from `{ easy: 10, medium: 20, hard: 30 }` to `{ easy: 5, medium: 10, hard: 15 }`
  - **Files**: `src/lib/points.ts`
