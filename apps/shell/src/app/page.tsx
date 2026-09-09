import { CommerceShell, createCommerceHref } from "@commerce/platform-ui";
import { Badge, PageHeader, Panel, PanelHeader, StatCard } from "@commerce/ui";

const domains = [
  {
    title: "Quotations",
    description:
      "Create customer quotations, manage approvals, and convert accepted commercial agreements into orders.",
    href: "/quotations",
    ownership: "Sales Operations",
    accent: "from-indigo-500 to-violet-500",
    metric: "Sales workflow",
    number: "01",
  },
  {
    title: "Orders",
    description:
      "Manage order confirmation, fulfillment, shipping, and completion after commercial handover.",
    href: "/orders",
    ownership: "Order Operations",
    accent: "from-blue-500 to-cyan-500",
    metric: "Fulfillment",
    number: "02",
  },
  {
    title: "Customers",
    description:
      "Maintain B2B customer accounts and view their commercial activity across quotations and orders.",
    href: "/customers",
    ownership: "Customer Operations",
    accent: "from-violet-500 to-fuchsia-500",
    metric: "Account data",
    number: "03",
  },
  {
    title: "Payments",
    description:
      "Monitor payment settlement, failed transactions, completed payments, and refunds.",
    href: "/payments",
    ownership: "Finance Operations",
    accent: "from-emerald-500 to-teal-500",
    metric: "Settlement",
    number: "04",
  },
] as const;

const workflow = [
  "Quotation",
  "Approval",
  "Order",
  "Fulfillment",
  "Payment",
  "Completed",
];

export default function Home() {
  return (
    <CommerceShell activeSection="home">
      <PageHeader
        eyebrow="Operations workspace"
        title="Commerce Operations"
        description="Coordinate the B2B quote-to-cash lifecycle across sales, customer, fulfillment, and finance operations."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">Microfrontend architecture</Badge>

          <Badge variant="success">5 independent applications</Badge>

          <Badge variant="neutral">Unified operations workspace</Badge>
        </div>
      </PageHeader>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Applications"
          value="5"
          hint="Independently runnable"
          tone="indigo"
        />

        <StatCard
          label="Domains"
          value="4"
          hint="Business ownership"
          tone="neutral"
        />

        <StatCard
          label="Entry points"
          value="1"
          hint="Unified platform"
          tone="emerald"
        />

        <StatCard
          label="Hero flow"
          value="Quote → Order"
          hint="Cross-MFE workflow"
          tone="amber"
        />
      </div>

      <Panel className="mt-6">
        <PanelHeader
          title="Quote-to-cash workflow"
          description="Track a commercial opportunity from initial quotation through fulfillment and payment settlement."
          action={<Badge variant="success">Operational</Badge>}
        />

        <div className="overflow-x-auto px-6 py-7">
          <div className="flex min-w-[720px] items-center">
            {workflow.map((step, index) => (
              <div
                key={step}
                className={`flex ${
                  index < workflow.length - 1 ? "flex-1" : ""
                } items-center`}
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-sm font-bold text-indigo-600">
                    {index + 1}
                  </div>

                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    {step}
                  </p>
                </div>

                {index < workflow.length - 1 ? (
                  <div className="mx-4 h-px flex-1 bg-gradient-to-r from-indigo-200 to-slate-200" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Business domains
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Each domain owns a distinct operational responsibility.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {domains.map((domain) => (
            <a
              key={domain.href}
              href={createCommerceHref(domain.href)}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_30px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_12px_40px_rgba(79,70,229,0.08)]"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${domain.accent}`}
              />

              <div className="flex items-start justify-between gap-8">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    {domain.number}
                  </span>

                  <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-950">
                    {domain.title}
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    {domain.description}
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-lg text-slate-400 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  →
                </div>
              </div>

              <div className="mt-6 flex items-center gap-6 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Owned By
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {domain.ownership}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Workflow
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {domain.metric}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </CommerceShell>
  );
}
