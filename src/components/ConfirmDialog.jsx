import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ title, description, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
        <span className="dialog-icon"><AlertTriangle size={22} /></span>
        <h2 id="dialog-title">{title}</h2>
        <p>{description}</p>
        <div><button className="button ghost" onClick={onCancel} disabled={busy}>Cancel</button><button className="button danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</button></div>
      </div>
    </div>
  )
}
