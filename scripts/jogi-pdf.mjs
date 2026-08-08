/**
 * A jogi dokumentumok PDF-változatának előállítása a saját HTML-jükből.
 *
 * Miért így: a letölthető PDF eddig a Word-dokumentum „Print To PDF"
 * exportja volt, a weboldalon viszont a HTML áll. A kettő ugyanazt a szöveget
 * hordozza, csak külön kézzel — és szét is csúsztak: a HTML már a 2.1-es
 * változatnál tartott (alkatrészkereső, július 30.), a PDF viszont még a
 * 2.0-snál, mert a Word-export egy nappal korábbi volt. Egy adatkezelési
 * tájékoztatónál ez nem szépséghiba: a látogató letölti a PDF-et, és mást
 * olvas benne, mint ami az oldalon áll.
 *
 * Ezért a HTML az egyetlen forrás, a PDF pedig belőle készül. Ha a szöveg
 * változik, ez a szkript újrafuttatható, és a kettő nem tud eltérni.
 *
 * A megjelenés nem azonos a Word-ével — a HTML saját, Georgia-alapú
 * tördelését kapja, ami ugyanolyan komoly, de nem ugyanaz. Cserébe a
 * tartalom garantáltan egyezik.
 *
 * Használat:
 *   node scripts/jogi-pdf.mjs public/adatkezelesi-tajekoztato.html public/dokumentumok/blueway-adatkezelesi-tajekoztato.pdf
 */
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { statSync } from 'node:fs';
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const { chromium } = pw;

const [forras, cel] = process.argv.slice(2);
if (!forras || !cel) {
  console.error('Használat: node scripts/jogi-pdf.mjs <forrás.html> <cél.pdf>');
  process.exit(1);
}

const bongeszo = await chromium.launch();
const lap = await bongeszo.newPage();
await lap.goto(pathToFileURL(resolve(forras)).href, { waitUntil: 'networkidle' });

// A lábléc a jogi dokumentumok szokása szerint oldalszámot visz. A fejléc
// üres: a dokumentum címe az első oldalon úgyis ott áll, ismételni fölösleges.
await lap.pdf({
  path: cel,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', bottom: '20mm', left: '18mm', right: '18mm' },
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate:
    '<div style="width:100%;font:9px Georgia,serif;color:#666;padding:0 18mm;' +
    'display:flex;justify-content:space-between">' +
    '<span>Blueway Trade Kft.</span>' +
    // Egyetlen elemben az oldalszám: külön span-ekként a space-between
    // szétdobná őket a lap két végébe, és „1 … / … 10” lenne belőle.
    '<span><span class="pageNumber"></span>&nbsp;/&nbsp;<span class="totalPages"></span></span>' +
    '</div>',
});

await bongeszo.close();
console.log(`${cel}: ${statSync(cel).size} bájt`);
