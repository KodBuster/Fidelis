import {
  MESSENGERS,
  SHOWROOM_MAP_LINK,
  SITE_EMAIL,
  SITE_PHONE_TEL,
} from "@/lib/contacts";
import { getOrganizationId, getShowroomId } from "@/lib/schema-ids";
import { absoluteImageUrl } from "@/lib/seo-images";
import { getSiteUrl } from "@/lib/site-url";

export function buildOrganizationSameAs(): string[] {
  const siteUrl = getSiteUrl();

  return [
    ...MESSENGERS.map((messenger) => messenger.href),
    SHOWROOM_MAP_LINK,
    siteUrl,
  ];
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": getOrganizationId(),
    name: "ФИДЕЛИС",
    url: siteUrl,
    logo: absoluteImageUrl("/images/logo_20260527190756.png"),
    description:
      "Ювелирный бренд ФИДЕЛИС — украшения из серебра 925 с ограненными синтетическими алмазами.",
    telephone: SITE_PHONE_TEL.replace("tel:", ""),
    email: SITE_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "ул. Гиляровского 40, офис 13",
      addressLocality: "Москва",
      postalCode: "129110",
      addressCountry: "RU",
    },
    sameAs: buildOrganizationSameAs(),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_PHONE_TEL.replace("tel:", ""),
      email: SITE_EMAIL,
      contactType: "customer service",
      areaServed: "RU",
      availableLanguage: "Russian",
    },
    location: {
      "@id": getShowroomId(),
    },
  };
}
