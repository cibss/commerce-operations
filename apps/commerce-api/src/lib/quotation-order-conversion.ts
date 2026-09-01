import { createOrderFromQuotation, getOrder } from "@/lib/orders";
import {
  getQuotation,
  markQuotationConverted,
  QuotationDomainError,
} from "@/lib/quotations";

export type ConvertQuotationResult = {
  quotationId: string;
  orderId: string;
};

export function convertQuotationToOrder(
  quotationId: string,
): ConvertQuotationResult {
  const quotation = getQuotation(quotationId);

  if (quotation.status === "CONVERTED") {
    if (!quotation.convertedOrderId) {
      throw new QuotationDomainError(
        `Quotation ${quotationId} is converted but does not reference an order.`,
        409,
      );
    }

    const existingOrder = getOrder(quotation.convertedOrderId);

    return {
      quotationId: quotation.id,
      orderId: existingOrder.id,
    };
  }

  if (quotation.status !== "ACCEPTED") {
    throw new QuotationDomainError(
      `Quotation ${quotationId} cannot be converted from ${quotation.status}.`,
      409,
    );
  }

  const order = createOrderFromQuotation({
    sourceQuotationId: quotation.id,
    customerId: quotation.customerId,
    customerName: quotation.customerName,
    items: quotation.items.map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    subtotal: quotation.subtotal,
    discount: quotation.discount,
    total: quotation.total,
    currency: quotation.currency,
  });

  markQuotationConverted(quotation.id, order.id);

  return {
    quotationId: quotation.id,
    orderId: order.id,
  };
}
