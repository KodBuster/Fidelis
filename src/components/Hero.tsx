import Image from "next/image";

const JUNWEX_TICKET_URL =
  "https://www.junwex-msk.ru/posetitelyam/e-ticket.html";

export function Hero() {
  return (
    <section className="relative border-b border-brand-sand bg-white">
      <h1 className="sr-only">
        Синоним — ограненные синтетические алмазы в серебре
      </h1>
      <h2 className="sr-only">
        JUNWEX Москва, 23–27 сентября, стенд A-101, павильон 57
      </h2>

      <a
        href={JUNWEX_TICKET_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Получить пригласительный билет на JUNWEX Москва — стенд Синоним A-101, павильон 57"
        className="group relative block w-full cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent]"
      >
        <div className="relative aspect-[1920/601] w-full overflow-hidden bg-[#c8e6c9]">
          <Image
            src="/images/hero-junwex-banner.jpg"
            alt="JUNWEX Москва, 23–27 сентября, ВДНХ. Стенд Синоним A-101, павильон 57. Получить пригласительный билет."
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
