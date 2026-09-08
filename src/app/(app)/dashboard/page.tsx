import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/locale";
import { verifyStudentSession } from "@/lib/dal";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const session = await verifyStudentSession();
  return (
    <DashboardClient
      name={session.name}
      level={session.level}
      levelSource={session.levelSource}
      locale={locale}
    />
  );
}
