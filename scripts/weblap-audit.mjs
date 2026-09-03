/**
 * Az elkészült (out/) weblap átvizsgálása: hivatkozások, SEO, ábrák, súly.
 *
 * MIÉRT A KIMENETET NÉZI, ÉS NEM A FORRÁST
 *   A forrásban minden hivatkozás egy változó. Hogy a 909 lap közül melyiken
 *   mire mutat, csak a legenerált HTML mondja meg — és a látogató is azt kapja.
 *   Egy elgépelt képútvonal a forráson végignézve nem tűnik fel, a kimeneten
 *   viszont hiányzó fájl.
 *
 * AMIT KORÁBBAN ELRONTOTTAM, ÉS AMIÉRT ITT KÜLÖN FIGYELEM
 *   Egy korábbi, kapkodva írt változat 14 000 hamis hibát jelentett. Két oka
 *   volt, mindkettő ide van építve:
 *     1. A kiterjesztés nélküli címek (…/tudastar/rfid-cimkek) mellett létezik
 *        AZONOS NEVŰ MAPPA is (…/tudastar/rfid-cimkek/). A régi ellenőrző a
 *        mappát látta meg előbb, és „megvan"-nak vette, holott a lapot a
 *        .html fájl szolgálja ki. Itt a sorrend fordított: előbb a .html.
 *     2. A címeket URL-dekódolni kell. A %5Blang%5D nem hiányzó fájl, hanem
 *        egy [lang] nevű mappa — csak épp kódolva.
 *   A tanulság általánosan: a hibalistát ELŐBB kell ellenőrizni, mint jelenteni.
 *
 * Futtatás a projekt gyökeréből (előbb npm run build:live):
 *   node scripts/weblap-audit.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
const CIM = 'https://blueway.hu';
const NYELVEK = ['hu', 'en', 'us', 'de', 'it', 'es', 'ko', 'zh'];
const HREFLANG = { hu: 'hu', en: 'en-GB', us: 'en-US', de: 'de', it: 'it', es: 'es', ko: 'ko', zh: 'zh' };

const hibak = [];
const figyelmek = [];
const baj = (lap, uzenet) => hibak.push(`${lap}: ${uzenet}`);
const figyelem = (lap, uzenet) => figyelmek.push(`${lap}: ${uzenet}`);

// ——————————————————————————————————————————————————————————————
// Fájlok
// ——————————————————————————————————————————————————————————————
function fajlok(mappa, szuro) {
  const ki = [];
  for (const nev of readdirSync(mappa)) {
    const ut = join(mappa, nev);
    if (statSync(ut).isDirectory()) ki.push(...fajlok(ut, szuro));
    else if (szuro(nev)) ki.push(ut);
  }
  return ki;
}

const lapok = fajlok(OUT, (n) => n.endsWith('.html')).sort();
const lapCim = (ut) => '/' + ut.slice(OUT.length + 1);

/** Megvan-e a hivatkozott cím a kimenetben? Lásd a fenti 1. pontot. */
const megvanGyorsitotar = new Map();
function megvan(utvonal) {
  if (megvanGyorsitotar.has(utvonal)) return megvanGyorsitotar.get(utvonal);
  const p = join(OUT, utvonal);
  const eredmeny =
    (existsSync(p + '.html') && statSync(p + '.html').isFile()) ||
    (existsSync(p) && statSync(p).isFile()) ||
    (existsSync(join(p, 'index.html')));
  megvanGyorsitotar.set(utvonal, eredmeny);
  return eredmeny;
}

// ——————————————————————————————————————————————————————————————
// Kis HTML-olvasók. Nem teljes elemző: pontosan azt keresi, amit kell.
// ——————————————————————————————————————————————————————————————
const attr = (cimke, nev) => {
  const m = cimke.match(new RegExp(`\\s${nev}="([^"]*)"`, 'i'));
  return m ? m[1] : null;
};
const cimkek = (html, nev) => html.match(new RegExp(`<${nev}\\b[^>]*>`, 'gi')) ?? [];
/**
 * Szöveghossz a keresőtalálat szempontjából.
 *
 * A puszta karakterszám a koreai és a kínai lapokat hamisan bukatja el: ott egy
 * teljes mondat 45 jegy, ami a latin írás 100+ karakterének felel meg — a
 * találati listában viszont a jegyek szélessége számít, nem a darabszámuk. A
 * CJK-jegyeket ezért kétszeresen vesszük.
 */
