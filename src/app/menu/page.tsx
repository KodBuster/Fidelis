import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileMenuPage } from "@/components/MobileMenuPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Меню — ФИДЕЛИС",
  description: "Навигация по сайту ювелирного магазина ФИДЕЛИС",
  path: "/menu",
  noIndex: true,
});

export default function MenuRoute() {
  return (
    <>
      <Header />
      <main>
        <MobileMenuPage />
      </main>
      <Footer />
    </>
  );
}
