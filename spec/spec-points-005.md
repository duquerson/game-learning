---
title: PTS-005 — Sistema de Puntos y Racha Diaria
version: 1.0
date_created: 2026-05-13
owner: Equipo de Producto — MicroLearn
tags: especificación, puntos, racha, gamification, behavioral-design, ddd
---

# PTS-005: Sistema de Puntos y Racha Diaria

## 1. Propósito y Alcance

Sistema de gamificación que otorga puntos por respuestas correctas en quizzes (5/10/15 según dificultad), bonificaciones por rachas de aciertos en sesión (3 y 5 consecutivas), y una racha diaria de estudio que fomenta la consistencia. Los puntos y la racha son visibles globalmente desde el header y en detalle desde el dashboard.

El alcance incluye: cálculo de puntos y bonos, persistencia en `user_stats`, visualización en header y dashboard, y reinicio de racha diaria por inactividad. Queda fuera del alcance: tabla de líderes, logros/badges (badge system existe por separado), notificaciones push por racha perdida, y gamificación social.

## 2. Definiciones

| Término | Definición |
|---------|-----------|
| Puntos base | Puntos otorgados por respuesta correcta según dificultad: easy=5, medium=10, hard=15 |
| Bono de racha | Puntos extra por alcanzar 3 (+5) o 5 (+15) respuestas correctas consecutivas en una sesión |
| Racha de sesión | Número de respuestas correctas consecutivas dentro de una misma sesión de quiz |
| Racha diaria | Días calendario consecutivos con al menos un repaso completado |
| Racha máxima | Mayor racha diaria alcanzada históricamente por el usuario (nunca decrece) |
| Día calendario | Fecha sin hora (DATE en Postgres). Un repaso en cualquier hora del día cuenta para ese día |

## 3. User Stories

### US-001: Ganar puntos por respuesta correcta
- **Resumen**: Puntos según dificultad de la tarjeta respondida correctamente
- **Persona**: Estudiante de MicroLearn
- **Como** estudiante **quiero** ganar puntos por cada respuesta correcta **para** sentir progreso inmediato
- **Escenario:** Respuesta correcta en quiz
- **Dado** que estoy en una sesión de quiz
- **Cuando** respondo correctamente una tarjeta
- **Entonces** gano puntos según su dificultad: easy=+5, medium=+10, hard=+15

### US-002: Respuesta incorrecta no otorga puntos
- **Resumen**: Cero puntos cuando se falla o se acaba el tiempo
- **Persona**: Estudiante de MicroLearn
- **Como** estudiante **quiero** que solo las correctas sumen puntos **para** que el sistema sea justo
- **Escenario:** Respuesta incorrecta
- **Dado** que estoy en una sesión de quiz
- **Cuando** respondo incorrectamente o se acaba el tiempo
- **Entonces** no gano puntos por esa tarjeta

### US-003: Bono por racha de 3 correctas seguidas
- **Resumen**: +5 puntos extra al alcanzar 3 aciertos consecutivos
- **Persona**: Estudiante de MicroLearn
- **Como** estudiante **quiero** un bonus al encadenar 3 correctas **para** sentirme recompensado por mi concentración
- **Escenario:** Racha de 3 alcanzada
- **Dado** que he respondido correctamente 3 tarjetas consecutivas
- **Cuando** respondo correctamente la tercera
- **Entonces** además de los puntos base (5/10/15), recibo un bono de +5 puntos

### US-004: Bono por racha de 5 correctas seguidas
- **Resumen**: +15 puntos extra al alcanzar 5 aciertos consecutivos
- **Persona**: Estudiante de MicroLearn
- **Como** estudiante **quiero** un bonus mayor al encadenar 5 correctas **para** sentir que el esfuerzo prolongado vale la pena
- **Escenario:** Racha de 5 alcanzada
- **Dado** que he respondido correctamente 5 tarjetas consecutivas
- **Cuando** respondo correctamente la quinta
- **Entonces** además de los puntos base (5/10/15), recibo un bono de +15 puntos

