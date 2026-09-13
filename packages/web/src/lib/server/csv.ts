const FORMULA_PREFIXES = new Set(['=', '+', '-', '@', '\0', '\uff1d', '\uff0b', '\uff0d', '\uff20'])
const FORMULA_CONTROL_PREFIXES = new Set(['\t', '\r', '\n'])

/** Returns whether a string begins with a spreadsheet formula or control prefix after leading whitespace. */
function hasSpreadsheetFormulaPrefix(text: string) {
  const trimmedStart = text.trimStart()
  const removedLeadingWhitespace = text.slice(0, text.length - trimmedStart.length)

  return (
    [...removedLeadingWhitespace].some((character) => FORMULA_CONTROL_PREFIXES.has(character)) ||
    (trimmedStart.length > 0 && FORMULA_PREFIXES.has(trimmedStart[0]))
  )
}

/** Serializes one CSV field while neutralizing spreadsheet formula prefixes. */
export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)

  if (typeof value !== 'number' && hasSpreadsheetFormulaPrefix(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
