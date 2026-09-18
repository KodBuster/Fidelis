import type { Metadata } from "next";
import "@fontsource/inter/cyrillic-400.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/playfair-display/cyrillic-400.css";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MangoOfficeChat } from "@/components/MangoOfficeChat";
import { MessengerFab } from "@/components/MessengerFab";
import { PageVisitTracker } from "@/components/analytics/PageVisitTracker";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { getSiteUrl } from "@/lib/site-url";
import { getSiteVerification } from "@/lib/site-verification";
import { BRAND_NAME_CAPS, BRAND_TAGLINE } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${BRAND_NAME_CAPS} — ${BRAND_TAGLINE}`,
    template: "%s",
  },
  description:
    "Ювелирные украшения из серебра 925 с разными вставками. Доставка СДЭК по России.",
  verification: getSiteVerification(),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-body">
        <YandexMetrika />
        <PageVisitTracker />
        <CartProvider>
          <CompareProvider>
            <FavoritesProvider>
              {children}
              <MessengerFab />
              <MangoOfficeChat />
            </FavoritesProvider>
          </CompareProvider>
        </CartProvider>
      </body>
    </html>
  );
}
