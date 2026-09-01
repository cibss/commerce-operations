import Link from "next/link";

import { getQuotations } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/quotation";
import { QuotationStatusBadge } from "@/components/QuotationStatusBadge";

export const dynamic = "force-dynamic";

export default async function QuotationsPage() {
  const quotations = await getQuotations();

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Quotations
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create and manage commercial quotations before they become orders.
          </p>
        </div>

        <Link
          href="/quotations/new"
          className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Create quotation
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quotation
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Updated
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {quotations.map((quotation) => (
                <tr key={quotation.id} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4">
                    <Link
                      href={`/quotations/${quotation.id}`}
                      className="font-mono text-sm font-semibold text-slate-950 hover:underline"
                    >
                      {quotation.id}
                    </Link>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {quotation.customerName}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                    {formatCurrency(quotation.total, quotation.currency)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <QuotationStatusBadge status={quotation.status} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {formatDateTime(quotation.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {quotations.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No quotations yet.
          </div>
        ) : null}
      </div>
    </>
  );
}
