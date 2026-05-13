# MicroLearn 🧠

Plataforma de microaprendizaje gamificada para desarrolladores. Aprende JavaScript y TypeScript mediante flashcards en modo quiz, gana puntos, mantiene rachas diarias y desbloquea insignias.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Astro 5 (islands architecture, SSR) |
| Componentes | Vue 3 + Composition API |
| Estado | Pinia |
| Estilos | TailwindCSS v4 + Glassmorphism |
| Backend/DB/Auth | Supabase |
| Deploy | Vercel |

## Features

- 🔐 Auth: registro, login, OAuth (Google/GitHub), recuperación de contraseña
- 🎯 Onboarding: selección de temas y dificultad al primer ingreso
- 📚 Biblioteca: tarjetas agrupadas por tema/subtema con filtros y búsqueda
- 🧪 Modo quiz: 10 tarjetas, 4 opciones, timer de 30s, feedback inmediato
- ⭐ Puntos: easy=5, medium=10, hard=15, bonos por racha (3→+5, 5→+15)
- 🔥 Rachas diarias: estudio consistente con pérdida por inactividad
- 🏆 Insignias: 9 logros clasificados por nivel y categoría
- 📊 Dashboard: progreso, stats, insignias, acceso rápido
- 🌓 Tema claro/oscuro con persistencia cross-session
- 📱 Mobile-first responsive

## Requisitos

- Node.js 20+
- pnpm 9
- Supabase account (o local)

## Setup

```bash
git clone <repo>
cd microlearn-astro-vue
pnpm install
```

Crear `.env`:

```
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

```bash
pnpm dev
```

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build producción |
| `pnpm preview` | Preview build |
| `pnpm test` | Tests unitarios (Vitest) |
| `pnpm test:security` | Tests de seguridad |
| `pnpm test:e2e` | Tests E2E (Playwright) |
| `pnpm lint` | ESLint |
| `pnpm type-check` | TypeScript check |

## Testing

- **Property-based**: puntos, rachas, insignias, quiz (fast-check, 200 runs)
- **Seguridad**: OWASP A01-A08 (SQLi, type coercion, UUID forgery, session tampering, race conditions)
- **E2E**: auth flow, review session, badges, critical path, visual/a11y
- **Visual**: theme flash prevention, ARIA, keyboard nav, contrast, responsive

## Especificaciones

Las user stories, behavioral design analysis, DDD analysis y spec-kit workflow están documentados en:

- `src/docs/` — User stories con behavioral + DDD
- `.specify/specs/001-microlearn-platform/` — Spec original
- `.specify/specs/002-microlearn-enhanced/` — Spec consolidado con spec-kit (constitution, spec, plan, tasks, analysis)
