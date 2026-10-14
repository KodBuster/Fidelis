import type { AdvantShopProperty } from "@/lib/advantshop/types";
import type { CategorySlug, Product } from "@/lib/products";

const COMPLECT_CATEGORY_ORDER: CategorySlug[] = [
  "rings",
  "earrings",
  "pendants",
  "chain-pendants",
  "necklaces",
  "bracelets",
  "ankle-bracelets",
  "brooches",
];

const SET_PROPERTY_NAMES = new Set(["set", "комплект", "complect"]);

function normalizeArtNo(value: string): string {
  return value.trim().toLowerCase();
}

function splitArtNos(raw: string): string[] {
  return raw
    .split(/[,;|]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function collectPropertyTexts(property: AdvantShopProperty): string[] {
  const texts: string[] = [];
  const scalar = (property.propertyValue ?? property.value ?? "").trim();
  if (scalar) texts.push(scalar);

  const lists = [
    property.selectedPropertyValues,
    property.SelectedPropertyValues,
    property.propertyValues,
    property.values,
  ];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      const text = (entry.propertyValue ?? entry.value ?? entry.Value ?? "").trim();
      if (text) texts.push(text);
    }
  }

  return texts;
}

/** Parse artNos from AdvantShop property «Set» / «Комплект» (строка или select/мультивыбор). */
export function parseSetArtNosFromProperties(
  properties: AdvantShopProperty[],
): string[] {
  const artNos = new Set<string>();

  for (const property of properties) {
    const name = (property.propertyName ?? property.name ?? "")
      .trim()
      .toLowerCase();
    if (!SET_PROPERTY_NAMES.has(name)) continue;

    for (const text of collectPropertyTexts(property)) {
      for (const artNo of splitArtNos(text)) {
        artNos.add(artNo);
      }
    }
  }

  return [...artNos];
}

export function resolveSetArtNos(
  properties: AdvantShopProperty[] = [],
): string[] {
  return parseSetArtNosFromProperties(properties);
}

function productMatchesArtNo(product: Product, artNo: string): boolean {
  const target = normalizeArtNo(artNo);
  if (!target) return false;

  if (product.artNo && normalizeArtNo(product.artNo) === target) return true;

  return Boolean(
    product.offerArtNos?.some((offer) => normalizeArtNo(offer) === target),
  );
}

function sortComplectProducts(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) =>
      COMPLECT_CATEGORY_ORDER.indexOf(a.category) -
      COMPLECT_CATEGORY_ORDER.indexOf(b.category),
  );
}

export function getComplectSiblingsBySet(
  product: Product,
  catalog: Product[],
  limit = 3,
): Product[] {
  const setArtNos = product.setArtNos;
  if (!setArtNos?.length) return [];

  const matched: Product[] = [];
  const seenIds = new Set<string>([product.id]);

  for (const artNo of setArtNos) {
    const found = catalog.find((item) => {
      if (seenIds.has(item.id)) return false;
      return productMatchesArtNo(item, artNo);
    });
    if (found) {
      seenIds.add(found.id);
      matched.push(found);
    }
  }

  return sortComplectProducts(matched).slice(0, limit);
}

/**
 * Запасной комплект: другие товары того же производителя (бренд AdvantShop).
 * Сначала другие категории, затем та же.
 */
export function getComplectSiblingsByManufacturer(
  product: Product,
  catalog: Product[],
  limit = 3,
): Product[] {
  const manufacturer = product.manufacturer?.trim().toLowerCase();
  if (!manufacturer) return [];

  const siblings = catalog.filter(
    (item) =>
      item.id !== product.id &&
      item.manufacturer?.trim().toLowerCase() === manufacturer &&
      item.inStock !== false,
  );

  const otherCategory = siblings.filter(
    (item) => item.category !== product.category,
  );
  const sameCategory = siblings.filter(
    (item) => item.category === product.category,
  );

  return sortComplectProducts([...otherCategory, ...sameCategory]).slice(
    0,
    limit,
  );
}

export function getComplectSiblings(
  product: Product,
  catalog: Product[],
  limit = 3,
): Product[] {
  const fromSet = getComplectSiblingsBySet(product, catalog, limit);
  if (fromSet.length) return fromSet;
  return getComplectSiblingsByManufacturer(product, catalog, limit);
}
