'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { differenceInCalendarDays, format, isValid, parse, subDays } from 'date-fns'
import React, { Suspense, useId } from 'react'
import { cn } from '@/lib/utils'

const DATE_PARAM_FORMAT = 'yyyy-MM-dd'
const PRESETS = [
  { days: 7, label: '7d', description: 'Last 7 days' },
  { days: 30, label: '30d', description: 'Last 30 days' },
  { days: 90, label: '90d', description: 'Last 90 days' },
  { days: 3650, label: 'ALL', description: 'Last 3,650 days' },
] as const

function parseCalendarDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const parsed = parse(value, DATE_PARAM_FORMAT, new Date(2000, 0, 1))
  if (!isValid(parsed) || format(parsed, DATE_PARAM_FORMAT) !== value) return null
  return parsed
}

function DateRangePickerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const descriptionPrefix = useId()

  const currentFrom = searchParams.get('from')
  const currentTo = searchParams.get('to')

  const today = new Date()
  const defaultFromDate = subDays(today, 6)
  const requestedFromDate = parseCalendarDate(currentFrom)
  const requestedToDate = parseCalendarDate(currentTo)
  const hasValidRequestedRange =
    requestedFromDate !== null &&
    requestedToDate !== null &&
    differenceInCalendarDays(requestedToDate, requestedFromDate) >= 0

  const fromDate = hasValidRequestedRange ? requestedFromDate : defaultFromDate
  const toDate = hasValidRequestedRange ? requestedToDate : today
  const daysDiff = differenceInCalendarDays(toDate, fromDate)

  const isToday = format(toDate, DATE_PARAM_FORMAT) === format(today, DATE_PARAM_FORMAT)
  const activePreset = isToday
    ? daysDiff === 6
      ? 7
      : daysDiff === 29
        ? 30
        : daysDiff === 89
          ? 90
          : daysDiff === 3649
            ? 3650
            : null
    : null

  const handlePreset = (days: number) => {
    const to = format(today, DATE_PARAM_FORMAT)
    const from = format(subDays(today, days - 1), DATE_PARAM_FORMAT)

    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('from', from)
    newParams.set('to', to)
    // 페이지네이션 사용 중인 화면에서 날짜가 바뀌면 첫 페이지로 리셋
    newParams.delete('page')

    router.push(`?${newParams.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div
        className="inline-flex rounded-lg bg-card ring-1 ring-border p-0.5"
        role="group"
        aria-label="Date range presets"
      >
        {PRESETS.map((preset) => {
          const descriptionId = `${descriptionPrefix}-${preset.days}-description`
          return (
            <React.Fragment key={preset.days}>
              <button
                type="button"
                aria-pressed={activePreset === preset.days}
                aria-describedby={descriptionId}
                onClick={() => handlePreset(preset.days)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activePreset === preset.days
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                {preset.label}
              </button>
              <span id={descriptionId} className="sr-only">
                {preset.description}
              </span>
            </React.Fragment>
          )
        })}
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {format(fromDate, 'MMM d')} ~ {format(toDate, 'MMM d')}
      </span>
    </div>
  )
}

export function DateRangePicker() {
  return (
    <Suspense
      fallback={
        <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
      }
    >
      <DateRangePickerContent />
    </Suspense>
  )
}
