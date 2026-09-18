import type { CartItem } from "@/lib/cart";
import type { Order } from "@/lib/checkout";
import type { CategorySlug } from "@/lib/products";

/** Основной счётчик Метрики (0 / пустой список — счётчики Fidelis ещё не подключены) */
export const METRIKA_IDS: readonly number[] = [];
export const METRIKA_ID = METRIKA_IDS[0] ?? 0;
export const METRIKA_READY_EVENT = "fidelis:metrika-ready";

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

/**
 * Цели «посетил страницу» для Директа / Метрики.
 * В кабинете Метрики создайте JS-цели с этими идентификаторами:
 * page_rings, page_earrings, page_pendants, page_bracelets, page_gifts,
 * page_about, page_blog, page_showroom, page_shipping, page_guide.
 */
export function trackPageVisit(goal: string) {
  reachGoal(goal);
}
