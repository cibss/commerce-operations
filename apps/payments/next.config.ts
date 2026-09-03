import { withMicrofrontends } from "@vercel/microfrontends/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@commerce/ui", "@commerce/platform-ui"],
};

export default withMicrofrontends(nextConfig);
