import { createCommerceHref } from "@commerce/platform-ui";
import {
  Badge,
  PageHeader,
  Panel,
  PanelHeader,
  ProgressSteps,
  SubmitButton,
  buttonClassName,
  type ProgressStep,
} from "@commerce/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  acceptQuotationAction,
  convertQuotationAction,
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

const lifecycle = ["DRAFT", "SENT", "ACCEPTED", "CONVERTED"] as const;

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

  const currentIndex = lifecycle.indexOf(
    quotation.status === "REJECTED" ? "SENT" : quotation.status,
  );

  const steps: ProgressStep[] = lifecycle.map((status, index) => ({
    label: status,
    state:
      quotation.status === "REJECTED" && status === "SENT"
        ? "error"
        : index < currentIndex
          ? "complete"
          : index === currentIndex
            ? "current"
            : "upcoming",
  }));

  return (
    <>
      <Link
        href="/quotations"
        className="mb-5 inline-flex text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        ← Quotations
      </Link>

      <PageHeader
        eyebrow="Quotation detail"
        title={quotation.id}
        description={`Quotation for ${quotation.customerName} · Last updated ${formatDateTime(
          quotation.updatedAt,
        )}.`}
        actions={
          <>
            {quotation.status === "DRAFT" ? (
              <form action={sendQuotationAction}>
                <input type="hidden" name="quotationId" value={quotation.id} />

                <SubmitButton pendingLabel="Sending...">
                  Send quotation
                </SubmitButton>
              </form>
            ) : null}

            {quotation.status === "SENT" ? (
              <>
                <form action={rejectQuotationAction}>
                  <input
                    type="hidden"
                    name="quotationId"
                    value={quotation.id}
                  />

                  <SubmitButton variant="danger" pendingLabel="Rejecting...">
                    Reject
                  </SubmitButton>
                </form>

                <form action={acceptQuotationAction}>
                  <input
                    type="hidden"
                    name="quotationId"
                    value={quotation.id}
                  />

                  <SubmitButton pendingLabel="Accepting...">
                    Accept quotation
                  </SubmitButton>
                </form>
              </>
            ) : null}

            {quotation.status === "ACCEPTED" ? (
              <form action={convertQuotationAction}>
                <input type="hidden" name="quotationId" value={quotation.id} />

                <SubmitButton pendingLabel="Converting...">
                  Convert to order →
                </SubmitButton>
              </form>
            ) : null}

            {quotation.status === "CONVERTED" && quotation.convertedOrderId ? (
              <a
                href={createCommerceHref(
                  `/orders/${quotation.convertedOrderId}`,
                )}
                className={buttonClassName()}
              >
                View order →
              </a>
            ) : null}
          </>
        }
      >
        <QuotationStatusBadge status={quotation.status} />
      </PageHeader>

      {error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <Panel className="mt-8">
        <PanelHeader
          title="Quotation lifecycle"
          description="Track the quotation from draft through customer approval and order conversion."
        />

        <div className="overflow-x-auto px-6 py-6">
          <ProgressSteps steps={steps} />

          {quotation.status === "REJECTED" ? (
            <div className="mt-5">
              <Badge variant="danger">Customer rejected this quotation</Badge>
            </div>
          ) : null}
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <PanelHeader
            title="Commercial items"
            description={`${quotation.items.length} line item${quotation.items.length === 1 ? "" : "s"} included in this proposal.`}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Product
                  </th>

                  <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Qty
                  </th>

                  <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Unit price
                  </th>

                  <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {quotation.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>

                      <p className="mt-1 font-mono text-[11px] text-slate-400">
                        {item.sku}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-right text-sm text-slate-600">
                      {item.quantity}
                    </td>

                    <td className="px-6 py-5 text-right text-sm text-slate-600">
                      {formatCurrency(item.unitPrice, quotation.currency)}
                    </td>

                    <td className="px-6 py-5 text-right text-sm font-semibold text-slate-950">
                      {formatCurrency(item.lineTotal, quotation.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <div className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Customer
              </p>

              <h3 className="mt-3 text-base font-bold text-slate-950">
                {quotation.customerName}
              </h3>

              <p className="mt-1 font-mono text-xs text-slate-400">
                {quotation.customerId}
              </p>
            </div>
          </Panel>

          {quotation.status === "CONVERTED" && quotation.convertedOrderId ? (
            <Panel className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
              <div className="p-6">
                <Badge variant="accent">Order Created</Badge>

                <h3 className="mt-4 text-sm font-bold text-slate-950">
                  Converted successfully
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This quotation was converted into <br />
                  <span className="mt-3 text-sm font-bold font-mono leading-6 text-slate-600">
                    {quotation.convertedOrderId}
                  </span>
                  <br />
                  and is now being processed as an order.
                </p>

                <a
                  href={createCommerceHref(
                    `/orders/${quotation.convertedOrderId}`,
                  )}
                  className="mt-4 inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  View order →
                </a>
              </div>
            </Panel>
          ) : null}

          <Panel>
            <PanelHeader title="Financial summary" />

            <dl className="space-y-4 p-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>

                <dd className="font-medium text-slate-800">
                  {formatCurrency(quotation.subtotal, quotation.currency)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Discount</dt>

                <dd className="font-medium text-rose-600">
                  -{formatCurrency(quotation.discount, quotation.currency)}
                </dd>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-end justify-between">
                  <dt className="font-semibold text-slate-700">Total</dt>

                  <dd className="text-lg font-bold text-slate-950">
                    {formatCurrency(quotation.total, quotation.currency)}
                  </dd>
                </div>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
