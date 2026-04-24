# 📋 PR — Versión A: Astro + Vue 3 + Supabase
> MicroLearn Platform — Plataforma de microaprendizaje gamificada  
> Stack: Astro · Vue 3 · Pinia · TailwindCSS v4 · Supabase · Netlify

---

## 🧭 Resumen del stack

| Capa | Tecnología |
|---|---|
| Framework principal | Astro 5 |
| Componentes UI | Vue 3 + Composition API (`<script setup>`) |
| Estado global | Pinia |
| Estilos | TailwindCSS v4 |
| Backend / DB / Auth | Supabase |
| Deploy | Netlify |
| Propósito | Portafolio personal |

---

## 🎨 FASE 0 — Diseño y arquitectura

### 0.1 Diseño visual (UI/UX)

- [ ] Crear wireframes en papel o Figma de las 8 pantallas:
  - [ ] Login / Registro
  - [ ] Onboarding (selección de temas)
  - [ ] Dashboard principal
  - [ ] Biblioteca de tarjetas
  - [ ] Pantalla de repaso (una tarjeta a la vez)
  - [ ] Resultados del repaso
  - [ ] Insignias y logros
  - [ ] Perfil y progreso
- [ ] Aplicar el sistema glassmorphism + mobile first definido abajo
- [ ] Validar los wireframes antes de escribir código

---

### 0.1.A Glassmorphism — Fórmula base

- [ ] Entender que el efecto solo funciona si hay un **gradiente de fondo detrás** de las cards
- [ ] Aplicar esta clase base a todos los paneles y tarjetas:

```css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

---

### 0.1.B Tema Claro ☀️ — Paleta Violeta / Rosa

- [ ] Aplicar fondo de página con gradiente lavanda:

```css
background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 40%, #C4B5FD 100%);
```

- [ ] Definir todos los tokens en el archivo CSS principal:

```css
/* En TailwindCSS v4 se usa @theme para definir tokens */
@import "tailwindcss";

@theme {
  --color-primary: #7C3AED;
  --color-primary-hover: #6D28D9;
  --color-secondary: #EC4899;
  --color-accent: #F59E0B;
  --color-success: #10B981;
  --color-error: #EF4444;

  --color-text-primary: #1E1B4B;
  --color-text-secondary: #4C1D95;

  --font-base: 'Inter', sans-serif;
  --font-code: 'Fira Code', monospace;
}

:root {
  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.45);
  --glass-shadow: 0 8px 32px rgba(124, 58, 237, 0.15);
  --glass-blur: blur(16px);
  --page-gradient: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 40%, #C4B5FD 100%);
  --radius-card: 20px;
  --radius-btn: 12px;
}
```

| Token | Color | Uso |
|---|---|---|
| `--color-primary` | `#7C3AED` | Botones principales |
| `--color-secondary` | `#EC4899` | Puntos, badges |
| `--color-accent` | `#F59E0B` | Racha, highlights |
| `--color-success` | `#10B981` | Respuesta correcta |
| `--color-error` | `#EF4444` | Respuesta incorrecta |
| `--color-text-primary` | `#1E1B4B` | Títulos |
| `--color-text-secondary` | `#4C1D95` | Texto secundario |

---

### 0.1.C Tema Oscuro 🌙 — Paleta Cian / Verde Menta

- [ ] Aplicar fondo navy profundo en modo oscuro:

```css
background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0C1A2E 100%);
```

- [ ] Agregar las variables del tema oscuro:

```css
[data-theme="dark"] {
  --color-primary: #06B6D4;
  --color-primary-hover: #0891B2;
  --color-secondary: #34D399;
  --color-accent: #FBBF24;
  --color-success: #34D399;
  --color-error: #F87171;
  --color-text-primary: #F0F9FF;
  --color-text-secondary: #BAE6FD;

  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --glass-blur: blur(20px);
  --page-gradient: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0C1A2E 100%);
}
```

