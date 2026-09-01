export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Commerce Operations
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          Quotations Domain
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
          This application owns the quotation workflow, including quotation
          creation, lifecycle management, and conversion into an order.
        </p>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Running application</p>

          <p className="mt-2 font-mono text-lg text-slate-800">
            @commerce/quotations · localhost:3001
          </p>
        </div>
      </div>
    </main>
  );
}
