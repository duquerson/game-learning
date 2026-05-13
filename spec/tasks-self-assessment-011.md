# Tareas: REV-011 — Modo Autoevaluación (Flip Card)

## Fase 1: Core — Tipos y composables

- [ ] 1.1 Agregar tipos CardFace y FlipAnimationConfig
  - **Descripción**: En `src/types/app.ts`, agregar `CardFace` ('front' | 'back'), `FlipAnimationConfig` ({ duration, transform, easing }), y `SelfAssessmentResult` (extends SessionResult con `selfEvaluated`, `flippedManually`, `timeToFlip`).
  - **Criterio**: Tipos exportados. `npm run typecheck` pasa sin errores.
  - **Depende de**: —
  - **Archivos**: `src/types/app.ts`

- [ ] 1.2 Mejorar useReviewSession composable
  - **Descripción**: Agregar método `resetFlip()` que setea `isFlipped.value = false`. Agregar getter `currentFace: ComputedRef<CardFace>` que retorna 'front' si `!isFlipped`, 'back' si `isFlipped`. El composable ya existe en `src/composables/useReviewSession.ts`.
  - **Criterio**: `resetFlip()` reinicia isFlipped. `currentFace` refleja estado correcto. `npm run typecheck` pasa.
  - **Depende de**: 1.1
  - **Archivos**: `src/composables/useReviewSession.ts`

- [ ] 1.3 Crear useSelfAssessment composable
  - **Descripción**: Crear `src/composables/useSelfAssessment.ts` con:
    - Estado ref: `showFeedback`, `lastPoints`, `lastBonus`, `isCorrect`
    - Método `onAnswer(correct: boolean)`: llama `store.submitAnswer()`, setea feedback state, timeout 1.5s para mostrar feedback, luego llama `store.nextCard()` + `resetFlip()`
    - Método `resetFeedback()`: limpia showFeedback, lastPoints, lastBonus
    - Recibe `resetFlip` callback por parámetro (desde useReviewSession)
  - **Criterio**: Composable funcional. Integrado con ReviewCard.vue. Feedback visible por 1.5s antes de nextCard.
  - **Verificar**: Responder tarjeta → feedback puntos visible → auto-avance después de 1.5s
  - **Depende de**: 1.1, 1.2
  - **Archivos**: `src/composables/useSelfAssessment.ts` (nuevo)

## Fase 2: UI y animación 3D

- [ ] 2.1 Refactorizar template self-assessment en ReviewCard.vue
  - **Descripción**: Extraer lógica de autoevaluación del template (líneas 182–240) para usar `useSelfAssessment`. ReviewCard.vue mantiene solo timeline orchestration y el template general. `handleTimerExpiry` y `handleAnswer` se mantienen en ReviewCard pero delegan en composables.
  - **Criterio**: Funcionalidad idéntica. Sin regresión en modo quiz. `npm run typecheck` pasa.
  - **Verificar**: Modo autoevaluación funciona igual que antes. Modo quiz sin cambios.
  - **Depende de**: 1.3
  - **Archivos**: `src/components/cards/ReviewCard.vue` (refactor)

- [ ] 2.2 Asegurar animación 3D flip a 60fps
  - **Descripción**: Verificar que CSS del flip use GPU compositing: `perspective: 1000px`, `transform-style: preserve-3d`, `backface-visibility: hidden`, `transition: transform 0.5s ease`. Verificar que no hay reflow/layout durante animación. Agregar `will-change: transform` en `.card-3d`.
  - **Criterio**: Animación 60fps en Chrome DevTools Performance tab. Sin layout shifts durante flip.
  - **Verificar**: Grabación de performance muestra > 55fps durante flip
  - **Depende de**: —
  - **Archivos**: `src/components/cards/ReviewCard.vue` (CSS)

