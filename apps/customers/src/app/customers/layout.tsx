import { CommerceNavigation } from "@/components/CommerceNavigation";

export default function CustomersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <CommerceNavigation activeSection="customers" />

      <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
    </main>
  );
}
