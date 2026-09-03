import {
  PageHeader,
  Panel,
  PanelHeader,
  ProgressSteps,
  buttonClassName,
  type ProgressStep,
} from "@commerce/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  cancelOrderAction,
  completeOrderAction,
  confirmOrderAction,
  processOrderAction,
  shipOrderAction,
} from "@/app/orders/actions";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { getOrder } from "@/lib/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/order";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

const lifecycle = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
] as const;

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

  const currentIndex = lifecycle.indexOf(
    order.status === "CANCELLED" ? "PENDING" : order.status,
  );

  const steps: ProgressStep[] = lifecycle.map((status, index) => ({
    label: status,
    state:
      order.status === "CANCELLED" && status === "PENDING"
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
        href="/orders"
        className="mb-5 inline-flex text-sm font-semibold text-slate-500 hover:text-indigo-600"
      >
        ← Orders
      </Link>

      <PageHeader
        eyebrow="Order detail"
        title={order.id}
        description={`Order for ${order.customerName} · Updated ${formatDateTime(
          order.updatedAt,
        )}.`}
        actions={
          <>
            {(order.status === "PENDING" || order.status === "CONFIRMED") && (
              <form action={cancelOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <button className={buttonClassName("danger")}>
                  Cancel order
                </button>
              </form>
            )}

            {order.status === "PENDING" ? (
              <form action={confirmOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <button className={buttonClassName()}>Confirm order</button>
              </form>
            ) : null}

            {order.status === "CONFIRMED" ? (
              <form action={processOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <button className={buttonClassName()}>Start processing</button>
              </form>
            ) : null}

            {order.status === "PROCESSING" ? (
              <form action={shipOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <button className={buttonClassName()}>Mark shipped</button>
              </form>
            ) : null}

            {order.status === "SHIPPED" ? (
              <form action={completeOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <button className={buttonClassName()}>Complete order</button>
              </form>
            ) : null}
          </>
        }
      >
        <OrderStatusBadge status={order.status} />
      </PageHeader>

      {error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <Panel className="mt-8">
        <PanelHeader
          title="Fulfillment lifecycle"
          description="Track this order through confirmation, fulfillment, shipping, and completion."
        />

        <div className="overflow-x-auto px-6 py-6">
          <ProgressSteps steps={steps} />
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <PanelHeader
            title="Order items"
            description={`${order.items.length} line item${order.items.length === 1 ? "" : "s"} in fulfillment.`}
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
                {order.items.map((item) => (
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
                      {formatCurrency(item.unitPrice, order.currency)}
                    </td>

                    <td className="px-6 py-5 text-right text-sm font-semibold text-slate-950">
                      {formatCurrency(item.lineTotal, order.currency)}
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

              <p className="mt-3 text-base font-bold text-slate-950">
                {order.customerName}
              </p>

              <p className="mt-1 font-mono text-xs text-slate-400">
                {order.customerId}
              </p>
            </div>
          </Panel>

          <Panel>
            <div className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Source Quotation
              </p>

              <p className="mt-3 font-mono text-sm font-bold text-indigo-600">
                {order.sourceQuotationId ?? "Direct order"}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                This order was created from an accepted customer quotation.
              </p>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Order value" />

            <dl className="space-y-4 p-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>

                <dd className="font-medium text-slate-800">
                  {formatCurrency(order.subtotal, order.currency)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-500">Discount</dt>

                <dd className="font-medium text-rose-600">
                  -{formatCurrency(order.discount, order.currency)}
                </dd>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <dt className="font-semibold text-slate-700">Total</dt>

                  <dd className="text-lg font-bold text-slate-950">
                    {formatCurrency(order.total, order.currency)}
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
