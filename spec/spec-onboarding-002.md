---
title: ONB-002 Onboarding de temas y dificultad
version: 1.0
date_created: 2026-05-13
owner: Equipo de Producto
tags: especificación, onboarding, user-preferences, microlearn, behavioral-design
---

# ONB-002: Onboarding de temas y dificultad

## 1. Propósito y Alcance

Flujo guiado de 2 pasos para que el usuario seleccione temas de interés (JavaScript y/o TypeScript) y dificultad preferida (easy/medium/hard) al primer ingreso. Al completar, se persisten las preferencias, se inicializan stats en cero, y se redirige al dashboard con contenido filtrado.

Queda fuera del alcance: edición de preferencias desde el perfil (cubierto por ONB-002 como post-onboarding o por user-story-profile-009), onboarding con más de 2 pasos, selección de subtemas, test diagnóstico inicial.

## 2. Requerimientos Funcionales

| ID | Descripción |
|----|------------|
| **RF-001** | El sistema debe redirigir al onboarding automáticamente tras el registro exitoso |
| **RF-002** | El sistema debe redirigir al dashboard si el usuario ya completó el onboarding |
| **RF-003** | El onboarding debe tener un flujo de 2 pasos con indicador de progreso visible |
| **RF-004** | Paso 1: mostrar todos los temas disponibles (extraídos de `cards.topic` en DB), selección múltiple, obligatorio al menos 1 |
| **RF-005** | Paso 2: selección única de dificultad con valor por defecto `medium`, opciones: easy, medium, hard |
| **RF-006** | El sistema debe validar en servidor que `topics.length >= 1` antes de persistir |
| **RF-007** | Al completar, debe persistir `selected_topics`, `difficulty`, `onboarding_completed = true` en `user_preferences` |
| **RF-008** | Al completar, debe inicializar `user_stats` con `total_points = 0`, `current_streak = 0`, `longest_streak = 0` |
| **RF-009** | El sistema debe emitir el evento de dominio `OnboardingCompleted` al finalizar |
| **RF-010** | El middleware debe redirigir al onboarding si el usuario autenticado no tiene `onboarding_completed = true` |
| **RF-011** | El botón "Comenzar/Empezar a aprender" debe mostrar estado de carga mientras persiste |
| **RF-012** | El formulario debe tener botón "Atrás" en paso 2 para volver al paso 1 |

## 3. Requerimientos No Funcionales

| ID | Descripción | Target |
|----|------------|--------|
| **RNF-001** | Tiempo de carga del formulario de onboarding | < 1.5s (LCP) |
| **RNF-002** | Persistencia de preferencias en Supabase | < 500ms p95 |
| **RNF-003** | Hidratación del componente Vue (client:idle) | < 3s desde paint |
| **RNF-004** | La página de onboarding debe ocupar < 50KB (HTML + CSS + JS) | Bundle split |
| **RNF-005** | Las rutas protegidas redirigen a `/login` si no hay sesión (SSR) | Tiempo de middleware < 200ms |
| **RNF-006** | Accesibilidad: navegación por teclado, roles ARIA, contraste WCAG AA | WCAG 2.1 AA |
| **RNF-007** | Soportar N+1 temas dinámicos sin cambiar el componente Vue | Escalable |
| **RNF-008** | La selección debe persistir en el cliente si el usuario navega entre pasos | Estado Vue local |

## 4. Restricciones y Reglas de Negocio

| ID | Regla |
|----|-------|
| **RN-001** | El onboarding solo se muestra una vez por usuario |
| **RN-002** | `selected_topics` debe contener al menos 1 tema (validación cliente + servidor) |
| **RN-003** | `difficulty` tiene valor por defecto `medium` (reduce parálisis por decisión) |
| **RN-004** | `onboarding_completed` se marca `true` SOLO al completar ambos pasos |
| **RN-005** | `user_stats` se inicializa con 0 puntos y 0 racha al completar el onboarding |
| **CON-001** | Stack fijo: Astro 5 + Vue 3 + Pinia + TailwindCSS v4 + Supabase + Vercel |
| **CON-002** | Las acciones de servidor usan `astro:actions` con Zod para validación |
| **CON-003** | El cliente Supabase se crea con `@supabase/ssr` siguiendo el patrón oficial |

## 5. Contratos de Interfaz

### 5.1 Tipo UserPreferences (a nivel app)

```typescript
// src/types/app.ts — YA EXISTE, verificar consistencia
export interface UserPreferences {
  selectedTopics: string[]
  difficulty: Difficulty        // ← AGREGAR: no está en el tipo actual
  onboardingCompleted: boolean
}
```

### 5.2 Esquema de user_preferences (DB)

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| user_id | UUID | PK, FK → auth.users |
| selected_topics | text[] | NOT NULL, min 1 elemento |
| difficulty | text | CHECK IN ('easy','medium','hard'), DEFAULT 'medium' |
| onboarding_completed | boolean | DEFAULT false |
| updated_at | timestamptz | DEFAULT NOW() |

### 5.3 Esquema de user_stats (DB)

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| user_id | UUID | PK, FK → auth.users |
| total_points | integer | DEFAULT 0 |
| current_streak | integer | DEFAULT 0 |
| longest_streak | integer | DEFAULT 0 |
| last_study_date | date | NULL |
| updated_at | timestamptz | DEFAULT NOW() |

### 5.4 Acción `onboarding.savePreferences`

```typescript
// Input
{
  topics: z.array(z.string().min(1)).min(1),     // al menos 1
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
}
// Output (success)
{ success: true }
// Output (error)
{ success: false, error: string, message: string }
```

### 5.5 Evento de Dominio

```typescript
interface OnboardingCompletedEvent {
  eventName: 'OnboardingCompleted'
  userId: string
  selectedTopics: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  timestamp: string
}
```

