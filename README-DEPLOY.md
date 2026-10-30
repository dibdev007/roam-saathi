# Roam Saathi Website — v6 (Deployment Package)

Tourist-only car rental site beside LGBI Airport, Guwahati — full owner
control room at the hidden `/admin` route, now with a built-in CRM and
one-time e-sign rental agreements.

## What's new in v6

### 1. Customers CRM (Admin → Customers)
Every renter is captured with the channel that brought them — WhatsApp,
Google Maps, Instagram, Facebook, Website, Walk-in, Referral, Repeat,
Other — plus a complete profile: phones, email, full address, date of
birth, ID proof (type + number + scanned file), address proof (type +
number + scanned file) and driving licence (number, expiry, scanned file).
Scans are stored securely in your database and only the admin can open
them.

### 2. One-time e-sign rental agreements (Admin → Customers → Agreements)
- Pick the customer, fill the trip (vehicle, dates, pickup/drop, charges,
  deposit, special conditions) and press **Create signing link**.
- The app generates a **private one-time link** (a 256-bit random token).
  Send it to the customer on WhatsApp.
- The customer opens the link, reads the full agreement — drafted under
  **Indian law** (Indian Contract Act 1872, Motor Vehicles Act 1988, Assam
  Motor Vehicles Rules 2003, IT Act 2000) with **exclusive jurisdiction of
  the courts at Guwahati (Gauhati High Court)** — then signs by **drawing
  on the screen like a pen** or **uploading a photo of their signature**.
- On submit the signature is merged into a branded PDF together with the
  signing date, time, IP and device record, the document is saved in the
  portal, and **the link destroys itself instantly** — it can never be
  opened or reused again, not even by accident.
- Download the signed PDF any time from Admin → Customers → Agreements.
  Pending agreements can be previewed as PDF or revoked (link dies).

### 3. Home-menu bug fix
New pages created in Admin → Website Pages with **Show in menu** enabled
now really appear in the top menu. The cause: every new page silently
saved as a **draft**, and the menu only lists published pages. v6 starts
new pages as **published**, warns loudly in the editor and in the list
when a menu page is still a draft, and the navbar now shows the first
three custom pages plus a "More" dropdown for the rest.

### 4. Security hardening (top priority — nothing about the portal is exposed)
- **The old `/api/setup?key=roam2024` hole is closed.** The hard-coded key
  is gone. Repair now runs from Admin → Database (admin login required).
  Key access exists only if YOU set the `ADMIN_SETUP_KEY` env variable.
- **The admin login page reveals nothing.** `/admin` HTML no longer
  contains the words "AdminLogin"/"AdminApp" or chunk maps — the portal is
  lazy-loaded in separate files after the page opens, and the route sends
  `noindex` + `no-store`.
- **Passwords are salted scrypt hashes**; login sets an HMAC-signed,
  HttpOnly, SameSite cookie (7 days) and is throttled against brute force.
- **Every admin API verifies the signed cookie** — no data is readable or
  writable without a real login.
- **Site-wide security headers** (nosniff, frame protection, referrer
  policy, HSTS) are set in `next.config.ts`.
- **Signing links are cryptographically single-use**: the database stores
  only the SHA-256 hash of the token; when the customer signs, the hash is
  wiped in the same atomic write that records the signature — a stolen
  database backup can never open a live link, and two people clicking at
  the same moment cannot both sign.

## What's inside (carried from v5)

| Area | Highlights |
| --- | --- |
| Public site | Animated hero, scroll reveals, fleet cards with rates & fuel policy, fuel estimator, reviews, admin-managed contact & map, WhatsApp-first booking |
| `/stays` | Hotel directory: filters, search, photos, direct call/WhatsApp |
| `/p/<slug>` | Owner pages (blogs, diaries, stories, policies) with sub-pages, homepage cards and per-page SEO |
| Admin `/admin` | Dashboard, Fleet & prices, Bookings pipeline, **Customers CRM + Agreements**, Website pages, Stays & Partners, Growth & SEO (GA4/GTM/Pixel), Settings, Database backup/repair |
| Self-healing DB | First visit auto-creates all **7 tables** and seeds starter data only when empty |

Admin default password: `roam2024` — **change it from Admin → Settings on day one.**

## Deploy / update on Vercel (you already have the site live)

### 1. Upload this code to GitHub (~5 min)

1. Open your existing repo **github.com/dibdev007/roam-saathi**.
2. Delete the old `src` folder and `prisma` folder in GitHub (Settings is
   not needed — just use "Add file → Upload files" and drag the NEW `src`
   and `prisma` folders from this package, after removing the old ones).
3. Also upload the refreshed `package.json`, `next.config.ts`,
   `public/` files, `README-DEPLOY.md`, `DATABASE_SETUP.md`,
   `.env.example` and `.gitignore` (overwrite when GitHub asks).
4. Commit — Vercel redeploys automatically.

> GitHub drag-and-drop accepts max 100 files per drop — `src` fits in
> 2–3 batches. Never upload `node_modules` or `.next`.

### 2. Environment variables (Vercel → Project → Settings)

| Name | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | **Yes** | Your Neon/Supabase/Prisma Postgres pooled string — unchanged from v5 |
| `ADMIN_SECRET` | Recommended | Long random string; signs the admin session cookie |
| `ADMIN_SETUP_KEY` | Optional | Only if you want key-based `/api/setup` access; leave unset otherwise |

### 3. Let the database upgrade itself (~1 min)

Open your live site once. The self-healing bootstrap adds the two NEW
tables (`Customer`, `Agreement`) to your existing Postgres — your current
vehicles, pages, stays and settings are untouched. If anything looks off,
use **Admin → Database → Repair / re-provision database** (admin login,
no key in any URL).

## Local development

```bash
npm install
cp .env.example .env      # paste your DATABASE_URL
npm run dev               # http://localhost:3000 — tables auto-create
```

## Changing data — everything is in the admin portal

- **Vehicles & prices:** Admin → Fleet (live instantly).
- **Stays & hotels:** Admin → Stays & Partners.
- **Pages/blogs:** Admin → Pages (menu + homepage cards + SEO).
- **Customers & agreements:** Admin → Customers — add the renter, upload
  KYC scans, create the agreement, send the one-time signing link,
  download the signed PDF.
- **SEO & analytics:** Admin → Growth & SEO.
- **Phone/WhatsApp/socials:** Admin → Settings.

## Troubleshooting

| Symptom | Cause & fix |
| --- | --- |
| New page not in the menu | The page is a draft. Open Admin → Pages — the row shows a yellow **Draft — not on site** badge. Switch **Live** ON. |
| Customer signed but you can't find the PDF | Admin → Customers → Agreements → row of the signed agreement → **Download PDF**. |
| Signing link says "no longer active" | It was already used, revoked or expired — that is the security design. Create a fresh link. |
| `/api/setup?key=roam2024` returns 403 | Correct — v6 removed the hard-coded key. Use Admin → Database → Repair. |
| Admin login says wrong password | Default `roam2024` only on a brand-new database; reload `/admin` once, then log in. If you changed the password, use the new one. |
| Data disappeared after redeploy | You are on SQLite, not Postgres → set `DATABASE_URL` (step 2). |
