import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CheckoutSuccess } from "@/components/checkout/CheckoutSuccess";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Оплата заказа — ФИДЕЛИС",
  description: "Подтверждение оплаты заказа в интернет-магазине ФИДЕЛИС",
  path: "/checkout/success",
  noIndex: true,
});

function CheckoutSuccessFallback() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-10 text-center text-brand-muted">
        Загрузка…
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<CheckoutSuccessFallback />}>
          <CheckoutSuccess />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
