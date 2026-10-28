"use client";

// Roam Saathi public site shell (v3).
// The admin portal no longer lives here — it moved to the secret /admin route.
// This component owns the booking modal state and the shared site chrome.

import * as React from "react";

import { CustomerView } from "@/components/site/CustomerView";
import { SiteHeader, SiteFooter, FloatingButtons } from "@/components/site/chrome";
import { BookingModal, type BookingSeed } from "@/components/site/BookingModal";
import type { VehicleDTO, SettingsMap, PageDTO } from "@/lib/siteConfig";

type Images = Record<string, boolean>;

export function RoamSaathiApp({
  images,
  vehicles = [],
  settings = {},
  menuPages = [],
  homePages = [],
}: {
  images: Images;
  vehicles?: VehicleDTO[];
  settings?: SettingsMap;
  menuPages?: PageDTO[];
  homePages?: PageDTO[];
}) {
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [seed, setSeed] = React.useState<BookingSeed | null>(null);

  const openBooking = React.useCallback(() => {
    setSeed(null);
    setBookingOpen(true);
  }, []);

  const openBookingForVehicle = React.useCallback(
    (vehicle: VehicleDTO, mode?: "driver" | "self") => {
      setSeed({ vehicle, mode });
      setBookingOpen(true);
    },
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader settings={settings} menuPages={menuPages} onBook={openBooking} />
      <CustomerView
        images={images}
        vehicles={vehicles}
        settings={settings}
        homePages={homePages}
        onBook={openBooking}
        onBookVehicle={openBookingForVehicle}
      />
      <SiteFooter settings={settings} menuPages={menuPages} />
      <FloatingButtons settings={settings} />
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        settings={settings}
        vehicles={vehicles}
        seed={seed}
      />
    </div>
  );
}

export default RoamSaathiApp;
