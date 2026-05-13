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

## Behavioral Product Design Principles

### Loss Aversion Drives Retention
Design experiences that create something users feel they'd lose by leaving. Streaks, points, and badges accumulate over time — losing them hurts more than the effort to maintain them.

### Reduce Friction for Desired Behaviors
Every tap, field, and decision point is friction. Ruthlessly remove friction from paths you want users to take (OAuth, defaults, auto-advance). Add appropriate friction only to prevent mistakes.

### Leverage Defaults
Users stick with default options. Set smart defaults that guide users toward successful outcomes (difficulty=medium, theme=system preference).

### Create Pause Moments
Use haptics, animations, and micro-interactions to create celebration moments that reinforce positive behavior (confetti at 80%+, badge unlock animation).

### Variable Rewards
Intermittent, unpredictable rewards (streak bonuses, badge unlocks) maintain engagement better than predictable ones.

### Apply Psychology to Real Problems
Use insights on present bias, status quo effect, and uncertainty aversion to design features that drive specific actions. Meet users where they are rather than demanding perfection.

## Domain-Driven Design (DDD) Principles

### Bounded Contexts
The application is organized into distinct bounded contexts, each with its own ubiquitous language and explicit boundaries:

| Bounded Context | Responsabilidad |
|----------------|-----------------|
| `Authentication` | Identidad, registro, login, OAuth, recuperación |
| `Onboarding` | Configuración inicial de preferencias del usuario |
| `CardCatalog` | Catálogo de tarjetas de estudio, clasificación y consulta |
| `ReviewSession` | Creación y ejecución de sesiones de quiz |
| `Gamification` | Puntos, rachas y bonificaciones |
| `SessionResults` | Resultados consolidados post-sesión |
| `Dashboard` | Vista principal con métricas consolidadas (read model) |
| `Badges` | Catálogo y lógica de desbloqueo de insignias |
| `UserProfile` | Información personal y preferencias del usuario |
| `Theme` | Preferencia visual (claro/oscuro) y persistencia |

### Aggregate Roots
Each bounded context has one aggregate root that ensures consistency boundaries. Aggregates reference each other by ID only, never by direct object reference.

### Ubiquitous Language
Each bounded context maintains consistent terminology across code, docs, and conversations. No translation layers between domain experts and developers.

### Domain Events
Significant state changes are captured as domain events (past tense naming). Events enable eventual consistency between bounded contexts and feed read models (CQRS).

### Ports and Adapters (Hexagonal)
Domain core has zero external dependencies. Business logic lives in domain services and entities. Infrastructure adapters implement ports defined in the domain layer.

## Security Principles

### Server-Side Validation
All critical logic (points calculation, streak tracking, session results) is validated on the server. Client data is never trusted for scoring or authorization.

### Anti-Tampering
Difficulty and points are re-calculated server-side from the database. Client cannot forge card difficulty, streak count, or session results.

### Row Level Security (RLS)
All Supabase tables have RLS enabled. Each user can only access their own data. Policies are verified before connecting UI.

### Input Validation
Zod validation on all server action inputs prevents type coercion attacks. UUID validation on all entity IDs.

### Secure Session Management
Cookies are httpOnly + secure via @supabase/ssr. No session tokens exposed to client JavaScript.

## Testing Philosophy

### Property-Based Testing
Core domain logic (points, streaks, badges) is tested with fast-check property-based tests (100-200 runs each) to cover edge cases that example-based tests miss.

### Security Testing
Dedicated security test suite covering OWASP categories (SQL injection, type coercion, UUID forgery, session tampering, race conditions, CSRF, cookie security).

### E2E Testing
Playwright E2E tests cover critical user paths (auth flow, review session, badge unlock, visual regression, accessibility).

### Test Isolation
Security tests run with `isolate: true` and `maxWorkers: 1` to prevent cross-test contamination. Unit tests are deterministic and idempotent.

## Skills Registry

| Skill | Fuente | Propósito |
|-------|--------|-----------|
| `user-story` | proyecto | Formato Mike Cohn + Gherkin |
| `behavioral-product-design` | refoundai/lenny-skills | Principios de behavioral science en UX |
| `clean-ddd-hexagonal` | proyecto | DDD táctico + Clean Architecture + Hexagonal |
| `spec-kit-skill` | proyecto | Constitution-based spec-driven development |

## Decision Framework

When choosing between approaches:
1. Does it align with core values?
2. Does it apply behavioral design principles correctly?
3. Does it respect bounded context boundaries?
4. Is it maintainable and testable?
5. Does it work on mobile first?
6. What's the long-term cost?

## Phases Order

1. Wireframes → 2. Supabase tables + seed → 3. Setup tech → 4. Auth → 5. Onboarding → 6. Cards → 7. Review → 8. Results → 9. Streak → 10. Dashboard → 11. Badges → 12. Profile → 13. Polish → 14. Deploy → 15. README
