// Central site configuration — single source of truth.
// Contact values here are FALLBACKS: the live site prefers values saved in
// Admin → Settings (stored in the database) whenever they exist.

export const BUSINESS_NAME = "Roam Saathi";
export const TAGLINE = "Your Northeast Road Companion";
export const EMAIL = "saathiroam@gmail.com";

// PLACEHOLDER — owner must replace with the actual personal mobile number.
export const BUSINESS_PHONE = "+919876543210";
export const BUSINESS_PHONE_DISPLAY = "+91 98XXX XXXXX";

// WhatsApp number — digits only, no plus sign, no spaces.
export const WHATSAPP_NUMBER = "919876543210";

export const ADDRESS_LINE =
  "Near Lokpriya Gopinath Bordoloi International Airport, Borjhar, Guwahati, Assam 781015";
export const HOURS = "Open 24/7 · Airport pickup anytime";

export const SERVICE_AREAS = [
  "Guwahati",
  "LGBI Airport",
  "Shillong",
  "Kaziranga",
  "Cherrapunji",
  "Tawang",
  "Majuli",
  "All Northeast India",
];

// Soft passcode gate for the admin portal (also stored in DB settings as
// adminPasscode — the portal checks the DB value first, then this fallback).
export const ADMIN_PASSCODE = "roam2024";

// LGBI Airport coordinates (Borjhar, Guwahati)
export const GEO_LAT = 26.1061;
export const GEO_LNG = 91.5869;

// Canonical site URL — update when the real domain is live.
export const SITE_URL = "https://roamsaathi.in";

// Vehicle classes offered (single source of truth for selects & filters).
export const VEHICLE_CLASSES = [
  "SUV",
  "HATCHBACK",
  "SEDAN",
  "SCOOTER",
  "BIKE",
  "VAN",
] as const;
export type VehicleClass = (typeof VEHICLE_CLASSES)[number];

// Booking pipeline statuses (single source of truth).
export const BOOKING_STATUSES = [
  "New",
  "Contacted",
  "Confirmed",
  "Ongoing",
  "Completed",
  "Cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// Pickup types.
export const PICKUP_TYPES = [
  "Airport counter",
  "Hotel delivery",
  "Other",
] as const;

// Fuel & transmission options (admin fleet form).
export const FUEL_TYPES = ["Petrol", "Diesel", "Electric"] as const;
export const TRANSMISSIONS = ["Manual", "Automatic"] as const;

// Vehicle shape shared between server, customer view and admin portal.
export type VehicleDTO = {
  id: string;
  name: string;
  brand: string | null;
  class: string;
  seats: number;
  transmission: string;
  fuelType: string;
  dailyRate: number;
  withDriverPerDay: number | null;
  withDriverAvailable: boolean;
  monthlyRate: number | null;
  kmLimitPerDay: number | null;
  extraKmRate: number | null;
  securityDeposit: number | null;
  driverBata: number | null;
  registrationNumber: string | null;
  imageUrl: string | null;
  features: string | null;
  description: string;
  available: boolean;
  popular: boolean;
  sortOrder: number;
};

export type BookingDTO = {
  id: string;
  name: string;
  phone: string;
  pickupType: string;
  pickupLocation: string | null;
  pickupDate: string;
  returnDate: string;
  vehicleClass: string;
  vehicleName: string | null;
  destination: string | null;
  withDriver: boolean;
  estimatedTotal: number | null;
  message: string | null;
  status: string;
  createdAt: string;
};

export type SettingsMap = Record<string, string>;

/** Resolve a setting: DB value first, static fallback second. */
export function resolveSetting(
  key: "businessPhone" | "whatsappNumber" | "email" | "hours" | "address",
  settings: SettingsMap | undefined
): string {
  const dbVal = settings?.[key];
  if (dbVal && dbVal.trim() !== "") return dbVal.trim();
  switch (key) {
    case "businessPhone":
      return BUSINESS_PHONE;
    case "whatsappNumber":
      return WHATSAPP_NUMBER;
    case "email":
      return EMAIL;
    case "hours":
      return HOURS;
    case "address":
      return ADDRESS_LINE;
  }
}

/** Format INR compactly: 3500 -> "Rs 3,500". */
export function inr(n: number | null | undefined): string {
  if (n == null) return "—";
  return "Rs " + n.toLocaleString("en-IN");
}
