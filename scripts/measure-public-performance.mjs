import { performance } from "node:perf_hooks";
const origin = process.argv[2] || "https://fidelischina.ru";
async function measure(url) {
  const start = performance.now();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    const headers = performance.now();
    const bytes = await response.arrayBuffer();
    return { url, status: response.status, ttfbMs: Math.round(headers - start), totalMs: Math.round(performance.now() - start), kb: Math.round(bytes.byteLength / 1024), cache: response.headers.get("cache-control") };
  } catch (error) { return { url, error: error.name, cause: error.cause?.code, totalMs: Math.round(performance.now() - start) }; }
}
for (const path of ["/", "/account", "/shipping", "/cooperation"]) console.log(JSON.stringify(await measure(new URL(path, origin).href)));
const html = await (await fetch(origin)).text();
const images = [...new Set([...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(match => new URL(match[1].replaceAll("&amp;", "&"), origin).href))];
const assets = [...new Set([...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css)[^"]*)"/g)].map(match => new URL(match[1].replaceAll("&amp;", "&"), origin).href))];
for (let i = 0; i < images.length; i += 4) {
  const results = await Promise.all(images.slice(i, i + 4).map(measure));
  for (const result of results) console.log(JSON.stringify({ kind: "image", ...result }));
}
for (const result of await Promise.all(assets.slice(0, 6).map(measure))) console.log(JSON.stringify({ kind: "asset", ...result }));
