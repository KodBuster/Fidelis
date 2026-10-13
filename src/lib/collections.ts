import type { Product } from "@/lib/products";

export type StorefrontCollection = {
  id: string;
  title: string;
  href: string;
  /** Filter products by AdvantShop brand / manufacturer name. */
  manufacturer?: string;
  fallbackImage?: string;
  /** Плейсхолдер без фото и без товаров. */
  comingSoon?: boolean;
};

export const STOREFRONT_COLLECTIONS: StorefrontCollection[] = [
  {
    id: "1210-1",
    title: "1210-1",
    href: "/shop?manufacturer=1210-1",
    manufacturer: "1210-1",
    fallbackImage: "/images/collections/1210-1.jpg",
  },
  {
    id: "1210-2",
    title: "1210-2",
    href: "/shop?manufacturer=1210-2",
    manufacturer: "1210-2",
    fallbackImage: "/images/collections/1210-2.jpg",
  },
  {
    id: "collection-3",
    title: "Коллекция 3",
    href: "#",
    comingSoon: true,
  },
  {
    id: "collection-4",
    title: "Коллекция 4",
    href: "#",
    comingSoon: true,
  },
  {
    id: "collection-5",
    title: "Коллекция 5",
    href: "#",
    comingSoon: true,
  },
  {
    id: "collection-6",
    title: "Коллекция 6",
    href: "#",
    comingSoon: true,
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
