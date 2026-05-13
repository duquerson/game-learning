---
title: LIB-003 — Biblioteca de Tarjetas de Estudio
version: 1.0
date_created: 2026-05-13
owner: Equipo de Producto
tags: especificación, biblioteca, tarjetas, estudio, behavioral-design, ddd, microlearn
---

# LIB-003: Biblioteca de Tarjetas de Estudio

## 1. Propósito y Alcance

Explorar, filtrar y buscar tarjetas de estudio agrupadas por tema y subtema. El usuario registrado puede navegar la biblioteca viendo información completa de cada tarjeta, con opciones de filtro, búsqueda y ordenamiento, para decidir qué repasar.

**Incluye**: agrupación por tema/subtema, filtros por tema y dificultad, búsqueda por texto, ordenamiento, preview modal, indicador de estado repasado, estado vacío, enlace a perfil para cambiar temas.

**Excluye**: modo de repaso quiz (REV-004 / spec-review-004.md), modo autoevaluación (REV-011 / spec-self-assessment-011.md), creación/edición de tarjetas (admin), analytics de uso de biblioteca.

## 2. User Stories

| ID | Resumen | Prioridad |
|----|---------|-----------|
| US-001 | Visualizar biblioteca con tarjetas agrupadas por tema y subtema | P0 |
| US-002 | Filtrar por tema (JS/TS/Todos) y dificultad (easy/medium/hard/Todas) | P0 |
| US-003 | Buscar tarjetas por texto en título y contenido | P1 |
| US-004 | Ordenar por dificultad (asc/desc) o tema (alfabético) | P1 |
| US-005 | Preview de tarjeta al hacer clic (modal con info completa) | P0 |
| US-006 | Biblioteca vacía con mensaje y enlace a perfil | P1 |

## 3. Requerimientos Funcionales

- **RF-001**: Sistema debe mostrar tarjetas agrupadas por tema y subtema
- **RF-002**: Sistema debe mostrar título, contenido completo, dificultad, puntos y estado (repasada/no repasada) por tarjeta
- **RF-003**: Sistema debe permitir filtrar por tema (JavaScript, TypeScript o Todos)
- **RF-004**: Sistema debe permitir filtrar por dificultad (easy, medium, hard o Todas)
- **RF-005**: Sistema debe permitir filtrar por subtema
- **RF-006**: Sistema debe permitir buscar por texto en título y contenido (case-insensitive)
- **RF-007**: Sistema debe permitir ordenar por dificultad (ascendente/descendente) o tema (alfabético)
- **RF-008**: Sistema debe mostrar un modal con información completa de la tarjeta al hacer clic
- **RF-009**: Sistema debe indicar visualmente las tarjetas ya repasadas (verde/completado)
- **RF-010**: Sistema debe mostrar mensaje de estado vacío cuando no hay tarjetas para los temas asignados, con enlace a perfil
- **RF-011**: Sistema debe mostrar skeleton loader durante carga
- **RF-012**: Sistema debe mostrar botón "Iniciar repaso" para comenzar sesión desde la biblioteca
- **RF-013**: Sistema debe filtrar tarjetas según temas seleccionados en onboarding
- **RF-014**: Sistema debe permitir limpiar todos los filtros activos con un solo clic

## 4. Requerimientos No Funcionales

- **RNF-001 — Rendimiento**: Tiempo de carga inicial < 2s (SSR con Astro)
- **RNF-002 — Rendimiento**: Filtrado/búsqueda client-side < 100ms (dataset típico < 200 tarjetas)
- **RNF-003 — UX**: Estados de carga, vacío y error visibles
- **RNF-004 — Accesibilidad**: Modal con trampa de foco, etiquetas aria, navegación por teclado
- **RNF-005 — Responsive**: Grid 1 col (mobile), 2 col (tablet), 3 col (desktop)
- **RNF-006 — Seguridad**: Solo se muestran tarjetas de temas asignados al usuario
- **RNF-007 — Mantenibilidad**: Lógica de filtros y ordenamiento en composable Vue reutilizable

## 5. Contratos TypeScript

