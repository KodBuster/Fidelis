export type CategorySlug =
  | "rings"
  | "earrings"
  | "pendants"
  | "necklaces"
  | "bracelets"
  | "ankle-bracelets"
  | "cords";

/** Категории с выбором размера (кольца и браслеты). */
export function categoryHasSizes(category: CategorySlug): boolean {
  return (
    category === "rings" ||
    category === "bracelets" ||
    category === "ankle-bracelets"
  );
}

export type ProductSizeOption = {
  /** Ключ размера из AdvantShop, например «16.0+4». */
  value: string;
  /** Подпись в интерфейсе — как в AdvantShop. */
  label: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  image: string;
  stoneWeight: number;
  badge?: "Хит" | "Новинка";
  isNew?: boolean;
  description?: string;
  images?: string[];
  color?: string;
  clarity?: string;
  cut?: string;
  metal?: string;
  sizeOptions?: ProductSizeOption[];
  artNo?: string;
  offerArtNos?: string[];
  sizeArtNos?: Record<string, string>;
  urlPath?: string;
  /** Артикулы комплекта из свойства AdvantShop «Set» (stocks.csv). */
  setArtNos?: string[];
  /** Суммарный остаток; undefined — данных нет. */
  stockAmount?: number;
  /** Товар доступен к покупке (остаток > 0 или неизвестен). */
  inStock?: boolean;
};

export type StoneVariant = {
  weight: number;
  label: string;
  price: number;
};

export type ProductDetails = Product & {
  description: string;
  images: string[];
  color: string;
  clarity: string;
  cut: string;
  metal: string;
  sizeOptions: ProductSizeOption[];
  stoneVariants: StoneVariant[];
  /** Вес изделия по умолчанию (г), если нет веса выбранного размера. */
  weightGrams?: string;
  /** Вес изделия (г) по ключу размера (value из sizeOptions). */
  sizeWeightGrams?: Record<string, string>;
  /** Цена оффера по ключу размера (value из sizeOptions). */
  sizePrices?: Record<string, number>;
  /** Подпись «Масса вставки» из свойства AdvantShop (не из описания). */
  diamondWeightLabel?: string;
  /** Масса вставки по ключу размера (артикул модификации). */
  sizeDiamondWeights?: Record<string, string>;
  /** Длина (мм) из AdvantShop — для браслетов в блоке «Характеристики». */
  lengthMmLabel?: string;
  /** Длина (мм) по ключу размера. */
  sizeLengthMm?: Record<string, string>;
  /** Остаток по ключу размера (value из sizeOptions). */
  sizeStockAmounts?: Record<string, number>;
};

export const CATEGORIES: Record<
  CategorySlug,
  { title: string; titlePlural: string; description: string }
> = {
  rings: {
    title: "Кольца",
    titlePlural: "Кольца",
    description: "Кольца из серебра 925",
  },
  "ankle-bracelets": {
    title: "Браслеты на ногу",
    titlePlural: "Браслеты на ногу",
    description: "Браслеты на ногу из серебра 925",
  },
  bracelets: {
    title: "Браслеты на руку",
    titlePlural: "Браслеты на руку",
    description: "Браслеты на руку из серебра 925",
  },
  necklaces: {
    title: "Колье",
    titlePlural: "Колье",
    description: "Колье из серебра 925",
  },
  pendants: {
    title: "Подвески",
    titlePlural: "Подвески",
    description: "Подвески из серебра 925",
  },
  earrings: {
    title: "Серьги",
    titlePlural: "Серьги",
    description: "Серьги-пусеты и подвесные модели из серебра 925",
  },
  cords: {
    title: "Шнурки",
    titlePlural: "Шнурки",
    description: "Шнурки для подвесок и кулонов",
  },
};

export const CATALOG_CATEGORY_SLUGS = Object.keys(
  CATEGORIES
) as CategorySlug[];

export const PRICE_RANGES = [
  { id: "0-15000", label: "до 15 000 ₽", min: 0, max: 15000 },
  { id: "15000-25000", label: "15 000 – 25 000 ₽", min: 15000, max: 25000 },
  { id: "25000-35000", label: "25 000 – 35 000 ₽", min: 25000, max: 35000 },
  { id: "35000+", label: "от 35 000 ₽", min: 35000, max: Infinity },
] as const;

