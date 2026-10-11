import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const standaloneDir = ".next/standalone";
/** Нескрытая папка для Amvera (в UI можно указать только один ключ artifacts). */
const amveraBundleDir = "amvera-bundle";

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

console.log("Standalone bundle prepared →", amveraBundleDir);
