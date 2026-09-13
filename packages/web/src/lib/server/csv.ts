export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)

  // Prevent CSV Injection (Macro Injection)
  if (typeof value !== 'number' && /^[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/.test(text.trimStart())) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
