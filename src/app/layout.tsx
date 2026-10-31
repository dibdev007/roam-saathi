import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { getSiteSeo, buildFaqJsonLd } from "@/lib/seo";
import { MarketingScripts } from "@/components/site/Analytics";
import {
  BUSINESS_NAME,
  TAGLINE,
  SITE_URL,
  GEO_LAT,
  GEO_LNG,
  type SettingsMap,
} from "@/lib/siteConfig";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

/** All settings, loaded once per request for metadata + JSON-LD + scripts. */
async function loadSettings(): Promise<SettingsMap> {
  try {
    // Self-healing: guarantees the settings table exists (and is seeded on a
    // fresh database) before the first read — this powers SEO tags, contacts
    // and the admin-login credential lookup everywhere on the site.
    await ensureDatabaseReady();
    const rows = await db.settings.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return {};
  }
}

/** v7 — every social profile the owner connects becomes an entity link. */
function buildSameAs(settings: SettingsMap): string[] {
  const wa = (settings.whatsappNumber ?? "").replace(/\D/g, "") || "919876543210";
  const links = [`https://wa.me/${wa}`];
  for (const key of ["socialFacebookUrl", "socialInstagramUrl"] as const) {
    const v = (settings[key] ?? "").trim();
    if (/^https:\/\//i.test(v)) links.push(v);
  }
  return links;
}

/* ------------------------------------------------------------------ */
/* v4 — SEO metadata is now ADMIN-EDITABLE (Admin → Growth & SEO).      */
/* The settings below override every tag; static values are fallbacks.  */
/* ------------------------------------------------------------------ */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadSettings();
  const seo = getSiteSeo(settings);

  const ogImage = /^https?:\/\//i.test(seo.ogImage)
    ? seo.ogImage
    : `${seo.siteUrl}${seo.ogImage}`;

  return {
    metadataBase: new URL(seo.siteUrl || SITE_URL),
    title: {
      default: seo.title,
      template: `%s | ${BUSINESS_NAME}`,
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: BUSINESS_NAME }],
    creator: BUSINESS_NAME,
    publisher: BUSINESS_NAME,
    applicationName: BUSINESS_NAME,
    category: "Auto Rental",
    alternates: {
      canonical: seo.siteUrl || SITE_URL,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: seo.siteUrl || SITE_URL,
      siteName: BUSINESS_NAME,
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Roam Saathi — Tourist vehicle rental near LGBI Airport, Guwahati",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    ...(seo.verification ? { verification: { google: seo.verification } } : {}),
    other: {
      "geo.region": "IN-AS",
      "geo.placename": "Guwahati, Assam",
      "geo.position": `${GEO_LAT};${GEO_LNG}`,
      ICBM: `${GEO_LAT}, ${GEO_LNG}`,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await loadSettings();
  const seo = getSiteSeo(settings);

  // JSON-LD structured data — AutoRental LocalBusiness (DB-driven contacts)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: BUSINESS_NAME,
    alternateName: "Roam Saathi Tourist Vehicle Rental",
    description: seo.description,
    tagline: TAGLINE,
    url: seo.siteUrl,
    image: `${seo.siteUrl}/hero.png`,
    logo: `${seo.siteUrl}/favicon.svg`,
    email: seo.email,
    telephone: seo.phone,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Bank Transfer",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Near Lokpriya Gopinath Bordoloi International Airport, Borjhar",
      addressLocality: "Guwahati",
      addressRegion: "Assam",
      postalCode: "781015",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: GEO_LAT,
      longitude: GEO_LNG,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    areaServed: [
      { "@type": "State", name: "Assam" },
      { "@type": "State", name: "Meghalaya" },
      { "@type": "State", name: "Arunachal Pradesh" },
      { "@type": "State", name: "Nagaland" },
      { "@type": "State", name: "Manipur" },
      { "@type": "State", name: "Mizoram" },
      { "@type": "State", name: "Tripura" },
      { "@type": "State", name: "Sikkim" },
    ],
    sameAs: buildSameAs(settings),
  };

  // v7 — FAQ rich results for the exact searches travellers type
  // ("car rental near me", "taxi Guwahati airport", "Shillong cab").
  const faqJsonLd = buildFaqJsonLd(seo.phone);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        {/* GTM noscript must be first in <body> when GTM is enabled */}
        <MarketingScripts settings={settings} />
        {children}
        <Toaster richColors position="top-center" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </body>
    </html>
  );
}
