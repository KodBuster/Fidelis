import Image from "next/image";
import Link from "next/link";

const PILLARS = [
  {
    title: "Сияние на каждый день",
    text: "Яркий блеск ограненных синтетических алмазов в оправе из серебра — для повседневного образа",
  },
  {
    title: "Гарантия качества",
    text: "Принимаем участие в добровольной аттестации качества ювелирных украшений и даем гарантию на изделия 2 года",
  },
  {
    title: "Воспоминания, которые не тускнеют",
    text: "Покрытие родием — главный секрет долговечности и премиального вида наших серебряных украшений",
  },
  {
    title: "20 лет экспертизы в ювелирном деле",
    text: "Контролируем каждый этап — от чистоты сплава до закрепки камней, чтобы вы получали безупречные украшения",
  },
  {
    title: "Вау-цена",
    text: "Позвольте себе больше – собирайте свои стильные комплекты и сияйте каждый день!",
  },
  {
    title: "Ограненные синтетические алмазы",
    text: "Современные вставки с аккуратной огранкой и сдержанным блеском — без лишних обещаний, только украшение",
  },
  {
    title: "От спортзала до красной дорожки",
    text: "Забудьте про дресс-код. Наши украшения созданы для жизни, а не для сейфа. Носите с любимым спортивным костюмом или вечерним шелком.",
  },
];

export function AboutPage() {
  return (
    <>
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            ФИДЕЛИС
          </p>
          <h1 className="font-heading text-3xl md:text-5xl text-brand-olive-dark mb-8 md:mb-10">
            О бренде
          </h1>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="space-y-5 text-brand-text leading-relaxed">
              <p className="font-heading text-xl md:text-2xl text-brand-olive-dark">
                Не жди повода! Каждый день твой!
              </p>
              <p>
                ФИДЕЛИС — это российский ювелирный бренд, создающий украшения
                из серебра с ограненными синтетическими алмазами. Основанный на
                стыке инновационных технологий и экспертизы, бренд ФИДЕЛИС
                делает премиальную красоту легкой, понятной и доступной,
                стирая границы между торжественным выходом и повседневным
                стилем. Серебряные украшения с ограненными синтетическими
                алмазами — универсальный выбор: блеск серебра и игра света
                вставок подходят под любой стиль одежды, от вечернего платья до
                повседневных джинсов с футболкой.
              </p>
              <p>
                ФИДЕЛИС создан для тех, кто выбирает современные украшения и
                ценит честную подачу: металл, огранка и масса вставки в граммах
                — без лишних обещаний.
              </p>
              <p>
                Забудьте о трендах — выбирайте то, что созвучно вам. ФИДЕЛИС —
                это украшения вне времени, транслирующие чистый вкус. Это не
                способ удивить толпу, это ваш личный диалог с собой.
              </p>
              <p className="font-heading text-xl md:text-2xl text-brand-olive-dark">
                ФИДЕЛИС-ФИДЕЛИС твоей индивидуальности.
              </p>
            </div>

            <div className="relative aspect-square max-w-md mx-auto lg:max-w-none lg:ml-auto w-full">
              <div className="absolute -inset-3 rounded-2xl bg-brand-surface blur-xl" />
              <Image
                src="/images/product-ring.webp"
                alt="Браслет ФИДЕЛИС с ограненными синтетическими алмазами"
                fill
                className="object-contain rounded-2xl shadow-lg bg-white p-4 md:p-6"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-brand-text border-y border-brand-sand py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-8 text-center">
            Уникальная концепция
          </p>

          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
            <p className="font-heading text-4xl md:text-5xl tracking-[0.15em] text-brand-olive-dark mb-4">
              ФИДЕЛИС
            </p>
            <p className="text-lg md:text-xl text-brand-text mb-3">
              Украшения из серебра с ограненными синтетическими алмазами
            </p>
            <p className="text-brand-muted leading-relaxed">
              Сочетаем ювелирные тренды и современные технологии, делая
              изысканные украшения ближе и доступнее
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {PILLARS.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-brand-sand bg-brand-surface p-5 md:p-6 min-h-[180px]"
              >
                <h3 className="font-heading text-lg md:text-xl text-brand-olive-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-brand-muted text-sm md:text-base leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
          >
            Смотреть каталог
          </Link>
          <Link
            href="/showroom"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-brand-olive/30 text-brand-olive-dark hover:border-brand-olive text-sm tracking-widest uppercase transition-colors"
          >
            Примерить в шоуруме
          </Link>
        </div>
      </section>
    </>
  );
}
