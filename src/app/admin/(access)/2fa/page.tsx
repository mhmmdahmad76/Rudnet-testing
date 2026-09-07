import { redirect } from "next/navigation";

import { getTwoFactorEnrollment } from "../actions";
import { TwoFactorForm } from "./two-factor-form";

export default async function AdminTwoFactorPage() {
  const { enrolled } = await getTwoFactorEnrollment();
  if (!enrolled) redirect("/admin/2fa/setup");

  return <TwoFactorForm />;
}
