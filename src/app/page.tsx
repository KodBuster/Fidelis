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
        {access && <PriceOverview />}
        <Categories restricted={!access} />
      </main>
      <Footer />
    </>
  );
}
