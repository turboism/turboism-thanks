import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  basePath: "/thanks",
  async redirects() {
    const legacyRequest = {
      type: "host" as const,
      value: "thanks.turboism.dev",
    };
    const gatewayRequest = {
      type: "query" as const,
      key: "__turboism_gateway",
      value: "1",
    };
    const legacyConditions = {
      basePath: false as const,
      has: [legacyRequest],
      missing: [gatewayRequest],
      permanent: true,
    };

    return [
      {
        source: "/",
        destination: "https://turboism.dev/thanks",
        ...legacyConditions,
      },
      {
        source: "/thanks/:path*",
        destination: "https://turboism.dev/thanks/:path*",
        ...legacyConditions,
      },
      {
        source: "/:path+",
        destination: "https://turboism.dev/thanks/:path*",
        ...legacyConditions,
      },
    ];
  },
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
