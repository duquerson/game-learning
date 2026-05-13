---
title: BDG-008 — Sistema de Insignias
version: 1.0
date_created: 2026-05-13
owner: Equipo de Producto — MicroLearn
tags: especificación, insignias, badges, gamification, behavioral-design, ddd
---

# BDG-008: Sistema de Insignias

## 1. Propósito y Alcance

Sistema de 9 insignias clasificadas por nivel (básica, intermedia, avanzada) y categoría (logro, racha, maestría) que se desbloquean automáticamente al cumplir condiciones de progreso. Incluye evaluación post-sesión, animación de celebración al desbloquear, y página `/badges` con galería de insignias obtenidas.

El alcance incluye: catálogo de 9 insignias, evaluación de condiciones al completar sesión, persistencia en `user_badges`, página de insignias con clasificación, animación de confeti/glow al desbloquear, y notificación toast. Queda fuera del alcance: insignias animadas en 3D, compartir insignias en redes sociales, tabla de líderes por insignias, insignias por eventos externos (webinars, descargas).

## 2. Definiciones

| Término | Definición |
|---------|-----------|
| Insignia | Logro desbloqueable que representa un hito de progreso |
| Nivel | Clasificación de dificultad (básica, intermedia, avanzada) |
| Categoría | Tipo de logro (logro, racha, maestría) |
| Condición | Regla JSONB que determina cuándo se desbloquea una insignia |
| Desbloqueo | Acción de insertar registro en `user_badges` al cumplirse la condición |

## 3. Catálogo de 9 Insignias

| # | Insignia | Condición | Nivel | Categoría | Tipo de Condición |
|---|----------|-----------|-------|-----------|-------------------|
| 1 | 🌱 Primer paso | Completar la primera tarjeta correctamente | básica | logro | `first_correct` |
| 2 | ⚡ En racha | 3 respuestas correctas consecutivas en una sesión | básica | racha | `correct_streak: 3` |
| 3 | 📚 Estudioso | Repasar 50 tarjetas en total | básica | logro | `total_reviewed: 50` |
| 4 | 🔥 Semana de fuego | 7 días de racha diaria | intermedia | racha | `daily_streak: 7` |
| 5 | 🎯 Experto JS | Completar todas las tarjetas de JavaScript | intermedia | maestría | `topic_mastery: JavaScript` |
| 6 | 🚀 Centurión | 100 respuestas correctas acumuladas | intermedia | logro | `total_correct: 100` |
| 7 | 🏆 Perfeccionista | Sesión con 100% de aciertos (mín. 5 tarjetas) | intermedia | logro | `perfect_session: 5` |
| 8 | 💎 Maestro TS | Completar todas las tarjetas de TypeScript | avanzada | maestría | `topic_mastery: TypeScript` |
| 9 | 👑 Maestro total | Completar todo el contenido disponible | avanzada | maestría | `all_cards_mastery` |

## 4. User Stories

### US-001: Desbloqueo automático de insignia al cumplir condición
- **Resumen**: Insignia se desbloquea al finalizar sesión si se cumple su condición
- **Como** estudiante **quiero** que las insignias se desbloqueen automáticamente al cumplir las condiciones **para** sentirme recompensado sin fricción
- **Escenario:** Condición cumplida post-sesión
- **Dado** que estoy en una sesión de repaso
- **y** que al finalizar la sesión se cumple la condición de una insignia que aún no tengo
- **Cuando** la función de verificación se ejecuta al completar la sesión
- **Entonces** la insignia se desbloquea automáticamente y se guarda en `user_badges` con la fecha actual

### US-002: Animación de celebración al desbloquear
- **Resumen**: Confetti o glow al obtener una insignia nueva
- **Como** estudiante **quiero** ver una animación destacada cuando desbloqueo una insignia **para** celebrar el logro
- **Escenario:** Insignia recién desbloqueada
- **Dado** que acabo de desbloquear una insignia
- **Cuando** la insignia se desbloquea
- **Entonces** veo una animación de celebración (confetti + glow en el badge)

