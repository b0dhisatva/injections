import { useState } from 'react'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import Brand from './Brand.jsx'
import { supabase } from '../lib/supabase.js'

export default function AuthPanel() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    const redirectUrl = `${window.location.origin}${window.location.pathname}`
    const result = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    })

    if (result.error) setError(result.error.message)
    else setMessage('Check your inbox for a secure sign-in link.')
    setBusy(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Brand />
        <div className="auth-copy">
          <span className="eyebrow light">Private by design</span>
          <h1>A calmer way to track site rotation.</h1>
          <p>Log when, where, and how much—without spreadsheets or guesswork.</p>
        </div>
        <div className="privacy-note"><ShieldCheck size={18} /><span>Your entries are isolated to your account by database privacy rules.</span></div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-icon"><LockKeyhole size={21} /></div>
          <h2>Open your private log</h2>
          <p>We’ll email you a secure sign-in link. No password to remember.</p>
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
          {error && <div className="form-alert error" role="alert">{error}</div>}
          {message && <div className="form-alert success" role="status">{message}</div>}
          <button className="button primary wide" disabled={busy}>{busy ? 'Sending…' : 'Email me a sign-in link'}<ArrowRight size={17} /></button>
          <p className="auth-footnote">First time here? Your account is created automatically after you open the link.</p>
        </form>
      </section>
    </main>
  )
}
