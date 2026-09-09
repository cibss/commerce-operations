import type { NextConfig } from "next";

const COMMERCE_BASE_PATH = "/work/commerce-operations";

function getCommercePlatformHost() {
  const platformUrl = process.env.COMMERCE_PLATFORM_URL;

  if (!platformUrl) {
    return "localhost:3000";
  }

  try {
    return new URL(platformUrl).host;
  } catch {
    throw new Error("Invalid COMMERCE_PLATFORM_URL environment variable.");
  }
}

const nextConfig: NextConfig = {
  basePath: COMMERCE_BASE_PATH,

  assetPrefix: `${COMMERCE_BASE_PATH}/payments-static`,

  transpilePackages: ["@commerce/ui", "@commerce/platform-ui"],

  experimental: {
    serverActions: {
      allowedOrigins: [getCommercePlatformHost()],
    },
  },
};

export default nextConfig;
