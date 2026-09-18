import type { MetadataRoute } from "next";
import { getCatalogProducts } from "@/lib/products-service";
import { CATALOG_CATEGORY_SLUGS } from "@/lib/products";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

const STATIC_PAGES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/search", changeFrequency: "monthly", priority: 0.45 },
  ...CATALOG_CATEGORY_SLUGS.map((slug) => ({
    path: `/shop/${slug}`,
    changeFrequency: "daily" as const,
    priority: 0.85,
  })),
  { path: "/cooperation", changeFrequency: "monthly", priority: 0.55 },
  { path: "/how-size-ring", changeFrequency: "yearly", priority: 0.5 },
  { path: "/warranty", changeFrequency: "yearly", priority: 0.5 },
  { path: "/shipping", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/guide", changeFrequency: "monthly", priority: 0.55 },
  { path: "/guide/lab-grown-diamonds", changeFrequency: "yearly", priority: 0.5 },
  { path: "/guide/silver-care", changeFrequency: "yearly", priority: 0.5 },
  { path: "/guide/diamond-gift", changeFrequency: "yearly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  let productEntries: MetadataRoute.Sitemap = [];

  try {
    const products = await getCatalogProducts();
    productEntries = products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to build product sitemap entries:", error);
  }

  return [...staticEntries, ...productEntries];
}
