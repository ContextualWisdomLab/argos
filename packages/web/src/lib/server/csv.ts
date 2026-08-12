export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value).trim()

  // 🛡️ Sentinel: Prevent CSV Injection (CWE-1236) by escaping leading functional characters
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
