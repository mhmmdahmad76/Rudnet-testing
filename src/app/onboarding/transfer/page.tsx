"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { FileUpload } from "@/components/lisaan/file-upload";
import { OnboardingStepBar } from "@/components/lisaan/onboarding-step-bar";
import { IconButton } from "@/components/lisaan/icon-button";
import { DEMO_PLANS } from "@/lib/demo-data";
import { getOnboardingAnswers, setOnboardingAnswers } from "@/lib/onboarding-store";
import { setOnboardingStep } from "@/app/(auth)/actions";

const TRANSFER_DETAILS = {
  iban: "AE07 0331 2345 6789 0123 456",
  swift: "LSNBAEAD",
  reference: "LSN-84213-KX",
};

const MAX_SIZE = 10 * 1024 * 1024;

type UploadState = { kind: "empty" } | { kind: "uploading"; progress: number; filename: string } | { kind: "success"; filename: string; sizeLabel: string } | { kind: "error"; filename: string; message: string };

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-stroke-default bg-bg-surface p-4">
      <div>
        <p className="t-body-xs text-fg-tertiary">{label}</p>
        <p className="t-numeric-md text-fg-primary">{value}</p>
      </div>
      <IconButton
        aria-label={`Copy ${label}`}
        variant="ghost"
        size="sm"
        onClick={() => {
          navigator.clipboard?.writeText(value);
          toast(`${label} copied`);
        }}
      >
        <Copy aria-hidden />
      </IconButton>
    </div>
  );
}

export default function OnboardingTransferPage() {
  const router = useRouter();
  const plan = DEMO_PLANS.find((p) => p.id === (getOnboardingAnswers().plan ?? "annual"))!;
  const [upload, setUpload] = React.useState<UploadState>({ kind: "empty" });

  function handleFiles(files: FileList) {
    const file = files[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      setUpload({
        kind: "error",
        filename: file.name,
        message: `That file is ${(file.size / (1024 * 1024)).toFixed(0)} MB. The limit is 10 MB — try a photo instead of a scan.`,
      });
      return;
    }

    setUpload({ kind: "uploading", progress: 0, filename: file.name });
    const timer = setInterval(() => {
      setUpload((current) => {
        if (current.kind !== "uploading") {
          clearInterval(timer);
          return current;
        }
        const next = current.progress + 25;
        if (next >= 100) {
          clearInterval(timer);
          return { kind: "success", filename: file.name, sizeLabel: `${(file.size / (1024 * 1024)).toFixed(1)} MB` };
        }
        return { ...current, progress: next };
      });
    }, 200);
  }

  return (
    <div>
      <OnboardingStepBar step={4} />
      <h1 className="t-h2 mb-2 text-fg-primary">Pay by bank transfer</h1>
      <p className="t-body-sm mb-6 text-fg-secondary">
        Transfer ${(plan.price * 1.05).toFixed(2)} using the details below, then upload your
        receipt.
      </p>

      <div className="flex flex-col gap-3">
        <CopyField label="IBAN" value={TRANSFER_DETAILS.iban} />
        <CopyField label="SWIFT" value={TRANSFER_DETAILS.swift} />
        <CopyField label="Reference" value={TRANSFER_DETAILS.reference} />
      </div>

      <Alert
        className="mt-4"
        tone="warning"
        title="Include the reference"
        body="This is how your payment gets matched. Without it, the transfer sits unmatched until we can identify it manually."
      />

      <div className="mt-6">
        {upload.kind === "empty" && (
          <FileUpload state="empty" meta="PDF or image, up to 10 MB" onFiles={handleFiles} />
        )}
        {upload.kind === "uploading" && (
          <FileUpload
            state="uploading"
            filename={upload.filename}
            progress={upload.progress}
            meta={`${upload.progress}%`}
            onCancel={() => setUpload({ kind: "empty" })}
          />
        )}
        {upload.kind === "success" && (
          <FileUpload state="success" filename={upload.filename} meta={upload.sizeLabel} />
        )}
        {upload.kind === "error" && (
          <FileUpload
            state="error"
            filename={upload.filename}
            meta={upload.message}
            onRetry={() => setUpload({ kind: "empty" })}
          />
        )}
      </div>

      <Button
        className="mt-8 w-full"
        disabled={upload.kind !== "success"}
        onClick={async () => {
          // The free lessons open immediately — the student is never left
          // with nothing to do while a human checks the receipt.
          setOnboardingAnswers({ paymentMethod: "transfer" });
          await setOnboardingStep("done");
          router.push("/onboarding/transfer/pending");
        }}
      >
        I&rsquo;ve sent the transfer
      </Button>
    </div>
  );
}
