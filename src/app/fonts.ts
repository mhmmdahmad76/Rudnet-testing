import { Jost, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";

export const display = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["400", "500", "600", "700"],
});

export const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-plex-arabic",
  weight: ["400", "500", "700"],
});

export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});
