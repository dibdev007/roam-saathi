# Roam Saathi — Website Package v2 (Deploy / Update Guide)

**No coding needed.** Everything below is clicking, copying and pasting.
Total time: about 20 minutes.

---

## What's new in this v2 package

| Area | What you get |
|---|---|
| **Admin → Fleet** | Add / edit / delete vehicles with FULL price details: self-drive rate per day, with-driver rate per day, monthly rate, security deposit, included km/day, extra-km charge, driver bata, registration number, features, photo, availability switch, "Popular" star, display order |
| **Admin → Bookings** | Pipeline (New → Contacted → Confirmed → Ongoing → Completed / Cancelled), customer search, one-tap WhatsApp reply with a pre-filled quote, call button, CSV export, delete |
| **Admin → Dashboard** | Fleet size, new enquiries, active rentals, pipeline value, latest enquiries, top vehicles |
| **Admin → Settings** | Phone / WhatsApp / email / hours / address / passcode — saved to the database, the public site updates instantly |
| **Admin → Database** | Storage stats, one-click JSON backup, cloud database guide |
| **Customer site** | Live fleet from the database (per-vehicle price boxes, class filter chips), smarter booking form (destination field, live vehicle classes), all contact buttons follow Admin → Settings |
| **Fix** | Vehicles/prices/bookings now save to a **cloud database** — permanent on Vercel (the old version used SQLite, which Vercel wipes on every redeploy — that is why saving "wasn't working") |
| **New** | One-time setup page: visit `/api/setup?key=roam2024` after deploying to create tables + load the 17-vehicle starter fleet automatically |

---

## PART A — Update your EXISTING Vercel project (keeps your current URL)

### Step A1 — Extract this ZIP on your computer
Right-click the ZIP → Extract All. Remember the folder (e.g. `roam-saathi-website-v2`).

### Step A2 — Create the free cloud database
1. Go to **https://neon.tech** → **Sign Up** (Google or GitHub login, no credit card).
2. **Create project** → name it `roam-saathi` → region: Singapore (or any close to India).
3. On the dashboard click **Connect** (or "Connection Details").
4. Copy the **pooled connection string** — it looks like:
   `postgresql://user:xxxx@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
5. Paste it somewhere safe (Notepad). This is your `DATABASE_URL`.

> Already created **Prisma Postgres** at console.prisma.io? Use its connection string instead — same steps.

### Step A3 — Upload the new code to your GitHub repo
1. Open **github.com** → sign in → open your existing website repository.
2. You will upload in **2–3 batches** (GitHub allows max 100 files per upload):
   - **Batch 1:** Click **Add file → Upload files** → drag the **`src`** folder from the extracted ZIP onto the page → wait for all files to list → click **Commit changes**.
   - **Batch 2:** Again **Add file → Upload files** → drag the **`prisma`** folder and the **`public`** folder → **Commit changes**.
   - **Batch 3:** Again **Add file → Upload files** → drag these files: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`, `DATABASE_SETUP.md`, `README-DEPLOY.md`, `.env.example`, `.gitignore` → **Commit changes**.
     - If you don't see `.env.example` / `.gitignore` (some systems hide dot-files), that's OK — skip them. They are optional locally.
3. **Delete the old database file from the repo** (important): find the **`db`** folder → open it → click **custom.db** → the **…** / trash (Delete) icon → confirm delete → commit. (If your repo has no `db` folder, skip.)
4. If GitHub asks about files with the same name: uploading **replaces** them — that's exactly what we want.

### Step A4 — Give Vercel the database address
1. Open **vercel.com** → your project → **Settings → Environment Variables**.
2. Add a variable:
   - **Key:** `DATABASE_URL`
   - **Value:** (paste the Neon connection string from Step A2)
   - **Environments:** tick Production, Preview, Development
3. **Save**.

### Step A5 — Redeploy
1. Left menu → **Deployments**.
2. On the newest deployment click the **⋯** (three dots) → **Redeploy** → confirm.
3. Wait ~2 minutes until it says **Ready**.

