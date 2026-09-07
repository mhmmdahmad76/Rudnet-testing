import { db } from "@/lib/db";
import { getAdminClaims } from "@/lib/session";
import { LockedCountdown } from "./locked-countdown";

function secondsUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}

export default async function AdminLockedPage() {
  const claims = await getAdminClaims();
  let seconds = 15 * 60;

  if (claims) {
    const rows = await db().sql`SELECT locked_until FROM admin_users WHERE id = ${claims.adminId}`;
    const row = rows[0] as { locked_until: string | null } | undefined;
    if (row?.locked_until) {
      seconds = secondsUntil(row.locked_until);
    }
  }

  return <LockedCountdown initialSeconds={seconds} />;
}
