const FORMULA_TRIGGER_PREFIX = /^ *(?:[=+\-@＝＋－＠]|\t|\r|\n)/

export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  let text = String(value)

  // Preserve the exported value while neutralizing spreadsheet formula parsing.
  // Leading ASCII spaces are kept because spreadsheet importers may ignore them
  // before evaluating formula/control prefixes. Raw numbers remain numeric.
  if (typeof value !== 'number' && FORMULA_TRIGGER_PREFIX.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
