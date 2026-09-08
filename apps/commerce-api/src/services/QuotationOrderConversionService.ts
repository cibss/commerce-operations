import { getDatabase } from "@/db/client";
import { QuotationDomainError } from "@/lib/quotations";
import { OrderRepository } from "@/repositories/OrderRepository";
import { QuotationRepository } from "@/repositories/QuotationRepository";
import { createOrderFromQuotationInTransaction } from "@/services/OrderService";

export type ConvertQuotationResult = {
  quotationId: string;
  orderId: string;
};

async function convert(quotationId: string): Promise<ConvertQuotationResult> {
  const db = getDatabase();

  return db.transaction(async (transaction) => {
    /*
     * Lock this quotation row.
     *
     * Two concurrent conversion requests for the
     * same quotation cannot execute the critical
     * section at the same time.
     */
    await QuotationRepository.lockByIdInTransaction(transaction, quotationId);

    const quotation = await QuotationRepository.findByIdInTransaction(
      transaction,
      quotationId,
    );

    if (!quotation) {
      throw new QuotationDomainError(
        `Quotation ${quotationId} was not found.`,
        404,
      );
    }

    /*
     * Idempotency path.
     *
     * Calling convert again after success returns
     * the same existing order.
     */
    if (quotation.status === "CONVERTED") {
      if (!quotation.convertedOrderId) {
        throw new QuotationDomainError(
          `Quotation ${quotationId} is converted but does not reference an order.`,
          409,
        );
      }

      const existingOrder = await OrderRepository.findByIdInTransaction(
        transaction,
        quotation.convertedOrderId,
      );

      if (!existingOrder) {
        throw new QuotationDomainError(
          `Quotation ${quotationId} references missing order ${quotation.convertedOrderId}.`,
          409,
        );
      }

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

    /*
     * Additional database-level idempotency check.
     *
     * orders.sourceQuotationId has a UNIQUE index.
     */
    const existingOrder =
      await OrderRepository.findBySourceQuotationIdInTransaction(
        transaction,
        quotation.id,
      );

    if (existingOrder) {
      const updated = await QuotationRepository.markConvertedInTransaction(
        transaction,
        quotation.id,
        existingOrder.id,
        new Date().toISOString(),
      );

      if (!updated) {
        throw new QuotationDomainError(
          `Quotation ${quotation.id} could not be marked as converted.`,
          409,
        );
      }

      return {
        quotationId: quotation.id,
        orderId: existingOrder.id,
      };
    }

    const order = await createOrderFromQuotationInTransaction(transaction, {
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

    const quotationUpdated =
      await QuotationRepository.markConvertedInTransaction(
        transaction,
        quotation.id,
        order.id,
        new Date().toISOString(),
      );

    if (!quotationUpdated) {
      throw new QuotationDomainError(
        `Quotation ${quotation.id} could not be marked as converted.`,
        409,
      );
    }

    return {
      quotationId: quotation.id,
      orderId: order.id,
    };
  });
}

export const QuotationOrderConversionService = {
  convert,
};
