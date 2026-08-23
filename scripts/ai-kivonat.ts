/**
 * Gépi fogyasztásra szánt kivonatok a weblap adataiból — az „AI-optimalizált"
 * réteg. Három fájlt ír a buildelt kimenetbe (out/):
 *
 *   /llms.txt          — tömör, jegyzetelt térkép az llms.txt szabvány szerint
 *                        (llmstxt.org): mi ez az oldal, mi hol van, hova
 *                        érdemes menni. Ezt olvassa el egy AI először.
 *   /llms-full.txt     — a teljes érdemi tartalom egyetlen markdown fájlban:
 *                        minden termék adata, az iparági oldalak és a Tudástár
 *                        összes útmutatója, magyarul és angolul. Ebből egy AI
 *                        kérdezés nélkül, böngészés nélkül tud válaszolni.
 *   /ai/termekek.json  — a termékkatalógus szerkezetes adatként (név, márka,
 *                        kategória, jellemzők, változatok, adatlap-URL, oldal-
 *                        URL nyelvenként) és az iparági hozzárendelés mindkét
 *                        irányban — ügynököknek, összehasonlítóknak.
 *
 * A forrás ugyanaz a három adatfájl, amiből a weblap is épül — tehát nem
 * eshet szét a kettő. Futtatás a build után (a package.json build lépésében):
 *
 *   node --experimental-strip-types --import ./scripts/ts-betolto.mjs scripts/ai-kivonat.ts
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';

import { terms, termsByTheme } from '../src/lib/fogalomtar';
import { getDictionary, locales, type Locale } from '../src/lib/i18n';
import { industries, industriesForProduct } from '../src/lib/iparagak';
import { guides } from '../src/lib/knowledge';
import {
  categories,
  manufacturers,
  productName,
  products,
  type Product,
} from '../src/lib/products';

const BAZIS = process.env.NEXT_PUBLIC_SITE_URL || 'https://blueway.hu';

const url = (ut: string) => `${BAZIS}/${ut.replace(/^\/+/, '')}`;
const hu = getDictionary('hu');
const en = getDictionary('en');

/**
 * Az alkatrészindex fejléce a jegyzékhez — csak a darabszámok kellenek belőle.
 * Ha a fájl nincs meg (mert az alkatresz-index.py még nem futott), a sor
 * kimarad: jobb hiányozni, mint rossz számot állítani.
 */
const alkatreszek: { gepek: unknown[]; csoportok: unknown[] } | null = existsSync(
  'public/alkatreszek.json',
)
  ? JSON.parse(readFileSync('public/alkatreszek.json', 'utf8'))
  : null;

const kategoriaNev = (slug: string, lang: Locale) =>
  categories.find((c) => c.slug === slug)?.name[lang] ?? slug;

const termekUrl = (p: Product, lang: Locale) =>
  url(`${lang}/termekek/${p.category}/${p.slug}`);

