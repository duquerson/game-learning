# Tareas: PTS-005 — Sistema de Puntos y Racha Diaria

**Estimación total**: ~24-32 horas

---

## Fase 1: Fundación (ya existe)

- [x] 1.1 `src/lib/points.ts` — Funciones puras de cálculo de puntos y bonos
  - **Archivos**: `src/lib/points.ts`
  - **Depende de**: —

- [x] 1.2 `src/lib/streak.ts` — Funciones puras de racha diaria
  - **Archivos**: `src/lib/streak.ts`
  - **Depende de**: —

- [x] 1.3 `supabase/schema.sql` — Tabla `user_stats` y RLS policies
  - **Archivos**: `supabase/schema.sql`
  - **Depende de**: —

- [x] 1.4 `src/types/database.ts` — Tipos `user_stats` Row/Insert/Update
  - **Archivos**: `src/types/database.ts`
  - **Depende de**: 1.3

- [x] 1.5 `src/types/app.ts` — Tipos `UserStats`, `SubmitAnswerResult`, `SessionResult`
  - **Archivos**: `src/types/app.ts`
  - **Depende de**: 1.4

## Fase 2: Acciones de servidor

- [ ] 2.1 Revisar y estabilizar `review.submitAnswer`
  - **Descripción**: Verificar que `calculatePoints` y `calculateStreakBonus` se llaman correctamente. Validar que `total_points` se actualiza con `UPSERT` atómico. Manejar error si `user_stats` no existe (crear default).
  - **Criterio**: Respuesta correcta → puntos sumados en DB. Incorrecta → 0 puntos, racha de sesión reseteada.
  - **Depende de**: 1.1, 1.3
  - **Archivos**: `src/actions/index.ts`

- [ ] 2.2 Revisar y estabilizar `review.completeSession`
  - **Descripción**: Verificar que `updateStreak` se ejecuta correctamente. Validar casos: mismo día, día consecutivo, gap >= 2 días, usuario nuevo. Asegurar `longest_streak` monotónico.
  - **Criterio**: RaCha diaria se actualiza según reglas de negocio. `longest_streak` nunca decrece.
  - **Depende de**: 1.2, 1.3
  - **Archivos**: `src/actions/index.ts`

- [ ] 2.3 `[P]` Crear endpoint GET /api/user/stats
  - **Descripción**: Endpoint para que el header y dashboard consulten `user_stats` del usuario autenticado. Cacheable (TTL 30s).
  - **Criterio**: Responde `UserStats` JSON. 404 si no existe (el cliente crea default).
  - **Depende de**: 1.3
  - **Archivos**: `src/pages/api/user/stats.ts`

- [ ] 2.4 Migración de atomicidad para `total_points`
  - **Descripción**: Cambiar `SELECT + UPSERT` por `UPDATE user_stats SET total_points = total_points + $1` para evitar race conditions en respuestas rápidas.
  - **Criterio**: Dos respuestas simultáneas no pierden puntos. Usar `UPDATE` en vez de `UPSERT`.
  - **Depende de**: 2.1
  - **Archivos**: `src/actions/index.ts`

## Fase 3: Frontend — Header global

- [ ] 3.1 Componente `PointsStreakBadge.vue`
  - **Descripción**: Badge reutilizable que muestra 🏆 puntos y 🔥 racha. Props: `totalPoints`, `currentStreak`. Slot para personalización.
  - **Criterio**: Renderiza puntos y racha con iconos. Responsive. Skeleton loading mientras carga.
  - **Depende de**: 2.3
  - **Archivos**: `src/components/gamification/PointsStreakBadge.vue`

- [ ] 3.2 Integrar `PointsStreakBadge` en `HeaderBar.vue`
  - **Descripción**: Agregar el badge al header global. Fetch inicial de `/api/user/stats`. Escuchar eventos del store para actualización reactiva post-sesión.
  - **Criterio**: Badge visible en todas las páginas. Se actualiza al completar una sesión sin recargar.
  - **Depende de**: 3.1
  - **Archivos**: `src/layouts/HeaderBar.vue`

- [ ] 3.3 Store Pinia — estado compartido de gamificación
  - **Descripción**: Crear `useGamificationStore` en `src/stores/gamification.ts` con `totalPoints`, `currentStreak`, `longestStreak` como estado reactivo. NO mezclar con reviewStore para evitar duplicación de estado. Sincronizar desde respuesta de `completeSession` y fetch inicial.
  - **Criterio**: Store dedicado expone puntos y racha. Componentes suscritos se actualizan automáticamente. Sin duplicación con reviewStore.
  - **Depende de**: 2.2, 2.3
  - **Archivos**: `src/stores/gamification.ts`

