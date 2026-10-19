import type { Product } from "@/lib/products";

export type StorefrontCollection = {
  id: string;
  title: string;
  href: string;
  /** Filter products by AdvantShop brand / manufacturer name. */
  manufacturer?: string;
  fallbackImage?: string;
  /** Как вписывать фото в плитку 4:5. По умолчанию cover. */
  imageFit?: "cover" | "contain";
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
    fallbackImage: "/images/collections/1210-2-v2.jpg",
    imageFit: "contain",
  },
  {
    id: "1310-1",
    title: "1310-1",
    href: "/shop?manufacturer=1310-1",
    manufacturer: "1310-1",
    fallbackImage: "/images/collections/1310-1.jpg",
  },
  {
    id: "1310-2",
    title: "1310-2",
    href: "/shop?manufacturer=1310-2",
    manufacturer: "1310-2",
    fallbackImage: "/images/collections/1310-2.jpg",
  },
  {
    id: "1410-1",
    title: "1410-1",
    href: "/shop?manufacturer=1410-1",
    manufacturer: "1410-1",
    fallbackImage: "/images/collections/1410-1.jpg",
  },
  {
    id: "1510-1",
    title: "1510-1",
    href: "/shop?manufacturer=1510-1",
    manufacturer: "1510-1",
    fallbackImage: "/images/collections/1510-1.jpg",
  },
  {
    id: "1510-2",
    title: "1510-2",
    href: "/shop?manufacturer=1510-2",
    manufacturer: "1510-2",
    fallbackImage: "/images/collections/1510-2.jpg",
  },
  {
    id: "1910-1",
    title: "1910-1",
    href: "/shop?manufacturer=1910-1",
    manufacturer: "1910-1",
    fallbackImage: "/images/collections/1910-1.jpg",
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
