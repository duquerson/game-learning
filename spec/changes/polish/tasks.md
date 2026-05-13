# Implementation Tasks: Polish & Backend Enhancements

## Phase 1: Badge Category Field

1. [ ] Add category column to badges table
  - Create Supabase migration: `ALTER TABLE badges ADD COLUMN category text NOT NULL DEFAULT 'achievement'`
  - Update seed data with categories for all 9 badges
  - **Files**: New migration file in `supabase/migrations/`

2. [ ] Update Badge TypeScript interface
  - Add `category: 'achievement' | 'streak' | 'mastery'` to Badge type
  - Update `src/types/app.ts`
  - **Files**: `src/types/app.ts`

3. [ ] Update BadgeItem component to display category
  - Show category label (logro/racha/maestría) with icon
  - Group badges by category in BadgeGrid
  - **Files**: `src/components/badges/BadgeItem.vue`, `src/components/badges/BadgeGrid.vue`

## Phase 2: Theme DB Persistence

4. [ ] Add theme column to user_preferences table
  - Create Supabase migration: `ALTER TABLE user_preferences ADD COLUMN theme text DEFAULT NULL`
  - **Files**: New migration file

5. [ ] Create theme server action
  - Create `auth.updateTheme` action with zod validation ('light' | 'dark')
  - Upsert theme in `user_preferences`
  - **Files**: `src/actions/index.ts`

6. [ ] Update useTheme composable for DB sync
  - After toggling theme, call `auth.updateTheme` action
  - Load theme from DB on session restore (fallback to localStorage)
  - **Files**: `src/composables/useTheme.ts`

## Phase 3: Retry Buttons & Error Handling

7. [ ] Add retry button support to error handling
  - Create reusable RetryButton component or pattern
  - Update toast.error calls to show "Reintentar" button on recoverable errors
  - Detect network errors via error type and `navigator.onLine`
  - **Files**: `src/lib/user-error.ts`, `src/components/ui/ToasterWrapper.vue`

8. [ ] Add rate limit and timeout error types
  - Add `RATE_LIMIT | TIMEOUT` to `AppErrorCode` type
  - Update `mapSupabaseError` to detect 429 and 408 responses
  - Add user-facing messages: "Demasiadas solicitudes. Espera un momento." and "La solicitud tardó demasiado. Intenta de nuevo."
  - **Files**: `src/lib/errors.ts`

## Phase 4: Points Value Sync

9. [ ] Update BASE_POINTS to match story spec
  - Change `BASE_POINTS` from `{ easy: 10, medium: 20, hard: 30 }` to `{ easy: 5, medium: 10, hard: 15 }`
  - Update all tests that assert point values
  - **Files**: `src/lib/points.ts`, `tests/**/*.test.ts`
