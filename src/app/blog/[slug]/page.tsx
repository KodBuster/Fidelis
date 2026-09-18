import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import { ChooseJewelryArticle } from "@/components/blog/articles/ChooseJewelryArticle";
import { GiftJewelryArticle } from "@/components/blog/articles/GiftJewelryArticle";
import { SilverTrendArticle } from "@/components/blog/articles/SilverTrendArticle";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { BLOG_ARTICLES, getBlogArticle } from "@/lib/blog";
import { buildPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const ARTICLE_CONTENT: Record<
  string,
  { intro: string; body: ReactNode }
> = {
  "osobennosti-brilliantov-novogo-pokoleniya": {
    intro:
      "В каталоге ФИДЕЛИС — украшения из серебра 925: со вставками и без.",
    body: (
      <>
        <p>
          Мы продаём только серебро 925. В ассортименте есть чистые серебряные
          модели и украшения со вставками — выбирайте по вкусу и поводу.
        </p>
        <p>
          Характеристики конкретной модели указаны в карточке товара: металл,
          форма и параметры вставки, если она есть.
        </p>
        <p>
          Для ряда изделий доступна добровольная аттестация качества. На все
          украшения ФИДЕЛИС действует гарантия 2 года.
        </p>
      </>
    ),
  },
  "kak-vybrat-yuvelirnoe-ukrashenie-v-podarok": {
    intro:
      "Как выбрать ювелирное украшение в подарок и попасть точно в сердце: вкус человека, образ жизни, размер, металл и личная деталь.",
    body: <GiftJewelryArticle />,
  },
  "kak-vybrat-ukrashenie-sem-pravil": {
    intro:
      "Семь правил идеальной покупки: как выбрать украшение, которое станет «тем самым» и будет носиться каждый день.",
    body: <ChooseJewelryArticle />,
  },
  "serebro-glavnyy-yuvelirnyy-trend": {
    intro:
      "Почему серебро снова в центре внимания и как металл с характером стал главным ювелирным трендом.",
    body: <SilverTrendArticle />,
  },
};

export function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) return {};

  return buildPageMetadata({
    title: `${article.title} — Блог ФИДЕЛИС`,
    description: article.description,
    path: `/blog/${slug}`,
    ogType: "article",
  });
}

export default async function BlogArticleRoute({ params }: PageProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  const content = ARTICLE_CONTENT[slug];
  if (!article || !content) notFound();

  return (
    <>
      <Header />
      <main>
        <BlogArticleLayout title={article.title} intro={content.intro}>
          {content.body}
        </BlogArticleLayout>
      </main>
      <Footer />
    </>
  );
}
