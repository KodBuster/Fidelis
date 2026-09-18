import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { buildPageMetadata } from "@/lib/metadata";
import { BLOG_ARTICLES } from "@/lib/blog";

export const metadata = buildPageMetadata({
  title: "Блог — ФИДЕЛИС",
  description:
    "Статьи, новости и видео об украшениях из серебра бренда ФИДЕЛИС.",
  path: "/blog",
});

export default function BlogHubPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10">
            <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
              ФИДЕЛИС
            </p>
            <h1 className="font-heading text-3xl md:text-5xl text-brand-olive-dark mb-6">
              Блог
            </h1>
            <p className="text-brand-text leading-relaxed text-base md:text-lg">
              Статьи, новости и видеоролики о товарах и украшениях из серебра
              и ювелирных трендах.
            </p>
          </div>
        </section>

        <section className="pb-12 md:pb-16">
          <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 space-y-4">
            {BLOG_ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="block rounded-xl border border-brand-olive/15 bg-brand-surface p-6 hover:border-brand-olive/35 transition-colors"
              >
                <p className="text-xs tracking-[0.15em] uppercase text-brand-muted mb-2">
                  Статья
                </p>
                <h2 className="font-heading text-xl md:text-2xl text-brand-olive-dark mb-2">
                  {article.title}
                </h2>
                <p className="text-brand-muted text-sm md:text-base">
                  {article.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
