const ITEMS = [
  {
    title: "Серебро 925",
    text: "Гипоаллергенный металл с родиевым покрытием",
  },
  {
    title: "Выразительные вставки",
    text: "Камни разных типов и огранок — под ваш вкус и повод",
  },
  {
    title: "Доставка СДЭК",
    text: "Отправляем заказы по России до пункта выдачи или курьером",
  },
];

export function TrustBar() {
  return (
    <section className="bg-[#7f8e47]">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {ITEMS.map((item) => (
            <div key={item.title} className="text-center lg:text-left text-white">
              <h3 className="font-heading text-base md:text-lg mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs md:text-sm leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