const hosszSuly = (t) => [...t].reduce((s, j) => s + (j.codePointAt(0) > 0x2E80 ? 2 : 1), 0);

const szoveg = (html, nev) => {
  const m = html.match(new RegExp(`<${nev}[^>]*>([\\s\\S]*?)</${nev}>`, 'i'));
  return m ? m[1].replace(/<[^>]*>/g, '').trim() : null;
};

// ——————————————————————————————————————————————————————————————
// Lapok átvizsgálása
// ——————————————————————————————————————————————————————————————
const cimek = new Map();       // cím → lapok
const leirasok = new Map();    // leírás → lapok
const sulyok = [];

for (const ut of lapok) {
  const lap = lapCim(ut);
  const html = readFileSync(ut, 'utf8');
  const nyelv = lap.slice(1).split('/')[0].replace(/\.html$/, '');
  const negyszaznegy = lap === '/404.html';
  sulyok.push([lap, Buffer.byteLength(html)]);

  // — hivatkozott helyi fájlok
  // A videósáv klipjei NEM <source src>-ban élnek, hanem data-* attribútumban
  // (a forrásválasztást a kliens végzi csempeszélesség szerint), a állókép
  // pedig poster attribútumban. Az első változat egyiket sem nézte, tehát egy
  // elgépelt klipnév az auditon átcsúszott, és a csempe élesben megfagyott
  // poszterként állt volna — pont a néma hibamód, amit a telepítés
  // videoellenőrzése miatt már egyszer megtanultunk.
  const hivatkozasok = [
    ...[...html.matchAll(/<(?:img|source|script)[^>]*\ssrc="([^"]+)"/gi)].map((m) => m[1]),
    ...[...html.matchAll(/<link[^>]*\shref="([^"]+)"/gi)].map((m) => m[1]),
    ...[...html.matchAll(/<a[^>]*\shref="([^"]+)"/gi)].map((m) => m[1]),
    ...[...html.matchAll(/\sposter="([^"]+)"/gi)].map((m) => m[1]),
    ...[...html.matchAll(/\sdata-(?:kicsi-)?(?:mp4|webm)="([^"]+)"/gi)].map((m) => m[1]),
  ];
  for (const nyers of hivatkozasok) {
    if (!nyers.startsWith('/')) continue;                 // külső vagy horgony
    const cim = decodeURIComponent(nyers.split('#')[0].split('?')[0]);
    if (!cim || cim === '/') continue;
    if (!megvan(cim.slice(1))) baj(lap, `hiányzó cél: ${nyers}`);
  }

  if (negyszaznegy) continue;                             // a 404-re a többi nem áll

  // — cím és leírás
  const cim = szoveg(html, 'title');
  if (!cim) baj(lap, 'nincs <title>');
  else {
    if (hosszSuly(cim) > 65) figyelem(lap, `hosszú cím (${hosszSuly(cim)}): ${cim}`);
    if (hosszSuly(cim) < 15) baj(lap, `túl rövid cím (${hosszSuly(cim)}): ${cim}`);
    const k = `${nyelv}\u0000${cim}`;
    (cimek.get(k) ?? cimek.set(k, []).get(k)).push(lap);
  }
  const leiras = cimkek(html, 'meta')
    .filter((c) => attr(c, 'name') === 'description')
    .map((c) => attr(c, 'content'))[0];
  if (!leiras) baj(lap, 'nincs meta description');
  else {
    if (hosszSuly(leiras) > 165) figyelem(lap, `hosszú leírás (${hosszSuly(leiras)})`);
    if (hosszSuly(leiras) < 50) figyelem(lap, `rövid leírás (${hosszSuly(leiras)})`);
    const kl = `${nyelv}\u0000${leiras}`;
    (leirasok.get(kl) ?? leirasok.set(kl, []).get(kl)).push(lap);
  }

  // — kanonikus cím
  const kanon = cimkek(html, 'link')
    .filter((c) => attr(c, 'rel') === 'canonical')
    .map((c) => attr(c, 'href'))[0];
  if (!kanon) baj(lap, 'nincs canonical');
  else if (!kanon.startsWith(CIM)) baj(lap, `a canonical nem az éles címre mutat: ${kanon}`);

  // — hreflang
  const alternatek = cimkek(html, 'link')
    .filter((c) => attr(c, 'rel') === 'alternate' && attr(c, 'hreflang'))
    .map((c) => [attr(c, 'hreflang'), attr(c, 'href')]);
  const nyelvkodok = new Set(alternatek.map(([k]) => k));
  // A nyolc nyelvet csak a NYELVI lapoktól (/hu/…, /de/…) várjuk el. A jogi
  // lapok kézzel írt HTML-ek a public mappából, és két nyelven léteznek —
  // rájuk nyolc hreflangot kérni nem szigorúság, hanem hiba: nem létező
  // lapokra mutatnának. Náluk az a követelmény, hogy amit kijelentenek, az
  // igaz legyen (a hivatkozott lap létezzen), és legyen x-default.
  const nyelviLap = NYELVEK.includes(nyelv);
  if (nyelviLap) {
    for (const n of NYELVEK) {
      if (!nyelvkodok.has(HREFLANG[n])) baj(lap, `hiányzó hreflang: ${HREFLANG[n]}`);
    }
  }
  if (alternatek.length && !nyelvkodok.has('x-default')) baj(lap, 'hiányzó x-default');
  for (const [, href] of alternatek) {
    if (!href?.startsWith(CIM)) { baj(lap, `rossz hreflang-cím: ${href}`); continue; }
    const p = decodeURIComponent(href.slice(CIM.length)) || '/';
    if (p !== '/' && !megvan(p.slice(1))) baj(lap, `hreflang nem létező lapra: ${href}`);
  }

  // — h1
  const h1 = html.match(/<h1\b/gi)?.length ?? 0;
  if (h1 === 0) baj(lap, 'nincs h1');
  else if (h1 > 1) baj(lap, `${h1} darab h1`);

  // — képek alt nélkül
  //
  // Az ÜRES alt nem hiba, hanem a díszítő kép helyes jelölése: a képernyőolvasó
  // átugorja. A hiányzó alt viszont hiba — ott a felolvasó a fájlnevet mondja
  // ki. A csempefal 480 képe szándékosan üres alt-tal áll, mert a nevet a
  // körülölelő hivatkozás aria-label-je adja; a régi változat ezért jelentett
  // 480 „hibát”, amiből egy se volt az.
  for (const kep of cimkek(html, 'img')) {
    if (attr(kep, 'aria-hidden') === 'true') continue;
    if (attr(kep, 'alt') === null) baj(lap, `alt nélküli kép: ${attr(kep, 'src')}`);
  }

  // — névtelen hivatkozás: ez az, ami az üres alt mellett tényleg elromolhat.
  // Ha egy link belsejében csak kép van, üres alt-tal, és a linknek nincs
  // aria-label/title-je, akkor a képernyőolvasónak nincs mit felolvasnia.
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const [, fej, belso] = m;
    if (/\saria-hidden="true"/.test(fej)) continue;
    const nev =
      (attr(`<a${fej}>`, 'aria-label') ?? '').trim() ||
      (attr(`<a${fej}>`, 'title') ?? '').trim() ||
      belso.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim() ||
      (belso.match(/<img[^>]*\salt="([^"]+)"/i)?.[1] ?? '').trim();
    if (!nev) baj(lap, `névtelen hivatkozás: ${attr(`<a${fej}>`, 'href')}`);
  }

  // — html lang
  const langAttr = html.match(/<html[^>]*\slang="([^"]*)"/i)?.[1];
  if (langAttr !== HREFLANG[nyelv] && NYELVEK.includes(nyelv)) {
    baj(lap, `a <html lang> ${langAttr}, kellene: ${HREFLANG[nyelv]}`);
  }

  // — szerkezeti adatok
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    let adat;
    try {
      adat = JSON.parse(m[1]);
    } catch (e) {
      baj(lap, `hibás JSON-LD: ${e.message}`);
      continue;
    }
    const elemek = adat['@graph'] ?? [adat];
    for (const e of elemek) {
      if (!e['@type']) baj(lap, 'JSON-LD @type nélkül');
      if (e['@type'] === 'BreadcrumbList' && !e.itemListElement?.length) {
        baj(lap, 'üres BreadcrumbList');
      }
    }
    if (!JSON.stringify(adat).includes('"@context"')) baj(lap, 'JSON-LD @context nélkül');
  }

  // — ismétlődő azonosítók
  const idk = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const ismet = idk.filter((x, i) => idk.indexOf(x) !== i);
  if (ismet.length) baj(lap, `ismétlődő id: ${[...new Set(ismet)].join(', ')}`);
}

