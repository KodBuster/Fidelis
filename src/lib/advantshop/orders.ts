import type { CartItem } from "@/lib/cart";
import type { CheckoutFormData } from "@/lib/checkout";
import { normalizePhone } from "@/lib/checkout";
import { getProductBySlug, getProductDetails } from "@/lib/products-service";
import { advantshopFetch } from "./client";
import { isAdvantShopConfigured } from "./config";

type AdvantShopOrderItem = {
  ArtNo: string;
  Name: string;
  Price: number;
  Amount: number;
};

type AdvantShopOrderPayload = {
  OrderCustomer: {
    FirstName: string;
    LastName?: string;
    Phone: string;
    City?: string;
    Street?: string;
    Apartment?: string;
    Country?: string;
  };
  /** Если не передан — AdvantShop назначит сам. */
  Number?: string;
  OrderSource: string;
  Currency: string;
  CustomerComment?: string;
  ShippingName: string;
  ShippingCost: number;
  CheckOrderItemExist: boolean;
  CheckOrderItemAvailable: boolean;
  OrderItems: AdvantShopOrderItem[];
};

type AdvantShopOrderAddResponse = {
  result?: boolean;
  errors?: string | string[];
  obj?: {
    Id?: number;
    Number?: string;
  };
};

export type SubmitStorefrontOrderInput = {
  /** Порядковый номер для AdvantShop (1, 2, 3…). */
  orderNumber: string;
  customer: CheckoutFormData;
  items: CartItem[];
  deliveryFee: number;
};

export type SubmitStorefrontOrderResult = {
  advantshopOrderId?: number;
  /** Итоговый номер из AdvantShop (приоритет для витрины). */
  advantshopOrderNumber: string;
};

function formatAdvantShopErrors(errors: string | string[] | undefined): string {
  if (Array.isArray(errors)) return errors.join(", ");
  return errors ?? "Не удалось создать заказ в AdvantShop";
}

function splitCustomerName(fullName: string): { firstName: string; lastName?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "Покупатель" };
  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
  };
}

function buildItemComment(item: CartItem): string {
  const parts = [item.stoneLabel];
  if (item.size) parts.push(`размер ${item.size}`);
  return parts.join(", ");
}

function buildCustomerComment(items: CartItem[], comment: string): string | undefined {
  const itemLines = items.map(
    (item) => `${item.name} (${buildItemComment(item)}) × ${item.quantity}`
  );
  const lines = [...itemLines];
  if (comment.trim()) lines.push(comment.trim());
  return lines.length ? lines.join("\n") : undefined;
}

async function resolveArtNo(item: CartItem): Promise<string> {
  if (item.artNo?.trim()) return item.artNo.trim();

  const details = await getProductDetails(item.productSlug);
  if (details) {
    if (item.size && details.sizeArtNos?.[item.size]) {
      return details.sizeArtNos[item.size];
    }
    if (details.artNo?.trim()) return details.artNo.trim();
  }

  const product = await getProductBySlug(item.productSlug);
  if (product?.artNo?.trim()) return product.artNo.trim();

  throw new Error(`Не найден артикул AdvantShop для «${item.name}». Обновите корзину.`);
}

function buildOrderPayload(
  input: SubmitStorefrontOrderInput,
  orderItems: AdvantShopOrderItem[]
): AdvantShopOrderPayload {
  const { firstName, lastName } = splitCustomerName(input.customer.name);
  const phone = normalizePhone(input.customer.phone);

  return {
    OrderCustomer: {
      FirstName: firstName,
      LastName: lastName,
      Phone: phone,
      Country: "Россия",
      City: input.customer.city.trim(),
      Street: input.customer.address.trim(),
      Apartment: input.customer.apartment.trim() || undefined,
    },
    Number: input.orderNumber,
    OrderSource: process.env.ADVANTSHOP_ORDER_SOURCE?.trim() || "fidelis",
    Currency: "RUB",
    CustomerComment: buildCustomerComment(input.items, input.customer.comment),
    ShippingName: "СДЭК",
    ShippingCost: input.deliveryFee,
    CheckOrderItemExist: true,
    CheckOrderItemAvailable: true,
    OrderItems: orderItems,
  };
}

export async function submitAdvantShopOrder(
  input: SubmitStorefrontOrderInput
): Promise<SubmitStorefrontOrderResult> {
  if (!isAdvantShopConfigured()) {
    throw new Error("AdvantShop не настроен на сервере");
  }

  const orderItems: AdvantShopOrderItem[] = [];

  for (const item of input.items) {
    const artNo = await resolveArtNo(item);
    orderItems.push({
      ArtNo: artNo,
      Name: item.name,
      Price: item.price,
      Amount: item.quantity,
    });
  }

  const payload = buildOrderPayload(input, orderItems);
  const response = await advantshopFetch<AdvantShopOrderAddResponse>("/api/order/add", {
    method: "POST",
    body: payload,
    revalidate: false,
  });

  if (response.result === false) {
    throw new Error(formatAdvantShopErrors(response.errors));
  }

  const fromShop =
    response.obj?.Number?.trim() ||
    (response.obj?.Id != null ? String(response.obj.Id) : "");

  return {
    advantshopOrderId: response.obj?.Id,
    // Приоритет — номер из AdvantShop; иначе тот, что отправили мы
    advantshopOrderNumber: fromShop || input.orderNumber,
  };
}
