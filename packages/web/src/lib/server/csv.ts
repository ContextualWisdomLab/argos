// Prevent CSV Injection (Macro Injection)
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)
  if (typeof value !== 'number') {
    if (/^[\s]*[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/.test(text)) {
      text = "'" + text
    }
  }
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
