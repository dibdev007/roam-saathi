"use client";

// Dashboard tab — business snapshot: fleet, pipeline, estimated revenue.

import * as React from "react";
import {
  Car,
  CalendarCheck,
  Inbox,
  Wallet,
  TrendingUp,
  RefreshCw,
  Plus,
  Star,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { inr, type VehicleDTO, type BookingDTO } from "@/lib/siteConfig";
import {
  STATUS_STYLES,
  fmtDateTime,
  nights,
} from "@/components/admin/adminShared";

type Props = {
  vehicles: VehicleDTO[];
  bookings: BookingDTO[];
  loading: boolean;
  onRefresh: () => void;
  onAddVehicle: () => void;
  onGoToBookings: () => void;
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone: "forest" | "saffron" | "ink" | "green";
}) {
  const toneCls = {
    forest: "bg-forest text-cream",
    saffron: "bg-saffron text-saffron-foreground",
    ink: "bg-ink text-cream",
    green: "bg-emerald-600 text-white",
  }[tone];
  return (
    <Card className="border-[#e6ddc8]">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${toneCls}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-extrabold text-forest">{value}</p>
          {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardTab({ vehicles, bookings, loading, onRefresh, onAddVehicle, onGoToBookings }: Props) {
  const available = vehicles.filter((v) => v.available).length;
  const newEnquiries = bookings.filter((b) => b.status === "New").length;
  const active = bookings.filter((b) => ["Confirmed", "Ongoing"].includes(b.status)).length;

  // Estimated pipeline value: confirmed/ongoing use est total if present,
  // otherwise rate × nights as a rough quote.
  const pipeline = bookings
    .filter((b) => ["Confirmed", "Ongoing"].includes(b.status))
    .reduce((sum, b) => {
      if (b.estimatedTotal && b.estimatedTotal > 0) return sum + b.estimatedTotal;
      const v = vehicles.find((x) => x.class === b.vehicleClass);
      if (!v) return sum;
      const rate = b.withDriver && v.withDriverPerDay != null ? v.withDriverPerDay : v.dailyRate;
      return sum + rate * nights(b.pickupDate, b.returnDate);
    }, 0);

  const completed = bookings.filter((b) => b.status === "Completed");
  const earned = completed.reduce(
    (s, b) => s + (b.estimatedTotal && b.estimatedTotal > 0 ? b.estimatedTotal : 0),
    0,
  );

  const recent = bookings.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-forest">Business snapshot</h2>
          <p className="text-sm text-muted-foreground">
            Everything at a glance — fleet, enquiries and money in the pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="border-forest/20 text-forest">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={onAddVehicle} className="bg-saffron text-saffron-foreground hover:bg-saffron/90">
            <Plus className="h-4 w-4" /> Add vehicle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Car} label="Fleet size" value={String(vehicles.length)} sub={`${available} available now`} tone="forest" />
        <StatCard icon={Inbox} label="New enquiries" value={String(newEnquiries)} sub={`${bookings.length} total enquiries`} tone="saffron" />
        <StatCard icon={CalendarCheck} label="Active rentals" value={String(active)} sub="Confirmed + Ongoing" tone="green" />
        <StatCard
          icon={Wallet}
          label="Pipeline value"
          value={inr(pipeline)}
          sub={earned > 0 ? `${inr(earned)} already completed` : "Confirmed + ongoing trips"}
          tone="ink"
        />
      </div>

      <Card className="border-[#e6ddc8]">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <TrendingUp className="h-4 w-4 text-saffron" /> Latest enquiries
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onGoToBookings} className="text-forest">
            View all
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No enquiries yet. They will appear here the moment a customer submits the booking form.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((b) => {
                    const v = vehicles.find((x) => x.class === b.vehicleClass);
                    const rate = v ? (b.withDriver && v.withDriverPerDay != null ? v.withDriverPerDay : v.dailyRate) : 0;
                    const est = b.estimatedTotal && b.estimatedTotal > 0
                      ? b.estimatedTotal
                      : v
                        ? rate * nights(b.pickupDate, b.returnDate)
                        : null;
                    return (
                      <TableRow key={b.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{b.name}</p>
                          <p className="text-xs text-muted-foreground">{b.phone}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{b.vehicleName ?? b.vehicleClass}</p>
                          <p className="text-xs text-muted-foreground">{b.withDriver ? "With driver" : "Self-drive"}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          <p>{b.destination || b.pickupLocation || "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {nights(b.pickupDate, b.returnDate)} day trip
                          </p>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-forest">{est != null ? inr(est) : "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_STYLES[b.status] ?? ""}>
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmtDateTime(b.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {vehicles.filter((v) => v.popular).length > 0 && (
        <Card className="border-[#e6ddc8]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-forest">
              <Star className="h-4 w-4 text-saffron" /> Starred (homepage) vehicles
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {vehicles
              .filter((v) => v.popular)
              .map((v) => (
                <Badge key={v.id} variant="outline" className="border-forest/25 text-forest">
                  {v.name} · {inr(v.dailyRate)}/day
                </Badge>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DashboardTab;
