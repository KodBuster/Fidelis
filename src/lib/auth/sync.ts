import "server-only";
import { advantshopFetch } from "@/lib/advantshop/client";
import { getAdvantShopBaseUrl } from "@/lib/advantshop/config";
import { accountById, db, type Account } from "./store";
import { administratorEmails, queueMail } from "./mail";

export function approvedGroupId() {
  const id = Number(process.env.ADVANTSHOP_APPROVED_GROUP_ID);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Не настроена группа доступа AdvantShop");
  return id;
}
export function queueApprovalEmail(account: Pick<Account, "email">) {
  const subject = "Фиделис — доступ к каталогу открыт";
  db().transaction(() => {
    const queued = db().prepare("SELECT id FROM mail WHERE recipient = ? AND subject = ? LIMIT 1").get(account.email, subject) as { id: string } | undefined;
    if (queued) db().prepare("UPDATE mail SET next_attempt = 0 WHERE id = ?").run(queued.id);
    else queueMail(account.email, subject, `Ваша регистрация подтверждена. Войдите в личный кабинет: ${process.env.SITE_URL}/account`);
  })();
}
export async function syncApproval(account: Account) {
  const group = approvedGroupId();
  const customer = await advantshopFetch<{ id: string; groupId?: number }>(`/api/customers/${encodeURIComponent(account.customer_id!)}`, { revalidate: false });
  const approved = customer.id?.toLowerCase() === account.customer_id?.toLowerCase() && Number(customer.groupId) === group;
  db().transaction(() => {
    const current = accountById(account.id)!;
    if (approved && !current.approved) queueApprovalEmail(account);
    db().prepare("UPDATE accounts SET approved = ? WHERE id = ?").run(approved ? 1 : 0, account.id);
  })();
  return approved;
}
export async function provisionCustomer(account: Account) {
  if (!account.verified || account.customer_id) return;
  // Exact email match only after email verification; retries recover a customer created before a timeout.
  const existing = await advantshopFetch<{ customers?: { id: string; email: string }[] }>("/api/customers", { searchParams: { email: account.email }, revalidate: false });
  let id = existing.customers?.find(c => c.email.toLowerCase() === account.email.toLowerCase())?.id;
  if (!id) {
    const result = await advantshopFetch<{ id?: string }>("/api/customers/add", { method: "POST", revalidate: false, body: {
      email: account.email, firstName: account.name, phone: Number(account.phone), organization: account.organization,
      contact: { country: "Россия", city: account.city }, subscribedForNews: false,
      adminComment: "Регистрация на витрине Фиделис. Email подтверждён. Требуется проверка администратора.",
    } });
    id = result.id;
  }
  if (!id) throw new Error("AdvantShop не вернул ID покупателя");
  db().transaction(() => {
    if (accountById(account.id)?.customer_id) return;
    db().prepare("UPDATE accounts SET customer_id = ? WHERE id = ?").run(id, account.id);
    const link = `${getAdvantShopBaseUrl()}/adminv3/customers/edit/${encodeURIComponent(id!)}`;
    const groupName = process.env.ADVANTSHOP_APPROVED_GROUP_NAME || "Оптовик";
    for (const email of administratorEmails()) queueMail(email, "Фиделис — новая заявка на регистрацию", `Имя: ${account.name}\nТелефон: ${account.phone}\nEmail: ${account.email}\nОрганизация: ${account.organization}\nГород: ${account.city}\n\nКарточка покупателя: ${link}\nID: ${id}\nДля доступа назначьте группу «${groupName}» (ID ${approvedGroupId()}).`);
  })();
}
