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
| artifacts ключ | `*` |
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
rings:koltso,ankle-bracelets:braslety-na-nogu,bracelets:braslet,necklaces:kole,pendants:podveski,chain-pendants:kulon-na-tsepi,earrings:sergi,cords:shnurki
```

---

## Если CrashLoopBackOff

1. Открой **лог приложения** (не системы) — там текст ошибки Node.
2. Проверь command = `node amvera-bundle/run.mjs` (без `sh`).
3. Sync fork `dmitry76543/Fidelis` → пересобери.
4. В логе сборки должно быть: `Standalone bundle prepared → amvera-bundle + run.mjs`.

---

## Чеклист

- [ ] Push + Sync fork
- [ ] UI: artifacts `*` → `/`, command `node amvera-bundle/run.mjs`
- [ ] Env: HOSTNAME, PORT, AdvantShop, SITE_URL
- [ ] Лог приложения: `Amvera start:` и `Ready`
- [ ] Открывается домен с вкладки «Домены»
