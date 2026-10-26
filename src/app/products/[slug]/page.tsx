import { notFound, permanentRedirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductPage } from "@/components/product/ProductPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { buildProductMetaDescription } from "@/lib/product-metadata";
import { isLegacyProductSlug } from "@/lib/product-slug";
import { buildProductJsonLd } from "@/lib/product-schema";
import { CATALOG_REVALIDATE_SECONDS } from "@/lib/advantshop/config";
import {
  getComplectProducts,
  getProductDetails,
  getRelatedProducts,
} from "@/lib/products-service";

// Данные товара кэшируются в unstable_cache; force-dynamic оставляем,
// чтобы next build не ходил в AdvantShop на Render/Amvera.
export const dynamic = "force-dynamic";
export const revalidate = CATALOG_REVALIDATE_SECONDS;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductDetails(slug);
  if (!product) return {};

  const canonicalSlug = product.slug;

  return buildPageMetadata({
    title: `${product.name} — купить в ФИДЕЛИС`,
    description: buildProductMetaDescription(product),
    path: `/products/${canonicalSlug}`,
    ogImage: product.images[0] ?? product.image,
  });
}

export default async function ProductRoute({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductDetails(slug);

  if (!product) {
    notFound();
  }

  if (isLegacyProductSlug(slug, product)) {
    permanentRedirect(`/products/${product.slug}`);
  }

  const [relatedProducts, complectProducts] = await Promise.all([
    getRelatedProducts(product),
    getComplectProducts(product),
  ]);

  return (
    <>
      <JsonLd data={buildProductJsonLd(product, product.slug)} />
      <Header />
      <main>
        <ProductPage
          product={product}
          relatedProducts={relatedProducts}
          complectProducts={complectProducts}
        />
      </main>
      <Footer />
    </>
  );
}
