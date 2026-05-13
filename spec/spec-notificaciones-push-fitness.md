---
title: Sistema de Notificaciones Push Inteligentes — App Fitness
version: 1.0
date_created: 2026-05-13
owner: Equipo de Producto — Carolina M.
tags: especificación, user-stories, notificaciones, push, fitness, behavioral-design
---

# Sistema de Notificaciones Push Inteligentes

## 1. Propósito y Alcance

Sistema de notificaciones push contextuales y personalizadas para una app de fitness multiplataforma (iOS/Android). El sistema gestiona tres tipos de notificaciones: recordatorios de entrenamiento con marcas personales, retos semanales con seguimiento de progreso, y alertas sociales cuando un amigo supera su marca personal.

La solución se integra con el stack existente (React Native, Node.js, PostgreSQL, Redis) y utiliza Firebase Cloud Messaging (FCM) como infraestructura de push unificada para ambas plataformas. Incluye configuración de preferencias de usuario, rate limiting (máximo 3 push/día), silencio nocturno, resiliencia offline y colas de reintentos.

El alcance incluye el backend de procesamiento y envío, el módulo de configuración en la app móvil, y la integración con los módulos existentes de planes de entrenamiento y red social. Queda fuera del alcance: diseño visual detallado de la pantalla de configuración, implementación de A/B testing de copies, y el sistema de analytics externo.

## 2. Definiciones

| Término | Definición |
|---------|-----------|
| FCM | Firebase Cloud Messaging — infraestructura de Google para envío de notificaciones push a iOS y Android |
| APNs | Apple Push Notification service — servicio nativo de Apple para notificaciones push |
| PR | Personal Record — mejor marca personal del usuario en un ejercicio específico |
| Token de dispositivo | Identificador único que FCM/APNs asigna a cada instalación de la app para envío de push |
| DND | Do Not Disturb — modo silencio del sistema operativo que bloquea notificaciones |
| Reto semanal | Desafío automático que establece como objetivo completar todos los entrenamientos planificados para la semana |
| Badge count | Número con la cuenta de notificaciones no leídas que aparece en el ícono de la app |
| Deep link | Enlace que abre la app en una sección específica en lugar de la pantalla de inicio |
| LWW | Last Writer Wins — estrategia de resolución de conflictos donde el último cambio prevalece |
| Batch diario | Proceso que ejecuta el servidor cada día para calcular y encolar notificaciones programadas |

## 3. User Stories

### US-001: Recordatorio de entrenamiento personalizado
- **Resumen**: Recibir push matutino con entrenamiento del día y mejor marca personal
- **Persona**: Entusiasta del fitness
- **Como** entusiasta del fitness **quiero** un recordatorio push con mi mejor marca **para** sentirme motivado antes del gimnasio
- **Escenario:** Recordatorio enviado en la franja horaria del usuario
- **Dado** que tengo un plan de entrenamiento activo
- **Y dado** que tengo notificaciones de recordatorio activadas
- **Y dado** que hoy tengo entrenamiento programado
- **Cuando** sean las 7:30 AM (o mi franja horaria configurada)
- **Entonces** recibo un push con el texto: "¡Hoy toca [grupo muscular]! Tu mejor marca en [ejercicio] es [marca]kg 💪"

### US-002: Control de preferencias de notificación
- **Resumen**: Configurar tipos y horarios de notificaciones
- **Persona**: Ambos perfiles
- **Como** usuario **quiero** activar/desactivar tipos de notificación **para** controlar cuándo me llegan avisos
- **Escenario:** Usuario configura notificaciones desde Settings
- **Dado** que estoy logueado en la app
- **Cuando** accedo a Settings > Notificaciones y configuro preferencias
- **Entonces** veo un preview en vivo y mis cambios se guardan local y remotamente

### US-003: Reto semanal personalizado
- **Resumen**: Recibir reto semanal con seguimiento de progreso
- **Persona**: Entusiasta del fitness
- **Como** usuario activo **quiero** un reto semanal **para** mantener constancia y medir progreso
- **Escenario:** Reto semanal creado y notificado el lunes
- **Dado** que tengo un plan de entrenamiento activo
- **Cuando** son las 10:00 AM del lunes
- **Entonces** recibo un push con mi objetivo semanal y progreso actual

### US-004: Notificación de superación de amigo
- **Resumen**: Alerta cuando un amigo supera su marca personal
- **Persona**: Entusiasta del fitness
- **Como** usuario con amigos **quiero** saber cuando superan marcas **para** celebrar y motivarme
- **Escenario:** Amigo supera marca personal
- **Dado** que tengo al menos un amigo mutuo
- **Y dado** que mi amigo registra un nuevo PR
- **Cuando** el sistema procesa el nuevo PR
- **Entonces** recibo un push con el nombre del amigo, ejercicio y nuevo récord

