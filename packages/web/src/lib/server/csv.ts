/** Serialize one CSV field while neutralizing spreadsheet formula prefixes. */
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)
  const trimmed = text.trimStart()
  const leadingWhitespace = text.slice(0, text.length - trimmed.length)
  const formulaPrefix = /^[=+\-@\x00\uFF1D\uFF0B\uFF0D\uFF20]/
  const hasDangerousLeadingControl = /[\t\r\n]/.test(leadingWhitespace)

  if (typeof value !== 'number' && (hasDangerousLeadingControl || formulaPrefix.test(trimmed))) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
