import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CodeGraph",
    short_name: "CodeGraph",
    description: "Learn to code with interactive courses, problems, and a playground",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    // TODO: Add PWA icons once /icon-192.png and /icon-512.png are generated
    // icons: [
    //   { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    //   { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    // ],
  };
}
