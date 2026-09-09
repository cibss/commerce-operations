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
      <body>{children}</body>
    </html>
  );
}
