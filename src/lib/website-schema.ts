import { getOrganizationId, getWebsiteId } from "@/lib/schema-ids";
import { getSiteUrl } from "@/lib/site-url";

export function buildWebSiteJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": getWebsiteId(),
    url: siteUrl,
    name: "ФИДЕЛИС",
    description:
      "Ювелирные украшения из серебра 925 с выразительными вставками. Доставка СДЭК по России.",
    inLanguage: "ru-RU",
    publisher: {
      "@id": getOrganizationId(),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
