import {
  PrefetchCrossZoneLinks,
  PrefetchCrossZoneLinksProvider,
} from "@vercel/microfrontends/next/client";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Commerce Operations",
  description: "A B2B commerce operations platform built with micro-frontends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PrefetchCrossZoneLinksProvider>
          {children}
        </PrefetchCrossZoneLinksProvider>

        <PrefetchCrossZoneLinks />
      </body>
    </html>
  );
}
