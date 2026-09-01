import { Link as MicrofrontendLink } from "@vercel/microfrontends/next/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CustomerSegmentBadge } from "@/components/CustomerSegmentBadge";
import { getCustomerOverview } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/customer";

export const dynamic = "force-dynamic";

type CustomerDetailPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { customerId } = await params;

  const overview = await getCustomerOverview(customerId);

  if (!overview) {
    notFound();
  }

  const { customer, stats, quotations, orders } = overview;

  return (
    <div>
      <Link
        href="/customers"
        className="text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        ← Back to customers
      </Link>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            {customer.companyName}
          </h1>

          <CustomerSegmentBadge segment={customer.segment} />
        </div>

        <p className="mt-2 font-mono text-sm text-slate-500">{customer.id}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Quotations</p>

          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {stats.quotationCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Orders</p>

          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {stats.orderCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Order value</p>

          <p className="mt-2 text-xl font-semibold text-slate-950">
            {formatCurrency(stats.totalOrderValue, "IDR")}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Contact</h2>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>

              <dd className="mt-1 font-medium text-slate-900">
                {customer.contactName}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">Email</dt>

              <dd className="mt-1 text-slate-900">{customer.email}</dd>
            </div>

            <div>
              <dt className="text-slate-500">Phone</dt>

              <dd className="mt-1 text-slate-900">{customer.phone}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="font-semibold text-slate-950">Quotations</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {quotations.map((quotation) => (
                <MicrofrontendLink
                  key={quotation.id}
                  href={`/quotations/${quotation.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-slate-900">
                      {quotation.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {quotation.status} · {formatDateTime(quotation.updatedAt)}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(quotation.total, quotation.currency)}
                  </p>
                </MicrofrontendLink>
              ))}

              {quotations.length === 0 ? (
                <div className="px-6 py-8 text-sm text-slate-500">
                  No quotations.
                </div>
              ) : null}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="font-semibold text-slate-950">Orders</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <MicrofrontendLink
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-slate-900">
                      {order.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {order.status} · {formatDateTime(order.updatedAt)}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(order.total, order.currency)}
                  </p>
                </MicrofrontendLink>
              ))}

              {orders.length === 0 ? (
                <div className="px-6 py-8 text-sm text-slate-500">
                  No orders.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
