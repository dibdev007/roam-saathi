import { cookies } from "next/headers";
import type { Metadata } from "next";

import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminApp } from "@/components/admin/AdminApp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Portal",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The admin portal lives ONLY here (never linked from the customer site).
 * The server verifies the signed session cookie before rendering anything —
 * unauthenticated visitors see just the login screen.
 */
export default async function AdminPage() {
  const store = await cookies();
  const authed = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!authed) return <AdminLogin />;
  return <AdminApp />;
}
