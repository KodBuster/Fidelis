/** Подписи вставок на витрине (без привязки к типу камня). */
export const SYNTHETIC_DIAMOND = "вставка";
export const SYNTHETIC_DIAMONDS = "вставки";
export const SYNTHETIC_DIAMOND_CAP = "Вставка";
export const SYNTHETIC_DIAMONDS_CAP = "Вставки";
export const WITH_SYNTHETIC_DIAMOND = "со вставкой";
export const WITH_SYNTHETIC_DIAMONDS = "со вставками";
export const INSERT_WEIGHT_LABEL = "Масса вставки";

/** 1 карат = 0,2 г */
export function formatInsertMassGrams(caratWeight: number): string {
  const grams = caratWeight * 0.2;
  return grams.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

export function formatInsertMassLabel(caratWeight: number): string {
  return `${formatInsertMassGrams(caratWeight)} г`;
}

/**
 * Масса вставки из названия товара, например «0,512 г».
 */
export function extractInsertMassFromName(name: string): string | null {
  const match = name.match(/(\d+[.,]\d+)\s*г(?:р(?:амм)?\.?)?/i);
  if (!match?.[1]) return null;
  return `${match[1].replace(".", ",")} г`;
}