## 6. Escenarios de Error

| ID | Error | Respuesta |
|----|-------|-----------|
| **ERR-001** | Usuario sin sesión al enviar formulario | Action retorna `{ success: false, error: 'UNAUTHORIZED' }`. Cliente muestra toast genérico. |
| **ERR-002** | 0 temas seleccionados al avanzar al paso 2 | Toast: "Selecciona al menos un tema para continuar." No avanza de paso. |
| **ERR-003** | Fallo de red al persistir (timeout) | Catch en handleSubmit → toast "Algo salió mal. Inténtalo de nuevo." |
| **ERR-004** | Error de Supabase al hacer upsert de preferencias | Action retorna `{ success: false, error: 'INTERNAL_ERROR' }`. Toast genérico. |
| **ERR-005** | Error de Supabase al inicializar user_stats | Preferencias ya guardadas. Action retorna error. El dashboard debe tolerar stats = 0. |
| **ERR-006** | No hay temas disponibles en la DB (cards vacía) | Se muestra "No hay temas disponibles aún. Contacta al administrador." |
| **ERR-007** | Usuario ya onboardeado accede a `/onboarding` | Middleware → redirect a `/dashboard` (manejado en SSR de la página y middleware) |

## 7. Criterios de Aceptación Globales

| ID | Criterio |
|----|----------|
| **AC-001** | Dado un usuario nuevo, Cuando completa el onboarding, Entonces se guardan sus preferencias y stats, y se redirige al dashboard |
| **AC-002** | Dado un usuario en paso 1, Cuando intenta avanzar sin temas, Entonces ve un toast de error y no avanza |
| **AC-003** | Dado un usuario ya onboardeado, Cuando accede a `/onboarding`, Entonces es redirigido al dashboard |
| **AC-004** | Dado un usuario en el onboarding, Cuando navega entre pasos, Entonces ve un indicador de progreso 1/2 y 2/2 |
| **AC-005** | Dado un usuario en paso 2, Cuando hace clic en "Empezar a aprender", Entonces el botón se deshabilita con estado de carga |

## 8. Métricas de Éxito

| KPI | Target | Medición |
|-----|--------|----------|
| Tasa de finalización del onboarding | > 90% | Evento `onboarding_completed` / registro completado |
| Tiempo medio en onboarding | < 30s | Analytics de sesión |
| Abandono en paso 1 | < 10% | Evento `onboarding_step1_abandon` |
| Abandono en paso 2 | < 5% | Evento `onboarding_step2_abandon` |
| Usuarios que vuelven al día siguiente (D1) | > 60% | Cohorte post-onboarding vs control |
| Tasa de error en persistencia | < 1% | Log de errores / total de intentos |

## 9. Casos de Prueba

### CP-001: Flujo completo exitoso
- **Relación**: RF-001, RF-007, RF-008, AC-001
- **Precondiciones**: Usuario registrado, sin onboarding previo, redirigido a `/onboarding`
- **Pasos**: Seleccionar "JavaScript" → "TypeScript" → Clic "Continuar" → Seleccionar "Medio" → Clic "Empezar a aprender"
- **Resultado**: `user_preferences` creado con topics=['JavaScript','TypeScript'], difficulty='medium', onboarding_completed=true. `user_stats` creado con 0 puntos. Redirigido a `/dashboard`.

### CP-002: Validación de al menos 1 tema
- **Relación**: RF-004, ERR-002, AC-002
- **Precondiciones**: Usuario en paso 1, sin temas seleccionados
- **Pasos**: Clic "Continuar" sin seleccionar nada
- **Resultado**: Toast "Selecciona al menos un tema para continuar." Paso no cambia.

### CP-003: Redirección de usuario ya onboardeado
- **Relación**: RF-002, RF-010, AC-003
- **Precondiciones**: Usuario con onboarding_completed=true
- **Pasos**: Navegar a `/onboarding`
- **Resultado**: Redirigido a `/dashboard`

### CP-004: Navegación entre pasos con progreso visible
- **Relación**: RF-003, RF-012, AC-004
- **Precondiciones**: Usuario en onboarding, paso 1
- **Pasos**: Seleccionar tema → "Continuar" → Ver paso 2 con indicador 2/2 → "Atrás" → Ver paso 1 con indicador 1/2
- **Resultado**: Indicador muestra paso actual y total (1/2, 2/2). "Atrás" vuelve al paso 1 preservando selección.

### CP-005: Estado de carga en submit
- **Relación**: RF-011, AC-005
- **Precondiciones**: Usuario en paso 2 con datos válidos
- **Pasos**: Clic "Empezar a aprender"
- **Resultado**: Botón se deshabilita, texto cambia a "Guardando..."

### CP-006: Persistencia de selección entre pasos
- **Relación**: RNF-008
- **Precondiciones**: Usuario en onboarding
- **Pasos**: Paso 1: seleccionar "TypeScript" → "Continuar" → Paso 2 → "Atrás"
- **Resultado**: "TypeScript" sigue seleccionado al volver al paso 1.

### CP-007: Sin temas disponibles en DB
- **Relación**: ERR-006
- **Precondiciones**: Tabla `cards` vacía
- **Pasos**: Acceder a `/onboarding`
- **Resultado**: Se muestra mensaje "No hay temas disponibles aún. Contacta al administrador."

### CP-008: Error de red al persistir
- **Relación**: ERR-003, ERR-004
- **Precondiciones**: Usuario en paso 2. Red simulada desconectada.
- **Pasos**: Seleccionar dificultad → Clic "Empezar a aprender"
- **Resultado**: Toast "Algo salió mal. Inténtalo de nuevo." Usuario permanece en paso 2.
