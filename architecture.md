# Arquitectura — game-learning

## Propósito y restricciones

Plataforma de aprendizaje de JavaScript para principiantes. Entrega inicial: preview estática pública en Netlify, en español, sin cuentas ni progreso persistente. El primer lanzamiento no ejecuta código. La beta de cuentas/progreso se mantiene como fase separada y condicionada a revisión legal, privacidad, operación y pruebas de sesión.

Principios: Feature-Oriented Architecture (FOA); dominio educativo testeable sin infraestructura; monorepo pnpm; conservar solo código/contenido existente revisado. El baseline conocido es el commit `2afcfc8ae1b99b021c6b6daafd647d791179ff7d`; verificar el HEAD antes de usar sus hallazgos.

## Inventario de features y complejidad

| Feature | Responsabilidad y límite | Complejidad | Estructura / dependencias |
|---|---|---|---|
| `learning-content` | Catálogo de 3 niveles, 3 unidades y 9 lecciones; contratos y validación de contenido | Simple | Contenido versionado en Git, esquema de contenido y validadores cercanos a la feature. Sin proveedores externos. |
| `learning-experience` | Navegación, páginas Astro, componentes Vue donde haya interacción y estados de aprendizaje | Simple | `apps/web/src/features/learning-experience/`; depende de contratos de contenido y quiz, no de persistencia. |
| `quiz` | Selección múltiple, evaluación formativa, explicación inmediata y regla 4/5 | Simple | Funciones puras y esquema local; respuestas públicas, no certificación. No usar IA para calificar. |
| `progress` | Estado leído/dominado y avance por lección; separar preview, local y futuro remoto | Compleja | Dominio puro + puerto `ProgressStore`; adaptador efímero en preview, persistencia local en Compose y adaptador PostgreSQL solo para beta. |
| `auth` | Identidad y sesión en etapa posterior, invitaciones y autorización | Compleja | `apps/api/src/features/auth/{domain,ports,adapters}`; Ory Kratos como proveedor aislado; Hono valida sesión y autorización por endpoint. No desplegar en preview. |
| `content-publishing` | Seeds idempotentes del contenido aprobado para persistencia futura | Simple | Adaptador de carga/migración dependiente de `learning-content`; no duplica la fuente canónica versionada. |
| `ai-advisor` | Sugerencias educativas opcionales, nunca calificación | Compleja y diferida | Solo al aprobarse: puerto de asesoría, adaptadores opcionales Gemini Nano/Ollama y fallback curado; desactivable sin afectar el aprendizaje. |
| `code-runner` | Ejecución aislada de respuestas de código | Compleja y fuera del MVP | No crear ni desplegar en el alcance actual. Requiere decisión futura, dominio propio, revisión de amenazas y sandbox dedicado; un contenedor común no es suficiente. |

No hay puntuación, rachas, insignias, temporizador ni dominio por ejercicios opcionales.

## Topología por etapa

### Preview inicial

```text
Navegador
   │ páginas y quiz; estado solo durante la sesión
   ▼
Astro estático + interacciones Vue ── Netlify
   └── contenido público versionado en Git
```

No requiere Hono, Kratos, PostgreSQL ni llamadas a proveedor de IA. Tras recarga/cierre no se conserva progreso.

### Modo local previsto

```text
Docker Compose
  ├── Astro / Vue
  ├── API Hono (solo si la persistencia local la requiere)
  └── PostgreSQL local (si aplica)
```

Un perfil por instalación, sin login, sin servicios remotos obligatorios y con datos separados de beta. Restablecimiento de progreso requiere confirmación.

### Beta autenticada, bloqueada hasta superar gates

```text
Navegador ── mismo origen (/api/* y rutas de auth) ── Netlify (Astro SSR)
                                                        │ proxy
                                                        ▼
                                                Render (Hono + Kratos)
                                                  │             │
                                                  ▼             ▼
                                           Neon: datos app   Neon: datos Kratos
                                           DB/usuario propio DB/usuario propio
```

La separación lógica/credenciales de datos de Kratos y la aplicación es obligatoria. El proxy same-origin evita exponer el origen en flujos normales del navegador, pero no es un control de seguridad: cada host/endpoint debe protegerse directamente. No exponer Admin API de Kratos. Los cookies, CSRF, redirecciones y sesiones deben probarse detrás del proxy antes de activar login.

## Estructura propuesta

```text
apps/
  web/
    src/features/
      learning-content/
      learning-experience/
      quiz/
      progress/
    content/                  # lecciones y traducciones versionadas
  api/                        # solo etapas que requieran API
    src/features/
      auth/{domain,ports,adapters}/
      progress/{domain,ports,adapters}/
      content-publishing/
packages/
  contracts/                  # DTOs compartidos estrictamente necesarios
  config/                     # configuración compartida real, no dumping ground
infra/
  compose/
  migrations/
```

