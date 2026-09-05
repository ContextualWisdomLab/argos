import { expect, test } from 'vitest'
import { csvField } from './csv-field'

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

test('csvField handles quotes and delimiters without opening a new cell', () => {
  expect(csvField('hello, world')).toBe('"hello, world"')
  expect(csvField('hello"world')).toBe('"hello""world"')
  expect(csvField('hello\nworld')).toBe('"hello\nworld"')
  expect(csvField('safe",=1+1')).toBe('"safe"",=1+1"')
})

test('csvField neutralizes spreadsheet formula prefixes', () => {
  expect(csvField('=1+1')).toBe("'=1+1")
  expect(csvField('+1+1')).toBe("'+1+1")
  expect(csvField('-1+1')).toBe("'-1+1")
  expect(csvField('@1+1')).toBe("'@1+1")
  expect(csvField('\t1+1')).toBe("'\t1+1")
  expect(csvField('\r1+1')).toBe('"\'\r1+1"')
  expect(csvField('\n=1+1')).toBe('"\'\n=1+1"')
  expect(csvField(' =1+1')).toBe("' =1+1")
  expect(csvField('\uFEFF=1+1')).toBe("'\uFEFF=1+1")
  expect(csvField('＝1+1')).toBe("'＝1+1")
  expect(csvField('＋1+1')).toBe("'＋1+1")
  expect(csvField('－1+1')).toBe("'－1+1")
  expect(csvField('＠1+1')).toBe("'＠1+1")
})
