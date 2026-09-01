import Link from "next/link";
import { notFound } from "next/navigation";

import {
  cancelOrderAction,
  completeOrderAction,
  confirmOrderAction,
  processOrderAction,
  shipOrderAction,
} from "@/app/orders/actions";

import { getOrder } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/order";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const { orderId } = await params;
  const { error } = await searchParams;

  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/orders"
        className="text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        ← Back to orders
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-slate-950">
              {order.id}
            </h1>

            <OrderStatusBadge status={order.status} />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Updated {formatDateTime(order.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {order.status === "PENDING" ? (
            <>
              <form action={cancelOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <button
                  type="submit"
                  className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Cancel order
                </button>
              </form>

              <form action={confirmOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Confirm order
                </button>
              </form>
            </>
          ) : null}

          {order.status === "CONFIRMED" ? (
            <>
              <form action={cancelOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <button
                  type="submit"
                  className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Cancel order
                </button>
              </form>

              <form action={processOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Start processing
                </button>
              </form>
            </>
          ) : null}

          {order.status === "PROCESSING" ? (
            <form action={shipOrderAction}>
              <input type="hidden" name="orderId" value={order.id} />

              <button
                type="submit"
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Mark as shipped
              </button>
            </form>
          ) : null}

          {order.status === "SHIPPED" ? (
            <form action={completeOrderAction}>
              <input type="hidden" name="orderId" value={order.id} />

              <button
                type="submit"
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Complete order
              </button>
            </form>
          ) : null}

          {order.status === "COMPLETED" ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
              Order completed
            </div>
          ) : null}

          {order.status === "CANCELLED" ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              Order cancelled
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
            <h2 className="font-semibold text-slate-950">Order items</h2>
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
                {order.items.map((item) => (
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
                      {formatCurrency(item.unitPrice, order.currency)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                      {formatCurrency(item.lineTotal, order.currency)}
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
              {order.customerName}
            </p>

            <p className="mt-1 font-mono text-xs text-slate-500">
              {order.customerId}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Order source</h2>

            <p className="mt-4 text-sm text-slate-500">Source quotation</p>

            <p className="mt-1 font-mono text-sm font-medium text-slate-900">
              {order.sourceQuotationId ?? "Direct order"}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Subtotal</dt>

                <dd className="font-medium text-slate-900">
                  {formatCurrency(order.subtotal, order.currency)}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Discount</dt>

                <dd className="font-medium text-slate-900">
                  -{formatCurrency(order.discount, order.currency)}
                </dd>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-slate-900">Total</dt>

                  <dd className="font-semibold text-slate-950">
                    {formatCurrency(order.total, order.currency)}
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