// ——————————————————————————————————————————————————————————————
// Sitemap és robots
// ——————————————————————————————————————————————————————————————
// A sitemap és a robots hiánya nem kivétel, hanem lelet: a hiányukat is
// hibaként kell jelenteni, nem összeomlással.
if (!existsSync(join(OUT, 'sitemap.xml'))) baj('sitemap.xml', 'a fájl HIÁNYZIK a kimenetből');
if (!existsSync(join(OUT, 'robots.txt'))) baj('robots.txt', 'a fájl HIÁNYZIK a kimenetből');
const sitemap = existsSync(join(OUT, 'sitemap.xml'))
  ? readFileSync(join(OUT, 'sitemap.xml'), 'utf8')
  : '';
const smCimek = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const smHalmaz = new Set(smCimek);
for (const c of smCimek) {
  const p = decodeURIComponent(c.slice(CIM.length)) || '/';
  if (p !== '/' && !megvan(p.slice(1))) baj('sitemap.xml', `nem létező lapra mutat: ${c}`);
}
for (const ut of lapok) {
  const lap = lapCim(ut);
  if (lap === '/404.html' || lap === '/index.html') continue;
  // A jogi lapok kiterjesztéssel szerepelnek a sitemapban (kézzel írt HTML-ek
  // a public mappából), a Next-lapok kiterjesztés nélkül. Mindkettőt elfogadjuk.
  const nyers = CIM + '/' + lap.slice(1);
  const cim = CIM + '/' + lap.slice(1).replace(/\.html$/, '');
  const gyoker = cim.replace(/\/index$/, '');
  if (![nyers, cim, gyoker].some((c) => smHalmaz.has(c))) figyelem('sitemap.xml', `hiányzó lap: ${lap}`);
}
const robots = existsSync(join(OUT, 'robots.txt'))
  ? readFileSync(join(OUT, 'robots.txt'), 'utf8')
  : '';
