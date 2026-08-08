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

/**
 * A két angol változat írásmódjának őrszeme.
 *
 * Az /en/ brit (en-GB), a /us/ amerikai (en-US) — a keresőnek ezt ígéri a
 * hreflang. Az amerikai szöveg a britből származik (`localize()` írja át az
 * írásmódot), a felület szövegei viszont két külön szótárból jönnek, és ott
 * kézzel kell eltalálni. Egyszer már szétcsúszott: a brit lapokon 127-szer
 * állt „labeling" és 62-szer „fiber" — épp a szakma két alapszava, épp azon a
 * piacon, ahol „labelling"-re és „fibre"-re keresnek.
 *
 * Ezért itt, a kész kimeneten mérjük meg. Ha egy alak rossz oldalra kerül, a
 * build elhasal — a hiba nem élesedhet ki némán.
 */
const IRASMOD = [
  ['labelling', 'labeling'], ['labelled', 'labeled'], ['fibre', 'fiber'],
  ['colour', 'color'], ['coloured', 'colored'], ['centre', 'center'],
  ['centred', 'centered'], ['aluminium', 'aluminum'], ['catalogue', 'catalog'],
  ['organisation', 'organization'], ['optimise', 'optimize'],
  ['specialised', 'specialized'], ['centralised', 'centralized'],
  ['analyse', 'analyze'], ['behaviour', 'behavior'], ['licence', 'license'],
  ['siliconised', 'siliconized'], ['motorised', 'motorized'],
  ['anodised', 'anodized'], ['customisation', 'customization'],
  ['recognise', 'recognize'], ['utilise', 'utilize'], ['metre', 'meter'],
];

/** A látható szöveg — a beágyazott szkriptek ugyanezt még egyszer tartalmaznák. */
function latszoSzoveg(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ');
}

const IDEGEN = { en: 1, us: 0 }; // az /en/-en a második (amerikai) alak idegen
const irasmodGond = [];
for (const nyelv of ['en', 'us']) {
  const celok = [];
  if (existsSync(join(OUT, `${nyelv}.html`))) celok.push(join(OUT, `${nyelv}.html`));
  if (existsSync(join(OUT, nyelv))) celok.push(...(await htmlFajlok(join(OUT, nyelv))));
  for (const path of celok) {
    const szoveg = latszoSzoveg(await readFile(path, 'utf8'));
    for (const par of IRASMOD) {
      const szo = par[IDEGEN[nyelv]];
      const talalat = szoveg.match(new RegExp(`\\b${szo}\\b`, 'gi'));
      if (talalat) irasmodGond.push(`${path}: „${szo}" ${talalat.length}× (helyette: ${par[1 - IDEGEN[nyelv]]})`);
    }
  }
}
if (irasmodGond.length) {
  console.error(`finalize-static: rossz oldalon álló angol írásmód (${irasmodGond.length} eset):`);
  for (const g of irasmodGond.slice(0, 20)) console.error(`   ${g}`);
  if (irasmodGond.length > 20) console.error(`   … és még ${irasmodGond.length - 20}`);
  process.exit(1);
}
console.log('finalize-static: a brit és az amerikai lapok írásmódja rendben');
