import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Оформление заказа — ФИДЕЛИС",
  description: "Оформление заказа в интернет-магазине ФИДЕЛИС",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main>
        <CheckoutForm />
      </main>
      <Footer />
    </>
  );
}
