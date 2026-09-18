import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShippingPage } from "@/components/shipping/ShippingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { SHIPPING_FAQ_ITEMS } from "@/lib/shipping-faq";
import { buildFaqPageJsonLd } from "@/lib/warranty-faq";

export const metadata = buildPageMetadata({
  title: "Доставка и оплата — ФИДЕЛИС",
  description:
    "Доставка СДЭК и самовывоз из шоурума. Оплата в шоуруме или на сайте картой и по QR через ЮKassa.",
  path: "/shipping",
});
export default function ShippingRoute() {
  return (
    <>
      <JsonLd data={buildFaqPageJsonLd(SHIPPING_FAQ_ITEMS)} />
      <Header />
      <main>
        <ShippingPage />
      </main>
      <Footer />
    </>
  );
}
