# Sistema de Notificaciones Push — App de Fitness

## 1. Preguntas de Clarificación

Antes de definir los requerimientos, es necesario resolver estos puntos:

| # | Pregunta | Impacto |
|---|----------|---------|
| 1 | ¿El usuario puede configurar qué días/horas entrena? (ej: "Lun/Mie/Vie a las 7pm") | Determina cuándo enviar recordatorios |
| 2 | ¿Los retos semanales son generados por el sistema o creados por usuarios/amigos? | Cambia la lógica de "alerta de nuevo reto" |
| 3 | ¿Qué constituye "superar una marca personal"? (peso levantado, tiempo en 5k, VO2 max, etc.) | Define el evento que dispara la notificación |
| 4 | ¿Deben soportarse zonas horarias? ¿Los usuarios viajan/usualmente? | Afecta scheduling de notificaciones |
| 5 | ¿El usuario debe poder silenciar notificaciones por tipo o por ventana de tiempo? | Requisito de configuración UX |
| 6 | ¿Hay límite de notificaciones por día para evitar fatiga? | Requisito no funcional de rate limiting |
| 7 | ¿Se necesita deep linking? (ej: tocar notificación → abre el reto específico) | Afecta implementación mobile |
| 8 | ¿Las notificaciones deben ser enviadas incluso si la app está cerrada? (push nativo vs local) | Define tecnología: FCM/APNs vs notificaciones locales |

---

## 2. User Stories

### US-01: Recordatorio de Entrenamiento Programado

**Como** usuario de la app de fitness  
**Quiero** recibir un recordatorio push antes de mi entrenamiento programado  
**Para** no olvidar mi rutina y mantener consistencia

**Criterios de Aceptación (Gherkin):**

```gherkin
Scenario: Recordatorio enviado en horario configurado
  Given el usuario ha configurado su horario de entrenamiento "Lun-Mie-Vie 18:00"
  When son las 17:30 (30 min antes del entrenamiento)
  Then el sistema envía una notificación push "🏋️ Tu entrenamiento de hoy comienza en 30 min"
  And la notificación incluye un resumen de los ejercicios del día

Scenario: Usuario completa entrenamiento antes del recordatorio
  Given el usuario tiene un entrenamiento programado a las 18:00
  When el usuario registra un entrenamiento completo a las 16:00
  Then el sistema NO envía el recordatorio de las 17:30

Scenario: Usuario silenció recordatorios
  Given el usuario ha desactivado "Recordatorios de entrenamiento" en ajustes
  When son las 17:30
  Then el sistema NO envía notificaciones de recordatorio

Scenario: Múltiples zonas horarias
  Given el usuario viajó de UTC-3 a UTC+2
  When el reloj del dispositivo refleja la nueva zona
  Then el recordatorio se envía a la hora local equivalente (17:30 hora local)
```

---

### US-02: Alerta de Nuevo Reto Semanal

**Como** usuario de la app de fitness  
**Quiero** recibir una notificación cuando un nuevo reto semanal esté disponible  
**Para** poder inscribirme y mantenerme motivado

**Criterios de Aceptación (Gherkin):**

```gherkin
Scenario: Nuevo reto semanal disponible
  Given es lunes a las 08:00
  When el sistema publica un nuevo reto semanal
  Then se envía una notificación push "🔥 Nuevo reto: <nombre_del_reto> — ¿Aceptas el desafío?"
  And la notificación contiene un deep link a la pantalla del reto

Scenario: Usuario ya está inscrito en el reto
  Given el usuario se inscribió al reto semanal el domingo
  When el sistema publica el reto el lunes
  Then NO se envía notificación de "nuevo reto disponible"

Scenario: Reto recurrente sin cambios vs reto nuevo
  Given el reto de esta semana es idéntico al de la semana anterior
  When el sistema publica el reto
  Then la notificación indica "🔄 <nombre_del_reto> está de vuelta — mejora tu marca"

Scenario: Usuario máximo de notificaciones alcanzado
  Given el usuario ya recibió 3 notificaciones hoy (límite diario = 3)
  When el sistema intenta enviar la alerta del reto
  Then la notificación se pone en cola para el día siguiente
```

---

### US-03: Notificación de Marca Personal Superada por un Amigo

