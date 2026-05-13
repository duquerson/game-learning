# User Story BDG-008: Sistema de insignias

- **Summary:** Desbloquear 9 insignias clasificadas por nivel y categoría al cumplir condiciones de logro, racha y maestría

## Use Case:
- **As a** usuario que estudia y progresa en MicroLearn
- **I want to** desbloquear insignias automáticamente al cumplir condiciones (primer repaso, rachas, volumen, maestría), con animación de celebración al obtenerlas
- **so that** me sienta recompensado por mi dedicación y tenga metas claras hacia las cuales avanzar

## Acceptance Criteria:

### Scenario 1: Catálogo de 9 insignias
- **Given** que soy un usuario de MicroLearn
- **When** exploro el sistema de insignias
- **Then** existen 9 insignias clasificadas por nivel (básica, intermedia, avanzada) y categoría (logro, racha, maestría)

| Insignia | Condición | Nivel | Categoría |
|---|---|---|---|
| 🌱 Primer paso | Completar la primera tarjeta | básica | logro |
| ⚡ En racha | 3 respuestas correctas seguidas | básica | racha |
| 📚 Estudioso | Repasar 50 tarjetas en total | básica | logro |
| 🔥 Semana de fuego | 7 días de racha | intermedia | racha |
| 🎯 Experto JS | Completar todas las tarjetas de JS | intermedia | maestría |
| 🚀 Centurión | 100 respuestas correctas | intermedia | logro |
| 🏆 Perfeccionista | Sesión con 100% de aciertos | intermedia | logro |
| 💎 Maestro TS | Completar todas las tarjetas de TS | avanzada | maestría |
| 👑 Maestro total | Completar todo el contenido | avanzada | maestría |

### Scenario 2: Desbloqueo automático al cumplir condición
- **Given** que estoy en una sesión de repaso
- **and Given** que al finalizar la sesión se cumple la condición de una insignia que aún no tengo
- **When** la función de verificación se ejecuta al completar la sesión
- **Then** la insignia se desbloquea automáticamente y se guarda en `user_badges` con la fecha actual

### Scenario 3: Animación de celebración al desbloquear
- **Given** que acabo de desbloquear una insignia
- **When** la insignia se desbloquea
- **Then** veo una animación destacada (glow o confeti) indicando qué insignia obtuve

### Scenario 4: Página de insignias
- **Given** que quiero ver mi colección
- **When** navego a la página `/badges`
- **Then** veo todas las insignias que he desbloqueado, cada una mostrando su ícono, nombre, nivel, categoría y fecha de obtención

### Scenario 5: Insignias bloqueadas ocultas
- **Given** que estoy en la página de insignias
- **and Given** que aún no he desbloqueado ciertas insignias
- **When** veo la galería
- **Then** solo se muestran las insignias que ya tengo; las bloqueadas no aparecen hasta que se desbloqueen

## Validaciones adicionales
- Las insignias nunca se pierden una vez obtenidas
- La verificación de condiciones ocurre al completar cada sesión de repaso
- Cada insignia se guarda con `user_id`, `badge_id` y `unlocked_at`
- Animación de desbloqueo reproducible solo la primera vez
- Clasificación visible en la página de insignias: nivel (básica/intermedia/avanzada) y categoría (logro/racha/maestría)

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario se sienta recompensado por su progreso y motivado a desbloquear más insignias (bucle de engagement).

### Behavioral Barriers Removed
- **Uncertainty aversion**: Requisitos implícitos en cada insignia (nombre + nivel) dan un camino claro
- **Present bias**: Las insignias básicas (Primer paso, En racha) son alcanzables rápido, dando recompensas tempranas para mantener motivación

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Loss aversion** | Una vez obtenida, la insignia es "tuya"; perderla no es posible, pero NO obtener las siguientes se siente como una pérdida de oportunidad |
| **Endowment effect** | Cuantas más insignias tienes, más valoras tu colección y más quieres completarla |
| **Variable rewards** | No saber EXACTAMENTE cuándo se desbloqueará la siguiente mantiene el engagement |
| **Pause moments** | Animación de glow/confeti al desbloquear celebra el logro y libera dopamina |
| **Zeigarnik effect** | Ver insignias obtenidas vs el total de 9 crea una "tarea incompleta" psicológica que motiva a completar la colección |
| **Progreso visible** | La clasificación por nivel (básica → avanzada) da un roadmap claro de progresión |

### Progression Design
| Etapa | Insignias | Efecto psicológico |
|-------|-----------|-------------------|
| Básica (3) | Primer paso, En racha, Estudioso | Logro temprano → refuerzo positivo |
| Intermedia (4) | Semana de fuego, Experto JS, Centurión, Perfeccionista | Compromiso creciente → inversión |
| Avanzada (2) | Maestro TS, Maestro total | Meta final → completitud |

### Friction Score: 0/10 (el desbloqueo es automático, sin acción extra)

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`Badges` — Gestiona el catálogo de insignias y la lógica de desbloqueo basada en logros del usuario.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Insignia | Logro desbloqueable que representa un hito |
| Nivel | Clasificación de dificultad (básica, intermedia, avanzada) |
| Categoría | Tipo de logro (logro, racha, maestría) |
| Condición | Regla que determina cuándo se desbloquea una insignia |

### Aggregate Root
`UserBadge` — Aggregate root que representa la relación usuario-insignia. La identidad es compuesta (userId + badgeId).

### Entities
- `Badge` — Entity del catálogo de insignias (independiente del usuario). Propiedades: badgeId, name, description, icon, level, category
- `UserBadge` — Entity que registra una insignia desbloqueada por un usuario. Propiedades: userId, badgeId, unlockedAt

### Value Objects
- `BadgeId` — UUID del catálogo de insignias
- `BadgeLevel` — Enum value object (basic | intermediate | advanced)
- `BadgeCategory` — Enum value object (achievement | streak | mastery)
- `BadgeCondition` — Value object que encapsula la regla de desbloqueo (tipo: first_card | correct_streak | total_reviewed | daily_streak | topic_mastery | total_correct | perfect_session | all_cards)
- `UnlockedAt` — Value object timestamp que registra cuándo se desbloqueó

### Domain Events
- `BadgeUnlocked` — Ocurre cuando un usuario desbloquea una insignia. Datos: userId, badgeId, badgeName, timestamp
- `BadgeCheckPerformed` — Ocurre después de evaluar condiciones post-sesión. Datos: sessionId, checked, newlyUnlocked[]

### Domain Services
- `BadgeEvaluationService` — Servicio de dominio que evalúa condiciones de todas las insignias contra el contexto actual del usuario. Idempotente: si ya tiene la insignia, no la desbloquea de nuevo.

### Repository (Port)
`BadgeRepository` — Interfaz en dominio, implementación en infraestructura (Supabase `badges` table).
- `findAllBadges(): Badge[]`
- `findBadgeById(badgeId): Badge | null`
- `findBadgesByLevel(level): Badge[]`

`UserBadgeRepository` — Interfaz en dominio, implementación en infraestructura (Supabase `user_badges` table).
- `findByUserId(userId): UserBadge[]`
- `findByBadgeId(badgeId): UserBadge[]`
- `exists(userId, badgeId): boolean`
- `save(userBadge: UserBadge): void`

### Aggregate Invariants
- Una insignia solo puede desbloquearse una vez por usuario (idempotencia)
- `unlockedAt` nunca se modifica después de la inserción
- `UserBadge` es inmutable una vez creada (no se puede "perder" una insignia)
- La evaluación de condiciones es determinista: mismo contexto → mismo resultado
