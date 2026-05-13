---
title: RES-006 — Resultados de sesión de repaso
version: 1.0
date_created: 2026-05-13
owner: Equipo MicroLearn
tags: especificación, resultados, confetti, badges, gamification, ddd
---

# RES-006: Resultados de sesión de repaso

## 1. Propósito y Alcance

Pantalla de resultados que se muestra automáticamente al completar una sesión de quiz o autoevaluación. Muestra estadísticas (total, correctas, incorrectas, puntos), animación de confetti condicional (>=80% aciertos), notificación de insignias desbloqueadas, y botones de acción para continuar.

El alcance incluye: extracción del servicio de confetti, página `/results` con datos desde store o fallback por URL params, integración con `BadgeEvaluationService` para mostrar badges nuevos, tracking del evento `ResultsViewed`. Queda fuera del alcance: exportar resultados, compartir en redes sociales, historial de sesiones anteriores.

## 2. Definiciones

| Término | Definición |
|---------|-----------|
| Resultados | Resumen de desempeño de una sesión completada |
| Porcentaje de aciertos | Ratio correctas / total * 100 |
| Confetti | Animación de celebración con canvas-confetti |
| Insignia | Logro desbloqueable que representa un hito |
| Fallback por URL | Mecanismo para restaurar resultados cuando el store se pierde (refresh) |

## 3. User Stories

Ver `src/docs/user-story-results-006.md` — 5 escenarios Gherkin.

## 4. Requerimientos Funcionales

- **RF-001**: El sistema debe mostrar estadísticas al completar sesión: total tarjetas, correctas, incorrectas, puntos ganados
- **RF-002**: El sistema debe calcular y mostrar el porcentaje de aciertos como indicador circular
- **RF-003**: El sistema debe reproducir confetti si el porcentaje de aciertos es >= 80%
- **RF-004**: El sistema debe NO reproducir confetti si el porcentaje de aciertos es < 80%
- **RF-005**: El sistema debe respetar `prefers-reduced-motion` para omitir confetti
- **RF-006**: El sistema debe mostrar insignias desbloqueadas (si las hay) con icono y nombre
- **RF-007**: El sistema debe mostrar un enlace/botón "Ver insignias" que navega a `/badges`
- **RF-008**: El sistema debe mostrar botón "Repasar de nuevo" que inicia una nueva sesión
- **RF-009**: El sistema debe mostrar botón "Volver al Dashboard" que navega a `/dashboard`
- **RF-010**: El sistema debe soportar fallback por URL params (total, correct, percentage, points) cuando el store se pierde por refresh
- **RF-011**: El sistema debe emitir el evento de dominio `ResultsViewed` al renderizar la página

### Puntos de Mejora (vs. User Story y código actual)

| Aspecto | Estado actual | Acción |
|---------|---------------|--------|
| Confetti inline en `onMounted` | Hardcodeado en `ReviewResults.vue` | Extraer a `src/lib/confetti.ts` |
| Enlace a `/badges` | No existe | Agregar badge con link |
| Tracking `ResultsViewed` | No existe | Agregar post a action + evento |
| Animaciones | `animate-fade-in-up` con delays fijos | Mantener. Opcional: stagger unificado |
| Fallback URL params | Ya implementado | OK — sin cambios |

## 5. Requerimientos No Funcionales

- **RNF-001 — Rendimiento**: Confetti no debe bloquear el hilo principal (carga lazy con `await import`)
- **RNF-002 — Rendimiento**: Fallback URL params debe parsearse en < 10ms
- **RNF-003 — UX**: Animaciones escalonadas con delay creciente (100ms, 200ms, 300ms, 400ms)
- **RNF-004 — UX**: Score ring debe usar color semántico (verde >=80%, amarillo >=60%, rojo <60%)
- **RNF-005 — Accesibilidad**: Confetti debe omitirse si `prefers-reduced-motion: reduce`
- **RNF-006 — Accesibilidad**: Botones deben ser navegables por teclado (Tab + Enter)
- **RNF-007 — Consistencia**: Los datos de resultados se toman del store; el fallback por URL es solo para recovery
- **RNF-008 — Seguridad**: No se aceptan datos de resultados de fuentes no confiables

## 6. Restricciones y Reglas de Negocio

- **RN-001**: Confetti solo si porcentaje de aciertos >= 80%
- **RN-002**: Confetti se omite si `prefers-reduced-motion: reduce`
- **RN-003**: `correctCount + incorrectCount = totalCards` (invariante)
- **RN-004**: Las insignias desbloqueadas se muestran solo si existen en `sessionCompleteResult.newBadges`
- **RN-005**: Los botones de acción son mutuamente excluyentes (elegir uno)
- **RN-006**: El store persiste durante la navegación; el fallback URL solo aplica en refresh
- **CON-001**: Stack existente: Astro 5 + Vue 3 + Pinia + TailwindCSS v4 + Supabase + Vercel
- **CON-002**: `canvas-confetti` es dependencia existente en el proyecto
- **CON-003**: `ReviewResults.vue` existe en `src/components/cards/ReviewResults.vue`
- **CON-004**: `useReviewStore` expone `sessionResults`, `sessionPoints`, `sessionCompleteResult`

