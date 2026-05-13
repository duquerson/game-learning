# User Story PTS-005: Sistema de puntos y racha diaria

- **Summary:** Ganar puntos por respuestas correctas con bonificaciones por racha en sesión y mantener racha diaria de estudio

## Use Case:
- **As a** usuario que estudia con MicroLearn
- **I want to** ganar puntos por cada respuesta correcta (5/10/15 según dificultad), recibir bonos por rachas de aciertos en sesión, y mantener una racha diaria de estudio
- **so that** pueda medir mi progreso y mantenerme motivado a estudiar consistentemente

## Acceptance Criteria:

### Scenario 1: Ganar puntos por respuesta correcta
- **Given** que estoy en una sesión de quiz
- **When** respondo correctamente una tarjeta
- **Then** gano puntos según su dificultad: easy=+5, medium=+10, hard=+15

### Scenario 2: No ganar puntos por respuesta incorrecta
- **Given** que estoy en una sesión de quiz
- **When** respondo incorrectamente o se acaba el tiempo
- **Then** no gano puntos por esa tarjeta

### Scenario 3: Bono por racha de 3 correctas seguidas
- **Given** que estoy en una sesión de quiz
- **and Given** que he respondido correctamente 3 tarjetas consecutivas
- **When** respondo correctamente la tercera
- **Then** además de los puntos base, recibo un bono de +5 puntos

### Scenario 4: Bono por racha de 5 correctas seguidas
- **Given** que estoy en una sesión de quiz
- **and Given** que he respondido correctamente 5 tarjetas consecutivas
- **When** respondo correctamente la quinta
- **Then** además de los puntos base, recibo un bono de +15 puntos

### Scenario 5: Racha diaria continúa al estudiar un día consecutivo
- **Given** que estudié ayer (tengo al menos un repaso registrado)
- **When** completo al menos un repaso hoy
- **Then** mi racha diaria aumenta en 1 y se guarda la fecha de hoy como `last_study_date`

### Scenario 6: Racha diaria se pierde al saltarse un día
- **Given** que mi última fecha de estudio fue hace 2 o más días
- **When** regreso a estudiar
- **Then** mi racha actual se resetea a 1, pero mi racha máxima histórica se conserva

### Scenario 7: Puntos y racha visibles globalmente
- **Given** que estoy usando la aplicación
- **When** navego entre páginas
- **Then** veo mis puntos totales y racha actual siempre visibles en el header global, y en detalle en el dashboard

## Validaciones adicionales
- Puntos base: easy=5, medium=10, hard=15 (solo si correcta)
- Bonos: 3 correctas seguidas = +5, 5 correctas seguidas = +15 (acumulables)
- Los bonos se calculan por sesión; al fallar se reinicia el contador de racha de la sesión
- Racha diaria: requiere al menos 1 repaso por día calendario
- Racha máxima histórica: nunca disminuye, solo se actualiza si la actual la supera
- `last_study_date`, `current_streak` y `longest_streak` persistidos en `user_stats`

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario estudie de forma consistente (a diario) y se esfuerce por mantener rachas de respuestas correctas.

### Behavioral Barriers Removed
- **Present bias**: Puntos inmediatos por cada respuesta correcta dan recompensa presente por un beneficio futuro (aprender)
- **Status quo effect**: La racha diaria crea inercia; una vez que tienes 3+ días, dejarlo duele más que continuar

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Loss aversion** | Perder la racha duele más que ganar puntos. Como dice Jackson Shuttleworth: "Once you hit 7 days, loss aversion kicks in" |
| **Variable rewards** | Los bonos por racha (3 y 5 correctas) son recompensas impredecibles que mantienen engagement |
| **Endowment effect** | El usuario "posee" su racha actual; perderla se siente como una pérdida |
| **Present bias** | Puntos inmediatos vs racha de largo plazo cubren ambos horizontes temporales |
| **Defaults** | La racha empieza en 0 automáticamente; no requiere configuración |

### Habit Loop
- **Cue**: Ver la racha en el header/dashboard
- **Routine**: Hacer una sesión de quiz para mantenerla
- **Reward**: Puntos + racha incrementada + bonos

### Loss Aversion Trigger
Día 7 es el punto de inflexión: perder una racha de 7+ días es más doloroso que el placer de mantenerla, lo que convierte el estudio en un hábito autosostenido.

### Friction Score: 0/10 (los puntos y racha son automáticos, sin acción extra del usuario)

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`Gamification` — Gestiona el sistema de puntos y rachas que motivan y miden el progreso del usuario.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Puntos | Unidad de medida del progreso acumulado |
| Racha diaria | Días consecutivos con al menos un repaso |
| Racha de sesión | Respuestas correctas consecutivas dentro de una sesión |
| Bono | Puntos extra por lograr hitos de racha en sesión |
| Racha máxima | Mayor racha diaria alcanzada históricamente |

### Aggregate Root
`UserStats` — Aggregate root que contiene todas las métricas de gamificación del usuario. Propiedades: totalPoints, currentStreak, longestStreak, lastStudyDate.

### Value Objects
- `Points` — Value object inmutable que representa puntos acumulados (nunca negativo)
- `StreakCount` — Value object para número de días/repeticiones consecutivas
- `DateOnly` — Value object para fecha sin hora (used for lastStudyDate)
- `DifficultyPoints` — Value object que mapea (dificultad, correct) → puntos (easy=5, medium=10, hard=15, incorrect=0)
- `StreakBonus` — Value object que calcula bonos: (3→+5, 5→+15)

### Domain Events
- `PointsAwarded` — Ocurre cuando se otorgan puntos. Datos: userId, cardId, basePoints, bonusPoints, totalAwarded, timestamp
- `StreakUpdated` — Ocurre cuando la racha diaria cambia. Datos: userId, previousStreak, newStreak, longestStreak, timestamp
- `StreakBroken` — Ocurre cuando la racha se pierde por inactividad. Datos: userId, previousStreak, timestamp

### Domain Services
- `PointsCalculatorService` — Servicio de dominio que calcula puntos base + bonos según dificultad y racha en sesión. No depende de infraestructura.
- `StreakService` — Servicio de dominio que evalúa la racha diaria: incrementa si ayer, resetea si >1 día, mantiene si hoy

### Repository (Port)
`UserStatsRepository` — Interfaz en dominio, implementación en infraestructura (Supabase `user_stats`).
- `findByUserId(userId): UserStats | null`
- `save(stats: UserStats): void`

### Aggregate Invariants
- `totalPoints` nunca decrementa (no hay punto por incorrecta)
- `longestStreak` es monotónico (nunca disminuye)
- `lastStudyDate` solo se actualiza si la nueva fecha es posterior
- `currentStreak` se resetea a 0 si `lastStudyDate` es anterior a ayer
