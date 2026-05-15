import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "machine-hub-prod.s3.amazonaws.com",
        pathname: "/machine-listing-images/**",
      },
    ],
  },
};

export default nextConfig;
