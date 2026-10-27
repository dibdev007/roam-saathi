"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
  Send,
  KeyRound,
  Compass,
  Plane,
  Users,
  Mountain,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { RhinoLogo } from "@/components/brand/RhinoLogo";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import {
  BUSINESS_NAME,
  TAGLINE,
  EMAIL,
  BUSINESS_PHONE,
  BUSINESS_PHONE_DISPLAY,
  ADDRESS_LINE,
  HOURS,
  SERVICE_AREAS,
  PICKUP_TYPES,
  VEHICLE_CLASSES,
} from "@/lib/siteConfig";
import { buildWhatsAppUrl, buildTelUrl, buildMailtoUrl } from "@/lib/whatsapp";
import {
  TRUST_BADGES,
  STATS,
  FLEET_CATEGORIES,
  ROUTES,
  HOW_STEPS,
  REASONS,
  TESTIMONIALS,
  FAQS,
  type FleetCategory,
  type Route as RouteType,
} from "@/lib/content";

type Images = Record<string, boolean>;

const NAV_LINKS = [
  { href: "#fleet", label: "Fleet" },
  { href: "#routes", label: "Routes" },
  { href: "#how", label: "How it works" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-saffron">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">{subtitle}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */
export function Header() {
  const [open, setOpen] = React.useState(false);
  const waMsg = `Hello ${BUSINESS_NAME}! I'd like to enquire about a vehicle rental. Please share availability and quotes.`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e6ddc8] bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" aria-label={`${BUSINESS_NAME} — home`} className="flex items-center">
          <RhinoLogo withWordmark className="h-9 w-9" />
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-forest/80 transition-colors hover:bg-forest/5 hover:text-forest"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={buildTelUrl(BUSINESS_PHONE)}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-forest transition-colors hover:bg-forest/5 sm:inline-flex"
            aria-label={`Call ${BUSINESS_PHONE_DISPLAY}`}
          >
            <Phone className="h-5 w-5" />
          </a>
          <WhatsAppButton
            message={waMsg}
            className="hidden bg-saffron text-saffron-foreground shadow-sm hover:bg-saffron/90 sm:inline-flex"
          >
            Book on WhatsApp
          </WhatsAppButton>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-forest/20 text-forest md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-cream">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="mt-6 flex items-center gap-2">
                <RhinoLogo withWordmark className="h-8 w-8" />
              </div>
              <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <a
                      href={l.href}
                      className="flex items-center justify-between rounded-md px-3 py-3 text-base font-medium text-forest transition-colors hover:bg-forest/5"
                    >
                      {l.label}
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-2">
                <WhatsAppButton
                  message={waMsg}
                  className="bg-saffron text-saffron-foreground hover:bg-saffron/90"
                >
                  Book on WhatsApp
                </WhatsAppButton>
                <a href={buildTelUrl(BUSINESS_PHONE)}>
                  <Button variant="outline" className="w-full border-forest/20 text-forest">
                    <Phone className="h-4 w-4" /> Call {BUSINESS_PHONE_DISPLAY}
                  </Button>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
export function Hero({ images }: { images: Images }) {
  const heroSrc = images["hero.png"] ? "/hero.png" : "/hero-fallback.svg";
  const waMsg = `Hello ${BUSINESS_NAME}! I'd like to rent a vehicle for my Northeast trip. Please share availability and quotes.`;

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-forest text-cream"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroSrc}
          alt="Roam Saathi — tourist vehicle rental near LGBI Airport, Guwahati"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/80 to-forest/30" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 border-saffron/40 bg-saffron/15 text-saffron hover:bg-saffron/20">
            <Plane className="mr-1 h-3.5 w-3.5" /> Tourist-only · LGBI Airport
          </Badge>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-cream sm:text-5xl lg:text-6xl">
            Rent the perfect ride for your{" "}
            <span className="text-saffron">Northeast adventure</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-cream/85 sm:text-lg">
            Self-drive & chauffeur-driven cars, SUVs, scooters and group vans.
            24/7 airport pickup at LGBI Borjhar. Coverage across all 8 Northeast
            states — Shillong, Cherrapunji, Tawang, Kaziranga, Majuli and beyond.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton
              message={waMsg}
              className="bg-saffron text-saffron-foreground shadow-lg shadow-saffron/20 hover:bg-saffron/90"
              size="lg"
            >
              Book on WhatsApp
            </WhatsAppButton>
            <a href="#fleet">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-cream/40 bg-transparent text-cream hover:bg-cream/10 hover:text-cream sm:w-auto"
              >
                Browse Fleet
              </Button>
            </a>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {TRUST_BADGES.map((b) => (
              <li key={b} className="flex items-center gap-2 text-cream/90">
                <CheckCircle2 className="h-4 w-4 text-saffron" />
                {b}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stats strip                                                         */
/* ------------------------------------------------------------------ */
export function StatsStrip() {
  return (
    <section aria-label="At a glance" className="border-b border-[#e6ddc8] bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden border-x border-[#e6ddc8] sm:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-cream px-4 py-6 text-center"
          >
            <div className="text-3xl font-extrabold text-forest sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Fleet                                                               */
/* ------------------------------------------------------------------ */
function FleetCard({ cat, images }: { cat: FleetCategory; images: Images }) {
  const imgKey = `${cat.imageKey}.png`;
  const imgSrc = images[imgKey] ? `/${cat.imageKey}.png` : `/${cat.imageKey}-fallback.svg`;
  const waMsg = `Hello ${BUSINESS_NAME}! I'm interested in the ${cat.name} category (${cat.examples.join(", ")}). Please share availability and a quote for my dates.`;

  return (
    <Card className="group flex flex-col overflow-hidden border-[#e6ddc8] bg-card transition-shadow hover:shadow-xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={imgSrc}
          alt={`${cat.name} rental — ${cat.examples.join(", ")}`}
          fill
          sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge className="bg-saffron text-saffron-foreground shadow">
            from ₹{cat.fromPrice.toLocaleString("en-IN")}/day
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-forest">{cat.name}</CardTitle>
        <CardDescription className="text-sm">{cat.tagline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm text-muted-foreground">{cat.blurb}</p>

        <ul className="grid grid-cols-1 gap-1.5 text-xs text-foreground/80">
          <li className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-forest" /> {cat.seats}
          </li>
          <li className="flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-forest" /> {cat.transmission}
          </li>
          <li className="flex items-center gap-2">
            <KeyRound className="h-3.5 w-3.5 text-forest" /> {cat.mode}
          </li>
        </ul>

        <div className="mt-auto flex flex-wrap gap-1">
          {cat.examples.map((e) => (
            <Badge key={e} variant="outline" className="border-forest/20 text-forest">
              {e}
            </Badge>
          ))}
        </div>

        <WhatsAppButton
          message={waMsg}
          className="bg-forest text-white hover:bg-forest/90"
          size="sm"
        >
          Enquire on WhatsApp
        </WhatsAppButton>
      </CardContent>
    </Card>
  );
}

export function FleetShowcase({ images }: { images: Images }) {
  return (
    <section id="fleet" className="scroll-mt-20 bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Fleet"
          title="A ride for every Northeast journey"
          subtitle="Four vehicle classes, transparent per-day rates, and the option of a verified Saathi behind the wheel."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FLEET_CATEGORIES.map((cat) => (
            <FleetCard key={cat.key} cat={cat} images={images} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Routes / packages                                                   */
/* ------------------------------------------------------------------ */
function RouteCard({ r }: { r: RouteType }) {
  const waMsg = `Hello ${BUSINESS_NAME}! I'd like to plan this trip: ${r.title} (${r.duration}). Ideal vehicle: ${r.vehicle}. Please share a quote.`;
  return (
    <Card className="flex flex-col border-[#e6ddc8] bg-card transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="border-saffron/40 bg-saffron/10 text-saffron">
            <Mountain className="mr-1 h-3 w-3" /> {r.duration}
          </Badge>
        </div>
        <CardTitle className="mt-2 text-lg text-forest">{r.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Ideal vehicle
        </p>
        <p className="-mt-2 text-sm text-foreground">{r.vehicle}</p>

        <ul className="grid grid-cols-1 gap-1.5 text-sm text-foreground/85">
          {r.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-forest" />
              {h}
            </li>
          ))}
        </ul>

        {r.note && (
          <p className="rounded-md bg-saffron/10 p-2 text-xs text-saffron">
            <strong>Note:</strong> {r.note}
          </p>
        )}

        <WhatsAppButton
          message={waMsg}
          className="mt-auto bg-forest text-white hover:bg-forest/90"
          size="sm"
        >
          Plan this trip on WhatsApp
        </WhatsAppButton>
      </CardContent>
    </Card>
  );
}

export function RoutesSection() {
  return (
    <section id="routes" className="scroll-mt-20 bg-forest/5 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Popular Routes"
          title="Tried-and-tested Northeast itineraries"
          subtitle="Tell us which one fits your dates — we'll handle the vehicle, driver, permits and route guidance."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((r) => (
            <RouteCard key={r.id} r={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */
export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From WhatsApp to the open road in 4 steps"
        />
        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="relative border-[#e6ddc8] bg-card">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest text-cream">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="absolute right-4 top-4 text-3xl font-extrabold text-forest/15">
                    {i + 1}
                  </span>
                  <CardTitle className="mt-2 text-base text-forest">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why Roam Saathi                                                     */
/* ------------------------------------------------------------------ */
export function WhySection() {
  return (
    <section
      id="why"
      className="scroll-mt-20 bg-forest py-16 text-cream sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-saffron">
            Why Roam Saathi
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
            Your Saathi on every Northeast road
          </h2>
          <p className="mt-3 text-base text-cream/80 sm:text-lg">
            We are not a national chain. We are a small, local team that has
            driven every pass, ferry and forest road in the region.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35 }}
                className="rounded-xl border border-cream/15 bg-cream/5 p-5"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-saffron text-saffron-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-cream">{r.title}</h3>
                <p className="mt-1.5 text-sm text-cream/80">{r.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */
export function ReviewsSection() {
  return (
    <section id="reviews" className="scroll-mt-20 bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Reviews"
          title="What tourists say about Roam Saathi"
          subtitle="Sample reviews shown for launch — real customer reviews will replace these once bookings begin."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="flex flex-col border-[#e6ddc8] bg-card">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-1 text-saffron" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90">"{t.text}"</p>
                <div className="mt-auto pt-3">
                  <p className="text-sm font-bold text-forest">{t.name}</p>
                  <p className="text-xs text-muted-foreground">from {t.origin}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.trip}</p>
                </div>
                <Badge variant="outline" className="w-fit border-forest/15 text-[10px] text-muted-foreground">
                  Sample review
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */
export function FAQSection() {
  return (
    <section id="faq" className="scroll-mt-20 bg-forest/5 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Everything you need to know before you book"
        />
        <Accordion type="single" collapsible className="mt-8 w-full">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="border-b border-[#e6ddc8]"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-forest hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-foreground/85">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Booking form                                                        */
/* ------------------------------------------------------------------ */
export function BookingSection() {
  const [submitting, setSubmitting] = React.useState(false);
  const today = new Date().toISOString().slice(0, 16);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      pickupType: String(fd.get("pickupType") ?? ""),
      pickupLocation: String(fd.get("pickupLocation") ?? ""),
      pickupDate: String(fd.get("pickupDate") ?? ""),
      returnDate: String(fd.get("returnDate") ?? ""),
      vehicleClass: String(fd.get("vehicleClass") ?? ""),
      withDriver: fd.get("withDriver") === "on",
      message: String(fd.get("message") ?? ""),
    };

    if (
      !data.name || !data.phone || !data.pickupType ||
      !data.pickupDate || !data.returnDate || !data.vehicleClass
    ) {
      toast.error("Please fill all required fields.");
      setSubmitting(false);
      return;
    }

    const pickup = new Date(data.pickupDate);
    const ret = new Date(data.returnDate);
    if (ret <= pickup) {
      toast.error("Return date must be after pickup date.");
      setSubmitting(false);
      return;
    }

    // (a) Build WhatsApp deep link
    const msg = `*${BUSINESS_NAME} — New Booking Enquiry*%0A%0A` +
      `*Name:* ${data.name}%0A` +
      `*Phone:* ${data.phone}%0A` +
      `*Pickup type:* ${data.pickupType}%0A` +
      `*Pickup location:* ${data.pickupLocation || "—"}%0A` +
      `*Pickup date & time:* ${data.pickupDate.replace("T", " ")}%0A` +
      `*Return date:* ${data.returnDate.replace("T", " ")}%0A` +
      `*Vehicle class:* ${data.vehicleClass}%0A` +
      `*With driver:* ${data.withDriver ? "Yes" : "No (self-drive)"}%0A` +
      `*Message:* ${data.message || "—"}`;
    const waUrl = buildWhatsAppUrl(decodeURIComponent(msg));

    // (b) Save to Prisma via API
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Failed to submit enquiry");
      }
      // (c) Success toast
      toast.success("Enquiry saved! Opening WhatsApp to confirm with our team…");
      // Open WhatsApp in a new tab
      window.open(waUrl, "_blank", "noopener,noreferrer");
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? `Could not save enquiry: ${err.message}`
          : "Could not save enquiry. Please WhatsApp us directly.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="book" className="scroll-mt-20 bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Book Now"
          title="Send us your trip details"
          subtitle="Submit the form — we save your enquiry and open WhatsApp pre-filled so you can confirm instantly."
        />
        <Card className="mt-8 border-[#e6ddc8] bg-card">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" name="name" required placeholder="e.g. Rohit Sharma" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone (with country code) *</Label>
                <Input id="phone" name="phone" required type="tel" placeholder="+91 98XXX XXXXX" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pickupType">Pickup type *</Label>
                <Select name="pickupType" required>
                  <SelectTrigger id="pickupType">
                    <SelectValue placeholder="Select pickup type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PICKUP_TYPES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pickupLocation">Pickup location</Label>
                <Input id="pickupLocation" name="pickupLocation" placeholder="e.g. LGBI Airport, Hotel Brahmaputra Ashok" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pickupDate">Pickup date & time *</Label>
                <Input id="pickupDate" name="pickupDate" type="datetime-local" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="returnDate">Return date *</Label>
                <Input id="returnDate" name="returnDate" type="datetime-local" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vehicleClass">Vehicle class *</Label>
                <Select name="vehicleClass" required>
                  <SelectTrigger id="vehicleClass">
                    <SelectValue placeholder="Select vehicle class" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Checkbox name="withDriver" /> I want a chauffeur/driver
                </label>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="Tell us your destination, number of passengers, any special requests…"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  By submitting, you agree to be contacted on WhatsApp/phone by {BUSINESS_NAME}.
                </p>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-saffron text-saffron-foreground hover:bg-saffron/90"
                >
                  {submitting ? "Submitting…" : "Send enquiry & open WhatsApp"}
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */
export function ContactSection() {
  const waMsg = `Hello ${BUSINESS_NAME}! I'd like to enquire about a vehicle rental.`;
  return (
    <section id="contact" className="scroll-mt-20 bg-forest/5 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Reach Roam Saathi"
          subtitle="Call, WhatsApp or email — we reply fast. Open 24/7 for airport pickups."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Card className="border-[#e6ddc8] bg-card">
            <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              <a
                href={buildTelUrl(BUSINESS_PHONE)}
                className="flex items-start gap-3 rounded-lg border border-[#e6ddc8] p-4 transition-colors hover:bg-forest/5"
              >
                <Phone className="h-5 w-5 flex-shrink-0 text-forest" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Call us</p>
                  <p className="text-sm font-medium text-forest">{BUSINESS_PHONE_DISPLAY}</p>
                </div>
              </a>

              <a
                href={buildWhatsAppUrl(waMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg border border-[#e6ddc8] p-4 transition-colors hover:bg-saffron/5"
              >
                <MessageCircle className="h-5 w-5 flex-shrink-0 text-saffron" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp</p>
                  <p className="text-sm font-medium text-forest">Tap to chat</p>
                </div>
              </a>

              <a
                href={buildMailtoUrl(EMAIL, "Vehicle rental enquiry")}
                className="flex items-start gap-3 rounded-lg border border-[#e6ddc8] p-4 transition-colors hover:bg-forest/5"
              >
                <Mail className="h-5 w-5 flex-shrink-0 text-forest" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-forest break-all">{EMAIL}</p>
                </div>
              </a>

              <div className="flex items-start gap-3 rounded-lg border border-[#e6ddc8] p-4">
                <Clock className="h-5 w-5 flex-shrink-0 text-forest" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hours</p>
                  <p className="text-sm font-medium text-forest">{HOURS}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-[#e6ddc8] p-4 sm:col-span-2">
                <MapPin className="h-5 w-5 flex-shrink-0 text-forest" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-forest">{ADDRESS_LINE}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="overflow-hidden rounded-xl border border-[#e6ddc8] bg-card">
            <iframe
              title="Map — LGBI Airport, Borjhar, Guwahati"
              src="https://www.google.com/maps?q=Lokpriya+Gopinath+Bordoloi+International+Airport&output=embed"
              className="h-full min-h-[320px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */
export function Footer() {
  return (
    <footer className="mt-auto bg-forest text-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <RhinoLogo withWordmark light className="h-10 w-10" />
          <p className="mt-3 text-sm text-cream/80">{TAGLINE}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-saffron">Quick links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-cream/85 hover:text-cream hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-saffron">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-cream/85">
            <li><a href={buildTelUrl(BUSINESS_PHONE)} className="hover:text-cream hover:underline">{BUSINESS_PHONE_DISPLAY}</a></li>
            <li><a href={buildMailtoUrl(EMAIL)} className="hover:text-cream hover:underline break-all">{EMAIL}</a></li>
            <li>{ADDRESS_LINE}</li>
            <li>{HOURS}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-saffron">Service areas</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {SERVICE_AREAS.map((s) => (
              <li key={s}>
                <Badge variant="outline" className="border-cream/25 text-cream/85">
                  {s}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-cream/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {BUSINESS_NAME}. Tourist vehicle rental near LGBI Airport, Guwahati · Serving all Northeast India.
          </p>
          <p className="text-cream/50">
            Made with care in Assam · {`WhatsApp +${BUSINESS_PHONE.replace(/[^\d]/g, "")}`}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Customer view (composite)                                           */
/* ------------------------------------------------------------------ */
export function CustomerView({ images }: { images: Images }) {
  return (
    <>
      <Header />
      <main>
        <Hero images={images} />
        <StatsStrip />
        <FleetShowcase images={images} />
        <RoutesSection />
        <HowItWorks />
        <WhySection />
        <ReviewsSection />
        <FAQSection />
        <BookingSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

export default CustomerView;
