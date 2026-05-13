# Tareas: REV-004 — Modo Quiz

## Fase 1: Core (quiz ya funcional — ajustes)

- [ ] 1.1 Actualizar BASE_POINTS a valores de user story
  - **Descripción**: Cambiar `src/lib/points.ts` BASE_POINTS de `{easy:5, medium:10, hard:15}` a `{easy:10, medium:20, hard:30}`. Verificar que `applyPoints` y cálculos de streak bonus siguen siendo correctos. Ajustar tests si existen.
  - **Criterio**: Puntos por dificultad: easy=10, medium=20, hard=30. Streak bonus no se modifica.
  - **Verificar**: `npm run test:unit` (o el comando de tests del proyecto)
  - **Depende de**: —
  - **Archivos**: `src/lib/points.ts`

- [ ] 1.2 Ajustar delay de auto-avance en timer expiry para quiz
  - **Descripción**: En `ReviewCard.vue` función `handleTimerExpiry()`, cambiar el setTimeout de auto-avance de 1000ms a 2000ms cuando el timer expira (para dar tiempo a leer la explicación). En respuesta normal (selectOption), mantener 1000ms.
  - **Criterio**: Timer expiry → 2s de feedback antes de avanzar. Respuesta normal → 1s. 
  - **Verificar**: Flujo manual: esperar timer → explicación visible por 2s → auto-avance
  - **Depende de**: —
  - **Archivos**: `src/components/cards/ReviewCard.vue`

- [ ] 1.3 Separar lógica del quiz en composable dedicado
  - **Descripción**: Extraer la lógica del quiz (quizOptions, selectedOptionId, answered, selectOption, optionClass, currentCardContent) de ReviewCard.vue a un nuevo composable `src/composables/useQuizSession.ts`. ReviewCard.vue mantiene solo el template y Timeline orchestration.
  - **Criterio**: ReviewCard.vue importa `useQuizSession()` y delega toda la lógica de quiz. Funcionalidad idéntica.
  - **Verificar**: `npm run typecheck` sin errores. Tests E2E de quiz pasan.
  - **Depende de**: —
  - **Archivos**: `src/composables/useQuizSession.ts` (nuevo), `src/components/cards/ReviewCard.vue` (refactor)

- [ ] 1.4 `[P]` Agregar variante `getQuizCards` action (optimización)
  - **Descripción**: Crear acción `review.getQuizCards` que recibe topics[] y devuelve 10 cards aleatorias + sessionId. Así el SSR delega la selección al servidor. Opcional — mejora la consistencia vs shuffle en cliente.
  - **Criterio**: Action devuelve 10 cards con datos completos (incluyendo content para explicación). SessionId pre-generado en servidor.
  - **Verificar**: Llamar action via `actions.review.getQuizCards({topics: ['js']})` → 10 cards + sessionId
  - **Depende de**: —
  - **Archivos**: `src/actions/index.ts`

## Fase 2: Manejo de errores y edge cases

- [ ] 2.1 Manejar ERR-004: Sin tarjetas disponibles
  - **Descripción**: En `src/pages/review/[mode].astro`, si rawCards está vacío, en lugar de redirigir a /library sin mensaje, pasar un query param `?no-cards=true`. En el frontend, mostrar un EmptyState con mensaje "No hay tarjetas disponibles para tus temas. Agrega más temas o crea tarjetas." y botón a /library.
  - **Criterio**: Usuario ve mensaje claro + acción. No redirección silenciosa.
  - **Verificar**: Navegar /review/quiz sin tarjetas → ver mensaje con botón
  - **Depende de**: 1.1
  - **Archivos**: `src/pages/review/[mode].astro`, `src/components/cards/ReviewCard.vue`

- [ ] 2.2 Manejar ERR-002: Fallo de submitAnswer con rollback
  - **Descripción**: Verificar que el rollback en `useReviewStore.submitAnswer()` funciona correctamente (ya implementado líneas 89-92). Agregar manejo de reintento automático 1 vez tras 2s si el error es de red. Agregar logging del error.
  - **Criterio**: Si falla submitAnswer, el score se revierte. Si es error de red, reintento automático 1 vez. Toast visible.
  - **Verificar**: Desconectar red → responder pregunta → toast error → reconectar → reintento automático
  - **Depende de**: 1.1
  - **Archivos**: `src/stores/review.ts`

- [ ] 2.3 Proteger contra doble click en opciones
  - **Descripción**: Verificar que `answered.value` flag previene múltiples submits (ya implementado en selectOption línea 121). Agregar disabled state visual en todas las opciones después de seleccionar una.
  - **Criterio**: Click rápido en 2 opciones → solo la primera cuenta. Todas las opciones se deshabilitan tras el primer click.
  - **Verificar**: Click rápido en 2 opciones → no doble submit
  - **Depende de**: 1.3
  - **Archivos**: `src/components/cards/ReviewCard.vue` o `src/composables/useQuizSession.ts`

