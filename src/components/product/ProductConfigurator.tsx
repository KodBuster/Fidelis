"use client";

import { useState } from "react";
import Link from "next/link";
import { CompareButton } from "@/components/compare/CompareButton";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { useCart } from "@/context/CartContext";
import { trackAddToCart } from "@/lib/analytics/metrika";
import { formatInsertMassLabel } from "@/lib/synthetic-diamond-labels";
import { formatPrice, type ProductDetails } from "@/lib/products";
import { useProductSelection } from "./ProductSelectionContext";

function formatWeightGrams(value: string | number): string {
  if (typeof value === "number") {
    return `${value.toLocaleString("ru-RU", {
      maximumFractionDigits: 3,
    })} гр.`;
  }
  const trimmed = value.trim().replace(/\s*г(?:р)?\.?\s*$/i, "");
  return `${trimmed} гр.`;
}

type ProductConfiguratorProps = {
  product: ProductDetails;
};

export function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const defaultVariant =
    product.stoneVariants.find(
      (variant) => Math.abs(variant.weight - product.stoneWeight) < 0.001,
    ) ?? product.stoneVariants[0];

  const {
    selectedSize,
    setSelectedSize,
    selectedSizeLabel,
    artNo,
    pricePerGram,
    productPrice,
    weightGrams,
    diamondWeight,
  } = useProductSelection();
  const cartStoneLabel = formatInsertMassLabel(diamondWeight);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const selectedSizeStock =
    selectedSize && product.sizeStockAmounts
      ? product.sizeStockAmounts[selectedSize]
      : undefined;
  const selectedSizeAvailable =
    selectedSizeStock === undefined || selectedSizeStock > 0;
  const canBuy =
    product.inStock !== false &&
    selectedSizeAvailable &&
    (product.sizeOptions.length === 0 || selectedSize != null);
  const displayWeightGrams =
    (selectedSize && product.sizeWeightGrams?.[selectedSize]) ||
    product.weightGrams;

  const handleAddToCart = () => {
    if (!canBuy) return;

    const variant = [
      defaultVariant.label,
      selectedSizeLabel != null ? `размер ${selectedSizeLabel}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    addItem({
      productSlug: product.slug,
      name: product.name,
      image: product.image,
      price: productPrice,
      stoneWeight: diamondWeight,
      stoneLabel: cartStoneLabel,
      size: selectedSize,
      artNo,
    });
    trackAddToCart({
      id: artNo ?? product.slug,
      name: product.name,
      price: productPrice,
      category: product.category,
      variant: variant || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 space-y-3">
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-brand-muted mb-1">
              Цена изделия
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-heading text-3xl md:text-4xl text-brand-olive-dark">
                {formatPrice(productPrice)}
              </p>
              {product.badge && (
                <span className="px-2.5 py-1 bg-brand-terracotta text-white text-[10px] tracking-widest uppercase">
                  {product.badge}
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-brand-muted mb-1">
              Цена за грамм
            </p>
            <p className="font-heading text-xl md:text-2xl text-brand-olive-dark">
              {formatPrice(pricePerGram)}
              <span className="ml-1 text-sm font-body text-brand-muted">/ г</span>
            </p>
          </div>
        </div>
        {product.inStock === false ? (
          <p className="mt-2 text-sm font-medium text-brand-terracotta">
            Скоро будет
          </p>
        ) : null}
        {displayWeightGrams || weightGrams ? (
          <p className="mt-1 text-sm text-brand-muted">
            Вес изделия:{" "}
            {formatWeightGrams(displayWeightGrams ?? weightGrams ?? "")}
          </p>
        ) : null}
        {artNo ? (
          <p className="mt-1 text-sm text-brand-muted">
            Артикул:{" "}
            <span className="font-medium text-brand-olive-dark">{artNo}</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        {product.sizeOptions.length > 0 && (
          <div>
            <p
              id="size-label"
              className="block text-xs tracking-[0.15em] uppercase text-brand-muted mb-2"
            >
              Размер
            </p>
            <div
              className="grid grid-cols-4 sm:grid-cols-5 gap-2"
              role="radiogroup"
              aria-labelledby="size-label"
            >
              {product.sizeOptions.map((size) => {
                const isSelected = selectedSize === size.value;
                const sizeStock = product.sizeStockAmounts?.[size.value];
                const sizeAvailable =
                  sizeStock === undefined || sizeStock > 0;
                return (
                  <button
                    key={size.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedSize(size.value)}
                    className={`touch-manipulation rounded-lg border px-2 py-2.5 text-center text-sm transition-colors [-webkit-tap-highlight-color:transparent] ${
                      isSelected
                        ? "border-brand-olive-logo bg-brand-olive-logo text-white font-medium"
                        : sizeAvailable
                          ? "border-brand-olive/20 bg-brand-surface text-brand-text hover:border-brand-olive"
                          : "border-brand-olive/10 bg-brand-surface text-brand-muted"
                    }`}
                  >
                    {size.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-brand-muted">
              <a
                href="/how-size-ring"
                className="text-brand-terracotta hover:underline"
              >
                Как определить размер →
              </a>
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        data-add-to-cart
        onClick={handleAddToCart}
        disabled={!canBuy}
        className="w-full px-6 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo disabled:cursor-not-allowed disabled:opacity-50 text-white text-sm tracking-widest uppercase transition-colors"
      >
        {product.inStock === false || !selectedSizeAvailable
          ? "Скоро будет"
          : added
            ? "Добавлено ✓"
            : "В корзину"}
      </button>

      <div className="flex flex-col sm:flex-row gap-3">
        <FavoriteButton slug={product.slug} variant="text" className="flex-1" />
        <CompareButton slug={product.slug} variant="text" className="flex-1" />
      </div>

      <Link
        href="/favorites"
        className="inline-flex text-sm text-brand-terracotta hover:text-brand-terracotta transition-colors"
      >
        Открыть избранное →
      </Link>

      {added && (
        <p className="text-sm text-brand-terracotta">
          Товар добавлен в корзину.{" "}
          <Link href="/cart" className="underline hover:text-brand-terracotta">
            Перейти в корзину →
          </Link>
        </p>
      )}
    </div>
  );
}
