# Our Little Love Book 🐻💕

สมุดเล็ก ๆ ของเราสองคน — a private digital love journal for a couple: a monthly anniversary book, romantic letters, and a photo scrapbook, all backed by real Supabase auth, database, and storage. It's built to feel like opening a handwritten diary, not an admin dashboard.

## 1. Project structure

```text
src/
├── components/
│   ├── bear/          BearMascot (procedural SVG + easter egg), BearIllustration
│   │                   (image with automatic fallback), PageLoader, EmptyState
│   ├── book/           BookCover, PaperPage, PageTransition, FloatingHearts,
│   │                   CountdownDisplay
│   ├── envelope/       EnvelopeCard (mailbox list item)
│   ├── anniversary/     AnniversaryPageCard, AnniversaryFormModal
│   ├── letter/          LetterFormModal, LetterOpenOverlay (envelope-opening animation)
│   ├── photo/           PolaroidCard
│   ├── layout/          TopNav, BottomNav, AppShell, navItems
│   └── ui/              Button, Card, Input, Modal, ConfirmDialog, Skeleton,
│                        Lightbox, ImageUploader
│
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx / RegisterPage.tsx / ForgotPasswordPage.tsx
│   ├── BookHomePage.tsx
│   ├── AnniversariesPage.tsx / AnniversaryDetailPage.tsx
│   ├── LettersPage.tsx
│   ├── PhotosPage.tsx
│   ├── SettingsPage.tsx
│   └── NotFoundPage.tsx
│
├── hooks/               useCoupleSettings, useAnniversaries, useLetters,
│                        useGalleryImages, useCountdown, useReducedMotion
├── lib/                 supabase.ts, storage.ts, dates.ts, utils.ts
├── contexts/            AuthContext.tsx
├── types/                database.ts (generated), models.ts
├── routes/               ProtectedRoute.tsx
└── App.tsx / main.tsx

supabase/
├── schema.sql            full DB schema, RLS, triggers, storage bucket + policies
└── seed.sql               optional, clearly-labelled demo data

public/assets/             illustration placeholders — see section 7 below
```

## 2. Installation

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project values (see below)
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## 3. Supabase setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Run the schema.** Open the SQL Editor and run [`supabase/schema.sql`](./supabase/schema.sql) once. It creates:
   - Tables: `profiles`, `couple_settings`, `anniversaries`, `anniversary_images`, `letters`, `gallery_images`
   - A trigger that auto-creates a `profiles` + `couple_settings` row on signup
   - Row Level Security policies on every table, scoped to `auth.uid() = user_id`
   - The `love-book-images` storage bucket, created and policy-scoped by the same script (step 3 below happens automatically — no separate dashboard step needed)
3. **Storage bucket** — already created by `schema.sql` (`love-book-images`, public read, 10MB limit, image types only, write/delete scoped per-user by path).
4. **Configure Auth.** Email/password is enabled by default. Toggle off "Confirm email" under Authentication → Providers → Email while testing locally if you don't want to wait on confirmation mail; turn it back on for production. Add your deployed domain under Authentication → URL Configuration → Redirect URLs so the "forgot password" email link works.
5. *(Optional)* **Seed demo data** — see [`supabase/seed.sql`](./supabase/seed.sql) after creating your first account.

## 4. Environment variables

