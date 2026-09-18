export const SITE_PHONE = "+7 495 585-10-99";
export const SITE_PHONE_TEL = "tel:+74955851099";
export const SITE_EMAIL = "mail@fidelis.ru";
export const SITE_EMAIL_MAILTO = `mailto:${SITE_EMAIL}`;

const PHONE_DIGITS = "79037613697";
const TELEGRAM_PHONE = "+79037613697";
const DEFAULT_MESSAGE = "Здравствуйте! Интересуют украшения Фиделис";

export const MESSENGERS = [
  {
    id: "max",
    label: "MAX",
    href: "https://max.ru/u/f9LHodD0cOJvAR42F_FFaqrLPtQm2Kw36zndWQqfnUVs01NnnVKahc6wOJ4",
  },
  {
    id: "telegram",
    label: "Telegram",
    href: `https://t.me/${TELEGRAM_PHONE}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: `https://wa.me/${PHONE_DIGITS}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`,
  },
] as const;

/** Юридический / контактный адрес (самовывоз и шоурум не предлагаются). */
export const COMPANY_ADDRESS = {
  title: "Фиделис",
  address: "129110, г. Москва, ул. Гиляровского 40, офис 13",
  hours: "Пн–Пт: 10:00 – 19:00",
  phone: SITE_PHONE,
  mapQuery: "129110, Москва, ул. Гиляровского 40, офис 13",
};

/** @deprecated Используйте COMPANY_ADDRESS — шоурум убран с витрины. */
export const SHOWROOM = COMPANY_ADDRESS;

export const SHOWROOM_GEO = {
  latitude: 55.7798,
  longitude: 37.6375,
} as const;

export const SHOWROOM_MAP_EMBED_URL = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(COMPANY_ADDRESS.mapQuery)}&z=17&l=map`;

export const SHOWROOM_MAP_LINK = `https://yandex.ru/maps/?text=${encodeURIComponent(COMPANY_ADDRESS.mapQuery)}`;