### US-003: Página de insignias
- **Resumen**: Galería en `/badges` con insignias obtenidas
- **Como** estudiante **quiero** ver todas mis insignias desbloqueadas en una página dedicada **para** sentir orgullo de mi colección
- **Escenario:** Navegación a /badges
- **Dado** que quiero ver mi colección
- **Cuando** navego a la página `/badges`
- **Entonces** veo todas las insignias que he desbloqueado, cada una mostrando su ícono, nombre, nivel, categoría y fecha de obtención

### US-004: Insignias bloqueadas no visibles
- **Resumen**: Solo se muestran insignias obtenidas; las bloqueadas no aparecen
- **Como** estudiante **quiero** que solo se muestren las insignias que ya tengo **para** evitar spoilers y mantener el misterio
- **Escenario:** Galería con insignias pendientes
- **Dado** que estoy en la página de insignias
- **y** que aún no he desbloqueado ciertas insignias
- **Cuando** veo la galería
- **Entonces** solo se muestran las insignias que ya tengo; las bloqueadas no aparecen hasta que se desbloqueen

### US-005: Notificación toast al desbloquear
- **Resumen**: Toast efímero al obtener insignia durante la sesión
- **Como** estudiante **quiero** una notificación inmediata cuando desbloqueo una insignia durante el repaso **para** saber que lo logré sin esperar a la página de resultados
- **Escenario:** Desbloqueo durante sesión
- **Dado** que estoy en una sesión de repaso
- **Cuando** se desbloquea una insignia al completar la sesión
- **Entonces** veo un toast con el ícono y nombre de la insignia, y luego en la página de resultados veo la sección "Nuevas insignias"

## 5. Requerimientos Funcionales

- **RF-001**: El sistema debe mantener un catálogo de 9 insignias en la tabla `badges` con campos: id, name, description, icon, level, condition (JSONB)
- **RF-002**: La evaluación de condiciones debe ejecutarse al completar cada sesión de repaso (en `review.completeSession`)
- **RF-003**: La evaluación debe ser idempotente: si el usuario ya tiene la insignia, no se desbloquea de nuevo
- **RF-004**: Las condiciones deben evaluarse contra `BadgeConditionContext` que incluye: totalReviewed, correctAnswers, currentStreak, correctStreak, sessionCorrect, sessionTotal, topicProgress
- **RF-005**: El desbloqueo debe insertar un registro en `user_badges` con user_id, badge_id y unlocked_at (timestamp)
- **RF-006**: La página `/badges` debe mostrar todas las insignias desbloqueadas con ícono, nombre, descripción, nivel, categoría y fecha de desbloqueo
- **RF-007**: Las insignias bloqueadas no deben mostrarse en la galería hasta que se desbloqueen
- **RF-008**: Al desbloquear una insignia, debe mostrarse una animación de celebración (confetti + glow en el componente)
- **RF-009**: Al desbloquear una insignia, debe mostrarse un toast notificando al usuario
- **RF-010**: Las insignias desbloqueadas deben destacarse visualmente (borde de color primario, opacidad completa)
- **RF-011**: La página de resultados (`/results`) debe mostrar una sección con las insignias recién desbloqueadas
- **RF-012**: El resumen en la galería debe mostrar el contador "X / 9 insignias desbloqueadas"
- **RF-013**: El catálogo de insignias debe cargarse desde Supabase con política RLS de solo lectura para usuarios autenticados
- **RF-014**: `user_badges` debe tener unique constraint (user_id, badge_id) para garantizar idempotencia a nivel de BD

## 6. Requerimientos No Funcionales

