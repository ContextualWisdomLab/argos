/**
 * Serialize one CSV cell while preventing spreadsheet formula interpretation.
 * The leading apostrophe is inserted before any attacker-controlled whitespace so
 * spreadsheet applications see a text cell before evaluating formula markers.
 */
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  let text = String(value)
  if (/^\s*[=+\-@]/.test(text)) {
    text = `'${text}`
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
