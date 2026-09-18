import Image from "next/image";
import { BRAND_NAME_CAPS, BRAND_TAGLINE } from "@/lib/brand";

const JUNWEX_TICKET_URL =
  "https://www.junwex-msk.ru/posetitelyam/e-ticket.html";

const BANNER_ALT =
  "JUNWEX Москва, 23–27 сентября, ВДНХ. Стенд ФИДЕЛИС A-101, павильон 57. Получить пригласительный билет.";

export function Hero() {
  return (
    <section className="relative border-b border-brand-sand bg-white">
      <h1 className="sr-only">
        {BRAND_NAME_CAPS} — {BRAND_TAGLINE}
      </h1>
      <h2 className="sr-only">
        JUNWEX Москва, 23–27 сентября, стенд A-101, павильон 57
      </h2>

      <a
        href={JUNWEX_TICKET_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Получить пригласительный билет на JUNWEX Москва — стенд ФИДЕЛИС A-101, павильон 57"
        className="group relative block w-full cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent]"
      >
        {/* Mobile / tablet portrait: vertical 3:4 */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#c8e6c9] md:hidden">
          <Image
            src="/images/hero-junwex-banner-mobile.jpg"
            alt={BANNER_ALT}
            width={4500}
            height={6000}
            priority
            sizes="100vw"
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-95 group-active:opacity-90"
          />
        </div>

        {/* Desktop / tablet landscape: horizontal banner */}
        <div className="relative hidden aspect-[1920/601] w-full overflow-hidden bg-[#c8e6c9] md:block">
          <Image
            src="/images/hero-junwex-banner.jpg"
            alt={BANNER_ALT}
            width={1920}
            height={601}
            priority
            sizes="100vw"
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-95 group-active:opacity-90"
          />
        </div>
      </a>
    </section>
  );
}
