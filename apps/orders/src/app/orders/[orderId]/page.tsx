import { createCommerceHref } from "@commerce/platform-ui";
import {
  Badge,
  PageHeader,
  Panel,
  PanelHeader,
  ProgressSteps,
  SubmitButton,
  type BadgeVariant,
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
import { getOrder, getOrderPayment } from "@/lib/commerce-api";
import {
  formatCurrency,
  formatDateTime,
  type OrderPaymentStatus,
} from "@/lib/order";

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

const paymentStatusVariants: Record<OrderPaymentStatus, BadgeVariant> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "accent",
  CANCELLED: "neutral",
};

function getPaymentMessage(status: OrderPaymentStatus) {
  if (status === "PAID") {
    return "Payment has cleared. This order is ready for fulfillment. Refund the payment first if the confirmed order needs to be cancelled.";
  }

  if (status === "FAILED") {
    return "Payment failed. Fulfillment remains locked, but the order can still be cancelled.";
  }

  if (status === "REFUNDED") {
    return "Payment has been refunded. Fulfillment is locked and the confirmed order can now be cancelled.";
  }

  if (status === "CANCELLED") {
    return "This payment was cancelled because the related order was cancelled.";
  }

  return "Waiting for payment clearance. Fulfillment remains locked. Cancelling the order will also cancel this pending payment.";
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const { orderId } = await params;
  const { error } = await searchParams;

  const [order, payment] = await Promise.all([
    getOrder(orderId),
    getOrderPayment(orderId),
  ]);

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

  const paymentCleared = payment?.status === "PAID";

  const canStartProcessing = order.status === "CONFIRMED" && paymentCleared;

  const canCancelOrder =
    order.status === "PENDING" ||
    (order.status === "CONFIRMED" &&
      payment !== null &&
      payment.status !== "PAID");

  const processingBlockedMessage = payment
    ? `Payment ${payment.id} is ${payment.status}. Payment must be PAID before fulfillment can begin.`
    : "A payment must exist and be PAID before fulfillment can begin.";

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

                <SubmitButton
                  variant="danger"
                  pendingText="Cancelling..."
                  disabled={!canCancelOrder}
                >
                  Cancel order
                </SubmitButton>
              </form>
            )}

            {order.status === "PENDING" ? (
              <form action={confirmOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <SubmitButton pendingText="Confirming...">
                  Confirm order
                </SubmitButton>
              </form>
            ) : null}

            {order.status === "CONFIRMED" ? (
              <form action={processOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <SubmitButton
                  pendingText="Starting..."
                  disabled={!canStartProcessing}
                  title={
                    canStartProcessing
                      ? "Start fulfillment"
                      : processingBlockedMessage
                  }
                >
                  Start processing
                </SubmitButton>
              </form>
            ) : null}

            {order.status === "PROCESSING" ? (
              <form action={shipOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <SubmitButton pendingText="Updating...">
                  Mark shipped
                </SubmitButton>
              </form>
            ) : null}

            {order.status === "SHIPPED" ? (
              <form action={completeOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />

                <SubmitButton pendingText="Completing...">
                  Complete order
                </SubmitButton>
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
          description="Track this order through confirmation, payment clearance, fulfillment, shipping, and completion."
        />

        <div className="overflow-x-auto px-6 py-6">
          <ProgressSteps steps={steps} />
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <PanelHeader
            title="Order items"
            description={`${order.items.length} line item${
              order.items.length === 1 ? "" : "s"
            } in fulfillment.`}
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

          <Panel
            className={
              payment?.status === "PAID"
                ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                : payment?.status === "FAILED"
                  ? "border-rose-200 bg-gradient-to-br from-rose-50 to-white"
                  : payment?.status === "REFUNDED"
                    ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-white"
                    : payment?.status === "CANCELLED"
                      ? "border-slate-200 bg-gradient-to-br from-slate-50 to-white"
                      : "border-amber-200 bg-gradient-to-br from-amber-50 to-white"
            }
          >
            <div className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Payment clearance
              </p>

              {payment ? (
                <>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-mono text-sm font-bold text-slate-950">
                      {payment.id}
                    </p>

                    <Badge variant={paymentStatusVariants[payment.status]}>
                      {payment.status}
                    </Badge>
                  </div>

                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Amount</dt>

                      <dd className="font-semibold text-slate-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Method</dt>

                      <dd className="font-semibold text-slate-900">
                        {payment.method.replaceAll("_", " ")}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Reference</dt>

                      <dd className="font-mono text-xs font-semibold text-slate-700">
                        {payment.reference}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-5 text-sm leading-6 text-slate-600">
                    {getPaymentMessage(payment.status)}
                  </p>

                  <a
                    href={createCommerceHref(`/payments/${payment.id}`)}
                    className="mt-4 inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    View payment →
                  </a>
                </>
              ) : (
                <>
                  <div className="mt-3">
                    <Badge variant="neutral">NOT CREATED</Badge>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {order.status === "PENDING"
                      ? "A payment record will be created automatically when this order is confirmed."
                      : "No payment record was found for this order. Fulfillment cannot begin until payment clearance exists."}
                  </p>
                </>
              )}
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
