# OWASP compliance — game-learning (ASVS-lite, preview estática)

Fecha: 2026-10-15 · Alcance: preview estática anónima. Beta con cuentas (Kratos/Hono/Neon) bloqueada por gate legal: solo requisitos de diseño.

## Veredicto por categoría

| ASVS | Estado | Evidencia |
|---|---|---|
| V1 Arquitectura | ✅ Pass | `output: static`, sin backend. Contenido canónico en Git (`content/`), validado en import (falla el build). |
| V2 AuthN | N/A | Sin cuentas en preview. Beta: Kratos, username sin email, invitación un solo uso (`architecture.md`). |
| V3 Session | N/A | Sin cookies/sesiones. Solo `localStorage` anónimo + `theme`. |
| V4 Access Control | ✅ Pass | `getStaticPaths` solo 9 lecciones + 404/500. Sin IDs sensibles. Quiz respuestas públicas por diseño (`design.md:84` “no es evaluación segura”). |
| V5 Validación | ✅ Pass con nota | `validate.ts` (esquema, 4 opciones, claves únicas) + `isValidProgress` endurecido (`progress-storage.ts`: valida `lastAccessedLessonId: string\|null`). `save()` best-effort anti-quota. Nota: `v-html` con `format.ts` escapa `&<>"` antes de `<strong>/<code>`; seguro mientras el contenido sea solo Git revisado. |
| V7 Logs | ✅ Pass | Sin log de respuestas. Límite 7 días (`architecture.md:100`). `migrate/clear` silencian errores sin filtrar datos. |
| V8 Protección datos | ✅ Pass | Sin PII, sin analítica terceros. `localStorage` solo este navegador + borrado con `confirm()` (`CourseMap.vue`). Fuentes vía Google Fonts `@import` (ver nota CSP). |
| V9 Comunicaciones | ✅ Pass | HTTPS de Netlify. `HSTS max-age + includeSubDomains` en `netlify.toml` (sin `preload` a propósito: irreversible sin dominio final). |
| V10 Código malicioso | ✅ Pass con nota | Sin dependencias nuevas. Superficie: 1 script inline (tema, `BaseLayout.astro:31`) + bundles Astro/Vue + CSS Google Fonts. Nota: inline —→ hash/externalizar antes de CSP enforce. |
| V14 Configuración | ✅ Pass (report-only) | Headers en `netlify.toml`: `DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `COOP/COOP same-origin`. CSP en `Report-Only` (dry-run). `astro.config.mjs security.csp.hashes: []` pendiente de rellenar tras medir. |

## CSP: camino a enforce

Actual (report-only, no bloquea):
`default-src 'self'; script-src 'self'; style-src 'self' fonts.googleapis 'unsafe-inline'; font-src 'self' fonts.gstatic; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'`

Para enforce falta:
1. Desplegar, recoger violaciones (extensión CSP de Netlify o `report-uri`).
2. El script inline de tema viola `script-src 'self'`: opciones (a) mover a `/theme-init.js` externo, (b) añadir su `sha256-…` a `astro.config.mjs security.csp.scriptDirective.hashes`. Recomendado (a).
3. `style-src 'unsafe-inline'`: Astro/Tailwind inyectan estilos; medir si se puede quitar tras el reporte. `design.md:27` ya pide fuentes locales — al hospedarlas se cierra `font-src` a `'self'`.
4. Verificar con CSP Evaluator + securityheaders.com (objetivo A).

## Beta (no implementar sin gate legal)

Requisitos previos: revisión jurídica, salvaguardas menores, aviso privacidad, `Admin API` Kratos jamás pública, CSRF con cookie de sesión, autorización por endpoint, no aceptar score del cliente (recomputar en servidor), borrado autoservicio auditado. Ver `architecture.md:49-62,97-99`.

## Gates

`pnpm type-check + lint + vitest (43) + build (12 páginas) + playwright (12)` en verde el 2026-10-15 tras estabilizar selectores (`a.lesson-link`) y espera de hidratación.
