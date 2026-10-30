"use client";

// Database tab — explains where data lives, provides backup download and
// the exact steps to switch from sandbox SQLite to Prisma Postgres in production.

import * as React from "react";
import { Download, Database as DbIcon, HardDrive, Cloud, ShieldCheck, Info, Wrench, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { type VehicleDTO, type BookingDTO } from "@/lib/siteConfig";

type Props = {
  vehicles: VehicleDTO[];
  bookings: BookingDTO[];
  settings: Record<string, string>;
};

export function DatabaseTab({ vehicles, bookings, settings }: Props) {
  const [repairing, setRepairing] = React.useState(false);

  async function downloadBackup() {
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roam-saathi-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
    } catch {
      toast.error("Could not create backup");
    }
  }

  /**
   * v6 security: the old "visit /api/setup?key=roam2024" instruction is
   * gone — that URL (with the key printed in plain text) no longer works.
   * Provisioning now runs automatically on the first visit of any page,
   * and this button calls the SAME endpoint with your signed admin session
   * cookie — no keys in URLs, nothing for a stranger to replay.
   */
  async function repairDatabase() {
    if (repairing) return;
    setRepairing(true);
    try {
      const res = await fetch("/api/setup", { method: "POST" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(j?.error ?? "Repair failed — check the database connection.");
        return;
      }
      toast.success(j?.message ?? "Database is ready — tables created, data untouched.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setRepairing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-forest">Database & backup</h2>
        <p className="text-sm text-muted-foreground">
          Where your vehicles, bookings and settings are stored — and how to make it permanent.
        </p>
      </div>

      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <HardDrive className="h-4 w-4" /> Current storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-forest text-cream">Live database</Badge>
            <span className="text-muted-foreground">
              Saving works — vehicles, bookings and settings persist across restarts and redeploys.
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="rounded-lg border border-[#e6ddc8] p-3 text-center">
              <p className="text-2xl font-extrabold text-forest">{vehicles.length}</p>
              <p className="text-xs text-muted-foreground">Vehicles</p>
            </div>
            <div className="rounded-lg border border-[#e6ddc8] p-3 text-center">
              <p className="text-2xl font-extrabold text-forest">{bookings.length}</p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </div>
            <div className="rounded-lg border border-[#e6ddc8] p-3 text-center">
              <p className="text-2xl font-extrabold text-forest">{Object.keys(settings).length}</p>
              <p className="text-xs text-muted-foreground">Settings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-saffron/40 bg-saffron/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <Cloud className="h-4 w-4 text-saffron" /> Going live? Switch to a free cloud database
          </CardTitle>
          <CardDescription>
            Free hosts like Vercel have an ephemeral filesystem — a SQLite file can&apos;t persist
            there. A free cloud database (Neon / Prisma Postgres / Supabase) keeps every vehicle,
            price and booking permanent. Setup takes about 10 minutes and needs no coding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Create a free database at <strong>neon.tech</strong> (or console.prisma.io) and copy
              the connection string — it looks like{" "}
              <code className="rounded bg-forest/10 px-1 py-0.5 text-xs">postgresql://…neon.tech/neondb?sslmode=require</code>
            </li>
            <li>
              In Vercel: Project → <strong>Settings → Environment Variables</strong> → add{" "}
              <code className="rounded bg-forest/10 px-1 py-0.5 text-xs">DATABASE_URL</code> with
              that value → <strong>Redeploy</strong>.
            </li>
            <li>
              Done — on the first visit the site <strong>creates its own tables</strong> and loads
              the starter fleet automatically. No setup URL, no keys.
            </li>
            <li>
              Done. Your fleet, rates and bookings now live in the cloud — permanent, shared across
              every device, and safe across redeploys.
            </li>
          </ol>
          <p className="flex items-start gap-2 rounded-lg border border-forest/20 bg-cream/70 p-3 text-xs text-forest/85">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            Prefer SQL? Paste <strong>prisma/setup.sql</strong> (included in the project) into the
            Neon SQL Editor instead of visiting the setup URL — same result. Full click-by-click
            guide: <strong>DATABASE_SETUP.md</strong> and the deployment PDF.
          </p>
        </CardContent>
      </Card>

      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <DbIcon className="h-4 w-4" /> Backup, restore &amp; repair
          </CardTitle>
          <CardDescription>
            One-click JSON backup of everything — vehicles, rates, bookings and settings. Keep a
            copy in your Google Drive each week. Repair re-creates any missing tables without
            touching your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={downloadBackup} className="bg-forest text-cream hover:bg-forest/90">
            <Download className="h-4 w-4" /> Download full backup (JSON)
          </Button>
          <Button
            onClick={repairDatabase}
            disabled={repairing}
            variant="outline"
            className="border-forest/25 text-forest"
          >
            {repairing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
            Repair / re-provision database
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg border border-forest/20 bg-forest/5 p-3 text-xs text-forest/80">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p>
          Everything you do in this admin panel — adding vehicles, changing prices, moving bookings
          through the pipeline — is written to the database immediately. Nothing is lost when you
          close the page.
        </p>
      </div>
    </div>
  );
}

export default DatabaseTab;
