# Change Proposal: Polish & Backend Enhancements

## Why

Several backend and data integrity gaps remain after the UX Core and Accessibility changes. The badge system lacks a `category` field (needed for proper grouping per story BDG-008), theme preferences don't sync to the database (per story THE-010), error handling lacks retry buttons and rate limit detection (per story ERR-013), and point values in the code don't match the story spec (code uses 10/20/30, spec says 5/10/15).

Closing these gaps ensures data integrity, cross-session consistency, and alignment between the implementation and the 15 user stories.

## What Changes

### Badge Category Field
- Add `category` column to `badges` Supabase table
- Add `category` field to TypeScript `Badge` type
- Map values: achievement (logro), streak (racha), mastery (maestría)
- Update BadgeItem to display category label

### Theme DB Persistence
- Add `theme` column to `user_preferences` Supabase table (nullable, 'light' | 'dark')
- Create `auth.updateTheme` server action
- Update `useTheme.ts` composable to sync to DB after toggle
- Load theme from DB on session restore

### Retry Buttons on Errors
- Update error handling to show "Reintentar" button on recoverable errors
- Apply to all catch blocks in server actions and components
- Detect network errors via `navigator.onLine` and error types

### Rate Limit / Timeout Handling
- Add `RATE_LIMIT` and `TIMEOUT` to `AppErrorCode` type
- Update `mapSupabaseError` to detect 429 and 408 responses
- Add specific user-facing messages for each

### Points Value Sync
- Update `BASE_POINTS` in `src/lib/points.ts` from `{ easy: 10, medium: 20, hard: 30 }` to `{ easy: 5, medium: 10, hard: 15 }`
- Update all related tests and seed data

## Impact

### Specifications Affected
- `src/docs/user-story-badges-008.md`
- `src/docs/user-story-theme-010.md`
- `src/docs/user-story-errors-013.md`
- `src/docs/user-story-points-005.md`

### Code Changes
- **Modified types**: `src/types/app.ts` (Badge interface)
- **Modified services**: `src/lib/badges.ts`, `src/lib/points.ts`, `src/lib/errors.ts`, `src/lib/user-error.ts`
- **Server actions**: New `auth.updateTheme`, modified error mapping
- **Composable**: `src/composables/useTheme.ts`
- **Components**: BadgeItem.vue (category display), theme toggle integration
- **DB migrations**: 2 Supabase migrations (badges.category, user_preferences.theme)

### Risk Assessment
- Low: badge category field is additive (no breaking changes)
- Low: theme DB sync is additive (localStorage still works offline)
- Medium: points value change (10→5, 20→10, 30→15) affects all scoring — existing users' points remain unchanged, only new answers use new values
- Low: retry buttons and rate limit handling are additive
