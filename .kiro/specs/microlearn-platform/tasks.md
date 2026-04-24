# Implementation Plan: MicroLearn Platform

## Overview

Plan de implementación incremental para MicroLearn, una plataforma de microaprendizaje gamificada con Astro 5 SSR + Vue 3 + Pinia + TailwindCSS v4 + Supabase. Cada tarea construye sobre la anterior, comenzando por la infraestructura y terminando con el deploy en Vercel.

---

## Tasks

- [x] 1. Setup del proyecto
  - [x] 1.1 Inicializar proyecto Astro 5 con adaptador Vercel y modo SSR
    - Ejecutar `pnpm create astro@latest` con template mínimo
    - Instalar `@astrojs/vercel` y configurar `output: 'server'` en `astro.config.mjs`
    - Añadir campo `"packageManager": "pnpm@<version>"` en `package.json`
    - Verificar que no existen `package-lock.json` ni `yarn.lock`
    - _Implements: R16.1, R16.2, R16.7_

  - [x] 1.2 Instalar e integrar Vue 3 y Pinia
    - Ejecutar `pnpm add @astrojs/vue vue pinia @pinia/nuxt`
    - Añadir integración `vue()` en `astro.config.mjs`
    - Crear `src/stores/.gitkeep` para reservar la carpeta
    - _Implements: R17.4_

  - [x] 1.3 Instalar y configurar TailwindCSS v4
    - Ejecutar `pnpm add @astrojs/tailwind tailwindcss@next`
    - Añadir integración `tailwind()` en `astro.config.mjs` sin `tailwind.config.js`
    - Crear `src/styles/global.css` con directiva `@import "tailwindcss"` y bloque `@theme {}` vacío
    - _Implements: R13.7_

  - [x] 1.4 Instalar Supabase y dependencias de auth
    - Ejecutar `pnpm add @supabase/supabase-js @supabase/ssr`
    - Crear `.env` con variables `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`
    - Añadir `.env` a `.gitignore`
    - _Implements: R18.4, R18.5_

  - [x] 1.5 Instalar herramientas de testing y notificaciones
    - Ejecutar `pnpm add -D vitest @vitest/ui fast-check playwright @playwright/test`
    - Ejecutar `pnpm add vue-sonner`
    - Configurar `vitest.config.ts` con entorno `jsdom`
    - _Implements: R16.1_


- [x] 2. Tipos TypeScript y módulos de lógica de negocio pura
  - [x] 2.1 Crear tipos de base de datos y dominio
    - Escribir `src/types/database.ts` con interfaces `DbCard`, `DbBadge`, `DbUserProgress`, `DbUserStats`, `DbUserBadge`, `DbUserPreferences` y `BadgeConditionJson`
    - Escribir `src/types/app.ts` con tipos `Difficulty`, `ReviewMode`, `BadgeLevel`, `Card`, `Badge`, `UserBadge`, `UserStats`, `UserPreferences`, `SessionResult`, `QuizOption`, `BadgeConditionContext`, `SubmitAnswerResult`, `CompleteSessionResult`
    - _Implements: R17.1, R17.2_

  - [x] 2.2 Implementar `src/lib/points.ts`
    - Exportar constante `BASE_POINTS` con valores `{ easy: 10, medium: 20, hard: 30 }`
    - Implementar `calculatePoints(difficulty, correct): number` — devuelve 0 si incorrecto
    - Implementar `calculateStreakBonus(correctStreak): number` — +5 en streak=3, +15 en streak=5, +5 en múltiplos de 3 mayores a 5
    - Implementar `applyPoints(current, difficulty, correct, streak): number`
    - _Implements: R7.1, R7.2, R7.3, R7.4, R7.5, R7.6, R7.7, R7.8, R17.2_

  - [x] 2.3 Implementar `src/lib/streak.ts`
    - Exportar interfaz `StreakState`
    - Implementar `isStreakBroken(lastDate, today): boolean`
    - Implementar `updateStreak(state, today): StreakState` con los cuatro casos: mismo día, día siguiente, más de 1 día, sin fecha previa
    - _Implements: R8.1, R8.2, R8.3, R8.4, R8.5, R8.6, R17.2_

  - [x] 2.4 Implementar `src/lib/badges.ts`
    - Implementar función interna `meetsCondition(condition, ctx): boolean` con switch sobre todos los tipos de `BadgeConditionJson`
    - Implementar `evaluateBadgeConditions(context, unlockedBadgeIds, allBadges): Badge[]` como función pura
    - _Implements: R9.1–R9.9, R9.11, R15.3, R17.2_

  - [x] 2.5 Implementar `src/lib/supabase.ts`
    - Exportar cliente browser `supabase` usando `createClient`
    - Exportar función `createSupabaseServerClient(cookies)` usando `createServerClient` de `@supabase/ssr`
    - _Implements: R18.4, R18.5, R18.6_

  - [x] 2.6 Implementar `src/lib/theme.ts` — utilidades de tema
    - Exportar función `getInitialTheme(): 'light' | 'dark'` que lee `localStorage.getItem('theme')`
    - Exportar función `applyTheme(theme: 'light' | 'dark'): void` que aplica `data-theme` al `documentElement`
    - Exportar función `persistTheme(theme: 'light' | 'dark'): void` que escribe en `localStorage`
    - _Implements: R13.9, R17.1, R17.2_

  - [x] 2.7 Implementar `src/lib/quiz.ts` — Quiz_Generator
    - Implementar `generateQuizOptions(card, topicCards, allCards): QuizOption[]`
    - Seleccionar 3 distractores aleatorios del mismo topic, excluyendo la tarjeta actual
    - Si hay menos de 3 tarjetas del mismo topic, completar con tarjetas de otros topics
    - Devolver array de 4 opciones mezcladas aleatoriamente con flag `isCorrect`
    - _Implements: R6.2, R6.3, R6.4, R6.5_

  - [x] 2.8 Implementar `src/lib/errors.ts` — módulo centralizado de errores
    - Definir tipo `AppErrorCode` con los 7 códigos: UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, NETWORK_ERROR, INTERNAL_ERROR, SESSION_EXPIRED
    - Implementar interfaz `AppError` con campos: code, message (para usuario), detail (solo server), timestamp, path
    - Implementar constante `USER_ERROR_MESSAGES` con mensajes genéricos y seguros para cada código
    - Implementar `createAppError(code, detail?, path?): AppError`
    - Implementar `logServerError(error: AppError): void` — solo para uso server-side en Actions y Middleware
    - Implementar `mapSupabaseError(error): AppErrorCode` — mapea códigos HTTP/Supabase a AppErrorCode
    - _Implements: R14.4, R18.7, R19.6_


