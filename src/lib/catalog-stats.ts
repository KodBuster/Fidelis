import {
  CATALOG_CATEGORY_SLUGS,
  CATEGORIES,
  formatPrice,
  getCatalogProductTotalPrice,
  type CategorySlug,
  type Product,
} from "@/lib/products";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import { getCatalogProducts } from "@/lib/products-service";

export type CategoryStat = {
  slug: CategorySlug;
  title: string;
  countLabel: string;
  priceFromLabel: string;
  href: string;
  image: string;
};

const CATEGORY_IMAGES: Record<CategorySlug, string> = {
  rings: "/images/categories/rings.jpg",
  "ankle-bracelets": "/images/categories/bracelets.jpg",
  bracelets: "/images/categories/bracelets.jpg",
  necklaces: "/images/categories/pendants.jpg",
  pendants: "/images/categories/pendants.jpg",
  earrings: "/images/categories/earrings.jpg",
  cords: "/images/product-necklace.webp",
  "chain-pendants": "/images/categories/pendants.jpg",
};

function formatModelCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) return `${count} моделей`;
  if (mod10 === 1) return `${count} модель`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} модели`;
  return `${count} моделей`;
}

/** Минимальная цена изделия (цена за грамм × вес). */
function getMinProductPrice(products: Product[]): number {
  return products.reduce((min, product) => {
    const total = getCatalogProductTotalPrice(product);
    if (total <= 0) return min;
    return Math.min(min, total);
  }, Number.POSITIVE_INFINITY);
}

function pickCategoryCover(products: Product[], slug: CategorySlug): string {
  const withImage = products.find(
    (product) =>
      product.image &&
      !product.image.includes("nophoto") &&
      product.inStock !== false,
  );
  if (withImage?.image) return withImage.image;

  const anyImage = products.find(
    (product) => product.image && !product.image.includes("nophoto"),
  );
  return anyImage?.image ?? CATEGORY_IMAGES[slug];
}

function buildCategoryStat(
  slug: CategorySlug,
  categoryProducts: Product[],
): CategoryStat {
  const count = categoryProducts.length;
  const minPrice = getMinProductPrice(categoryProducts);

  return {
    slug,
    title: CATEGORIES[slug].title,
    countLabel: count > 0 ? formatModelCount(count) : "Скоро в каталоге",
    priceFromLabel:
      count > 0 && Number.isFinite(minPrice)
        ? `от ${formatPrice(minPrice)}`
        : "Уточняйте цену",
    href: `/shop/${slug}`,
    image: pickCategoryCover(categoryProducts, slug),
  };
}

async function loadProductsForCategory(slug: CategorySlug): Promise<Product[]> {
  try {
    return await getCatalogProducts({ category: slug });
  } catch (error) {
    console.error(`Catalog unavailable for category "${slug}":`, error);
    return [];
  }
}

export async function getCategoryStats(): Promise<CategoryStat[]> {
  if (isAdvantShopConfigured()) {
    const lists = await Promise.all(
      CATALOG_CATEGORY_SLUGS.map((slug) => loadProductsForCategory(slug)),
    );

    return CATALOG_CATEGORY_SLUGS.map((slug, index) =>
      buildCategoryStat(slug, lists[index] ?? []),
    );
  }

  let catalogProducts: Product[] = [];
  try {
    catalogProducts = await getCatalogProducts();
  } catch (error) {
    console.error("Catalog unavailable for category stats:", error);
  }

  return CATALOG_CATEGORY_SLUGS.map((slug) => {
    const categoryProducts = catalogProducts.filter(
      (product) => product.category === slug,
    );
    return buildCategoryStat(slug, categoryProducts);
  });
}
