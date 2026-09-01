import { CommerceNavigation } from "@/components/CommerceNavigation";


export default function PaymentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <CommerceNavigation activeSection="payments" />

      <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
    </main>
  );
}
