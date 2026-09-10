// Prevent CSV Injection (Macro Injection)
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return String(value)

  let text = String(value)

  // Prevent CSV Formula Injection (Spreadsheet Macro Injection)
  if (/^[ \t\r\n]*[=+\-@\t\r\n\uff1d\uff0b\uff0d\uff20]/.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
