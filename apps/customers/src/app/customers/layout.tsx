import { CommerceShell } from "@commerce/platform-ui";

export default function CustomersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CommerceShell activeSection="customers">{children}</CommerceShell>;
}
