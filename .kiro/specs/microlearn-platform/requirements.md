# Requirements Document — MicroLearn Platform

## Introduction

MicroLearn es una plataforma de microaprendizaje gamificada orientada al estudio personal de JavaScript y TypeScript, con arquitectura extensible para incorporar nuevos temas. Está construida con Astro 5 (SSR + Vercel), Vue 3 + Pinia, TailwindCSS v4 y Supabase (Auth + DB). El sistema combina tarjetas de estudio, dos modos de repaso, un motor de puntos, rachas diarias y un sistema de 9 insignias para motivar el aprendizaje continuo. Sirve simultáneamente como portafolio personal del desarrollador y como herramienta de estudio real.

---

## Glossary

- **Platform**: El sistema MicroLearn en su conjunto.
- **Auth_Service**: Módulo de autenticación basado en Supabase Auth.
- **Card**: Unidad mínima de contenido de estudio con título, contenido, topic, subtopic, dificultad y valor en puntos.
- **Topic**: Categoría de contenido de texto libre (p. ej. "JavaScript", "TypeScript"). No es un enum fijo.
- **Deck**: Conjunto de tarjetas filtradas por topic y/o subtopic para una sesión de repaso.
- **Review_Session**: Sesión de repaso que agrupa un conjunto de tarjetas y registra el resultado de cada una.
- **Self_Assessment_Mode**: Modo de repaso donde el usuario declara si sabía o no sabía la respuesta.
- **Quiz_Mode**: Modo de repaso con opciones múltiples generadas dinámicamente desde otras tarjetas del mismo topic.
- **Quiz_Generator**: Componente que construye las opciones incorrectas del quiz a partir de tarjetas del mismo topic.
- **Points_Engine**: Módulo que calcula y acumula puntos según dificultad y rachas de aciertos.
- **Streak_Tracker**: Módulo que mantiene y evalúa la racha diaria de estudio.
- **Badge_Engine**: Módulo que evalúa condiciones de desbloqueo de insignias tras cada sesión.
- **Onboarding_Flow**: Flujo inicial de selección de temas tras el primer inicio de sesión.
- **Dashboard**: Pantalla principal con resumen de progreso, estadísticas y acceso rápido.
- **Library**: Pantalla de exploración y filtrado de todas las tarjetas disponibles.
- **Results_Screen**: Pantalla de resultados al finalizar una sesión de repaso.
- **Badges_Screen**: Pantalla de visualización de insignias obtenidas y pendientes.
- **Profile_Screen**: Pantalla de estadísticas detalladas y configuración del perfil.
- **Middleware**: Capa de Astro que protege rutas server-side verificando la sesión de Supabase.
- **RLS**: Row Level Security de Supabase, activo en todas las tablas de datos de usuario.
- **Streak**: Número de días consecutivos en que el usuario ha completado al menos una sesión de repaso.
- **Correct_Streak**: Número de respuestas correctas consecutivas dentro de una sesión.
- **Badge**: Insignia desbloqueada al cumplir una condición específica de progreso.
- **user_progress**: Tabla Supabase que registra cada revisión de tarjeta por usuario.
- **user_stats**: Tabla Supabase con puntos totales, racha actual, racha máxima y fecha de último estudio.
- **user_badges**: Tabla Supabase con las insignias desbloqueadas por usuario.
- **user_preferences**: Tabla Supabase con los temas seleccionados y estado del onboarding.
- **pnpm**: Gestor de paquetes exclusivo del proyecto. Todos los comandos de instalación y ejecución usan pnpm (`pnpm install`, `pnpm add`, `pnpm run`, `pnpm dlx`).
- **Package_Manager**: El gestor de paquetes pnpm en su rol de herramienta de gestión de dependencias del proyecto.
- **KISS**: Principio de diseño "Keep It Simple, Stupid" — cada módulo o componente tiene una única responsabilidad clara, sin lógica innecesaria.
- **DRY**: Principio de diseño "Don't Repeat Yourself" — la lógica de negocio está centralizada en módulos reutilizables, no duplicada.
- **Code_Quality_Standards**: Conjunto de principios (KISS, DRY) y convenciones que rigen la organización y calidad del código fuente.
- **OWASP_Top10**: Lista de las diez categorías de riesgo de seguridad más críticas para aplicaciones web, publicada por OWASP.
- **Security_Layer**: Conjunto de mecanismos de protección que incluye RLS de Supabase y Middleware de Astro como doble capa de control de acceso.
- **Astro_Actions**: Funciones server-side definidas en `src/actions/index.ts` que actúan como única interfaz entre el cliente y Supabase para operaciones de escritura, con validación de sesión integrada.
- **Header_Hardening**: Conjunto de configuraciones HTTP que eliminan headers que revelan el stack tecnológico y añaden headers de seguridad estándar para reducir la superficie de ataque.

---

## Requirements

### Requirement 1: Autenticación de usuarios

**User Story:** Como usuario, quiero registrarme e iniciar sesión con email/contraseña o con mi cuenta de Google o GitHub, para acceder a mi progreso personal de forma segura.

#### Acceptance Criteria

