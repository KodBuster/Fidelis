import Image from "next/image";
import Link from "next/link";
import { MetrikaPhoneLink } from "@/components/analytics/MetrikaPhoneLink";
import {
  SITE_EMAIL,
  SITE_EMAIL_MAILTO,
  SITE_PHONE,
  SITE_PHONE_TEL,
} from "@/lib/contacts";
import { BRAND_LOGO_LIGHT_SRC, BRAND_NAME_CAPS, BRAND_TAGLINE } from "@/lib/brand";

const FOOTER_LINKS = {
  info: [
    { label: "Сотрудничество", href: "/cooperation" },
    { label: "Гид покупателя", href: "/guide" },
    { label: "Доставка и оплата", href: "/shipping" },
    { label: "Гарантия", href: "/warranty" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-brand-olive/35 bg-brand-olive-dark text-[#F4F5F7]">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <div>
            <Link href="/" className="mb-2 inline-block shrink-0">
              <Image
                src={BRAND_LOGO_LIGHT_SRC}
                alt={BRAND_NAME_CAPS}
                width={1210}
                height={172}
                className="h-6 w-auto max-w-none object-contain"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="text-xs leading-snug max-w-xs text-[#F4F5F7]/65">
              {BRAND_TAGLINE} — современный подход к украшениям без компромиссов
              в качестве.
            </p>
          </div>

          <div>
            <h4 className="text-brand-olive text-[10px] tracking-[0.2em] uppercase mb-2">
              Покупателям
            </h4>
            <ul className="space-y-1">
              {FOOTER_LINKS.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[#F4F5F7]/85 hover:text-brand-olive transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-brand-olive text-[10px] tracking-[0.2em] uppercase mb-2">
              Контакты
            </h4>
            <MetrikaPhoneLink
              href={SITE_PHONE_TEL}
              className="block text-xs text-brand-olive hover:text-[#F4F5F7] transition-colors mb-1"
            >
              {SITE_PHONE}
            </MetrikaPhoneLink>
            <a
              href={SITE_EMAIL_MAILTO}
              className="block text-xs text-brand-olive hover:text-[#F4F5F7] transition-colors mb-2"
            >
              {SITE_EMAIL}
            </a>
            <p className="text-xs leading-snug text-[#F4F5F7]/65">
              ООО «ТЕРРА»
              <br />
              ИНН 6154152484
              <br />
              ОГРН 1186196020152
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-5 pt-3 flex flex-col sm:flex-row justify-between gap-2 text-[11px] text-[#F4F5F7]/55">
          <div className="flex flex-col gap-1 sm:gap-0.5">
            <p>© 2026 ФИДЕЛИС. Все права защищены.</p>
            <p>
              Разработка Digital Агентство{" "}
              <a
                href="https://kodbuster.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F4F5F7]/85 hover:text-brand-olive transition-colors"
              >
                KodBuster
              </a>
            </p>
          </div>
          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="hover:text-brand-olive transition-colors"
            >
              Политика конфиденциальности
            </Link>
            <Link
              href="/terms"
              className="hover:text-brand-olive transition-colors"
            >
              Оферта
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
