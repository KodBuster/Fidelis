import {
  CATALOG_CATEGORY_SLUGS,
  CATEGORIES,
  formatPrice,
  type CategorySlug,
  type Product,
} from "@/lib/products";
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
};

function formatModelCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) return `${count} моделей`;
  if (mod10 === 1) return `${count} модель`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} модели`;
  return `${count} моделей`;
}

function getMinPrice(products: Product[]): number {
  return products.reduce(
    (min, product) => Math.min(min, product.price),
    Number.POSITIVE_INFINITY,
  );
}

function buildCategoryStat(
  slug: CategorySlug,
  categoryProducts: Product[],
): CategoryStat {
  const count = categoryProducts.length;
  const minPrice = getMinPrice(categoryProducts);

  return {
    slug,
    title: CATEGORIES[slug].title,
    countLabel: count > 0 ? formatModelCount(count) : "Скоро в каталоге",
    priceFromLabel:
      count > 0 && Number.isFinite(minPrice)
        ? `от ${formatPrice(minPrice)}`
        : "Уточняйте цену",
    href: `/shop/${slug}`,
    image: CATEGORY_IMAGES[slug],
  };
}

export async function getCategoryStats(): Promise<CategoryStat[]> {
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