export const STONE_WEIGHTS = [
  { id: "0.1", label: "0.1 карат", value: 0.1 },
  { id: "0.2", label: "0.2 карат", value: 0.2 },
  { id: "0.3", label: "0.3 карат", value: 0.3 },
  { id: "0.5", label: "0.5 карат", value: 0.5 },
  { id: "1+", label: "1+ карат", value: 1 },
] as const;

export const SORT_OPTIONS = [
  { id: "default", label: "По умолчанию" },
  { id: "price-asc", label: "Цена: по возрастанию" },
  { id: "price-desc", label: "Цена: по убыванию" },
  { id: "new", label: "Сначала новинки" },
] as const;

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "siyanie-ring",
    name: "Кольцо «Сияние»",
    category: "rings",
    price: 24900,
    image: "/images/product-bracelet.webp",
    stoneWeight: 0.2,
    badge: "Хит",
  },
  {
    id: "2",
    slug: "luna-ring",
    name: "Кольцо «Луна»",
    category: "rings",
    price: 18900,
    image: "/images/product-ring.webp",
    stoneWeight: 0.1,
  },
  {
    id: "3",
    slug: "aurora-ring",
    name: "Кольцо «Аврора»",
    category: "rings",
    price: 32500,
    image: "/images/product-bracelet.webp",
    stoneWeight: 0.3,
    isNew: true,
    badge: "Новинка",
  },
  {
    id: "4",
    slug: "grace-ring",
    name: "Кольцо «Грация»",
    category: "rings",
    price: 42800,
    image: "/images/product-ring.webp",
    stoneWeight: 0.5,
  },
  {
    id: "5",
    slug: "solitaire-ring",
    name: "Кольцо-солитер",
    category: "rings",
    price: 14900,
    image: "/images/product-bracelet.webp",
    stoneWeight: 0.1,
  },
  {
    id: "6",
    slug: "stud-earrings",
    name: "Серьги-пусеты",
    category: "earrings",
    price: 19800,
    image: "/images/product-earrings.webp",
    stoneWeight: 0.2,
    badge: "Новинка",
    isNew: true,
  },
  {
    id: "7",
    slug: "spark-earrings",
    name: "Серьги «Искра»",
    category: "earrings",
    price: 12900,
    image: "/images/product-earrings.webp",
    stoneWeight: 0.1,
  },
  {
    id: "8",
    slug: "drop-earrings",
    name: "Серьги-подвески",
    category: "earrings",
    price: 27400,
    image: "/images/product-earrings.webp",
    stoneWeight: 0.3,
  },
  {
    id: "9",
    slug: "halo-earrings",
    name: "Серьги с ободком",
    category: "earrings",
    price: 35900,
    image: "/images/product-earrings.webp",
    stoneWeight: 0.5,
  },
  {
    id: "10",
    slug: "cross-pendant",
    name: "Подвеска-крестик",
    category: "pendants",
    price: 16500,
    image: "/images/product-necklace.webp",
    stoneWeight: 0.1,
  },
  {
    id: "11",
    slug: "heart-pendant",
    name: "Подвеска «Сердце»",
    category: "pendants",
    price: 21900,
    image: "/images/product-necklace.webp",
    stoneWeight: 0.2,
    badge: "Хит",
  },
  {
    id: "12",
    slug: "star-pendant",
    name: "Подвеска «Звезда»",
    category: "pendants",
    price: 14200,
    image: "/images/product-necklace.webp",
    stoneWeight: 0.1,
  },
  {
    id: "13",
    slug: "line-necklace",
    name: "Колье-линия",
    category: "pendants",
    price: 38900,
    image: "/images/product-necklace.webp",
    stoneWeight: 0.5,
    isNew: true,
  },
  {
    id: "14",
    slug: "tennis-bracelet",
    name: "Браслет теннисный",
    category: "bracelets",
    price: 42000,
    image: "/images/product-ring.webp",
    stoneWeight: 1,
  },
  {
    id: "15",
    slug: "chain-bracelet",
    name: "Браслет цепной",
    category: "bracelets",
    price: 23800,
    image: "/images/product-bracelet.webp",
    stoneWeight: 0.2,
  },
  {
    id: "16",
    slug: "light-bracelet",
    name: "Браслет «Свет»",
    category: "bracelets",
    price: 18500,
    image: "/images/product-ring.webp",
    stoneWeight: 0.1,
  },
];

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")} ₽`;
}

