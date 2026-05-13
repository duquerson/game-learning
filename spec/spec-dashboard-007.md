# SPEC-DSH-007: Dashboard Principal

## 1. Propósito y Alcance

**Propósito:** Proporcionar al usuario recurrente una vista general de su progreso al iniciar sesión, con saludo personalizado, puntos, racha, barra de progreso de tarjetas, todas las insignias desbloqueadas y botones de acción rápida para re-enganche inmediato.

**Alcance:**
- Saludo personalizado con franja horaria y nombre del usuario
- Visualización de puntos totales desde `user_stats.total_points`
- Visualización de racha actual y mejor racha desde `user_stats`
- Barra de progreso: tarjetas repasadas vs total disponible (filtrado por temas del usuario)
- Lista completa de insignias desbloqueadas con ícono y nombre
- Estado vacío para insignias (ninguna desbloqueada)
- Botón "Continuar estudiando" → iniciar sesión de 10 tarjetas aleatorias
- Botón "Ir a biblioteca" → redirigir a `/library`
- Read model CQRS que consolida datos de Gamification, CardCatalog y Badges

**Fuera de alcance:**
- Edición de perfil o preferencias desde el dashboard
- Histórico de sesiones
- Leaderboards o comparación social
- Notificaciones en tiempo real
- Widgets personalizables

---

## 2. User Stories

### US-01: Dashboard con datos del usuario al iniciar sesión
**As a** usuario recurrente de MicroLearn
**I want to** al iniciar sesión ver un dashboard con mi saludo, puntos, racha y progreso
**So that** pueda evaluar mi estado general de un vistazo

**Acceptance Criteria:**
- Given que he iniciado sesión
- When soy redirigido al dashboard
- Then veo: un saludo personalizado, mis puntos totales, mi racha actual, barra de progreso y todas mis insignias desbloqueadas

### US-02: Barra de progreso de tarjetas
**As a** usuario recurrente
**I want to** ver cuántas tarjetas he repasado del total disponible
**So that** sepa cuánto me falta y active el deseo de completitud

**Acceptance Criteria:**
- Given que estoy en el dashboard
- When veo la sección de progreso
- Then veo una barra visual con ratio "15/30" y porcentaje

### US-03: Insignias desbloqueadas
**As a** usuario con insignias obtenidas
**I want to** ver todas mis insignias desbloqueadas con su ícono y nombre
**So that** sienta pertenencia (endowment effect) y me motive a obtener más

**Acceptance Criteria:**
- Given que tengo insignias desbloqueadas
- When veo la sección de insignias
- Then veo cada insignia con ícono y nombre

### US-04: Sin insignias desbloqueadas
**As a** usuario nuevo sin insignias
**I want to** ver un mensaje que me indique cómo empezar a ganarlas
**So that** entienda el mecanismo de progresión

**Acceptance Criteria:**
- Given que aún no he desbloqueado ninguna insignia
- When veo la sección de insignias
- Then veo un mensaje "Aún no tienes insignias" con CTA a repaso

### US-05: Botones de acción rápida
**As a** usuario en el dashboard
**I want to** tener dos botones principales para decidir qué hacer
**So that** pueda continuar estudiando o explorar la biblioteca sin fricción

**Acceptance Criteria:**
- Given que estoy en el dashboard
- When quiero comenzar a estudiar
- Then veo "Continuar estudiando" (inicia quiz) e "Ir a biblioteca" (navega a `/library`)

---

## 3. Requisitos Funcionales (RF)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | El sistema debe mostrar un saludo personalizado con franja horaria (Buenos días/tardes/noches) + nombre del usuario | Alta |
| RF-02 | El sistema debe mostrar los puntos totales del usuario desde `user_stats.total_points` | Alta |
| RF-03 | El sistema debe mostrar la racha actual ("🔥 [N] días") desde `user_stats.current_streak` | Alta |
| RF-04 | El sistema debe mostrar la mejor racha histórica desde `user_stats.longest_streak` | Alta |
| RF-05 | El sistema debe mostrar una barra de progreso con ratio `reviewed_count / total_count` filtrado por temas del usuario | Alta |
| RF-06 | El sistema debe mostrar todas las insignias desbloqueadas con su ícono y nombre | Alta |
| RF-07 | El sistema debe mostrar un estado vacío con mensaje y CTA si no hay insignias desbloqueadas | Alta |
| RF-08 | El sistema debe incluir botón "Continuar estudiando" que inicia una sesión de 10 tarjetas aleatorias | Alta |
| RF-09 | El sistema debe incluir botón "Ir a biblioteca" que redirige a `/library` | Alta |
| RF-10 | Las consultas del dashboard deben hacerse como read model separado (CQRS), no desde repositorios de dominio | Alta |
| RF-11 | El dashboard debe mostrar skeleton loader mientras carga | Media |
| RF-12 | El dashboard debe mostrar toast de error si falla alguna consulta | Media |