### US-005: Racha diaria continúa al estudiar un día consecutivo
- **Resumen**: La racha diaria se incrementa si se estudia al día siguiente
- **Persona**: Estudiante de MicroLearn
- **Como** estudiante **quiero** que mi racha diaria crezca cuando estudio días seguidos **para** sentir consistencia
- **Escenario:** Estudio dos días consecutivos
- **Dado** que estudié ayer (tengo al menos un repaso registrado)
- **Cuando** completo al menos un repaso hoy
- **Entonces** mi racha diaria aumenta en 1 y se guarda la fecha de hoy como `last_study_date`

### US-006: Racha diaria se pierde al saltarse un día
- **Resumen**: La racha actual se resetea a 1 si hay un gap > 1 día
- **Persona**: Estudiante de MicroLearn
- **Como** estudiante **quiero** que mi racha se reinicie si falto un día **para** que el sistema sea honesto
- **Escenario:** Gap de 2+ días
- **Dado** que mi última fecha de estudio fue hace 2 o más días
- **Cuando** regreso a estudiar
- **Entonces** mi racha actual se resetea a 1, pero mi racha máxima histórica se conserva

### US-007: Puntos y racha visibles globalmente
- **Resumen**: Puntos totales y racha actual siempre visibles en header + detalle en dashboard
- **Persona**: Estudiante de MicroLearn
- **Como** estudiante **quiero** ver mis puntos y racha en el header siempre **para** tener feedback constante de mi progreso
- **Escenario:** Navegación entre páginas
- **Dado** que estoy usando la aplicación
- **Cuando** navego entre páginas
- **Entonces** veo mis puntos totales y racha actual siempre visibles en el header global, y en detalle en el dashboard

## 4. Requerimientos Funcionales

- **RF-001**: El sistema debe otorgar puntos base según dificultad solo cuando la respuesta es correcta: easy=5, medium=10, hard=15
- **RF-002**: El sistema debe reiniciar el contador de racha de sesión al recibir una respuesta incorrecta o timeout
- **RF-003**: El sistema debe otorgar bono de +5 puntos al alcanzar 3 respuestas correctas consecutivas en una sesión
- **RF-004**: El sistema debe otorgar bono de +15 puntos al alcanzar 5 respuestas correctas consecutivas en una sesión
- **RF-005**: El sistema debe aplicar bonos de forma acumulativa (ej: en la 5ta correcta se reciben puntos base + bono de 5 + bono de 15)
- **RF-006**: El sistema debe mantener un contador de racha de sesión independiente por sesión de quiz
- **RF-007**: El sistema debe actualizar la racha diaria al completar una sesión de estudio
- **RF-008**: El sistema debe incrementar la racha diaria en 1 si la última fecha de estudio fue ayer (diferencia de 1 día)
- **RF-009**: El sistema debe resetear la racha diaria a 1 si la última fecha de estudio es anterior a ayer (gap >= 2 días)
- **RF-010**: El sistema debe mantener la racha diaria sin cambios si el usuario ya estudió hoy (misma fecha)
- **RF-011**: El sistema debe actualizar `longest_streak` si la racha actual supera el máximo histórico
- **RF-012**: El sistema debe preservar `longest_streak` aunque la racha actual se reinicie
- **RF-013**: El sistema debe mostrar puntos totales y racha actual en el header global en todas las páginas
- **RF-014**: El sistema debe mostrar detalle de puntos, racha actual, racha máxima y últimas actividades en el dashboard
- **RF-015**: El sistema debe crear automáticamente `user_stats` con valores en 0 al registrarse un nuevo usuario

## 5. Requerimientos No Funcionales

- **RNF-001 — Rendimiento**: Cálculo de puntos y bonos debe ejecutarse en < 50ms (operación en memoria, sin I/O)
- **RNF-002 — Rendimiento**: Consulta de `user_stats` para el header debe cargar en < 100ms p95
- **RNF-003 — Rendimiento**: Actualización de `user_stats` tras respuesta debe completarse en < 200ms
- **RNF-004 — Consistencia**: La actualización de `total_points` debe ser atómica (evitar race conditions entre respuestas simultáneas)
- **RNF-005 — Consistencia**: `longest_streak` debe ser monotónico: nunca decrece bajo ninguna condición
- **RNF-006 — Consistencia**: `total_points` nunca decrementa (no hay operaciones de gasto de puntos)
- **RNF-007 — Disponibilidad**: Si Supabase falla, el quiz debe continuar offline y los puntos se sincronizan al reconectar
- **RNF-008 — Seguridad**: RLS policies deben impedir que un usuario modifique `user_stats` de otro
- **RNF-009 — Precisión**: La racha diaria se calcula sobre DATE (sin hora), no sobre TIMESTAMP

