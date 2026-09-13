export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  if (typeof value === 'number') {
    return String(value)
  }

  let text = String(value)

  // Prevent CSV Injection (Macro Injection)
  if (/^[\s]*[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
