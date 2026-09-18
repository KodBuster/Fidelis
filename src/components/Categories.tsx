import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  FeaturedProducts,
  FeaturedProductsFallback,
} from "@/components/FeaturedProducts";
import { getCategoryStats } from "@/lib/catalog-stats";

export async function Categories() {
  const categories = await getCategoryStats();

  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
              Каталог
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-brand-olive-dark">
              Выберите категорию
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm text-brand-terracotta hover:text-brand-terracotta transition-colors tracking-wide"
          >
            Весь каталог →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-16 md:mb-20">
          {categories.map((cat) => {
            const isBracelets =
              cat.slug === "bracelets" || cat.slug === "ankle-bracelets";

            return (
              <Link
                key={cat.href}
                href={cat.href}
                className="group relative flex aspect-[7/4] overflow-hidden rounded-xl bg-brand-surface shadow-sm transition-shadow hover:shadow-md md:aspect-[8/5] touch-manipulation cursor-pointer"
              >
                <div className="flex min-h-0 w-full flex-row">
                  <div className="flex min-w-0 flex-1 flex-col justify-center p-5 md:p-6">
                    <h3 className="font-heading text-2xl md:text-3xl mb-1.5 text-brand-olive-dark">
                      {cat.title}
                    </h3>
                    <p className="text-sm md:text-base text-brand-muted">
                      {cat.countLabel}
                    </p>
                    <p className="text-base md:text-lg text-brand-olive-dark mt-1.5">
                      {cat.priceFromLabel}
                    </p>
                  </div>

                  <div
                    className={`relative h-full shrink-0 overflow-hidden ${
                      isBracelets
                        ? "w-[59%] md:w-[63%] bg-brand-surface"
                        : "w-[42%] md:w-[45%] bg-brand-surface"
                    }`}
                  >
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className={
                        isBracelets
                          ? "object-contain object-center transition-transform duration-500 group-hover:scale-[1.03]"
                          : "object-cover transition-transform duration-500 group-hover:scale-105"
                      }
                      sizes={
                        isBracelets
                          ? "(max-width: 768px) 59vw, 31vw"
                          : "(max-width: 768px) 42vw, 22vw"
                      }
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
              Бестселлеры
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-brand-olive-dark">
              Популярные украшения
            </h2>
          </div>
        </div>

        <Suspense fallback={<FeaturedProductsFallback />}>
          <FeaturedProducts />
        </Suspense>
      </div>
    </section>
  );
}
