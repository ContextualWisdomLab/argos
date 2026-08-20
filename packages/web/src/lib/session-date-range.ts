import { differenceInCalendarDays, format, isValid, parse, subDays } from 'date-fns'

export const SESSION_DATE_PARAM_FORMAT = 'yyyy-MM-dd'

export interface SessionDateRange {
  from: string
  to: string
  fromDate: Date
  toDate: Date
  usedFallback: boolean
}

function parseCalendarDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const parsed = parse(value, SESSION_DATE_PARAM_FORMAT, new Date(2000, 0, 1))
  if (!isValid(parsed) || format(parsed, SESSION_DATE_PARAM_FORMAT) !== value) return null
  return parsed
}

/**
 * Resolve URL date bounds to one exact, buyer-visible session query interval.
 *
 * Missing, malformed, impossible, or reversed bounds fail closed to the same
 * inclusive seven-calendar-day interval used by the date-range picker.
 */
export function resolveSessionDateRange(
  requestedFrom: string | null,
  requestedTo: string | null,
  today: Date = new Date(),
): SessionDateRange {
  const requestedFromDate = parseCalendarDate(requestedFrom)
  const requestedToDate = parseCalendarDate(requestedTo)
  const hasValidRequestedRange =
    requestedFromDate !== null &&
    requestedToDate !== null &&
    differenceInCalendarDays(requestedToDate, requestedFromDate) >= 0

  if (hasValidRequestedRange) {
    return {
      from: format(requestedFromDate, SESSION_DATE_PARAM_FORMAT),
      to: format(requestedToDate, SESSION_DATE_PARAM_FORMAT),
      fromDate: requestedFromDate,
      toDate: requestedToDate,
      usedFallback: false,
    }
  }

  const fallbackFromDate = subDays(today, 6)
  return {
    from: format(fallbackFromDate, SESSION_DATE_PARAM_FORMAT),
    to: format(today, SESSION_DATE_PARAM_FORMAT),
    fromDate: fallbackFromDate,
    toDate: today,
    usedFallback: true,
  }
}
