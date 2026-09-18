export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  datePublished: string;
  dateModified: string;
  about?: string;
  ogImage?: string;
};

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "lab-grown-diamonds",
    title: "Украшения из серебра 925: что важно знать",
    description:
      "Только серебро 925 в каталоге: модели со вставками и без, характеристики и гарантия.",
    eyebrow: "Гид покупателя",
    datePublished: "2025-06-01",
    dateModified: "2026-09-01",
    about: "Украшения из серебра",
  },
  {
    slug: "silver-care",
    title: "Как ухаживать за серебром 925",
    description:
      "Простые правила хранения, чистки и носки серебряных украшений.",
    eyebrow: "Гид покупателя",
    datePublished: "2025-06-15",
    dateModified: "2026-09-01",
    about: "Уход за серебряными украшениями",
  },
  {
    slug: "diamond-gift",
    title: "Как выбрать подарок из серебра 925",
    description:
      "На что смотреть при выборе кольца, серёг или колье в подарок до 30 000 ₽.",
    eyebrow: "Гид покупателя",
    datePublished: "2025-07-01",
    dateModified: "2026-09-01",
    about: "Подарки из серебра 925",
  },
];

export function getGuideArticle(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((article) => article.slug === slug);
}
