// Prevent CSV Injection (Macro Injection) by prepending a single quote to potentially dangerous fields
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  if (typeof value !== 'number') {
    const text = String(value)
    if (/^\s*[=+\-@\t\r\n\uff1d\uff0b\uff0d\uff20]/.test(text)) {
      const safeText = "'" + text
      return /[",\r\n]/.test(safeText) ? `"${safeText.replaceAll('"', '""')}"` : safeText
    }
  }

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
