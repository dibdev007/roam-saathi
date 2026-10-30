"use client";

// Bookings manager — the enquiry pipeline with WhatsApp-first follow-up.

import * as React from "react";
import {
  Search,
  Trash2,
  MessageCircle,
  Phone,
  Download,
  RefreshCw,
  MapPin,
  StickyNote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

import { BOOKING_STATUSES, inr, type BookingDTO, type VehicleDTO } from "@/lib/siteConfig";
import { buildWhatsAppUrl, buildTelUrl } from "@/lib/whatsapp";
import {
  CLASS_LABELS,
  STATUS_STYLES,
  bookingsToCsv,
  downloadFile,
  fmtDate,
  fmtDateTime,
  nights,
} from "@/components/admin/adminShared";

type Props = {
  bookings: BookingDTO[];
  vehicles: VehicleDTO[];
  loading: boolean;
  onRefresh: () => void;
};

function estTotal(b: BookingDTO, vehicles: VehicleDTO[]): number | null {
  if (b.estimatedTotal && b.estimatedTotal > 0) return b.estimatedTotal;
  const v = vehicles.find((x) => x.class === b.vehicleClass);
  if (!v) return null;
  const rate = b.withDriver && v.withDriverPerDay != null ? v.withDriverPerDay : v.dailyRate;
  return rate * nights(b.pickupDate, b.returnDate);
}

export function BookingsManager({ bookings, vehicles, loading, onRefresh }: Props) {
  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [deleting, setDeleting] = React.useState<BookingDTO | null>(null);

  const filtered = bookings.filter((b) => {
    const okQ =
      q.trim() === "" ||
      `${b.name} ${b.phone} ${b.vehicleName ?? ""} ${b.destination ?? ""}`
        .toLowerCase()
        .includes(q.trim().toLowerCase());
    const okS = statusFilter === "all" || b.status === statusFilter;
    return okQ && okS;
  });

  const counts = React.useMemo(() => {
    const m: Record<string, number> = { all: bookings.length };
    for (const s of BOOKING_STATUSES) m[s] = 0;
    for (const b of bookings) m[b.status] = (m[b.status] ?? 0) + 1;
    return m;
  }, [bookings]);

  async function setStatus(b: BookingDTO, status: string) {
    try {
      const res = await fetch(`/api/bookings/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${b.name} → ${status}`);
      onRefresh();
    } catch {
      toast.error("Could not update booking status");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/bookings/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Booking deleted");
      onRefresh();
    } catch {
      toast.error("Could not delete booking");
    } finally {
      setDeleting(null);
    }
  }

  function exportCsv() {
    if (filtered.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const csv = bookingsToCsv(filtered as unknown as Record<string, unknown>[]);
    downloadFile(csv, `roam-saathi-bookings-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
    toast.success(`Exported ${filtered.length} bookings to CSV`);
  }

  const digits = (p: string) => p.replace(/\D/g, "").slice(-10);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-forest">Bookings & enquiries</h2>
          <p className="text-sm text-muted-foreground">
            Every website enquiry lands here. Reply on WhatsApp, move through the pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="border-forest/20 text-forest">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} className="border-forest/20 text-forest">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Status pipeline chips */}
      <div className="flex flex-wrap gap-2">
        {["all", ...BOOKING_STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "border-forest bg-forest text-cream"
                : "border-forest/20 bg-card text-forest/70 hover:border-forest/40"
            }`}
          >
            {s === "all" ? "All" : s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search customer, phone, vehicle, destination…"
          className="max-w-md pl-8"
        />
      </div>

      <Card className="border-[#e6ddc8]">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No bookings match this filter yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Wants</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Follow up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b) => {
                    const est = estTotal(b, vehicles);
                    const waMsg = `Hello ${b.name.split(" ")[0]}! Roam Saathi here — regarding your ${b.vehicleName ?? b.vehicleClass} enquiry (${fmtDate(b.pickupDate)} to ${fmtDate(b.returnDate)}). ${b.withDriver ? "Chauffeur-driven" : "Self-drive"}${est != null ? `, approx ${inr(est)}` : ""}. Shall we confirm?`;
                    return (
                      <TableRow key={b.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{b.name}</p>
                          <p className="text-xs text-muted-foreground">{b.phone}</p>
                          <p className="text-[11px] text-muted-foreground">
                            via {b.pickupType}
                            {b.pickupLocation ? ` · ${b.pickupLocation}` : ""}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{b.vehicleName ?? CLASS_LABELS[b.vehicleClass] ?? b.vehicleClass}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {b.withDriver ? "With driver" : "Self-drive"}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0 text-saffron" />
                            <span className="truncate">{b.destination || "—"}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {fmtDate(b.pickupDate)} → {fmtDate(b.returnDate)} ({nights(b.pickupDate, b.returnDate)}d)
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-forest">{est != null ? inr(est) : "—"}</p>
                          {b.message && (
                            <p className="flex max-w-[180px] items-start gap-1 text-[11px] italic text-muted-foreground">
                              <StickyNote className="mt-0.5 h-3 w-3 flex-shrink-0" />
                              <span className="line-clamp-2">{b.message}</span>
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <Badge variant="outline" className={`w-fit ${STATUS_STYLES[b.status] ?? ""}`}>
                              {b.status}
                            </Badge>
                            <Select value={b.status} onValueChange={(s) => setStatus(b, s)}>
                              <SelectTrigger className="h-7 w-[120px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BOOKING_STATUSES.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              className="h-8 bg-forest text-cream hover:bg-forest/90"
                              onClick={() => window.open(buildWhatsAppUrl(waMsg, digits(b.phone)), "_blank", "noopener,noreferrer")}
                              aria-label={`WhatsApp ${b.name}`}
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> Reply
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-forest/20 text-forest"
                              onClick={() => window.open(buildTelUrl(b.phone), "_self")}
                              aria-label={`Call ${b.name}`}
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setDeleting(b)}
                              aria-label={`Delete booking of ${b.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {fmtDateTime(b.createdAt)}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleting != null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking of {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the enquiry from the database. Consider marking it Cancelled
              instead to keep the record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-forest/20 text-forest">Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default BookingsManager;
