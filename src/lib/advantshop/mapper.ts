import type { CategorySlug, Product, ProductDetails, ProductSizeOption, StoneVariant } from "@/lib/products";
import { defaultRingBraceletSizeOptions, sortProductSizeOptions } from "@/lib/products";
import {
  formatDiamondWeightLabel,
  isDiamondWeightPropertyName,
  parseCaratWeightFromDescription,
  parseDiamondWeightNumber,
} from "@/lib/product-weight";
import {
  formatLengthMmLabel,
  isLengthMmPropertyName,
} from "@/lib/product-length";
import { resolveSetArtNos } from "@/lib/product-complect";
import { buildSeoProductSlug } from "@/lib/product-slug";
import { normalizeProductDescription } from "@/lib/product-description";
import { resolveProductImageUrl, resolveProductImages } from "./images";
import {
  getAdvantShopDetailsStockInfo,
  getAdvantShopStockAmount,
  getAvailableSizePickerSizes,
  parseAdvantShopAmount,
  type AdvantShopStockInfo,
} from "./stock";
import type {
  AdvantShopCatalogProduct,
  AdvantShopOffer,
  AdvantShopPhoto,
  AdvantShopProductDetails,
  AdvantShopProperty,
} from "./types";

function collectOfferArtNos(
  item: Pick<AdvantShopCatalogProduct, "artNo" | "offers">,
): string[] {
  const artNos = new Set<string>();
  const add = (value?: string | null) => {
    const trimmed = value?.trim();
    if (trimmed) artNos.add(trimmed);
  };

  add(item.artNo);
  for (const offer of item.offers ?? []) {
    add(offer.artNo);
  }

  return [...artNos];
}

export function extractProductSizeOptions(
  item: Pick<AdvantShopProductDetails, "sizeColorPicker">,
): ProductSizeOption[] {
  return (
    item.sizeColorPicker?.sizes?.map((size) => {
      const label = size.name.trim();
      return { value: label, label };
    }) ?? []
  );
}

/** @deprecated Используйте extractProductSizeOptions */
export function extractProductSizes(
  item: Pick<AdvantShopProductDetails, "sizeColorPicker">,
  _category: CategorySlug
): number[] {
  return extractProductSizeOptions(item)
    .map((option) => Number.parseFloat(option.value.replace(",", ".")))
    .filter((size) => !Number.isNaN(size));
}

const DEFAULT_IMAGE = "/images/product-ring.webp";

const STONE_VARIANT_WEIGHTS = [0.1, 0.2, 0.3, 0.5, 1] as const;

function pickImage(
  product: Pick<
    AdvantShopCatalogProduct,
    "photoMiddle" | "photoSmall" | "photos"
  >
): string {
  if (product.photoMiddle) return product.photoMiddle;
  if (product.photoSmall) return product.photoSmall;

  const photos = product.photos ?? [];
  const main =
    photos.find((photo) => photo.main) ?? photos[0];

  return (
    main?.middleSrc ??
    main?.bigSrc ??
    main?.smallSrc ??
    DEFAULT_IMAGE
  );
}

function collectImages(photos?: AdvantShopPhoto[] | null): string[] {
  if (!photos?.length) return [];

  return photos
    .map((photo) => photo.bigSrc ?? photo.middleSrc ?? photo.smallSrc)
    .filter((src): src is string => Boolean(src));
}

type DiamondWeightEntry = {
  label: string;
  numeric: number;
  offerId?: number;
  artNo?: string;
};

function propertyDisplayName(property: AdvantShopProperty): string {
  return property.propertyName ?? property.name ?? property.Name ?? "";
}

