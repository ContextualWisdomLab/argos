export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  if (typeof value !== 'number') {
    const text = String(value)
    if (/^[=+\-@\t\r]/.test(text)) {
      return `"'${text.replaceAll('"', '""')}"`
    }
  }

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
