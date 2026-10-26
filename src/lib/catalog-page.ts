import { CATALOG_REVALIDATE_SECONDS } from "@/lib/advantshop/config";
import type { CategorySlug, Product } from "@/lib/products";
import { getCatalogProducts } from "@/lib/products-service";

export const CATALOG_PAGE_REVALIDATE = CATALOG_REVALIDATE_SECONDS;

export type CatalogPageData = {
  initialProducts: Product[];
  catalogError?: string;
};

export async function loadCatalogPageData(
  category?: CategorySlug
): Promise<CatalogPageData> {
  try {
    const initialProducts = await getCatalogProducts({
      category,
      enrichStock: false,
    });
    return { initialProducts };
  } catch (error) {
    return {
      initialProducts: [],
      catalogError:
        error instanceof Error
          ? error.message
          : "Не удалось загрузить каталог из AdvantShop",
    };
  }
}
