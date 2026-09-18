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
      "В украшениях ФИДЕЛИС вставки обозначаются как «ограненный синтетический алмаз». Масса указывается в граммах.",
    body: (
      <>
        <p>
          Ограненный синтетический алмаз — это алмаз, полученный в
          контролируемых условиях и прошедший огранку. В названиях и описаниях
          изделий всегда указывается, что вставка синтетическая.
        </p>
        <p>
          Масса вставки указывается в граммах. Это относится к карточке товара,
          SEO-описанию и сопроводительным документам.
        </p>
        <p>
          Для изделий с вставками от 0,1 г ФИДЕЛИС участвует в добровольной
          аттестации качества — дополнительной проверке изделия независимой
          организацией.
        </p>
        <p>
          В описаниях мы указываем тип вставки, массу в граммах и огранку.
          Качественно-цветовые характеристики для синтетических вставок не
          используются.
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
