import Link from "next/link";
import { FaqSection } from "@/components/seo/FaqSection";
import {
  SITE_PHONE,
  SITE_PHONE_TEL,
} from "@/lib/contacts";
import { SIZE_FAQ_ITEMS } from "@/lib/size-faq";

const METHODS = [
  {
    title: "По готовому кольцу",
    text: "Измерьте внутренний диаметр кольца, которое вам уже подходит: приложите линейку к центру кольца и снимите расстояние между внутренними краями в миллиметрах. Полученное число — ваш размер.",
    highlight: true,
  },
  {
    title: "Обмер пальца ниткой",
    text: "Обмотайте палец (в том месте, где будет кольцо) полоской бумаги или ниткой без туго натягивая. Отметьте длину окружности, измерьте линейкой и разделите на 3,14 — так получите диаметр и размер кольца.",
  },
  {
    title: "Пластиковая кольцемерная линейка",
    text: "Надёжный вариант для дома — тонкая измерительная линейка-шкала из ювелирного магазина. Наденьте на палец и считайте показание на стыке — это и есть ваш размер.",
  },
];

const SIZE_TABLE = [
  { size: "15", diameter: "15,0", circumference: "47,1" },
  { size: "15,5", diameter: "15,5", circumference: "48,7" },
  { size: "16", diameter: "16,0", circumference: "50,3" },
  { size: "16,5", diameter: "16,5", circumference: "51,9" },
  { size: "17", diameter: "17,0", circumference: "53,4" },
  { size: "17,5", diameter: "17,5", circumference: "55,0" },
  { size: "18", diameter: "18,0", circumference: "56,5" },
  { size: "18,5", diameter: "18,5", circumference: "58,1" },
  { size: "19", diameter: "19,0", circumference: "59,7" },
  { size: "19,5", diameter: "19,5", circumference: "61,3" },
  { size: "20", diameter: "20,0", circumference: "62,8" },
  { size: "20,5", diameter: "20,5", circumference: "64,4" },
  { size: "21", diameter: "21,0", circumference: "66,0" },
];

const TIPS = [
  "Измеряйте палец в конце дня — к вечеру он чуть шире, чем утром.",
  "Учитывайте, на какой руке будете носить кольцо: на ведущей руке палец обычно толще.",
  "Широкие кольца и модели с высоким ободком сидят плотнее — часто выбирают на 0,5 размера больше.",
  "Если размер между двумя значениями, лучше взять больший — тесное кольцо носить некомфортно.",
  "При отёках, беременности или активном спорте размер может меняться — в сомнительных случаях приходите на примерку.",
];

export function HowSizeRingPage() {
  return (
    <>
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            ФИДЕЛИС
          </p>
          <h1 className="font-heading text-3xl md:text-5xl text-brand-olive-dark mb-6 md:mb-8">
            Как определить размер
          </h1>
          <p className="text-brand-text leading-relaxed max-w-3xl text-base md:text-lg">
            Правильный размер кольца или браслета — это комфорт каждый день.
            В России размер кольца соответствует внутреннему диаметру ободка
            в миллиметрах: если диаметр 17&nbsp;мм, ваш размер&nbsp;— 17.
          </p>
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-6 md:mb-8">
            Способы определить размер
          </h2>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {METHODS.map((method) => (
              <div
                key={method.title}
                className={`rounded-xl border p-6 md:p-8 ${
                  method.highlight
                    ? "border-brand-olive/30 bg-brand-surface"
                    : "border-brand-olive/15 bg-brand-surface"
                }`}
              >
                <h3 className="font-heading text-xl md:text-2xl text-brand-olive-dark mb-3">
                  {method.title}
                </h3>
                <p className="text-brand-text leading-relaxed">{method.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-surface py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-3">
            Таблица размеров колец
          </h2>
          <p className="text-brand-muted text-sm md:text-base leading-relaxed mb-8 max-w-3xl">
            Ориентир для российской размерной сетки. Окружность пальца рассчитана
            по формуле π × диаметр.
          </p>

          <div className="overflow-x-auto rounded-xl border border-brand-olive/15 bg-white">
            <table className="w-full min-w-[480px] text-sm md:text-base">
              <thead>
                <tr className="border-b border-brand-sand bg-brand-surface text-left">
                  <th className="px-4 py-3 md:px-6 md:py-4 font-heading text-brand-olive-dark">
                    Размер
                  </th>
                  <th className="px-4 py-3 md:px-6 md:py-4 font-heading text-brand-olive-dark">
                    Диаметр, мм
                  </th>
                  <th className="px-4 py-3 md:px-6 md:py-4 font-heading text-brand-olive-dark">
                    Окружность пальца, мм
                  </th>
                </tr>
              </thead>
              <tbody>
                {SIZE_TABLE.map((row, index) => (
                  <tr
                    key={row.size}
                    className={
                      index % 2 === 0 ? "bg-white" : "bg-brand-surface/60"
                    }
                  >
                    <td className="px-4 py-3 md:px-6 md:py-3.5 text-brand-text font-medium">
                      {row.size}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-3.5 text-brand-muted">
                      {row.diameter}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-3.5 text-brand-muted">
                      {row.circumference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-6">
                Полезные советы
              </h2>
              <ul className="space-y-4">
                {TIPS.map((tip) => (
                  <li
                    key={tip}
                    className="flex gap-3 text-brand-text leading-relaxed"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-terracotta" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-brand-olive/15 bg-brand-surface p-6 md:p-8">
              <h2 className="font-heading text-xl md:text-2xl text-brand-olive-dark mb-4">
                Размер браслета
              </h2>
              <p className="text-brand-text leading-relaxed mb-4">
                Для браслета измерьте окружность запястья в самом широком месте
                и добавьте 1–2&nbsp;см на свободный ход — так украшение не
                будет передавливать и не будет слишком свободно.
              </p>
              <p className="text-brand-muted text-sm leading-relaxed">
                Если сомневаетесь, запишите обмер запястья и укажите его при
                заказе — мы поможем подобрать длину или подскажем подходящий
                размер по модели.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FaqSection
        title="Частые вопросы о размере"
        subtitle="Как измерить кольцо и браслет дома или в шоуруме"
        items={SIZE_FAQ_ITEMS}
      />

      <section className="bg-white text-brand-text border-y border-brand-sand py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 text-center">
          <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-4">
            Нужна помощь с размером?
          </h2>
          <p className="text-brand-muted leading-relaxed mb-8">
            Напишите или позвоните нам — подскажем по вашим замерам. Телефон{" "}
            <a
              href={SITE_PHONE_TEL}
              className="text-brand-terracotta hover:text-white transition-colors"
            >
              {SITE_PHONE}
            </a>
            .
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/messengers"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
            >
              Написать нам
            </Link>
            <Link
              href="/shop/rings"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-white/25 text-brand-terracotta hover:border-white/50 text-sm tracking-widest uppercase transition-colors"
            >
              Кольца в каталоге
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
