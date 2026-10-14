# game-learning 📚

Plataforma de aprendizaje de JavaScript para principiantes. Un cuaderno de exploración técnica con 9 lecciones prácticas, navegación por niveles y evaluación formativa.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Astro 7 (islands architecture, output estático) |
| Componentes | Vue 3 + Composition API |
| Estilos | TailwindCSS v4 + CSS custom properties |
| Tests | Vitest (unit) + Playwright (E2E) |

## Features

- 📖 Navegación por 3 niveles (Básico, Intermedio, Avanzado)
- 📚 9 lecciones con explicación, ejemplos y quiz formativo
- ✅ Quiz de 5 preguntas × 4 opciones, feedback inmediato
- 🎯 Evaluación formativa: 4/5 correctas + lectura = dominado
- 🔄 Progreso efímero (session storage: sobrevive recargas, se borra al cerrar la pestaña)
- 🌓 Tema claro/oscuro con paleta topográfica
- 📱 Mobile-first responsive
- ♿ Accesible (skip link, keyboard nav, ARIA, prefers-reduced-motion)

## Requisitos

- Node.js 22.12+ (recomendado 24)
- pnpm 9

## Setup

```bash
git clone <repo>
cd game-learning
pnpm install
pnpm dev
```

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build estático (12 páginas) |
| `pnpm preview` | Preview del build |
| `pnpm test` | Tests unitarios (Vitest) |
| `pnpm test:e2e` | Tests E2E (Playwright) |
| `pnpm lint` | ESLint |
| `pnpm type-check` | TypeScript check |

## Estructura

```
src/
  features/
    learning-content/    # catálogo de lecciones + validadores
    learning-experience/ # componentes Vue de la UI
    quiz/                # dominio de evaluación (regla 4/5)
    progress/            # dominio de progreso + adaptador session storage
  pages/                 # rutas Astro (estáticas)
  components/ui/         # componentes base (ThemeToggle)
  composables/           # useLessonProgress, useTheme
  styles/                # global, accessibility, typography
  types/                 # contratos del dominio
tests/
  unit/                  # 35 tests unitarios (Vitest)
  e2e/                   # 11 tests E2E (Playwright/Chromium)
```

## Despliegue

El build es 100% estático (`dist/`). Opciones gratuitas preparadas:

**Cloudflare Pages (recomendado):**
1. Crea una cuenta en [cloudflare.com](https://cloudflare.com) (sin tarjeta)
2. Ve a **Workers & Pages → Create → Pages → Connect to Git**
3. Selecciona `duquerson/game-learning`
4. Build command: `pnpm build` · Output: `dist` · Node: `24` (`.nvmrc` lo fija)
5. Save and Deploy → `game-learning.pages.dev`

**Netlify (alternativa):** el repo incluye `netlify.toml` (build `pnpm build`, publish `dist`, Node 24). Conecta el repo en [netlify.com](https://netlify.com).

## Cómo funciona

Cada lección tiene:
- **Explicación**: conceptos claros con ejemplos en código
- **Quiz**: 5 preguntas de selección múltiple con feedback inmediato
- **Evaluación**: 4/5 correctas + lectura registrada = dominado
- **Práctica opcional**: ejercicios de razonamiento que no afectan dominio

El progreso se guarda en session storage (sobrevive recargas; se borra al cerrar la pestaña).

## Fuera de alcance

- ❌ Cuentas/registro
- ❌ Persistencia remota (DB)
- ❌ Puntos, rachas, insignias
- ❌ Ejecución de código
- ❌ Certificación

## Licencia

MIT
