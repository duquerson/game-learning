---
title: REV-011 — Modo Autoevaluación (Flip Card)
version: 1.0
date_created: 2026-05-13
owner: Equipo MicroLearn
tags: especificación, autoevaluación, flip-card, self-assessment, timer, 3d
---

# REV-011: Modo Autoevaluación (Flip Card)

## 1. Propósito y Alcance

Sesión de 10 tarjetas aleatorias donde el usuario voltea manualmente cada una con animación 3D, se autoevalúa (lo sabía / no lo sabía), y gana puntos según dificultad. Timer de 30s para voltear; si expira, flip automático + incorrecta.

Sin opciones múltiples. El usuario decide si recordaba el concepto (recall activo, testing effect).

Queda fuera del alcance: modo quiz (REV-004 / spec-review-004.md), resultados detallados (RES-006 / spec-results-006.md), badges (BDG-008 / spec-badges-008.md), dashboard (DSH-007 / spec-dashboard-007.md).

## 2. Definiciones

| Término | Definición |
|---------|-----------|
| Autoevaluación | Modo de repaso sin opciones, el usuario decide si sabía o no |
| Flip card | Tarjeta que gira 180° con perspectiva 3D (rotateY) para mostrar respuesta |
| CardFace | Estado de la tarjeta: front (concepto) o back (respuesta) |
| Timer flip | Contador regresivo de 30s para voltear la tarjeta |
| Self-evaluación | Decisión binaria del usuario: "Lo sabía" o "No lo sabía" |
| SessionResult | Registro de respuesta individual con flag selfEvaluated |

## 3. User Stories

Ver `src/docs/user-story-self-assessment-011.md` — 5 escenarios Gherkin (iniciar, voltear, auto-evaluar, timer expira, progreso/finalizar).

## 4. Requerimientos Funcionales

- **RF-001**: El sistema debe seleccionar 10 tarjetas aleatorias filtradas por los temas del usuario
- **RF-002**: El sistema debe mostrar el concepto/pregunta en el frente de la tarjeta
- **RF-003**: El sistema debe mostrar la respuesta/explicación en el reverso de la tarjeta
- **RF-004**: El sistema debe aplicar animación 3D (perspective + rotateY, 0.4–0.5s) al voltear la tarjeta
- **RF-005**: El sistema debe permitir voltear manualmente mediante click en tarjeta o botón "Ver respuesta"
- **RF-006**: El sistema debe mostrar un timer regresivo de 30s para voltear la tarjeta
- **RF-007**: Si el timer llega a 0 sin voltear, el sistema debe voltear automáticamente y marcar como incorrecta (0 puntos)
- **RF-008**: Después de ver la respuesta, el sistema debe mostrar botones "Lo sabía ✅" y "No lo sabía ❌"
- **RF-009**: El sistema debe otorgar puntos según dificultad si el usuario marca "Lo sabía": easy=5, medium=10, hard=15
- **RF-010**: Si el usuario marca "No lo sabía" o timeout, debe otorgar 0 puntos
- **RF-011**: El sistema debe calcular bonos por racha: 3 correctas seguidas = +5, 5 correctas = +15
- **RF-012**: El sistema debe mostrar feedback inmediato con puntos obtenidos después de cada auto-evaluación
- **RF-013**: El sistema debe mostrar contador "Tarjeta X de 10" y barra de progreso
- **RF-014**: El sistema debe mostrar un resumen al finalizar (correctas, incorrectas, puntos) con botón "Ver resultados completos"
- **RF-015**: El sistema debe persistir cada respuesta individual en Supabase (user_progress) con flag selfEvaluated
- **RF-016**: El sistema debe persistir la finalización de sesión en Supabase con estado "completed"

## 5. Requerimientos No Funcionales

- **RNF-001 — Rendimiento**: Animación flip < 16ms/frame (60fps), usar CSS transform + GPU compositing
- **RNF-002 — Rendimiento**: submitAnswer action en < 500ms (p95)
- **RNF-003 — UX**: Timer debe mostrar estado warning (≤10s) y danger (≤5s) con color
- **RNF-004 — UX**: Transición entre tarjetas ≤ 300ms con slide animation
- **RNF-005 — Consistencia**: Puntos calculados en servidor, no confiar en cliente
- **RNF-006 — Animación**: Flip card debe usar `backface-visibility: hidden` y `transform-style: preserve-3d`
- **RNF-007 — Accesibilidad**: Botón "Ver respuesta" y botones de auto-evaluación deben ser navegables por teclado (Tab + Enter/Space)
- **RNF-008 — Accesibilidad**: Respetar `prefers-reduced-motion`: desactivar animación 3D flip, usar fade en su lugar
- **RNF-009 — Seguridad**: Validar que el userId del token JWT coincide con la sesión
- **RNF-010 — Disponibilidad**: Si falla submitAnswer, reintentar y mostrar toast de error

