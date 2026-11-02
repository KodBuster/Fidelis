export function mailKind(subject: string) {
  if (subject.includes("доступ к каталогу открыт")) return "approval";
  if (subject.includes("новая заявка")) return "administrator-registration";
  if (subject.includes("восстановление")) return "password-reset";
  if (subject.includes("подтвердите")) return "email-verification";
  return "account-notification";
}

/** Log useful SMTP status without credentials, message contents, or recipient addresses. */
export function smtpDiagnostic(error: unknown, password = "") {
  const source = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const redact = (value: unknown) => {
    let text = typeof value === "string" ? value : "";
    if (password) text = text.split(password).join("[secret]");
    return text.replace(/[^\s<>"']+@[^\s<>"']+/g, "[email]").replace(/[\r\n]+/g, " ").slice(0, 400);
  };
  return { code: redact(source.code), command: redact(source.command), responseCode: typeof source.responseCode === "number" ? source.responseCode : undefined, response: redact(source.response), message: redact(source.message) };
}
