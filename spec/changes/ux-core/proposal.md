# Change Proposal: UX Core Enhancements

## Why

The current MicroLearn implementation has several UX gaps that reduce user engagement and learning effectiveness:
- Onboarding lacks difficulty selection and visual progress
- Library lacks search, sort, and topic grouping — users can't efficiently find content
- Quiz mode lacks a timer and explanation feedback, reducing urgency and learning
- Dashboard lacks a progress bar and personalized greeting
- Profile lacks avatar and badge display
- Navigation lacks collapsible sidebar, global header with stats, and adaptive bottom nav

Closing these gaps will improve the learning experience and bring the implementation in line with the 15 user stories defined in `src/docs/`.

## What Changes

### Onboarding (ONB-002)
- Add difficulty selection step (easy/medium/hard) as step 2 of the onboarding flow
- Add 2-step progress indicator (step 1/2) with labels
- Add `difficulty` field to `user_preferences`
- Update `onboarding.savePreferences` action schema

### Library (LIB-003)
- Add text search input to filter cards by title and content
- Add sort controls (by difficulty asc/desc, by topic alphabetical)
- Add topic grouping with section headers and subtopic breakdown

### Quiz Mode (REV-004)
- Add 30-second countdown timer per question
- Auto-mark as incorrect when timer expires
- Limit session to 10 randomly selected cards
- Display card content as explanation after answering

### Self-Assessment Flip (REV-011)
- Add 30-second countdown timer per card flip
- Auto-flip and mark as incorrect when timer expires
- Limit session to 10 randomly selected cards

### Dashboard (DSH-007)
- Add progress bar showing reviewed cards vs total available
- Add personalized greeting using user email/name
- Show all unlocked badges (not just recent 3)

### Profile (PRF-009)
- Add avatar circle with email initial at top of profile
- Add badges section showing all unlocked badges

### Layout/Navigation (LYT-012)
- Add sidebar collapse/expand toggle with localStorage persistence
- Add global header bar with logo, points, streak, and theme toggle
- Change bottom nav to show icon+text only for active item; inactive items show icon only

## Impact

### Specifications Affected
- `src/docs/user-story-onboarding-002.md`
- `src/docs/user-story-library-003.md`
- `src/docs/user-story-review-004.md`
- `src/docs/user-story-self-assessment-011.md`
- `src/docs/user-story-dashboard-007.md`
- `src/docs/user-story-profile-009.md`
- `src/docs/user-story-layout-012.md`

### Code Changes
- **Modified components**: OnboardingForm, CardLibrary, ReviewCard, Dashboard, ProfileView, Sidebar, BottomNav, AppLayout
- **Modified actions**: onboarding.savePreferences schema
- **New/modified pages**: dashboard.astro (add queries)
- **New composables or utils**: search, sort, timer helpers

### User Impact
- Users will have a more guided onboarding with difficulty selection
- Users can search, sort, and browse cards by topic
- Quiz becomes more engaging with timer and explanations
- Dashboard shows meaningful progress and personalization
- Profile shows identity and achievements
- Navigation is more flexible and context-aware

### Risk Assessment
- Low: all changes are additive (no existing behavior removed)
- Medium: ReviewCard timer changes the quiz interaction — may feel different for existing users
- Low: Sidebar collapse is progressive enhancement
