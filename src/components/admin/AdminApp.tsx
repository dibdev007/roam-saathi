"use client";

// Admin App — the Roam Saathi control room, rendered at /admin (never on the
// customer site). Auth is handled server-side by /admin/page.tsx; this
// component fetches all data centrally and shares it with every tab.
// v4 adds the Stays & Partners manager and the Growth & SEO cockpit.

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Car,
  CalendarRange,
  Users,
  BookOpen,
  Building2,
  TrendingUp,
  Settings as SettingsIcon,
  Database,
  LogOut,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { RhinoLogo } from "@/components/brand/RhinoLogo";
import { DashboardTab } from "@/components/admin/DashboardTab";
import { FleetManager } from "@/components/admin/FleetManager";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { CustomersManager } from "@/components/admin/CustomersManager";
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
  type CustomerDTO,
  type AgreementDTO,
} from "@/lib/siteConfig";

type TabKey =
  | "dashboard"
  | "fleet"
  | "bookings"
  | "customers"
  | "pages"
  | "stays"
  | "growth"
  | "settings"
  | "database";

const TAB_META: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "fleet", label: "Fleet & Prices", icon: Car },
  { key: "bookings", label: "Bookings", icon: CalendarRange },
  { key: "customers", label: "Customers", icon: Users },
  { key: "pages", label: "Website Pages", icon: BookOpen },
  { key: "stays", label: "Stays & Partners", icon: Building2 },
  { key: "growth", label: "Growth & SEO", icon: TrendingUp },
  { key: "settings", label: "Settings", icon: SettingsIcon },
  { key: "database", label: "Database", icon: Database },
];

export function AdminApp() {
  const [tab, setTab] = React.useState<TabKey>("dashboard");

  const [vehicles, setVehicles] = React.useState<VehicleDTO[]>([]);
  const [bookings, setBookings] = React.useState<BookingDTO[]>([]);
  const [settings, setSettings] = React.useState<SettingsMap>({});
  const [pages, setPages] = React.useState<PageDTO[]>([]);
  const [hotels, setHotels] = React.useState<HotelDTO[]>([]);
  const [customers, setCustomers] = React.useState<CustomerDTO[]>([]);
  const [agreements, setAgreements] = React.useState<AgreementDTO[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, bRes, sRes, pRes, hRes, cRes, aRes] = await Promise.all([
        fetch("/api/vehicles", { cache: "no-store" }),
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/settings", { cache: "no-store" }),
        fetch("/api/admin/pages", { cache: "no-store" }),
        fetch("/api/admin/hotels", { cache: "no-store" }),
        fetch("/api/admin/customers", { cache: "no-store" }),
        fetch("/api/admin/agreements", { cache: "no-store" }),
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
      if (cRes.ok) {
        const j = await cRes.json();
        setCustomers(j.customers ?? []);
      }
      if (aRes.ok) {
        const j = await aRes.json();
        setAgreements(j.agreements ?? []);
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
    window.location.href = "/";
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
          {tab === "customers" && (
            <CustomersManager
              customers={customers}
              agreements={agreements}
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

export default AdminApp;
