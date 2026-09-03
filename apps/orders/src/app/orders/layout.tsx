import { CommerceShell } from "@commerce/platform-ui";

export default function OrdersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CommerceShell activeSection="orders">{children}</CommerceShell>;
}