## 6. Restricciones y Reglas de Negocio

- **RN-001**: Puntos solo por respuesta correcta. Incorrecta o timeout = 0 puntos para esa tarjeta
- **RN-002**: Bonos de racha de sesión se otorgan en el momento exacto de alcanzar el hito (3 o 5)
- **RN-003**: Bonos son acumulativos: en la 5ta correcta se reciben puntos base + bono-3 + bono-5
- **RN-004**: Si la racha de sesión llega a 6+, seguir aplicando bono de +5 cada 3 correctas adicionales (6, 9, 12...)
- **RN-005**: La racha de sesión se reinicia al fallar o al terminar la sesión
- **RN-006**: La racha diaria requiere al menos 1 repaso completado en el día calendario
- **RN-007**: La racha diaria se calcula al completar la sesión (no al responder cada tarjeta)
- **RN-008**: `longest_streak` solo se actualiza si `current_streak > longest_streak`
- **RN-009**: `user_stats` se crea con valores iniciales: total_points=0, current_streak=0, longest_streak=0, last_study_date=null
- **CON-001**: Stack fijo: Astro 5 + Vue 3 + Pinia + TailwindCSS v4 + Supabase + Vercel
- **CON-002**: Puntos y racha se persisten en tabla `user_stats` de Supabase
- **CON-003**: Cálculo de puntos es puramente en cliente/lambda, sin triggers de base de datos

## 7. Contratos de Interfaz

```typescript
// ─── Value Objects ───────────────────────────────────────────────

type DifficultyPoints = 5 | 10 | 15

interface Points {
  readonly base: number
  readonly bonus: number
  readonly total: number
}

interface StreakCount {
  readonly value: number
}

interface DateOnly {
  readonly iso: string // format: "YYYY-MM-DD"
}

// ─── Domain Entities ─────────────────────────────────────────────

interface UserStats {
  userId: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null // ISO date "YYYY-MM-DD"
}

interface SessionStreak {
  correctCount: number
  lastBonusAt: number // último hito de bono alcanzado (3 o 5)
}

// ─── Domain Services ─────────────────────────────────────────────

interface PointsCalculatorService {
  calculateBase(difficulty: Difficulty): DifficultyPoints
  calculateStreakBonus(correctStreak: number): number
  calculateTotal(difficulty: Difficulty, correct: boolean, correctStreak: number): Points
}

interface StreakService {
  updateStreak(state: StreakState, today: string): StreakState
  isStreakBroken(lastDate: string | null, today: string): boolean
}

// ─── Repository Port ─────────────────────────────────────────────

interface UserStatsRepository {
  findByUserId(userId: string): Promise<UserStats | null>
  save(stats: UserStats): Promise<void>
  updatePoints(userId: string, increment: number): Promise<void>
  updateStreak(userId: string, streak: number, longest: number, lastDate: string): Promise<void>
}

// ─── API Contracts ───────────────────────────────────────────────

// POST /actions/review.submitAnswer
interface SubmitAnswerRequest {
  cardId: string
  sessionId: string
  correct: boolean
  difficulty: Difficulty
}

interface SubmitAnswerResponse {
  pointsEarned: number
  newTotal: number
  streakBonus: number
  correctStreak: number
  sessionId: string
}

// POST /actions/review.completeSession
interface CompleteSessionRequest {
  sessionId: string
  results: Array<{
    cardId: string
    correct: boolean
    difficulty: Difficulty
  }>
}

interface CompleteSessionResponse {
  updatedStats: UserStats
}

// GET /api/user/stats
interface GetUserStatsResponse {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null
}

// ─── Error Types ─────────────────────────────────────────────────

type PointsErrorCode =
  | 'POINTS_NEGATIVE_TOTAL'      // total_points no puede ser negativo
  | 'POINTS_STREAK_BROKEN'       // racha de sesión reseteada por respuesta incorrecta
  | 'STREAK_INVALID_DATE'        // fecha inválida para last_study_date
  | 'STREAK_MONOTONIC_VIOLATION' // longest_streak intentó decrecer
  | 'STATS_NOT_FOUND'            // user_stats no encontrado para el usuario

interface PointsError {
  code: PointsErrorCode
  message: string
  details?: Record<string, unknown>
}
```

