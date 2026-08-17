import { describe, expect, it } from 'vitest'
import { collectPastUtcDates } from './usage-date-buckets'

describe('collectPastUtcDates', () => {
  const now = new Date('2026-03-01T12:00:00.000Z')

  it('deduplicates past UTC days while preserving first-seen order', () => {
    const dates = collectPastUtcDates(
      [
        { timestamp: '2026-02-28T23:59:59.000Z' },
        { timestamp: '2026-02-27T04:00:00.000Z' },
        { timestamp: '2026-02-28T00:00:00.000Z' },
      ],
      now,
    )

    expect(dates.map((date) => date.toISOString())).toEqual([
      '2026-02-28T00:00:00.000Z',
      '2026-02-27T00:00:00.000Z',
    ])
  })

  it('excludes the current UTC day and future UTC days', () => {
    const dates = collectPastUtcDates(
      [
        { timestamp: '2026-03-01T00:00:00.000Z' },
        { timestamp: '2026-03-01T23:59:59.999Z' },
        { timestamp: '2026-03-02T00:00:00.000Z' },
      ],
      now,
    )

    expect(dates).toEqual([])
  })

  it('uses the represented instant rather than the source timezone calendar day', () => {
    const dates = collectPastUtcDates(
      [
        { timestamp: '2026-02-28T23:30:00-05:00' },
        { timestamp: '2026-02-28T23:30:00+09:00' },
      ],
      now,
    )

    expect(dates.map((date) => date.toISOString())).toEqual([
      '2026-02-28T00:00:00.000Z',
    ])
  })

  it('ignores invalid timestamps without producing invalid Date objects', () => {
    const dates = collectPastUtcDates(
      [
        { timestamp: 'not-a-date' },
        { timestamp: '' },
        { timestamp: '2024-02-29T10:00:00.000Z' },
      ],
      now,
    )

    expect(dates.map((date) => date.toISOString())).toEqual([
      '2024-02-29T00:00:00.000Z',
    ])
  })
})
