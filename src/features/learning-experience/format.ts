/**
 * Formateo mínimo de markdown inline para contenido de lecciones.
 * Soporta: **negrita**, `código`, y saltos de línea → <br>.
 * Contenido es canónico y controlado (no entrada de usuario).
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function formatInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

/** Convierte el texto explicativo (párrafos separados por doble salto) a HTML. */
export function formatExplanation(text: string): string {
  return text
    .split(/\n\n+/)
    .map((block) => `<p>${formatInlineMarkdown(block).replace(/\n/g, '<br>')}</p>`)
    .join('')
}
