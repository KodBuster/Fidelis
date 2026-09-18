import type { CategorySlug } from "@/lib/products";
import { categoryHasSizes } from "@/lib/products";
import type {
  AdvantShopCatalogProduct,
  AdvantShopOffer,
  AdvantShopProductDetails,
} from "./types";

/** Нормализует amount из API (number или numeric string). */
export function parseAdvantShopAmount(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

/**
 * Суммарный остаток товара.
 * Если у offers есть amount — суммируем их.
 * Иначе берём amount на уровне товара.
 * Если данных о остатке нет — `undefined`.
 */
export function getAdvantShopStockAmount(
  item: Pick<AdvantShopCatalogProduct, "amount" | "offers">,
): number | undefined {
  const offers = item.offers ?? [];
  const offerAmounts = offers
    .map((offer) => parseAdvantShopAmount(offer.amount))
    .filter((value): value is number => value !== undefined);

  if (offerAmounts.length > 0) {
    return offerAmounts.reduce((sum, value) => sum + value, 0);
  }

  return parseAdvantShopAmount(item.amount);
}

/** Товар в наличии по данным списка каталога (часто неточные без offers). */
export function isAdvantShopProductInStock(
  item: Pick<AdvantShopCatalogProduct, "amount" | "offers">,
): boolean {
  const amount = getAdvantShopStockAmount(item);
  if (amount === undefined) return true;
  return amount > 0;
}

/** Оффер с явным amount > 0. */
export function isOfferInStock(offer: Pick<AdvantShopOffer, "amount">): boolean {
  const amount = parseAdvantShopAmount(offer.amount);
  if (amount === undefined) return false;
  return amount > 0;
}

export function hasOfferStockData(
  item: Pick<AdvantShopProductDetails, "offers">,
): boolean {
  return (item.offers ?? []).some(
    (offer) => parseAdvantShopAmount(offer.amount) !== undefined,
  );
}

/** Офферы с amount > 0. Если amount нигде нет — возвращаем все офферы. */
export function getInStockOffers(
  item: Pick<AdvantShopProductDetails, "offers">,
): AdvantShopOffer[] {
  const offers = item.offers ?? [];
  if (!offers.length) return [];

  if (!hasOfferStockData(item)) return offers;

  return offers.filter(isOfferInStock);
}

function productNeedsSizes(
  category: CategorySlug | undefined,
  sizesCount: number,
): boolean {
  if (sizesCount > 0) return true;
  return Boolean(category && categoryHasSizes(category));
}

/**
 * Размеры, которые реально можно купить:
 * sizeColorPicker ∩ офферы с amount > 0 по sizeId.
 * Без совпадения sizeId — пусто (товар нельзя оформить по размеру).
 */
export function getAvailableSizePickerSizes(
  item: Pick<AdvantShopProductDetails, "offers" | "sizeColorPicker">,
): { id: number; name: string }[] {
  const allSizes = item.sizeColorPicker?.sizes ?? [];
  if (!allSizes.length) return [];

  if (!hasOfferStockData(item)) return allSizes;

  const inStockOffers = getInStockOffers(item);
  if (!inStockOffers.length) return [];

  const inStockSizeIds = new Set(
    inStockOffers
      .map((offer) => offer.sizeId)
      .filter((id): id is number => typeof id === "number"),
  );

  if (!inStockSizeIds.size) return [];

  return allSizes.filter((size) => inStockSizeIds.has(size.id));
}

/**
 * Единый признак «можно показать в каталоге / купить».
 * Совпадает с логикой карточки товара (иначе каталог и страница расходятся).
 */
export function isAdvantShopDetailsInStock(
  item: Pick<AdvantShopProductDetails, "amount" | "offers" | "sizeColorPicker">,
  category?: CategorySlug,
): boolean {
  const sizes = item.sizeColorPicker?.sizes ?? [];
  const needsSizes = productNeedsSizes(category, sizes.length);
  const availableSizes = getAvailableSizePickerSizes(item);

  if (hasOfferStockData(item)) {
    if (!getInStockOffers(item).length) return false;
    // Кольца/браслеты и товары с размерами — только если есть размер с остатком
    if (needsSizes) return availableSizes.length > 0;
    return true;
  }

  const amount = getAdvantShopStockAmount(item);
  if (amount === undefined) {
    // Нет данных об остатке: кольца без picker всё равно не продаём
    if (needsSizes && sizes.length === 0) return false;
    return true;
  }
  if (amount <= 0) return false;
  if (needsSizes) return availableSizes.length > 0 || sizes.length > 0;
  return true;
}

export type AdvantShopStockInfo = {
  stockAmount?: number;
  inStock: boolean;
  /** Артикулы с карточки (включая модификации размеров) — для поиска. */
  offerArtNos?: string[];
  /** Цена для каталога: оффер в наличии, не «Главная» с нулевым остатком. */
  listPrice?: number;
};

export function getAdvantShopDetailsStockInfo(
  item: Pick<
    AdvantShopProductDetails,
    "amount" | "offers" | "sizeColorPicker" | "artNo"
  >,
  category?: CategorySlug,
): AdvantShopStockInfo {
  const offerArtNos = new Set<string>();
  const add = (value?: string | null) => {
    const trimmed = value?.trim();
    if (trimmed) offerArtNos.add(trimmed);
  };
  add(item.artNo);
  for (const offer of item.offers ?? []) {
    add(offer.artNo);
  }

  return {
    stockAmount: getAdvantShopStockAmount(item),
    inStock: isAdvantShopDetailsInStock(item, category),
    offerArtNos: [...offerArtNos],
  };
}
