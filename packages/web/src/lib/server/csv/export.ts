/** Serialize one CSV field while neutralizing spreadsheet formula-trigger prefixes. */
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  if (typeof value === 'string') {
    const formulaTrigger = /^[=+\-@\t\r\n\0\uFF1D\uFF0B\uFF0D\uFF20]/
    if (formulaTrigger.test(value)) {
      value = `'${value}`
    } else {
      const trimmed = value.replace(/^\s+/, '')
      if (trimmed.length !== value.length && formulaTrigger.test(trimmed)) {
        value = `'${value}`
      }
    }
  }

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
