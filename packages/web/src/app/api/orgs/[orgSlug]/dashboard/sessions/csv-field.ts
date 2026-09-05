const FORMULA_PREFIX = /^[\s]*[=+\-@\t\r\n＝＋－＠]/u

/**
 * Encode one session-export field while reducing spreadsheet formula interpretation risk.
 * Numeric metrics remain numeric; text keeps CSV quote doubling when syntax requires it.
 * This is an export-boundary mitigation, not a spreadsheet sandbox: downstream tools can
 * reinterpret CSV after edits or re-saving, so callers must not treat CSV as trusted code.
 */
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)
  if (typeof value !== 'number' && FORMULA_PREFIX.test(text)) {
    text = "'" + text
  }
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
