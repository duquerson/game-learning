# SPEC: Correccion UX/UI Tarjetas de Repaso y Quiz

## Objetivo

Transformar las tarjetas de repaso en una experiencia real de aprendizaje: flashcard con active recall, quiz educativo con pregunta clara y explicacion progresiva.

## Problemas detectados

### 1. Temporizador forzado en autoevaluacion

El timer de 30s auto-voltea y auto-responde la tarjeta, forzando al usuario a responder sin haber procesado el contenido. Esto es contraproducente para el aprendizaje.

**Archivo:** `src/components/cards/ReviewCard.vue` lineas 48-86, 170-189

### 2. Tarjeta de autoevaluacion no responde al click

La tarjeta solo se voltea al presionar el boton "Ver respuesta". No hay handler de click en la tarjeta misma, lo que hace la interaccion poco intuitiva.

**Archivo:** `src/components/cards/ReviewCard.vue` lineas 204-230

### 3. Quiz muestra titulo en vez de pregunta

El backfill de la migracion `002_quiz_questions.sql` asigna `question = title` para tarjetas existentes. Esto hace que el quiz muestre solo el titulo del concepto en vez de una pregunta educativa real.

**Archivo:** `supabase/migrations/002_quiz_questions.sql` linea 14

### 4. Falta explicacion visible antes de responder en quiz

La explicacion (`content`) solo se muestra DESPUES de responder. El usuario no tiene contexto educativo antes de elegir una opcion.

**Archivo:** `src/components/cards/ReviewCard.vue` lineas 327-341

## Cambios a implementar

### A. Eliminar timer de autoevaluacion

- Remover `TIMER_DURATION`, `timer`, `timerInterval`
- Remover `startTimer()`, `stopTimer()`, `handleTimerExpiry()`
- Remover `onUnmounted(() => stopTimer())`
- Remover la UI del timer (circulo, contador de segundos)
- Mantener timer SOLO para modo quiz

### B. Agregar click a la tarjeta para voltear

- Agregar `@click="flipCard"` en el contenedor `.card-scene` cuando no esta volteada
- La tarjeta se voltea tanto al hacer click como al presionar "Ver respuesta"

### C. Redisenar quiz: mostrar pregunta + contexto antes de responder

- En modo quiz, mostrar `question` como titulo principal (ya se hace, verificar que existan datos)
- Agregar seccion de contexto/explicacion visible ANTES de las opciones (no solo despues)
- Usar `content` como texto de apoyo visible desde el inicio

### D. Migracion de datos para preguntas reales

- Actualizar tarjetas existentes para que `question` contenga una pregunta real (no el titulo)
- Los datos de cards_seed.sql ya tienen preguntas correctas

## Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/components/cards/ReviewCard.vue` | Remover timer self-assessment, agregar click flip, mejorar layout quiz |
| `src/components/cards/CardLibrary.vue` | Sin cambios |
| `src/components/cards/CardItem.vue` | Sin cambios |
| `src/composables/useReviewSession.ts` | Posible revision si usa timer |
| `supabase/migrations/002_quiz_questions.sql` | Corregir backfill |

## Criterios de exito

- [ ] Autoevaluacion: no hay timer visible ni auto-respuesta
- [ ] Autoevaluacion: click en la tarjeta la voltea
- [ ] Autoevaluacion: boton "Ver respuesta" sigue funcionando
- [ ] Quiz: muestra pregunta real (no titulo)
- [ ] Quiz: muestra contexto/explicacion antes de responder
- [ ] Quiz: explicacion post-respuesta sigue funcionando
- [ ] Tests de regresion pasan
- [ ] Build sin errores

## Comandos

```bash
Build: npm run build
Dev: npm run dev
Test unit: npx vitest run
Lint: npm run lint
```
