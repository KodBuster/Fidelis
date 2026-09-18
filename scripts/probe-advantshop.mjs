/**
 * Диагностика подключения AdvantShop.
 * Использование: положить в корень витрины, заполнить .env.local, запустить:
 *   node scripts/probe-advantshop.mjs
 */
import { readFileSync, existsSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const base = process.env.ADVANTSHOP_BASE_URL?.replace(/\/$/, "");
const serverKey = process.env.ADVANTSHOP_SERVER_API_KEY || process.env.ADVANTSHOP_API_KEY;
const clientKey = process.env.ADVANTSHOP_CLIENT_API_KEY || process.env.ADVANTSHOP_API_KEY;
const categoryMapRaw = process.env.ADVANTSHOP_CATEGORY_MAP ?? "";

function parseCategoryMap(raw) {
  if (raw.startsWith("{")) {
    try {
      return Object.entries(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return raw
    .split(",")
    .map((part) => part.split(":").map((s) => s.trim()))
    .filter(([slug, url]) => slug && url);
}

function fail(label, error) {
  console.error(`FAIL  ${label}:`, error instanceof Error ? error.message : error);
  return false;
}

async function request(url, { apiKey, userId, method = "GET", body } = {}) {
  const u = new URL(url);
  u.searchParams.set("apikey", apiKey);
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-API-KEY": apiKey,
  };
  if (userId) headers["X-API-USER-ID"] = userId;

  const response = await fetch(u, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 300) };
  }

  return { ok: response.ok, status: response.status, data, userId: response.headers.get("x-api-user-id") };
}

console.log("AdvantShop probe\n================");

if (!base) {
  console.error("ADVANTSHOP_BASE_URL is missing");
  process.exit(1);
}
if (!serverKey) {
  console.error("ADVANTSHOP_SERVER_API_KEY is missing");
  process.exit(1);
}
if (!clientKey) {
  console.error("ADVANTSHOP_CLIENT_API_KEY is missing");
  process.exit(1);
}

console.log("BASE_URL:", base);
console.log("CATEGORY_MAP:", categoryMapRaw || "(empty)");
console.log("");

let ok = true;

// 1. Categories (Server API)
try {
  const { ok: resOk, status, data } = await request(`${base}/api/categories`, {
    apiKey: serverKey,
  });
  const count = data.categories?.length ?? 0;
  if (!resOk || data.status === "error") {
    ok = fail("Server API /api/categories", data.errors ?? status) && ok;
  } else {
    console.log(`OK    Server API categories: ${count} items`);
  }
} catch (e) {
  ok = fail("Server API /api/categories", e) && ok;
}

// 2. Client init
let clientUserId;
try {
  const { ok: resOk, data, userId } = await request(`${base}/api/init`, { apiKey: clientKey });
  clientUserId = userId ?? data.customer?.id;
  if (!resOk || !clientUserId) {
    ok = fail("Client API /api/init", data.errors ?? "no X-API-USER-ID") && ok;
  } else {
    console.log(`OK    Client API init: userId=${clientUserId}`);
  }
} catch (e) {
  ok = fail("Client API /api/init", e) && ok;
}

// 3. Catalog per mapped category
const categoryEntries = parseCategoryMap(categoryMapRaw);
if (!categoryEntries.length) {
  console.warn("WARN  ADVANTSHOP_CATEGORY_MAP is empty — skip catalog test");
} else if (clientUserId) {
  for (const [slug, url] of categoryEntries) {
    try {
      const { ok: resOk, data } = await request(`${base}/api/catalog`, {
        apiKey: clientKey,
        userId: clientUserId,
        method: "POST",
        body: { url, sorting: "NoSorting", page: 1, itemsPerPage: 5 },
      });
      const count = data.products?.length ?? 0;
      if (!resOk || data.status === "error") {
        ok = fail(`Catalog [${slug}→${url}]`, data.errors) && ok;
      } else {
        console.log(`OK    Catalog [${slug}→${url}]: ${count} products (page 1)`);
        const first = data.products?.[0];
        if (first?.productId) {
          const details = await request(`${base}/api/products/${first.productId}`, {
            apiKey: clientKey,
            userId: clientUserId,
          });
          if (details.ok) {
            console.log(`OK    Product ${first.productId}: ${details.data.name ?? first.name}`);
          } else {
            ok = fail(`Product ${first.productId}`, details.data.errors) && ok;
          }
        }
      }
    } catch (e) {
      ok = fail(`Catalog [${slug}]`, e) && ok;
    }
  }
}

console.log("");
console.log(ok ? "All checks passed." : "Some checks failed — see errors above.");
process.exit(ok ? 0 : 1);
