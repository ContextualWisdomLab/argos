import { describe, expect, it } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it.each([
    ['=1+1', "'=1+1"],
    ['+cmd', "'+cmd"],
    ['-1+2', "'-1+2"],
    ['@SUM(A1:A2)', "'@SUM(A1:A2)"],
    [' =1+1', "' =1+1"],
    ['\t=1+1', "'\t=1+1"],
    ['\r=1+1', '"\'\r=1+1"'],
    ['\n=1+1', '"\'\n=1+1"'],
    ['\0=1+1', "'\0=1+1"],
    ['＝1+1', "'＝1+1"],
    ['＋cmd', "'＋cmd"],
    ['－1+2', "'－1+2"],
    ['＠SUM(A1:A2)', "'＠SUM(A1:A2)"],
  ])('neutralizes formula-like text while preserving the original payload: %j', (input, expected) => {
    expect(csvField(input)).toBe(expected)
  })

  it.each([
    ['plain text', 'plain text'],
    ['안녕하세요', '안녕하세요'],
    ['safe,comma', '"safe,comma"'],
    ['safe "quote"', '"safe ""quote"""'],
    ['safe\nline', '"safe\nline"'],
  ])('keeps existing CSV quoting semantics for benign text: %j', (input, expected) => {
    expect(csvField(input)).toBe(expected)
  })

  it('keeps numeric and empty-value serialization byte-compatible', () => {
    expect(csvField(42)).toBe('42')
    expect(csvField(0)).toBe('0')
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })
})