### US-005: Rate limiting y silencio nocturno
- **Resumen**: Límite de 3 push/día y respeto del horario de sueño
- **Persona**: Ambos perfiles
- **Como** usuario **quiero** límites inteligentes **para** no sentirme abrumado
- **Escenario:** Límite diario alcanzado
- **Dado** que ya recibí 3 notificaciones hoy
- **Cuando** se genera un nuevo evento
- **Entonces** se descarta y registra como "skipped (daily limit)"

### US-006: Offline resiliencia y cola de notificaciones
- **Resumen**: Notificaciones no se pierden cuando el dispositivo está offline
- **Persona**: Ambos perfiles
- **Como** usuario con conectividad intermitente **quiero** que las notificaciones se encolen **para** recibirlas cuando reconecte
- **Escenario:** Notificación generada mientras el usuario está offline
- **Dado** que el dispositivo está sin conexión
- **Cuando** se genera una notificación en el servidor
- **Entonces** se encola con estado "pending" y se reintenta máximo 3 veces con backoff exponencial

## 4. Requerimientos Funcionales

- **RF-001**: El sistema debe permitir al usuario activar/desactivar individualmente cada tipo de notificación
- **RF-002**: El sistema debe permitir al usuario configurar su franja horaria preferida
- **RF-003**: El sistema debe enviar recordatorios de entrenamiento según el plan semanal y mejor marca personal
- **RF-004**: El sistema debe crear un reto semanal automático cada lunes
- **RF-005**: El sistema debe enviar notificación de seguimiento si el usuario no ha completado entrenamientos a mitad de semana
- **RF-006**: El sistema debe notificar cuando un amigo mutuo registra un nuevo PR
- **RF-007**: El sistema debe limitar el envío a máximo 3 notificaciones push por día por usuario
- **RF-008**: El sistema debe respetar silencio nocturno (10 PM - 7 AM hora local)
- **RF-009**: El sistema debe encolar notificaciones cuando el dispositivo está offline y reintentar con backoff exponencial
- **RF-010**: El sistema debe invalidar tokens de dispositivo expirados
- **RF-011**: El sistema debe soportar deep links desde cada tipo de notificación
- **RF-012**: El sistema debe mostrar un preview en vivo de la notificación durante la configuración
- **RF-013**: El sistema debe registrar en log todas las notificaciones enviadas, entregadas y abiertas
- **RF-014**: El sistema debe detectar zona horaria del usuario y recalcular ventanas de envío
- **RF-015**: El sistema debe persistir preferencias localmente y sincronizar con servidor

## 5. Requerimientos No Funcionales

- **RNF-001 — Rendimiento**: Entrega de notificaciones en < 30s desde generación del evento
- **RNF-002 — Rendimiento**: Procesamiento del batch diario en < 5 min para toda la base
- **RNF-003 — Rendimiento**: Consultas de configuración en < 200ms p99
- **RNF-004 — Escalabilidad**: Soportar 50,000 DAU, 300,000 MAU, 150,000 push/día
- **RNF-005 — Seguridad**: Tokens de dispositivo cifrados en reposo (AES-256)
- **RNF-006 — Seguridad**: Rate limiting de registro de tokens: máximo 10/hora por usuario
- **RNF-007 — Privacidad**: Cumplimiento GDPR, CCPA, ePrivacy Directive
- **RNF-008 — Disponibilidad**: Sistema de colas con disponibilidad 99.9%
- **RNF-009 — Portabilidad**: Compatible con iOS 15+ y Android 12+
- **RNF-010 — Consistencia**: Estrategia LWW con timestamp del servidor

## 6. Restricciones y Reglas de Negocio

- **RN-001**: Máximo 3 notificaciones push por día por usuario
- **RN-002**: No enviar notificaciones entre 10 PM y 7 AM (hora local)
- **RN-003**: Los retos semanales solo aplican a usuarios con plan de entrenamiento activo
- **RN-004**: Las superaciones de amigos solo aplican a amigos mutuos (relación bidireccional)
- **RN-005**: Los templates de notificaciones deben ser aprobados por el equipo de contenido
- **RN-006**: El usuario puede opt-out totalmente de notificaciones push desde la configuración del SO
- **CON-001**: App en React Native. No se cambia de framework.
- **CON-002**: Backend en Node.js + Express
- **CON-003**: Infraestructura de push es FCM para ambas plataformas

## 7. Contratos de Interfaz

