"use client";

import { ProductImage } from "@/components/catalog/ProductImage";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CartItem } from "@/lib/cart";
import { getProductCaratWeight } from "@/lib/product-weight";
import {
  extractInsertMassFromName,
  formatInsertMassLabel,
  INSERT_WEIGHT_LABEL,
} from "@/lib/synthetic-diamond-labels";
import { CATEGORIES, formatPrice, type ProductDetails } from "@/lib/products";

type ProductQuickViewModalProps = {
  cartItem: CartItem | null;
  open: boolean;
  onClose: () => void;
};

export function ProductQuickViewModal({
  cartItem,
  open,
  onClose,
}: ProductQuickViewModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open || !cartItem) {
      setProduct(null);
      setError(null);
      setLoading(false);
      setActiveImageIndex(0);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/products/${encodeURIComponent(cartItem.productSlug)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          product?: ProductDetails;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Не удалось загрузить товар");
        }

        setProduct(data.product ?? null);
        setActiveImageIndex(0);
      })
      .catch((fetchError) => {
        if (controller.signal.aborted) return;
        setProduct(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Не удалось загрузить товар",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [cartItem, open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open || !cartItem || typeof document === "undefined") return null;

  const images =
    product?.images?.length ? product.images : [cartItem.image];
  const activeImage = images[activeImageIndex] ?? cartItem.image;
  const categoryTitle = product
    ? CATEGORIES[product.category].title
    : null;
  const insertMass = product
    ? extractInsertMassFromName(product.name) ??
      formatInsertMassLabel(getProductCaratWeight(product, cartItem.size))
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Закрыть карточку товара"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={cartItem.name}
        className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-brand-surface shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-brand-sand px-4 py-3 md:px-6">
          <p className="font-heading text-lg text-brand-olive-dark">Карточка товара</p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-brand-sand hover:text-brand-terracotta"
            aria-label="Закрыть"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-4 md:p-6">
          {loading ? (
            <p className="py-12 text-center text-sm text-brand-muted">Загрузка…</p>
          ) : error ? (
            <div className="py-12 text-center space-y-4">
              <p className="text-sm text-brand-terracotta" role="alert">
                {error}
              </p>
              <Link
                href={`/products/${cartItem.productSlug}`}
                className="inline-flex text-sm text-brand-terracotta hover:underline"
                onClick={onClose}
              >
                Открыть страницу товара →
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="space-y-3">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-brand-surface">
                  <ProductImage
                    src={activeImage}
                    alt={cartItem.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 420px"
                  />
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, index) => (
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                          index === activeImageIndex
                            ? "border-brand-olive-logo"
                            : "border-brand-olive/20 hover:border-brand-olive"
                        }`}
                        aria-label={`Фото ${index + 1}`}
                        aria-current={index === activeImageIndex}
                      >
                        <ProductImage
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {categoryTitle && (
                  <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase">
                    {categoryTitle}
                  </p>
                )}

                <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark">
                  {product?.name ?? cartItem.name}
                </h2>

                <p className="font-heading text-2xl text-brand-olive-dark">
                  {formatPrice(product?.price ?? cartItem.price)}
                </p>

                <div className="rounded-xl border border-brand-olive/15 bg-white p-4 text-sm space-y-2">
                  <p className="text-brand-muted">
                    В заказе: {cartItem.quantity} × {formatPrice(cartItem.price)}
                  </p>
                  <p className="text-brand-text">
                    {cartItem.stoneLabel} · серебро 925
                    {cartItem.size !== null && ` · размер ${cartItem.size}`}
                  </p>
                </div>

                {product && (
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-brand-sand pb-3">
                      <dt className="text-brand-muted">Металл</dt>
                      <dd className="text-brand-text text-right">{product.metal}</dd>
                    </div>
                    {insertMass && (
                      <div className="flex justify-between gap-4 border-b border-brand-sand pb-3">
                        <dt className="text-brand-muted">{INSERT_WEIGHT_LABEL}</dt>
                        <dd className="text-brand-text text-right">{insertMass}</dd>
                      </div>
                    )}
                    {product.cut?.trim() ? (
                      <div className="flex justify-between gap-4">
                        <dt className="text-brand-muted">Огранка</dt>
                        <dd className="text-brand-text text-right">{product.cut}</dd>
                      </div>
                    ) : null}
                  </dl>
                )}

                <Link
                  href={`/products/${cartItem.productSlug}`}
                  className="inline-flex text-sm text-brand-terracotta hover:underline"
                  onClick={onClose}
                >
                  Открыть полную страницу товара →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
