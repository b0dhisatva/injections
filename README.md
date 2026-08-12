# SiteTrack

SiteTrack is a private, mobile-friendly injection site and quantity log. It is a static React app designed for free hosting on GitHub Pages, with authentication and data stored in Supabase.

It records what the user enters. It does **not** recommend compounds, quantities, injection techniques, or schedules.

## Included

- Passwordless email sign-in
- Per-user data isolation with Supabase Row Level Security (RLS)
- Compound library with a default unit and color
- Multi-compound injection entries with a quantity and unit for each compound
- Site rotation overview showing recent use
- Searchable history and CSV export
- Compound archiving and injection deletion
- Responsive desktop and mobile layouts
- Automatic GitHub Pages deployment on every push to `main`

## 1. Create the Supabase project

1. Create a free project at [database.new](https://database.new/).
2. Open **SQL Editor → New query**.
3. Copy all of [`supabase/schema.sql`](./supabase/schema.sql), paste it into the editor, and select **Run**.
4. Open **Project Settings → API** (or the **Connect** dialog) and copy:
   - Project URL
   - Publishable key beginning with `sb_publishable_`

Never use a secret key or legacy `service_role` key in this app.

## 2. Configure sign-in redirects

SiteTrack uses secure, passwordless email links.

In Supabase, open **Authentication → URL Configuration**:

- During local setup, add `http://localhost:5173/**` to **Redirect URLs**.
- After publishing, set **Site URL** to `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
- Add that same exact production URL to **Redirect URLs**.

Keep the trailing slash. Supabase recommends an exact production redirect URL rather than a wildcard.

## 3. Run locally

Requires Node.js 22 or newer and pnpm.

1. Copy `.env.example` to `.env.local`.
2. Replace the placeholders with your Supabase Project URL and publishable key.
3. Run:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## 4. Publish free with GitHub Pages

GitHub Free requires a public repository for GitHub Pages. The source code will be public, but injection records stay in Supabase and are not committed to GitHub.

1. Create a new **public** GitHub repository, such as `site-track`.
2. Push this project to its `main` branch.
3. In the repository, open **Settings → Secrets and variables → Actions**.
4. Add these two repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Open **Settings → Pages** and choose **GitHub Actions** as the source.
6. Open **Actions** and confirm the “Deploy SiteTrack to GitHub Pages” workflow succeeds.

The published URL will be `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. Add it to the Supabase redirect configuration described above before requesting a sign-in link.

## Data model and privacy

The database has three tables:

- `compounds`: the signed-in user's saved compound labels
- `injections`: date, time, route, site, and optional notes
- `injection_items`: one quantity and unit for each compound attached to an injection

RLS is enabled on every exposed table. Policies check `auth.uid()` against the owning user, including ownership checks through parent records for `injection_items`. Anonymous database access is revoked. The frontend uses only a low-privilege publishable key; secret and service-role keys must never be exposed.

## Verification

```bash
pnpm test
pnpm build
```

## Free-tier notes

- GitHub Pages is free for public repositories on GitHub Free.
- Supabase's Free plan is intended for hobby projects. Free projects may pause after a week without activity.
- If the data becomes medically important, do not treat this hobby app as a clinical record or backup system. Export CSV copies periodically and discuss proper recordkeeping with a qualified clinician.

## Health note

SiteTrack is a recordkeeping tool, not medical advice. It does not make PED use safe. Seek professional care for pain, redness, swelling, fever, numbness, drainage, shortness of breath, chest pain, or any other concerning symptoms.
