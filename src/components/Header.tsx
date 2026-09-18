"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CartLink } from "@/components/cart/CartLink";
import { CompareLink } from "@/components/compare/CompareLink";
import { FavoritesLink } from "@/components/favorites/FavoritesLink";
import { MetrikaPhoneLink } from "@/components/analytics/MetrikaPhoneLink";
import { SearchForm } from "@/components/search/SearchForm";
import {
  SITE_EMAIL,
  SITE_EMAIL_MAILTO,
  SITE_PHONE,
  SITE_PHONE_TEL,
} from "@/lib/contacts";

const NAV_ITEMS = [
  { label: "Кольца", href: "/shop/rings" },
  { label: "Браслеты на ногу", href: "/shop/ankle-bracelets" },
  { label: "Браслеты на руку", href: "/shop/bracelets" },
  { label: "Колье", href: "/shop/necklaces" },
  { label: "Подвески", href: "/shop/pendants" },
  { label: "Серьги", href: "/shop/earrings" },
  { label: "Шнурки", href: "/shop/cords" },
];

const iconButtonClass =
  "relative z-[2] inline-flex cursor-pointer touch-manipulation text-brand-olive-dark hover:text-brand-terracotta transition-colors";

function IconSearch({ className = "size-6 lg:size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MobileSearchLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/search"
      className={`${iconButtonClass} ${className || "p-2 sm:p-2.5"}`}
      aria-label="Поиск"
    >
      <IconSearch />
    </Link>
  );
}

function DesktopSearchToggle({
  searchOpen,
  onSearchToggle,
}: {
  searchOpen: boolean;
  onSearchToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`${iconButtonClass} p-2 sm:p-2.5`}
      aria-label={searchOpen ? "Закрыть поиск" : "Поиск"}
      aria-expanded={searchOpen}
      aria-controls="header-search"
      onClick={onSearchToggle}
    >
      <IconSearch />
    </button>
  );
}

function HeaderActions({
  searchOpen,
  onSearchToggle,
}: {
  searchOpen: boolean;
  onSearchToggle: () => void;
}) {
  return (
    <>
      <DesktopSearchToggle
        searchOpen={searchOpen}
        onSearchToggle={onSearchToggle}
      />
      <FavoritesLink />
      <CompareLink />
      <CartLink />
    </>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className={`relative z-0 flex flex-col group shrink-0 ${
        compact ? "items-center" : "items-center md:items-start"
      }`}
    >
      <Image
        src="/images/logo_20260527190756.png"
        alt="ФИДЕЛИС"
        width={1000}
        height={150}
        priority
        className={`logo-header-olive block max-w-none object-contain ${
          compact ? "h-5 w-[6.5rem] sm:w-28" : "h-7 w-36 md:h-8 md:w-40"
        }`}
      />
      {!compact && (
        <span className="hidden sm:block text-[10px] md:text-xs text-brand-muted tracking-wide mt-1 text-center md:text-left">
          ограненные синтетические алмазы в серебре
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!searchOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [searchOpen]);

  const toggleDesktopSearch = useCallback(() => {
    setSearchOpen((open) => !open);
  }, []);

  return (
    <header className="sticky top-0 z-[100] border-b border-brand-terracotta bg-brand-surface">
      <div className="hidden md:flex justify-between items-center px-6 lg:px-10 py-2 text-xs text-brand-muted border-b border-brand-sand">
        <div className="flex gap-6">
          <Link href="/shipping" className="hover:text-brand-terracotta transition-colors">
            Доставка и оплата
          </Link>
          <Link href="/cooperation" className="hover:text-brand-terracotta transition-colors">
            Сотрудничество
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={SITE_EMAIL_MAILTO}
            className="hover:text-brand-terracotta transition-colors"
          >
            {SITE_EMAIL}
          </a>
          <MetrikaPhoneLink
            href={SITE_PHONE_TEL}
            className="hover:text-brand-terracotta transition-colors"
          >
            {SITE_PHONE}
          </MetrikaPhoneLink>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-10 py-1 md:py-3 lg:py-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center -mx-4 px-0 md:-mx-6 lg:mx-0 lg:hidden">
          <div className="relative z-[2] flex items-center justify-start min-w-0">
            <Link
              href="/menu"
              className={`${iconButtonClass} py-2 pl-3 pr-0.5 shrink-0`}
              aria-label="Открыть меню"
            >
              <IconMenu />
            </Link>
            <MobileSearchLink className="py-2 px-0.5" />
          </div>

          <div className="relative z-0 flex justify-center px-2 sm:px-3">
            <Logo compact />
          </div>

          <div className="relative z-[2] flex items-center justify-end min-w-0">
            <FavoritesLink className="touch-manipulation py-2 pl-2 pr-0.5" />
            <CartLink className="touch-manipulation py-2 pl-0.5 pr-3" />
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between gap-4">
          <Logo />

          <nav className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm tracking-wide text-brand-text hover:text-brand-terracotta transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <HeaderActions
              searchOpen={searchOpen}
              onSearchToggle={toggleDesktopSearch}
            />
          </div>
        </div>

        {searchOpen && (
          <div
            id="header-search"
            className="relative z-[2] hidden lg:block lg:absolute lg:left-0 lg:right-0 lg:top-full lg:border-b lg:border-brand-olive/10 lg:bg-brand-surface lg:px-10 lg:py-4 lg:shadow-sm"
          >
            <div className="mx-auto max-w-xl lg:max-w-2xl">
              <SearchForm
                autoFocus
                compact
                onSubmit={() => setSearchOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
