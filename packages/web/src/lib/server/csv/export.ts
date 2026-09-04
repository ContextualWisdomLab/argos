export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''

  let stringValue = String(value)

  if (typeof value !== 'number' && /^[=+\-@\t\r]/.test(stringValue)) {
    stringValue = "'" + stringValue
  }

  return /[",\r\n]/.test(stringValue) ? `"${stringValue.replaceAll('"', '""')}"` : stringValue
}
