/**
 * Statikus export utómunka.
 *
 * A public/ mappában lévő kézzel írt HTML-oldalak (ÁSZF, adatkezelési
 * tájékoztató) változtatás nélkül kerülnek az out/ mappába — a Next.js
 * metadata-kezelése nem nyúl hozzájuk, így a bennük lévő kanonikus URL nem
 * követi a domaint. Ezért `__SITE_URL__` jelölőt írunk beléjük, és itt
 * cseréljük ki a tényleges címre. Költözés után így nem marad bennük a régi
 * GitHub Pages-cím, ami a keresőnek azt üzenné, hogy az oldal ott lakik.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
const TOKEN = '__SITE_URL__';

if (!existsSync(OUT)) {
  // Nem statikus build (pl. `next dev` vagy szerveres build) — nincs teendő.
  process.exit(0);
}

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  `https://ggerynew.github.io${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}`
).replace(/\/$/, '');

const files = (await readdir(OUT)).filter((f) => f.endsWith('.html'));
let touched = 0;

for (const file of files) {
  const path = join(OUT, file);
  const html = await readFile(path, 'utf8');
  if (!html.includes(TOKEN)) continue;
  await writeFile(path, html.replaceAll(TOKEN, siteUrl));
  touched += 1;
}

console.log(`finalize-static: ${touched} file(s) rewritten to ${siteUrl}`);
