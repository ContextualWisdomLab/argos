export function csvField(value: string | number | null | undefined): string | number {
  if (value === null || value === undefined) return ''

  if (typeof value === 'number') {
    return value
  }

  let text = String(value)

  // Prevent CSV Formula Injection (Spreadsheet Macro Injection)
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
