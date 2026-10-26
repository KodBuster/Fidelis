import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  fetchAdvantShopProducts,
  loadAdvantShopProductDetails,
} from "@/lib/advantshop/catalog";
import { findProductBySlug } from "@/lib/product-slug";
import {
  CATALOG_REVALIDATE_SECONDS,
  isAdvantShopConfigured,
} from "@/lib/advantshop/config";
import {
  GIFT_SOURCE_CATEGORIES,
  getGiftPeriodId,
  getSecondsUntilNextGiftRefresh,
  pickGiftProducts,
} from "@/lib/gift-products";
import { getComplectSiblings } from "@/lib/product-complect";
import {
  PRODUCTS,
  getProductBySlug as getStaticProductBySlug,
  getProductDetails as getStaticProductDetails,
  getRelatedProducts as getStaticRelatedProducts,
  type CategorySlug,
  type Product,
  type ProductDetails,
} from "@/lib/products";

const getCachedAdvantShopCatalog = unstable_cache(
  async (categoryKey: string, sort: string, mode: string) => {
    const category =
      categoryKey === "all" ? undefined : (categoryKey as CategorySlug);
    return fetchAdvantShopProducts({
      category,
      sort,
      // light — только list API; full — +details/properties на каждый товар (медленно).
      enrichStock: mode === "full",
      includeOutOfStock: true,
    });
  },
  ["advantshop-catalog"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog"] },
);

const getCachedGiftCatalog = unstable_cache(
  async (periodId: string, sort: string) => {
    if (isAdvantShopConfigured()) {
      const lists = await Promise.all(
        GIFT_SOURCE_CATEGORIES.map((category) =>
          getCachedAdvantShopCatalog(category, "default", "light"),
        ),
      );
      return pickGiftProducts(lists.flat(), sort, periodId);
    }

    return pickGiftProducts(PRODUCTS, sort, periodId);
  },
  ["gift-catalog"],
  {
    revalidate: 86_400,
    tags: ["gift-catalog"],
  },
);

const getCachedProductDetailsBySlug = unstable_cache(
  async (slug: string) => loadProductDetailsUncached(slug),
  ["advantshop-product-details"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog", "product"] },
);

async function getGiftCatalogProducts(sort: string): Promise<Product[]> {
  const periodId = getGiftPeriodId();
  return getCachedGiftCatalog(periodId, sort);
}

export function getGiftCatalogCacheSeconds(): number {
  return getSecondsUntilNextGiftRefresh();
}

/**
 * Нужен полный enrich (details/properties), если фильтруем по коллекции или комплектам —
 * эти поля не приходят из list API.
 */
export function catalogNeedsEnrichStock(options?: {
  manufacturer?: string | null;
  complectsOnly?: boolean;
}): boolean {
  return Boolean(options?.manufacturer?.trim()) || Boolean(options?.complectsOnly);
}

export async function getCatalogProducts(options?: {
  category?: CategorySlug;
  sort?: string;
  /**
   * true — N+1 details/properties (нужно для manufacturer/complect).
   * По умолчанию false (быстрый list) — категории и карточки открываются без сотен запросов.
   */
  enrichStock?: boolean;
}): Promise<Product[]> {
  const sort = options?.sort ?? "default";
  // Раньше по умолчанию был full enrich — из‑за этого каталог и PDP «висели».
  const mode = options?.enrichStock === true ? "full" : "light";

  if (isAdvantShopConfigured()) {
    try {
      return await getCachedAdvantShopCatalog(
        options?.category ?? "all",
        sort,
        mode,
      );
    } catch (error) {
      console.error("AdvantShop catalog unavailable:", error);
    }
  }

  let products = [...PRODUCTS];

  if (options?.category) {
    products = products.filter((product) => product.category === options.category);
  }

  if (sort === "price-asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === "new") {
    products.sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }

  return products;
}

async function findCatalogSummary(slug: string): Promise<Product | undefined> {
  // Лёгкий кэшированный индекс (все категории, без N+1).
  const products = await getCatalogProducts({ enrichStock: false });
  return findProductBySlug(products, slug);
}

async function loadProductDetailsUncached(
  slug: string,
): Promise<ProductDetails | undefined> {
  if (!isAdvantShopConfigured()) {
    return getStaticProductDetails(slug);
  }

  try {
    const summary = await findCatalogSummary(slug);
    if (!summary) {
      return getStaticProductDetails(slug);
    }

    const product = await loadAdvantShopProductDetails(summary);
    return product ?? getStaticProductDetails(slug);
  } catch (error) {
    console.error(`AdvantShop product "${slug}" unavailable:`, error);
    return getStaticProductDetails(slug);
  }
}

export async function getProductBySlug(
  slug: string,
  _options?: { includeOutOfStock?: boolean },
): Promise<Product | undefined> {
  if (isAdvantShopConfigured()) {
    // Всегда light+includeOutOfStock (кэш) — без uncached full enrich.
    const fromShop = await findCatalogSummary(slug);
    if (fromShop) return fromShop;
  }

  return getStaticProductBySlug(slug);
}

/**
 * Детали товара: лёгкий индекс + один запрос details.
 * React.cache схлопывает generateMetadata + page в одном запросе.
 */
export const getProductDetails = cache(
  async (
    slug: string,
    _options?: { includeOutOfStock?: boolean },
  ): Promise<ProductDetails | undefined> => {
    if (!isAdvantShopConfigured()) {
      return getStaticProductDetails(slug);
    }

    try {
      return await getCachedProductDetailsBySlug(slug);
    } catch (error) {
      console.error(`Cached product "${slug}" unavailable:`, error);
      return loadProductDetailsUncached(slug);
    }
  },
);

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const catalog = await getCatalogProducts({
    category: product.category,
    enrichStock: false,
  });
  return catalog.filter((item) => item.id !== product.id).slice(0, limit);
}

export async function getComplectProducts(
  product: Product,
  limit = 3,
): Promise<Product[]> {
  try {
    // Set уже на PDP из properties; siblings ищем по artNo в лёгком каталоге.
    if (!product.setArtNos?.length) return [];
    const catalog = await getCatalogProducts({ enrichStock: false });
    return getComplectSiblings(product, catalog, limit);
  } catch (error) {
    console.error("Complect products unavailable:", error);
    return [];
  }
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (isAdvantShopConfigured()) {
    const products = await getCatalogProducts({ enrichStock: false });
    const slugSet = new Set(slugs);
    const order = new Map(slugs.map((slug, index) => [slug, index]));
    return products
      .filter((product) => slugSet.has(product.slug))
      .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
  }

  return slugs
    .map((slug) => getStaticProductBySlug(slug))
    .filter((product): product is Product => product !== undefined);
}

export function getCatalogSource(): "advantshop" | "static" {
  return isAdvantShopConfigured() ? "advantshop" : "static";
}

const FEATURED_CATEGORY_SLUGS: CategorySlug[] = [
  "rings",
  "earrings",
  "pendants",
  "chain-pendants",
  "necklaces",
  "bracelets",
  "ankle-bracelets",
  "brooches",
  "watches",
];

function pickRandomProduct(products: Product[]): Product | undefined {
  if (!products.length) return undefined;
  const index = Math.floor(Math.random() * products.length);
  return products[index];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const catalog = await getCatalogProducts({ enrichStock: false });
    const picks = FEATURED_CATEGORY_SLUGS.map((category) =>
      pickRandomProduct(catalog.filter((product) => product.category === category)),
    );

    const featured = picks.filter(
      (product): product is Product => product !== undefined,
    );
    if (featured.length) return featured;
  } catch (error) {
    console.error("Failed to load featured products:", error);
  }

  return FEATURED_CATEGORY_SLUGS.map((category) =>
    pickRandomProduct(PRODUCTS.filter((product) => product.category === category)),
  ).filter((product): product is Product => product !== undefined);
}
