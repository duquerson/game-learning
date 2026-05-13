# Implementation Tasks: UX Core Enhancements

## Phase 1: Onboarding (Step 2 + Progress)

1. [ ] Add difficulty step to OnboardingForm.vue
  - Add step management (step 1 = topics, step 2 = difficulty)
  - Add difficulty radio buttons (easy/medium/hard, default medium)
  - Add 2-step progress indicator with step labels
  - Update form submission to include difficulty
  - **Files**: `src/components/onboarding/OnboardingForm.vue`

2. [ ] Update onboarding server action schema
  - Add `difficulty` field to `savePreferences` input schema (zod)
  - Persist difficulty in `user_preferences` table
  - **Files**: `src/actions/index.ts`

## Phase 2: Library (Search + Sort + Grouping)

3. [ ] Add text search to CardLibrary.vue
  - Add search input at top of filters section
  - Implement client-side text filter on card title and content
  - Debounce input (300ms) to avoid re-render on every keystroke
  - **Files**: `src/components/cards/CardLibrary.vue`

4. [ ] Add sort controls to CardLibrary.vue
  - Add sort dropdown (by difficulty asc/desc, by topic alphabetical)
  - Implement sort function that re-orders filtered cards
  - **Files**: `src/components/cards/CardLibrary.vue`

5. [ ] Add topic grouping to CardLibrary.vue
  - Group cards by `topic` then `subtopic` with section headers
  - Show count per section (e.g., "JavaScript > Arrays (5 tarjetas)")
  - **Files**: `src/components/cards/CardLibrary.vue`

## Phase 3: Quiz Mode (Timer + 10 Cards + Explanation)

6. [ ] Add 30-second timer to ReviewCard.vue (quiz mode)
  - Add countdown timer display (circular or bar)
  - Auto-submit as incorrect when timer reaches 0
  - Reset timer for each new question
  - **Files**: `src/components/cards/ReviewCard.vue`

7. [ ] Limit quiz sessions to 10 cards
  - Shuffle all available cards, select first 10
  - **Files**: `src/pages/review/[mode].astro`

8. [ ] Add explanation display after quiz answers
  - Show card content as explanation after correct/incorrect feedback
  - **Files**: `src/components/cards/ReviewCard.vue`

## Phase 4: Self-Assessment Flip (Timer + 10 Cards)

9. [ ] Add 30-second timer to self-assessment mode
  - Show countdown timer for flip action
  - Auto-flip and mark as incorrect when timer expires
  - **Files**: `src/components/cards/ReviewCard.vue`

10. [ ] Limit self-assessment sessions to 10 cards
  - Same shuffle+slice logic as quiz mode
  - **Files**: `src/pages/review/[mode].astro` (shared fix with task 7)

## Phase 5: Dashboard (Progress Bar + Greeting + All Badges)

11. [ ] Add progress bar to Dashboard.vue
  - Add `totalCards` prop (count of cards matching user topics)
  - Add progress bar visual: `reviewedCards / totalCards`
  - Show percentage and fraction text
  - **Files**: `src/components/layout/Dashboard.vue`, `src/pages/dashboard.astro`

12. [ ] Add personalized greeting to Dashboard.vue
  - Use user email to extract name/initial for greeting
  - Show time-appropriate greeting ("Buenos días", "Buenas tardes", "Buenas noches")
  - **Files**: `src/components/layout/Dashboard.vue`, `src/pages/dashboard.astro`

13. [ ] Show all unlocked badges on dashboard
  - Fetch all user badges (not just recent 3)
  - Display all badges using BadgeItem component
  - **Files**: `src/components/layout/Dashboard.vue`, `src/pages/dashboard.astro`

## Phase 6: Profile (Avatar + Badges)

14. [ ] Add avatar with initials to ProfileView.vue
  - Extract first letter of email for initial
  - Display in colored circle at top of profile
  - **Files**: `src/components/profile/ProfileView.vue`

15. [ ] Add badges section to ProfileView.vue
  - Fetch and display all unlocked badges
  - Reuse BadgeItem component
  - **Files**: `src/components/profile/ProfileView.vue`, `src/pages/profile.astro`

## Phase 7: Navigation (Collapsible Sidebar + Header + Bottom Nav)

16. [ ] Add sidebar collapse/expand toggle
  - Add collapse button (chevron icon)
  - When collapsed: show only icons (labels hidden)
  - When expanded: show icons + labels
  - Persist state in localStorage
  - **Files**: `src/components/layout/Sidebar.vue`

17. [ ] Add global header with stats
  - Add header bar at top of AppLayout showing logo, points, streak, theme toggle
  - Stats should read from same Pinia store as sidebar
  - **Files**: `src/layouts/AppLayout.astro`, new `HeaderBar.vue` component

18. [ ] Update bottom nav for adaptive icon/text
  - Active item: show icon + text label
  - Inactive items: show icon only (hide `.label`)
  - **Files**: `src/components/layout/BottomNav.vue`
