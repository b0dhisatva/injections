import { describe, expect, it } from 'vitest'
import { escapeCsv, formatAmount, relativeDays, toLocalDateTimeInput } from './format.js'

describe('format helpers', () => {
  it('escapes quotes for a CSV export', () => {
    expect(escapeCsv('note "with quote"')).toBe('"note ""with quote"""')
  })

  it('formats decimal quantities without unnecessary zeroes', () => {
    expect(formatAmount('12.5000')).toBe('12.5')
  })

  it('creates a value accepted by datetime-local inputs', () => {
    expect(toLocalDateTimeInput(new Date('2026-08-12T15:30:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it('returns no day count when a site was never used', () => {
    expect(relativeDays(null)).toBeNull()
  })

  it('counts yesterday even when only two minutes have elapsed', () => {
    expect(relativeDays(new Date(2026, 8, 5, 23, 59), new Date(2026, 8, 6, 0, 1))).toBe(1)
  })

  it('counts calendar boundaries across months and years', () => {
    expect(relativeDays(new Date(2025, 11, 31, 23), new Date(2026, 0, 2, 1))).toBe(2)
  })

  it('keeps today at zero and invalid dates out of day counts', () => {
    expect(relativeDays(new Date(2026, 8, 6, 1), new Date(2026, 8, 6, 23))).toBe(0)
    expect(relativeDays('invalid')).toBeNull()
  })

  it('counts calendar days over spring and autumn DST transitions', () => {
    expect(relativeDays(new Date(2026, 2, 7, 12), new Date(2026, 2, 8, 12))).toBe(1)
    expect(relativeDays(new Date(2026, 9, 31, 0, 30), new Date(2026, 10, 1, 23, 30))).toBe(1)
  })
})
