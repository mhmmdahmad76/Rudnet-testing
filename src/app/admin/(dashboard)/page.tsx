import { verifyAdminSession } from "@/lib/dal";
import { listStudents } from "@/lib/admin-students";
import { db } from "@/lib/db";
import { DEMO_PLANS } from "@/lib/demo-data";
import { AdminOverviewClient } from "./overview-client";

export default async function AdminOverviewPage() {
  await verifyAdminSession();
  const students = await listStudents();

  const pendingRows = await db().sql`SELECT COUNT(*)::int AS count FROM payment_requests WHERE status = 'pending'`;
  const pendingTransfers = (pendingRows[0] as { count: number } | undefined)?.count ?? 0;

  const monthlyPrice = DEMO_PLANS.find((p) => p.id === "monthly")!.price;
  const annualPrice = DEMO_PLANS.find((p) => p.id === "annual")!.price;
  const mrr = students.reduce((sum, s) => {
    if (s.planStatus !== "premium") return sum;
    if (s.planId === "monthly") return sum + monthlyPrice;
    if (s.planId === "annual") return sum + annualPrice / 12;
    return sum; // comped access via "Grant access" — real, but not revenue
  }, 0);

  return <AdminOverviewClient students={students} pendingTransfers={pendingTransfers} mrr={Math.round(mrr)} />;
}
