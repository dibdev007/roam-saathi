import { cookies } from "next/headers";
import type { Metadata } from "next";

import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import AdminGate from "@/components/admin/AdminGate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Portal",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The admin portal lives ONLY here (never linked from the customer site).
 * The server verifies the signed session cookie before rendering anything —
 * unauthenticated visitors see just the login screen.
 *
 * v6 hardening: both screens render through <AdminGate>, which lazy-loads
 * them from separate chunks. The initial HTML/RSC payload therefore never
 * names the real components (no "AdminLogin"/"AdminApp" strings, no
 * informative chunk map) — closing the payload-exposure report.
 */
export default async function AdminPage() {
  const store = await cookies();
  const authed = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  return <AdminGate mode={authed ? "app" : "login"} />;
}
