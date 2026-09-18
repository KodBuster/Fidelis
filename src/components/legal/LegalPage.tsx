import Link from "next/link";
import type { ReactNode } from "react";

type LegalSection = {
  title: string;
  content: ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  updatedAt: string;
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  updatedAt,
  sections,
}: LegalPageProps) {
  return (
    <>
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            {eyebrow}
          </p>
          <h1 className="font-heading text-3xl md:text-5xl text-brand-olive-dark mb-4 md:mb-6">
            {title}
          </h1>
          <p className="text-brand-muted text-sm mb-6">Дата обновления: {updatedAt}</p>
          <div className="text-brand-text leading-relaxed text-base md:text-lg">
            {intro}
          </div>
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 space-y-10">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="font-heading text-xl md:text-2xl text-brand-olive-dark mb-4">
                {section.title}
              </h2>
              <div className="space-y-4 text-brand-text leading-relaxed text-sm md:text-base">
                {section.content}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 text-center">
          <p className="text-brand-muted text-sm mb-6">
            По вопросам обработки данных и условий покупки свяжитесь с нами по
            телефону или email, указанным на сайте.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>
      </section>
    </>
  );
}
