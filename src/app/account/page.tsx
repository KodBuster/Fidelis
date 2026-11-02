import Link from "next/link";
import { getCurrentAccount } from "@/lib/auth/session";
import { AuthForm } from "@/components/account/AuthForm";
import { LogoutButton } from "@/components/account/LogoutButton";
import { getAccountOrders, type AccountOrder } from "@/lib/advantshop/account-orders";

function money(value: number, currency = "RUB") {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: /^[A-Z]{3}$/.test(currency) ? currency : "RUB" }).format(value);
}
export default async function AccountPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const account = await getCurrentAccount();
  if (!account) return <div className="mx-auto max-w-md"><h1 className="mb-6 font-heading text-3xl text-brand-olive-dark">Личный кабинет</h1><AuthForm mode="login" /></div>;
  const page = Math.max(1, Math.min(10000, Number((await searchParams).page) || 1));
  let orders: AccountOrder[] = []; let pages = 1; let orderError = false;
  if (account.access && account.customer_id) {
    try { ({ orders, pages } = await getAccountOrders(account.customer_id, Math.floor(page))); }
    catch { orderError = true; }
  }
  return <>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><h1 className="font-heading text-3xl text-brand-olive-dark md:text-4xl">Личный кабинет</h1><LogoutButton /></div>
    <div className={`mb-8 rounded-xl border p-5 ${account.access ? "border-green-200 bg-green-50" : "border-brand-sand bg-brand-surface"}`}>
      <h2 className="font-heading text-xl">{account.serviceUnavailable ? "Не удалось проверить доступ" : !account.verified ? "Подтвердите электронную почту" : account.access ? "Доступ к каталогу открыт" : "Регистрация ожидает подтверждения"}</h2>
      <p className="mt-2 text-sm text-brand-muted">{account.serviceUnavailable ? "Сервис временно недоступен. Обновите страницу позже." : !account.verified ? "Откройте письмо от Фиделис и подтвердите ваш адрес. Если письмо не пришло, проверьте папку «Спам» или запросите его повторно." : account.access ? "Вы можете просматривать каталог, цены и оформлять заказы." : "Администратор проверит заявку. О решении мы сообщим по электронной почте."}</p>
      {account.access && <Link className="mt-4 inline-block text-brand-terracotta underline" href="/">Перейти на главную →</Link>}
      {account.access && <details className="mt-4 max-w-md text-sm"><summary className="cursor-pointer text-brand-terracotta">Не пришло письмо об открытии доступа?</summary><div className="mt-3"><AuthForm mode="resend-approval" /></div></details>}
      {!account.verified && <div className="mt-5 max-w-md"><AuthForm mode="resend" email={account.email} /></div>}
    </div>
    <div className="grid items-start gap-8 md:grid-cols-[1fr_2fr]">
      <div className="space-y-6">
        <section className="rounded-xl border border-brand-sand p-5"><h2 className="mb-4 font-heading text-2xl">Мои данные</h2><dl className="space-y-3 break-words text-sm">{[["Имя", account.name], ["Телефон", account.phone], ["Почта", account.email], ["Организация", account.organization], ["Город", account.city]].map(([label, value]) => <div key={label}><dt className="text-brand-muted">{label}</dt><dd>{value}</dd></div>)}</dl><p className="mt-4 text-xs text-brand-muted">Для изменения реквизитов обратитесь к менеджеру.</p></section>
        <details className="rounded-xl border border-brand-sand p-5"><summary className="cursor-pointer font-heading text-xl">Сменить пароль</summary><div className="mt-5"><AuthForm mode="password" /></div></details>
      </div>
      <section><h2 className="mb-5 font-heading text-2xl">Мои заказы</h2>
        {!account.access ? <p className="text-brand-muted">История заказов будет доступна после подтверждения регистрации.</p> : orderError ? <p role="alert">Не удалось загрузить историю заказов. Обновите страницу немного позже.</p> : orders.length === 0 ? <p className="rounded-xl bg-brand-surface p-6 text-brand-muted">У вас пока нет заказов.</p> : <div className="space-y-4">{orders.map(order => <details key={order.id} className="rounded-xl border border-brand-sand p-5">
          <summary className="cursor-pointer"><span className="font-medium">Заказ №{order.number}</span><span className="ml-3 text-sm text-brand-muted">{new Date(order.date).toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" })}</span><span className="mt-2 flex flex-wrap justify-between gap-2 text-sm"><span>{order.status}</span><span>{money(order.total, order.currency)}</span></span></summary>
          <div className="mt-5 space-y-3 border-t border-brand-sand pt-4 text-sm">{order.items.map((item, index) => <div key={index} className="flex justify-between gap-4"><div>{item.name}<p className="text-xs text-brand-muted">Артикул {item.artNo}{item.size && ` · Размер ${item.size}`} · {item.amount} шт.</p></div><span className="shrink-0">{money(item.price, order.currency)}</span></div>)}<p>Оплата: {order.paid ? "Оплачен" : "Не оплачен"}{order.payment && ` · ${order.payment}`}</p>{order.shipping && <p>Доставка: {order.shipping}</p>}{order.track && <p>Трек-номер: {order.track}</p>}</div>
        </details>)}</div>}
        {account.access && pages > 1 && <nav aria-label="Страницы заказов" className="mt-6 flex items-center gap-5 text-sm">{page > 1 && <Link href={`/account?page=${page - 1}`}>← Предыдущая</Link>}<span>{page} / {pages}</span>{page < pages && <Link href={`/account?page=${page + 1}`}>Следующая →</Link>}</nav>}
      </section>
    </div>
  </>;
}
