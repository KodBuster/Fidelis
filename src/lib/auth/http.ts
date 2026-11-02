import "server-only";
import { digest } from "./crypto";
import { db } from "./store";
import { getSiteUrl } from "@/lib/site-url";
export class AuthError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new URL(getSiteUrl()).origin;
  if (!origin || (origin !== allowed && !(process.env.NODE_ENV !== "production" && origin === new URL(request.url).origin))) throw new AuthError("Недопустимый источник запроса", 403);
}
export function rateLimit(key: string, maximum = 10, duration = 900000) {
  const hashed = digest(key);
  db().transaction(() => {
    const row = db().prepare("SELECT hits, expires FROM limits WHERE key = ?").get(hashed) as { hits: number; expires: number } | undefined;
    if (row && row.expires > Date.now() && row.hits >= maximum) throw new AuthError("Слишком много попыток. Попробуйте позже.", 429);
    db().prepare("INSERT INTO limits VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET hits = CASE WHEN expires < ? THEN 1 ELSE hits + 1 END, expires = CASE WHEN expires < ? THEN excluded.expires ELSE expires END").run(hashed, Date.now() + duration, Date.now(), Date.now());
  })();
}
export async function readAuthBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > 12000) throw new AuthError("Слишком большой запрос", 413);
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new AuthError("Некорректный запрос"); }
}
export function field(body: Record<string, unknown>, key: string, maximum = 200) {
  const value = body[key];
  if (typeof value !== "string" || value.trim().length > maximum) throw new AuthError("Проверьте заполнение полей");
  return value.trim();
}