## 7. Contratos de Interfaz

```typescript
// ─── Value Objects ───────────────────────────────────────────────

interface AccuracyPercentage {
  readonly value: number  // 0-100
}

interface CelebrationThreshold {
  readonly value: number  // default 80
  isMet(accuracy: number): boolean
}

interface SessionPoints {
  readonly base: number
  readonly bonus: number
  readonly total: number
}

interface Score {
  readonly total: number
  readonly correct: number
  readonly incorrect: number
  readonly accuracy: AccuracyPercentage
  readonly points: SessionPoints
}

// ─── Domain Events ───────────────────────────────────────────────

interface ResultsViewedEvent {
  type: 'ResultsViewed'
  sessionId: string
  userId: string
  accuracy: number
  timestamp: string  // ISO 8601
  newBadgeCount: number
}

// ─── Read Model ───────────────────────────────────────────────────

interface SessionResultsReadModel {
  getSessionResults(sessionId: string): Promise<{
    totalCards: number
    correctCount: number
    incorrectCount: number
    accuracy: number
    pointsEarned: number
    newBadges: Badge[]
  }>
}

// ─── Domain Services ──────────────────────────────────────────────

interface ConfettiService {
  shouldCelebrate(accuracy: number, threshold?: number): boolean
  fireBasic(particleCount?: number, spread?: number, origin?: { x?: number; y?: number }): void
  fireDoubleBurst(): void
}

interface BadgeEvaluationService {
  evaluate(
    context: BadgeConditionContext,
    unlockedBadgeIds: string[],
    allBadges: Badge[]
  ): Badge[]
}

// ─── Component Props ──────────────────────────────────────────────

// ReviewResults.vue — computed desde store
interface ReviewResultsComputed {
  total: number
  correct: number
  incorrect: number
  percentage: number
  points: number
  newBadges: Badge[]
  performanceMessage: string
  hasConfetti: boolean
  hasBadges: boolean
}

// ─── URL Fallback Params ──────────────────────────────────────────

interface ResultsUrlParams {
  total?: number
  correct?: number
  percentage?: number
  points?: number
}

// ─── API Contract ─────────────────────────────────────────────────

// POST /actions/review.submitResultsViewed (tracking)
interface SubmitResultsViewedRequest {
  sessionId: string
  accuracy: number
  newBadgeCount: number
}

interface SubmitResultsViewedResponse {
  success: true
}
```

## 8. Escenarios de Error

| Código | Escenario | Respuesta |
|--------|-----------|-----------|
| ERR-001 | Store vacío y sin URL params | Mostrar mensaje "No hay resultados disponibles". Botón para volver a /review. |
| ERR-002 | Fallback URL params inválidos (NaN) | Ignorar params, mostrar 0 en todas las métricas. |
| ERR-003 | `canvas-confetti` falla al cargar | Catch silencioso. No interrumpe la UI. Se omite confetti. |
| ERR-004 | `ResultsViewed` tracking falla | Catch silencioso. No interrumpe la experiencia. |
| ERR-005 | Sesión con 0 tarjetas | Mostrar total=0, correct=0, incorrect=0. Sin confetti. Sin insignias. |
| ERR-006 | `newBadges` es null/undefined | Mostrar sección de badges vacía sin errores. |

## 9. Criterios de Aceptación Globales

- **AC-001**: Dado que completo una sesión de 10 tarjetas, Cuando llego a resultados, Entonces veo total=10, correctas=N, incorrectas=10-N, puntos ganados
- **AC-002**: Dado que tengo >=80% de aciertos, Cuando llego a resultados, Entonces veo animación de confetti (a menos que `prefers-reduced-motion`)
- **AC-003**: Dado que tengo <80% de aciertos, Cuando llego a resultados, Entonces NO veo confetti
- **AC-004**: Dado que desbloqueé insignias en la sesión, Cuando llego a resultados, Entonces veo las insignias listadas con icono y nombre + enlace a /badges
- **AC-005**: Dado que estoy en resultados, Cuando elijo "Repasar de nuevo", Entonces se inicia una nueva sesión
- **AC-006**: Dado que estoy en resultados, Cuando elijo "Volver al Dashboard", Entonces navego a /dashboard

## 10. KPIs y Métricas de Éxito

