import Link from "next/link";

import { getOrders } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/order";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Orders
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Monitor and process confirmed customer orders through their
          operational lifecycle.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Order
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Source
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
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-sm font-semibold text-slate-950 hover:underline"
                    >
                      {order.id}
                    </Link>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {order.customerName}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-500">
                    {order.sourceQuotationId ?? "Direct"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                    {formatCurrency(order.total, order.currency)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {formatDateTime(order.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No orders yet.
          </div>
        ) : null}
      </div>
    </>
  );
}
