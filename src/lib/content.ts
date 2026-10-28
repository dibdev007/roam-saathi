import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Wallet,
  Headphones,
  ShieldCheck,
  MapPinned,
  Compass,
  Send,
  CreditCard,
  KeyRound,
} from "lucide-react";

/** Static content for the customer view. Single source of truth for marketing copy. */

export const TRUST_BADGES = [
  "Verified drivers",
  "24/7 airport pickup",
  "Self-drive & chauffeur",
  "Transparent pricing",
];

export const STATS = [
  { value: "8", label: "NE states covered" },
  { value: "4", label: "vehicle classes" },
  { value: "24/7", label: "airport pickup" },
  { value: "100%", label: "tourist-only focus" },
];

export type FleetCategory = {
  key: string;
  name: string;
  tagline: string;
  fromPrice: number;
  seats: string;
  transmission: string;
  mode: string;
  imageKey: "fleet-suv" | "fleet-hatchback" | "fleet-scooter" | "fleet-van";
  examples: string[];
  blurb: string;
};

export const FLEET_CATEGORIES: FleetCategory[] = [
  {
    key: "suv",
    name: "SUVs",
    tagline: "For mountains, jungle & family trips",
    fromPrice: 3000,
    seats: "4–7 seats",
    transmission: "Manual & Automatic",
    mode: "Self-drive & chauffeur",
    imageKey: "fleet-suv",
    examples: ["Mahindra Thar", "Scorpio-N", "Maruti Ertiga"],
    blurb:
      "Rugged 4x4s and 7-seaters for Tawang, Mechuka, Kaziranga and the Shillong plateau.",
  },
  {
    key: "hatchback",
    name: "Hatchbacks",
    tagline: "Easy city hops & short transfers",
    fromPrice: 1800,
    seats: "5 seats",
    transmission: "Manual",
    mode: "Self-drive & chauffeur",
    imageKey: "fleet-hatchback",
    examples: ["Maruti Swift", "Hyundai i10", "Hyundai Aura"],
    blurb:
      "Compact, fuel-efficient and easy to park — perfect for Guwahati city tours and airport runs.",
  },
  {
    key: "scooter",
    name: "Scooters",
    tagline: "Self-drive city freedom",
    fromPrice: 500,
    seats: "2 seats",
    transmission: "Automatic / Manual",
    mode: "Self-drive only",
    imageKey: "fleet-scooter",
    examples: ["Honda Activa 6G", "Yamaha FZ-S"],
    blurb:
      "Zippy two-wheelers for Umananda, the riverside and short Guwahati hops. Helmets included.",
  },
  {
    key: "van",
    name: "Group Vans",
    tagline: "For families, groups & pilgrimages",
    fromPrice: 4500,
    seats: "7–17 seats",
    transmission: "Automatic & Manual",
    mode: "With driver",
    imageKey: "fleet-van",
    examples: ["Toyota Innova Crysta", "Force Traveller 12–17 seater"],
    blurb:
      "Premium Innovas and Tempo Travellers with chauffeur for groups heading to Shillong, Tawang or Majuli.",
  },
];

export type Route = {
  id: string;
  title: string;
  duration: string;
  vehicle: string;
  highlights: string[];
  note?: string;
};

export const ROUTES: Route[] = [
  {
    id: "shillong-cherrapunji",
    title: "Guwahati → Shillong → Cherrapunji",
    duration: "3N / 4D",
    vehicle: "SUV (Innova / Scorpio) with driver",
    highlights: ["Umiam Lake", "Elephant Falls", "Double Decker Living Root Bridge", "Nohkalikai Falls"],
  },
  {
    id: "kaziranga",
    title: "Guwahati → Kaziranga",
    duration: "2N / 3D",
    vehicle: "SUV or Innova with driver",
    highlights: ["Early-morning elephant safari", "Central Range jeep safari", "Kaziranga Orchid Park"],
  },
  {
    id: "tawang",
    title: "Guwahati → Tawang",
    duration: "6N / 7D",
    vehicle: "SUV (Thar / Scorpio) with driver",
    highlights: ["Bhalukpong / Sela Pass", "Tawang Monastery", "Madhuri Lake", "PTTso Lake"],
    note: "ILP required for Arunachal Pradesh — we help arrange it.",
  },
  {
    id: "manas",
    title: "Guwahati → Manas National Park",
    duration: "2N / 3D",
    vehicle: "SUV with driver",
    highlights: ["UNESCO World Heritage Site", "River rafting", "Tiger & golden langur spotting"],
  },
  {
    id: "majuli",
    title: "Guwahati → Majuli Island",
    duration: "3N / 4D",
    vehicle: "Hatchback/SUV + ferry",
    highlights: ["World's largest river island", "Satras (Vaishnavite monasteries)", "Mask-making village"],
  },
  {
    id: "guwahati-city",
    title: "Guwahati city day tour",
    duration: "1 day",
    vehicle: "Hatchback or sedan with driver",
    highlights: ["Kamakhya Temple", "Umananda Island", "Assam State Museum", "Sunset cruise on the Brahmaputra"],
  },
];

export type HowStep = { icon: LucideIcon; title: string; desc: string };

export const HOW_STEPS: HowStep[] = [
  {
    icon: Send,
    title: "Enquire on WhatsApp",
    desc: "Tap any WhatsApp button. Tell us your dates, pickup & destination. We reply within minutes.",
  },
  {
    icon: CreditCard,
    title: "Confirm & pay token",
    desc: "We share a quote. Confirm with a small token via UPI / bank transfer. Balance on pickup.",
  },
  {
    icon: KeyRound,
    title: "Airport / hotel pickup",
    desc: "Meet your driver at LGBI Airport (Borjhar) or get delivery to your Guwahati hotel.",
  },
  {
    icon: Compass,
    title: "Hit the road",
    desc: "Drive off with verified documents, 24/7 support, and a Saathi who knows the Northeast.",
  },
];

