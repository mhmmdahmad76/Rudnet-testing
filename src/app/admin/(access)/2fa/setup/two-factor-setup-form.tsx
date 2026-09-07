"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { CodeInput } from "@/components/lisaan/code-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { confirmTotpSetup } from "../../actions";

export function TwoFactorSetupForm({ secret, qrDataUrl }: { secret: string; qrDataUrl: string }) {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(null);

  const manualKey = secret.match(/.{1,4}/g)?.join(" ") ?? secret;

  async function handleComplete(value: string) {
    setPending(true);
    const result = await confirmTotpSetup(value);
    setPending(false);

    if (!result.ok) {
      setError(true);
      setCode("");
      return;
    }
    setRecoveryCodes(result.recoveryCodes);
  }

  function copyRecoveryCodes() {
    if (!recoveryCodes) return;
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast.success("Recovery codes copied");
  }

  if (recoveryCodes) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="t-h2 text-fg-primary">Save your recovery codes</h1>
          <p className="t-body-sm text-fg-secondary">
            Each code signs you in once if you lose access to your authenticator app. This is the only
            time they&rsquo;re shown — store them somewhere safe.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-stroke-default bg-bg-subtle p-4">
          {recoveryCodes.map((rc) => (
            <span key={rc} className="t-numeric-sm text-fg-primary">
              {rc}
            </span>
          ))}
        </div>

        <Button variant="secondary" icon={<Copy />} onClick={copyRecoveryCodes}>
          Copy all codes
        </Button>

        <Button
          onClick={() => {
            router.push("/admin");
            router.refresh();
          }}
        >
          I&rsquo;ve saved these — continue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Set up two-factor authentication</h1>
        <p className="t-body-sm text-fg-secondary">
          Required for every admin account — it isn&rsquo;t a setting you can turn off. Scan this with
          Google Authenticator, Authy, or any TOTP app.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Image
          src={qrDataUrl}
          alt="Scan this QR code with your authenticator app"
          width={200}
          height={200}
          unoptimized
          className="rounded-lg border border-stroke-default"
        />
        <p className="t-body-xs text-fg-tertiary">Or enter this key manually:</p>
        <p className="t-numeric-sm rounded-md bg-bg-subtle px-3 py-1.5 text-fg-secondary">{manualKey}</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="t-body-sm text-fg-secondary">Enter the 6-digit code it shows to confirm setup.</p>
        <CodeInput
          length={6}
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
          error={error}
          disabled={pending}
        />
        {error && <Alert tone="danger" title="That code didn't match" body="Check the time on your device and try again." />}
      </div>
    </div>
  );
}
