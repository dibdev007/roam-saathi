"use client";

// Stays & Partners directory (v4) — filterable hotel listings managed
// entirely from Admin → Stays & Partners. Each card offers direct booking
// contact options (call / WhatsApp the hotel) plus a "travel there with
// Roam Saathi" cross-sell WhatsApp deep link to the owner's number.

import * as React from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Star,
  ExternalLink,
  Building2,
  Search,
  Handshake,
  Navigation,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/site/chrome";
import { buildWhatsAppUrl, buildTelUrl } from "@/lib/whatsapp";
import {
  HOTEL_CATEGORY_STYLES,
  hotelAmenities,
  hotelImages,
  hotelPhoneDisplay,
  inr,
  type HotelDTO,
  type SettingsMap,
} from "@/lib/siteConfig";
import { getContact } from "@/lib/contact";
import { cn } from "@/lib/utils";

export function StaysDirectory({
  hotels,
  settings,
}: {
  hotels: HotelDTO[];
  settings?: SettingsMap;
}) {
  const contact = getContact(settings);

  const [stateFilter, setStateFilter] = React.useState<string>("ALL");
  const [query, setQuery] = React.useState("");

  const states = React.useMemo(
    () => Array.from(new Set(hotels.map((h) => h.state))).sort(),
    [hotels]
  );

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return hotels.filter((h) => {
      if (stateFilter !== "ALL" && h.state !== stateFilter) return false;
      if (!q) return true;
      return [h.name, h.city, h.state, h.area ?? "", h.category, h.description]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [hotels, stateFilter, query]);

  const travelTo = (h: HotelDTO) =>
    buildWhatsAppUrl(
      `Hello Roam Saathi! I'm booking a stay at *${h.name}* (${h.city}, ${h.state}). I also need a vehicle — airport pickup or self-drive. Please share a combined quote.`,
      contact.whatsapp
    );

  const hotelWa = (h: HotelDTO) => {
    const digits = (h.whatsapp ?? "").replace(/\D/g, "");
    if (!digits) return null;
    return buildWhatsAppUrl(
      `Hello! I found ${h.name} on Roam Saathi's Stays directory. I'd like to enquire about room availability and prices.`,
      digits
    );
  };

  return (
    <div>
      {/* Filters */}
      <Reveal>
        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city or area…"
              aria-label="Search stays"
              className="h-11 rounded-full border-forest/15 bg-white pl-9"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["ALL", ...states].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStateFilter(st)}
              aria-pressed={stateFilter === st}
              className={cn(
                "chip rounded-full border px-4 py-1.5 text-[13px] font-bold",
                stateFilter === st
                  ? "border-forest bg-forest text-cream shadow-md"
                  : "border-forest/20 bg-white text-forest/80 hover:border-forest/50"
              )}
            >
              {st === "ALL" ? `All states (${hotels.length})` : st}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Grid */}
      {shown.length === 0 ? (
        <Reveal delay={100}>
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-forest/25 bg-white/70 p-10 text-center">
            <Building2 className="mx-auto h-10 w-10 text-forest/30" />
            <p className="font-display mt-3 text-lg font-bold text-forest">
              No stays match yet
            </p>
            <p className="mt-1.5 text-sm text-ink/65">
              New partner hotels are added from the admin portal as collaborations
              are signed — check back soon, or ask us directly on WhatsApp.
            </p>
            <Button asChild className="mt-5 rounded-full bg-forest text-cream hover:bg-forest/90">
              <a href={buildWhatsAppUrl("Hello Roam Saathi! Do you have hotel partners in my destination?", contact.whatsapp)} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
              </a>
            </Button>
          </div>
        </Reveal>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((h, i) => {
            const imgs = hotelImages(h);
            const cover = imgs[0];
            const wa = hotelWa(h);
            const amenities = hotelAmenities(h);
            return (
              <Reveal key={h.id} delay={(i % 3) * 90}>
                <article className="card-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-sm">
                  {/* Cover */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-forest/5">
                    {cover ? (
                      <img
                        src={cover}
                        alt={`${h.name} — ${h.city}, ${h.state}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-forest via-[#12572e] to-[#0f4a28]">
                        <Building2 className="h-12 w-12 text-cream/30" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                    {imgs.length > 1 && (
                      <Badge className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                        +{imgs.length - 1} photos
                      </Badge>
                    )}
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      <Badge className="rounded-full bg-cream/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-forest">
                        {h.category}
                      </Badge>
                      {h.partner && (
                        <Badge className="rounded-full bg-saffron px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-saffron-foreground shadow">
                          <Handshake className="mr-1 h-3 w-3" /> Partner
                        </Badge>
                      )}
                    </div>
                    <p className="absolute bottom-3 left-3 font-display text-lg font-bold text-white drop-shadow">
                      {h.name}
                    </p>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <p className="flex items-start gap-1.5 text-[13px] font-semibold text-forest/85">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 flex-none text-saffron-deep" />
                      {h.area ? `${h.area} · ` : ""}{h.city}, {h.state}
                    </p>
                    {h.description && (
                      <p className="line-clamp-3 text-[13px] leading-relaxed text-ink/70">
                        {h.description}
                      </p>
                    )}
                    {amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {amenities.slice(0, 4).map((a) => (
                          <span
                            key={a}
                            className="rounded-full border border-forest/15 bg-forest/5 px-2 py-0.5 text-[11px] font-semibold text-forest/80"
                          >
                            {a}
                          </span>
                        ))}
                        {amenities.length > 4 && (
                          <span className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            +{amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price + actions */}
                    <div className="mt-auto space-y-2.5 pt-1">
                      <div className="flex items-center justify-between rounded-xl bg-cream px-3 py-2">
                        <p className="text-[12px] font-semibold text-ink/70">
                          {h.priceFrom ? (
                            <>
                              from{" "}
                              <span className="font-display text-base font-extrabold text-forest">
                                {inr(h.priceFrom)}
                              </span>
                              <span className="text-[11px] font-medium text-ink/60">/night</span>
                            </>
                          ) : (
                            "Price on request"
                          )}
                        </p>
                        <a
                          href={h.mapUrl || undefined}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${h.name} in Google Maps`}
                          className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-bold text-forest",
                            !h.mapUrl && "pointer-events-none opacity-0"
                          )}
                        >
                          <Navigation className="h-3 w-3" /> Map
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          asChild
                          className="btn-sheen h-10 flex-1 rounded-full bg-forest text-sm font-bold text-cream hover:bg-forest/90"
                        >
                          <a href={travelTo(h)} target="_blank" rel="noreferrer">
                            <MessageCircle className="h-4 w-4" /> Book with vehicle
                          </a>
                        </Button>
                        <a
                          href={buildTelUrl(h.phone)}
                          aria-label={`Call ${h.name}`}
                          className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-forest/20 text-forest transition-all hover:border-forest hover:bg-forest/5"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`WhatsApp ${h.name}`}
                            className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-forest/20 text-forest transition-all hover:border-[#25D366] hover:bg-[#25D366]/10 hover:text-[#1da851]"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                        {h.bookingUrl && (
                          <a
                            href={h.bookingUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open booking site of ${h.name}`}
                            className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-forest/20 text-forest transition-all hover:border-forest hover:bg-forest/5"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-center text-[10.5px] text-muted-foreground">
                        Hotel contact: {hotelPhoneDisplay(h.phone)} · mention Roam Saathi for
                        traveller support
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Cross-sell strip */}
      <Reveal delay={120}>
        <div className="mx-auto mt-14 max-w-4xl rounded-3xl border border-saffron/30 bg-gradient-to-r from-saffron/10 via-cream to-forest/5 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-saffron text-saffron-foreground shadow-md">
              <Star className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg font-bold text-forest">
                Stay anywhere — we drive you there
              </p>
              <p className="mt-0.5 text-sm text-ink/70">
                Book these partner stays (or any hotel you like) and add an airport
                pickup or self-drive vehicle to the same plan. One WhatsApp, one plan.
              </p>
            </div>
            <Button asChild className="btn-sheen h-11 flex-none rounded-full bg-forest px-5 text-sm font-bold text-cream hover:bg-forest/90">
              <a href={buildWhatsAppUrl("Hello Roam Saathi! I'd like to plan a stay + vehicle combo trip.", contact.whatsapp)} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> Plan my trip
              </a>
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default StaysDirectory;
