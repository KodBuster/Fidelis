"use client";

import Link from "next/link";
import { ProductImage } from "@/components/catalog/ProductImage";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";

export function CartView() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10 text-center">
          <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark mb-4">
            Корзина пуста
          </h1>
          <p className="text-brand-muted mb-8">
            Добавьте украшения из каталога — мы сохраним их здесь
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

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
              Оформление
            </p>
            <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark">
              Корзина
            </h1>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-sm text-brand-muted hover:text-brand-terracotta transition-colors"
          >
            Очистить корзину
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex gap-4 md:gap-6 bg-brand-surface rounded-xl p-4 md:p-5 shadow-sm"
              >
                <Link
                  href={`/products/${item.productSlug}`}
                  className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-lg overflow-hidden bg-brand-surface"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="font-heading text-lg text-brand-olive-dark hover:text-brand-terracotta transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-brand-muted mt-1">
                        {item.stoneLabel} · серебро 925
                        {item.size !== null && ` · размер ${item.size}`}
                      </p>
                    </div>
                    <p className="font-heading text-lg text-brand-olive-dark shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                    <div className="flex items-center border border-brand-olive/20 rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-terracotta transition-colors"
                        aria-label="Уменьшить количество"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-terracotta transition-colors"
                        aria-label="Увеличить количество"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-brand-muted hover:text-brand-terracotta transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-brand-surface rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="font-heading text-xl text-brand-olive-dark">
                Итого
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-brand-muted">
                  <span>Товары ({items.length})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Доставка</span>
                  <span>Рассчитывается при оформлении</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-brand-sand font-heading text-xl text-brand-olive-dark">
                <span>К оплате</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center px-6 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
              >
                Оформить заказ
              </Link>

              <Link
                href="/shop"
                className="block text-center text-sm text-brand-terracotta hover:text-brand-terracotta transition-colors"
              >
                Продолжить покупки
              </Link>

              <p className="text-xs text-brand-muted leading-relaxed">
                Бесплатная доставка при заказе от 30 000 ₽. Доставка СДЭК.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
