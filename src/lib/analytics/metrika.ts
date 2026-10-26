import type { CartItem } from "@/lib/cart";
import type { Order } from "@/lib/checkout";
import type { CategorySlug } from "@/lib/products";

/** Основной счётчик Метрики Fidelis */
export const METRIKA_IDS: readonly number[] = [109167160];
export const METRIKA_ID = METRIKA_IDS[0] ?? 0;
export const METRIKA_READY_EVENT = "fidelis:metrika-ready";

/**
 * Каталог JS-целей для кабинета Метрики (тип «JavaScript-событие»).
 * Идентификатор = conditions.url / reachGoal target.
 */
export type MetrikaGoalDef = {
  id: string;
  name: string;
  group: "funnel" | "contact" | "catalog" | "interest";
  /** Приоритет для оптимизации в Яндекс Директе */
  direct: "primary" | "secondary" | "optional";
  when: string;
};

export const METRIKA_GOALS: readonly MetrikaGoalDef[] = [
  {
    id: "purchase",
    name: "Покупка / успешный заказ",
    group: "funnel",
    direct: "primary",
    when: "Страница успеха оплаты или подтверждения заказа",
  },
  {
    id: "order_submit",
    name: "Отправка заказа",
    group: "funnel",
    direct: "primary",
    when: "Успешная отправка формы оформления заказа",
  },
  {
    id: "begin_checkout",
    name: "Начало оформления",
    group: "funnel",
    direct: "secondary",
    when: "Открытие страницы /checkout с товарами в корзине",
  },
  {
    id: "add_to_cart",
    name: "Добавление в корзину",
    group: "funnel",
    direct: "secondary",
    when: "Клик «В корзину» на карточке / в галерее товара",
  },
  {
    id: "view_item",
    name: "Просмотр товара",
    group: "funnel",
    direct: "optional",
    when: "Открытие страницы товара",
  },
  {
    id: "page_cart",
    name: "Корзина",
    group: "funnel",
    direct: "secondary",
    when: "Посещение /cart",
  },
  {
    id: "page_checkout",
    name: "Оформление заказа",
    group: "funnel",
    direct: "secondary",
    when: "Посещение /checkout",
  },
  {
    id: "page_checkout_success",
    name: "Страница успеха заказа",
    group: "funnel",
    direct: "optional",
    when: "Посещение /checkout/success",
  },
  {
    id: "contact_lead",
    name: "Контакт (звонок или мессенджер)",
    group: "contact",
    direct: "primary",
    when: "Клик по телефону, MAX или Telegram (составная лид-цель)",
  },
  {
    id: "contact_phone",
    name: "Клик по телефону",
    group: "contact",
    direct: "optional",
    when: "Клик tel: в FAB или на странице",
  },
  {
    id: "contact_max",
    name: "Переход в MAX",
    group: "contact",
    direct: "optional",
    when: "Клик по кнопке MAX",
  },
  {
    id: "contact_telegram",
    name: "Переход в Telegram",
    group: "contact",
    direct: "optional",
    when: "Клик по кнопке Telegram",
  },
  {
    id: "showroom_map_click",
    name: "Клик по карте шоурума",
    group: "contact",
    direct: "optional",
    when: "Клик по ссылке/карте шоурума",
  },
  {
    id: "site_search",
    name: "Поиск по сайту",
    group: "interest",
    direct: "optional",
    when: "Отправка поискового запроса (форма поиска)",
  },
  {
    id: "page_shop",
    name: "Каталог",
    group: "catalog",
    direct: "optional",
    when: "Посещение /shop",
  },
  {
    id: "page_rings",
    name: "Категория: Кольца",
    group: "catalog",
    direct: "optional",
    when: "Посещение /shop/rings",
  },
  {
    id: "page_earrings",
    name: "Категория: Серьги",
    group: "catalog",
    direct: "optional",
    when: "Посещение /shop/earrings",
  },
  {
    id: "page_bracelets",
    name: "Категория: Браслеты",
    group: "catalog",
    direct: "optional",
    when: "Посещение /shop/bracelets",
  },
  {
    id: "page_ankle_bracelets",
    name: "Категория: Анклеты",
    group: "catalog",
    direct: "optional",
    when: "Посещение /shop/ankle-bracelets",
  },
  {
    id: "page_necklaces",
    name: "Категория: Колье",
    group: "catalog",
    direct: "optional",
    when: "Посещение /shop/necklaces",
  },
  {
    id: "page_pendants",
    name: "Категория: Подвески",
    group: "catalog",
    direct: "optional",
    when: "Посещение /shop/pendants",
  },
  {
    id: "page_chain_pendants",
    name: "Категория: Цепи с подвесками",
    group: "catalog",
    direct: "optional",
    when: "Посещение /shop/chain-pendants",
  },
  {
    id: "page_brooches",
    name: "Категория: Броши",
    group: "catalog",
    direct: "optional",
    when: "Посещение /shop/brooches",
  },
  {
    id: "page_watches",
    name: "Категория: Часы",
    group: "catalog",
    direct: "optional",
    when: "Посещение /shop/watches",
  },
  {
    id: "page_shipping",
    name: "Доставка и оплата",
    group: "interest",
    direct: "optional",
    when: "Посещение /shipping",
  },
  {
    id: "page_guide",
    name: "Гид / справка",
    group: "interest",
    direct: "optional",
    when: "Посещение /guide или разделов гида",
  },
] as const;

