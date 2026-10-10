# MEMORY

## Estado

**Phase 0 — Scaffolding completed.** Se documentó la base SDD y el plan; no se ha iniciado implementación ni despliegue.

## Objetivo

Replantear `duquerson/game-learning` como plataforma de aprendizaje de JavaScript para principiantes, primero con una preview pública estática, anónima y efímera. El alcance actual no ejecuta código ni certifica dominio.

## Decisiones importantes

- **ADR-001 — Feature-Oriented Architecture:** features son la unidad primaria, dentro de cada aplicación.
- **ADR-002 — Puertos y adaptadores selectivos:** aplicar solo a complejidad, proveedores o persistencia que justifiquen esa frontera; no sobrearquitecturar CRUD/contenido.
- Currículo propuesto: 3 niveles, una unidad por nivel y 3 lecciones por unidad; la secuencia de 9 temas es candidata y requiere revisión didáctica.
- Quiz de 5 preguntas × 4 opciones, feedback inmediato, sin timer, reintentos ilimitados. Dominio futuro requiere lectura + 4/5; práctica opcional no bloquea.
- Preview pública Netlify sin cuentas ni persistencia; después, si se superan gates, Astro SSR/Netlify, Hono/Render, PostgreSQL/Drizzle/Neon y Ory Kratos autoalojado.
- Cuentas propuestas para fase posterior: username/contraseña sin email obligatorio, acceso por invitación única, sin recuperación por email. Cookies/proxy requieren prototipo antes de habilitar.
- Modo local Compose: una persona, sin login ni servicios remotos obligatorios, progreso separado y reinicio confirmado.
- Sin migración de cuentas/progreso actuales; rescatar solo código y contenido revisados.
- IA de ayuda es optativa/diferida y nunca califica. Runner de código fuera de alcance hasta diseño de sandbox dedicado y decisión futura.

## Riesgos y decisiones pendientes

- Baseline técnico anterior corresponde al SHA `2afcfc8ae1b99b021c6b6daafd647d791179ff7d`; debe repetirse contra HEAD antes de implementar.
- README/specs existentes pueden contradecir el producto y requieren reconciliación.
- Los hallazgos previos de audit no equivalen a vulnerabilidades explotables; triaje pendiente.
- Cuentas internacionales/usuarios menores bloqueados hasta revisión jurídica, privacidad y salvaguardas. No inferir edad/región permitida.
- Netlify proxy/Render cold start/Neon Free no dan SLA ni garantizan disponibilidad, cuota, backup o retención; revalidar términos y medir flujo real.
- Revisión didáctica de currículo, equivalencia bilingüe y procedimiento administrativo de reset aún pendientes.
- No se ha comprobado ni publicado una URL live.

## Lecciones y capacidades

- No confiar en puntuación enviada por navegador.
- No tratar un proxy como frontera de autorización.
- No ejecutar código no confiable en un contenedor común o proceso web.
- El runner requiere sandbox aislado, límites de egress/recursos, sin secretos ni acceso a BD.
- Ory Kratos es integración especializada; las skills encontradas tienen muy baja adopción y no se instalaron. Consultar docs oficiales y hacer revisión de seguridad durante su fase.
- Agentes futuros leen primero `docs/constitution.md` y este archivo; mantener aquí solo estado y decisiones, no copiar arquitectura completa.
