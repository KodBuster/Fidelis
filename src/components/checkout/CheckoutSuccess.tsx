"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { trackPurchase } from "@/lib/analytics/metrika";
import {
  PENDING_ORDER_STORAGE_KEY,
  PENDING_PAYMENT_STORAGE_KEY,
  saveOrder,
  type Order,
} from "@/lib/checkout";
import { formatPrice } from "@/lib/products";

type PageStatus = "loading" | "succeeded" | "pending" | "canceled" | "error";

export function CheckoutSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      router.replace("/checkout");
      return;
    }

    const rawOrder = sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY);
    const paymentId = sessionStorage.getItem(PENDING_PAYMENT_STORAGE_KEY);

    if (!rawOrder) {
      setStatus("error");
      setError("Не найдены данные заказа. Если заказ уже оформлен, свяжитесь с нами.");
      return;
    }

    let parsedOrder: Order;
    try {
      parsedOrder = JSON.parse(rawOrder) as Order;
    } catch {
      setStatus("error");
      setError("Не удалось восстановить заказ.");
      return;
    }

    if (parsedOrder.id !== orderId) {
      setStatus("error");
      setError("Номер заказа не совпадает с сохранёнными данными.");
      return;
    }

    setOrder(parsedOrder);

    // Invoice (and any order without a pending online payment): complete immediately.
    if (!paymentId || parsedOrder.customer.paymentMethod === "invoice") {
      const completedOrder: Order = {
        ...parsedOrder,
        paymentStatus: undefined,
      };
      saveOrder(completedOrder);
      clearCart();
      sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
      sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
      setOrder(completedOrder);
      setStatus("succeeded");
      return;
    }

    let cancelled = false;
    let intervalId: number | undefined;

    const verifyPayment = async (): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/payments/yookassa/status?paymentId=${encodeURIComponent(paymentId)}`,
        );
        const data = (await response.json()) as {
          paid?: boolean;
          status?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Не удалось проверить оплату");
        }

        if (cancelled) return true;

        if (data.paid || data.status === "succeeded") {
          const completedOrder: Order = {
            ...parsedOrder,
            paymentId,
            paymentStatus: "succeeded",
          };
          saveOrder(completedOrder);
          clearCart();
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
          sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
          setOrder(completedOrder);
          setStatus("succeeded");
          return true;
        }

        if (data.status === "canceled") {
          setStatus("canceled");
          return true;
        }

        setStatus("pending");
        return false;
      } catch (verifyError) {
        if (cancelled) return true;
        setStatus("error");
        setError(
          verifyError instanceof Error
            ? verifyError.message
            : "Не удалось проверить оплату",
        );
        return true;
      }
    };

    void verifyPayment().then((finished) => {
      if (finished || cancelled) return;

      intervalId = window.setInterval(() => {
        void verifyPayment().then((done) => {
          if (done && intervalId) {
            window.clearInterval(intervalId);
          }
        });
      }, 3000);
    });

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [clearCart, router, searchParams]);

  useEffect(() => {
    if (status !== "succeeded" || !order || purchaseTrackedRef.current) return;
    purchaseTrackedRef.current = true;
    trackPurchase(order);
  }, [status, order]);

  if (status === "loading" || status === "pending") {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-10 text-center">
          <h1 className="font-heading text-3xl text-brand-olive-dark mb-3">
            Проверяем оплату…
          </h1>
          <p className="text-brand-muted">
            Подождите несколько секунд. Страница обновится автоматически.
          </p>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-10 text-center">
          <h1 className="font-heading text-3xl text-brand-olive-dark mb-3">
            Не удалось подтвердить заказ
          </h1>
          <p className="text-brand-muted mb-8">{error}</p>
          <Link
            href="/checkout"
            className="inline-flex justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
          >
            Вернуться к оформлению
          </Link>
        </div>
      </section>
    );
  }

  if (status === "canceled") {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-10 text-center">
          <h1 className="font-heading text-3xl text-brand-olive-dark mb-3">
            Оплата не завершена
          </h1>
          <p className="text-brand-muted mb-8">
            Платёж был отменён. Заказ можно оформить заново.
          </p>
          <Link
            href="/checkout"
            className="inline-flex justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
          >
            Попробовать снова
          </Link>
        </div>
      </section>
    );
  }

  if (!order) return null;

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
            {order.advantshopOrderNumber ?? order.id}
          </span>
        </p>
        <p className="text-brand-muted mb-8">
          Мы свяжемся с вами по телефону{" "}
          <span className="text-brand-olive-dark">{order.customer.phone}</span>{" "}
          для подтверждения и уточнения доставки.
        </p>

        <div className="bg-brand-surface rounded-xl p-6 text-left shadow-sm mb-8 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Оплата</span>
            <span className="text-brand-olive-dark">Оплата по счету</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Способ получения</span>
            <span className="text-brand-olive-dark">СДЭК</span>
          </div>
          <p className="text-sm text-brand-muted">
            {order.customer.city}, {order.customer.address}
            {order.customer.apartment && `, кв. ${order.customer.apartment}`}
          </p>
          <div className="flex justify-between pt-3 border-t border-brand-sand font-heading text-lg text-brand-olive-dark">
            <span>К оплате</span>
            <span>{formatPrice(order.total)}</span>
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
