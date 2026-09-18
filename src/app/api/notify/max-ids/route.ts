import { NextResponse } from "next/server";
import {
  getMaxBotToken,
  getMaxAdminChatIds,
  getMaxAdminUserIds,
} from "@/lib/max/config";
import {
  getMaxNotifyTargets,
  maxApiRequest,
  notifyMaxAdmins,
} from "@/lib/max/client";

/**
 * Диагностика MAX: кто настроен, кого видит бот в /updates, тестовая отправка.
 *
 * GET /api/notify/max-ids?key=ВАШ_MAX_BOT_TOKEN
 * GET /api/notify/max-ids?key=…&send=1  — ещё и тестовое сообщение всем
 *
 * 1) Оба админа пишут боту в MAX
 * 2) Открываете этот URL
 * 3) Сверяете user_id / chat_id и правите Amvera
 */
export async function GET(request: Request) {
  const token = getMaxBotToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "MAX_BOT_TOKEN не задан" },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const key =
    url.searchParams.get("key")?.trim() ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    "";

  if (!key || key !== token) {
    return NextResponse.json(
      { ok: false, error: "Укажите ?key=MAX_BOT_TOKEN" },
      { status: 401 }
    );
  }

  const updatesResult = await maxApiRequest(token, "GET", "/updates", undefined, {
    limit: 50,
    timeout: 5,
  });

  const users: Record<string, string> = {};
  const chats: Record<string, string> = {};

  const payload = updatesResult.json as
    | { updates?: Array<Record<string, unknown>> }
    | undefined;

  if (Array.isArray(payload?.updates)) {
    for (const update of payload.updates) {
      const user = update.user as { user_id?: number; name?: string } | undefined;
      if (user?.user_id) {
        users[String(user.user_id)] = user.name ?? `user ${user.user_id}`;
      }

      const message = update.message as
        | {
            sender?: { user_id?: number; name?: string };
            recipient?: { chat_id?: number; chat_type?: string };
          }
        | undefined;

      if (message?.sender?.user_id) {
        users[String(message.sender.user_id)] =
          message.sender.name ?? `user ${message.sender.user_id}`;
      }
      if (message?.recipient?.chat_id != null) {
        chats[String(message.recipient.chat_id)] =
          message.recipient.chat_type ?? "chat";
      }
    }
  }

  const configuredUserIds = getMaxAdminUserIds();
  const configuredChatIds = getMaxAdminChatIds();
  const missingUsers = configuredUserIds.filter((id) => !users[String(id)]);

  let testSend: Awaited<ReturnType<typeof notifyMaxAdmins>> | undefined;
  if (url.searchParams.get("send") === "1") {
    testSend = await notifyMaxAdmins(
      "🧪 Тест уведомлений «ФИДЕЛИС»\nЕсли видите это — доставка на ваш аккаунт работает."
    );
  }

  return NextResponse.json({
    ok: updatesResult.ok,
    apiHttp: updatesResult.httpCode,
    configured: {
      user_ids: configuredUserIds,
      chat_ids: configuredChatIds,
      targets: getMaxNotifyTargets(),
    },
    seenInUpdates: {
      users,
      chats,
    },
    hint:
      missingUsers.length > 0
        ? `В updates нет user_id ${missingUsers.join(", ")}. Пусть этот человек напишет боту ещё раз, обновите страницу. Если user_id есть, но send падает — добавьте его chat_id в MAX_ADMIN_CHAT_IDS.`
        : "Сверьте ID. Если второму не приходит по user_id — добавьте его chat_id в MAX_ADMIN_CHAT_IDS.",
    testSend,
    updatesError: updatesResult.ok
      ? undefined
      : updatesResult.error ?? updatesResult.body.slice(0, 400),
  });
}
