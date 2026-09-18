import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PartnershipPage } from "@/components/partnership/PartnershipPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Сотрудничество — ФИДЕЛИС",
  description:
    "Сотрудничество с брендом ФИДЕЛИС: конкурентные цены, гарантия качества, обновляемый ассортимент и маркетинговая поддержка продаж.",
  path: "/cooperation",
});

export default function CooperationRoute() {
  return (
    <>
      <Header />
      <main>
        <PartnershipPage />
      </main>
      <Footer />
    </>
  );
}
