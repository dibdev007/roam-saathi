"use client";

// Customers manager — the Roam Saathi CRM (v6).
// Every renter is captured with their lead source (WhatsApp, Google Maps,
// walk-in…), full A-to-Z profile and the KYC pack (photo ID, address proof,
// driving licence — each with a scanned document stored in the database).
// From here the owner also generates one-time agreement signing links.

import * as React from "react";
import {
  BadgeCheck,
  Car,
  Copy,
  Download,
  FileSignature,
  FileText,
  IdCard,
  Loader2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fmtDateTime } from "@/components/admin/adminShared";
import {
  ADDRESS_PROOF_TYPES,
  CUSTOMER_SOURCES,
  ID_PROOF_TYPES,
  type AgreementDTO,
  type CustomerDTO,
  type VehicleDTO,
} from "@/lib/siteConfig";

/* ------------------------------------------------------------------ */
/* Document upload helper (client-side compression)                    */
/* ------------------------------------------------------------------ */

/** Images are downscaled to JPEG (max 1600px) to keep the DB small; PDFs pass through raw. */
async function readDoc(file: File): Promise<string> {
  const asDataUrl = () =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(file);
    });

  if (file.type === "application/pdf") {
    const d = await asDataUrl();
    if (d.length > 2_800_000) throw new Error("PDF too large (max ~2 MB).");
    return d;
  }
  if (!file.type.startsWith("image/")) throw new Error("Only images or PDF files are allowed.");

  const dataUrl = await asDataUrl();
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("decode failed"));
    el.src = dataUrl;
  });
  const maxW = 1600;
  const scale = Math.min(1, maxW / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const out = canvas.toDataURL("image/jpeg", 0.75);
  if (out.length > 2_800_000) throw new Error("Image too large even after compression.");
  return out;
}

/* ------------------------------------------------------------------ */
/* Form state                                                          */
/* ------------------------------------------------------------------ */

type DocKey = "idProofDoc" | "addressProofDoc" | "dlDoc";

type CustomerForm = {
  fullName: string;
  phone: string;
  altPhone: string;
  email: string;
  dob: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  idProofType: string;
  idProofNumber: string;
  idProofDoc: string | null;
  addressProofType: string;
  addressProofNumber: string;
  addressProofDoc: string | null;
  dlNumber: string;
  dlExpiry: string;
  dlDoc: string | null;
  source: string;
  sourceNote: string;
  notes: string;
};

const emptyForm = (): CustomerForm => ({
  fullName: "",
  phone: "",
  altPhone: "",
  email: "",
  dob: "",
  addressLine: "",
  city: "",
  state: "Assam",
  pincode: "",
  idProofType: "Aadhaar",
  idProofNumber: "",
  idProofDoc: null,
  addressProofType: "Aadhaar",
  addressProofNumber: "",
  addressProofDoc: null,
  dlNumber: "",
  dlExpiry: "",
  dlDoc: null,
  source: "WhatsApp",
  sourceNote: "",
  notes: "",
});

const formFromCustomer = (c: CustomerDTO): CustomerForm => ({
  fullName: c.fullName,
  phone: c.phone,
  altPhone: c.altPhone ?? "",
  email: c.email ?? "",
  dob: c.dob ?? "",
  addressLine: c.addressLine ?? "",
  city: c.city ?? "",
  state: c.state ?? "",
  pincode: c.pincode ?? "",
  idProofType: c.idProofType ?? "Aadhaar",
  idProofNumber: c.idProofNumber ?? "",
  idProofDoc: null,
  addressProofType: c.addressProofType ?? "Aadhaar",
  addressProofNumber: c.addressProofNumber ?? "",
  addressProofDoc: null,
  dlNumber: c.dlNumber ?? "",
  dlExpiry: c.dlExpiry ?? "",
  dlDoc: null,
  source: c.source,
  sourceNote: c.sourceNote ?? "",
  notes: c.notes ?? "",
});

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

