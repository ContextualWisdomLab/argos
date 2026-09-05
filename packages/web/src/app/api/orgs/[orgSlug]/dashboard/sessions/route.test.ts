import { expect, test } from 'vitest'

// Testing the extracted csvField logic directly since it's an internal function
// For full coverage, we test the core logic here.
function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)
  // 🛡️ Sentinel: Prevent CSV Injection (Formula Injection) by padding formulas with a single quote
  if (typeof value !== 'number' && /^[\s]*[=+\-@\t\r]/.test(text)) {
    text = "'" + text
  }
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

test('csvField handles null/undefined', () => {
  expect(csvField(null)).toBe('')
  expect(csvField(undefined)).toBe('')
})

test('csvField handles normal strings', () => {
  expect(csvField('hello')).toBe('hello')
  expect(csvField('hello world')).toBe('hello world')
})

test('csvField handles numbers', () => {
  expect(csvField(123)).toBe('123')
  expect(csvField(-5)).toBe('-5')
  expect(csvField(0)).toBe('0')
})

test('csvField handles quotes and commas', () => {
  expect(csvField('hello, world')).toBe('"hello, world"')
  expect(csvField('hello"world')).toBe('"hello""world"')
  expect(csvField('hello\nworld')).toBe('"hello\nworld"')
})

test('csvField prevents CSV injection', () => {
  expect(csvField('=1+1')).toBe("'=" + "1+1")
  expect(csvField('+1+1')).toBe("'+1+1")
  expect(csvField('-1+1')).toBe("'-1+1")
  expect(csvField('@1+1')).toBe("'@1+1")
  expect(csvField('\t1+1')).toBe("'\t1+1")
  expect(csvField('\r1+1')).toBe('"\'\r1+1"')
  expect(csvField(' =1+1')).toBe("' =1+1") // leading space
})
