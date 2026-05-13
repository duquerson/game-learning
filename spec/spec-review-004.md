---
title: REV-004 — Modo Quiz (Opción Múltiple)
version: 1.0
date_created: 2026-05-13
owner: Equipo MicroLearn
tags: especificación, quiz, review, opción-múltiple, timer
---

# REV-004: Modo Quiz

## 1. Propósito y Alcance

Sesión de 10 preguntas aleatorias con 4 opciones de respuesta (1 correcta + 3 distractores), timer de 30s por pregunta, feedback visual inmediato y resumen final con puntos.

El modo quiz ya tiene implementación parcial en `ReviewCard.vue` (líneas 91-283), `quiz.ts`, `review store` y `actions/index.ts`. Esta especificación formaliza los contratos faltantes y los puntos de mejora detectados.

Queda fuera del alcance: modo autoevaluación (REV-011 / spec-self-assessment-011.md), resultados detallados (RES-006 / spec-results-006.md), badges (BDG-008 / spec-badges-008.md), dashboard (DSH-007 / spec-dashboard-007.md).

## 2. Definiciones

| Término | Definición |
|---------|-----------|
| Quiz | Modo de repaso con selección múltiple y timer |
| Opción | Una de 4 respuestas posibles (1 correcta + 3 distractores) |
| Distractor | Opción incorrecta generada de otras tarjetas del mismo tópico |
| Timer | Contador regresivo de 30s por pregunta |
| Feedback inmediato | Indicador visual verde/correcta, rojo/incorrecta + puntos + explicación |
| SessionResult | Registro de respuesta individual dentro de una sesión |

## 3. User Stories

Ver `src/docs/user-story-review-004.md` — 5 escenarios Gherkin (iniciar, responder correcto, incorrecto, progreso, finalizar).

## 4. Requerimientos Funcionales

- **RF-001**: El sistema debe seleccionar 10 tarjetas aleatorias filtradas por los temas del usuario
- **RF-002**: El sistema debe generar 4 opciones por pregunta (1 correcta + 3 distractores del mismo tópico o tópicos cercanos)
- **RF-003**: El sistema debe mostrar un timer regresivo de 30s por pregunta
- **RF-004**: El sistema debe aceptar una respuesta dentro del tiempo límite
- **RF-005**: El sistema debe marcar como incorrecta si el timer expira (automático)
- **RF-006**: El sistema debe mostrar feedback inmediato: opción seleccionada en verde/rojo, opción correcta resaltada en verde
- **RF-007**: El sistema debe mostrar los puntos ganados (+5 easy, +10 medium, +15 hard) o 0 si incorrecto
- **RF-008**: El sistema debe mostrar la explicación (contenido de la tarjeta) después de responder
- **RF-009**: El sistema debe mostrar una barra de progreso "Pregunta X de 10"
- **RF-010**: El sistema debe auto-avanzar a la siguiente pregunta tras 1s de feedback
- **RF-011**: El sistema debe mostrar un resumen al finalizar (correctas, incorrectas, puntos) con botón "Ver resultados completos"
- **RF-012**: El sistema debe persistir cada respuesta individual en Supabase (user_progress)
- **RF-013**: El sistema debe persistir la finalización de sesión en Supabase con estado "completed"
- **RF-014**: El sistema debe calcular puntos según dificultad real de la tarjeta (servidor, no confiar en cliente)
- **RF-015**: El sistema debe barajar el orden de opciones para cada pregunta

### Puntos de Mejora (detectados vs. User Story)

| Aspecto | User Story dice | Código actual | Acción |
|---------|----------------|---------------|--------|
| Puntos | easy=10, medium=20, hard=30 | BASE_POINTS = {easy:5, medium:10, hard:15} | Actualizar BASE_POINTS en `src/lib/points.ts` |
| Explicación | Mostrar después de responder | Ya se muestra (v-if answered) | OK — sin cambios |
| Timer expiry automático | Marcar incorrecta | Ya implementado en `handleTimerExpiry` | OK — sin cambios |

## 5. Requerimientos No Funcionales

- **RNF-001 — Rendimiento**: feedback visual en < 100ms post-selección
- **RNF-002 — Rendimiento**: submitAnswer action en < 500ms (p95)
- **RNF-003 — UX**: Timer debe mostrar estado warning (≤10s) y danger (≤5s) con color
- **RNF-004 — UX**: Transición entre preguntas ≤ 300ms con slide animation
- **RNF-005 — Consistencia**: Puntos calculados en servidor, no confiar en cliente
- **RNF-006 — Seguridad**: Validar que el userId del token JWT coincide con la sesión
- **RNF-007 — Disponibilidad**: Si falla submitAnswer, reintentar y mostrar toast de error
- **RNF-008 — Accesibilidad**: Opciones deben ser navegables por teclado (Tab + Enter)

