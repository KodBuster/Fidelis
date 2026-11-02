import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

const STATIC_PAGES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
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

  return staticEntries;
}
