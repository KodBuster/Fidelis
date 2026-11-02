import "server-only";
import { advantshopFetch } from "./client";
export type AccountOrder = {
  id: number; number: string; date: string; total: number; currency: string; status: string;
  paid: boolean; shipping: string; payment: string; track: string;
  items: { name: string; artNo: string; amount: number; price: number; size: string }[];
};
type RawOrder = {
  Id: number; Number: string; Date: string; Sum: number; Currency: string;
  Customer?: { CustomerId?: string }; Status?: { Name?: string; Hidden?: boolean };
  IsPaid?: boolean; ShippingName?: string; PaymentName?: string; TrackNumber?: string;
  Items?: { Name: string; ArtNo: string; Amount: number; Price: number; Size?: string }[];
};
export async function getAccountOrders(customerId: string, page = 1) {
  const result = await advantshopFetch<{ result: boolean; obj?: { DataItems: RawOrder[]; TotalPageCount: number } }>("/api/order/getlist", {
    method: "POST", revalidate: false, body: { CustomerId: customerId, Page: page, ItemsPerPage: 20, LoadItems: true },
  });
  if (!result.result || !result.obj) throw new Error("История заказов временно недоступна");
  // Never expose another customer's order, even if an upstream ignores the filter.
  const orders: AccountOrder[] = result.obj.DataItems.filter(o => o.Customer?.CustomerId?.toLowerCase() === customerId.toLowerCase()).map(o => ({
    id: o.Id, number: o.Number, date: o.Date, total: o.Sum, currency: o.Currency,
    status: o.Status?.Hidden ? "В обработке" : o.Status?.Name || "В обработке", paid: Boolean(o.IsPaid),
    shipping: o.ShippingName || "", payment: o.PaymentName || "", track: o.TrackNumber || "",
    items: (o.Items || []).map(i => ({ name: i.Name, artNo: i.ArtNo, amount: i.Amount, price: i.Price, size: i.Size || "" })),
  }));
  return { orders, pages: result.obj.TotalPageCount };
}
