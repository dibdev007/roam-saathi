// Central site configuration — single source of truth.
// REPLACE BUSINESS_PHONE / WHATSAPP_NUMBER with the owner's personal mobile before going live.

export const BUSINESS_NAME = "Roam Saathi";
export const TAGLINE = "Your Northeast Road Companion";
export const EMAIL = "saathiroam@gmail.com";

// PLACEHOLDER — owner must replace these with the actual personal mobile number.
export const BUSINESS_PHONE = "+916002775195";
export const BUSINESS_PHONE_DISPLAY = "+91 6002775195";

// WhatsApp number — digits only, no plus sign, no spaces. Same as BUSINESS_PHONE minus '+'.
export const WHATSAPP_NUMBER = "916002775195";

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

// Soft passcode gate for the admin portal (client-side check, demo only).
// Real auth can be added later via NextAuth or a server-side check.
export const ADMIN_PASSCODE = "roam2024";

// LGBI Airport coordinates (Borjhar, Guwahati)
export const GEO_LAT = 26.1061;
export const GEO_LNG = 91.5869;

// Canonical site URL — update when the real domain is live.
export const SITE_URL = "https://roamsaathi.in";

// Vehicle classes offered (single source of truth for selects & filters).
export const VEHICLE_CLASSES = ["SUV", "HATCHBACK", "SCOOTER", "VAN"] as const;
export type VehicleClass = (typeof VEHICLE_CLASSES)[number];

// Booking statuses (single source of truth).
export const BOOKING_STATUSES = [
  "New",
  "Contacted",
  "Confirmed",
  "Cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// Pickup types.
export const PICKUP_TYPES = [
  "Airport counter",
  "Hotel delivery",
  "Other",
] as const;
