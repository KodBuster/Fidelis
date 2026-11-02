import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/session";
import { getProductDetails } from "@/lib/products-service";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!(await getCurrentAccount())?.access) return NextResponse.json({ error: "Доступ закрыт" }, { status: 403 });
  const { slug } = await context.params;

  try {
    const product = await getProductDetails(slug);

    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product API error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить товар" },
      { status: 500 }
    );
  }
}
