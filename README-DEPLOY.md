# Roam Saathi Website — v9 (Deployment Package)

Tourist-only car rental site beside LGBI Airport, Guwahati — full owner
control room at the hidden `/admin` route, with a built-in CRM, one-time
e-sign rental agreements, the v7 "Rank 1" SEO upgrade, the v8
permanent-deletion fix, and the NEW v9 Popular Routes manager.

## What's new in v9

### 1. Admin → Popular Routes (new feature)
The "Where will the road take you?" homepage cards were hard-coded.
They now live in your database with a full manager:

- Add, edit, hide, reorder and delete route cards
  (title, duration, one-way km, recommended vehicle, up to 8
  highlights, note, show-on-homepage switch, sort order).
- Every card gets a "Plan this trip" button that opens WhatsApp with
  the route name pre-filled.
- Deleted everything? A "Restore the 6 starter routes" button brings
  the demo itineraries back on demand.
- Saves go live on the homepage instantly — no redeploy.

### 2. Routes delete PERMANENTLY (same promise as v8)
The v8 fix made vehicle/stay deletions permanent. v9 extends the same
seed-once protection to routes:

- Delete one route or all six — they never come back on refresh or
  cold start.
- Your existing production database is upgraded automatically on the
  first v9 request: ONLY the new routes table is added, nothing else
  is touched (your vehicles, stays, bookings, customers and
  agreements stay exactly as they are).
- If you delete every route, the public section shows a clean
  "New routes are being mapped" card with a WhatsApp button — never
  fake demo data.

### 3. Faster, richer UI (no new libraries)
- Hero and final CTA buttons gently follow the pointer (desktop only).
- Each route card draws its journey line on scroll, with pins that pop
  at origin and destination.
- Gradient ring highlight on hover for route cards.
- Every effect is transform/opacity-only (GPU-cheap), automatically
  disabled for visitors who prefer reduced motion, and lazy — nothing
  animates until it is on screen. Phones and desktops stay fast.

### Security posture (unchanged — always the priority)
- Every admin API (including the new routes APIs) verifies the signed
  httpOnly session cookie server-side. No route logic lives in
  browser-reachable code.
- The /admin portal stays hidden, noindexed and code-split: the page
  source reveals nothing about the portal's internals.
- Login throttle, scrypt password hashing and the v6 security headers
  all carry over unchanged.

## Deploy (same 3 steps as before)

1. Extract this zip on your computer.
2. Upload everything to your GitHub repo `dibdev007/roam-saathi`
   (drag-and-drop, replace files, commit — make sure the new
   `src/app/api/admin/routes` folder and `RoutesManager.tsx` are
   included, and delete nothing).
3. Vercel redeploys automatically (~2 minutes). No database work is
   needed — the first visitor triggers the automatic, safe upgrade
   described above.

After deploying, verify once:
1. Open roamsaathi.in/admin → Popular Routes → edit a route title →
   check the homepage card updates.
2. Add a test route → delete it → refresh — it stays deleted.
3. Delete ALL routes → homepage shows the "being mapped" card →
   press "Restore the 6 starter routes" in the admin to get them back.

Full marketing playbook: **Roam_Saathi_SEO_Rank1_Masterplan.pdf**.
