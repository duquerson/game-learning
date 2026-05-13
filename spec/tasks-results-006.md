# Tareas: RES-006 — Resultados de sesión de repaso

**Estimación total**: ~12-18 horas

---

## Fase 1: Fundación — Servicios y tipos

- [ ] 1.1 `[P]` Crear `ConfettiService` en `src/lib/confetti.ts`
  - **Descripción**: Extraer lógica de confetti de `ReviewResults.vue` a un servicio dedicado. Implementar `shouldCelebrate`, `fireBasic`, `fireDoubleBurst`, `isMotionOk`. Carga lazy de `canvas-confetti` con `await import()`.
  - **Criterio**: `shouldCelebrate(90) = true`, `shouldCelebrate(70) = false`, `isMotionOk()` respeta `prefers-reduced-motion`.
  - **Depende de**: —
  - **Archivos**: `src/lib/confetti.ts`
  - **Estimación**: 1h

- [ ] 1.2 `[P]` Crear tipo `ResultsViewedEvent` en `src/types/events.ts`
  - **Descripción**: Definir interfaz `ResultsViewedEvent` con sessionId, userId, accuracy, timestamp, newBadgeCount. Exportar tipos adicionales si se requieren.
  - **Criterio**: Tipos definidos y exportados. Compilación TypeScript sin errores.
  - **Depende de**: —
  - **Archivos**: `src/types/events.ts` (nuevo)
  - **Estimación**: 0.5h

- [ ] 1.3 Agregar tipo `ResultsUrlParams` en `src/types/app.ts`
  - **Descripción**: Interfaz para los URL params de fallback. Todos opcionales, tipo `number`.
  - **Criterio**: Tipo definido y referenciable desde `ReviewResults.vue`.
  - **Depende de**: —
  - **Archivos**: `src/types/app.ts`
  - **Estimación**: 0.25h

## Fase 2: Servidor — Tracking action

- [ ] 2.1 Crear acción `review.submitResultsViewed`
  - **Descripción**: Nueva Astro Action que recibe `{ sessionId, accuracy, newBadgeCount }` y persiste en `event_log` (o simplemente retorna success si no hay tabla). Validación Zod. Falla silenciosamente.
  - **Criterio**: POST exitoso → `{ success: true }`. Error en DB → no lanza excepción al cliente.
  - **Depende de**: 1.2
  - **Archivos**: `src/actions/index.ts`
  - **Estimación**: 1h

- [ ] 2.2 (Opcional) Migración de schema `event_log`
  - **Descripción**: SQL para crear tabla `event_log` si se desea persistencia de tracking. RLS policies.
  - **Criterio**: Migración ejecutable. Rolling: DROP TABLE IF EXISTS event_log.
  - **Depende de**: 2.1
  - **Archivos**: `supabase/schema.sql` o migración separada
  - **Estimación**: 0.5h

## Fase 3: Frontend — Refactor y mejoras de ReviewResults.vue

- [ ] 3.1 Refactor: Integrar `ConfettiService` en `ReviewResults.vue`
  - **Descripción**: Reemplazar inline `canvas-confetti` import y lógica condicional por llamadas a `ConfettiService.shouldCelebrate()` + `fireDoubleBurst()`. Usar `isMotionOk()` en vez de `matchMedia` inline.
  - **Criterio**: Mismo comportamiento visual. Código más limpio y testeable.
  - **Depende de**: 1.1
  - **Archivos**: `src/components/cards/ReviewResults.vue`
  - **Estimación**: 1h

- [ ] 3.2 Agregar enlace a `/badges` en sección de insignias
  - **Descripción**: En `ReviewResults.vue`, agregar badge-chip cliqueable o botón "Ver todas las insignias" que navegue a `/badges`. Usar `<a href="/badges">` o `router.push`.
  - **Criterio**: Clic en enlace → navega a /badges. Sección visible solo si hay newBadges.
  - **Depende de**: 3.1
  - **Archivos**: `src/components/cards/ReviewResults.vue`
  - **Estimación**: 0.5h

- [ ] 3.3 Agregar tracking `submitResultsViewed` en `onMounted`
  - **Descripción**: Llamar `actions.review.submitResultsViewed` al montar el componente. Falla silenciosa (catch). Pasar sessionId, accuracy, newBadgeCount.
  - **Criterio**: Tracking enviado. No bloquea UI. No muestra errores al usuario.
  - **Depende de**: 2.1, 3.1
  - **Archivos**: `src/components/cards/ReviewResults.vue`
  - **Estimación**: 0.5h

- [ ] 3.4 Validar y limpiar fallback URL params
  - **Descripción**: Parsear URL params con guard `Number() || 0`. Agregar caso para store vacío + sin params → mostrar mensaje "No hay resultados".
  - **Criterio**: Params inválidos → fallback a 0. Sin params → mensaje de error amigable.
  - **Depende de**: 1.3, 3.1
  - **Archivos**: `src/components/cards/ReviewResults.vue`
  - **Estimación**: 0.5h

