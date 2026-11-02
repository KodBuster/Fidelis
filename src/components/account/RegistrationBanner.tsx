import Link from "next/link";
import { AuthForm } from "./AuthForm";
export function RegistrationBanner({ signedIn }: { signedIn: boolean }) {
  return <section id="registration" className="scroll-mt-32 border-b border-brand-sand bg-brand-page py-12 md:py-20">
    <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 md:grid-cols-2 md:gap-16 md:px-6 lg:px-10">
      <div className="md:sticky md:top-44">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-brand-terracotta">Фиделис · Для партнёров</p>
        <h1 className="font-heading text-3xl leading-tight text-brand-olive-dark md:text-5xl">Для ознакомления с каталогом и заказа, пожалуйста, зарегистрируйтесь</h1>
        <p className="mt-6 leading-relaxed text-brand-muted">Каталог и цены доступны после подтверждения регистрации администратором. Оставьте заявку — мы рассмотрим её и сообщим о решении по электронной почте.</p>
        <p className="mt-5 text-sm">Уже зарегистрированы? <Link href="/account" className="text-brand-terracotta underline">Войти в личный кабинет</Link></p>
      </div>
      <div className="rounded-2xl border border-brand-sand bg-brand-surface p-5 shadow-sm md:p-8">
        <h2 className="mb-6 font-heading text-2xl text-brand-olive-dark">{signedIn ? "Ваша регистрация" : "Заявка на регистрацию"}</h2>
        {signedIn ? <><p className="mb-5 text-brand-muted">Проверьте статус заявки в личном кабинете. После подтверждения вам откроется каталог.</p><Link className="text-brand-terracotta underline" href="/account">Перейти в личный кабинет →</Link></> : <AuthForm mode="register" />}
      </div>
    </div>
  </section>;
}
