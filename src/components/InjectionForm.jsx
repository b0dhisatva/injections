import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Beaker, CalendarClock, Check, MapPin, Plus, Trash2 } from 'lucide-react'
import { ROUTES, SITES, UNITS } from '../lib/constants.js'
import { formatDateTime, toLocalDateTimeInput } from '../lib/format.js'

function emptyDose(compounds) {
  const compound = compounds.find((item) => item.active)
  return { compound_id: compound?.id ?? '', amount: '', unit: compound?.default_unit ?? 'mg' }
}

export default function InjectionForm({ compounds, onSave, onCancel, onAddCompound }) {
  const activeCompounds = useMemo(() => compounds.filter((item) => item.active), [compounds])
  const [injectedAt, setInjectedAt] = useState(toLocalDateTimeInput)
  const [dateEdited, setDateEdited] = useState(false)
  const requestId = useRef(null)
  const submitting = useRef(false)
  const [route, setRoute] = useState('intramuscular')
  const [site, setSite] = useState('')
  const [notes, setNotes] = useState('')
  const [doses, setDoses] = useState([emptyDose(compounds)])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const refreshDate = () => {
      if (!dateEdited && !submitting.current && !requestId.current) setInjectedAt(toLocalDateTimeInput())
    }
    const timer = window.setInterval(refreshDate, 30_000)
    window.addEventListener('focus', refreshDate)
    document.addEventListener('visibilitychange', refreshDate)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshDate)
      document.removeEventListener('visibilitychange', refreshDate)
    }
  }, [dateEdited])

  function updateDose(index, field, value) {
    setDoses((current) => current.map((dose, doseIndex) => {
      if (doseIndex !== index) return dose
      if (field === 'compound_id') {
        const compound = compounds.find((item) => item.id === value)
        return { ...dose, compound_id: value, unit: compound?.default_unit ?? dose.unit }
      }
      return { ...dose, [field]: value }
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    setError('')
    if (!site) return setError('Choose an injection site.')
    if (!doses.length || doses.some((dose) => !dose.compound_id || !dose.amount || Number(dose.amount) <= 0)) return setError('Choose a compound and enter a quantity greater than zero for every row.')
    if (new Set(doses.map((dose) => dose.compound_id)).size !== doses.length) return setError('Each compound can appear only once in an injection. Combine duplicate quantities into one row.')
    const date = new Date(injectedAt)
    if (!Number.isFinite(date.getTime()) || toLocalDateTimeInput(date) !== injectedAt) return setError('Choose a valid local date and time.')
    submitting.current = true
    setBusy(true)
    try {
      requestId.current ??= crypto.randomUUID()
      const result = await onSave({ id: requestId.current, injected_at: date.toISOString(), route, site, notes: notes.trim() || null, doses: doses.map((dose) => ({ ...dose, amount: Number(dose.amount) })) })
      if (result?.error) setError(result.error)
    } catch {
      setError('The save could not be confirmed. Check your connection and retry this entry.')
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return (
    <div className="page-stack form-page">
      <header className="page-heading form-heading"><button className="icon-button back-button" onClick={onCancel} aria-label="Back"><ArrowLeft size={20} /></button><div><span className="eyebrow">New entry</span><h1>Log an injection</h1><p>Capture the site and each compound quantity.</p></div></header>
      <form className="log-form" onSubmit={handleSubmit}>
        <section className="panel form-section">
          <div className="form-section-title"><span><CalendarClock size={18} /></span><div><h2>When & route</h2><p>Use the actual date and time if adding this later.</p></div></div>
          <div className="field-grid two">
            <label>Date and time<input type="datetime-local" value={injectedAt} onChange={(e) => { setDateEdited(true); setInjectedAt(e.target.value) }} required disabled={busy} /></label>
            <label>Route<select value={route} onChange={(e) => setRoute(e.target.value)}>{ROUTES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>
          <p>{injectedAt && Number.isFinite(new Date(injectedAt).getTime()) ? `Entry date: ${formatDateTime(injectedAt)} (your device’s local time)` : 'Choose the date and time of the injection.'}</p>
        </section>
        <section className="panel form-section">
          <div className="form-section-title"><span><MapPin size={18} /></span><div><h2>Injection site</h2><p>Select the exact side used.</p></div></div>
          <div className="site-picker">
            {SITES.map((option) => <button type="button" className={site === option.key ? 'selected' : ''} key={option.key} onClick={() => setSite(option.key)}><span>{option.label}</span>{site === option.key && <Check size={16} />}</button>)}
          </div>
        </section>
        <section className="panel form-section">
          <div className="form-section-title"><span><Beaker size={18} /></span><div><h2>Compounds & quantities</h2><p>Add one row for every compound in this injection.</p></div></div>
          {activeCompounds.length ? (
            <div className="dose-rows">
              {doses.map((dose, index) => (
                <div className="dose-row" key={index}>
                  <label>Compound<select value={dose.compound_id} onChange={(e) => updateDose(index, 'compound_id', e.target.value)} required><option value="">Choose…</option>{activeCompounds.map((compound) => <option key={compound.id} value={compound.id}>{compound.name}</option>)}</select></label>
                  <label>Quantity<input type="number" min="0.0001" step="any" inputMode="decimal" value={dose.amount} onChange={(e) => updateDose(index, 'amount', e.target.value)} placeholder="0" required /></label>
                  <label>Unit<select value={dose.unit} onChange={(e) => updateDose(index, 'unit', e.target.value)}>{UNITS.map((unit) => <option key={unit}>{unit}</option>)}</select></label>
                  {doses.length > 1 && <button type="button" className="icon-button remove-dose" onClick={() => setDoses((current) => current.filter((_, doseIndex) => doseIndex !== index))} aria-label="Remove compound row"><Trash2 size={17} /></button>}
                </div>
              ))}
              <button type="button" className="text-link add-row" onClick={() => setDoses((current) => [...current, emptyDose(compounds)])}><Plus size={16} />Add another compound</button>
            </div>
          ) : (
            <div className="inline-empty"><p>Add your first compound before logging an injection.</p><button type="button" className="button secondary" onClick={onAddCompound}>Add compound</button></div>
          )}
        </section>
        <section className="panel form-section">
          <label>Notes <span className="optional">Optional</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength="500" rows="3" placeholder="Anything you want to remember…" /></label>
        </section>
        {error && <div className="form-alert error" role="alert">{error}</div>}
        <div className="form-actions"><button type="button" className="button ghost" onClick={onCancel}>Cancel</button><button className="button primary" disabled={busy || !activeCompounds.length}>{busy ? 'Saving…' : 'Save entry'}<Check size={17} /></button></div>
      </form>
    </div>
  )
}
