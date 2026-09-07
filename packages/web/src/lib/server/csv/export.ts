export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''

  let text = String(value)

  if (typeof value !== 'number' && /^[=+\-@\t\r]/.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
