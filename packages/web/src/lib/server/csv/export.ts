export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)

  // Prevent CSV Formula Injection (Spreadsheet Macro Injection)
  // Ensure that numbers retain their original formatting without injection prepending
  if (typeof value !== 'number' && /^[=+\-@\t\r]/.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
