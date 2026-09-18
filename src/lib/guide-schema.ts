import type { GuideArticle } from "@/lib/guides";
import { buildGuideAuthor } from "@/lib/guide-author";
import { getOrganizationId } from "@/lib/schema-ids";
import { absoluteImageUrl, DEFAULT_OG_IMAGE } from "@/lib/seo-images";
import { getSiteUrl } from "@/lib/site-url";
import type { FaqItem } from "@/lib/warranty-faq";

export const LAB_GROWN_DIAMONDS_FAQ: FaqItem[] = [
  {
    question: "Из какого металла украшения ФИДЕЛИС?",
    answer:
      "В продаже только серебро 925. Изделий из других драгоценных металлов нет.",
  },
  {
    question: "Есть ли модели со вставками и без?",
    answer:
      "Да. В каталоге есть чистые серебряные формы и украшения со вставками. Подробности — в карточке товара.",
  },
  {
    question: "Что указывают в характеристиках?",
    answer:
      "Металл, тип изделия и параметры конкретной модели. Для изделий со вставкой могут быть указаны тип вставки и масса.",
  },
  {
    question: "Что такое добровольная аттестация качества?",
    answer:
      "Для ряда изделий ФИДЕЛИС участвует в добровольной аттестации качества — дополнительной проверке независимой организацией.",
  },
];

export const GUIDE_SPEAKABLE_SELECTORS = [
  ".guide-intro",
  ".guide-content h2",
  ".guide-content > p",
] as const;

export function buildGuideArticleJsonLd(
  article: GuideArticle,
): Record<string, unknown> {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteUrl}/guide/${article.slug}#article`,
    headline: article.title,
    description: article.description,
    url: `${siteUrl}/guide/${article.slug}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: buildGuideAuthor(),
    publisher: {
      "@id": getOrganizationId(),
    },
    image: absoluteImageUrl(article.ogImage ?? DEFAULT_OG_IMAGE),
    inLanguage: "ru-RU",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [...GUIDE_SPEAKABLE_SELECTORS],
    },
    ...(article.about && {
      about: {
        "@type": "Thing",
        name: article.about,
      },
    }),
  };
}
