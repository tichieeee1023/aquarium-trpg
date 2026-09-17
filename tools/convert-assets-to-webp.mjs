import { readdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const assetRoot = fileURLToPath(new URL('../public/assets/', import.meta.url));
const transforms = {
  cards: { width: 896, height: 1200 },
  characters: { width: 768, height: 768 },
  items: { width: 652, height: 337 },
  scenes: { width: 1536, height: 858 },
};

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.flatMap((entry) => entry.isFile() ? [join(directory, entry.name)] : []);
}

for (const [folder, size] of Object.entries(transforms)) {
  const directory = join(assetRoot, folder);
  const sourceFiles = (await filesIn(directory)).filter((file) => /\.(png|jpe?g|jfif)$/i.test(file));
  for (const source of sourceFiles) {
    const { dir, name } = parse(source);
    const target = join(dir, `${name}.webp`);
    await sharp(source)
      .resize({ ...size, fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 82, effort: 6, smartSubsample: true })
      .toFile(target);
    const [before, after] = await Promise.all([stat(source), stat(target)]);
    console.log(`${source} → ${target}: ${before.size} B → ${after.size} B`);
  }
}
