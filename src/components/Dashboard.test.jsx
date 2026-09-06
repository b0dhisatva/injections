// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import Dashboard from './Dashboard.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

it('refreshes the grid after midnight and when a phone resumes', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 8, 5, 23, 59, 50))
  const container = document.createElement('div')
  const root = createRoot(container)
  try {
    await act(() => root.render(<Dashboard compounds={[]} injections={[{
      id: 'example', site: 'left_deltoid', injected_at: new Date(2026, 8, 5, 23).toISOString(), injection_items: [],
    }]} />))
    const gridText = () => container.querySelector('.site-grid').textContent
    expect(gridText()).toContain('Today')
    await act(() => vi.advanceTimersByTime(30_000))
    expect(gridText()).toContain('1d ago')
    expect(gridText()).not.toContain('Today')
    vi.setSystemTime(new Date(2026, 8, 7, 8))
    await act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(gridText()).toContain('2d ago')
  } finally {
    await act(() => root.unmount())
    vi.useRealTimers()
  }
})
