export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return String(value)

  let str = value
  const formulaPrefix = /^[ \t\v\f\r\n]*[=+\-@\0\t\r\n\uff1d\uff0b\uff0d\uff20]/
  if (formulaPrefix.test(str)) {
    str = `'${str}`
  }

  return `"${str.replace(/"/g, '""')}"`
}
