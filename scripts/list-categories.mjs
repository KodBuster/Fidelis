import { readFileSync, existsSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2]
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvFile(".env.local");

const base = process.env.ADVANTSHOP_BASE_URL.replace(/\/$/, "");
const key = process.env.ADVANTSHOP_SERVER_API_KEY;

const u = new URL(`${base}/api/categories`);
u.searchParams.set("apikey", key);
u.searchParams.set("parentCategoryId", "0");
u.searchParams.set("extended", "true");

const response = await fetch(u, {
  headers: { Accept: "application/json", "X-API-KEY": key },
});
const data = await response.json();
const cats = Array.isArray(data) ? data : (data.categories ?? data.result ?? data);

for (const cat of cats) {
  console.log(
    [
      cat.id ?? cat.categoryId,
      cat.name ?? cat.categoryName,
      cat.urlPath ?? cat.url ?? cat.urlPath,
      `products=${cat.productsCount ?? cat.count ?? "?"}`,
      `enabled=${cat.enabled ?? cat.isEnabled ?? "?"}`,
    ].join(" | "),
  );
  const children = cat.childCategories ?? cat.subCategories ?? cat.children ?? [];
  for (const child of children) {
    console.log(
      "  -",
      [
        child.id ?? child.categoryId,
        child.name ?? child.categoryName,
        child.urlPath ?? child.url,
        `products=${child.productsCount ?? child.count ?? "?"}`,
      ].join(" | "),
    );
  }
}