- **RNF-001 — Rendimiento**: Evaluación de condiciones debe completarse en < 100ms (operación en servidor, consultas a Supabase)
- **RNF-002 — Rendimiento**: Carga de página `/badges` debe completar en < 500ms p95 (2 queries: badges + user_badges)
- **RNF-003 — Consistencia**: Unique constraint (user_id, badge_id) evita duplicados incluso en race conditions
- **RNF-004 — Consistencia**: `unlocked_at` nunca se modifica después de la inserción (inmutabilidad del logro)
- **RNF-005 — Seguridad**: RLS policies deben garantizar que un usuario solo vea/modifique sus propios registros en `user_badges`
- **RNF-006 — Seguridad**: El catálogo `badges` es público (SELECT para authenticated), pero solo el servidor puede insertar en `user_badges`
- **RNF-007 — Accesibilidad**: La animación de confetti debe respetar `prefers-reduced-motion`
- **RNF-008 — UX**: El toast de insignia nueva debe durar mínimo 4 segundos o hasta que el usuario lo descarte
- **RNF-009 — Disponibilidad**: Si Supabase falla al insertar `user_badges`, la sesión se completa igual (el desbloqueo se reintenta en la siguiente sesión)

## 7. Restricciones y Reglas de Negocio

- **RN-001**: Las insignias nunca se pierden una vez obtenidas (no hay DELETE ni UPDATE de `user_badges`)
- **RN-002**: La verificación de condiciones ocurre exclusivamente al completar cada sesión de repaso
- **RN-003**: Cada insignia se guarda con `user_id`, `badge_id` y `unlocked_at`
- **RN-004**: Animación de desbloqueo reproducible solo la primera vez (no se repite al recargar)
- **RN-005**: Clasificación visible en la galería: nivel (básica/intermedia/avanzada) y categoría (logro/racha/maestría)
- **RN-006**: La condición `perfect_session` requiere mínimo 5 tarjetas en la sesión (no aplica con menos)
- **RN-007**: `topic_mastery` cuenta solo tarjetas respondidas correctamente (no basta con haberlas visto)
- **RN-008**: `all_cards_mastery` requiere que todos los topics tengan 100% de tarjetas correctas
- **RN-009**: `correct_streak` se refiere a la racha máxima dentro de la sesión actual, no la racha acumulada histórica
- **CON-001**: Stack fijo: Astro 5 + Vue 3 + Pinia + TailwindCSS v4 + Supabase + Vercel
- **CON-002**: El catálogo `badges` se siembra con seed.sql (no hay CRUD de administración)
- **CON-003**: `canvas-confetti` ya incluido en package.json para la animación

## 8. Contratos de Interfaz

```typescript
// ─── Value Objects ───────────────────────────────────────────────

type BadgeLevel = 'basic' | 'intermediate' | 'advanced'

type BadgeCategory = 'achievement' | 'streak' | 'mastery'

type BadgeConditionType =
  | 'first_correct'
  | 'correct_streak'
  | 'total_reviewed'
  | 'daily_streak'
  | 'topic_mastery'
  | 'total_correct'
  | 'perfect_session'
  | 'all_cards_mastery'

interface BadgeCondition {
  readonly type: BadgeConditionType
  readonly threshold?: number
  readonly topic?: string
  readonly min_cards?: number
}

interface UnlockedAt {
  readonly iso: string // ISO 8601
}

// ─── Domain Entities ─────────────────────────────────────────────

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  level: BadgeLevel
  category?: BadgeCategory
  condition: BadgeCondition
}

interface UserBadge {
  badgeId: string
  unlockedAt: string
}

// ─── Domain Services ─────────────────────────────────────────────

interface BadgeEvaluationService {
  evaluate(
    context: BadgeConditionContext,
    unlockedBadgeIds: string[],
    allBadges: Badge[]
  ): Badge[]
}

interface BadgeConditionContext {
  totalReviewed: number
  correctAnswers: number
  currentStreak: number
  correctStreak: number
  sessionCorrect: number
  sessionTotal: number
  topicProgress: Record<string, { reviewed: number; total: number }>
}

// ─── Repository Port ─────────────────────────────────────────────

interface BadgeRepository {
  findAll(): Promise<Badge[]>
  findById(badgeId: string): Promise<Badge | null>
  findByLevel(level: BadgeLevel): Promise<Badge[]>
}

interface UserBadgeRepository {
  findByUserId(userId: string): Promise<UserBadge[]>
  findByBadgeId(badgeId: string): Promise<UserBadge[]>
  exists(userId: string, badgeId: string): Promise<boolean>
  save(userBadge: { userId: string; badgeId: string }): Promise<void>
  saveBatch(entries: Array<{ userId: string; badgeId: string }>): Promise<void>
}

// ─── API Contracts ───────────────────────────────────────────────

// POST /actions/review.completeSession (ya existe, extiende respuesta)
interface CompleteSessionResponse {
  newBadges: Badge[]
  updatedStats: UserStats
}

// GET /api/user/badges
interface GetUserBadgesRequest {
  userId: string
}

interface GetUserBadgesResponse {
  badges: Badge[]
  unlockedBadges: UserBadge[]
  totalUnlocked: number
}

// ─── Eventos ─────────────────────────────────────────────────────

interface BadgeUnlockedEvent {
  userId: string
  badgeId: string
  badge: BadgeDTO
  timestamp: string
}

// ─── Error Types ─────────────────────────────────────────────────

type BadgesErrorCode =
  | 'BADGE_ALREADY_UNLOCKED'      // Intento de duplicado (catch unique constraint)
  | 'BADGE_EVALUATION_FAILED'     // Error al evaluar condiciones
  | 'BADGE_INSERT_FAILED'         // Error al insertar en user_badges
  | 'BADGES_FETCH_FAILED'         // Error al cargar catálogo
  | 'USER_BADGES_FETCH_FAILED'    // Error al cargar insignias del usuario

interface BadgesError {
  code: BadgesErrorCode
  message: string
  details?: Record<string, unknown>
}
```

