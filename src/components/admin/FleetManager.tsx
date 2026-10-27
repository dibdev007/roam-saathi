"use client";

// Fleet Manager — add / edit / remove vehicles with FULL price details.
// Every field here is optional except name, class, seats and self-drive rate.

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Car,
  Star,
  Wallet,
  Gauge,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import {
  VEHICLE_CLASSES,
  FUEL_TYPES,
  TRANSMISSIONS,
  inr,
  type VehicleDTO,
} from "@/lib/siteConfig";
import {
  CLASS_LABELS,
  STATUS_STYLES,
  emptyVehicleForm,
  numOrNull,
  type VehicleFormState,
} from "@/components/admin/adminShared";

type Props = {
  vehicles: VehicleDTO[];
  loading: boolean;
  onRefresh: () => void;
};

/** Compact labelled money/number field used throughout the pricing grid. */
function PriceField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          ₹
        </span>
        <Input
          id={id}
          type="number"
          min={0}
          inputMode="numeric"
          className="pl-7"
          placeholder={placeholder ?? "0"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {hint && <p className="text-[11px] leading-tight text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FleetManager({ vehicles, loading, onRefresh }: Props) {
  const [q, setQ] = React.useState("");
  const [classFilter, setClassFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<VehicleDTO | null>(null);
  const [form, setForm] = React.useState<VehicleFormState>(emptyVehicleForm());

  const filtered = vehicles.filter((v) => {
    const okQ =
      q.trim() === "" ||
      `${v.name} ${v.brand ?? ""} ${v.registrationNumber ?? ""}`
        .toLowerCase()
        .includes(q.trim().toLowerCase());
    const okC = classFilter === "all" || v.class === classFilter;
    return okQ && okC;
  });

  function openAdd() {
    const maxSort = vehicles.reduce((m, v) => Math.max(m, v.sortOrder), 0);
    setForm(emptyVehicleForm(maxSort + 10));
    setDialogOpen(true);
  }

  function openEdit(v: VehicleDTO) {
    setForm({
      id: v.id,
      name: v.name,
      brand: v.brand ?? "",
      class: v.class,
      seats: String(v.seats),
      transmission: v.transmission,
      fuelType: v.fuelType,
      dailyRate: String(v.dailyRate),
      withDriverPerDay: v.withDriverPerDay != null ? String(v.withDriverPerDay) : "",
      withDriverAvailable: v.withDriverAvailable,
      monthlyRate: v.monthlyRate != null ? String(v.monthlyRate) : "",
      kmLimitPerDay: v.kmLimitPerDay != null ? String(v.kmLimitPerDay) : "",
      extraKmRate: v.extraKmRate != null ? String(v.extraKmRate) : "",
      securityDeposit: v.securityDeposit != null ? String(v.securityDeposit) : "",
      driverBata: v.driverBata != null ? String(v.driverBata) : "",
      registrationNumber: v.registrationNumber ?? "",
      imageUrl: v.imageUrl ?? "",
      features: v.features ?? "",
      description: v.description ?? "",
      available: v.available,
      popular: v.popular,
      sortOrder: String(v.sortOrder),
    });
    setDialogOpen(true);
  }

  async function save() {
    if (!form.name.trim() || form.dailyRate.trim() === "") {
      toast.error("Vehicle name and self-drive rate are required.");
      return;
    }
    if (form.withDriverAvailable && form.withDriverPerDay.trim() === "") {
      toast.error("Enter the with-driver rate, or untick 'offer with driver'.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim() || null,
        class: form.class,
        seats: Number(form.seats) || 4,
        transmission: form.transmission,
        fuelType: form.fuelType,
        dailyRate: numOrNull(form.dailyRate) ?? 0,
        withDriverPerDay: form.withDriverAvailable ? numOrNull(form.withDriverPerDay) : null,
        withDriverAvailable: form.withDriverAvailable,
        monthlyRate: numOrNull(form.monthlyRate),
        kmLimitPerDay: numOrNull(form.kmLimitPerDay),
        extraKmRate: numOrNull(form.extraKmRate),
        securityDeposit: numOrNull(form.securityDeposit),
        driverBata: numOrNull(form.driverBata),
        registrationNumber: form.registrationNumber.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        features: form.features.trim() || null,
        description: form.description.trim(),
        available: form.available,
        popular: form.popular,
        sortOrder: Number(form.sortOrder) || 100,
      };
      const res = form.id
        ? await fetch(`/api/vehicles/${form.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/vehicles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Save failed");
      }
      toast.success(form.id ? "Vehicle updated — live on the site." : "Vehicle added — live on the site.");
      setDialogOpen(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save vehicle");
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(v: VehicleDTO, field: "available" | "popular") {
    try {
      const res = await fetch(`/api/vehicles/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !v[field] }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        field === "available"
          ? !v.available
            ? `${v.name} marked available`
            : `${v.name} marked unavailable`
          : !v.popular
            ? `${v.name} starred on homepage`
            : `${v.name} unstarred`,
      );
      onRefresh();
    } catch {
      toast.error("Could not update vehicle");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/vehicles/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${deleting.name} removed from fleet`);
      onRefresh();
    } catch {
      toast.error("Could not delete vehicle");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-forest">Fleet & rate card</h2>
          <p className="text-sm text-muted-foreground">
            Add vehicles, set prices, and everything updates on the customer site instantly.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="border-forest/20 text-forest">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={openAdd} className="bg-saffron text-saffron-foreground hover:bg-saffron/90">
            <Plus className="h-4 w-4" /> Add vehicle
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, brand, reg no…"
            className="w-64 pl-8"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>
            {VEHICLE_CLASSES.map((c) => (
              <SelectItem key={c} value={c}>
                {CLASS_LABELS[c] ?? c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} of {vehicles.length} vehicles
        </span>
      </div>

      <Card className="border-[#e6ddc8]">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <Car className="h-10 w-10 text-forest/30" />
              <p className="text-sm text-muted-foreground">
                No vehicles match. Add your first vehicle — it appears on the website immediately.
              </p>
              <Button size="sm" onClick={openAdd} className="bg-forest text-cream hover:bg-forest/90">
                <Plus className="h-4 w-4" /> Add vehicle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>
                      <span className="inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> Self-drive</span>
                    </TableHead>
                    <TableHead>With driver</TableHead>
                    <TableHead>
                      <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> Km / deposit</span>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-16 flex-shrink-0 overflow-hidden rounded-md border border-[#e6ddc8] bg-forest/5">
                            {v.imageUrl ? (
                              <img src={v.imageUrl} alt={v.name} className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Car className="h-4 w-4 text-forest/40" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1 font-medium text-foreground">
                              {v.popular && <Star className="h-3 w-3 fill-saffron text-saffron" />}
                              <span className="truncate">{v.name}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {v.seats} seats · {v.transmission} · {v.fuelType}
                              {v.registrationNumber ? ` · ${v.registrationNumber}` : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-forest/25 text-forest">
                          {CLASS_LABELS[v.class] ?? v.class}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-forest">{inr(v.dailyRate)}</p>
                        <p className="text-[11px] text-muted-foreground">per day</p>
                      </TableCell>
                      <TableCell>
                        {v.withDriverAvailable && v.withDriverPerDay != null ? (
                          <>
                            <p className="font-semibold text-forest">{inr(v.withDriverPerDay)}</p>
                            <p className="text-[11px] text-muted-foreground">per day</p>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not offered</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <p>{v.kmLimitPerDay ? `${v.kmLimitPerDay} km/day` : "Unlimited km"}</p>
                        <p>Deposit {v.securityDeposit != null ? inr(v.securityDeposit) : "—"}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={v.available}
                              onCheckedChange={() => toggleField(v, "available")}
                              aria-label={`Toggle availability for ${v.name}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {v.available ? "Available" : "Hidden"}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`w-fit cursor-pointer text-[10px] ${v.popular ? STATUS_STYLES["Confirmed"] : ""}`}
                            onClick={() => toggleField(v, "popular")}
                          >
                            {v.popular ? "★ On homepage" : "Not starred"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(v)} aria-label={`Edit ${v.name}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setDeleting(v)}
                            aria-label={`Delete ${v.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------------- Add / Edit dialog ---------------- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-forest">
              {form.id ? `Edit — ${form.name}` : "Add a vehicle"}
            </DialogTitle>
            <DialogDescription>
              Fill what you know — you can change any detail later. Saved changes go live on the
              customer site immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* ---- Identity ---- */}
            <div className="space-y-1">
              <Label htmlFor="v-name">Vehicle name *</Label>
              <Input
                id="v-name"
                placeholder="e.g. Mahindra Thar 4x4"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-brand">Brand</Label>
              <Input
                id="v-brand"
                placeholder="e.g. Mahindra"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Class *</Label>
              <Select value={form.class} onValueChange={(v) => setForm({ ...form, class: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CLASS_LABELS[c] ?? c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="v-seats">Seats</Label>
                <Input
                  id="v-seats"
                  type="number"
                  min={1}
                  value={form.seats}
                  onChange={(e) => setForm({ ...form, seats: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Trans.</Label>
                <Select value={form.transmission} onValueChange={(v) => setForm({ ...form, transmission: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Fuel</Label>
                <Select value={form.fuelType} onValueChange={(v) => setForm({ ...form, fuelType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ---- Pricing grid ---- */}
            <div className="rounded-lg border border-[#e6ddc8] bg-cream/50 p-3 sm:col-span-2">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-forest">
                <Wallet className="h-4 w-4 text-saffron" /> Price details (INR)
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <PriceField
                  id="v-daily"
                  label="Self-drive rate / day *"
                  hint="What the customer pays to drive it themselves"
                  value={form.dailyRate}
                  onChange={(v) => setForm({ ...form, dailyRate: v })}
                />
                <PriceField
                  id="v-driver"
                  label="With-driver rate / day"
                  hint="Leave blank if driver not offered"
                  value={form.withDriverPerDay}
                  onChange={(v) => setForm({ ...form, withDriverPerDay: v })}
                />
                <PriceField
                  id="v-deposit"
                  label="Security deposit"
                  hint="Refundable, charged at pickup"
                  value={form.securityDeposit}
                  onChange={(v) => setForm({ ...form, securityDeposit: v })}
                />
                <PriceField
                  id="v-km"
                  label="Included km / day"
                  hint="Blank = unlimited km"
                  value={form.kmLimitPerDay}
                  onChange={(v) => setForm({ ...form, kmLimitPerDay: v })}
                />
                <PriceField
                  id="v-extrakm"
                  label="Extra km charge"
                  hint="₹ per km beyond the limit"
                  value={form.extraKmRate}
                  onChange={(v) => setForm({ ...form, extraKmRate: v })}
                />
                <PriceField
                  id="v-bata"
                  label="Driver bata / day"
                  hint="Optional extra driver allowance"
                  value={form.driverBata}
                  onChange={(v) => setForm({ ...form, driverBata: v })}
                />
                <PriceField
                  id="v-monthly"
                  label="Monthly rate"
                  hint="Optional long-term price"
                  value={form.monthlyRate}
                  onChange={(v) => setForm({ ...form, monthlyRate: v })}
                />
              </div>
              <div className="mt-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.withDriverAvailable}
                    onCheckedChange={(c) => setForm({ ...form, withDriverAvailable: c === true })}
                  />
                  Offer this vehicle with a driver
                </label>
              </div>
            </div>

            {/* ---- Extras ---- */}
            <div className="space-y-1">
              <Label htmlFor="v-reg">Registration number</Label>
              <Input
                id="v-reg"
                placeholder="e.g. AS01AB1234"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                className="uppercase"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-order">Display order</Label>
              <Input
                id="v-order"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">Lower numbers appear first</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="v-image">Photo URL</Label>
              <Input
                id="v-image"
                placeholder="https://… or /fleet-suv.png (leave blank for class photo)"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              <p className="text-[11px] leading-tight text-muted-foreground">
                Paste any photo link (Google Drive/Imgur/WhatsApp image link). A class photo is used
                if left blank.
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="v-features">Features (comma separated)</Label>
              <Input
                id="v-features"
                placeholder="AC, Bluetooth, Roof rails, 4x4"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="v-desc">Short description</Label>
              <Textarea
                id="v-desc"
                rows={2}
                placeholder="One or two lines shown under the vehicle name."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.available}
                  onCheckedChange={(c) => setForm({ ...form, available: c === true })}
                />
                Available for booking (visible on site)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.popular}
                  onCheckedChange={(c) => setForm({ ...form, popular: c === true })}
                />
                Star on homepage
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-forest/20 text-forest">
              Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="bg-forest text-cream hover:bg-forest/90">
              {saving ? "Saving…" : form.id ? "Save changes" : "Add vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Delete confirm ---------------- */}
      <AlertDialog open={deleting != null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the vehicle and its rate card from the website. Customer
              enquiries are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-forest/20 text-forest">Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FleetManager;
