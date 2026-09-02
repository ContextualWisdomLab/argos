// 🛡️ Sentinel: Prevent CSV Injection (Formula Injection) by padding dangerous leading characters with a single quote.
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)

  if (/^[\s]*[=+\-@\t\r]/.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
