import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const appDir = path.join(root, "src", "app");
const sourcePath =
  process.argv[2] ||
  "C:/Users/Дмитрий/.cursor/projects/c-Users-Desktop/assets/fidelis-favicon-phi.png";

async function makeTransparent(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Near-white / cream background → transparent
    if (r > 230 && g > 230 && b > 230) {
      data[i + 3] = 0;
      continue;
    }
    // Soft anti-aliased cream fringe
    if (r > 200 && g > 190 && b > 190 && r - b < 40) {
      const whiteness = Math.min(r, g, b);
      const alpha = Math.max(0, Math.min(255, Math.round((255 - whiteness) * 3.2)));
      data[i + 3] = alpha;
      // Push remaining ink toward brand burgundy
      data[i] = 139;
      data[i + 1] = 30;
      data[i + 2] = 63;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 10 })
    .png();
}

async function resizePng(pipeline, size, paddingRatio = 0.08, background = null) {
  const padded = Math.round(size * (1 - paddingRatio * 2));
  const letter = await pipeline
    .clone()
    .resize(padded, padded, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: letter, gravity: "centre" }])
    .png()
    .toBuffer();
}

const base = await makeTransparent(sourcePath);
const masterBuf = await base.png().toBuffer();
const master = sharp(masterBuf);

const outputs = [
  ["favicon-16x16.png", 16, 0.1, null],
  ["favicon-32x32.png", 32, 0.1, null],
  ["favicon-48x48.png", 48, 0.08, null],
  [
    "apple-touch-icon.png",
    180,
    0.12,
    { r: 247, g: 243, b: 238, alpha: 255 },
  ],
];

for (const [name, size, pad, bg] of outputs) {
  const buf = await resizePng(master, size, pad, bg);
  fs.writeFileSync(path.join(publicDir, name), buf);
  console.log(name, buf.length);
}

const icon32 = await resizePng(master, 32, 0.1);
fs.writeFileSync(path.join(appDir, "icon.png"), icon32);
console.log("src/app/icon.png", icon32.length);

const hi = await resizePng(master, 512, 0.06);
fs.writeFileSync(path.join(publicDir, "images", "fidelis-favicon.png"), hi);
console.log("images/fidelis-favicon.png", hi.length);

// Build multi-size ICO manually (PNG-compressed ICO entries)
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (const buf of pngBuffers) {
    const meta = { buf, offset, size: buf.length };
    entries.push(meta);
    offset += buf.length;
  }
  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);
  entries.forEach((e, i) => {
    const o = 6 + i * 16;
    out[o] = 0; // width 0 => 256
    out[o + 1] = 0; // height 0 => 256
    out[o + 2] = 0;
    out[o + 3] = 0;
    out.writeUInt16LE(1, o + 4);
    out.writeUInt16LE(32, o + 6);
    out.writeUInt32LE(e.size, o + 8);
    out.writeUInt32LE(e.offset, o + 12);
    e.buf.copy(out, e.offset);
  });
  // Fix width/height bytes for each size — need actual dimensions
  return out;
}

const png16 = await resizePng(master, 16, 0.1);
const png32 = await resizePng(master, 32, 0.1);
const png48 = await resizePng(master, 48, 0.08);

function createIcoWithSizes(items) {
  const count = items.length;
  let offset = 6 + count * 16;
  const total = offset + items.reduce((s, i) => s + i.buf.length, 0);
  const out = Buffer.alloc(total);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);
  items.forEach((item, i) => {
    const o = 6 + i * 16;
    out[o] = item.size >= 256 ? 0 : item.size;
    out[o + 1] = item.size >= 256 ? 0 : item.size;
    out[o + 2] = 0;
    out[o + 3] = 0;
    out.writeUInt16LE(1, o + 4);
    out.writeUInt16LE(32, o + 6);
    out.writeUInt32LE(item.buf.length, o + 8);
    out.writeUInt32LE(offset, o + 12);
    item.buf.copy(out, offset);
    offset += item.buf.length;
  });
  return out;
}

const ico = createIcoWithSizes([
  { size: 16, buf: png16 },
  { size: 32, buf: png32 },
  { size: 48, buf: png48 },
]);
fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico);
console.log("favicon.ico", ico.length);
