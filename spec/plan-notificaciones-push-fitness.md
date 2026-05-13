# Plan Técnico: Sistema de Notificaciones Push Inteligentes

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend (App) | React Native 0.76+ | Ya es el framework de la app. Librería: `@react-native-firebase/messaging` |
| Backend API | Node.js + Express | Ya es el stack del backend. Nuevo router: `/notifications` |
| Base de Datos | PostgreSQL 16 | Datos relacionales. Ya en uso en el proyecto. |
| Caché / Colas | Redis 7+ | Rate limiting (contadores atómicos), cola de notificaciones (BRPOP/LPUSH) |
| Push Infrastructure | Firebase Cloud Messaging | SDK único para iOS y Android. Ya integrado. |
| Scheduler | node-cron + Bull/Queue | Para batch diario de recordatorios y retos semanales |
| ORM | Prisma | Ya en uso. Migraciones y consultas tipadas. |

## Arquitectura

```mermaid
graph TD
    subgraph "App Móvil (React Native)"
        A1[NotificationPreferencesScreen]
        A2[Messaging Service]
        A3[DeepLink Handler]
        A4[AsyncStorage Cache]
    end

    subgraph "Backend (Node.js)"
        B1[API Router /notifications]
        B2[Preferences Service]
        B3[Notification Scheduler]
        B4[Queue Worker]
        B5[Rate Limiter]
        B6[FCM Gateway]
        B7[Template Engine]
    end

    subgraph "Infraestructura"
        C1[(PostgreSQL)]
        C2[(Redis)]
        C3[Firebase Cloud Messaging]
    end

    A1 -->|HTTP| B1
    A1 --> A4
    A2 -->|Register Token| B1
    A3 -->|Deep Link| A2
    B1 --> B2
    B1 --> B6
    B3 -->|Cron| B2
    B3 -->|LPUSH| C2
    B4 -->|BRPOP| C2
    B4 --> B5
    B4 --> B6
    B6 --> C3
    C3 -->|Push| A2
    B2 --> C1
    B7 --> B6
    B5 --> C2
```

## Componentes

### NotificationPreferencesScreen (Móvil)
- **Responsabilidad**: UI de configuración con toggles, selector de franja horaria, preview en vivo
- **Interfaces**: GET/PUT /notifications/preferences, AsyncStorage
- **Dependencias**: @react-native-firebase/messaging, AsyncStorage

### DeepLink Handler (Móvil)
- **Responsabilidad**: Interpretar payload de notificación y navegar a pantalla correcta
- **Interfaces**: Firebase onNotificationOpenedApp, getInitialNotification
- **Dependencias**: React Navigation linking config

### API Router (Backend)
- **Responsabilidad**: Endpoints REST para preferencias, tokens, logs
- **Rutas**: GET/PUT /preferences, POST/DELETE /tokens, GET /logs, PATCH /logs/:id/read
- **Dependencias**: Express, JWT middleware

### Notification Scheduler (Backend)
- **Responsabilidad**: Jobs cron para batch diario de recordatorios y retos semanales
- **Schedule**: Diario 6:30 AM UTC, Lunes 9 AM UTC, Miércoles 2 PM UTC
- **Dependencias**: node-cron, Redis Bull/Queue, Prisma

### Queue Worker (Backend)
- **Responsabilidad**: Consumir cola Redis, aplicar rate limiting, verificar DND, enviar via FCM
- **Dependencias**: Redis, firebase-admin SDK

### FCM Gateway (Backend)
- **Responsabilidad**: Abstracción sobre Firebase Admin SDK
- **Interfaces**: sendNotification(token, payload) → success/failure
- **Dependencias**: firebase-admin SDK

## Modelo de Datos

```mermaid
erDiagram
    USERS ||--o{ NOTIFICATION_PREFERENCES : tiene
    USERS ||--o{ DEVICE_TOKENS : posee
    USERS ||--o{ NOTIFICATION_LOGS : recibe
    USERS ||--o{ WEEKLY_CHALLENGES : participa
    USERS ||--o{ PERSONAL_RECORDS : establece
    USERS ||--o{ FRIENDSHIPS : tiene
    
    NOTIFICATION_PREFERENCES {
        uuid id PK
        uuid userId FK
        boolean workoutReminders
        boolean weeklyChallenges
        boolean friendMilestones
        varchar preferredTimeWindow
        boolean nightModeEnabled
        timestamp updatedAt
    }
    
    DEVICE_TOKENS {
        uuid id PK
        uuid userId FK
        varchar token
        varchar platform
        varchar deviceName
        boolean isActive
        timestamp lastUsedAt
    }
    
    NOTIFICATION_LOGS {
        uuid id PK
        uuid userId FK
        varchar type
        varchar status
        jsonb payload
        timestamp scheduledAt
        timestamp sentAt
        timestamp readAt
        varchar error
        jsonb metadata
    }
    
    WEEKLY_CHALLENGES {
        uuid id PK
        uuid userId FK
        int weekNumber
        int year
        int workoutsPlanned
        int workoutsCompleted
        varchar status
    }
```

### Entidades Principales

#### notification_preferences
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | UUID | PK |
| user_id | UUID | FK, UNIQUE |
| workout_reminders | boolean | NOT NULL, DEFAULT true |
| weekly_challenges | boolean | NOT NULL, DEFAULT true |
| friend_milestones | boolean | NOT NULL, DEFAULT true |
| preferred_time_window | varchar(10) | CHECK IN ('morning','afternoon','evening'), DEFAULT 'morning' |
| night_mode_enabled | boolean | NOT NULL, DEFAULT true |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() |

#### device_tokens
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | UUID | PK |
| user_id | UUID | FK, NOT NULL |
| token | varchar(512) | NOT NULL, UNIQUE |
| platform | varchar(10) | CHECK IN ('ios','android') |
| device_name | varchar(100) | NULL |
| is_active | boolean | DEFAULT true |
| last_used_at | timestamptz | NOT NULL |

#### notification_logs
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | UUID | PK |
| user_id | UUID | FK, NOT NULL |
| type | varchar(30) | CHECK IN ('workout_reminder','weekly_challenge','friend_milestone') |
| status | varchar(20) | CHECK IN ('pending','sent','delivered','failed','skipped','read') |
| payload | jsonb | NOT NULL |
| scheduled_at | timestamptz | NOT NULL |
| sent_at | timestamptz | NULL |
| read_at | timestamptz | NULL |
| error | text | NULL |

## Seguridad

- **Autenticación**: Todos los endpoints requieren JWT válido (middleware existente)
- **Autorización**: El usuario solo accede a sus propios recursos
- **Cifrado**: Tokens de dispositivo cifrados en reposo (AES-256-GCM)
- **Rate limiting**: Máximo 10 registros de token/hora por usuario
- **Privacidad**: Derecho al olvido (GDPR) — borrado de preferencias, anonimización de logs, borrado de tokens

## Rendimiento

- **Caché**: Preferencias en Redis (TTL 5 min), templates en Redis (TTL 1 hora)
- **Colas**: Redis BRPOP/LPUSH para desacoplar generación de eventos del envío
- **Rate limiting**: Redis INCR + EXPIRE (atómico, sin race conditions)
- **Límites**: 100 conexiones FCM concurrentes, timeout 10s por envío
- **Monitoreo**: Alarma si tasa de fallo > 5% en 15 min. Dashboard Grafana.
