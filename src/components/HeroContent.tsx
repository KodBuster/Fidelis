import Link from "next/link";
import { BRAND_TAGLINE, BRAND_TAGLINE_CAP } from "@/lib/brand";

type HeroContentProps = {
  className?: string;
};

export function HeroContent({ className = "" }: HeroContentProps) {
  return (
    <div className={className}>
      <p
        className="hero-unroll hidden lg:block text-brand-terracotta text-sm tracking-[0.25em] uppercase mb-4"
        style={{ animationDelay: "0ms" }}
      >
        серебро 925 · камни на выбор
      </p>
      <h1
        className="hero-unroll font-heading text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-6 text-brand-olive-dark"
        style={{ animationDelay: "120ms" }}
      >
        {BRAND_TAGLINE_CAP}
      </h1>
      <p
        className="hero-unroll text-brand-muted text-base md:text-lg max-w-md leading-relaxed mb-8"
        style={{ animationDelay: "240ms" }}
      >
        Украшения из серебра с разными вставками — сдержанный блеск, удобная
        повседневная носка и характер, который выбираете вы.
      </p>
      <div
        className="hero-unroll flex flex-wrap gap-4"
        style={{ animationDelay: "360ms" }}
      >
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
        >
          Смотреть каталог
        </Link>
        <Link
          href="/shipping"
          className="inline-flex items-center justify-center px-8 py-3.5 border border-brand-olive/25 text-brand-text hover:border-brand-terracotta hover:text-brand-terracotta text-sm tracking-widest uppercase transition-colors"
        >
          Доставка и оплата
        </Link>
      </div>
    </div>
  );
}
