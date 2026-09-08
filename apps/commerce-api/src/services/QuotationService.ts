import { getDatabase } from "@/db/client";
import {
  assertQuotationTransition,
  type CreateQuotationInput,
  type Quotation,
  QuotationDomainError,
  type QuotationItem,
  type QuotationStatus,
  validateCreateQuotationInput,
} from "@/lib/quotations";
import { QuotationRepository } from "@/repositories/QuotationRepository";

async function list(): Promise<Quotation[]> {
  return QuotationRepository.list();
}

async function getById(quotationId: string): Promise<Quotation> {
  const quotation = await QuotationRepository.findById(quotationId);

  if (!quotation) {
    throw new QuotationDomainError(
      `Quotation ${quotationId} was not found.`,
      404,
    );
  }

  return quotation;
}

async function create(input: CreateQuotationInput): Promise<Quotation> {
  validateCreateQuotationInput(input);

  const subtotal = input.items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );

  const discount = input.discount ?? 0;

  if (discount > subtotal) {
    throw new QuotationDomainError("Discount cannot be greater than subtotal.");
  }

  const db = getDatabase();

  return db.transaction(async (transaction) => {
    const identity = await QuotationRepository.allocateIdentityInTransaction(
      transaction,
      input.items.length,
    );

    const items: QuotationItem[] = input.items.map((item, index) => ({
      id: identity.itemIds[index],
      sku: item.sku.trim(),
      name: item.name.trim(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.quantity * item.unitPrice,
    }));

    const timestamp = new Date().toISOString();

    const quotation: Quotation = {
      id: identity.quotationId,

      customerId: input.customerId.trim(),

      customerName: input.customerName.trim(),

      items,

      subtotal,
      discount,

      total: subtotal - discount,

      currency: input.currency ?? "IDR",

      status: "DRAFT",

      convertedOrderId: null,

      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await QuotationRepository.insertInTransaction(transaction, quotation);

    return quotation;
  });
}

async function transition(
  quotationId: string,
  expectedStatus: QuotationStatus,
  nextStatus: QuotationStatus,
): Promise<Quotation> {
  const updated = await QuotationRepository.updateStatus(
    quotationId,
    expectedStatus,
    nextStatus,
    new Date().toISOString(),
  );

  if (!updated) {
    const current = await QuotationRepository.findById(quotationId);

    if (!current) {
      throw new QuotationDomainError(
        `Quotation ${quotationId} was not found.`,
        404,
      );
    }

    assertQuotationTransition(
      quotationId,
      current.status,
      expectedStatus,
      nextStatus,
    );

    throw new QuotationDomainError(
      `Quotation ${quotationId} could not be updated.`,
      409,
    );
  }

  return getById(quotationId);
}

async function send(quotationId: string) {
  return transition(quotationId, "DRAFT", "SENT");
}

async function accept(quotationId: string) {
  return transition(quotationId, "SENT", "ACCEPTED");
}

async function reject(quotationId: string) {
  return transition(quotationId, "SENT", "REJECTED");
}

export const QuotationService = {
  list,
  getById,
  create,
  send,
  accept,
  reject,
};
