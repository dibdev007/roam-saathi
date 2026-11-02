"use client";

// Routes manager (v9) — full control of the "Where will the road take you?"
// homepage section. The owner adds, edits, hides, reorders and deletes
// route cards from here; every save is live on the homepage instantly.
// Deletions are PERMANENT (hard delete + seed-once marker), and a
// "restore starter routes" button can bring back the 6 demo itineraries
// on demand if the section was ever emptied.

import * as React from "react";
import {
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Route as RouteIcon,
  Eye,
  EyeOff,
  Sparkles,
  Navigation,
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
import { toast } from "sonner";

import {
  routeHighlights,
  type RouteDTO,
} from "@/lib/siteConfig";

type Props = {
  routes: RouteDTO[];
  loading: boolean;
  onRefresh: () => Promise<void>;
};

type RouteForm = {
  id?: string;
  title: string;
  duration: string;
  vehicle: string;
  kmOneWay: string;
  highlights: string; // comma separated in the form
  note: string;
  showOnSite: boolean;
  sortOrder: string;
};

function emptyForm(): RouteForm {
  return {
    title: "",
    duration: "",
    vehicle: "",
    kmOneWay: "150",
    highlights: "",
    note: "",
    showOnSite: true,
    sortOrder: "10",
  };
}

function routeToForm(r: RouteDTO): RouteForm {
  return {
    id: r.id,
    title: r.title,
    duration: r.duration,
    vehicle: r.vehicle,
    kmOneWay: String(r.kmOneWay ?? 100),
    highlights: routeHighlights(r).join(", "),
    note: r.note ?? "",
    showOnSite: r.showOnSite,
    sortOrder: String(r.sortOrder ?? 10),
  };
}

export function RoutesManager({ routes, loading, onRefresh }: Props) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<RouteForm>(emptyForm());
  const [busy, setBusy] = React.useState(false);
  const [restoring, setRestoring] = React.useState(false);

  function startCreate() {
    setEditing(emptyForm());
    setOpen(true);
  }

  function startEdit(r: RouteDTO) {
    setEditing(routeToForm(r));
    setOpen(true);
  }

  async function save() {
    if (!editing.title.trim()) {
      toast.error("Route title is required (e.g. Guwahati → Shillong).");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: editing.title,
        duration: editing.duration,
        vehicle: editing.vehicle,
        kmOneWay: Number(editing.kmOneWay) || 100,
        highlights: editing.highlights
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean),
        note: editing.note,
        showOnSite: editing.showOnSite,
        sortOrder: Number(editing.sortOrder) || 10,
      };
      const res = await fetch(
        editing.id ? `/api/admin/routes/${editing.id}` : "/api/admin/routes",
        {
          method: editing.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error ?? "Save failed");
      toast.success(
        editing.id ? "Route updated — live on the homepage." : "Route added — live on the homepage!"
      );
      setOpen(false);
      await onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(r: RouteDTO) {
    try {
      const res = await fetch(`/api/admin/routes/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnSite: !r.showOnSite }),
      });
      if (!res.ok) throw new Error();
      await onRefresh();
    } catch {
      toast.error("Could not update that switch.");
    }
  }

  async function remove(r: RouteDTO) {
    if (
      !window.confirm(
        `Delete "${r.title}" permanently?\n\nThis cannot be undone — the card disappears from the homepage and never comes back automatically.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/routes/${r.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Route deleted permanently.");
      await onRefresh();
    } catch {
      toast.error("Could not delete that route.");
    }
  }

  /** Re-add the six starter itineraries (only adds — never overwrites). */
  async function restoreStarters() {
    setRestoring(true);
    try {
      const starters = [
        {
          title: "Guwahati → Shillong → Cherrapunji",
          duration: "3N / 4D",
          vehicle: "SUV (Innova / Scorpio) with driver",
          kmOneWay: 150,
          highlights: ["Umiam Lake", "Elephant Falls", "Double Decker Living Root Bridge", "Nohkalikai Falls"],
          sortOrder: 1,
        },
        {
          title: "Guwahati → Kaziranga",
          duration: "2N / 3D",
          vehicle: "SUV or Innova with driver",
          kmOneWay: 200,
          highlights: ["Early-morning elephant safari", "Central Range jeep safari", "Kaziranga Orchid Park"],
          sortOrder: 2,
        },
        {
          title: "Guwahati → Tawang",
          duration: "6N / 7D",
          vehicle: "SUV (Thar / Scorpio) with driver",
          kmOneWay: 450,
          highlights: ["Bhalukpong / Sela Pass", "Tawang Monastery", "Madhuri Lake", "PTTso Lake"],
          note: "ILP required for Arunachal Pradesh — we help arrange it.",
          sortOrder: 3,
        },
        {
          title: "Guwahati → Manas National Park",
          duration: "2N / 3D",
          vehicle: "SUV with driver",
          kmOneWay: 180,
          highlights: ["UNESCO World Heritage Site", "River rafting", "Tiger & golden langur spotting"],
          sortOrder: 4,
        },
        {
          title: "Guwahati → Majuli Island",
          duration: "3N / 4D",
          vehicle: "Hatchback/SUV + ferry",
          kmOneWay: 350,
          highlights: ["World's largest river island", "Satras (Vaishnavite monasteries)", "Mask-making village"],
          sortOrder: 5,
        },
        {
          title: "Guwahati city day tour",
          duration: "1 day",
          vehicle: "Hatchback or sedan with driver",
          kmOneWay: 25,
          highlights: ["Kamakhya Temple", "Umananda Island", "Assam State Museum", "Sunset cruise on the Brahmaputra"],
          sortOrder: 6,
        },
      ];
      for (const s of starters) {
        const res = await fetch("/api/admin/routes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(s),
        });
        if (!res.ok) throw new Error();
      }
      toast.success("6 starter routes added back.");
      await onRefresh();
    } catch {
      toast.error("Could not restore starter routes.");
    } finally {
      setRestoring(false);
    }
  }

  const visible = routes.filter((r) => r.showOnSite).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-forest">
            <RouteIcon className="h-5 w-5 text-saffron" /> Popular Routes
          </h2>
          <p className="text-sm text-muted-foreground">
            The &quot;Where will the road take you?&quot; cards on the homepage —
            itineraries, highlights, distance and the self-drive fuel estimate.
            Deletions are permanent.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void onRefresh()} disabled={loading} className="border-forest/20 text-forest">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          {routes.length === 0 && (
            <Button variant="outline" size="sm" onClick={() => void restoreStarters()} disabled={restoring} className="border-saffron/50 text-saffron-deep">
              <Sparkles className={`h-4 w-4 ${restoring ? "animate-pulse" : ""}`} /> Restore starter routes
            </Button>
          )}
          <Button size="sm" onClick={startCreate} className="bg-saffron text-saffron-foreground hover:bg-saffron/90">
            <Plus className="h-4 w-4" /> Add a route
          </Button>
        </div>
      </div>

      {routes.length === 0 ? (
        <Card className="border-dashed border-forest/25 bg-white/60">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <RouteIcon className="h-10 w-10 text-forest/30" />
            <p className="font-display text-lg font-bold text-forest">No routes yet</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Add the trips you sell most — Shillong weekends, Kaziranga safaris,
              Tawang expeditions. Each card shows highlights, distance and a fuel
              estimate, with a WhatsApp button that pre-fills the trip for the customer.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button onClick={startCreate} className="rounded-full bg-forest text-cream hover:bg-forest/90">
                <Plus className="h-4 w-4" /> Add your first route
              </Button>
              <Button variant="outline" onClick={() => void restoreStarters()} disabled={restoring} className="border-saffron/50 text-saffron-deep">
                <Sparkles className="h-4 w-4" /> Restore the 6 starter routes
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {routes.map((r) => {
            const stops = routeHighlights(r);
            return (
              <Card key={r.id} className="overflow-hidden border-[#e6ddc8] p-0">
                <div className="relative h-20 bg-gradient-to-r from-forest to-[#0f4a28] px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 font-display text-sm font-bold leading-snug text-cream">
                      {r.title}
                    </p>
                    {r.duration ? (
                      <Badge className="flex-none rounded-full bg-saffron text-[10px] font-bold text-saffron-foreground">
                        {r.duration}
                      </Badge>
                    ) : null}
                  </div>
                  {!r.showOnSite && (
                    <div className="absolute inset-0 flex items-center justify-end bg-black/45 pr-3">
                      <Badge variant="outline" className="border-white/40 text-white">Hidden</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="space-y-2.5 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-forest/80">
                    <Navigation className="h-3 w-3" /> ~{r.kmOneWay} km one-way from Guwahati
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {stops.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full bg-forest/5 px-2 py-0.5 text-[10px] font-medium text-ink/70">
                        {s}
                      </span>
                    ))}
                    {stops.length > 4 && (
                      <span className="rounded-full bg-forest/5 px-2 py-0.5 text-[10px] text-ink/60">
                        +{stops.length - 4} more
                      </span>
                    )}
                  </div>
                  {r.vehicle ? (
                    <p className="truncate text-xs text-muted-foreground">🚙 {r.vehicle}</p>
                  ) : null}
                  {r.note ? (
                    <p className="rounded-lg bg-saffron/10 px-2 py-1 text-[11px] text-ink/75">{r.note}</p>
                  ) : null}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                      <Switch
                        checked={r.showOnSite}
                        onCheckedChange={() => void toggle(r)}
                        className="h-3.5 w-6 [&>span]:h-2.5 [&>span]:w-2.5"
                        aria-label={`Show ${r.title} on the site`}
                      />
                      {r.showOnSite ? <Eye className="h-3 w-3 text-forest" /> : <EyeOff className="h-3 w-3" />}
                      {r.showOnSite ? "On homepage" : "Hidden"}
                    </label>
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => startEdit(r)} className="h-8 border-forest/20 px-2 text-forest">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => void remove(r)} className="h-8 border-red-200 px-2 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {routes.length} route(s) saved · {visible} visible on the homepage. Customers tap
        &quot;Plan this trip&quot; on any card and land in your WhatsApp with the route
        name pre-filled.
      </p>

      {/* ---------------- Editor dialog ---------------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] w-full max-w-xl overflow-y-auto rs-scroll">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-forest">
              {editing.id ? `Edit — ${editing.title || "route"}` : "Add a new route"}
            </DialogTitle>
            <DialogDescription>
              Saves instantly to the homepage route cards — no redeploy needed.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="rt-title">Route title *</Label>
              <Input id="rt-title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Guwahati → Shillong → Cherrapunji" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rt-duration">Duration</Label>
              <Input id="rt-duration" value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} placeholder="3N / 4D" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rt-km">One-way distance (km)</Label>
              <Input id="rt-km" type="number" min="1" value={editing.kmOneWay} onChange={(e) => setEditing({ ...editing, kmOneWay: e.target.value })} placeholder="150" />
              <p className="text-[11px] text-muted-foreground">Drives the self-drive fuel estimate on the card.</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="rt-vehicle">Recommended vehicle</Label>
              <Input id="rt-vehicle" value={editing.vehicle} onChange={(e) => setEditing({ ...editing, vehicle: e.target.value })} placeholder="SUV (Innova / Scorpio) with driver" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="rt-highlights">Highlights (comma separated, up to 8)</Label>
              <Input id="rt-highlights" value={editing.highlights} onChange={(e) => setEditing({ ...editing, highlights: e.target.value })} placeholder="Umiam Lake, Elephant Falls, Nohkalikai Falls" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="rt-note">Note (optional)</Label>
              <Textarea id="rt-note" rows={2} value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} placeholder="ILP required for Arunachal Pradesh — we help arrange it." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rt-sort">Sort order (lower = first)</Label>
              <Input id="rt-sort" type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#e6ddc8] px-3 py-2 sm:mt-6">
              <Label htmlFor="rt-vis" className="text-sm">Show on homepage</Label>
              <Switch id="rt-vis" checked={editing.showOnSite} onCheckedChange={(v) => setEditing({ ...editing, showOnSite: v })} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-forest/20 text-forest">
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={busy} className="bg-forest text-cream hover:bg-forest/90">
              {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {editing.id ? "Save changes" : "Publish route"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RoutesManager;
