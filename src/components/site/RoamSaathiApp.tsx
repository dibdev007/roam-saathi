"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, ShieldCheck } from "lucide-react";

import { CustomerView } from "@/components/site/CustomerView";
import { AdminPortal } from "@/components/admin/AdminPortal";
import { RhinoLogo } from "@/components/brand/RhinoLogo";
import { BUSINESS_NAME, TAGLINE } from "@/lib/siteConfig";

type View = "customer" | "admin";
type Images = Record<string, boolean>;

const VIEW_STORAGE_KEY = "rs_view";

/**
 * Top-level client app — switches between Customer and Admin views.
 * The view toggle is persisted to localStorage so reloads don't lose context.
 */
export function RoamSaathiApp({ images }: { images: Images }) {
  const [view, setView] = React.useState<View>("customer");

  // Restore view on mount (client-only, no SSR mismatch)
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_STORAGE_KEY) as View | null;
      if (saved === "admin" || saved === "customer") {
        setView(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  function changeView(v: string) {
    const next = v === "admin" ? "admin" : "customer";
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    // Scroll to top on view change for clarity
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }

  if (view === "admin") {
    return (
      <div className="flex min-h-screen flex-col bg-cream">
        {/* Top toggle bar — sticky so admins can always exit */}
        <div className="sticky top-0 z-50 border-b border-forest/15 bg-forest text-cream">
          <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-medium">
              <RhinoLogo light className="h-5 w-5" />
              <span className="hidden sm:inline">{BUSINESS_NAME} · {TAGLINE}</span>
            </div>
            <Tabs value={view} onValueChange={changeView}>
              <TabsList className="h-7 bg-cream/15 p-0.5">
                <TabsTrigger value="customer" className="h-6 px-3 text-xs data-[state=active]:bg-cream data-[state=active]:text-forest">
                  <Car className="h-3 w-3" /> Customer
                </TabsTrigger>
                <TabsTrigger value="admin" className="h-6 px-3 text-xs data-[state=active]:bg-cream data-[state=active]:text-forest">
                  <ShieldCheck className="h-3 w-3" /> Admin
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <AdminPortal onExit={() => changeView("customer")} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Top toggle bar — sticky on customer view too */}
      <div className="sticky top-0 z-50 border-b border-forest/15 bg-forest text-cream">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-medium">
            <RhinoLogo light className="h-5 w-5" />
            <span className="hidden sm:inline">{BUSINESS_NAME} · {TAGLINE}</span>
          </div>
          <Tabs value={view} onValueChange={changeView}>
            <TabsList className="h-7 bg-cream/15 p-0.5">
              <TabsTrigger value="customer" className="h-6 px-3 text-xs data-[state=active]:bg-cream data-[state=active]:text-forest">
                <Car className="h-3 w-3" /> Customer
              </TabsTrigger>
              <TabsTrigger value="admin" className="h-6 px-3 text-xs data-[state=active]:bg-cream data-[state=active]:text-forest">
                <ShieldCheck className="h-3 w-3" /> Admin
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <CustomerView images={images} />
    </div>
  );
}

export default RoamSaathiApp;
