import { CommerceShell } from "@commerce/platform-ui";

export default function PaymentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CommerceShell activeSection="payments">{children}</CommerceShell>;
}
