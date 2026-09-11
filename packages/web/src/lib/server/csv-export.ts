export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  // Prevent CSV Formula Injection (Macro Injection)
  if (typeof value !== 'number') {
    const text = String(value)
    const trimmed = text.trimStart()
    if (/^[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/.test(trimmed)) {
      value = "'" + text
    }
  }

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
