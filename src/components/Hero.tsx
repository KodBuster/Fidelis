import Image from "next/image";
import Link from "next/link";
import { BRAND_NAME_CAPS, BRAND_TAGLINE } from "@/lib/brand";

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

export function Hero() {
  return (
    <section className="relative border-b border-brand-sand bg-brand-page">
      <h1 className="sr-only">
        {BRAND_NAME_CAPS} — {BRAND_TAGLINE}
      </h1>

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10 py-10 md:py-14">
        <div className="mb-8 md:mb-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            Подборки
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-brand-olive-dark">
            Коллекции
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {COLLECTIONS.map((collection, index) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-brand-surface shadow-sm transition-shadow hover:shadow-md touch-manipulation cursor-pointer"
            >
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                priority={index < 2}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-olive-dark/70 via-brand-olive-dark/10 to-transparent" />
              <h3 className="absolute bottom-0 left-0 right-0 p-3 md:p-5 font-heading text-base md:text-xl text-[#F4F5F7]">
                {collection.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
