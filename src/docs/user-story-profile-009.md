# User Story PRF-009: Perfil de usuario

- **Summary:** Visualizar datos personales, estadísticas de estudio y editar temas de interés desde el perfil

## Use Case:
- **As a** usuario registrado de MicroLearn
- **I want to** ver mi perfil con email, puntos totales, racha actual y máxima, insignias desbloqueadas, y poder editar mis temas de estudio
- **so that** pueda tener una visión consolidada de mi progreso y ajustar mis preferencias de contenido

## Acceptance Criteria:

### Scenario 1: Visualizar perfil con estadísticas
- **Given** que he iniciado sesión
- **When** navego a la página `/profile`
- **Then** veo mi email, avatar con mis iniciales, puntos totales acumulados, racha actual, racha máxima histórica y todas mis insignias desbloqueadas

### Scenario 2: Avatar con iniciales
- **Given** que estoy en mi perfil
- **and Given** que no he subido una foto
- **When** veo mi avatar
- **Then** se muestran mis iniciales (primera letra del email en mayúscula) en un círculo con los colores del tema

### Scenario 3: Subir foto de avatar
- **Given** que estoy en mi perfil
- **When** hago clic en mi avatar y selecciono una imagen
- **Then** la imagen se guarda y reemplaza las iniciales como mi foto de perfil

### Scenario 4: Editar temas de estudio desde el perfil
- **Given** que estoy en mi perfil
- **When** hago clic en "Editar temas"
- **Then** puedo modificar mi selección de temas (JavaScript y/o TypeScript) y guardar los cambios, actualizando el contenido que veo en la biblioteca y dashboard

## Validaciones adicionales
- Email obtenido de la sesión de Supabase Auth
- Puntos totales de `user_stats.total_points`
- Rachas: `current_streak` y `longest_streak` de `user_stats`
- Insignias: todas las de `user_badges` con datos de `badges`
- Avatar: iniciales por defecto; soporte para foto subida (almacenamiento futuro)
- Editar temas: actualiza `user_preferences.selected_topics` y el contenido se filtra en consecuencia

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario consulte su progreso general y mantenga actualizadas sus preferencias de contenido.

### Behavioral Barriers Removed
- **Uncertainty aversion**: Perfil responde "¿qué he logrado?" y "¿qué temas estoy estudiando?" de forma consolidada
- **Status quo effect**: Poder editar temas desde el perfil evita que el usuario se quede con contenido que ya no le interesa por pereza de cambiar

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Endowment effect** | Ver todas las insignias obtenidas + racha máxima histórica genera orgullo de propiedad |
| **Reducir fricción** | Editar temas desde el perfil (un clic) vs tener que rehacer onboarding |
| **Defaults** | Avatar con iniciales por defecto sin requerir foto |
| **Social proof (implícito)** | Racha máxima histórica sirve como "mejor marca personal" a superar |
| **Self-efficacy** | Ver el progreso acumulado refuerza la creencia en la propia capacidad de aprender |

### Habit Loop
- **Cue**: Curiosidad sobre el progreso general o necesidad de cambiar temas
- **Routine**: Ir al perfil, revisar stats, editar si es necesario
- **Reward**: Confirmación visual del progreso + control sobre el contenido

### Friction Score: 2/10

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`UserProfile` — Gestiona la información personal y preferencias del usuario. Actúa como fachada que consulta datos de otros bounded contexts.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Perfil | Vista consolidada de datos personales y progreso |
| Avatar | Representación visual del usuario (iniciales o foto) |
| Tema de estudio | Área de contenido que el usuario eligió aprender |

### Aggregate Root
`UserProfile` — Aggregate root que representa la identidad visual y preferencias del usuario. No contiene stats de juego (solo las referencia).

### Entities
- `UserProfile` — Aggregate root. Propiedades: userId, email, avatarUrl, selectedTopics[]

### Value Objects
- `Avatar` — Value object que puede ser InitialsAvatar o UploadedAvatar
  - `InitialsAvatar`: genera iniciales a partir del email
  - `UploadedAvatar`: URL de imagen subida
- `Email` — Value object con validación de formato (reutilizado del contexto Auth)
- `DisplayName` — Value object que genera nombre visible a partir del email

### Domain Events
- `TopicsUpdated` — Ocurre cuando el usuario cambia sus temas de estudio. Datos: userId, previousTopics[], newTopics[], timestamp
- `AvatarChanged` — Ocurre cuando el usuario sube o cambia su avatar. Datos: userId, avatarUrl, timestamp

### Read Model (CQRS)
`UserProfileReadModel` — Read model que consolida datos del perfil con stats de otros bounded contexts:
- `getProfile(userId): ProfileDTO`
  - `email: string`, `avatar: AvatarDTO`, `selectedTopics: Topic[]`
  - `totalPoints: number`, `currentStreak: number`, `longestStreak: number`
  - `badges: BadgeDTO[]`

### Repository (Port)
`UserProfileRepository` — Interfaz en dominio, implementación en infraestructura (Supabase `user_preferences` + Auth).
- `findByUserId(userId): UserProfile | null`
- `updateTopics(userId, topics): void`
- `updateAvatar(userId, avatarUrl): void`

### Aggregate Invariants
- `selectedTopics` nunca puede estar vacío (al menos 1 tema)
- `email` es inmutable (no se puede cambiar desde el perfil)
- El avatar tiene un valor por defecto (iniciales) si no se ha subido foto
