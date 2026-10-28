"use client";

// Shared helpers for the Roam Saathi admin portal.

export type VehicleFormState = {
  id?: string;
  name: string;
  brand: string;
  class: string;
  seats: string;
  transmission: string;
  fuelType: string;
  dailyRate: string;
  withDriverPerDay: string;
  withDriverAvailable: boolean;
  monthlyRate: string;
  kmLimitPerDay: string;
  extraKmRate: string;
  securityDeposit: string;
  driverBata: string;
  mileageKmpl: string;
  fuelNote: string;
  registrationNumber: string;
  imageUrl: string;
  features: string;
  description: string;
  available: boolean;
  popular: boolean;
  sortOrder: string;
};

export const CLASS_LABELS: Record<string, string> = {
  SUV: "SUV",
  HATCHBACK: "Hatchback",
  SEDAN: "Sedan",
  SCOOTER: "Scooter",
  BIKE: "Bike",
  VAN: "Van",
};

export const STATUS_STYLES: Record<string, string> = {
  New: "bg-saffron/15 text-saffron border-saffron/40",
  Contacted: "bg-amber-100/60 text-amber-800 border-amber-300/60",
  Confirmed: "bg-forest/10 text-forest border-forest/30",
  Ongoing: "bg-emerald-100/70 text-emerald-800 border-emerald-300/70",
  Completed: "bg-stone-200/70 text-stone-700 border-stone-300",
  Cancelled: "bg-red-100/70 text-red-700 border-red-300/60",
};

export function emptyVehicleForm(sortOrder = 100): VehicleFormState {
  return {
    name: "",
    brand: "",
    class: "SUV",
    seats: "5",
    transmission: "Manual",
    fuelType: "Petrol",
    dailyRate: "",
    withDriverPerDay: "",
    withDriverAvailable: true,
    monthlyRate: "",
    kmLimitPerDay: "150",
    extraKmRate: "",
    securityDeposit: "",
    driverBata: "",
    mileageKmpl: "",
    fuelNote: "",
    registrationNumber: "",
    imageUrl: "",
    features: "",
    description: "",
    available: true,
    popular: false,
    sortOrder: String(sortOrder),
  };
}

/** Convert a number-ish form string to number | null (empty -> null). */
export function numOrNull(v: string): number | null {
  const s = (v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** Escape a CSV cell. */
function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Build a bookings CSV (admin export). */
export function bookingsToCsv(bookings: Record<string, unknown>[]): string {
  const headers = [
    "Booking ID", "Customer", "Phone", "Vehicle Class", "Vehicle",
    "Pickup Type", "Pickup Location", "Pickup Date", "Return Date",
    "Destination", "With Driver", "Estimated Total (INR)", "Status", "Enquired At",
  ];
  const rows = bookings.map((b) =>
    [
      b.id, b.name, b.phone, b.vehicleClass, b.vehicleName,
      b.pickupType, b.pickupLocation, b.pickupDate, b.returnDate,
      b.destination, b.withDriver ? "Yes" : "No", b.estimatedTotal,
      b.status, b.createdAt,
    ].map(csvCell).join(","),
  );
  return [headers.map(csvCell).join(","), ...rows].join("\n");
}

/** Trigger a client-side file download. */
export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Format a date string without throwing on invalid values. */
export function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

/** Nights between two dates (min 1). */
export function nights(pickup: string, ret: string): number {
  const p = new Date(pickup).getTime();
  const r = new Date(ret).getTime();
  if (isNaN(p) || isNaN(r) || r <= p) return 1;
  return Math.max(1, Math.ceil((r - p) / 86_400_000));
}
