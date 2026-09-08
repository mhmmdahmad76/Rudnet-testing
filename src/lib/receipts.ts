import "server-only";
import { getStore } from "@netlify/blobs";

// Real storage for bank-transfer proof-of-payment uploads — previously the
// "upload your receipt" step only ever simulated a progress bar client-side
// and never stored the file anywhere.

const STORE_NAME = "payment-receipts";
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

function store() {
  return getStore(STORE_NAME);
}

export interface UploadedReceipt {
  key: string;
  filename: string;
}

export async function uploadReceipt(studentId: number, file: File): Promise<UploadedReceipt> {
  if (file.size > MAX_RECEIPT_BYTES) {
    throw new Error("Receipt is too large — 10 MB max.");
  }
  const safeName = file.name.replace(/[/\\]/g, "-");
  const key = `${studentId}/${Date.now()}-${safeName}`;
  const buffer = await file.arrayBuffer();
  await store().set(key, buffer, {
    metadata: { contentType: file.type || "application/octet-stream", filename: file.name },
  });
  return { key, filename: file.name };
}

export interface StoredReceipt {
  data: ArrayBuffer;
  contentType: string;
  filename: string;
}

export async function getReceipt(key: string): Promise<StoredReceipt | null> {
  const result = await store().getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) return null;
  const metadata = result.metadata as { contentType?: string; filename?: string } | undefined;
  return {
    data: result.data,
    contentType: metadata?.contentType ?? "application/octet-stream",
    filename: metadata?.filename ?? "receipt",
  };
}
