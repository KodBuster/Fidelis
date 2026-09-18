import type { Metadata } from "next";
import { absoluteImageUrl, DEFAULT_OG_IMAGE } from "@/lib/seo-images";
import { getSiteUrl } from "@/lib/site-url";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  robotsFollow?: boolean;
  ogImage?: string;
  ogType?: "website" | "article";
};

export function buildPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  robotsFollow = false,
  ogImage,
  ogType = "website",
}: PageMetadataOptions): Metadata {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonical = `${getSiteUrl()}${normalizedPath === "/" ? "" : normalizedPath}`;
  const imageUrl = absoluteImageUrl(ogImage ?? DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "ФИДЕЛИС",
      locale: "ru_RU",
      type: ogType,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: robotsFollow,
      },
    }),
  };
}
