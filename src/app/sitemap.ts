import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { getSiteSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * v4 — dynamic sitemap. Every published owner page (/p/<slug>) and the
 * Stays directory are included automatically, so newly created admin pages
 * are discoverable by Google the moment they are published.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await loadSettings();
  const base = getSiteSeo(settings).siteUrl;

  const entries: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/stays`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const pages = await db.page.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      select: { slug: true, updatedAt: true },
    });
    for (const p of pages) {
      entries.push({
        url: `${base}/p/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // DB unreachable — ship the static entries anyway.
  }

  return entries;
}

async function loadSettings(): Promise<Record<string, string>> {
  try {
    await ensureDatabaseReady();
    const rows = await db.settings.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return {};
  }
}
