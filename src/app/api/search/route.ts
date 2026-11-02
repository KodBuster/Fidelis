import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/session";
import { getSearchProducts } from "@/lib/search-service";

export async function GET(request: Request) {
  if (!(await getCurrentAccount())?.access) return NextResponse.json({ error: "Доступ закрыт" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const sort = searchParams.get("sort") ?? "default";

  if (!query) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await getSearchProducts(query, { sort });
    return NextResponse.json(
      { products, query },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Search API error:", error);
    const message =
      error instanceof Error ? error.message : "Не удалось выполнить поиск";
    const friendlyMessage =
      message === "terminated" || message.includes("fetch failed")
        ? "Поиск не ответил вовремя. Попробуйте обновить страницу."
        : message;
    return NextResponse.json(
      { products: [], query, error: friendlyMessage },
      { status: 502 }
    );
  }
}
