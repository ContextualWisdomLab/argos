export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  if (typeof value === 'string') {
    // Keep formula-like text inert when the CSV is opened in spreadsheet software.
    const trimmed = value.trimStart()
    if (/^[=+\-@\t\r\n\uff1d\uff0b\uff0d\uff20]/.test(trimmed)) {
      value = `'${value}`
    }
  }

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