## 6. Restricciones y Reglas de Negocio

- **RN-001**: Cada sesión tiene exactamente 10 tarjetas
- **RN-002**: No hay opciones múltiples — solo auto-evaluación binaria (lo sabía / no lo sabía)
- **RN-003**: Timer de 30s para voltear; al llegar a 0, flip automático + incorrecta (0 puntos)
- **RN-004**: No se puede responder dos veces la misma tarjeta
- **RN-005**: Las tarjetas se seleccionan aleatoriamente de los temas del usuario
- **RN-006**: Los puntos se calculan según dificultad real de la tarjeta (servidor)
- **RN-007**: Puntos por dificultad: easy=5, medium=10, hard=15
- **RN-008**: Bonos por racha: 3 correctas seguidas = +5, 5 correctas = +15 (misma lógica que quiz)
- **RN-009**: El usuario debe voltear la tarjeta antes de poder auto-evaluarse
- **RN-010**: La animación 3D es puramente UI, no afecta la lógica de negocio
- **CON-001**: Stack existente: Astro 5 + Vue 3 + Pinia + TailwindCSS v4 + Supabase + Vercel
- **CON-002**: Acciones del servidor via Astro Actions (`src/actions/index.ts`)
- **CON-003**: Las respuestas se persisten en tabla `user_progress`
- **CON-004**: El estado de sesión se maneja en Pinia store `useReviewStore`
- **CON-005**: El modo autoevaluación ya tiene template parcial en `ReviewCard.vue` (líneas 182–240)
- **CON-006**: `useReviewSession` composable ya existe con `isFlipped`, `flipCard`, `handleAnswer`

## 7. Contratos de Interfaz

### Tipos — nuevos y existentes (`src/types/app.ts`)

```typescript
// ─── Existentes ──────────────────────────────────────────────
export type Difficulty = 'easy' | 'medium' | 'hard'
export type ReviewMode = 'self-assessment' | 'quiz'

export interface Card {
  id: string
  title: string
  content: string
  topic: string
  subtopic: string
  difficulty: Difficulty
  points: number
}

export interface SessionResult {
  cardId: string
  correct: boolean
  difficulty: Difficulty
  pointsEarned: number
}

export interface SubmitAnswerResult {
  pointsEarned: number
  newTotal: number
  streakBonus: number
  correctStreak: number
  sessionId: string
}

export interface CompleteSessionResult {
  newBadges: Badge[]
  updatedStats: UserStats
}

// ─── NUEVOS para REV-011 ─────────────────────────────────────
/** Estado de la cara visible de la tarjeta */
export type CardFace = 'front' | 'back'

/** Configuración de la animación 3D flip */
export interface FlipAnimationConfig {
  duration: number        // segundos (0.4)
  transform: string      // 'rotateY'
  easing: string         // 'ease'
}

/** Resultado de autoevaluación extendido para self-assessment */
export interface SelfAssessmentResult extends SessionResult {
  selfEvaluated: boolean  // true = usuario decidió; false = timeout
  flippedManually: boolean
  timeToFlip: number      // segundos que tomó voltear
}
```

### Contratos de acciones (`src/actions/index.ts`) — existentes, sin cambios

```typescript
// submitAnswer — mismo contrato que quiz
Input:  { cardId: string(uuid), correct: boolean, sessionId: string(uuid) }
Output: { success: true, data: SubmitAnswerResult }
        | { success: false, error: string, message: string }

// completeSession — mismo contrato que quiz
Input:  { sessionId: string(uuid), sessionResults: SessionResult[] }
Output: { success: true, data: CompleteSessionResult }
        | { success: false, error: string, message: string }
```

### Contratos de componentes

```typescript
// ReviewCard.vue — props (existente, sin cambios)
interface ReviewCardProps {
  cards: Card[]
  mode: ReviewMode
}

// useReviewSession (composable) — NUEVOS getters/actions
interface UseReviewSessionReturn {
  // State
  isFlipped: Ref<boolean>
  currentFace: ComputedRef<CardFace>  // 'front' | 'back' según isFlipped
  // Actions
  flipCard(): void
  resetFlip(): void                    // llamado en nextCard
  handleAnswer(correct: boolean): Promise<boolean>
  // Animation
  flipAnimationStyle: ComputedRef<{ transform: string; transition: string }>
}

// SelfAssessmentActions (slot componente) — feedback puntos
interface SelfAssessmentFeedback {
  pointsEarned: number
  streakBonus: number
  correctStreak: number
  showFeedback: boolean
}

// useReviewStore (Pinia) — existente, sin cambios para self-assessment
interface ReviewStore {
  // State
  deck: Card[]
  currentIndex: number
  mode: ReviewMode
  sessionResults: SessionResult[]
  sessionId: string | null
  sessionPoints: number
  sessionCompleteResult: CompleteSessionResult | null
  isLoading: boolean
  // Getters
  currentCard: Card | null
  progress: { current: number; total: number }
  isFinished: boolean
  // Actions
  initSession(cards: Card[], mode: ReviewMode): void
  submitAnswer(cardId: string, correct: boolean, difficulty: Difficulty): Promise<boolean>
  nextCard(): Promise<{ done: boolean; success: boolean }>
  completeSession(): Promise<boolean>
}
```