```typescript
interface NotificationPreferences {
  userId: string;
  workoutReminders: boolean;
  weeklyChallenges: boolean;
  friendMilestones: boolean;
  preferredTimeWindow: 'morning' | 'afternoon' | 'evening';
  nightModeEnabled: boolean;
  updatedAt: string;
}

interface DeviceToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android';
  deviceName?: string;
  isActive: boolean;
  lastUsedAt: string;
}

interface NotificationLog {
  id: string;
  userId: string;
  type: 'workout_reminder' | 'weekly_challenge' | 'friend_milestone';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'skipped' | 'read';
  payload: { title: string; body: string; data?: Record<string, string> };
  scheduledAt: string;
  sentAt?: string;
  readAt?: string;
  error?: string;
}
```

## 8. Escenarios de Error

- **ERR-001**: Token de dispositivo inválido → Marcar como inactivo, log "invalid_token"
- **ERR-002**: Falla de red al enviar push → Reintentar 3 veces (30s, 2min, 5min). Si persiste, descartar
- **ERR-003**: Rate limit diario alcanzado → Log "skipped (daily limit)". Descartar evento
- **ERR-004**: Usuario sin plan de entrenamiento activo → No generar recordatorios ni retos
- **ERR-005**: Usuario sin amigos → Opción de superaciones deshabilitada con mensaje
- **ERR-006**: Zona horaria inválida → Usar UTC como fallback
- **ERR-007**: Payload excede límite FCM (4096 bytes) → Truncar preservando emoji y deep link

## 9. Criterios de Aceptación Globales

- **AC-001**: Dado que el usuario configura preferencias, Cuando guarda, Entonces persisten local y remotamente
- **AC-002**: Dado que es día de entrenamiento, Cuando son las 7:30 AM, Entonces recibe push con su marca personal
- **AC-003**: Dado que es lunes 10 AM con plan activo, Cuando se genera el reto, Entonces recibe push con objetivo
- **AC-004**: Dado que un amigo registra un nuevo PR, Cuando se procesa, Entonces los amigos reciben notificación
- **AC-005**: Dado que el usuario ya recibió 3 push, Cuando hay un cuarto evento, Entonces se descarta
- **AC-006**: Dado que el dispositivo está offline, Cuando se genera una notificación, Entonces se encola y reintenta

## 10. Métricas de Éxito

| KPI | Target | Medición |
|-----|--------|----------|
| Tasa de apertura | > 25% | Firebase Analytics |
| Tasa de conversión | > 10% | Evento in-app |
| Reducción de inactividad | > 20% | Cohorte semanal DAU |
| Retención D30 | +15% vs control | A/B test |
| NPS Notificaciones | > 40 | Encuesta trimestral |
| Tasa de opt-out total | < 5% | Comparación D1 vs D30 |

## 11. Dependencias y Supuestos

- **DEP-001**: Firebase Cloud Messaging configurado y operativo
- **DEP-002**: Módulo de amigos existente y funcional
- **DEP-003**: Módulo de planes de entrenamiento existente
- **DEP-004**: Módulo de personal records existente
- **DEP-005**: Redis disponible para colas y rate limiting
- **DEP-006**: PostgreSQL con conexión estable
- **SUP-001**: 70% de usuarios tendrán al menos 1 amigo
- **SUP-002**: 80% mantendrán notificaciones activadas por defecto
- **SUP-003**: Tasa de refresco de tokens < 1% semanal

## 12. Casos de Prueba

### CP-001: Configuración de preferencias con sync local/remoto
- **Relación**: US-002, RF-001, RF-015
- **Precondiciones**: Usuario logueado. App con conexión.
- **Pasos**: Navegar a Settings > Notificaciones → Desactivar toggle → Verificar preview → Cerrar app (offline) → Abrir → Reactivar conexión
- **Resultado**: Preferencia persiste localmente. Al reconectar, se sincroniza.

### CP-002: Rate limit diario
- **Relación**: US-005, RF-007
- **Precondiciones**: Contador diario = 3
- **Pasos**: Simular 4to evento → Verificar descarte → Consultar log
- **Resultado**: Push no enviado. Log = "skipped (daily limit)".

### CP-003: Offline queue con backoff
- **Relación**: US-006, RF-009
- **Precondiciones**: Dispositivo offline
- **Pasos**: Generar evento → Verificar encolado → 3 reintentos → Descartar
- **Resultado**: 3 reintentos (30s, 2min, 5min). Al fallar todos, se descarta.

### CP-004: Deep link por tipo
- **Relación**: US-001, US-003, US-004, RF-011
- **Precondiciones**: Usuario logueado con datos
- **Pasos**: Tocar notificación de recordatorio → Tocar de reto → Tocar de superación
- **Resultado**: Cada tipo navega a la pantalla correcta.

### CP-005: Silencio nocturno
- **Relación**: US-005, RF-008
- **Precondiciones**: nightMode = true, son las 11:30 PM
- **Pasos**: Generar superación → Verificar posposición → nightMode = false → Generar otra
- **Resultado**: Con modo noche: pospuesta. Sin modo noche: enviada.
