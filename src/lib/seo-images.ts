import { resolveProductImageUrl } from "@/lib/advantshop/images";
import { getSiteUrl } from "@/lib/site-url";

/** OG/Telegram preview — отдельный файл, чтобы сбить кеш шаринга. */
export const DEFAULT_OG_IMAGE = "/images/og-default.jpg";

export function absoluteImageUrl(src: string): string {
  const siteUrl = getSiteUrl();
  const resolved = resolveProductImageUrl(src);

  if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
    return resolved;
  }

  return `${siteUrl}${resolved}`;
}
