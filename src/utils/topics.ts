/**
 * Utilidades compartidas para temas de estudio.
 * Centraliza iconos y helpers para evitar duplicación entre componentes.
 */

export const TOPIC_ICONS: Record<string, string> = {
  JavaScript: '⚡',
  TypeScript: '🔷',
  HTML: '🌐',
  CSS: '🎨',
  React: '⚛️',
  Vue: '💚',
  Node: '🟢',
  Python: '🐍',
  SQL: '🗄️',
  Git: '🌿',
}

/**
 * Devuelve el icono correspondiente a un tema.
 * Si no hay icono definido, retorna el icono genérico de libro.
 */
export function getTopicIcon(topic: string): string {
  return TOPIC_ICONS[topic] ?? '📖'
}
