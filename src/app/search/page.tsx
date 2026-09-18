import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SearchResults } from "@/components/search/SearchResults";
import { buildPageMetadata } from "@/lib/metadata";
import { getSearchProducts } from "@/lib/search-service";
import { getSiteUrl } from "@/lib/site-url";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const hasQuery = query.length > 0;
  const baseMetadata = buildPageMetadata({
    title: hasQuery ? `Поиск: ${query} — ФИДЕЛИС` : "Поиск — ФИДЕЛИС",
    description:
      "Поиск украшений из серебра 925 в каталоге ФИДЕЛИС.",
    path: "/search",
    noIndex: hasQuery,
    robotsFollow: hasQuery,
  });

  if (!hasQuery) {
    return baseMetadata;
  }

  return {
    ...baseMetadata,
    alternates: {
      canonical: `${getSiteUrl()}/search`,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let products: Awaited<ReturnType<typeof getSearchProducts>> = [];
  let error: string | undefined;

  if (query) {
    try {
      products = await getSearchProducts(query);
    } catch (err) {
      console.error("Search page error:", err);
      error =
        err instanceof Error
          ? err.message === "terminated" || err.message.includes("fetch failed")
            ? "Поиск не ответил вовремя. Попробуйте обновить страницу."
            : err.message
          : "Не удалось выполнить поиск";
    }
  }

  return (
    <>
      <Header />
      <main>
        <SearchResults query={query} products={products} error={error} />
      </main>
      <Footer />
    </>
  );
}
