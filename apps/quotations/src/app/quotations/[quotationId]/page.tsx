import Link from "next/link";
import { notFound } from "next/navigation";

import {
  acceptQuotationAction,
  rejectQuotationAction,
  sendQuotationAction,
} from "@/app/quotations/actions";
import { QuotationStatusBadge } from "@/components/QuotationStatusBadge";
import { getQuotation } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/quotation";

export const dynamic = "force-dynamic";

type QuotationDetailPageProps = {
  params: Promise<{
    quotationId: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function QuotationDetailPage({
  params,
  searchParams,
}: QuotationDetailPageProps) {
  const { quotationId } = await params;
  const { error } = await searchParams;

  const quotation = await getQuotation(quotationId);

  if (!quotation) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/quotations"
        className="text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        ← Back to quotations
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-slate-950">
              {quotation.id}
            </h1>

            <QuotationStatusBadge status={quotation.status} />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Updated {formatDateTime(quotation.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {quotation.status === "DRAFT" ? (
            <form action={sendQuotationAction}>
              <input type="hidden" name="quotationId" value={quotation.id} />

              <button
                type="submit"
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Send quotation
              </button>
            </form>
          ) : null}

          {quotation.status === "SENT" ? (
            <>
              <form action={rejectQuotationAction}>
                <input type="hidden" name="quotationId" value={quotation.id} />

                <button
                  type="submit"
                  className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Reject
                </button>
              </form>

              <form action={acceptQuotationAction}>
                <input type="hidden" name="quotationId" value={quotation.id} />

                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Accept quotation
                </button>
              </form>
            </>
          ) : null}

          {quotation.status === "ACCEPTED" ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
              Ready for order conversion
            </div>
          ) : null}

          {quotation.status === "REJECTED" ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              Quotation rejected
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-950">Quotation items</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Item
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Quantity
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Unit price
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {quotation.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {item.name}
                      </div>

                      <div className="mt-1 font-mono text-xs text-slate-500">
                        {item.sku}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-slate-700">
                      {item.quantity}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-700">
                      {formatCurrency(item.unitPrice, quotation.currency)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                      {formatCurrency(item.lineTotal, quotation.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Customer</h2>

            <p className="mt-4 font-medium text-slate-900">
              {quotation.customerName}
            </p>

            <p className="mt-1 font-mono text-xs text-slate-500">
              {quotation.customerId}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Subtotal</dt>

                <dd className="font-medium text-slate-900">
                  {formatCurrency(quotation.subtotal, quotation.currency)}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Discount</dt>

                <dd className="font-medium text-slate-900">
                  -{formatCurrency(quotation.discount, quotation.currency)}
                </dd>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-slate-900">Total</dt>

                  <dd className="font-semibold text-slate-950">
                    {formatCurrency(quotation.total, quotation.currency)}
                  </dd>
                </div>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
