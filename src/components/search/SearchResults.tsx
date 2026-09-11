import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SearchForm } from "./SearchForm";

const SEARCH_GRID =
  "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 lg:gap-6";

type SearchResultsProps = {
  query: string;
  products: Product[];
  error?: string;
};

export function SearchResults({ query, products, error }: SearchResultsProps) {
  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
        <nav className="text-sm text-brand-muted mb-6" aria-label="Хлебные крошки">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <a href="/" className="hover:text-brand-terracotta transition-colors">
                Главная
              </a>
            </li>
            <li aria-hidden>/</li>
            <li>
              <span className="text-brand-text">Поиск</span>
            </li>
          </ol>
        </nav>

        <div className="mb-8 md:mb-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            Каталог
          </p>
          <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark mb-4">
            Поиск
          </h1>
          <SearchForm defaultQuery={query} className="max-w-xl" autoFocus />
        </div>

        {!query ? (
          <p className="text-brand-muted text-sm md:text-base">
            Введите название украшения или артикул.
          </p>
        ) : null}

        {query && error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="text-brand-text mb-4">{error}</p>
            <a
              href={`/search?q=${encodeURIComponent(query)}`}
              className="inline-flex rounded-lg bg-brand-terracotta px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-terracotta-logo transition-colors"
            >
              Попробовать снова
            </a>
          </div>
        ) : null}

        {query && !error && products.length === 0 ? (
          <p className="py-12 text-center text-brand-muted">
            По запросу «{query}» ничего не найдено.
          </p>
        ) : null}

        {query && !error && products.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-brand-muted">
              Найдено: {products.length}
            </p>
            <div className={SEARCH_GRID}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
