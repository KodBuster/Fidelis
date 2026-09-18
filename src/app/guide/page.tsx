import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildGuideHubJsonLd } from "@/lib/guide-hub-schema";
import { buildPageMetadata } from "@/lib/metadata";
import { GUIDE_ARTICLES } from "@/lib/guides";

export const metadata = buildPageMetadata({
  title: "Гид покупателя — ФИДЕЛИС",
  description:
    "Полезные статьи об украшениях из серебра, уходе за серебром и выборе подарка.",
  path: "/guide",
});

export default function GuideHubPage() {
  return (
    <>
      <JsonLd data={buildGuideHubJsonLd()} />
      <Header />
      <main>
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10">
            <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
              ФИДЕЛИС
            </p>
            <h1 className="font-heading text-3xl md:text-5xl text-brand-olive-dark mb-6">
              Гид покупателя
            </h1>
            <p className="text-brand-text leading-relaxed text-base md:text-lg">
              Ответы на частые вопросы об украшениях из серебра, уходе за
              украшениями и выборе подарка.
            </p>
          </div>
        </section>

        <section className="pb-12 md:pb-16">
          <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 space-y-4">
            {GUIDE_ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/guide/${article.slug}`}
                className="block rounded-xl border border-brand-olive/15 bg-brand-surface p-6 hover:border-brand-olive/35 transition-colors"
              >
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
