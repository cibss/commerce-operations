import { PageHeader, Panel, PanelHeader, StatCard } from "@commerce/ui";
import Link from "next/link";

import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { getPayments } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/payment";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const payments = await getPayments();

  const totalValue = payments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );

  const paid = payments.filter((payment) => payment.status === "PAID").length;

  const pending = payments.filter(
    (payment) => payment.status === "PENDING",
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Finance operations"
        title="Payments"
        description="Track settlement status, payment failures, completed transactions, and refund operations."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Transactions"
          value={payments.length}
          hint="Tracked payments"
          tone="indigo"
        />

        <StatCard
          label="Volume"
          value={formatCurrency(totalValue, "IDR")}
          hint="Gross transaction value"
          tone="neutral"
        />

        <StatCard
          label="Paid"
          value={paid}
          hint="Settled payments"
          tone="emerald"
        />

        <StatCard
          label="Pending"
          value={pending}
          hint="Awaiting settlement"
          tone="amber"
        />
      </div>

      <Panel className="mt-6">
        <PanelHeader
          title="Payment ledger"
          description="Financial transactions associated with commerce orders."
        />

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {[
                  "Payment",
                  "Order",
                  "Amount",
                  "Method",
                  "Status",
                  "Updated",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    {heading}
                  </th>
                ))}

                <th className="w-12" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="group hover:bg-indigo-50/30">
                  <td className="px-6 py-4">
                    <Link
                      href={`/payments/${payment.id}`}
                      className="font-mono text-sm font-bold text-slate-950 hover:text-indigo-600"
                    >
                      {payment.id}
                    </Link>

                    <p className="mt-1 font-mono text-[11px] text-slate-400">
                      {payment.reference}
                    </p>
                  </td>

                  <td className="px-6 py-4 font-mono text-xs font-medium text-slate-600">
                    {payment.orderId}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {payment.method.replaceAll("_", " ")}
                  </td>

                  <td className="px-6 py-4">
                    <PaymentStatusBadge status={payment.status} />
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDateTime(payment.updatedAt)}
                  </td>

                  <td className="px-5 py-4 text-slate-300 group-hover:text-indigo-500">
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
