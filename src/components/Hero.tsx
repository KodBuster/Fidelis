import Image from "next/image";
import Link from "next/link";
import { BRAND_NAME_CAPS, BRAND_TAGLINE } from "@/lib/brand";

const BANNER_ALT = `${BRAND_NAME_CAPS} — ${BRAND_TAGLINE}`;

/** Versioned paths: /images/* is Cache-Control immutable (1y). */
const HERO_BANNER_MOBILE = "/images/hero-fidelis-banner-mobile-v2.jpg";
const HERO_BANNER_DESKTOP = "/images/hero-fidelis-banner-v2.jpg";

export function Hero() {
  return (
    <section className="relative border-b border-brand-sand bg-brand-page">
      <h1 className="sr-only">
        {BRAND_NAME_CAPS} — {BRAND_TAGLINE}
      </h1>

      <Link
        href="/shop"
        aria-label="Перейти в каталог украшений ФИДЕЛИС"
        className="group relative block w-full cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent]"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-page md:hidden">
          <Image
            src={HERO_BANNER_MOBILE}
            alt={BANNER_ALT}
            width={1536}
            height={2048}
            priority
            sizes="100vw"
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-95 group-active:opacity-90"
          />
        </div>

        <div className="relative hidden aspect-[16/9] w-full overflow-hidden bg-brand-page md:block">
          <Image
            src={HERO_BANNER_DESKTOP}
            alt={BANNER_ALT}
            width={1376}
            height={768}
            priority
            sizes="100vw"
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-95 group-active:opacity-90"
          />
        </div>
      </Link>
    </section>
  );
}