## 9. Escenarios de Error

- **ERR-001**: Intento de desbloquear insignia ya obtenida → Unique constraint lo rechaza. El servicio es idempotente, no debería ocurrir.
- **ERR-002**: DB timeout al consultar `badges` → Retry 1 vez. Si persiste, la sesión se completa sin evaluación de insignias.
- **ERR-003**: DB timeout al insertar en `user_badges` → Se loggea el error. El usuario no pierde progreso; el desbloqueo se reintenta en la próxima sesión.
- **ERR-004**: `topicProgress` vacío o mal formado → Las condiciones `topic_mastery` y `all_cards_mastery` retornan false.
- **ERR-005**: Sesión con 0 tarjetas → No se ejecuta evaluación de insignias (no hay contexto).
- **ERR-006**: Condición JSONB inválida en catálogo → Se ignora esa insignia (default false).
- **ERR-007**: Race condition en inserción paralela → Unique constraint (user_id, badge_id) garantiza que solo un INSERT procede.

## 10. Criterios de Aceptación Globales

- **AC-001**: Dado un usuario que completa su primera tarjeta correcta, Cuando finaliza la sesión, Entonces desbloquea "🌱 Primer paso"
- **AC-002**: Dado un usuario con 3 correctas consecutivas en sesión, Cuando finaliza la sesión, Entonces desbloquea "⚡ En racha"
- **AC-003**: Dado un usuario con 50+ tarjetas repasadas, Cuando finaliza la sesión, Entonces desbloquea "📚 Estudioso"
- **AC-004**: Dado un usuario con racha diaria >= 7, Cuando finaliza la sesión, Entonces desbloquea "🔥 Semana de fuego"
- **AC-005**: Dado un usuario que completó todas las tarjetas JS correctamente, Cuando finaliza la sesión, Entonces desbloquea "🎯 Experto JS"
- **AC-006**: Dado un usuario con 100+ respuestas correctas, Cuando finaliza la sesión, Entonces desbloquea "🚀 Centurión"
- **AC-007**: Dado un usuario con 100% de aciertos en sesión de 5+ tarjetas, Cuando finaliza la sesión, Entonces desbloquea "🏆 Perfeccionista"
- **AC-008**: Dado un usuario que completó todas las tarjetas TS correctamente, Cuando finaliza la sesión, Entonces desbloquea "💎 Maestro TS"
- **AC-009**: Dado un usuario que completó todo el contenido, Cuando finaliza la sesión, Entonces desbloquea "👑 Maestro total"
- **AC-010**: Dado que se desbloquea cualquier insignia, Cuando se completa la sesión, Entonces se muestra confetti y toast
- **AC-011**: Dado que navego a `/badges`, Cuando la página carga, Entonces veo el contador "X / 9" y las insignias desbloqueadas
- **AC-012**: Dado que tengo 0 insignias, Cuando navego a `/badges`, Entonces veo un estado vacío con llamado a la acción

