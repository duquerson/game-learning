/**
 * Utilidades compartidas para niveles de dificultad.
 * Centraliza clases CSS y etiquetas para evitar duplicación entre componentes.
 */

import type { Difficulty } from '../types/app'

/**
 * Clases Tailwind para badges de dificultad (fondo + texto).
 * Usadas en componentes que emplean Tailwind directamente (ReviewCard, ReviewResults).
 */
export const DIFFICULTY_TAILWIND_CLASSES: Record<Difficulty, string> = {
  easy: 'bg-emerald-500/20 text-emerald-300',
  medium: 'bg-amber-500/20 text-amber-300',
  hard: 'bg-red-500/20 text-red-300',
}

/**
 * Clases CSS scoped para badges de dificultad.
 * Usadas en componentes que emplean CSS scoped con variables de tema.
 */
export const DIFFICULTY_CSS_CLASSES: Record<Difficulty, string> = {
  easy: 'difficulty-easy',
  medium: 'difficulty-medium',
  hard: 'difficulty-hard',
}

/**
 * Etiquetas en español para cada nivel de dificultad.
 */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
}

/**
 * Devuelve las clases Tailwind para un nivel de dificultad dado.
 */
export function getDifficultyTailwindClasses(difficulty: Difficulty): string {
  return DIFFICULTY_TAILWIND_CLASSES[difficulty]
}

/**
 * Devuelve la etiqueta en español para un nivel de dificultad dado.
 */
export function getDifficultyLabel(difficulty: Difficulty): string {
  return DIFFICULTY_LABELS[difficulty]
}
