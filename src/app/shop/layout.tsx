// Catalog pages load AdvantShop at runtime — not during `next build` (Render timeout).
export const dynamic = "force-dynamic";

import { requireCatalogAccess } from "@/lib/auth/access";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCatalogAccess();
  return children;
}
