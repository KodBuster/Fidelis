import type { GuideArticle } from "@/lib/guides";
import { buildGuideAuthor } from "@/lib/guide-author";
import { getOrganizationId } from "@/lib/schema-ids";
import { absoluteImageUrl, DEFAULT_OG_IMAGE } from "@/lib/seo-images";
import { getSiteUrl } from "@/lib/site-url";
import type { FaqItem } from "@/lib/warranty-faq";

export const LAB_GROWN_DIAMONDS_FAQ: FaqItem[] = [
  {
    question: "Как правильно называется вставка в украшениях ФИДЕЛИС?",
    answer:
      "В маркировке и описаниях используется формулировка «ограненный синтетический алмаз» или «ограненные синтетические алмазы» — с обязательным указанием, что вставка синтетическая.",
  },
  {
    question: "В каких единицах указывается масса вставки?",
    answer:
      "Масса ограненного синтетического алмаза указывается в граммах — в названии, описании и паспорте изделия.",
  },
  {
    question: "Указываются ли цвет и чистота вставки?",
    answer:
      "В описаниях изделий ФИДЕЛИС не используются качественно-цветовые характеристики для синтетических вставок. Указываются тип вставки, масса в граммах и огранка.",
  },
  {
    question: "Что такое добровольная аттестация качества?",
    answer:
      "Для изделий с вставками от 0,1 г ФИДЕЛИС участвует в добровольной аттестации качества — дополнительной проверке изделия независимой организацией.",
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
