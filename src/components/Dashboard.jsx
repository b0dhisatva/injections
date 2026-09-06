import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, MapPin, Plus, RotateCw, Syringe } from 'lucide-react'
import { SITES, siteLabel } from '../lib/constants.js'
import { formatShortDate, relativeDays } from '../lib/format.js'
import EntryCard from './EntryCard.jsx'
import EmptyState from './EmptyState.jsx'

function rotationStatus(days) {
  if (days === null) return { label: 'Not used', tone: 'fresh' }
  if (days < 3) return { label: days === 0 ? 'Today' : `${days}d ago`, tone: 'recent' }
  if (days < 7) return { label: `${days}d ago`, tone: 'resting' }
  return { label: `${days}d ago`, tone: 'fresh' }
}

export default function Dashboard({ injections, compounds, onNavigate }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const refreshClock = () => setNow(Date.now())
    const timer = window.setInterval(refreshClock, 30_000)
    window.addEventListener('focus', refreshClock)
    document.addEventListener('visibilitychange', refreshClock)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshClock)
      document.removeEventListener('visibilitychange', refreshClock)
    }
  }, [])
  const sevenDaysAgo = now - 7 * 86_400_000
  const monthAgo = now - 30 * 86_400_000
  const recentCount = injections.filter((entry) => new Date(entry.injected_at).getTime() >= sevenDaysAgo).length
  const activeCompounds = new Set(
    injections
      .filter((entry) => new Date(entry.injected_at).getTime() >= monthAgo)
      .flatMap((entry) => entry.injection_items?.map((item) => item.compound_id) ?? []),
  ).size
  const lastSite = injections[0]

  const siteUsage = SITES.filter((site) => site.key !== 'other').map((site) => {
    const uses = injections.filter((entry) => entry.site === site.key)
    const lastUsed = uses[0]?.injected_at ?? null
    return { ...site, lastUsed, days: relativeDays(lastUsed, now), count: uses.filter((entry) => new Date(entry.injected_at).getTime() >= monthAgo).length }
  }).sort((a, b) => (b.days ?? 99999) - (a.days ?? 99999))

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page-stack">
      <header className="page-heading dashboard-heading">
        <div><span className="eyebrow">{greeting}</span><h1>Your rotation at a glance</h1><p>Stay consistent and give recently used sites time to rest.</p></div>
        <button className="button primary" onClick={() => onNavigate('log')}><Plus size={18} />Log injection</button>
      </header>

      <section className="stat-grid" aria-label="Summary">
        <article className="stat-card"><span className="stat-icon coral"><Syringe size={20} /></span><div><small>Past 7 days</small><strong>{recentCount}</strong><p>{recentCount === 1 ? 'injection logged' : 'injections logged'}</p></div></article>
        <article className="stat-card"><span className="stat-icon teal"><MapPin size={20} /></span><div><small>Last site</small><strong className="stat-text">{lastSite ? siteLabel(lastSite.site) : '—'}</strong><p>{lastSite ? formatShortDate(lastSite.injected_at) : 'No entries yet'}</p></div></article>
        <article className="stat-card"><span className="stat-icon gold"><CalendarDays size={20} /></span><div><small>Past 30 days</small><strong>{activeCompounds}</strong><p>{activeCompounds === 1 ? 'compound used' : 'compounds used'}</p></div></article>
      </section>

      <section className="panel rotation-panel">
        <div className="section-heading"><div><span className="section-icon"><RotateCw size={17} /></span><div><h2>Site rotation</h2><p>Ordered by longest time since use</p></div></div><span className="legend"><i className="fresh" />Ready <i className="recent" />Recent</span></div>
        {injections.length === 0 ? (
          <EmptyState icon={MapPin} title="Your rotation will appear here" description="Log an injection to begin tracking when each site was last used." action={<button className="button secondary" onClick={() => onNavigate('log')}>Log your first entry</button>} />
        ) : (
          <div className="site-grid">
            {siteUsage.map((site) => {
              const status = rotationStatus(site.days)
              return <div className={`site-card ${status.tone}`} key={site.key}><div><strong>{site.short}</strong><small>{site.group}</small></div><span>{status.label}</span><p>{site.count ? `${site.count} use${site.count === 1 ? '' : 's'} in 30d` : 'No use in 30d'}</p></div>
            })}
          </div>
        )}
      </section>

      <section className="panel recent-panel">
        <div className="section-heading"><div><div><h2>Recent entries</h2><p>Your latest logged injections</p></div></div><button className="text-link" onClick={() => onNavigate('history')}>View all <ArrowRight size={16} /></button></div>
        {injections.length ? <div className="entry-list">{injections.slice(0, 4).map((entry) => <EntryCard key={entry.id} entry={entry} compact />)}</div> : <EmptyState icon={Syringe} title="Nothing logged yet" description={compounds.length ? 'Your first entry is one tap away.' : 'Add a compound, then log your first entry.'} />}
      </section>
      <p className="health-note">SiteTrack records what you enter. It does not provide dosing, injection, or medical advice. Seek professional care for pain, redness, swelling, fever, numbness, or other concerning symptoms.</p>
    </div>
  )
}
