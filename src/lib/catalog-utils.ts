import {
  categoryHasSizes,
  numericSizesFromOptions,
  PRICE_RANGES,
  type CategorySlug,
  type Product,
} from "./products";

export type CatalogFilters = {
  category?: CategorySlug;
  priceRanges: string[];
  sizes: string[];
  complectsOnly: boolean;
  sort: string;
};

function getProductSizes(product: Product): number[] {
  if (product.sizeOptions?.length) {
    return numericSizesFromOptions(product.sizeOptions);
  }
  return [];
}

function productMatchesSize(product: Product, sizeParam: string): boolean {
  if (!categoryHasSizes(product.category)) {
    return false;
  }

  const target = Number.parseFloat(sizeParam.replace(",", "."));
  if (Number.isNaN(target)) return false;

  const sizes = getProductSizes(product);
  return sizes.some((size) => Math.abs(size - target) < 0.01);
}

export function filterProducts(
  filters: CatalogFilters,
  products: Product[]
): Product[] {
  let result = [...products];

  if (filters.category && filters.category !== "gifts") {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.priceRanges.length > 0) {
    const ranges = PRICE_RANGES.filter((r) => filters.priceRanges.includes(r.id));
    result = result.filter((p) =>
      ranges.some((r) => p.price >= r.min && p.price < r.max)
    );
  }

  if (filters.sizes.length > 0) {
    result = result.filter((p) =>
      filters.sizes.some((size) => productMatchesSize(p, size))
    );
  }

  if (filters.complectsOnly) {
    result = result.filter((product) => Boolean(product.setArtNos?.length));
  }

  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "new":
      result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    default:
      break;
  }

  return result;
}

export function parseFiltersFromSearchParams(
  params: URLSearchParams,
  category?: CategorySlug
): CatalogFilters {
  return {
    category,
    priceRanges: params.getAll("price"),
    sizes: params.getAll("size"),
    complectsOnly: params.get("complect") === "1",
    sort: params.get("sort") ?? "default",
  };
}

export function buildFilterQuery(
  filters: CatalogFilters,
  updates: Partial<CatalogFilters>,
  options?: { panel?: boolean }
): string {
  const next = { ...filters, ...updates };
  const query = new URLSearchParams();

  next.priceRanges.forEach((p) => query.append("price", p));
  next.sizes.forEach((size) => query.append("size", size));
  if (next.complectsOnly) {
    query.set("complect", "1");
  }
  if (next.sort && next.sort !== "default") {
    query.set("sort", next.sort);
  }
  if (options?.panel) {
    query.set("panel", "filters");
  }

  const str = query.toString();
  return str ? `?${str}` : "";
}

export function countActiveFilters(filters: CatalogFilters): number {
  return (
    filters.priceRanges.length +
    filters.sizes.length +
    (filters.complectsOnly ? 1 : 0)
  );
}

export function hasCatalogFilterParams(params: URLSearchParams): boolean {
  return (
    params.has("price") ||
    params.has("size") ||
    params.has("complect") ||
    (params.has("sort") && params.get("sort") !== "default")
  );
}

export function shouldShowSizeFilter(category?: CategorySlug): boolean {
  return !category || categoryHasSizes(category);
}
