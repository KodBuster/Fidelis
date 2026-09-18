import Image from "next/image";
import Link from "next/link";
import { WarrantyFaq } from "@/components/warranty/WarrantyFaq";

const WARRANTY_POINTS = [
  {
    title: "Добровольная аттестация",
    text: "При необходимости мы проводим добровольную аттестацию изделий. Это подтверждает характеристики украшений из серебра 925 и качество ювелирной работы.",
  },
  {
    title: "Сертификат",
    text: "По результатам аттестации выдаётся официальный документ с описанием изделия, металла и параметров конкретной модели.",
  },
  {
    title: "Гарантия 2 года",
    text: "На все изделия действует гарантия производителя сроком 2 года. При необходимости наши специалисты выполнят ремонт или профессиональную полировку украшения.",
  },
];

export function WarrantyPage() {
  return (
    <>
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            ФИДЕЛИС
          </p>
          <h1 className="font-heading text-3xl md:text-5xl text-brand-olive-dark mb-6 md:mb-8">
            Гарантия
          </h1>
          <p className="text-brand-text leading-relaxed max-w-3xl text-base md:text-lg">
            На все украшения ФИДЕЛИС действует гарантия производителя. При
            необходимости мы подтверждаем характеристики серебра&nbsp;925 и
            качество ювелирной работы документально.
          </p>
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 lg:items-stretch">
            <div className="space-y-5">
              {WARRANTY_POINTS.map((point) => (
                <div
                  key={point.title}
                  className="rounded-xl border border-brand-olive/15 bg-brand-surface p-6 md:p-8"
                >
                  <h2 className="font-heading text-xl md:text-2xl text-brand-olive-dark mb-3">
                    {point.title}
                  </h2>
                  <p className="text-brand-text leading-relaxed">{point.text}</p>
                </div>
              ))}
            </div>

            <div className="relative w-full max-w-lg mx-auto lg:max-w-none aspect-[3/4] lg:aspect-auto lg:h-full lg:min-h-0">
              <div className="absolute -inset-3 rounded-2xl bg-brand-surface blur-xl" />
              <Image
                src="/images/warranty-certificate.png"
                alt="Аттестат партии ювелирных изделий ФИДЕЛИС"
                fill
                className="object-contain object-top rounded-2xl shadow-lg bg-white"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>

          <p className="text-brand-muted text-sm text-center lg:text-left mt-4 leading-relaxed lg:grid lg:grid-cols-2 lg:gap-16">
            <span className="hidden lg:block" aria-hidden />
            <span>
              Пример аттестата партии ювелирных изделий с указанием
              характеристик украшений из серебра
            </span>
          </p>
        </div>
      </section>

      <WarrantyFaq />

      <section className="bg-white text-brand-text border-y border-brand-sand py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 text-center">
          <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-5">
            Качество, которому можно доверять
          </h2>
          <p className="text-brand-muted leading-relaxed mb-8">
            Украшения ФИДЕЛИС из серебра 925 сопровождаются информацией о
            металле и характеристиках модели. Аттестация и гарантия — наш способ
            быть максимально открытыми перед вами.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
            >
              Смотреть каталог
            </Link>
            <Link
              href="/cooperation"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-brand-olive/25 text-brand-text hover:border-brand-terracotta hover:text-brand-terracotta text-sm tracking-widest uppercase transition-colors"
            >
              Сотрудничество
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
