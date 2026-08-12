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
})
