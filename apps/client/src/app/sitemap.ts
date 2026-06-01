import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

const PUBLIC_ROUTES = [
  "",
  "/pricing",
  "/features",
  "/about",
  "/faq",
  "/blog",
  "/careers",
  "/contact",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.siteUrl.replace(/\/$/, "");
  return PUBLIC_ROUTES.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
