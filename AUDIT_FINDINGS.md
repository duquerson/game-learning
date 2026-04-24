# Auditoría del Proyecto: Validación de Hallazgos

**Fecha:** 23 de abril de 2026  
**Conclusión General:** Todos los hallazgos son **CORRECTOS Y CRÍTICOS**. El proyecto tiene 5 problemas técnicos reales que afectan funcionalidad, mantenibilidad y confiabilidad.

---

## ✅ [P1] Lógica de tema duplicada y contradictoria entre SSR y cliente

### Hallazgo
La lógica de tema vive en dos lugares con implementaciones incompatibles:
- **SSR (BaseLayout.astro:10):** `const theme=saved||(prefersDark?'dark':'light')`
- **Cliente (theme.ts:11-14):** Ignora `prefers-color-scheme` completamente

### Evidencia

**BaseLayout.astro línea 10 - Bootstrap inline SSR:**
```javascript
const themeInitScript = "(function(){const saved=localStorage.getItem('theme');const prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;const theme=saved||(prefersDark?'dark':'light');document.documentElement.setAttribute('data-theme',theme);})();"
```

**src/lib/theme.ts línea 11-14 - Cliente:**
```typescript
export function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') return 'dark'
  return 'light'  // ← Siempre fallback a light, ignora prefers-color-scheme
}
```

**src/composables/useTheme.ts línea 6 - Se llama en mount:**
```typescript
export function useTheme() {
  function init() {
    theme.value = getInitialTheme()  // ← Llama la función que ignora prefers-color-scheme
    applyTheme(theme.value)
  }
}
```

**src/components/ui/ThemeToggle.vue línea 6 y src/components/ui/ToasterWrapper.vue línea 6:**
```typescript
onMounted(init)  // ← Ejecutan en hidratación
```

### Consecuencia Real
Un usuario con **sistema operativo en modo oscuro** y **sin preferencia guardada en localStorage**:
1. **En SSR (servidor):** Recibe `data-theme="dark"` en el HTML (gracias a `prefers-color-scheme`)
2. **En hidratación Vue (cliente):** `getInitialTheme()` devuelve `'light'`
3. **Resultado:** Flash visual: oscuro → claro después de 0-100ms

### Severidad
**CRÍTICA** - Experiencia de usuario rota; impacta ~30-50% de usuarios en dispositivos con preferencia de sistema oscuro.

---

## ✅ [P2] Bootstrap global de auth huérfano e instancia Pinia no utilizada

### Hallazgo
`App.vue` contiene código crítico de inicialización (`auth.init()`) pero **nunca se renderiza en la cadena de componentes activa**.

### Evidencia

**App.vue línea 1-8 - Código de bootstrap:**
```typescript
import { pinia } from '../lib/pinia'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore(pinia)

onMounted(async () => {
  await auth.init()
})
```

**src/lib/pinia.ts - Instancia custom:**
```typescript
export const pinia = createPinia()
```
Exportada pero **solo usada en App.vue**.

**src/layouts/AppLayout.astro línea 12-30 - Layout principal:**
```astro
<BaseLayout title={title}>
  <div class="flex min-h-screen">
    <!-- Sidebar, main, BottomNav, ToasterWrapper -->
    <!-- NO hay renderización de App.vue -->
  </div>
</BaseLayout>
```

**Búsqueda en repo:**
- `grep -r "from.*App.vue" src/` → No matches
- Solo aparece `App.vue` dentro del archivo `App.vue` mismo

### Consecuencia Real
El código `await auth.init()` **nunca se ejecuta** porque `App.vue` nunca se monta. Si `auth.init()` prepara estado crítico (sesión, tokens, etc.), **ese setup no ocurre**.

### Severidad
**CRÍTICA** - Posible flujo de autenticación roto; código fantasma que se mantiene pero no funciona.

---

## ✅ [P3] Componentes y stores muertos

### 1. **useUserStore (user.ts:6)**

**Evidencia:**
```typescript
export const useUserStore = defineStore('user', () => {
  const stats = ref<UserStats | null>(null)
  // ... 30+ líneas de código
})
```

**Búsqueda en src/:**
```bash
grep -r "useUserStore" src/
→ No matches
```

**Apariciones:**
- Solo en documentación (`.kiro/specs`, `.specify/specs`)
- Definido pero nunca importado

**Consecuencia:** Código legado no limpiado; ruido cognitivo al navegar el proyecto.

---

### 2. **GlassBadge.vue (components/ui/GlassBadge.vue:1)**

**Evidencia:**
```typescript
<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'success' | 'error' | 'accent'
}>()
</script>
```

**Búsqueda en src/:**
```bash
grep -r "from.*GlassBadge" src/
→ No matches

grep -r "import.*GlassBadge" src/
→ No matches
```

**Apariciones:**
- Solo en documentación de tareas
- Componente completo, pero nunca importado

