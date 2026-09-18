import { unstable_cache } from "next/cache";
import {
  fetchAdvantShopSearchAutocomplete,
  fetchAdvantShopSearchProductIds,
} from "@/lib/advantshop/search";
import { loadAdvantShopProductDetails } from "@/lib/advantshop/catalog";
import {
  hasExactArtNoMatch,
  looksLikeArtNoQuery,
  mergeAutocompleteResults,
  productMatchesArtQuery,
  resolveModificationArtBase,
  searchCatalogByArtNo,
  searchCatalogProductsByArtNo,
} from "@/lib/art-search";
import {
  CATALOG_REVALIDATE_SECONDS,
  isAdvantShopConfigured,
} from "@/lib/advantshop/config";
import {
  CATALOG_CATEGORY_SLUGS,
  CATEGORIES,
  PRODUCTS,
  type CategorySlug,
  type Product,
} from "@/lib/products";
import type { SearchAutocompleteResult } from "@/lib/search-types";
import { getCatalogProducts } from "@/lib/products-service";

const getCachedAdvantShopSearchIds = unstable_cache(
  async (query: string, sort: string) =>
    fetchAdvantShopSearchProductIds(query, { sort }),
  ["advantshop-search-ids", "v1"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["search"] }
);

const REMOTE_SEARCH_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("search timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function resolveCatalogByIds(catalog: Product[], ids: string[]): Product[] {
  const byId = new Map(catalog.map((product) => [product.id, product]));
  return ids
    .map((id) => byId.get(id))
    .filter((product): product is Product => Boolean(product));
}

/** Morphological / colloquial queries → catalog categories. */
const SEARCH_CATEGORY_SYNONYMS: Record<string, CategorySlug[]> = {
  кольцо: ["rings"],
  кольца: ["rings"],
  колечко: ["rings"],
  ring: ["rings"],
  rings: ["rings"],
  серьга: ["earrings"],
  серьги: ["earrings"],
  сережки: ["earrings"],
  earring: ["earrings"],
  earrings: ["earrings"],
  колье: ["necklaces"],
  necklace: ["necklaces"],
  necklaces: ["necklaces"],
  кулон: ["pendants"],
  подвеска: ["pendants"],
  подвески: ["pendants"],
  pendant: ["pendants"],
  pendants: ["pendants"],
  браслет: ["bracelets", "ankle-bracelets"],
  браслеты: ["bracelets", "ankle-bracelets"],
  "браслет на руку": ["bracelets"],
  "браслеты на руку": ["bracelets"],
  "браслет на ногу": ["ankle-bracelets"],
  "браслеты на ногу": ["ankle-bracelets"],
  bracelet: ["bracelets", "ankle-bracelets"],
  bracelets: ["bracelets"],
  шнурок: ["cords"],
  шнурки: ["cords"],
  cord: ["cords"],
  cords: ["cords"],
};

function searchCatalogByText(catalog: Product[], query: string): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const categoryHits = new Set<CategorySlug>();
  for (const [term, slugs] of Object.entries(SEARCH_CATEGORY_SYNONYMS)) {
    if (normalized.includes(term) || term.includes(normalized)) {
      for (const slug of slugs) categoryHits.add(slug);
    }
  }

  return catalog.filter((product) => {
    if (categoryHits.has(product.category)) return true;

    const category = CATEGORIES[product.category];
    if (
      category.title.toLowerCase().includes(normalized) ||
      category.titlePlural.toLowerCase().includes(normalized)
    ) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(normalized) ||
      product.slug.toLowerCase().includes(normalized) ||
      (product.artNo?.toLowerCase().includes(normalized) ?? false) ||
      (product.offerArtNos ?? []).some((artNo) =>
        artNo.toLowerCase().includes(normalized),
      )
    );
  });
}

function searchCatalogCategoriesByText(
  query: string,
): SearchAutocompleteResult["categories"] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const slugs = new Set<CategorySlug>();
  for (const [term, mapped] of Object.entries(SEARCH_CATEGORY_SYNONYMS)) {
    if (normalized.includes(term) || term.includes(normalized)) {
      for (const slug of mapped) slugs.add(slug);
    }
  }

  for (const slug of CATALOG_CATEGORY_SLUGS) {
    const category = CATEGORIES[slug];
    if (
      category.title.toLowerCase().includes(normalized) ||
      category.titlePlural.toLowerCase().includes(normalized) ||
      slug.includes(normalized)
    ) {
      slugs.add(slug);
    }
  }

  return [...slugs].slice(0, 4).map((slug) => ({
    type: "category" as const,
    slug,
    name: CATEGORIES[slug].titlePlural,
    href: `/shop/${slug}`,
  }));
}

