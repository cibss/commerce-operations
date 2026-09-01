import { Link } from "@vercel/microfrontends/next/client";

type CommerceNavigationProps = {
  activeSection: "home" | "quotations" | "orders" | "customers" | "payments";
};

const navigation = [
  {
    label: "Overview",
    href: "/",
    section: "home",
  },
  {
    label: "Quotations",
    href: "/quotations",
    section: "quotations",
  },
  {
    label: "Orders",
    href: "/orders",
    section: "orders",
  },
  {
    label: "Customers",
    href: "/customers",
    section: "customers",
  },
  {
    label: "Payments",
    href: "/payments",
    section: "payments",
  },
] as const;

export function CommerceNavigation({ activeSection }: CommerceNavigationProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="py-4 text-sm font-semibold text-slate-950">
            Commerce Operations
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-1"
          >
            {navigation.map((item) => {
              const isActive = item.section === activeSection;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border-b-2 px-3 py-4 text-sm font-medium transition ${
                    isActive
                      ? "border-slate-950 text-slate-950"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
          SS
        </div>
      </div>
    </header>
  );
}
