import { Link as MicrofrontendLink } from "@vercel/microfrontends/next/client";
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
    <div>
      <Link
        href="/payments"
        className="text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        ← Back to payments
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold text-slate-950">
              {payment.id}
            </h1>

            <PaymentStatusBadge status={payment.status} />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Updated {formatDateTime(payment.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {payment.status === "PENDING" ? (
            <>
              <form action={markPaymentFailedAction}>
                <input type="hidden" name="paymentId" value={payment.id} />

                <button
                  type="submit"
                  className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Mark failed
                </button>
              </form>

              <form action={markPaymentPaidAction}>
                <input type="hidden" name="paymentId" value={payment.id} />

                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Mark paid
                </button>
              </form>
            </>
          ) : null}

          {payment.status === "PAID" ? (
            <form action={refundPaymentAction}>
              <input type="hidden" name="paymentId" value={payment.id} />

              <button
                type="submit"
                className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100"
              >
                Refund payment
              </button>
            </form>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Transaction</h2>

          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Amount</dt>

              <dd className="mt-1 text-xl font-semibold text-slate-950">
                {formatCurrency(payment.amount, payment.currency)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">Method</dt>

              <dd className="mt-1 font-medium text-slate-900">
                {payment.method.replaceAll("_", " ")}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">Reference</dt>

              <dd className="mt-1 font-mono text-sm text-slate-900">
                {payment.reference}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">Created</dt>

              <dd className="mt-1 text-sm text-slate-900">
                {formatDateTime(payment.createdAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Related order</h2>

          <p className="mt-2 text-sm text-slate-500">
            Order ownership remains with Order Operations.
          </p>

          <MicrofrontendLink
            href={`/orders/${payment.orderId}`}
            className="mt-4 inline-flex font-mono text-sm font-semibold text-slate-900 hover:underline"
          >
            {payment.orderId} →
          </MicrofrontendLink>
        </section>
      </div>
    </div>
  );
}
