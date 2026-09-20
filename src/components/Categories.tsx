import Image from "next/image";
import Link from "next/link";
import { getCategoryStats } from "@/lib/catalog-stats";

const COLLECTIONS = [
  {
    title: "Коллекция 1",
    href: "/shop?collection=1",
    image: "/images/product-ring.webp",
  },
  {
    title: "Коллекция 2",
    href: "/shop?collection=2",
    image: "/images/product-earrings.webp",
  },
  {
    title: "Коллекция 3",
    href: "/shop?collection=3",
    image: "/images/product-necklace.webp",
  },
  {
    title: "Коллекция 4",
    href: "/shop?collection=4",
    image: "/images/product-bracelet.webp",
  },
  {
    title: "Коллекция 5",
    href: "/shop?collection=5",
    image: "/images/product-ring.webp",
  },
  {
    title: "Коллекция 6",
    href: "/shop?collection=6",
    image: "/images/product-earrings.webp",
  },
] as const;

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
              Подборки
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-brand-olive-dark">
              Коллекции
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {COLLECTIONS.map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-brand-surface shadow-sm transition-shadow hover:shadow-md touch-manipulation cursor-pointer"
            >
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-olive-dark/70 via-brand-olive-dark/10 to-transparent" />
              <h3 className="absolute bottom-0 left-0 right-0 p-4 md:p-5 font-heading text-lg md:text-xl text-[#F4F5F7]">
                {collection.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
