import Link from "next/link";
import { FaqSection } from "@/components/seo/FaqSection";
import { SITE_PHONE, SITE_PHONE_TEL } from "@/lib/contacts";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/checkout";
import { SHIPPING_FAQ_ITEMS } from "@/lib/shipping-faq";

const DELIVERY_OPTIONS = [
  {
    title: "СДЭК",
    text: "Доставляем заказы по России через службу СДЭК — до пункта выдачи или курьером до двери. Срок и стоимость рассчитываются при оформлении заказа в зависимости от города и выбранного тарифа.",
    note: `Бесплатная доставка при заказе от ${FREE_DELIVERY_THRESHOLD.toLocaleString("ru-RU")} ₽. При меньшей сумме — ${DELIVERY_FEE.toLocaleString("ru-RU")} ₽.`,
  },
];

const PAYMENT_OPTIONS = [
  {
    title: "Оплата по счету",
    items: [
      "После оформления заказа менеджер выставит счёт",
      "Оплата по реквизитам юридического лица",
      "Отгрузка после поступления оплаты",
    ],
  },
];

export function ShippingPage() {
  return (
    <>
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            Фиделис
          </p>
          <h1 className="font-heading text-3xl md:text-5xl text-brand-olive-dark mb-6 md:mb-8">
            Доставка и оплата
          </h1>
          <p className="text-brand-text leading-relaxed max-w-3xl text-base md:text-lg">
            Доставляем заказы службой СДЭК по России. Оплата — по счёту после
            подтверждения заказа менеджером.
          </p>
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-6 md:mb-8">
            Доставка
          </h2>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6 mb-8">
            {DELIVERY_OPTIONS.map((option) => (
              <div
                key={option.title}
                className="rounded-xl border border-brand-olive/15 bg-brand-surface p-6 md:p-8"
              >
                <h3 className="font-heading text-xl md:text-2xl text-brand-olive-dark mb-3">
                  {option.title}
                </h3>
                <p className="text-brand-text leading-relaxed mb-4">
                  {option.text}
                </p>
                <p className="text-brand-muted text-sm leading-relaxed">
                  {option.note}
                </p>
              </div>
            ))}
          </div>

          <p className="text-brand-muted text-sm leading-relaxed max-w-3xl">
            После оформления заказа менеджер свяжется с вами по телефону{" "}
            <a
              href={SITE_PHONE_TEL}
              className="text-brand-terracotta hover:text-brand-terracotta-logo transition-colors"
            >
              {SITE_PHONE}
            </a>{" "}
            для подтверждения деталей доставки СДЭК.
          </p>
        </div>
      </section>

      <section className="bg-white text-brand-text border-y border-brand-sand py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-6 md:mb-8">
            Оплата
          </h2>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6 mb-10">
            {PAYMENT_OPTIONS.map((option) => (
              <div
                key={option.title}
                className="rounded-xl border border-brand-sand bg-brand-surface p-6 md:p-8"
              >
                <h3 className="font-heading text-xl md:text-2xl text-brand-olive-dark mb-4">
                  {option.title}
                </h3>
                <ul className="space-y-3">
                  {option.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-brand-muted text-sm md:text-base leading-relaxed"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-sand" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
            >
              В каталог
            </Link>
            <a
              href={SITE_PHONE_TEL}
              className="inline-flex items-center justify-center px-8 py-3.5 border border-brand-olive/30 text-brand-olive-dark hover:border-brand-olive text-sm tracking-widest uppercase transition-colors"
            >
              Позвонить
            </a>
          </div>
        </div>
      </section>

      <FaqSection
        items={SHIPPING_FAQ_ITEMS}
        title="Вопросы о доставке и оплате"
      />
    </>
  );
}
