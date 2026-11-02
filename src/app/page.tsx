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
import { getCurrentAccount } from "@/lib/auth/session";
import { RegistrationBanner } from "@/components/account/RegistrationBanner";
import { Suspense } from "react";

function CategoriesLoading() {
  return <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-10" aria-busy="true" aria-label="Загрузка категорий">
    <h2 className="mb-8 font-heading text-3xl text-brand-olive-dark">Наши категории</h2>
    <p role="status" className="mb-5 text-sm text-brand-muted">Загружаем категории…</p>
    <div aria-hidden="true" className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">{Array.from({ length: 9 }, (_, index) => <div key={index} className="aspect-[7/4] rounded-xl bg-brand-surface motion-safe:animate-pulse md:aspect-[8/5]" />)}</div>
  </section>;
}

export const revalidate = 300;

export const metadata = buildPageMetadata({
  title: `${BRAND_NAME_CAPS} — ${BRAND_TAGLINE}`,
  description:
    "Ювелирные украшения из серебра 925 — со вставками и без. Доставка СДЭК по России.",
  path: "/",
});

export default async function HomePage() {
  const account = await getCurrentAccount();
  const access = Boolean(account?.access);
  return (
    <>
      <JsonLd data={buildHomeJsonLd()} />
      <Header />
      <main>
        {access ? <Hero /> : <RegistrationBanner signedIn={Boolean(account)} />}
        <TrustBar />
        {access && <Suspense fallback={null}><PriceOverview /></Suspense>}
        <Suspense fallback={<CategoriesLoading />}><Categories restricted={!access} /></Suspense>
      </main>
      <Footer />
    </>
  );
}
