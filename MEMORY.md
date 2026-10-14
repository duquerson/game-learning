# MEMORY

## Estado

**Preview estática implementada.** Limpieza del legado MicroLearn completada y commiteada; features `learning-content`, `quiz`, `progress` y `learning-experience` implementadas con TDD (35 tests unitarios). Build estático genera 12 páginas (portada + 9 lecciones + 404/500). Revisión UI vs Web Interface Guidelines ejecutada y correcciones aplicadas (2026-10-14). Pasada anti-slop/taste aplicada (2026-10-14): cero em-dashes visibles, sin barra de track relleno en el mapa, copy de progreso efímero unificado y corregido (sessionStorage sobrevive recargas; se borra al cerrar la pestaña), label de nivel con tilde (Básico/Intermedio/Avanzado), zona de pregunta del quiz con min-height estable, feedback táctil :active. Pendiente: deploy a Netlify y revisión humana del contenido.

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

## Infraestructura y gates

- **Gate actual:** `pnpm type-check` + `pnpm lint` + `pnpm exec vitest run` + `pnpm build` + `pnpm exec playwright test` deben pasar.
- **Tests:** 35 unitarios (Vitest) + 5 E2E (Playwright/Chromium, `tests/e2e/preview.spec.ts`).
- **Build:** 12 páginas estáticas (index + 9 lecciones + 404 + 500).

## Riesgos y decisiones pendientes

- **Deploy Netlify no ejecutado:** falta conectar repo y verificar URL live.
- **Revisión UI vs Web Interface Guidelines: ejecutada 2026-10-14.** Hallazgos corregidos: jerarquía de encabezados (contenido antes que sidebar en DOM), `color-scheme` + `theme-color`, `translate="no"` en marca, hover faltantes (`.brand`, `.btn.secondary`, error secondary), transición `width`→`transform` en barra de progreso, `min-w-0`/`break-words` en flex, comillas curvas en prosa, `preconnect` de fuentes, `touch-action`/tap-highlight/safe-area. Quedan observaciones menores no bloqueantes (p. ej. `scroll-margin-top` en anclas de encabezado cuando existan).
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