`.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Get both from Project Settings → API in your Supabase dashboard. Never put the `service_role` key here — it must never reach the browser. `.env` / `.env.local` are gitignored.

## 5. Database SQL

The complete, executable schema lives at [`supabase/schema.sql`](./supabase/schema.sql). Highlights:

- Every table is owned by exactly one authenticated user (`auth.uid() = user_id`), enforced by RLS — a signed-in user can only ever see their own rows. A "couple" here is one account: `couple_settings` stores both partners' names/photos on a single row.
- `anniversary_images` additionally checks, on insert, that the parent `anniversaries` row belongs to the same user (via an `exists (...)` check), so a child image can never be attached to someone else's anniversary.
- `updated_at` triggers on every mutable table.
- Storage policies require the first path segment of an object's key to equal `auth.uid()` (`{user_id}/anniversaries/{id}/...`, `{user_id}/letters/{id}/...`, `{user_id}/gallery/...`, `{user_id}/settings/...`), so uploads/updates/deletes are scoped per-user even though the bucket serves public read URLs for simplicity. Flip `public` to `false` in the bucket definition and switch `lib/storage.ts` to `createSignedUrl` if you'd rather keep photos fully private.

## 6. Deployment (Vercel)

1. Push this repo to GitHub.
2. In Vercel: "Add New… → Project" and import the repo. Framework preset: **Vite** (build command `npm run build`, output `dist` — auto-detected).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Project Settings → Environment Variables.
4. Deploy. `vercel.json` adds the SPA rewrite so client-side routes (e.g. `/anniversaries/:id`) survive a refresh.
5. Add the Vercel domain to Supabase's Auth redirect URLs (step 3.4 above).

## 7. Image asset requirements

The site **never breaks if these are missing** — `BearIllustration` (`src/components/bear/BearIllustration.tsx`) tries to load `/assets/<pose>.png` and silently falls back to the procedural bear SVG mascot on error, and the book/paper/envelope surfaces are built with pure CSS so they render immediately without any of this art. Generate these separately (e.g. with an image model) and drop them into `public/assets/` to upgrade the visuals — same bear character, fur color, and pastel palette throughout so it reads as one consistent companion.

Shared style block to prepend to every prompt below:

```text
premium pastel romantic illustration, soft warm lighting, cute rounded
chubby bear character with warm soft-brown fur and a cream muzzle, minimal
clean composition, subtle paper texture, soft pink and cream palette,
gentle shadows, high-end editorial illustration, whimsical but elegant,
transparent background, consistent character design across the set
— avoid: hyper-realistic, 3D game character, anime, dark, neon, high
saturation, complex background
```

---

**01. bear-reading.png**
Dimensions: 1024×1024 · Aspect ratio: 1:1
Subject: the same soft-brown pastel bear, sitting cross-legged, reading an open cream-colored book resting on its lap
Pose: head tilted slightly down toward the book, one paw holding the page
Composition: bear centered, book at chest height, generous negative space around
Background: transparent
Usage: loading states / book-related empty states

**02. bear-envelope.png**
Dimensions: 1024×1024 · Aspect ratio: 1:1
Subject: the bear sitting beside a large pastel-pink envelope, one paw resting on it
Pose: looking toward the envelope with a curious, happy expression
Composition: envelope roughly bear-sized, both centered, envelope tilted slightly
Background: transparent
Usage: Letters page hero / empty state

**03. bear-writing.png**
Dimensions: 1024×1024 · Aspect ratio: 1:1
Subject: the bear holding a small quill or pencil, writing on a piece of paper in front of it
Pose: seated, leaning slightly forward over the paper
Composition: paper at lower-center, bear's face visible above it
Background: transparent
Usage: "create letter" / "write anniversary page" form header

**04. bear-love.png**
Dimensions: 1024×1024 · Aspect ratio: 1:1
Subject: the bear hugging a large pastel-pink heart to its chest
Pose: sitting, both paws wrapped around the heart, eyes closed and content
Composition: heart roughly half the bear's size, centered
Background: transparent
Usage: Book Home hero (`pose="bear-love"`)

**05. book-cover.png**
Dimensions: 1024×1280 · Aspect ratio: 4:5
Subject: a closed storybook with a soft pastel-pink and cream cover, a small embossed heart, and a thin ribbon bookmark
Pose: viewed at a gentle three-quarter angle, slightly open-able spine visible
Composition: book fills most of the frame with soft space around
Background: transparent
Usage: optional richer replacement for the CSS-built `BookCover` on the landing page

**06. paper-texture.png**
Dimensions: 1024×1024 (tileable) · Aspect ratio: 1:1
Subject: a subtle warm cream paper grain texture, very light fiber flecks
Style: flat, tileable, extremely low contrast
Background: N/A (this one is not transparent — it's the texture itself)
Usage: optional background overlay to replace the current CSS dot-grain `.paper-texture` utility for the book/letter/paper surfaces

**07. envelope-pink.png**
Dimensions: 800×600 · Aspect ratio: 4:3
Subject: a pastel-pink paper envelope, flap open, viewed from the front
Pose: static, resting flat
Composition: envelope fills the frame with a small drop shadow beneath it
Background: transparent
Usage: optional richer replacement for the CSS `EnvelopeCard` pink variant

**08. envelope-blue.png**
Dimensions: 800×600 · Aspect ratio: 4:3
Subject: identical envelope illustration to #07, recolored to the baby-blue palette tone
Background: transparent
Usage: `EnvelopeCard` blue variant

**09. envelope-lavender.png**
Dimensions: 800×600 · Aspect ratio: 4:3
Subject: identical envelope illustration to #07, recolored to the lavender palette tone
Background: transparent
Usage: `EnvelopeCard` lavender variant

## 8. Testing checklist

```text
[ ] Register works
[ ] Login works
[ ] Logout works
[ ] Protected routes work (redirect to /login when signed out, to /book when already signed in)
[ ] Anniversary creation works
[ ] Anniversary editing works
[ ] Anniversary deletion works (with confirmation modal)
[ ] Anniversary images work (upload, preview, delete, reorder, cover selection)
[ ] Letters work (create, edit, delete)
[ ] Envelope opening animation works
[ ] Photos work (upload, caption-less gallery, delete)
[ ] Storage works (files scoped per-user under love-book-images)
[ ] RLS works (a second account cannot see the first account's rows)
[ ] Mobile responsive (bottom nav, one-column layouts, fullscreen letter reading)
[ ] Desktop responsive (top nav, two-page anniversary layout)
[ ] Reduced motion respected (prefers-reduced-motion disables/shortens animations)
[ ] Production build works (`npm run build`)
[ ] Vercel deployment works
```
