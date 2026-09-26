export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)

  // Prevent CSV Injection (Macro Injection)
  if (typeof value !== 'number') {
    const match = text.match(/^\s*([=+\-@\t\r\n\uff1d\uff0b\uff0d\uff20])/)
    if (match) {
      text = "'" + text
    }
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
