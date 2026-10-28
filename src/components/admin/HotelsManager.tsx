"use client";

// Stays & Partners manager (v4) — the future-collaborations module.
// The owner adds hotels/resorts/homestays with state, city, phone, price,
// photos and booking contacts; everything goes live on /stays instantly.
// Photos are compressed to data URLs and stored in the database, so this
// works on Vercel (read-only filesystem) without any storage bucket.

import * as React from "react";
import {
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Upload,
  Building2,
  Handshake,
  Star,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Link2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { fileToDataUrl } from "@/components/admin/adminShared";
import {
  HOTEL_CATEGORIES,
  HOTEL_CATEGORY_STYLES,
  hotelImages,
  hotelPhoneDisplay,
  inr,
  type HotelDTO,
} from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

type Props = {
  hotels: HotelDTO[];
  loading: boolean;
  onRefresh: () => Promise<void>;
};

type HotelForm = {
  id?: string;
  name: string;
  state: string;
  city: string;
  area: string;
  phone: string;
  whatsapp: string;
  priceFrom: string;
  category: string;
  description: string;
  amenities: string;
  images: string[];
  bookingUrl: string;
  mapUrl: string;
  partner: boolean;
  featured: boolean;
  showOnSite: boolean;
  sortOrder: string;
};

function emptyForm(): HotelForm {
  return {
    name: "",
    state: "Assam",
    city: "",
    area: "",
    phone: "",
    whatsapp: "",
    priceFrom: "",
    category: "Standard",
    description: "",
    amenities: "",
    images: [],
    bookingUrl: "",
    mapUrl: "",
    partner: false,
    featured: false,
    showOnSite: true,
    sortOrder: "10",
  };
}

function hotelToForm(h: HotelDTO): HotelForm {
  return {
    id: h.id,
    name: h.name,
    state: h.state,
    city: h.city,
    area: h.area ?? "",
    phone: h.phone,
    whatsapp: h.whatsapp ?? "",
    priceFrom: h.priceFrom != null ? String(h.priceFrom) : "",
    category: h.category,
    description: h.description,
    amenities: h.amenities ?? "",
    images: hotelImages(h),
    bookingUrl: h.bookingUrl ?? "",
    mapUrl: h.mapUrl ?? "",
    partner: h.partner,
    featured: h.featured,
    showOnSite: h.showOnSite,
    sortOrder: String(h.sortOrder ?? 10),
  };
}

export function HotelsManager({ hotels, loading, onRefresh }: Props) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<HotelForm>(emptyForm());
  const [busy, setBusy] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  function startCreate() {
    setEditing(emptyForm());
    setOpen(true);
  }

  function startEdit(h: HotelDTO) {
    setEditing(hotelToForm(h));
    setOpen(true);
  }

  async function save() {
    if (!editing.name.trim() || !editing.city.trim() || !editing.phone.trim()) {
      toast.error("Name, city and booking phone are required.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...editing,
        priceFrom: editing.priceFrom ? Number(editing.priceFrom) : null,
        sortOrder: Number(editing.sortOrder) || 10,
      };
      const res = await fetch(
        editing.id ? `/api/admin/hotels/${editing.id}` : "/api/admin/hotels",
        {
          method: editing.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error ?? "Save failed");
      toast.success(
        editing.id ? "Stay updated — live on /stays." : "Stay added — live on /stays!"
      );
      setOpen(false);
      await onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(h: HotelDTO, field: "showOnSite" | "featured" | "partner") {
    try {
      const res = await fetch(`/api/admin/hotels/${h.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !h[field] }),
      });
      if (!res.ok) throw new Error();
      await onRefresh();
    } catch {
      toast.error("Could not update that switch.");
    }
  }

  async function remove(h: HotelDTO) {
    if (!window.confirm(`Remove "${h.name}" from the website? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/hotels/${h.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Stay removed.");
      await onRefresh();
    } catch {
      toast.error("Could not delete that stay.");
    }
  }

  async function addImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const next: string[] = [...editing.images];
      for (const f of Array.from(files).slice(0, 6)) {
        next.push(await fileToDataUrl(f));
      }
      setEditing((s) => ({ ...s, images: next }));
      toast.success(`${files.length} photo(s) added — press Save to publish.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read that image");
    } finally {
      setUploading(false);
    }
  }

  const visible = hotels.filter((h) => h.showOnSite).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-forest">
            <Building2 className="h-5 w-5 text-saffron" /> Stays &amp; Partners
          </h2>
          <p className="text-sm text-muted-foreground">
            Your hotel directory on <b>/stays</b> — add a property the moment a
            collaboration is signed. State, city, phone, price, photos &amp; booking
            contacts, all from here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void onRefresh()} disabled={loading} className="border-forest/20 text-forest">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={startCreate} className="bg-saffron text-saffron-foreground hover:bg-saffron/90">
            <Plus className="h-4 w-4" /> Add a stay
          </Button>
        </div>
      </div>

      {hotels.length === 0 ? (
        <Card className="border-dashed border-forest/25 bg-white/60">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Building2 className="h-10 w-10 text-forest/30" />
            <p className="font-display text-lg font-bold text-forest">No stays yet</p>
            <p className="max-w-md text-sm text-muted-foreground">
              When a hotel partner says yes, add them here in two minutes — name,
              city, phone, photos and a starting price. They appear on the public
              Stays page instantly, with a &quot;Book with vehicle&quot; button that
              routes back to you on WhatsApp.
            </p>
            <Button onClick={startCreate} className="mt-2 rounded-full bg-forest text-cream hover:bg-forest/90">
              <Plus className="h-4 w-4" /> Add your first stay
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hotels.map((h) => {
            const imgs = hotelImages(h);
            return (
              <Card key={h.id} className="overflow-hidden border-[#e6ddc8] p-0">
                <div className="relative h-32 bg-forest/5">
                  {imgs[0] ? (
                    <img src={imgs[0]} alt={h.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-forest to-[#0f4a28]">
                      <Building2 className="h-8 w-8 text-cream/30" />
                    </div>
                  )}
                  {imgs.length > 1 && (
                    <Badge className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white">
                      +{imgs.length - 1}
                    </Badge>
                  )}
                  {!h.showOnSite && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                      <Badge variant="outline" className="border-white/40 text-white">Hidden</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="space-y-2.5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-forest">{h.name}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {h.city}, {h.state}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn("flex-none text-[10px]", HOTEL_CATEGORY_STYLES[h.category] ?? "")}>
                      {h.category}
                    </Badge>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-ink/70">
                    <Phone className="h-3 w-3" /> {hotelPhoneDisplay(h.phone)}
                    {h.priceFrom ? <span className="ml-auto font-bold text-forest">{inr(h.priceFrom)}+</span> : null}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { key: "showOnSite" as const, icon: h.showOnSite ? Eye : EyeOff, label: h.showOnSite ? "Visible" : "Hidden" },
                        { key: "featured" as const, icon: Star, label: "Featured" },
                        { key: "partner" as const, icon: Handshake, label: "Partner" },
                      ]
                    ).map(({ key, icon: Icon, label }) => (
                      <label
                        key={key}
                        className={cn(
                          "flex cursor-pointer items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors",
                          h[key]
                            ? "border-forest/40 bg-forest/10 text-forest"
                            : "border-[#e6ddc8] bg-white text-muted-foreground"
                        )}
                      >
                        <Switch
                          checked={h[key]}
                          onCheckedChange={() => void toggle(h, key)}
                          className="h-3.5 w-6 [&>span]:h-2.5 [&>span]:w-2.5"
                          aria-label={`${label} for ${h.name}`}
                        />
                        <Icon className="h-3 w-3" />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => startEdit(h)} className="h-8 flex-1 border-forest/20 text-forest">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void remove(h)} className="h-8 border-red-200 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {hotels.length} stay(s) saved · {visible} visible on the public directory. Customers
        booking any stay are invited to add your vehicle in the same WhatsApp chat — that is
        how collaborations turn into car rentals.
      </p>

      {/* ---------------- Editor dialog ---------------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rs-scroll">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-forest">
              {editing.id ? `Edit — ${editing.name || "stay"}` : "Add a new stay"}
            </DialogTitle>
            <DialogDescription>
              Saves instantly to the public <b>/stays</b> page — no redeploy needed.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="ht-name">Hotel / property name *</Label>
              <Input id="ht-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Ri Kynjai Serenity by the Lake" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ht-state">State</Label>
              <Input id="ht-state" value={editing.state} onChange={(e) => setEditing({ ...editing, state: e.target.value })} placeholder="Meghalaya" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ht-city">City / town *</Label>
              <Input id="ht-city" value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} placeholder="Shillong" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="ht-area">Area / landmark</Label>
              <Input id="ht-area" value={editing.area} onChange={(e) => setEditing({ ...editing, area: e.target.value })} placeholder="Umiam Lake, Guwahati–Shillong Road" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ht-phone">Booking phone *</Label>
              <Input id="ht-phone" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="+9198XXXXXXXX" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ht-wa">Hotel WhatsApp (digits only, optional)</Label>
              <Input id="ht-wa" value={editing.whatsapp} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} placeholder="9198XXXXXXXX" />
              <p className="text-[11px] text-muted-foreground">If empty, guests reach the hotel by phone only.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ht-price">Price from (Rs / night)</Label>
              <Input id="ht-price" type="number" min="0" value={editing.priceFrom} onChange={(e) => setEditing({ ...editing, priceFrom: e.target.value })} placeholder="3200" />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                <SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HOTEL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="ht-desc">Description</Label>
              <Textarea id="ht-desc" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Two or three honest sentences tourists care about: location, food, view, who it suits…" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="ht-am">Amenities (comma separated)</Label>
              <Input id="ht-am" value={editing.amenities} onChange={(e) => setEditing({ ...editing, amenities: e.target.value })} placeholder="WiFi, Parking, Restaurant, Lake view" />
            </div>

            {/* Photos */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Photos</Label>
              <div className="flex flex-wrap gap-2">
                {editing.images.map((src, i) => (
                  <div key={i} className="group relative h-20 w-28 overflow-hidden rounded-lg border border-[#e6ddc8]">
                    { }
                    <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() => setEditing({ ...editing, images: editing.images.filter((_, j) => j !== i) })}
                      className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                    {i === 0 && (
                      <Badge className="absolute left-1 top-1 rounded px-1.5 py-0 text-[9px]">Cover</Badge>
                    )}
                  </div>
                ))}
                <label
                  className={cn(
                    "flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-forest/30 text-[11px] font-semibold text-forest/70 transition-colors hover:border-forest/60 hover:bg-forest/5",
                    uploading && "pointer-events-none opacity-60"
                  )}
                >
                  {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Adding…" : "Upload"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void addImages(e.target.files); e.currentTarget.value = ""; }} />
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                First photo becomes the cover. Up to ~6 photos, auto-compressed — stored in your database, safe for Vercel.
              </p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="ht-url" className="flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-saffron" /> External booking link (optional)
              </Label>
              <Input id="ht-url" value={editing.bookingUrl} onChange={(e) => setEditing({ ...editing, bookingUrl: e.target.value })} placeholder="https://…" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="ht-map" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-saffron" /> Google Maps link (optional)
              </Label>
              <Input id="ht-map" value={editing.mapUrl} onChange={(e) => setEditing({ ...editing, mapUrl: e.target.value })} placeholder="https://maps.google.com/…" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#e6ddc8] px-3 py-2">
              <Label htmlFor="ht-vis" className="text-sm">Show on /stays</Label>
              <Switch id="ht-vis" checked={editing.showOnSite} onCheckedChange={(v) => setEditing({ ...editing, showOnSite: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#e6ddc8] px-3 py-2">
              <Label htmlFor="ht-feat" className="text-sm">Feature on the homepage preview</Label>
              <Switch id="ht-feat" checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-saffron/40 bg-saffron/5 px-3 py-2 sm:col-span-2">
              <div>
                <Label htmlFor="ht-partner" className="text-sm">Official Roam Saathi partner</Label>
                <p className="text-[11px] text-muted-foreground">Adds the gold &quot;Partner&quot; badge — use for signed collaborations.</p>
              </div>
              <Switch id="ht-partner" checked={editing.partner} onCheckedChange={(v) => setEditing({ ...editing, partner: v })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ht-sort">Sort order (lower = first)</Label>
              <Input id="ht-sort" type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-forest/20 text-forest">
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={busy} className="bg-forest text-cream hover:bg-forest/90">
              {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {editing.id ? "Save changes" : "Publish stay"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HotelsManager;