La forma concreta debe integrarse con el repositorio vigente tras la fase de re-baseline. No migrar por simetría features simples a arquitectura hexagonal. `packages/contracts` solo contiene contratos de frontera; no es dominio compartido general.

## Contratos y propiedad de datos

- Contenido canónico: versionado en Git; seeds idempotentes si se sincroniza con DB.
- Quiz: pregunta, cuatro opciones, identificador de respuesta y explicación; el cliente muestra resultado inmediato. Como el contenido es público, no se promete resistencia a inspección.
- Progreso: estados `not_started`, `in_progress`, `mastered`; dominio exige lectura registrada y 4/5; reintentos ilimitados.
- Preview: progreso efímero; sin almacenamiento remoto ni creación de cuenta.
- Local: instancia individual, almacenamiento local opcional definido en implementación; jamás sincroniza con beta.
- Beta: identidad de Kratos y datos de progreso en persistencia separada por usuario; no aceptar score calculado por cliente como autoridad. Backend carga respuestas correctas y verifica cada intento.
- Cuenta propuesta: nombre de usuario + contraseña; sin correo obligatorio; acceso inicial por invitación de un solo uso; sin recuperación por correo. El procedimiento administrativo de restablecimiento debe ser seguro, auditado y documentado antes de abrir cuentas.
- Datos mínimos beta: identificador interno, nombre de usuario y progreso; sin perfil público ni analítica de terceros. Borrado autoservicio de identidad/progreso, sujeto a revisión legal del mecanismo anti-abuso.
- Logs técnicos: objetivo máximo de siete días, sin secretos ni respuestas/contenido innecesario.

## Dependencias, integraciones y límites

- Web: Astro + Vue 3 + TypeScript; adapter Netlify y SSR únicamente al activar autenticación.
- API futura: Node.js + Hono; dominio no importa Hono.
- DB futura: PostgreSQL + Drizzle; repositorio detrás de puerto por feature compleja.
- Identidad: Ory Kratos self-hosted, recomendado para el requisito de username sin email; sin acceso público a Admin API.
- Hosting futuro de beta: Netlify, Render Free y Neon Free en Virginia, sujeto a prueba y términos vigentes. Render Free duerme y puede despertar lentamente; Netlify proxy limita tiempo (documentado 26 s); cuotas, persistencia, backups y condiciones pueden cambiar. No es producción con SLA.
- IA: optativa y diferida; ninguna credencial en cliente. Ollama no forma parte de MVP; Gemini Nano depende de navegador compatible y de aceptación de privacidad.
- No enviar secretos a proveedores ni incluirlos en código cliente.
- Búsqueda especializada de skills encontró opciones para Ory Kratos con adopción muy baja (1–2 instalaciones); no se instala ni recomienda como dependencia. Consultar documentación oficial y revisar seguridad durante implementación.

## Dirección de dependencias

```text
UI → casos de uso/servicios de feature → dominio puro
                                   └→ puertos → adaptadores (DB/Kratos/proveedores)
```

Features simples pueden omitir casos de uso/puertos si no añaden valor. Ninguna regla de aprendizaje depende del DOM, Astro/Vue, Hono, PostgreSQL, Kratos o un modelo.

## Pruebas y evolución

- Dominio: tests unitarios de quiz, progreso, transición de estados y límites.
- Contenido: validación de esquema, número de preguntas/opciones, claves únicas y equivalencia de idioma.
- Integración: migraciones, seeds idempotentes, persistencia, sesiones, autorización y borrado.
- E2E: preview anónima y, tras autorización legal, beta autenticada; responsive, navegación por teclado, carga/error y cold starts.
- Seguridad: revisión de dependencias basada en evidencia; CSRF/cookies/sesión; autorización en cada endpoint; fuerza bruta de invitaciones; no confiar en proxy.
- La primera preview se puede publicar sin usuarios ni API. Las cuentas quedan bloqueadas hasta revisión legal, salvaguardas de menores, privacidad y prototipo de sesión.
- Ejecutar código de usuario no se incorpora por cambiar solo el tipo de pregunta: requiere arquitectura y proveedor aislado separados.
- Todo cambio de proveedor, persistencia, autenticación, ejecución de código o dominio debe justificar requisitos, amenaza, costo, pruebas y migración, y actualizar estos documentos.

## Capacidades adicionales

No se requiere instalar una skill adicional para esta fase documental. La autenticación Ory es una integración especializada: implementación futura debe consultar documentación oficial de Kratos, revisar configuración de despliegue y realizar revisión de seguridad; las skills de Kratos halladas no muestran adopción suficiente para recomendarlas.
