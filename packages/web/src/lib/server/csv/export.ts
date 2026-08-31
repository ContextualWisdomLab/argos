export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return String(value)

  const text = String(value)
  const isDangerous = /^[=+\-@\t\r]/.test(text)
  const escapedText = text.replaceAll('"', '""')

  // Prevent CSV Injection (Macro Injection) by prepending a single quote
  // if the value starts with =, +, -, @, \t, or \r
  if (isDangerous) {
    return `"'${escapedText}"`
  }

  return /[",\r\n]/.test(text) ? `"${escapedText}"` : text
}