1. THE Auth_Service SHALL permitir el registro de nuevos usuarios mediante email y contraseña.
2. THE Auth_Service SHALL permitir el inicio de sesión mediante email y contraseña.
3. WHEN el usuario selecciona "Continuar con Google", THE Auth_Service SHALL iniciar el flujo OAuth de Google y redirigir al usuario autenticado al Dashboard.
4. WHEN el usuario selecciona "Continuar con GitHub", THE Auth_Service SHALL iniciar el flujo OAuth de GitHub y redirigir al usuario autenticado al Dashboard.
5. WHEN el registro con email es exitoso, THE Auth_Service SHALL crear una sesión activa y redirigir al usuario al Onboarding_Flow.
6. IF el email ya está registrado durante el registro, THEN THE Auth_Service SHALL mostrar el mensaje "Este email ya está registrado. ¿Quieres iniciar sesión?".
7. IF las credenciales de inicio de sesión son incorrectas, THEN THE Auth_Service SHALL mostrar el mensaje "Email o contraseña incorrectos" sin revelar cuál de los dos falló.
8. WHEN el usuario cierra sesión, THE Auth_Service SHALL invalidar la sesión activa y redirigir a la pantalla de Login.
9. THE Middleware SHALL verificar la sesión de Supabase en cada petición a rutas protegidas y redirigir a Login si no existe sesión válida.
10. WHILE el usuario tiene una sesión activa, THE Platform SHALL mantener la sesión sin requerir re-autenticación durante al menos 7 días.

---

### Requirement 2: Onboarding y selección de temas

**User Story:** Como nuevo usuario, quiero seleccionar los temas que me interesan estudiar durante el onboarding, para que la plataforma personalice mi experiencia desde el primer momento.

#### Acceptance Criteria

1. WHEN un usuario completa el registro por primera vez, THE Platform SHALL mostrar el Onboarding_Flow antes de redirigir al Dashboard.
2. THE Onboarding_Flow SHALL presentar al usuario la lista de topics disponibles con al menos una tarjeta asociada.
3. WHEN el usuario selecciona al menos un topic y confirma, THE Platform SHALL guardar los topics seleccionados en `user_preferences.selected_topics` y marcar `onboarding_completed = true`.
4. IF el usuario intenta confirmar el onboarding sin seleccionar ningún topic, THEN THE Onboarding_Flow SHALL mostrar el mensaje "Selecciona al menos un tema para continuar".
5. WHEN `user_preferences.onboarding_completed` es `true`, THE Platform SHALL omitir el Onboarding_Flow en inicios de sesión posteriores.
6. THE Profile_Screen SHALL permitir al usuario modificar los topics seleccionados en cualquier momento posterior al onboarding.

---

### Requirement 3: Dashboard principal

**User Story:** Como usuario autenticado, quiero ver un resumen de mi progreso y acceso rápido a las funciones principales, para orientarme rápidamente y continuar mi estudio.

#### Acceptance Criteria

1. WHEN el usuario accede al Dashboard, THE Dashboard SHALL mostrar el total de puntos acumulados del usuario obtenidos desde `user_stats.total_points`.
2. WHEN el usuario accede al Dashboard, THE Dashboard SHALL mostrar la racha diaria actual obtenida desde `user_stats.current_streak`.
3. THE Dashboard SHALL mostrar el número de tarjetas repasadas hoy calculado desde `user_progress` filtrando por `reviewed_at` del día actual.
4. THE Dashboard SHALL mostrar un acceso directo para iniciar una nueva sesión de repaso con los topics seleccionados del usuario.
5. THE Dashboard SHALL mostrar las últimas insignias desbloqueadas (máximo 3) obtenidas desde `user_badges`.
6. WHEN el usuario no ha estudiado ninguna tarjeta hoy, THE Dashboard SHALL mostrar un mensaje motivacional para iniciar la sesión del día.

---

### Requirement 4: Biblioteca de tarjetas

**User Story:** Como usuario, quiero explorar y filtrar todas las tarjetas disponibles por topic, subtopic y dificultad, para encontrar el contenido que quiero repasar.

#### Acceptance Criteria

1. THE Library SHALL mostrar todas las tarjetas disponibles en la base de datos con su título, topic, subtopic y dificultad.
2. WHEN el usuario aplica un filtro por topic, THE Library SHALL mostrar únicamente las tarjetas cuyo campo `topic` coincida con el valor seleccionado.
3. WHEN el usuario aplica un filtro por subtopic, THE Library SHALL mostrar únicamente las tarjetas cuyo campo `subtopic` coincida con el valor seleccionado.
4. WHEN el usuario aplica un filtro por dificultad, THE Library SHALL mostrar únicamente las tarjetas cuyo campo `difficulty` coincida con el valor seleccionado (easy, medium o hard).
5. WHEN el usuario combina múltiples filtros, THE Library SHALL mostrar únicamente las tarjetas que satisfagan todos los filtros activos simultáneamente.
6. THE Library SHALL indicar visualmente para cada tarjeta si el usuario ya la ha repasado al menos una vez, consultando `user_progress`.
7. WHEN el usuario selecciona una tarjeta, THE Library SHALL mostrar el contenido completo de la tarjeta en una vista de detalle.

---

### Requirement 5: Sesión de repaso — Self-Assessment Mode

**User Story:** Como usuario, quiero repasar tarjetas declarando si sabía o no sabía la respuesta, para evaluar mi conocimiento de forma rápida y honesta.

#### Acceptance Criteria