## 8. Escenarios de Error

| Código | Escenario | Respuesta |
|--------|-----------|-----------|
| ERR-001 | Timer expira sin voltear | Flip automático. Tarjeta marcada incorrecta (0 pts). Botones de auto-evaluación aparecen. Sin puntos. |
| ERR-002 | Falla submitAnswer (red) | Toast error "Sin conexión". Rollback del estado optimista. Se reintenta en nextCard. |
| ERR-003 | Sesión no encontrada en completeSession | Toast "Tu sesión expiró". Redirección a /review. |
| ERR-004 | Sin tarjetas disponibles | Redirección a /library con mensaje "No hay tarjetas para tus temas". |
| ERR-005 | Usuario no autenticado | Redirección a /login (middleware existente). |
| ERR-006 | payload mismatch en completeSession | Error 400 "Session payload mismatch". Se descarta la sesión corrupta. |
| ERR-007 | Error de validación Zod en input | Mensaje de error genérico. No se persiste nada. |
| ERR-008 | Doble click en auto-evaluación | isFlipped + answered flag previenen múltiples submits. Botones deshabilitados tras primer click. |
| ERR-009 | Usuario intenta auto-evaluarse sin voltear | Botones ocultos hasta que isFlipped = true. No debería ocurrir en UI normal. |

## 9. Criterios de Aceptación Globales

- **AC-001**: Dado 10+ tarjetas disponibles, Cuando inicio autoevaluación, Entonces veo el concepto en frente, timer en 30s, contador "Tarjeta 1 de 10"
- **AC-002**: Dado que veo el concepto, Cuando hago click en tarjeta o "Ver respuesta", Entonces la tarjeta gira con animación 3D mostrando la respuesta
- **AC-003**: Dado que veo la respuesta, Cuando marco "Lo sabía", Entonces gano puntos según dificultad (5/10/15), veo feedback + bonus si hay racha
- **AC-004**: Dado que veo la respuesta, Cuando marco "No lo sabía", Entonces 0 puntos, veo feedback, y no hay bonus
- **AC-005**: Dado que el timer llega a 0, Cuando expira, Entonces la tarjeta se voltea automáticamente, 0 puntos
- **AC-006**: Dado que avanzo entre tarjetas, Cuando cambio, Entonces veo contador X/10 y barra de progreso actualizada
- **AC-007**: Dado que completo 10 tarjetas, Cuando termino, Entonces veo resumen con correctas, incorrectas, puntos + botón "Ver resultados completos"

## 10. Métricas de Éxito

| KPI | Target | Medición |
|-----|--------|----------|
| Tasa de finalización de sesión | > 80% | Sesiones completadas / iniciadas |
| Tasa de "Lo sabía" promedio | > 55% | Correctas / total en sesión |
| Tiempo promedio de flip | < 15s | Tiempo hasta flipCard() |
| Tasa de timeout de flip | < 15% | Tarjetas con timer=0 |
| Usuarios que repiten autoevaluación | > 45% en D7 | Cohort analysis |
| Tiempo de feedback post-evaluación | < 100ms | Performance.now() |
| NPS Modo Autoevaluación | > 55 | Encuesta trimestral |

## 11. Dependencias y Supuestos

- **DEP-001**: Módulo de tarjetas (cards) existente y poblado
- **DEP-002**: Sistema de autenticación existente (Supabase Auth)
- **DEP-003**: Pinia store `useReviewStore` existente
- **DEP-004**: Acciones `review.submitAnswer` y `review.completeSession` existentes (reutilizadas)
- **DEP-005**: Tabla `user_progress` existente en Supabase
- **DEP-006**: Composable `useReviewSession` existente en `src/composables/useReviewSession.ts`
- **DEP-007**: Servicios `PointsCalculator` (`src/lib/points.ts`) y Streak (`src/lib/streak.ts`) existentes
- **SUP-001**: 80% de usuarios tendrán ≥10 tarjetas en sus temas
- **SUP-002**: La conexión a Supabase es estable (>99% uptime)
- **SUP-003**: No se requieren cambios en acciones del servidor — submitAnswer/completeSession son agnósticos al modo

## 12. Casos de Prueba