export function isValidCategory(slug: string): slug is CategorySlug {
  return slug in CATEGORIES;
}

const STONE_VARIANT_WEIGHTS = [0.1, 0.2, 0.3, 0.5, 1] as const;

export const RING_BRACELET_SIZES = [
  15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21,
] as const;

export function defaultRingBraceletSizeOptions(): ProductSizeOption[] {
  return RING_BRACELET_SIZES.map((size) => ({
    value: String(size),
    label: String(size),
  }));
}

export function numericSizesFromOptions(
  options: ProductSizeOption[],
): number[] {
  return options
    .map((option) => Number.parseFloat(option.value.replace(",", ".")))
    .filter((size) => !Number.isNaN(size));
}

function parseSizeSortKey(value: string): number {
  const match = value.trim().replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  if (!match) return Number.NaN;
  return Number.parseFloat(match[1]);
}

export function sortProductSizeOptions(
  options: ProductSizeOption[],
): ProductSizeOption[] {
  return [...options].sort((a, b) => {
    const aNum = parseSizeSortKey(a.value);
    const bNum = parseSizeSortKey(b.value);
    const aValid = !Number.isNaN(aNum);
    const bValid = !Number.isNaN(bNum);
    if (aValid && bValid) return aNum - bNum;
    if (aValid) return -1;
    if (bValid) return 1;
    return a.label.localeCompare(b.label, "ru", { numeric: true });
  });
}

export function getProductSizeLabel(
  product: Pick<Product, "sizeOptions">,
  sizeValue: string | null,
): string | undefined {
  if (!sizeValue) return undefined;
  return (
    product.sizeOptions?.find((option) => option.value === sizeValue)?.label ??
    sizeValue
  );
}

export function getProductSizePrice(
  product: Pick<ProductDetails, "price" | "sizePrices">,
  sizeValue: string | null,
): number {
  if (sizeValue && product.sizePrices?.[sizeValue] != null) {
    return product.sizePrices[sizeValue];
  }
  return product.price;
}

const DEFAULT_SIZE_OPTIONS = defaultRingBraceletSizeOptions();

const CATEGORY_IMAGES: Record<CategorySlug, string[]> = {
  rings: ["/images/product-bracelet.webp", "/images/product-ring.webp"],
  "ankle-bracelets": [
    "/images/product-bracelet.webp",
    "/images/product-ring.webp",
  ],
  bracelets: ["/images/product-ring.webp", "/images/product-bracelet.webp"],
  necklaces: ["/images/product-necklace.webp"],
  pendants: ["/images/product-necklace.webp"],
  earrings: ["/images/product-earrings.webp"],
  cords: ["/images/product-necklace.webp", "/images/product-bracelet.webp"],
};

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductDetails(slug: string): ProductDetails | undefined {
  const product = getProductBySlug(slug);
  if (!product) return undefined;

  const baseWeight = product.stoneWeight;
  const stoneVariants: StoneVariant[] = STONE_VARIANT_WEIGHTS.map((weight) => ({
    weight,
    label: weight >= 1 ? "1 карат" : `${weight} карат`,
    price: Math.round(product.price * (weight / baseWeight)),
  }));

  const categoryImages = CATEGORY_IMAGES[product.category];
  const images = product.images ?? [
    product.image,
    categoryImages[1] ?? product.image,
    categoryImages[0] ?? product.image,
  ];

  const hasSizes = categoryHasSizes(product.category);

  return {
    ...product,
    description:
      product.description ??
      `${product.name} — украшение из серебра 925 пробы. Идеально для повседневной носки и особых моментов.`,
    images,
    color: product.color ?? "2",
    clarity: product.clarity ?? "5",
    cut: product.cut ?? "",
    metal: product.metal ?? "Серебро 925, родиевое покрытие",
    sizeOptions: sortProductSizeOptions(
      product.sizeOptions ?? (hasSizes ? [...DEFAULT_SIZE_OPTIONS] : []),
    ),
    stoneVariants,
  };
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(
    0,
    limit
  );
}