## 8. Escenarios de Error

- **ERR-001**: Respuesta incorrecta → No se otorgan puntos. Contador de racha de sesión se reinicia a 0.
- **ERR-002**: DB timeout al consultar `user_stats` → Retry 3 veces con backoff. Si persiste, error 503.
- **ERR-003**: `user_stats` no existe → Se crea automáticamente con valores por defecto (RFC-015).
- **ERR-004**: Fecha inválida en `last_study_date` → Se ignora y se fuerza cálculo como "sin registro previo".
- **ERR-005**: Sesión terminada sin respuestas → No se actualiza racha diaria ni puntos.
- **ERR-006**: Intento de gastar puntos → Operación denegada (no existe endpoint de gasto).
- **ERR-007**: Race condition en actualización paralela → Usar `.select()` + recálculo en servidor para atomicidad.

## 9. Criterios de Aceptación Globales

- **AC-001**: Dado una respuesta correcta de cualquier dificultad, Cuando se procesa, Entonces se suman los puntos base correspondientes
- **AC-002**: Dado una respuesta incorrecta, Cuando se procesa, Entonces no se suman puntos y la racha de sesión se reinicia
- **AC-003**: Dado que se alcanzan 3 correctas consecutivas, Cuando se procesa la tercera, Entonces se otorgan +5 bonus además de puntos base
- **AC-004**: Dado que se alcanzan 5 correctas consecutivas, Cuando se procesa la quinta, Entonces se otorgan +15 bonus (acumulativo con bonus de 3)
- **AC-005**: Dado que el usuario tiene last_study_date = ayer, Cuando completa una sesión hoy, Entonces current_streak se incrementa en 1
- **AC-006**: Dado que last_study_date es de hace 2+ días, Cuando completa una sesión, Entonces current_streak = 1
- **AC-007**: Dado que el usuario ya estudió hoy, Cuando completa otra sesión, Entonces current_streak no cambia
- **AC-008**: Dado que current_streak supera longest_streak, Cuando se actualiza, Entonces longest_streak se incrementa también
- **AC-009**: Dado que el usuario está logueado, Cuando navega a cualquier página, Entonces ve puntos y racha en el header

## 10. KPIs y Métricas de Éxito

| KPI | Target | Medición |
|-----|--------|----------|
| Tasa de retención D7 | > 40% | Cohorte semanal de usuarios con racha >= 7 días |
| Tasa de retención D30 | > 20% | Cohorte mensual de usuarios con racha >= 30 días |
| Respuestas por sesión | > 10 avg | Promedio de tarjetas respondidas por sesión |
| Ratio de aciertos | > 70% | Correctas / total en sesión |
| Usuarios con racha >= 7 | > 25% | % de usuarios activos con current_streak >= 7 |
| Puntos promedio por sesión | > 50 | Suma de puntos base + bonos por sesión completada |
| Tasa de recuperación post-fallo | > 60% | % de usuarios que vuelven a estudiar dentro de 48h tras perder racha |

## 11. Dependencias y Supuestos

- **DEP-001**: Tabla `user_stats` existente en Supabase con columnas: user_id, total_points, current_streak, longest_streak, last_study_date
- **DEP-002**: Función `calculatePoints` y `calculateStreakBonus` existentes en `src/lib/points.ts`
- **DEP-003**: Función `updateStreak` existente en `src/lib/streak.ts`
- **DEP-004**: Acción `review.submitAnswer` existente en `src/actions/index.ts`
- **DEP-005**: Acción `review.completeSession` existente en `src/actions/index.ts`
- **DEP-006**: Tipos `UserStats`, `SubmitAnswerResult` existentes en `src/types/app.ts`
- **DEP-007**: Tipos `user_stats` Row/Insert/Update existentes en `src/types/database.ts`
- **SUP-001**: Usuario siempre autenticado (JWT válido) al interactuar con el sistema de puntos
- **SUP-002**: No hay concurrencia real (un solo dispositivo por usuario a la vez)
- **SUP-003**: La latencia de Supabase es < 100ms p95 en la región del deploy

