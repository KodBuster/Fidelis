import type { Product } from "@/lib/products";

export type StorefrontCollection = {
  id: string;
  title: string;
  href: string;
  /** Filter products by AdvantShop brand / manufacturer name. */
  manufacturer?: string;
  fallbackImage: string;
};

export const STOREFRONT_COLLECTIONS: StorefrontCollection[] = [
  {
    id: "brut",
    title: "БРЮТ",
    href: "/shop?manufacturer=Prosecco",
    manufacturer: "Prosecco",
    fallbackImage: "/images/product-ring.webp",
  },
  {
    id: "cords",
    title: "ШНУРКИ",
    href: "/shop/cords",
    fallbackImage: "/images/product-necklace.webp",
  },
  {
    id: "collection-3",
    title: "Коллекция 3",
    href: "/shop?collection=3",
    fallbackImage: "/images/product-necklace.webp",
  },
  {
    id: "collection-4",
    title: "Коллекция 4",
    href: "/shop?collection=4",
    fallbackImage: "/images/product-bracelet.webp",
  },
  {
    id: "collection-5",
    title: "Коллекция 5",
    href: "/shop?collection=5",
    fallbackImage: "/images/product-ring.webp",
  },
  {
    id: "collection-6",
    title: "Коллекция 6",
    href: "/shop?collection=6",
    fallbackImage: "/images/product-earrings.webp",
  },
];

export function filterProductsByManufacturer(
  products: Product[],
  manufacturer: string,
): Product[] {
  const target = manufacturer.trim().toLowerCase();
  if (!target) return [];

  return products.filter(
    (product) => product.manufacturer?.trim().toLowerCase() === target,
  );
}
