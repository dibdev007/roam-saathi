import { cookies } from "next/headers";
import type { Metadata } from "next";

import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
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
 *
 * The "must change the starter password" flag is read SERVER-SIDE and passed
 * as a prop: it never enters client-visible settings payloads.
 */
export default async function AdminPage() {
  const store = await cookies();
  const authed = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!authed) return <AdminLogin />;

  let mustChangePassword = false;
  try {
    await ensureDatabaseReady();
    const row = await db.settings.findUnique({
      where: { key: "adminMustChangePassword" },
    });
    mustChangePassword = row?.value === "1";
  } catch {
    /* if the DB is unreachable the portal still opens — flag defaults false */
  }

  return <AdminApp mustChangePassword={mustChangePassword} />;
}
