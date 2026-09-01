import Link from "next/link";

export default function QuotationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Commerce Operations
            </p>

            <Link
              href="/quotations"
              className="mt-1 block text-lg font-semibold text-slate-950"
            >
              Quotations
            </Link>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
            Standalone Domain App
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
    </main>
  );
}
