import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type Account = {
  id: string; email: string; name: string; phone: string; organization: string; city: string;
  password_hash: string; verified: number; customer_id: string | null; approved: number;
};
let connection: Database.Database | undefined;
export function db() {
  if (connection) return connection;
  const path = process.env.AUTH_DB_PATH || (process.env.NODE_ENV === "production" ? "/data/fidelis-auth.sqlite" : resolve("data/fidelis-auth.sqlite"));
  mkdirSync(dirname(path), { recursive: true });
  connection = new Database(path);
  connection.pragma("journal_mode = WAL");
  connection.pragma("busy_timeout = 5000");
  connection.pragma("foreign_keys = ON");
  connection.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL,
      phone TEXT NOT NULL, organization TEXT NOT NULL, city TEXT NOT NULL,
      password_hash TEXT NOT NULL, verified INTEGER NOT NULL DEFAULT 0,
      customer_id TEXT UNIQUE, approved INTEGER NOT NULL DEFAULT 0,
      consent_at INTEGER NOT NULL, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS tokens (hash TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), purpose TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS mail (id TEXT PRIMARY KEY, recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, next_attempt INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires INTEGER NOT NULL);
  `);
  return connection;
}
export function accountById(id: string) { return db().prepare("SELECT * FROM accounts WHERE id = ?").get(id) as Account | undefined; }
export function accountByEmail(email: string) { return db().prepare("SELECT * FROM accounts WHERE email = ?").get(email) as Account | undefined; }
