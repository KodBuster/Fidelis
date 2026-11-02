// Integration smoke test. Uses only a loopback mock, temporary SQLite, and undeliverable local SMTP.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import Database from "better-sqlite3";

const temporary = mkdtempSync(join(tmpdir(), "fidelis-auth-test-"));
const dbPath = join(temporary, "auth.sqlite");
const port = Number(process.env.AUTH_TEST_PORT || 3321);
const origin = `http://127.0.0.1:${port}`;
const customerId = "b337541c-7c41-4bd1-a3d6-360cf655601b";
let groupId = 1;
let upstreamAvailable = true;
let accountEmail = "partner@example.test";
const upstream = createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json");
  if (!upstreamAvailable) { response.statusCode = 503; response.end("{}"); return; }
  const path = new URL(request.url, "http://localhost").pathname;
  if (path === "/api/customers") response.end(JSON.stringify({ customers: [{ id: customerId, email: accountEmail }] }));
  else if (path.startsWith("/api/customers/")) response.end(JSON.stringify({ id: customerId, groupId }));
  else if (path === "/api/order/getlist") {
    let text = ""; for await (const part of request) text += part;
    const body = JSON.parse(text);
    assert.equal(body.CustomerId, customerId);
    response.end(JSON.stringify({ result: true, obj: { TotalPageCount: 1, DataItems: [
      { Id: 1, Number: "OWN-ORDER", Date: "2026-11-02T12:00:00", Sum: 100, Currency: "RUB", Customer: { CustomerId: customerId }, Status: { Name: "Принят" }, Items: [{ Name: "Мой товар", ArtNo: "TEST-1", Amount: 1, Price: 100 }], AdminComment: "PRIVATE-ADMIN-COMMENT" },
      { Id: 2, Number: "FOREIGN-ORDER", Customer: { CustomerId: "other-customer" }, Sum: 999, Currency: "RUB", Date: "2026-11-02" },
    ] } }));
  } else { response.statusCode = 404; response.end(JSON.stringify({ status: "error", errors: "Unsupported mock endpoint" })); }
});
await new Promise(r => upstream.listen(0, "127.0.0.1", r));
const backend = `http://127.0.0.1:${upstream.address().port}`;
const production = process.env.AUTH_TEST_PRODUCTION === "1";
const args = production ? [process.env.AUTH_TEST_BUNDLE_SERVER || ".next/standalone/server.js"] : ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)];
const child = spawn(process.execPath, args, {
  cwd: resolve("."), windowsHide: true,
  env: { ...process.env, HOSTNAME: "127.0.0.1", PORT: String(port), AUTH_DB_PATH: dbPath, SITE_URL: origin, ADVANTSHOP_BASE_URL: backend, ADVANTSHOP_SERVER_API_KEY: "test", ADVANTSHOP_CLIENT_API_KEY: "test", ADVANTSHOP_CATEGORY_MAP: "", ADVANTSHOP_APPROVED_GROUP_ID: "42", SMTP_HOST: "127.0.0.1", SMTP_PORT: "465", SMTP_PASSWORD: "local-test-only", NODE_ENV: production ? "production" : "development" },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = ""; child.stdout.on("data", b => { logs = (logs + b).slice(-12000); }); child.stderr.on("data", b => { logs = (logs + b).slice(-12000); });
let database;
let cookie = "";
const post = (action, body, extra = {}) => fetch(`${origin}/api/auth/${action}`, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", Cookie: cookie, ...extra }, body: JSON.stringify(body), redirect: "manual" });
const get = path => fetch(origin + path, { headers: { Cookie: cookie }, redirect: "manual" });
const pause = ms => new Promise(r => setTimeout(r, ms));
try {
  for (let attempt = 0; ; attempt++) {
    try { const r = await get("/account"); if (r.status === 200) break; } catch { /* starting */ }
    if (attempt > 90) throw new Error("Dev server did not start");
    await pause(500);
  }
  for (const path of ["/api/catalog", "/api/search?q=ring", "/api/search/autocomplete?q=ri", "/api/products/test", "/api/orders"]) assert.equal((await get(path)).status, 403, path);
  for (const path of ["/shop", "/shop/rings", "/products/test", "/search", "/v2", "/checkout"]) assert.equal((await get(path)).status, 307, path);
  const guest = await (await get("/")).text();
  assert(guest.includes("Для ознакомления с каталогом"));
  assert(!guest.includes("Цены на украшения"));
  assert(!guest.includes('href="/shop/rings"'));
  console.log("PASS guest homepage, hidden navigation, direct page/API access");
  const registration = { name: "Тестовый партнёр", email: accountEmail, phone: "+7 (999) 123-45-67", organization: "Тест", city: "Москва", password: " StrongPassword123 ", confirmPassword: " StrongPassword123 ", consent: true };
  assert.equal((await post("register", registration, { Origin: "https://evil.example" })).status, 403);
  assert.equal((await post("register", { ...registration, consent: false })).status, 400);
  assert.equal((await post("register", registration)).status, 200);
  database = new Database(dbPath);
  const account = database.prepare("SELECT * FROM accounts WHERE email = ?").get(accountEmail);
  assert(account && !account.verified && !account.customer_id);
  assert(!account.password_hash.includes(registration.password));
  const verification = database.prepare("SELECT body FROM mail WHERE recipient = ? AND subject LIKE '%подтвердите%'").get(accountEmail);
  const token = new URL(verification.body.match(/http:\/\/[^\s]+/)[0]).searchParams.get("token");
  assert.equal((await post("login", { email: accountEmail, password: "wrong" })).status, 401);
  let result = await post("login", registration);
  assert.equal(result.status, 200);
  cookie = result.headers.get("set-cookie").split(";")[0];
  assert.equal((await get("/api/catalog")).status, 403);
  assert.equal((await get(`/account/verify?token=${token}`)).status, 200);
  assert.equal(database.prepare("SELECT verified FROM accounts WHERE id = ?").get(account.id).verified, 0);
  result = await post("verify", { token }); assert.equal(result.status, 200);
  cookie = result.headers.get("set-cookie").split(", ").find(x => x.startsWith("fidelis-session=") && !x.startsWith("fidelis-session=;") )?.split(";")[0] || cookie;
  // Re-login after verification to avoid header serialization differences between runtimes.
  result = await post("login", registration); cookie = result.headers.getSetCookie().find(x => /^fidelis-session=[a-f0-9]{64};/.test(x)).split(";")[0];
  assert.equal((await post("verify", { token })).status, 400);
  for (let attempt = 0; !database.prepare("SELECT customer_id FROM accounts WHERE id = ?").get(account.id).customer_id; attempt++) { if (attempt > 40) throw new Error("Provisioning timed out"); await pause(250); }
  assert.equal((await get("/api/catalog")).status, 403);
  const notifications = database.prepare("SELECT recipient FROM mail WHERE subject LIKE '%новая заявка%'").all(); assert.equal(notifications.length, 4);
  console.log("PASS registration validation, CSRF, password hash, email verification, pending access, administrator queue");
  groupId = 42;
  assert.equal((await get("/api/catalog")).status, 200);
  const privatePage = await (await get("/")).text(); assert(privatePage.includes("Коллекции")); assert(privatePage.includes("Цены на украшения"));
  const cabinet = await (await get("/account")).text();
  assert(cabinet.includes("OWN-ORDER")); assert(!cabinet.includes("FOREIGN-ORDER")); assert(!cabinet.includes("PRIVATE-ADMIN-COMMENT"));
  assert(database.prepare("SELECT id FROM mail WHERE subject LIKE '%доступ к каталогу открыт%'").get());
  groupId = 1; assert.equal((await get("/api/catalog")).status, 403);
  groupId = 42; upstreamAvailable = false; assert.equal((await get("/api/catalog")).status, 403); upstreamAvailable = true;
  console.log("PASS approval, full homepage, own orders only, approval notification, revocation, fail-closed API outage");
  assert.equal((await post("forgot", { email: accountEmail })).status, 200);
  const reset = database.prepare("SELECT body FROM mail WHERE subject LIKE '%восстановление%' ORDER BY rowid DESC").get();
  const resetToken = new URL(reset.body.match(/http:\/\/[^\s]+/)[0]).searchParams.get("token");
  assert.equal((await post("reset", { token: resetToken, password: "NewPassword123", confirmPassword: "NewPassword123" })).status, 200);
  assert.equal((await get("/api/catalog")).status, 403);
  assert.equal((await post("reset", { token: resetToken, password: "NewPassword123", confirmPassword: "NewPassword123" })).status, 400);
  result = await post("login", { email: accountEmail, password: "NewPassword123" }); assert.equal(result.status, 200);
  cookie = result.headers.getSetCookie().find(x => /^fidelis-session=[a-f0-9]{64};/.test(x)).split(";")[0];
  assert.equal((await post("password", { currentPassword: "NewPassword123", password: "NextPassword123", confirmPassword: "NextPassword123" })).status, 200);
  // The cookie before password rotation must no longer authenticate.
  assert.equal((await get("/api/catalog")).status, 403);
  console.log("PASS password reset, one-time reset token, password rotation, session invalidation");
  result = await post("login", { email: accountEmail, password: "NextPassword123" });
  assert.equal(result.status, 200);
  cookie = result.headers.getSetCookie().find(x => /^fidelis-session=[a-f0-9]{64};/.test(x)).split(";")[0];
  assert.equal((await post("logout", {})).status, 200);
  assert.equal((await get("/api/catalog")).status, 403);
  cookie = "fidelis-session=" + "a".repeat(64);
  assert.equal((await get("/api/catalog")).status, 403);
  console.log("PASS logout and forged session rejection");
} catch (error) { console.error(logs); throw error; }
finally {
  database?.close(); child.kill(); upstream.close();
  await new Promise(resolve => { if (child.exitCode !== null) resolve(); else child.once("exit", resolve); });
  // Only the absolute directory returned by mkdtemp for this test is removed.
  rmSync(temporary, { recursive: true, force: true });
}