- [x] 3. Tests unitarios y PBT con Vitest + fast-check
  - [x] 3.1 Escribir tests para `points.ts`
    - [x] 3.1.1 PBT — Property 1: `calculatePoints` es determinista y correcto por dificultad
      - Usar `fc.constantFrom('easy','medium','hard')` y `fc.boolean()` para generar inputs
      - Verificar que `calculatePoints(d, true) === BASE_POINTS[d]` y `calculatePoints(d, false) === 0`
      - **Property 1 del diseño — Validates: R7.1, R7.2, R7.3, R7.6**
    - [x] 3.1.2 PBT — Property 2: `calculateStreakBonus` devuelve el bonus correcto en los umbrales
      - Verificar que `calculateStreakBonus(3) === 5`, `calculateStreakBonus(5) === 15`, y `0` para valores no umbral (1, 2, 4)
      - Verificar que para `streak > 5` el bonus se otorga en múltiplos de 3
      - **Property 2 del diseño — Validates: R7.4, R7.5, R7.8**
    - [x] 3.1.3 PBT — Property 3: `applyPoints` nunca produce total negativo
      - Generar secuencias arbitrarias de respuestas y verificar `result >= previous` y `result >= 0`
      - Verificar que respuestas incorrectas no restan puntos (`correct=false` → delta = 0)
      - **Property 3 del diseño — Validates: R7.1, R7.6, R7.7**
    - _Implements: R7.1–R7.8_

  - [x] 3.2 Escribir tests para `streak.ts`
    - [x] 3.2.1 PBT — Property 4: `updateStreak` maneja correctamente todos los casos de fecha
      - Generar `StreakState` arbitrarios y fechas `today` para cubrir los 4 casos
      - Verificar idempotencia (mismo día), incremento (día siguiente), reset (más de 1 día), inicio sin fecha previa
      - Verificar que `result.last_study_date === today` en todos los casos
      - **Property 4 del diseño — Validates: R8.1, R8.2, R8.3, R8.4, R8.6**
    - [x] 3.2.2 PBT — Property 5: `longest_streak` es monótonamente no decreciente
      - Generar secuencias de fechas y verificar que `longest_streak` nunca decrece
      - Verificar invariante `current_streak <= longest_streak`
      - **Property 5 del diseño — Validates: R8.5**
    - _Implements: R8.1–R8.6_

  - [x] 3.3 Escribir tests para `badges.ts`
    - [x] 3.3.1 PBT — Property 6: `evaluateBadgeConditions` es idempotente
      - Llamar dos veces con el mismo estado y verificar que el resultado es idéntico
      - Verificar que insignias ya desbloqueadas nunca aparecen en el resultado
      - **Property 6 del diseño — Validates: R9.1–R9.9, R9.11**
    - _Implements: R9.1–R9.11_

  - [x] 3.4 Escribir tests para `quiz.ts`
    - [x] 3.4.1 PBT — Property 7: Las opciones del Quiz son únicas y contienen la respuesta correcta
      - Generar tarjetas arbitrarias y verificar que siempre hay exactamente 4 opciones distintas
      - Verificar que el título de la tarjeta actual siempre está presente entre las opciones
      - **Property 7 del diseño — Validates: R6.2, R6.3, R6.4**
    - [x] 3.4.2 PBT — Property 8: El conteo de resultados de sesión iguala el tamaño del deck
      - Simular sesiones con decks de tamaño N y verificar que se generan exactamente N `SessionResult`
      - **Property 8 del diseño — Validates: R5.7, R6.8**
    - _Implements: R6.2–R6.5_

  - [x] 3.5 Checkpoint — Ejecutar `pnpm vitest run` y verificar que todos los tests pasan
    - Asegurar cobertura de las 8 propiedades del diseño (Properties 1–8)
    - Resolver cualquier fallo antes de continuar