### CP-001: Flujo completo de autoevaluación (10 tarjetas)
- **Relación**: RF-001, RF-002, RF-003, RF-004, RF-005, RF-008, RF-013, RF-014
- **Precondiciones**: Usuario autenticado. ≥10 tarjetas en sus temas elegidos.
- **Pasos**: Navegar /review/self-assessment → Voltear 10 tarjetas → Auto-evaluar →
- **Resultado**: Cada tarjeta: flip 3D, respuesta visible, puntos asignados. Al final: resumen con botón "Ver resultados completos".

### CP-002: Auto-evaluación "Lo sabía" con puntos
- **Relación**: RF-009, RF-012
- **Precondiciones**: Usuario en sesión de autoevaluación. Tarjeta volteada.
- **Pasos**: Click "Lo sabía ✅"
- **Resultado**: Puntos según dificultad: easy=+5, medium=+10, hard=+15. Feedback de puntos visible.

### CP-003: Auto-evaluación "No lo sabía" sin puntos
- **Relación**: RF-010, RF-012
- **Precondiciones**: Usuario en sesión de autoevaluación. Tarjeta volteada.
- **Pasos**: Click "No lo sabía ❌"
- **Resultado**: 0 puntos. Feedback visible.

### CP-004: Timer expira sin voltear
- **Relación**: RF-006, RF-007, ERR-001
- **Precondiciones**: Usuario en sesión de autoevaluación.
- **Pasos**: Esperar 30s sin voltear la tarjeta.
- **Resultado**: Flip automático. Tarjeta marcada incorrecta. 0 puntos. Botones de auto-evaluación visibles.

### CP-005: Timer warning y danger states
- **Relación**: RNF-003
- **Precondiciones**: Usuario en sesión de autoevaluación.
- **Pasos**: Observar timer en t=10s → t=5s.
- **Resultado**: A ≤10s: color naranja/warning. A ≤5s: color rojo/danger + animación pulse.

### CP-006: Bonus por racha
- **Relación**: RF-011
- **Precondiciones**: Usuario con 2 correctas seguidas en sesión actual.
- **Pasos**: Responder "Lo sabía" en 3ra tarjeta.
- **Resultado**: +5 bonus. Toast "🔥 ¡Racha de 3! +5 puntos bonus". A las 5: +15.

### CP-007: Sin tarjetas disponibles
- **Relación**: ERR-004
- **Precondiciones**: Usuario sin tarjetas en sus temas.
- **Pasos**: Navegar /review/self-assessment.
- **Resultado**: Redirección a /library con mensaje informativo.

### CP-008: Resumen final con botón
- **Relación**: RF-014
- **Precondiciones**: Sesión de 10 tarjetas completada.
- **Pasos**: Completar última tarjeta.
- **Resultado**: Resumen con correctas/incorrectas/puntos. Botón "Ver resultados completos" navega a /results.

### CP-009: submitAnswer falla (offline)
- **Relación**: ERR-002
- **Precondiciones**: Usuario en sesión. Red desconectada.
- **Pasos**: Auto-evaluar tarjeta.
- **Resultado**: Toast "Sin conexión". Rollback del score. Sin persistencia.

### CP-010: Animación 3D flip
- **Relación**: RF-004, RNF-001, RNF-006
- **Precondiciones**: Usuario en sesión.
- **Pasos**: Click en tarjeta o botón "Ver respuesta".
- **Resultado**: Tarjeta gira 180° con perspectiva 3D, backface-visibility oculta reverso durante giro. Transición suave 0.4–0.5s.

### CP-011: Animación desactivada con prefers-reduced-motion
- **Relación**: RNF-008
- **Precondiciones**: Sistema con prefers-reduced-motion: reduce.
- **Pasos**: Click "Ver respuesta".
- **Resultado**: Sin animación 3D. Fade crossfade instantáneo entre front y back.

### CP-012: Navegación por teclado
- **Relación**: RNF-007
- **Precondiciones**: Usuario en sesión.
- **Pasos**: Tab entre elementos → Enter/Space para activar.
- **Resultado**: "Ver respuesta" enfocable con Tab. Botones "Lo sabía"/"No lo sabía" enfocables después del flip.

### CP-013: Doble click prevenido
- **Relación**: ERR-008
- **Precondiciones**: Tarjeta volteada.
- **Pasos**: Click rápido en "Lo sabía" dos veces.
- **Resultado**: Solo primer click procesa. Botones deshabilitados tras submit.

### CP-014: Transición slide entre tarjetas
- **Relación**: RNF-004
- **Precondiciones**: Usuario ha respondido primera tarjeta.
- **Pasos**: Avanzar a segunda tarjeta.
- **Resultado**: Transición slide out-in, < 300ms, isFlipped reseteado a false.
