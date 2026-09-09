import type { NextConfig } from "next";

const COMMERCE_BASE_PATH = "/work/commerce-operations";

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, "");
}

const quotationsOrigin = normalizeOrigin(
  process.env.COMMERCE_QUOTATIONS_ORIGIN ?? "http://localhost:3001",
);

const ordersOrigin = normalizeOrigin(
  process.env.COMMERCE_ORDERS_ORIGIN ?? "http://localhost:3002",
);

const customersOrigin = normalizeOrigin(
  process.env.COMMERCE_CUSTOMERS_ORIGIN ?? "http://localhost:3004",
);

const paymentsOrigin = normalizeOrigin(
  process.env.COMMERCE_PAYMENTS_ORIGIN ?? "http://localhost:3005",
);

const nextConfig: NextConfig = {
  basePath: COMMERCE_BASE_PATH,

  transpilePackages: ["@commerce/ui", "@commerce/platform-ui"],

  async rewrites() {
    return [
      {
        source: `${COMMERCE_BASE_PATH}/quotations-static/:path*`,
        destination: `${quotationsOrigin}${COMMERCE_BASE_PATH}/quotations-static/:path*`,
        basePath: false,
      },

      {
        source: `${COMMERCE_BASE_PATH}/orders-static/:path*`,
        destination: `${ordersOrigin}${COMMERCE_BASE_PATH}/orders-static/:path*`,
        basePath: false,
      },

      {
        source: `${COMMERCE_BASE_PATH}/customers-static/:path*`,
        destination: `${customersOrigin}${COMMERCE_BASE_PATH}/customers-static/:path*`,
        basePath: false,
      },

      {
        source: `${COMMERCE_BASE_PATH}/payments-static/:path*`,
        destination: `${paymentsOrigin}${COMMERCE_BASE_PATH}/payments-static/:path*`,
        basePath: false,
      },

      {
        source: `${COMMERCE_BASE_PATH}/quotations`,
        destination: `${quotationsOrigin}${COMMERCE_BASE_PATH}/quotations`,
        basePath: false,
      },
      {
        source: `${COMMERCE_BASE_PATH}/quotations/:path*`,
        destination: `${quotationsOrigin}${COMMERCE_BASE_PATH}/quotations/:path*`,
        basePath: false,
      },

      {
        source: `${COMMERCE_BASE_PATH}/orders`,
        destination: `${ordersOrigin}${COMMERCE_BASE_PATH}/orders`,
        basePath: false,
      },
      {
        source: `${COMMERCE_BASE_PATH}/orders/:path*`,
        destination: `${ordersOrigin}${COMMERCE_BASE_PATH}/orders/:path*`,
        basePath: false,
      },

      {
        source: `${COMMERCE_BASE_PATH}/customers`,
        destination: `${customersOrigin}${COMMERCE_BASE_PATH}/customers`,
        basePath: false,
      },
      {
        source: `${COMMERCE_BASE_PATH}/customers/:path*`,
        destination: `${customersOrigin}${COMMERCE_BASE_PATH}/customers/:path*`,
        basePath: false,
      },

      {
        source: `${COMMERCE_BASE_PATH}/payments`,
        destination: `${paymentsOrigin}${COMMERCE_BASE_PATH}/payments`,
        basePath: false,
      },
      {
        source: `${COMMERCE_BASE_PATH}/payments/:path*`,
        destination: `${paymentsOrigin}${COMMERCE_BASE_PATH}/payments/:path*`,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
