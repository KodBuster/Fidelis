import { FavoritesView } from "@/components/favorites/FavoritesView";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Избранное — ФИДЕЛИС",
  description: "Сохранённые украшения в интернет-магазине ФИДЕЛИС",
  path: "/favorites",
  noIndex: true,
});

export default function FavoritesPage() {
  return (
    <>
      <Header />
      <main>
        <FavoritesView />
      </main>
      <Footer />
    </>
  );
}
