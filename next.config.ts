import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // "Strategies" was renamed "Approach".
      { source: "/strategies", destination: "/approach", permanent: true },
      // News was retired until there is news to share.
      { source: "/news", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
