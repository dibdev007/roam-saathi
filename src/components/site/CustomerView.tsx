"use client";

// CustomerView v3 — the public marketing site.
// Modern glass/aurora design system: animated hero mesh, scroll reveals,
// glass navbar, bento fleet cards with fuel policy, route cards with fuel
// estimates, owner-managed Stories section, reviews marquee, map embed.
// All contact points read Admin → Settings (DB) first.

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Fuel,
  Gauge,
  Users,
  Settings2,
  Car as CarIcon,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Plane,
  Hotel,
  Navigation,
  ArrowRight,
  BookOpen,
  Wallet,
  Receipt,
  Sparkles,
  IndianRupee,
  CircleHelp,
  MapPinned,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Reveal } from "@/components/site/chrome";
import {
  ScrollProgress,
  WordReveal,
  HeroOrbs,
  StatCounter,
  Tilt,
  motion,
  AnimatePresence,
} from "@/components/site/motion";
import {
  TRUST_BADGES,
  STATS,
  FLEET_CATEGORIES,
  ROUTES,
  HOW_STEPS,
  REASONS,
  TESTIMONIALS,
  FAQS,
} from "@/lib/content";
import {
  inr,
  VEHICLE_CLASSES,
  hotelImages,
  HOTEL_CATEGORY_STYLES,
  type VehicleDTO,
  type SettingsMap,
  type PageDTO,
  type HotelDTO,
} from "@/lib/siteConfig";
import { getContact, getFuelPolicy, getMapEmbed } from "@/lib/contact";
import { buildWhatsAppUrl, buildTelUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Images = Record<string, boolean>;
type Mode = "driver" | "self";

export type BookVehicleFn = (vehicle: VehicleDTO, mode?: Mode) => void;

const CLASS_IMAGE: Record<string, string> = {
  SUV: "fleet-suv.png",
  HATCHBACK: "fleet-hatchback.png",
  SEDAN: "fleet-hatchback.png",
  SCOOTER: "fleet-scooter.png",
  BIKE: "fleet-scooter.png",
  VAN: "fleet-van.png",
};

const ROUTE_KM: Record<string, number> = {
  "shillong-cherrapunji": 150,
  kaziranga: 200,
  tawang: 450,
  manas: 180,
  majuli: 350,
  "guwahati-city": 25,
};

function heroSrc(images: Images): string {
  return images["hero.png"] ? "/hero.png" : "/hero-fallback.svg";
}

function vehicleImage(v: VehicleDTO, images: Images): string {
  if (v.imageUrl && v.imageUrl.trim()) return v.imageUrl.trim();
  const file = CLASS_IMAGE[v.class] ?? "fleet-suv.png";
  return images[file] ? `/${file}` : `/fleet-suv-fallback.svg`;
}

/* ================================================================== */
/* Hero                                                                */
/* ================================================================== */

function Hero({
  images,
  settings,
  onBook,
}: {
  images: Images;
  settings?: SettingsMap;
  onBook: () => void;
}) {
  const contact = getContact(settings);
  const wa = buildWhatsAppUrl(
    "Hello Roam Saathi! I just landed at Guwahati airport and need a vehicle. Please share options.",
    contact.whatsapp
  );

  return (
    <section className="grain hero-mesh relative overflow-hidden text-cream">
      <HeroOrbs />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-28 lg:pt-20">
        {/* Copy */}
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-3.5 py-1.5 text-[12px] font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-saffron" />
              Tourist-only car rental · LGBI Airport, Guwahati
            </p>
          </Reveal>
          <h1 className="font-display mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
            <WordReveal text="Land at the airport." delay={0.15} />
            <br />
            <span className="rs-gradient-pan-text bg-gradient-to-r from-saffron via-[#ffd27a] to-saffron bg-clip-text text-transparent">
              <WordReveal text="We hand you the keys." delay={0.45} />
            </span>
          </h1>
          <Reveal delay={180}>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-cream/80 sm:text-base">
              Self-drive or with a local expert driver — SUVs, hatchbacks,
              scooters and group vans, delivered to the arrivals gate or your
              hotel. Built for tourists exploring Northeast India, from
              Shillong&apos;s rain to Tawang&apos;s passes.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                onClick={onBook}
                className="btn-sheen h-12 rounded-full bg-saffron px-6 text-[15px] font-extrabold text-saffron-foreground shadow-xl transition-transform hover:scale-[1.03]"
              >
                <CarIcon className="h-5 w-5" /> Book a vehicle
              </Button>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-cream/30 bg-cream/10 px-5 text-[15px] font-bold backdrop-blur transition-all hover:bg-cream/20"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp us
              </a>
            </div>
          </Reveal>
          <Reveal delay={340}>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-cream/75">
              {TRUST_BADGES.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-saffron" /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Visual */}
        <Reveal delay={200} className="relative">
          <div className="relative mx-auto max-w-lg">
            <div className="animate-float-slow overflow-hidden rounded-[2rem] border border-cream/20 shadow-2xl">
              <Image
                src={heroSrc(images)}
                alt="Roam Saathi vehicle ready at LGBI Airport, Guwahati"
                width={1344}
                height={768}
                priority
                className="animate-ken-burns h-full w-full object-cover"
              />
            </div>
            {/* Floating price chip */}
            <div className="glass-dark animate-float absolute -bottom-5 left-4 rounded-2xl border border-cream/15 px-4 py-3 shadow-xl sm:left-8">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-cream/60">
                Self-drive SUVs from
              </p>
              <p className="font-display text-2xl font-extrabold text-saffron">
                Rs 3,000<span className="text-sm text-cream/60">/day</span>
              </p>
            </div>
            {/* Floating review chip */}
            <div className="glass-dark animate-float absolute -top-4 right-2 flex items-center gap-2 rounded-2xl border border-cream/15 px-3.5 py-2.5 shadow-xl sm:right-6">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-saffron text-saffron" />
                ))}
              </div>
              <p className="text-xs font-bold text-cream/85">Loved by travellers</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Stats strip */}
      <div className="relative border-t border-cream/10 bg-forest-deep/40 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="text-center md:text-left">
                <p className="font-display text-2xl font-extrabold text-saffron sm:text-3xl">
                  <StatCounter value={s.value} />
                </p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-cream/60">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Marquee trust strip                                                 */
