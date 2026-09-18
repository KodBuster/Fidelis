import { buildProductMetaDescription } from "@/lib/product-metadata";
import { getProductCaratWeight } from "@/lib/product-weight";
import { CATEGORIES, type ProductDetails } from "@/lib/products";
import { absoluteImageUrl } from "@/lib/seo-images";
import { getSiteUrl } from "@/lib/site-url";
import {
  formatInsertMassLabel,
  INSERT_WEIGHT_LABEL,
  SYNTHETIC_DIAMOND_CAP,
  WITH_SYNTHETIC_DIAMOND,
} from "@/lib/synthetic-diamond-labels";

function buildProductSchemaName(product: ProductDetails): string {
  const mass = formatInsertMassLabel(getProductCaratWeight(product));
  const metal = product.metal?.trim() || "Серебро 925";

  return `${product.name} ${WITH_SYNTHETIC_DIAMOND}, ${mass} — ${metal}`;
}

function buildProductAdditionalProperties(
  product: ProductDetails,
): Record<string, unknown>[] {
  const mass = formatInsertMassLabel(getProductCaratWeight(product));
  const properties: Record<string, unknown>[] = [
    {
      "@type": "PropertyValue",
      name: "Тип вставки",
      value: SYNTHETIC_DIAMOND_CAP,
    },
    {
      "@type": "PropertyValue",
      name: INSERT_WEIGHT_LABEL,
      value: mass,
    },
    {
      "@type": "PropertyValue",
      name: "Огранка",
      value: product.cut,
    },
  ];

  if (product.weightGrams) {
    properties.push({
      "@type": "PropertyValue",
      name: "Вес изделия",
      value: `${product.weightGrams} г`,
    });
  }

  return properties;
}

export function buildProductJsonLd(
  product: ProductDetails,
  slug: string
): Record<string, unknown>[] {
  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/products/${slug}`;
  const categoryTitle = CATEGORIES[product.category].title;
  const categoryUrl = `${siteUrl}/shop/${product.category}`;
  const images = product.images.map(absoluteImageUrl);
  const schemaName = buildProductSchemaName(product);
  const material = product.metal?.trim() || "Серебро 925";

  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Главная",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Каталог",
          item: `${siteUrl}/shop`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: categoryTitle,
          item: categoryUrl,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: schemaName,
          item: productUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: schemaName,
      description: buildProductMetaDescription(product),
      image: images,
      sku: product.artNo ?? product.id,
      category: categoryTitle,
      material,
      additionalProperty: buildProductAdditionalProperties(product),
      brand: {
        "@type": "Brand",
        name: "ФИДЕЛИС",
      },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "RUB",
        price: product.price,
        availability:
          product.inStock === false
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    },
  ];
}
