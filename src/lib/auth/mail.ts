import "server-only";
import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";
import { db } from "./store";
import { mailKind, smtpDiagnostic } from "./mail-diagnostics";

export function assertMailConfigured() {
  if (!process.env.SMTP_PASSWORD || process.env.SMTP_PASSWORD === "*****" || !process.env.SITE_URL) {
    throw new Error("Регистрация временно недоступна. Пожалуйста, свяжитесь с нами по телефону.");
  }
}
export function queueMail(recipient: string, subject: string, body: string) {
  db().prepare("INSERT INTO mail (id, recipient, subject, body) VALUES (?, ?, ?, ?)").run(randomUUID(), recipient, subject, body);
}
export function administratorEmails() {
  return (process.env.REGISTRATION_NOTIFY_EMAILS || "krasnov@fidelis.ru;kuznetsov@fidelis.ru;krasnovafidelis@gmail.com;zabava-sharik@mail.ru").split(/[;,]/).map(x => x.trim()).filter(Boolean);
}
let sending = false;
export async function flushMail() {
  if (sending) return;
  sending = true;
  try {
    assertMailConfigured();
    const port = Number(process.env.SMTP_PORT || 587);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.rambler.ru", port,
      secure: port === 465, requireTLS: port !== 465,
      auth: { user: process.env.SMTP_USER || "zakaz-magaz@ro.ru", pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10000, socketTimeout: 15000,
    });
    const messages = db().prepare("SELECT * FROM mail WHERE next_attempt <= ? LIMIT 10").all(Date.now()) as { id: string; recipient: string; subject: string; body: string; attempts: number }[];
    for (const message of messages) {
      try {
        await transport.sendMail({
          from: { name: process.env.SMTP_FROM_NAME || "Фиделис", address: process.env.SMTP_FROM || "zakaz-magaz@ro.ru" },
          to: message.recipient, subject: message.subject, text: message.body,
          messageId: `<${message.id}@fidelis.ru>`,
        });
        db().prepare("DELETE FROM mail WHERE id = ?").run(message.id);
        console.info("Account email accepted by SMTP", { id: message.id, kind: mailKind(message.subject), attempt: message.attempts + 1 });
      } catch (error) {
        const nextAttempt = Date.now() + Math.min(3600000, 60000 * 2 ** Math.min(message.attempts, 6));
        db().prepare("UPDATE mail SET attempts = attempts + 1, next_attempt = ? WHERE id = ?").run(nextAttempt, message.id);
        console.error("Account email delivery failed; queued for retry", {
          id: message.id, kind: mailKind(message.subject), attempt: message.attempts + 1,
          retryAt: new Date(nextAttempt).toISOString(), ...smtpDiagnostic(error, process.env.SMTP_PASSWORD),
        });
      }
    }
    transport.close();
  } finally { sending = false; }
}