/* ================================================================== */

function TrustMarquee({ settings }: { settings?: SettingsMap }) {
  const policy = getFuelPolicy(settings);
  const items = [
    "With driver — fuel, toll & parking included",
    "Self-drive — full tank, return full",
    "24/7 airport pickup",
    "Hotel delivery across Guwahati",
    "All 8 Northeast states",
    "Transparent km limits",
    "Roadside support on call",
  ];
  return (
    <div className="border-y border-forest/10 bg-white/60 py-3 backdrop-blur">
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track items-center gap-10 pr-10">
          {[...items, ...items].map((t, i) => (
            <span
              key={i}
              className="flex flex-none items-center gap-2 text-[13px] font-semibold text-forest/75"
            >
              {i % 2 === 0 ? (
                <ShieldCheck className="h-4 w-4 text-forest" />
              ) : (
                <Fuel className="h-4 w-4 text-saffron-deep" />
              )}
              {t}
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">{policy.disclaimer}</p>
    </div>
  );
}

/* ================================================================== */
/* Section heading helper                                              */
/* ================================================================== */

function SectionHead({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-saffron-deep">
          {kicker}
        </p>
        <h2 className="font-display mt-2 text-3xl font-extrabold text-forest sm:text-4xl">
          {title}
        </h2>
        {sub && <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{sub}</p>}
      </div>
    </Reveal>
  );
}

/* ================================================================== */
/* Fleet                                                               */
/* ================================================================== */

function VehicleCard({
  v,
  images,
  settings,
  onBookVehicle,
  index,
}: {
  v: VehicleDTO;
  images: Images;
  settings?: SettingsMap;
  onBookVehicle: BookVehicleFn;
  index: number;
}) {
  const contact = getContact(settings);
  const wa = buildWhatsAppUrl(
    `Hello Roam Saathi! I'd like to book the *${v.name}* (${v.class}). Please share availability and the final quote.`,
    contact.whatsapp
  );
  const kmpl = v.mileageKmpl ?? 15;

  return (
    <Reveal delay={(index % 3) * 90}>
      <Tilt className="h-full rounded-2xl">
        <Card className="card-lift group relative flex h-full flex-col overflow-hidden border-forest/10 bg-white p-0 shadow-sm">
        <div className="relative aspect-[16/9] overflow-hidden">
          { }
          <img
            src={vehicleImage(v, images)}
            alt={v.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
          {v.popular && (
            <Badge className="absolute left-3 top-3 gap-1 rounded-full bg-saffron px-2.5 py-1 text-[11px] font-extrabold text-saffron-foreground shadow">
              <Star className="h-3 w-3 fill-current" /> Popular
            </Badge>
          )}
          <Badge className="absolute right-3 top-3 rounded-full bg-forest/90 px-2.5 py-1 text-[11px] font-bold text-cream backdrop-blur">
            {v.class}
          </Badge>
          <p className="absolute bottom-3 left-3 font-display text-lg font-bold text-white drop-shadow">
            {v.name}
          </p>
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          {/* Specs */}
          <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-ink/70">
            <span className="chip inline-flex items-center gap-1 rounded-full border border-forest/15 bg-forest/5 px-2 py-1">
              <Users className="h-3 w-3 text-forest" /> {v.seats} seats
            </span>
            <span className="chip inline-flex items-center gap-1 rounded-full border border-forest/15 bg-forest/5 px-2 py-1">
              <Settings2 className="h-3 w-3 text-forest" /> {v.transmission}
            </span>
            <span className="chip inline-flex items-center gap-1 rounded-full border border-forest/15 bg-forest/5 px-2 py-1">
              <Fuel className="h-3 w-3 text-forest" /> {v.fuelType} · ~{kmpl} km/l
            </span>
            {v.kmLimitPerDay ? (
              <span className="chip inline-flex items-center gap-1 rounded-full border border-saffron/40 bg-saffron/10 px-2 py-1 text-ink/80">
                <Gauge className="h-3 w-3 text-saffron-deep" /> {v.kmLimitPerDay} km/day incl.
              </span>
            ) : null}
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-forest px-3 py-2.5 text-cream">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cream/60">
                Self-drive
              </p>
              <p className="font-display text-lg font-extrabold leading-tight">
                {inr(v.dailyRate)}
                <span className="text-[11px] font-medium text-cream/60">/day</span>
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl px-3 py-2.5",
                v.withDriverAvailable && v.withDriverPerDay
                  ? "bg-saffron/15 text-ink"
                  : "bg-muted text-ink/50"
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                With driver
              </p>
              <p className="font-display text-lg font-extrabold leading-tight">
                {v.withDriverAvailable && v.withDriverPerDay ? (
                  <>
                    {inr(v.withDriverPerDay)}
                    <span className="text-[11px] font-medium opacity-60">/day</span>
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>

          {/* Fuel + deposit line */}
          <div className="space-y-1.5 rounded-xl border border-dashed border-forest/20 bg-cream px-3 py-2.5 text-[12px] leading-snug">
            <p className="flex items-start gap-1.5 text-ink/80">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-forest" />
              <span>
                <b>With driver:</b> fuel, toll &amp; parking included — provided by us.
              </span>
            </p>
            <p className="flex items-start gap-1.5 text-ink/80">
              <Fuel className="mt-0.5 h-3.5 w-3.5 flex-none text-saffron-deep" />
              <span>
                <b>Self-drive:</b> fuel &amp; toll at actuals
                {v.fuelNote ? ` — ${v.fuelNote}` : ""}
              </span>
            </p>
            {v.securityDeposit ? (
              <p className="flex items-start gap-1.5 text-ink/70">
                <Wallet className="mt-0.5 h-3.5 w-3.5 flex-none text-forest" />
                <span>
                  Refundable deposit {inr(v.securityDeposit)}
                  {v.extraKmRate ? ` · extra km ${inr(v.extraKmRate)}` : ""}
                </span>
              </p>
            ) : null}
          </div>

          {v.features ? (
            <p className="text-[12px] leading-relaxed text-ink/60">
              {v.features.split(",").slice(0, 4).map((f) => f.trim()).filter(Boolean).join(" · ")}
            </p>
          ) : null}

          {/* CTAs */}
          <div className="mt-auto flex gap-2 pt-1">
            <Button
              onClick={() =>
                onBookVehicle(v, v.withDriverAvailable && v.withDriverPerDay ? "driver" : "self")
              }
              className="btn-sheen h-10 flex-1 rounded-full bg-forest text-sm font-bold text-cream hover:bg-forest/90"
            >
              Book this car
            </Button>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              aria-label={`Ask about ${v.name} on WhatsApp`}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-forest/20 text-forest transition-all hover:border-[#25D366] hover:bg-[#25D366]/10 hover:text-[#1da851]"
            >
              <MessageCircle className="h-4.5 w-4.5" />
            </a>
          </div>
        </CardContent>
      </Card>
      </Tilt>
    </Reveal>
  );
}

function Fleet({
  images,
  vehicles,
  settings,
  onBookVehicle,
}: {
  images: Images;
  vehicles: VehicleDTO[];
  settings?: SettingsMap;
  onBookVehicle: BookVehicleFn;
}) {
  const [filter, setFilter] = React.useState<string>("ALL");
  const classes = React.useMemo(() => {
    const present = new Set(vehicles.map((v) => v.class));
    return VEHICLE_CLASSES.filter((c) => present.has(c));
  }, [vehicles]);
  const shown = filter === "ALL" ? vehicles : vehicles.filter((v) => v.class === filter);

  return (
    <section id="fleet" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Our fleet"
          title="Pick your road partner"
          sub="Every vehicle is tourist-only, sanitised, and handed over with a full tank at the airport or your hotel. Rates are owner-managed and always current."
        />

        {vehicles.length > 0 && (
          <>
            <Reveal delay={120}>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {["ALL", ...classes].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    className={cn(
                      "chip rounded-full border px-4 py-1.5 text-[13px] font-bold",
                      filter === c
                        ? "border-forest bg-forest text-cream shadow-md"
                        : "border-forest/20 bg-white text-forest/80 hover:border-forest/50"
                    )}
                    aria-pressed={filter === c}
                  >
                    {c === "ALL" ? "All vehicles" : c}
                  </button>
                ))}
              </div>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {shown.map((v, i) => (
                  <motion.div
                    key={v.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <VehicleCard
                      v={v}
                      images={images}
                      settings={settings}
                      onBookVehicle={onBookVehicle}
                      index={i}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Fallback when DB is empty */}
        {vehicles.length === 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FLEET_CATEGORIES.map((c, i) => (
              <Reveal key={c.key} delay={i * 80}>
                <Card className="card-lift h-full border-forest/10 bg-white">
                  <CardContent className="p-0">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg">
                      { }
                      <img
                        src={images[`${c.imageKey}.png`] ? `/${c.imageKey}.png` : `/${c.imageKey}-fallback.svg`}
                        alt={c.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-display text-lg font-bold text-forest">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.examples.join(" · ")}</p>
                      <p className="mt-2 text-[13px] leading-relaxed text-ink/70">{c.blurb}</p>
                      <p className="mt-3 text-sm font-bold text-saffron-deep">
                        from {inr(c.fromPrice)}/day
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ================================================================== */
/* Rate card table (#rates)                                            */
/* ================================================================== */

function RateCard({ vehicles }: { vehicles: VehicleDTO[] }) {
  return (
    <section id="rates" className="bg-gradient-to-b from-transparent via-white/50 to-transparent py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Rate card"
          title="Honest pricing, nothing hidden"
          sub="With-driver fares are all-inclusive (fuel, toll, parking, driver). Self-drive fares exclude fuel & toll — pay at actuals."
        />
        <Reveal delay={140}>
          <div className="rs-scroll mt-8 overflow-x-auto rounded-2xl border border-forest/10 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-forest/10 bg-forest text-cream">
                  <th className="px-4 py-3 font-bold">Vehicle</th>
                  <th className="px-4 py-3 font-bold">Class</th>
                  <th className="px-4 py-3 text-right font-bold">Self-drive / day</th>
                  <th className="px-4 py-3 text-right font-bold">With driver / day</th>
                  <th className="px-4 py-3 text-right font-bold">Deposit</th>
                  <th className="px-4 py-3 text-right font-bold">Included km</th>
                  <th className="px-4 py-3 font-bold">Fuel</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v, i) => (
                  <tr
                    key={v.id}
                    className={cn(
                      "border-b border-forest/5 transition-colors last:border-0 hover:bg-cream",
                      i % 2 === 1 && "bg-cream/40"
                    )}
                  >
                    <td className="px-4 py-3 font-bold text-forest">{v.name}</td>
                    <td className="px-4 py-3 text-ink/70">{v.class}</td>
                    <td className="px-4 py-3 text-right font-semibold">{inr(v.dailyRate)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-saffron-deep">
                      {v.withDriverAvailable && v.withDriverPerDay ? inr(v.withDriverPerDay) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-ink/70">
                      {v.securityDeposit ? inr(v.securityDeposit) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-ink/70">
                      {v.kmLimitPerDay ? `${v.kmLimitPerDay} km/day` : "Unlimited*"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-forest/5 px-2 py-1 text-[11px] font-semibold text-forest">
                        <ShieldCheck className="h-3 w-3" /> incl. w/ driver
                      </span>
                      <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-saffron/10 px-2 py-1 text-[11px] font-semibold text-saffron-deep">
                        <Fuel className="h-3 w-3" /> extra self
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            * Unlimited-km vehicles are marked on their card. Hill routes (Shillong, Cherrapunji,
            Tawang) consume noticeably more fuel — the booking form estimates litres for your route.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Routes                                                              */
/* ================================================================== */

function Routes({ settings }: { settings?: SettingsMap }) {
  const policy = getFuelPolicy(settings);
  const price = policy.fuelPricePerLitre;
  return (
    <section id="routes" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Popular routes"
          title="Where will the road take you?"
          sub="Fuel differs on every route — hills climb, plains cruise. Pick with-driver for a fully inclusive fare, or self-drive and budget with the estimates below."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((r, i) => {
            const km = ROUTE_KM[r.id] ?? 100;
            const litres = Math.ceil((km * 2) / 14);
            return (
              <Reveal key={r.id} delay={(i % 3) * 90}>
                <Card className="card-lift flex h-full flex-col border-forest/10 bg-white">
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-lg font-bold leading-snug text-forest">
                        {r.title}
                      </p>
                      <Badge className="flex-none rounded-full bg-forest/10 text-[11px] font-bold text-forest">
                        {r.duration}
                      </Badge>
                    </div>
                    <div className="route-dots my-3 h-0.5 w-full opacity-60" />
                    <ul className="space-y-1.5">
                      {r.highlights.slice(0, 3).map((h) => (
                        <li key={h} className="flex items-start gap-2 text-[13px] text-ink/75">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-none text-saffron-deep" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-forest/80">
                      <CarIcon className="h-3.5 w-3.5" /> {r.vehicle}
                    </p>
                    {r.note && (
                      <p className="mt-2 rounded-lg bg-saffron/10 px-2.5 py-1.5 text-[11px] font-medium text-ink/80">
                        {r.note}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 rounded-xl bg-cream px-3 py-2 pt-2 text-[11px] font-semibold text-ink/75 mt-3">
                      <span className="inline-flex items-center gap-1">
                        <Navigation className="h-3 w-3 text-forest" /> ~{km} km one-way
                      </span>
                      <span className="inline-flex items-center gap-1 text-saffron-deep">
                        <Fuel className="h-3 w-3" /> self-drive ≈ {litres} L ≈ {inr(litres * price)} rt
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={150}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
            Fuel estimates assume ~14 km/l round trips at {inr(price)}/litre — indicative only.
            With-driver fares already include every litre, every toll, every parking fee.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/* How it works + Why us                                               */
/* ================================================================== */

function HowItWorks() {
  return (
    <section id="how" className="bg-white/60 py-16 backdrop-blur sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHead kicker="Effortless" title="Booked in four steps" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className="relative h-full rounded-2xl border border-forest/10 bg-white p-5 shadow-sm card-lift">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-cream shadow-md">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="font-display mt-4 text-base font-bold text-forest">
                  <span className="mr-1.5 text-saffron-deep">{i + 1}.</span>
                  {s.title}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink/70">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section id="why" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Why Roam Saathi"
          title="Built for tourists, not locals"
          sub="We only serve travellers — so every process, from the airport handover to the route advice, is designed around your trip."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={(i % 3) * 90}>
              <div className="card-lift flex h-full gap-3.5 rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-saffron/15 text-saffron-deep">
                  <r.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-forest">{r.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink/70">{r.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Stories (owner-managed pages)                                       */
/* ================================================================== */

function Stories({ pages }: { pages: PageDTO[] }) {
  if (pages.length === 0) return null;
  return (
    <section id="stories" className="bg-gradient-to-b from-transparent via-white/50 to-transparent py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Stories & guides"
          title="From the road"
          sub="Travel diaries, route guides and honest customer stories — written by our travellers, published by the owner."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pages.slice(0, 6).map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 90}>
              <Link href={`/p/${p.slug}`} className="group block h-full">
                <Card className="card-lift flex h-full flex-col overflow-hidden border-forest/10 bg-white p-0">
                  <div className="relative aspect-[16/9] overflow-hidden bg-forest/5">
                    {p.coverImage ? (
                       
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-forest to-[#0f4a28]">
                        <BookOpen className="h-10 w-10 text-cream/40" />
                      </div>
                    )}
                    <Badge className="absolute left-3 top-3 rounded-full bg-cream/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-forest">
                      {p.type === "travel-diary" ? "Travel diary" : p.type === "customer-story" ? "Customer story" : p.type === "blog" ? "Guide" : "Story"}
                    </Badge>
                  </div>
                  <CardContent className="flex flex-1 flex-col p-5">
                    <p className="font-display text-lg font-bold leading-snug text-forest group-hover:text-forest/90">
                      {p.title}
                    </p>
                    {p.excerpt && (
                      <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink/70">
                        {p.excerpt}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-bold text-saffron-deep">
                      Read the story
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Stays & Partners preview (v4) — featured hotels from the directory  */
/* ================================================================== */

function StaysPreview({ hotels }: { hotels: HotelDTO[] }) {
  if (hotels.length === 0) return null;
  return (
    <section id="stays" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Stays & partners"
          title="Sleep well, drive further"
          sub="Handpicked hotels, resorts and homestays we trust across the Northeast — pair any of them with your vehicle in one plan."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.slice(0, 3).map((h, i) => {
            const imgs = hotelImages(h);
            const cover = imgs[0];
            return (
              <Reveal key={h.id} delay={(i % 3) * 90}>
                <Tilt className="h-full rounded-2xl">
                  <Link href="/stays" className="group block h-full">
                    <Card className="card-lift relative flex h-full flex-col overflow-hidden border-forest/10 bg-white p-0">
                      <div className="relative aspect-[16/9] overflow-hidden bg-forest/5">
                        {cover ? (
                          <img
                            src={cover}
                            alt={`${h.name} — ${h.city}, ${h.state}`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-forest to-[#0f4a28]">
                            <Hotel className="h-10 w-10 text-cream/40" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent" />
                        <Badge
                          className={cn(
                            "absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider",
                            HOTEL_CATEGORY_STYLES[h.category] ?? "border-forest/25 bg-white text-forest"
                          )}
                        >
                          {h.category}
                        </Badge>
                        <p className="absolute bottom-3 left-3 font-display text-lg font-bold text-white drop-shadow">
                          {h.name}
                        </p>
                      </div>
                      <CardContent className="flex flex-1 flex-col p-5">
                        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-forest/85">
                          <MapPin className="h-3.5 w-3.5 text-saffron-deep" />
                          {h.city}, {h.state}
                        </p>
                        {h.description && (
                          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink/70">
                            {h.description}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <span className="text-[13px] font-bold text-forest">
                            {h.priceFrom ? (
                              <>
                                from {inr(h.priceFrom)}
                                <span className="text-[11px] font-medium text-ink/55">/night</span>
                              </>
                            ) : (
                              "Price on request"
                            )}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-saffron-deep">
                            View all stays
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Reviews marquee                                                     */
/* ================================================================== */

function Reviews() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section id="reviews" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Reviews"
          title="Travellers who roamed with us"
          sub="Real words from our first season on the road."
        />
      </div>
      <Reveal delay={120}>
        <div className="marquee-mask mt-10 overflow-hidden">
          <div className="marquee-track gap-5 pr-5">
            {doubled.map((t, i) => (
              <div
                key={i}
                className="w-[320px] flex-none rounded-2xl border border-forest/10 bg-white p-5 shadow-sm sm:w-[360px]"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-saffron text-saffron" />
                  ))}
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink/80">“{t.text}”</p>
                <p className="mt-3 text-xs font-bold text-forest">
                  {t.name}{" "}
                  <span className="font-medium text-muted-foreground">
                    · {t.origin} · {t.trip}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ================================================================== */
/* FAQ                                                                 */
/* ================================================================== */

function Faq({ settings }: { settings?: SettingsMap }) {
  const policy = getFuelPolicy(settings);
  return (
    <section id="faq" className="bg-white/60 py-16 backdrop-blur sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHead kicker="FAQ" title="Questions travellers ask" />
        <Reveal delay={120}>
          <Accordion type="single" collapsible className="mt-8">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="border-forest/10">
                <AccordionTrigger className="text-left text-[15px] font-bold text-forest hover:no-underline">
                  <span className="flex items-center gap-2">
                    <CircleHelp className="h-4 w-4 flex-none text-saffron-deep" />
                    {f.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-[14px] leading-relaxed text-ink/75">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
            <AccordionItem value="q-fuel" className="border-forest/10">
              <AccordionTrigger className="text-left text-[15px] font-bold text-forest hover:no-underline">
                <span className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 flex-none text-saffron-deep" />
                  Who pays for fuel and tolls — with driver vs self-drive?
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-[14px] leading-relaxed text-ink/75">
                {policy.withDriver} On the self-drive side: {policy.selfDrive}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Contact + map                                                       */
/* ================================================================== */

function Contact({ settings }: { settings?: SettingsMap }) {
  const contact = getContact(settings);
  const map = getMapEmbed(settings);
  const wa = buildWhatsAppUrl(
    "Hello Roam Saathi! I'd like to enquire about a vehicle rental.",
    contact.whatsapp
  );

  const cards = [
    { icon: Phone, label: "Call us 24×7", value: contact.phoneDisplay, href: buildTelUrl(contact.phone) },
    { icon: MessageCircle, label: "WhatsApp (fastest)", value: `+${contact.whatsapp}`, href: wa },
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { icon: Clock, label: "Hours", value: contact.hours, href: undefined },
    { icon: MapPin, label: "Find us", value: contact.address, href: undefined },
  ];

  return (
    <section id="contact" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Reach us"
          title="A message away, any hour"
          sub="Call, WhatsApp or email — we reply within minutes around the clock, because flights land at odd times."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {cards.map((c, i) => {
              const inner = (
                <div className="card-lift flex items-start gap-3 rounded-2xl border border-forest/10 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-forest text-cream">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {c.label}
                    </p>
                    <p className="break-words text-sm font-semibold text-forest">{c.value}</p>
                  </div>
                </div>
              );
              return (
                <Reveal key={c.label} delay={i * 70}>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block">
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </Reveal>
              );
            })}
            <Reveal delay={350}>
              <a
                href="/p/rules-and-policies"
                className="card-lift flex items-start gap-3 rounded-2xl border border-saffron/40 bg-saffron/10 p-4"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-saffron text-saffron-foreground">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink/60">
                    Before you book
                  </p>
                  <p className="text-sm font-semibold text-forest">
                    Rules &amp; Policies — fuel, tolls, deposits &amp; cancellations
                  </p>
                </div>
              </a>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <div className="overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-forest/10 bg-cream px-4 py-2.5">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest">
                  <MapPinned className="h-4 w-4 text-saffron-deep" /> Pickup point — LGBI Airport, Borjhar
                </p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-forest/70">
                  <Plane className="h-3.5 w-3.5" /> Arrivals gate
                </span>
              </div>
              <iframe
                src={map}
                title="Roam Saathi location — LGBI Airport, Guwahati"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[340px] w-full border-0 sm:h-[420px]"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Final CTA                                                           */
/* ================================================================== */

function FinalCta({ onBook, settings }: { onBook: () => void; settings?: SettingsMap }) {
  const contact = getContact(settings);
  const wa = buildWhatsAppUrl(
    "Hello Roam Saathi! I'm planning a Northeast trip — please help me pick a vehicle.",
    contact.whatsapp
  );
  return (
    <section className="px-4 pb-20 sm:px-6">
      <Reveal>
        <div className="grain hero-mesh relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 py-14 text-center text-cream sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-saffron/20 blur-3xl"
          />
          <h2 className="font-display relative text-3xl font-extrabold sm:text-4xl">
            The Northeast is waiting.{" "}
            <span className="bg-gradient-to-r from-saffron to-[#ffd27a] bg-clip-text text-transparent">
              Start your engine.
            </span>
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-[15px] text-cream/80">
            Tell us your dates and destination — we&apos;ll reply with the right vehicle and an
            honest, all-in quote within minutes.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button
              onClick={onBook}
              className="btn-sheen h-12 rounded-full bg-saffron px-7 text-[15px] font-extrabold text-saffron-foreground shadow-xl transition-transform hover:scale-[1.03]"
            >
              <CarIcon className="h-5 w-5" /> Book a vehicle
            </Button>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-cream/30 bg-cream/10 px-6 text-[15px] font-bold backdrop-blur hover:bg-cream/20"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp {contact.phoneDisplay}
            </a>
          </div>
          <p className="relative mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-cream/65">
            <span className="inline-flex items-center gap-1.5">
              <Hotel className="h-3.5 w-3.5" /> Hotel delivery available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Plane className="h-3.5 w-3.5" /> Free airport pickup
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5" /> UPI · Cash · no gateway fees
            </span>
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ================================================================== */
/* Root                                                                */
/* ================================================================== */

export function CustomerView({
  images,
  vehicles = [],
  settings = {},
  homePages = [],
  hotels = [],
  onBook,
  onBookVehicle,
}: {
  images: Images;
  vehicles?: VehicleDTO[];
  settings?: SettingsMap;
  homePages?: PageDTO[];
  hotels?: HotelDTO[];
  onBook: () => void;
  onBookVehicle: BookVehicleFn;
}) {
  return (
    <main>
      <Hero images={images} settings={settings} onBook={onBook} />
      <TrustMarquee settings={settings} />
      <Fleet images={images} vehicles={vehicles} settings={settings} onBookVehicle={onBookVehicle} />
      {vehicles.length > 0 && <RateCard vehicles={vehicles} />}
      <Routes settings={settings} />
      <HowItWorks />
      <WhyUs />
      <StaysPreview hotels={hotels} />
      <Stories pages={homePages} />
      <Reviews />
      <Faq settings={settings} />
      <Contact settings={settings} />
      <FinalCta onBook={onBook} settings={settings} />
    </main>
  );
}

export default CustomerView;
