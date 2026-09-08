import { listOrders } from "@/lib/orders";
import { listQuotations } from "@/lib/quotations";
import { CustomerRepository } from "@/repositories/CustomerRepository";

export async function getCustomerOverview(customerId: string) {
  const customer = await CustomerRepository.getById(customerId);

  const quotations = listQuotations()
    .filter((quotation) => quotation.customerId === customerId)
    .map((quotation) => ({
      id: quotation.id,
      total: quotation.total,
      currency: quotation.currency,
      status: quotation.status,
      updatedAt: quotation.updatedAt,
    }));

  const orders = listOrders()
    .filter((order) => order.customerId === customerId)
    .map((order) => ({
      id: order.id,
      sourceQuotationId: order.sourceQuotationId,
      total: order.total,
      currency: order.currency,
      status: order.status,
      updatedAt: order.updatedAt,
    }));

  const totalOrderValue = orders.reduce(
    (total, order) => total + order.total,
    0,
  );

  return {
    customer,

    stats: {
      quotationCount: quotations.length,
      orderCount: orders.length,
      totalOrderValue,
    },

    quotations,
    orders,
  };
}
