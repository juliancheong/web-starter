import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RAW_DIR = './raw_assets';
const TARGET_DIR = './public/assets/images';

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const files = fs.readdirSync(RAW_DIR).filter(f => /\.(png|jpe?g|webp)$/i.test(f));

if (files.length === 0) {
  console.log('No raw assets found in ./raw_assets/');
  process.exit(0);
}

for (const file of files) {
  const inputPath = path.join(RAW_DIR, file);
  const baseName = path.parse(file).name.toLowerCase();
  const outputPath = path.join(TARGET_DIR, `${baseName}.webp`);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Chroma Key: Target solid #00FF00 green
    if (g > 150 && g > r * 1.35 && g > b * 1.35) {
      data[i + 3] = 0; // Make transparent
    } else {
      // Defringe / Despill: Neutralize lime-green edge bleed
      data[i + 1] = Math.min(g, Math.floor((r + b) / 1.6));
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(outputPath);

  console.log(`✓ Processed & Defringed: ${file} -> ${outputPath}`);
}