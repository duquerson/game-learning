# Project Constitution

## Core Values

1. **Simplicity Over Cleverness**: Favor straightforward solutions that are easy to understand and maintain. First functional, then beautiful.

2. **User Experience First**: Every technical decision should improve or maintain user experience. Glassmorphism + mobile-first approach.

3. **Progressive Enhancement**: Build for mobile first, scale to desktop. Never use max-width as base.

## Technical Principles

### Architecture
- Astro 5 as main framework (islands architecture)
- Vue 3 + Composition API for interactive components
- Pinia for global state
- Supabase for backend/DB/auth
- TailwindCSS v4 (no config.js, use @theme)

### Code Quality
- TypeScript strict mode
- Component composition over inheritance
- Keep components loosely coupled

### Design System
- Glassmorphism effect: gradient background behind all cards
- Mobile-first breakpoints (base: 0px, sm: 480px, md: 768px, lg: 1024px, xl: 1280px)
- Theme tokens via CSS variables
- Light theme: Violet/Rose palette
- Dark theme: Cyan/Mint palette

## Decision Framework

When choosing between approaches:
1. Does it align with core values?
2. Is it maintainable?
3. Does it work on mobile first?
4. What's the long-term cost?

## Phases Order

1. Wireframes → 2. Supabase tables + seed → 3. Setup tech → 4. Auth → 5. Onboarding → 6. Cards → 7. Review → 8. Results → 9. Streak → 10. Dashboard → 11. Badges → 12. Profile → 13. Polish → 14. Deploy → 15. README
