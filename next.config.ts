import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos uploaded through md-commercial's admin live in this bucket.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mrjqhahonfxgxqocztxs.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