function collectDiamondWeightEntries(
  properties: AdvantShopProperty[],
): DiamondWeightEntry[] {
  const entries: DiamondWeightEntry[] = [];

  const push = (
    raw?: string | null,
    offerId?: number | null,
    artNo?: string | null,
  ) => {
    const label = formatDiamondWeightLabel(raw);
    const numeric = parseDiamondWeightNumber(raw);
    if (!label || numeric === undefined) return;
    entries.push({
      label,
      numeric,
      offerId: offerId ?? undefined,
      artNo: artNo?.trim() || undefined,
    });
  };

  for (const property of properties) {
    if (!isDiamondWeightPropertyName(propertyDisplayName(property))) continue;

    const nested = [
      ...(property.propertyValues ?? []),
      ...(property.values ?? []),
      ...(property.selectedPropertyValues ?? []),
      ...(property.SelectedPropertyValues ?? []),
    ];
    if (nested.length) {
      for (const item of nested) {
        push(
          item.propertyValue ?? item.value ?? item.Value,
          item.offerId ?? item.OfferId,
          item.artNo ?? item.offerArtNo,
        );
      }
      continue;
    }

    push(
      property.propertyValue ?? property.value,
      property.offerId,
      property.artNo ?? property.offerArtNo,
    );
  }

  return entries;
}

function offerDiamondWeightLabel(
  offer?: AdvantShopOffer,
): string | undefined {
  if (!offer) return undefined;
  const props = [...(offer.properties ?? []), ...(offer.params ?? [])];
  for (const property of props) {
    if (!isDiamondWeightPropertyName(propertyDisplayName(property))) continue;
    const selected = [
      ...(property.selectedPropertyValues ?? []),
      ...(property.SelectedPropertyValues ?? []),
    ][0];
    const label = formatDiamondWeightLabel(
      property.propertyValue ??
        property.value ??
        selected?.propertyValue ??
        selected?.value ??
        selected?.Value,
    );
    if (label) return label;
  }
  return undefined;
}

function buildSizeDiamondWeights(
  item: AdvantShopProductDetails,
  sizes: { id: number; name: string }[],
  properties: AdvantShopProperty[],
): Record<string, string> | undefined {
  if (!sizes.length) return undefined;

  const entries = collectDiamondWeightEntries(properties);
  const map: Record<string, string> = {};

  for (const size of sizes) {
    const sizeKey = size.name.trim();
    if (!sizeKey) continue;
    const offer = item.offers?.find((entry) => entry.sizeId === size.id);

    const fromOffer = offerDiamondWeightLabel(offer);
    if (fromOffer) {
      map[sizeKey] = fromOffer;
      continue;
    }
    if (!offer) continue;

    const byOfferId = entries.find(
      (entry) => entry.offerId != null && entry.offerId === offer.offerId,
    );
    if (byOfferId) {
      map[sizeKey] = byOfferId.label;
      continue;
    }

    const offerArtNo = offer.artNo?.trim().toLowerCase();
    if (!offerArtNo) continue;
    const byArtNo = entries.find(
      (entry) => entry.artNo?.trim().toLowerCase() === offerArtNo,
    );
    if (byArtNo) map[sizeKey] = byArtNo.label;
  }

  return Object.keys(map).length ? map : undefined;
}

type LengthMmEntry = {
  label: string;
  offerId?: number;
  artNo?: string;
};

function collectLengthMmEntries(properties: AdvantShopProperty[]): LengthMmEntry[] {
  const entries: LengthMmEntry[] = [];

  const push = (
    raw?: string | number | null,
    offerId?: number | null,
    artNo?: string | null,
  ) => {
    const label = formatLengthMmLabel(raw);
    if (!label) return;
    entries.push({
      label,
      offerId: offerId ?? undefined,
      artNo: artNo?.trim() || undefined,
    });
  };

  for (const property of properties) {
    if (!isLengthMmPropertyName(propertyDisplayName(property))) continue;

    const nested = [
      ...(property.propertyValues ?? []),
      ...(property.values ?? []),
      ...(property.selectedPropertyValues ?? []),
      ...(property.SelectedPropertyValues ?? []),
    ];
    if (nested.length) {
      for (const item of nested) {
        push(
          item.propertyValue ?? item.value ?? item.Value,
          item.offerId ?? item.OfferId,
          item.artNo ?? item.offerArtNo,
        );
      }
      continue;
    }

    push(
      property.propertyValue ?? property.value,
      property.offerId,
      property.artNo ?? property.offerArtNo,
    );
  }

  return entries;
}

