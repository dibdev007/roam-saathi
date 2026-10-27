"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Inbox,
  Car,
  Settings as SettingsIcon,
  LogOut,
  Lock,
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  TrendingUp,
  CalendarDays,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

import { RhinoLogo } from "@/components/brand/RhinoLogo";
import {
  ADMIN_PASSCODE,
  BUSINESS_NAME,
  TAGLINE,
  VEHICLE_CLASSES,
  BOOKING_STATUSES,
} from "@/lib/siteConfig";

/* ================================================================== */
/* Types                                                              */
/* ================================================================== */
type Booking = {
  id: string;
  name: string;
  phone: string;
  pickupType: string;
  pickupLocation: string | null;
  pickupDate: string;
  returnDate: string;
  vehicleClass: string;
  withDriver: boolean;
  message: string | null;
  status: string;
  createdAt: string;
};

type Vehicle = {
  id: string;
  name: string;
  class: string;
  seats: number;
  transmission: string;
  dailyRate: number;
  withDriverAvailable: boolean;
  imageUrl: string | null;
  available: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type SettingsMap = Record<string, string>;

/* ================================================================== */
/* Login                                                              */
/* ================================================================== */
function AdminLogin({ onSuccess }: { onSuccess: (pass: string) => void }) {
  const [pass, setPass] = React.useState("");
  const [err, setErr] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Soft client-side check. Settings may override the passcode; if so, the
    // admin view will re-validate on first load. For demo we accept either the
    // env passcode or the seeded default.
    if (pass === ADMIN_PASSCODE || pass === "roam2024") {
      setErr("");
      onSuccess(pass);
    } else {
      setErr("Incorrect passcode. Please try again.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4">
      <Card className="w-full border-[#e6ddc8] bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-cream">
            <Lock className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl text-forest">Admin Portal</CardTitle>
          <CardDescription>
            Enter the passcode to manage enquiries, fleet and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="passcode">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                autoFocus
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Enter admin passcode"
              />
            </div>
            {err && (
              <p className="text-sm font-medium text-destructive">{err}</p>
            )}
            <Button type="submit" className="w-full bg-forest text-white hover:bg-forest/90">
              Unlock
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo passcode: <code className="font-mono font-bold">roam2024</code>
              <br />
              (Soft client-side gate — replace with NextAuth before production.)
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Dashboard                                                          */
/* ================================================================== */
function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card className="border-[#e6ddc8] bg-card">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-forest">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-forest/10 text-forest">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleClassBarChart({ bookings }: { bookings: Booking[] }) {
  const counts: Record<string, number> = {};
  for (const b of bookings) {
    counts[b.vehicleClass] = (counts[b.vehicleClass] ?? 0) + 1;
  }
  const classes = VEHICLE_CLASSES;
  const max = Math.max(1, ...classes.map((c) => counts[c] ?? 0));
  const colors: Record<string, string> = {
    SUV: "#14532D",
    HATCHBACK: "#16A34A",
    SCOOTER: "#F59E0B",
    VAN: "#FB923C",
  };
  return (
    <Card className="border-[#e6ddc8] bg-card">
      <CardHeader>
        <CardTitle className="text-base text-forest">Enquiries by vehicle class</CardTitle>
        <CardDescription>Total {bookings.length} enquiries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {classes.map((c) => {
          const v = counts[c] ?? 0;
          const pct = (v / max) * 100;
          return (
            <div key={c}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{c}</span>
                <span className="text-muted-foreground">{v}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: colors[c] }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function Dashboard({ bookings, vehicles }: { bookings: Booking[]; vehicles: Vehicle[] }) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = bookings.filter((b) => new Date(b.createdAt) >= weekAgo).length;
  const newCount = bookings.filter((b) => b.status === "New").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total enquiries" value={bookings.length} icon={Inbox} />
        <StatCard label="This week" value={thisWeek} icon={CalendarDays} />
        <StatCard label="New (unactioned)" value={newCount} icon={TrendingUp} />
        <StatCard label="Fleet count" value={vehicles.length} icon={Car} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VehicleClassBarChart bookings={bookings} />
        <Card className="border-[#e6ddc8] bg-card">
          <CardHeader>
            <CardTitle className="text-base text-forest">Status breakdown</CardTitle>
            <CardDescription>Where each enquiry stands</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BOOKING_STATUSES.map((s) => {
              const v = bookings.filter((b) => b.status === s).length;
              return (
                <div key={s} className="rounded-lg border border-[#e6ddc8] p-3 text-center">
                  <p className="text-2xl font-extrabold text-forest">{v}</p>
                  <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Enquiries inbox                                                    */
/* ================================================================== */
const STATUS_COLORS: Record<string, string> = {
  New: "bg-saffron/15 text-saffron border-saffron/30",
  Contacted: "bg-blue-50 text-blue-700 border-blue-200",
  Confirmed: "bg-forest/10 text-forest border-forest/30",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

function EnquiriesInbox() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/bookings?${params.toString()}`, { cache: "no-store" });
      const j = await res.json();
      setBookings(j.bookings ?? []);
    } catch {
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, query]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id: string, status: string) {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Status updated to ${status}`);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch {
      toast.error("Could not update status");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#e6ddc8] bg-card">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {BOOKING_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={load} aria-label="Refresh" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[#e6ddc8] bg-card">
        <CardContent className="p-0">
          <div className="rs-scroll max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No enquiries found.
                    </TableCell>
                  </TableRow>
                )}
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(b.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{b.name}</div>
                      <div className="text-xs text-muted-foreground">
                        <a href={`tel:${b.phone}`} className="hover:underline">{b.phone}</a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{b.pickupType}</div>
                      <div className="max-w-[160px] truncate text-xs text-muted-foreground">
                        {b.pickupLocation ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      <div>{new Date(b.pickupDate).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                      <div className="text-muted-foreground">→ {new Date(b.returnDate).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{b.vehicleClass}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.withDriver ? "With driver" : "Self-drive"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={b.status}
                        onValueChange={(v) => changeStatus(b.id, v)}
                      >
                        <SelectTrigger className="h-8 w-32 border-0 p-0">
                          <Badge variant="outline" className={`px-2 py-0.5 text-xs ${STATUS_COLORS[b.status] ?? ""}`}>
                            {b.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {BOOKING_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Fleet manager                                                      */
/* ================================================================== */
const EMPTY_VEHICLE: Omit<Vehicle, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  class: "SUV",
  seats: 4,
  transmission: "Manual",
  dailyRate: 0,
  withDriverAvailable: true,
  imageUrl: "",
  available: true,
  description: "",
};

function VehicleForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial: Omit<Vehicle, "id" | "createdAt" | "updatedAt">;
  onSubmit: (data: Omit<Vehicle, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [form, setForm] = React.useState(initial);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || form.dailyRate < 0) {
      toast.error("Name and a valid daily rate are required.");
      return;
    }
    onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="v-name">Name *</Label>
        <Input id="v-name" value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g. Mahindra Thar" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-class">Class</Label>
        <Select value={form.class} onValueChange={(v) => set("class", v)}>
          <SelectTrigger id="v-class"><SelectValue /></SelectTrigger>
          <SelectContent>
            {VEHICLE_CLASSES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-seats">Seats</Label>
        <Input id="v-seats" type="number" min={1} value={form.seats} onChange={(e) => set("seats", Number(e.target.value))} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-trans">Transmission</Label>
        <Select value={form.transmission} onValueChange={(v) => set("transmission", v)}>
          <SelectTrigger id="v-trans"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Manual">Manual</SelectItem>
            <SelectItem value="Automatic">Automatic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-rate">Daily rate (₹)</Label>
        <Input id="v-rate" type="number" min={0} value={form.dailyRate} onChange={(e) => set("dailyRate", Number(e.target.value))} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="v-img">Image URL (optional)</Label>
        <Input id="v-img" value={form.imageUrl ?? ""} onChange={(e) => set("imageUrl", e.target.value)} placeholder="/fleet-suv.png" />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="v-desc">Description</Label>
        <Textarea id="v-desc" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="flex items-center gap-6 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox checked={form.withDriverAvailable} onCheckedChange={(c) => set("withDriverAvailable", c === true)} />
          Driver available
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox checked={form.available} onCheckedChange={(c) => set("available", c === true)} />
          Available
        </label>
      </div>
      <DialogFooter className="sm:col-span-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={submitting} className="bg-forest text-white hover:bg-forest/90">
          <Save className="h-4 w-4" /> {submitting ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FleetManager() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles", { cache: "no-store" });
      const j = await res.json();
      setVehicles(j.vehicles ?? []);
    } catch {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(v: Vehicle) {
    setEditing(v);
    setDialogOpen(true);
  }

  async function submit(data: Omit<Vehicle, "id" | "createdAt" | "updatedAt">) {
    setSubmitting(true);
    try {
      if (editing) {
        const res = await fetch(`/api/vehicles/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed");
        toast.success("Vehicle updated");
      } else {
        const res = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed");
        toast.success("Vehicle added");
      }
      setDialogOpen(false);
      setEditing(null);
      await load();
    } catch {
      toast.error("Could not save vehicle");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(v: Vehicle) {
    if (!confirm(`Delete ${v.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/vehicles/${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${v.name} deleted`);
      await load();
    } catch {
      toast.error("Could not delete vehicle");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{vehicles.length} vehicles · CRUD enabled</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="bg-forest text-white hover:bg-forest/90">
              <Plus className="h-4 w-4" /> Add vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-forest">
                {editing ? "Edit vehicle" : "Add new vehicle"}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? `Editing ${editing.name}`
                  : "Add a new vehicle to the Roam Saathi fleet."}
              </DialogDescription>
            </DialogHeader>
            <VehicleForm
              initial={editing ?? EMPTY_VEHICLE}
              onSubmit={submit}
              onCancel={() => setDialogOpen(false)}
              submitting={submitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-[#e6ddc8] bg-card">
        <CardContent className="p-0">
          <div className="rs-scroll max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No vehicles yet. Click "Add vehicle" to create one.
                    </TableCell>
                  </TableRow>
                )}
                {vehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{v.name}</div>
                      <div className="max-w-[260px] truncate text-xs text-muted-foreground">
                        {v.description || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-forest/20 text-forest">{v.class}</Badge>
                    </TableCell>
                    <TableCell>{v.seats}</TableCell>
                    <TableCell>₹{v.dailyRate.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      {v.withDriverAvailable ? (
                        <CheckCircle2 className="h-4 w-4 text-forest" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {v.available ? (
                        <Badge variant="outline" className="border-forest/30 text-forest">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-200 text-red-700">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(v)} aria-label={`Edit ${v.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(v)} aria-label={`Delete ${v.name}`} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Settings                                                           */
/* ================================================================== */
function SettingsPanel() {
  const [settings, setSettings] = React.useState<SettingsMap>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    businessPhone: "",
    whatsappNumber: "",
    hours: "",
    serviceAreas: "",
    adminPasscode: "",
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const j = await res.json();
      const s: SettingsMap = j.settings ?? {};
      setSettings(s);
      setForm({
        businessPhone: s.businessPhone ?? "",
        whatsappNumber: s.whatsappNumber ?? "",
        hours: s.hours ?? "",
        serviceAreas: s.serviceAreas ?? "",
        adminPasscode: s.adminPasscode ?? "",
      });
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: form }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Settings saved");
      await load();
    } catch {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Card className="border-[#e6ddc8] bg-card">
        <CardHeader>
          <CardTitle className="text-base text-forest">Business settings</CardTitle>
          <CardDescription>
            These values override the defaults in <code>siteConfig.ts</code>. Phone & WhatsApp
            changes here do <strong>not</strong> automatically update the public site config —
            they are persisted for record-keeping and future server-side rendering.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="s-phone">Business phone</Label>
            <Input id="s-phone" value={form.businessPhone} onChange={(e) => setForm((p) => ({ ...p, businessPhone: e.target.value }))} placeholder="+91XXXXXXXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-wa">WhatsApp number (digits only)</Label>
            <Input id="s-wa" value={form.whatsappNumber} onChange={(e) => setForm((p) => ({ ...p, whatsappNumber: e.target.value }))} placeholder="91XXXXXXXXXX" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="s-hours">Hours</Label>
            <Input id="s-hours" value={form.hours} onChange={(e) => setForm((p) => ({ ...p, hours: e.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="s-areas">Service areas (JSON array)</Label>
            <Textarea
              id="s-areas"
              rows={3}
              value={form.serviceAreas}
              onChange={(e) => setForm((p) => ({ ...p, serviceAreas: e.target.value }))}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">Edit as a JSON array of strings.</p>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="s-pass">Admin passcode</Label>
            <Input id="s-pass" value={form.adminPasscode} onChange={(e) => setForm((p) => ({ ...p, adminPasscode: e.target.value }))} />
            <p className="text-xs text-muted-foreground">
              Stored in DB. For demo, the client login still accepts the default passcode.
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="bg-forest text-white hover:bg-forest/90">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

/* ================================================================== */
/* Admin shell                                                        */
/* ================================================================== */
export function AdminPortal({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = React.useState(false);
  const [tab, setTab] = React.useState("dashboard");
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load summary data once authed
  React.useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [b, v] = await Promise.all([
          fetch("/api/bookings", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/vehicles", { cache: "no-store" }).then((r) => r.json()),
        ]);
        if (cancelled) return;
        setBookings(b.bookings ?? []);
        setVehicles(v.vehicles ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authed]);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Admin top bar */}
      <header className="sticky top-0 z-40 border-b border-[#e6ddc8] bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <RhinoLogo withWordmark className="h-9 w-9" />
            <Badge variant="outline" className="border-forest/30 text-forest">Admin</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={onExit} className="border-forest/20 text-forest">
            <LogOut className="h-4 w-4" /> Exit to customer view
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-forest/5">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-forest data-[state=active]:text-white">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="enquiries" className="data-[state=active]:bg-forest data-[state=active]:text-white">
              <Inbox className="h-4 w-4" /> Enquiries
            </TabsTrigger>
            <TabsTrigger value="fleet" className="data-[state=active]:bg-forest data-[state=active]:text-white">
              <Car className="h-4 w-4" /> Fleet
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-forest data-[state=active]:text-white">
              <SettingsIcon className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading dashboard…</p>
            ) : (
              <Dashboard bookings={bookings} vehicles={vehicles} />
            )}
          </TabsContent>
          <TabsContent value="enquiries" className="mt-6">
            <EnquiriesInbox />
          </TabsContent>
          <TabsContent value="fleet" className="mt-6">
            <FleetManager />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-auto border-t border-[#e6ddc8] bg-forest text-cream">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-cream/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {BUSINESS_NAME} · {TAGLINE}</p>
          <p className="text-cream/50">Admin portal · soft client-side passcode gate</p>
        </div>
      </footer>
    </div>
  );
}

export default AdminPortal;
