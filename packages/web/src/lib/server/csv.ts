const FORMULA_PREFIX = /^[ \t\r\n]*[=+\-@\t\r\n\0\uff1d\uff0b\uff0d\uff20]/

/**
 * Serializes one CSV field while neutralizing spreadsheet formula prefixes for string values.
 * Numeric values retain numeric semantics; spreadsheet-client behavior still requires workflow validation.
 */
export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  let text = String(value)
  if (typeof value !== 'number' && FORMULA_PREFIX.test(text)) {
    text = "'" + text
  }
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
