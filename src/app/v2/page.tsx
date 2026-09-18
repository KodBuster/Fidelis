import { Categories } from "@/components/Categories";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroVideoBanner } from "@/components/HeroVideoBanner";
import { TrustBar } from "@/components/TrustBar";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "ФИДЕЛИС — вариант с видео",
  description:
    "Украшения с ограненными синтетическими алмазами в серебре 925. Альтернативная главная страница.",
  path: "/v2",
  noIndex: true,
});

export default function HomeVariantPage() {
  return (
    <>
      <Header />
      <main>
        <HeroVideoBanner />
        <TrustBar />
        <Categories />
      </main>
      <Footer />
    </>
  );
}
