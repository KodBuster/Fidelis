import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

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

// Turbopack's .next/node_modules aliases may be absolute symlinks into the
// build checkout's node_modules. The runtime artifact cannot depend on it.
const bundlePath = resolve(amveraBundleDir);
if (dirname(bundlePath) !== process.cwd() || bundlePath !== join(process.cwd(), "amvera-bundle")) {
  throw new Error("Refusing to replace a bundle outside the project directory");
}
rmSync(bundlePath, { recursive: true, force: true });
cpSync(standaloneDir, bundlePath, { recursive: true, dereference: true });

if (!existsSync(amveraRunSrc)) {
  console.error("Missing", amveraRunSrc);
  process.exit(1);
}
cpSync(amveraRunSrc, join(amveraBundleDir, "run.mjs"));

console.log("Standalone bundle prepared →", amveraBundleDir, "+ run.mjs");
