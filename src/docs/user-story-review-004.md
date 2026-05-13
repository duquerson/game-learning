# User Story REV-004: Modo de repaso tipo quiz

- **Summary:** Poner a prueba conocimientos con un quiz de 10 tarjetas, 4 opciones y límite de 30s por pregunta

## Use Case:
- **As a** usuario registrado que quiere evaluar su conocimiento
- **I want to** realizar una sesión de quiz de 10 tarjetas aleatorias con 4 opciones de respuesta, timer de 30s, y recibir feedback inmediato (color, puntos, explicación)
- **so that** pueda validar lo que sé y aprender de mis errores

## Acceptance Criteria:

### Scenario 1: Iniciar sesión de quiz
- **Given** que estoy en la biblioteca de tarjetas
- **and Given** que tengo tarjetas disponibles según mis temas
- **When** hago clic en "Iniciar repaso" o "Quiz"
- **Then** comienza una sesión de 10 tarjetas seleccionadas aleatoriamente, mostrando la primera pregunta con 4 opciones de respuesta y un timer de 30 segundos

### Scenario 2: Responder correctamente dentro del tiempo
- **Given** que estoy en medio de una sesión de quiz
- **When** selecciono la opción correcta antes de que el timer llegue a 0
- **Then** la opción se marca en verde, veo los puntos ganados según la dificultad (+10, +20 o +30), y se muestra una explicación del concepto

### Scenario 3: Responder incorrectamente
- **Given** que estoy en medio de una sesión de quiz
- **When** selecciono una opción incorrecta o el timer llega a 0
- **Then** la opción incorrecta se marca en rojo, la correcta se resalta en verde, no se ganan puntos, y se muestra la explicación del concepto

### Scenario 4: Progreso durante la sesión
- **Given** que estoy en una sesión de quiz de 10 tarjetas
- **When** avanzo entre preguntas
- **Then** veo un contador "Pregunta X de 10" y una barra de progreso que se actualiza con cada respuesta

### Scenario 5: Finalizar la sesión
- **Given** que he respondido las 10 tarjetas de la sesión
- **When** completo la última pregunta
- **Then** veo un resumen rápido con mis respuestas correctas/incorrectas y puntos obtenidos, junto con un botón "Ver resultados completos"

## Validaciones adicionales
- Cada pregunta tiene exactamente 4 opciones (1 correcta + 3 distractores)
- Timer de 30 segundos por pregunta; al llegar a 0 cuenta como incorrecta
- Orden de tarjetas aleatorio en cada sesión
- Feedback inmediato: color verde/rojo + puntos ganados (o 0) + explicación del concepto
- Los puntos se calculan según dificultad de la tarjeta: easy=10, medium=20, hard=30
- Al terminar: resumen rápido + redirección a página de resultados detallados

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario complete una sesión completa de 10 preguntas respondiendo activamente cada una.

### Behavioral Barriers Removed
- **Present bias**: Timer de 30s crea urgencia y evita posponer la respuesta
- **Uncertainty aversion**: 4 opciones concretas reducen la ansiedad de "no saber por dónde empezar"
- **Fear of failure**: Respuesta incorrecta muestra explicación (aprendizaje, no castigo)

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Pause moments** | Feedback inmediato (color + puntos + explicación) celebra o enseña en el momento |
| **Reducir fricción** | Una pregunta a la vez, sin distracciones |
| **Present bias** | Timer de 30s combate la procrastinación internalizada |
| **Loss aversion** | No ganar puntos por incorrecta vs perder puntos (más motivante que ganar) |
| **Bend not break** | Si fallas, aprendes; no hay penalización más allá de no ganar puntos |

### Habit Loop
- **Cue**: Iniciar sesión desde biblioteca o dashboard
- **Routine**: Responder pregunta → feedback inmediato → siguiente pregunta (x10)
- **Reward**: Puntos + explicación + progreso visible + resumen final

### Friction Score: 1/10 (el mínimo esfuerzo por pregunta es seleccionar una opción)

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`ReviewSession` — Gestiona la creación, ejecución y finalización de sesiones de quiz.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Sesión | Conjunto de 10 tarjetas a repasar en una ronda |
| Quiz | Modo de repaso con opción múltiple |
| Opción | Una de las 4 respuestas posibles por pregunta |
| Distractor | Opción incorrecta generada automáticamente |

### Aggregate Root
`Session` — Aggregate root que orquesta una sesión de repaso de 10 tarjetas. Contiene las respuestas del usuario como entities hijas.

### Entities
- `Session` — Aggregate root. Propiedades: sessionId, userId, status (in-progress | completed), startedAt, completedAt
- `SessionAnswer` — Entity hija dentro de Session. Propiedades: answerId, cardId, selectedOption, correct, answeredAt

### Value Objects
- `SessionId` — UUID de la sesión
- `QuizOption` — Value object que contiene 4 opciones (1 correcta + 3 distractores)
- `Timer` — Value object con duración (30s) y estado (running | expired)
- `ProgressIndicator` — Value object que calcula X/10

### Domain Events
- `SessionStarted` — Ocurre al iniciar una sesión. Datos: sessionId, userId, cardIds[], timestamp
- `AnswerSubmitted` — Ocurre al responder una pregunta. Datos: sessionId, cardId, correct, timestamp
- `SessionCompleted` — Ocurre al terminar las 10 preguntas. Datos: sessionId, userId, correctCount, totalPoints, timestamp

### Domain Services
- `QuizGeneratorService` — Genera 4 opciones por tarjeta (1 correcta + 3 distractores) usando contenido de otras tarjetas
- `TimerService` — Controla el timer de 30s por pregunta

### Repository (Port)
`SessionRepository` — Interfaz en dominio, implementación en infraestructura.
- `findById(sessionId): Session | null`
- `save(session: Session): void`
- `saveAnswer(answer: SessionAnswer): void`

### Aggregate Invariants
- Una sesión tiene exactamente 10 tarjetas
- Cada tarjeta solo puede responderse una vez por sesión
- El timer de 30s es por pregunta, no por sesión
- Si el timer expira, la respuesta se marca como incorrecta automáticamente
