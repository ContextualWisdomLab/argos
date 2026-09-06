export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  let text = String(value)

  // Prevent CSV Formula Injection (Spreadsheet Macro Injection)
  // Do not apply this to raw numbers to preserve formatting
  if (typeof value !== 'number' && /^[ \t\r\n]*[=+\-@＝＋－＠]/.test(text)) {
    text = "'" + text
  } else if (typeof value !== 'number' && /^[\t\r\n]/.test(text)) {
     text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
