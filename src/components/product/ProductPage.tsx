import { Suspense } from "react";
import Link from "next/link";
import { ProductViewTracker } from "@/components/analytics/ProductViewTracker";
import { CATEGORIES, type ProductDetails } from "@/lib/products";
import type { Product } from "@/lib/products";
import { getProductCaratWeight } from "@/lib/product-weight";
import { formatInsertMassLabel } from "@/lib/synthetic-diamond-labels";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductCharacteristics } from "./ProductCharacteristics";
import { ProductComplectSection } from "./ProductComplectSection";
import { ProductConfigurator } from "./ProductConfigurator";
import { ProductDescription } from "./ProductDescription";
import { ProductGallery } from "./ProductGallery";
import { ProductSelectionProvider } from "./ProductSelectionContext";
import { resolveProductVideoUrl } from "@/lib/product-video";

type ProductPageProps = {
  product: ProductDetails;
  relatedProducts: Product[];
  complectProducts: Product[];
};

export function ProductPage({
  product,
  relatedProducts,
  complectProducts,
}: ProductPageProps) {
  const related = relatedProducts;
  const categoryTitle = CATEGORIES[product.category].title;
  const insertMass = formatInsertMassLabel(getProductCaratWeight(product));
  const videoUrl = resolveProductVideoUrl([
    product.artNo,
    ...Object.values(product.sizeArtNos ?? {}),
    ...(product.offerArtNos ?? []),
  ]);
  const cartStoneLabel = insertMass;
  return (
    <section className="py-8 md:py-12">
      <ProductViewTracker
        id={product.artNo ?? product.slug}
        name={product.name}
        price={product.price}
        category={product.category}
        variant={insertMass}
      />
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
        <nav className="text-sm text-brand-muted mb-6" aria-label="Хлебные крошки">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-brand-terracotta transition-colors">
                Главная
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/shop" className="hover:text-brand-terracotta transition-colors">
                Каталог
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/shop/${product.category}`}
                className="hover:text-brand-terracotta transition-colors"
              >
                {categoryTitle}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <span className="text-brand-text">{product.name}</span>
            </li>
          </ol>
        </nav>

        <Suspense fallback={null}>
          <ProductSelectionProvider product={product}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mb-16 md:mb-20">
            <ProductGallery
              images={product.images}
              name={product.name}
              videoUrl={videoUrl}
              slug={product.slug}
              price={product.price}
              productImage={product.image}
              category={product.category}
              stoneWeight={product.stoneWeight}
              stoneLabel={cartStoneLabel}
              inStock={product.inStock !== false}
            />

            <div>
              <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
                {categoryTitle}
              </p>
              <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark mb-6">
                {product.name}
              </h1>
              <ProductConfigurator product={product} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16 md:mb-20">
            <ProductDescription product={product} />

            <ProductCharacteristics product={product} />
          </div>

          <div className="rounded-xl border border-brand-olive/15 bg-brand-surface p-6 md:p-8">
            <h2 className="font-heading text-xl text-brand-olive-dark mb-4">
              Полезно перед покупкой
            </h2>
            <ul className="space-y-2 text-sm md:text-base">
              {(product.category === "rings" ||
                product.category === "bracelets" ||
                product.category === "ankle-bracelets") && (
                <li>
                  <Link href="/how-size-ring" className="text-brand-terracotta hover:underline">
                    Как определить размер кольца или браслета
                  </Link>
                </li>
              )}
              <li>
                <Link href="/warranty" className="text-brand-terracotta hover:underline">
                  Гарантия и сертификация
                </Link>
              </li>
              <li>
                <Link href="/guide/lab-grown-diamonds" className="text-brand-terracotta hover:underline">
                  Об ограненных синтетических алмазах
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-brand-terracotta hover:underline">
                  Доставка СДЭК и оплата по счёту
                </Link>
              </li>
            </ul>
          </div>
          </ProductSelectionProvider>
        </Suspense>

        {complectProducts.length > 0 && product.setArtNos?.length ? (
          <ProductComplectSection products={complectProducts} />
        ) : null}

        {related.length > 0 && (
          <div className={complectProducts.length > 0 ? "mt-16 md:mt-20" : ""}>
            <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
              Похожие
            </p>
            <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-8">
              Вам также понравится
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
