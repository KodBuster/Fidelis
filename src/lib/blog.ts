export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "osobennosti-brilliantov-novogo-pokoleniya",
    title: "Ограненные синтетические алмазы в украшениях ФИДЕЛИС",
    description:
      "Как обозначаются вставки, в каких единицах указывается масса и что означает добровольная аттестация качества.",
    datePublished: "2026-08-05",
    dateModified: "2026-09-01",
  },
  {
    slug: "kak-vybrat-yuvelirnoe-ukrashenie-v-podarok",
    title:
      "Подарок, который не забудут: как выбрать ювелирное украшение в подарок",
    description:
      "Семь советов, как выбрать украшение в подарок: вкус человека, образ жизни, размер, металл, камень и личная деталь.",
    datePublished: "2026-09-04",
    dateModified: "2026-09-04",
  },
  {
    slug: "kak-vybrat-ukrashenie-sem-pravil",
    title:
      "Как выбрать украшение, которое станет «тем самым»: 7 правил идеальной покупки",
    description:
      "Как выбрать ювелирное украшение под себя: металл, камень, образ жизни, размер и главный вопрос перед покупкой.",
    datePublished: "2026-09-04",
    dateModified: "2026-09-04",
  },
  {
    slug: "serebro-glavnyy-yuvelirnyy-trend",
    title:
      "Серебро снова в центре внимания: почему главный ювелирный тренд — металл с характером",
    description:
      "Почему серебро стало самостоятельным эстетическим выбором, как его носить в многослойности и сочетать с ограненным синтетическим алмазом.",
    datePublished: "2026-09-04",
    dateModified: "2026-09-04",
  },
];

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}
