import { PageHeader, Panel, PanelHeader, StatCard } from "@commerce/ui";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { getOrders } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/order";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrders();

  const pending = orders.filter((order) => order.status === "PENDING").length;

  const processing = orders.filter(
    (order) => order.status === "PROCESSING" || order.status === "CONFIRMED",
  ).length;

  const completed = orders.filter(
    (order) => order.status === "COMPLETED",
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Order operations"
        title="Orders"
        description="Track customer orders from confirmation through fulfillment, shipping, and completion."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={orders.length}
          hint="Operational orders"
          tone="indigo"
        />

        <StatCard
          label="Pending"
          value={pending}
          hint="Awaiting confirmation"
          tone="amber"
        />

        <StatCard
          label="In Fulfillment"
          value={processing}
          hint="Confirmed or processing"
          tone="neutral"
        />

        <StatCard
          label="Completed"
          value={completed}
          hint="Fulfilled"
          tone="emerald"
        />
      </div>

      <Panel className="mt-6">
        <PanelHeader
          title="Order queue"
          description="Orders currently tracked by Order Operations."
        />

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {[
                  "Order",
                  "Customer",
                  "Source",
                  "Value",
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
              {orders.map((order) => (
                <tr key={order.id} className="group hover:bg-indigo-50/30">
                  <td className="px-6 py-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-sm font-bold text-slate-950 hover:text-indigo-600"
                    >
                      {order.id}
                    </Link>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {order.customerName}
                  </td>

                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                    {order.sourceQuotationId ?? "Direct"}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(order.total, order.currency)}
                  </td>

                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDateTime(order.updatedAt)}
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
