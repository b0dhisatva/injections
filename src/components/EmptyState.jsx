export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <span><Icon size={22} /></span>}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}
