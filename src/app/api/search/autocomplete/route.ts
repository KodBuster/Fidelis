import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/session";
import { getSearchAutocomplete } from "@/lib/search-service";


export async function GET(request: Request) {
  if (!(await getCurrentAccount())?.access) return NextResponse.json({ error: "Доступ закрыт" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  try {
    const result = await getSearchAutocomplete(query);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Search autocomplete API error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось загрузить подсказки";
    const friendlyMessage =
      message === "terminated" || message.includes("fetch failed")
        ? "Подсказки не загрузились. Попробуйте ещё раз."
        : message;
    return NextResponse.json(
      { products: [], categories: [], error: friendlyMessage },
      { status: 502 }
    );
  }
}