if (!robots.includes('Sitemap:')) baj('robots.txt', 'nincs Sitemap sor');
if (/^Disallow:\s*\/\s*$/m.test(robots)) baj('robots.txt', 'a teljes weblap tiltva van');

// ——————————————————————————————————————————————————————————————
// GEO: mit lát a gépi olvasó
// ——————————————————————————————————————————————————————————————
for (const f of ['llms.txt', 'llms-full.txt', 'ai/termekek.json', 'alkatreszek.json']) {
  if (!existsSync(join(OUT, f))) figyelem('GEO', `hiányzó fájl: ${f}`);
}
const llms = existsSync(join(OUT, 'llms.txt')) ? readFileSync(join(OUT, 'llms.txt'), 'utf8') : '';

// Az AI-fájlok minden saját hivatkozása élő lapra mutasson. Ezeket a linkeket
// nem a böngésző követi, hanem egy válaszmotor idézi a felhasználónak — egy
// halott hivatkozás ott nem 404-es lap, hanem hamis állítás a nevünkben. A
// gazdanév a sitemapből jön, hogy a próba- és az éles build egyaránt működjön.
const gazda = smCimek[0]?.match(/^https?:\/\/[^/]+\//)?.[0];
if (gazda) {
  for (const f of ['llms.txt', 'llms-full.txt', 'ai/termekek.json']) {
    if (!existsSync(join(OUT, f))) continue;
    const szoveg = readFileSync(join(OUT, f), 'utf8');
    const minta = new RegExp(gazda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\s)\\]"<>]+', 'g');
    const cimek = new Set([...szoveg.matchAll(minta)].map((m) => m[0]));
    let halott = 0;
    for (const c of cimek) {
      const ut = c.slice(gazda.length).split('#')[0];
      if (!ut) continue;
      const van = [ut, `${ut}.html`, `${ut.replace(/\/$/, '')}/index.html`].some((j) =>
        existsSync(join(OUT, j)),
      );
      if (!van) {
        halott++;
        if (halott <= 5) baj(f, `halott hivatkozás: ${c}`);
      }
    }
    if (halott > 5) baj(f, `… és még ${halott - 5} halott hivatkozás`);
  }
}

