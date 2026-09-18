import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CartView } from "@/components/cart/CartView";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Корзина — ФИДЕЛИС",
  description: "Ваша корзина покупок в интернет-магазине ФИДЕЛИС",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return (
    <>
      <Header />
      <main>
        <CartView />
      </main>
      <Footer />
    </>
  );
}
