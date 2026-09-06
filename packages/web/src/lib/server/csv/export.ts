export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  if (typeof value === 'string') {
    // Prevent CSV Injection (Macro Injection)
    if (/^[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/.test(value)) {
      value = `'${value}`
    } else {
      const trimmed = value.replace(/^\s+/, '')
      if (trimmed.length !== value.length && /^[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/.test(trimmed)) {
        value = `'${value}`
      }
    }
  }

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
