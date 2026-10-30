"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { RhinoLogo } from "@/components/brand/RhinoLogo";
import { BUSINESS_NAME, TAGLINE } from "@/lib/siteConfig";

/** Branded login screen — rendered by /admin when no valid session exists. */
export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(j?.error ?? "Login failed");
        return;
      }
      toast.success("Welcome back!");
      router.refresh();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-forest px-4">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#16A34A]/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-saffron/15 blur-3xl" />

      <Card className="relative w-full max-w-sm border-white/10 bg-white/95 shadow-2xl backdrop-blur">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-cream shadow-lg">
            <RhinoLogo light className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-forest">{BUSINESS_NAME} Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">{TAGLINE} — control room</p>
          </div>
          <form onSubmit={submit} className="flex w-full flex-col gap-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                aria-label="Admin password"
                className="pl-9"
                autoFocus
              />
            </div>
            <Button type="submit" disabled={busy} className="bg-forest text-cream hover:bg-forest/90">
              <LogIn className="h-4 w-4" /> {busy ? "Checking…" : "Unlock portal"}
            </Button>
          </form>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-forest"
          >
            <Globe className="h-3.5 w-3.5" /> Back to website
          </a>
        </CardContent>
      </Card>
      <p className="relative mt-6 text-xs text-cream/60">
        Only the owner should have this address. It is hidden from the website menu and search engines.
      </p>
    </div>
  );
}

export default AdminLogin;
