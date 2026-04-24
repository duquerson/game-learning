# Implementation Plan: MicroLearn Platform

## Technology Stack

### Frontend
- **Framework**: Astro 5 (islands architecture, server-side rendering)
- **Components**: Vue 3 with Composition API (`<script setup>`)
- **State Management**: Pinia
- **Styling**: TailwindCSS v4 (using `@theme` for custom tokens)

### Backend
- **Database/Auth**: Supabase
- **Deployment**: Netlify

## Architecture

### Project Structure

```
/src
  /components        ← Vue components (.vue)
    /ui              ← GlassCard, GlassButton, GlassBadge
    /layout          ← Header, Sidebar, BottomNav
    /auth            ← LoginForm, RegisterForm
    /onboarding      ← OnboardingForm
    /cards           ← CardItem, CardLibrary, ReviewCard
    /badges          ← BadgeItem, BadgeGrid
    /profile         ← ProfileView
  /layouts           ← Astro layouts (.astro)
  /pages             ← Astro pages (.astro)
  /stores            ← Pinia stores
  /lib               ← Supabase client, helpers
  /types             ← TypeScript types
  /styles            ← Global CSS with Tailwind v4
```

### Key Components

1. **GlassCard.vue** - Base glassmorphism card component
2. **GlassButton.vue** - Primary action button
3. **GlassBadge.vue** - Chip/badge display
4. **AuthStore** - Pinia store for auth state
5. **UserStore** - Pinia store for user stats, preferences
6. **ReviewStore** - Pinia store for review session state

## Database Schema

### Tables

- **cards**: id, title, content, topic, subtopic, difficulty, points_value
- **user_progress**: id, user_id, card_id, correct, reviewed_at
- **user_stats**: user_id, total_points, current_streak, longest_streak, last_study_date
- **badges**: id, name, description, level, condition, icon
- **user_badges**: user_id, badge_id, unlocked_at
- **user_preferences**: user_id, selected_topics[], onboarding_completed

### RLS Policies

All tables have RLS enabled. Users can only access their own data.

## Design System

### Light Theme (Default)
- Primary: #7C3AED (Violet)
- Secondary: #EC4899 (Pink)
- Accent: #F59E0B (Amber)
- Background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 40%, #C4B5FD 100%)

### Dark Theme
- Primary: #06B6D4 (Cyan)
- Secondary: #34D399 (Mint)
- Accent: #FBBF24 (Amber)
- Background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0C1A2E 100%)

### Glassmorphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
}
```

### Breakpoints (Mobile-First)
- base: 0px
- sm: 480px
- md: 768px
- lg: 1024px
- xl: 1280px

## Security

- Supabase Auth for authentication
- RLS policies for data isolation
- Environment variables for API keys
- Input validation on all forms

## Error Handling

- Form validation before submit
- Clear error messages from Supabase
- Retry mechanism for failed requests
- Graceful degradation (show error, don't crash)
