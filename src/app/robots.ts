import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSiteSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * v4 — robots.txt generated from the admin-set site URL.
 * The admin portal and APIs stay out of search engines; everything else
 * (including the dynamic sitemap) is crawlable.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  let base = "";
  try {
    const rows = await db.settings.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    base = getSiteSeo(map).siteUrl;
  } catch {
    base = getSiteSeo({}).siteUrl;
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/admin/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
