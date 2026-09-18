# Деплой Fidelis на Amvera Cloud

Панель: [cloud.amvera.ru](https://cloud.amvera.ru)  
Документация: [Node.js Server](https://docs.amvera.ru/applications/environments/nodejs-server.html), [переменные](https://docs.amvera.ru/applications/configuration/variables.html)

## Схема репозиториев

1. Разработка пушится в [KodBuster/Fidelis](https://github.com/KodBuster/Fidelis).
2. Форк [dmitry76543/Fidelis](https://github.com/dmitry76543/Fidelis) синхронизируется с upstream.
3. Amvera деплоит из форка `dmitry76543/Fidelis` (ветка `main`).

Сборка: `amvera.yaml` → `npm ci --include=dev && npm run build`, запуск: `node scripts/start-server.mjs`, порт **80**.

---

## 1. Деплой после изменений

```bash
git push origin main
```

Затем на GitHub: **Sync fork** у `dmitry76543/Fidelis` → Amvera подхватит push автоматически.

---

## 2. Переменные окружения (панель → Переменные)

Переменные из панели **недоступны на этапе сборки**, только при запуске контейнера. После изменений — **перезапуск**.

На Amvera **нельзя** использовать кавычки в значениях. Category map — только CSV.

| Переменная | Значение | Тип |
| --- | --- | --- |
| `ADVANTSHOP_BASE_URL` | `https://s4.advantme.ru/442301-dfcc` | обычная |
| `ADVANTSHOP_SERVER_API_KEY` | ключ вкладки «API» | **секрет** |
| `ADVANTSHOP_CLIENT_API_KEY` | ключ «API с авторизацией» | **секрет** |
| `ADVANTSHOP_CATEGORY_MAP` | см. ниже | обычная |
| `ADVANTSHOP_REVALIDATE_SECONDS` | `300` | обычная |
| `PORT` | `80` | обычная |
| `HOSTNAME` | `0.0.0.0` | обычная |
| `SITE_URL` | публичный URL витрины (Amvera или свой домен) | обычная |
| `ADVANTSHOP_ORDER_SOURCE` | `fidelis` | обычная (опционально) |

`ADVANTSHOP_CATEGORY_MAP` (без кавычек и пробелов вокруг `:` / `,`):

```
rings:koltsa,ankle-bracelets:braslety-na-nogu,bracelets:braslety-na-ruku,necklaces:kole,pendants:podveski,earrings:sergi,cords:shnurki
```

Ключи API — из локального `.env.local` (в git не коммитить).

Опционально позже: `YOOKASSA_*`, `MAX_*`, `PHOTTA_*`, `ADVANTSHOP_STORE_COOKIE` (если картинки с техдомена отдают HTML).

---

## 3. Проверка после деплоя

```bash
curl -I https://<имя>.amvera.io/
curl https://<имя>.amvera.io/shop
```

Ожидается HTTP 200. Каталог может быть пустым, пока в AdvantShop нет товаров — это нормально: API уже отвечает 0 products.

В логах Amvera не должно быть `ADVANTSHOP_* is not configured` и падений на `Check apikey`.

---

## 4. Домен

1. Amvera → **Домены** → добавить свой домен.
2. DNS: CNAME/A по подсказке Amvera.
3. Обновить `SITE_URL` и перезапустить контейнер.

---

## Чеклист

- [ ] Push в `KodBuster/Fidelis`, Sync fork `dmitry76543/Fidelis`
- [ ] Сборка Amvera зелёная
- [ ] Env: BASE_URL, оба API-ключа, CATEGORY_MAP (CSV), PORT, HOSTNAME, SITE_URL
- [ ] Контейнер перезапущен после env
- [ ] `/shop` открывается без 502
