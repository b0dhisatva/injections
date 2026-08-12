import { useCallback, useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { isSupabaseConfigured, supabase } from './lib/supabase.js'
import SetupPanel from './components/SetupPanel.jsx'
import AuthPanel from './components/AuthPanel.jsx'
import AppShell from './components/AppShell.jsx'
import Dashboard from './components/Dashboard.jsx'
import InjectionForm from './components/InjectionForm.jsx'
import HistoryView from './components/HistoryView.jsx'
import CompoundsView from './components/CompoundsView.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import Toast from './components/Toast.jsx'

const injectionSelect = `
  id,
  injected_at,
  route,
  site,
  notes,
  created_at,
  injection_items (
    id,
    compound_id,
    amount,
    unit,
    compound:compounds (id, name, color)
  )
`

export default function App() {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [view, setView] = useState('overview')
  const [compounds, setCompounds] = useState([])
  const [injections, setInjections] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [toast, setToast] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return undefined }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthReady(true)
      if (!nextSession) { setCompounds([]); setInjections([]) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadData = useCallback(async () => {
    if (!session?.user) return
    setLoading(true)
    setLoadError('')
    const [compoundResult, injectionResult] = await Promise.all([
      supabase.from('compounds').select('id, name, default_unit, color, active, created_at').order('active', { ascending: false }).order('name'),
      supabase.from('injections').select(injectionSelect).order('injected_at', { ascending: false }),
    ])
    const error = compoundResult.error || injectionResult.error
    if (error) setLoadError(`${error.message} Check that the Supabase schema has been installed.`)
    else {
      setCompounds(compoundResult.data ?? [])
      setInjections(injectionResult.data ?? [])
    }
    setLoading(false)
  }, [session])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function addCompound(values) {
    const { data, error } = await supabase.from('compounds').insert({ ...values, user_id: session.user.id }).select('id, name, default_unit, color, active, created_at').single()
    if (error) return { error: error.code === '23505' ? 'You already have a compound with that name.' : error.message }
    setCompounds((current) => [...current, data].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name)))
    setToast(`${data.name} added`)
    return { data }
  }

  async function toggleCompound(compound) {
    const { data, error } = await supabase.from('compounds').update({ active: !compound.active }).eq('id', compound.id).select('id, name, default_unit, color, active, created_at').single()
    if (error) { setLoadError(error.message); return }
    setCompounds((current) => current.map((item) => item.id === data.id ? data : item).sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name)))
    setToast(data.active ? `${data.name} restored` : `${data.name} archived`)
  }

  async function saveInjection(values) {
    const { data: injection, error: injectionError } = await supabase.from('injections').insert({
      user_id: session.user.id,
      injected_at: values.injected_at,
      route: values.route,
      site: values.site,
      notes: values.notes,
    }).select('id').single()
    if (injectionError) return { error: injectionError.message }

    const { error: itemError } = await supabase.from('injection_items').insert(values.doses.map((dose) => ({
      injection_id: injection.id,
      compound_id: dose.compound_id,
      amount: dose.amount,
      unit: dose.unit,
    })))

    if (itemError) {
      await supabase.from('injections').delete().eq('id', injection.id)
      return { error: itemError.message }
    }
    await loadData()
    setToast('Injection logged')
    setView('overview')
    return { data: injection }
  }

  async function deleteInjection() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('injections').delete().eq('id', deleteTarget.id)
    if (error) setLoadError(error.message)
    else {
      setInjections((current) => current.filter((entry) => entry.id !== deleteTarget.id))
      setToast('Entry deleted')
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setView('overview')
  }

  if (!isSupabaseConfigured) return <SetupPanel />
  if (!authReady) return <div className="full-loader"><LoaderCircle size={28} className="spin" /><span>Opening SiteTrack…</span></div>
  if (!session) return <AuthPanel />

  const content = loading && !injections.length && !compounds.length
    ? <div className="content-loader"><LoaderCircle size={24} className="spin" /><span>Loading your private log…</span></div>
    : view === 'log'
      ? <InjectionForm compounds={compounds} onSave={saveInjection} onCancel={() => setView('overview')} onAddCompound={() => setView('compounds')} />
      : view === 'history'
        ? <HistoryView injections={injections} compounds={compounds} onDelete={setDeleteTarget} onNavigate={setView} />
        : view === 'compounds'
          ? <CompoundsView compounds={compounds} injections={injections} onAdd={addCompound} onToggle={toggleCompound} />
          : <Dashboard injections={injections} compounds={compounds} onNavigate={setView} />

  return (
    <AppShell activeView={view} onNavigate={setView} email={session.user.email} onSignOut={signOut}>
      {loadError && <div className="global-error" role="alert"><span>{loadError}</span><button onClick={() => { setLoadError(''); loadData() }}>Try again</button></div>}
      {content}
      {deleteTarget && <ConfirmDialog title="Delete this entry?" description="This permanently removes the injection and all compound quantities attached to it." onConfirm={deleteInjection} onCancel={() => setDeleteTarget(null)} busy={deleting} />}
      <Toast message={toast} onClose={() => setToast('')} />
    </AppShell>
  )
}
