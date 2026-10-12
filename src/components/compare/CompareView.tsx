"use client";

import { ProductImage } from "@/components/catalog/ProductImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompare } from "@/context/CompareContext";
import { MAX_COMPARE_ITEMS } from "@/lib/compare";
import {
  CATEGORIES,
  formatPrice,
  getProductTotalPrice,
  type ProductDetails,
} from "@/lib/products";

type CompareRow = {
  label: string;
  values: (string | null)[];
};

function buildRows(products: ProductDetails[]): CompareRow[] {
  const formatSizes = (product: ProductDetails) =>
    product.sizeOptions.length > 0
      ? `${product.sizeOptions[0].label}–${product.sizeOptions[product.sizeOptions.length - 1].label}`
      : "—";

  const formatVariants = (product: ProductDetails) => {
    const prices = product.stoneVariants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
  };

  return [
    {
      label: "Цена изделия",
      values: products.map((p) => formatPrice(getProductTotalPrice(p, null))),
    },
    {
      label: "Цена за грамм",
      values: products.map((p) => formatPrice(p.price)),
    },
    {
      label: "Карат (базовый)",
      values: products.map((p) => `${p.stoneWeight} карат`),
    },
    {
      label: "Варианты карата",
      values: products.map((p) => formatVariants(p)),
    },
    {
      label: "Металл",
      values: products.map((p) => p.metal),
    },
    {
      label: "Цвет камня",
      values: products.map((p) => p.color),
    },
    {
      label: "Чистота",
      values: products.map((p) => p.clarity),
    },
    {
      label: "Огранка",
      values: products.map((p) => p.cut),
    },
    {
      label: "Размеры",
      values: products.map(formatSizes),
    },
    {
      label: "Статус",
      values: products.map((p) => p.badge ?? (p.isNew ? "Новинка" : "—")),
    },
  ];
}

export function CompareView() {
  const { slugs, removeItem, clearCompare, isReady } = useCompare();
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    if (!slugs.length) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      slugs.map(async (slug) => {
        const response = await fetch(`/api/products/${slug}`);
        if (!response.ok) return null;
        const data = (await response.json()) as { product?: ProductDetails };
        return data.product ?? null;
      })
    )
      .then((items) => {
        if (!cancelled) {
          setProducts(
            items.filter((item): item is ProductDetails => item !== null)
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slugs, isReady]);

  if (!isReady || loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10 text-center text-brand-muted">
          Загрузка…
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10 text-center">
          <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark mb-4">
            Сравнение товаров
          </h1>
          <p className="text-brand-muted mb-8 max-w-md mx-auto">
            Добавьте до {MAX_COMPARE_ITEMS} украшений из каталога, чтобы сравнить
            цену, каратность и характеристики
          </p>
          <Link
            href="/shop"
            className="inline-flex px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>
      </section>
    );
  }

  const rows = buildRows(products);

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
              Каталог
            </p>
            <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark">
              Сравнение товаров
            </h1>
            <p className="text-sm text-brand-muted mt-2">
              {products.length} из {MAX_COMPARE_ITEMS} товаров
            </p>
          </div>
          <button
            type="button"
            onClick={clearCompare}
            className="text-sm text-brand-muted hover:text-brand-terracotta transition-colors"
          >
            Очистить сравнение
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[720px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-brand-sand text-left p-4 font-heading text-brand-olive-dark rounded-tl-xl w-40 md:w-48">
                  Параметр
                </th>
                {products.map((product, index) => (
                  <th
                    key={product.slug}
                    className={`bg-brand-surface p-4 align-top min-w-[180px] ${
                      index === products.length - 1 ? "rounded-tr-xl" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-brand-surface">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="180px"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">
                          {CATEGORIES[product.category].title}
                        </p>
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-heading text-base text-brand-olive-dark hover:text-brand-terracotta transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(product.slug)}
                        className="text-xs text-brand-muted hover:text-brand-terracotta transition-colors"
                      >
                        Убрать
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.label}>
                  <th
                    className={`sticky left-0 z-10 bg-brand-sand text-left p-4 text-sm text-brand-muted font-normal border-t border-brand-olive/10 ${
                      rowIndex === rows.length - 1 ? "rounded-bl-xl" : ""
                    }`}
                  >
                    {row.label}
                  </th>
                  {row.values.map((value, colIndex) => (
                    <td
                      key={`${row.label}-${colIndex}`}
                      className={`bg-brand-surface p-4 text-sm text-brand-text border-t border-brand-olive/10 align-top ${
                        rowIndex === rows.length - 1 && colIndex === row.values.length - 1
                          ? "rounded-br-xl"
                          : ""
                      }`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="inline-flex px-6 py-3 border border-brand-olive/30 text-brand-olive-dark hover:border-brand-olive text-sm tracking-widest uppercase transition-colors"
            >
              {product.name}
            </Link>
          ))}
          {products.length < MAX_COMPARE_ITEMS && (
            <Link
              href="/shop"
              className="inline-flex px-6 py-3 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
            >
              Добавить товар
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