const SOURCE_STYLES: Record<string, string> = {
  WhatsApp: "bg-[#25D366]/15 text-[#128C4A] border-[#25D366]/40",
  "Google Maps": "bg-amber-100/70 text-amber-800 border-amber-300/60",
  Instagram: "bg-pink-100/70 text-pink-700 border-pink-300/60",
  Facebook: "bg-sky-100/70 text-sky-700 border-sky-300/60",
  Website: "bg-forest/10 text-forest border-forest/25",
  "Walk-in": "bg-stone-100 text-stone-700 border-stone-300",
  Referral: "bg-violet-100/70 text-violet-700 border-violet-300/60",
  "Repeat customer": "bg-saffron/15 text-saffron-deep border-saffron/40",
  Other: "bg-stone-100 text-stone-600 border-stone-300",
};

function DocField({
  label,
  hint,
  docKey,
  form,
  setForm,
  hasOnFile,
}: {
  label: string;
  hint: string;
  docKey: DocKey;
  form: CustomerForm;
  setForm: React.Dispatch<React.SetStateAction<CustomerForm>>;
  hasOnFile?: boolean;
}) {
  const value = form[docKey];
  const inputId = `doc-${docKey}`;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await readDoc(file);
      setForm((f) => ({ ...f, [docKey]: dataUrl }));
      toast.success(`${label} attached`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not attach that file.");
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-forest">{label}</Label>
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className="flex h-10 flex-1 cursor-pointer items-center gap-2 rounded-md border border-forest/20 bg-white px-3 text-sm text-forest/70 transition-colors hover:border-forest/40"
        >
          <FileText className="h-4 w-4 flex-none text-forest/50" />
          <span className="truncate">
            {value ? "New scan attached — replaces on Save" : hasOnFile ? "Scan on file — click to replace" : "Attach image or PDF"}
          </span>
        </label>
        <input id={inputId} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
        {(value || hasOnFile) && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 flex-none border-forest/20 text-forest"
            onClick={() => setForm((f) => ({ ...f, [docKey]: value ? null : f[docKey] }))}
            aria-label={`Clear ${label}`}
            title={value ? "Remove newly attached scan" : "Remove the scan on file"}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && value.startsWith("data:image/") && (
        <img src={value} alt={`${label} preview`} className="mt-1 max-h-24 rounded-md border border-forest/15 object-contain" />
      )}
      <p className="text-[11px] text-forest/50">{hint}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

type Props = {
  customers: CustomerDTO[];
  agreements: AgreementDTO[];
  vehicles: VehicleDTO[];
  loading: boolean;
  onRefresh: () => void;
};

export function CustomersManager({ customers, agreements, vehicles, loading, onRefresh }: Props) {
  const [query, setQuery] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | "new" | null>(null);
  const [form, setForm] = React.useState<CustomerForm>(emptyForm());
  const [saving, setSaving] = React.useState(false);
  const [docsOnFile, setDocsOnFile] = React.useState<{ idProof: boolean; address: boolean; dl: boolean }>({
    idProof: false,
    address: false,
    dl: false,
  });
  const [confirmDelete, setConfirmDelete] = React.useState<CustomerDTO | null>(null);

  // agreement creation dialog
  const [agreementFor, setAgreementFor] = React.useState<CustomerDTO | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [freshLink, setFreshLink] = React.useState<{ customerName: string; url: string; expiresAt: string } | null>(null);

  // agreement form state
  const [aVehicle, setAVehicle] = React.useState<string>("none");
  const [aReg, setAReg] = React.useState("");
  const [aStart, setAStart] = React.useState("");
  const [aEnd, setAEnd] = React.useState("");
  const [aPickup, setAPickup] = React.useState("Roam Saathi counter, LGBI Airport, Borjhar");
  const [aDrop, setADrop] = React.useState("Same as pickup");
  const [aRate, setARate] = React.useState("");
  const [aDeposit, setADeposit] = React.useState("");
  const [aExtra, setAExtra] = React.useState("");
  const [aDays, setADays] = React.useState("7");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.fullName, c.phone, c.email, c.city, c.source, c.dlNumber]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [customers, query]);

  const pendingCount = agreements.filter((a) => a.status === "pending" && a.hasLink).length;
  const signedCount = agreements.filter((a) => a.status === "signed").length;

  /* ------------------------- actions ------------------------- */

  function openNew() {
    setForm(emptyForm());
    setDocsOnFile({ idProof: false, address: false, dl: false });
    setEditingId("new");
  }

  async function openEdit(c: CustomerDTO) {
    setForm(formFromCustomer(c));
    setEditingId(c.id);
    // Fetch the full record to learn whether scans are already on file.
    try {
      const res = await fetch(`/api/admin/customers/${c.id}`, { cache: "no-store" });
      if (res.ok) {
        const j = await res.json();
        setDocsOnFile({
          idProof: Boolean(j.customer?.idProofDoc),
          address: Boolean(j.customer?.addressProofDoc),
          dl: Boolean(j.customer?.dlDoc),
        });
      }
    } catch {
      /* non-fatal */
    }
  }

  async function saveCustomer() {
    if (saving) return;
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast.error("Name and phone number are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      const res = await fetch(
        editingId === "new" ? "/api/admin/customers" : `/api/admin/customers/${editingId}`,
        {
          method: editingId === "new" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(j?.error ?? "Could not save the customer.");
        return;
      }
      toast.success(editingId === "new" ? "Customer added to your CRM" : "Customer updated");
      setEditingId(null);
      onRefresh();
    } catch {
      toast.error("Network problem — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(c: CustomerDTO) {
    try {
      const res = await fetch(`/api/admin/customers/${c.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not delete the customer.");
        return;
      }
      toast.success(`${c.fullName} and their agreements were deleted.`);
      setConfirmDelete(null);
      onRefresh();
    } catch {
      toast.error("Network problem — please try again.");
    }
  }

  function openAgreements(c: CustomerDTO) {
    setAgreementFor(c);
    setAVehicle("none");
    setAReg("");
    setAStart("");
    setAEnd("");
    setAPickup("Roam Saathi counter, LGBI Airport, Borjhar");
    setADrop("Same as pickup");
    setARate("");
    setADeposit("");
    setAExtra("");
    setADays("7");
  }

  async function createAgreement() {
    if (!agreementFor || creating) return;
    setCreating(true);
    try {
      const vehicleName = aVehicle === "none" ? "" : vehicles.find((v) => v.id === aVehicle)?.name ?? "";
      const res = await fetch("/api/admin/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: agreementFor.id,
          vehicleName,
          registrationNumber: aReg,
          rentalStart: aStart,
          rentalEnd: aEnd,
          pickupPoint: aPickup,
          dropPoint: aDrop,
          rateSummary: aRate,
          depositAmount: aDeposit,
          extraTerms: aExtra,
          expiresInDays: Number(aDays) || 7,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(j?.error ?? "Could not create the agreement.");
        return;
      }
      const url = `${window.location.origin}/agreement/${j.token}`;
      setFreshLink({ customerName: agreementFor.fullName, url, expiresAt: j.expiresAt });
      toast.success("Signing link created — copy or share it now");
      onRefresh();
    } catch {
      toast.error("Network problem — please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function revokeAgreement(a: AgreementDTO) {
    try {
      const res = await fetch(`/api/admin/agreements/${a.id}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(j?.error ?? "Could not revoke.");
        return;
      }
      toast.success("Signing link revoked — it can no longer be opened.");
      onRefresh();
    } catch {
      toast.error("Network problem — please try again.");
    }
  }

  function downloadPdf(a: AgreementDTO) {
    const url = `/api/admin/agreements/${a.id}/pdf`;
    const el = document.createElement("a");
    el.href = url;
    el.download = `roam-saathi-agreement-${a.status}-${a.id.slice(-6)}.pdf`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }

  function copyLink(url: string) {
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Link copied"))
      .catch(() => toast.error("Copy failed — long-press the link to copy manually."));
  }

  function shareOnWhatsApp(name: string, url: string) {
    const msg = `Hello ${name}! Here is your Roam Saathi rental agreement for e-signature. Please open the link, read all clauses, sign (draw or upload your signature) and submit — it takes two minutes: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  /* ------------------------- render ------------------------- */

  const custAgreements = agreementFor
    ? agreements.filter((a) => a.customerId === agreementFor.id)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-forest">Customers &amp; agreements</h2>
          <p className="text-sm text-muted-foreground">
            Your private CRM — lead sources, KYC documents and one-time e-sign agreements.
          </p>
        </div>
        <Button onClick={openNew} className="bg-forest text-cream hover:bg-forest/90">
          <Plus className="h-4 w-4" /> Add customer
        </Button>
      </div>

      {/* summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total customers", value: customers.length, icon: Users },
          { label: "Agreements signed", value: signedCount, icon: BadgeCheck },
          { label: "Links awaiting signature", value: pendingCount, icon: FileSignature },
          {
            label: "KYC complete",
            value: customers.filter((c) => c.hasIdDoc && c.hasDlDoc).length,
            icon: ShieldCheck,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-[#e6ddc8]">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-forest/10">
                <Icon className="h-5 w-5 text-forest" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-forest">{loading ? "…" : value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, city, source…"
          className="pl-9"
          aria-label="Search customers"
        />
      </div>

      {/* customers table */}
      <Card className="border-[#e6ddc8]">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading customers…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="mx-auto h-10 w-10 text-forest/20" />
              <p className="mt-3 font-semibold text-forest">No customers yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap <strong>Add customer</strong> the moment an enquiry turns into a booking —
                note where they came from, attach their KYC documents and generate the
                agreement link before handover.
              </p>
            </div>
          ) : (
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-cream/95 backdrop-blur">
                  <tr className="text-left text-xs uppercase tracking-wide text-forest/60">
                    <th className="px-4 py-3 font-bold">Customer</th>
                    <th className="px-3 py-3 font-bold">Source</th>
                    <th className="px-3 py-3 font-bold">KYC</th>
                    <th className="px-3 py-3 font-bold">Agreements</th>
                    <th className="px-3 py-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-t border-[#efe8d8] hover:bg-cream/50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-forest">{c.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.phone}
                          {c.city ? ` · ${c.city}` : ""}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline" className={SOURCE_STYLES[c.source] ?? SOURCE_STYLES.Other}>
                          {c.source}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.hasIdDoc && (
                            <Badge variant="outline" className="border-forest/25 bg-forest/5 text-[10px] text-forest">
                              <IdCard className="h-3 w-3" /> ID
                            </Badge>
                          )}
                          {c.hasAddressDoc && (
                            <Badge variant="outline" className="border-forest/25 bg-forest/5 text-[10px] text-forest">
                              <FileText className="h-3 w-3" /> Addr
                            </Badge>
                          )}
                          {c.hasDlDoc && (
                            <Badge variant="outline" className="border-forest/25 bg-forest/5 text-[10px] text-forest">
                              <Car className="h-3 w-3" /> DL
                            </Badge>
                          )}
                          {!c.hasIdDoc && !c.hasAddressDoc && !c.hasDlDoc && (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {c.agreementCount} total
                        {agreements.some(
                          (a) => a.customerId === c.id && a.status === "pending" && a.hasLink
                        ) && (
                          <span className="ml-1 font-bold text-saffron-deep">· link live</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-forest/20 px-2 text-forest"
                            onClick={() => openAgreements(c)}
                            title="Agreements & signing links"
                          >
                            <FileSignature className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-forest/20 px-2 text-forest"
                            onClick={() => openEdit(c)}
                            title="Edit customer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-200 px-2 text-red-600 hover:bg-red-50"
                            onClick={() => setConfirmDelete(c)}
                            title="Delete customer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------------- add / edit dialog ---------------- */}
      <Dialog open={editingId !== null} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-forest">
              {editingId === "new" ? "Add customer" : "Edit customer"}
            </DialogTitle>
            <DialogDescription>
              Everything you save here is private to the admin portal — it is never shown on the
              public website.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Profile &amp; source</TabsTrigger>
              <TabsTrigger value="kyc">KYC &amp; documents</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-3 pt-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full name *</Label>
                  <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Rahul Sharma" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone (WhatsApp) *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98XXX XXXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label>Alternate phone</Label>
                  <Input value={form.altPhone} onChange={(e) => setForm({ ...form, altPhone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date of birth</Label>
                  <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Lead source *</Label>
                  <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CUSTOMER_SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Address (residential)</Label>
                  <Input value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} placeholder="House / street / locality" />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>PIN code</Label>
                  <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Source note</Label>
                  <Input value={form.sourceNote} onChange={(e) => setForm({ ...form, sourceNote: e.target.value })} placeholder="e.g. Google Maps review" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Internal notes</Label>
                  <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything worth remembering about this customer…" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="kyc" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>ID proof type</Label>
                  <Select value={form.idProofType} onValueChange={(v) => setForm({ ...form, idProofType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ID_PROOF_TYPES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>ID proof number</Label>
                  <Input value={form.idProofNumber} onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })} placeholder="XXXX XXXX 1234" />
                </div>
                <div className="sm:col-span-2">
                  <DocField
                    label="ID proof scan"
                    hint="Aadhaar / Voter ID / Passport — photo or PDF, auto-compressed."
                    docKey="idProofDoc"
                    form={form}
                    setForm={setForm}
                    hasOnFile={docsOnFile.idProof}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Address proof type</Label>
                  <Select value={form.addressProofType} onValueChange={(v) => setForm({ ...form, addressProofType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ADDRESS_PROOF_TYPES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Address proof number</Label>
                  <Input value={form.addressProofNumber} onChange={(e) => setForm({ ...form, addressProofNumber: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <DocField
                    label="Address proof scan"
                    hint="Utility bill, rent agreement or any official address document."
                    docKey="addressProofDoc"
                    form={form}
                    setForm={setForm}
                    hasOnFile={docsOnFile.address}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Driving licence number</Label>
                  <Input value={form.dlNumber} onChange={(e) => setForm({ ...form, dlNumber: e.target.value })} placeholder="AS01 20190001234" />
                </div>
                <div className="space-y-1.5">
                  <Label>Driving licence valid till</Label>
                  <Input type="date" value={form.dlExpiry} onChange={(e) => setForm({ ...form, dlExpiry: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <DocField
                    label="Driving licence scan"
                    hint="Both sides if the address is on the back."
                    docKey="dlDoc"
                    form={form}
                    setForm={setForm}
                    hasOnFile={docsOnFile.dl}
                  />
                </div>
              </div>
              <p className="rounded-lg border border-forest/20 bg-forest/5 p-3 text-xs text-forest/80">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                Scans are stored privately in your database (admin-only access) and are never
                visible on the public website. Keep hard copies too — Indian rental businesses
                must maintain KYC records.
              </p>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditingId(null)} className="border-forest/20 text-forest">
              Cancel
            </Button>
            <Button onClick={saveCustomer} disabled={saving} className="bg-forest text-cream hover:bg-forest/90">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId === "new" ? "Add customer" : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------------- agreements dialog ---------------- */}
      <Dialog open={agreementFor !== null} onOpenChange={(o) => !o && setAgreementFor(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-forest">
              Agreements — {agreementFor?.fullName}
            </DialogTitle>
            <DialogDescription>
              Generate a secure one-time signing link before vehicle handover. The customer
              reads, signs on screen (or uploads a scan) and the signed PDF lands back here.
            </DialogDescription>
          </DialogHeader>

          {/* existing agreements */}
          {custAgreements.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-forest/60">History</p>
              {custAgreements.map((a) => (
                <div key={a.id} className="rounded-xl border border-forest/15 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm">
                      <p className="font-bold text-forest">
                        {a.vehicleName ?? "Vehicle not set"}
                        {a.rentalStart ? ` · ${fmtDateTime(a.rentalStart)}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {fmtDateTime(a.createdAt)}
                        {a.signedAt ? ` · signed ${fmtDateTime(a.signedAt)}` : ""}
                        {a.hasLink && a.linkExpiresAt ? ` · link valid till ${fmtDateTime(a.linkExpiresAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          a.status === "signed"
                            ? "border-forest/30 bg-forest/10 text-forest"
                            : a.status === "pending"
                              ? "border-saffron/50 bg-saffron/10 text-saffron-deep"
                              : "border-stone-300 bg-stone-100 text-stone-600"
                        }
                      >
                        {a.status === "signed" ? "Signed" : a.status === "pending" ? (a.hasLink ? "Awaiting signature" : "Link used/closed") : "Revoked"}
                      </Badge>
                      <Button size="sm" variant="outline" className="h-8 border-forest/20 text-forest" onClick={() => downloadPdf(a)} title="Download PDF">
                        <Download className="h-3.5 w-3.5" /> PDF
                      </Button>
                      {a.status === "pending" && a.hasLink && (
                        <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-600 hover:bg-red-50" onClick={() => revokeAgreement(a)} title="Kill the signing link now">
                          <X className="h-3.5 w-3.5" /> Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* new agreement form */}
          <div className="rounded-xl border border-saffron/40 bg-saffron/5 p-4">
            <p className="text-sm font-bold text-forest">Generate a new signing link</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Vehicle</Label>
                <Select value={aVehicle} onValueChange={setAVehicle}>
                  <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Registration no.</Label>
                <Input value={aReg} onChange={(e) => setAReg(e.target.value)} placeholder="AS01 AB 1234" />
              </div>
              <div className="space-y-1.5">
                <Label>Rental from</Label>
                <Input type="datetime-local" value={aStart} onChange={(e) => setAStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Rental until</Label>
                <Input type="datetime-local" value={aEnd} onChange={(e) => setAEnd(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Pickup point</Label>
                <Input value={aPickup} onChange={(e) => setAPickup(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Drop point</Label>
                <Input value={aDrop} onChange={(e) => setADrop(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Charges summary</Label>
                <Input value={aRate} onChange={(e) => setARate(e.target.value)} placeholder="Rs 3,500/day self-drive" />
              </div>
              <div className="space-y-1.5">
                <Label>Security deposit</Label>
                <Input value={aDeposit} onChange={(e) => setADeposit(e.target.value)} placeholder="Rs 3,000 refundable" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Special conditions (optional)</Label>
                <Textarea rows={2} value={aExtra} onChange={(e) => setAExtra(e.target.value)} placeholder="e.g. Tawang route not permitted without escort; return before 6 PM on the last day." />
              </div>
              <div className="space-y-1.5">
                <Label>Link stays valid for</Label>
                <Select value={aDays} onValueChange={setADays}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="15">15 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mt-3 text-xs text-forest/70">
              The agreement text auto-fills the customer&apos;s name, phone, address, ID and
              licence details from their CRM profile, plus these trip details, and carries the
              standard Roam Saathi clauses (Indian Contract Act, Motor Vehicles Act, Guwahati
              jurisdiction).
            </p>
            <Button onClick={createAgreement} disabled={creating} className="mt-3 bg-forest text-cream hover:bg-forest/90">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              <FileSignature className="h-4 w-4" /> Create signing link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------------- fresh link dialog ---------------- */}
      <Dialog open={freshLink !== null} onOpenChange={(o) => !o && setFreshLink(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-forest">
              <ShieldCheck className="h-5 w-5 text-forest" /> Signing link ready
            </DialogTitle>
            <DialogDescription>
              Send this private link to {freshLink?.customerName} on WhatsApp. It works{" "}
              <strong>only once</strong> and self-destructs the moment they sign.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-forest/20 bg-cream/60 p-3">
            <p className="break-all font-mono text-xs text-forest">{freshLink?.url}</p>
            <p className="mt-2 text-[11px] text-forest/60">
              Valid until {freshLink ? fmtDateTime(freshLink.expiresAt) : ""} · shown only once —
              copy it before closing this window. You can always revoke it from the customer&apos;s
              agreement history.
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" className="border-forest/20 text-forest" onClick={() => freshLink && copyLink(freshLink.url)}>
              <Copy className="h-4 w-4" /> Copy link
            </Button>
            <Button className="bg-[#25D366] text-white hover:bg-[#1fb857]" onClick={() => freshLink && shareOnWhatsApp(freshLink.customerName, freshLink.url)}>
              Share on WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------------- delete confirm ---------------- */}
      <Dialog open={confirmDelete !== null} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-forest">Delete {confirmDelete?.fullName}?</DialogTitle>
            <DialogDescription>
              This permanently removes the customer, their KYC documents and all their
              agreements (including signed PDFs). This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="border-forest/20 text-forest" onClick={() => setConfirmDelete(null)}>
              Keep customer
            </Button>
            <Button variant="destructive" onClick={() => confirmDelete && deleteCustomer(confirmDelete)}>
              <Trash2 className="h-4 w-4" /> Delete permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
