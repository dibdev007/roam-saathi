import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import {
  ChevronRight,
  Home as HomeIcon,
  CalendarDays,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import { SiteHeader, SiteFooter, FloatingButtons } from "@/components/site/chrome";
import { PageBlocks } from "@/components/site/PageBlocks";
import { RhinoLogo } from "@/components/brand/RhinoLogo";
import { getContact } from "@/lib/contact";
import { getSiteSeo } from "@/lib/seo";
import { stripSecretSettings } from "@/lib/auth";
import {
  PAGE_TYPE_LABELS,
  type SettingsMap,
  type PageDTO,
} from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/* ---------------- data ---------------- */

async function loadSettings(): Promise<SettingsMap> {
  try {
    await ensureDatabaseReady();
    const rows = await db.settings.findMany();
    // v6 security: never serialize credentials/session material into the
    // client payload of a public page.
    return stripSecretSettings(
      Object.fromEntries(rows.map((r) => [r.key, r.value]))
    ) as SettingsMap;
  } catch {
    return {};
  }
}

async function loadPage(slug: string): Promise<PageDTO | null> {
  try {
    await ensureDatabaseReady();
    const p = await db.page.findFirst({
      where: { slug, published: true },
    });
    if (!p) return null;
    return {
      ...p,
      blocks: p.blocks,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    } as PageDTO;
  } catch {
    return null;
  }
}

async function loadChildren(parentId: string): Promise<PageDTO[]> {
  try {
    const rows = await db.page.findMany({
      where: { parentId, published: true },
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

async function loadParent(parentId: string | null): Promise<PageDTO | null> {
  if (!parentId) return null;
  try {
    const p = await db.page.findFirst({ where: { id: parentId } });
    if (!p) return null;
    return { ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() } as PageDTO;
  } catch {
    return null;
  }
}

async function loadMenuPages(): Promise<PageDTO[]> {
  try {
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

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) return { title: "Page not found" };
  const description =
    page.seoDescription || page.excerpt || `${page.title} — by Roam Saathi`;
  const keywords = (page.seoKeywords ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return {
    title: page.seoTitle?.trim() || page.title,
    description: description.slice(0, 300),
    ...(keywords.length ? { keywords } : {}),
    alternates: { canonical: `/p/${page.slug}` },
    openGraph: {
      title: page.seoTitle?.trim() || page.title,
      description: description.slice(0, 300),
      type: "article",
      images: page.coverImage ? [{ url: page.coverImage }] : undefined,
    },
  };
}

/* ---------------- view ---------------- */

export default async function PublicPage({ params }: Params) {
  const { slug } = await params;
  const settings = await loadSettings();
  const [page, menuPages] = await Promise.all([loadPage(slug), loadMenuPages()]);
  if (!page) notFound();

  const [children, parent] = await Promise.all([
    loadChildren(page.id),
    loadParent(page.parentId),
  ]);

  const contact = getContact(settings);
  let blocks: PageBlockSafe[] = [];
  try {
    const parsed = JSON.parse(page.blocks || "[]");
    if (Array.isArray(parsed)) blocks = parsed as PageBlockSafe[];
  } catch {
    blocks = [];
  }

  const typeLabel = PAGE_TYPE_LABELS[page.type] ?? "Story";
  const dateStr = new Date(page.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // v4 — Article + BreadcrumbList structured data for rich results
  const settingsSeo = getSiteSeo(settings);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.seoDescription || page.excerpt || undefined,
    image: page.coverImage && !page.coverImage.startsWith("data:") ? page.coverImage : undefined,
    datePublished: page.createdAt,
    dateModified: page.updatedAt,
    author: { "@type": "Organization", name: "Roam Saathi" },
    publisher: { "@type": "Organization", name: "Roam Saathi" },
    mainEntityOfPage: `${settingsSeo.siteUrl}/p/${page.slug}`,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: settingsSeo.siteUrl },
      ...(parent
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: parent.title,
              item: `${settingsSeo.siteUrl}/p/${parent.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: parent ? 3 : 2,
        name: page.title,
        item: `${settingsSeo.siteUrl}/p/${page.slug}`,
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader settings={settings} menuPages={menuPages} />

      <main className="flex-1">
        {/* Cover */}
        <section className="relative overflow-hidden bg-forest-deep text-cream">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              background:
                "radial-gradient(42rem 24rem at 12% -10%, rgba(22,163,74,0.55), transparent 60%), radial-gradient(36rem 22rem at 92% 20%, rgba(245,158,11,0.35), transparent 55%)",
            }}
          />
          <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-cream/60"
            >
              <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-saffron">
                <HomeIcon className="h-3 w-3" /> Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              {parent ? (
                <>
                  <Link href={`/p/${parent.slug}`} className="transition-colors hover:text-saffron">
                    {parent.title}
                  </Link>
                  <ChevronRight className="h-3 w-3" />
                </>
              ) : null}
              <span className="text-cream/90">{page.title}</span>
            </nav>

            <p className="inline-flex items-center gap-1.5 rounded-full border border-saffron/40 bg-saffron/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-saffron">
              <BookOpen className="h-3 w-3" /> {typeLabel}
            </p>
            <h1 className="font-display mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
              {page.title}
            </h1>
            {page.excerpt ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream/75 sm:text-lg">
                {page.excerpt}
              </p>
            ) : null}
            <p className="mt-5 flex items-center gap-2 text-xs text-cream/50">
              <CalendarDays className="h-3.5 w-3.5" /> Published {dateStr} ·{" "}
              {RhinoWordmark}
            </p>
          </div>
          {page.coverImage ? (
            <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
              { }
              <img
                src={page.coverImage}
                alt={page.title}
                className="max-h-[440px] w-full rounded-t-3xl border border-white/10 object-cover shadow-2xl"
              />
            </div>
          ) : null}
        </section>

        {/* Body */}
        <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <PageBlocks blocks={blocks} whatsapp={contact.whatsapp} phone={contact.phone} />
        </article>

        {/* Sub-pages */}
        {children.length > 0 && (
          <section className="mx-auto w-full max-w-3xl px-4 pb-14 sm:px-6" aria-label="More in this section">
            <h2 className="font-display text-xl font-bold text-forest sm:text-2xl">
              More in {page.title}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {children.map((c) => (
                <Link
                  key={c.id}
                  href={`/p/${c.slug}`}
                  className="card-lift group flex flex-col overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-sm"
                >
                  {c.coverImage ? (
                     
                    <img
                      src={c.coverImage}
                      alt={c.title}
                      loading="lazy"
                      className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="h-1.5 w-full bg-gradient-to-r from-forest via-[#16A34A] to-saffron" />
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-saffron-deep">
                      {PAGE_TYPE_LABELS[c.type] ?? "Story"}
                    </p>
                    <p className="font-display mt-1 text-base font-bold text-forest">{c.title}</p>
                    {c.excerpt && (
                      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink/70">
                        {c.excerpt}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-bold text-forest group-hover:text-saffron-deep">
                      Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back home CTA */}
        <section className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
          <div className="grain relative overflow-hidden rounded-3xl bg-forest px-6 py-8 text-cream sm:px-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#16A34A]/30 blur-2xl"
            />
            <p className="font-display relative text-xl font-bold sm:text-2xl">
              Planning a trip? We are one message away.
            </p>
            <p className="relative mt-1 text-sm text-cream/75">
              24×7 airport pickup · self-drive & chauffeur · all Northeast India.
            </p>
            <Link
              href="/"
              className="btn-sheen relative mt-5 inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-bold text-saffron-foreground shadow-lg transition-transform hover:scale-[1.03]"
            >
              Back to Roam Saathi <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter settings={settings} menuPages={menuPages} />
      <FloatingButtons settings={settings} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}

const RhinoWordmark = (
  <span className="inline-flex items-center gap-1 font-semibold text-cream/70">
    <RhinoLogo light className="h-3.5 w-3.5" /> Roam Saathi
  </span>
);

type PageBlockSafe = Parameters<typeof PageBlocks>[0]["blocks"][number];
