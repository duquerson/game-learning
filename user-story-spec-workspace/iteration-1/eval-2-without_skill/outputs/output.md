# Gamificación — Plataforma de Aprendizaje de Idiomas

## 1. XP (Experience Points)

### Fuentes de XP

| Acción | XP Base | Bonus |
|---|---|---|
| Lección completada | 50 XP | +10 XP por racha activa |
| Lección perfecta (100%) | +25 XP | — |
| Mini-juego completado | 30 XP | +5 XP por racha activa |
| Repaso de vocabulario | 20 XP | — |
| Prueba semanal | 100 XP | +50 XP si score > 80% |
| Desafío diario completado | 40 XP | — |
| Comentario en foro (útiles) | 5 XP | Máx. 30 XP/día |

### Límites

- **Tope diario soft**: 500 XP/día (sin restricción, pero por diseño no se puede grindear más allá de los contenidos disponibles)
- **Tope diario hard**: No existe — se premia la consistencia, no la sobrecarga.

---

## 2. Rachas (Streaks)

### Definición

Una racha se cuenta como días consecutivos en los que el usuario completa **al menos 1 lección o actividad puntuable**.

### Reglas

- La racha se actualiza cada día a las **00:00 UTC**.
- Se concede un **Freeze Day (día de congelación)** por cada **7 días de racha** (máx. 3 acumulables).
  - Freeze Day: permite saltarse un día sin perder la racha.
- Si un día se pierde y no hay freeze disponible, la racha se **resetea a 0**.

### Visualización

- **Streak counter** siempre visible en el header (dashboard y lecciones).
- Animación de "fuego" cada 5 días.
- Emblema especial al llegar a 30, 100, 365 días.

---

## 3. Niveles

### Sistema de 30 niveles

| Nivel | XP Requerido | Título |
|---|---|---|
| 1 | 0 | Principiante |
| 2 | 200 | Aprendiz |
| 3 | 500 | Estudiante |
| 4 | 900 | Curioso |
| 5 | 1,400 | Viajero |
| 6–10 | Escala progresiva | Explorador → Descubridor |
| 11–15 | Escala progresiva | Hablante → Conversador |
| 16–20 | Escala progresiva | Narrador → Escritor |
| 21–25 | Escala progresiva | Experto → Maestro |
| 26–30 | Escala progresiva | Políglota → Legendario |

**Fórmula de XP por nivel:**

```
XP_requerido(n) = floor(100 * (n - 1)^1.5 + 100 * (n - 1))
```

| Nivel | XP total acumulado |
|---|---|
| 5 | 1,400 |
| 10 | ~5,800 |
| 15 | ~15,700 |
| 20 | ~33,100 |
| 25 | ~60,000 |
| 30 | ~100,000 |

### Efectos al subir de nivel

- Modal de celebración con badge del nivel (si aplica).
- Desbloqueo de contenido (ej. nivel 5: lecciones de cultura; nivel 10: speaking con nativos).
- Efecto visual en perfil (marco, color de nombre, animación).

---

## 4. Badges

### 4.1 Badges por Logro (Achievement)

| Badge | Condición | Rareza |
|---|---|---|
| Primer paso | Completar la primera lección | Común |
| Perfecto | 10 lecciones perfectas (100%) | Común |
| Erudito | 100 lecciones perfectas | Raro |
| Velocista | Completar una lección en < 2 min | Común |
| Maratonista | 500 lecciones completadas | Épico |
| Polilla del diccionario | Ver 50 definiciones extendidas | Común |
| Revisor estrella | 20 pruebas semanales completadas | Raro |
| Leyenda | Nivel 30 alcanzado | Legendario |

### 4.2 Badges por Racha (Streak)

| Badge | Condición | Rareza |
|---|---|---|
| Chispa | 7 días de racha | Común |
| Llama | 30 días de racha | Raro |
| Hoguera | 100 días de racha | Épico |
| Inferno | 365 días de racha | Legendario |

### 4.3 Badges por Competencia (Proficiency)

| Badge | Condición | Rareza |
|---|---|---|
| Superviviente | Completar el nivel A1 del Marco Común Europeo | Común |
| Conversacional | Completar el nivel B1 | Raro |
| Avanzado | Completar el nivel B2 | Épico |
| Fluido | Completar el nivel C1 | Legendario |
| Nativo | Completar el nivel C2 | Legendario |

### Reglas de Badges

- Cada badge tiene: **id**, **nombre**, **descripción**, **icono**, **rareza**, **fecha_desbloqueo**.
- Al desbloquearlo: **notificación push** (si aplica) + **modal de celebración** con opción de compartir.
- Los badges se muestran en el **perfil público** del usuario (con opción de ocultar).
- Las rarezas definen el color del borde/fondo: Común (gris), Raro (azul), Épico (púrpura), Legendario (dorado/anaranjado).

---

## 5. Arquitectura Técnica (Web + Mobile)

### Tablas (esquema relacional)

```sql
-- core
usuarios (id, nombre, email, nivel, xp_total, racha_actual,
          racha_maxima, freeze_days, created_at)

-- lecciones
lecciones_realizadas (id, usuario_id, leccion_id, score, xp_ganado,
                      completada_en, es_perfecta)

-- rachas (tabla histórica para analytics)
rachas_historial (id, usuario_id, inicio, fin, duracion_dias)

-- badges
badges (id, nombre, descripcion, icono_url, tipo, rareza,
        condicion_json, activo)

usuarios_badges (id, usuario_id, badge_id, desbloqueado_en, compartido)
```

### Endpoints (REST)

```
GET    /api/v1/users/:id/profile       → perfil público + badges + nivel
GET    /api/v1/users/:id/progress      → XP history, streak data
POST   /api/v1/lessons/:id/complete    → grant XP, check streaks
GET    /api/v1/badges                  → catálogo completo
GET    /api/v1/users/:id/badges        → badges del usuario
POST   /api/v1/users/:id/badges/:id/share → compartir en redes
```

### Componentes UI (Mobile-First)

- **Header universal**: nivel + barra de progreso + streak counter.
- **Dashboard**: resumen semanal, próximos badges, lecciones recomendadas.
- **Perfil público**: badges en grid 3 columnas, nivel y título destacado.
- **Modal de subida de nivel**: overlay con confeti, badge si aplica, botón compartir.
- **Pantalla de logros**: vista catálogo completa con badges bloqueados (silueta) y desbloqueados.
- **Notificaciones**: en mobile, notificación nativa al desbloquear badge.
- **Offline support**: XP acumulado offline se sincroniza al recuperar conexión.

### Consideraciones de UX

1. **Feedback inmediato**: al completar lección, animación de XP ganado + progreso de barra.
2. **Anticipación**: mostrar "te faltan X XP para el siguiente nivel" y "próximo badge a 3 lecciones".
3. **Fricción cero**: no pedir confirmación para subir de nivel. Es automático.
4. **Compartición opcional**: celebrar está bien, obligar no.
5. **Protección contra pérdida de racha**: notificación diaria recordatoria a las 20:00 (hora local).