function offerLengthMmLabel(offer?: AdvantShopOffer): string | undefined {
  if (!offer) return undefined;

  const fromField = formatLengthMmLabel(offer.length);
  if (fromField) return fromField;

  const props = [...(offer.properties ?? []), ...(offer.params ?? [])];
  for (const property of props) {
    if (!isLengthMmPropertyName(propertyDisplayName(property))) continue;
    const selected = [
      ...(property.selectedPropertyValues ?? []),
      ...(property.SelectedPropertyValues ?? []),
    ][0];
    const label = formatLengthMmLabel(
      property.propertyValue ??
        property.value ??
        selected?.propertyValue ??
        selected?.value ??
        selected?.Value,
    );
    if (label) return label;
  }

  return undefined;
}

function buildSizeLengthMm(
  item: AdvantShopProductDetails,
  sizes: { id: number; name: string }[],
  properties: AdvantShopProperty[],
): Record<string, string> | undefined {
  if (!sizes.length) return undefined;

  const entries = collectLengthMmEntries(properties);
  const map: Record<string, string> = {};

  for (const size of sizes) {
    const sizeKey = size.name.trim();
    if (!sizeKey) continue;
    const offer = item.offers?.find((entry) => entry.sizeId === size.id);

    const fromOffer = offerLengthMmLabel(offer);
    if (fromOffer) {
      map[sizeKey] = fromOffer;
      continue;
    }
    if (!offer) continue;

    const byOfferId = entries.find(
      (entry) => entry.offerId != null && entry.offerId === offer.offerId,
    );
    if (byOfferId) {
      map[sizeKey] = byOfferId.label;
      continue;
    }

    const offerArtNo = offer.artNo?.trim().toLowerCase();
    if (!offerArtNo) continue;
    const byArtNo = entries.find(
      (entry) => entry.artNo?.trim().toLowerCase() === offerArtNo,
    );
    if (byArtNo) map[sizeKey] = byArtNo.label;
  }

  return Object.keys(map).length ? map : undefined;
}

function pickDefaultLengthMm(
  item: AdvantShopProductDetails,
  sizeLengthMm: Record<string, string> | undefined,
  properties: AdvantShopProperty[],
): string | undefined {
  const available = getAvailableSizePickerSizes(item);
  for (const size of available) {
    const label = sizeLengthMm?.[size.name.trim()];
    if (label) return label;
  }

  if (sizeLengthMm) {
    const first = Object.values(sizeLengthMm).find(Boolean);
    if (first) return first;
  }

  const fromOffer = item.offers
    ?.map((offer) => offerLengthMmLabel(offer))
    .find(Boolean);
  if (fromOffer) return fromOffer;

  return collectLengthMmEntries(properties)[0]?.label;
}

export function parseLengthMmLabelFromProperties(
  properties: AdvantShopProperty[],
): string | undefined {
  return collectLengthMmEntries(properties)[0]?.label;
}

function pickDefaultDiamondWeight(
  item: AdvantShopProductDetails,
  sizeDiamondWeights: Record<string, string> | undefined,
  properties: AdvantShopProperty[],
): DiamondWeightEntry | undefined {
  const available = getAvailableSizePickerSizes(item);
  for (const size of available) {
    const label = sizeDiamondWeights?.[size.name.trim()];
    const numeric = parseDiamondWeightNumber(label);
    if (label && numeric !== undefined) return { label, numeric };
  }

  if (sizeDiamondWeights) {
    const first = Object.values(sizeDiamondWeights).find(Boolean);
    const numeric = parseDiamondWeightNumber(first);
    if (first && numeric !== undefined) return { label: first, numeric };
  }

  return collectDiamondWeightEntries(properties)[0];
}

export function parseDiamondWeightLabelFromProperties(
  properties: AdvantShopProperty[],
): string | undefined {
  return collectDiamondWeightEntries(properties)[0]?.label;
}

function parseWeightGrams(properties: AdvantShopProperty[]): string | undefined {
  const fromProperty = parseProperty(properties, [
    "вес, гр.",
    "вес, гр",
    "вес гр",
  ]);
  if (fromProperty?.trim()) return fromProperty.trim();

  for (const property of properties) {
    const name = (property.propertyName ?? property.name ?? "").toLowerCase();
    const value = (property.propertyValue ?? property.value ?? "").trim();
    if (!value) continue;

    if (name === "вес, гр." || (name.includes("вес") && name.includes("гр"))) {
      return value;
    }
  }

  return undefined;
}

