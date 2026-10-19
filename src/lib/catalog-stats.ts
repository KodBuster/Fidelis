import {
  CATALOG_CATEGORY_SLUGS,
  CATEGORIES,
  formatPrice,
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
  /** Как вписывать фото в карточку. */
  imageFit?: "cover" | "contain";
};

const CATEGORY_IMAGES: Record<CategorySlug, string> = {
  rings: "/images/categories/rings.jpg",
  "ankle-bracelets": "/images/categories/ankle-bracelets.png",
  bracelets: "/images/categories/bracelets.jpg",
  necklaces: "/images/categories/pendants.jpg",
  pendants: "/images/categories/pendants.jpg",
  earrings: "/images/categories/earrings.jpg",
  brooches: "/images/product-necklace.webp",
  "chain-pendants": "/images/categories/pendants.jpg",
  watches: "/images/categories/watches.jpg",
};

/** Категории с фиксированной обложкой (не подменять фото товара). */
const FIXED_CATEGORY_COVERS = new Set<CategorySlug>([
  "ankle-bracelets",
  "watches",
  "earrings",
]);

/** Обложка только из товаров категории (не статический jpg). */
const PRODUCT_PHOTO_CATEGORIES = new Set<CategorySlug>([
  "pendants",
  "brooches",
  "chain-pendants",
]);

/** Фото товара целиком в карточке (без обрезки). */
const CONTAIN_COVER_CATEGORIES = new Set<CategorySlug>([
  "bracelets",
  "ankle-bracelets",
  "pendants",
  "brooches",
  "chain-pendants",
  "earrings",
]);

/** Цена за изделие, не за грамм. */
const PRODUCT_PRICE_CATEGORIES = new Set<CategorySlug>(["watches"]);

function formatModelCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) return `${count} моделей`;
  if (mod10 === 1) return `${count} модель`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} модели`;
  return `${count} моделей`;
}

/** Минимальная цена за грамм (для подписей «от … ₽ / гр.» на главной). */
function getMinPricePerGram(products: Product[]): number {
  return products.reduce((min, product) => {
    if (
      typeof product.price !== "number" ||
      !Number.isFinite(product.price) ||
      product.price <= 0
    ) {
      return min;
    }
    return Math.min(min, product.price);
  }, Number.POSITIVE_INFINITY);
}

function isUsableProductImage(image?: string): boolean {
  if (!image) return false;
  return (
    !image.includes("nophoto") &&
    !image.includes("photo-coming-soon") &&
    !image.endsWith("photo-coming-soon.svg")
  );
}

function pickCategoryCover(products: Product[], slug: CategorySlug): string {
  if (FIXED_CATEGORY_COVERS.has(slug) && !PRODUCT_PHOTO_CATEGORIES.has(slug)) {
    return CATEGORY_IMAGES[slug];
  }

  const withImage = products.find(
    (product) =>
      isUsableProductImage(product.image) && product.inStock !== false,
  );
  if (withImage?.image) return withImage.image;

  const anyImage = products.find((product) =>
    isUsableProductImage(product.image),
  );
  if (anyImage?.image) return anyImage.image;

  // Для подвесок/брошей/кулонов без фото в каталоге — всё равно не
  // подставляем чужой статический баннер, если есть хоть один image.
  if (PRODUCT_PHOTO_CATEGORIES.has(slug) && products[0]?.image) {
    return products[0].image;
  }

  return CATEGORY_IMAGES[slug];
}

function buildCategoryStat(
  slug: CategorySlug,
  categoryProducts: Product[],
): CategoryStat {
  const count = categoryProducts.length;
  const minPrice = getMinPricePerGram(categoryProducts);
  const priceUnit = PRODUCT_PRICE_CATEGORIES.has(slug) ? "" : " / гр.";

  return {
    slug,
    title: CATEGORIES[slug].title,
    countLabel: count > 0 ? formatModelCount(count) : "Скоро в каталоге",
    priceFromLabel:
      count > 0 && Number.isFinite(minPrice)
        ? `от ${formatPrice(minPrice)}${priceUnit}`
        : "Уточняйте цену",
    href: `/shop/${slug}`,
    image: pickCategoryCover(categoryProducts, slug),
    imageFit: CONTAIN_COVER_CATEGORIES.has(slug) ? "contain" : "cover",
  };
}

async function loadProductsForCategory(slug: CategorySlug): Promise<Product[]> {
  try {
    // Без enrichStock: иначе главная ждёт сотни details и Amvera отдаёт 502.
    return await getCatalogProducts({ category: slug, enrichStock: false });
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
