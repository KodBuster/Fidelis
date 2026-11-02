import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { db, type Account } from "./store";
import { digest, randomToken } from "./crypto";
import { syncApproval } from "./sync";

export const SESSION_COOKIE = "fidelis-session";
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
export async function createSession(accountId: string) {
  const token = randomToken();
  db().prepare("INSERT INTO sessions VALUES (?, ?, ?)").run(digest(token), accountId, Date.now() + 14 * 86400000);
  (await cookies()).set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: 14 * 86400 });
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE hash = ?").run(digest(token));
  jar.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
export const getCurrentAccount = cache(async (): Promise<(Account & { access: boolean; serviceUnavailable?: boolean }) | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return getAccountForToken(token);
});
export async function getAccountForToken(token?: string): Promise<(Account & { access: boolean; serviceUnavailable?: boolean }) | null> {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const account = db().prepare("SELECT a.* FROM accounts a JOIN sessions s ON s.account_id = a.id WHERE s.hash = ? AND s.expires > ?").get(digest(token), Date.now()) as Account | undefined;
  if (!account) return null;
  if (!account.verified || !account.customer_id) return { ...account, access: false };
  try { return { ...account, access: await syncApproval(account) }; }
  catch { return { ...account, access: false, serviceUnavailable: true }; }
}
