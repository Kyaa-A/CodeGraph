import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://images.unsplash.com/**"),
      new URL("https://cdn.jsdelivr.net/**"),
      new URL("https://onpqkzjevvrjnwyvuyuv.supabase.co/**"),
    ],
  },
};

export default nextConfig;
