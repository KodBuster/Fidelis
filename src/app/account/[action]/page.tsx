import { notFound } from "next/navigation";
import { AuthForm } from "@/components/account/AuthForm";
export default async function AccountAction({ params, searchParams }: { params: Promise<{ action: string }>; searchParams: Promise<{ token?: string }> }) {
  const { action } = await params;
  if (action !== "verify" && action !== "reset" && action !== "forgot") notFound();
  const { token } = await searchParams;
  const title = action === "verify" ? "Подтверждение почты" : "Восстановление пароля";
  return <div className="mx-auto max-w-md"><h1 className="mb-6 font-heading text-3xl">{title}</h1>{action === "verify" && <p className="mb-6 text-brand-muted">Нажмите кнопку ниже, чтобы подтвердить вашу электронную почту и отправить заявку на проверку.</p>}<AuthForm mode={action} token={token || ""} /></div>;
}
