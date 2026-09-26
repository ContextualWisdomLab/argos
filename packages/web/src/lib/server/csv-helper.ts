export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  // Prevent CSV Formula Injection (Macro Injection)
  // Ensure that values starting with formula characters are escaped with a single quote.
  // We do this by checking for leading spaces followed by =, +, -, @, \t, \r, \n, or full-width equivalents.
  // Raw numbers (typeof value === 'number') are not escaped to preserve numeric formatting.
  let text = String(value)
  if (typeof value !== 'number' && /^[\s]*[=+\-@\t\r\n＝＋－＠]/.test(text)) {
    text = "'" + text
  }
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
