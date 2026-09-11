import { ProductImage } from "@/components/catalog/ProductImage";
import Link from "next/link";
import { CompareButton } from "@/components/compare/CompareButton";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { formatPrice, type Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  revealImageOnScroll?: boolean;
  revealDelayMs?: number;
  badgeLabel?: string;
};

export function ProductCard({
  product,
  revealImageOnScroll = false,
  revealDelayMs = 0,
  badgeLabel,
}: ProductCardProps) {
  const displayBadge = badgeLabel ?? product.badge;
  const imageBlock = (
    <div className="aspect-square relative overflow-hidden bg-brand-surface">
      <Link href={`/products/${product.slug}`} className="absolute inset-0">
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </Link>
      {displayBadge && (
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-brand-terracotta text-white text-[10px] tracking-widest uppercase">
          {displayBadge}
        </span>
      )}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <FavoriteButton slug={product.slug} />
        <CompareButton slug={product.slug} />
      </div>
    </div>
  );

  return (
    <article className="group bg-brand-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {revealImageOnScroll ? (
        <ScrollReveal delayMs={revealDelayMs}>{imageBlock}</ScrollReveal>
      ) : (
        imageBlock
      )}
      <Link
        href={`/products/${product.slug}`}
        className="block p-4"
      >
        <h3 className="text-sm md:text-base text-brand-text group-hover:text-brand-terracotta transition-colors">
          {product.name}
        </h3>
        {product.artNo ? (
          <p className="mt-1 text-xs text-brand-muted">Арт. {product.artNo}</p>
        ) : null}
        <p className="mt-1.5 font-heading text-brand-olive-dark text-lg">
          {formatPrice(product.price)}
        </p>
      </Link>
    </article>
  );
}