export type Reason = { icon: LucideIcon; title: string; desc: string };

export const REASONS: Reason[] = [
  {
    icon: MapPinned,
    title: "NE-local experts",
    desc: "Born and raised in Assam — we know the routes, permits, weather and hidden stops.",
  },
  {
    icon: BadgeCheck,
    title: "Verified drivers",
    desc: "Licensed, background-checked Saathis who drive these roads every week.",
  },
  {
    icon: ShieldCheck,
    title: "Well-maintained fleet",
    desc: "Serviced regularly, comprehensive insurance, clean and sanitized before every trip.",
  },
  {
    icon: Wallet,
    title: "Transparent pricing",
    desc: "No hidden charges. Quotes include driver allowance, toll and state taxes where applicable.",
  },
  {
    icon: Headphones,
    title: "24/7 support",
    desc: "Stuck at Sela Pass at 2 AM? Call us. A real human picks up — every time.",
  },
  {
    icon: Compass,
    title: "Tourist-only focus",
    desc: "We serve travelers, not daily commuters. Your trip gets our full attention.",
  },
];

export type Testimonial = {
  name: string;
  origin: string;
  text: string;
  trip: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aditya K.",
    origin: "Delhi",
    text: "Picked us up at LGBI at midnight, drove us to Shillong and Cherrapunji for 4 days. Spotless Innova, polite driver, fair price. Will book again.",
    trip: "Guwahati → Shillong → Cherrapunji",
  },
  {
    name: "Lakshmi R.",
    origin: "Bangalore",
    text: "Self-drive Thar for the Tawang run — the team arranged the ILP and explained every pass. Felt completely safe. Northeast experts for real.",
    trip: "Guwahati → Tawang",
  },
  {
    name: "Farhan S.",
    origin: "Mumbai",
    text: "Booked a Tempo Traveller for 14 of us. Punctual pickup, clean van, driver knew the best Kaziranga safari gate. Highly recommend.",
    trip: "Guwahati → Kaziranga",
  },
  {
    name: "Megha P.",
    origin: "Pune",
    text: "Rented an Activa for 2 days to explore Guwahati. Helmet included, paperwork took 5 minutes. The team even suggested a great local eatery.",
    trip: "Guwahati city",
  },
];

export type FAQ = { q: string; a: string };

export const FAQS: FAQ[] = [
  {
    q: "What documents do I need for a self-drive rental?",
    a: "A valid Indian driving licence (or International Driving Permit for foreign tourists), an Aadhaar/Passport for ID, and a credit/debit card or UPI for the security deposit. Foreign tourists can self-drive only if they hold an IDP recognised in India.",
  },
  {
    q: "Do I need an ILP / PAP for Arunachal Pradesh or other states?",
    a: "Yes — Arunachal Pradesh requires an Inner Line Permit (ILP) for all non-residents. Certain areas of Mizoram, Nagaland and Manipur may also need Restricted/Protected Area Permits. We help arrange ILPs for Tawang/Mechuka trips at no extra service charge; government fees apply.",
  },
  {
    q: "How much is the security deposit?",
    a: "Refundable security deposit is ₹3,000 for hatchbacks & scooters, ₹5,000 for SUVs, and ₹10,000 for Innovas/Tempo Travellers. Refunded within 48 hours of vehicle return after inspection.",
  },
  {
    q: "What is your fuel policy?",
    a: "Vehicle is delivered with a full tank (or full battery for EVs) and must be returned with the same level. For chauffeur-driven trips, fuel is included in the per-day rate for the booked km slab; extra km is charged at ₹12/km (car) or ₹18/km (SUV/van).",
  },
  {
    q: "What is the cancellation policy?",
    a: "Free cancellation up to 48 hours before pickup. 50% refund between 48–24 hours. No refund within 24 hours of pickup. Token is fully refunded if we cannot fulfill the booking for any reason.",
  },
  {
    q: "Are the driver's food and stay included?",
    a: "For trips within 80 km of Guwahati, driver allowance is included. For outstation trips (Shillong, Tawang, Kaziranga etc.), a daily driver allowance of ₹400 is added; the customer provides or reimburses driver accommodation if the trip involves a night halt.",
  },
  {
    q: "How does airport pickup at LGBI work?",
    a: "Share your flight number and arrival time. Our Saathi tracks the flight and waits at the arrivals gate with a name placard. Pickup is available 24/7 — even at 3 AM. No airport parking fee is charged to you for the first 60 minutes of waiting.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash, UPI (GPay/PhonePe/Paytm), NEFT/IMPS bank transfer, and major credit/debit cards. For international tourists we accept USD via bank transfer. We do not currently accept online card payments through a payment gateway — this keeps our prices low.",
  },
  {
    q: "Is the vehicle insured?",
    a: "All our vehicles carry comprehensive insurance with valid PUC. In case of an accident, the customer is liable for the insurance deductible (typically ₹5,000–₹15,000 depending on vehicle class) and any damage not covered by insurance.",
  },
  {
    q: "Can I drive at night in the Northeast?",
    a: "Self-drive night driving (10 PM – 5 AM) is discouraged in hilly areas due to fog and animal crossings. For chauffeur-driven trips, drivers rest after 10 PM; night driving beyond this is chargeable at ₹300/hour and only on plain highways. Please plan accordingly.",
  },
];
