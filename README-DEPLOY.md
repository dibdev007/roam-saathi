# Roam Saathi Website — v4 (Deployment Package)

Tourist-only car rental site beside LGBI Airport, Guwahati — with a full
owner control room. This version adds **Stays & Partners** (hotel directory
for future collaborations), a **Growth & SEO cockpit** (edit Google listing
text + connect Google Analytics / GTM / Meta Pixel without code), a
next-level animated UI, and dynamic `sitemap.xml` / `robots.txt`.

## What's inside

| Area | Highlights |
| --- | --- |
| Public site | Animated hero (word reveal, aurora orbs, scroll progress), 3D-tilt fleet cards with fuel policy column, live fuel estimator, booking disclaimer flow, reviews marquee, admin-managed map & contact |
| `/stays` | Hotel directory: state filter, search, photos, prices, direct call/WhatsApp to the hotel + "Book with vehicle" combo CTA |
| `/p/<slug>` | Owner-created pages (blogs, travel diaries, customer stories, policies) with sub-pages, homepage visibility and per-page SEO fields |
| Admin `/admin` | Hidden portal (no public link, `noindex`). Dashboard, Fleet & prices CRUD, Bookings pipeline, No-code page builder, Stays & Partners manager, Growth & SEO (site URL, meta title/description/keywords, OG image, Search Console verification, GA4/GTM/Meta Pixel + custom snippets), Settings (phone/WhatsApp everywhere, map embed paste, fuel policies, password change), Database backup/export |

Admin default password: `roam2024` — **change it from Admin → Settings on day one.**

## Quick start (local)

```bash
npm install                 # or: bun install
cp .env.example .env        # then paste your DATABASE_URL
npx prisma db push          # create tables
npx prisma db push --schema prisma/schema.sqlite.prisma   # only if you use the SQLite file instead
npm run db:seed             # sample fleet, stays, settings
npm run dev                 # http://localhost:3000
```

The shipped `prisma/schema.prisma` targets **PostgreSQL** (Neon/Supabase/Vercel
Postgres). SQLite is available as `prisma/schema.sqlite.prisma` for quick local
trials — but always use Postgres in production (Vercel's filesystem is
read-only, so SQLite files do not persist there).

## Deploy (GitHub → Vercel → Neon Postgres)

1. **Database:** create a free project at [neon.tech](https://neon.tech) (or
   Supabase) and copy the **pooled** connection string.
2. **Push to GitHub:** create an empty repository and upload this folder's
   contents (keep `.gitignore`, do not commit `.env`).
3. **Vercel:** New Project → import the repo → Environment Variables:
   - `DATABASE_URL` = your Postgres pooled string
   - `ADMIN_SECRET` = any long random string
4. **Create tables:** locally run `npx prisma db push` against the cloud URL
   (paste it into `.env` first), then `npm run db:seed` for demo content —
   or delete the seed rows from Admin later.
5. **Open** `https://your-project.vercel.app/admin` → log in → set your real
   phone/WhatsApp in Settings → change the password.

Full zero-knowledge walkthrough: see the companion PDF guide
(*Roam Saathi Website & Admin Guide v4*).

## Tech notes

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui
- Prisma ORM · PostgreSQL in production (models: Vehicle, Booking, Page, Hotel, Settings)
- Images uploaded in admin are compressed to data URLs and stored in the
  database — no storage bucket needed, works on serverless.
- SEO: JSON-LD (`AutoRental`, `Article`, `BreadcrumbList`, `ItemList` of
  `LodgingBusiness`), dynamic sitemap/robots, per-page meta fields.
- Analytics: GA4 / GTM / Meta Pixel / custom `<script>` snippets injected
  from Admin → Growth & SEO (scripts are sanitized — only `<script>` tags run).
