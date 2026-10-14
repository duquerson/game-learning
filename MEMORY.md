# MEMORY

## Estado

**Preview estática implementada.** Limpieza del legado MicroLearn completada y commiteada; features `learning-content`, `quiz`, `progress` y `learning-experience` implementadas con TDD (35 tests unitarios). Build estático genera 12 páginas (portada + 9 lecciones + 404/500). Revisión UI vs Web Interface Guidelines ejecutada y correcciones aplicadas (2026-10-14). Pasada anti-slop/taste aplicada (2026-10-14). Auditoría de estado + reparación de CI + netlify.toml + E2E ampliados a 11 (2026-10-14). Pendiente: rename de rama y deploy a Netlify (en espera, no ejecutado) y revisión humana del contenido.

## Objetivo

Plataforma de aprendizaje de JavaScript para principiantes: **preview pública estática** en Netlify, anónima y sin persistencia. El alcance actual no ejecuta código ni certifica dominio.

## Decisiones importantes

- **ADR-001 — Feature-Oriented Architecture:** features son la unidad primaria (`learning-content`, `learning-experience`, `quiz`, `progress`).
- **ADR-002 — Dominio puro:** reglas educativas se prueban sin DOM, framework ni base de datos.
- **ADR-003 — Preview estática:** sin cuentas, sin Supabase, sin persistencia remota; progreso en session storage.
- **Quiz formativo:** 5 preguntas × 4 opciones, feedback inmediato, reintentos ilimitados. Dominio: 4/5 correctas + lectura.
- **Sin gamificación:** no puntos, rachas, insignias, temporizador ni leaderboard (contradecían constitution).
- **Tema visual:** paleta topográfica (slate-map, deep-water, field-cyan, amber-marker, moss-progress, paper-light). Tipografías: Atkinson Hyperlegible (lectura), Space Grotesk (títulos), JetBrains Mono (código).
- **Contenido canónico:** 9 lecciones (3 niveles × 3 unidades) versionadas en Git en `src/features/learning-content/content/`; validadas en import (falla el build si el contenido es inválido).
- **Netlify adapter eliminado:** Astro 6 + @astrojs/netlify v4 incompatibles; output `static` puro no necesita adapter. Deploy como sitio estático.
- **Upgrade mayor 2026-10-14:** Astro 7.3.8 + @astrojs/vue 7.0.3 + Vitest 5.0.4 + vite 8.3.4 (devDep explícito: peer obligatorio de Vitest 5) + Tailwind 4.3.3 + Playwright 1.64.1 + ESLint 10.12.0. Contenido didáctico verificado idéntico post-upgrade (diff de texto visible en las 10 páginas: solo cambiaron hashes de assets). Breaking changes aplicados: `.vitest/` en .gitignore (reporters Vitest 5); sin cambios en config Astro (`security.csp` sigue soportado, sin flags experimentales, sin .md → Satteri irrelevante).
- **Bug hidratación corregido (2026-10-14):** `useLessonProgress` leía sessionStorage/estado compartido durante el primer render del cliente → mismatch CourseMap vs HTML SSR cuando LessonView mutaba el estado primero. Corregido con gate `ready` por instancia activado en `onMounted`; verificado con script de consola (0 warnings) y E2E.
- **CI reparado (2026-10-14):** el workflow apuntaba a `main` (rama inexistente; el default era `master`), usaba Node 20 (Astro 7 exige ≥22.12), ejecutaba un job `security-tests` con script inexistente (`pnpm test:security`) y arrastraba env `PUBLIC_SUPABASE_*` del legado. Ahora: triggers en `main`, Node 24, pnpm desde `packageManager`, E2E contra build real (`build && preview`), reporter html para artifact, sin job muerto ni env muertas.
- **Overflow móvil corregido (2026-10-14):** `pre.code-block` (`white-space: pre`) inflaba el min-content del track de grid de la página de lección → 8px de scroll horizontal a 375px. Fix: `grid-template-columns: minmax(0, 1fr)` (móvil) y `18rem minmax(0, 1fr)` (desktop). Diagnosticado con probe de Playwright midiendo min-content por descendiente.
- **netlify.toml añadido (2026-10-14):** build `pnpm build`, publish `dist`, NODE_VERSION 24. Deploy NO ejecutado (en espera de conectar el repo en la UI de Netlify). La fuente vive en `github.com/duquerson/game-learning`.

## Infraestructura y gates

- **Gate actual:** `pnpm type-check` + `pnpm lint` + `pnpm exec vitest run` + `pnpm build` + `pnpm exec playwright test` deben pasar.
- **Tests:** 35 unitarios (Vitest) + 11 E2E (Playwright/Chromium, `tests/e2e/preview.spec.ts`): smoke + quiz completo/reintento + tema oscuro + 404 + móvil 375px + navegación. Validados también en modo CI (`build && preview`).
- **Build:** 12 páginas estáticas (index + 9 lecciones + 404 + 500).

## Riesgos y decisiones pendientes

- **Rama:** renombrado local `master`→`main` hecho; **`origin/master` intacto** (sin push, decisión del usuario). El default branch en GitHub sigue siendo `master` hasta que el usuario lo renombre en la UI y haga push de `main`.
- **Deploy Netlify no ejecutado:** `netlify.toml` listo; falta conectar repo y verificar URL live.
- **Contenido didáctico:** redactado por IA, requiere revisión humana de calidad pedagógica.
- Baseline anterior `2afcfc8ae1b99b021c6b6daafd647d791179ff7d`; HEAD actual es la implementación completa.

## Lecciones y capacidades

- No confiar en puntuación enviada por navegador.
- No tratar un proxy como frontera de autorización.
- No ejecutar código no confiable en contenedor común.
- Preview pública sin cuentas ni persistencia.
- Beta requiere revisión jurídica, privacidad y salvaguardas.
- Astro 6 elimina la necesidad de adapter para output estático.
- El validador de contenido en import protege el build contra datos corruptos.
