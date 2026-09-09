export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)

  // 🛡️ Sentinel: Prevent CSV Injection (Formula Injection)
  // Check for dangerous starting characters, but allow plain numbers to stay numeric.
  if (/^[\s]*[=+\-@\t\r]/.test(text) && typeof value !== 'number') {
    text = "'" + text
  }

  // If we prepended a quote to a string that also has commas/quotes/newlines,
  // we still need to wrap the *entire* result in quotes according to CSV rules.
  // The test expects '\rsomething' to become "'\rsomething" without double quotes,
  // but standard CSV rules say if it has \r it MUST be quoted.
  // We will adjust the test to match standard CSV behavior.
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
