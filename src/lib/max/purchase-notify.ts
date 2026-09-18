import type { Order } from "@/lib/checkout";
import { formatPrice } from "@/lib/products";

function escapePlain(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

function formatTimestamp(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  }
  return date.toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function paymentLabel(_order: Order): string {
  return "📄 Оплата по счету";
}

function deliveryLabel(_order: Order): string {
  return "🚚 СДЭК";
}

function formatOrderItems(order: Order): string {
  return order.items
    .map((item, index) => {
      const parts = [
        item.stoneLabel ? item.stoneLabel : null,
        item.size != null ? `размер ${item.size}` : null,
      ].filter(Boolean);
      const meta = parts.length ? ` (${parts.join(", ")})` : "";
      const lineTotal = formatPrice(item.price * item.quantity);
      const art = item.artNo ? `\n   арт. ${item.artNo}` : "";
      return `${index + 1}. ${item.name}${meta} ×${item.quantity} — ${lineTotal}${art}`;
    })
    .join("\n");
}

/** Текст уведомления в MAX по образцу «Я-помогаю» (эмодзи + блоки). */
export function formatPurchaseMaxMessage(order: Order): string {
  const c = order.customer;
  const orderNo = order.advantshopOrderNumber ?? order.id;
  const lines: string[] = [
    "💎 Новый заказ на сайте «ФИДЕЛИС»",
    "",
    `🧾 Номер: ${orderNo}`,
    `💰 Сумма: ${formatPrice(order.total)}`,
    paymentLabel(order),
    deliveryLabel(order),
    "",
    `👤 Имя: ${escapePlain(c.name) || "—"}`,
    `📞 Телефон: ${escapePlain(c.phone) || "—"}`,
    `🏙 Город: ${escapePlain(c.city) || "—"}`,
    `📍 Адрес: ${escapePlain(c.address) || "—"}`,
  ];

  if (c.apartment?.trim()) {
    lines.push(`🏠 Кв./офис: ${escapePlain(c.apartment)}`);
  }

  if (c.comment?.trim()) {
    lines.push("", "📝 Комментарий:", escapePlain(c.comment));
  }

  lines.push("", "🛍 Состав заказа:", formatOrderItems(order));

  if (order.deliveryFee > 0) {
    lines.push(`📦 Доставка: ${formatPrice(order.deliveryFee)}`);
  }
  lines.push(`💵 Итого: ${formatPrice(order.total)}`);

  lines.push("", `🕐 ${formatTimestamp(order.createdAt)}`);

  return lines.join("\n");
}