## Fase 4: Frontend — Dashboard

- [ ] 4.1 Sección "Estadísticas" en Dashboard
  - **Descripción**: Tarjeta/tabla con: Total de puntos, Racha actual, Racha máxima, Última fecha de estudio. Usar datos del store + fetch inicial.
  - **Criterio**: Dashboard muestra las 4 métricas. Diseño acorde a TailwindCSS v4 del proyecto.
  - **Depende de**: 3.3
  - **Archivos**: `src/pages/dashboard/index.vue`

- [ ] 4.2 Toast de notificación por bonus
  - **Descripción**: Cuando se recibe un bono de racha en sesión (3 o 5), mostrar toast con mensaje "🔥 ¡Racha de N! +X puntos bonus".
  - **Criterio**: Toast aparece solo en hitos de racha. Contenido dinámico según hito alcanzado.
  - **Depende de**: 3.3
  - **Archivos**: `src/components/gamification/StreakToast.vue`

## Fase 5: Pruebas

- [ ] 5.1 Tests unitarios `points.ts`
  - **Descripción**: Vitest. Cubrir: easy/medium/hard correctas, incorrecta, streak 0/1/2/3/4/5/6/9, applyPoints acumulativo, edge cases (streak negativo no ocurre).
  - **Criterio**: 100% branches. Mínimo 8 casos de prueba.
  - **Depende de**: 1.1

- [ ] 5.2 Tests unitarios `streak.ts`
  - **Descripción**: Vitest. Cubrir: mismo día, día siguiente, gap 2 días, gap 30 días, last_study_date null, longest_streak monotónico.
  - **Criterio**: 100% branches. Mínimo 7 casos de prueba.
  - **Depende de**: 1.2

- [ ] 5.3 Tests de integración — submitAnswer
  - **Descripción**: Vitest + Supabase local/test. Ejecutar submitAnswer con distintos inputs y verificar `user_stats` en DB.
  - **Criterio**: Puntos correctos en DB tras cada escenario. Race condition test con 2 llamadas paralelas.
  - **Depende de**: 2.4, 5.1

- [ ] 5.4 Tests de integración — completeSession + streak
  - **Descripción**: Vitest + Supabase test. Completar sesiones en distintos días simulados y verificar racha.
  - **Criterio**: `current_streak`, `longest_streak`, `last_study_date` correctos tras cada escenario.
  - **Depende de**: 2.2, 5.2

- [ ] 5.5 Tests E2E — flujo completo de puntos
  - **Descripción**: Playwright. Login → Quiz → responder correctamente 5 → verificar puntos en header y dashboard → cerrar sesión.
  - **Criterio**: Puntos visibles en header. Dashboard refleja datos correctos.
  - **Depende de**: 3.2, 4.1

- [ ] 5.6 Tests E2E — flujo de racha diaria
  - **Descripción**: Playwright con fechas mockeadas. Simular estudio día 1 → ver racha 1 → día 2 → ver racha 2 → saltar 3 días → ver racha reiniciada a 1.
  - **Criterio**: Racha se comporta según reglas de negocio.
  - **Depende de**: 3.2, 4.1

- [ ] 5.7 Test de regresión — invariantes
  - **Descripción**: Verificar que `total_points` nunca decrece, `longest_streak` nunca decrece, y no se crean filas duplicadas en `user_stats`.
  - **Criterio**: Invariantes se cumplen bajo cualquier secuencia de operaciones.
  - **Depende de**: 5.3, 5.4

## Fase 6: Documentación y Deploy

- [ ] 6.1 Documentar reglas de gamificación en `src/docs/gamification.md`
  - **Descripción**: Explicar sistema de puntos, bonos, racha diaria para futuros desarrolladores. Incluir diagrama de decisión.
  - **Depende de**: 2.2, 2.4

- [ ] 6.2 Actualizar tipos en `src/types/app.ts` si es necesario
  - **Descripción**: Verificar que `UserStats`, `SubmitAnswerResult`, `CompleteSessionResult` están completos y alineados con implementación.
  - **Depende de**: 2.2

- [ ] 6.3 PR Review y merge a main
  - **Depende de**: 5.5, 5.6, 5.7, 6.1

- [ ] 6.4 Deploy a producción (Vercel + Supabase)
  - **Depende de**: 6.3

---

**Notas:**
- `[P]` = paralelizable
- Tareas marcadas con `[x]` ya existen en el código base
- Tareas sin `[x]` son nuevo desarrollo o revisión
- Estimación por tarea: 1-4 horas
- Priorizar Fase 2 (servidor) antes que Fase 3-4 (frontend)
- Tests deben pasar en CI antes del merge
