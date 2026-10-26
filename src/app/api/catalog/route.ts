import { NextResponse } from "next/server";
import { CATALOG_REVALIDATE_SECONDS } from "@/lib/advantshop/config";
import { isValidCategory } from "@/lib/products";
import {
  catalogNeedsEnrichStock,
  getCatalogProducts,
} from "@/lib/products-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const sort = searchParams.get("sort") ?? "default";
  const manufacturer = searchParams.get("manufacturer");
  const complectsOnly = searchParams.get("complect") === "1";

  const category =
    categoryParam && isValidCategory(categoryParam) ? categoryParam : undefined;

  try {
    const products = await getCatalogProducts({
      category,
      sort,
      enrichStock: catalogNeedsEnrichStock({ manufacturer, complectsOnly }),
    });
    const cacheSeconds = CATALOG_REVALIDATE_SECONDS;

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=600`,
        },
      }
    );
  } catch (error) {
    console.error("Catalog API error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось загрузить каталог";
    const friendlyMessage =
      message === "terminated" || message.includes("fetch failed")
        ? "AdvantShop не ответил вовремя. Попробуйте обновить страницу."
        : message;
    return NextResponse.json(
      { products: [], error: friendlyMessage },
      { status: 502 }
    );
  }
}
