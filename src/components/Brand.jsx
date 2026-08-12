export default function Brand({ compact = false }) {
  return (
    <div className="brand" aria-label="SiteTrack">
      <span className="brand-mark" aria-hidden="true">
        <span />
      </span>
      {!compact && (
        <span>
          <strong>SiteTrack</strong>
          <small>Private injection log</small>
        </span>
      )}
    </div>
  )
}