// ——— /llms.txt — a térkép ————————————————————————————————————————
function llms(): string {
  const s: string[] = [];
  s.push('# Blueway Trade Kft.');
  s.push('');
  s.push(
    '> Magyar termékjelölési és címkézési szakvállalat: ipari címkenyomtatók, ' +
      'nyomtató-felrakó (print & apply) rendszerek, lézeres jelölők, címke- és ' +
      'ragasztószalag-adagolók, füstelszívók, címkék és festékszalagok — ' +
      'tanácsadással, telepítéssel, szervizzel és alkatrészellátással. ' +
      'Forgalmazott gyártók: CAB, POSTEK, TYKMA Electrox, DNP, ARMOR-IIMAK, ' +
      'START International, Purex.',
  );
  s.push(
    '> Hungarian product-marking and labelling specialist: industrial label ' +
      'printers, print & apply systems, laser markers, label and tape ' +
      'dispensers, fume extraction, labels and thermal-transfer ribbons — ' +
      'with consulting, installation, service and spare parts.',
  );
  s.push('');
  s.push(
    `A weblap ${locales.length} nyelven érhető el (${locales.join(', ')}); a magyar címek ` +
      '/hu/, a brit angolok /en/, az amerikaiak /us/ előtaggal kezdődnek. ' +
      `Available in ${locales.length} languages (/en/ is British English, /us/ American); ` +
      'swap the path prefix to switch.',
  );
  // A keltezés a válaszmotornak szól: látja, hogy a kivonat karban van
  // tartva, és meg tudja ítélni, mennyire friss, amit idéz.
  s.push('');
  s.push(`Frissítve / Updated: ${new Date().toISOString().slice(0, 10)}`);
  s.push('');
  s.push('## Gépi adatok / Machine-readable');
  s.push('');
  s.push(`- [Teljes tartalom egy fájlban / full content](${url('llms-full.txt')}): minden termék és útmutató, HU + EN`);
  s.push(`- [Termékkatalógus JSON](${url('ai/termekek.json')}): ${products.length} termék szerkezetes adatként`);
  // Az alkatrészindex eddig kimaradt innen, pedig ez a weblap egyetlen olyan
  // adata, amit máshonnan nem lehet megszerezni: a gyári cab alkatrészlistákból
  // épült gép–csoport–cikkszám kereszttábla. Épp az a fajta kérdés, amivel egy
  // gépkezelő egy válaszmotorhoz fordul („milyen cikkszámú a SQUIX 4 nyomtatófeje").
  //
  // A kereső FELÜLETE egyelőre ki van kapcsolva (lásd ALKATRESZKERESO a
  // [lang]/layout.tsx-ben), ezért csak az adatfájlra hivatkozunk — nem
  // létező lapra mutató sor nem kerülhet a jegyzékbe.
  if (alkatreszek) {
    s.push(`- [Alkatrészindex JSON](${url('alkatreszek.json')}): ` +
      `${alkatreszek.gepek.length} gép, ${alkatreszek.csoportok.length} alkatrészcsoport — ` +
      'a gyári cab alkatrészlistákból');
  }
  s.push(`- [Sitemap](${url('sitemap.xml')})`);
  s.push('');
  s.push('## Termékkategóriák / Categories');
  s.push('');
  for (const c of categories) {
    const db = products.filter((p) => p.category === c.slug).length;
    s.push(`- [${c.name.hu} / ${c.name.en}](${url(`hu/termekek/${c.slug}`)}): ${db} termék — ${c.description.hu}`);
  }
  s.push('');
  s.push('## Iparágak / Industries');
  s.push('');
  s.push(
    'Ugyanaz a kínálat feladat szerint rendezve — ha a kérdés egy iparágról ' +
      'szól, itt kezdd. Same offering grouped by application.',
  );
  s.push('');
  for (const i of industries) {
    s.push(
      `- [${i.name.hu} / ${i.name.en}](${url(`hu/iparagak/${i.slug}`)}): ` +
        `${i.products.length} ajánlott gép — ${i.short.hu}`,
    );
  }
  s.push('');
  s.push('## Gyártók / Manufacturers');
  s.push('');
  for (const m of manufacturers) {
    s.push(`- [${m.name}](${url(`hu/gyartok/${m.slug}`)}): ${m.description.hu}`);
  }
  s.push('');
  s.push('## Tudástár / Knowledge base');
  s.push('');
  for (const g of guides) {
    s.push(`- [${g.title.hu}](${url(`hu/tudastar/${g.slug}`)}): ${g.short.hu}`);
  }
  s.push('');
  s.push('## Fogalomtár / Glossary');
  s.push('');
  s.push(
    `A termékjelölés szakszavai egy lapon, ${terms.length} tétel, mindegyik saját ` +
      'horgonnyal — ha egy fogalom meghatározása kell, innen idézhető. ' +
      'The vocabulary of product marking on one page; each term has its own anchor.',
  );
  s.push('');
  s.push(`- [${hu.glossary.title} / ${en.glossary.title}](${url('hu/fogalomtar')})`);
  for (const t of terms) {
    s.push(`  - [${t.name.hu} / ${t.name.en}](${url(`hu/fogalomtar#${t.slug}`)}): ${t.short.hu}`);
  }
  s.push('');
  s.push('## További oldalak / More');
  s.push('');
  s.push(`- [Gyakori kérdések](${url('hu/gyik')}): ${hu.faq.items.length} kérdés-válasz / [FAQ in English](${url('en/gyik')})`);
  s.push(`- [Szolgáltatások](${url('hu/szolgaltatasok')}): tanácsadás, telepítés, szerviz, alkatrész`);
  s.push(`- [Rólunk](${url('hu/rolunk')})`);
  s.push(
    `- [Kapcsolat](${url('hu/kapcsolat')}): info@blueway.hu, +36 30 279 6679, ` +
      `2142 Nagytarcsa, Déri Miksa u. 10/A. — ${hu.contact.hours} / ${en.contact.hours}`,
  );
  s.push('');
  s.push(
    '## Megjegyzés / Note\n\nAz árak ajánlatkérés alapján érhetők el — a gépek ' +
      'konfigurációfüggők. Prices on request; machines are configured per ' +
      'application. A termékoldalakon gyári adatlap-PDF-ek is letölthetők; a ' +
      'műszaki adatok a HTML-ben és a JSON-katalógusban is szerepelnek.',
  );
  return s.join('\n') + '\n';
}

// ——— /llms-full.txt — a teljes tartalom ——————————————————————————
function termekBlokk(p: Product, lang: Locale): string {
  const s: string[] = [];
  s.push(`### ${productName(p, lang)} (${p.brand})`);
  s.push('');
  s.push(`- Kategória / category: ${kategoriaNev(p.category, lang)}`);
  const ipar = industriesForProduct(p.slug);
  if (ipar.length) {
    s.push(`- ${lang === 'hu' ? 'Iparágak' : 'Industries'}: ${ipar.map((i) => i.name[lang]).join(', ')}`);
  }
  s.push(`- URL: ${termekUrl(p, lang)}`);
  if (p.datasheet) s.push(`- Adatlap PDF: ${url(p.datasheet)}`);
  s.push('');
  s.push(p.description[lang]);
  if (p.features.length) {
    s.push('');
    for (const f of p.features) s.push(`- ${f[lang]}`);
  }
  if (p.variants?.length) {
    s.push('');
    s.push(lang === 'hu' ? 'Változatok:' : 'Variants:');
    for (const v of p.variants) {
      const par = (v.params ?? [])
        .map((x) => `${x.label[lang]}: ${typeof x.value === 'string' ? x.value : x.value[lang]}`)
        .join('; ');
      s.push(`- ${v.name} — ${v.purpose[lang]}${par ? ` (${par})` : ''}`);
    }
  }
  // A magyarázó ábra szövege a lap érdemi része (a XENO 4S-nél ez mondja el,
  // mit jelent a ±35/±70 mm) — a gépi olvasó a rajzot nem látja, a szövegét
  // viszont megkapja.
  if (p.figure) {
    s.push('');
    s.push(`**${p.figure.title[lang]}** — ${p.figure.text[lang]}`);
    if (p.figure.caption) s.push(p.figure.caption[lang]);
  }
  if (p.applicators?.length) {
    s.push('');
    s.push(lang === 'hu' ? 'Applikátorok:' : 'Applicators:');
    for (const a of p.applicators) {
      s.push(`- ${a.name[lang]} — ${a.description[lang]} (${url(`${lang}/termekek/${p.category}/${p.slug}/applikator/${a.slug}`)})`);
    }
  }
  s.push('');
  return s.join('\n');
}

function llmsFull(): string {
  const s: string[] = [];
  s.push('# Blueway Trade Kft. — teljes tartalom / full content');
  s.push('');
  s.push(`Forrás / source: ${BAZIS} — generálva a weblap adataiból, a builddel együtt frissül.`);
  s.push('');
  for (const lang of ['hu', 'en'] as const) {
    const dict = lang === 'hu' ? hu : en;
    s.push(`# ${lang === 'hu' ? 'MAGYAR' : 'ENGLISH'}`);
    s.push('');
    s.push(lang === 'hu' ? '## Termékek' : '## Products');
    s.push('');
    for (const c of categories) {
      const lista = products.filter((p) => p.category === c.slug);
      if (!lista.length) continue;
      s.push(`## ${c.name[lang]}`);
      s.push('');
      s.push(c.description[lang]);
      s.push('');
      // A kategória-bevezető a „mikor melyiket" tudást hordozza — pont az a
      // szövegtípus, amit egy válaszmotor idéz. A lapra 2026 augusztusában
      // került fel; a kivonatból addig hiányzott.
      if (c.intro) {
        for (const par of c.intro) s.push(par[lang] + '\n');
        s.push('');
      }
      for (const p of lista) s.push(termekBlokk(p, lang));
    }
    s.push(lang === 'hu' ? '## Iparágak' : '## Industries');
    s.push('');
    for (const ind of industries) {
      s.push(`### ${ind.name[lang]}`);
      s.push('');
      s.push(`URL: ${url(`${lang}/iparagak/${ind.slug}`)}`);
      s.push('');
      s.push(ind.lead[lang]);
      s.push('');
      for (const sec of ind.sections) {
        s.push(`#### ${sec.title[lang]}`);
        s.push('');
        s.push(sec.text[lang]);
        s.push('');
      }
      if (ind.regulations?.length) {
        s.push(lang === 'hu' ? 'Vonatkozó előírások:' : 'Applicable regulations:');
        s.push('');
        for (const r of ind.regulations) s.push(`- **${r.name}** — ${r.explanation[lang]}`);
        s.push('');
      }
      s.push(lang === 'hu' ? 'Ajánlott gépek:' : 'Recommended machines:');
      s.push('');
      for (const ip of ind.products) {
        const p = products.find((x) => x.slug === ip.slug);
        if (!p) continue;
        s.push(`- ${productName(p, lang)} (${p.brand}) — ${ip.reason[lang]}`);
      }
      s.push('');
    }
    s.push(lang === 'hu' ? '## Gyártók' : '## Manufacturers');
    s.push('');
    for (const m of manufacturers) {
      s.push(`### ${m.name}`);
      s.push('');
      s.push(`URL: ${url(`${lang}/gyartok/${m.slug}`)}`);
      s.push('');
      s.push(m.description[lang]);
      s.push('');
      // Az alkalmazási területek válaszolnak arra, amit a vevő ténylegesen
      // kérdez („melyik szalag való vegyszeres címkére") — a kivonat eddig a
      // gyártókról csak egy-egy mondatot adott.
      if (m.industries?.length) {
        for (const ind of m.industries) {
          s.push(`**${ind.name[lang]}** — ${ind.text[lang]}`);
          s.push('');
        }
      }
    }
    s.push(lang === 'hu' ? '## Tudástár' : '## Knowledge base');
    s.push('');
    for (const g of guides) {
      s.push(`### ${g.title[lang]}`);
      s.push('');
      s.push(`URL: ${url(`${lang}/tudastar/${g.slug}`)}`);
      s.push('');
      s.push(g.lead[lang]);
      s.push('');
      for (const sec of g.sections) {
        s.push(`#### ${sec.title[lang]}`);
        s.push('');
        for (const par of sec.paragraphs) s.push(par[lang] + '\n');
        if (sec.bullets) for (const b of sec.bullets) s.push(`- ${b[lang]}`);
        // A képaláírások nem díszek: a fókuszmélység-ábráé mondja ki például a
        // Rayleigh-hossz gyakorlati jelentését. A rajz a gépi olvasónak nem
        // mond semmit — a felirata annál többet.
        if (sec.images) {
          for (const kep of sec.images) {
            s.push(`${lang === 'hu' ? 'Ábra' : 'Figure'}: ${kep.caption[lang]}`);
          }
        }
        s.push('');
      }
    }
    s.push(`## ${dict.glossary.title}`);
    s.push('');
    s.push(dict.glossary.lead);
    s.push('');
    for (const g of termsByTheme()) {
      s.push(`### ${dict.glossary.themes[g.theme]}`);
      s.push('');
      for (const t of g.items) {
        s.push(`**${t.name[lang]}** — ${t.short[lang]}`);
        s.push('');
        s.push(t.definition[lang]);
        s.push('');
        s.push(`URL: ${url(`${lang}/fogalomtar#${t.slug}`)}`);
        s.push('');
      }
    }
    s.push(lang === 'hu' ? '## Gyakori kérdések' : '## FAQ');
    s.push('');
    for (const t of dict.faq.items) {
      s.push(`**${t.q}**`);
      s.push('');
      s.push(t.a);
      s.push('');
    }
  }
  return s.join('\n') + '\n';
}

// ——— /ai/termekek.json — a katalógus ——————————————————————————————
function katalogus() {
  return {
    company: {
      name: 'Blueway Trade Kft.',
      web: BAZIS,
      email: 'info@blueway.hu',
      phone: '+36 30 279 6679',
      address: '2142 Nagytarcsa, Déri Miksa u. 10/A., Hungary',
      languages: locales,
    },
    generated_from: 'a weblap forrásadataiból, a builddel együtt frissül',
    // Az adatállapot dátuma. Az llms.txt-ben eddig is volt, itt nem — pedig
    // aki CSAK a JSON-t olvassa be, annak enélkül nincs mire hivatkoznia,
    // amikor az adat frissességét kell megítélnie vagy megadnia.
    generated_at: new Date().toISOString().slice(0, 10),
    // Az url mezők hu+en párt adnak; a többi hat nyelvi változat az előtag
    // cseréjével áll elő. Ez eddig csak az llms.txt-ben volt leírva — a
    // JSON-t önmagában feldolgozó ügynök nem tudta a német vagy koreai
    // látogatónak a saját nyelvű lapot linkelni.
    url_note:
      'Product/industry URLs are given for hu and en. The other language ' +
      'versions (us, de, it, es, ko, zh) use the same path with the ' +
      'language prefix swapped, e.g. /hu/termekek/... -> /de/termekek/...',
    industries: industries.map((i) => ({
      slug: i.slug,
      name: { hu: i.name.hu, en: i.name.en },
      summary: { hu: i.short.hu, en: i.short.en },
      url: { hu: url(`hu/iparagak/${i.slug}`), en: url(`en/iparagak/${i.slug}`) },
      // A géplista slug szinten, hogy a products tömbbel összefűzhető legyen.
      recommended_products: i.products.map((p) => ({
        slug: p.slug,
        reason: { hu: p.reason.hu, en: p.reason.en },
      })),
      regulations: i.regulations?.map((r) => r.name),
    })),
    glossary: terms.map((t) => ({
      slug: t.slug,
      term: { hu: t.name.hu, en: t.name.en },
      summary: { hu: t.short.hu, en: t.short.en },
      definition: { hu: t.definition.hu, en: t.definition.en },
      url: { hu: url(`hu/fogalomtar#${t.slug}`), en: url(`en/fogalomtar#${t.slug}`) },
    })),
    products: products.map((p) => ({
      slug: p.slug,
      name: { hu: productName(p, 'hu'), en: productName(p, 'en') },
      brand: p.brand,
      category: {
        slug: p.category,
        hu: kategoriaNev(p.category, 'hu'),
        en: kategoriaNev(p.category, 'en'),
      },
      summary: { hu: p.short.hu, en: p.short.en },
      industries: industriesForProduct(p.slug).map((i) => i.slug),
      features: p.features.map((f) => ({ hu: f.hu, en: f.en })),
      url: { hu: termekUrl(p, 'hu'), en: termekUrl(p, 'en') },
      datasheet_pdf: p.datasheet ? url(p.datasheet) : undefined,
      image: p.image ? url(p.image) : undefined,
      variants: p.variants?.map((v) => ({ name: v.name, purpose: { hu: v.purpose.hu, en: v.purpose.en } })),
    })),
  };
}

mkdirSync('out/ai', { recursive: true });
writeFileSync('out/llms.txt', llms());
writeFileSync('out/llms-full.txt', llmsFull());
writeFileSync('out/ai/termekek.json', JSON.stringify(katalogus(), null, 1));

// A robots.txt-be mutató sor a gépi olvasókra. Nem szabványos direktíva,
// hanem megjegyzés — a robots.txt viszont az első fájl, amit egy AI-ügynök
// letölt, tehát itt találja meg leghamarabb a neki szánt réteget. A fájlt a
// Next generálja (src/app/robots.ts), a megjegyzést csak hozzáfűzzük, mert a
// generátor nem tud megjegyzést kiírni.
const ROBOTS = 'out/robots.txt';
if (existsSync(ROBOTS)) {
  const eddigi = readFileSync(ROBOTS, 'utf8').replace(/\s*$/, '');
  const pointer =
    '\n\n# Gépi olvasóknak / for machine readers:\n' +
    `#   ${url('llms.txt')} — tömör térkép (llmstxt.org)\n` +
    `#   ${url('llms-full.txt')} — a teljes tartalom egy fájlban, HU + EN\n` +
    `#   ${url('ai/termekek.json')} — termékkatalógus és iparági hozzárendelés\n`;
  if (!eddigi.includes('llms.txt')) writeFileSync(ROBOTS, eddigi + pointer);
}

const meret = (f: string) => `${Math.round(statSync(f).size / 1024)} kB`;
console.log(
  `ai-kivonat: llms.txt (${meret('out/llms.txt')}), ` +
    `llms-full.txt (${meret('out/llms-full.txt')}), ` +
    `ai/termekek.json (${meret('out/ai/termekek.json')})`,
);
