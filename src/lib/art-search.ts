import type { Product } from "@/lib/products";
import type {
  SearchAutocompleteProduct,
  SearchAutocompleteResult,
} from "@/lib/search-types";

const ART_NO_QUERY_PATTERN = /\d-\d/;

export function looksLikeArtNoQuery(query: string): boolean {
  return ART_NO_QUERY_PATTERN.test(query.trim());
}

/**
 * For SKUs like `191-009014` (product) / `191-009014-6` (modification):
 * strip a trailing `-\d+` only when a product-level artNo (still with `-`) remains.
 * Never reduce `191-009014` to `191`.
 */
export function resolveModificationArtBase(query: string): string | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized.includes("-")) return null;

  const withoutTrailing = normalized.replace(/-\d+$/, "");
  if (
    withoutTrailing !== normalized &&
    withoutTrailing.includes("-") &&
    withoutTrailing.length > 0
  ) {
    return withoutTrailing;
  }

  return null;
}

export function hasExactArtNoMatch(product: Product, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;
  return collectProductArtNos(product).some(
    (artNo) => artNo.toLowerCase() === normalized,
  );
}

function collectProductArtNos(product: Product): string[] {
  const artNos = new Set<string>();

  const add = (value?: string | null) => {
    const trimmed = value?.trim();
    if (trimmed) artNos.add(trimmed);
  };

  add(product.artNo);
  for (const artNo of product.offerArtNos ?? []) {
    add(artNo);
  }
  for (const artNo of Object.values(product.sizeArtNos ?? {})) {
    add(artNo);
  }

  return [...artNos];
}

export function findMatchingArtNo(
  product: Product,
  query: string,
): string | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;

  const artNos = collectProductArtNos(product);
  const exact = artNos.find((artNo) => artNo.toLowerCase() === normalized);
  if (exact) return exact;

  return artNos.find((artNo) => artNo.toLowerCase().includes(normalized));
}

export function productMatchesArtQuery(
  product: Product,
  query: string,
): boolean {
  return findMatchingArtNo(product, query) !== undefined;
}

export function mapProductToAutocomplete(
  product: Product,
  matchedArtNo?: string,
): SearchAutocompleteProduct {
  return {
    type: "product",
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    artNo: matchedArtNo ?? product.artNo,
    href: `/products/${product.slug}`,
  };
}

export function searchCatalogByArtNo(
  catalog: Product[],
  query: string,
  limit = 6,
): SearchAutocompleteResult {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { products: [], categories: [] };
  }

  const exact: SearchAutocompleteProduct[] = [];
  const partial: SearchAutocompleteProduct[] = [];

  for (const product of catalog) {
    const artNos = collectProductArtNos(product);
    const exactArt = artNos.find((artNo) => artNo.toLowerCase() === normalized);
    if (exactArt) {
      exact.push(mapProductToAutocomplete(product, exactArt));
      continue;
    }

    const partialArt = artNos.find((artNo) =>
      artNo.toLowerCase().includes(normalized),
    );
    if (partialArt) {
      partial.push(mapProductToAutocomplete(product, partialArt));
    }
  }

  return {
    products: [...exact, ...partial].slice(0, limit),
    categories: [],
  };
}

export function searchCatalogProductsByArtNo(
  catalog: Product[],
  query: string,
): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const exact: Product[] = [];
  const partial: Product[] = [];

  for (const product of catalog) {
    const artNos = collectProductArtNos(product);
    if (artNos.some((artNo) => artNo.toLowerCase() === normalized)) {
      exact.push(product);
      continue;
    }
    if (artNos.some((artNo) => artNo.toLowerCase().includes(normalized))) {
      partial.push(product);
    }
  }

  return [...exact, ...partial];
}

export function mergeAutocompleteResults(
  local: SearchAutocompleteResult,
  remote: SearchAutocompleteResult,
  limit = 6,
): SearchAutocompleteResult {
  const products: SearchAutocompleteProduct[] = [];
  const seen = new Set<string>();

  for (const product of [...local.products, ...remote.products]) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    products.push(product);
    if (products.length >= limit) break;
  }

  const categories = remote.categories.length
    ? remote.categories
    : local.categories;

  return { products, categories };
}
