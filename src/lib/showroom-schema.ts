import {
  SHOWROOM,
  SHOWROOM_GEO,
  SHOWROOM_MAP_LINK,
  SITE_EMAIL,
  SITE_PHONE_TEL,
} from "@/lib/contacts";
import { getOrganizationId, getShowroomId } from "@/lib/schema-ids";
import { absoluteImageUrl } from "@/lib/seo-images";
import { getSiteUrl } from "@/lib/site-url";

export function buildShowroomJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const phone = SITE_PHONE_TEL.replace("tel:", "");

  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "@id": getShowroomId(),
    name: SHOWROOM.title,
    description:
      "Шоурум ювелирного бренда ФИДЕЛИС в Москве. Примерка украшений из серебра 925.",
    url: `${siteUrl}/showroom`,
    image: absoluteImageUrl("/images/show_room_2.jpg"),
    telephone: phone,
    email: SITE_EMAIL,
    priceRange: "₽₽",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ул. Гиляровского 40, офис 13",
      addressLocality: "Москва",
      postalCode: "129110",
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SHOWROOM_GEO.latitude,
      longitude: SHOWROOM_GEO.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    hasMap: SHOWROOM_MAP_LINK,
    parentOrganization: {
      "@id": getOrganizationId(),
    },
  };
}
