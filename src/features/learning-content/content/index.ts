import type { Lesson, LevelId } from '../../../types/app'
import { basicLessons } from './basic'
import { intermediateLessons } from './intermediate'
import { advancedLessons } from './advanced'
import { validateCatalog } from '../domain/validate'

/** Catálogo canónico de lecciones versionado en Git. */
export const lessons: Lesson[] = [...basicLessons, ...intermediateLessons, ...advancedLessons]

/** Niveles en orden del mapa de aprendizaje. */
export const levels: { id: LevelId; title: string; description: string }[] = [
  { id: 'basico', title: 'Básico', description: 'Variables, condicionales y bucles' },
  { id: 'intermedio', title: 'Intermedio', description: 'Funciones, arrays y objetos' },
  { id: 'avanzado', title: 'Avanzado', description: 'Closures, promesas y módulos' },
]

/** Lecciones de un nivel. */
export function lessonsByLevel(level: LevelId): Lesson[] {
  return lessons.filter((l) => l.level === level)
}

/** Lección por ID. */
export function lessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id)
}

/** Siguiente lección en orden del catálogo (para navegación). */
export function nextLesson(id: string): Lesson | undefined {
  const index = lessons.findIndex((l) => l.id === id)
  return index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined
}

// Validación en import: falla el build si el contenido es inválido (design.md).
const errors = validateCatalog(lessons)
if (errors.length > 0) {
  throw new Error(
    `Contenido inválido — el build se detiene:\n${errors.map((e) => `  - ${e}`).join('\n')}`
  )
}