## Fase 3: UI/UX refinements

- [ ] 3.1 `[P]` Aumentar delay de auto-avance post-timer-expiry
  - **Descripción**: En `handleTimerExpiry()` para quiz, cambiar el setTimeout de 300ms (línea 82, que apunta a handleAnswer(false)) a 2000ms para permitir leer la explicación cuando el timer expira.
  - **Criterio**: Timer expira → se resalta la correcta → 2s para leer explicación → auto-avance
  - **Depende de**: 1.3
  - **Archivos**: `src/components/cards/ReviewCard.vue`

- [ ] 3.2 Agregar animación de puntos ganados
  - **Descripción**: Al mostrar feedback de puntos (+10, +20, +30), agregar animación de "floating up + fade out" sobre la opción seleccionada. Usar transición CSS @keyframes. Respetar prefers-reduced-motion.
  - **Criterio**: Puntos aparecen flotando hacia arriba y desaparecen. Sin animación si reduce-motion activo.
  - **Verificar**: Responder correctamente → animación de puntos visible
  - **Depende de**: 1.1, 2.3
  - **Archivos**: `src/components/cards/ReviewCard.vue`

- [ ] 3.3 Keyboard accessibility para opciones de quiz
  - **Descripción**: Asegurar que los botones de opción tienen `role="radio"`, `aria-checked`, y son navegables con Tab/ArrowKeys. Agregar focus visible styles.
  - **Criterio**: Tab navega entre opciones. Enter/Space selecciona. Focus visible ring.
  - **Verificar**: `Tab` → `Enter` en cada opción
  - **Depende de**: 2.3
  - **Archivos**: `src/components/cards/ReviewCard.vue`

- [ ] 3.4 Sound effects sutiles (opcional, delight)
  - **Descripción**: Agregar sonidos cortos vía Web Audio API: `correct.wav` (ascendente) y `incorrect.wav` (descendente). Solo en respuesta a interacción, no en timer expiry. Respetar prefers-reduced-motion.
  - **Criterio**: Sonido correcto al acertar, incorrecto al fallar. Silencioso en timer expiry y reduce-motion.
  - **Verificar**: Responder correcta → sonido ascendente. Incorrecta → descendente.
  - **Depende de**: 2.3
  - **Archivos**: `src/composables/useSound.ts` (nuevo), `src/components/cards/ReviewCard.vue`

## Fase 4: Pruebas

- [ ] 4.1 Tests unitarios de quiz.ts
  - **Descripción**: Tests para `generateQuizOptions()`: verificar que devuelve exactamente 4 opciones, 1 es correcta, 3 son distractores, las opciones están barajadas. Edge cases: pool insuficiente de distractores (< 3).
  - **Depende de**: 1.1
  - **Archivos**: `src/lib/quiz.test.ts` (nuevo) o `tests/unit/quiz.test.ts`

- [ ] 4.2 Tests unitarios de points.ts
  - **Descripción**: Tests para `calculatePoints()` y `applyPoints()` con los nuevos valores. Verificar easy=10, medium=20, hard=30, incorrect=0. Streak bonus en correctStreak=3 y 5.
  - **Depende de**: 1.1
  - **Archivos**: `src/lib/points.test.ts` o `tests/unit/points.test.ts`

- [ ] 4.3 Tests de integración: flujo quiz completo
  - **Descripción**: Test E2E en Playwright: navegar /review/quiz → responder 10 preguntas (mezcla correctas/incorrectas/timer expiry) → verificar resumen → verificar /results. Mockear Supabase.
  - **Depende de**: 1.1, 1.2, 2.1, 2.2
  - **Archivos**: `tests/e2e/quiz-flow.spec.ts`

- [ ] 4.4 Tests de seguridad: anti-tampering de puntos
  - **Descripción**: Verificar que enviar difficulty inventada desde el cliente no afecta el cálculo del servidor. El servidor siempre usa la difficulty real de la tarjeta en DB.
  - **Depende de**: 2.2
  - **Archivos**: `tests/security/quiz-tampering.spec.ts`

## Fase 5: Documentación y Deploy

- [ ] 5.1 Documentar cambios en CHANGELOG
  - **Descripción**: Agregar entry sobre actualización de BASE_POINTS, nuevos composables, y mejoras de accesibilidad.
  - **Depende de**: 1.1, 1.3, 3.3

- [ ] 5.2 Deploy a preview (Vercel)
  - **Descripción**: Push a branch, abrir PR, verificar preview deploy.
  - **Depende de**: 4.3, 4.4

- [ ] 5.3 PR Review y merge a main
  - **Depende de**: 5.2

---

**Notas:**
- `[P]` = paralelizable
- Cada tarea estimada en 1-3 horas
- Estimación total: ~20-30 horas
- Orden de dependencia estricto dentro de cada fase; fases pueden ejecutarse secuencialmente
