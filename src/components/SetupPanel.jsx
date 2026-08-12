import { Database, GitBranch, KeyRound } from 'lucide-react'
import Brand from './Brand.jsx'

export default function SetupPanel() {
  return (
    <main className="setup-page">
      <section className="setup-card">
        <Brand />
        <div className="eyebrow">One-time setup</div>
        <h1>Connect your private database.</h1>
        <p className="lede">
          The app is built and ready. Add two safe-to-publish Supabase values to start using it.
        </p>
        <div className="setup-steps">
          <div className="setup-step">
            <span><Database size={18} /></span>
            <div><strong>Run the schema</strong><p>Paste <code>supabase/schema.sql</code> into the Supabase SQL editor.</p></div>
          </div>
          <div className="setup-step">
            <span><KeyRound size={18} /></span>
            <div><strong>Add environment values</strong><p>Copy <code>.env.example</code> to <code>.env.local</code> and add your project URL and publishable key.</p></div>
          </div>
          <div className="setup-step">
            <span><GitBranch size={18} /></span>
            <div><strong>Publish on GitHub</strong><p>Add the same values as repository secrets, then enable GitHub Pages.</p></div>
          </div>
        </div>
        <p className="setup-note">Never put a Supabase secret or service-role key in this app.</p>
      </section>
    </main>
  )
}
