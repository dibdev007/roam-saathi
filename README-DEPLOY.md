# Roam Saathi Website — v8 (Deployment Package)

Tourist-only car rental site beside LGBI Airport, Guwahati — full owner
control room at the hidden `/admin` route, with a built-in CRM, one-time
e-sign rental agreements, the v7 "Rank 1" SEO upgrade, and the v8
permanent-deletion fix.

## What's new in v8 (deletions are now permanent)

The bug: deleting fleet vehicles or stays in the admin panel looked
undone — after a while the initial demo data (17 vehicles, 5 stays)
came back by itself.

Why it happened: the site's auto-setup helper treated "vehicle or stays
table is empty" as "database is brand new" and re-loaded the starter
data. Deleting ALL demo records therefore triggered a re-seed on the
next server cold start.

The fix (three layers):

1. Seed marker — after the first successful setup the database stores a
   `seed_version` row. Once it exists, auto-seeding NEVER runs again,
   no matter what you delete.
2. In-use detection — existing databases (your current production data)
   are recognised on the first v8 request and marked safe immediately.
   You do not need to change anything in the database.
3. Honest empty state — if you delete every vehicle, the website now
   shows a clean "fleet list is being updated" card with WhatsApp/call
   buttons instead of pretending the demo fleet still exists.

Nothing about adding/editing changes. Bookings, customers, agreements,
pages and settings were never affected.

## Deploy (same 3 steps as before)

1. Extract this zip on your computer.
2. Upload everything to your GitHub repo `dibdev007/roam-saathi`
   (drag-and-drop, replace files, commit).
3. Vercel redeploys automatically. No database change in v8 —
   your existing Postgres keeps every vehicle, page, booking,
   customer and agreement (plus one new harmless settings row).

After deploying, verify once:
1. Open roamsaathi.in/admin → Fleet → delete a test vehicle.
2. Wait 2 minutes, refresh — it stays deleted.
3. (Optional) delete ALL vehicles → the public site shows the
   "fleet is being updated" card → add your real vehicles.

Full marketing playbook: **Roam_Saathi_SEO_Rank1_Masterplan.pdf**.