function searchStaticProducts(query: string, sort?: string): Product[] {
  let products = searchCatalogByText(PRODUCTS, query);

  if (sort === "price-asc") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (sort === "new") {
    products = [...products].sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }

  return products;
}

function getStaticAutocomplete(query: string): SearchAutocompleteResult {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { products: [], categories: [] };
  }

  const categories = CATALOG_CATEGORY_SLUGS.filter((slug) => {
    const category = CATEGORIES[slug];
    return (
      category.titlePlural.toLowerCase().includes(normalized) ||
      category.title.toLowerCase().includes(normalized) ||
      slug.includes(normalized)
    );
  })
    .slice(0, 4)
    .map((slug: CategorySlug) => ({
      type: "category" as const,
      slug,
      name: CATEGORIES[slug].titlePlural,
      href: `/shop/${slug}`,
    }));

  const products = searchStaticProducts(normalized).slice(0, 6).map((product) => ({
    type: "product" as const,
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    artNo: product.artNo,
    href: `/products/${product.slug}`,
  }));

  return { products, categories };
}

function collectArtKeys(product: Product): string[] {
  return [product.artNo, ...(product.offerArtNos ?? [])]
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value));
}

/** Narrow catalog candidates for art / modification lookup — never series-only (`191`). */
function findArtLookupCandidates(catalog: Product[], query: string): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const modificationBase = resolveModificationArtBase(query);
  const prefixes = modificationBase
    ? [normalized, modificationBase]
    : [normalized];

  return catalog.filter((product) =>
    collectArtKeys(product).some((artNo) =>
      prefixes.some(
        (prefix) => artNo === prefix || artNo.startsWith(`${prefix}-`),
      ),
    ),
  );
}

function sortProducts(products: Product[], sort: string): Product[] {
  if (sort === "price-asc") {
    return [...products].sort((a, b) => a.price - b.price);
  }
  if (sort === "price-desc") {
    return [...products].sort((a, b) => b.price - a.price);
  }
  if (sort === "new") {
    return [...products].sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }
  return products;
}

async function searchModificationArtProducts(
  catalog: Product[],
  query: string,
): Promise<Product[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized.includes("-")) {
    return [];
  }

  const direct = searchCatalogProductsByArtNo(catalog, query);
  if (direct.some((product) => hasExactArtNoMatch(product, query))) {
    return direct.filter((product) => hasExactArtNoMatch(product, query));
  }

  // Partial includes on the full query (e.g. offer `191-009014-1` for `191-009014`)
  if (direct.length) {
    return direct;
  }

  const candidates = findArtLookupCandidates(catalog, query).slice(0, 12);
  if (!candidates.length) return [];

  const products: Product[] = [];
  for (const candidate of candidates) {
    const details = await loadAdvantShopProductDetails(candidate);
    if (!details) continue;

    if (productMatchesArtQuery(details, query)) {
      products.push(details);
    }
  }

  return products;
}

async function searchModificationArtInCatalog(
  catalog: Product[],
  query: string,
  limit = 6,
): Promise<SearchAutocompleteResult> {
  const normalized = query.trim().toLowerCase();
  if (!normalized.includes("-")) {
    return { products: [], categories: [] };
  }

  const direct = searchCatalogByArtNo(catalog, query, limit);
  if (
    direct.products.some((product) => {
      const catalogProduct = catalog.find((item) => item.id === product.id);
      return catalogProduct
        ? hasExactArtNoMatch(catalogProduct, query)
        : product.artNo?.toLowerCase() === normalized;
    })
  ) {
    return direct;
  }

  if (direct.products.length) {
    return direct;
  }

  const candidates = findArtLookupCandidates(catalog, query).slice(0, 12);
  const products = [];
  for (const candidate of candidates) {
    const details = await loadAdvantShopProductDetails(candidate);
    if (!details) continue;

    const match = searchCatalogByArtNo([details], query, 1);
    if (match.products[0]) {
      products.push(match.products[0]);
    }
    if (products.length >= limit) break;
  }

  return { products, categories: [] };
}

