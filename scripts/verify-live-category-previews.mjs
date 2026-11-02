// Read-only check: compare public tiles with all pages of their actual AdvantShop category.
import assert from "node:assert/strict";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const base = process.env.ADVANTSHOP_BASE_URL.replace(/\/$/, "");
const key = process.env.ADVANTSHOP_CLIENT_API_KEY;
const map = Object.fromEntries(process.env.ADVANTSHOP_CATEGORY_MAP.split(",").map(pair => pair.split(":")));
const titles = { rings: "Кольца", "ankle-bracelets": "Браслеты на ногу", bracelets: "Браслеты", necklaces: "Колье", pendants: "Подвески", earrings: "Серьги", brooches: "Броши", "chain-pendants": "Кулон на цепи", watches: "Часы" };
async function api(path, body, session) {
  const response = await fetch(`${base}${path}?apikey=${encodeURIComponent(key)}`, {
    method: body ? "POST" : "GET", headers: { "X-API-KEY": key, "Content-Type": "application/json", ...(session ? { "X-API-USER-ID": session } : {}) },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000),
  });
  assert(response.ok, `${path}: HTTP ${response.status}`);
  return { data: await response.json(), session: response.headers.get("X-API-USER-ID") };
}
const init = await api("/api/init");
const session = init.session || init.data.customer?.id;
assert(session, "Missing API session");
const html = await (await fetch(process.argv[2] || "http://localhost:3000", { signal: AbortSignal.timeout(90000) })).text();
const tiles = [...html.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(match => match[0]);
assert.equal(tiles.length, Object.keys(titles).length);
for (const [slug, title] of Object.entries(titles)) {
  const products = new Map(); let totalPages = 1; let totalCount = 0;
  for (let page = 1; page <= totalPages; page++) {
    const { data } = await api("/api/catalog", { url: map[slug], page, itemsPerPage: 500 }, session);
    assert.equal(data.category?.url, map[slug], `Wrong category for ${slug}`);
    totalPages = data.pager.totalPageCount; totalCount = data.pager.totalCount;
    for (const product of data.products || []) products.set(product.productId, product);
  }
  assert.equal(products.size, totalCount, `Incomplete category pagination: ${slug}`);
  const tile = tiles.find(block => block.includes(`>${title}</h3>`));
  assert(tile, `Missing tile: ${title}`);
  const label = tile.match(/<p[^>]*>(.*?)<\/p>/)?.[1];
  assert.equal(Number(label?.match(/\d+/)?.[0]), totalCount, `Wrong count: ${title}`);
  const allowed = new Set([...products.values()].flatMap(p => [p.photoMiddle, p.photoSmall, ...(p.photos || []).flatMap(photo => [photo.smallSrc, photo.middleSrc, photo.bigSrc])]).filter(Boolean));
  const images = [...tile.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m => {
    let url = new URL(m[1].replaceAll("&amp;", "&"), "http://localhost:3000");
    if (url.pathname === "/_next/image") url = new URL(url.searchParams.get("url"), "http://localhost:3000");
    return url.pathname === "/api/advantshop-image" ? url.searchParams.get("src") : url.href;
  });
  assert(images.length <= 3);
  for (const image of images) assert(allowed.has(image), `Photo outside category ${title}: ${image}`);
  if (allowed.size >= 3) assert.equal(images.length, 3, `Expected 3 photos: ${title}`);
  console.log(`PASS ${title}: ${totalCount} models, ${images.length} category photos`);
}
