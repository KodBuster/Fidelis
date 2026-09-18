import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShowroomPage } from "@/components/showroom/ShowroomPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { buildShowroomJsonLd } from "@/lib/showroom-schema";

export const metadata = buildPageMetadata({
  title: "Шоурум — ФИДЕЛИС",
  description:
    "Шоурум ФИДЕЛИС в Москве: 129110, ул. Гиляровского 40, офис 13. Примерьте украшения из серебра 925.",
  path: "/showroom",
  ogImage: "/images/show_room_2.jpg",
});

export default function ShowroomRoute() {
  return (
    <>
      <JsonLd data={buildShowroomJsonLd()} />
      <Header />
      <main>
        <ShowroomPage />
      </main>
      <Footer />
    </>
  );
}
