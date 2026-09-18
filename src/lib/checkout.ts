import type { CartItem } from "@/lib/cart";

export { SHOWROOM } from "@/lib/contacts";

export type DeliveryMethod = "delivery";

export type PaymentMethod = "invoice";

export type CheckoutFormData = {
  name: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  city: string;
  address: string;
  apartment: string;
  comment: string;
};

export type Order = {
  id: string;
  createdAt: string;
  customer: CheckoutFormData;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  advantshopOrderId?: number;
  advantshopOrderNumber?: string;
  paymentId?: string;
  paymentStatus?: "pending" | "succeeded" | "canceled";
};

export const PENDING_ORDER_STORAGE_KEY = "fidelis-pending-order";
export const PENDING_PAYMENT_STORAGE_KEY = "fidelis-pending-payment-id";

export const ORDERS_STORAGE_KEY = "fidelis-orders";
export const FREE_DELIVERY_THRESHOLD = 30_000;
export const DELIVERY_FEE = 500;

export function getDeliveryFee(
  method: DeliveryMethod,
  subtotal: number
): number {
  if (method !== "delivery") return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhoneInput(value: string): string {
  const digits = normalizePhone(value).slice(0, 11);
  if (!digits) return "";

  let normalized = digits;
  if (normalized.startsWith("8")) {
    normalized = `7${normalized.slice(1)}`;
  } else if (!normalized.startsWith("7")) {
    normalized = `7${normalized}`;
  }
  normalized = normalized.slice(0, 11);

  const rest = normalized.slice(1);
  let result = "+7";
  if (rest.length > 0) result += ` (${rest.slice(0, 3)}`;
  if (rest.length >= 4) result += `) ${rest.slice(3, 6)}`;
  if (rest.length >= 7) result += `-${rest.slice(6, 8)}`;
  if (rest.length >= 9) result += `-${rest.slice(8, 10)}`;
  return result;
}

export function applyPhoneInputChange(previous: string, next: string): string {
  const prevDigits = normalizePhone(previous);
  const nextDigits = normalizePhone(next);

  if (
    next.length < previous.length &&
    nextDigits.length === prevDigits.length &&
    prevDigits.length > 0
  ) {
    return formatPhoneInput(prevDigits.slice(0, -1));
  }

  return formatPhoneInput(next);
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return digits.length === 11 && digits.startsWith("7");
}

export function validateCheckoutForm(data: CheckoutFormData): string | null {
  const name = data.name.trim();
  if (name.length < 2) return "Укажите имя";

  if (!isValidPhone(data.phone)) return "Укажите корректный номер телефона";

  if (!data.city.trim()) return "Укажите город";
  if (!data.address.trim()) return "Укажите адрес доставки";

  return null;
}

export function validatePersonalDataConsent(accepted: boolean): string | null {
  if (!accepted) {
    return "Для оформления заказа необходимо дать информированное добровольное согласие на передачу персональных данных";
  }
  return null;
}

export function saveOrder(order: Order): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const existing = raw ? (JSON.parse(raw) as Order[]) : [];
    const orders = Array.isArray(existing) ? existing : [];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order, ...orders]));
  } catch {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order]));
  }
}
