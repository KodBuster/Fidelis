import { getCategoryStats } from "@/lib/catalog-stats";

export async function PriceOverview() {
  const categories = await getCategoryStats();

  if (categories.length === 0) return null;

  const summary = categories
    .map((category) => `${category.title.toLowerCase()} ${category.priceFromLabel}`)
    .join(", ");

  return (
    <section
      className="bg-white border-y border-brand-sand py-6 md:py-8"
      aria-label="Цены на украшения"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
        <p className="text-brand-text leading-relaxed max-w-3xl text-sm md:text-base">
          Украшения из серебра 925 с ограненными синтетическими алмазами: {summary}.
          Точная цена зависит от каратности камня, огранки и модели.
        </p>
      </div>
    </section>
  );
}