## 11. KPIs y Métricas de Éxito

| KPI | Target | Medición |
|-----|--------|----------|
| Tasa de desbloqueo básicas | > 80% a los 7 días | % de usuarios que desbloquearon al menos 1 insignia básica en primera semana |
| Tasa de desbloqueo intermedias | > 40% a los 30 días | % de usuarios con al menos 1 insignia intermedia |
| Tasa de desbloqueo avanzadas | > 10% a los 60 días | % de usuarios con al menos 1 insignia avanzada |
| Coleccionistas (5+ insignias) | > 15% a los 60 días | % de usuarios con 5 o más insignias desbloqueadas |
| Visitas a `/badges` | > 30% de usuarios activos/semana | % de usuarios activos que visitan la página de insignias |
| Tiempo medio en `/badges` | > 15 segundos | Tiempo de permanencia en la página |
| "Primer paso" D1 | > 70% | % de usuarios nuevos que desbloquean Primer paso el primer día |
| Retención D7 en coleccionistas | +15% vs no-coleccionistas | D7 de usuarios con >= 3 insignias vs < 3 |

## 12. Dependencias y Supuestos

- **DEP-001**: Tabla `badges` existente en Supabase con columnas: id, name, description, icon, level, condition (JSONB)
- **DEP-002**: Tabla `user_badges` existente con columnas: id, user_id, badge_id, unlocked_at + UNIQUE(user_id, badge_id)
- **DEP-003**: Función `evaluateBadgeConditions` existente en `src/lib/badges.ts`
- **DEP-004**: Acción `review.completeSession` existente en `src/actions/index.ts` con evaluación de insignias
- **DEP-005**: Tipos `Badge`, `UserBadge`, `BadgeConditionContext` existentes en `src/types/app.ts`
- **DEP-006**: Componentes `BadgeItem.vue` y `BadgeGrid.vue` existentes en `src/components/badges/`
- **DEP-007**: Página `src/pages/badges.astro` existente
- **DEP-008**: `canvas-confetti` ya en package.json
- **DEP-009**: Seed data de 9 insignias en `supabase/seed.sql`
- **SUP-001**: Usuario siempre autenticado (JWT válido) al interactuar con el sistema
- **SUP-002**: El catálogo de insignias es fijo (9 insignias, no cambia dinámicamente)
- **SUP-003**: No hay administración de insignias (no hay UI de CRUD)

## 13. Casos de Prueba

### CP-001: Desbloqueo de "Primer paso"
- **Relación**: US-001, RF-001, RF-002, RF-003
- **Precondiciones**: Usuario nuevo, sin insignias, con 1 respuesta correcta en la sesión
- **Pasos**: Completar sesión con al menos 1 correcta
- **Resultado**: "🌱 Primer paso" se guarda en `user_badges`. toast y confetti se muestran.

### CP-002: Idempotencia — no desbloquear dos veces
- **Relación**: RF-003
- **Precondiciones**: Usuario ya tiene "🌱 Primer paso" desbloqueada
- **Pasos**: Completar otra sesión con 1+ correcta
- **Resultado**: No se inserta duplicado. `evaluateBadgeConditions` retorna [].

### CP-003: Desbloqueo de "Perfeccionista" con 100%
- **Relación**: US-001, RF-004
- **Precondiciones**: Sesión activa con 5 tarjetas, 0 fallos
- **Pasos**: Responder 5 correctas → Completar sesión
- **Resultado**: "🏆 Perfeccionista" se desbloquea.

