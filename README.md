# Our Little Love Book 🐻💕

สมุดความทรงจำของเรา — a private, production-ready couple memory book: memories, anniversaries, a timeline, love letters, and a photo gallery, backed by real Supabase auth, database, and storage.

## Tech stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage, Row Level Security)
- React Router, Framer Motion, Lucide icons, date-fns

## 1. Local setup

```bash
npm install
cp .env.example .env   # then fill in your Supabase project values (see below)
npm run dev
```

Production build:

```bash
npm run build
npm run preview   # sanity-check the built output locally
```

## 2. Supabase project setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (or reuse an existing one).
2. **Run the schema.** Open the SQL Editor in your Supabase dashboard and run the contents of
   [`supabase/schema.sql`](./supabase/schema.sql) once. It creates:
   - Tables: `profiles`, `couple_settings`, `memories`, `memory_images`, `anniversaries`, `letters`
   - A trigger that auto-creates a `profiles` + `couple_settings` row whenever someone signs up
   - Row Level Security policies on every table, scoped to `auth.uid() = user_id`
   - The `memory-images` storage bucket, with storage policies scoped to `{user_id}/...` paths
3. **Confirm the storage bucket.** Storage → Buckets should show `memory-images` (public read, 10MB limit, image types only). It's created by the same schema script.
4. **Auth settings.** Email/password auth is enabled by default. If you want new users to skip email confirmation during testing, turn off "Confirm email" under Authentication → Providers → Email (turn it back on for production).
5. **Get your API credentials** from Project Settings → API:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon` / `public` key → `VITE_SUPABASE_ANON_KEY`

   Never use the `service_role` key in this frontend — it must never ship to the browser.
6. *(Optional)* **Seed demo data.** After creating your first account in the app, copy your user's UID from Authentication → Users, paste it into [`supabase/seed.sql`](./supabase/seed.sql), and run that file once in the SQL Editor to populate a few sample memories/anniversaries/letters. The file also includes the `DELETE` statements to remove that demo data again before real use.

## 3. Environment variables

Copy `.env.example` to `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 4. Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, "Add New… → Project" and import the GitHub repo.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (Vercel detects this automatically).
4. Add the environment variables from step 3 above under Project Settings → Environment Variables (for Production, Preview, and Development).
5. Deploy. `vercel.json` in this repo adds the SPA rewrite rule so client-side routes (e.g. `/memories/:id`) work on refresh.
6. Back in Supabase, add your Vercel domain to Authentication → URL Configuration → Redirect URLs (needed for the "forgot password" email link to work in production).

## Project structure

```text
src/
├── components/   ui/, layout/, memory/, anniversary/, gallery/, letters/, bear/
├── pages/        one file per route
├── hooks/        Supabase data hooks (memories, anniversaries, letters, settings)
├── lib/          supabase client, storage helpers, date/format utils
├── types/        TypeScript types mirroring the DB schema
├── contexts/     auth + toast context
└── routes/       ProtectedRoute wrapper
supabase/
├── schema.sql    full DB schema, RLS, triggers, storage bucket + policies
└── seed.sql      optional demo data (see step 2.6 above)
```

## Data model & security

Every table is owned by exactly one authenticated user (`auth.uid() = user_id`), enforced by RLS — a signed-in user can only ever read or write their own rows. A "couple" here is one account: `couple_settings` stores both partners' names and photos on a single row, so there's no cross-account data sharing to reason about.

Images upload to the `memory-images` bucket under `{user_id}/{memory_id}/{filename}` (or `{user_id}/settings/...`, `{user_id}/anniversaries/...`, `{user_id}/letters/...` for the other upload spots). Storage policies check that the first path segment matches `auth.uid()`, so uploads/updates/deletes are scoped per-user even though the bucket serves public read URLs for simplicity. If you'd rather keep photos fully private, flip the bucket to `public = false` in `schema.sql` and switch `lib/storage.ts` to `createSignedUrl` instead of `getPublicUrl`.

## Final checklist

- [x] Real Supabase Auth (email/password, session persistence, protected routes, forgot password)
- [x] Real Postgres database with RLS on every table
- [x] Real image upload/delete to Supabase Storage, scoped per user
- [x] Full CRUD: memories, anniversaries, letters
- [x] Timeline combining memories + anniversaries
- [x] Gallery with filters, lightbox, lazy loading
- [x] Settings: couple names, start date, avatars, reminder days, theme
- [x] Friendly empty states, toasts for errors, skeleton loaders, custom 404
- [x] Responsive layout: sidebar nav on desktop, bottom nav on mobile
- [x] `npm run build` produces a deployable `dist/`