/** Нормализует вес оффера в строку для UI («2,71»). */
function formatOfferWeightGrams(
  weight: number | string | null | undefined,
): string | undefined {
  if (weight == null || weight === "") return undefined;
  const num =
    typeof weight === "number"
      ? weight
      : Number(String(weight).trim().replace(",", "."));
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return String(num).replace(".", ",");
}

function buildSizeWeightGrams(
  item: AdvantShopProductDetails,
  sizes: { id: number; name: string }[],
): Record<string, string> | undefined {
  if (!sizes.length || !item.offers?.length) return undefined;

  const map: Record<string, string> = {};
  for (const size of sizes) {
    const sizeKey = size.name.trim();
    if (!sizeKey) continue;
    const offer = item.offers.find((entry) => entry.sizeId === size.id);
    const formatted = formatOfferWeightGrams(offer?.weight);
    if (formatted) map[sizeKey] = formatted;
  }

  return Object.keys(map).length ? map : undefined;
}

function buildSizePrices(
  item: AdvantShopProductDetails,
  sizes: { id: number; name: string }[],
): Record<string, number> | undefined {
  if (!sizes.length || !item.offers?.length) return undefined;

  const map: Record<string, number> = {};
  for (const size of sizes) {
    const sizeKey = size.name.trim();
    if (!sizeKey) continue;
    const offer = item.offers.find((entry) => entry.sizeId === size.id);
    const price = pickPositivePrice(offer?.price);
    if (price !== undefined) map[sizeKey] = price;
  }

  return Object.keys(map).length ? map : undefined;
}

function pickDefaultWeightGrams(
  item: AdvantShopProductDetails,
  properties: AdvantShopProperty[],
  sizeWeightGrams?: Record<string, string>,
): string | undefined {
  const main = item.offers?.find((offer) => offer.isMain);
  const fromMain = formatOfferWeightGrams(main?.weight);
  if (fromMain) return fromMain;

  if (sizeWeightGrams) {
    const first = Object.values(sizeWeightGrams).find(Boolean);
    if (first) return first;
  }

  const fromOffer = item.offers
    ?.map((offer) => formatOfferWeightGrams(offer.weight))
    .find(Boolean);
  if (fromOffer) return fromOffer;

  return parseWeightGrams(properties);
}

function parseProperty(
  properties: AdvantShopProperty[],
  keywords: string[]
): string | undefined {
  for (const property of properties) {
    const name = (property.propertyName ?? property.name ?? "").toLowerCase();
    if (keywords.some((keyword) => name.includes(keyword))) {
      const value = (property.propertyValue ?? property.value)?.trim();
      if (value) return value;
    }
  }

  return undefined;
}

function pickPositivePrice(
  ...candidates: Array<number | null | undefined>
): number | undefined {
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return Math.round(value);
    }
  }
  return undefined;
}

export function pickOfferPrice(
  offers: AdvantShopOffer[] | null | undefined,
): number {
  if (!offers?.length) return 0;

  const inStock = offers.filter((offer) => {
    const amount = parseAdvantShopAmount(offer.amount);
    return amount === undefined || amount > 0;
  });

  const fromInStockMain = pickPositivePrice(
    inStock.find((offer) => offer.isMain)?.price,
  );
  if (fromInStockMain !== undefined) return fromInStockMain;

  const fromInStock = pickPositivePrice(
    ...inStock.map((offer) => offer.price),
  );
  if (fromInStock !== undefined) return fromInStock;

  const main = offers.find((offer) => offer.isMain);
  const fromMain = pickPositivePrice(main?.price);
  if (fromMain !== undefined) return fromMain;

  const withPrice = offers.find((offer) => (offer.price ?? 0) > 0);
  return pickPositivePrice(withPrice?.price, offers[0]?.price) ?? 0;
}

/** Product-level ArtNo only — never an offer/modification artNo. */
function pickDefaultArtNo(
  item: Pick<AdvantShopProductDetails, "artNo">,
): string {
  return item.artNo?.trim() ?? "";
}

