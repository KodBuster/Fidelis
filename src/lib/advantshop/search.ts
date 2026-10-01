import type { Product } from "@/lib/products";
import type {
  SearchAutocompleteCategory,
  SearchAutocompleteResult,
} from "@/lib/search-types";
import { mapProductToAutocomplete } from "@/lib/art-search";
import { advantshopClientFetch } from "./client";
import {
  fetchAdvantShopProducts,
  resolveCategorySlugFromAdvantShopUrl,
} from "./catalog";
import type {
  AdvantShopCatalogProduct,
  AdvantShopCategory,
  AdvantShopSearchAutocompleteResponse,
  AdvantShopSearchResponse,
} from "./types";

const MAX_AUTOCOMPLETE_PRODUCTS = 6;
const MAX_AUTOCOMPLETE_CATEGORIES = 4;

const SORT_MAP: Record<string, string> = {
  default: "NoSorting",
  "price-asc": "AscByPrice",
  "price-desc": "DescByPrice",
  new: "DescByAddingDate",
};

async function fetchSearchPage(body: Record<string, unknown>) {
  return advantshopClientFetch<AdvantShopSearchResponse>("/api/search", {
    method: "POST",
    body,
  });
}

async function fetchAllSearchProducts(query: string, sorting: string) {
  const products: AdvantShopCatalogProduct[] = [];
  let page = 1;
  let totalPages = 1;
  const pageSize = 500;

  do {
    const response = await fetchSearchPage({
      query,
      sorting,
      page,
      itemsPerPage: pageSize,
    });
    products.push(...(response.products ?? []));
    totalPages = response.pager?.totalPageCount ?? 1;
    page += 1;
  } while (page <= totalPages);

  return products;
}

function mapAutocompleteCategory(
  item: AdvantShopCategory
): SearchAutocompleteCategory | null {
  const slug = resolveCategorySlugFromAdvantShopUrl(item.url);
  if (!slug) return null;

  return {
    type: "category",
    slug,
    name: item.name,
    href: `/shop/${slug}`,
  };
}

function resolveProductsById(
  catalog: Product[],
  productIds: string[],
  limit?: number,
): Product[] {
  const knownById = new Map(
    catalog.map((product) => [product.id, product] as const),
  );
  const resolved: Product[] = [];
  for (const id of productIds) {
    const product = knownById.get(id);
    if (!product) continue;
    resolved.push(product);
    if (limit != null && resolved.length >= limit) break;
  }
  return resolved;
}

export async function fetchAdvantShopSearchAutocomplete(
  query: string
): Promise<SearchAutocompleteResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { products: [], categories: [] };
  }

  const response = await advantshopClientFetch<AdvantShopSearchAutocompleteResponse>(
    "/api/search/autocomplete",
    {
      method: "POST",
      body: { query: trimmed },
    }
  );

  const categories = (response.categories ?? [])
    .map(mapAutocompleteCategory)
    .filter((item): item is SearchAutocompleteCategory => item !== null)
    .slice(0, MAX_AUTOCOMPLETE_CATEGORIES);

  const productIds = [
    ...new Set((response.products ?? []).map((item) => String(item.productId))),
  ];

  const catalog = await fetchAdvantShopProducts();
  const products = resolveProductsById(
    catalog,
    productIds,
    MAX_AUTOCOMPLETE_PRODUCTS,
  ).map((product) => mapProductToAutocomplete(product));

  return { products, categories };
}

/** Product IDs from AdvantShop search — resolve against local catalog in search-service. */
export async function fetchAdvantShopSearchProductIds(
  query: string,
  options?: { sort?: string }
): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const sorting = SORT_MAP[options?.sort ?? "default"] ?? "NoSorting";
  const items = await fetchAllSearchProducts(trimmed, sorting);
  return [...new Set(items.map((item) => String(item.productId)))];
}

export async function fetchAdvantShopSearch(
  query: string,
  options?: { sort?: string }
): Promise<Product[]> {
  const ids = await fetchAdvantShopSearchProductIds(query, options);
  if (!ids.length) return [];

  const catalog = await fetchAdvantShopProducts();
  return resolveProductsById(catalog, ids);
}
