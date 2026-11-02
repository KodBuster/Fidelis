import { NextResponse } from "next/server";
import { isAllowedAdvantShopImageUrl } from "@/lib/advantshop/images";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get("src");

  if (!src || !isAllowedAdvantShopImageUrl(src)) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  const headers: HeadersInit = {
    Accept: "image/*",
  };

  const storeCookie = process.env.ADVANTSHOP_STORE_COOKIE?.trim();
  if (storeCookie) {
    headers.Cookie = storeCookie;
  }

  try {
    const response = await fetch(src, {
      headers,
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(12000),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const buffer = await response.arrayBuffer();

    if (
      !response.ok ||
      !contentType.startsWith("image/") ||
      buffer.byteLength < 128
    ) {
      return NextResponse.json(
        {
          error:
            "Изображение недоступно. Откройте витрину AdvantShop для публичного доступа или задайте ADVANTSHOP_STORE_COOKIE.",
        },
        { status: 502 }
      );
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=2592000, stale-while-revalidate=31536000",
      },
    });
  } catch (error) {
    console.error("AdvantShop image proxy error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить изображение" },
      { status: 502 }
    );
  }
}
