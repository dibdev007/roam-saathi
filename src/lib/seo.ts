// v4 — Settings-driven SEO resolver.
//
// Every value here can be edited by the owner from Admin → Growth & SEO
// without touching code. Static fallbacks keep the site fully optimised
// even before the owner fills anything in.

import {
  BUSINESS_NAME,
  EMAIL,
  BUSINESS_PHONE,
  SITE_URL,
  type SettingsMap,
} from "@/lib/siteConfig";

export type SiteSeo = {
  siteUrl: string; // canonical origin, no trailing slash
  title: string; // full default title (home)
  description: string;
  keywords: string[];
  ogImage: string; // path or absolute URL
  verification: string | null; // Search Console / webmaster verification code
  phone: string;
  email: string;
};

const DEFAULT_KEYWORDS = [
  "car rental Guwahati",
  "car rental near me",
  "vehicles near me",
  "vehicles for rent near me",
  "taxi near me",
  "taxi service Guwahati",
  "taxi Guwahati airport",
  "airport taxi Guwahati",
  "cab service Guwahati",
  "cab booking Guwahati",
  "outstation cab Guwahati",
  "self drive car Guwahati",
  "self drive car rental Assam",
  "LGBI airport car rental",
  "Guwahati airport taxi service",
  "Northeast India car rental",
  "car hire Meghalaya",
  "Shillong taxi",
  "Shillong cab booking",
  "Cherrapunji taxi service",
  "Tawang cab",
  "Tawang taxi from Guwahati",
  "Kaziranga car hire",
  "Kaziranga safari taxi",
  "Kamakhya temple taxi",
  "Innova Crysta Guwahati",
  "Tempo Traveller Assam",
  "tourist vehicle rental Assam",
  "Borjhar car rental",
  "Mirza car rental",
  "vehicle rental Guwahati airport",
];

export const DEFAULT_SEO_TITLE =
  "Roam Saathi — Tourist Car Rental in Guwahati | Self Drive & Chauffeur, LGBI Airport";

export const DEFAULT_SEO_DESCRIPTION =
  "Tourist car rental in Guwahati near LGBI Airport. Self drive & chauffeur SUVs, hatchbacks, scooters and group vans. 24/7 airport pickup, all Northeast India — Shillong, Kaziranga, Tawang, Cherrapunji.";

function cleanOrigin(raw: string | undefined): string {
  const t = (raw ?? "").trim().replace(/\/+$/, "");
  if (!t) return SITE_URL;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

/** Build the live SEO profile: DB settings first, static defaults second. */
export function getSiteSeo(settings?: SettingsMap): SiteSeo {
  const s = settings ?? {};
  const keywordsRaw = (s.seoMetaKeywords ?? "").trim();

  return {
    siteUrl: cleanOrigin(s.seoSiteUrl),
    title: (s.seoMetaTitle ?? "").trim() || DEFAULT_SEO_TITLE,
    description: (s.seoMetaDescription ?? "").trim() || DEFAULT_SEO_DESCRIPTION,
    keywords: keywordsRaw
      ? keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean)
      : DEFAULT_KEYWORDS,
    ogImage: (s.seoOgImage ?? "").trim() || "/hero.png",
    verification: (s.seoVerification ?? "").trim() || null,
    phone: (s.businessPhone ?? "").trim() || BUSINESS_PHONE,
    email: (s.email ?? "").trim() || EMAIL,
  };
}

/* ------------------------------------------------------------------ */
/* v7 — FAQ rich results: helping Google answer the exact questions     */
/* travellers type ("car rental near LGBI airport", "self drive        */
/* Guwahati", "taxi to Shillong"). Rendered on the homepage as JSON-LD. */
/* ------------------------------------------------------------------ */

export function buildFaqJsonLd(phoneDisplay: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is there a car rental near LGBI Airport Guwahati?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Roam Saathi is located right near Lokpriya Gopinath Bordoloi International (LGBI) Airport in Borjhar, Guwahati, and the counter is open 24/7 for airport pickups. Call ${phoneDisplay} or book on the website and a vehicle waits for you at arrivals.`,
        },
      },
      {
        "@type": "Question",
        name: "Can I rent a self drive car in Guwahati?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Roam Saathi offers self drive hatchbacks, SUVs and scooters with transparent per-day rates. You need a valid driving licence, a government ID (Aadhaar/passport) and a refundable security deposit. Book on WhatsApp or through the website booking form.",
        },
      },
      {
        "@type": "Question",
        name: "Do you provide outstation taxis from Guwahati to Shillong, Kaziranga or Tawang?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Chauffeur-driven sedans, SUVs, Innova Crysta and Tempo Travellers run to Shillong, Cherrapunji, Kaziranga, Tawang, Majuli, Kamakhya Temple and every Northeast state. Fuel and tolls are included with driver; fares are quoted per route before you confirm.",
        },
      },
      {
        "@type": "Question",
        name: "How do I book a taxi or rental vehicle with Roam Saathi?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `The fastest way is WhatsApp — send your trip dates, route and vehicle preference and you get a confirmed fare within minutes. You can also call ${phoneDisplay} or use the booking form on roamsaathi.in. Airport pickup is available 24/7.`,
        },
      },
      {
        "@type": "Question",
        name: "Which areas does Roam Saathi serve?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Based near LGBI Airport, Borjhar, Guwahati, Roam Saathi serves Guwahati city, the airport and hotel delivery across the city, plus outstation trips across Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura and Sikkim.",
        },
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Custom tracking-script parser (Admin → Growth → Marketing)          */
/* The owner pastes whatever a tool gives them (GA, GTM, Meta, Clarity, */
/* Hotjar…). We extract only <script> tags — with their src/async attrs */
/* and inline bodies — and execute them via next/script. Everything     */
/* else in the paste is ignored, so it is safe by construction.         */
/* ------------------------------------------------------------------ */

export type ParsedScript = {
  src: string | null;
  inline: string | null;
  attrs: Record<string, string>;
};

export function parseScriptTags(input: string | undefined | null): ParsedScript[] {
  if (!input) return [];
  const out: ParsedScript[] = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    const attrStr = m[1] ?? "";
    const body = (m[2] ?? "").trim();
    const attrs: Record<string, string> = {};
    const attrRe = /([a-zA-Z-]+)\s*=\s*"([^"]*)"|([a-zA-Z-]+)\s*=\s*'([^']*)'/g;
    let a: RegExpExecArray | null;
    while ((a = attrRe.exec(attrStr)) !== null) {
      const name = (a[1] ?? a[3] ?? "").toLowerCase();
      const value = a[2] ?? a[4] ?? "";
      if (name && name !== "src") attrs[name] = value;
    }
    const srcMatch = attrStr.match(/\bsrc\s*=\s*"([^"]*)"|\bsrc\s*=\s*'([^']*)'/i);
    const src = srcMatch ? (srcMatch[1] ?? srcMatch[2] ?? null) : null;
    if (src) out.push({ src, inline: null, attrs });
    else if (body) out.push({ src: null, inline: body, attrs });
  }
  return out;
}