1. WHEN el usuario inicia una sesión en Self_Assessment_Mode, THE Review_Session SHALL cargar un Deck de tarjetas basado en los topics seleccionados del usuario.
2. THE Review_Session SHALL mostrar una tarjeta a la vez, presentando primero el título/pregunta y ocultando el contenido/respuesta.
3. WHEN el usuario solicita ver la respuesta, THE Review_Session SHALL revelar el contenido completo de la tarjeta.
4. WHEN el usuario selecciona "Lo sabía", THE Review_Session SHALL registrar la revisión como correcta en `user_progress` e invocar al Points_Engine.
5. WHEN el usuario selecciona "No lo sabía", THE Review_Session SHALL registrar la revisión como incorrecta en `user_progress` sin otorgar puntos.
6. THE Review_Session SHALL avanzar automáticamente a la siguiente tarjeta tras registrar la respuesta del usuario.
7. WHEN se han repasado todas las tarjetas del Deck, THE Review_Session SHALL redirigir al usuario a la Results_Screen.
8. WHILE una sesión está activa, THE Review_Session SHALL mostrar el progreso de la sesión como "tarjeta X de N".

---

### Requirement 6: Sesión de repaso — Quiz Mode

**User Story:** Como usuario, quiero repasar tarjetas respondiendo preguntas de opción múltiple, para poner a prueba mi conocimiento de forma más exigente.

#### Acceptance Criteria

1. WHEN el usuario inicia una sesión en Quiz_Mode, THE Review_Session SHALL cargar un Deck de tarjetas del mismo topic.
2. THE Quiz_Generator SHALL generar exactamente 4 opciones de respuesta para cada tarjeta: 1 correcta y 3 incorrectas.
3. THE Quiz_Generator SHALL obtener las 3 opciones incorrectas seleccionando aleatoriamente títulos de otras tarjetas del mismo topic, excluyendo la tarjeta actual.
4. IF el topic tiene menos de 3 tarjetas adicionales disponibles, THEN THE Quiz_Generator SHALL completar las opciones faltantes con títulos de tarjetas de otros topics.
5. THE Review_Session SHALL presentar las 4 opciones en orden aleatorio en cada pregunta.
6. WHEN el usuario selecciona la opción correcta, THE Review_Session SHALL registrar la revisión como correcta en `user_progress`, resaltar la opción correcta en verde e invocar al Points_Engine.
7. WHEN el usuario selecciona una opción incorrecta, THE Review_Session SHALL registrar la revisión como incorrecta en `user_progress` y resaltar la opción correcta en verde y la seleccionada en rojo.
8. WHEN se han respondido todas las tarjetas del Deck, THE Review_Session SHALL redirigir al usuario a la Results_Screen.
9. WHILE una sesión de Quiz_Mode está activa, THE Review_Session SHALL mostrar el progreso como "pregunta X de N".

---

### Requirement 7: Motor de puntos

**User Story:** Como usuario, quiero ganar puntos por cada tarjeta que respondo correctamente, con bonificaciones por rachas de aciertos, para sentir progresión y motivación al estudiar.

#### Acceptance Criteria

1. WHEN el usuario responde correctamente una tarjeta con `difficulty = "easy"`, THE Points_Engine SHALL sumar 10 puntos a `user_stats.total_points`.
2. WHEN el usuario responde correctamente una tarjeta con `difficulty = "medium"`, THE Points_Engine SHALL sumar 20 puntos a `user_stats.total_points`.
3. WHEN el usuario responde correctamente una tarjeta con `difficulty = "hard"`, THE Points_Engine SHALL sumar 30 puntos a `user_stats.total_points`.
4. WHEN el Correct_Streak del usuario alcanza exactamente 3 respuestas correctas consecutivas, THE Points_Engine SHALL sumar 5 puntos adicionales de bonus a `user_stats.total_points`.
5. WHEN el Correct_Streak del usuario alcanza exactamente 5 respuestas correctas consecutivas, THE Points_Engine SHALL sumar 15 puntos adicionales de bonus a `user_stats.total_points`.
6. WHEN el usuario responde incorrectamente, THE Points_Engine SHALL reiniciar el Correct_Streak a 0 sin modificar los puntos acumulados.
7. THE Points_Engine SHALL actualizar `user_stats.total_points` de forma atómica para evitar condiciones de carrera.
8. THE Points_Engine SHALL calcular los puntos de bonus de racha de forma acumulativa: al llegar a 5 correctas seguidas, el usuario recibe el bonus de 5 (en la tercera) y el bonus de 15 (en la quinta), sumando 20 puntos de bonus en total hasta ese punto.

---

### Requirement 8: Racha diaria

**User Story:** Como usuario, quiero mantener una racha de días consecutivos de estudio, para crear un hábito de aprendizaje constante.

#### Acceptance Criteria

1. WHEN el usuario completa al menos una sesión de repaso en un día calendario, THE Streak_Tracker SHALL incrementar `user_stats.current_streak` en 1.
2. WHEN el usuario completa una sesión y `user_stats.last_study_date` es el día anterior al día actual, THE Streak_Tracker SHALL incrementar `user_stats.current_streak` en 1.
3. WHEN el usuario completa una sesión y `user_stats.last_study_date` es el mismo día actual, THE Streak_Tracker SHALL mantener `user_stats.current_streak` sin cambios.
4. WHEN el usuario completa una sesión y `user_stats.last_study_date` es anterior al día de ayer, THE Streak_Tracker SHALL reiniciar `user_stats.current_streak` a 1.
5. WHEN `user_stats.current_streak` supera `user_stats.longest_streak`, THE Streak_Tracker SHALL actualizar `user_stats.longest_streak` con el valor de `user_stats.current_streak`.
6. THE Streak_Tracker SHALL actualizar `user_stats.last_study_date` con la fecha actual al finalizar cada sesión de repaso.

---

### Requirement 9: Sistema de insignias

