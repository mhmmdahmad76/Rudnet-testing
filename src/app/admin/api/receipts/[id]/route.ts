import { NextResponse } from "next/server";

import { verifyAdminSession } from "@/lib/dal";
import { getPaymentRequestById } from "@/lib/admin-students";
import { getReceipt } from "@/lib/receipts";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await verifyAdminSession();

  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const paymentRequest = await getPaymentRequestById(requestId);
  if (!paymentRequest?.receiptKey) {
    return NextResponse.json({ error: "No receipt on file" }, { status: 404 });
  }

  const receipt = await getReceipt(paymentRequest.receiptKey);
  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  return new NextResponse(receipt.data, {
    headers: {
      "Content-Type": receipt.contentType,
      "Content-Disposition": `inline; filename="${(paymentRequest.receiptFilename ?? receipt.filename).replace(/"/g, "")}"`,
    },
  });
}
