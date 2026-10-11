import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const standaloneDir = ".next/standalone";
/** Нескрытая папка для Amvera (в UI можно указать только один ключ artifacts). */
const amveraBundleDir = "amvera-bundle";
const amveraRunSrc = "scripts/amvera-run.mjs";

if (!existsSync(standaloneDir)) {
  console.error("Missing .next/standalone — run next build with output: standalone");
  process.exit(1);
}

cpSync(".next/static", join(standaloneDir, ".next/static"), { recursive: true });
cpSync("public", join(standaloneDir, "public"), { recursive: true });

if (existsSync("certs")) {
  cpSync("certs", join(standaloneDir, "certs"), { recursive: true });
}

rmSync(amveraBundleDir, { recursive: true, force: true });
cpSync(standaloneDir, amveraBundleDir, { recursive: true });

if (!existsSync(amveraRunSrc)) {
  console.error("Missing", amveraRunSrc);
  process.exit(1);
}
cpSync(amveraRunSrc, join(amveraBundleDir, "run.mjs"));

console.log("Standalone bundle prepared →", amveraBundleDir, "+ run.mjs");
