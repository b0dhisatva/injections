import { afterEach, describe, expect, it, vi } from 'vitest'
import { persistInjection } from './saveInjection.js'

const values = { id: 'request-id', injected_at: '2026-09-02T14:00:00.000Z', route: 'other', site: 'other', notes: null, doses: [{ compound_id: 'compound-id', amount: 1, unit: 'mg' }] }
function clientFor(result) {
  return { rpc: vi.fn(() => ({ abortSignal: vi.fn(() => result) })) }
}
afterEach(() => vi.useRealTimers())
describe('saving an injection', () => {
  it('uses one atomic call with the same id and timestamp on retry', async () => {
    const client = clientFor(Promise.resolve({ data: values.id, error: null }))
    expect(await persistInjection(client, values)).toEqual({ data: { id: values.id } })
    await persistInjection(client, values)
    expect(client.rpc.mock.calls[0]).toEqual(client.rpc.mock.calls[1])
    expect(client.rpc.mock.calls[0]).toEqual(['save_injection', { p_id: values.id, p_injected_at: values.injected_at, p_route: values.route, p_site: values.site, p_notes: null, p_doses: values.doses }])
  })
  it('surfaces database failures instead of announcing a save', async () => {
    const result = await persistInjection(clientFor({ error: { message: 'Not signed in' } }), values)
    expect(result.error).toContain('Not signed in')
    expect(result.data).toBeUndefined()
  })
  it('handles a rejected connection', async () => {
    expect((await persistInjection(clientFor(Promise.reject(new Error('Offline'))), values)).error).toBe('Offline')
  })
  it('ends a stalled request even when the underlying client never settles', async () => {
    vi.useFakeTimers()
    const request = persistInjection(clientFor(new Promise(() => {})), values)
    await vi.advanceTimersByTimeAsync(20_000)
    expect((await request).error).toContain('could not be confirmed')
  })
  it('rejects an unexpected acknowledgement', async () => {
    expect((await persistInjection(clientFor({ data: null }), values)).error).toContain('could not be confirmed')
  })
})
