import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PrivacyPage } from "@/components/legal/PrivacyPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Политика конфиденциальности — ФИДЕЛИС",
  description:
    "Политика обработки персональных данных интернет-магазина ФИДЕЛИС: какие данные собираем, как используем и как защищаем.",
  path: "/privacy",
});

export default function PrivacyRoute() {
  return (
    <>
      <Header />
      <main>
        <PrivacyPage />
      </main>
      <Footer />
    </>
  );
}
