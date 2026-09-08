import { verifyAdminSession } from "@/lib/dal";
import { listPendingPaymentRequests } from "@/lib/admin-students";
import { PaymentsClient } from "./payments-client";

export default async function AdminPaymentsPage() {
  await verifyAdminSession();
  const requests = await listPendingPaymentRequests();
  return <PaymentsClient requests={requests} />;
}
