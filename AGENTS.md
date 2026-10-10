# Guía de agentes

## Antes de cambiar el proyecto

Lee primero `docs/constitution.md` y `MEMORY.md`; después consulta `architecture.md`, `design.md` y el requisito aplicable. No implementes nada si el requisito contradice esos documentos: aclara la decisión y actualiza la documentación aprobada.

## Roles

### planner
- Mantiene requisitos observables, criterios de aceptación y dependencias.
- Descompone el trabajo por feature y preserva alineación con la arquitectura.
- Marca explícitamente supuestos, gates y decisiones pendientes; no inventa políticas legales.

### implementer
- Escribe primero la prueba de comportamiento y sigue RED → GREEN → REFACTOR.
- Implementa dentro de la feature y respeta sus límites, puertos y adaptadores.
- No añade dependencias, servicios, persistencia o alcance sin aprobación.
- No confía en datos de corrección del navegador ni expone secrets.

### reviewer
- Comprueba requisitos, arquitectura, pruebas, comportamiento y límites de integración.
- En UI, revisa responsive, navegación por teclado, foco, semántica, accesibilidad y estados.
- Verifica el diff y reporta hallazgos con ubicación, impacto y evidencia.

## Investigación de fallos

Ante cualquier fallo: 1) reproducir; 2) aislar; 3) formular hipótesis; 4) verificarla; 5) aplicar la corrección mínima justificada; 6) repetir las pruebas relevantes. No parchear especulativamente.

## Reglas operativas

- La preview inicial es pública, anónima y sin persistencia; no implica que exista un despliegue.
- Cuentas quedan bloqueadas por el gate legal. Un runner de código queda fuera del alcance hasta una decisión y diseño de aislamiento aprobados.
- Actualiza `MEMORY.md` cuando cambien fase, riesgos, decisiones o estado verificable; actualiza arquitectura/diseño si cambia un límite.
- No declares una prueba, despliegue, revisión legal o mitigación completada sin evidencia ejecutada.
