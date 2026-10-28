# Roam Saathi Website — v3

Tourist-only car rental website for Roam Saathi (LGBI Airport, Guwahati).
Next.js 16 + Prisma + PostgreSQL (Neon free tier). **v3** adds a modern
redesigned public site, a secret admin portal with a no-code page builder,
the fuel & toll policy layer, admin-managed Google Map embed and a working
password change.

---

## Quick start (15 minutes, zero coding)

### 1. Create the database (5 min)
1. Go to **neon.com** → sign up free → **Create project** (name: `roamsaathi`).
2. Open the project → copy the **pooled** connection string
   (starts with `postgresql://…pooler…neon.tech/neondb?sslmode=require`).

### 2. Provision the database — pick ONE of these
- **Option A (easiest):** after deploying (step 4), visit once
  `https://your-site.vercel.app/api/setup?key=roam2024`
- **Option B:** in the Neon console open the **SQL Editor**, paste the whole
  `prisma/setup.sql` file, click **Run**.

### 3. Upload to GitHub (5 min)
1. Create a repository (e.g. `roam-saathi-website`) — private is fine.
2. Upload ALL files/folders from this ZIP (keep the folder structure:
   `src/`, `prisma/`, `public/`, `package.json`, …).
   - On github.com use **Add file → Upload files** (drag-drop everything).
   - Do NOT upload `node_modules` or `.next` (not present in the ZIP anyway).
3. Click **Commit changes**.

### 4. Deploy on Vercel (4 min)
1. **vercel.com** → sign in with GitHub → **Add New… → Project** → import the repo.
2. Before clicking Deploy open **Environment Variables** and add:
   - Name: `DATABASE_URL`
   - Value: the Neon pooled connection string from step 1
3. Click **Deploy** and wait ~2 minutes.

### 5. First run (2 min)
- If you chose Option A: open `/api/setup?key=roam2024` once (adds tables +
  starter fleet, policies and pages — safe, never overwrites data).
- Open `https://your-site.vercel.app/admin` — this is the SECRET owner portal
  (not linked anywhere on the public site).
- Log in with the default password `roam2024`, then go to **Settings**:
  1. Change the business phone + WhatsApp number to yours.
  2. Change the admin password (Settings → Admin password).
  3. Paste your Google Maps embed (Settings → Google Map) — full `<iframe…>`
     code or just the link both work.
  4. Save. Everything on the public site updates instantly.

---

## What the admin portal can do (`/admin`)

| Tab | What it controls |
|---|---|
| Dashboard | Live snapshot: fleet, enquiries, pipeline value, pages |
| Fleet & Prices | Add/edit/delete vehicles + all rates, deposits, km limits, mileage, fuel notes |
| Bookings | Enquiry inbox, status pipeline, WhatsApp reply, CSV export |
| Website Pages | **No-code page builder** — blogs, travel diaries, customer stories, policies; sub-pages; homepage & menu visibility |
| Settings | Phone/WhatsApp/email/hours/address, announcement bar, Google Map embed, fuel & toll texts, destination list, socials, **admin password** |
| Database | Storage stats + full JSON backup download |

Public pages created in **Website Pages** go live instantly at
`https://your-site.vercel.app/p/your-page-name`.

## Fuel & toll policy (v3)

- **With driver:** fuel, toll, parking and driver charges are included in the
  fare — provided by Roam Saathi.
- **Self-drive:** fuel, toll, permits and parking are paid by the customer at
  actuals. The booking form shows a mandatory policy notice, a per-route fuel
  estimator (distance ÷ vehicle mileage × pump price) and requires the guest
  to accept the policy before sending.
- All texts are editable in **Admin → Settings → Fuel & toll policy**, and the
  destination list (with distances) is editable too.

## Local development (optional)

```bash
npm install
cp .env.example .env      # put your DATABASE_URL in .env
npx prisma db push        # create tables
npm run dev               # http://localhost:3000
```

Full guides: `DATABASE_SETUP.md` (database options) and the Roam Saathi
v3 Update Guide PDF (click-by-click with screenshots-style steps).
