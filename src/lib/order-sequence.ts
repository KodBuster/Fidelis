import { promises as fs } from "fs";
import path from "path";

const COUNTER_DIR =
  process.env.AMVERA === "1"
    ? "/data"
    : path.join(process.cwd(), "data");
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
 * Выдаёт следующий порядковый номер заказа, начиная с 1
 * (или ORDER_NUMBER_START). Потокобезопасно в рамках одного процесса.
 */
export async function allocateNextOrderNumber(): Promise<number> {
  let allocated = 0;

  const run = lock.then(async () => {
    const state = await readCounter();
    allocated = state.next;
    await writeCounter({ next: allocated + 1 });
  });

  lock = run.then(
    () => undefined,
    () => undefined
  );
  await run;

  return allocated;
}
