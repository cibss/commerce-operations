import Link from "next/link";

import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { getPayments } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/payment";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Payments
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Track payment transactions associated with customer orders.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Method
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
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link
                    href={`/payments/${payment.id}`}
                    className="font-mono text-sm font-semibold text-slate-950 hover:underline"
                  >
                    {payment.id}
                  </Link>
                </td>

                <td className="px-5 py-4 font-mono text-xs text-slate-600">
                  {payment.orderId}
                </td>

                <td className="px-5 py-4 text-sm font-medium text-slate-900">
                  {formatCurrency(payment.amount, payment.currency)}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {payment.method.replaceAll("_", " ")}
                </td>

                <td className="px-5 py-4">
                  <PaymentStatusBadge status={payment.status} />
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {formatDateTime(payment.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
