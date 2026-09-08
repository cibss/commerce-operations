import {
  createQuotation,
  type Currency,
  type Quotation,
} from "@/lib/quotations";
import { CustomerRepository } from "@/repositories/CustomerRepository";

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

  return createQuotation({
    customerId: customer.id,
    customerName: customer.companyName,
    items: input.items,
    discount: input.discount,
    currency: input.currency,
  });
}
