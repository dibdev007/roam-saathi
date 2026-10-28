import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { db } from "@/lib/db";
import {
  BUSINESS_NAME,
  TAGLINE,
  EMAIL,
  BUSINESS_PHONE,
  ADDRESS_LINE,
  SITE_URL,
  GEO_LAT,
  GEO_LNG,
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

const fullTitle =
  "Roam Saathi — Tourist Car Rental in Guwahati | Self Drive & Chauffeur, LGBI Airport";
const description =
  "Tourist car rental in Guwahati near LGBI Airport. Self drive & chauffeur SUVs, hatchbacks, scooters and group vans. 24/7 airport pickup, all Northeast India — Shillong, Kaziranga, Tawang, Cherrapunji.";
const keywords = [
  "car rental Guwahati",
  "self drive car Guwahati",
  "taxi Guwahati airport",
  "LGBI airport car rental",
  "Northeast India car rental",
  "Shillong taxi",
  "Tawang cab",
  "Kaziranga car hire",
  "Innova Crysta Guwahati",
  "Tempo Traveller Assam",
  "tourist vehicle rental Assam",
  "Borjhar car rental",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: fullTitle,
    template: `%s | ${BUSINESS_NAME}`,
  },
  description,
  keywords,
  authors: [{ name: BUSINESS_NAME }],
  creator: BUSINESS_NAME,
  publisher: BUSINESS_NAME,
  applicationName: BUSINESS_NAME,
  category: "Auto Rental",
  alternates: {
    canonical: SITE_URL,
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
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    title: fullTitle,
    description,
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Roam Saathi — Tourist vehicle rental near LGBI Airport, Guwahati",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: fullTitle,
    description,
    images: ["/hero.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  contact: {
    email: EMAIL,
    telephone: BUSINESS_PHONE,
  },
  other: {
    "geo.region": "IN-AS",
    "geo.placename": "Guwahati, Assam",
    "geo.position": `${GEO_LAT};${GEO_LNG}`,
    ICBM: `${GEO_LAT}, ${GEO_LNG}`,
  },
};

/** Load the owner-managed contact details so JSON-LD matches the live site. */
async function loadContactSettings(): Promise<{
  phone: string;
  whatsapp: string;
  email: string;
}> {
  try {
    const rows = await db.settings.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return {
      phone: map.businessPhone?.trim() || BUSINESS_PHONE,
      whatsapp: map.whatsappNumber?.replace(/\D/g, "") || "919876543210",
      email: map.email?.trim() || EMAIL,
    };
  } catch {
    return { phone: BUSINESS_PHONE, whatsapp: "919876543210", email: EMAIL };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contact = await loadContactSettings();

  // JSON-LD structured data — AutoRental LocalBusiness (DB-driven contacts)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: BUSINESS_NAME,
    alternateName: "Roam Saathi Tourist Vehicle Rental",
    description: description,
    tagline: TAGLINE,
    url: SITE_URL,
    image: `${SITE_URL}/hero.png`,
    logo: `${SITE_URL}/favicon.svg`,
    email: contact.email,
    telephone: contact.phone,
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
    sameAs: [`https://wa.me/${contact.whatsapp}`],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-center" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
