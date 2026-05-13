# User Story ONB-002: Onboarding de temas y dificultad

- **Summary:** Personalizar el contenido de estudio mediante selección guiada de temas y dificultad al primer ingreso

## Use Case:
- **As a** usuario recién registrado (o existente que nunca completó el onboarding)
- **I want to** seleccionar mis temas de interés (JavaScript y/o TypeScript) y mi dificultad preferida en un flujo guiado de 2 pasos
- **so that** el dashboard y la biblioteca solo muestren contenido relevante para mí

## Acceptance Criteria:

### Scenario 1: Onboarding completo exitoso (usuario nuevo)
- **Given** que acabo de registrarme y es mi primera vez en la plataforma
- **and Given** que soy redirigido automáticamente al onboarding
- **When** completo el paso 1 (selecciono al menos un tema: JavaScript y/o TypeScript) y el paso 2 (selecciono mi dificultad preferida: easy, medium o hard) y hago clic en "Comenzar"
- **Then** mis preferencias se guardan en la base de datos, se inicializan mis stats en cero, y soy redirigido al dashboard con contenido filtrado según mis elecciones

### Scenario 2: Validación obliga a seleccionar al menos un tema
- **Given** que estoy en el paso 1 del onboarding
- **When** intento avanzar al paso 2 sin haber seleccionado ningún tema
- **Then** veo un mensaje de error indicando que debo elegir al menos un tema, y no puedo continuar

### Scenario 3: Usuario ya onboardeado redirigido al dashboard
- **Given** que ya completé el onboarding anteriormente
- **and Given** que intento acceder a la ruta `/onboarding`
- **When** ingreso la URL o soy redirigido allí
- **Then** automáticamente soy redirigido al dashboard sin mostrar el onboarding

### Scenario 4: Progreso visual de 2 pasos
- **Given** que estoy en el flujo de onboarding
- **When** navego entre el paso 1 (temas) y el paso 2 (dificultad)
- **Then** veo un indicador de progreso que muestra en qué paso estoy y cuántos pasos restan

## Validaciones adicionales
- Paso 1: selección múltiple de temas (JS / TS), obligatorio al menos 1
- Paso 2: selección única de dificultad (easy / medium / hard), valor por defecto: medium
- Al completar: se crea registro en `user_preferences` y `user_stats`
- Onboarding solo se muestra una vez; redirección automática al dashboard en visitas posteriores

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario configure sus preferencias de contenido rápidamente para empezar a estudiar.

### Behavioral Barriers Removed
- **Status quo effect**: Flujo guiado de 2 pasos con progreso visible; el usuario sabe exactamente cuánto falta
- **Uncertainty aversion**: Valor por defecto (medium) reduce la parálisis por decisión
- **Choice overload**: Solo 2 temas (JS/TS) y 3 dificultades evita fatiga de decisión

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Reducir fricción** | 2 pasos mínimos, no más de 3 opciones por paso |
| **Defaults inteligentes** | Dificultad "medium" pre-seleccionada |
| **Progreso visible** | Indicador de paso 1/2 reduce ansiedad |
| **Compromiso temprano** | Seleccionar temas crea compromiso previo al estudio |

### Habit Loop (Cue → Routine → Reward)
- **Cue**: Redirección post-registro o primera visita
- **Routine**: Seleccionar temas y dificultad en 2 pasos
- **Reward**: Dashboard personalizado con contenido relevante

### Friction Score: 2/10

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`Onboarding` — Gestiona la configuración inicial de preferencias del usuario y la creación de su estado inicial.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Tema | Área de conocimiento (JavaScript o TypeScript) |
| Dificultad | Nivel de desafío (easy, medium, hard) |
| Onboarding | Flujo de configuración inicial post-registro |

### Aggregate Root
`UserPreferences` — Entidad que representa la configuración de contenido del usuario. Se crea durante el onboarding y puede modificarse después desde el perfil.

### Value Objects
- `Topic` — Value object que representa un tema de estudio (JS | TS)
- `DifficultyLevel` — Value object enum (easy | medium | hard)
- `SelectedTopics` — Value object que garantiza al menos 1 tema seleccionado

### Domain Events
- `OnboardingCompleted` — Ocurre cuando el usuario termina el onboarding. Datos: userId, selectedTopics, difficulty, timestamp

### Repository (Port)
`UserPreferencesRepository` — Interfaz en dominio, implementación en infraestructura (Supabase `user_preferences` + `user_stats` transaccional).
- `findByUserId(userId): UserPreferences | null`
- `save(preferences: UserPreferences): void`

### Aggregate Invariants
- `selectedTopics` no puede estar vacío (al menos 1 tema)
- `onboardingCompleted` se marca `true` solo al completar ambos pasos
- `user_stats` se inicializa con 0 puntos y 0 racha al completar el onboarding
