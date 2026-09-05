const FORMULA_PREFIX = /^[\s]*[=+\-@\t\r\n＝＋－＠]/u

/**
 * Encode one session-export field without letting untrusted text become a spreadsheet formula.
 * Numeric metrics remain numeric; text still uses RFC-style quote doubling when CSV syntax requires it.
 */
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)
  if (typeof value !== 'number' && FORMULA_PREFIX.test(text)) {
    text = "'" + text
  }
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
