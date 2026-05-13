# User Story LIB-003: Biblioteca de tarjetas de estudio

- **Summary:** Explorar, filtrar y buscar tarjetas de estudio agrupadas por tema y subtema

## Use Case:
- **As a** usuario registrado con temas asignados
- **I want to** navegar la biblioteca de tarjetas viendo información completa de cada una, con opciones de filtro, búsqueda y ordenamiento
- **so that** pueda explorar el contenido disponible y decidir qué repasar

## Acceptance Criteria:

### Scenario 1: Visualizar biblioteca con tarjetas agrupadas
- **Given** que he iniciado sesión y tengo temas asignados (JavaScript y/o TypeScript)
- **and Given** que estoy en la página `/library`
- **When** ingreso a la biblioteca
- **Then** veo las tarjetas agrupadas por tema y subtema, mostrando título, contenido completo, dificultad, puntos y estado (repasada/no repasada)

### Scenario 2: Filtrar por tema y dificultad
- **Given** que estoy en la biblioteca con tarjetas visibles
- **When** selecciono un filtro de tema (JavaScript, TypeScript o Todos) y/o un filtro de dificultad (easy, medium, hard o Todas)
- **Then** la biblioteca se actualiza mostrando solo las tarjetas que coinciden con los filtros seleccionados

### Scenario 3: Buscar tarjetas por texto
- **Given** que estoy en la biblioteca
- **When** escribo un término de búsqueda en el campo de búsqueda
- **Then** se muestran solo las tarjetas cuyo título o contenido coinciden con el término ingresado

### Scenario 4: Ordenar tarjetas
- **Given** que estoy en la biblioteca
- **When** cambio la opción de ordenamiento entre "Por dificultad" o "Por tema"
- **Then** las tarjetas se reordenan según la opción seleccionada

### Scenario 5: Preview de tarjeta al hacer clic
- **Given** que estoy en la biblioteca viendo las tarjetas agrupadas
- **When** hago clic en una tarjeta
- **Then** se abre una vista de detalle con la información completa de la tarjeta (sin iniciar el modo de repaso)

### Scenario 6: Biblioteca vacía
- **Given** que estoy en la biblioteca
- **and Given** que no hay tarjetas disponibles para mis temas asignados
- **When** ingreso a la biblioteca
- **Then** veo un mensaje indicando que no hay contenido disponible, con un enlace o botón para cambiar mis temas desde el perfil

## Validaciones adicionales
- Las tarjetas se filtran según los temas seleccionados en el onboarding
- Indicador visual de tarjetas ya repasadas (verde/completado)
- Filtros: tema (JS / TS / Todos) y dificultad (easy / medium / hard / Todas)
- Búsqueda por texto en título y contenido
- Ordenamiento: por dificultad (asc/desc) o por tema (alfabético)
- Botón "Iniciar repaso" disponible desde la biblioteca para comenzar una sesión

---

## Behavioral Product Design Analysis

### Target Behavior
Que el usuario explore el contenido disponible y decida iniciar una sesión de repaso.

### Behavioral Barriers Removed
- **Choice overload**: Agrupación por tema/subtema + filtros evita abrumar con 30+ tarjetas
- **Uncertainty aversion**: Preview de contenido completo permite evaluar sin comprometerse
- **Status quo effect**: Indicador de estado (repasada/no repasada) reduce la incertidumbre de "ya vi esto?"

### Principles Applied
| Principio | Aplicación |
|-----------|-----------|
| **Reducir fricción** | Búsqueda + filtros + ordenamiento = encontrar contenido en segundos |
| **Defaults inteligentes** | Filtros inician en "Todos" para mostrar todo el contenido disponible |
| **Progreso visible** | Check visual de tarjetas repasadas da sensación de avance |
| **Compromiso** | Botón "Iniciar repaso" siempre visible reduce distancia a la acción |

### Habit Loop
- **Cue**: Volver a la biblioteca después de una sesión
- **Routine**: Filtrar por tema o dificultad, explorar tarjetas nuevas
- **Reward**: Encontrar contenido relevante + botón para empezar

### Friction Score: 2/10

---

## Domain-Driven Design (DDD) Analysis

### Bounded Context
`CardCatalog` — Gestiona el catálogo de tarjetas de estudio, su clasificación y consulta.

### Ubiquitous Language
| Término | Significado |
|---------|-------------|
| Tarjeta | Unidad de contenido de aprendizaje con título y contenido |
| Tema | Categoría principal (JavaScript, TypeScript) |
| Subtema | Categoría específica dentro de un tema (ej. "Arrays", "Generics") |
| Dificultad | Nivel de desafío de la tarjeta |

### Aggregate Root
`Card` — Entidad que representa una tarjeta de estudio individual. Es el aggregate root del contexto CardCatalog.

### Value Objects
- `CardId` — UUID que identifica la tarjeta
- `Difficulty` — Enum value object (easy | medium | hard)
- `Topic` — Enum value object (javascript | typescript)
- `PointsValue` — Value object que asigna puntos según dificultad (easy=5, medium=10, hard=15)
- `ContentSummary` — Value object con límite de 150 palabras

### Read Model (CQRS)
`CardLibraryReadModel` — Modelo de lectura separado para la biblioteca con datos agregados:
- `filterByTopicAndDifficulty(topic, difficulty): Card[]`
- `searchByText(query): Card[]`
- `getReviewedStatus(userId, cardIds): Map<CardId, boolean>`

### Repository (Port)
`CardRepository` — Interfaz en dominio, implementación en infraestructura (Supabase `cards` table).
- `findById(cardId): Card | null`
- `findByTopics(topics): Card[]`
- `findByDifficulty(difficulty): Card[]`

### Domain Events
- `CardReviewed` — Ocurre cuando un usuario completa una tarjeta en una sesión. Datos: cardId, userId, correct, timestamp
