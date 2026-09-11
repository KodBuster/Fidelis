"use client";

import Link from "next/link";
import {
  CATEGORIES,
  PRICE_RANGES,
  RING_BRACELET_SIZES,
  SORT_OPTIONS,
  type CategorySlug,
} from "@/lib/products";
import {
  buildFilterQuery,
  countActiveFilters,
  shouldShowSizeFilter,
  type CatalogFilters as Filters,
} from "@/lib/catalog-utils";
type CatalogFiltersProps = {
  filters: Filters;
  basePath: string;
  onClose?: () => void;
};

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-brand-olive/10 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <h3 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CheckboxItem({
  id,
  label,
  checked,
  href,
}: {
  id: string;
  label: string;
  checked: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className="flex touch-manipulation items-center gap-3 py-1.5 group [-webkit-tap-highlight-color:transparent]"
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
          checked
            ? "bg-brand-terracotta border-brand-olive"
            : "border-brand-olive/30 group-hover:border-brand-olive"
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2 6l3 3 5-5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className={`text-sm ${
          checked ? "text-brand-olive-dark font-medium" : "text-brand-text"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

function formatSizeLabel(size: number): string {
  return Number.isInteger(size) ? String(size) : size.toFixed(1).replace(".", ",");
}

export function CatalogFilters({
  filters,
  basePath,
  onClose,
}: CatalogFiltersProps) {
  const activeCount = countActiveFilters(filters);
  const showSizeFilter = shouldShowSizeFilter(filters.category);

  const togglePrice = (id: string) => {
    const next = filters.priceRanges.includes(id)
      ? filters.priceRanges.filter((p) => p !== id)
      : [...filters.priceRanges, id];
    return buildFilterQuery(filters, { priceRanges: next });
  };

  const toggleSize = (id: string) => {
    const next = filters.sizes.includes(id)
      ? filters.sizes.filter((size) => size !== id)
      : [...filters.sizes, id];
    return buildFilterQuery(filters, { sizes: next });
  };

  const toggleComplects = () =>
    buildFilterQuery(filters, { complectsOnly: !filters.complectsOnly });

  const categoryHref = (slug: CategorySlug | null) => {
    const path = slug ? `/shop/${slug}` : "/shop";
    const query = buildFilterQuery({ ...filters, category: slug ?? undefined }, {});
    return `${path}${query}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h2 className="font-heading text-xl text-brand-olive-dark">Фильтры</h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="touch-manipulation p-2 text-brand-muted transition-colors hover:text-brand-terracotta [-webkit-tap-highlight-color:transparent]"
            aria-label="Закрыть фильтры"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>

      <FilterSection title="Категория">
        <div className="space-y-1">
          <CheckboxItem
            id="all"
            label="Все украшения"
            checked={!filters.category}
            href={categoryHref(null)}
          />
          {(Object.keys(CATEGORIES) as CategorySlug[]).map((slug) => (
            <CheckboxItem
              key={slug}
              id={slug}
              label={CATEGORIES[slug].title}
              checked={filters.category === slug}
              href={categoryHref(slug)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Комплекты">
        <div className="space-y-1">
          <CheckboxItem
            id="complects"
            label="Комплекты"
            checked={filters.complectsOnly}
            href={`${basePath}${toggleComplects()}`}
          />
        </div>
      </FilterSection>

      <FilterSection title="Цена">
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <CheckboxItem
              key={range.id}
              id={range.id}
              label={range.label}
              checked={filters.priceRanges.includes(range.id)}
              href={`${basePath}${togglePrice(range.id)}`}
            />
          ))}
        </div>
      </FilterSection>

      {showSizeFilter && (
        <FilterSection title="Размер">
          <div className="grid grid-cols-4 gap-2">
            {RING_BRACELET_SIZES.map((size) => {
              const id = String(size);
              return (
                <Link
                  key={id}
                  href={`${basePath}${toggleSize(id)}`}
                  scroll={false}
                  className={`touch-manipulation rounded-lg border px-2 py-2 text-center text-sm transition-colors [-webkit-tap-highlight-color:transparent] ${
                    filters.sizes.includes(id)
                      ? "border-brand-olive bg-brand-surface text-brand-olive-dark font-medium"
                      : "border-brand-olive/20 bg-brand-surface text-brand-text hover:border-brand-olive"
                  }`}
                >
                  {formatSizeLabel(size)}
                </Link>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-brand-muted leading-relaxed">
            Для колец и браслетов.{" "}
            <Link href="/how-size-ring" className="text-brand-terracotta hover:underline">
              Как определить размер →
            </Link>
          </p>
        </FilterSection>
      )}

      {activeCount > 0 && (
        <Link
          href={basePath}
          scroll={false}
          className="mt-4 touch-manipulation text-sm text-brand-terracotta hover:text-brand-terracotta-logo transition-colors"
        >
          Сбросить фильтры ({activeCount})
        </Link>
      )}
    </div>
  );
}

export function SortSelect({
  filters,
  basePath,
}: {
  filters: Filters;
  basePath: string;
}) {
  return (
    <div className="relative">
      <label htmlFor="sort" className="sr-only">
        Сортировка
      </label>
      <select
        id="sort"
        value={filters.sort}
        onChange={(e) => {
          const query = buildFilterQuery(filters, { sort: e.target.value });
          window.location.href = `${basePath}${query}`;
        }}
        className="appearance-none bg-brand-surface border border-brand-olive/20 rounded-lg pl-4 pr-10 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-olive cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
