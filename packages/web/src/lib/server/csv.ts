/** Serialize one CSV field while neutralizing spreadsheet formula prefixes. */
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)
  const formulaCandidate = text.replace(/^ +/, '')

  if (typeof value !== 'number' && /^[=+\-@\t\r\n\x00\uFF1D\uFF0B\uFF0D\uFF20]/.test(formulaCandidate)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
