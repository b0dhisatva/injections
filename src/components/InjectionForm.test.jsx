// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import InjectionForm from './InjectionForm.jsx'
import { toLocalDateTimeInput } from '../lib/format.js'

let root, container
globalThis.IS_REACT_ACT_ENVIRONMENT = true
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-01T12:00:00Z'))
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})
afterEach(async () => {
  await act(() => root.unmount())
  container.remove()
  vi.useRealTimers()
})
async function render(onSave = vi.fn()) {
  await act(() => root.render(<InjectionForm compounds={[{ id: 'compound', active: true, name: 'Example', default_unit: 'mg' }]} onSave={onSave} />))
}
async function fill(input, value) {
  await act(() => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
it('updates an untouched date when a phone resumes on the following day', async () => {
  await render()
  vi.setSystemTime(new Date('2026-09-02T12:00:00Z'))
  await act(() => document.dispatchEvent(new Event('visibilitychange')))
  expect(container.querySelector('[type="datetime-local"]').value).toBe(toLocalDateTimeInput())
})
it('preserves an intentionally backdated entry when the phone resumes', async () => {
  await render()
  await fill(container.querySelector('[type="datetime-local"]'), '2026-08-28T08:00')
  vi.setSystemTime(new Date('2026-09-02T12:00:00Z'))
  await act(() => window.dispatchEvent(new Event('focus')))
  expect(container.querySelector('[type="datetime-local"]').value).toBe('2026-08-28T08:00')
})
it('releases saving after a failure and retries with the original id and date', async () => {
  const onSave = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValue({ error: 'Retry' })
  await render(onSave)
  await act(() => container.querySelector('.site-picker button').click())
  await fill(container.querySelector('[type="number"]'), '1')
  await act(() => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  expect(container.querySelector('[role="alert"]').textContent).toContain('could not be confirmed')
  expect(container.querySelector('.form-actions .primary').disabled).toBe(false)
  vi.setSystemTime(new Date('2026-09-02T12:00:00Z'))
  await act(() => window.dispatchEvent(new Event('focus')))
  await act(() => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  expect(onSave.mock.calls[1][0]).toEqual(onSave.mock.calls[0][0])
})
