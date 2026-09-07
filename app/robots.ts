import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/chat/",
        "/profile/edit/",
        "/sell/",
        "/services/create/",
        "/services/edit/",
        "/roommates/create/",
        "/roommates/edit/",
        "/feed/create/",
        "/feed/edit/",
      ],
    },
    sitemap: "https://uniside.in/sitemap.xml",
  };
}