import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/pages/[id] — update a page. Admin only. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const b = await req.json();

    // Optional slug change with clash handling
    let slugUpdate: object = {};
    if (b.slug != null) {
      const desired = String(b.slug)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      if (desired) {
        const clash = await db.page.findFirst({
          where: { slug: desired, id: { not: id } },
        });
        slugUpdate = { slug: clash ? `${desired}-${Date.now().toString(36).slice(-4)}` : desired };
      }
    }

    const updated = await db.page.update({
      where: { id },
      data: {
        ...(b.title != null ? { title: String(b.title).trim().slice(0, 160) } : {}),
        ...slugUpdate,
        ...(b.type != null ? { type: String(b.type) } : {}),
        ...(b.parentId !== undefined ? { parentId: b.parentId ? String(b.parentId) : null } : {}),
        ...(b.excerpt != null ? { excerpt: String(b.excerpt).slice(0, 400) } : {}),
        ...(b.coverImage !== undefined
          ? { coverImage: b.coverImage ? String(b.coverImage) : null }
          : {}),
        ...(b.blocks != null
          ? {
              blocks:
                typeof b.blocks === "string"
                  ? b.blocks
                  : JSON.stringify(Array.isArray(b.blocks) ? b.blocks : []),
            }
          : {}),
        ...(b.visibleOnHome != null ? { visibleOnHome: Boolean(b.visibleOnHome) } : {}),
        ...(b.showInMenu != null ? { showInMenu: Boolean(b.showInMenu) } : {}),
        ...(b.published != null ? { published: Boolean(b.published) } : {}),
        ...(b.sortOrder != null ? { sortOrder: Number(b.sortOrder) || 10 } : {}),
        ...(b.seoTitle !== undefined
          ? { seoTitle: b.seoTitle ? String(b.seoTitle).slice(0, 70) : null }
          : {}),
        ...(b.seoDescription !== undefined
          ? { seoDescription: b.seoDescription ? String(b.seoDescription).slice(0, 300) : null }
          : {}),
        ...(b.seoKeywords !== undefined
          ? { seoKeywords: b.seoKeywords ? String(b.seoKeywords).slice(0, 200) : null }
          : {}),
      },
    });
    return NextResponse.json({ ok: true, page: updated });
  } catch (e) {
    console.error("[PATCH /api/admin/pages/[id]] error:", e);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

/** DELETE /api/admin/pages/[id] — delete a page (children are detached). Admin only. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    // Detach children so they survive as standalone pages
    await db.page.updateMany({ where: { parentId: id }, data: { parentId: null } });
    await db.page.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/admin/pages/[id]] error:", e);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
