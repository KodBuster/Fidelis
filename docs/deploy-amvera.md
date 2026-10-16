# Деплой Fidelis на Amvera Cloud

Панель: [cloud.amvera.ru](https://cloud.amvera.ru)  
Документация: [Node.js Server](https://docs.amvera.ru/applications/environments/nodejs-server.html), [переменные](https://docs.amvera.ru/applications/configuration/variables.html)

## Схема репозиториев

1. Разработка пушится в [KodBuster/Fidelis](https://github.com/KodBuster/Fidelis).
2. Форк [dmitry76543/Fidelis](https://github.com/dmitry76543/Fidelis) синхронизируется с upstream.
3. Amvera деплоит из форка `dmitry76543/Fidelis` (ветка `main`).

## Конфиг в UI Amvera (один ключ artifacts)

| Поле | Значение |
| --- | --- |
| окружение | Node.js / npm / **20** |
| additionalCommands | `npm ci --include=dev && npm run build` |
| artifacts ключ | `amvera-bundle` |
| artifacts значение | `/` |
| command | `node amvera-bundle/run.mjs` |
| persistenceMount | `/data` |
| containerPort | `80` |

**Нельзя:** `sh -c ...` — в runtime нет shell → CrashLoopBackOff.

Сборка кладёт standalone в нескрытую папку `amvera-bundle/` (+ `run.mjs`).

---

## Переменные окружения

Без кавычек. После изменений — перезапуск.

| Переменная | Значение | Тип |
| --- | --- | --- |
| `ADVANTSHOP_BASE_URL` | `http://443046-pkrq.on-advantshop.net` | обычная |
| `ADVANTSHOP_SERVER_API_KEY` | ключ вкладки «API» | **секрет** |
| `ADVANTSHOP_CLIENT_API_KEY` | ключ «API с авторизацией» | **секрет** |
| `ADVANTSHOP_CATEGORY_MAP` | см. ниже | обычная |
| `ADVANTSHOP_REVALIDATE_SECONDS` | `300` | обычная |
| `PORT` | `80` | обычная |
| `HOSTNAME` | `0.0.0.0` | обычная |
| `SITE_URL` | публичный URL витрины (Amvera или свой домен) | обычная |
| `ADVANTSHOP_ORDER_SOURCE` | `fidelis` | обычная (опционально) |

`ADVANTSHOP_CATEGORY_MAP`:

```
rings:koltso,ankle-bracelets:braslety-na-nogu,bracelets:braslet,necklaces:kole,pendants:podveska,chain-pendants:kulon-na-tsepi,earrings:sergi,brooches:brosh
```

---

## Лог: S3 403 / архив ~800 МБ / Server Action

- **Download failed … 403 Forbidden** при `…tar.gz` (~800 МБ) — в артефакт попал весь проект (`artifacts: *`), включая `node_modules`. В `amvera.yaml` должно быть `amvera-bundle: /` (только standalone). В UI Amvera уберите ключ `*`, если он перебивает yaml. После смены — пересборка.
- **Failed to find Server Action** — после деплоя у клиента старая вкладка. Жёсткое обновление страницы (Ctrl+F5) или открыть сайт заново.

---

## GitHub → Amvera не подхватывает push

Amvera тянет **форк** [`dmitry76543/Fidelis`](https://github.com/dmitry76543/Fidelis) (не KodBuster). Webhook должен быть на **этом** репозитории.

1. Amvera → проект → **Репозиторий** → скопируйте URL вебхука (должен быть ровно `https://webhook.git.msk1.amvera.ru`, без лишнего пути/слеша).
2. GitHub форка → **Settings → Webhooks** → Payload URL = этот адрес.
3. Content type: `application/json`.
4. Secret = тот же, что в Amvera (поле «Секрет»).
5. Events: **Just the push event** (или Push; на другие Amvera отвечает 400).
6. Ветка в Amvera = `main`.
7. После пуша в KodBuster сделайте **Sync fork** у `dmitry76543/Fidelis` — иначе webhook нечего деплоить.
8. В webhook → Recent Deliveries: ответ **200**. Если 401/403 — секрет/токен; если нет доставок — URL неверный или webhook на другом репо.

Документация Amvera: [вебхуки](https://docs.amvera.ru/applications/git/webhooks.html).

---

## Если CrashLoopBackOff

1. Открой **лог приложения** (не системы) — там текст ошибки Node.
2. Проверь command = `node amvera-bundle/run.mjs` (без `sh`).
3. Sync fork `dmitry76543/Fidelis` → пересобери.
4. В логе сборки должно быть: `Standalone bundle prepared → amvera-bundle + run.mjs`.

---

## Чеклист

- [ ] Push + Sync fork
- [ ] Webhook на форке: `https://webhook.git.msk1.amvera.ru`, JSON, секрет, Push
- [ ] UI/yaml: artifacts `amvera-bundle` → `/`, command `node amvera-bundle/run.mjs`
- [ ] Env: HOSTNAME, PORT, AdvantShop, SITE_URL
- [ ] Лог приложения: `Amvera start:` и `Ready`
- [ ] Открывается домен с вкладки «Домены»
