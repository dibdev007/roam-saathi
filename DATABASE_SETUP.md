# Roam Saathi — Database Setup Guide

## Why vehicles were "not saving" on your deployed site

| Environment | Database | Saves data? |
|---|---|---|
| **Local preview** | SQLite (file on disk) | ✅ Yes — while the machine keeps the file |
| **Vercel / serverless hosting** | ❌ SQLite does not survive | Files are wiped on every redeploy and moved between servers constantly — that is why your changes kept disappearing |

**The fix:** point the site at a free **cloud Postgres database**. Every vehicle, price
change, booking and setting is then stored permanently in the cloud, survives redeploys,
and is shared across all your devices.

---

## The 4-step setup (no coding, ~10 minutes)

### Step 1 — Create a free cloud database

**Recommended: [Neon](https://neon.tech)** (generous free tier, no credit card, built for Vercel)

1. Go to **neon.tech** → **Sign Up** (use Google/GitHub).
2. Create a project (name it `roam-saathi`). Any region close to India (e.g. Singapore `ap-southeast-1`) is ideal.
3. Open **Dashboard → Connect** / **Connection Details**.
4. Copy the **pooled connection string**. It looks like:
   ```
   postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

**Alternative: Prisma Postgres** — if you already created one at **console.prisma.io**,
copy its connection string instead (looks like `prisma+postgres://accelerate…`). The rest
of the steps are identical.

### Step 2 — Add the connection string to Vercel

1. Vercel dashboard → your project → **Settings → Environment Variables**.
2. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** the connection string from Step 1
   - **Environments:** Production, Preview, Development (tick all)
3. Click **Save**, then go to **Deployments** → click the latest one → **⋯ → Redeploy**.

> For Neon, appending `&pgbouncer=true&connection_limit=1` to the URL is recommended
> for serverless performance.

### Step 3 — Let the database fill itself (nothing to do!)

The v6 site **provisions and seeds itself**: open your live site once and it
creates any missing tables (Vehicle / Booking / Settings / Page / Hotel /
Customer / Agreement) and loads the starter fleet, stays, pages and settings
— **only if a table is empty**, so redeploys never wipe your real data.

- **Repair manually if ever needed:** log in at `/admin` → **Database** tab →
  **Repair / re-provision database**. No key in any URL — the old
  `/api/setup?key=roam2024` shortcut was removed in v6 for security.
- Key-based access still exists if you set the `ADMIN_SETUP_KEY` environment
  variable in Vercel (then `https://your-site.vercel.app/api/setup?key=YOUR-KEY`).
- **Alternative without logging in:** open Neon → **SQL Editor** → paste the
  whole `prisma/setup.sql` file (included in the project) → **Run**. Same result.

### Step 4 — Verify

1. Open your site → the **Fleet** section should show 17 vehicles with prices.
2. Go to `/admin` (default password `roam2024` — change it in Admin → Settings)
   → **Fleet** → edit a rate → save.
3. Reload the page — the new rate is still there. **Saving now works permanently.** 🎉

---

## Which database should I choose?

| Provider | Free tier | Connection string | Notes |
|---|---|---|---|
| **Neon** ✅ recommended | Very generous, no card | `postgresql://…neon.tech/…` | SQL Editor built in, ideal for Vercel |
| **Prisma Postgres** | Free tier | `prisma+postgres://…` | Already familiar if you used the Prisma console |
| **Supabase** | Free tier | `postgresql://…supabase.co…` | Bonus dashboard/backup UI |

All of them work with the exact same code — only the `DATABASE_URL` value differs.

---

## Weekly habit (zero-cost insurance)

From the Admin portal → **Database** tab → **Download full backup (JSON)**.
Save the file in Google Drive. If anything ever goes wrong, your whole fleet +
bookings can be restored from that single file.

## Local development (optional)

To run the site on your own computer with the cloud database:

```bash
npm install
# create a file named .env containing: DATABASE_URL=<your cloud connection string>
npx prisma generate
npm run dev
```

The Prisma schema in this project (`prisma/schema.prisma`) targets PostgreSQL.
A SQLite copy for offline experiments is at `prisma/schema.sqlite.prisma`.
