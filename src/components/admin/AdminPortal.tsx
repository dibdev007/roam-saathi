"use client";

// Admin Portal — Roam Saathi control room.
// Tabs: Dashboard · Fleet · Bookings · Settings · Database.
// Data is fetched centrally here and shared with every tab so all views
// stay in sync after each save.

import * as React from "react";
import {
  LayoutDashboard,
  Car,
  CalendarRange,
  Settings as SettingsIcon,
  Database,
  LogOut,
  Lock,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { RhinoLogo } from "@/components/brand/RhinoLogo";
import { DashboardTab } from "@/components/admin/DashboardTab";
import { FleetManager } from "@/components/admin/FleetManager";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { DatabaseTab } from "@/components/admin/DatabaseTab";
import {
  BUSINESS_NAME,
  TAGLINE,
  ADMIN_PASSCODE,
  type VehicleDTO,
  type BookingDTO,
  type SettingsMap,
} from "@/lib/siteConfig";

type Props = {
  onExit: () => void;
  dbSettings?: SettingsMap;
};

type TabKey = "dashboard" | "fleet" | "bookings" | "settings" | "database";

const TAB_META: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "fleet", label: "Fleet", icon: Car },
  { key: "bookings", label: "Bookings", icon: CalendarRange },
  { key: "settings", label: "Settings", icon: SettingsIcon },
  { key: "database", label: "Database", icon: Database },
];

export function AdminPortal({ onExit, dbSettings = {} }: Props) {
  const [unlocked, setUnlocked] = React.useState(false);
  const [passcode, setPasscode] = React.useState("");
  const [tab, setTab] = React.useState<TabKey>("dashboard");

  const [vehicles, setVehicles] = React.useState<VehicleDTO[]>([]);
  const [bookings, setBookings] = React.useState<BookingDTO[]>([]);
  const [settings, setSettings] = React.useState<SettingsMap>(dbSettings);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, bRes, sRes] = await Promise.all([
        fetch("/api/vehicles", { cache: "no-store" }),
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/settings", { cache: "no-store" }),
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
    } catch {
      toast.error("Could not reach the server. Is the app running?");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (unlocked) void refresh();
  }, [unlocked, refresh]);

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    const expected = settings.adminPasscode || ADMIN_PASSCODE;
    if (passcode === expected) {
      setUnlocked(true);
      toast.success(`Welcome back to the ${BUSINESS_NAME} control room!`);
    } else {
      toast.error("Wrong passcode. Try again.");
    }
  }

  /* ---------------- Passcode gate ---------------- */
  if (!unlocked) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-sm border-[#e6ddc8]">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-cream">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-forest">{BUSINESS_NAME} Admin</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your passcode to manage fleet, rates and bookings.
              </p>
            </div>
            <form onSubmit={tryUnlock} className="flex w-full flex-col gap-2">
              <Input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode"
                aria-label="Admin passcode"
                autoFocus
              />
              <Button type="submit" className="bg-forest text-cream hover:bg-forest/90">
                Unlock portal
              </Button>
            </form>
            <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground">
              Back to website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------- Portal ---------------- */
  return (
    <>
      {/* Portal header */}
      <div className="border-b border-[#e6ddc8] bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <RhinoLogo withWordmark className="h-9 w-9" />
            <div>
              <p className="text-sm font-extrabold text-forest">Control Room</p>
              <p className="text-xs text-muted-foreground">{TAGLINE}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
              <TabsList className="h-9 bg-forest/5">
                {TAB_META.map(({ key, label, icon: Icon }) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="gap-1.5 px-3 text-xs data-[state=active]:bg-forest data-[state=active]:text-cream"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="sm"
              onClick={onExit}
              className="border-forest/20 text-forest"
              aria-label="Exit admin portal"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">View site</span>
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {tab === "dashboard" && (
          <DashboardTab
            vehicles={vehicles}
            bookings={bookings}
            loading={loading}
            onRefresh={refresh}
            onAddVehicle={() => setTab("fleet")}
            onGoToBookings={() => setTab("bookings")}
          />
        )}
        {tab === "fleet" && (
          <FleetManager vehicles={vehicles} loading={loading} onRefresh={refresh} />
        )}
        {tab === "bookings" && (
          <BookingsManager bookings={bookings} vehicles={vehicles} loading={loading} onRefresh={refresh} />
        )}
        {tab === "settings" && (
          <SettingsTab
            settings={settings}
            onSaved={(s) => {
              setSettings(s);
              // Same-tab settings changes should reflect in the fleet tab too
              void refresh();
            }}
          />
        )}
        {tab === "database" && (
          <DatabaseTab vehicles={vehicles} bookings={bookings} settings={settings} />
        )}
      </main>

      <footer className="border-t border-cream/15 bg-forest py-4 text-center text-xs text-cream/70">
        {BUSINESS_NAME} Control Room · All data saves to the database instantly
      </footer>
    </>
  );
}

export default AdminPortal;
