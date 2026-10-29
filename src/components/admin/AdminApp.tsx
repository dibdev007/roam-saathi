"use client";

// Admin App — the Roam Saathi control room, rendered at /admin (never on the
// customer site). Auth is handled server-side by /admin/page.tsx; this
// component fetches all data centrally and shares it with every tab.
// v4 adds the Stays & Partners manager and the Growth & SEO cockpit.

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  CalendarRange,
  BookOpen,
  Building2,
  TrendingUp,
  Settings as SettingsIcon,
  Database,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { RhinoLogo } from "@/components/brand/RhinoLogo";
import { DashboardTab } from "@/components/admin/DashboardTab";
import { FleetManager } from "@/components/admin/FleetManager";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { PagesManager } from "@/components/admin/PagesManager";
import { HotelsManager } from "@/components/admin/HotelsManager";
import { GrowthTab } from "@/components/admin/GrowthTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { DatabaseTab } from "@/components/admin/DatabaseTab";
import {
  BUSINESS_NAME,
  TAGLINE,
  type VehicleDTO,
  type BookingDTO,
  type SettingsMap,
  type PageDTO,
  type HotelDTO,
} from "@/lib/siteConfig";

type TabKey =
  | "dashboard"
  | "fleet"
  | "bookings"
  | "pages"
  | "stays"
  | "growth"
  | "settings"
  | "database";

const TAB_META: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "fleet", label: "Fleet & Prices", icon: Car },
  { key: "bookings", label: "Bookings", icon: CalendarRange },
  { key: "pages", label: "Website Pages", icon: BookOpen },
  { key: "stays", label: "Stays & Partners", icon: Building2 },
  { key: "growth", label: "Growth & SEO", icon: TrendingUp },
  { key: "settings", label: "Settings", icon: SettingsIcon },
  { key: "database", label: "Database", icon: Database },
];

