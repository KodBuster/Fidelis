import { GUIDE_ARTICLES } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site-url";

export function buildGuideHubJsonLd(): Record<string, unknown>[] {
  const siteUrl = getSiteUrl();
  const guideUrl = `${siteUrl}/guide`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${guideUrl}#collection`,
      name: "Гид покупателя — ФИДЕЛИС",
      description:
        "Полезные статьи об украшениях из серебра, уходе за серебром и выборе подарка.",
      url: guideUrl,
      inLanguage: "ru-RU",
      mainEntity: {
        "@type": "ItemList",
        name: "Статьи гида покупателя",
        numberOfItems: GUIDE_ARTICLES.length,
        itemListElement: GUIDE_ARTICLES.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: article.title,
          url: `${siteUrl}/guide/${article.slug}`,
        })),
      },
    },
  ];
}
