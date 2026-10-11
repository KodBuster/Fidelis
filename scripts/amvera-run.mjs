/**
 * Стартер внутри amvera-bundle (без sh).
 * Копируется в amvera-bundle/run.mjs при prepare-standalone.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const server = join(here, "server.js");

if (!existsSync(server)) {
  console.error("Amvera: server.js not found at", server);
  process.exit(1);
}

const env = { ...process.env };
// Amvera/Docker подставляет HOSTNAME=id контейнера — Next обязан слушать 0.0.0.0
env.HOSTNAME = "0.0.0.0";
if (!env.PORT) env.PORT = "80";

console.log("Amvera start:", server, "HOSTNAME="+env.HOSTNAME, "PORT="+env.PORT);

const result = spawnSync(process.execPath, [server], {
  stdio: "inherit",
  cwd: here,
  env,
});

process.exit(result.status ?? 1);
