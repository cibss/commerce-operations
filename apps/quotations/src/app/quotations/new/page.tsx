import { PageHeader, Panel, PanelHeader, buttonClassName } from "@commerce/ui";
import Link from "next/link";

import { createQuotationAction } from "@/app/quotations/actions";
import { getCustomers } from "@/lib/commerce-api";

type NewQuotationPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400";

export default async function NewQuotationPage({
  searchParams,
}: NewQuotationPageProps) {
  const { error } = await searchParams;

  const customers = await getCustomers();

  return (
    <>
      <PageHeader
        eyebrow="Sales operations"
        title="Create quotation"
        description="Prepare a new commercial proposal for an existing B2B customer."
        actions={
          <Link href="/quotations" className={buttonClassName("secondary")}>
            Cancel
          </Link>
        }
      />

      {error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <form
        action={createQuotationAction}
        className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-6">
          <Panel>
            <PanelHeader
              title="Customer"
              description="Select the account this quotation belongs to."
            />

            <div className="p-6">
              <label
                htmlFor="customerId"
                className="text-sm font-semibold text-slate-700"
              >
                Customer account
              </label>

              <select
                id="customerId"
                name="customerId"
                required
                defaultValue=""
                className={inputClassName}
              >
                <option value="" disabled>
                  Select customer
                </option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.companyName} — {customer.id}
                  </option>
                ))}
              </select>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Commercial line item"
              description="Define the product, quantity, and negotiated pricing."
            />

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="sku"
                  className="text-sm font-semibold text-slate-700"
                >
                  SKU
                </label>

                <input
                  id="sku"
                  name="sku"
                  required
                  placeholder="MBP-M4-14"
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="itemName"
                  className="text-sm font-semibold text-slate-700"
                >
                  Item name
                </label>

                <input
                  id="itemName"
                  name="itemName"
                  required
                  placeholder="MacBook Pro 14 M4"
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="text-sm font-semibold text-slate-700"
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
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="unitPrice"
                  className="text-sm font-semibold text-slate-700"
                >
                  Unit price
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    IDR
                  </span>

                  <input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="30000000"
                    className={`${inputClassName} pl-12`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="discount"
                  className="text-sm font-semibold text-slate-700"
                >
                  Discount
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    IDR
                  </span>

                  <input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue="0"
                    required
                    className={`${inputClassName} pl-12`}
                  />
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div>
          <div className="sticky top-6 space-y-4">
            <Panel>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Workflow
                </p>

                <h2 className="mt-2 text-base font-bold text-slate-950">
                  New quotation
                </h2>

                <div className="mt-5 space-y-4">
                  {[
                    "Created as DRAFT",
                    "Send to customer",
                    "Customer accepts",
                    "Convert to order",
                  ].map((item, index) => (
                    <div key={item} className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
                        {index + 1}
                      </div>

                      <p className="pt-0.5 text-sm text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <button
              type="submit"
              className={buttonClassName("primary", "md", "w-full")}
            >
              Create draft quotation
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