// ——————————————————————————————————————————————————————————————
// Súly: a legnehezebb lapok, és a hivatkozott eszközök mérete
// ——————————————————————————————————————————————————————————————
sulyok.sort((a, b) => b[1] - a[1]);
const eszkozok = fajlok(join(OUT, 'images'), () => true)
  .map((u) => [u.slice(OUT.length), statSync(u).size])
  .sort((a, b) => b[1] - a[1]);

// ——————————————————————————————————————————————————————————————
// Jelentés
// ——————————————————————————————————————————————————————————————
const kb = (b) => `${(b / 1024).toFixed(0)} kB`;
console.log(`Átvizsgálva: ${lapok.length} lap, ${smCimek.length} sitemap-cím, ${eszkozok.length} kép\n`);

console.log(`HIBA (${hibak.length})`);
for (const h of hibak.slice(0, 60)) console.log('  ✗ ' + h);
if (hibak.length > 60) console.log(`  … és még ${hibak.length - 60}`);

console.log(`\nFIGYELEM (${figyelmek.length})`);
const csoport = new Map();
for (const f of figyelmek) {
  const kulcs = f.slice(f.indexOf(': ') + 2).replace(/\(\d+\)/, '(n)').split(':')[0].trim();
  (csoport.get(kulcs) ?? csoport.set(kulcs, []).get(kulcs)).push(f);
}
for (const [k, lista] of [...csoport].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  • ${k} — ${lista.length}`);
  for (const p of lista.slice(0, 3)) console.log(`      ${p}`);
}

// Az ismétlődést NYELVENKÉNT nézzük. Két nyelvi változat azonos címe nem hiba
// — a hreflang épp azt mondja meg a keresőnek, hogy ugyanannak a lapnak a más
// nyelvű kiadásai. Bajt az okoz, ha EGY nyelven belül két külön lap ugyanazt
// a címet vagy leírást viseli: ott a kereső nem tudja, melyiket mutassa.
const ismetCim = [...cimek].filter(([, l]) => l.length > 1);
console.log(`\nEGY NYELVEN BELÜL ISMÉTLŐDŐ CÍM: ${ismetCim.length}`);
for (const [c, l] of ismetCim.slice(0, 12)) {
  console.log(`  • [${c.split('\u0000')[0]}] „${c.split('\u0000')[1]}" — ${l.length}: ${l.join(', ')}`);
}
const ismetLeiras = [...leirasok].filter(([, l]) => l.length > 1);
console.log(`EGY NYELVEN BELÜL ISMÉTLŐDŐ LEÍRÁS: ${ismetLeiras.length}`);
for (const [c, l] of ismetLeiras.slice(0, 12)) {
  console.log(`  • [${c.split('\u0000')[0]}] „${c.split('\u0000')[1].slice(0, 70)}…" — ${l.length}: ${l.slice(0, 4).join(', ')}`);
}

console.log('\nLEGNEHEZEBB LAPOK');
for (const [l, s] of sulyok.slice(0, 8)) console.log(`  ${kb(s).padStart(8)}  ${l}`);
console.log('\nLEGNAGYOBB KÉPEK');
for (const [f, s] of eszkozok.slice(0, 8)) console.log(`  ${kb(s).padStart(8)}  ${f}`);
console.log(`\nllms.txt: ${kb(llms.length)}, ${llms.split('\n').length} sor`);

process.exit(hibak.length ? 1 : 0);
