import { cpSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

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
// Ship the native package explicitly under its canonical name. Runtime must not
// depend on Turbopack's hashed aliases or on the build container's dependencies.
cpSync("node_modules/better-sqlite3", join(bundlePath, "node_modules/better-sqlite3"), { recursive: true, dereference: true });
cpSync("scripts/check-runtime.mjs", join(bundlePath, "check-runtime.mjs"));
writeFileSync(join(bundlePath, "build-profile.json"), JSON.stringify({ profile: "webpack-sqlite-v2", builtAt: new Date().toISOString() }, null, 2));

if (!existsSync(amveraRunSrc)) {
  console.error("Missing", amveraRunSrc);
  process.exit(1);
}
cpSync(amveraRunSrc, join(amveraBundleDir, "run.mjs"));

// Fail the build on the build platform itself if its runtime/native dependency
// is missing, instead of shipping an artifact that crashes in instrumentation.
const check = spawnSync(process.execPath, [join(bundlePath, "check-runtime.mjs")], {
  cwd: bundlePath, stdio: "inherit", windowsHide: true,
});
if (check.error) throw check.error;
if (check.status !== 0) throw new Error("Amvera SQLite runtime preflight failed");

console.log("Standalone bundle prepared →", amveraBundleDir, "+ run.mjs");
