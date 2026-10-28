# Roam Saathi Website — v5 (Deployment Package)

Tourist-only car rental site beside LGBI Airport, Guwahati — full owner
control room at the hidden `/admin` route.

## What's new in v5 — the "empty fleet" fix

Some visitors (and owners!) saw **no vehicles in the fleet, an empty rate
card and a booking form with no cars to choose**. That happened when the
connected database was fresh, un-provisioned, or unreachable. v5 fixes this
at three levels:

1. **Self-healing database.** On the first request the site now checks the
   database and, if tables are missing or empty, creates them and loads the
   starter data automatically — 17 vehicles, 5 partner stays, the Rules &
   Policies page and all settings. **You no longer need to visit /api/setup
   or paste setup.sql** (both still work, but are optional).
2. **Built-in fallback fleet.** If the database is completely unreachable
   (missing DATABASE_URL, wrong password, read-only filesystem), the public
   site now shows the full built-in fleet with rates — the fleet, the rate
   card and the booking form dropdown are **never empty** again. Booking
   continues over WhatsApp (it always did).
3. **Safer APIs.** `/api/vehicles` and `/api/bookings` now create what they
   need and degrade gracefully instead of failing hard.

Also fixed in v5: provisioning now creates the **Hotel (Stays & Partners)**
table and the per-page **SEO columns** that v4's manual setup path missed.

## What's inside (carried from v4)

| Area | Highlights |
| --- | --- |
| Public site | Animated hero, scroll reveals, 3D-tilt fleet cards with fuel policy column, live fuel estimator, booking disclaimer flow, reviews marquee, admin-managed map & contact |
| `/stays` | Hotel directory: state filter, search, photos, prices, direct call/WhatsApp to the hotel |
| `/p/<slug>` | Owner-created pages (blogs, travel diaries, customer stories, policies) with sub-pages, homepage visibility and per-page SEO fields |
| Admin `/admin` | Hidden portal (no public link, `noindex`): Dashboard, Fleet & prices CRUD, Bookings pipeline, No-code page builder, Stays & Partners manager, Growth & SEO (meta tags, Search Console verification, GA4/GTM/Meta Pixel without code), Settings (phone/WhatsApp everywhere, map embed paste, fuel policies, password change), Database backup/export |

Admin default password: `roam2024` — **change it from Admin → Settings on day one.**

## Deploy to Vercel (10 minutes)

### 1. Create the database (one time, free, ~4 min)

1. Go to **neon.com** → sign up with Google (free).
2. Create a project → copy the **pooled connection string**
   (looks like `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`).

> Supabase or Vercel Postgres work exactly the same — any hosted Postgres is fine.

### 2. Upload this code to GitHub (~5 min)

1. Create a new repository on **github.com** (name: `roam-saathi-website`).
2. Upload the **contents** of this folder (not the folder itself) —
   drag-and-drop is fine: `src`, `prisma`, `public`, all the config files,
   `package.json`, `.gitignore`, `.env.example`.
   Do **not** upload `node_modules` or `.next` (they don't exist in this zip anyway).
3. Never put your real `DATABASE_URL` in GitHub — it goes only in Vercel (step 3).

### 3. Import to Vercel and connect the database (~3 min)

1. On **vercel.com** → *Add New… → Project* → import your new GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Build command and output
   are already correct in `package.json`.
3. Open **Environment Variables** and add:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | your Neon pooled connection string |
   | `ADMIN_SECRET` | any long random string (recommended) |

4. Click **Deploy** and wait ~2 minutes.

### 4. That's it — the database fills itself

Open your live site. On the first load the app:

1. Connects to your Postgres,
2. Creates the 5 tables (`Vehicle`, `Booking`, `Settings`, `Page`, `Hotel`),
3. Loads the starter fleet, stays, pages and settings — **only if empty**,
   so redeploys never wipe data you changed from the admin portal.

Verify: the **Fleet** section shows 17 vehicles, **Rates** shows the full
rate card, and **Book a vehicle** lists every car in the dropdown.

## Local development

```bash
npm install
cp .env.example .env      # paste your DATABASE_URL
npm run dev               # http://localhost:3000  — tables auto-create
```

Optional (SQLite sandbox instead of Postgres):
```bash
npx prisma db push --schema prisma/schema.sqlite.prisma
```

## Alternative (manual) database seeding — optional

Both are equivalent to what the site now does automatically:

- **One-click:** visit `https://your-site.vercel.app/api/setup?key=roam2024`
- **SQL editor:** paste `prisma/setup.sql` into the Neon SQL console and run.

## Changing data — everything is in the admin portal

- **Vehicles & prices:** Admin → Fleet → add/edit/delete (goes live instantly).
- **Stays & hotels:** Admin → Stays & Partners → create listings, upload photos.
- **Pages/blogs:** Admin → Pages → write, publish, control menu & homepage visibility.
- **SEO & analytics:** Admin → Growth & SEO → meta tags, Search Console
  verification, GA4 / GTM / Meta Pixel IDs — no code, no redeploy.
- **Phone/WhatsApp everywhere:** Admin → Settings.

## Troubleshooting

| Symptom | Cause & fix |
| --- | --- |
| Fleet shows built-in starter vehicles, admin warns "database unreachable" | `DATABASE_URL` missing/wrong in Vercel → re-check the value, redeploy. The site still shows cars + rates in the meantime. |
| Admin login says wrong password | Default is `roam2024`. On a brand-new database the password seeds itself on the first visit — reload `/admin` once, then log in. |
| Data disappeared after a redeploy | You are on SQLite, not Postgres → set `DATABASE_URL` to Neon (step 3). SQLite files don't persist on Vercel. |
| Want to reset to the starter data | Delete rows in Admin, or truncate tables in the Neon console — the site re-seeds any **empty** table on the next visit. |
