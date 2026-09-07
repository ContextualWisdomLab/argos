interface TimestampedUsageRecord {
  readonly timestamp: string
}

/**
 * Return distinct UTC-midnight dates that precede the current UTC day.
 *
 * The first occurrence of each UTC day defines output order. Invalid timestamps,
 * the current UTC day, and future UTC days are ignored so callers never pass an
 * invalid `Date` to Prisma while invalidating historical rollup rows.
 */
export function collectPastUtcDates(
  usageRecords: readonly TimestampedUsageRecord[],
  now: Date = new Date(),
): Date[] {
  const todayMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )
  const pastDayMilliseconds = new Set<number>()

  for (const usageRecord of usageRecords) {
    const timestamp = new Date(usageRecord.timestamp)
    if (!Number.isFinite(timestamp.getTime())) continue

    const dayMs = Date.UTC(
      timestamp.getUTCFullYear(),
      timestamp.getUTCMonth(),
      timestamp.getUTCDate(),
    )
    if (dayMs < todayMs) pastDayMilliseconds.add(dayMs)
  }

  return Array.from(pastDayMilliseconds, (dayMs) => new Date(dayMs))
}
