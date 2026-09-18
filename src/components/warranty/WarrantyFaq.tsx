import { FaqSection } from "@/components/seo/FaqSection";
import { WARRANTY_FAQ_ITEMS } from "@/lib/warranty-faq";

export function WarrantyFaq() {
  return (
    <FaqSection
      title="Отвечаем на вопросы"
      subtitle="О серебре 925, качестве и гарантии"
      items={WARRANTY_FAQ_ITEMS}
    />
  );
}
