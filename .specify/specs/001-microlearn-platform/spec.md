# Feature Specification: MicroLearn Platform

## Problem Statement

Create a gamified microlearning platform for developers to learn JavaScript and TypeScript through flashcards. Users earn points, maintain daily streaks, and unlock badges as they progress.

## User Stories

### Story 1: Authentication

As a new user
I want to register with email and password
So that I can create my account and access the platform

**Acceptance Criteria:**
- [ ] User can register with email, password, and password confirmation
- [ ] Email validation (valid format)
- [ ] Password minimum 8 characters
- [ ] Error messages displayed on failure
- [ ] Redirect to onboarding on success

### Story 2: Login

As a registered user
I want to login with email and password
So that I can access my account

**Acceptance Criteria:**
- [ ] User can login with email and password
- [ ] Error message for invalid credentials
- [ ] Redirect to dashboard on success
- [ ] Session persists on page refresh

### Story 3: Onboarding

As a new user
I want to select my learning topics
So that I can personalize my experience

**Acceptance Criteria:**
- [ ] Only appears first time (onboarding_completed = false)
- [ ] Options: JavaScript, TypeScript, or Both
- [ ] Must select at least one topic
- [ ] Creates user_stats with initial values
- [ ] Redirects to dashboard after completion

### Story 4: Card Library

As a user
I want to browse available flashcards
So that I can see what content is available

**Acceptance Criteria:**
- [ ] Shows cards filtered by selected topics
- [ ] Filter by topic (JS/TS)
- [ ] Filter by difficulty (easy/medium/hard)
- [ ] Visual indicator for already reviewed cards
- [ ] Grouped by topic and subtopic

### Story 5: Review Mode

As a user
I want to review flashcards one by one
So that I can test my knowledge

**Acceptance Criteria:**
- [ ] Shows one card at a time
- [ ] Display title + summary (max 150 words)
- [ ] Progress counter (e.g., "Card 3 of 10")
- [ ] Visual progress bar
- [ ] "I knew it" button (correct)
- [ ] "I didn't know" button (incorrect)
- [ ] Immediate feedback (green/red)
- [ ] Auto-advance to next card

### Story 6: Points System

As a user
I want to earn points for correct answers
So that I can track my progress

**Acceptance Criteria:**
- [ ] Easy correct: +10 points
- [ ] Medium correct: +20 points
- [ ] Hard correct: +30 points
- [ ] 3 correct in a row: +5 bonus
- [ ] 5 correct in a row: +15 bonus
- [ ] Points saved to user_progress table
- [ ] Total points updated in user_stats

### Story 7: Review Results

As a user
I want to see my review session results
So that I know how I performed

**Acceptance Criteria:**
- [ ] Total cards reviewed
- [ ] Correct vs incorrect count
- [ ] Accuracy percentage
- [ ] Points earned in session
- [ ] New badges unlocked (if any)
- [ ] "Review again" button
- [ ] "Back to dashboard" button

### Story 8: Daily Streak

As a user
I want to maintain a daily study streak
So that I stay motivated

**Acceptance Criteria:**
- [ ] Streak increases if studied yesterday
- [ ] Streak resets if missed a day
- [ ] No change if already studied today
- [ ] Display current streak on dashboard
- [ ] Streak saved to user_stats

### Story 9: Dashboard

As a user
I want to see my progress overview
So that I can quickly assess my status

**Acceptance Criteria:**
- [ ] Personalized greeting with user name
- [ ] Current streak display (e.g., "5 days")
- [ ] Total points always visible
- [ ] Progress bar (reviewed / total cards)
- [ ] Recent badges (last 3)
- [ ] "Continue studying" button

### Story 10: Badge System

As a user
I want to earn badges
So that I feel rewarded for my progress

**Acceptance Criteria:**
- [ ] 9 base badges defined in badges table
- [ ] Auto-unlock when conditions met
- [ ] Badges never lost once earned
- [ ] Badge gallery shows all (locked/unlocked)
- [ ] Locked badges show requirements
- [ ] Unlocked badges show unlock date

### Story 11: User Profile

As a user
I want to view my profile
So that I can see my detailed statistics

**Acceptance Criteria:**
- [ ] User avatar (initials if no photo)
- [ ] Email and username
- [ ] Total points
- [ ] Current and longest streak
- [ ] Cards reviewed per topic (JS vs TS)
- [ ] Overall accuracy percentage
- [ ] All earned badges with dates

### Story 12: Theme Toggle

As a user
I want to switch between light and dark themes
So that I can use the app comfortably in any environment

**Acceptance Criteria:**
- [ ] Light theme: Violet/Rose palette
- [ ] Dark theme: Cyan/Mint palette
- [ ] Toggle persisted in localStorage
- [ ] Respects system preference on first visit
- [ ] No flash of wrong theme on load

## Non-Functional Requirements

- Mobile-first design (base: 375px)
- Desktop layout: sidebar + content (lg+)
- Card content maximum 150 words
- All tables have RLS enabled
- Glassmorphism requires gradient background behind cards

## Success Metrics

- User can complete full flow: register → onboarding → review → results → dashboard
- Points calculated correctly per difficulty
- Streak logic works correctly
- Badges unlock automatically
- Responsive on mobile and desktop

## Out of Scope

- Social features (sharing, leaderboards)
- Multiple user sessions
- Content creation (admin only)
- Offline mode
- Push notifications

## Clarifications

### Q1: How many cards per review session?

**Context**: Affects UX and database queries.
**Options**: 5, 10, 15, 20, all available

**Answer**: Default 10 cards per session. User can start new session anytime.

### Q2: What happens if user runs out of cards to review?

**Context**: Edge case handling.
**Options**: Show message, offer to reset progress, suggest other topic

**Answer**: Show "All caught up!" message with option to review incorrect cards again or switch topics.

### Q3: How to handle Supabase connection errors?

**Context**: User experience during outages.
**Options**: Silent retry, show error, offline mode

**Answer**: Show clear error message with retry button. No offline mode for v1.
