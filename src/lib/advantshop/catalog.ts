import { unstable_cache } from "next/cache";
import type { CategorySlug, Product, ProductDetails } from "@/lib/products";
import { findProductBySlug } from "@/lib/product-slug";
import { parseDiamondWeightNumber } from "@/lib/product-weight";
import { parseSetArtNosFromProperties } from "@/lib/product-complect";
import { advantshopClientFetch, advantshopFetch } from "./client";
import { getCategoryUrlMap, CATALOG_REVALIDATE_SECONDS } from "./config";
import { mapCatalogProduct, mapProductDetails, parseDiamondWeightLabelFromProperties, parseLengthMmLabelFromProperties, pickOfferPrice } from "./mapper";
import {
  getAdvantShopDetailsStockInfo,
  getAvailableSizePickerSizes,
  isAdvantShopProductInStock,
  type AdvantShopStockInfo,
} from "./stock";
import type {
  AdvantShopCatalogProduct,
  AdvantShopCatalogResponse,
  AdvantShopCategoriesResponse,
  AdvantShopOffer,
  AdvantShopProductDetails,
  AdvantShopProperty,
  AdvantShopPropertiesResponse,
} from "./types";

const SORT_MAP: Record<string, string> = {
  default: "NoSorting",
  "price-asc": "AscByPrice",
  "price-desc": "DescByPrice",
  new: "DescByAddingDate",
};

