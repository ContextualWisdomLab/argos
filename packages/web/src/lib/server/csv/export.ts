/**
 * Serialize one CSV cell while reducing spreadsheet formula-interpretation risk.
 *
 * String values whose first non-whitespace character is a known formula trigger
 * receive a leading apostrophe before ordinary CSV quoting. Numeric values keep
 * their numeric representation. This is an export-boundary mitigation, not a
 * universal spreadsheet sandbox: downstream applications may reinterpret CSV
 * content after edits or re-saving, so callers must not treat the output as a
 * trusted executable document format.
 */
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  if (typeof value === 'string') {
    const trimmed = value.trimStart()
    if (/^[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/.test(trimmed)) {
      value = `'${value}`
    }
  }

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
