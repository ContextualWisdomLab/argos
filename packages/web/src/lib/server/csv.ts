export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return String(value)

  let text = String(value)

  const trimmed = text.trimStart()
  // trimStart() removes spaces, \t, \r, \n.
  // We need to check the ORIGINAL text (before trimStart) for \t, \r, \n
  // OR just check if the untrimmed text starts with them,
  // OR check if the trimmed text starts with the other injection characters.

  // A better approach is to check if the first non-whitespace character is an injection character
  // OR if the first character itself is a whitespace character that Excel might interpret as dangerous (like \t, \r, \n)
  // Wait, if it has a leading space and then `=`, it is dangerous.
  // What if it starts with `\t`? Excel might interpret it as dangerous.
  // Actually, trimStart() removes `\t`, `\n`, `\r` along with space.
  // So if `text` starts with `\t`, `\n`, or `\r`, we should definitely quote it.

  const startsWithWhitespace = text.startsWith('\t') || text.startsWith('\r') || text.startsWith('\n')

  if (
    startsWithWhitespace ||
    trimmed.startsWith('=') ||
    trimmed.startsWith('+') ||
    trimmed.startsWith('-') ||
    trimmed.startsWith('@') ||
    trimmed.startsWith('＝') ||
    trimmed.startsWith('＋') ||
    trimmed.startsWith('－') ||
    trimmed.startsWith('＠')
  ) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
