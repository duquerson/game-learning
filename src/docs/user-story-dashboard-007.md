# User Story DSH-007: Dashboard principal

- **Summary:** Vista general del progreso con saludo personalizado, puntos, racha, progreso de tarjetas y todas las insignias desbloqueadas

## Use Case:
- **As a** usuario recurrente de MicroLearn
- **I want to** al iniciar sesión ver un dashboard con mi saludo, puntos totales, racha actual, barra de progreso de tarjetas, todas mis insignias desbloqueadas y botones de acción rápida
- **so that** pueda evaluar mi estado general de un vistazo y decidir qué hacer a continuación

## Acceptance Criteria:

### Scenario 1: Dashboard muestra datos del usuario
- **Given** que he iniciado sesión
- **When** soy redirigido al dashboard
- **Then** veo: un saludo personalizado con mi nombre, mis puntos totales, mi racha actual (ej. "🔥 3 días"), una barra de progreso con conteo de tarjetas repasadas vs totales disponibles, y todas mis insignias desbloqueadas

### Scenario 2: Barra de progreso de tarjetas
- **Given** que estoy en el dashboard
- **When** veo la sección de progreso
- **Then** veo una barra de progreso visual que indica cuántas tarjetas he repasado del total disponible (ej. "15/30"), actualizada en tiempo real

### Scenario 3: Insignias desbloqueadas
- **Given** que estoy en el dashboard
- **and Given** que tengo insignias desbloqueadas
- **When** veo la sección de insignias
- **Then** veo todas mis insignias desbloqueadas, cada una con su ícono y nombre

### Scenario 4: Sin insignias desbloqueadas
- **Given** que estoy en el dashboard
- **and Given** que aún no he desbloqueado ninguna insignia
- **When** veo la sección de insignias
- **Then** veo un mensaje indicando que aún no tengo insignias y cómo empezar a ganarlas

### Scenario 5: Botones de acción rápida
- **Given** que estoy en el dashboard
- **When** quiero comenzar a estudiar
- **Then** veo dos botones principales: "Continuar estudiando" que inicia una sesión de quiz, e "Ir a biblioteca" que me lleva a la biblioteca de tarjetas

## Validaciones adicionales
- Saludo: "Hola, [nombre] 👋" usando el email o nombre del usuario
- Puntos totales obtenidos de `user_stats.total_points`
- Racha: "🔥 [N] días" obtenido de `user_stats.current_streak`
- Progreso: barra con ratio `reviewed_count / total_count` filtrado por temas del usuario
- Insignias: todas las de `user_badges` con join a `badges` para ícono y nombre
- Botón "Continuar estudiando" → inicia sesión de 10 tarjetas aleatorias
- Botón "Ir a biblioteca" → redirige a `/library`

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario evalúe su progreso de un vistazo y decida continuar estudiando (re-enganche).

### Behavioral Barriers Removed
- **Uncertainty aversion**: Dashboard responde "¿cómo voy?" de inmediato sin tener que navegar
- **Status quo effect**: El saludo personalizado + datos actualizados hacen que el dashboard sea el punto de partida natural

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Loss aversion** | Ver la racha "🔥 3 días" activa el miedo a perderla; el usuario hará un repaso para no romperla |
| **Endowment effect** | Las insignias visibles generan "esto es mío" y motivan a obtener más |
| **Progreso visible** | Barra de progreso "15/30" muestra cuánto falta, activando el deseo de completitud (Zeigarnik effect) |
| **Defaults** | "Continuar estudiando" como botón principal = camino por defecto |
| **Pause moments** | Saludo personalizado crea micro-conexión emocional |
| **Reducir fricción** | Dos botones grandes para las acciones principales; sin decisiones complejas |

### Habit Loop
- **Cue**: Iniciar sesión o abrir la app
- **Routine**: Ver progreso → elegir "Continuar estudiando"
- **Reward**: Datos actualizados + camino claro a la acción

### Variable Rewards
La racha, los puntos y las insignias cambian en cada visita, dando una razón para revisar el dashboard diariamente.

### Friction Score: 1/10

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`Dashboard` — Gestiona la vista principal del usuario con métricas consolidadas de múltiples bounded contexts.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Dashboard | Pantalla principal con resumen de progreso |
| Progreso | Ratio de tarjetas repasadas vs total disponible |
| Saludo | Mensaje personalizado con el nombre del usuario |

### Aggregate Root
`Dashboard` — No es un aggregate de escritura, sino un **read model** que consolida datos de varios bounded contexts. No tiene operaciones de escritura directas.

### Read Models (CQRS)
`DashboardReadModel` — Modelo de consulta que agrega datos de 3 bounded contexts:
- **Gamification**: totalPoints, currentStreak, longestStreak
- **CardCatalog**: reviewedCount, totalCount, reviewedByTopic
- **Badges**: recentBadges[], allBadges[]

Servicio de consulta:
- `getDashboardData(userId): DashboardDTO`
  - `greeting: string` — "Hola, [nombre]"
  - `points: number`
  - `streak: { current: number, longest: number }`
  - `progress: { reviewed: number, total: number, percentage: number }`
  - `badges: BadgeDTO[]` — todas las insignias desbloqueadas
  - `quickActions: Action[]` — botones disponibles

### Value Objects
- `Greeting` — Value object que genera el saludo personalizado a partir del email/nombre
- `ProgressRatio` — Value object que calcula y valida reviewed/total (0-100%)
- `QuickAction` — Value object que representa un botón de acción (label, route, icon)

### Integration Events (suscritos)
El Dashboard NO genera eventos, pero CONSUME eventos de otros bounded contexts para actualizar su read model:
- `PointsAwarded` (de Gamification) → refresca totalPoints
- `StreakUpdated` (de Gamification) → refresca streak
- `BadgeUnlocked` (de Badges) → refresca insignias
- `SessionCompleted` (de ReviewSession) → refresca progreso

### Anti-Patterns Evitados
- ❌ Dashboard como aggregate de escritura → Read model separado (CQRS)
- ❌ Lógica de negocio en dashboard → Solo consulta, no modifica estado
- ❌ Queries complejas en repositorio de dominio → Read model específico con queries optimizadas
