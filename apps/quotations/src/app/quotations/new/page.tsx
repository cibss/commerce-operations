import Link from "next/link";

import { createQuotationAction } from "@/app/quotations/actions";
import { getCustomers } from "@/lib/commerce-api";

type NewQuotationPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewQuotationPage({
  searchParams,
}: NewQuotationPageProps) {
  const { error } = await searchParams;

  const customers = await getCustomers();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/quotations"
        className="text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        ← Back to quotations
      </Link>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Create quotation
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create a draft quotation for an existing customer.
        </p>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form action={createQuotationAction} className="mt-8 space-y-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Customer</h2>

          <div className="mt-5">
            <label
              htmlFor="customerId"
              className="block text-sm font-medium text-slate-700"
            >
              Customer
            </label>

            <select
              id="customerId"
              name="customerId"
              required
              defaultValue=""
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-500"
            >
              <option value="" disabled>
                Select customer
              </option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.companyName} ({customer.id})
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Line item
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Phase 6 keeps the form intentionally focused on one line item.
            </p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-slate-700"
              >
                SKU
              </label>

              <input
                id="sku"
                name="sku"
                type="text"
                required
                placeholder="MBP-M4-14"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="itemName"
                className="block text-sm font-medium text-slate-700"
              >
                Item name
              </label>

              <input
                id="itemName"
                name="itemName"
                type="text"
                required
                placeholder="MacBook Pro 14 M4"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-slate-700"
              >
                Quantity
              </label>

              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                defaultValue="1"
                required
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="unitPrice"
                className="block text-sm font-medium text-slate-700"
              >
                Unit price (IDR)
              </label>

              <input
                id="unitPrice"
                name="unitPrice"
                type="number"
                min="1"
                step="1"
                required
                placeholder="30000000"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="discount"
              className="block text-sm font-medium text-slate-700"
            >
              Discount (IDR)
            </label>

            <input
              id="discount"
              name="discount"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-500"
            />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/quotations"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create draft
          </button>
        </div>
      </form>
    </div>
  );
}