## 12. Casos de Prueba

### CP-001: Puntos base por dificultad
- **Relación**: US-001, RF-001
- **Precondiciones**: Usuario logueado. Sesión activa.
- **Pasos**: Responder correctamente easy → Responder correctamente medium → Responder correctamente hard
- **Resultado**: +5, +10, +15 puntos respectivamente.

### CP-002: Bono por racha de 3
- **Relación**: US-003, RF-003
- **Precondiciones**: Usuario logueado. 2 correctas previas en la sesión.
- **Pasos**: Responder correctamente la 3ra tarjeta
- **Resultado**: Puntos base + 5 bonus. Toast "🔥 ¡Racha de 3! +5 puntos bonus".

### CP-003: Bono por racha de 5 (acumulativo)
- **Relación**: US-004, RF-004, RF-005
- **Precondiciones**: Usuario logueado. 4 correctas previas en la sesión.
- **Pasos**: Responder correctamente la 5ta tarjeta
- **Resultado**: Puntos base + 5 bonus (de 3) + 15 bonus (de 5). Toast con bonus total.

### CP-004: Reinicio de racha al fallar
- **Relación**: US-002, RF-002
- **Precondiciones**: Usuario con 3 correctas consecutivas en sesión.
- **Pasos**: Responder incorrectamente la 4ta tarjeta
- **Resultado**: 0 puntos. Contador de racha de sesión = 0.

### CP-005: Incremento de racha diaria
- **Relación**: US-005, RF-007, RF-008
- **Precondiciones**: `last_study_date = yesterday`. `current_streak = 5`.
- **Pasos**: Completar sesión con al menos 1 repaso
- **Resultado**: `current_streak = 6`. `last_study_date = today`.

### CP-006: Reinicio de racha diaria por inactividad
- **Relación**: US-006, RF-009
- **Precondiciones**: `last_study_date = 3 days ago`. `current_streak = 5`. `longest_streak = 5`.
- **Pasos**: Completar sesión
- **Resultado**: `current_streak = 1`. `longest_streak = 5`. `last_study_date = today`.

### CP-007: Misma fecha no duplica racha
- **Relación**: RF-010
- **Precondiciones**: `last_study_date = today`. `current_streak = 5`.
- **Pasos**: Completar otra sesión hoy
- **Resultado**: `current_streak` sigue siendo 5.

### CP-008: longest_streak monotónico
- **Relación**: RF-011, RF-012
- **Precondiciones**: `longest_streak = 10`. `current_streak = 5`. Se pierde racha.
- **Pasos**: No estudiar por 2+ días → Completar sesión
- **Resultado**: `current_streak = 1`. `longest_streak = 10`.

### CP-009: Header muestra puntos y racha
- **Relación**: US-007, RF-013
- **Precondiciones**: Usuario logueado con puntos y racha > 0.
- **Pasos**: Navegar a /dashboard → /quiz → /profile
- **Resultado**: En todas las páginas se ve "🔥 5 días" y "🏆 150 pts" en header.

### CP-010: Dashboard muestra detalle
- **Relación**: US-007, RF-014
- **Precondiciones**: Usuario logueado con datos históricos.
- **Pasos**: Navegar a /dashboard
- **Resultado**: Se ve total_points, current_streak, longest_streak, last_study_date.

### CP-011: user_stats se crea al registrar usuario
- **Relación**: RF-015
- **Precondiciones**: Usuario nuevo, sin registro en user_stats.
- **Pasos**: Completar onboarding → Primera sesión de quiz
- **Resultado**: user_stats creado con total_points=0, current_streak=0, longest_streak=0, last_study_date=null.

### CP-012: Bono cada 3 adicionales (6, 9, 12...)
- **Relación**: RN-004
- **Precondiciones**: Usuario con 5 correctas seguidas (ya recibió bonus de 3 y 5).
- **Pasos**: Responder correctamente la 6ta, 9na, 12da
- **Resultado**: +5 bonus adicional en cada hito.
