export type CartItem = {
  id: string;
  productSlug: string;
  name: string;
  image: string;
  price: number;
  stoneWeight: number;
  stoneLabel: string;
  size: string | null;
  quantity: number;
  artNo?: string;
};

export const CART_STORAGE_KEY = "fidelis-cart";

export function buildCartItemId(
  slug: string,
  stoneWeight: number,
  size: string | null
): string {
  return `${slug}-${stoneWeight}-${size ?? "none"}`;
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