- [x] 4. Base de datos Supabase — DDL, RLS y seed
  - [x] 4.1 Crear script DDL completo en `supabase/migrations/001_initial_schema.sql`
    - Crear tablas `cards`, `badges`, `user_progress`, `user_stats`, `user_badges`, `user_preferences` con todos los campos, constraints y CHECK definidos en el diseño
    - Crear índices: `idx_cards_topic`, `idx_cards_difficulty`, `idx_cards_topic_subtopic`, `idx_user_progress_user_id`, `idx_user_progress_user_card`, `idx_user_progress_reviewed_at`, `idx_user_badges_user_id`
    - _Implements: R14.1, R14.3, R15.1_

  - [x] 4.2 Configurar RLS en todas las tablas de usuario
    - Habilitar RLS en `user_progress`, `user_stats`, `user_badges`, `user_preferences` con políticas `auth.uid() = user_id`
    - Habilitar RLS en `cards` y `badges` con política de lectura para usuarios autenticados (`USING (true)`)
    - _Implements: R14.1, R14.3, R18.1_

  - [x] 4.3 Crear seed de insignias en `supabase/seed.sql`
    - Insertar las 9 insignias con sus condiciones JSONB: `first_correct`, `correct_streak(3)`, `total_reviewed(50)`, `daily_streak(7)`, `topic_mastery('JavaScript')`, `total_correct(100)`, `perfect_session(5)`, `topic_mastery('TypeScript')`, `all_cards_mastery`
    - Insertar tarjetas de ejemplo de JavaScript y TypeScript (mínimo 10 por topic)
    - _Implements: R9.1–R9.9, R15.1, R15.2_


