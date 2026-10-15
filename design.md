# Diseño de sistema e interfaz

## Producto y experiencia

La experiencia es un cuaderno de exploración técnica: cada persona avanza por un mapa de aprendizaje, consulta anotaciones claras y prueba comprensión sin presión de tiempo. La metáfora visual se inspira en topografía, brújula y notas de campo; no en una gamificación de premios. El objetivo primario de cada pantalla es explicar qué aprender, qué hacer ahora y cómo interpretar el resultado.

## Sistema visual

### Paleta

| Token | Valor | Uso |
|---|---|---|
| `slate-map` | `#233B4A` | Tinta principal y estructura cartográfica |
| `deep-water` | `#155E70` | Acción primaria y enlaces |
| `field-cyan` | `#58B8C2` | Señales de ruta y estados informativos |
| `amber-marker` | `#C18A3A` | Hito actual y atención no crítica |
| `moss-progress` | `#5E765C` | Progreso y estado dominado |
| `paper-light` | `#F2F1E8` | Fondo claro |

Tema oscuro usa `slate-map` como base, con superficies más claras derivadas y texto de alto contraste; no invertir colores mecánicamente. Estados no se comunican solo por color: acompañar con texto, icono semántico o forma.

### Tipografía

- Atkinson Hyperlegible: texto de lectura, opciones, controles y feedback.
- Space Grotesk: títulos y jerarquía de navegación.
- JetBrains Mono: exclusivamente fragmentos de código didáctico cuando aparezcan; no usarla para etiquetas decorativas.
- Alojar fuentes localmente tras revisar licencia y pesos necesarios; `font-display: swap`, precargar solo la fuente crítica y evitar saltos de layout.

### Composición

- Lectura alineada a la izquierda; línea de texto idealmente entre 55 y 75 caracteres.
- Escritorio: barra lateral/mapa de niveles y columna de lectura centrada; quiz y feedback alineados con el contenido, no en tarjetas repetidas.
- Móvil: navegación del curso compacta y accesible; una columna, controles de ancho completo, sin desplazamiento horizontal.
- Jerarquía: título de lección → objetivo de aprendizaje → explicación → comprobación → feedback → siguiente acción.
- Usar líneas de contorno/topografía con bajo contraste en áreas de navegación o márgenes, nunca detrás de texto ni como decoración omnipresente. La ruta de aprendizaje es el elemento memorable; el resto del sistema es silencioso.
- Los controles deben decir la acción concreta (“Comprobar respuesta”, “Ver explicación”, “Continuar”). No usar rótulos internos del sistema.

### Esbozo de páginas

```text
ESCRITORIO
┌───────────────┬────────────────────────────────────────┐
│ Ruta           │ Lección: título y objetivo             │
│ Nivel actual   │ Explicación y ejemplo                  │
│ Lecciones      │ Pregunta / opciones                    │
│ Progreso       │ Feedback → siguiente paso              │
└───────────────┴────────────────────────────────────────┘

MÓVIL
┌─────────────────────────────┐
│ Ruta / selector de lección  │
│ Título + objetivo           │
│ Explicación y ejemplo       │
│ Pregunta + opciones         │
│ Feedback + siguiente paso  │
└─────────────────────────────┘
```

## Navegación, niveles y estados

- Navegación por Básico, Intermedio y Avanzado; cada nivel abre una unidad con 3 lecciones.
- Español en la primera release. Si se aprueba inglés con revisión bilingüe, usar rutas `/es/` y `/en/`, detectar idioma con `navigator.languages`/`Accept-Language` (no por IP) y permitir una preferencia manual persistente.
- Mostrar dónde está la persona y qué le falta sin puntos, rachas, insignias ni cronómetros. El banner “Llevas X/9 · Continuar” es cue de retorno, no racha: no cuenta días ni puntos.
- Estados de aprendizaje: sin empezar, en curso y dominado. El progreso es local anónimo (localStorage, solo este navegador, sin cuentas); indicar que persiste al cerrar y que puede borrarse. La beta sincronizada sigue condicionada al gate legal y login.

## Componentes por responsabilidad

- `CourseMap`: navegación y ubicación; enlaces semánticos, soporte teclado y móvil.
- `LessonHeader`: título, objetivo observable y estado, sin etiquetas decorativas.
- `LessonContent`: explicación, ejemplo y glosario contextual.
- `QuizQuestion`: enunciado, cuatro opciones de selección única y botón para comprobar.
- `AnswerFeedback`: respuesta correcta/incorrecta, explicación inmediata y anuncio accesible.
- `PracticePrompt`: ejercicio opcional de razonamiento de selección múltiple; no bloquea progreso.
- `ProgressSummary`: estado por lección y explicación de la regla de dominio.
- `PreviewNotice`: explica ausencia de persistencia y certificación.
- `LanguageControl`: aparece cuando existe más de un idioma revisado.

## Reglas didácticas e interacción