export async function getSearchAutocomplete(
  query: string
): Promise<SearchAutocompleteResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { products: [], categories: [] };
  }

  if (isAdvantShopConfigured()) {
    const catalog = await getCatalogProducts();
    const artQuery = looksLikeArtNoQuery(trimmed);
    const localMatches = searchCatalogByArtNo(catalog, trimmed);
    const hasExactLocal = localMatches.products.some((product) => {
      const catalogProduct = catalog.find((item) => item.id === product.id);
      return catalogProduct
        ? hasExactArtNoMatch(catalogProduct, trimmed)
        : product.artNo?.toLowerCase() === trimmed.toLowerCase();
    });

    const modificationMatches =
      hasExactLocal || (!artQuery && localMatches.products.length)
        ? { products: [], categories: [] }
        : await searchModificationArtInCatalog(catalog, trimmed);

    const artHits = mergeAutocompleteResults(localMatches, modificationMatches);

    // Art-number queries: never mix in tokenized AdvantShop / broad text hits.
    if (artQuery && artHits.products.length) {
      return artHits;
    }

    if (artQuery) {
      try {
        const remote = await fetchAdvantShopSearchAutocomplete(trimmed);
        const remoteFiltered = {
          products: remote.products.filter((product) => {
            const catalogProduct = catalog.find((item) => item.id === product.id);
            return catalogProduct
              ? productMatchesArtQuery(catalogProduct, trimmed)
              : product.artNo
                ? product.artNo.toLowerCase().includes(trimmed.toLowerCase())
                : false;
          }),
          categories: [] as SearchAutocompleteResult["categories"],
        };
        if (remoteFiltered.products.length) return remoteFiltered;
      } catch {
        // fall through to empty art result
      }
      return { products: [], categories: [] };
    }

    const textMatches = {
      products: searchCatalogByText(catalog, trimmed)
        .slice(0, 6)
        .map((product) => ({
          type: "product" as const,
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          artNo: product.artNo,
          href: `/products/${product.slug}`,
        })),
      categories: searchCatalogCategoriesByText(trimmed),
    };

    try {
      const remote = await fetchAdvantShopSearchAutocomplete(trimmed);
      return mergeAutocompleteResults(
        mergeAutocompleteResults(localMatches, textMatches),
        remote,
      );
    } catch (error) {
      const fallback = mergeAutocompleteResults(localMatches, textMatches);
      if (fallback.products.length || fallback.categories.length) {
        return fallback;
      }
      throw error;
    }
  }

  return getStaticAutocomplete(trimmed);
}

export async function getSearchProducts(
  query: string,
  options?: { sort?: string }
): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const sort = options?.sort ?? "default";

  if (isAdvantShopConfigured()) {
    let catalog: Product[] = [];
    try {
      catalog = await withTimeout(getCatalogProducts(), REMOTE_SEARCH_TIMEOUT_MS);
    } catch (error) {
      console.error("[search] catalog load failed, using static fallback:", error);
      return searchStaticProducts(trimmed, sort);
    }

    const artQuery = looksLikeArtNoQuery(trimmed);
    const localMatches = searchCatalogProductsByArtNo(catalog, trimmed);

    let modificationMatches: Product[] = [];
    try {
      modificationMatches = await withTimeout(
        searchModificationArtProducts(catalog, trimmed),
        REMOTE_SEARCH_TIMEOUT_MS,
      );
    } catch {
      modificationMatches = [];
    }

    const artMerged = new Map<string, Product>();
    for (const product of [...localMatches, ...modificationMatches]) {
      artMerged.set(product.id, product);
    }

    if (artQuery && artMerged.size > 0) {
      return sortProducts([...artMerged.values()], sort);
    }

    if (artQuery) {
      try {
        const remoteIds = await withTimeout(
          getCachedAdvantShopSearchIds(trimmed, sort),
          REMOTE_SEARCH_TIMEOUT_MS,
        );
        const remoteMatches = resolveCatalogByIds(catalog, remoteIds).filter(
          (product) => productMatchesArtQuery(product, trimmed),
        );
        if (remoteMatches.length) {
          return sortProducts(remoteMatches, sort);
        }
      } catch (error) {
        console.error("[search] AdvantShop remote search failed:", error);
      }
      return [];
    }

    // Name / synonym search: local-first, then remote.
    const textMatches = searchCatalogByText(catalog, trimmed);

    let remoteMatches: Product[] = [];
    try {
      const remoteIds = await withTimeout(
        getCachedAdvantShopSearchIds(trimmed, sort),
        REMOTE_SEARCH_TIMEOUT_MS,
      );
      remoteMatches = resolveCatalogByIds(catalog, remoteIds);
    } catch (error) {
      console.error("[search] AdvantShop remote search failed:", error);
    }

    const merged = new Map<string, Product>();
    for (const product of [
      ...localMatches,
      ...textMatches,
      ...modificationMatches,
      ...remoteMatches,
    ]) {
      merged.set(product.id, product);
    }

    return sortProducts([...merged.values()], sort);
  }

  return searchStaticProducts(trimmed, sort);
}
