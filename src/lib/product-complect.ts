import type { AdvantShopProperty } from "@/lib/advantshop/types";
import type { CategorySlug, Product } from "@/lib/products";

const COMPLECT_CATEGORY_ORDER: CategorySlug[] = [
  "rings",
  "earrings",
  "pendants",
  "necklaces",
  "bracelets",
  "ankle-bracelets",
  "cords",
];

function normalizeArtNo(value: string): string {
  return value.trim().toLowerCase();
}

/** Parse comma-separated artNos from AdvantShop property «Set». */
export function parseSetArtNosFromProperties(
  properties: AdvantShopProperty[],
): string[] {
  for (const property of properties) {
    const name = (property.propertyName ?? property.name ?? "").trim().toLowerCase();
    if (name !== "set") continue;

    const value = (property.propertyValue ?? property.value ?? "").trim();
    if (!value) return [];

    return [
      ...new Set(
        value
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
      ),
    ];
  }

  return [];
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

export function getComplectSiblings(
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
      if (seenIds.has(item.id) || item.category === "gifts") return false;
      return productMatchesArtNo(item, artNo);
    });
    if (found) {
      seenIds.add(found.id);
      matched.push(found);
    }
  }

  return matched
    .sort(
      (a, b) =>
        COMPLECT_CATEGORY_ORDER.indexOf(a.category) -
        COMPLECT_CATEGORY_ORDER.indexOf(b.category),
    )
    .slice(0, limit);
}
