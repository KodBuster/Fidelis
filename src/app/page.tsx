import { Categories } from "@/components/Categories";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { JsonLd } from "@/components/seo/JsonLd";
import { PriceOverview } from "@/components/PriceOverview";
import { TrustBar } from "@/components/TrustBar";
import { buildHomeJsonLd } from "@/lib/home-schema";
import { BRAND_NAME_CAPS, BRAND_TAGLINE } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata = buildPageMetadata({
  title: `${BRAND_NAME_CAPS} — ${BRAND_TAGLINE}`,
  description:
    "Ювелирные украшения из серебра 925 — со вставками и без. Доставка СДЭК по России.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHomeJsonLd()} />
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <PriceOverview />
        <Categories />
      </main>
      <Footer />
    </>
  );
}
