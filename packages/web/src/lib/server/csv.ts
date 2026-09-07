const FORMULA_PREFIX = /^[=+\-@\t\r\n]/
const RFC_4180_QUOTING = /[",\r\n]/

/**
 * Serialize one CSV field while neutralizing spreadsheet formula execution.
 *
 * Numeric values remain numeric. Untrusted string values that begin with a
 * formula marker are prefixed with a tab and quoted, following OWASP's
 * Excel-resistant human-viewing mitigation. RFC 4180 delimiters and quotes are
 * then escaped normally.
 */
export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return String(value)

  const startsFormula = FORMULA_PREFIX.test(value)
  const text = startsFormula ? `\t${value}` : value
  const escaped = text.replaceAll('"', '""')

  return startsFormula || RFC_4180_QUOTING.test(text) ? `"${escaped}"` : escaped
}
