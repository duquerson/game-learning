# Constitución del proyecto

1. **Especificación primero:** todo cambio de comportamiento debe tener requisito observable y criterio de aceptación antes de implementarse.
2. **Organización por features:** la estructura primaria es `features/<feature>` dentro de cada aplicación; no crear capas globales horizontales como organización principal.
3. **Complejidad proporcional:** aplicar Ports & Adapters solo donde haya reglas significativas, proveedores externos o variabilidad de infraestructura.
4. **Dominio independiente:** reglas educativas y de progreso se prueban sin DOM, framework, base de datos ni proveedor externo.
5. **TDD:** seguir RED → GREEN → REFACTOR; primero una prueba fallida que describa el comportamiento, luego la implementación mínima y refactor seguro.
6. **Pruebas:** cambios de dominio requieren unit tests; cambios de contratos/integraciones requieren pruebas de integración; flujos visibles críticos requieren E2E.
7. **Dependencias:** toda dependencia externa nueva necesita justificación y aprobación; no agregar una dependencia no aprobada.
8. **Fronteras seguras:** nunca confiar en puntajes del cliente, secretos en el bundle, autenticación del proxy ni código no confiable en el proceso web.
9. **Cambios arquitectónicos:** no cambiar decisiones o límites documentados sin registrar motivo, impacto y actualización de `architecture.md`/`design.md`.
10. **Fallo investigado:** reproducir y aislar antes de modificar; no aplicar correcciones especulativas.
11. **Privacidad:** recolectar el mínimo; no habilitar cuentas hasta superar los gates legales y de protección definidos.
12. **No certificación:** quizzes formativos no se describen como certificación ni acreditación.