### Step A6 — One-time database setup (creates tables + starter fleet)
Open in any browser (use YOUR vercel URL):

```
https://your-site.vercel.app/api/setup?key=roam2024
```

You should see: `{"ok":true, ... "message":"Database ready — ..."}`

### Step A7 — Verify (2 minutes)
1. Open your site → **Fleet** section shows 17 vehicles with prices.
2. Site → top-right **Admin** → passcode `roam2024` → **Fleet** → edit any price → Save.
3. Reload the page → the new price is still there. **Saving is now permanent.** ✅
4. Submit a test booking from the customer form → it appears in Admin → Bookings.

---

## PART B — Brand-new GitHub repo + fresh Vercel project

(Use this if you prefer a clean start or can't access the old repo.)

1. **github.com/new** → Repository name: `roam-saathi-website` → **Public** → **Create** (do NOT add README).
2. Upload everything from the extracted ZIP exactly like Step A3 (batches: `src`, then `prisma` + `public`, then root files).
3. **vercel.com** → **Add New… → Project** → **Import** the new repo → Framework preset auto-detects **Next.js**.
4. BEFORE clicking Deploy: open **Environment Variables** → add `DATABASE_URL` (value from Step A2) → Add.
5. Click **Deploy** → wait for Ready.
6. Visit `https://<new-project>.vercel.app/api/setup?key=roam2024` once.
7. Done. (Your old Vercel project keeps working separately until you delete it.)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Fleet shows "Failed to load" / spinning | `DATABASE_URL` missing or has a typo → Vercel → Settings → Environment Variables → fix → **Redeploy** |
| Setup page says "Invalid or missing key" | Add `?key=roam2024` (default passcode) or your changed passcode |
| Setup page shows an error mentioning "relation does not exist" or "raw SQL" | Paste `prisma/setup.sql` into the Neon SQL Editor (Neon → SQL Editor → paste whole file → Run) |
| Tables exist but fleet is empty | Visit `/api/setup?key=roam2024` again — it fills only-empty tables; also check Admin → Fleet → vehicles may be toggled "unavailable" |
| My old vehicles are gone | Expected — they lived in the old SQLite file that Vercel wiped. The 17-vehicle rate card comes back after the setup URL. Re-add custom vehicles in Admin → Fleet |
| Build fails mentioning "prisma" | Make sure `DATABASE_URL` was added BEFORE the build started (add it, then Redeploy) |
| Admin passcode not accepted | Default is `roam2024`; if changed, use your own. Reset option: edit the `adminPasscode` row in the Settings table via Neon SQL Editor |
| Website still shows placeholder phone | Admin → Settings → replace phone + WhatsApp → Save (site updates instantly) |
| Images look like illustrations | Those are the shipped placeholder images — replace `public/hero.png` / `public/fleet-*.png` with real photos of your vehicles (same file names) |

## After going live — 3 good habits

1. **Weekly backup:** Admin → Database → Download full backup (JSON) → save in Google Drive.
2. **Change the passcode** from `roam2024` to something private (Admin → Settings). If you change it, either use the new passcode in the setup URL or set an `ADMIN_SETUP_KEY` environment variable in Vercel.
3. **Keep photos real:** replace the placeholder fleet PNGs in `public/` with actual photos of your cars — same file names, site updates automatically.

## Files in this package

```
├─ README-DEPLOY.md        ← this guide
├─ DATABASE_SETUP.md       ← detailed database guide (same steps, more depth)
├─ package.json            ← project definition (Vercel reads this)
├─ next.config.ts
├─ prisma/
│   ├─ schema.prisma       ← database definition (PostgreSQL)
│   ├─ schema.sqlite.prisma← SQLite copy (offline experiments only)
│   ├─ seed.ts             ← starter data loader (optional, CLI users)
│   └─ setup.sql           ← paste-into-SQL-editor alternative for Step A6
├─ public/                 ← images, robots.txt, sitemap.xml
└─ src/                    ← website code (customer site + admin portal + APIs)
```
