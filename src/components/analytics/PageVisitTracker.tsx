"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageVisit } from "@/lib/analytics/metrika";

type PageGoal = {
  goal: string;
  match: (pathname: string) => boolean;
};

/** Соответствие URL → идентификатор JS-цели в Яндекс Метрике */
const PAGE_GOALS: PageGoal[] = [
  { goal: "page_rings", match: (p) => p === "/shop/rings" },
  { goal: "page_ankle_bracelets", match: (p) => p === "/shop/ankle-bracelets" },
  { goal: "page_bracelets", match: (p) => p === "/shop/bracelets" },
  { goal: "page_necklaces", match: (p) => p === "/shop/necklaces" },
  { goal: "page_pendants", match: (p) => p === "/shop/pendants" },
  { goal: "page_earrings", match: (p) => p === "/shop/earrings" },
  { goal: "page_cords", match: (p) => p === "/shop/cords" },
  { goal: "page_gifts", match: (p) => p === "/shop/gifts" },
  { goal: "page_about", match: (p) => p === "/about" },
  {
    goal: "page_blog",
    match: (p) => p === "/blog" || p.startsWith("/blog/"),
  },
  { goal: "page_showroom", match: (p) => p === "/showroom" },
  { goal: "page_shipping", match: (p) => p === "/shipping" },
  {
    goal: "page_guide",
    match: (p) => p === "/guide" || p.startsWith("/guide/"),
  },
];

export function PageVisitTracker() {
  const pathname = usePathname();
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const entry = PAGE_GOALS.find((item) => item.match(pathname));
    if (!entry) return;

    const key = `${pathname}:${entry.goal}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    trackPageVisit(entry.goal);
  }, [pathname]);

  return null;
}
