import { Link } from "@vercel/microfrontends/next/client";

export type CommerceSection =
  | "home"
  | "quotations"
  | "orders"
  | "customers"
  | "payments";

type CommerceNavigationProps = {
  activeSection: CommerceSection;
  basePath?: string;
};

const navigation = [
  {
    label: "Overview",
    path: "/",
    section: "home",
  },
  {
    label: "Quotations",
    path: "/quotations",
    section: "quotations",
  },
  {
    label: "Orders",
    path: "/orders",
    section: "orders",
  },
  {
    label: "Customers",
    path: "/customers",
    section: "customers",
  },
  {
    label: "Payments",
    path: "/payments",
    section: "payments",
  },
] as const;

function normalizeBasePath(basePath: string) {
  if (!basePath || basePath === "/") {
    return "";
  }

  return `/${basePath.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function createHref(basePath: string, path: string) {
  const normalizedBasePath = normalizeBasePath(basePath);

  if (path === "/") {
    return normalizedBasePath || "/";
  }

  return `${normalizedBasePath}${path}`;
}

export function CommerceNavigation({
  activeSection,
  basePath = "",
}: CommerceNavigationProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link
            href={createHref(basePath, "/")}
            className="py-4 text-sm font-semibold text-slate-950"
          >
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
                  key={item.path}
                  href={createHref(basePath, item.path)}
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

        <div
          aria-label="Signed in user"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700"
        >
          SS
        </div>
      </div>
    </header>
  );
}
