import { MoreHorizontal, Syringe } from 'lucide-react'
import { formatAmount, formatDateTime } from '../lib/format.js'
import { routeLabel, siteLabel } from '../lib/constants.js'

export default function EntryCard({ entry, onDelete, compact = false }) {
  return (
    <article className={`entry-card ${compact ? 'compact' : ''}`}>
      <div className="entry-icon"><Syringe size={19} /></div>
      <div className="entry-main">
        <div className="entry-topline"><strong>{siteLabel(entry.site)}</strong><span>{formatDateTime(entry.injected_at)}</span></div>
        <div className="dose-pills">
          {(entry.injection_items ?? []).map((item) => (
            <span key={item.id}><i style={{ background: item.compound?.color ?? '#777' }} />{item.compound?.name ?? 'Removed compound'} <b>{formatAmount(item.amount)} {item.unit}</b></span>
          ))}
        </div>
        {!compact && <div className="entry-meta"><span>{routeLabel(entry.route)}</span>{entry.notes && <><i>·</i><span>{entry.notes}</span></>}</div>}
      </div>
      {onDelete && <button className="icon-button entry-menu" onClick={() => onDelete(entry)} aria-label={`Delete ${siteLabel(entry.site)} entry`}><MoreHorizontal size={19} /></button>}
    </article>
  )
}
