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

function normalizeSetKey(value: string): string {
  return value.trim().toLowerCase();
}

export function getComplectSiblingsBySet(
  product: Product,
  catalog: Product[],
  limit = 3,
): Product[] {
  const setKeys = product.setArtNos ?? [];
  const matched: Product[] = [];
  const seenIds = new Set<string>([product.id]);

  const add = (item: Product) => {
    if (seenIds.has(item.id)) return;
    seenIds.add(item.id);
    matched.push(item);
  };

  // 1) Значения Set текущего товара → артикулы других.
  for (const artNo of setKeys) {
    const found = catalog.find(
      (item) => !seenIds.has(item.id) && productMatchesArtNo(item, artNo),
    );
    if (found) add(found);
  }

  // 2) Обратная связь: другие товары, у которых в Set указан этот артикул.
  const selfArtNos = new Set<string>();
  if (product.artNo) selfArtNos.add(normalizeArtNo(product.artNo));
  for (const offer of product.offerArtNos ?? []) {
    selfArtNos.add(normalizeArtNo(offer));
  }

  if (selfArtNos.size) {
    for (const item of catalog) {
      if (seenIds.has(item.id) || !item.setArtNos?.length) continue;
      const listsSelf = item.setArtNos.some((artNo) =>
        selfArtNos.has(normalizeArtNo(artNo)),
      );
      if (listsSelf) add(item);
    }
  }

  // 3) Общий ключ комплекта (одно select-значение на несколько товаров).
  if (!matched.length && setKeys.length) {
    const keySet = new Set(setKeys.map(normalizeSetKey).filter(Boolean));
    for (const item of catalog) {
      if (seenIds.has(item.id) || !item.setArtNos?.length) continue;
      if (item.setArtNos.some((key) => keySet.has(normalizeSetKey(key)))) {
        add(item);
      }
    }
  }

  return sortComplectProducts(matched).slice(0, limit);
}

/** Комплект только из свойства Set. Без Set блок на карточке не показываем. */
export function getComplectSiblings(
  product: Product,
  catalog: Product[],
  limit = 3,
): Product[] {
  if (!product.setArtNos?.length) return [];
  return getComplectSiblingsBySet(product, catalog, limit);
}