export function AdminApp({
  mustChangePassword: mustChangeProp = false,
}: {
  mustChangePassword?: boolean;
} = {}) {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabKey>("dashboard");

  const [vehicles, setVehicles] = React.useState<VehicleDTO[]>([]);
  const [bookings, setBookings] = React.useState<BookingDTO[]>([]);
  const [settings, setSettings] = React.useState<SettingsMap>({});
  const [pages, setPages] = React.useState<PageDTO[]>([]);
  const [hotels, setHotels] = React.useState<HotelDTO[]>([]);
  const [loading, setLoading] = React.useState(true);

  // v6 security — the portal stays locked until the publicly-known starter
  // password has been replaced with the owner's own password. The flag is
  // passed in from the server-rendered /admin page.
  const mustChangePassword = mustChangeProp;

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, bRes, sRes, pRes, hRes] = await Promise.all([
        fetch("/api/vehicles", { cache: "no-store" }),
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/settings", { cache: "no-store" }),
        fetch("/api/admin/pages", { cache: "no-store" }),
        fetch("/api/admin/hotels", { cache: "no-store" }),
      ]);
      if (vRes.ok) {
        const j = await vRes.json();
        setVehicles(j.vehicles ?? []);
      }
      if (bRes.ok) {
        const j = await bRes.json();
        setBookings(j.bookings ?? []);
      }
      if (sRes.ok) {
        const j = await sRes.json();
        setSettings(j.settings ?? {});
      }
      if (pRes.ok) {
        const j = await pRes.json();
        setPages(j.pages ?? []);
      }
      if (hRes.ok) {
        const j = await hRes.json();
        setHotels(j.hotels ?? []);
      }
    } catch {
      toast.error("Could not reach the server. Is the app running?");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function logout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.removeItem("rs_temp_pw");
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  }

  if (mustChangePassword) {
    return (
      <ForcedPasswordChange
        onDone={() => {
          // The password API cleared the flag server-side; re-render the
          // server component so the gate unmounts and the portal opens.
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Portal header */}
      <div className="sticky top-0 z-40 border-b border-forest/15 bg-forest text-cream shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <RhinoLogo light className="h-9 w-9" />
            <div>
              <p className="font-display text-sm font-bold tracking-wide">
                {BUSINESS_NAME} · Control Room
              </p>
              <p className="text-[11px] text-cream/60">{TAGLINE}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
              <TabsList className="h-9 flex-wrap bg-cream/10 p-0.5">
                {TAB_META.map(({ key, label, icon: Icon }) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="gap-1.5 px-2.5 text-xs text-cream/80 data-[state=active]:bg-cream data-[state=active]:text-forest"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream"
            >
              <Link href="/" target="_blank">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View site</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream"
              aria-label="Log out of admin"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div key={tab} className="tab-in">
          {tab === "dashboard" && (
            <DashboardTab
              vehicles={vehicles}
              bookings={bookings}
              pages={pages}
              hotels={hotels}
              loading={loading}
              onRefresh={refresh}
              onAddVehicle={() => setTab("fleet")}
              onGoToBookings={() => setTab("bookings")}
              onGoToPages={() => setTab("pages")}
              onGoToStays={() => setTab("stays")}
              onGoToGrowth={() => setTab("growth")}
            />
          )}
          {tab === "fleet" && (
            <FleetManager vehicles={vehicles} loading={loading} onRefresh={refresh} />
          )}
          {tab === "bookings" && (
            <BookingsManager
              bookings={bookings}
              vehicles={vehicles}
              loading={loading}
              onRefresh={refresh}
            />
          )}
          {tab === "pages" && (
            <PagesManager pages={pages} loading={loading} onRefresh={refresh} />
          )}
          {tab === "stays" && (
            <HotelsManager hotels={hotels} loading={loading} onRefresh={refresh} />
          )}
          {tab === "growth" && (
            <GrowthTab
              settings={settings}
              onSaved={(s) => {
                setSettings(s);
              }}
            />
          )}
          {tab === "settings" && (
            <SettingsTab
              settings={settings}
              onSaved={(s) => {
                setSettings(s);
              }}
            />
          )}
          {tab === "database" && (
            <DatabaseTab vehicles={vehicles} bookings={bookings} settings={settings} />
          )}
        </div>
      </main>

      <footer className="mt-auto border-t border-cream/15 bg-forest py-4 text-center text-xs text-cream/70">
        {BUSINESS_NAME} Control Room · Everything you save here is live on the website instantly
      </footer>
    </div>
  );
}

/**
 * Blocking first-login screen: the starter password is publicly known
 * (it appears in old setup guides), so the portal refuses to open until
 * the owner sets their own private password.
 */
function ForcedPasswordChange({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    // Prefill the password verified moments ago at login (this tab only).
    try {
      const t = sessionStorage.getItem("rs_temp_pw");
      if (t) setCurrent(t);
    } catch {
      /* ignore */
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      toast.error("The two new passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(j?.error ?? "Could not set the password");
        return;
      }
      try {
        sessionStorage.removeItem("rs_temp_pw");
      } catch {
        /* ignore */
      }
      toast.success("Password set — welcome to your secure portal!");
      onDone();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-forest px-4">
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#16A34A]/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-saffron/15 blur-3xl" />

      <Card className="relative w-full max-w-md border-white/10 bg-white/95 shadow-2xl backdrop-blur">
        <CardContent className="flex flex-col gap-4 p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron/15 text-saffron">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-forest">Set your own password</h1>
              <p className="text-sm text-muted-foreground">
                The starter password is public — the portal stays locked until you replace it.
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Current (starter) password"
                aria-label="Current password"
                className="pl-9"
                required
              />
            </div>
            <Input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="New password — 8+ characters"
              aria-label="New password"
              minLength={8}
              required
            />
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat the new password"
              aria-label="Confirm new password"
              minLength={8}
              required
            />
            <Button type="submit" disabled={busy} className="bg-forest text-cream hover:bg-forest/90">
              {busy ? "Saving…" : "Save password & open portal"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            Tip: mix letters, numbers and a symbol — e.g. <em>Guwahati#Rhino7</em>. You only do
            this once; after this the portal opens straight away.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminApp;
