import { Link } from "@vercel/microfrontends/next/client";
import type { ReactNode } from "react";

export type CommerceSection =
  | "home"
  | "quotations"
  | "orders"
  | "customers"
  | "payments";

type CommerceShellProps = {
  activeSection: CommerceSection;
  children: ReactNode;
  basePath?: string;
};

type NavIconProps = {
  section: CommerceSection;
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
  const normalized = normalizeBasePath(basePath);

  if (path === "/") {
    return normalized || "/";
  }

  return `${normalized}${path}`;
}

function NavIcon({ section }: NavIconProps) {
  if (section === "home") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-[18px] w-[18px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"
        />
      </svg>
    );
  }

  if (section === "quotations") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-[18px] w-[18px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M7 3h7l4 4v14H7V3Zm7 0v5h5M10 12h5M10 16h5"
        />
      </svg>
    );
  }

  if (section === "orders") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-[18px] w-[18px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M5 7h14l-1 14H6L5 7Zm3 0V6a4 4 0 0 1 8 0v1"
        />
      </svg>
    );
  }

  if (section === "customers") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-[18px] w-[18px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1a3 3 0 1 0 0-6M2 21v-2a6 6 0 0 1 12 0v2m2-7a5 5 0 0 1 6 5v2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="h-[18px] w-[18px]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M3 6h18v12H3V6Zm0 4h18M7 15h4"
      />
    </svg>
  );
}

export function CommerceShell({
  activeSection,
  children,
  basePath = "",
}: CommerceShellProps) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-[250px] shrink-0 border-r border-slate-200/80 bg-white lg:flex lg:flex-col">
        <div className="flex h-[76px] items-center border-b border-slate-100 px-5">
          <Link
            href={createHref(basePath, "/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
              C
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-950">
                Commerce Ops
              </p>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Operations Platform
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-3 py-5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Workspace
          </p>

          <nav className="mt-2 space-y-1">
            {navigation.map((item) => {
              const active = item.section === activeSection;

              return (
                <Link
                  key={item.path}
                  href={createHref(basePath, item.path)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <span
                    className={active ? "text-indigo-600" : "text-slate-400"}
                  >
                    <NavIcon section={item.section} />
                  </span>

                  {item.label}

                  {active ? (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-slate-100 pt-5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Architecture
            </p>

            <div className="mt-3 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>

                <span className="text-xs font-semibold text-slate-700">
                  Microfrontends
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-lg font-bold text-slate-950">5</p>

                  <p className="text-[10px] text-slate-500">apps</p>
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-950">4</p>

                  <p className="text-[10px] text-slate-500">domains</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              SS
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-900">
                Portfolio Demo
              </p>

              <p className="mt-0.5 text-[10px] text-slate-500">
                Internal Operations
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur lg:hidden">
          <div className="flex h-16 items-center px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              C
            </div>

            <p className="ml-3 text-sm font-bold text-slate-950">
              Commerce Ops
            </p>
          </div>

          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2">
            {navigation.map((item) => (
              <Link
                key={item.path}
                href={createHref(basePath, item.path)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${
                  item.section === activeSection
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
