import {
  PrefetchCrossZoneLinks,
  PrefetchCrossZoneLinksProvider,
} from "@vercel/microfrontends/next/client";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Quotations | Commerce Operations",
  description: "Quotation management domain for Commerce Operations.",
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
