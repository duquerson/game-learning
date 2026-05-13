# Tareas: BDG-008 — Sistema de Insignias

**Estimación total**: ~16-22 horas

---

## Fase 1: Fundación (ya existe)

- [x] 1.1 `supabase/migrations/001_initial_schema.sql` — Tablas `badges` y `user_badges` con RLS policies
  - **Archivos**: `supabase/migrations/001_initial_schema.sql`
  - **Depende de**: —

- [x] 1.2 `supabase/seed.sql` — Seed de 9 insignias con condiciones JSONB
  - **Archivos**: `supabase/seed.sql`
  - **Depende de**: 1.1

- [x] 1.3 `src/types/database.ts` — Tipos `badges` y `user_badges` Row/Insert/Update
  - **Archivos**: `src/types/database.ts`
  - **Depende de**: 1.1

- [x] 1.4 `src/types/app.ts` — Tipos `Badge`, `UserBadge`, `BadgeConditionContext`, `BadgeLevel`, `BadgeCategory`
  - **Archivos**: `src/types/app.ts`
  - **Depende de**: 1.3

- [x] 1.5 `src/lib/badges.ts` — Función `evaluateBadgeConditions` con 8 tipos de condición
  - **Archivos**: `src/lib/badges.ts`
  - **Depende de**: 1.4

- [x] 1.6 `src/components/badges/BadgeItem.vue` — Componente de insignia individual
  - **Archivos**: `src/components/badges/BadgeItem.vue`
  - **Depende de**: 1.4

- [x] 1.7 `src/components/badges/BadgeGrid.vue` — Grid de insignias con agrupación por nivel
  - **Archivos**: `src/components/badges/BadgeGrid.vue`
  - **Depende de**: 1.6

- [x] 1.8 `src/pages/badges.astro` — Página de insignias
  - **Archivos**: `src/pages/badges.astro`
  - **Depende de**: 1.7

- [x] 1.9 `src/actions/index.ts` — Evaluación de insignias en `review.completeSession`
  - **Archivos**: `src/actions/index.ts`
  - **Depende de**: 1.5, 1.1

- [x] 1.10 `src/stores/review.ts` — Toast de insignias nuevas en `completeSession`
  - **Archivos**: `src/stores/review.ts`
  - **Depende de**: 1.9

- [x] 1.11 `tests/unit/badges.test.ts` — Tests unitarios de condiciones
  - **Archivos**: `tests/unit/badges.test.ts`
  - **Depende de**: 1.5

- [x] 1.12 `tests/e2e/badges.spec.ts` — Tests E2E de insignias
  - **Archivos**: `tests/e2e/badges.spec.ts`
  - **Depende de**: 1.8, 1.9

## Fase 2: Migración de esquema

- [ ] 2.1 `[P]` Añadir columna `category` a tabla `badges`
  - **Descripción**: Migración SQL para añadir `category TEXT CHECK IN ('achievement', 'streak', 'mastery')`. Actualizar seed data con categorías para cada insignia.
  - **Criterio**: Las 9 insignias tienen categoría asignada. CHECK constraint activo.
  - **Depende de**: 1.1
  - **Archivos**: `supabase/migrations/002_badges_category.sql`

- [ ] 2.2 `[P]` Actualizar tipos `Badge` para incluir `category`
  - **Descripción**: En `app.ts`, el tipo `Badge` ya tiene `category?`. Verificar que el mapeo en `actions/index.ts` incluya `category` al mapear desde la BD.
  - **Criterio**: `b.category` se mapea desde `badges.category` en Supabase.
  - **Depende de**: 2.1
  - **Archivos**: `src/actions/index.ts`, `src/types/app.ts`

## Fase 3: Frontend — Página de insignias

- [ ] 3.1 Revisar y estabilizar `BadgeItem.vue`
  - **Descripción**: Verificar que muestra ícono, nombre, descripción, nivel (chip coloreado), categoría (chip azul), fecha de desbloqueo. Estado locked con opacidad y candado. Añadir prop `justUnlocked` para animación glow.
  - **Criterio**: Todos los datos visibles. Chip de nivel con color correcto (verde/básico, ámbar/intermedio, púrpura/avanzado). Chip de categoría visible.
  - **Depende de**: 2.2
  - **Archivos**: `src/components/badges/BadgeItem.vue`

- [ ] 3.2 Revisar y estabilizar `BadgeGrid.vue`
  - **Descripción**: Verificar agrupación por nivel (Básico/Intermedio/Avanzado), contador "X / 9", grid responsive (1/2/3 columnas). EmptyState cuando 0 insignias.
  - **Criterio**: Grupos visibles solo si hay insignias en ese nivel. Contador preciso. EmptyState con CTA a /review.
  - **Depende de**: 3.1
  - **Archivos**: `src/components/badges/BadgeGrid.vue`

- [ ] 3.3 Revisar y estabilizar `src/pages/badges.astro`
  - **Descripción**: Verificar que carga datos desde Supabase (badges + user_badges), los pasa a BadgeGrid.vue, y tiene SSR básico. Añadir middleware check para redirigir si no autenticado.
  - **Criterio**: Página carga en < 500ms. Datos correctos. Redirige a login si no autenticado.
  - **Depende de**: 3.2
  - **Archivos**: `src/pages/badges.astro`

