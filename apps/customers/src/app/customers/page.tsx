import Link from "next/link";

import { CustomerSegmentBadge } from "@/components/CustomerSegmentBadge";
import { getCustomers } from "@/lib/commerce-api";
import { formatDateTime } from "@/lib/customer";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Customers
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Manage B2B customer accounts used across quotations and orders.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contact
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Segment
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Updated
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="font-medium text-slate-950 hover:underline"
                  >
                    {customer.companyName}
                  </Link>

                  <div className="mt-1 font-mono text-xs text-slate-500">
                    {customer.id}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="text-sm text-slate-700">
                    {customer.contactName}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {customer.email}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <CustomerSegmentBadge segment={customer.segment} />
                </td>

                <td className="px-5 py-4 text-sm font-medium text-emerald-700">
                  {customer.status}
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {formatDateTime(customer.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