### CP-004: "Perfeccionista" no se desbloquea con < 5 tarjetas
- **Relación**: RN-006
- **Precondiciones**: Sesión con 3 tarjetas, 100% aciertos
- **Pasos**: Completar sesión
- **Resultado**: "🏆 Perfeccionista" NO se desbloquea (no cumple min_cards).

### CP-005: Desbloqueo de "Experto JS"
- **Relación**: AC-005, RN-007
- **Precondiciones**: Usuario ha respondido correctamente todas las tarjetas JS (15 tarjetas)
- **Pasos**: Completar cualquier sesión
- **Resultado**: "🎯 Experto JS" se desbloquea.

### CP-006: "Experto JS" no se desbloquea si faltan tarjetas
- **Relación**: RN-007
- **Precondiciones**: Usuario ha respondido 14 de 15 tarjetas JS correctamente
- **Pasos**: Completar sesión
- **Resultado**: "🎯 Experto JS" NO se desbloquea.

### CP-007: Desbloqueo de "Maestro total"
- **Relación**: AC-009, RN-008
- **Precondiciones**: Usuario ha respondido correctamente todas las tarjetas de todos los topics
- **Pasos**: Completar cualquier sesión
- **Resultado**: "👑 Maestro total" se desbloquea.

### CP-008: Animación de confetti al desbloquear
- **Relación**: US-002, RF-008
- **Precondiciones**: Usuario a punto de desbloquear una insignia. `prefers-reduced-motion: no-preference`
- **Pasos**: Completar sesión que desbloquea insignia
- **Resultado**: `canvas-confetti` se dispara con particleCount >= 80.

### CP-009: Sin confetti si prefers-reduced-motion
- **Relación**: RNF-007
- **Precondiciones**: Usuario con `prefers-reduced-motion: reduce`
- **Pasos**: Completar sesión que desbloquea insignia
- **Resultado**: No se dispara confetti. El toast y el highlight visual sí se muestran.

### CP-010: Página /badges muestra contador correcto
- **Relación**: US-003, RF-006, RF-012
- **Precondiciones**: Usuario con 3 insignias desbloqueadas
- **Pasos**: Navegar a /badges
- **Resultado**: Se muestra "3 / 9 insignias desbloqueadas". Las 3 insignias se muestran con ícono, nombre, nivel y fecha.

### CP-011: Estado vacío en /badges
- **Relación**: AC-012
- **Precondiciones**: Usuario sin insignias
- **Pasos**: Navegar a /badges
- **Resultado**: Se muestra EmptyState con mensaje "¡Aún no tienes insignias!" y CTA a /review.

### CP-012: Insignias bloqueadas no visibles
- **Relación**: US-004, RF-007
- **Precondiciones**: Usuario con 3 de 9 insignias
- **Pasos**: Navegar a /badges
- **Resultado**: Solo 3 insignias visibles en el DOM. Las 6 restantes no aparecen.

### CP-013: Toast al desbloquear desde reviewStore
- **Relación**: US-005, RF-009
- **Precondiciones**: Usuario en sesión activa
- **Pasos**: Completar sesión que desbloquea 1+ insignias
- **Resultado**: Toast aparece con formato "🏆 ¡Nueva insignia! 🌱 Primer paso".

### CP-014: Múltiples insignias en una sola sesión
- **Precondiciones**: Usuario nuevo. Sesión con 5 tarjetas, 100% correctas, primera sesión
- **Pasos**: Completar sesión
- **Resultado**: Se desbloquean "🌱 Primer paso" + "⚡ En racha" + "🏆 Perfeccionista" simultáneamente. Múltiples toasts y sección en resultados.

### CP-015: Evaluación post-sesión con error de BD
- **Relación**: ERR-003, RNF-009
- **Precondiciones**: Supabase no disponible para INSERT en user_badges
- **Pasos**: Completar sesión que debería desbloquear insignia
- **Resultado**: La sesión se completa. El error se loggea. La insignia se reintenta en la próxima sesión.
