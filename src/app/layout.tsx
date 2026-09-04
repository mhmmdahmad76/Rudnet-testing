import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineBanner } from "@/components/lisaan/offline-banner";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dirFor, isLocale } from "@/lib/locale";
import { arabic, display, mono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lisaan — English for Arabic speakers",
  description: "Learn English, mapped to CEFR levels, taught in Arabic.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const dir = dirFor(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${display.variable} ${arabic.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-canvas text-fg-primary">
        <NuqsAdapter>
          <OfflineBanner />
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
          <Toaster dir={dir} />
        </NuqsAdapter>
      </body>
    </html>
  );
}
