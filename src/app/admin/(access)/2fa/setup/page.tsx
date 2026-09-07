import { redirect } from "next/navigation";

import { getOrCreateTotpSetup } from "../../actions";
import { TwoFactorSetupForm } from "./two-factor-setup-form";

export default async function AdminTwoFactorSetupPage() {
  const setup = await getOrCreateTotpSetup();
  if (setup.alreadyEnrolled) redirect("/admin/2fa");

  return <TwoFactorSetupForm secret={setup.secret} qrDataUrl={setup.qrDataUrl} />;
}
