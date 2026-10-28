import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || `page-${Date.now().toString(36)}`
  );
}

/** GET /api/admin/pages — all pages (drafts included). Admin only. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const pages = await db.page.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ pages });
}

/** POST /api/admin/pages — create a page. Admin only. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const b = await req.json();
    if (!b?.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let slug = slugify(b.slug || b.title);
    const clash = await db.page.findUnique({ where: { slug } });
    if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const created = await db.page.create({
      data: {
        title: String(b.title).trim().slice(0, 160),
        slug,
        type: String(b.type ?? "custom"),
        parentId: b.parentId ? String(b.parentId) : null,
        excerpt: String(b.excerpt ?? "").slice(0, 400),
        coverImage: b.coverImage ? String(b.coverImage) : null,
        blocks:
          typeof b.blocks === "string"
            ? b.blocks
            : JSON.stringify(Array.isArray(b.blocks) ? b.blocks : []),
        visibleOnHome: Boolean(b.visibleOnHome ?? false),
        showInMenu: Boolean(b.showInMenu ?? false),
        published: Boolean(b.published ?? false),
        sortOrder: Number(b.sortOrder ?? 10) || 10,
        seoDescription: b.seoDescription ? String(b.seoDescription).slice(0, 300) : null,
      },
    });
    return NextResponse.json({ ok: true, page: created }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/pages] error:", e);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
