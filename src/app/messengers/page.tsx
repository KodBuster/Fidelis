import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MessengersPage } from "@/components/MessengersPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Написать нам — ФИДЕЛИС",
  description:
    "Свяжитесь с ФИДЕЛИС в MAX, Telegram или по телефону. Консультация по украшениям из серебра 925.",
  path: "/messengers",
  noIndex: true,
});

export default function MessengersRoute() {
  return (
    <>
      <Header />
      <main>
        <MessengersPage />
      </main>
      <Footer />
    </>
  );
}