**User Story:** Como usuario, quiero desbloquear insignias al alcanzar hitos de progreso, para sentir reconocimiento por mis logros de aprendizaje.

#### Acceptance Criteria

1. WHEN el usuario completa su primera tarjeta correctamente, THE Badge_Engine SHALL desbloquear la insignia "Primer paso" (🌱, basic) si no estaba ya desbloqueada.
2. WHEN el Correct_Streak del usuario alcanza 3 dentro de una sesión, THE Badge_Engine SHALL desbloquear la insignia "En racha" (⚡, basic) si no estaba ya desbloqueada.
3. WHEN el total de tarjetas repasadas por el usuario en `user_progress` alcanza 50, THE Badge_Engine SHALL desbloquear la insignia "Estudioso" (📚, basic) si no estaba ya desbloqueada.
4. WHEN `user_stats.current_streak` alcanza 7 días consecutivos, THE Badge_Engine SHALL desbloquear la insignia "Semana de fuego" (🔥, intermediate) si no estaba ya desbloqueada.
5. WHEN el usuario ha repasado correctamente todas las tarjetas con `topic = "JavaScript"` al menos una vez, THE Badge_Engine SHALL desbloquear la insignia "Experto JS" (🎯, intermediate) si no estaba ya desbloqueada.
6. WHEN el total de respuestas correctas del usuario en `user_progress` alcanza 100, THE Badge_Engine SHALL desbloquear la insignia "Centurión" (🚀, intermediate) si no estaba ya desbloqueada.
7. WHEN el usuario completa una sesión de repaso con 100% de respuestas correctas y la sesión contiene al menos 5 tarjetas, THE Badge_Engine SHALL desbloquear la insignia "Perfeccionista" (🏆, intermediate) si no estaba ya desbloqueada.
8. WHEN el usuario ha repasado correctamente todas las tarjetas con `topic = "TypeScript"` al menos una vez, THE Badge_Engine SHALL desbloquear la insignia "Maestro TS" (💎, advanced) si no estaba ya desbloqueada.
9. WHEN el usuario ha repasado correctamente todas las tarjetas disponibles en la plataforma al menos una vez, THE Badge_Engine SHALL desbloquear la insignia "Maestro total" (👑, advanced) si no estaba ya desbloqueada.
10. WHEN el Badge_Engine desbloquea una insignia, THE Platform SHALL registrar el desbloqueo en `user_badges` con `unlocked_at = now()` y mostrar una notificación visual al usuario.
11. THE Badge_Engine SHALL evaluar las condiciones de desbloqueo al finalizar cada sesión de repaso, no durante la sesión.

---

### Requirement 10: Pantalla de resultados

**User Story:** Como usuario, quiero ver un resumen detallado al finalizar cada sesión de repaso, para conocer mi rendimiento y los puntos obtenidos.

#### Acceptance Criteria

1. WHEN una sesión de repaso finaliza, THE Results_Screen SHALL mostrar el número total de tarjetas repasadas en la sesión.
2. THE Results_Screen SHALL mostrar el número de respuestas correctas e incorrectas de la sesión.
3. THE Results_Screen SHALL mostrar el porcentaje de aciertos de la sesión calculado como `(correctas / total) * 100` redondeado a entero.
4. THE Results_Screen SHALL mostrar los puntos obtenidos durante la sesión, incluyendo puntos base y bonificaciones de racha.
5. WHEN se desbloquearon insignias durante la sesión, THE Results_Screen SHALL mostrar las insignias recién desbloqueadas con su nombre e icono.
6. THE Results_Screen SHALL ofrecer las opciones "Repasar de nuevo" (nueva sesión con el mismo Deck) y "Volver al Dashboard".

---

### Requirement 11: Pantalla de insignias y logros

**User Story:** Como usuario, quiero ver todas las insignias disponibles y cuáles he desbloqueado, para conocer mi progreso y los hitos que me faltan por alcanzar.

#### Acceptance Criteria

1. THE Badges_Screen SHALL mostrar las 9 insignias del sistema agrupadas por nivel: basic, intermediate y advanced.
2. THE Badges_Screen SHALL mostrar cada insignia con su icono, nombre, descripción y nivel.
3. WHEN una insignia está desbloqueada, THE Badges_Screen SHALL mostrarla en su estado activo con la fecha de desbloqueo obtenida desde `user_badges.unlocked_at`.
4. WHEN una insignia no está desbloqueada, THE Badges_Screen SHALL mostrarla en estado bloqueado (visualmente atenuada) sin revelar la condición exacta de desbloqueo.
5. THE Badges_Screen SHALL mostrar el conteo de insignias desbloqueadas sobre el total (p. ej. "3 / 9").

---

### Requirement 12: Perfil y estadísticas

**User Story:** Como usuario, quiero ver mis estadísticas detalladas de progreso y gestionar mi perfil, para entender mi evolución y personalizar mi experiencia.

#### Acceptance Criteria

1. THE Profile_Screen SHALL mostrar el total de puntos acumulados desde `user_stats.total_points`.
2. THE Profile_Screen SHALL mostrar la racha actual y la racha máxima desde `user_stats.current_streak` y `user_stats.longest_streak`.
3. THE Profile_Screen SHALL mostrar el total de tarjetas repasadas calculado desde el conteo de registros en `user_progress` del usuario.
4. THE Profile_Screen SHALL mostrar el total de respuestas correctas calculado desde `user_progress` filtrando por `correct = true`.
5. THE Profile_Screen SHALL mostrar el porcentaje global de aciertos calculado como `(correctas / total_repasadas) * 100` redondeado a entero.
6. THE Profile_Screen SHALL permitir al usuario modificar los topics seleccionados, actualizando `user_preferences.selected_topics`.
7. THE Profile_Screen SHALL mostrar el email del usuario autenticado obtenido desde la sesión de Supabase Auth.

