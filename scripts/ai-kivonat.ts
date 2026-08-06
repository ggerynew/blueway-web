/**
 * Gépi fogyasztásra szánt kivonatok a weblap adataiból — az „AI-optimalizált"
 * réteg. Három fájlt ír a buildelt kimenetbe (out/):
 *
 *   /llms.txt          — tömör, jegyzetelt térkép az llms.txt szabvány szerint
 *                        (llmstxt.org): mi ez az oldal, mi hol van, hova
 *                        érdemes menni. Ezt olvassa el egy AI először.
 *   /llms-full.txt     — a teljes érdemi tartalom egyetlen markdown fájlban:
 *                        minden termék adata és a Tudástár összes útmutatója,
 *                        magyarul és angolul. Ebből egy AI kérdezés nélkül,
 *                        böngészés nélkül tud pontosan válaszolni.
 *   /ai/termekek.json  — a termékkatalógus szerkezetes adatként (név, márka,
 *                        kategória, jellemzők, változatok, adatlap-URL, oldal-
 *                        URL nyelvenként) — ügynököknek, összehasonlítóknak.
 *
 * A forrás ugyanaz a három adatfájl, amiből a weblap is épül — tehát nem
 * eshet szét a kettő. Futtatás a build után (a package.json build lépésében):
 *
 *   node --experimental-strip-types --import ./scripts/ts-betolto.mjs scripts/ai-kivonat.ts
 */
import { mkdirSync, statSync, writeFileSync } from 'node:fs';

import { getDictionary, locales, type Locale } from '../src/lib/i18n';
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
    `A weblap 7 nyelven érhető el (${locales.join(', ')}); a magyar címek /hu/, ` +
      'az angolok /en/ előtaggal kezdődnek. Available in 7 languages; swap the ' +
      'path prefix to switch.',
  );
  s.push('');
  s.push('## Gépi adatok / Machine-readable');
  s.push('');
  s.push(`- [Teljes tartalom egy fájlban / full content](${url('llms-full.txt')}): minden termék és útmutató, HU + EN`);
  s.push(`- [Termékkatalógus JSON](${url('ai/termekek.json')}): ${products.length} termék szerkezetes adatként`);
  s.push(`- [Sitemap](${url('sitemap.xml')})`);
  s.push('');
  s.push('## Termékkategóriák / Categories');
  s.push('');
  for (const c of categories) {
    const db = products.filter((p) => p.category === c.slug).length;
    s.push(`- [${c.name.hu} / ${c.name.en}](${url(`hu/termekek/${c.slug}`)}): ${db} termék — ${c.description.hu}`);
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
  s.push('## További oldalak / More');
  s.push('');
  s.push(`- [Gyakori kérdések](${url('hu/gyik')}): ${hu.faq.items.length} kérdés-válasz / [FAQ in English](${url('en/gyik')})`);
  s.push(`- [Szolgáltatások](${url('hu/szolgaltatasok')}): tanácsadás, telepítés, szerviz, alkatrész`);
  s.push(`- [Rólunk](${url('hu/rolunk')})`);
  s.push(`- [Kapcsolat](${url('hu/kapcsolat')}): info@blueway.hu, +36 30 279 6679, 2142 Nagytarcsa, Déri Miksa u. 10/A.`);
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
      for (const p of lista) s.push(termekBlokk(p, lang));
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

const meret = (f: string) => `${Math.round(statSync(f).size / 1024)} kB`;
console.log(
  `ai-kivonat: llms.txt (${meret('out/llms.txt')}), ` +
    `llms-full.txt (${meret('out/llms-full.txt')}), ` +
    `ai/termekek.json (${meret('out/ai/termekek.json')})`,
);
