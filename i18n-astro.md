# Internacionalización (i18n) para Astro + Vue 3 + Tailwind CSS v4 + TypeScript + Zod

## Contexto
- **Framework**: Astro (arquitectura de islands)
- **UI Framework**: Vue 3 via `@astrojs/vue`
- **Estilizado**: Tailwind CSS v4
- **Type Safety**: TypeScript
- **Validación**: Zod para validación de tiempo de ejecución

---

## Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [TypeScript & Zod](#typescript--zod)
4. [Componente LanguageSwitcher.vue](#componente-languageswitchervue)
5. [Tailwind CSS v4](#tailwind-css-v4)
6. [Middleware i18n](#middleware-i18n)
7. [Flujo de Usuario](#flujo-de-usuario)
8. [Pruebas Recomendadas](#pruebas-recomendadas)

---

## Configuración Inicial

### `astro.config.mjs`
```javascript
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ejemplo.com',
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: true,
    },
  },
});
```

---

## Estructura de Archivos
```
src/
├─ components/
│  └─ LanguageSwitcher.vue     // Componente Vue 3
├─ i18n/
│  ├─ utils.ts                 // Utilidades con TypeScript
│  ├─ schemas/                 // Esquemas Zod
│  │  ├─ locale.schema.ts
│  │  └─ translation.schema.ts
│  └─ locales/
│     ├─ en.json
│     └─ es.json
├─ middleware/
│  └─ i18n.ts                  // Detección y redirección
├─ pages/
│  ├─ index.astro
│  └─ [locale]/
│     ├─ index.astro
│     └─ about.astro
└─ styles/
   └─ tailwind.css            // Configuración Tailwind
```

---

## TypeScript & Zod

### `i18n/utils.ts`
```typescript
import { z } from 'zod';

export const LocaleSchema = z.enum(['en', 'es']);
export type Locale = z.infer<typeof LocaleSchema>;

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  const result = LocaleSchema.safeParse(lang);
  return result.success ? result.data : 'en';
}

export function useTranslations(lang: Locale) {
  const translations = {
    en: { header: { title: 'Welcome' }, home: { welcome: 'Hello!' } },
    es: { header: { title: 'Bienvenido' }, home: { welcome: '¡Hola!' } },
  } as const;

  return function t<T extends keyof typeof translations[Locale]>(
    key: T
  ): typeof translations[Locale][T] {
    return translations[lang][key] || translations['en'][key];
  };
}
```

### `i18n/schemas/locale.schema.ts`
```typescript
import { z } from 'zod';

export const LocaleSchema = z.enum(['en', 'es']);

export const BrowserLocaleSchema = z
  .string()
  .transform((val) => val.split('-')[0] as Locale)
  .refine((val) => val === 'en' || val === 'es', {
    message: 'Idioma no soportado, usando predeterminado',
  });
```

### `i18n/schemas/translation.schema.ts`
```typescript
import { z } from 'zod';

export const TranslationSchema = z.object({
  header: z.object({ title: z.string() }),
  home: z.object({ welcome: z.string() }),
  language: z.object({
    switch_to_en: z.string(),
    switch_to_es: z.string(),
  }),
  meta: z.object({ title: z.string() }),
});
```

---

## Componente LanguageSwitcher.vue
```vue
<template>
  <button
    @click="switchLanguage"
    class="px-3 py-1.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 flex items-center gap-2"
  >
    <span>{{ t(`language.switch_to_${otherLang}`) }}</span>
  </button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useTranslations, getLangFromUrl } from '@/i18n/utils';
import { LocaleSchema } from '@/i18n/schemas/locale.schema';

const url = new URL(window.location.href);
const langParam = url.pathname.split('/')[1];
const lang = LocaleSchema.safeParse(langParam).success
  ? (langParam as 'en' | 'es')
  : 'en';
const t = useTranslations(lang);
const otherLang = lang === 'en' ? 'es' : 'en';

const switchLanguage = () => {
  const currentPath = url.pathname.replace(/^\/[a-z]{2}\//, '');
  window.location.href = `/${otherLang}${currentPath}`;
};
</script>
```

---

## Tailwind CSS v4

### `styles/tailwind.css`
```css
@theme {
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-background: #ffffff;
  --color-text: #1f2937;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### PostCSS Config (`postcss.config.js`)
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## Middleware i18n

### `middleware/i18n.ts`
```typescript
import { defineMiddleware } from 'astro:middleware';
import { getLangFromUrl } from '@/i18n/utils';
import { LocaleSchema } from '@/i18n/schemas/locale.schema';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const hasLocalePrefix = /^\/([a-z]{2})\//.test(pathname);

  if (!hasLocalePrefix && pathname !== '/') {
    const browserLang = context.request.headers.get('accept-language')?.split(',')[0] || 'en';
    const detectedLang = LocaleSchema.safeParse(browserLang.split('-')[0]).success
      ? (browserLang.split('-')[0] as 'en' | 'es')
      : 'en';

    return context.redirect(`/${detectedLang}${pathname}`);
  }

  if (pathname === '/') {
    const browserLang = context.request.headers.get('accept-language')?.split(',')[0] || 'en';
    const detectedLang = LocaleSchema.safeParse(browserLang.split('-')[0]).success
      ? (browserLang.split('-')[0] as 'en' | 'es')
      : 'en';

    if (detectedLang !== 'en') {
      return context.redirect(`/${detectedLang}/`);
    }
  }

  return next();
});
```

---

## Flujo de Usuario

### 1. Primera Visita
- Usuario accede a `https://ejemplo.com/`
- Middleware lee encabezado `Accept-Language` (ej: `es-ES`)
- Redirige a `https://ejemplo.com/es/`
- Carga contenido en español

### 2. Navegación Interna
- Usuario visita `https://ejemplo.com/es/about`
- Middleware valida prefijo y permite acceso
- Todo el contenido se muestra en español

### 3. Cambio Manual de Idioma
- Usuario hace clic en "Switch to English"
- Componente construye URL: `/en/about`
- Recarga la página mostrando contenido en inglés
- URL se actualiza manteniendo la misma ruta

---

## Pruebas Recomendadas

### Unitarias (Vitest)
- [ ] `getLangFromUrl` devuelve el idioma correcto
- [ ] Validación Zod acepta solo `en|es`
- [ ] Fallback al idioma predeterminado funciona

### E2E (Playwright)
- [ ] Redirección automática según `Accept-Language`
- [ ] Cambio de idioma mantiene la ruta
- [ ] Contenido se muestra en el idioma correcto
- [ ] URLs con prefijo `/es/` y `/en/` funcionan

### Edge Cases
- [ ] Idioma no soportado (`fr`, `de`) → fallback a `en`
- [ ] URL sin idioma redirige correctamente
- [ ] Componentes se hidratan correctamente con SSR

---

## Notas de Implementación

### SSR y Hydration
- Usa `client:load` en `LanguageSwitcher` para interactividad inmediata
- Evita `client:only` para mantener el renderizado del servidor
- Valida tipos en tiempo de compilación y ejecución

### Rendimiento
- Archivos JSON de traducciones se cachean (1 año)
- Zod valida solo en el cliente o durante el middleware
- Tailwind v4 reduce el tamaño del CSS con tree-shaking

### Seguridad
- No expongas secretos en el frontend
- Valida todas las entradas del usuario con Zod
- Usa HTTPS en producción