- [x] 5. Configuración de seguridad — Middleware y Header Hardening
  - [x] 5.1 Implementar middleware de protección de rutas en `src/middleware/index.ts`
    - Usar `defineMiddleware` de Astro para interceptar todas las peticiones
    - Llamar a `createSupabaseServerClient(context.cookies).auth.getSession()`
    - Redirigir a `/login` si no hay sesión válida en rutas protegidas (`/dashboard`, `/library`, `/review/*`, `/results`, `/badges`, `/profile`, `/onboarding`)
    - Permitir paso libre en rutas públicas (`/login`, `/register`, `/auth/callback`)
    - _Implements: R1.9, R14.2, R18.1, R18.8_

  - [x] 5.2 Configurar Header Hardening en `vercel.json` y `astro.config.mjs`
    - Añadir headers en `vercel.json`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`
    - Eliminar o sobreescribir `X-Powered-By` y `Server` en la configuración del adaptador Vercel
    - _Implements: R20.1, R20.2, R20.3, R20.4, R20.5, R20.6, R20.7_


- [x] 6. Sistema de autenticación
  - [x] 6.1 Crear página `src/pages/login.astro` y componente `LoginForm.vue`
    - Página Astro con `BaseLayout` y `LoginForm` hidratado con `client:load`
    - Formulario con campos email y contraseña, botón de submit y botones OAuth (Google, GitHub)
    - Llamar a `supabase.auth.signInWithPassword()` para email/contraseña
    - Llamar a `supabase.auth.signInWithOAuth({ provider: 'google' | 'github' })` para OAuth
    - Mostrar mensaje "Email o contraseña incorrectos" en caso de error (sin revelar cuál falló)
    - Redirigir al Dashboard tras login exitoso
    - _Implements: R1.2, R1.3, R1.4, R1.7_

  - [x] 6.2 Crear página `src/pages/register.astro` y componente `RegisterForm.vue`
    - Formulario con email, contraseña y confirmación de contraseña
    - Llamar a `supabase.auth.signUp()` y redirigir al Onboarding_Flow tras éxito
    - Mostrar "Este email ya está registrado. ¿Quieres iniciar sesión?" si el email ya existe
    - _Implements: R1.1, R1.5, R1.6_

  - [x] 6.3 Crear página `src/pages/auth/callback.astro` para OAuth
    - Manejar el callback de OAuth de Supabase intercambiando el código por sesión
    - Redirigir al Dashboard o al Onboarding según `onboarding_completed`
    - _Implements: R1.3, R1.4, R1.5_

  - [x] 6.4 Implementar logout en `useAuthStore` y conectar al Header
    - Añadir acción `logout()` en `src/stores/auth.ts` que llame a `supabase.auth.signOut()`
    - Redirigir a `/login` tras logout exitoso
    - _Implements: R1.8_

  - [x] 6.5 Implementar persistencia de sesión en `src/stores/auth.ts`
    - Suscribirse a `supabase.auth.onAuthStateChange()` para mantener el store sincronizado
    - Verificar que la sesión persiste al menos 7 días sin re-autenticación
    - _Implements: R1.10_

  - [x] 6.6 Implementar `useUserStore` en `src/stores/user.ts`
    - Definir estado reactivo: `stats`, `preferences`, `badges`
    - Implementar `loadUserData(userId)` que carga `user_stats`, `user_preferences` y `user_badges` desde Supabase SSR
    - Implementar `updateStats(partial)` y `addBadge(badge)` para actualizaciones locales tras Actions
    - _Implements: R3.1, R3.2, R3.5, R17.4, R17.5_


- [x] 7. Layouts y componentes base
  - [x] 7.1 Definir tokens de diseño en `src/styles/global.css`
    - Completar bloque `@theme {}` con colores primarios, radios, sombras y variables de glassmorphism
    - Definir variables de tema claro en `:root` (`--color-primary: #7C3AED` y variantes)
    - Definir variables de tema oscuro en `[data-theme="dark"]` (`--color-primary: #06B6D4` y variantes)
    - Añadir gradiente de fondo y estilos base de glassmorphism
    - _Implements: R13.4, R13.5, R13.6, R13.7, R13.8_

  - [x] 7.2 Crear `src/layouts/BaseLayout.astro`
    - HTML base con `<head>` completo (meta viewport, charset, title, link a global.css)
    - Script inline para leer `localStorage.getItem('theme')` y aplicar `data-theme` antes del render
    - Slot para contenido de página
    - _Implements: R13.1, R13.9_

  - [x] 7.3 Crear `src/pages/index.astro` — redirect de entrada
    - Leer sesión con `createSupabaseServerClient`
    - Si hay sesión activa: redirigir a `/dashboard`
    - Si no hay sesión: redirigir a `/login`
    - _Implements: R1.9, R2.5_

  - [x] 7.4 Crear componentes UI base: `GlassCard.vue`, `GlassButton.vue`, `GlassBadge.vue`
    - `GlassCard.vue`: contenedor con `backdrop-blur`, `bg-white/10`, `border border-white/20`, `rounded-2xl`
    - `GlassButton.vue`: botón con variantes `primary`, `secondary`, `ghost` usando variables CSS del tema
    - `GlassBadge.vue`: chip/badge visual para niveles y estados
    - _Implements: R13.4_

  - [x] 7.5 Crear componentes de navegación: `Header.vue`, `Sidebar.vue`, `BottomNav.vue`, `ThemeToggle.vue`
    - `Header.vue`: logo + `ThemeToggle` + avatar/logout
    - `Sidebar.vue`: navegación lateral con links a Dashboard, Library, Badges, Profile (visible ≥768px)
    - `BottomNav.vue`: barra inferior con 4 iconos de navegación (visible <768px)
    - `ThemeToggle.vue`: switch que usa `useTheme()` composable para alternar tema y persistir en `localStorage`
    - _Implements: R13.2, R13.3, R13.9_

  - [x] 7.6 Crear `src/layouts/AppLayout.astro` y `ToasterWrapper.vue`
    - `AppLayout.astro`: extiende `BaseLayout`, incluye `Header`, `Sidebar` (hidden md:flex), `BottomNav` (flex md:hidden), slot de contenido y `<ToasterWrapper client:load />`
    - `ToasterWrapper.vue`: monta `<Toaster position="bottom-right" :theme="theme" rich-colors />` de `vue-sonner`
    - _Implements: R13.2, R13.3_

  - [x] 7.7 Implementar composables `useTheme.ts` y `useReviewSession.ts`
    - `useTheme.ts`: usar utilidades de `src/lib/theme.ts`, exportar `{ theme, toggle }`
    - `useReviewSession.ts`: encapsular `isFlipped`, `flipCard()`, `handleAnswer()` usando `useReviewStore`
    - _Implements: R13.9, R17.7_