---

### Requirement 13: Diseño visual y responsividad

**User Story:** Como usuario, quiero una interfaz visualmente atractiva que funcione bien en móvil y escritorio, para disfrutar de una experiencia de estudio cómoda en cualquier dispositivo.

#### Acceptance Criteria

1. THE Platform SHALL implementar un diseño mobile-first con breakpoint base en 375px de ancho.
2. WHILE el viewport es menor a 768px, THE Platform SHALL mostrar una barra de navegación inferior (bottom nav) con acceso a Dashboard, Library, Badges y Profile.
3. WHILE el viewport es igual o mayor a 768px, THE Platform SHALL mostrar una barra lateral (sidebar) de navegación en lugar de la bottom nav.
4. THE Platform SHALL implementar glassmorphism como estilo visual principal con gradiente de fondo.
5. WHILE el tema activo es claro, THE Platform SHALL usar `#7C3AED` como color primario y sus variantes para elementos interactivos.
6. WHILE el tema activo es oscuro, THE Platform SHALL usar `#06B6D4` como color primario y sus variantes para elementos interactivos.
7. THE Platform SHALL implementar los tokens de diseño usando `@theme {}` en el CSS global de TailwindCSS v4, sin archivo `tailwind.config.js`.
8. THE Platform SHALL definir las variables de tema claro en `:root` y las de tema oscuro en `[data-theme="dark"]` en el CSS global.
9. THE Platform SHALL persistir la preferencia de tema del usuario entre sesiones usando `localStorage`.

---

### Requirement 14: Seguridad y protección de datos

**User Story:** Como usuario, quiero que mis datos de progreso estén protegidos y solo sean accesibles por mí, para garantizar la privacidad de mi información de estudio.

#### Acceptance Criteria

1. THE Platform SHALL activar RLS en las tablas `user_progress`, `user_stats`, `user_badges` y `user_preferences`, permitiendo a cada usuario leer y escribir únicamente sus propios registros.
2. THE Middleware SHALL interceptar todas las peticiones a rutas protegidas de Astro y redirigir a `/login` si no existe una sesión de Supabase válida.
3. THE Platform SHALL exponer únicamente las tablas `cards` y `badges` como de lectura pública (sin RLS restrictivo), ya que son contenido compartido.
4. IF una petición a la API de Supabase falla por error de autorización (RLS), THEN THE Platform SHALL registrar el error en consola y mostrar al usuario el mensaje "No tienes permiso para acceder a este recurso".

---

### Requirement 15: Extensibilidad de topics

**User Story:** Como administrador del contenido, quiero poder agregar nuevos topics sin modificar el esquema de la base de datos ni el código de la aplicación, para escalar el contenido de la plataforma fácilmente.

#### Acceptance Criteria

1. THE Platform SHALL tratar el campo `cards.topic` como texto libre sin validación contra un enum fijo, permitiendo insertar tarjetas de cualquier topic nuevo directamente en la base de datos.
2. WHEN se insertan tarjetas con un nuevo topic en la base de datos, THE Platform SHALL incluir automáticamente ese topic en los filtros de la Library y en el Onboarding_Flow sin requerir cambios de código.
3. THE Badge_Engine SHALL evaluar las condiciones de insignias basadas en topic (Experto JS, Maestro TS) usando el valor exacto del campo `topic` como cadena de texto, permitiendo agregar insignias análogas para nuevos topics mediante inserción en la tabla `badges`.

---

### Requirement 16: Gestión de paquetes con pnpm

**User Story:** Como desarrollador del proyecto, quiero que pnpm sea el único gestor de paquetes permitido, para garantizar instalaciones reproducibles y consistentes en todos los entornos.

#### Acceptance Criteria

1. THE Package_Manager SHALL gestionar todas las dependencias del proyecto usando exclusivamente pnpm, prohibiendo el uso de npm o yarn.
2. THE Platform SHALL incluir un archivo `pnpm-lock.yaml` como único lockfile del repositorio; los archivos `package-lock.json` y `yarn.lock` no deben existir.
3. WHEN se instalan dependencias en el proyecto, THE Package_Manager SHALL ejecutar `pnpm install` como único comando válido de instalación.
4. WHEN se agrega una nueva dependencia, THE Package_Manager SHALL ejecutar `pnpm add <paquete>` para dependencias de producción y `pnpm add -D <paquete>` para dependencias de desarrollo.
5. WHEN se ejecutan scripts del proyecto (build, dev, test), THE Package_Manager SHALL invocarlos mediante `pnpm run <script>` o su forma abreviada `pnpm <script>`.
6. WHEN se ejecutan herramientas sin instalación previa, THE Package_Manager SHALL usar `pnpm dlx <herramienta>` en lugar de `npx`.
7. THE Platform SHALL incluir en el `package.json` el campo `"packageManager": "pnpm@<version>"` para forzar el uso de pnpm mediante corepack.

---

### Requirement 17: Calidad de código — KISS y DRY

**User Story:** Como desarrollador del proyecto, quiero que el código siga los principios KISS y DRY con Pinia como única fuente de verdad del estado global, para mantener una base de código mantenible, predecible y libre de duplicación.

#### Acceptance Criteria

