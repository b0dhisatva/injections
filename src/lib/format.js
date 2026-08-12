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

export function relativeDays(value) {
  if (!value) return null
  const elapsed = Date.now() - new Date(value).getTime()
  return Math.max(0, Math.floor(elapsed / 86_400_000))
}

export function formatAmount(value) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 })
}

export function escapeCsv(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}
