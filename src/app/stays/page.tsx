import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { defaultStays } from "@/lib/setupData";
import { Building2, BedDouble, ShieldCheck, MessageCircle } from "lucide-react";

import { SiteHeader, SiteFooter, FloatingButtons } from "@/components/site/chrome";
import { StaysDirectory } from "@/components/site/StaysDirectory";
import { ScrollProgress } from "@/components/site/motion";
import { getContact } from "@/lib/contact";
import { getSiteSeo } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { stripSecretSettings } from "@/lib/auth";
import { hotelImages, type HotelDTO, type SettingsMap, type PageDTO } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

async function loadSettings(): Promise<SettingsMap> {
  try {
    await ensureDatabaseReady();
    const rows = await db.settings.findMany();
    return stripSecretSettings(
      Object.fromEntries(rows.map((r) => [r.key, r.value]))
    ) as SettingsMap;
  } catch {
    return {};
  }
}

async function loadHotels(): Promise<HotelDTO[]> {
  try {
    await ensureDatabaseReady();
    const rows = await db.hotel.findMany({
      where: { showOnSite: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((h) => ({ ...h })) as HotelDTO[];
  } catch {
    // Database unreachable — show the built-in partner stays so the
    // directory is never an empty page.
    return defaultStays() as HotelDTO[];
  }
}

async function loadMenuPages(): Promise<PageDTO[]> {
  try {
    await ensureDatabaseReady();
    const rows = await db.page.findMany({
      where: { showInMenu: true, published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })) as PageDTO[];
  } catch {
    return [];
  }
}

/* ---------------- SEO ---------------- */

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadSettings();
  const seo = getSiteSeo(settings);
  const title = "Partner Stays & Hotels — Northeast India | Book with Roam Saathi";
  const description =
    "Handpicked hotels, resorts and homestays across Assam, Meghalaya, Arunachal Pradesh and all Northeast India — paired with Roam Saathi airport pickup and self-drive vehicles. Direct booking contacts, honest prices.";
  return {
    title,
    description,
    keywords: [
      "hotels near Guwahati airport",
      "Shillong hotels",
      "Kaziranga resorts",
      "Tawang homestay",
      "Northeast India hotels",
      "Meghalaya stay",
      "hotel + car rental package Guwahati",
    ],
    alternates: { canonical: `${seo.siteUrl}/stays` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${seo.siteUrl}/stays`,
    },
  };
}

/* ---------------- JSON-LD: ItemList of LodgingBusiness ---------------- */

async function StaysJsonLd({ hotels }: { hotels: HotelDTO[] }) {
  const settings = await loadSettings();
  const seo = getSiteSeo(settings);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Roam Saathi partner stays — Northeast India",
    itemListElement: hotels.slice(0, 20).map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LodgingBusiness",
        name: h.name,
        description: h.description || undefined,
        telephone: h.phone,
        priceRange: h.priceFrom ? `₹${h.priceFrom}+ per night` : undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: h.area ?? undefined,
          addressLocality: h.city,
          addressRegion: h.state,
          addressCountry: "IN",
        },
        ...(h.mapUrl ? { hasMap: h.mapUrl } : {}),
        ...(hotelImages(h).length
          ? { image: hotelImages(h).filter((x) => !x.startsWith("data:")).slice(0, 3) }
          : {}),
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/* ---------------- view ---------------- */

export default async function StaysPage() {
  const [settings, hotels, menuPages] = await Promise.all([
    loadSettings(),
    loadHotels(),
    loadMenuPages(),
  ]);
  const contact = getContact(settings);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <ScrollProgress />
      <SiteHeader settings={settings} menuPages={menuPages} />
      <main className="flex-1">
        {/* Hero band */}
        <section className="grain hero-mesh relative overflow-hidden text-cream">
          <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-16">
            <p className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-3.5 py-1.5 text-[12px] font-semibold backdrop-blur">
              <Building2 className="h-3.5 w-3.5 text-saffron" />
              Stays &amp; Partners · Northeast India
            </p>
            <h1 className="font-display mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
              Sleep well.{" "}
              <span className="bg-gradient-to-r from-saffron via-[#ffd27a] to-saffron bg-clip-text text-transparent">
                Then drive somewhere amazing.
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-cream/80 sm:text-base">
              Handpicked hotels, resorts and homestays across the Northeast — from
              airport-side convenience in Guwahati to lakeside cottages in Meghalaya
              and monastery views in Tawang. Contact them directly, or let us bundle
              the stay with your vehicle.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-cream/75">
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="h-4 w-4 text-saffron" /> Verified listings
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-saffron" /> Traveller support by us
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-saffron" />{" "}
                <a
                  href={buildWhatsAppUrl("Hello Roam Saathi! Help me pick a stay for my Northeast trip.", contact.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-saffron"
                >
                  Ask us anything
                </a>
              </span>
            </div>
          </div>
        </section>

        {/* Directory */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <StaysDirectory hotels={hotels} settings={settings} />
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} menuPages={menuPages} />
      <FloatingButtons settings={settings} />
      <StaysJsonLd hotels={hotels} />
    </div>
  );
}
