# User Story REV-011: Modo de autoevaluación (flip card)

- **Summary:** Repasar tarjetas volteándolas manualmente para auto-evaluar si se sabía el concepto o no, con animación 3D y timer de 30s

## Use Case:
- **As a** usuario que quiere repasar a su propio ritmo
- **I want to** ver una tarjeta con el concepto, voltearla manualmente con animación 3D para ver la respuesta dentro de 30s, y luego declarar si lo sabía o no
- **so that** pueda autoevaluarme sin opciones múltiples, reforzando mi memoria de forma activa

## Acceptance Criteria:

### Scenario 1: Iniciar sesión de autoevaluación
- **Given** que estoy en la biblioteca de tarjetas
- **and Given** que tengo tarjetas disponibles según mis temas
- **When** selecciono "Modo autoevaluación" e inicio la sesión
- **Then** comienza una sesión de 10 tarjetas seleccionadas aleatoriamente, mostrando el concepto/pregunta de la primera tarjeta con un timer de 30s

### Scenario 2: Voltear la tarjeta manualmente
- **Given** que estoy viendo el concepto de una tarjeta
- **When** hago clic en la tarjeta o en el botón "Voltear"
- **Then** la tarjeta gira con animación 3D mostrando la respuesta/explicación en el reverso

### Scenario 3: Auto-evaluación después de ver la respuesta
- **Given** que he volteado la tarjeta y veo la respuesta
- **When** decido si sabía o no el concepto
- **Then** hago clic en "Lo sabía ✅" (correcta, ganó puntos) o "No lo sabía ❌" (incorrecta, 0 puntos), y veo feedback inmediato con los puntos obtenidos

### Scenario 4: Timer expira antes de voltear
- **Given** que estoy viendo el concepto de una tarjeta
- **and Given** el timer de 30s está corriendo
- **When** el timer llega a 0 sin que haya volteado la tarjeta
- **Then** la tarjeta se voltea automáticamente mostrando la respuesta, y se marca como incorrecta (0 puntos)

### Scenario 5: Progreso y finalización
- **Given** que estoy en una sesión de autoevaluación de 10 tarjetas
- **When** avanzo entre tarjetas
- **Then** veo un contador "Tarjeta X de 10", barra de progreso, y al completar la última veo un resumen rápido con mis resultados y botón "Ver resultados completos"

## Validaciones adicionales
- Animación 3D de flip con perspectiva y rotateY
- Timer de 30s por tarjeta para voltear; si expira, flip automático + incorrecta
- Puntos: easy=5, medium=10, hard=15 si "Lo sabía"; 0 si "No lo sabía" o timeout
- Bonos por racha: 3 correctas seguidas = +5, 5 correctas = +15 (aplica igual que en quiz)
- Sin opciones múltiples: el usuario decide si recordaba o no el concepto
- Feedback inmediato después de cada auto-evaluación

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario active su memoria activa (recall) en lugar de reconocimiento pasivo (multiple choice), lo que mejora la retención a largo plazo (testing effect).

### Behavioral Barriers Removed
- **Fear of being wrong**: El usuario se evalúa a sí mismo, no hay opciones incorrectas visibles
- **Uncertainty aversion**: Flip manual da control al usuario sobre cuándo ver la respuesta
- **Present bias**: Timer de 30s crea urgencia para no posponer el flip

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Testing effect** | El recall activo (recordar sin opciones) mejora retención más que reconocimiento |
| **Pause moments** | Animación 3D de flip crea micro-interacción satisfactoria |
| **Control de usuario** | El usuario decide cuándo voltear y cómo evaluarse |
| **Reducir fricción** | Click en la tarjeta o botón "Voltear" = 1 acción |
| **Present bias** | Timer de 30s evita procrastinación |

### Habit Loop
- **Cue**: Ver el concepto de la tarjeta
- **Routine**: Intentar recordar → voltear → auto-evaluar
- **Reward**: Feedback inmediato + puntos + animación

### Friction Score: 1/10

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`ReviewSession` (mismo bounded context que el quiz — la sesión puede tener múltiples modos)

### Aggregate Root
`Session` — Mismo aggregate root que el modo quiz. El modo (self-assessment | quiz) es un atributo de la sesión.

### Entities
- `Session` — Aggregate root. Propiedades: sessionId, userId, mode (self-assessment | quiz), status, startedAt, completedAt
- `SessionAnswer` — Entity hija. Propiedades: answerId, cardId, selfEvaluated (boolean de lo sabía/no sabía), correct (derived), answeredAt

### Value Objects
- `ReviewMode` — Value object enum (self-assessment | quiz)
- `CardFace` — Value object que representa el estado de la tarjeta (front | back)
- `FlipAnimation` — Value object que controla la animación 3D (duration: 0.4s, transform: rotateY)

### Domain Services
- `PointsCalculatorService` — Reutilizado del contexto Gamification (mismo cálculo de puntos)
- `StreakService` — Reutilizado (misma lógica de bonos)

### Domain Events
- `SessionStarted` — Mismo evento, ahora incluye `mode` en payload
- `AnswerSubmitted` — Mismo evento, incluye `selfEvaluated` como flag
- `SessionCompleted` — Mismo evento

### Aggregate Invariants
- Una sesión tiene un solo modo (self-assessment o quiz), no ambos
- En modo self-assessment: no hay opciones, solo auto-evaluación binaria
- El timer de 30s aplica al flip, no a la respuesta (en quiz es diferente)
- La animación 3D no afecta la lógica de negocio (es puramente UI)
