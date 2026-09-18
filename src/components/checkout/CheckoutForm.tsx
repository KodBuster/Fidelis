"use client";

import { ProductImage } from "@/components/catalog/ProductImage";
import { ProductQuickViewModal } from "@/components/product/ProductQuickViewModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  trackBeginCheckout,
  trackOrderSubmit,
  trackPurchase,
} from "@/lib/analytics/metrika";
import {
  applyPhoneInputChange,
  getDeliveryFee,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  PENDING_ORDER_STORAGE_KEY,
  PENDING_PAYMENT_STORAGE_KEY,
  saveOrder,
  validateCheckoutForm,
  validatePersonalDataConsent,
  type CheckoutFormData,
  type Order,
  type PaymentMethod,
} from "@/lib/checkout";
import { formatPrice } from "@/lib/products";
import type { CartItem } from "@/lib/cart";

const initialForm: CheckoutFormData = {
  name: "",
  phone: "",
  deliveryMethod: "delivery",
  paymentMethod: "invoice",
  city: "Москва",
  address: "",
  apartment: "",
  comment: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, total, isReady, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutFormData>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [outOfStockItems, setOutOfStockItems] = useState<
    Array<{ name: string; size: string | null; productSlug: string }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [previewItem, setPreviewItem] = useState<CartItem | null>(null);
  const [personalDataConsent, setPersonalDataConsent] = useState(false);
  const checkoutTrackedRef = useRef(false);

  const deliveryFee = useMemo(
    () => getDeliveryFee(form.deliveryMethod, total),
    [form.deliveryMethod, total]
  );
  const orderTotal = total + deliveryFee;

  useEffect(() => {
    if (!isReady || completedOrder) return;
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [isReady, items.length, completedOrder, router]);

  useEffect(() => {
    if (!isReady || items.length === 0 || checkoutTrackedRef.current) return;
    checkoutTrackedRef.current = true;
    trackBeginCheckout(items);
  }, [isReady, items]);

  const updateField = <K extends keyof CheckoutFormData>(
    key: K,
    value: CheckoutFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setOutOfStockItems([]);
  };

  const handlePhoneChange = (value: string) => {
    updateField("phone", applyPhoneInputChange(form.phone, value));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const consentError = validatePersonalDataConsent(personalDataConsent);
    if (consentError) {
      setError(consentError);
      return;
    }
    const validationError = validateCheckoutForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setOutOfStockItems([]);

    const customer = {
      ...form,
      name: form.name.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      apartment: form.apartment.trim(),
      comment: form.comment.trim(),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items,
          subtotal: total,
          personalDataConsent: true,
        }),
      });

      const data = (await response.json()) as {
        id?: string;
        deliveryFee?: number;
        total?: number;
        advantshopOrderId?: number;
        advantshopOrderNumber?: string;
        paymentId?: string;
        paymentUrl?: string;
        paymentMethod?: PaymentMethod;
        error?: string;
        code?: string;
        unavailable?: Array<{
          name: string;
          size: string | null;
          productSlug: string;
        }>;
      };

      if (!response.ok) {
        if (data.code === "OUT_OF_STOCK") {
          setOutOfStockItems(data.unavailable ?? []);
          setError(
            data.error ??
              "К сожалению, эти изделия закончились. Пожалуйста, подберите вместо них другие. У нас ещё много чего есть.",
          );
          return;
        }
        throw new Error(data.error ?? "Не удалось оформить заказ");
      }

      if (!data.id && !data.advantshopOrderNumber) {
        throw new Error("Сервер не вернул номер заказа");
      }

      const publicOrderNumber = data.advantshopOrderNumber ?? data.id!;

      const order: Order = {
        id: publicOrderNumber,
        createdAt: new Date().toISOString(),
        customer,
        items: [...items],
        subtotal: total,
        deliveryFee: data.deliveryFee ?? deliveryFee,
        total: data.total ?? orderTotal,
        advantshopOrderId: data.advantshopOrderId,
        advantshopOrderNumber: publicOrderNumber,
        paymentId: data.paymentId,
        paymentStatus: data.paymentUrl ? "pending" : undefined,
      };

      if (data.paymentUrl && data.paymentId) {
        trackOrderSubmit(order);
        sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(order));
        sessionStorage.setItem(PENDING_PAYMENT_STORAGE_KEY, data.paymentId);
        window.location.href = data.paymentUrl;
        return;
      }

      saveOrder(order);
      trackOrderSubmit(order);
      trackPurchase(order);
      clearCart();
      setCompletedOrder(order);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось оформить заказ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10 text-center text-brand-muted">
          Загрузка…
        </div>
      </section>
    );
  }

  if (completedOrder) {
    return (
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-surface text-brand-terracotta text-2xl mb-6">
            ✓
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark mb-3">
            Заказ оформлен
          </h1>
          <p className="text-brand-muted mb-2">
            Номер заказа{" "}
            <span className="font-medium text-brand-olive-dark">
              {completedOrder.advantshopOrderNumber ?? completedOrder.id}
            </span>
          </p>
          <p className="text-brand-muted mb-8">
            Мы свяжемся с вами по телефону{" "}
            <span className="text-brand-olive-dark">
              {completedOrder.customer.phone}
            </span>{" "}
            для подтверждения и уточнения доставки.
          </p>

          <div className="bg-brand-surface rounded-xl p-6 text-left shadow-sm mb-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Способ получения</span>
              <span className="text-brand-olive-dark">СДЭК</span>
            </div>
            <p className="text-sm text-brand-muted">
              {completedOrder.customer.city}, {completedOrder.customer.address}
              {completedOrder.customer.apartment &&
                `, кв. ${completedOrder.customer.apartment}`}
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Оплата</span>
              <span className="text-brand-olive-dark">Оплата по счету</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-brand-sand font-heading text-lg text-brand-olive-dark">
              <span>К оплате</span>
              <span>{formatPrice(completedOrder.total)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
            >
              В каталог
            </Link>
            <Link
              href="/"
              className="inline-flex justify-center px-8 py-3.5 border border-brand-olive/30 text-brand-olive-dark hover:border-brand-olive text-sm tracking-widest uppercase transition-colors"
            >
              На главную
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="mb-8">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            Оформление
          </p>
          <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark">
            Данные заказа
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-brand-surface rounded-xl p-5 md:p-6 shadow-sm space-y-5">
                <h2 className="font-heading text-xl text-brand-olive-dark">
                  Контакты
                </h2>

                <div>
                  <label
                    htmlFor="checkout-name"
                    className="block text-xs tracking-[0.15em] uppercase text-brand-muted mb-2"
                  >
                    Имя
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Как к вам обращаться"
                    className="w-full px-4 py-3 rounded-lg border border-brand-olive/20 bg-white text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-olive"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-xs tracking-[0.15em] uppercase text-brand-muted mb-2"
                  >
                    Телефон
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full px-4 py-3 rounded-lg border border-brand-olive/20 bg-white text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-olive"
                    required
                  />
                </div>
              </section>

              <section className="bg-brand-surface rounded-xl p-5 md:p-6 shadow-sm space-y-5">
                <h2 className="font-heading text-xl text-brand-olive-dark">
                  Способ получения
                </h2>

                <div className="rounded-xl border border-brand-olive bg-brand-surface p-4">
                  <p className="font-heading text-brand-olive-dark mb-1">СДЭК</p>
                  <p className="text-sm text-brand-muted">
                    {total >= FREE_DELIVERY_THRESHOLD
                      ? "Бесплатно"
                      : `от ${formatPrice(DELIVERY_FEE)} · бесплатно от ${formatPrice(FREE_DELIVERY_THRESHOLD)}`}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="checkout-city"
                      className="block text-xs tracking-[0.15em] uppercase text-brand-muted mb-2"
                    >
                      Город
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-brand-olive/20 bg-white text-brand-text focus:outline-none focus:border-brand-olive"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="block text-xs tracking-[0.15em] uppercase text-brand-muted mb-2"
                    >
                      Адрес
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      autoComplete="street-address"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="Улица, дом"
                      className="w-full px-4 py-3 rounded-lg border border-brand-olive/20 bg-white text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-olive"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-apartment"
                      className="block text-xs tracking-[0.15em] uppercase text-brand-muted mb-2"
                    >
                      Квартира / офис
                    </label>
                    <input
                      id="checkout-apartment"
                      type="text"
                      value={form.apartment}
                      onChange={(e) => updateField("apartment", e.target.value)}
                      placeholder="Необязательно"
                      className="w-full px-4 py-3 rounded-lg border border-brand-olive/20 bg-white text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-olive"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-lg text-brand-olive-dark mb-3">
                    Способ оплаты
                  </h3>
                  <div className="rounded-xl border border-brand-olive bg-brand-surface p-4">
                    <p className="font-heading text-brand-olive-dark mb-1">
                      Оплата по счету
                    </p>
                    <p className="text-sm text-brand-muted">
                      Счёт выставим после подтверждения заказа
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="checkout-comment"
                    className="block text-xs tracking-[0.15em] uppercase text-brand-muted mb-2"
                  >
                    Комментарий к заказу
                  </label>
                  <textarea
                    id="checkout-comment"
                    rows={3}
                    value={form.comment}
                    onChange={(e) => updateField("comment", e.target.value)}
                    placeholder="Пожелания по доставке"
                    className="w-full px-4 py-3 rounded-lg border border-brand-olive/20 bg-white text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-olive resize-none"
                  />
                </div>

                <div className="rounded-xl border border-brand-olive/20 bg-white p-4">
                  <label
                    htmlFor="checkout-pd-consent"
                    className="flex cursor-pointer items-start gap-3"
                  >
                    <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center">
                      <input
                        id="checkout-pd-consent"
                        type="checkbox"
                        role="switch"
                        checked={personalDataConsent}
                        onChange={(e) => {
                          setPersonalDataConsent(e.target.checked);
                          setError(null);
                          setOutOfStockItems([]);
                        }}
                        className="peer sr-only"
                        required
                        aria-required="true"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-brand-olive/20 transition-colors peer-checked:bg-brand-olive peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-terracotta"
                      />
                      <span
                        aria-hidden
                        className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
                      />
                    </span>
                    <span className="text-sm text-brand-text leading-relaxed">
                      Информированное добровольное согласие на передачу ПД.{" "}
                      <Link
                        href="/terms"
                        className="text-brand-terracotta hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Текст согласия и публичная оферта
                      </Link>
                    </span>
                  </label>
                </div>
              </section>

              {error && (
                <div
                  className="rounded-xl border border-brand-terracotta/30 bg-brand-terracotta/5 px-4 py-4 space-y-3"
                  role="alert"
                >
                  <p className="text-sm text-brand-terracotta whitespace-pre-line">
                    {error}
                  </p>
                  {outOfStockItems.length > 0 && (
                    <ul className="text-sm text-brand-olive-dark list-disc pl-5 space-y-1">
                      {outOfStockItems.map((item) => (
                        <li key={`${item.productSlug}-${item.size ?? "none"}`}>
                          {item.name}
                          {item.size ? ` · размер ${item.size}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href="/shop"
                    className="inline-flex text-sm text-brand-terracotta hover:underline"
                  >
                    Перейти в каталог →
                  </Link>
                </div>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-28 bg-brand-surface rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="font-heading text-xl text-brand-olive-dark">
                  Ваш заказ
                </h2>

                <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="flex w-full gap-3 rounded-lg p-1 text-left transition-colors hover:bg-brand-sand/70"
                        aria-label={`Открыть карточку товара ${item.name}`}
                      >
                        <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-brand-surface">
                          <ProductImage
                            src={item.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-brand-olive-dark line-clamp-2">
                            {item.name}
                          </p>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 text-sm pt-2 border-t border-brand-sand">
                  <div className="flex justify-between text-brand-muted">
                    <span>Товары</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>СДЭК</span>
                    <span>
                      {deliveryFee === 0 ? "Бесплатно" : formatPrice(deliveryFee)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-brand-sand font-heading text-xl text-brand-olive-dark">
                  <span>К оплате</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !personalDataConsent}
                  className="w-full px-6 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo disabled:opacity-60 text-white text-sm tracking-widest uppercase transition-colors"
                >
                  {isSubmitting ? "Отправка…" : "Оформить заказ"}
                </button>

                <Link
                  href="/cart"
                  className="block text-center text-sm text-brand-terracotta hover:text-brand-terracotta transition-colors"
                >
                  Вернуться в корзину
                </Link>

                <p className="text-xs text-brand-muted leading-relaxed">
                  После оформления менеджер подтвердит заказ и выставит счёт.
                  Данные используются только для обработки заказа.
                </p>
              </div>
            </aside>
          </div>
        </form>
      </div>
      <ProductQuickViewModal
        cartItem={previewItem}
        open={previewItem !== null}
        onClose={() => setPreviewItem(null)}
      />
    </section>
  );
}