## 6. Restricciones y Reglas de Negocio

- **RN-001**: Cada sesión tiene exactamente 10 tarjetas
- **RN-002**: Cada pregunta tiene exactamente 4 opciones (1 correcta + 3 distractores)
- **RN-003**: Timer de 30s por pregunta; al llegar a 0 cuenta como incorrecta
- **RN-004**: No se puede responder dos veces la misma pregunta
- **RN-005**: Las tarjetas se seleccionan aleatoriamente de los temas del usuario
- **RN-006**: Las opciones se barajan aleatoriamente por pregunta
- **RN-007**: Los puntos se calculan según dificultad real de la tarjeta (servidor)
- **RN-008**: Los puntos por dificultad: easy=10, medium=20, hard=30
- **CON-001**: Stack existente: Astro 5 + Vue 3 + Pinia + TailwindCSS v4 + Supabase + Vercel
- **CON-002**: Acciones del servidor via Astro Actions (`src/actions/index.ts`)
- **CON-003**: Las respuestas se persisten en tabla `user_progress`
- **CON-004**: El estado de sesión se maneja en Pinia store `useReviewStore`

## 7. Contratos de Interfaz

### Tipos existentes (src/types/app.ts)

```typescript
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

export interface QuizOption {
  id: string
  title: string
  isCorrect: boolean
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
```

### Contratos de acciones (src/actions/index.ts)

```typescript
// submitAnswer
Input:  { cardId: string(uuid), correct: boolean, sessionId: string(uuid) }
Output: { success: true, data: SubmitAnswerResult }
        | { success: false, error: string, message: string }

// completeSession
Input:  { sessionId: string(uuid), sessionResults: SessionResult[] }
Output: { success: true, data: CompleteSessionResult }
        | { success: false, error: string, message: string }

// getQuizCards (NUEVO — opcional, para optimizar)
Input:  { topics: string[], limit: number(default=10) }
Output: { success: true, data: { cards: Card[], sessionId: string } }
```

### Contratos de componentes