- [x] 8. Astro Actions — Capa de mutaciones server-side
  - [x] 8.1 Implementar `actions.review.submitAnswer` en `src/actions/index.ts`
    - Validar input con Zod: `{ cardId: uuid, correct: boolean, difficulty: enum }`
    - Verificar sesión server-side con `createSupabaseServerClient`; retornar `UNAUTHORIZED` si no hay sesión
    - Insertar registro en `user_progress`
    - Llamar a `calculatePoints` y `calculateStreakBonus` de `src/lib/points.ts`
    - Actualizar `user_stats.total_points` de forma atómica; si `correct === false`, no modificar puntos
    - Retornar `{ success: true, data: SubmitAnswerResult }` con `pointsEarned`, `newTotal`, `streakBonus` y `correctStreak`
    - _Implements: R5.4, R5.5, R7.1–R7.8, R19.1–R19.7_

  - [x] 8.2 Implementar `actions.review.completeSession`
    - Validar input con Zod: array de `SessionResult`
    - Llamar a `updateStreak` de `src/lib/streak.ts` y actualizar `user_stats`
    - Construir `BadgeConditionContext` consultando `user_progress` y `user_stats`
    - Llamar a `evaluateBadgeConditions` de `src/lib/badges.ts`
    - Insertar nuevas insignias en `user_badges` con `unlocked_at = now()`
    - Retornar `{ success: true, data: CompleteSessionResult }` con `newBadges` y `updatedStats`
    - _Implements: R8.1–R8.6, R9.1–R9.11, R10.4, R10.5, R19.1–R19.7_

  - [x] 8.3 Implementar `actions.onboarding.savePreferences`
    - Validar input con Zod: `{ topics: string[].min(1) }`
    - Verificar sesión; retornar `UNAUTHORIZED` si no hay sesión
    - Hacer upsert en `user_preferences` con `selected_topics` y `onboarding_completed = true`
    - Crear fila inicial en `user_stats` con valores por defecto si no existe
    - _Implements: R2.3, R19.1–R19.7_

  - [x] 8.4 Implementar `actions.profile.updateTopics`
    - Validar input con Zod: `{ topics: string[].min(1) }`
    - Verificar sesión; retornar `UNAUTHORIZED` si no hay sesión
    - Actualizar `user_preferences.selected_topics`
    - _Implements: R2.6, R12.6, R19.1–R19.7_

  - [x] 8.5 Checkpoint — Verificar que todas las Actions retornan tipos correctos y manejan errores
    - Asegurar que ningún componente Vue importa el cliente Supabase para escritura
    - Verificar manejo de errores RLS con log server-side y mensaje genérico al cliente
    - _Implements: R14.4, R18.7, R19.2_


- [x] 9. Onboarding
  - [x] 9.1 Crear página `src/pages/onboarding.astro`
    - Leer topics disponibles desde `cards` (distinct topic) con cliente Supabase SSR
    - Pasar topics al componente `OnboardingForm.vue` como prop
    - Redirigir al Dashboard si `user_preferences.onboarding_completed === true`
    - _Implements: R2.1, R2.2, R2.5_

  - [x] 9.2 Crear componente `OnboardingForm.vue`
    - Mostrar lista de topics con checkboxes de selección múltiple
    - Deshabilitar botón "Continuar" si no hay ningún topic seleccionado
    - Mostrar mensaje "Selecciona al menos un tema para continuar" si se intenta confirmar sin selección
    - Llamar a `actions.onboarding.savePreferences({ topics })` al confirmar
    - Redirigir al Dashboard tras respuesta exitosa
    - _Implements: R2.2, R2.3, R2.4_


