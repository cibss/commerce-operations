import { createCommerceHref } from "@commerce/platform-ui";
import { PageHeader, Panel, PanelHeader, StatCard } from "@commerce/ui";
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
    <>
      <Link
        href="/customers"
        className="mb-5 inline-flex text-sm font-semibold text-slate-500 hover:text-indigo-600"
      >
        ← Customers
      </Link>

      <PageHeader
        eyebrow="Customer account"
        title={customer.companyName}
        description={`${customer.contactName} · ${customer.email}`}
      >
        <div className="flex gap-2">
          <CustomerSegmentBadge segment={customer.segment} />

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {customer.status}
          </span>
        </div>
      </PageHeader>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Quotations"
          value={stats.quotationCount}
          hint="Commercial proposals"
          tone="indigo"
        />

        <StatCard
          label="Orders"
          value={stats.orderCount}
          hint="Converted business"
          tone="neutral"
        />

        <StatCard
          label="Order value"
          value={formatCurrency(stats.totalOrderValue, "IDR")}
          hint="Lifetime order value"
          tone="emerald"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Panel>
          <PanelHeader title="Account information" />

          <dl className="space-y-5 p-6">
            {[
              ["Customer ID", customer.id],
              ["Primary contact", customer.contactName],
              ["Email", customer.email],
              ["Phone", customer.phone],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </dt>

                <dd className="mt-1.5 text-sm font-medium text-slate-800">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHeader
              title="Quotation activity"
              description="Quotation history for this customer."
            />

            <div className="divide-y divide-slate-100">
              {quotations.map((quotation) => (
                <a
                  key={quotation.id}
                  href={createCommerceHref(`/quotations/${quotation.id}`)}
                  className="group flex items-center justify-between gap-6 px-6 py-4 transition hover:bg-indigo-50/30"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                      {quotation.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {quotation.status} · {formatDateTime(quotation.updatedAt)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(quotation.total, quotation.currency)}
                  </p>
                </a>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Order activity"
              description="Orders created for this customer."
            />

            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <a
                  key={order.id}
                  href={createCommerceHref(`/orders/${order.id}`)}
                  className="group flex items-center justify-between gap-6 px-6 py-4 hover:bg-indigo-50/30"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                      {order.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {order.status} · {formatDateTime(order.updatedAt)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(order.total, order.currency)}
                  </p>
                </a>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
