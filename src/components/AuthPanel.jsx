import { useEffect, useState } from 'react'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import Brand from './Brand.jsx'
import { supabase } from '../lib/supabase.js'

const copy = {
  'sign-in': {
    title: 'Open your private log',
    description: 'Sign in with your email address and password.',
    button: 'Sign in',
    busy: 'Signing in…',
  },
  'sign-up': {
    title: 'Create your private log',
    description: 'Choose a password to protect your SiteTrack account.',
    button: 'Create account',
    busy: 'Creating account…',
  },
  forgot: {
    title: 'Set or reset your password',
    description: 'We’ll send one secure link so you can choose a new password.',
    button: 'Send password link',
    busy: 'Sending…',
  },
  recovery: {
    title: 'Choose a new password',
    description: 'Enter the password you’ll use for future SiteTrack sign-ins.',
    button: 'Save password',
    busy: 'Saving…',
  },
}

export default function AuthPanel({ passwordRecovery = false, onPasswordUpdated }) {
  const [mode, setMode] = useState(passwordRecovery ? 'recovery' : 'sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (passwordRecovery) setMode('recovery')
  }, [passwordRecovery])

  function changeMode(nextMode) {
    setMode(nextMode)
    setPassword('')
    setConfirmPassword('')
    setMessage('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    if ((mode === 'sign-up' || mode === 'recovery') && password !== confirmPassword) {
      setError('Passwords do not match.')
      setBusy(false)
      return
    }

    let result

    if (mode === 'sign-in') {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else if (mode === 'sign-up') {
      result = await supabase.auth.signUp({ email, password })
    } else if (mode === 'forgot') {
      const redirectUrl = `${window.location.origin}${window.location.pathname}`
      result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl })
    } else {
      result = await supabase.auth.updateUser({ password })
    }

    if (result.error) {
      setError(result.error.message)
    } else if (mode === 'forgot') {
      setMessage('Check your inbox for the password setup link.')
    } else if (mode === 'sign-up' && !result.data.session) {
      setMessage('Account created. Check your inbox once to confirm your address, then sign in with your password.')
    } else if (mode === 'recovery') {
      onPasswordUpdated?.()
    }

    setBusy(false)
  }

  const currentCopy = copy[mode]
  const needsEmail = mode !== 'recovery'
  const needsPassword = mode !== 'forgot'
  const needsConfirmation = mode === 'sign-up' || mode === 'recovery'

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
          <h2>{currentCopy.title}</h2>
          <p>{currentCopy.description}</p>

          {needsEmail && (
            <label>
              Email
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            </label>
          )}

          {needsPassword && (
            <label>
              {mode === 'recovery' ? 'New password' : 'Password'}
              <input type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} placeholder="At least 8 characters" required />
            </label>
          )}

          {needsConfirmation && (
            <label>
              Confirm password
              <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} placeholder="Enter it again" required />
            </label>
          )}

          {error && <div className="form-alert error" role="alert">{error}</div>}
          {message && <div className="form-alert success" role="status">{message}</div>}

          <button className="button primary wide" disabled={busy}>
            {busy ? currentCopy.busy : currentCopy.button}
            <ArrowRight size={17} />
          </button>

          {mode === 'sign-in' && (
            <div className="auth-options">
              <button type="button" className="text-button" onClick={() => changeMode('forgot')}>Set or reset password</button>
              <button type="button" className="text-button" onClick={() => changeMode('sign-up')}>Create an account</button>
            </div>
          )}

          {(mode === 'sign-up' || mode === 'forgot') && (
            <button type="button" className="text-button" onClick={() => changeMode('sign-in')}>Back to sign in</button>
          )}

          {mode === 'sign-in' && <p className="auth-footnote">Your email identifies your account; your password signs you in. No sign-in email is sent.</p>}
          {mode === 'forgot' && <p className="auth-footnote">Previously used SiteTrack’s email-link login? Use this once to create your password.</p>}
        </form>
      </section>
    </main>
  )
}
