import type { CategorySlug, Product } from "./products";

export const GIFTS_MAX_PRICE = 30_000;
export const GIFTS_MAX_COUNT = 12;
export const GIFTS_REFRESH_HOUR = 8;
export const GIFTS_TIMEZONE = "Europe/Moscow";

export const GIFT_SOURCE_CATEGORIES: CategorySlug[] = [
  "rings",
  "earrings",
  "pendants",
  "necklaces",
  "bracelets",
  "ankle-bracelets",
  "cords",
];

type MoscowDateParts = {
  year: string;
  month: string;
  day: string;
  hour: number;
};

function getMoscowDateParts(date: Date): MoscowDateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: GIFTS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: Number(get("hour")),
  };
}

function formatPeriodId(parts: Pick<MoscowDateParts, "year" | "month" | "day">) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** Period id changes every day at 08:00 Moscow time. */
export function getGiftPeriodId(now = new Date()): string {
  const moscow = getMoscowDateParts(now);

  if (moscow.hour >= GIFTS_REFRESH_HOUR) {
    return formatPeriodId(moscow);
  }

  const year = Number(moscow.year);
  const month = Number(moscow.month);
  const day = Number(moscow.day);
  const today8amMskUtc = Date.UTC(year, month - 1, day, 5, 0, 0);
  const previousDay = new Date(today8amMskUtc - 86_400_000);

  return formatPeriodId(getMoscowDateParts(previousDay));
}

export function getSecondsUntilNextGiftRefresh(now = new Date()): number {
  const moscow = getMoscowDateParts(now);
  const year = Number(moscow.year);
  const month = Number(moscow.month);
  const day = Number(moscow.day);
  const today8amMskUtc = Date.UTC(year, month - 1, day, 5, 0, 0);

  const nextRefreshUtc =
    moscow.hour >= GIFTS_REFRESH_HOUR
      ? today8amMskUtc + 86_400_000
      : today8amMskUtc;

  return Math.max(60, Math.ceil((nextRefreshUtc - now.getTime()) / 1000));
}

function hashString(value: string): number {
  let hash = 2_166_136_261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  let state = hashString(seed);

  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1_664_525) + 1_013_903_223) >>> 0;
    const swapIndex = state % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function sortGiftProducts(products: Product[], sort: string): Product[] {
  const result = [...products];

  switch (sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "new":
      result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    default:
      break;
  }

  return result;
}

export function pickGiftProducts(
  products: Product[],
  sort = "default",
  periodId = getGiftPeriodId()
): Product[] {
  const eligible = products.filter(
    (product) =>
      GIFT_SOURCE_CATEGORIES.includes(product.category) &&
      product.price <= GIFTS_MAX_PRICE
  );

  const dailyPick = seededShuffle(eligible, periodId).slice(0, GIFTS_MAX_COUNT);
  return sortGiftProducts(dailyPick, sort);
}
