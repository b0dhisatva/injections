import { BarChart3, Beaker, History, LogOut, Plus, ShieldCheck } from 'lucide-react'
import Brand from './Brand.jsx'

const items = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'history', label: 'History', icon: History },
  { id: 'compounds', label: 'Compounds', icon: Beaker },
]

export default function AppShell({ activeView, onNavigate, email, onSignOut, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <nav aria-label="Primary">
          {items.map(({ id, label, icon: Icon }) => (
            <button key={id} className={activeView === id ? 'active' : ''} onClick={() => onNavigate(id)}><Icon size={19} />{label}</button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="private-chip"><ShieldCheck size={16} /><span><strong>Private log</strong><small>Only you can access it</small></span></div>
          <button className="account-button" onClick={onSignOut} title="Sign out"><span>{email?.slice(0, 1).toUpperCase()}</span><div><strong>{email}</strong><small>Sign out</small></div><LogOut size={16} /></button>
        </div>
      </aside>
      <div className="main-column">
        <header className="mobile-header"><Brand /><button className="icon-button" onClick={onSignOut} aria-label="Sign out"><LogOut size={18} /></button></header>
        <main className="main-content">{children}</main>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {items.slice(0, 2).map(({ id, label, icon: Icon }) => <button key={id} className={activeView === id ? 'active' : ''} onClick={() => onNavigate(id)}><Icon size={19} /><span>{label}</span></button>)}
          <button className="mobile-add" onClick={() => onNavigate('log')} aria-label="Log injection"><Plus size={22} /></button>
          {items.slice(2).map(({ id, label, icon: Icon }) => <button key={id} className={activeView === id ? 'active' : ''} onClick={() => onNavigate(id)}><Icon size={19} /><span>{label}</span></button>)}
        </nav>
      </div>
    </div>
  )
}
