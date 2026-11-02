"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { formatPhoneInput } from "@/lib/checkout";

type Mode = "register" | "login" | "forgot" | "reset" | "verify" | "password" | "resend" | "resend-approval";
const labels: Record<Mode, string> = { register: "Отправить заявку", login: "Войти", forgot: "Восстановить пароль", reset: "Задать новый пароль", verify: "Подтвердить почту", password: "Изменить пароль", resend: "Отправить письмо повторно", "resend-approval": "Повторно отправить письмо об открытии доступа" };
const inputClass = "w-full rounded-lg border border-brand-sand bg-white px-4 py-3 text-brand-text focus:outline-2 focus:outline-brand-terracotta";
export function AuthForm({ mode, token = "", email = "" }: { mode: Mode; token?: string; email?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [phone, setPhone] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    const body = { ...Object.fromEntries(data), token, consent: data.get("consent") === "on" };
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось выполнить запрос");
      if (mode === "login" || mode === "verify") { window.location.assign("/account"); return; }
      setSuccess(true); setMessage(result.message || "Готово");
      event.currentTarget?.reset();
    } catch (error) { setSuccess(false); setMessage(error instanceof Error ? error.message : "Проверьте подключение к интернету и попробуйте снова."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="ym-disable-keys space-y-4" aria-label={labels[mode]}>
    {mode === "register" && <>
      <label className="block text-sm">Имя<input name="name" required minLength={2} maxLength={200} autoComplete="given-name" className={inputClass} /></label>
      <label className="block text-sm">Телефон<input name="phone" type="tel" required autoComplete="tel" value={phone} onChange={e => setPhone(formatPhoneInput(e.target.value))} className={inputClass} placeholder="+7 (___) ___-__-__" /></label>
    </>}
    {["register", "login", "forgot", "resend"].includes(mode) && <label className="block text-sm">Электронная почта<input name="email" type="email" required maxLength={254} autoComplete="username" defaultValue={email} className={inputClass} /></label>}
    {mode === "register" && <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm">Название организации<input name="organization" required maxLength={200} autoComplete="organization" className={inputClass} /></label>
      <label className="block text-sm">Город<input name="city" required maxLength={200} autoComplete="address-level2" className={inputClass} /></label>
    </div>}
    {mode === "password" && <label className="block text-sm">Текущий пароль<input name="currentPassword" type="password" required maxLength={128} autoComplete="current-password" className={inputClass} /></label>}
    {["register", "login", "reset", "password"].includes(mode) && <label className="block text-sm">{mode === "reset" || mode === "password" ? "Новый пароль" : "Пароль"}<input name="password" type="password" required minLength={mode === "login" ? 1 : 10} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} className={inputClass} />{mode !== "login" && <span className="text-xs text-brand-muted">От 10 символов</span>}</label>}
    {["register", "reset", "password"].includes(mode) && <label className="block text-sm">Повторите пароль<input name="confirmPassword" type="password" required minLength={10} maxLength={128} autoComplete="new-password" className={inputClass} /></label>}
    {mode === "register" && <label className="flex gap-3 text-xs leading-relaxed"><input name="consent" type="checkbox" required className="mt-1 shrink-0" /><span>Даю согласие на обработку персональных данных в соответствии с <Link href="/privacy" className="underline">политикой конфиденциальности</Link>.</span></label>}
    {message && <p role="status" className={`rounded-lg p-3 text-sm ${success ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>{message}</p>}
    <button type="submit" disabled={busy || (success && ["register", "reset"].includes(mode))} className="w-full rounded-lg bg-brand-terracotta px-5 py-3 text-white transition-opacity disabled:opacity-50">{busy ? "Подождите…" : labels[mode]}</button>
    {mode === "login" && <div className="flex flex-wrap justify-between gap-3 text-sm text-brand-terracotta"><Link href="/account/forgot">Забыли пароль?</Link><Link href="/#registration">Регистрация</Link></div>}
    {success && mode === "reset" && <Link href="/account" className="block text-brand-terracotta underline">Войти в личный кабинет</Link>}
  </form>;
}