const BRAND = "Fidelis";
const TRACKED_PURCHASES_KEY = "fidelis-metrika-purchases";
const TRACKED_ORDERS_KEY = "fidelis-metrika-orders";
const METRIKA_WAIT_MS = 15_000;

type EcommerceProduct = {
  id: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
  quantity?: number;
  variant?: string;
};

type YandexMetrikaFn = (
  counterId: number,
  method: string,
  ...args: unknown[]
) => void;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    ym?: YandexMetrikaFn;
  }
}

const pendingCalls: Array<() => void> = [];
let metrikaReadyWatcherStarted = false;

function isMetrikaAvailable() {
  return typeof window !== "undefined" && typeof window.ym === "function";
}

function flushPendingCalls() {
  if (!isMetrikaAvailable()) return;

  while (pendingCalls.length) {
    pendingCalls.shift()?.();
  }
}

function startMetrikaReadyWatcher() {
  if (typeof window === "undefined" || metrikaReadyWatcherStarted) return;
  metrikaReadyWatcherStarted = true;

  const tryFlush = () => {
    flushPendingCalls();
    return pendingCalls.length === 0;
  };

  if (isMetrikaAvailable()) {
    tryFlush();
  }

  window.addEventListener(METRIKA_READY_EVENT, tryFlush);

  const startedAt = Date.now();
  const intervalId = window.setInterval(() => {
    if (isMetrikaAvailable()) {
      tryFlush();
    }

    if (pendingCalls.length === 0 || Date.now() - startedAt >= METRIKA_WAIT_MS) {
      window.clearInterval(intervalId);
    }
  }, 100);
}

/** Called from YandexMetrika after counter init. */
export function notifyMetrikaReady() {
  if (typeof window === "undefined") return;
  flushPendingCalls();
  window.dispatchEvent(new Event(METRIKA_READY_EVENT));
}

function runWhenMetrikaReady(callback: () => void) {
  if (typeof window === "undefined") return;

  if (isMetrikaAvailable()) {
    callback();
    return;
  }

  pendingCalls.push(callback);
  startMetrikaReadyWatcher();
}

function callMetrika(method: string, ...args: unknown[]) {
  runWhenMetrikaReady(() => {
    for (const counterId of METRIKA_IDS) {
      window.ym?.(counterId, method, ...args);
    }
  });
}

function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function reachGoal(goal: string, params?: Record<string, unknown>) {
  if (params) {
    callMetrika("reachGoal", goal, params);
    return;
  }

  callMetrika("reachGoal", goal);
}

function toMetrikaProduct(product: EcommerceProduct) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    brand: product.brand ?? BRAND,
    category: product.category,
    quantity: product.quantity ?? 1,
    variant: product.variant,
  };
}

function pushEcommerce(
  action: "detail" | "add" | "checkout" | "purchase",
  products: EcommerceProduct[],
  actionField?: Record<string, unknown>
) {
  runWhenMetrikaReady(() => {
    const ecommerce: Record<string, unknown> = { currencyCode: "RUB" };

    if (action === "purchase") {
      ecommerce.purchase = {
        actionField: actionField ?? {},
        products: products.map(toMetrikaProduct),
      };
    } else if (action === "checkout") {
      ecommerce.checkout = {
        actionField: actionField ?? { step: 1 },
        products: products.map(toMetrikaProduct),
      };
    } else {
      ecommerce[action] = { products: products.map(toMetrikaProduct) };
    }

    pushDataLayer({ ecommerce: null });
    pushDataLayer({ ecommerce });
  });
}