function isMissingCategoryError(error: unknown): boolean {
  return (
    error instanceof Error && error.message.includes("Категория не найдена")
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function normalizeAdvantShopProperty(raw: unknown): AdvantShopProperty {
  const property = asRecord(raw) ?? {};
  const selected = [
    ...(Array.isArray(property.selectedPropertyValues)
      ? property.selectedPropertyValues
      : []),
    ...(Array.isArray(property.SelectedPropertyValues)
      ? property.SelectedPropertyValues
      : []),
  ];
  const nestedRaw = [
    ...(Array.isArray(property.propertyValues) ? property.propertyValues : []),
    ...(Array.isArray(property.values) ? property.values : []),
    ...selected,
  ];
  const nested = nestedRaw.map((item) => {
    const value = asRecord(item) ?? {};
    const text = String(
      value.propertyValue ?? value.value ?? value.Value ?? "",
    );
    return {
      value: text,
      propertyValue: text,
      offerId: (value.offerId ?? value.OfferId) as number | null | undefined,
      artNo: (value.artNo ?? value.ArtNo ?? value.offerArtNo) as
        | string
        | null
        | undefined,
      offerArtNo: (value.offerArtNo ?? value.OfferArtNo) as
        | string
        | null
        | undefined,
    };
  });
  const firstSelected = asRecord(selected[0]);
  const scalar =
    (property.propertyValue as string | undefined) ??
    (property.value as string | undefined) ??
    (firstSelected?.Value as string | undefined) ??
    (firstSelected?.value as string | undefined) ??
    nested.find((item) => item.value)?.value;

  return {
    name: (property.name ?? property.Name ?? property.propertyName) as
      | string
      | undefined,
    propertyName: (property.propertyName ?? property.name ?? property.Name) as
      | string
      | undefined,
    value: scalar,
    propertyValue: scalar,
    offerId: (property.offerId ?? property.OfferId) as number | null | undefined,
    artNo: (property.artNo ?? property.ArtNo ?? property.offerArtNo) as
      | string
      | null
      | undefined,
    offerArtNo: (property.offerArtNo ?? property.OfferArtNo) as
      | string
      | null
      | undefined,
    values: nested,
    propertyValues: nested,
    selectedPropertyValues: nested,
  };
}

function flattenAdvantShopProperties(
  response: AdvantShopPropertiesResponse | unknown,
): AdvantShopProperty[] {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response.flatMap((entry) => {
      const record = asRecord(entry);
      if (!record) return [];
      const grouped = record.properties ?? record.Properties;
      if (Array.isArray(grouped)) {
        return grouped.map(normalizeAdvantShopProperty);
      }
      return [normalizeAdvantShopProperty(entry)];
    });
  }

  const record = asRecord(response);
  if (!record) return [];

  if (Array.isArray(record.properties)) {
    return record.properties.map(normalizeAdvantShopProperty);
  }
  if (Array.isArray(record.Properties)) {
    return record.Properties.map(normalizeAdvantShopProperty);
  }

  const groups = record.Groups ?? record.groups;
  if (Array.isArray(groups)) {
    return groups.flatMap((group) => {
      const grouped = asRecord(group);
      const props = grouped?.properties ?? grouped?.Properties;
      return Array.isArray(props)
        ? props.map(normalizeAdvantShopProperty)
        : [];
    });
  }

  return [];
}

function getCategorySlugByUrl(url: string): CategorySlug | undefined {
  const map = getCategoryUrlMap();

  for (const [slug, categoryUrl] of Object.entries(map) as [
    CategorySlug,
    string,
  ][]) {
    if (categoryUrl === url) return slug;
  }

  return undefined;
}

async function fetchCatalogPage(body: Record<string, unknown>) {
  return advantshopClientFetch<AdvantShopCatalogResponse>("/api/catalog", {
    method: "POST",
    body,
  });
}

async function fetchAllCatalogProducts(body: Record<string, unknown>) {
  const products: AdvantShopCatalogResponse["products"] = [];
  let page = 1;
  let totalPages = 1;
  const pageSize = 500;

  do {
    const response = await fetchCatalogPage({
      ...body,
      page,
      itemsPerPage: pageSize,
    });
    products.push(...(response.products ?? []));
    totalPages = response.pager?.totalPageCount ?? 1;
    page += 1;
  } while (page <= totalPages);

  return products;
}

async function fetchProductProperties(productId: number): Promise<AdvantShopProperty[]> {
  const response = await advantshopClientFetch<AdvantShopPropertiesResponse>(
    `/api/products/${productId}/properties`,
    { searchParams: { type: "inDetails" } },
  ).catch(() => [] as AdvantShopPropertiesResponse);

  return flattenAdvantShopProperties(response);
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

const getCachedSetMap = unstable_cache(
  async (): Promise<Record<string, string[]>> => {
    const categoryMap = getCategoryUrlMap();
    const productIds = new Set<number>();

    for (const url of Object.values(categoryMap)) {
      const items = await fetchAllCatalogProducts({
        url,
        sorting: "NoSorting",
      });
      for (const item of items) {
        productIds.add(item.productId);
      }
    }

    const setMap: Record<string, string[]> = {};
    const ids = [...productIds];

    await mapPool(ids, 8, async (productId) => {
      const properties = await fetchProductProperties(productId);
      const setArtNos = parseSetArtNosFromProperties(properties);
      if (setArtNos.length) {
        setMap[String(productId)] = setArtNos;
      }
    });

    return setMap;
  },
  ["advantshop-set-map"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog"] },
);

async function fetchProductStockInfo(
  productId: number,
  category: CategorySlug,
): Promise<AdvantShopStockInfo | undefined> {
  try {
    const details = await advantshopClientFetch<AdvantShopProductDetails>(
      `/api/products/${productId}`,
    );
    const stock = getAdvantShopDetailsStockInfo(details, category);
    const listPrice = pickOfferPrice(details.offers);
    return {
      ...stock,
      listPrice: listPrice > 0 ? listPrice : undefined,
    };
  } catch (error) {
    console.warn(
      `AdvantShop stock for product ${productId} unavailable:`,
      error,
    );
    return undefined;
  }
}

async function loadStockInfoMap(
  items: AdvantShopCatalogProduct[],
  category: CategorySlug,
): Promise<Map<number, AdvantShopStockInfo>> {
  const map = new Map<number, AdvantShopStockInfo>();
  const ids = [...new Set(items.map((item) => item.productId))];

  await mapPool(ids, 8, async (productId) => {
    const stock = await fetchProductStockInfo(productId, category);
    if (stock) map.set(productId, stock);
  });

  return map;
}

function resolveListStockInfo(
  item: AdvantShopCatalogProduct,
  stockMap: Map<number, AdvantShopStockInfo>,
): AdvantShopStockInfo {
  const fromDetails = stockMap.get(item.productId);
  if (fromDetails) return fromDetails;

  return {
    stockAmount: undefined,
    inStock: isAdvantShopProductInStock(item),
  };
}

async function mapCatalogItems(
  items: NonNullable<AdvantShopCatalogResponse["products"]>,
  category: CategorySlug,
  setMap: Record<string, string[]>,
  includeOutOfStock = true,
): Promise<Product[]> {
  const stockMap = await loadStockInfoMap(items, category);

  // Товары с остатком ≤ 0 тоже показываем — на карточке кнопка «Скоро будет».
  const visible = includeOutOfStock
    ? items
    : items.filter((item) => resolveListStockInfo(item, stockMap).inStock);

  return visible.map((item) =>
    mapCatalogProduct(
      item,
      category,
      setMap[String(item.productId)],
      stockMap.get(item.productId),
    ),
  );
}

export async function fetchAdvantShopCategories() {
  return advantshopFetch<AdvantShopCategoriesResponse>("/api/categories", {
    searchParams: { parentCategoryId: 0, extended: true },
  });
}

export async function fetchAdvantShopProducts(options?: {
  category?: CategorySlug;
  sort?: string;
  /** Если false — скрывать товары с нулевым остатком. По умолчанию показываем все. */
  includeOutOfStock?: boolean;
}): Promise<Product[]> {
  const categoryMap = getCategoryUrlMap();
  const sort = SORT_MAP[options?.sort ?? "default"] ?? "NoSorting";
  const setMap = await getCachedSetMap();
  const includeOutOfStock = options?.includeOutOfStock !== false;

  if (options?.category) {
    const categoryUrl = categoryMap[options.category];
    if (!categoryUrl) return [];

    try {
      const items = await fetchAllCatalogProducts({
        url: categoryUrl,
        sorting: sort,
      });
      return mapCatalogItems(items, options.category, setMap, includeOutOfStock);
    } catch (error) {
      if (isMissingCategoryError(error)) {
        console.warn(
          `AdvantShop category not found for "${options.category}" (url: ${categoryUrl})`
        );
        return [];
      }
      throw error;
    }
  }

  const slugs = Object.keys(categoryMap) as CategorySlug[];
  if (!slugs.length) return [];

  const results = await Promise.all(
    slugs.map(async (slug) => {
      const url = categoryMap[slug];
      if (!url) return [] as Product[];

      try {
        const items = await fetchAllCatalogProducts({ url, sorting: sort });
        return mapCatalogItems(items, slug, setMap, includeOutOfStock);
      } catch (error) {
        if (isMissingCategoryError(error)) {
          console.warn(
            `AdvantShop category not found for "${slug}" (url: ${url})`
          );
          return [] as Product[];
        }
        throw error;
      }
    })
  );

  const merged = new Map<string, Product>();
  for (const list of results) {
    for (const product of list) {
      merged.set(product.id, product);
    }
  }

  return Array.from(merged.values());
}

export async function loadAdvantShopProductDetails(
  summary: Product,
): Promise<ProductDetails | undefined> {
  const [details, propertiesResponse] = await Promise.all([
    advantshopClientFetch<AdvantShopProductDetails>(
      `/api/products/${summary.id}`,
    ),
    advantshopClientFetch<AdvantShopPropertiesResponse>(
      `/api/products/${summary.id}/properties`,
      { searchParams: { type: "inDetails" } },
    ).catch(() => [] as AdvantShopPropertiesResponse),
  ]);

  const properties = flattenAdvantShopProperties(propertiesResponse);
  const product = mapProductDetails(
    details,
    summary.category,
    properties,
    summary.price,
  );

  const fetchedSizeDiamondWeights = await fetchDiamondWeightsForSizes(
    Number(summary.id),
    details.sizeColorPicker?.sizes ?? getAvailableSizePickerSizes(details),
    details.offers ?? [],
  );
  const sizeDiamondWeights = {
    ...(product.sizeDiamondWeights ?? {}),
    ...(fetchedSizeDiamondWeights ?? {}),
  };
  const fetchedSizeLengthMm =
    summary.category === "bracelets" ||
    summary.category === "ankle-bracelets"
      ? await fetchLengthMmForSizes(
          Number(summary.id),
          details.sizeColorPicker?.sizes ?? getAvailableSizePickerSizes(details),
          details.offers ?? [],
        )
      : undefined;
  const sizeLengthMm = {
    ...(product.sizeLengthMm ?? {}),
    ...(fetchedSizeLengthMm ?? {}),
  };
  const hasSizeDiamondWeights = Object.keys(sizeDiamondWeights).length > 0;
  const hasSizeLengthMm = Object.keys(sizeLengthMm).length > 0;
  const defaultSize =
    product.sizeOptions.find((option) => {
      const amount = product.sizeStockAmounts?.[option.value];
      return amount === undefined || amount > 0;
    }) ?? product.sizeOptions[0];
  const diamondWeightLabel =
    (defaultSize && hasSizeDiamondWeights
      ? sizeDiamondWeights[defaultSize.value]
      : undefined) ??
    product.diamondWeightLabel ??
    (hasSizeDiamondWeights ? Object.values(sizeDiamondWeights)[0] : undefined);
  const lengthMmLabel =
    (defaultSize && hasSizeLengthMm ? sizeLengthMm[defaultSize.value] : undefined) ??
    product.lengthMmLabel ??
    (hasSizeLengthMm ? Object.values(sizeLengthMm)[0] : undefined);

  return {
    ...product,
    slug: summary.slug,
    urlPath: summary.urlPath,
    // Каталог AdvantShop отдаёт price=0, если у модификации не стоит «Главная».
    // Не затираем цену из offers нулём из summary.
    price: product.price > 0 ? product.price : summary.price,
    diamondWeightLabel,
    sizeDiamondWeights: hasSizeDiamondWeights ? sizeDiamondWeights : undefined,
    lengthMmLabel,
    sizeLengthMm: hasSizeLengthMm ? sizeLengthMm : undefined,
    stoneWeight:
      parseDiamondWeightNumber(diamondWeightLabel) ?? product.stoneWeight,
    stockAmount: product.stockAmount ?? summary.stockAmount,
    inStock: product.inStock !== false && summary.inStock !== false,
  };
}

export async function fetchAdvantShopProductDetails(
  slug: string
): Promise<ProductDetails | undefined> {
  const categoryMap = getCategoryUrlMap();
  const slugs = Object.keys(categoryMap) as CategorySlug[];

  const lists = await Promise.all(
    slugs.map(async (category) => ({
      category,
      products: await fetchAdvantShopProducts({ category }),
    }))
  );

  let summary: Product | undefined;

  for (const list of lists) {
    const match = findProductBySlug(list.products, slug);
    if (match) {
      summary = match;
      break;
    }
  }

  if (!summary) return undefined;

  return loadAdvantShopProductDetails(summary);
}

async function fetchDiamondWeightsForSizes(
  productId: number,
  sizes: { id: number; name: string }[],
  offers: AdvantShopOffer[] = [],
): Promise<Record<string, string> | undefined> {
  if (!sizes.length) return undefined;

  const map: Record<string, string> = {};
  await mapPool(sizes, 4, async (size) => {
    const offer = offers.find((entry) => entry.sizeId === size.id);
    try {
      const response = await advantshopClientFetch<AdvantShopPropertiesResponse>(
        `/api/products/${productId}/properties`,
        {
          searchParams: {
            type: "inDetails",
            sizeId: size.id,
            offerId: offer?.offerId,
          },
        },
      );
      const label = parseDiamondWeightLabelFromProperties(
        flattenAdvantShopProperties(response),
      );
      const sizeKey = size.name.trim();
      if (label && sizeKey) map[sizeKey] = label;
    } catch {
      // sizeId/offerId на properties может не поддерживаться — тогда останется значение товара.
    }
  });

  return Object.keys(map).length ? map : undefined;
}

async function fetchLengthMmForSizes(
  productId: number,
  sizes: { id: number; name: string }[],
  offers: AdvantShopOffer[] = [],
): Promise<Record<string, string> | undefined> {
  if (!sizes.length) return undefined;

  const map: Record<string, string> = {};
  await mapPool(sizes, 4, async (size) => {
    const offer = offers.find((entry) => entry.sizeId === size.id);
    try {
      const response = await advantshopClientFetch<AdvantShopPropertiesResponse>(
        `/api/products/${productId}/properties`,
        {
          searchParams: {
            type: "inDetails",
            sizeId: size.id,
            offerId: offer?.offerId,
          },
        },
      );
      const label = parseLengthMmLabelFromProperties(
        flattenAdvantShopProperties(response),
      );
      const sizeKey = size.name.trim();
      if (label && sizeKey) map[sizeKey] = label;
    } catch {
      // sizeId/offerId на properties может не поддерживаться — тогда останется значение товара.
    }
  });

  return Object.keys(map).length ? map : undefined;
}

export async function fetchAdvantShopProductsBySlugs(
  slugs: string[]
): Promise<Product[]> {
  if (!slugs.length) return [];

  const categoryMap = getCategoryUrlMap();
  const categories = Object.keys(categoryMap) as CategorySlug[];
  const slugSet = new Set(slugs);

  const lists = await Promise.all(
    categories.map((category) => fetchAdvantShopProducts({ category }))
  );

  const merged = lists.flat();
  return merged.filter(
    (product) => slugSet.has(product.slug) || slugSet.has(product.urlPath ?? "")
  );
}

export function resolveCategorySlugFromAdvantShopUrl(
  url: string
): CategorySlug | undefined {
  return getCategorySlugByUrl(url);
}
