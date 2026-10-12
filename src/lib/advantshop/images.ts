import { getAdvantShopBaseUrl, isAdvantShopConfigured } from "./config";

/** Баннер вместо фото, когда у товара нет изображения. */
export const PRODUCT_IMAGE_PLACEHOLDER = "/images/photo-coming-soon.svg";

export function isMissingProductPhoto(src?: string | null): boolean {
  if (!src?.trim()) return true;
  const lower = src.toLowerCase();
  return (
    lower.includes("nophoto") ||
    src === PRODUCT_IMAGE_PLACEHOLDER ||
    lower.endsWith("/photo-coming-soon.svg")
  );
}

const ADVANTSHOP_IMAGE_HOSTS = [
  "advantme.ru",
  "on-advantshop.net",
  "synonym-925.ru",
  "synonym-jewelry.ru",
  "shop.synonym-jewelry.ru",
];

function getConfiguredImageHosts(): string[] {
  const hosts = [...ADVANTSHOP_IMAGE_HOSTS];

  if (isAdvantShopConfigured()) {
    try {
      const { hostname } = new URL(getAdvantShopBaseUrl());
      if (!hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
        hosts.push(hostname);
      }
    } catch {
      // ignore invalid base URL here; config will throw on actual API calls
    }
  }

  return hosts;
}

export function isAdvantShopImageUrl(src: string): boolean {
  if (!src.startsWith("http://") && !src.startsWith("https://")) {
    return false;
  }

  try {
    const { hostname } = new URL(src);
    return getConfiguredImageHosts().some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

export function isAllowedAdvantShopImageUrl(src: string): boolean {
  if (!isAdvantShopImageUrl(src)) return false;

  if (src.includes("/pictures/")) return true;

  try {
    const base = getAdvantShopBaseUrl();
    return src.startsWith(`${base}/`);
  } catch {
    return false;
  }
}

export function resolveProductImageUrl(src: string): string {
  if (isMissingProductPhoto(src)) return PRODUCT_IMAGE_PLACEHOLDER;
  if (src.startsWith("/")) return src;

  if (isAdvantShopConfigured() && isAdvantShopImageUrl(src)) {
    return `/api/advantshop-image?src=${encodeURIComponent(src)}`;
  }

  return src;
}

export function resolveProductImages(urls: string[]): string[] {
  const resolved = urls
    .map(resolveProductImageUrl)
    .filter((url) => !isMissingProductPhoto(url));
  return resolved.length ? resolved : [PRODUCT_IMAGE_PLACEHOLDER];
}
