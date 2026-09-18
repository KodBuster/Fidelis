import sharp from "sharp";
import fs from "fs";

const src = "public/images/fidelis_logo.jpg";
const out = "public/images/fidelis_logo_light.png";

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// Ivory for dark footer (#F7F3EE) — high contrast on #2A2422
const TR = 247;
const TG = 243;
const TB = 238;

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const isNearWhite = r > 235 && g > 235 && b > 235;
  const isLightBg = r > 210 && g > 210 && b > 210 && max - min < 25;

  if (isNearWhite) {
    data[i + 3] = 0;
    continue;
  }

  if (isLightBg) {
    const ink = 255 - max;
    data[i] = TR;
    data[i + 1] = TG;
    data[i + 2] = TB;
    data[i + 3] = Math.min(255, ink * 4);
    continue;
  }

  data[i] = TR;
  data[i + 1] = TG;
  data[i + 2] = TB;
  data[i + 3] = 255;
}

const trimmed = await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim({ threshold: 8 })
  .png()
  .toBuffer();

fs.writeFileSync(out, trimmed);
const meta = await sharp(trimmed).metadata();
console.log("wrote", out, meta.width, meta.height, "alpha", meta.hasAlpha, trimmed.length);