- [ ] 2.3 Agregar soporte prefers-reduced-motion
  - **Descripción**: En el CSS scoped de ReviewCard.vue, agregar `@media (prefers-reduced-motion: reduce)` que desactiva la transición 3D (transition: none) y muestra front/back como toggle instantáneo con display none/block. También desactivar animación pulse del timer en danger state.
  - **Criterio**: Con `prefers-reduced-motion: reduce`, flip es instantáneo (sin animación). Timer no tiene pulse. Sin regresión visual.
  - **Verificar**: Activar reduce-motion en SO → flip sin animación
  - **Depende de**: 2.2
  - **Archivos**: `src/components/cards/ReviewCard.vue` (CSS)

- [ ] 2.4 Agregar animación de feedback de puntos
  - **Descripción**: Al mostrar feedback después de auto-evaluar, agregar animación CSS "floating up + fade out" para los puntos ganados (+5, +10, +15) y bonus (+5, +15). Usar `@keyframes float-up`. El texto de puntos aparece cerca del centro, flota hacia arriba y se desvanece en 0.8s. Respetar prefers-reduced-motion.
  - **Criterio**: Puntos aparecen con animación de flotación. Feedback visible incluso después de animación (quedan en texto estático hasta nextCard).
  - **Verificar**: Responder → animación de puntos visible → puntos quedan visibles hasta avanzar
  - **Depende de**: 2.1
  - **Archivos**: `src/components/cards/ReviewCard.vue`

- [ ] 2.5 Keyboard accessibility para flip y auto-evaluación
  - **Descripción**: Asegurar que el botón "Ver respuesta" y los botones "Lo sabía"/"No lo sabía" tienen `role="button"`, son navegables con Tab, y se activan con Enter/Space. Después de flip, foco automático al primer botón de auto-evaluación. Agregar focus visible styles (outline).
  - **Criterio**: Tab navega entre controles. Enter/Space activa. Foco se mueve a "Lo sabía" después del flip automático o manual.
  - **Verificar**: `Tab` → `Enter` en cada botón. Foco post-flip en botón correcto.
  - **Depende de**: 2.1
  - **Archivos**: `src/components/cards/ReviewCard.vue`

## Fase 3: Timer y edge cases

- [ ] 3.1 Timer flip 30s con auto-flip en expiry
  - **Descripción**: Verificar que `handleTimerExpiry()` en self-assessment mode (ya implementado líneas 73–78):
    1. Si `!isFlipped`, hace `flipCard()` automático
    2. Tras 300ms (delay para ver respuesta), llama `handleAnswer(false)`
    3. Si ya está flipped (no debería), no hace nada
  - **Criterio**: Timer expira → flip automático → respuesta visible → marca incorrecta tras 300ms
  - **Verificar**: Esperar timer → flip automático → 0 puntos
  - **Depende de**: 2.1
  - **Archivos**: `src/components/cards/ReviewCard.vue` (validar lógica existente)

- [ ] 3.2 Timer warning/danger states
  - **Descripción**: Los estados warning (≤10s, color naranja) y danger (≤5s, rojo + pulse) ya existen en el CSS (líneas 597–610). Verificar que funcionan en self-assessment mode. Agregar `role="timer"` y `aria-live="polite"` al elemento timer para accesibilidad.
  - **Criterio**: Timer warning a ≤10s, danger a ≤5s. ARIA attributes presentes.
  - **Verificar**: Observar cambio de color del timer
  - **Depende de**: 2.1
  - **Archivos**: `src/components/cards/ReviewCard.vue`

- [ ] 3.3 Manejar ERR-004: Sin tarjetas disponibles
  - **Descripción**: En `src/pages/review/[mode].astro`, si rawCards está vacío, pasar query param `?no-cards=true`. En el frontend (ReviewCard.vue), mostrar EmptyState con mensaje "No hay tarjetas disponibles para tus temas. Agrega más temas o crea tarjetas." y botón a /library. Reutilizar componente EmptyState existente.
  - **Criterio**: Usuario ve mensaje claro + acción. No redirección silenciosa.
  - **Verificar**: Navegar /review/self-assessment sin tarjetas → ver mensaje con botón
  - **Depende de**: 2.1
  - **Archivos**: `src/pages/review/[mode].astro`, `src/components/cards/ReviewCard.vue`

