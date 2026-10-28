import type { CartItem } from "@/lib/cart";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import { getProductDetails } from "@/lib/products-service";

export const OUT_OF_STOCK_CHECKOUT_MESSAGE =
  "К сожалению, эти изделия закончились. Пожалуйста, подберите вместо них другие. У нас ещё много чего есть.";

export type CartStockCheckResult = {
  ok: boolean;
  unavailable: Array<{
    name: string;
    size: string | null;
    productSlug: string;
  }>;
  message?: string;
};

function isCartItemAvailable(
  item: CartItem,
  details: Awaited<ReturnType<typeof getProductDetails>>,
): boolean {
  if (!details) return false;

  if (item.size && details.sizeStockAmounts) {
    const amount = details.sizeStockAmounts[item.size];
    if (typeof amount === "number" && Number.isFinite(amount)) {
      return amount >= item.quantity;
    }
  }

  if (typeof details.stockAmount === "number" && Number.isFinite(details.stockAmount)) {
    return details.stockAmount >= item.quantity;
  }

  if (details.inStock === false) return false;

  // Нет данных об остатке — не блокируем (как в каталоге)
  return true;
}

export async function checkCartItemsStock(
  items: CartItem[],
): Promise<CartStockCheckResult> {
  if (!isAdvantShopConfigured()) {
    return { ok: true, unavailable: [] };
  }

  const unavailable: CartStockCheckResult["unavailable"] = [];

  // getProductDetails — кэш light-каталога + details по slug (не N полных выгрузок).
  await Promise.all(
    items.map(async (item) => {
      try {
        const details = await getProductDetails(item.productSlug);
        if (!isCartItemAvailable(item, details)) {
          unavailable.push({
            name: item.name,
            size: item.size,
            productSlug: item.productSlug,
          });
        }
      } catch (error) {
        console.error(
          `Stock check failed for "${item.productSlug}":`,
          error,
        );
        // При ошибке API не блокируем весь заказ — AdvantShop CheckOrderItemAvailable подстрахует
      }
    }),
  );

  if (!unavailable.length) {
    return { ok: true, unavailable: [] };
  }

  return {
    ok: false,
    unavailable,
    message: OUT_OF_STOCK_CHECKOUT_MESSAGE,
  };
}
