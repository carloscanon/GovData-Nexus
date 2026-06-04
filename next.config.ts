import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/command-center',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
