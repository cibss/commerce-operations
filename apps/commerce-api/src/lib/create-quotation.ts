import { getCustomer } from "@/lib/customers";
import {
  createQuotation,
  type Currency,
  type Quotation,
} from "@/lib/quotations";

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

export function createQuotationForCustomer(
  input: CreateQuotationForCustomerInput,
): Quotation {
  const customer = getCustomer(input.customerId);

  return createQuotation({
    customerId: customer.id,
    customerName: customer.companyName,
    items: input.items,
    discount: input.discount,
    currency: input.currency,
  });
}
