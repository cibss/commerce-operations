import { Link } from "@vercel/microfrontends/next/client";

import { CommerceNavigation } from "@/components/CommerceNavigation";

const domains = [
  {
    title: "Quotations",
    description:
      "Create commercial quotations, manage approvals, and convert accepted quotations into orders.",
    href: "/quotations",
    ownership: "Sales Operations",
  },
  {
    title: "Orders",
    description:
      "Process customer orders through confirmation, fulfillment, shipping, and completion.",
    href: "/orders",
    ownership: "Order Operations",
  },
  {
    title: "Customers",
    description:
      "Manage B2B customer accounts and review activity across sales and order workflows.",
    href: "/customers",
    ownership: "Customer Operations",
  },
  {
    title: "Payments",
    description:
      "Track order payments, settlement status, failures, and refunds.",
    href: "/payments",
    ownership: "Finance Operations",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <CommerceNavigation activeSection="home" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-slate-500">
            Commerce Operations Platform
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Operations overview
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Manage a B2B quotation-to-order workflow across independently owned
            commerce domains.
          </p>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {domains.map((domain) => (
            <Link
              key={domain.href}
              href={domain.href}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {domain.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {domain.description}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
                >
                  →
                </span>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Domain ownership
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {domain.ownership}
                </p>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Architecture
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-2xl font-semibold text-slate-950">5</p>

              <p className="mt-1 text-sm text-slate-500">
                Frontend applications
              </p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-slate-950">4</p>

              <p className="mt-1 text-sm text-slate-500">Business domains</p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-slate-950">1</p>

              <p className="mt-1 text-sm text-slate-500">Unified experience</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
