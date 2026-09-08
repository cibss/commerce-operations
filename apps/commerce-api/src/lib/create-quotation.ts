import type { Currency, Quotation } from "@/lib/quotations";
import { CustomerRepository } from "@/repositories/CustomerRepository";
import { QuotationService } from "@/services/QuotationService";

export type CreateQuotationForCustomerInput = {
  customerId: string;

  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;

  discount?: number;
  currency?: Currency;
};

export async function createQuotationForCustomer(
  input: CreateQuotationForCustomerInput,
): Promise<Quotation> {
  const customer = await CustomerRepository.getById(input.customerId);

  return QuotationService.create({
    customerId: customer.id,
    customerName: customer.companyName,
    items: input.items,
    discount: input.discount,
    currency: input.currency,
  });
}
