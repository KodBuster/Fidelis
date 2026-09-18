import Image from "next/image";
import Link from "next/link";
import { MetrikaMapLink } from "@/components/analytics/MetrikaMapLink";
import { MetrikaPhoneLink } from "@/components/analytics/MetrikaPhoneLink";
import { ShowroomBookButton } from "@/components/showroom/ShowroomBookButton";
import {
  SHOWROOM,
  SHOWROOM_MAP_EMBED_URL,
  SHOWROOM_MAP_LINK,
  SITE_EMAIL,
  SITE_EMAIL_MAILTO,
  SITE_PHONE,
  SITE_PHONE_TEL,
} from "@/lib/contacts";

export function ShowroomPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-white border-b border-brand-sand">
        <div className="absolute inset-0">
          <Image
            src="/images/show_room_2.jpg"
            alt="Интерьер ювелирного шоурума ФИДЕЛИС"
            fill
            className="object-cover opacity-50"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-10 py-16 md:py-24">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-3">
            Москва
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-brand-olive-dark mb-6 max-w-2xl leading-tight">
            Шоурум ФИДЕЛИС
          </h1>
          <p className="text-brand-muted text-base md:text-lg max-w-xl leading-relaxed">
            Пространство, где можно увидеть сияние ограненных синтетических алмазов
            вживую, примерить украшения и выбрать изделие без спешки.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="space-y-5 text-brand-text leading-relaxed">
              <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark">
                Добро пожаловать
              </h2>
              <p>
                Мы рады видеть вас в шоуруме «ФИДЕЛИС» — уютном ювелирном
                пространстве в центре Москвы. Здесь можно рассмотреть кольца,
                серьги, колье и браслеты с ограненными синтетическими алмазами,
                оценить огранку и блеск камней при дневном свете и подобрать
                размер.
              </p>
              <p>
                Наши консультанты помогут с выбором, расскажут об особенностях
                ограненных синтетических алмазов и сертификации, а также подскажут, как
                собрать гармоничный комплект украшений. Приходите одной, с
                близким человеком или за подарком — мы создали атмосферу,
                в которой приятно принимать решение о покупке.
              </p>
              <p className="font-heading text-lg md:text-xl text-brand-olive-dark">
                Ждём вас — чтобы вы нашли украшение, которое действительно
                хочется носить каждый день.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
                >
                  Смотреть каталог
                </Link>
                <ShowroomBookButton className="inline-flex items-center justify-center px-8 py-3.5 border border-brand-olive/30 text-brand-olive-dark hover:border-brand-olive text-sm tracking-widest uppercase transition-colors" />
              </div>
            </div>

            <div className="relative aspect-[3/4] w-full">
              <div className="absolute -inset-3 rounded-2xl bg-brand-surface blur-xl" />
              <Image
                src="/images/show_room_2.jpg"
                alt="Интерьер шоурума с витринами украшений"
                fill
                className="object-cover rounded-2xl shadow-lg"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-surface border-y border-brand-olive/10 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-8 md:mb-10 text-center">
            Как нас найти
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-10 md:mb-12">
            <div className="rounded-xl border border-brand-olive/15 bg-brand-surface p-6 md:p-8 text-center md:text-left">
              <p className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mb-3">
                Адрес
              </p>
              <p className="text-brand-olive-dark leading-relaxed">
                {SHOWROOM.address}
              </p>
              <MetrikaMapLink
                href={SHOWROOM_MAP_LINK}
                className="inline-block mt-4 text-sm text-brand-terracotta hover:text-brand-terracotta-logo transition-colors"
              >
                Открыть в Яндекс Картах →
              </MetrikaMapLink>
            </div>

            <div className="rounded-xl border border-brand-olive/15 bg-brand-surface p-6 md:p-8 text-center md:text-left">
              <p className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mb-3">
                Телефон
              </p>
              <MetrikaPhoneLink
                href={SITE_PHONE_TEL}
                className="font-heading text-xl md:text-2xl text-brand-olive-dark hover:text-brand-terracotta transition-colors"
              >
                {SITE_PHONE}
              </MetrikaPhoneLink>
              <p className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mt-5 mb-3">
                Email
              </p>
              <a
                href={SITE_EMAIL_MAILTO}
                className="font-heading text-lg md:text-xl text-brand-olive-dark hover:text-brand-terracotta transition-colors break-all"
              >
                {SITE_EMAIL}
              </a>
              <p className="text-brand-muted text-sm mt-3">
                Напишите или позвоните, чтобы уточнить наличие или договориться о
                визите
              </p>
            </div>

            <div className="rounded-xl border border-brand-olive/15 bg-brand-surface p-6 md:p-8 text-center md:text-left">
              <p className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mb-3">
                Часы работы
              </p>
              <p className="font-heading text-xl md:text-2xl text-brand-olive-dark">
                {SHOWROOM.hours}
              </p>
              <p className="text-brand-muted text-sm mt-3">
                Сб–Вс — выходной. Вход в офис 13
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-brand-olive/15 shadow-lg">
            <iframe
              title="Карта — шоурум ФИДЕЛИС, ул. Гиляровского 40"
              src={SHOWROOM_MAP_EMBED_URL}
              className="w-full h-[360px] md:h-[480px] border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
