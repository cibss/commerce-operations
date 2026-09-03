import { CommerceShell } from "@commerce/platform-ui";

export default function QuotationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CommerceShell activeSection="quotations">{children}</CommerceShell>;
}