| Token | Color | Uso |
|---|---|---|
| `--color-primary` | `#06B6D4` | Botones principales (cian) |
| `--color-secondary` | `#34D399` | Puntos, badges (verde menta) |
| `--color-accent` | `#FBBF24` | Racha, highlights |
| `--color-success` | `#34D399` | Respuesta correcta |
| `--color-error` | `#F87171` | Respuesta incorrecta |
| `--color-text-primary` | `#F0F9FF` | Títulos |
| `--color-text-secondary` | `#BAE6FD` | Texto secundario |

---

### 0.1.D Tipografía

- [ ] Importar fuentes de Google Fonts en el layout base de Astro:

```html
<!-- En src/layouts/BaseLayout.astro -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
```

- [ ] Escala de texto a usar en toda la app:

| Variable | Tamaño | Uso |
|---|---|---|
| `text-xs` | 12px | Labels pequeños |
| `text-sm` | 14px | Texto secundario |
| `text-base` | 16px | Texto base |
| `text-lg` | 18px | Subtítulos |
| `text-xl` | 20px | Títulos de sección |
| `text-2xl` | 24px | Títulos de pantalla |
| `text-3xl` | 30px | Puntos / hero |

---

### 0.1.E Mobile First 📱

- [ ] Siempre diseñar primero para 375px y escalar con `min-width`
- [ ] Nunca usar `max-width` como base de los estilos
- [ ] Usar estos breakpoints de Tailwind v4:

| Breakpoint | `min-width` | Dispositivo |
|---|---|---|
| _(base)_ | 0px | Móvil pequeño |
| `sm` | 480px | Móvil grande |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop grande |

- [ ] Layout móvil: header fijo arriba + contenido scrolleable + bottom nav fijo abajo
- [ ] Layout desktop (lg+): sidebar fijo izquierda + contenido a la derecha

---

### 0.1.F Componentes glass base (Vue)

- [ ] Crear `GlassCard.vue`:

```vue
<template>
  <div class="glass-card">
    <slot />
  </div>
</template>

<style scoped>
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow);
  padding: 1.25rem;
}
@media (min-width: 768px) {
  .glass-card { padding: 1.75rem; }
}
</style>
```

- [ ] Crear `GlassButton.vue` para botón primario
- [ ] Crear `GlassBadge.vue` para chips e insignias

---

### 0.1.G Toggle de tema

- [ ] Crear `src/lib/theme.ts` con la lógica del toggle:

```ts
export function initTheme() {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = saved || (prefersDark ? 'dark' : 'light')
  document.documentElement.setAttribute('data-theme', theme)
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('theme', next)
}
```

- [ ] Llamar `initTheme()` en el `<head>` del layout base para evitar el flash de tema incorrecto

---

### 0.2 Diseño de base de datos (Supabase)

- [ ] Definir y crear estas tablas en Supabase antes de tocar la UI:

```sql
-- Tabla: cards (contenido de aprendizaje)
create table cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  topic text check (topic in ('javascript', 'typescript')) not null,
  subtopic text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) not null,
  points_value int not null
);

-- Tabla: user_progress (historial de repasos)
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  card_id uuid references cards not null,
  correct boolean not null,
  reviewed_at timestamptz default now()
);

-- Tabla: user_stats (puntos, racha)
create table user_stats (
  user_id uuid primary key references auth.users,
  total_points int default 0,
  current_streak int default 0,
  longest_streak int default 0,
  last_study_date date
);

-- Tabla: badges (catálogo de insignias)
create table badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  level text check (level in ('basic', 'intermediate', 'advanced')) not null,
  condition text not null,
  icon text not null
);

-- Tabla: user_badges (insignias desbloqueadas)
create table user_badges (
  user_id uuid references auth.users not null,
  badge_id uuid references badges not null,
  unlocked_at timestamptz default now(),
  primary key (user_id, badge_id)
);

-- Tabla: user_preferences (onboarding)
create table user_preferences (
  user_id uuid primary key references auth.users,
  selected_topics text[] not null,
  onboarding_completed boolean default false
);
```

- [ ] Activar Row Level Security (RLS) en todas las tablas
- [ ] Crear políticas RLS para que cada usuario solo vea sus propios datos

