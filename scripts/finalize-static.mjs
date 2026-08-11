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

// Rekurzívan, nem csak a gyökérszinten. Ma mindhárom jelölős fájl a
// gyökérben áll, de ha egy újabb kézzel írt HTML almappába kerülne (pl.
// dokumentumok/ alá), a csak-gyökér lista némán átlépné, és a lap a
// __SITE_URL__ jelölővel a szövegében menne élesbe.
const files = await htmlFajlok(OUT);
let touched = 0;

for (const path of files) {
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
  ['analyse', 'analyze'], ['behaviour', 'behavior'],
  ['siliconised', 'siliconized'], ['motorised', 'motorized'],
  ['anodised', 'anodized'], ['customisation', 'customization'],
  ['recognise', 'recognize'], ['utilise', 'utilize'],
  // A „metre/meter" és a „licence/license" pár SZÁNDÉKOSAN nincs itt, pedig
  // az átíró szótár (products.ts) kezeli őket. Ez az őrszem kétélű szavaknál
  // hamisan riaszt: a mérőműszer neve BRIT szövegben is „meter" (flow meter),
  // és a „license" igeként brit helyesírással is így írandó — egy szabályos
  // brit mondat buktatta volna el a buildet. Az átírónak jók (brit főnév →
  // amerikai alak iránya egyértelmű), őrszemnek nem.
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

/**
 * Az űrlap és a szerver ugyanarról gondolja-e ugyanazt.
 *
 * A csatolmány szabályai két nyelven, két fájlban élnek: a böngészőé
 * TypeScriptben, a szerveré PHP-ban. Importálni nem tudják egymást, tehát
 * csak fegyelem tartaná őket együtt — az pedig egyszer már elfogyott. A
 * méretkorlát öt helyen szerepelt, és kettőben elcsúszott: a látogató
 * feltöltött nyolc megabájtot, a képernyőn közben ott állt a „legfeljebb
 * 7 MB", a szerver pedig visszautasította.
 *
 * Ezért itt, a kész kimeneten vetjük össze a kettőt. Ha eltérnek, a build
 * elhasal — a szétcsúszás nem élesedhet ki némán.
 */
const php = await readFile('server/send.php', 'utf8');
const ts = await readFile('src/lib/csatolmany.ts', 'utf8');

const phpMeret = php.match(/const MAX_TOTAL_SIZE\s*=\s*(\d+)\s*\*\s*1024\s*\*\s*1024/);
const tsMeret = ts.match(/export const MAX_CSATOLMANY\s*=\s*(\d+)\s*\*\s*1024\s*\*\s*1024/);
const urlapGond = [];
if (!phpMeret || !tsMeret) {
  urlapGond.push('a méretkorlát nem olvasható ki (elmozdult a send.php vagy a csatolmany.ts?)');
} else if (phpMeret[1] !== tsMeret[1]) {
  urlapGond.push(`méretkorlát: a böngésző ${tsMeret[1]} MB-ot enged, a szerver ${phpMeret[1]} MB-ot fogad`);
}

// A fájlválasztó kiterjesztései szerepelnek-e a szerver listáján. Az
// `image/*` nem ellenőrizhető gépileg — az böngészőnként mást jelent —,
// a pontosan megnevezett kiterjesztések viszont igen.
const engedett = new Set(
  (php.match(/const ALLOWED_EXT\s*=\s*\[([\s\S]*?)\]/)?.[1] ?? '')
    .match(/'([a-z0-9]+)'/g)
    ?.map((s) => s.replace(/'/g, '')) ?? [],
);
const kertek = new Set();
for (const path of await htmlFajlok(OUT)) {
  for (const m of (await readFile(path, 'utf8')).matchAll(/accept="([^"]+)"/g)) {
    for (const rész of m[1].split(',')) {
      const t = rész.trim();
      if (t.startsWith('.')) kertek.add(t.slice(1).toLowerCase());
    }
  }
}
const hianyzo = [...kertek].filter((k) => !engedett.has(k));
if (hianyzo.length) {
  urlapGond.push(`a fájlválasztó elfogadja, a szerver nem: .${hianyzo.join(', .')}`);
}

if (urlapGond.length) {
  console.error('finalize-static: az űrlap és a szerver nem ugyanazt mondja:');
  for (const g of urlapGond) console.error(`   ${g}`);
  process.exit(1);
}
console.log(
  `finalize-static: a csatolmány szabályai egyeznek (${tsMeret[1]} MB, ` +
    `${engedett.size} engedett kiterjesztés)`,
);
