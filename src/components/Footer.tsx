import Image from "next/image";
import Link from "next/link";
import { MetrikaPhoneLink } from "@/components/analytics/MetrikaPhoneLink";
import {
  SITE_EMAIL,
  SITE_EMAIL_MAILTO,
  SITE_PHONE,
  SITE_PHONE_TEL,
} from "@/lib/contacts";

const FOOTER_LINKS = {
  catalog: [
    { label: "Кольца", href: "/shop/rings" },
    { label: "Браслеты на ногу", href: "/shop/ankle-bracelets" },
    { label: "Браслеты на руку", href: "/shop/bracelets" },
    { label: "Колье", href: "/shop/necklaces" },
    { label: "Подвески", href: "/shop/pendants" },
    { label: "Серьги", href: "/shop/earrings" },
    { label: "Шнурки", href: "/shop/cords" },
  ],
  info: [
    { label: "Сотрудничество", href: "/cooperation" },
    { label: "Гид покупателя", href: "/guide" },
    { label: "Доставка и оплата", href: "/shipping" },
    { label: "Гарантия", href: "/warranty" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white text-brand-text border-t border-brand-terracotta mt-auto">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4 shrink-0">
              <Image
                src="/images/logo_20260527190756.png"
                alt="ФИДЕЛИС"
                width={1000}
                height={150}
                className="h-7 w-auto max-w-none object-contain brightness-0"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed max-w-xs">
              ограненные синтетические алмазы в серебре — современный подход к украшениям
              без компромиссов в качестве.
            </p>
          </div>

          <div>
            <h4 className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mb-4">
              Каталог
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.catalog.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-text hover:text-brand-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mb-4">
              Покупателям
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-text hover:text-brand-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mb-4">
              Контакты
            </h4>
            <MetrikaPhoneLink
              href={SITE_PHONE_TEL}
              className="block text-sm text-brand-terracotta hover:text-brand-terracotta-logo transition-colors mb-2"
            >
              {SITE_PHONE}
            </MetrikaPhoneLink>
            <a
              href={SITE_EMAIL_MAILTO}
              className="block text-sm text-brand-terracotta hover:text-brand-terracotta-logo transition-colors mb-4"
            >
              {SITE_EMAIL}
            </a>
            <p className="text-sm text-brand-muted leading-relaxed">
              ООО «ФИДЕЛИС»
              <br />
              ИНН 6154152484
              <br />
              ОГРН 1186196020152
            </p>
          </div>
        </div>

        <div className="border-t border-brand-sand mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs text-brand-muted">
          <div className="flex flex-col gap-2 sm:gap-1">
            <p>© 2026 ФИДЕЛИС. Все права защищены.</p>
            <p>
              Разработка Digital Агентство{" "}
              <a
                href="https://kodbuster.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-text hover:text-brand-terracotta transition-colors"
              >
                KodBuster
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-brand-text transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="hover:text-brand-text transition-colors">
              Оферта
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
