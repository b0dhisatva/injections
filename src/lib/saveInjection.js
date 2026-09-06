// One request saves the parent and doses in the same database transaction.
// Keep the same id when retrying after a lost response to avoid duplicates.
export async function persistInjection(client, values) {
  const controller = new AbortController()
  let timer
  try {
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort()
        reject(new Error('The save could not be confirmed. Check your connection and retry this entry.'))
      }, 20_000)
    })
    const { data, error } = await Promise.race([
      client.rpc('save_injection', {
        p_id: values.id,
        p_injected_at: values.injected_at,
        p_route: values.route,
        p_site: values.site,
        p_notes: values.notes,
        p_doses: values.doses,
      }).abortSignal(controller.signal),
      timeout,
    ])
    if (error) return { error: `${error.message} Your entry is still here; retry to confirm it was saved.` }
    if (data !== values.id) throw new Error('The save could not be confirmed. Retry this entry.')
    return { data: { id: data } }
  } catch (error) {
    return { error: error.message || 'The save could not be confirmed. Check your connection and retry this entry.' }
  } finally {
    clearTimeout(timer)
  }
}
