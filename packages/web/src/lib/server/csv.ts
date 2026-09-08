export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)
  // Prevent CSV Injection (Macro Injection)
  if (typeof value !== 'number' && /^[ \t\r\n]*[=+\-@\t\r\n\uff1d\uff0b\uff0d\uff20]/.test(text)) {
    text = "'" + text
  }
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
