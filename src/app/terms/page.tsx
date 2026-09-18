import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TermsPage } from "@/components/legal/TermsPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Публичная оферта — ФИДЕЛИС",
  description:
    "Условия покупки украшений ФИДЕЛИС: оформление заказа, оплата, доставка, гарантия и возврат.",
  path: "/terms",
});

export default function TermsRoute() {
  return (
    <>
      <Header />
      <main>
        <TermsPage />
      </main>
      <Footer />
    </>
  );
}
