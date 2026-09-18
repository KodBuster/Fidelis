import { AboutPage } from "@/components/about/AboutPage";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { buildOrganizationJsonLd } from "@/lib/organization-schema";

export const metadata = buildPageMetadata({
  title: "О бренде — ФИДЕЛИС",
  description:
    "Бренд ФИДЕЛИС — украшения из серебра с ограненными синтетическими алмазами. Качество без компромиссов.",
  path: "/about",
});

export default function AboutRoute() {
  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />
      <Header />      <main>
        <AboutPage />
      </main>
      <Footer />
    </>
  );
}