function buildSizeArtNos(
  item: AdvantShopProductDetails,
  sizes: { id: number; name: string }[],
): Record<string, string> | undefined {
  if (!sizes.length || !item.offers?.length) {
    return undefined;
  }

  const map: Record<string, string> = {};
  const fallbackArtNo = pickDefaultArtNo(item);

  for (const size of sizes) {
    const sizeKey = size.name.trim();
    if (!sizeKey) continue;

    const offer = item.offers.find((entry) => entry.sizeId === size.id);
    const artNo = offer?.artNo ?? fallbackArtNo;
    if (artNo) map[sizeKey] = artNo;
  }

  return Object.keys(map).length ? map : undefined;
}

function buildSizeStockAmounts(
  item: AdvantShopProductDetails,
  sizes: { id: number; name: string }[],
): Record<string, number> | undefined {
  if (!sizes.length || !item.offers?.length) return undefined;

  const map: Record<string, number> = {};
  for (const size of sizes) {
    const sizeKey = size.name.trim();
    if (!sizeKey) continue;
    const offer = item.offers.find((entry) => entry.sizeId === size.id);
    const amount = offer ? parseAdvantShopAmount(offer.amount) : undefined;
    if (amount === undefined) continue;
    map[sizeKey] = amount;
  }

  return Object.keys(map).length ? map : undefined;
}

function mapBadge(
  product: Pick<AdvantShopCatalogProduct, "newProduct" | "bestseller" | "sales">
): Product["badge"] {
  if (product.newProduct) return "Новинка";
  if (product.bestseller) return "Хит";
  if (product.sales) return "Хит";
  return undefined;
}

function resolveCatalogSizeOptions(
  sizeOptions: ProductSizeOption[],
  category: CategorySlug
): ProductSizeOption[] | undefined {
  const needsSizes =
    category === "rings" || category === "bracelets" || sizeOptions.length > 0;
  if (!needsSizes) return undefined;
  if (sizeOptions.length) return sortProductSizeOptions(sizeOptions);
  if (category === "rings" || category === "bracelets") {
    return defaultRingBraceletSizeOptions();
  }
  return undefined;
}