| KPI | Target | Medición |
|-----|--------|----------|
| Tasa de clic en "Repasar de nuevo" | > 40% | Event tracking en ResultsViewed |
| Tasa de clic en "Ver insignias" | > 25% | De usuarios que ven nuevas insignias |
| Tasa de clic en "Volver al Dashboard" | < 60% | Complementario a "Repasar de nuevo" |
| Tasa de refresco con fallback URL | < 5% | % de visits a /results con URL params activos |
| Confetti visto (>=80%) | > 90% | % de usuarios elegibles que ven confetti efectivamente |
| NPS de la pantalla de resultados | > 60 | Encuesta trimestral "¿Los resultados te motivan a seguir?" |

## 11. Dependencias y Supuestos

- **DEP-001**: `useReviewStore` existente con `sessionResults`, `sessionPoints`, `sessionCompleteResult`
- **DEP-002**: `canvas-confetti` instalado en `package.json`
- **DEP-003**: `ReviewResults.vue` existente en `src/components/cards/ReviewResults.vue`
- **DEP-004**: `CompleteSessionResult` type existente en `src/types/app.ts`
- **DEP-005**: `Badge` type existente en `src/types/app.ts`
- **DEP-006**: Acción `review.completeSession` existente con respuesta `{ newBadges, updatedStats }`
- **SUP-001**: La navegación a `/results` ocurre inmediatamente después de `completeSession`
- **SUP-002**: `sessionCompleteResult` se setea antes de navegar a `/results`
- **SUP-003**: El usuario siempre viene de una sesión completada (no acceso directo a /results)

## 12. Casos de Prueba

### CP-001: Resultados completos post-sesión
- **Relación**: RF-001, RF-002, AC-001
- **Precondiciones**: Sesión de 10 tarjetas completada. Store poblado.
- **Pasos**: Navegar a /results
- **Resultado**: Score ring con porcentaje. Stats row: total 10, correctas N, incorrectas 10-N. Puntos ganados.

### CP-002: Confetti con 80%+
- **Relación**: RF-003, AC-002
- **Precondiciones**: Sesión con >=80% aciertos. `prefers-reduced-motion: no-preference`.
- **Pasos**: Llegar a /results
- **Resultado**: canvas-confetti se dispara. Doble burst (central + lateral).

### CP-003: Sin confetti con <80%
- **Relación**: RF-004, AC-003
- **Precondiciones**: Sesión con <80% aciertos.
- **Pasos**: Llegar a /results
- **Resultado**: No hay confetti. Solo se muestran estadísticas.

### CP-004: Confetti respeta prefers-reduced-motion
- **Relación**: RF-005, RNF-005
- **Precondiciones**: Sesión con >=80%. `prefers-reduced-motion: reduce`.
- **Pasos**: Llegar a /results
- **Resultado**: No hay confetti.

### CP-005: Insignias desbloqueadas visibles
- **Relación**: RF-006, RF-007, AC-004
- **Precondiciones**: Sesión que cumple condición de >=1 insignia nueva.
- **Pasos**: Llegar a /results
- **Resultado**: Sección "Nuevas insignias" con chips. Cada chip: icono + nombre. Link a /badges.

### CP-006: Sin insignias desbloqueadas
- **Relación**: RN-004
- **Precondiciones**: Sesión sin nuevas insignias.
- **Pasos**: Llegar a /results
- **Resultado**: No hay sección de insignias.

### CP-007: Botón "Repasar de nuevo"
- **Relación**: RF-008, AC-005
- **Precondiciones**: Store con deck previo.
- **Pasos**: Clic en "Repasar de nuevo"
- **Resultado**: Store reinicia sesión. Navega a /review/{mode}.

### CP-008: Botón "Volver al Dashboard"
- **Relación**: RF-009, AC-006
- **Precondiciones**: En /results.
- **Pasos**: Clic en "Volver al Dashboard"
- **Resultado**: Navega a /dashboard.

### CP-009: Fallback por URL params
- **Relación**: RF-010, ERR-001
- **Precondiciones**: Sin store. URL: /results?total=10&correct=8&percentage=80&points=150
- **Pasos**: Navegar directamente a /results con params
- **Resultado**: Score ring 80%. Stats: total 10, correct 8, incorrect 2. Puntos 150.

### CP-010: Fallback inválido (NaN)
- **Relación**: ERR-002
- **Precondiciones**: Sin store. URL: /results?total=abc
- **Pasos**: Navegar a /results con params inválidos
- **Resultado**: Stats muestran 0. Sin errores visibles.

### CP-011: Sesión de 0 tarjetas
- **Relación**: ERR-005
- **Precondiciones**: Store vacío (deck.length = 0).
- **Pasos**: Navegar a /results
- **Resultado**: Score ring 0%. Stats: 0/0/0. Mensaje "¡Sigue practicando!".

### CP-012: Tracking ResultsViewed
- **Relación**: RF-011
- **Precondiciones**: Store poblado. Usuario autenticado.
- **Pasos**: Llegar a /results
- **Resultado**: Se emite evento `ResultsViewed` con sessionId, accuracy, newBadgeCount.
