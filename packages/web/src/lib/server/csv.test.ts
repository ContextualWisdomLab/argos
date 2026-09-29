import { describe, it, expect } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('handles numbers', () => {
    expect(csvField(0)).toBe('0')
    expect(csvField(-123.45)).toBe('-123.45')
  })

  it('prevents CSV injection', () => {
    expect(csvField('=CMD()')).toBe("'=CMD()")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1-2')).toBe("'-1-2")
    expect(csvField('@SUM()')).toBe("'@SUM()")
    expect(csvField('\tCMD()')).toBe("'\tCMD()")
    expect(csvField('\rCMD()')).toBe("\"'\rCMD()\"") // \r requires quoting in CSV output in this fn
    expect(csvField('\nCMD()')).toBe("\"'\nCMD()\"") // \n requires quoting in CSV output in this fn
    expect(csvField('  =CMD()')).toBe("'  =CMD()")
  })
})
