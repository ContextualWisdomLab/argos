export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)

  // Prevent CSV Injection (Formula Injection) by prepending a single quote
  // if the field starts with a formula character (=, +, -, @, \t, \r)
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