**Como** usuario de la app de fitness  
**Quiero** recibir una notificación cuando un amigo supera su marca personal  
**Para** celebrar sus logros y sentirme parte de una comunidad

**Criterios de Aceptación (Gherkin):**

```gherkin
Scenario: Amigo supera su récord personal
  Given el usuario sigue a "Carlos" como amigo
  When Carlos registra un nuevo PR en "Press de banca: 100kg" (anterior: 95kg)
  Then se envía una notificación push "💪 ¡Carlos acaba de superar su marca en Press de banca! (100kg)"
  And la notificación incluye actions: "Felicitar" y "Ver detalle"

Scenario: Múltiples amigos superan PRs en simultáneo
  Given el usuario sigue a 3 amigos
  When los 3 amigos registran PRs en menos de 10 minutos
  Then se agrupan en una sola notificación "🔥 3 amigos superaron sus marcas personales esta hora"
  And no se envían 3 notificaciones individuales

Scenario: Usuario no sigue a nadie
  Given el usuario no tiene amigos en la app
  When cualquier usuario registra un PR
  Then el sistema NO envía notificaciones de PRs de amigos

Scenario: Usuario silenció notificaciones sociales
  Given el usuario ha desactivado "Notificaciones de amigos" en ajustes
  When un amigo supera su PR
  Then el sistema NO envía notificación social
```

---

## 3. Requerimientos No Funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RNF-01 | Latencia | La notificación debe entregarse en ≤ 30 segundos desde que se dispara el evento |
| RNF-02 | Rate Limiting | Máximo 5 notificaciones push por usuario por día (salvo eventos críticos) |
| RNF-03 | Agrupación | Notificaciones del mismo tipo en ventana de 15 min deben agruparse en 1 |
| RNF-04 | Offline | Si el usuario está offline, la notificación se entrega al reconectar (FCM/APNs lo manejan) |
| RNF-05 | Consentimiento | Solicitar permiso push en el primer launch con contexto claro |
| RNF-06 | Opt-out granular | El usuario puede desactivar cada tipo de notificación individualmente |
| RNF-07 | Deep Links | Cada notificación debe abrir la pantalla relevante al tocarla |
| RNF-08 | Localización | Soporte multilingüe inicial: ES, EN, PT-BR |
| RNF-09 | Personalización | El nombre del usuario y datos específicos (peso, tiempo) deben ser dinámicos |
| RNF-10 | Analytics | Registrar métricas de entrega, apertura y conversión de cada notificación |

---

## 4. Arquitectura de Notificaciones (Propuesta)

```
[Event Source] → [Notification Service] → [Queue] → [Push Gateway] → [FCM/APNs] → [Device]
     │
     ├── Workout Reminder (cron/scheduler)
     ├── Weekly Challenge (pub/sub)
     └── Friend PR (event-driven)
```

- **FCM** (Firebase Cloud Messaging) para Android
- **APNs** (Apple Push Notification service) para iOS
- **Backend**: Servicio de notificaciones desacoplado vía cola (RabbitMQ / Redis / SQS)
- **Scheduler**: Cron job diario que calcula ventanas de recordatorio basado en preferencias de usuario
- **Deduplication**: Cache en Redis para evitar duplicados en ventana de 15 min

---

## 5. Matriz de Priorización (MoSCoW)

| Prioridad | User Stories / Features |
|-----------|------------------------|
| **Must Have** | US-01 (Recordatorio entrenamiento), US-02 (Nuevo reto), RNF-01, RNF-04, RNF-05 |
| **Should Have** | US-03 (PR amigos), RNF-06 (Opt-out granular), RNF-07 (Deep links) |
| **Could Have** | RNF-09 (Personalización dinámica), agrupación inteligente |
| **Won't Have (ahora)** | RNF-10 (Analytics avanzados), RNF-08 (localización completa) |

---

## 6. Métricas de Éxito (OKRs)

1. **Tasa de apertura de notificaciones** ≥ 35% en primera semana
2. **Tasa de conversión** (usuario que abre notificación y completa acción) ≥ 20%
3. **Quejas por spam** ≤ 1% de usuarios activos semanales
4. **Usuarios que mantienen opt-in** ≥ 85% después de 30 días
