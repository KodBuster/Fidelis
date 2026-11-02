import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join, relative, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export function checkRuntime(bundleDirectory) {
  const profile = JSON.parse(readFileSync(join(bundleDirectory, "build-profile.json"), "utf8"));
  if (profile.profile !== "webpack-sqlite-v2") throw new Error("Unexpected Amvera build profile; rebuild the latest commit");
  const requireFromBundle = createRequire(join(bundleDirectory, "server.js"));
  const sqlitePath = requireFromBundle.resolve("better-sqlite3");
  const localPath = relative(bundleDirectory, sqlitePath);
  if (localPath.startsWith("..") || isAbsolute(localPath)) throw new Error("SQLite resolved outside the deployment artifact");
  const Database = requireFromBundle("better-sqlite3");
  const database = new Database(":memory:");
  try {
    if (database.prepare("SELECT 1 AS ok").get().ok !== 1) throw new Error("SQLite runtime check failed");
  } finally { database.close(); }
  console.log(`Amvera runtime check OK: ${profile.profile}, Node ${process.version}, ${process.platform}/${process.arch}, built ${profile.builtAt}`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  checkRuntime(dirname(fileURLToPath(import.meta.url)));
}
