import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/dashboard", "/profile", "/auth"],
    },
    sitemap: "https://codegraph.dev/sitemap.xml",
  };
}
