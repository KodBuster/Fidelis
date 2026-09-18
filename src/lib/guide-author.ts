import { getOrganizationId } from "@/lib/schema-ids";
import { getSiteUrl } from "@/lib/site-url";

export function buildGuideAuthor(): Record<string, unknown> {
  return {
    "@type": "Organization",
    name: "Команда ФИДЕЛИС",
    url: getSiteUrl(),
    memberOf: {
      "@id": getOrganizationId(),
    },
  };
}
