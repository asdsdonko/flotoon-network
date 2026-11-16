# FLOTOON NETWORK 📺

A Cartoon Network–inspired dorm website for West Florence Moore. Next.js + Supabase + Vercel. Includes a shared RA editor login, calendar, 11 cast profiles, events, and photo albums.

## 1. Set up Supabase (free tier is enough to start, subject to current limits)
1. Create a project at https://supabase.com/dashboard.
2. Open **SQL Editor**, paste and run `supabase-setup.sql`.
3. Open **Authentication > Users** and create **one email/password user** for the RA team. Use a strong unique password. Disable public signups under Authentication settings if available.
4. In **Project Settings > API** (or the project's API Keys page), copy your Project URL, publishable/anon key, and **service_role secret**. The service role key must never be exposed publicly or prefixed `NEXT_PUBLIC_`.

## 2. Run locally
Install Node.js 20+ and run:

```bash
npm install
cp .env.example .env.local
```

Fill in the three environment variables in `.env.local`, then run:

```bash
npm run dev
```

Open http://localhost:3000 for the website and http://localhost:3000/admin for the editor.

## 3. Deploy on Vercel
1. Create a GitHub repository and upload/push this project (do not upload `.env.local`).
2. At https://vercel.com/new import the GitHub repo.
3. Add the three environment variables from `.env.example` in Vercel project settings.
4. Deploy. Your site will have a `*.vercel.app` URL.
5. Share `/admin` and the shared Supabase email/password **only with your RAs**. Residents use the public URL.

## What the RA team can edit
- **Events:** title, date, time, location, description, flyer. Dates automatically appear on the homepage calendar.
- **Meet the Cast:** names, roles, photos, email, Slack profile links, display order.
- **Photos:** albums, cover photos, multiple pictures.
- **Settings:** dorm Slack link in navigation.

## Security and maintenance notes
- All editing requests are checked server-side using the signed-in Supabase user token in an HTTP-only cookie. The service role secret is used only on the server. Database writes are not available to anonymous browser clients.
- One shared account means no individual audit trail. Rotate the password when an RA leaves, and don't reuse a personal password. Consider individual accounts later if needed.
- The session expires after the Supabase access token lifetime; just sign in again.
- Uploaded images are **publicly accessible**; upload only photos everyone pictured has agreed can be public. Avoid private resident contact details or private event information.
- Images are limited to 8 MB each. Deleting an album/profile doesn't automatically remove its previously uploaded image from storage.
- The public website displays placeholder RA cards until updated. The site works in preview mode without Supabase configured, but editing and persistence require Supabase.
- `npm run build` should be run after installing dependencies. This package was prepared as source code, not deployed to your Vercel account.
