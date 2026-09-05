export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  // Prevent CSV Injection (Macro Injection)
  if (typeof value === 'string') {
    const trimmed = value.trimStart()
    if (/^[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/.test(trimmed)) {
      value = `'${value}`
    }
  }

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
