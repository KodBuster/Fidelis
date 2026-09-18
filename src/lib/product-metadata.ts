import { CATEGORIES, formatPrice, type ProductDetails } from "@/lib/products";

const MAX_META_DESCRIPTION_LENGTH = 160;

function truncateMetaDescription(text: string): string {
  if (text.length <= MAX_META_DESCRIPTION_LENGTH) return text;

  const cut = text.slice(0, MAX_META_DESCRIPTION_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(" ");

  if (lastSpace > MAX_META_DESCRIPTION_LENGTH * 0.6) {
    return `${cut.slice(0, lastSpace)}…`;
  }

  return `${cut}…`;
}

export function buildProductMetaDescription(product: ProductDetails): string {
  const category = CATEGORIES[product.category].title.toLowerCase();
  const price = formatPrice(product.price);

  const description = [
    `${product.name} — ${category} из серебра 925.`,
    `${product.metal}.`,
    "Доставка СДЭК по России, оплата по счёту.",
    price,
  ].join(" ");

  return truncateMetaDescription(description);
}