export function mapCatalogProduct(
  item: AdvantShopCatalogProduct,
  category: CategorySlug,
  setArtNos?: string[],
  stock?: AdvantShopStockInfo,
): Product {
  const price =
    pickPositivePrice(
      stock?.listPrice,
      pickOfferPrice(item.offers),
      item.priceWithDiscount,
      item.price,
    ) ?? 0;
  const sizeOptions = extractProductSizeOptions(item);

  const description = item.briefDescription || undefined;
  const stoneWeight = description
    ? (parseCaratWeightFromDescription(description) ?? 0.2)
    : 0.2;
  const legacySlug = item.urlPath;
  const artNo = item.artNo?.trim() || undefined;
  const stockAmount = stock?.stockAmount ?? getAdvantShopStockAmount(item);
  const inStock =
    stock?.inStock ??
    (stockAmount === undefined ? true : stockAmount > 0);
  const listOfferArtNos = collectOfferArtNos(item);
  const offerArtNos = stock?.offerArtNos?.length
    ? [...new Set([...stock.offerArtNos, ...listOfferArtNos])]
    : listOfferArtNos;

  return {
    id: String(item.productId),
    slug: buildSeoProductSlug({
      name: item.name,
      category,
      stoneWeight,
      legacySlug,
      productId: String(item.productId),
    }),
    urlPath: legacySlug,
    name: item.name,
    category,
    price,
    image: resolveProductImageUrl(pickImage(item)),
    stoneWeight,
    badge: mapBadge(item),
    isNew: Boolean(item.newProduct),
    description,
    images: resolveProductImages(collectImages(item.photos)),
    sizeOptions: resolveCatalogSizeOptions(sizeOptions, category),
    artNo,
    offerArtNos,
    setArtNos: setArtNos?.length ? setArtNos : undefined,
    stockAmount,
    inStock,
  };
}
export function mapProductDetails(
  item: AdvantShopProductDetails,
  category: CategorySlug,
  properties: AdvantShopProperty[] = [],
  catalogPrice?: number,
): ProductDetails {
  const offerPrice = pickOfferPrice(item.offers);
  const basePrice = pickPositivePrice(catalogPrice, offerPrice) ?? 0;

  const description = normalizeProductDescription(
    item.description ||
      item.briefDescription ||
      `${item.name} - украшение из серебра 925 пробы с ограненным синтетическим алмазом.`,
  );

  const rawImages = collectImages(item.photos);
  const images = resolveProductImages(rawImages);
  const fallbackImage = images[0] ?? DEFAULT_IMAGE;

  const allSizes = item.sizeColorPicker?.sizes ?? [];
  const availableSizes = getAvailableSizePickerSizes(item);
  const sizeDiamondWeights = buildSizeDiamondWeights(item, allSizes, properties);
  const diamondWeight = pickDefaultDiamondWeight(
    item,
    sizeDiamondWeights,
    properties,
  );
  const stoneWeight = diamondWeight?.numeric ?? 0.2;

  const stoneVariants: StoneVariant[] = STONE_VARIANT_WEIGHTS.map((weight) => ({
    weight,
    label: weight >= 1 ? "1 карат" : `${weight} карат`,
    price:
      Math.abs(weight - stoneWeight) < 0.001
        ? basePrice
        : Math.round(basePrice * (weight / Math.max(stoneWeight, 0.1))),
  }));

  const sizeSource =
    allSizes.length > 0
      ? allSizes.filter((size) =>
          (item.offers ?? []).some((offer) => offer.sizeId === size.id),
        )
      : availableSizes;
  const sizeOptions = (sizeSource.length ? sizeSource : availableSizes).map(
    (size) => {
      const label = size.name.trim();
      return { value: label, label };
    },
  );
  const hasSizes =
    category === "rings" || category === "bracelets" || allSizes.length > 0;
  const artNo = pickDefaultArtNo(item);
  const sizeArtNos = buildSizeArtNos(
    item,
    sizeSource.length ? sizeSource : availableSizes,
  );
  // Остатки по всем размерам (включая 0) — для проверки на чекауте
  const sizeStockAmounts = buildSizeStockAmounts(item, allSizes);
  const sizeWeightGrams = buildSizeWeightGrams(item, allSizes);
  const sizePrices = buildSizePrices(item, allSizes);
  const sizeLengthMm =
    category === "bracelets" ? buildSizeLengthMm(item, allSizes, properties) : undefined;
  const lengthMmLabel =
    category === "bracelets"
      ? pickDefaultLengthMm(item, sizeLengthMm, properties)
      : undefined;
  const legacySlug = item.urlPath;
  const setArtNos = resolveSetArtNos(properties);
  const { stockAmount, inStock } = getAdvantShopDetailsStockInfo(
    item,
    category,
  );

  return {
    id: String(item.productId),
    slug: buildSeoProductSlug({
      name: item.name,
      category,
      stoneWeight,
      legacySlug,
      productId: String(item.productId),
    }),
    urlPath: legacySlug,
    name: item.name,
    category,
    price: basePrice,
    image: fallbackImage,
    stoneWeight,
    badge: mapBadge(item),
    isNew: Boolean(item.newProduct),
    description,
    images: images.length ? images : [fallbackImage],
    cut:
      parseProperty(properties, ["огранк", "cut", "brilliant", "гранен"]) ??
      "Круглая (57 граней)",
    color: parseProperty(properties, ["цвет", "color"]) ?? "2",
    clarity: parseProperty(properties, ["чистот", "clarity"]) ?? "5",
    metal:
      parseProperty(properties, ["металл", "проба", "silver"]) ??
      "Серебро 925, родиевое покрытие",
    sizeOptions: hasSizes ? sortProductSizeOptions(sizeOptions) : [],
    stoneVariants,
    artNo: artNo || undefined,
    sizeArtNos,
    sizeStockAmounts,
    offerArtNos: collectOfferArtNos(item),
    weightGrams: pickDefaultWeightGrams(item, properties, sizeWeightGrams),
    sizeWeightGrams,
    sizePrices,
    diamondWeightLabel: diamondWeight?.label,
    sizeDiamondWeights,
    lengthMmLabel,
    sizeLengthMm,
    setArtNos: setArtNos.length ? setArtNos : undefined,
    stockAmount,
    inStock,
  };
}
