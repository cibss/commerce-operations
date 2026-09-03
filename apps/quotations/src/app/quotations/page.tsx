import {
  PageHeader,
  Panel,
  PanelHeader,
  StatCard,
  buttonClassName,
} from "@commerce/ui";
import Link from "next/link";

import { QuotationStatusBadge } from "@/components/QuotationStatusBadge";
import { getQuotations } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/quotation";

export const dynamic = "force-dynamic";

export default async function QuotationsPage() {
  const quotations = await getQuotations();

  const draftCount = quotations.filter(
    (quotation) => quotation.status === "DRAFT",
  ).length;

  const reviewCount = quotations.filter(
    (quotation) => quotation.status === "SENT",
  ).length;

  const readyCount = quotations.filter(
    (quotation) => quotation.status === "ACCEPTED",
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Sales operations"
        title="Quotations"
        description="Create commercial proposals, manage customer approval, and hand accepted quotations over to Order Operations."
        actions={
          <Link href="/quotations/new" className={buttonClassName()}>
            + Create quotation
          </Link>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={quotations.length}
          hint="All quotations"
          tone="indigo"
        />

        <StatCard
          label="Draft"
          value={draftCount}
          hint="Being prepared"
          tone="neutral"
        />

        <StatCard
          label="In review"
          value={reviewCount}
          hint="Waiting customer"
          tone="amber"
        />

        <StatCard
          label="Ready"
          value={readyCount}
          hint="Can convert to order"
          tone="emerald"
        />
      </div>

      <Panel className="mt-6">
        <PanelHeader
          title="Quotation pipeline"
          description="Most recently created quotations across the sales workflow."
        />

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Quotation
                </th>

                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Customer
                </th>

                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Value
                </th>

                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Status
                </th>

                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Updated
                </th>

                <th className="w-12" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {quotations.map((quotation) => (
                <tr
                  key={quotation.id}
                  className="group transition hover:bg-indigo-50/30"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/quotations/${quotation.id}`}
                      className="font-mono text-sm font-bold text-slate-950 hover:text-indigo-600"
                    >
                      {quotation.id}
                    </Link>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {quotation.customerName}
                    </p>

                    <p className="mt-1 font-mono text-[11px] text-slate-400">
                      {quotation.customerId}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(quotation.total, quotation.currency)}
                  </td>

                  <td className="px-6 py-4">
                    <QuotationStatusBadge status={quotation.status} />
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {formatDateTime(quotation.updatedAt)}
                  </td>

                  <td className="px-5 py-4 text-right text-slate-300 transition group-hover:text-indigo-500">
                    →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
