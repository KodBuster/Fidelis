import "server-only";
import { redirect } from "next/navigation";
import { getCurrentAccount } from "./session";
export async function requireCatalogAccess() {
  const account = await getCurrentAccount();
  if (!account?.access) redirect("/account");
  return account;
}
