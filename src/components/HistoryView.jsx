import { useMemo, useState } from 'react'
import { Download, Filter, History, Plus, Search } from 'lucide-react'
import EntryCard from './EntryCard.jsx'
import EmptyState from './EmptyState.jsx'
import { escapeCsv } from '../lib/format.js'
import { routeLabel, siteLabel } from '../lib/constants.js'

export default function HistoryView({ injections, compounds, onDelete, onNavigate }) {
  const [query, setQuery] = useState('')
  const [compoundId, setCompoundId] = useState('all')
  const [range, setRange] = useState('all')

  const filtered = useMemo(() => injections.filter((entry) => {
    const itemText = entry.injection_items?.map((item) => item.compound?.name ?? '').join(' ') ?? ''
    const matchesQuery = !query || `${siteLabel(entry.site)} ${entry.notes ?? ''} ${itemText}`.toLowerCase().includes(query.toLowerCase())
    const matchesCompound = compoundId === 'all' || entry.injection_items?.some((item) => item.compound_id === compoundId)
    const cutoff = range === 'all' ? 0 : Date.now() - Number(range) * 86_400_000
    return matchesQuery && matchesCompound && new Date(entry.injected_at).getTime() >= cutoff
  }), [injections, query, compoundId, range])

  function exportCsv() {
    const rows = [['date_time', 'site', 'route', 'compound', 'quantity', 'unit', 'notes']]
    filtered.forEach((entry) => (entry.injection_items ?? []).forEach((item) => rows.push([
      entry.injected_at,
      siteLabel(entry.site),
      routeLabel(entry.route),
      item.compound?.name ?? '',
      item.amount,
      item.unit,
      entry.notes ?? '',
    ])))
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `sitetrack-export-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">Your records</span><h1>Injection history</h1><p>Search, filter, or export your private log.</p></div><button className="button primary" onClick={() => onNavigate('log')}><Plus size={18} />Log injection</button></header>
      <section className="panel filter-panel">
        <label className="search-field"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search site, compound, or note" aria-label="Search history" /></label>
        <label className="select-with-icon"><Filter size={17} /><select value={compoundId} onChange={(e) => setCompoundId(e.target.value)} aria-label="Filter by compound"><option value="all">All compounds</option>{compounds.map((compound) => <option key={compound.id} value={compound.id}>{compound.name}</option>)}</select></label>
        <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Filter by date"><option value="all">All time</option><option value="30">Past 30 days</option><option value="90">Past 90 days</option></select>
        <button className="button ghost export-button" onClick={exportCsv} disabled={!filtered.length}><Download size={17} />Export CSV</button>
      </section>
      <section className="panel history-panel">
        <div className="section-heading"><div><div><h2>{filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}</h2><p>{filtered.length === injections.length ? 'All recorded injections' : `Filtered from ${injections.length} total`}</p></div></div></div>
        {filtered.length ? <div className="entry-list roomy">{filtered.map((entry) => <EntryCard key={entry.id} entry={entry} onDelete={onDelete} />)}</div> : <EmptyState icon={History} title={injections.length ? 'No matching entries' : 'No history yet'} description={injections.length ? 'Try clearing or changing the filters.' : 'Log your first injection to start your history.'} action={!injections.length && <button className="button secondary" onClick={() => onNavigate('log')}>Log an entry</button>} />}
      </section>
    </div>
  )
}