1. THE Platform SHALL organizar toda la lógica de negocio reutilizable (cálculo de puntos, evaluación de rachas, desbloqueo de insignias) en módulos bajo `src/lib/`, sin duplicar esa lógica en componentes Vue ni en páginas Astro.
2. THE Platform SHALL implementar cada módulo de `src/lib/` con una única responsabilidad claramente definida: `points.ts` para cálculo de puntos, `streak.ts` para rachas y `badges.ts` para insignias.
3. WHEN un componente Vue o una página Astro necesita lógica de negocio, THE Platform SHALL importar y reutilizar el módulo correspondiente de `src/lib/` en lugar de reimplementar la lógica localmente.
4. THE Platform SHALL centralizar todo el estado global de la aplicación en stores de Pinia ubicados en `src/stores/`; los componentes Vue y las páginas Astro no deben mantener estado derivado del estado global fuera de los stores.
5. WHEN múltiples componentes necesitan el mismo dato de estado, THE Platform SHALL exponerlo a través de un único store de Pinia como fuente de verdad, evitando props drilling o estado local duplicado.
6. THE Platform SHALL mantener cada componente Vue con una única responsabilidad visual o de interacción; la lógica de negocio no debe residir en los componentes.
7. IF una función o bloque de lógica aparece en más de un lugar del código fuente, THEN THE Platform SHALL extraerla a un módulo compartido en `src/lib/` o a un composable en `src/composables/`.

---

### Requirement 18: Seguridad — OWASP Top 10

**User Story:** Como usuario de la plataforma, quiero que mis datos y sesión estén protegidos contra las vulnerabilidades web más comunes, para confiar en que la aplicación maneja mi información de forma segura.

#### Acceptance Criteria

1. THE Security_Layer SHALL implementar RLS de Supabase y Middleware de Astro como doble capa de control de acceso: RLS garantiza que las queries a la base de datos solo devuelven datos del usuario autenticado, y el Middleware bloquea el acceso a rutas protegidas antes de que lleguen al cliente (A01 — Broken Access Control).
2. THE Platform SHALL almacenar en `localStorage` únicamente la preferencia de tema del usuario (`theme`); los tokens de sesión serán gestionados exclusivamente por el cliente de Supabase Auth mediante cookies httpOnly, sin que el código de la aplicación los lea ni escriba directamente (A02 — Cryptographic Failures).
3. WHEN la aplicación realiza consultas a la base de datos, THE Platform SHALL usar exclusivamente el cliente de Supabase con queries parametrizadas; está prohibido construir cadenas SQL mediante concatenación de strings en cualquier parte del código fuente (A03 — Injection).
4. THE Platform SHALL definir todas las variables de entorno sensibles en el archivo `.env` del proyecto, nunca en el código fuente; únicamente las variables con prefijo `PUBLIC_` (como la clave anon de Supabase) podrán ser expuestas al cliente (A05 — Security Misconfiguration).
5. WHEN se configura el cliente de Supabase, THE Platform SHALL usar `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` para el cliente público, y `SUPABASE_SERVICE_ROLE_KEY` (sin prefijo `PUBLIC_`) exclusivamente en contextos server-side de Astro, nunca en el bundle del cliente (A05 — Security Misconfiguration).
6. THE Auth_Service SHALL delegar completamente la autenticación, gestión de sesiones y renovación de tokens a Supabase Auth; la aplicación no implementará lógica propia de hashing de contraseñas, generación de tokens ni validación de sesiones (A07 — Identification and Authentication Failures).
7. WHEN una petición a Supabase falla con un error de autorización (código 401 o 403, o error RLS), THE Platform SHALL registrar el error completo en consola server-side incluyendo timestamp, ruta y código de error, y devolver al cliente únicamente el mensaje genérico "No tienes permiso para acceder a este recurso" sin exponer detalles internos (A09 — Security Logging and Monitoring).
8. IF el Middleware de Astro detecta una petición a una ruta protegida sin sesión válida de Supabase, THEN THE Middleware SHALL redirigir inmediatamente a `/login` sin procesar la petición ni exponer información sobre la ruta solicitada (A01 — Broken Access Control).

---

### Requirement 19: Astro Actions como capa de comunicación server-side

**User Story:** Como desarrollador del proyecto, quiero que todas las mutaciones de datos pasen por Astro Actions definidas en `src/actions/index.ts`, para centralizar la lógica server-side, validar la sesión antes de cada operación y mantener los componentes Vue desacoplados de Supabase.

#### Acceptance Criteria

1. THE Platform SHALL implementar todas las operaciones de escritura a Supabase (guardar progreso, actualizar puntos, actualizar racha, desbloquear insignias, guardar preferencias) exclusivamente como Astro_Actions definidas en `src/actions/index.ts`.
2. WHEN un componente Vue necesita ejecutar una mutación de datos, THE Platform SHALL invocar la Astro_Action correspondiente mediante el cliente de acciones de Astro; los componentes Vue no deben importar ni llamar directamente al cliente de Supabase para operaciones de escritura.
3. WHEN una Astro_Action es invocada, THE Astro_Actions SHALL verificar la sesión del usuario server-side mediante el cliente de Supabase SSR antes de ejecutar cualquier operación en la base de datos.
4. IF una Astro_Action detecta que no existe sesión válida del usuario, THEN THE Astro_Actions SHALL retornar un error de autorización sin ejecutar la operación solicitada.
5. THE Platform SHALL permitir que las páginas Astro lean datos públicos (tarjetas, insignias) directamente desde el servidor usando el cliente de Supabase SSR, sin requerir Astro_Actions para operaciones de solo lectura de contenido compartido.
6. THE Astro_Actions SHALL retornar respuestas tipadas con TypeScript que incluyan el resultado de la operación o un objeto de error estructurado, permitiendo que los componentes Vue manejen ambos casos de forma explícita.
7. WHILE el usuario no tiene sesión activa, THE Astro_Actions SHALL rechazar cualquier mutación y retornar el código de error `UNAUTHORIZED` sin exponer detalles del stack interno.

