# MEMORY

## Estado

**Preview estática implementada y publicada en GitHub Pages.** Limpieza del legado MicroLearn completada y commiteada; features `learning-content`, `quiz`, `progress` y `learning-experience` implementadas con TDD (44 tests unitarios). Build estático genera 12 páginas (portada + 9 lecciones + 404/500). Revisión UI vs Web Interface Guidelines ejecutada y correcciones aplicadas (2026-10-14). Pasada anti-slop/taste aplicada (2026-10-14). Auditoría de estado + reparación de CI + netlify.toml + E2E ampliados a 12 (2026-10-14). Deploy Pages automatizado con `withastro/action` (2026-10-15): demo viva en https://duquerson.github.io/game-learning/. Pendiente: activar Pages en Settings del repo y revisión humana del contenido.

## Objetivo

Plataforma de aprendizaje de JavaScript para principiantes: **preview pública estática** en GitHub Pages, anónima, con progreso local en el navegador. El alcance actual no ejecuta código ni certifica dominio.

## Decisiones importantes

- **ADR-001 — Feature-Oriented Architecture:** features son la unidad primaria (`learning-content`, `learning-experience`, `quiz`, `progress`).
- **ADR-002 — Dominio puro:** reglas educativas se prueban sin DOM, framework ni base de datos.
- **ADR-003 — Preview local anónima:** sin cuentas, sin Supabase, sin persistencia remota; progreso en localStorage (migra session previa, fallback a session). Incluye "Continuar donde quedaste", borrado con confirmación y celebración sutil accesible (behavioral intermedio, 2026-10-15).
- **Quiz formativo:** 5 preguntas × 4 opciones, feedback inmediato, reintentos ilimitados. Dominio: 4/5 correctas + lectura.
- **Sin gamificación:** no puntos, rachas, insignias, temporizador ni leaderboard. X/9 + “Continuar” es cue de retorno D1, no racha (2026-10-15).
- **Tema visual:** paleta topográfica (slate-map, deep-water, field-cyan, amber-marker, moss-progress, paper-light). Tipografías: Atkinson Hyperlegible (lectura), Space Grotesk (títulos), JetBrains Mono (código).
- **Contenido canónico:** 9 lecciones (3 niveles × 3 unidades) versionadas en Git en `src/features/learning-content/content/`; validadas en import (falla el build si el contenido es inválido).
- **Netlify adapter eliminado:** Astro 6 + @astrojs/netlify v4 incompatibles; output `static` puro no necesita adapter. Deploy como sitio estático.
- **Upgrade mayor 2026-10-14:** Astro 7.3.8 + @astrojs/vue 7.0.3 + Vitest 5.0.4 + vite 8.3.4 (devDep explícito: peer obligatorio de Vitest 5) + Tailwind 4.3.3 + Playwright 1.64.1 + ESLint 10.12.0. Contenido didáctico verificado idéntico post-upgrade (diff de texto visible en las 10 páginas: solo cambiaron hashes de assets). Breaking changes aplicados: `.vitest/` en .gitignore (reporters Vitest 5); sin cambios en config Astro (`security.csp` sigue soportado, sin flags experimentales, sin .md → Satteri irrelevante).
- **Bug hidratación corregido (2026-10-14):** `useLessonProgress` leía sessionStorage/estado compartido durante el primer render del cliente → mismatch CourseMap vs HTML SSR cuando LessonView mutaba el estado primero. Corregido con gate `ready` por instancia activado en `onMounted`; verificado con script de consola (0 warnings) y E2E.
- **CI reparado (2026-10-14):** el workflow apuntaba a `main` (rama inexistente; el default era `master`), usaba Node 20 (Astro 7 exige ≥22.12), ejecutaba un job `security-tests` con script inexistente (`pnpm test:security`) y arrastraba env `PUBLIC_SUPABASE_*` del legado. Ahora: triggers en `main`, Node 24, pnpm desde `packageManager`, E2E contra build real (`build && preview`), reporter html para artifact, sin job muerto ni env muertas.
- **Overflow móvil corregido (2026-10-14):** `pre.code-block` (`white-space: pre`) inflaba el min-content del track de grid de la página de lección → 8px de scroll horizontal a 375px. Fix: `grid-template-columns: minmax(0, 1fr)` (móvil) y `18rem minmax(0, 1fr)` (desktop). Diagnosticado con probe de Playwright midiendo min-content por descendiente.
- **netlify.toml añadido (2026-10-14):** build `pnpm build`, publish `dist`, NODE_VERSION 24. Deploy NO ejecutado (en espera de conectar el repo en la UI de Netlify). La fuente vive en `github.com/duquerson/game-learning`.
- **Cloudflare Pages preparado (2026-10-14):** `.nvmrc` (Node 24) + `wrangler.toml` (name + pages_build_output_dir=dist) añadidos. Deploy NO ejecutado (en espera). Netlify queda como alternativa (netlify.toml ya existía).
- **Layout shift del resultado del quiz corregido (2026-10-14):** `.actions` movido fuera de los templates condicionales (hermano estable de `.stage`); el resultado del quiz ahora vive dentro de `.stage` (min-height: 24rem) — los botones no saltan al mostrar el resultado. Lección de proceso: un `</section>` perdido en el template produjo un crash de libuv en Windows que enmascaraba el error real del compilador de Vue ("Element is missing end tag") — aislar con `@vue/compiler-sfc` dio el diagnóstico en segundos.

## Infraestructura y gates

- **Gate actual:** `pnpm type-check` + `pnpm lint` + `pnpm exec vitest run` + `pnpm build` + `pnpm exec playwright test` deben pasar.
- **Tests:** 44 unitarios (Vitest) + 12 E2E (Playwright/Chromium, `tests/e2e/preview.spec.ts`): smoke + quiz completo/reintento + tema oscuro + 404 + móvil 375px + navegación. E2E base-aware (`PAGES_BASE=/game-learning`) y CI contra build real servido bajo subruta (`scripts/serve-pages.mjs`).
- **Build:** 12 páginas estáticas (index + 9 lecciones + 404 + 500).

## Riesgos y decisiones pendientes

- **Rama:** `main` como default local y remoto (`origin/main`, `origin/HEAD → main`); `origin/master` avanzada a `main` por fast-forward. Rama `refactor-project` fusionada y eliminada.
- **Deploy GitHub Pages (2026-10-15):** `site: https://duquerson.github.io` + `base: game-learning` en `astro.config.mjs`; helper `src/lib/withBase.ts` para los 10 enlaces internos absolutos; workflow `.github/workflows/deploy.yml` (build + deploy, Node 24); `public/.nojekyll`. Pages activado (`build_type: workflow`) y demo verificada viva en https://duquerson.github.io/game-learning/ (portada + lección).
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