```typescript
// ReviewCard.vue — props
interface ReviewCardProps {
  cards: Card[]
  mode: ReviewMode
}

// useReviewStore (Pinia)
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
| ERR-001 | Timer expira sin respuesta | Opción correcta se resalta. No se ganan puntos. Explicación se muestra. Auto-avance tras 2s. |
| ERR-002 | Falla submitAnswer (red) | Toast error "Sin conexión". Rollback del estado optimista. Se reintenta en nextCard. |
| ERR-003 | Sesión no encontrada en completeSession | Toast "Tu sesión expiró". Redirección a /review. |
| ERR-004 | Sin tarjetas disponibles | Redirección a /library con mensaje "No hay tarjetas para tus temas". |
| ERR-005 | Usuario no autenticado | Redirección a /login (middleware existente). |
| ERR-006 | payload mismatch en completeSession | Error 400 "Session payload mismatch". Se descarta la sesión corrupta. |
| ERR-007 | Error de validación Zod en input | Mensaje de error genérico. No se persiste nada. |

## 9. Criterios de Aceptación Globales

- **AC-001**: Dado 10+ tarjetas disponibles, Cuando inicio quiz, Entonces veo la primera pregunta con 4 opciones y timer en 30s
- **AC-002**: Dado que selecciono la opción correcta, Cuando la elijo, Entonces se marca verde, gano puntos según dificultad, veo explicación
- **AC-003**: Dado que selecciono opción incorrecta, Cuando la elijo, Entonces se marca rojo, la correcta se resalta verde, 0 puntos, veo explicación
- **AC-004**: Dado que el timer llega a 0, Cuando expira, Entonces la correcta se resalta, 0 puntos, veo explicación
- **AC-005**: Dado que avanzo entre preguntas, Cuando cambio, Entonces veo contador X/10 y barra de progreso actualizada
- **AC-006**: Dado que completo 10 preguntas, Cuando termino, Entonces veo resumen con correctas, incorrectas, puntos + botón "Ver resultados completos"

## 10. Métricas de Éxito

| KPI | Target | Medición |
|-----|--------|----------|
| Tasa de finalización de quiz | > 80% | Sesiones completadas / iniciadas |
| Tasa de aciertos promedio | > 60% | Correctas / total en sesión |
| Tiempo promedio por pregunta | < 20s | Timer data |
| Tasa de timeout por pregunta | < 10% | Preguntas con timer=0 |
| Usuarios que repiten quiz | > 40% en D7 | Cohort analysis |
| Tiempo de feedback post-respuesta | < 100ms | Performance.now() |
| NPS Modo Quiz | > 50 | Encuesta trimestral |

## 11. Dependencias y Supuestos

- **DEP-001**: Módulo de tarjetas (cards) existente y poblado
- **DEP-002**: Sistema de autenticación existente (Supabase Auth)
- **DEP-003**: Pinia store `useReviewStore` existente
- **DEP-004**: Acciones `review.submitAnswer` y `review.completeSession` existentes
- **DEP-005**: Tabla `user_progress` existente en Supabase
- **SUP-001**: 80% de usuarios tendrán ≥10 tarjetas en sus temas
- **SUP-002**: La conexión a Supabase es estable (>99% uptime)
- **SUP-003**: BASE_POINTS se actualizará de {5,10,15} a {10,20,30} como parte de esta tarea

## 12. Casos de Prueba

### CP-001: Flujo completo de quiz (10 preguntas correctas)
- **Relación**: RF-001, RF-006, RF-007, RF-009, RF-011
- **Precondiciones**: Usuario autenticado. ≥10 tarjetas en sus temas elegidos.
- **Pasos**: Navegar /review/quiz → Responder 10 preguntas correctamente →
- **Resultado**: Cada respuesta: opción verde, +10/+20/+30 pts, explicación visible. Al final: 100%, 10/10, puntos totales.

### CP-002: Respuesta incorrecta + explicación
- **Relación**: RF-006, RF-007, RF-008
- **Precondiciones**: Usuario en sesión de quiz
- **Pasos**: Seleccionar opción incorrecta
- **Resultado**: Opción roja, correcta resaltada verde, 0 puntos, explicación visible.

### CP-003: Timer expira
- **Relación**: RF-003, RF-005, ERR-001
- **Precondiciones**: Usuario en sesión de quiz
- **Pasos**: Esperar 30s sin seleccionar opción
- **Resultado**: Opción correcta resaltada. 0 puntos. Explicación visible. Auto-avance tras 2s.

### CP-004: Timer warning y danger states
- **Relación**: RF-003, RNF-003
- **Precondiciones**: Usuario en sesión de quiz
- **Pasos**: Observar timer en t=10s → t=5s
- **Resultado**: A ≤10s: color naranja/warning. A ≤5s: color rojo/danger + animación pulse.

### CP-005: Barra de progreso y contador
- **Relación**: RF-009
- **Precondiciones**: Usuario en sesión de quiz
- **Pasos**: Avanzar por 5 preguntas
- **Resultado**: Barra muestra 50%. Texto: "Pregunta 5 de 10".

### CP-006: Sin tarjetas disponibles
- **Relación**: ERR-004
- **Precondiciones**: Usuario sin tarjetas en sus temas
- **Pasos**: Navegar /review/quiz
- **Resultado**: Redirección a /library con mensaje informativo.

### CP-007: Resumen final con botón
- **Relación**: RF-011
- **Precondiciones**: Sesión de 10 preguntas completada
- **Pasos**: Completar última pregunta
- **Resultado**: Resumen con correctas/incorrectas/puntos. Botón "Ver resultados completos" navega a /results.

### CP-008: submitAnswer falla (offline)
- **Relación**: ERR-002
- **Precondiciones**: Usuario en quiz. Red desconectada.
- **Pasos**: Responder pregunta
- **Resultado**: Toast "Sin conexión". Rollback del score. Sin persistencia.

### CP-009: Puntos correctos por dificultad
- **Relación**: RF-007, RN-008
- **Precondiciones**: Usuario en quiz con tarjetas de distintas dificultades
- **Pasos**: Responder correctamente easy, medium, hard
- **Resultado**: easy=+10pts, medium=+20pts, hard=+30pts.

### CP-010: Opciones barajadas
- **Relación**: RF-015
- **Precondiciones**: Usuario en quiz
- **Pasos**: Revisar orden de opciones en múltiples preguntas
- **Resultado**: La opción correcta aparece en posiciones diferentes cada vez.

### CP-011: Dos preguntas usan la misma tarjeta como distractor
- **Relación**: RF-002
- **Precondiciones**: Pool limitado de tarjetas
- **Pasos**: Avanzar varias preguntas
- **Resultado**: Cada pregunta tiene 4 opciones únicas. Una tarjeta puede ser distractor en múltiples preguntas.

### CP-012: Navegación por teclado
- **Relación**: RNF-008
- **Precondiciones**: Usuario en quiz
- **Pasos**: Tab entre opciones → Enter para seleccionar
- **Resultado**: Opciones enfocables con Tab. Enter selecciona.