- [x] 10. Biblioteca de tarjetas
  - [x] 10.1 Crear página `src/pages/library.astro`
    - Leer todas las tarjetas desde `cards` con cliente Supabase SSR
    - Leer `user_progress` del usuario para marcar tarjetas ya repasadas
    - Pasar datos a `CardLibrary.vue` como props
    - _Implements: R4.1, R4.6, R15.2_

  - [x] 10.2 Crear componente `CardLibrary.vue` con filtros
    - Implementar filtros reactivos por topic, subtopic y difficulty usando `computed`
    - Aplicar todos los filtros activos simultáneamente (AND lógico)
    - Mostrar indicador visual en tarjetas ya repasadas
    - Mostrar conteo de resultados filtrados
    - _Implements: R4.2, R4.3, R4.4, R4.5, R4.6_

  - [x] 10.3 Crear componente `CardItem.vue`
    - Mostrar título, topic, subtopic, difficulty y badge de "repasada" si aplica
    - Al hacer click, mostrar contenido completo en modal o vista de detalle
    - _Implements: R4.1, R4.7_


- [x] 11. Modo de repaso — Self-Assessment
  - [x] 11.1 Crear página `src/pages/review/index.astro` — selección de modo
    - Mostrar opciones "Self-Assessment" y "Quiz" con descripción de cada modo
    - Leer `user_preferences.selected_topics` para pre-seleccionar el deck
    - _Implements: R5.1, R6.1_

  - [x] 11.2 Implementar `useReviewStore` en `src/stores/review.ts`
    - Implementar `initSession(cards, mode)`, `submitAnswer(cardId, correct, difficulty)`, `nextCard()`, `completeSession()`
    - Computed `currentCard` y `progress` (current/total)
    - Gestionar `correctStreak` local durante la sesión
    - Llamar a `actions.review.submitAnswer` en `submitAnswer()`
    - Llamar a `actions.review.completeSession` en `completeSession()` y redirigir a `/results`
    - _Implements: R5.4, R5.5, R5.6, R5.7, R5.8, R17.4_

  - [x] 11.3 Crear página `src/pages/review/[mode].astro` y componente `ReviewCard.vue`
    - Página Astro: cargar deck de tarjetas según topics del usuario y modo; para Quiz Mode, pasar también `topicCards` (tarjetas del mismo topic) y `allCards` (todas las tarjetas) como props a `ReviewCard`
    - `ReviewCard.vue` para Self-Assessment: mostrar título/pregunta, botón "Ver respuesta", flip para revelar contenido, botones "Lo sabía" / "No lo sabía"
    - Mostrar progreso "Tarjeta X de N" usando `store.progress`
    - _Implements: R5.1, R5.2, R5.3, R5.4, R5.5, R5.6, R5.8_


- [x] 12. Modo de repaso — Quiz
  - [x] 12.1 Integrar `generateQuizOptions` en el flujo de Quiz Mode
    - En `ReviewCard.vue` para modo quiz: llamar a `generateQuizOptions(currentCard, topicCards, allCards)` al montar cada pregunta
    - Mostrar las 4 opciones como botones de selección única
    - Mostrar progreso "Pregunta X de N"
    - _Implements: R6.1, R6.2, R6.3, R6.4, R6.5, R6.9_

  - [x] 12.2 Implementar feedback visual de respuesta en Quiz Mode
    - Al seleccionar opción correcta: resaltar en verde, llamar a `store.submitAnswer(id, true, difficulty)`
    - Al seleccionar opción incorrecta: resaltar seleccionada en rojo y correcta en verde, llamar a `store.submitAnswer(id, false, difficulty)`
    - Avanzar automáticamente a la siguiente pregunta tras breve pausa
    - _Implements: R6.6, R6.7, R6.8_


- [x] 13. Pantalla de resultados
  - [x] 13.1 Crear página `src/pages/results.astro` y componente `ReviewResults.vue`
    - Leer resultados de sesión desde `useReviewStore` (o query params si se navega directamente)
    - Mostrar: total de tarjetas, correctas, incorrectas, porcentaje de aciertos (redondeado a entero), puntos obtenidos (base + bonus)
    - Mostrar insignias recién desbloqueadas con icono y nombre si las hay
    - Botones "Repasar de nuevo" (reinicia sesión con mismo deck) y "Volver al Dashboard"
    - _Implements: R10.1, R10.2, R10.3, R10.4, R10.5, R10.6_

  - [x] 13.2 Integrar notificaciones toast en el flujo de sesión
    - `toast.success('¡+N puntos!')` al responder correctamente
    - `toast.info('¡Racha de 3! +5 puntos bonus')` al alcanzar streak=3
    - `toast.success('🏆 ¡Nueva insignia! <nombre>')` al desbloquear badge
    - `toast.error('Error al guardar el progreso. Inténtalo de nuevo.')` en caso de fallo de Action
    - _Implements: R9.10_


