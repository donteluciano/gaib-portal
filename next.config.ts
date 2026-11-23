import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // "Strategies" was renamed "Approach".
      { source: "/strategies", destination: "/approach", permanent: true },
    ];
  },
};

export default nextConfig;
