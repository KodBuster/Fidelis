import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export const metadata: Metadata = { title: "Личный кабинет — Фиделис", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <><Header /><main className="ym-hide-content mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6 md:py-16">{children}</main><Footer /></>;
}