- [x] 14. Dashboard
  - [x] 14.1 Crear página `src/pages/dashboard.astro`
    - Leer `user_stats` (total_points, current_streak) con cliente Supabase SSR
    - Calcular tarjetas repasadas hoy filtrando `user_progress` por `reviewed_at` del día actual
    - Leer últimas 3 insignias desbloqueadas desde `user_badges` ordenadas por `unlocked_at DESC`
    - Pasar todos los datos a componentes Vue hidratados
    - _Implements: R3.1, R3.2, R3.3, R3.5_

  - [x] 14.2 Implementar UI del Dashboard con componentes Vue
    - Tarjeta de puntos totales con icono
    - Tarjeta de racha actual con icono de fuego
    - Tarjeta de tarjetas repasadas hoy
    - Sección de últimas insignias (máximo 3) con `BadgeItem`
    - Botón CTA "Iniciar repaso" que navega a `/review`
    - Mensaje motivacional cuando `cards_today === 0`
    - _Implements: R3.1, R3.2, R3.3, R3.4, R3.5, R3.6_

  - [x] 14.3 Checkpoint — Verificar flujo completo login → onboarding → dashboard
    - Asegurar que el middleware redirige correctamente en todos los casos
    - Verificar que los datos del dashboard se cargan correctamente desde Supabase


- [x] 15. Sistema de insignias — Badge Engine y pantalla
  - [x] 15.1 Crear página `src/pages/badges.astro`
    - Leer todas las insignias desde `badges` con cliente Supabase SSR
    - Leer `user_badges` del usuario para determinar cuáles están desbloqueadas
    - Pasar datos a `BadgeGrid.vue` hidratado
    - _Implements: R11.1, R11.2, R11.3, R11.4, R11.5_

  - [x] 15.2 Crear componentes `BadgeGrid.vue` y `BadgeItem.vue`
    - `BadgeGrid.vue`: agrupar insignias por nivel (basic, intermediate, advanced), mostrar conteo "N / 9"
    - `BadgeItem.vue`: mostrar icono, nombre, descripción y nivel; estado activo con fecha de desbloqueo; estado bloqueado visualmente atenuado sin revelar condición exacta
    - _Implements: R11.1, R11.2, R11.3, R11.4, R11.5_

  - [x] 15.3 Verificar integración del Badge Engine en `actions.review.completeSession`
    - Confirmar que `evaluateBadgeConditions` recibe el `BadgeConditionContext` correcto
    - Confirmar que las insignias nuevas se insertan en `user_badges` y se retornan en `CompleteSessionResult`
    - Confirmar que `toast.success` se dispara por cada insignia desbloqueada
    - _Implements: R9.1–R9.11_


- [x] 16. Perfil y estadísticas
  - [x] 16.1 Crear página `src/pages/profile.astro`
    - Leer `user_stats`, `user_preferences` y email del usuario con cliente Supabase SSR
    - Calcular total repasadas y total correctas desde `user_progress`
    - Calcular porcentaje global de aciertos `(correctas / total) * 100` redondeado a entero
    - Pasar datos a `ProfileView.vue` hidratado
    - _Implements: R12.1, R12.2, R12.3, R12.4, R12.5, R12.7_

  - [x] 16.2 Crear componente `ProfileView.vue`
    - Mostrar email del usuario, puntos totales, racha actual y máxima, total repasadas, total correctas, porcentaje de aciertos
    - Sección de edición de topics: checkboxes con topics disponibles, pre-seleccionados según `user_preferences.selected_topics`
    - Al guardar topics, llamar a `actions.profile.updateTopics({ topics })`
    - Mostrar toast de confirmación tras actualización exitosa
    - _Implements: R2.6, R12.1–R12.7_


