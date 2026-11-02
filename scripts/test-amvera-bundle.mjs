// Test the exact deployable artifact outside the checkout so source dependencies
// cannot accidentally satisfy missing runtime modules.
import assert from "node:assert/strict";
import { cpSync, lstatSync, mkdtempSync, readdirSync, readlinkSync, realpathSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const source = resolve("amvera-bundle");
function assertPortableLinks(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) {
      const link = readlinkSync(path);
      assert(!isAbsolute(link), `Absolute symlink in runtime artifact: ${relative(source, path)}`);
      const target = relative(source, realpathSync(path));
      assert(target !== ".." && !target.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) && !isAbsolute(target), `Symlink leaves runtime artifact: ${relative(source, path)}`);
    } else if (stat.isDirectory()) assertPortableLinks(path);
  }
}
assertPortableLinks(source);
const temporary = mkdtempSync(join(tmpdir(), "fidelis-amvera-bundle-"));
assert.equal(dirname(temporary), realpathSync(tmpdir()));
try {
  const bundle = join(temporary, "bundle");
  // Preserve symlinks during this test; dereferencing here would hide packaging bugs.
  cpSync(source, bundle, { recursive: true, verbatimSymlinks: true });
  const requireFromBundle = createRequire(join(bundle, ".next/server/instrumentation.js"));
  const aliases = readdirSync(join(bundle, ".next/node_modules")).filter(name => /^better-sqlite3-[a-f0-9]+$/.test(name));
  assert(aliases.length > 0, "Missing Turbopack SQLite alias");
  for (const alias of aliases) {
    const resolved = requireFromBundle.resolve(alias);
    const path = relative(bundle, resolved);
    assert(!path.startsWith("..") && !isAbsolute(path), "SQLite resolved outside the runtime artifact");
    // Load the native binary in a child process: Windows locks DLLs until that
    // process exits, even after closing the SQLite database.
    const nativeCheck = spawnSync(process.execPath, ["-e", "const Database = require(process.argv[1]); const db = new Database(':memory:'); require('node:assert/strict').equal(db.prepare('SELECT 1 AS ok').get().ok, 1); db.close();", resolved], {
      windowsHide: true, stdio: "inherit", env: { ...process.env, NODE_PATH: "" },
    });
    assert.equal(nativeCheck.status, 0, `Cannot load SQLite from artifact: ${alias}`);
  }
  console.log("PASS isolated Amvera artifact: SQLite aliases and native binary load without checkout dependencies");
  const child = spawn(process.execPath, [resolve("scripts/test-b2b-auth.mjs")], {
    windowsHide: true, stdio: "inherit",
    env: { ...process.env, NODE_PATH: "", AUTH_TEST_PRODUCTION: "1", AUTH_TEST_BUNDLE_SERVER: join(bundle, "server.js") },
  });
  const result = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
  assert.equal(result.code, 0, `Isolated Amvera smoke test failed: ${result.signal || result.code}`);
} finally {
  const checked = resolve(temporary);
  assert.equal(dirname(checked), realpathSync(tmpdir()));
  assert(checked.startsWith(join(realpathSync(tmpdir()), "fidelis-amvera-bundle-")));
  rmSync(checked, { recursive: true, force: true });
}