---

### Requirement 20: Ocultamiento de tecnología en headers HTTP

**User Story:** Como responsable de seguridad de la plataforma, quiero que las respuestas HTTP no revelen información sobre el stack tecnológico, para reducir la superficie de ataque y cumplir con OWASP A05 (Security Misconfiguration).

#### Acceptance Criteria

1. THE Platform SHALL eliminar o sobreescribir los headers HTTP `X-Powered-By`, `Server` y cualquier header con prefijo `X-Astro-*` en todas las respuestas, configurando el Header_Hardening en `astro.config.mjs` o en el adaptador de Vercel.
2. WHEN el servidor genera una respuesta HTTP, THE Platform SHALL incluir el header `X-Content-Type-Options: nosniff` para prevenir la interpretación incorrecta de tipos MIME.
3. WHEN el servidor genera una respuesta HTTP, THE Platform SHALL incluir el header `X-Frame-Options: DENY` para prevenir ataques de clickjacking.
4. WHEN el servidor genera una respuesta HTTP, THE Platform SHALL incluir el header `Referrer-Policy: strict-origin-when-cross-origin` para controlar la información enviada en el campo Referer.
5. WHEN el servidor genera una respuesta HTTP, THE Platform SHALL incluir el header `Permissions-Policy` deshabilitando las APIs de navegador no utilizadas por la plataforma (como `camera`, `microphone` y `geolocation`).
6. IF el header `Server` no puede ser eliminado por el adaptador de Vercel, THEN THE Platform SHALL sobreescribirlo con un valor genérico que no revele información sobre Astro, Node.js ni la versión del servidor.
7. THE Platform SHALL garantizar que ninguna respuesta HTTP incluya información sobre Astro, Vue, Vite, Node.js ni Supabase en sus headers, verificable mediante inspección de las cabeceras de respuesta en producción.

---

## Correctness Properties (Property-Based Testing)

Las siguientes propiedades están diseñadas para Vitest con una librería de PBT como `fast-check`.

### P1 — Points_Engine: Invariante de puntos no negativos

**Propiedad:** Para cualquier secuencia de respuestas correctas e incorrectas, `user_stats.total_points` nunca debe decrecer ni volverse negativo.

```
∀ sequence of answers: total_points_after >= total_points_before
∀ state: total_points >= 0
```

**Tipo:** Invariante  
**Módulo:** Points_Engine

---

### P2 — Points_Engine: Cálculo determinista de puntos por dificultad

**Propiedad:** Para cualquier combinación de dificultad y resultado, los puntos otorgados son siempre los mismos (función pura).

```
∀ difficulty ∈ {easy, medium, hard}, correct ∈ {true, false}:
  calculatePoints(difficulty, correct) === calculatePoints(difficulty, correct)
```

**Tipo:** Idempotencia / Determinismo  
**Módulo:** Points_Engine

---

### P3 — Points_Engine: Bonus de racha acumulativo correcto

**Propiedad:** Para cualquier secuencia de N respuestas correctas consecutivas, los puntos totales son iguales a la suma de puntos base más los bonuses correspondientes a los umbrales alcanzados (3 y 5).

```
∀ n ∈ [1..100], difficulty:
  totalPoints(n correct answers) = 
    n * basePoints(difficulty) 
    + (n >= 3 ? 5 : 0) 
    + (n >= 5 ? 15 : 0)
    + (n >= 8 ? 5 : 0)   // siguiente múltiplo de 3
    + ...
```

**Tipo:** Metamórfica  
**Módulo:** Points_Engine

---

### P4 — Streak_Tracker: Monotonía de la racha máxima

**Propiedad:** `longest_streak` nunca puede decrecer. Para cualquier secuencia de actualizaciones de racha, `longest_streak` es siempre mayor o igual a su valor anterior.

```
∀ sequence of streak updates:
  longest_streak_after >= longest_streak_before
```

**Tipo:** Invariante  
**Módulo:** Streak_Tracker

---

### P5 — Streak_Tracker: Consistencia racha actual vs máxima

**Propiedad:** En cualquier estado válido del sistema, `current_streak <= longest_streak`.

```
∀ valid state: current_streak <= longest_streak
```

**Tipo:** Invariante  
**Módulo:** Streak_Tracker

---

### P6 — Quiz_Generator: Unicidad de opciones

**Propiedad:** Para cualquier tarjeta y cualquier conjunto de tarjetas del mismo topic, las 4 opciones generadas por el Quiz_Generator son siempre distintas entre sí.

```
∀ card, ∀ topic_cards:
  let options = generateOptions(card, topic_cards)
  options.length === 4 && new Set(options).size === 4
```

**Tipo:** Invariante  
**Módulo:** Quiz_Generator

---

### P7 — Quiz_Generator: La opción correcta siempre está presente

**Propiedad:** Para cualquier tarjeta, la opción correcta (el título de la tarjeta actual) siempre está incluida en las opciones generadas.

```
∀ card, ∀ topic_cards:
  let options = generateOptions(card, topic_cards)
  options.includes(card.title)
```