```typescript
// ─── Value Objects ───────────────────────────────────────────────────────────

type Difficulty = 'easy' | 'medium' | 'hard'
type CardStatus = 'reviewed' | 'unreviewed'
type SortOption = 'topic' | 'difficulty-asc' | 'difficulty-desc'

// ─── Read Model (CQRS) ───────────────────────────────────────────────────────

interface CardLibraryReadModel {
  filterByTopic(topic: string | 'all'): CardSummary[]
  filterByDifficulty(difficulty: Difficulty | 'all'): CardSummary[]
  filterBySubtopic(subtopic: string | 'all'): CardSummary[]
  search(query: string): CardSummary[]
  sort(option: SortOption): CardSummary[]
  getReviewedStatus(cardIds: string[]): Promise<Map<string, boolean>>
}

interface CardSummary {
  id: string
  title: string
  content: string
  topic: string
  subtopic: string
  difficulty: Difficulty
  points: number
  reviewed: boolean
}

// ─── Component Props ─────────────────────────────────────────────────────────

interface CardLibraryProps {
  cards: CardSummary[]
  reviewedIds: string[]
  loading?: boolean
}

interface CardItemProps {
  card: CardSummary
  reviewed: boolean
}

interface CardPreviewModal {
  card: CardSummary
  open: boolean
}

// ─── Filter State ────────────────────────────────────────────────────────────

interface LibraryFilterState {
  searchQuery: string
  topicFilter: string        // 'all' | topic name
  subtopicFilter: string     // 'all' | subtopic name
  difficultyFilter: string   // 'all' | Difficulty
  sortBy: SortOption
}

// ─── Domain Events ───────────────────────────────────────────────────────────

interface CardLibraryOpened {
  userId: string
  timestamp: string
  topicFilter: string
}

interface FilterApplied {
  userId: string
  filterType: 'topic' | 'difficulty' | 'subtopic' | 'search' | 'sort'
  value: string
  resultCount: number
}

interface CardPreviewed {
  userId: string
  cardId: string
  timestamp: string
}

// ─── Repository Port ─────────────────────────────────────────────────────────

interface CardLibraryRepository {
  findByUserId(userId: string): Promise<CardSummary[]>
  findByTopics(topics: string[]): Promise<CardSummary[]>
  getReviewedCardIds(userId: string): Promise<string[]>
  getUserTopics(userId: string): Promise<string[]>
}
```

## 6. Escenarios de Error

| ID | Condición | Comportamiento Esperado |
|----|-----------|------------------------|
| ERR-001 | Usuario no autenticado | Redirigir a `/login` |
| ERR-002 | Consulta de tarjetas falla | Mostrar EmptyState con mensaje de error y botón reintentar |
| ERR-003 | No hay tarjetas para temas asignados | Mostrar EmptyState "Sin contenido disponible" con enlace a `/profile` |
| ERR-004 | Búsqueda sin resultados | Mostrar EmptyState "No se encontraron tarjetas" con botón limpiar filtros |
| ERR-005 | Error al cargar reviewed status | Mostrar tarjetas sin indicador de repasado, log del error |
| ERR-006 | Todas las tarjetas filtradas están repasadas | Mostrar EmptyState "¡Todo al día!" con mensaje de celebración |

## 7. KPIs y Métricas de Éxito

| KPI | Target | Medición |
|-----|--------|----------|
| Tasa de clic en tarjeta → preview | > 60% | Evento `card_previewed` |
| Tasa de "Iniciar repaso" desde biblioteca | > 30% | Evento `review_started_from_library` |
| Uso de filtros por sesión | > 40% | Evento `filter_applied` |
| Tasa de búsqueda | > 20% | Evento `search_performed` |
| Tiempo hasta primera acción | < 10s | RUM (Real User Monitoring) |
| Carga exitosa de biblioteca | > 99.5% | Server logs + uptime |

## 8. Casos de Prueba

