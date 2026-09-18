import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HowSizeRingPage } from "@/components/size/HowSizeRingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import {
  buildHowToJsonLd,
  RING_SIZE_HOWTO_STEPS,
} from "@/lib/howto-schema";
import { SIZE_FAQ_ITEMS } from "@/lib/size-faq";
import { buildFaqPageJsonLd } from "@/lib/warranty-faq";

export const metadata = buildPageMetadata({
  title: "Как определить размер — ФИДЕЛИС",
  description:
    "Как подобрать размер кольца и браслета: примерка в шоуруме, замеры дома, таблица российских размеров и полезные советы.",
  path: "/how-size-ring",
});
export default function HowSizeRingRoute() {
  return (
    <>
      <JsonLd
        data={[
          buildFaqPageJsonLd(SIZE_FAQ_ITEMS),
          buildHowToJsonLd({
            name: "Как определить размер кольца и браслета",
            description:
              "Пошаговая инструкция: примерка в шоуруме, замеры дома и подбор размера браслета.",
            path: "/how-size-ring",
            steps: RING_SIZE_HOWTO_STEPS,
          }),
        ]}
      />
      <Header />
      <main>
        <HowSizeRingPage />
      </main>
      <Footer />
    </>
  );
}