- [ ] 3.4 Proteger contra doble click en auto-evaluación
  - **Descripción**: Después de que el usuario hace click en "Lo sabía" o "No lo sabía", deshabilitar ambos botones (disabled state). Usar un flag `answered` local (ya existe para quiz, verificar que aplica en self-assessment). El store ya maneja `isLoading`.
  - **Criterio**: Click rápido en ambos botones → solo el primero cuenta. Botones deshabilitados tras submit.
  - **Verificar**: Click rápido en "Lo sabía" y luego "No lo sabía" → solo "Lo sabía" procesa
  - **Depende de**: 2.1
  - **Archivos**: `src/components/cards/ReviewCard.vue`

## Fase 4: Pruebas

- [ ] 4.1 Tests unitarios de useSelfAssessment
  - **Descripción**: Tests para el nuevo composable: verificar que `onAnswer(true)` llama submitAnswer, muestra feedback, llama nextCard tras 1.5s. `onAnswer(false)` same pero 0 puntos. `resetFeedback()` limpia estado. Mockear useReviewStore.
  - **Depende de**: 1.3
  - **Archivos**: `tests/unit/self-assessment.test.ts` (nuevo)

- [ ] 4.2 Tests unitarios de flip animation
  - **Descripción**: Tests para verificar que `flipCard()` setea `isFlipped=true`, `resetFlip()` setea `isFlipped=false`, `currentFace` retorna 'front' | 'back' correctamente.
  - **Depende de**: 1.2
  - **Archivos**: `tests/unit/use-review-session.test.ts` (nuevo)

- [ ] 4.3 Tests de integración: flujo autoevaluación completo
  - **Descripción**: Test E2E en Playwright: navegar /review/self-assessment → flip 10 tarjetas (mix "Lo sabía"/"No lo sabía"/timeout) → verificar resumen → verificar /results. Mockear Supabase.
  - **Depende de**: 2.1, 3.1, 3.4
  - **Archivos**: `tests/e2e/self-assessment-flow.spec.ts` (nuevo)

- [ ] 4.4 Tests de animación 3D y accesibilidad
  - **Descripción**: Test E2E: verificar que flip card tiene clase `is-flipped` después de click. Verificar que con `prefers-reduced-motion` no hay transición. Verificar navegación por teclado (Tab + Enter) en botones. Verificar `role="timer"` y `aria-live`.
  - **Depende de**: 2.2, 2.3, 2.5
  - **Archivos**: `tests/e2e/flip-card-accessibility.spec.ts` (nuevo)

- [ ] 4.5 Tests de puntos y streak en autoevaluación
  - **Descripción**: Verificar que points.ts `calculatePoints()` con self-assessment values (easy=5, medium=10, hard=15) funciona. Verificar que streak bonus (3=+5, 5=+15) aplica igual que quiz. Verificar que timeout = 0 puntos.
  - **Depende de**: 3.1
  - **Archivos**: `tests/unit/points-self-assessment.test.ts` (nuevo)

## Fase 5: Documentación y Deploy

- [ ] 5.1 Documentar cambios en CHANGELOG
  - **Descripción**: Agregar entry sobre nuevo modo autoevaluación: tipos CardFace, FlipAnimationConfig, composable useSelfAssessment, mejoras de accesibilidad.
  - **Depende de**: 1.1, 1.3, 2.5

- [ ] 5.2 Deploy a preview (Vercel)
  - **Descripción**: Push a branch, abrir PR, verificar preview deploy. Probar flujo completo en preview.
  - **Depende de**: 4.3, 4.4, 4.5

- [ ] 5.3 PR Review y merge a main
  - **Depende de**: 5.2

---

**Notas:**
- `[P]` = paralelizable
- Cada tarea estimada en 1–3 horas
- Estimación total: ~25–35 horas
- Las acciones de servidor (`submitAnswer`, `completeSession`) se reutilizan sin cambios — el servidor no distingue entre quiz y self-assessment
- BASE_POINTS actual (easy=5, medium=10, hard=15) ya es correcto para el modo autoevaluación según RN-007 de la user story
- Orden de dependencia estricto dentro de cada fase; fases pueden ejecutarse secuencialmente