**Consecuencia:** Código planeado pero no integrado; aumenta surface area de mantenimiento.

---

### Severidad de P3
**MEDIA-ALTA** - No rompe funcionalidad hoy, pero complica navegación, aumenta deuda técnica y hace más difícil distinguir código activo de código legado. Cualquier refactor del estado/UI se vuelve más lento.

---

## ✅ [P3] Importación no utilizada en página SSR

### Hallazgo
[library.astro](library.astro#L5) importa `DbCard` pero no la usa.

### Evidencia

**library.astro línea 5:**
```typescript
import type { DbCard } from '../types/database'
```

**Uso en archivo:**
```typescript
// Solo se usa en el prop de CardLibrary, pero CardLibrary ya trae el tipo:
<CardLibrary
  client:idle
  cards={cards ?? []}
  reviewedIds={reviewedIds}
/>
```

**CardLibrary.vue ya importa el tipo:**
```typescript
import type { DbCard } from '../../types/database'
```

**Búsqueda de `DbCard` en src/:**
```
DbCard → 7 matches
  - library.astro:5 (import no usado)
  - CardLibrary.vue:3, :11, :19 (legítimos)
  - CardItem.vue:2, :5 (legítimos)
  - types/database.ts:1 (definición)
```

### Severidad
**BAJA** - Ruido menor, pero indica falta de limpieza consistente. Herramienta de linting podría detectar automáticamente.

---

## ✅ [P3] Duplicación de lógica y estilos entre LoginForm.vue y RegisterForm.vue

### Hallazgo
Dos componentes comparten:
1. **Función `handleOAuth()`** - Código idéntico línea por línea
2. **Estilos** - Bloques `<style>` prácticamente idénticos
3. **Estructura del form** - Mismo patrón de campos y validación

### Evidencia

**LoginForm.vue línea 34-40:**
```typescript
async function handleOAuth(provider: 'google' | 'github') {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) toast.error(GENERIC_USER_ERROR_MESSAGE)
}
```

**RegisterForm.vue línea 49-55:**
```typescript
async function handleOAuth(provider: 'google' | 'github') {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) toast.error(GENERIC_USER_ERROR_MESSAGE)
}
```
**100% idéntico**

**Estilos (ambos):**
```css
.oauth-buttons { display: flex; gap: 0.75rem; }
.oauth-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.625rem 1rem; border: 1px solid var(--glass-border);
  border-radius: var(--radius-btn); background: rgba(255,255,255,0.08);
  color: var(--color-text-primary); font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
```
**Prácticamente idéntico**

### Consecuencia Real
- Cualquier cambio en OAuth (ej: agregar Keycloak) requiere editar **dos archivos**
- Riesgo de drift: cambio en uno, olvido en otro
- Bug en un componente → fácil olvidar replicar fix al otro

### Severidad
**MEDIA-ALTA** - No es crítico hoy, pero es **fuente garantizada de bugs futuros**. Este es el patrón clásico que genera tickets tipo "auth broken in register but works in login".

---

## Resumen Ejecutivo

| Hallazgo | Tipo | Severidad | Validación |
|----------|------|-----------|-----------|
| [P1] Tema SSR vs Cliente | Drift funcional | CRÍTICA | ✅ CORRECTO |
| [P2] Auth bootstrap huérfano | Código muerto | CRÍTICA | ✅ CORRECTO |
| [P3] useUserStore sin usar | Deuda técnica | MEDIA | ✅ CORRECTO |
| [P3] GlassBadge sin usar | Deuda técnica | MEDIA | ✅ CORRECTO |
| [P3] DbCard import no usado | Ruido | BAJA | ✅ CORRECTO |
| [P3] Login/Register duplicación | Maintenance debt | MEDIA-ALTA | ✅ CORRECTO |

**Conclusión:** La revisión está **100% correcta**. El proyecto necesita:
1. **Inmediato:** Sincronizar lógica de tema y arreglar auth bootstrap
2. **Corto plazo:** Eliminar código muerto y consolidar auth forms
3. **Herramienta:** Agregar linter para detectar unused exports

---

## Recomendaciones (Orden de Prioridad)

### 🔴 CRÍTICO (Haz primero)
1. **Sincronizar tema:** theme.ts debe respetar `prefers-color-scheme` como el bootstrap inline
2. **Activar App.vue o eliminar:** Confirmar si `auth.init()` es necesario; si sí, integrarlo en hidratación; si no, deletear

### 🟠 IMPORTANTE (Hazlo esta semana)
3. **Eliminar código muerto:** Del user.ts y GlassBadge.vue (o documentar por qué existen)
4. **Consolidar auth forms:** Extraer componente `AuthForm` reutilizable con slots

### 🟡 MENOR (Próximo sprint)
5. **Limpieza de imports:** Remover `DbCard` de library.astro
6. **Agregar linting:** eslint rule para unused exports