- [x] 17. Tests E2E con Playwright

  > **Nota:** La tarea 17.1 (configuración de Playwright) es requerida. Las tareas 17.2, 17.3 y 17.4 son **opcionales para MVP** — implementar solo si el tiempo lo permite o para la versión de portafolio final.

  - [x] 17.1 Configurar Playwright en `playwright.config.ts`
    - Configurar baseURL apuntando al servidor de desarrollo local
    - Configurar proyectos para Chromium, Firefox y Mobile Chrome
    - Crear fixture de autenticación reutilizable (`tests/e2e/fixtures/auth.ts`)
    - _Implements: R1, R13.1_

  - [x] 17.2 Escribir tests E2E de autenticación en `tests/e2e/auth.spec.ts`
    - Test: registro con email → onboarding → dashboard
    - Test: login con email/contraseña → dashboard
    - Test: credenciales incorrectas → mensaje de error correcto
    - Test: logout → redirección a login
    - Test: acceso a ruta protegida sin sesión → redirección a login
    - _Implements: R1.1–R1.9_

  - [x] 17.3 Escribir tests E2E de sesión de repaso en `tests/e2e/review.spec.ts`
    - Test: flujo completo Self-Assessment (iniciar → responder todas → ver resultados)
    - Test: flujo completo Quiz Mode (iniciar → responder todas → ver resultados)
    - Test: verificar que los puntos se actualizan en el dashboard tras la sesión
    - _Implements: R5, R6, R7, R10_

  - [x] 17.4 Escribir tests E2E de insignias en `tests/e2e/badges.spec.ts`
    - Test: desbloqueo de "Primer paso" tras primera respuesta correcta
    - Test: visualización de insignias bloqueadas sin revelar condición
    - Test: conteo correcto de insignias desbloqueadas
    - _Implements: R9, R11_


- [x] 18. Pulido visual, animaciones y responsividad

  > **Nota:** Toda esta sección es **opcional para MVP**. Las animaciones y el pulido visual pueden implementarse en una segunda iteración una vez que el core funcional esté completo y desplegado.

  - [x] 18.1 Verificar responsividad mobile-first en todas las páginas
    - Confirmar breakpoint base en 375px con `BottomNav` visible
    - Confirmar que `Sidebar` reemplaza `BottomNav` en ≥768px
    - Ajustar padding, tipografía y grid en todas las pantallas
    - _Implements: R13.1, R13.2, R13.3_

  - [x] 18.2 Añadir animaciones de transición entre tarjetas en ReviewCard
    - Animación de flip CSS para revelar respuesta en Self-Assessment
    - Transición de slide para avanzar a la siguiente tarjeta
    - _Implements: R13.4_

  - [x] 18.3 Añadir animaciones de entrada en Dashboard y Results
    - Fade-in escalonado para las tarjetas de estadísticas del Dashboard
    - Animación de confetti o celebración en Results cuando el porcentaje es ≥80%
    - _Implements: R13.4_

  - [x] 18.4 Pulir estados vacíos y de carga
    - Skeleton loaders para listas de tarjetas y estadísticas
    - Estados vacíos con ilustración y CTA cuando no hay datos
    - _Implements: R3.6_

- [ ] 19. Deploy en Vercel
  - [x] 19.1 Configurar `vercel.json` con headers de seguridad y variables de entorno
    - Añadir bloque `headers` con todos los headers de seguridad del task 5.2
    - Documentar en README las variables de entorno requeridas en Vercel
    - _Implements: R20.1–R20.7_

  - [x] 19.2 Verificar build de producción con `pnpm build`
    - Ejecutar `pnpm build` y confirmar que no hay errores de TypeScript ni de build
    - Verificar que el adaptador Vercel genera el output correcto en `.vercel/output`
    - _Implements: R16.5_

  - [x] 19.3 Checkpoint final — Verificar headers de seguridad en producción
    - Inspeccionar headers de respuesta en el deploy de Vercel
    - Confirmar ausencia de `X-Powered-By`, `X-Astro-*` y presencia de todos los headers de seguridad
    - _Implements: R20.1–R20.7_


---

## Notes

### MVP Core (tareas obligatorias)
Las tareas 1–16 y 19 forman el MVP funcional completo. Completarlas en orden garantiza una plataforma funcional y desplegable.

### Opcionales para MVP
- **Tarea 17.2–17.4**: Tests E2E de autenticación, repaso e insignias — recomendados para portafolio final
- **Tarea 18.2–18.4**: Animaciones de flip, confetti, skeleton loaders — mejoran la UX pero no bloquean el MVP
- **Tarea 3.1.1–3.4.2**: Los tests PBT están marcados con `*` pero son altamente recomendados para validar la lógica de negocio antes de conectar la UI

### Convenciones
- `*` en una sub-tarea = opcional, puede omitirse para MVP más rápido
- Usar `pnpm vitest run` (no `--watch`) para ejecutar tests en CI
- Usar `pnpm exec playwright test` para ejecutar E2E
- Checkpoints en T3.5, T8.5, T14.3 y T19.3 son puntos de validación obligatorios antes de continuar
- Cada tarea referencia los requisitos que implementa para trazabilidad completa
- Las referencias a propiedades PBT usan la numeración Property 1–8 del documento de diseño