function mapCartItemToEcommerce(
  item: CartItem,
  category?: CategorySlug
): EcommerceProduct {
  const variant = [item.stoneLabel, item.size != null ? `размер ${item.size}` : null]
    .filter(Boolean)
    .join(", ");

  return {
    id: item.artNo ?? item.productSlug,
    name: item.name,
    price: item.price,
    category,
    quantity: item.quantity,
    variant: variant || undefined,
  };
}

function mapOrderItems(order: Order): EcommerceProduct[] {
  return order.items.map((item) => mapCartItemToEcommerce(item));
}

function readTrackedIds(storageKey: string): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = sessionStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function markTrackedId(storageKey: string, id: string) {
  if (typeof window === "undefined") return;

  const tracked = readTrackedIds(storageKey);
  tracked.add(id);
  sessionStorage.setItem(storageKey, JSON.stringify([...tracked]));
}

function trackOnce(
  storageKey: string,
  id: string,
  callback: () => void
) {
  const tracked = readTrackedIds(storageKey);
  if (tracked.has(id)) return;

  callback();
  markTrackedId(storageKey, id);
}

export function trackViewItem(input: {
  id: string;
  name: string;
  price: number;
  category: CategorySlug;
  variant?: string;
}) {
  pushEcommerce("detail", [
    {
      id: input.id,
      name: input.name,
      price: input.price,
      category: input.category,
      variant: input.variant,
    },
  ]);
  reachGoal("view_item", { product_id: input.id });
}

export function trackAddToCart(input: {
  id: string;
  name: string;
  price: number;
  category: CategorySlug;
  quantity?: number;
  variant?: string;
}) {
  pushEcommerce("add", [
    {
      id: input.id,
      name: input.name,
      price: input.price,
      category: input.category,
      quantity: input.quantity ?? 1,
      variant: input.variant,
    },
  ]);
  reachGoal("add_to_cart", { product_id: input.id });
}

export function trackBeginCheckout(items: CartItem[]) {
  if (!items.length) return;

  pushEcommerce(
    "checkout",
    items.map((item) => mapCartItemToEcommerce(item)),
    { step: 1 }
  );
  reachGoal("begin_checkout");
}

export function trackOrderSubmit(order: Order) {
  trackOnce(TRACKED_ORDERS_KEY, order.id, () => {
    reachGoal("order_submit", {
      order_id: order.advantshopOrderNumber ?? order.id,
      order_price: order.total,
      currency: "RUB",
    });
  });
}

export function trackPurchase(order: Order) {
  trackOnce(TRACKED_PURCHASES_KEY, order.id, () => {
    pushEcommerce("purchase", mapOrderItems(order), {
      id: order.advantshopOrderNumber ?? order.id,
      revenue: order.total,
    });
    reachGoal("purchase", {
      order_id: order.advantshopOrderNumber ?? order.id,
      order_price: order.total,
      currency: "RUB",
    });
    void notifyMaxPurchase(order);
  });
}

/** Уведомление админам в MAX при срабатывании purchase (best-effort). */
function notifyMaxPurchase(order: Order) {
  if (typeof window === "undefined") return;

  void fetch("/api/notify/max-purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
    keepalive: true,
  }).catch(() => {
    /* не блокируем UX при сбое мессенджера */
  });
}

export function trackContactTelegram() {
  reachContactLead("telegram");
}

export function trackContactMax() {
  reachContactLead("max");
}

export function trackContactWhatsapp() {
  reachContactLead("whatsapp");
}

export function trackContactPhone() {
  reachContactLead("phone");
}

/**
 * Составная цель для Директа: любой контакт через мессенджер или звонок.
 * В Метрике создайте JS-цель с идентификатором `contact_lead`.
 * Параллельно уходит детальная цель contact_*.
 */
function reachContactLead(channel: "phone" | "whatsapp" | "telegram" | "max") {
  reachGoal(`contact_${channel}`);
  reachGoal("contact_lead", { channel });
}

export function trackShowroomMapClick() {
  reachGoal("showroom_map_click");
}

export function trackSiteSearch(query: string) {
  const q = query.trim();
  if (!q) return;
  reachGoal("site_search", { query: q.slice(0, 100) });
}

/** Цели «посетил страницу» — идентификаторы из METRIKA_GOALS (page_*). */
export function trackPageVisit(goal: string) {
  reachGoal(goal);
}
