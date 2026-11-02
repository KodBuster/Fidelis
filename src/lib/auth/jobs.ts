import "server-only";
import { db, type Account } from "./store";
import { provisionCustomer, syncApproval } from "./sync";
import { flushMail } from "./mail";
let running = false;
export async function runAccountJobs() {
  if (running || !process.env.SMTP_PASSWORD || !process.env.ADVANTSHOP_APPROVED_GROUP_ID) return;
  running = true;
  try {
    // Deliver verification/reset links before potentially slow customer API calls.
    await flushMail();
    const accounts = db().prepare("SELECT * FROM accounts WHERE verified = 1").all() as Account[];
    for (const account of accounts) {
      try {
        if (!account.customer_id) await provisionCustomer(account);
        else await syncApproval(account);
      } catch { console.error("Account synchronization will retry", account.id); }
    }
    await flushMail();
    const now = Date.now();
    db().prepare("DELETE FROM sessions WHERE expires < ?").run(now);
    db().prepare("DELETE FROM tokens WHERE expires < ?").run(now);
    db().prepare("DELETE FROM limits WHERE expires < ?").run(now);
  } finally { running = false; }
}
