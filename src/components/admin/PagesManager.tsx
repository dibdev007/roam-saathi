"use client";

// Pages Manager — the no-code website builder.
// The owner can create blogs, travel diaries, customer stories, policy pages
// and any custom page; nest sub-pages; compose the content from blocks
// (headings, text, images, galleries, lists, quotes, callouts, CTAs);
// choose homepage visibility; and publish — all without touching code.

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Save,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
  BookOpen,
  Eye,
  EyeOff,
  Home,
  ListTree,
  HelpCircle,
  Upload,
  Link2,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  PAGE_TYPES,
  PAGE_TYPE_LABELS,
  type PageDTO,
  type PageBlock,
} from "@/lib/siteConfig";
import { PageBlocks } from "@/components/site/PageBlocks";
import { RhinoLogo } from "@/components/brand/RhinoLogo";

type Props = {
  pages: PageDTO[];
  loading: boolean;
  onRefresh: () => Promise<void>;
};

type PageForm = {
  id?: string;
  title: string;
  slug: string;
  type: string;
  parentId: string;
  excerpt: string;
  coverImage: string;
  blocks: PageBlock[];
  visibleOnHome: boolean;
  showInMenu: boolean;
  published: boolean;
  sortOrder: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

function emptyForm(): PageForm {
  return {
    title: "",
    slug: "",
    type: "blog",
    parentId: "",
    excerpt: "",
    coverImage: "",
    blocks: [],
    visibleOnHome: true,
    showInMenu: true,
    // v6 FIX: new pages start PUBLISHED. The homepage menu only lists
    // published pages, and owners who ticked "Show in menu" could not
    // understand why the page never appeared — the silent draft default
    // was the cause. Drafts are now the exception (turn the switch off
    // on purpose), not the silent default.
    published: true,
    sortOrder: "10",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function blocksFromJson(raw: string | null | undefined): PageBlock[] {
  try {
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? (arr as PageBlock[]) : [];
  } catch {
    return [];
  }
}

function pageToForm(p: PageDTO): PageForm {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    type: p.type,
    parentId: p.parentId ?? "",
    excerpt: p.excerpt,
    coverImage: p.coverImage ?? "",
    blocks: blocksFromJson(p.blocks),
    visibleOnHome: p.visibleOnHome,
    showInMenu: p.showInMenu,
    published: p.published,
    sortOrder: String(p.sortOrder ?? 10),
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    seoKeywords: p.seoKeywords ?? "",
  };
}

/** Compress an image file to a data URL so it can be stored in the database. */
async function fileToDataUrl(file: File, maxW = 1400, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (dataUrl.length > 1_800_000) {
    throw new Error("Image is too large even after compression — use a smaller file.");
  }
  return dataUrl;
}

/* ------------------------------------------------------------------ */
/* Small image-picker (URL or upload) reused by cover + image blocks   */
/* ------------------------------------------------------------------ */
function ImagePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  async function onFile(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    try {
      onChange(await fileToDataUrl(f));
      toast.success("Image added (stored inside the page).");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read that image");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Paste an image URL… or upload"
          value={value.startsWith("data:") ? "(uploaded image stored in page)" : value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="border-forest/25 text-forest"
        >
          {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && (
         
        <img
          src={value}
          alt="Preview"
          className="mt-1 h-24 w-auto rounded-lg border border-[#e6ddc8] object-cover"
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Block editor card                                                   */
/* ------------------------------------------------------------------ */
function BlockEditor({
  block,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onDuplicate,
}: {
  block: PageBlock;
  index: number;
  total: number;
  onChange: (b: PageBlock) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const TYPE_LABEL: Record<string, string> = {
    heading: "Heading",
    text: "Text",
    image: "Image",
    gallery: "Gallery",
    list: "List",
    quote: "Quote",
    callout: "Highlight box",
    cta: "Button (WhatsApp / Call / Link)",
    divider: "Divider",
  };

  return (
    <Card className="border-[#e6ddc8] bg-white/80">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 py-3">
        <CardTitle className="flex items-center gap-2 text-sm text-forest">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-forest/10 text-[11px] font-bold">
            {index + 1}
          </span>
          {TYPE_LABEL[block.type] ?? block.type}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move down">
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate} aria-label="Duplicate block">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={onRemove} aria-label="Remove block">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4 pt-0">
        {block.type === "heading" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
            <div className="space-y-1">
              <Label>Heading text</Label>
              <Input
                value={block.text}
                onChange={(e) => onChange({ ...block, text: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Size</Label>
              <Select
                value={String(block.level ?? 2)}
                onValueChange={(v) => onChange({ ...block, level: Number(v) as 2 | 3 })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Big (section)</SelectItem>
                  <SelectItem value="3">Small (sub)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {block.type === "text" && (
          <div className="space-y-1">
            <Label>Paragraphs (separate with an empty line)</Label>
            <Textarea
              rows={5}
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
            />
          </div>
        )}

        {block.type === "image" && (
          <div className="space-y-3">
            <ImagePicker
              label="Image"
              value={block.src}
              onChange={(v) => onChange({ ...block, src: v })}
            />
            <div className="space-y-1">
              <Label>Caption (optional)</Label>
              <Input
                value={block.caption ?? ""}
                onChange={(e) => onChange({ ...block, caption: e.target.value })}
              />
            </div>
          </div>
        )}

        {block.type === "gallery" && (
          <div className="space-y-2">
            {block.images.map((src, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <ImagePicker
                    label={`Photo ${i + 1}`}
                    value={src}
                    onChange={(v) => {
                      const images = [...block.images];
                      images[i] = v;
                      onChange({ ...block, images: images.filter(Boolean) });
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() =>
                    onChange({ ...block, images: block.images.filter((_, j) => j !== i) })
                  }
                  aria-label="Remove photo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange({ ...block, images: [...block.images, ""] })}
              className="border-forest/25 text-forest"
            >
              <Plus className="h-3.5 w-3.5" /> Add photo
            </Button>
          </div>
        )}

        {block.type === "list" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch
                id={`list-ordered-${index}`}
                checked={Boolean(block.ordered)}
                onCheckedChange={(v) => onChange({ ...block, ordered: v })}
              />
              <Label htmlFor={`list-ordered-${index}`}>Numbered list (1, 2, 3…)</Label>
            </div>
            <div className="space-y-1">
              <Label>Items (one per line)</Label>
              <Textarea
                rows={4}
                value={(block.items ?? []).join("\n")}
                onChange={(e) =>
                  onChange({
                    ...block,
                    items: e.target.value.split("\n").filter((l) => l.trim() !== ""),
                  })
                }
              />
            </div>
          </div>
        )}

        {block.type === "quote" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
            <div className="space-y-1">
              <Label>Quote</Label>
              <Textarea
                rows={3}
                value={block.text}
                onChange={(e) => onChange({ ...block, text: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Author (optional)</Label>
              <Input
                value={block.author ?? ""}
                onChange={(e) => onChange({ ...block, author: e.target.value })}
              />
            </div>
          </div>
        )}

        {block.type === "callout" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
              <div className="space-y-1">
                <Label>Title (optional)</Label>
                <Input
                  value={block.title ?? ""}
                  onChange={(e) => onChange({ ...block, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Colour</Label>
                <Select
                  value={block.tone ?? "green"}
                  onValueChange={(v) => onChange({ ...block, tone: v as "green" | "amber" | "cream" })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Green (info)</SelectItem>
                    <SelectItem value="amber">Amber (warning)</SelectItem>
                    <SelectItem value="cream">Cream (neutral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Text</Label>
              <Textarea
                rows={3}
                value={block.text}
                onChange={(e) => onChange({ ...block, text: e.target.value })}
              />
            </div>
          </div>
        )}

        {block.type === "cta" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Title (optional)</Label>
              <Input
                value={block.title ?? ""}
                onChange={(e) => onChange({ ...block, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Sub-text (optional)</Label>
              <Input
                value={block.text ?? ""}
                onChange={(e) => onChange({ ...block, text: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Button label</Label>
              <Input
                placeholder="Plan my trip on WhatsApp"
                value={block.buttonLabel}
                onChange={(e) => onChange({ ...block, buttonLabel: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Action</Label>
              <Select
                value={block.action}
                onValueChange={(v) =>
                  onChange({ ...block, action: v as "whatsapp" | "phone" | "link" })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">Open WhatsApp chat</SelectItem>
                  <SelectItem value="phone">Call the business number</SelectItem>
                  <SelectItem value="link">Go to a link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {block.action === "link" && (
              <div className="space-y-1 sm:col-span-2">
                <Label>Link URL</Label>
                <Input
                  placeholder="https://…"
                  value={block.url ?? ""}
                  onChange={(e) => onChange({ ...block, url: e.target.value })}
                />
              </div>
            )}
          </div>
        )}

        {block.type === "divider" && (
          <p className="text-xs text-muted-foreground">A thin separator line. Nothing to edit.</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main manager                                                        */
/* ------------------------------------------------------------------ */
export function PagesManager({ pages, loading, onRefresh }: Props) {
  const [editing, setEditing] = React.useState<PageForm | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const parents = pages.filter((p) => !p.parentId);
  const childrenOf = (id: string) => pages.filter((p) => p.parentId === id);

  async function save() {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast.error("Give the page a title first.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: editing.title.trim(),
        slug: editing.slug.trim() || slugify(editing.title),
        type: editing.type,
        parentId: editing.parentId || null,
        excerpt: editing.excerpt.trim(),
        coverImage: editing.coverImage.trim() || null,
        blocks: editing.blocks,
        visibleOnHome: editing.visibleOnHome,
        showInMenu: editing.showInMenu,
        published: editing.published,
        sortOrder: Number(editing.sortOrder) || 10,
        seoTitle: editing.seoTitle.trim() || null,
        seoDescription: editing.seoDescription.trim() || null,
        seoKeywords: editing.seoKeywords.trim() || null,
      };
      const res = await fetch(
        editing.id ? `/api/admin/pages/${editing.id}` : "/api/admin/pages",
        {
          method: editing.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(j?.error ?? "Save failed");
        return;
      }
      if (editing.published) {
        toast.success("Saved and LIVE at /p/" + (j?.page?.slug ?? payload.slug));
      } else if (editing.showInMenu || editing.visibleOnHome) {
        // v6 FIX: make the draft trap impossible to miss.
        toast.warning(
          "Saved as DRAFT — it will NOT appear in the menu or homepage until you switch Published ON.",
          { duration: 8000 }
        );
      } else {
        toast.success("Saved as draft.");
      }
      setEditing(null);
      await onRefresh();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(p: PageDTO, field: "published" | "visibleOnHome" | "showInMenu") {
    try {
      const res = await fetch(`/api/admin/pages/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !p[field] }),
      });
      if (!res.ok) throw new Error();
      await onRefresh();
      // v6 FIX: when menu/home is switched ON for a draft, remind the owner
      // that Published must also be ON — this was the "page not in menu" bug.
      if (field !== "published" && !p.published && p[field]) {
        toast.warning(`"${p.title}" is still a draft — switch Live ON to make it appear on the site.`, {
          duration: 8000,
        });
        return;
      }
      toast.success(
        field === "published"
          ? !p.published
            ? `"${p.title}" is now LIVE at /p/${p.slug}`
            : `"${p.title}" is hidden (draft).`
          : field === "visibleOnHome"
            ? !p.visibleOnHome
              ? "Card added to the homepage Stories & Guides section."
              : "Card removed from the homepage section."
            : !p.showInMenu
              ? `Added to the top menu + footer. Open /p/${p.slug} or the homepage to see it.`
              : "Removed from the top menu + footer."
      );
    } catch {
      toast.error("Could not update that switch.");
    }
  }

  async function remove(p: PageDTO) {
    if (!window.confirm(`Delete "${p.title}"? Its sub-pages will survive as standalone pages.`)) return;
    try {
      const res = await fetch(`/api/admin/pages/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await onRefresh();
      toast.success("Page deleted.");
    } catch {
      toast.error("Could not delete the page.");
    }
  }

  function addBlock(type: PageBlock["type"]) {
    if (!editing) return;
    const blank: PageBlock =
      type === "heading"
        ? { type, text: "New heading", level: 2 }
        : type === "text"
          ? { type, text: "Write here. Separate paragraphs with an empty line." }
          : type === "image"
            ? { type, src: "", caption: "" }
            : type === "gallery"
              ? { type, images: [] }
              : type === "list"
                ? { type, ordered: false, items: ["First point", "Second point"] }
                : type === "quote"
                  ? { type, text: "Quote text…", author: "" }
                  : type === "callout"
                    ? { type, title: "Good to know", text: "", tone: "green" }
                    : type === "cta"
                      ? { type, title: "", text: "", buttonLabel: "Book on WhatsApp", action: "whatsapp" }
                      : { type: "divider" };
    setEditing({ ...editing, blocks: [...editing.blocks, blank] });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-forest">Website Pages</h2>
          <p className="text-sm text-muted-foreground">
            Build blogs, travel diaries, customer stories and policy pages — no code, no developer.
          </p>
        </div>
        <Button onClick={() => setEditing(emptyForm())} className="bg-forest text-cream hover:bg-forest/90">
          <Plus className="h-4 w-4" /> Create new page
        </Button>
      </div>

      {/* Pages list */}
      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <ListTree className="h-4 w-4 text-saffron" /> Your pages ({pages.length})
          </CardTitle>
          <CardDescription>
            Flip the switches to publish (go live), show on the homepage, or add to the menu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && pages.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading pages…</p>
          )}
          {!loading && pages.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No pages yet — click “Create new page” to publish your first blog or diary.
            </p>
          )}
          {parents.map((p) => (
            <React.Fragment key={p.id}>
              <PageRow
                page={p}
                hasChildren={childrenOf(p.id).length > 0}
                onEdit={() => setEditing(pageToForm(p))}
                onToggle={(f) => void toggleField(p, f)}
                onDelete={() => void remove(p)}
              />
              {childrenOf(p.id).map((c) => (
                <PageRow
                  key={c.id}
                  page={c}
                  isChild
                  onEdit={() => setEditing(pageToForm(c))}
                  onToggle={(f) => void toggleField(c, f)}
                  onDelete={() => void remove(c)}
                />
              ))}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      {/* Help — "how to make it live" */}
      <Card className="border-saffron/40 bg-saffron/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <HelpCircle className="h-4 w-4 text-saffron" /> How to make sure your page is live
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground/85">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Fill the <b>title</b> — the web address is created automatically (you can edit it).</li>
            <li>Add content with <b>blocks</b>: text, photos, highlights, buttons. Use the live preview to check how it looks.</li>
            <li>Turn ON <b>Published</b> — the page goes live instantly at <code className="rounded bg-forest/10 px-1">/p/your-page-name</code>.</li>
            <li>Turn ON <b>Show on homepage</b> if you want a card in the “Stories &amp; Guides” section of the home page.</li>
            <li>Turn ON <b>Show in menu</b> to list it in the website menu and footer.</li>
            <li>Open the link in a new tab to verify. If an old version shows, hard-refresh with <b>Ctrl+Shift+R</b> (or Cmd+Shift+R on Mac).</li>
          </ol>
          <p className="text-xs text-muted-foreground">
            Drafts (Published OFF) are only visible inside this admin portal — customers never see them.
          </p>
        </CardContent>
      </Card>

      {/* Editor dialog */}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rs-scroll">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-forest">
              {editing?.id ? "Edit page" : "Create a new page"}
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5">
              {/* Meta fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Title *</Label>
                  <Input
                    value={editing.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditing({
                        ...editing,
                        title,
                        slug:
                          editing.id || editing.slug
                            ? editing.slug
                            : slugify(title),
                      });
                    }}
                    placeholder="e.g. Top 5 Waterfalls near Shillong"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Web address (/p/…)</Label>
                  <Input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                    placeholder="top-5-waterfalls-near-shillong"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Page type</Label>
                  <Select
                    value={editing.type}
                    onValueChange={(v) => setEditing({ ...editing, type: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAGE_TYPES.map((t) => (
                        <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Sub-page of (optional)</Label>
                  <Select
                    value={editing.parentId || "none"}
                    onValueChange={(v) => setEditing({ ...editing, parentId: v === "none" ? "" : v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Top level page —</SelectItem>
                      {pages
                        .filter((p) => p.id !== editing.id && !p.parentId)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Short excerpt (shown on cards)</Label>
                  <Textarea
                    rows={2}
                    value={editing.excerpt}
                    onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                    placeholder="One or two lines that make people want to open the page…"
                  />
                </div>
                <div className="sm:col-span-2">
                  <ImagePicker
                    label="Cover image (optional — shown on homepage/menu cards)"
                    value={editing.coverImage}
                    onChange={(v) => setEditing({ ...editing, coverImage: v })}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2 rounded-xl border border-[#e6ddc8] bg-cream/60 p-3.5">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-forest">
                    <Search className="h-4 w-4 text-saffron" /> Google search appearance (SEO)
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Custom SEO title (optional)</Label>
                      <Input
                        value={editing.seoTitle}
                        onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })}
                        maxLength={70}
                        placeholder={editing.title || "Defaults to the page title"}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Keywords (comma separated)</Label>
                      <Input
                        value={editing.seoKeywords}
                        onChange={(e) => setEditing({ ...editing, seoKeywords: e.target.value })}
                        maxLength={200}
                        placeholder="shillong trip diary, meghalaya road trip"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Google description (up to ~160 characters)</Label>
                      <Input
                        value={editing.seoDescription}
                        onChange={(e) => setEditing({ ...editing, seoDescription: e.target.value })}
                        maxLength={160}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Published pages are added to your sitemap automatically — Google discovers them on the next crawl.
                  </p>
                </div>
              </div>

              {/* Visibility switches */}
              {/* v6 FIX: loud warning when a menu/homepage page is still a draft. */}
              {!editing.published && (editing.showInMenu || editing.visibleOnHome) && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[13px] font-medium text-amber-900">
                  <EyeOff className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
                  <span>
                    This page is a <b>draft</b>. "Show in menu" and "Show on homepage" only work
                    after <b>Published</b> is switched ON — visitors cannot see drafts.
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#e6ddc8] p-4 sm:grid-cols-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    {editing.published ? <Eye className="h-4 w-4 text-forest" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <Label htmlFor="pg-published" className="cursor-pointer">Published (live)</Label>
                  </div>
                  <Switch
                    id="pg-published"
                    checked={editing.published}
                    onCheckedChange={(v) => setEditing({ ...editing, published: v })}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Home className="h-4 w-4 text-forest" />
                    <Label htmlFor="pg-home" className="cursor-pointer">Show on homepage</Label>
                  </div>
                  <Switch
                    id="pg-home"
                    checked={editing.visibleOnHome}
                    onCheckedChange={(v) => setEditing({ ...editing, visibleOnHome: v })}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <ListTree className="h-4 w-4 text-forest" />
                    <Label htmlFor="pg-menu" className="cursor-pointer">Show in menu</Label>
                  </div>
                  <Switch
                    id="pg-menu"
                    checked={editing.showInMenu}
                    onCheckedChange={(v) => setEditing({ ...editing, showInMenu: v })}
                  />
                </div>
              </div>

              {/* Blocks */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-sm font-semibold">Content blocks</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["heading", "text", "image", "gallery", "list", "quote", "callout", "cta", "divider"] as const).map((t) => (
                      <Button
                        key={t}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addBlock(t)}
                        className="h-7 border-forest/20 px-2 text-[11px] text-forest"
                      >
                        <Plus className="h-3 w-3" />
                        {t === "cta" ? "button" : t}
                      </Button>
                    ))}
                  </div>
                </div>
                {editing.blocks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-[#e6ddc8] p-4 text-center text-sm text-muted-foreground">
                    Empty page — add your first block with the buttons above.
                  </p>
                )}
                {editing.blocks.map((b, i) => (
                  <BlockEditor
                    key={i}
                    block={b}
                    index={i}
                    total={editing.blocks.length}
                    onChange={(nb) => {
                      const blocks = [...editing.blocks];
                      blocks[i] = nb;
                      setEditing({ ...editing, blocks });
                    }}
                    onMove={(dir) => {
                      const blocks = [...editing.blocks];
                      const j = i + dir;
                      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
                      setEditing({ ...editing, blocks });
                    }}
                    onRemove={() =>
                      setEditing({ ...editing, blocks: editing.blocks.filter((_, j) => j !== i) })
                    }
                    onDuplicate={() => {
                      const blocks = [...editing.blocks];
                      blocks.splice(i + 1, 0, JSON.parse(JSON.stringify(b)));
                      setEditing({ ...editing, blocks });
                    }}
                  />
                ))}
              </div>

              {/* Live preview */}
              {editing.blocks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Live preview</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewOpen((v) => !v)}>
                      <Eye className="h-3.5 w-3.5" /> {previewOpen ? "Hide preview" : "Show preview"}
                    </Button>
                  </div>
                  {previewOpen && (
                    <div className="rounded-xl border border-[#e6ddc8] bg-white p-4">
                      <div className="mb-3 flex items-center gap-2 border-b border-[#e6ddc8] pb-3">
                        <RhinoLogo withWordmark className="h-7 w-7" />
                        <span className="text-xs text-muted-foreground">/p/{editing.slug || slugify(editing.title)}</span>
                      </div>
                      <h1 className="font-display text-2xl font-bold text-forest">{editing.title || "Untitled page"}</h1>
                      {editing.excerpt && (
                        <p className="mt-1 text-sm text-muted-foreground">{editing.excerpt}</p>
                      )}
                      <div className="mt-4">
                        <PageBlocks
                          blocks={editing.blocks}
                          whatsapp="919876543210"
                          phone="+919876543210"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Save bar */}
              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[#e6ddc8] bg-white/95 py-3">
                <p className="text-xs text-muted-foreground">
                  {editing.published
                    ? `This page is LIVE at /p/${editing.slug || slugify(editing.title)}`
                    : "Saved as draft until you switch Published ON."}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditing(null)} className="border-forest/20 text-forest">
                    Cancel
                  </Button>
                  <Button onClick={save} disabled={saving} className="bg-forest text-cream hover:bg-forest/90">
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? "Saving…" : editing.id ? "Save changes" : "Create page"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One row in the pages list                                           */
/* ------------------------------------------------------------------ */
function PageRow({
  page,
  isChild,
  hasChildren,
  onEdit,
  onToggle,
  onDelete,
}: {
  page: PageDTO;
  isChild?: boolean;
  hasChildren?: boolean;
  onEdit: () => void;
  onToggle: (field: "published" | "visibleOnHome" | "showInMenu") => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-xl border p-3 transition-colors sm:gap-3 ${
        isChild ? "border-[#e6ddc8]/70 bg-white/60 sm:ml-8" : "border-[#e6ddc8] bg-white"
      } ${page.published ? "" : "opacity-75"}`}
    >
      {page.coverImage ? (
         
        <img
          src={page.coverImage}
          alt=""
          className="h-10 w-14 rounded-md border border-[#e6ddc8] object-cover"
        />
      ) : (
        <span className="flex h-10 w-14 items-center justify-center rounded-md border border-[#e6ddc8] bg-muted">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {isChild && <span className="mr-1 text-muted-foreground">↳</span>}
          {page.title}
          {!page.published && (
            <Badge className="ml-2 border-amber-300 bg-amber-100 text-[10px] text-amber-900">
              Draft — not on site
            </Badge>
          )}
          {hasChildren && (
            <Badge variant="outline" className="ml-2 border-forest/30 text-[10px] text-forest">
              + sub-pages
            </Badge>
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">/p/{page.slug}</p>
      </div>
      <Badge variant="outline" className="hidden border-forest/25 text-[10px] text-forest sm:inline-flex">
        {PAGE_TYPE_LABELS[page.type] ?? page.type}
      </Badge>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
          <Switch checked={page.published} onCheckedChange={() => onToggle("published")} aria-label="Publish" />
          Live
        </label>
        <label
          className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground"
          title="Show a card for this page inside the homepage Stories & Guides section"
        >
          <Switch checked={page.visibleOnHome} onCheckedChange={() => onToggle("visibleOnHome")} aria-label="Show card on homepage" />
          Home card
        </label>
        <label
          className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground"
          title="Add this page to the top navbar and footer menu of every page"
        >
          <Switch checked={page.showInMenu} onCheckedChange={() => onToggle("showInMenu")} aria-label="Show in navbar menu" />
          Top menu
        </label>
      </div>

      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View page">
          <Link href={`/p/${page.slug}`} target="_blank">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit} className="border-forest/20 text-forest">
          Edit
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-red-600 hover:bg-red-50"
          aria-label={`Delete ${page.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default PagesManager;
