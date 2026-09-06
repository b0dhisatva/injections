export function toLocalDateTimeInput(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatShortDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value))
}

export function relativeDays(value, now = new Date()) {
  if (!value) return null
  // Compare local calendar dates, not elapsed hours. DST days can be 23 or 25 hours.
  const calendarDay = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const elapsed = calendarDay(new Date(now)) - calendarDay(new Date(value))
  return Number.isFinite(elapsed) ? Math.max(0, Math.round(elapsed / 86_400_000)) : null
}

export function formatAmount(value) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 })
}

export function escapeCsv(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}
