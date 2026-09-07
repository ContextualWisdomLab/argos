const FORMULA_TRIGGER = /^ *[=+\-@\t\r\n\uff1d\uff0b\uff0d\uff20]/

/**
 * Serialize one already-authorized dashboard value as a single CSV field.
 *
 * String values that spreadsheet software may interpret as formulas receive a
 * leading text marker before RFC-style quote/delimiter escaping. Numeric input
 * deliberately keeps its numeric representation. This is an export boundary,
 * not a universal spreadsheet-security guarantee; target-application behavior
 * is verified separately in the product technical gap baseline.
 */
export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''

  let text = String(value)
  if (typeof value !== 'number' && FORMULA_TRIGGER.test(text)) {
    text = `'${text}`
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