- [ ] 3.5 Agregar animación stagger unificada
  - **Descripción**: Crear helper `useStaggerAnimation` o usar clases con delays consistentes. Los delays actuales (100-400ms) están hardcodeados en style. Dejarlos como están (no blocker).
  - **Criterio**: (Nice-to-have) Animaciones consistentes.
  - **Depende de**: 3.1
  - **Estimación**: 0.5h

## Fase 4: Ruta /results

- [ ] 4.1 `[P]` Crear página `src/pages/results.astro`
  - **Descripción**: Página Astro que renderiza `<ReviewResults />` con `client:only="vue"`. Layout base con header (sin sidebar, es pantalla focalizada).
  - **Criterio**: Navegación a `/results` muestra ReviewResults. Layout correcto.
  - **Depende de**: 3.1
  - **Archivos**: `src/pages/results.astro` (nuevo)
  - **Estimación**: 0.5h

- [ ] 4.2 Integrar navegación desde quiz a `/results`
  - **Descripción**: Verificar que `QuizPage.vue` redirige a `/results?total=N&correct=M&percentage=P&points=PT` después de `completeSession` exitoso.
  - **Criterio**: Al terminar quiz, el usuario llega a /results con datos correctos.
  - **Depende de**: 4.1
  - **Archivos**: `src/pages/review/[mode].vue` (quiz page)
  - **Estimación**: 0.5h

## Fase 5: Pruebas

- [ ] 5.1 Tests unitarios `confetti.ts`
  - **Descripción**: Vitest. Cubrir: shouldCelebrate threshold exacto, bajo y alto; isMotionOk con mock de matchMedia.
  - **Criterio**: 100% branches. ~5 casos.
  - **Depende de**: 1.1
  - **Estimación**: 1h

- [ ] 5.2 Tests unitarios `ReviewResults.vue` (computed)
  - **Descripción**: Vitest + @vue/test-utils. Mock store con distintos escenarios. Verificar total, correct, incorrect, percentage, performanceMessage.
  - **Criterio**: Computed correctos: 80% → "Excelente", 60-79% → "Buen progreso", <60% → "Sigue practicando".
  - **Depende de**: 3.1
  - **Estimación**: 1.5h

- [ ] 5.3 Tests de integración — submitResultsViewed
  - **Descripción**: Llamar acción y verificar respuesta. Mock DB si es necesario.
  - **Criterio**: Action responde `{ success: true }`. No lanza error con payload inválido.
  - **Depende de**: 2.1
  - **Estimación**: 1h

- [ ] 5.4 Tests E2E — flujo completo de resultados
  - **Descripción**: Playwright. Login → Quiz de 10 preguntas → Completar → Verificar /results: score ring, stats, confetti (si >=80%), badges (si hay), botones.
  - **Criterio**: Pantalla de resultados muestra datos correctos. Confetti se dispara con >=80%. Botones navegan correctamente.
  - **Depende de**: 4.1, 4.2
  - **Estimación**: 2h

- [ ] 5.5 Tests E2E — fallback URL params
  - **Descripción**: Playwright. Navegar directamente a `/results?total=5&correct=3&percentage=60&points=75`. Verificar datos mostrados sin store.
  - **Criterio**: Stats y score ring reflejan los params.
  - **Depende de**: 4.1
  - **Estimación**: 1h

- [ ] 5.6 Tests E2E — prefers-reduced-motion
  - **Descripción**: Playwright. Emular `prefers-reduced-motion: reduce`. Sesión con 100%. Verificar que NO hay confetti.
  - **Criterio**: Sin confetti a pesar de >=80%.
  - **Depende de**: 4.1, 4.2
  - **Estimación**: 1h

## Fase 6: Documentación y Deploy

- [ ] 6.1 Documentar ConfettiService en `src/docs/results-006.md`
  - **Descripción**: Explicar servicio, umbral, integración con ReviewResults.
  - **Depende de**: 1.1, 3.1
  - **Estimación**: 0.5h

- [ ] 6.2 PR Review y merge a main
  - **Depende de**: 5.1, 5.2, 5.4, 5.5, 5.6
  - **Estimación**: 1h

- [ ] 6.3 Deploy a producción (Vercel + Supabase)
  - **Depende de**: 6.2
  - **Estimación**: 0.5h

---

**Notas:**
- `[P]` = paralelizable
- Tareas marcadas con `[x]` ya existen en el código base
- Tareas sin `[x]` son nuevo desarrollo o refactor
- Estimación por tarea: 0.25-2h
- Priorizar Fase 1 → Fase 3 → Fase 4 (servicio listo antes de componente)
- ReviewResults.vue ya existe y tiene la funcionalidad base; el esfuerzo principal es refactor y mejoras
- Tests E2E deben pasar en CI antes del merge