## 4. Requisitos No Funcionales (RNF)

| ID | Descripción | Criterio |
|----|-------------|----------|
| RNF-01 | Tiempo de carga del dashboard < 500ms (p95) desde SSR hasta hidratación | Lighthouse |
| RNF-02 | CLS en dashboard < 0.1 | Lighthouse |
| RNF-03 | Skeleton loader visible durante SSR + hidratación para evitar layout shift | CLS < 0.1 |
| RNF-04 | Las queries del read model deben ejecutarse en paralelo en el servidor | SSR < 300ms |
| RNF-05 | El dashboard debe renderizarse con `client:idle` para no bloquear el paint | LCP < 2.5s |
| RNF-06 | Las animaciones de entrada (fade-in-up) deben respetar `prefers-reduced-motion` | WCAG 2.1 |
| RNF-07 | Los textos de error no exponen detalles internos | OWASP A05 |
| RNF-08 | Las props pasadas al componente Vue deben ser serializadas (sin closures) | SSR compatible |
| RNF-09 | La barra de progreso debe animarse con `transition: width 0.5s ease` | UX smooth |

---

## 5. Contratos de Interfaz (TypeScript)

### Value Objects (del DDD)

```typescript
// ---- Dashboard Contracts ----

// Value Objects
type UserId = string   // UUID v4
type Greeting = string // "Buenos días, Juan 👋"
type StreakCount = number
type PointTotal = number
type Percentage = number // 0-100

interface GreetingVO {
  timeGreeting: string  // "Buenos días" | "Buenas tardes" | "Buenas noches"
  userName: string
  full: string          // "Buenos días, Juan 👋"
}

interface ProgressRatio {
  reviewed: number
  total: number
  percentage: Percentage
}

interface QuickAction {
  label: string         // "Continuar estudiando"
  route: string         // "/review"
  icon: string          // "▶️"
  variant: 'primary' | 'secondary'
}

// Read Model (CQRS)
interface DashboardReadModel {
  userId: UserId
  greeting: GreetingVO
  points: PointTotal
  streak: {
    current: StreakCount
    longest: StreakCount
  }
  progress: ProgressRatio
  badges: BadgeDTO[]
  quickActions: QuickAction[]
}

// DTOs
interface BadgeDTO {
  id: string
  name: string
  description: string
  icon: string
  level: 'basic' | 'intermediate' | 'advanced'
  unlockedAt: string // ISO 8601
}

// Integration Events (consumidos por Dashboard)
interface PointsAwarded {
  userId: UserId
  points: number
  newTotal: number
  timestamp: string
}

interface StreakUpdated {
  userId: UserId
  currentStreak: number
  longestStreak: number
  timestamp: string
}

interface BadgeUnlocked {
  userId: UserId
  badgeId: string
  badge: BadgeDTO
  timestamp: string
}

interface SessionCompleted {
  userId: UserId
  sessionId: string
  cardsReviewed: number
  timestamp: string
}

// Action Input/Output
interface DashboardOutput {
  success: true
  data: DashboardReadModel
}

interface DashboardError {
  success: false
  error: AppErrorCode
  message: string
}
```

### Zod Schema (server-side validation)

```typescript
// En actions/index.ts — validación de query params si se requiere
const dashboardQuerySchema = z.object({
  userId: z.string().uuid(),
})
```

---

## 6. Escenarios de Error

| Código | Escenario | Mensaje Usuario | HTTP/Acción |
|--------|-----------|-----------------|-------------|
| ERR-01 | Error al obtener user_stats | "No pudimos cargar tus estadísticas." | Error interno → toast |
| ERR-02 | Error al obtener user_preferences | "No pudimos cargar tus preferencias." | Error interno → toast |
| ERR-03 | Error al obtener progreso de tarjetas | "No pudimos cargar tu progreso." | Error interno → toast |
| ERR-04 | Error al obtener insignias | "No pudimos cargar tus insignias." | Error interno → toast |
| ERR-05 | Sin sesión activa | Redirect a `/login` | Middleware 302 |
| ERR-06 | Error de red en SSR | "No se pudo conectar. Verifica tu conexión." | Catch en fetch |
| ERR-07 | Sin temas seleccionados | Progreso muestra "0/0" sin barra | Caso borde manejado |

