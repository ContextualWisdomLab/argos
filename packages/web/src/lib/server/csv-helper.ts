export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return String(value)

  let text = String(value)

  if (/^[ \t\r\n]*[=+\-@\t\r\n\uff1d\uff0b\uff0d\uff20]/.test(text)) {
    text = "'" + text
  }

  // Quote every string cell so alternate spreadsheet separators cannot turn
  // embedded untrusted text into a new formula-leading cell.
  return `"${text.replaceAll('"', '""')}"`
}
