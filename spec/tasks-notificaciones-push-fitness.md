# Tareas: Sistema de Notificaciones Push Inteligentes

## Fase 1: Fundación

- [ ] 1.1 Configurar esquema de base de datos
  - **Descripción**: Migraciones Prisma para tablas: notification_preferences, device_tokens, notification_logs, weekly_challenges. Índices y constraints.
  - **Criterio**: Migraciones ejecutadas sin errores. Prisma generate exitoso.
  - **Verificar**: `npx prisma migrate dev` + `npx prisma generate`
  - **Depende de**: —
  - **Archivos**: `prisma/schema.prisma`

- [ ] 1.2 Configurar Redis para colas y rate limiting
  - **Descripción**: Configurar ioredis, helpers para Bull/Queue y contadores atómicos INCR/EXPIRE.
  - **Criterio**: Backend conecta a Redis. Queue registra y consume mensajes.
  - **Verificar**: `npm run test:redis`
  - **Depende de**: —
  - **Archivos**: `src/config/redis.ts`, `src/lib/queue.ts`

- [ ] 1.3 Integrar Firebase Admin SDK
  - **Descripción**: Configurar firebase-admin. Crear FCM Gateway con método sendNotification().
  - **Criterio**: SDK inicializa. Push de prueba exitoso a dispositivo dev.
  - **Verificar**: `npm run test:fcm`
  - **Depende de**: —
  - **Archivos**: `src/config/firebase.ts`, `src/services/fcm-gateway.ts`

- [ ] 1.4 `[P]` Dependencias de frontend
  - **Descripción**: Instalar @react-native-firebase/messaging. Configurar permisos push y deep linking.
  - **Criterio**: App solicita permiso push. Token FCM obtenido.
  - **Verificar**: Build exitoso en iOS y Android
  - **Depende de**: —
  - **Archivos**: `ios/Podfile`, `android/app/build.gradle`, `App.tsx`

## Fase 2: Core

- [ ] 2.1 Implementar endpoints de preferencias
  - **Descripción**: Router /notifications/preferences con GET y PUT. Validación JSON Schema. Persistencia + cache invalidation.
  - **Depende de**: 1.1, 1.2
  - **Archivos**: `src/routes/notifications.ts`, `src/services/preferences-service.ts`

- [ ] 2.2 Implementar endpoints de tokens
  - **Descripción**: Router /notifications/tokens con POST, DELETE, GET. Cifrado AES-256-GCM.
  - **Depende de**: 1.1, 1.2
  - **Archivos**: `src/routes/notifications.ts`, `src/services/token-service.ts`

- [ ] 2.3 Implementar Notification Scheduler (Cron)
  - **Descripción**: Jobs para batch diario de recordatorios, retos semanales, y seguimiento de inactividad.
  - **Depende de**: 1.1, 1.2
  - **Archivos**: `src/jobs/scheduler.ts`, `src/jobs/workout-reminder.ts`

- [ ] 2.4 `[P]` Implementar Queue Worker
  - **Descripción**: Worker que consume cola Redis, aplica rate limiting, verifica DND, renderiza template, envía FCM.
  - **Depende de**: 1.2, 1.3, 2.3
  - **Archivos**: `src/workers/notification-worker.ts`

- [ ] 2.5 Implementar Rate Limiter
  - **Descripción**: Módulo con INCR + EXPIRE. Método checkAndIncrement(userId): { allowed, count }.
  - **Depende de**: 1.2
  - **Archivos**: `src/services/rate-limiter.ts`

- [ ] 2.6 `[P]` Implementar Template Engine
  - **Descripción**: Templates con placeholders ({{nombre_ejercicio}}), cache Redis, flag de aprobación.
  - **Depende de**: 1.1, 1.2
  - **Archivos**: `src/services/template-engine.ts`

## Fase 3: Móvil

- [ ] 3.1 Crear NotificationPreferencesScreen
  - **Descripción**: Pantalla con toggles, selector de franja horaria, preview en vivo, cache local en AsyncStorage.
  - **Depende de**: 1.4, 2.1
  - **Archivos**: `src/screens/NotificationPreferencesScreen.tsx`

- [ ] 3.2 Implementar Messaging Service
  - **Descripción**: Solicitar permiso push, registrar token, escuchar notificaciones, manejar deep links.
  - **Depende de**: 1.4, 2.2
  - **Archivos**: `src/services/messaging.ts`

- [ ] 3.3 Implementar pantalla de progreso semanal
  - **Descripción**: Barra de progreso, días restantes, lista de completados/pendientes.
  - **Depende de**: 1.1, 3.2
  - **Archivos**: `src/screens/WeeklyChallengeScreen.tsx`

## Fase 4: Integración

- [ ] 4.1 Integrar evento de superación de amigo
  - **Descripción**: Al registrarse un nuevo PR, notificar a amigos mutuos con preferencia activa.
  - **Depende de**: 2.4, 2.5, 3.2
  - **Archivos**: `src/events/milestone-event.ts`

- [ ] 4.2 Implementar actualización de reto semanal
  - **Descripción**: Al completar entrenamiento, incrementar contador. Al alcanzar objetivo, push de celebración.
  - **Depende de**: 2.3, 3.3
  - **Archivos**: `src/events/challenge-event.ts`

- [ ] 4.3 Implementar endpoint de logs y lectura
  - **Descripción**: GET /logs (paginado) y PATCH /logs/:id/read.
  - **Depende de**: 1.1
  - **Archivos**: `src/routes/notifications.ts`

## Fase 5: Pruebas

- [ ] 5.1 Tests unitarios del backend
  - **Descripción**: Jest para Rate Limiter, Template Engine, FCM Gateway, Preferences Service. > 90% coverage.
  - **Depende de**: 2.5, 2.6, 2.1

- [ ] 5.2 Tests de integración
  - **Descripción**: Pipeline completo: scheduler → queue → rate limiter → FCM → log. Usar Redis/Postgres de test.
  - **Depende de**: 5.1, 2.3, 2.4

- [ ] 5.3 Tests de frontend
  - **Descripción**: React Native Testing Library para NotificationPreferencesScreen.
  - **Depende de**: 3.1, 3.2

- [ ] 5.4 Prueba de rendimiento (batch diario)
  - **Descripción**: Simular 100k usuarios. Batch en < 5 min. Cola vacía en < 10 min.
  - **Depende de**: 5.2

- [ ] 5.5 Prueba de escenarios de error
  - **Descripción**: Verificar ERR-001 a ERR-007. Token inválido, FCM caído, rate limit, etc.
  - **Depende de**: 5.2

- [ ] 5.6 Prueba de deep links
  - **Descripción**: Verificar navegación correcta en los 3 estados de app (foreground, background, terminada).
  - **Depende de**: 3.2, 5.3

## Fase 6: Documentación y Deploy

- [ ] 6.1 Documentación de API (OpenAPI 3.0)
  - **Depende de**: 2.1, 2.2, 4.3

- [ ] 6.2 Runbook de operaciones
  - **Depende de**: 5.4, 5.5

- [ ] 6.3 Deploy a staging
  - **Depende de**: 5.2, 5.5, 6.1

- [ ] 6.4 PR Review y merge a main
  - **Depende de**: 6.3

---

**Notas:**
- `[P]` = paralelizable
- Cada tarea estimada en 1-4 horas
- Estimación total: ~40-50 horas
- Completar en orden de dependencia
