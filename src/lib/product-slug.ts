import type { CategorySlug, Product } from "@/lib/products";

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const GENERIC_LEGACY_SLUG =
  /^(koltsa|koltso|sergi|kole|podveski|podveska|braslety-na-ruku|braslety-na-nogu|braslet|shnurki|podarok)(-\d+)?$/i;

const CATEGORY_FALLBACK: Record<CategorySlug, string> = {
  rings: "koltsa",
  earrings: "sergi",
  pendants: "podveski",
  necklaces: "kole",
  bracelets: "braslety-na-ruku",
  "ankle-bracelets": "braslety-na-nogu",
  cords: "shnurki",
  gifts: "podarok",
};

function transliterate(value: string): string {
  return value
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");
}

function slugify(value: string): string {
  return transliterate(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function formatWeightSlug(weight: number): string {
  const normalized = weight.toFixed(2).replace(/\.?0+$/, "").replace(".", "-");
  return `${normalized}-karat`;
}

type BuildSeoProductSlugInput = {
  name: string;
  category: CategorySlug;
  stoneWeight: number;
  legacySlug: string;
  productId: string;
};

export function buildSeoProductSlug({
  name,
  category,
  stoneWeight,
  legacySlug,
  productId,
}: BuildSeoProductSlugInput): string {
  if (!GENERIC_LEGACY_SLUG.test(legacySlug)) {
    return legacySlug;
  }

  const fallback = CATEGORY_FALLBACK[category];
  let nameSlug = slugify(name)
    // Название уже содержит каратность / металл — не дублируем в хвосте slug.
    .replace(/-\d+(?:-\d+)?-karat$/i, "")
    .replace(/-(?:iz-)?serebra-925$/i, "")
    .replace(/-serebro-925$/i, "");

  if (!nameSlug || nameSlug === fallback) {
    nameSlug = `${fallback}-s-brilliantom`;
  }

  const slug = `${nameSlug}-${formatWeightSlug(stoneWeight)}-serebro-925-${productId}`
    .replace(/-{2,}/g, "-")
    .slice(0, 120);

  // Не обрезаем productId — по нему ищем товар после смены названия.
  if (!slug.endsWith(`-${productId}`)) {
    const maxBase = Math.max(0, 120 - productId.length - 1);
    return `${slug.slice(0, maxBase).replace(/-+$/g, "")}-${productId}`;
  }

  return slug || `${fallback}-${productId}`;
}

export function findProductBySlug(
  products: Product[],
  slug: string,
): Product | undefined {
  const normalized = slug.trim();
  if (!normalized) return undefined;

  const exactSlugMatches = products.filter((item) => item.slug === normalized);
  if (exactSlugMatches.length === 1) return exactSlugMatches[0];
  if (exactSlugMatches.length > 1) {
    const byIdSuffix = exactSlugMatches.find((item) =>
      normalized.endsWith(`-${item.id}`),
    );
    return byIdSuffix ?? exactSlugMatches[0];
  }

  const legacyMatches = products.filter((item) => item.urlPath === normalized);
  if (legacyMatches.length === 1) return legacyMatches[0];
  if (legacyMatches.length > 1) {
    const legacyIdMatch = legacyMatches.find((item) => {
      const suffix = item.urlPath?.match(/-(\d+)$/);
      return suffix?.[1] === item.id;
    });
    return legacyIdMatch ?? legacyMatches[0];
  }

  // Старые SEO-slug после смены названия в AdvantShop:
  // …-serebro-925-{productId} → ищем по id в конце URL.
  const idSuffix = normalized.match(/-(\d+)$/);
  if (idSuffix) {
    const productId = idSuffix[1];
    const byId = products.filter((item) => item.id === productId);
    if (byId.length === 1) return byId[0];
  }

  return undefined;
}

/** Любой URL, отличный от канонического slug, нужно редиректить. */
export function isLegacyProductSlug(
  slug: string,
  product: { slug: string; urlPath?: string },
): boolean {
  return slug.trim() !== product.slug;
}
