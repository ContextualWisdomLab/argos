export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  // Prevent CSV Formula Injection (Macro Injection)
  if (typeof value === 'string' && /^\s*[=+\-@\t\r\n\uff1d\uff0b\uff0d\uff20]/.test(value)) {
    value = `'${value}`
  }

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
