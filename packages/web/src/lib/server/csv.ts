export function sanitizeCsvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)

  // 🛡️ Sentinel: Prevent CSV Injection (Formula Injection)
  if (/^[\s]*[=+\-@\t\r]/.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
