import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WarrantyPage } from "@/components/warranty/WarrantyPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import {
  WARRANTY_FAQ_ITEMS,
  buildFaqPageJsonLd,
} from "@/lib/warranty-faq";

export const metadata = buildPageMetadata({
  title: "Гарантия — ФИДЕЛИС",
  description:
    "Гарантия 2 года на украшения ФИДЕЛИС из серебра 925. Добровольная аттестация качества при необходимости.",
  path: "/warranty",
});

export default function WarrantyRoute() {
  return (
    <>
      <JsonLd data={buildFaqPageJsonLd(WARRANTY_FAQ_ITEMS)} />
      <Header />
      <main>
        <WarrantyPage />
      </main>
      <Footer />
    </>
  );
}
