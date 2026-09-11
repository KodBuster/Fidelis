"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, type CategorySlug, type Product } from "@/lib/products";
import {
  filterProducts,
  parseFiltersFromSearchParams,
  countActiveFilters,
  buildFilterQuery,
} from "@/lib/catalog-utils";
import { CatalogFilters, SortSelect } from "./CatalogFilters";
import { ProductCard } from "./ProductCard";

const CATALOG_GRID =
  "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 lg:gap-6";

const CLIENT_CATALOG_TIMEOUT_MS = 50_000;

type CatalogViewProps = {
  category?: CategorySlug;
  initialProducts: Product[];
  initialError?: string;
};

async function fetchCatalog(
  params: URLSearchParams,
  signal: AbortSignal
): Promise<{ products: Product[]; error?: string }> {
  const response = await fetch(`/api/catalog?${params.toString()}`, { signal });
  const data = (await response.json()) as {
    products?: Product[];
    error?: string;
  };

  if (!response.ok || data.error) {
    return {
      products: [],
      error: data.error ?? "Не удалось загрузить каталог из AdvantShop",
    };
  }

  return { products: data.products ?? [] };
}

export function CatalogView({
  category,
  initialProducts,
  initialError,
}: CatalogViewProps) {
  const searchParams = useSearchParams();
  const [catalogProducts, setCatalogProducts] = useState(initialProducts);
  const [catalogError, setCatalogError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const basePath = category ? `/shop/${category}` : "/shop";
  const filters = parseFiltersFromSearchParams(
    new URLSearchParams(searchParams.toString()),
    category
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setCatalogProducts(initialProducts);
    setCatalogError(initialError);
    setLoading(false);
  }, [initialProducts, initialError]);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  const retryLoad = useCallback(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (filters.sort !== "default") params.set("sort", filters.sort);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, CLIENT_CATALOG_TIMEOUT_MS);

    setLoading(true);
    setCatalogError(undefined);

    fetchCatalog(params, controller.signal)
      .then(({ products, error }) => {
        if (error) {
          setCatalogError(error);
          setCatalogProducts([]);
          return;
        }
        setCatalogError(undefined);
        setCatalogProducts(products);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          setCatalogError(
            "Загрузка каталога заняла слишком много времени. Нажмите «Попробовать снова»."
          );
        } else {
          setCatalogError("Не удалось загрузить каталог из AdvantShop");
        }
        setCatalogProducts([]);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        setLoading(false);
      });
  }, [category, filters.sort]);

  const products = filterProducts(filters, catalogProducts);
  const activeFilterCount = countActiveFilters(filters);

  const pageTitle = category
    ? CATEGORIES[category].titlePlural
    : "Все украшения";
  const pageDescription = category
    ? CATEGORIES[category].description
    : "Каталог украшений из серебра 925 с ограненными синтетическими алмазами";

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
        <nav className="text-sm text-brand-muted mb-6" aria-label="Хлебные крошки">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-brand-terracotta transition-colors">
                Главная
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              {category ? (
                <Link href="/shop" className="hover:text-brand-terracotta transition-colors">
                  Каталог
                </Link>
              ) : (
                <span className="text-brand-text">Каталог</span>
              )}
            </li>
            {category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <span className="text-brand-text">{pageTitle}</span>
                </li>
              </>
            )}
          </ol>
        </nav>

        <div className="mb-8 md:mb-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            Каталог
          </p>
          <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark mb-2">
            {pageTitle}
          </h1>
          <p className="text-brand-muted text-sm md:text-base max-w-2xl">
            {pageDescription}
          </p>
        </div>

        <div className={`relative flex transition-[gap] duration-300 ${filtersOpen ? "lg:gap-6" : "gap-0"}`}>
          {filtersOpen && (
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden"
              aria-label="Закрыть фильтры"
            />
          )}

          <aside
            id="catalog-filters"
            aria-hidden={!filtersOpen}
            className={`shrink-0 overflow-hidden transition-[width,transform,opacity] duration-300 ease-in-out will-change-[width,transform]
              fixed inset-y-0 left-0 z-50 h-full lg:relative lg:inset-auto lg:z-10 lg:h-auto
              ${
                filtersOpen
                  ? "w-[min(100%,18rem)] translate-x-0 opacity-100"
                  : "w-0 -translate-x-full opacity-0 pointer-events-none lg:translate-x-0 lg:w-0"
              }`}
          >
            <div className="h-full w-72 max-w-[85vw] overflow-y-auto border-r border-brand-olive/10 bg-brand-surface p-6 shadow-xl lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:w-64 lg:rounded-xl lg:border lg:border-r lg:shadow-sm">
              <CatalogFilters
                filters={filters}
                basePath={basePath}
                onClose={() => setFiltersOpen(false)}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-expanded={filtersOpen}
                  aria-controls="catalog-filters"
                  className="inline-flex touch-manipulation items-center gap-2 rounded-lg border border-brand-olive/20 bg-brand-surface px-4 py-2.5 text-sm text-brand-text transition-colors hover:border-brand-olive [-webkit-tap-highlight-color:transparent]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M4 7h16M4 12h10M4 17h6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Фильтры
                  {activeFilterCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-terracotta px-1.5 text-[10px] font-medium text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <p className="text-sm text-brand-muted">
                  {loading
                    ? "Загрузка каталога…"
                    : `${products.length} ${
                        products.length === 1
                          ? "изделие"
                          : products.length < 5
                            ? "изделия"
                            : "изделий"
                      }`}
                </p>
              </div>

              <SortSelect filters={filters} basePath={basePath} />
            </div>

            {loading ? (
              <div className={CATALOG_GRID}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl bg-brand-surface animate-pulse"
                  />
                ))}
              </div>
            ) : catalogError ? (
              <div className="rounded-xl bg-brand-surface p-10 text-center md:p-16">
                <p className="mb-2 font-heading text-xl text-brand-olive-dark">
                  Каталог временно недоступен
                </p>
                <p className="mx-auto mb-6 max-w-xl text-sm text-brand-muted">
                  {catalogError}
                </p>
                <button
                  type="button"
                  onClick={retryLoad}
                  className="inline-flex touch-manipulation bg-brand-terracotta px-6 py-3 text-sm tracking-widest uppercase text-white transition-colors hover:bg-brand-terracotta-logo"
                >
                  Попробовать снова
                </button>
              </div>
            ) : products.length > 0 ? (
              <div className={CATALOG_GRID}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-brand-surface p-10 text-center md:p-16">
                <p className="mb-2 font-heading text-xl text-brand-olive-dark">
                  Ничего не найдено
                </p>
                <p className="mb-6 text-sm text-brand-muted">
                  Попробуйте изменить фильтры или выберите другую категорию
                </p>
                <Link
                  href={basePath}
                  className="inline-flex bg-brand-terracotta px-6 py-3 text-sm tracking-widest uppercase text-white transition-colors hover:bg-brand-terracotta-logo"
                >
                  Сбросить фильтры
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