---

## 7. KPIs y Métricas

| KPI | Objetivo | Cómo se mide |
|-----|----------|-------------|
| Tasa de clic en "Continuar estudiando" | > 60% | Evento de clic / visitas al dashboard |
| Tasa de clic en "Ir a biblioteca" | > 20% | Evento de clic / visitas al dashboard |
| Tiempo medio en dashboard | < 15s (decisión rápida) | RUM (session duration en /dashboard) |
| LCP del dashboard | < 2.5s | Lighthouse / Web Vitals |
| CLS del dashboard | < 0.1 | Lighthouse / Web Vitals |
| Friction Score | ≤ 2/10 | Clics para iniciar acción desde dashboard |
| Tasa de re-enganche (visita → inicia repaso) | > 50% | Ratio visitas a `/dashboard` → `/review` |
| Tasa de carga exitosa del dashboard | > 99% | Server logs / errores de consulta |

---

## 8. Casos de Prueba

### Pruebas Unitarias

| ID | Caso | Expected |
|----|------|----------|
| UT-01 | GreetingVO genera "Buenos días" antes de las 12:00 | Salida correcta |
| UT-02 | GreetingVO genera "Buenas tardes" entre 12:00 y 18:00 | Salida correcta |
| UT-03 | GreetingVO genera "Buenas noches" después de las 18:00 | Salida correcta |
| UT-04 | GreetingVO extrae nombre de email (juan@example.com → "Juan") | Correcto |
| UT-05 | ProgressRatio con reviewed=15, total=30 → percentage=50 | 50 |
| UT-06 | ProgressRatio con total=0 → percentage=0 (evita división por cero) | 0 |
| UT-07 | ProgressRatio con reviewed > total → clamped a 100 | 100 |
| UT-08 | Streak label: 0 → "—" | Correcto |
| UT-09 | Streak label: 1 → "1 día" | Correcto |
| UT-10 | Streak label: 5 → "5 días" | Correcto |
| UT-11 | Agrupar todas las insignias desbloqueadas (sin límite) | Todas presentes |
| UT-12 | BadgeDTO se construye correctamente desde user_badges + badges | Campos correctos |

### Pruebas de Integración

| ID | Caso | Expected |
|----|------|----------|
| IT-01 | SSR query de user_stats devuelve datos correctos | Objeto con puntos+racha |
| IT-02 | SSR query de user_progress devuelve count correcto | Número ≥ 0 |
| IT-03 | SSR query de cards filtrado por temas devuelve count | Número ≥ 0 |
| IT-04 | SSR query de user_badges con join a badges devuelve array | BadgeDTO[] |
| IT-05 | Sin temas seleccionados, totalCards = 0 | Progreso muestra 0/0 |
| IT-06 | Sin registros en user_progress, reviewedCount = 0 | 0 |
| IT-07 | Las 4 queries SSR se ejecutan en paralelo | Tiempo total < max individual |
| IT-08 | Props serializadas llegan correctamente al componente Vue | Tipos coinciden |

### Pruebas E2E (Playwright)

| ID | Caso | Expected |
|----|------|----------|
| E2E-01 | Dashboard carga con todos los datos visibles | Saludo + stats + badges |
| E2E-02 | Clic en "Continuar estudiando" → navega a /review | URL cambia |
| E2E-03 | Clic en "Ir a biblioteca" → navega a /library | URL cambia |
| E2E-04 | Sin insignias → mensaje vacío visible | EmptyState se muestra |
| E2E-05 | Barra de progreso muestra el porcentaje correcto | Texto y ancho coinciden |
| E2E-06 | Recarga de página mantiene datos del dashboard | Mismos valores |
| E2E-07 | Skeleton loader visible durante carga | Loader presente |
| E2E-08 | Dashboard sin sesión → redirect a /login | 302 |

### Pruebas de Accesibilidad

| ID | Caso | Expected |
|----|------|----------|
| A11Y-01 | Barra de progreso tiene `role="progressbar"` y `aria-valuenow` | Atributos presentes |
| A11Y-02 | Animaciones respetan `prefers-reduced-motion` | Sin animación |
| A11Y-03 | Botones tienen texto descriptivo accesible | aria-label o texto visible |
| A11Y-04 | Navegación por teclado en botones de acción | Tab order correcto |
| A11Y-05 | Contraste de colores en badges cumple WCAG AA | Ratio ≥ 4.5:1 |
