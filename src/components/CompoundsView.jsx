import { useState } from 'react'
import { Archive, Beaker, Check, Plus, RotateCcw } from 'lucide-react'
import { COMPOUND_COLORS, UNITS } from '../lib/constants.js'
import { formatShortDate } from '../lib/format.js'
import EmptyState from './EmptyState.jsx'

export default function CompoundsView({ compounds, injections, onAdd, onToggle, focusForm = false }) {
  const [showForm, setShowForm] = useState(focusForm || !compounds.length)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('mg')
  const [color, setColor] = useState(COMPOUND_COLORS[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const result = await onAdd({ name: name.trim(), default_unit: unit, color })
    if (result?.error) setError(result.error)
    else { setName(''); setShowForm(false) }
    setBusy(false)
  }

  const usageFor = (id) => {
    const entries = injections.filter((entry) => entry.injection_items?.some((item) => item.compound_id === id))
    return { count: entries.length, lastUsed: entries[0]?.injected_at }
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">Your library</span><h1>Compounds</h1><p>Save a name and default unit for faster logging.</p></div><button className="button primary" onClick={() => setShowForm((value) => !value)}>{showForm ? 'Close form' : <><Plus size={18} />Add compound</>}</button></header>
      {showForm && (
        <form className="panel compound-form" onSubmit={submit}>
          <div className="form-section-title"><span><Beaker size={18} /></span><div><h2>Add a compound</h2><p>This is a label only—SiteTrack never suggests a quantity.</p></div></div>
          <div className="compound-form-fields">
            <label>Name<input value={name} onChange={(e) => setName(e.target.value)} maxLength="80" placeholder="Compound name" autoFocus required /></label>
            <label>Default unit<select value={unit} onChange={(e) => setUnit(e.target.value)}>{UNITS.map((option) => <option key={option}>{option}</option>)}</select></label>
            <fieldset><legend>Color</legend><div className="color-picker">{COMPOUND_COLORS.map((option) => <button type="button" key={option} className={color === option ? 'selected' : ''} style={{ '--swatch': option }} onClick={() => setColor(option)} aria-label={`Select color ${option}`}>{color === option && <Check size={14} />}</button>)}</div></fieldset>
            <button className="button primary compound-submit" disabled={busy}>{busy ? 'Saving…' : 'Save compound'}</button>
          </div>
          {error && <div className="form-alert error" role="alert">{error}</div>}
        </form>
      )}
      <section className="panel compound-list-panel">
        <div className="section-heading"><div><div><h2>Saved compounds</h2><p>{compounds.filter((item) => item.active).length} active</p></div></div></div>
        {compounds.length ? <div className="compound-list">{compounds.map((compound) => {
          const usage = usageFor(compound.id)
          return <article className={`compound-card ${compound.active ? '' : 'archived'}`} key={compound.id}>
            <span className="compound-swatch" style={{ background: compound.color }} />
            <div><strong>{compound.name}</strong><p>Default: {compound.default_unit} · {usage.count ? `${usage.count} ${usage.count === 1 ? 'entry' : 'entries'}` : 'Not used yet'}{usage.lastUsed ? ` · Last ${formatShortDate(usage.lastUsed)}` : ''}</p></div>
            <span className="status-chip">{compound.active ? 'Active' : 'Archived'}</span>
            <button className="icon-button" onClick={() => onToggle(compound)} title={compound.active ? 'Archive compound' : 'Restore compound'} aria-label={`${compound.active ? 'Archive' : 'Restore'} ${compound.name}`}>{compound.active ? <Archive size={18} /> : <RotateCcw size={18} />}</button>
          </article>
        })}</div> : <EmptyState icon={Beaker} title="No compounds saved" description="Add your first compound to make logging faster." />}
      </section>
    </div>
  )
}
