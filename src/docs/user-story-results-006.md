# User Story RES-006: Resultados de sesión de repaso

- **Summary:** Ver resumen de la sesión con estadísticas, confetti por buen desempeño, y notificación de insignias desbloqueadas

## Use Case:
- **As a** usuario que acaba de completar una sesión de quiz
- **I want to** ver un resumen claro con tarjetas totales, correctas, incorrectas y puntos ganados, con confetti si saqué 80%+, y ser notificado si desbloqueé insignias
- **so that** pueda evaluar mi desempeño y celebrar mis logros

## Acceptance Criteria:

### Scenario 1: Ver resultados después de completar la sesión
- **Given** que he completado una sesión de 10 tarjetas
- **When** soy redirigido a la página de resultados
- **Then** veo: total de tarjetas repasadas, respuestas correctas, respuestas incorrectas y puntos ganados en la sesión

### Scenario 2: Confetti por buen desempeño (80%+)
- **Given** que he completado una sesión de quiz
- **and Given** mi porcentaje de aciertos es 80% o superior
- **When** llego a la pantalla de resultados
- **Then** se reproduce una animación de confetti

### Scenario 3: Sin confetti por desempeño bajo
- **Given** que he completado una sesión de quiz
- **and Given** mi porcentaje de aciertos es menor al 80%
- **When** llego a la pantalla de resultados
- **Then** no hay animación de confetti, solo se muestran las estadísticas

### Scenario 4: Notificación de insignias desbloqueadas
- **Given** que he completado una sesión de quiz
- **and Given** durante la sesión se cumplió la condición para una o más insignias
- **When** llego a la pantalla de resultados
- **Then** veo una notificación indicando qué insignia(s) desbloqueé, con un enlace o botón para ir a la página de insignias y ver el detalle

### Scenario 5: Acciones post-resultados
- **Given** que estoy en la pantalla de resultados
- **When** decido qué hacer a continuación
- **Then** puedo elegir entre "Volver al dashboard" o "Iniciar nuevo repaso"

## Validaciones adicionales
- Stats mostradas: total tarjetas, correctas, incorrectas, puntos de la sesión
- Confetti solo si porcentaje de aciertos >= 80%
- Insignias desbloqueadas: notificación con enlace a `/badges`
- Botones: "Volver al dashboard" → `/dashboard`, "Nuevo repaso" → iniciar sesión de 10 tarjetas

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario celebre su desempeño, se sienta motivado a seguir y decida su próximo paso (otro repaso o ir al dashboard).

### Behavioral Barriers Removed
- **Uncertainty aversion**: Resultados claros y concretos eliminan la duda de "cómo me fue"
- **Fear of failure**: El confetti solo aparece con 80%+, pero la ausencia no es castigo — solo muestra stats objetivas

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Pause moments / Celebration** | Confetti con 80%+ crea un momento de celebración que refuerza positivamente la conducta |
| **Variable rewards** | No saber si habrá confetti (depende del resultado) mantiene el engagement |
| **Loss aversion** | Las insignias desbloqueadas activan loss aversion: "ya tengo esta insignia, no quiero perder mi colección" |
| **Feedback inmediato** | Stats visibles de inmediato sin recargar |
| **Reducir fricción** | Botones claros para la siguiente acción (dashboard o nuevo repaso) |
| **Endowment effect** | Las insignias mostradas generan sensación de propiedad |

### Habit Loop
- **Cue**: Completar sesión de 10 preguntas
- **Routine**: Ver stats + posible confetti + notificación de insignias
- **Reward**: Dopamina por logro + confetti + badge nuevo

### Friction Score: 0/10 (el usuario no hace nada; los resultados se muestran automáticamente)

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`SessionResults` — Gestiona la presentación de resultados al finalizar una sesión de repaso.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Resultados | Resumen de desempeño de una sesión completada |
| Porcentaje de aciertos | Ratio correctas / total * 100 |
| Puntos de sesión | Suma de puntos base + bonos obtenidos en la sesión |

### Aggregate Root
`SessionResult` — Aggregate root que representa los resultados consolidados de una sesión completada. Se construye a partir de las respuestas de la sesión, no se persiste independientemente (es un read model).

### Value Objects
- `Score` — Value object con total, correctas, incorrectas, porcentaje
- `SessionPoints` — Value object que suma puntos base + bonos de la sesión
- `AccuracyPercentage` — Value object que calcula y valida el porcentaje (0-100%)
- `CelebrationThreshold` — Value object que determina si hay confetti (80%+)

### Domain Events
- `ResultsViewed` — Ocurre cuando el usuario ve los resultados. Datos: sessionId, userId, accuracy, timestamp

### Read Model (CQRS)
`SessionResultsReadModel` — Modelo de consulta que agrega datos de la sesión para mostrar en resultados. No modifica el dominio.
- `getSessionResults(sessionId): SessionResultDTO`
  - Incluye: totalCards, correctCount, incorrectCount, accuracy, pointsEarned, newBadges[]

### Domain Services
- `BadgeEvaluationService` — Servicio que evalúa condiciones de insignias al completar la sesión. Se ejecuta como parte del flujo de finalización.
- `ConfettiService` — Servicio que determina si se debe mostrar confetti según el umbral (>=80%)

### Aggregate Invariants
- `accuracy` siempre entre 0 y 100
- `correctCount + incorrectCount = totalCards`
- Las insignias desbloqueadas se determinan DESPUÉS de evaluar todas las respuestas de la sesión
