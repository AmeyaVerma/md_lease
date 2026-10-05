import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site opens on the lease search; there is no separate landing page.
  // Temporary (307) so it can be changed later without browsers caching it.
  async redirects() {
    return [{ source: "/", destination: "/properties/lease", permanent: false }];
  },
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
