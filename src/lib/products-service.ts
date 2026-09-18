import { unstable_cache } from "next/cache";
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
  async (categoryKey: string, sort: string) => {
    const category =
      categoryKey === "all" ? undefined : (categoryKey as CategorySlug);
    return fetchAdvantShopProducts({ category, sort });
  },
  ["advantshop-catalog"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog"] }
);

const getCachedGiftCatalog = unstable_cache(
  async (periodId: string, sort: string) => {
    if (isAdvantShopConfigured()) {
      const lists = await Promise.all(
        GIFT_SOURCE_CATEGORIES.map((category) =>
          getCachedAdvantShopCatalog(category, "default")
        )
      );
      return pickGiftProducts(lists.flat(), sort, periodId);
    }

    return pickGiftProducts(PRODUCTS, sort, periodId);
  },
  ["gift-catalog"],
  {
    revalidate: 86_400,
    tags: ["gift-catalog"],
  }
);

async function getGiftCatalogProducts(sort: string): Promise<Product[]> {
  const periodId = getGiftPeriodId();
  return getCachedGiftCatalog(periodId, sort);
}

export function getGiftCatalogCacheSeconds(): number {
  return getSecondsUntilNextGiftRefresh();
}

export async function getCatalogProducts(options?: {
  category?: CategorySlug;
  sort?: string;
}): Promise<Product[]> {
  const sort = options?.sort ?? "default";

  if (options?.category === "gifts") {
    try {
      return await getGiftCatalogProducts(sort);
    } catch (error) {
      console.error("Gift catalog unavailable:", error);
      return pickGiftProducts(PRODUCTS, sort);
    }
  }

  if (isAdvantShopConfigured()) {
    try {
      return await getCachedAdvantShopCatalog(
        options?.category ?? "all",
        sort
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

export async function getProductBySlug(
  slug: string,
  options?: { includeOutOfStock?: boolean },
): Promise<Product | undefined> {
  if (isAdvantShopConfigured()) {
    const products = options?.includeOutOfStock
      ? await fetchAdvantShopProducts({ includeOutOfStock: true })
      : await getCatalogProducts();
    const fromShop = findProductBySlug(products, slug);
    if (fromShop) return fromShop;
  }

  return getStaticProductBySlug(slug);
}

export async function getProductDetails(
  slug: string,
  options?: { includeOutOfStock?: boolean },
): Promise<ProductDetails | undefined> {
  if (isAdvantShopConfigured()) {
    const products = options?.includeOutOfStock
      ? await fetchAdvantShopProducts({ includeOutOfStock: true })
      : await getCatalogProducts();
    const summary = findProductBySlug(products, slug);

    if (summary) {
      try {
        const product = await loadAdvantShopProductDetails(summary);
        if (product) return product;
      } catch (error) {
        console.error(`AdvantShop product "${slug}" unavailable:`, error);
      }
    }
  }

  return getStaticProductDetails(slug);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const catalog = await getCatalogProducts({ category: product.category });
  return catalog.filter((item) => item.id !== product.id).slice(0, limit);
}

export async function getComplectProducts(
  product: Product,
  limit = 3
): Promise<Product[]> {
  if (!product.setArtNos?.length) return [];

  const catalog = await getCatalogProducts();
  return getComplectSiblings(product, catalog, limit);
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (isAdvantShopConfigured()) {
    const products = await getCatalogProducts();
    const slugSet = new Set(slugs);
    const order = new Map(slugs.map((slug, index) => [slug, index]));
    return products
      .filter((product) => slugSet.has(product.slug))
      .sort(
        (a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0)
      );
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
  "necklaces",
  "bracelets",
  "ankle-bracelets",
  "cords",
];

function pickRandomProduct(products: Product[]): Product | undefined {
  if (!products.length) return undefined;
  const index = Math.floor(Math.random() * products.length);
  return products[index];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const catalog = await getCatalogProducts();
    const picks = FEATURED_CATEGORY_SLUGS.map((category) =>
      pickRandomProduct(catalog.filter((product) => product.category === category))
    );

    const featured = picks.filter(
      (product): product is Product => product !== undefined
    );
    if (featured.length) return featured;
  } catch (error) {
    console.error("Failed to load featured products:", error);
  }

  return FEATURED_CATEGORY_SLUGS.map((category) =>
    pickRandomProduct(PRODUCTS.filter((product) => product.category === category))
  ).filter((product): product is Product => product !== undefined);
}
