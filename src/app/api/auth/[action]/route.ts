import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { accountByEmail, db } from "@/lib/auth/store";
import { digest, hashPassword, randomToken, validPassword, verifyPassword } from "@/lib/auth/crypto";
import { createSession, getCurrentAccount, logout } from "@/lib/auth/session";
import { assertMailConfigured, queueMail } from "@/lib/auth/mail";
import { approvedGroupId, queueApprovalEmail } from "@/lib/auth/sync";
import { runAccountJobs } from "@/lib/auth/jobs";
import { AuthError, field, rateLimit, readAuthBody, requireSameOrigin } from "@/lib/auth/http";

export const runtime = "nodejs";
const generic = "Если аккаунт существует, письмо с инструкциями будет отправлено на указанный адрес.";
function issueToken(id: string, email: string, purpose: "verify" | "reset") {
  const token = randomToken();
  db().transaction(() => {
    db().prepare("DELETE FROM tokens WHERE account_id = ? AND purpose = ?").run(id, purpose);
    db().prepare("INSERT INTO tokens VALUES (?, ?, ?, ?)").run(digest(token), id, purpose, Date.now() + (purpose === "verify" ? 86400000 : 3600000));
    const link = `${process.env.SITE_URL}/account/${purpose}?token=${token}`;
    queueMail(email, purpose === "verify" ? "Фиделис — подтвердите почту" : "Фиделис — восстановление пароля", `${purpose === "verify" ? "Подтвердите адрес электронной почты" : "Задайте новый пароль"}:\n${link}\n\n${purpose === "verify" ? "Ссылка действует 24 часа. После подтверждения заявку проверит администратор." : "Ссылка действует 1 час. Если вы не запрашивали восстановление, проигнорируйте письмо."}`);
  })();
}
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    requireSameOrigin(request);
    const { action } = await context.params;
    const body = await readAuthBody(request);
    // Configure the reverse proxy to overwrite x-forwarded-for (one application instance).
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    rateLimit(`ip:${ip}`, 60);
    if (action === "logout") { await logout(); return NextResponse.json({ ok: true }); }
    if (action === "resend-approval") {
      assertMailConfigured();
      const account = await getCurrentAccount();
      if (!account?.verified || !account.access) throw new AuthError("Письмо доступно после подтверждения регистрации администратором.", 403);
      rateLimit(`approval-mail:${account.id}`, 3, 3600000);
      queueApprovalEmail(account);
      return NextResponse.json({ ok: true, message: "Письмо об открытии доступа поставлено в очередь отправки. Проверьте также папку «Спам»." });
    }
    if (action === "register") {
      assertMailConfigured(); approvedGroupId();
      const email = field(body, "email", 254).toLowerCase();
      const name = field(body, "name"); const organization = field(body, "organization"); const city = field(body, "city");
      let phone = field(body, "phone", 40).replace(/\D/g, "");
      if (phone.startsWith("8")) phone = `7${phone.slice(1)}`;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.length < 2 || !organization || !city || !/^7\d{10}$/.test(phone) || body.consent !== true) throw new AuthError("Заполните все поля и подтвердите согласие на обработку персональных данных.");
      if (!validPassword(body.password) || body.password !== body.confirmPassword) throw new AuthError("Пароли должны совпадать и содержать от 10 до 128 символов.");
      rateLimit(`register:${email}`, 3, 3600000);
      const password = await hashPassword(body.password);
      if (!accountByEmail(email)) {
        const id = randomUUID();
        db().transaction(() => {
          db().prepare("INSERT INTO accounts (id,email,name,phone,organization,city,password_hash,consent_at,created_at) VALUES (?,?,?,?,?,?,?,?,?)").run(id, email, name, phone, organization, city, password, Date.now(), Date.now());
          issueToken(id, email, "verify");
        })();
      }
      return NextResponse.json({ ok: true, message: "Проверьте почту: если адрес ещё не зарегистрирован, мы отправили ссылку для подтверждения. Если аккаунт уже есть, войдите или восстановите пароль." });
    }
    if (action === "login") {
      const email = field(body, "email", 254).toLowerCase();
      const password = typeof body.password === "string" && body.password.length <= 128 ? body.password : "";
      rateLimit(`login:${email}`, 10);
      const account = accountByEmail(email);
      // Same expensive password derivation for unknown emails.
      const stored = account?.password_hash || "00000000000000000000000000000000:" + "00".repeat(64);
      if (!(await verifyPassword(password, stored)) || !account) throw new AuthError("Неверная почта или пароль", 401);
      await logout(); await createSession(account.id);
      return NextResponse.json({ ok: true });
    }
    if (action === "forgot" || action === "resend") {
      assertMailConfigured();
      const email = field(body, "email", 254).toLowerCase();
      rateLimit(`mail:${email}`, 3, 3600000);
      const account = accountByEmail(email);
      if (account && (action === "forgot" || !account.verified)) issueToken(account.id, email, action === "forgot" ? "reset" : "verify");
      return NextResponse.json({ ok: true, message: generic });
    }
    if (action === "verify" || action === "reset") {
      const token = field(body, "token", 64);
      const row = db().prepare("SELECT * FROM tokens WHERE hash = ? AND purpose = ? AND expires > ?").get(digest(token), action, Date.now()) as { account_id: string } | undefined;
      if (!row) throw new AuthError("Ссылка недействительна или срок её действия истёк.");
      let hash = "";
      if (action === "reset") {
        if (!validPassword(body.password) || body.password !== body.confirmPassword) throw new AuthError("Пароли должны совпадать и содержать от 10 до 128 символов.");
        hash = await hashPassword(body.password);
      }
      db().transaction(() => {
        const result = db().prepare("DELETE FROM tokens WHERE hash = ? AND expires > ?").run(digest(token), Date.now());
        if (!result.changes) throw new AuthError("Ссылка уже использована.");
        if (action === "verify") db().prepare("UPDATE accounts SET verified = 1 WHERE id = ?").run(row.account_id);
        else {
          db().prepare("UPDATE accounts SET password_hash = ? WHERE id = ?").run(hash, row.account_id);
          db().prepare("DELETE FROM sessions WHERE account_id = ?").run(row.account_id);
          db().prepare("DELETE FROM tokens WHERE account_id = ? AND purpose = 'reset'").run(row.account_id);
        }
      })();
      if (action === "verify") { await logout(); await createSession(row.account_id); }
      return NextResponse.json({ ok: true, message: action === "verify" ? "Почта подтверждена. Заявка ожидает проверки администратора." : "Пароль изменён. Войдите с новым паролем." });
    }
    if (action === "password" || action === "profile") {
      const account = await getCurrentAccount();
      if (!account) throw new AuthError("Войдите в аккаунт", 401);
      if (action === "password") {
        const currentPassword = typeof body.currentPassword === "string" && body.currentPassword.length <= 128 ? body.currentPassword : "";
        if (!(await verifyPassword(currentPassword, account.password_hash))) throw new AuthError("Текущий пароль неверен.");
        if (!validPassword(body.password) || body.password !== body.confirmPassword) throw new AuthError("Пароли должны совпадать и содержать от 10 до 128 символов.");
        const hash = await hashPassword(body.password);
        db().transaction(() => {
          db().prepare("UPDATE accounts SET password_hash = ? WHERE id = ?").run(hash, account.id);
          db().prepare("DELETE FROM sessions WHERE account_id = ?").run(account.id);
        })();
        await createSession(account.id);
      } else throw new AuthError("Для изменения реквизитов обратитесь к менеджеру.");
      return NextResponse.json({ ok: true, message: "Пароль изменён." });
    }
    throw new AuthError("Неизвестный запрос", 404);
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 503;
    return NextResponse.json({ error: error instanceof AuthError ? error.message : "Сервис временно недоступен. Попробуйте позже или свяжитесь с нами." }, { status });
  } finally {
    // Durable queue survives SMTP outages; the minute worker also retries it.
    void runAccountJobs().catch(() => console.error("Account background job failed"));
  }
}
