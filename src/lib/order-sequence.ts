import { promises as fs } from "fs";
import path from "path";

/**
 * На Amvera persistenceMount=/data. Без AMVERA=1 счётчик писал в эфемерный
 * cwd/data → после рестарта снова 1, 2… и AdvantShop отклонял дубли Number.
 */
function resolveCounterDir(): string {
  if (process.env.AMVERA === "1") return "/data";
  // Авто-детект тома Amvera, даже если env забыли
  if (process.env.HOME === "/data" || process.env.PWD?.startsWith("/data")) {
    return "/data";
  }
  return path.join(process.cwd(), "data");
}

const COUNTER_DIR = resolveCounterDir();
const COUNTER_FILE = path.join(COUNTER_DIR, "order-counter.json");

type CounterState = { next: number };

function startFromEnv(): number {
  const raw = process.env.ORDER_NUMBER_START?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

let lock: Promise<void> = Promise.resolve();

async function readCounter(): Promise<CounterState> {
  try {
    const raw = await fs.readFile(COUNTER_FILE, "utf8");
    const parsed = JSON.parse(raw) as CounterState;
    if (typeof parsed.next === "number" && parsed.next >= 1) {
      return { next: Math.floor(parsed.next) };
    }
  } catch {
    /* first run */
  }
  return { next: startFromEnv() };
}

async function writeCounter(state: CounterState): Promise<void> {
  await fs.mkdir(COUNTER_DIR, { recursive: true });
  const tmp = `${COUNTER_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state), "utf8");
  await fs.rename(tmp, COUNTER_FILE);
}

/**
 * Выдаёт следующий порядковый номер заказа.
 * При ошибке ФС возвращает null — заказ уйдёт без Number (назначит AdvantShop).
 */
export async function allocateNextOrderNumber(): Promise<number | null> {
  let allocated: number | null = null;

  const run = lock.then(async () => {
    try {
      const state = await readCounter();
      allocated = state.next;
      await writeCounter({ next: allocated + 1 });
    } catch (error) {
      console.error(
        `Order counter unavailable at ${COUNTER_FILE}:`,
        error,
      );
      allocated = null;
    }
  });

  lock = run.then(
    () => undefined,
    () => undefined,
  );
  await run;

  return allocated;
}
