import { describe, expect, it } from 'vitest'

import { resolveSessionDateRange } from './session-date-range'

const TODAY = new Date(2026, 7, 17, 12, 0, 0)

describe('resolveSessionDateRange', () => {
  it('keeps a valid inclusive range unchanged', () => {
    expect(resolveSessionDateRange('2026-07-19', '2026-08-17', TODAY)).toEqual({
      from: '2026-07-19',
      to: '2026-08-17',
      fromDate: new Date(2026, 6, 19),
      toDate: new Date(2026, 7, 17),
      usedFallback: false,
    })
  })

  it.each([
    { from: null, to: null },
    { from: 'not-a-date', to: '2026-08-17' },
    { from: '2026-02-30', to: '2026-08-17' },
    { from: '2026-08-18', to: '2026-08-17' },
    { from: '2026-08-11', to: null },
  ])('fails closed to the same seven-day query range for $from to $to', ({ from, to }) => {
    expect(resolveSessionDateRange(from, to, TODAY)).toEqual({
      from: '2026-08-11',
      to: '2026-08-17',
      fromDate: new Date(2026, 7, 11),
      toDate: new Date(2026, 7, 17),
      usedFallback: true,
    })
  })
})
