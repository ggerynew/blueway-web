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
import { HREFLANG, locales } from '../src/lib/i18n';

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

/**
 * A <html lang> attribútum nyelvenként.
 *
 * A gyökér-elrendezés minden lapra lang="hu"-t ír, mert a nyelv a [lang]
 * szegmensben dől el, ami a gyökér ALATT van — futásidőben egy kliensoldali
 * szkript állítja át a helyeset. A JavaScript nélküli olvasók (keresőrobotok
 * egy része, felolvasók az első pillanatban, fordítóeszközök) viszont a
 * statikus HTML-t látják, abban pedig a német és a kínai lap is magyarnak
 * vallotta magát. Itt, a kész kimeneten írjuk át — a fájl útvonala pontosan
 * megmondja a nyelvet. A kliensoldali szkript marad: átírás után ártalmatlan.
 *
 * A nyelvek listája és a kiírt címke a szótárból jön, nem kézzel felsorolva:
 * korábban itt egy másolat állt, és egy új nyelv hozzáadásakor némán kimaradt
 * volna belőle. A mappanév és a nyelvi címke nem ugyanaz — a `us` mappa
 * tartalma `en-US`, az `en`-é `en-GB` —, ezért a HREFLANG táblán megy át.
 */
const NYELVEK = locales;

async function htmlFajlok(mappa) {
  const bejegyzesek = await readdir(mappa, { withFileTypes: true });
  const lista = [];
  for (const b of bejegyzesek) {
    const teljes = join(mappa, b.name);
    if (b.isDirectory()) lista.push(...(await htmlFajlok(teljes)));
    else if (b.name.endsWith('.html')) lista.push(teljes);
  }
  return lista;
}

let nyelvesitett = 0;
for (const nyelv of NYELVEK) {
  const celok = [];
  if (existsSync(join(OUT, `${nyelv}.html`))) celok.push(join(OUT, `${nyelv}.html`));
  if (existsSync(join(OUT, nyelv))) celok.push(...(await htmlFajlok(join(OUT, nyelv))));
  for (const path of celok) {
    const html = await readFile(path, 'utf8');
    const csere = html.replace(/<html lang="hu"/, `<html lang="${HREFLANG[nyelv]}"`);
    if (csere !== html) {
      await writeFile(path, csere);
      nyelvesitett += 1;
    }
  }
}
console.log(`finalize-static: ${nyelvesitett} lap kapott saját <html lang> értéket`);