### CP-001: Visualización con tarjetas agrupadas
- **Relación**: US-001, RF-001, RF-002
- **Precondiciones**: Usuario autenticado. Tema "JavaScript" asignado. Existen 4+ tarjetas en DB.
- **Pasos**: Navegar a `/library`
- **Resultado**: Tarjetas agrupadas por tema. Cada grupo tiene subtemas. Cada tarjeta muestra título, contenido, dificultad, puntos. Las repasadas tienen badge verde.

### CP-002: Filtro combinado tema + dificultad
- **Relación**: US-002, RF-003, RF-004
- **Precondiciones**: Biblioteca con tarjetas JS y TS, easy/medium/hard
- **Pasos**: Seleccionar tema=TypeScript, dificultad=hard
- **Resultado**: Solo se ven tarjetas TS con dificultad hard. Contador actualizado.

### CP-003: Filtro por subtema
- **Relación**: RF-005
- **Precondiciones**: Biblioteca con tarjetas de JS/Arrays, JS/Functions, TS/Generics
- **Pasos**: Seleccionar tema=JavaScript → seleccionar subtema=Arrays
- **Resultado**: Solo tarjetas JS con subtema "Arrays". Selector de subtema se actualiza al cambiar tema.

### CP-004: Búsqueda por texto
- **Relación**: US-003, RF-006
- **Precondiciones**: Biblioteca con 10+ tarjetas
- **Pasos**: Escribir "closure" en búsqueda
- **Resultado**: Solo tarjetas con "closure" en título o contenido. Búsqueda case-insensitive.

### CP-005: Ordenamiento
- **Relación**: US-004, RF-007
- **Pasos**: Seleccionar orden "Por dificultad (menor a mayor)"
- **Resultado**: Tarjetas ordenadas: easy → medium → hard. Cambiar a "Tema (A-Z)" y verificar orden alfabético.

### CP-006: Preview modal
- **Relación**: US-005, RF-008
- **Precondiciones**: Biblioteca cargada
- **Pasos**: Hacer clic en tarjeta → Verificar modal → Cerrar con ✕ → Clic en overlay para cerrar
- **Resultado**: Modal muestra: tema tag, título, subtítulo, contenido, dificultad, puntos. Al cerrar, foco retorna a la tarjeta.

### CP-007: Estado vacío sin contenido
- **Relación**: US-006, RF-010
- **Precondiciones**: Usuario con temas asignados pero sin tarjetas en DB
- **Pasos**: Navegar a `/library`
- **Resultado**: EmptyState con mensaje. Enlace a `/profile`.

### CP-008: Todas repasadas
- **Relación**: RF-012
- **Precondiciones**: Usuario ha repasado todas las tarjetas de sus temas
- **Pasos**: Navegar a `/library`
- **Resultado**: EmptyState "¡Todo al día!" con celebración. Botón "Iniciar repaso" visible.

### CP-009: Limpiar filtros
- **Relación**: RF-014
- **Precondiciones**: Filtros activos (tema=JS, dificultad=hard, búsqueda="array")
- **Pasos**: Clic en "Limpiar filtros"
- **Resultado**: Todos los filtros reseteados. Biblioteca muestra todas las tarjetas.

### CP-010: Skeleton loader
- **Relación**: RF-011
- **Precondiciones**: Simular carga lenta (throttle network)
- **Pasos**: Navegar a `/library`
- **Resultado**: 6 skeleton cards visibles durante la carga. Reemplazadas por contenido real al cargar.

### CP-011: Accesibilidad de modal
- **Relación**: RNF-004
- **Pasos**: Abrir modal → Tab → Shift+Tab → Escape
- **Resultado**: Foco atrapado en modal. Escape cierra modal. Foco retorna al trigger.

## 9. Dependencias y Supuestos

- **DEP-001**: Tabla `cards` poblada con datos en Supabase
- **DEP-002**: Tabla `user_progress` para tracking de tarjetas repasadas
- **DEP-003**: Tabla `user_preferences` con `selected_topics`
- **DEP-004**: Componentes UI base existentes: GlassCard, GlassButton, EmptyState, SkeletonLoader
- **SUP-001**: Biblioteca típica < 200 tarjetas por usuario (filtrado client-side viable)
- **SUP-002**: Usuario tiene al menos 1 tema asignado (garantizado por onboarding)
