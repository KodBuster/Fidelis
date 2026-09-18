import { MetrikaPhoneLink } from "@/components/analytics/MetrikaPhoneLink";
import {
  SITE_EMAIL,
  SITE_EMAIL_MAILTO,
  SITE_PHONE,
  SITE_PHONE_TEL,
} from "@/lib/contacts";

const BENEFITS = [
  "Конкурентные цены",
  "Качество с гарантией",
  "Обновляемый ассортимент с фокусом на спрос",
  "Маркетинговая поддержка в развитии продаж",
];

export function PartnershipPage() {
  return (
    <>
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            ФИДЕЛИС
          </p>
          <h1 className="font-heading text-3xl md:text-5xl text-brand-olive-dark mb-4 md:mb-6">
            Сотрудничество
          </h1>
          <p className="font-heading text-xl md:text-2xl text-brand-olive-dark mb-4">
            Вместе к новым продажам
          </p>
          <p className="text-brand-text leading-relaxed max-w-3xl text-base md:text-lg">
            Приглашаем розничные магазины и партнёров к сотрудничеству.
            Украшения из серебра с ограненными синтетическими алмазами — ассортимент,
            который помогает расти продажам без компромисса в качестве.
          </p>
        </div>
      </section>

      <section className="bg-white text-brand-text border-y border-brand-sand py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-3 text-center">
            Партнёрам
          </p>
          <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-8 md:mb-10 text-center">
            Преимущества сотрудничества с брендом
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {BENEFITS.map((title) => (
              <div
                key={title}
                className="rounded-xl border border-brand-sand bg-brand-surface p-5 md:p-6 min-h-[120px] flex items-center"
              >
                <h3 className="font-heading text-lg md:text-xl text-brand-olive-dark leading-snug">
                  {title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 text-center">
          <p className="text-brand-muted leading-relaxed mb-8">
            Обсудим условия, ассортимент и запуск продаж. Напишите на{" "}
            <a
              href={SITE_EMAIL_MAILTO}
              className="text-brand-terracotta hover:text-brand-terracotta-logo transition-colors"
            >
              {SITE_EMAIL}
            </a>{" "}
            или позвоните.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={SITE_EMAIL_MAILTO}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
            >
              Написать
            </a>
            <MetrikaPhoneLink
              href={SITE_PHONE_TEL}
              className="inline-flex items-center justify-center px-8 py-3.5 border border-brand-olive/30 text-brand-olive-dark hover:border-brand-olive text-sm tracking-widest uppercase transition-colors"
            >
              {SITE_PHONE}
            </MetrikaPhoneLink>
          </div>
        </div>
      </section>
    </>
  );
}
