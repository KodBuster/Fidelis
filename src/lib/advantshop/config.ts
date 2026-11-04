import type { CategorySlug } from "@/lib/products";

function readEnv(name: string): string | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) return undefined;

  const value = raw.replace(/^["']|["']$/g, "");
  return value || undefined;
}

function assertAdvantShopBaseUrl(base: string): string {
  try {
    const parsed = new URL(base);
    if (
      parsed.hostname.endsWith("advantme.ru") &&
      (!parsed.pathname || parsed.pathname === "/")
    ) {
      throw new Error(
        "ADVANTSHOP_BASE_URL must include the shop path, e.g. https://s4.advantme.ru/437293-svmk"
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("ADVANTSHOP_BASE_URL")) {
      throw error;
    }
  }

  return base.replace(/\/$/, "");
}

export function isAdvantShopConfigured(): boolean {
  return Boolean(readEnv("ADVANTSHOP_BASE_URL") && readEnv("ADVANTSHOP_CATEGORY_MAP"));
}

export function getAdvantShopBaseUrl(): string {
  const base = readEnv("ADVANTSHOP_BASE_URL");
  if (!base) {
    throw new Error("ADVANTSHOP_BASE_URL is not configured");
  }
  return assertAdvantShopBaseUrl(base);
}

/** Server API key — categories, orders, customers */
export function getAdvantShopServerApiKey(): string {
  const key =
    readEnv("ADVANTSHOP_SERVER_API_KEY") ?? readEnv("ADVANTSHOP_API_KEY");
  if (!key) {
    throw new Error("ADVANTSHOP_SERVER_API_KEY is not configured");
  }
  return key;
}

/**
 * Client API key from «API с авторизацией» tab.
 * Required for catalog and product endpoints.
 */
export function getAdvantShopClientApiKey(): string {
  const key = getAdvantShopClientApiKeyOptional();
  if (!key) {
    throw new Error(
      "ADVANTSHOP_CLIENT_API_KEY is not configured. Generate it in AdvantShop admin: Settings → API → «API с авторизацией»."
    );
  }
  return key;
}

function getAdvantShopClientApiKeyOptional(): string | undefined {
  return readEnv("ADVANTSHOP_CLIENT_API_KEY") ?? readEnv("ADVANTSHOP_API_KEY");
}

/** @deprecated Use getAdvantShopServerApiKey or getAdvantShopClientApiKey */
export function getAdvantShopApiKey(): string {
  return getAdvantShopServerApiKey();
}

function parseCategoryUrlMap(raw: string): Partial<Record<CategorySlug, string>> {
  if (raw.startsWith("{")) {
    try {
      return JSON.parse(raw) as Partial<Record<CategorySlug, string>>;
    } catch {
      return {};
    }
  }

  // Amvera env vars cannot contain quotes — use: rings:koltso,earrings:sergi,...
  const map: Partial<Record<CategorySlug, string>> = {};
  for (const part of raw.split(",")) {
    const [slug, url] = part.split(":").map((segment) => segment.trim());
    if (slug && url) {
      map[slug as CategorySlug] = url;
    }
  }
  return map;
}

/** Map site category slugs to AdvantShop category URL paths */
export function getCategoryUrlMap(): Partial<Record<CategorySlug, string>> {
  const raw = readEnv("ADVANTSHOP_CATEGORY_MAP");
  const map = { cords: "shnurok", "ankle-bracelets": "braslet-na-nogu", ...parseCategoryUrlMap(raw ?? "") };
  if (map["ankle-bracelets"] === "braslety-na-nogu") {
    map["ankle-bracelets"] = "braslet-na-nogu";
  }
  return map;
}

export const CATALOG_REVALIDATE_SECONDS = Number(
  process.env.ADVANTSHOP_REVALIDATE_SECONDS ?? 300
);