**Tipo:** Invariante  
**Módulo:** Quiz_Generator

---

### P8 — Badge_Engine: Idempotencia de desbloqueo

**Propiedad:** Evaluar las condiciones de insignias múltiples veces con el mismo estado no crea registros duplicados en `user_badges`.

```
∀ user_state:
  evaluateBadges(user_state)
  evaluateBadges(user_state)
  count(user_badges where user_id = user) === count after first evaluation
```

**Tipo:** Idempotencia  
**Módulo:** Badge_Engine

---

### P9 — Review_Session: Conservación del conteo de tarjetas

**Propiedad:** Al finalizar una sesión, el número de registros insertados en `user_progress` es exactamente igual al número de tarjetas del Deck con el que se inició la sesión.

```
∀ deck of size N:
  after completing session: new user_progress records === N
```

**Tipo:** Invariante  
**Módulo:** Review_Session

---

### P10 — Points_Engine: Respuestas incorrectas no otorgan puntos

**Propiedad:** Para cualquier tarjeta con `correct = false`, los puntos otorgados son exactamente 0, independientemente de la dificultad.

```
∀ difficulty ∈ {easy, medium, hard}:
  calculatePoints(difficulty, false) === 0
```

**Tipo:** Invariante  
**Módulo:** Points_Engine

---

## Product Q&A

Clarificaciones de producto tomadas durante la definición del spec. Sirven como referencia rápida para decisiones de diseño e implementación.

---

**¿Cuál es el propósito principal de la plataforma?**
Portafolio personal del desarrollador y herramienta de estudio real para JavaScript y TypeScript. No es un producto SaaS ni tiene usuarios externos en esta versión.

---

**¿Qué métodos de autenticación se soportan?**
Email/contraseña + OAuth con Google y GitHub, todo gestionado por Supabase Auth. No se implementa lógica de auth propia.

---

**¿Los topics (JavaScript, TypeScript) son fijos o extensibles?**
Extensibles. El campo `cards.topic` es texto libre sin enum fijo. Agregar un nuevo topic solo requiere insertar tarjetas con ese topic en la base de datos — no hay cambios de código ni de esquema.

---

**¿Qué tan profundo es el sistema de gamificación?**
Puntos por dificultad (10/20/30), bonuses por racha de aciertos (+5 en 3 consecutivas, +15 en 5), racha diaria de estudio y 9 insignias. Sin leaderboard ni niveles de usuario en esta versión.

---

**¿Cuántos modos de repaso hay?**
Dos: Self-Assessment ("Lo sabía / No lo sabía") y Quiz con 4 opciones múltiples generadas dinámicamente desde otras tarjetas del mismo topic.

---

**¿Cómo se generan las opciones incorrectas del Quiz?**
El Quiz_Generator selecciona aleatoriamente títulos de otras tarjetas del mismo topic. Si hay menos de 3 tarjetas adicionales en el topic, completa con tarjetas de otros topics. Siempre se garantizan 4 opciones únicas.

---

**¿Qué gestor de paquetes se usa?**
pnpm exclusivamente. Prohibido usar npm o yarn. Todos los comandos usan `pnpm install`, `pnpm add`, `pnpm dlx`. El `package.json` incluye el campo `"packageManager"` para forzarlo via corepack.

---

**¿Cómo se comunican los componentes Vue con Supabase?**
Los componentes Vue NUNCA llaman a Supabase directamente para escrituras. Todas las mutaciones pasan por Astro Actions (`src/actions/index.ts`). Las páginas Astro pueden leer datos públicos (cards, badges) directamente con el cliente SSR.

---

**¿Dónde se centraliza el manejo de errores?**
En `src/lib/errors.ts`. Este módulo define los 7 códigos de error (`AppErrorCode`), los mensajes genéricos para el usuario (`USER_ERROR_MESSAGES`), el logger server-side (`logServerError`) y el mapeador de errores de Supabase (`mapSupabaseError`). Los componentes Vue muestran errores via `toast.error(result.message)` de vue-sonner.

---

**¿Qué información se expone en los headers HTTP?**
Ninguna relacionada con el stack. Se eliminan `X-Powered-By`, `Server` y `X-Astro-*`. Se agregan headers de seguridad: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`.

---

**¿Dónde se despliega la aplicación?**
Vercel con el adaptador oficial de Astro (`@astrojs/vercel`), modo SSR. No Netlify.

---

**¿Qué framework de testing se usa?**
Vitest + fast-check para tests unitarios y property-based testing (PBT) de la lógica de negocio. Playwright para tests E2E de flujos críticos. Los tests PBT son parte del flujo de desarrollo normal (no opcionales).

---

**¿Cómo se maneja el tema claro/oscuro?**
Via `data-theme` attribute en el `<html>`. El tema se inicializa en el `<head>` del layout base leyendo `localStorage` para evitar flash. El composable `useTheme` gestiona el toggle y la persistencia. TailwindCSS v4 usa variables CSS en `:root` y `[data-theme="dark"]`.

---

**¿Las insignias se pueden perder una vez obtenidas?**
No. Las insignias son permanentes. La tabla `user_badges` tiene una constraint `UNIQUE(user_id, badge_id)` y el Badge_Engine es idempotente — evaluar las condiciones múltiples veces no crea duplicados.

---

**¿Cuál es el scope del MVP?**
Las fases 1–16 y 19 del plan de tareas forman el MVP funcional completo. Los tests E2E (tarea 17) y las animaciones avanzadas (tarea 18) son opcionales para MVP y pueden implementarse en una segunda iteración.