---

### 0.3 Repositorio y estructura

- [ ] Crear repositorio en GitHub: `microlearn-astro-vue`
- [ ] Crear rama `main` protegida
- [ ] Crear ramas por feature: `feat/auth`, `feat/cards`, `feat/review`, etc.
- [ ] Crear estructura de carpetas:

```
/src
  /components        ← componentes Vue reutilizables (.vue)
    /ui              ← GlassCard, GlassButton, GlassBadge
    /layout          ← Header, Sidebar, BottomNav
    /cards           ← CardItem, CardLibrary, ReviewCard
    /badges          ← BadgeItem, BadgeGrid
  /layouts           ← layouts de Astro (.astro)
  /pages             ← rutas de Astro (.astro)
  /stores            ← stores de Pinia
  /lib               ← cliente de Supabase, helpers
  /types             ← tipos TypeScript
  /styles            ← CSS global con variables y Tailwind
```

---

## ⚙️ FASE 1 — Setup técnico

### 1.1 Inicializar Astro

- [ ] Ejecutar: `npm create astro@latest`
  - Elegir: TypeScript estricto, sin framework UI por ahora
- [ ] Agregar integración de Vue 3: `npx astro add vue`
- [ ] Verificar que Astro corre: `npm run dev`

### 1.2 Instalar TailwindCSS v4

> ⚠️ TailwindCSS v4 cambia completamente la forma de configurar. Ya NO hay `tailwind.config.js`.

- [ ] Instalar el plugin de Vite para Tailwind v4:
  ```bash
  npm install tailwindcss @tailwindcss/vite
  ```
- [ ] Agregar el plugin en `astro.config.mjs`:
  ```js
  import { defineConfig } from 'astro/config'
  import vue from '@astrojs/vue'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    integrations: [vue()],
    vite: {
      plugins: [tailwindcss()]
    }
  })
  ```
- [ ] Crear `src/styles/global.css` con la importación de Tailwind v4:
  ```css
  @import "tailwindcss";

  @theme {
    --color-primary: #7C3AED;
    --color-secondary: #EC4899;
    /* ... resto de tokens */
  }
  ```
- [ ] Importar el CSS global en el layout base de Astro:
  ```astro
  ---
  import '../styles/global.css'
  ---
  ```
- [ ] Verificar que las clases de Tailwind funcionan en un componente de prueba

### 1.3 Configurar Supabase

