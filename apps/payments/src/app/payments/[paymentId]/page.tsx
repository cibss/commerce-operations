import { createCommerceHref } from "@commerce/platform-ui";
import { PageHeader, Panel, PanelHeader, SubmitButton } from "@commerce/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  markPaymentFailedAction,
  markPaymentPaidAction,
  refundPaymentAction,
} from "@/app/payments/actions";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { getPayment } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/payment";

export const dynamic = "force-dynamic";

type PaymentDetailPageProps = {
  params: Promise<{
    paymentId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function PaymentDetailPage({
  params,
  searchParams,
}: PaymentDetailPageProps) {
  const { paymentId } = await params;
  const { error } = await searchParams;

  const payment = await getPayment(paymentId);

  if (!payment) {
    notFound();
  }

  return (
    <>
      <Link
        href="/payments"
        className="mb-5 inline-flex text-sm font-semibold text-slate-500 hover:text-indigo-600"
      >
        ← Payments
      </Link>

      <PageHeader
        eyebrow="Payment detail"
        title={payment.id}
        description={`${payment.reference} · Updated ${formatDateTime(
          payment.updatedAt,
        )}`}
        actions={
          <>
            {payment.status === "PENDING" ? (
              <>
                <form action={markPaymentFailedAction}>
                  <input type="hidden" name="paymentId" value={payment.id} />

                  <SubmitButton
                    variant="danger"
                    pendingText="Marking failed..."
                  >
                    Mark failed
                  </SubmitButton>
                </form>

                <form action={markPaymentPaidAction}>
                  <input type="hidden" name="paymentId" value={payment.id} />

                  <SubmitButton pendingText="Marking paid...">
                    Mark as paid
                  </SubmitButton>
                </form>
              </>
            ) : null}

            {payment.status === "PAID" ? (
              <form action={refundPaymentAction}>
                <input type="hidden" name="paymentId" value={payment.id} />

                <SubmitButton variant="secondary" pendingText="Refunding...">
                  Refund payment
                </SubmitButton>
              </form>
            ) : null}
          </>
        }
      >
        <PaymentStatusBadge status={payment.status} />
      </PageHeader>

      {error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <PanelHeader
            title="Transaction information"
            description="Transaction details and settlement history for this payment."
          />

          <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
            {[
              ["Amount", formatCurrency(payment.amount, payment.currency)],
              ["Payment method", payment.method.replaceAll("_", " ")],
              ["Reference", payment.reference],
              ["Created", formatDateTime(payment.createdAt)],
              [
                "Paid at",
                payment.paidAt ? formatDateTime(payment.paidAt) : "—",
              ],
              [
                "Refunded at",
                payment.refundedAt ? formatDateTime(payment.refundedAt) : "—",
              ],
            ].map(([label, value]) => (
              <div key={label} className="bg-white p-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
            <div className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                Related order
              </p>

              <p className="mt-3 font-mono text-sm font-bold leading-6 text-slate-600">
                {payment.orderId}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                This payment is associated with the following customer order.
              </p>

              <a
                href={createCommerceHref(`/orders/${payment.orderId}`)}
                className="mt-4 inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                View order →
              </a>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Settlement status" />

            <div className="p-6">
              <PaymentStatusBadge status={payment.status} />

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Settlement status reflects the latest payment activity recorded
                by Finance Operations.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
