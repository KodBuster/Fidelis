import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CatalogView } from "@/components/catalog/CatalogView";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/breadcrumb-schema";
import { hasCatalogFilterParams } from "@/lib/catalog-utils";
import { buildCatalogItemListJsonLd } from "@/lib/item-list-schema";
import { buildPageMetadata } from "@/lib/metadata";
import { getCatalogProducts } from "@/lib/products-service";
import { getSiteUrl } from "@/lib/site-url";
import type { Product } from "@/lib/products";

type PageProps = {
  searchParams: Promise<{
    sort?: string;
    price?: string | string[];
    size?: string | string[];
    complect?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.sort) query.set("sort", params.sort);
  const prices = Array.isArray(params.price) ? params.price : params.price ? [params.price] : [];
  prices.forEach((value) => query.append("price", value));
  const sizes = Array.isArray(params.size) ? params.size : params.size ? [params.size] : [];
  sizes.forEach((value) => query.append("size", value));
  if (params.complect) query.set("complect", params.complect);

  const filtered = hasCatalogFilterParams(query);

  return buildPageMetadata({
    title: "Каталог — ФИДЕЛИС",
    description:
      "Каталог украшений из серебра 925 с ограненными синтетическими алмазами. Кольца, серьги, колье, браслеты, подарки.",
    path: "/shop",
    noIndex: filtered,
    robotsFollow: filtered,
  });
}

function CatalogFallback() {
  return (
    <div className="py-20 text-center text-brand-muted">Загрузка каталога…</div>
  );
}

export default async function ShopPage({ searchParams }: PageProps) {
  const { sort } = await searchParams;
  let initialProducts: Product[] = [];
  let initialError: string | undefined;

  try {
    initialProducts = await getCatalogProducts({ sort: sort ?? "default" });
  } catch {
    initialError = "Не удалось загрузить каталог из AdvantShop";
  }

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Каталог", path: "/shop" },
          ]),
          ...(initialProducts.length > 0
            ? [
                buildCatalogItemListJsonLd({
                  name: "Каталог украшений ФИДЕЛИС",
                  url: `${getSiteUrl()}/shop`,
                  products: initialProducts,
                }),
              ]
            : []),
        ]}
      />
      <Header />
      <main>
        <Suspense fallback={<CatalogFallback />}>
          <CatalogView
            initialProducts={initialProducts}
            initialError={initialError}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