- [ ] Crear proyecto gratuito en [supabase.com](https://supabase.com)
- [ ] Instalar cliente: `npm install @supabase/supabase-js`
- [ ] Crear archivo `.env` en la raíz:
  ```
  PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica
  ```
- [ ] Crear `src/lib/supabase.ts`:
  ```ts
  import { createClient } from '@supabase/supabase-js'

  export const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  )
  ```
- [ ] Agregar `.env` al `.gitignore`

### 1.4 Instalar Pinia

- [ ] Instalar: `npm install pinia`
- [ ] Instalar plugin para Vue en Astro: `npm install @pinia/nuxt` (no aplica) — usar la integración manual:
  ```ts
  // En el componente raíz Vue, crear la instancia de Pinia
  import { createPinia } from 'pinia'
  const pinia = createPinia()
  ```
- [ ] Verificar que Pinia funciona con un store de prueba

### 1.5 Verificación final del setup

- [ ] El servidor corre sin errores: `npm run dev`
- [ ] Las clases de Tailwind v4 aplican correctamente
- [ ] La conexión con Supabase responde (probar con un query simple)
- [ ] Un componente Vue se renderiza dentro de una página Astro

---

## 🔐 FASE 2 — Autenticación

### 2.1 Pantalla de Registro

- [ ] Crear página `src/pages/register.astro`
- [ ] Crear componente `src/components/auth/RegisterForm.vue`
- [ ] Campo: email
- [ ] Campo: contraseña
- [ ] Campo: confirmar contraseña
- [ ] Validación: email válido, contraseña mínimo 8 caracteres
- [ ] Llamar a Supabase Auth al enviar:
  ```ts
  const { data, error } = await supabase.auth.signUp({ email, password })
  ```
- [ ] Mostrar mensaje de error si falla
- [ ] Redirigir al onboarding si es exitoso

### 2.2 Pantalla de Login

- [ ] Crear página `src/pages/login.astro`
- [ ] Crear componente `src/components/auth/LoginForm.vue`
- [ ] Campo: email
- [ ] Campo: contraseña
- [ ] Llamar a Supabase Auth al enviar:
  ```ts
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  ```
- [ ] Mostrar mensaje de error si credenciales incorrectas
- [ ] Redirigir al dashboard si es exitoso

### 2.3 Logout

- [ ] Crear botón de logout en el header/sidebar
- [ ] Implementar la función:
  ```ts
  await supabase.auth.signOut()
  ```
- [ ] Redirigir a `/login` después de cerrar sesión

### 2.4 Persistencia de sesión

- [ ] Leer la sesión activa al cargar la app:
  ```ts
  const { data: { session } } = await supabase.auth.getSession()
  ```
- [ ] Guardar el usuario en un store de Pinia: `useAuthStore`
- [ ] Escuchar cambios de sesión:
  ```ts
  supabase.auth.onAuthStateChange((event, session) => {
    authStore.setUser(session?.user ?? null)
  })
  ```

### 2.5 Protección de rutas

- [ ] Crear middleware de Astro `src/middleware.ts`:
  ```ts
  import { defineMiddleware } from 'astro:middleware'
  import { supabase } from './lib/supabase'

  const PUBLIC_ROUTES = ['/login', '/register']

  export const onRequest = defineMiddleware(async ({ url, redirect }, next) => {
    const isPublic = PUBLIC_ROUTES.includes(url.pathname)
    const { data: { session } } = await supabase.auth.getSession()

    if (!isPublic && !session) return redirect('/login')
    if (isPublic && session) return redirect('/dashboard')
    return next()
  })
  ```

### 2.6 Criterio de éxito — Auth

- [ ] El usuario puede registrarse con email y contraseña
- [ ] El usuario puede iniciar sesión
- [ ] El usuario puede cerrar sesión
- [ ] Las rutas privadas redirigen al login si no hay sesión
- [ ] La sesión se mantiene al refrescar la página

---

## 🧭 FASE 3 — Onboarding

### 3.1 Lógica del onboarding

- [ ] Crear página `src/pages/onboarding.astro`
- [ ] Crear componente `src/components/onboarding/OnboardingForm.vue`
- [ ] Al entrar, verificar si `onboarding_completed === true` en Supabase
- [ ] Si ya completó el onboarding → redirigir al dashboard automáticamente

### 3.2 Pantalla de onboarding

- [ ] Mostrar mensaje de bienvenida con el nombre del usuario
- [ ] Mostrar opciones de selección de temas:
  - [ ] ✅ JavaScript
  - [ ] ✅ TypeScript
  - [ ] Ambos
- [ ] Validar que seleccione al menos un tema
- [ ] Botón "Empezar a aprender"

### 3.3 Guardar preferencias

- [ ] Al confirmar, insertar en Supabase:
  ```ts
  await supabase.from('user_preferences').upsert({
    user_id: user.id,
    selected_topics: selectedTopics,
    onboarding_completed: true
  })
  ```
- [ ] También crear registro inicial en `user_stats`:
  ```ts
  await supabase.from('user_stats').upsert({
    user_id: user.id,
    total_points: 0,
    current_streak: 0
  })
  ```
- [ ] Redirigir al dashboard

### 3.4 Criterio de éxito — Onboarding

- [ ] Solo aparece la primera vez que el usuario entra
- [ ] Las tarjetas del dashboard se filtran según los temas elegidos

---

## 📚 FASE 4 — Contenido (Tarjetas)

### 4.1 Crear el seed de tarjetas

- [ ] Crear al menos **30 tarjetas** en Supabase:
  - [ ] 15 tarjetas de JavaScript:
    - [ ] Variables (var, let, const)
    - [ ] Funciones y arrow functions
    - [ ] Arrays y métodos (map, filter, reduce)
    - [ ] Objetos y destructuring
    - [ ] Promesas y async/await
    - [ ] Closures
    - [ ] Event loop
    - [ ] DOM manipulation
    - [ ] Módulos ES6 (import/export)
    - [ ] Spread y rest operator
    - [ ] Template literals
    - [ ] Optional chaining (?.)
    - [ ] Nullish coalescing (??)
    - [ ] Clases y herencia
    - [ ] Error handling (try/catch)
  - [ ] 15 tarjetas de TypeScript:
    - [ ] Tipos básicos (string, number, boolean)
    - [ ] Interfaces
    - [ ] Type aliases
    - [ ] Union types
    - [ ] Intersection types
    - [ ] Generics básicos
    - [ ] Enums
    - [ ] Utility types (Partial, Required, Pick)
    - [ ] Type assertions
    - [ ] Funciones tipadas
    - [ ] Arrays tipados
    - [ ] Objetos tipados
    - [ ] Readonly y const assertions
    - [ ] Narrowing y type guards
    - [ ] Módulos y namespaces

- [ ] Cada tarjeta debe tener:
  - [ ] Título claro
  - [ ] Resumen máximo 150 palabras
  - [ ] Ejemplo de código (si aplica)
  - [ ] Dificultad: easy / medium / hard
  - [ ] Puntos: easy=10, medium=20, hard=30

### 4.2 Biblioteca de tarjetas

- [ ] Crear página `src/pages/library.astro`
- [ ] Crear componente `src/components/cards/CardLibrary.vue`
- [ ] Obtener tarjetas desde Supabase filtradas por temas del usuario:
  ```ts
  const { data } = await supabase
    .from('cards')
    .select('*')
    .in('topic', userTopics)
  ```
- [ ] Mostrar tarjetas agrupadas por tema y subtema
- [ ] Filtro por tema (JavaScript / TypeScript)
- [ ] Filtro por dificultad (easy / medium / hard)
- [ ] Indicador visual de tarjetas ya repasadas (verde si ya la vio)
- [ ] Botón "Iniciar repaso" que lleva al modo de repaso

### 4.3 Criterio de éxito — Tarjetas

- [ ] El usuario ve todas las tarjetas disponibles según sus temas
- [ ] Puede filtrar y elegir desde dónde empezar

---

## 🔄 FASE 5 — Modo de Repaso

### 5.1 Pantalla de repaso

- [ ] Crear página `src/pages/review.astro`
- [ ] Crear componente `src/components/cards/ReviewCard.vue`
- [ ] Mostrar una tarjeta a la vez con animación de flip o slide
- [ ] Mostrar: título + resumen del concepto
- [ ] Mostrar contador: "Tarjeta 3 de 10"
- [ ] Barra de progreso visual

### 5.2 Interacción del usuario

- [ ] Botón "Lo sabía ✅"
- [ ] Botón "No lo sabía ❌"
- [ ] Al responder, mostrar feedback inmediato:
  - [ ] Verde + puntos ganados si respondió "Lo sabía"
  - [ ] Rojo + explicación si respondió "No lo sabía"
- [ ] Pasar automáticamente a la siguiente tarjeta (o con botón "Siguiente")

### 5.3 Lógica de puntos en sesión

- [ ] Implementar la lógica de puntos:
  ```
  easy correcta  → +10 puntos
  medium correcta → +20 puntos
  hard correcta  → +30 puntos
  3 correctas seguidas → +5 bonus
  5 correctas seguidas → +15 bonus
  ```
- [ ] Guardar cada resultado en `user_progress`:
  ```ts
  await supabase.from('user_progress').insert({
    user_id: user.id,
    card_id: card.id,
    correct: isCorrect
  })
  ```
- [ ] Actualizar `user_stats.total_points` al terminar la sesión

### 5.4 Criterio de éxito — Repaso

- [ ] El usuario puede repasar un bloque de principio a fin
- [ ] Los puntos se calculan y guardan correctamente

---

## 📊 FASE 6 — Resultados del Repaso

### 6.1 Pantalla de resultados

- [ ] Crear página `src/pages/results.astro`
- [ ] Crear componente `src/components/cards/ReviewResults.vue`
- [ ] Mostrar al terminar el bloque:
  - [ ] Total de tarjetas repasadas
  - [ ] Respuestas correctas e incorrectas
  - [ ] Porcentaje de aciertos
  - [ ] Puntos ganados en esta sesión
  - [ ] Insignias desbloqueadas (si las hay, con animación)
- [ ] Botón "Repasar de nuevo"
- [ ] Botón "Volver al dashboard"

### 6.2 Criterio de éxito — Resultados

- [ ] El usuario ve un resumen claro de su sesión
- [ ] Las insignias desbloqueadas aparecen con efecto llamativo

---

## 🏠 FASE 7 — Dashboard Principal

### 7.1 Pantalla del dashboard

- [ ] Crear página `src/pages/dashboard.astro`
- [ ] Crear componente `src/components/layout/Dashboard.vue`
- [ ] Secciones a mostrar:
  - [ ] Saludo: "Hola, [nombre] 👋"
  - [ ] Racha actual: "🔥 5 días seguidos"
  - [ ] Puntos totales (siempre visible)
  - [ ] Progreso: tarjetas repasadas / total disponibles (barra)
  - [ ] Insignias recientes (últimas 3)
  - [ ] Botón "Continuar estudiando"

### 7.2 Lógica de racha diaria

- [ ] Al cargar el dashboard, verificar y actualizar la racha:
  ```ts
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (stats.last_study_date === yesterday) {
    // Racha continúa
    stats.current_streak += 1
  } else if (stats.last_study_date !== today) {
    // Racha perdida
    stats.current_streak = 1
  }
  // Si es hoy, no cambiar
  ```
- [ ] Actualizar `last_study_date` al terminar cualquier sesión de repaso

### 7.3 Criterio de éxito — Dashboard

- [ ] El dashboard muestra datos reales del usuario
- [ ] La racha se calcula y actualiza correctamente

---

## 🏆 FASE 8 — Sistema de Insignias

### 8.1 Catálogo de insignias a crear en Supabase

- [ ] Insertar las 9 insignias base en la tabla `badges`:

| Insignia | Condición | Nivel |
|---|---|---|
| 🌱 Primer paso | Completar primera tarjeta | basic |
| ⚡ En racha | 3 respuestas correctas seguidas | basic |
| 📚 Estudioso | Repasar 50 tarjetas en total | basic |
| 🔥 Semana de fuego | 7 días de racha | intermediate |
| 🎯 Experto JS | Completar todas las tarjetas de JS | intermediate |
| 🚀 Centurión | 100 respuestas correctas | intermediate |
| 🏆 Perfeccionista | Sesión con 100% de aciertos | intermediate |
| 💎 Maestro TS | Completar todas las tarjetas de TS | advanced |
| 👑 Maestro total | Completar todo el contenido | advanced |

### 8.2 Lógica de desbloqueo

- [ ] Crear función `checkAndUnlockBadges(userId)` en `src/lib/badges.ts`
- [ ] Llamar a esta función al terminar cada sesión de repaso
- [ ] Si se cumple la condición de una insignia:
  ```ts
  await supabase.from('user_badges').insert({
    user_id: userId,
    badge_id: badge.id
  })
  ```
- [ ] Las insignias nunca se pierden una vez obtenidas

### 8.3 Pantalla de insignias

- [ ] Crear página `src/pages/badges.astro`
- [ ] Crear componente `src/components/badges/BadgeGrid.vue`
- [ ] Mostrar todas las insignias (desbloqueadas y bloqueadas)
- [ ] Las bloqueadas se muestran oscuras/grises con su requisito visible
- [ ] Las desbloqueadas muestran la fecha en que se obtuvieron

### 8.4 Criterio de éxito — Insignias

- [ ] Las insignias se desbloquean automáticamente al cumplir la condición
- [ ] El usuario las ve en la pantalla de insignias y en los resultados

---

## 👤 FASE 9 — Perfil y Progreso

### 9.1 Pantalla de perfil

- [ ] Crear página `src/pages/profile.astro`
- [ ] Crear componente `src/components/profile/ProfileView.vue`
- [ ] Mostrar:
  - [ ] Avatar (iniciales del usuario si no hay foto)
  - [ ] Email y nombre de usuario
  - [ ] Puntos totales acumulados
  - [ ] Racha actual y racha máxima histórica
  - [ ] Tarjetas repasadas por tema (JS vs TS, con barra comparativa)
  - [ ] Tasa de aciertos general (porcentaje)
  - [ ] Todas las insignias obtenidas con fecha

### 9.2 Criterio de éxito — Perfil

- [ ] El perfil muestra información real obtenida de Supabase
- [ ] Los datos se actualizan tras cada sesión

---

## ✨ FASE 10 — Pulido y deploy

### 10.1 Responsividad

- [ ] Revisar todas las pantallas en 375px (móvil pequeño)
- [ ] Revisar en 768px (tablet)
- [ ] Revisar en 1024px (desktop)
- [ ] Corregir cualquier overflow o elemento roto en mobile

### 10.2 Animaciones y UX

- [ ] Animación de flip en la tarjeta de repaso
- [ ] Animación de puntos que sube (+10, +20) al responder
- [ ] Animación al desbloquear una insignia (confetti o glow)
- [ ] Skeleton loaders mientras carga la data de Supabase
- [ ] Estados vacíos: si no hay tarjetas, si no hay insignias aún
- [ ] Transiciones suaves entre pantallas con Astro View Transitions

### 10.3 Manejo de errores

- [ ] Mostrar mensaje claro si falla la conexión con Supabase
- [ ] Validar todos los formularios antes de enviar
- [ ] Manejar el caso de token expirado (re-login automático)

### 10.4 Deploy en Netlify

- [ ] Agregar adaptador de Netlify: `npx astro add netlify`
- [ ] Configurar variables de entorno en el panel de Netlify
- [ ] Conectar repositorio de GitHub a Netlify
- [ ] Hacer deploy y verificar que todo funciona en producción
- [ ] Copiar la URL del deploy para el README

### 10.5 README del portafolio

- [ ] Descripción del proyecto y propósito
- [ ] Screenshot o GIF de la app funcionando
- [ ] Explicar por qué se eligió Astro + Vue + Supabase
- [ ] Comparativa con la Versión B (TanStack + Appwrite)
- [ ] Link al deploy en vivo
- [ ] Instrucciones para correr en local

---

## 📐 Orden de construcción recomendado

- [ ] **1.** Wireframes en papel o Figma
- [ ] **2.** Tablas en Supabase + seed de tarjetas
- [ ] **3.** Setup técnico (Astro + Vue + Tailwind v4 + Supabase)
- [ ] **4.** Auth (login, registro, logout, protección de rutas)
- [ ] **5.** Onboarding
- [ ] **6.** Biblioteca de tarjetas
- [ ] **7.** Modo de repaso + puntos
- [ ] **8.** Resultados del repaso
- [ ] **9.** Actualización de racha
- [ ] **10.** Dashboard
- [ ] **11.** Lógica de insignias
- [ ] **12.** Pantalla de insignias
- [ ] **13.** Perfil
- [ ] **14.** Pulido visual + animaciones
- [ ] **15.** Deploy en Netlify
- [ ] **16.** README

---

## ⚠️ Riesgos y cómo evitarlos

| Riesgo | Solución |
|---|---|
| Tarjetas demasiado largas | Máximo 150 palabras por tarjeta |
| Glassmorphism sin fondo | Siempre poner el gradiente en el `<body>` o en el layout |
| Tailwind v4 sin `config.js` | Usar `@theme {}` en el CSS global para tokens custom |
| RLS de Supabase bloqueando queries | Verificar políticas antes de conectar la UI |
| Perfeccionismo | Primero funcional, después bonito |

---

*PR generado para proyecto de portafolio — Versión A: Astro + Vue 3 + Supabase + TailwindCSS v4*