- Cada lección tiene una explicación, quiz de 5 preguntas y al menos un ejercicio opcional de razonamiento.
- Una pregunta tiene una respuesta esperada y 4 opciones; tras responder se muestra feedback explicativo inmediato.
- Reintentos ilimitados, sin timer ni penalización. Mostrar intento/resultado con claridad.
- Dominar exige marcar lectura y lograr 4/5 en quiz. Los ejercicios opcionales no afectan dominio.
- En la preview, el resultado se calcula en cliente y las respuestas del contenido pueden inspeccionarse; no es una evaluación segura ni una certificación. La beta debe recomputar resultados en servidor.
- Evitar bloqueos por navegación accidental; cualquier destrucción de estado local significativo requiere confirmación. Como el progreso es local anónimo, ofrecer borrado autoservicio con confirmación; no ofrecer un flujo de guardado ficticio ni sincronización.

## Estados de interfaz

- **Inicial:** instrucciones cortas y objetivo concreto; no requerir cuenta.
- **En carga:** solo en beta/API futura; texto específico (“Cargando tu progreso…”), indicador anunciado y control repetible si procede.
- **Vacío:** explicar que aún no se inició una lección y ofrecer el primer paso.
- **Quiz sin contestar:** permitir elegir una opción; controles nativos radio con etiqueta completa.
- **Feedback correcto/incorrecto:** explicación y siguiente acción; actualizar región `aria-live="polite"` sin mover el foco de forma inesperada.
- **Error:** decir qué falló y qué acción puede resolverlo; conservar contexto cuando sea seguro; no mostrar stack, secretos ni datos personales.
- **Preview local anónima:** aviso visible al entrar y en resumen de progreso; estado persiste en este navegador y puede borrarse.
- **Éxito:** mostrar qué concepto se dominó y dónde seguir, no recompensa artificial.

## Contratos del dominio

```text
Lesson
  id, level, unitId, title, objective, explanation, examples, quiz[], practices[]

Question
  id, prompt, options[4], correctOptionId, explanation

QuizResult
  correctCount, total=5, passed=(correctCount >= 4), feedback[]

LessonProgress
  lessonId, read, state ∈ {not_started, in_progress, mastered}
```

Los datos se validan al cargar/seedear. IDs son estables; actualizaciones de contenido no deben resetear progreso inadvertidamente. No aceptar el campo de corrección calculado por el cliente como autoridad remota.

## Contratos de error e integración

- Error de contenido: fallar la validación durante build/seed con lección e identificador señalados; no ocultarlo tras fallback silencioso.
- Fallo remoto en beta: distinguir sesión expirada, no autorizado, indisponible y timeout; ofrecer acciones apropiadas y no indicar guardado si no se confirmó.
- Errores de formulario/auth futuros se ubican junto al campo; foco al primer error tras envío inválido; pegado permitido.
- API futura: JSON versionado por contrato compartido mínimo; autorización en cada endpoint; origen directo de Render no puede saltarse controles. CSRF requerido para cookie de sesión.
- Kratos: UI propia Astro; proxies del mismo sitio deben mantener cookies/redirecciones correctamente; Admin API jamás pública.
- IA futura: sugerencias optativas con alternativa curada; no evaluar, modificar notas, publicar ni recibir secretos/código ejecutable.
- Runner: fuera del diseño de MVP. En futuro requiere boundary dedicada, sin acceso a DB, secretos ni red no aprobada.

## Accesibilidad, responsive y privacidad

- Semántica HTML nativa, jerarquía de encabezados, enlace para saltar al contenido y nombres accesibles.
- Operable con teclado; foco `:focus-visible` evidente; no ocultar foco; evitar que barras fijas tapen el elemento enfocado.
- Contraste legible en ambos temas; forma/texto además de color; zoom sin restricciones.
- Respetar `prefers-reduced-motion`; movimiento solo como respuesta a interacción; no usar `transition: all`.
- Botones realizan acciones, enlaces navegan; iconos decorativos ocultos a tecnología asistiva; botones solo-icono con nombre accesible.
- Diseño probado a móvil, escritorio y zoom; targets de toque cómodos y sin gestos exclusivos.
- Fechas/números localizados mediante `Intl`; marca y términos de código no deben traducirse automáticamente.
- Preview sin cuentas ni analítica de terceros. En beta, datos mínimos, eliminación y avisos de privacidad son requisitos previos, no extras opcionales.

## Hallazgos incorporados de revisión UI

Se contrastó este baseline con Web Interface Guidelines (reglas consultadas en la fecha de preparación): se especifican foco visible, semántica/teclado, feedback anunciado, estados vacíos/error/carga, navegación móvil, reducción de movimiento, control de zoom y localización. Como todavía no hay componentes implementados, no se atribuyen hallazgos de código ni conformidad WCAG. Al implementar, ejecutar una revisión sobre archivos UI y corregir defectos verificables antes de release.