## Fase 4: Animación de celebración

- [ ] 4.1 Componente `BadgeCelebration.vue`
  - **Descripción**: Nuevo componente que dispara confetti con `canvas-confetti` cuando se monta con `show=true`. Dos tandas: 120 partículas al centro, luego 60 a cada lado (delay 250ms). Respeta `prefers-reduced-motion`.
  - **Criterio**: Confetti se dispara al montar. No se dispara si reduced-motion. Props: `show: boolean`, `badgeCount: number` (para intensidad).
  - **Depende de**: —
  - **Archivos**: `src/components/badges/BadgeCelebration.vue`

- [ ] 4.2 Animar confetti en ReviewResults.vue cuando hay newBadges
  - **Descripción**: Integrar `BadgeCelebration.vue` en `ReviewResults.vue`. Mostrar confetti adicional al de score >= 80% cuando hay insignias nuevas (independientemente del score).
  - **Criterio**: Confetti se dispara si hay newBadges, incluso si score < 80%.
  - **Depende de**: 4.1
  - **Archivos**: `src/components/cards/ReviewResults.vue`

- [ ] 4.3 Animación glow en BadgeItem recién desbloqueada
  - **Descripción**: Añadir prop `justUnlocked: boolean` a BadgeItem.vue. Cuando true, animación CSS `@keyframes glow` en el borde por 2 segundos. Se autodesactiva después.
  - **Criterio**: Borde brilla/glow al cargar. Desaparece después de 2s. No interfiere con accesibilidad.
  - **Depende de**: 3.1
  - **Archivos**: `src/components/badges/BadgeItem.vue`

- [ ] 4.4 Marcar badges como justUnlocked en la respuesta
  - **Descripción**: En `review.completeSession`, incluir los IDs de las insignias recién desbloqueadas. En el store, almacenar `lastUnlockedBadgeIds`. Al cargar `/badges`, pasar esas IDs a BadgeGrid para animación.
  - **Criterio**: Las insignias recién desbloqueadas brillan al visitar /badges post-sesión. El brillo no se repite en visitas posteriores.
  - **Depende de**: 4.3, 3.3
  - **Archivos**: `src/stores/review.ts`, `src/pages/badges.astro`, `src/components/badges/BadgeGrid.vue`

## Fase 5: Pruebas

- [ ] 5.1 Tests unitarios — condiciones de insignias (ya existen)
  - **Descripción**: Verificar que `tests/unit/badges.test.ts` cubre las 8 condiciones, idempotencia, edge cases (topicProgress vacío, sesión vacía, condición inválida).
  - **Criterio**: Tests existentes pasan. 100% branches.
  - **Depende de**: 1.11

- [ ] 5.2 Tests E2E — flujo de desbloqueo (ya existen)
  - **Descripción**: Verificar que `tests/e2e/badges.spec.ts` cubre: unlocked count, locked state, date display, level grouping, "Primer paso" flow, toast notification.
  - **Criterio**: Tests existentes pasan en CI.
  - **Depende de**: 1.12

- [ ] 5.3 Test E2E — animación confetti al desbloquear
  - **Descripción**: Playwright. Completar sesión que desbloquea insignia. Verificar que `canvas-confetti` se ejecuta (spy en `confetti`).
  - **Criterio**: confetti llamado con particleCount >= 80. No llamado si prefers-reduced-motion.
  - **Depende de**: 4.2

- [ ] 5.4 Test de regresión — idempotencia BD
  - **Descripción**: Verificar que unique constraint (user_id, badge_id) evita duplicados. Insertar mismo par dos veces → segundo falla.
  - **Criterio**: Constraint funciona. No hay filas duplicadas en user_badges.
  - **Depende de**: 1.1

- [ ] 5.5 Test de regresión — RLS en user_badges
  - **Descripción**: Verificar que usuario A no puede SELECT/INSERT en user_badges de usuario B.
  - **Criterio**: RLS policies activas. Consulta cross-user retorna 0 filas.
  - **Depende de**: 1.1

## Fase 6: Documentación y Deploy

- [ ] 6.1 Documentar sistema de insignias en `src/docs/gamification.md`
  - **Descripción**: Explicar las 9 insignias, condiciones, flujo de evaluación, animaciones. Incluir tabla de insignias y diagrama de decisión.
  - **Depende de**: 3.3, 4.2

- [ ] 6.2 Actualizar tipos en `src/types/app.ts` si es necesario
  - **Descripción**: Verificar que `CompleteSessionResult` incluye `newBadges`. Verificar que `Badge` type incluye `category`.
  - **Depende de**: 2.2, 3.3

- [ ] 6.3 PR Review y merge a main
  - **Depende de**: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1

- [ ] 6.4 Deploy a producción (Vercel + Supabase)
  - **Depende de**: 6.3

---

**Notas:**
- `[P]` = paralelizable
- Tareas marcadas con `[x]` ya existen en el código base
- Tareas sin `[x]` son nuevo desarrollo o revisión
- Estimación por tarea: 1-3 horas
- La mayoría de la funcionalidad ya existe; Fase 2-4 son refinamientos y mejoras
- Tests E2E existentes deben verificarse antes del merge
