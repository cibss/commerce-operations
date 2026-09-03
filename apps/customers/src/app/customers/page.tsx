import { PageHeader, Panel, PanelHeader, StatCard } from "@commerce/ui";
import Link from "next/link";

import { CustomerSegmentBadge } from "@/components/CustomerSegmentBadge";
import { getCustomers } from "@/lib/commerce-api";
import { formatDateTime } from "@/lib/customer";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  const enterprise = customers.filter(
    (customer) => customer.segment === "ENTERPRISE",
  ).length;

  const active = customers.filter(
    (customer) => customer.status === "ACTIVE",
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Customer operations"
        title="Customers"
        description="Manage B2B customer accounts and review their quotation and order activity in one place."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Accounts"
          value={customers.length}
          hint="B2B customers"
          tone="indigo"
        />

        <StatCard
          label="Enterprise"
          value={enterprise}
          hint="Strategic accounts"
          tone="neutral"
        />

        <StatCard
          label="Active"
          value={active}
          hint="Operational accounts"
          tone="emerald"
        />
      </div>

      <Panel className="mt-6">
        <PanelHeader
          title="Customer directory"
          description="Canonical customer records referenced by other commerce domains."
        />

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {[
                  "Account",
                  "Primary contact",
                  "Segment",
                  "Status",
                  "Updated",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    {heading}
                  </th>
                ))}

                <th className="w-12" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-indigo-50/30">
                  <td className="px-6 py-4">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="text-sm font-bold text-slate-950 hover:text-indigo-600"
                    >
                      {customer.companyName}
                    </Link>

                    <p className="mt-1 font-mono text-[11px] text-slate-400">
                      {customer.id}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {customer.contactName}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {customer.email}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <CustomerSegmentBadge segment={customer.segment} />
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDateTime(customer.updatedAt)}
                  </td>

                  <td className="px-5 py-4 text-slate-300 group-hover:text-indigo-500">
                    →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
