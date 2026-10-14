# MEMORY

## Estado

**Preview estática implementada.** Limpieza del legado MicroLearn completada y commiteada; features `learning-content`, `quiz`, `progress` y `learning-experience` implementadas con TDD (35 tests unitarios). Build estático genera 12 páginas (portada + 9 lecciones + 404/500). Pendiente: deploy a Netlify y revisión UI final.

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

## Infraestructura y gates

- **Gate actual:** `pnpm type-check` + `pnpm lint` + `pnpm exec vitest run` + `pnpm build` deben pasar.
- **Tests:** 35 unitarios (Vitest). E2E Playwright configurado pero sin specs (pendiente Fase 6).
- **Build:** 12 páginas estáticas (index + 9 lecciones + 404 + 500).

## Riesgos y decisiones pendientes

- **Deploy Netlify no ejecutado:** falta conectar repo y verificar URL live.
- **Revisión UI vs Web Interface Guidelines no ejecutada.**
- **E2E specs vacíos:** `tests/e2e/` existe pero sin pruebas.
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
