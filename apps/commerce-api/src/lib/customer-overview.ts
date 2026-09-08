import { CustomerRepository } from "@/repositories/CustomerRepository";
import { OrderService } from "@/services/OrderService";
import { QuotationService } from "@/services/QuotationService";

export async function getCustomerOverview(customerId: string) {
  const [customer, quotationList, orderList] = await Promise.all([
    CustomerRepository.getById(customerId),
    QuotationService.list(),
    OrderService.list(),
  ]);

  const quotations = quotationList
    .filter((quotation) => quotation.customerId === customerId)
    .map((quotation) => ({
      id: quotation.id,
      total: quotation.total,
      currency: quotation.currency,
      status: quotation.status,
      updatedAt: quotation.updatedAt,
    }));

  const orders = orderList
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
