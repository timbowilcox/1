import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep app / authenticated / transient routes out of the index.
      disallow: [
        "/dashboard",
        "/projects",
        "/settings",
        "/processing",
        "/viewer",
        "/create",
        "/upload",
        "/history",
        "/reset-password",
        "/verify-email",
        "/collections/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
