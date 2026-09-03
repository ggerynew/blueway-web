import type { Metadata } from 'next';
import { HREFLANG, locales, type Locale } from '@/lib/i18n';

/**
 * Az oldal publikus alap-URL-je (basePath-szel együtt). FORPSI/egyedi domainre
 * költözéskor a NEXT_PUBLIC_SITE_URL környezeti változóval írható felül
 * (pl. https://www.blueway.hu), a basePath pedig üresre állítandó.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://ggerynew.github.io/blueway-web';

export const SITE_NAME = 'Blueway Trade Kft.';

/**
 * A szerviz telefonszámai, hívási sorrendben — az első az elsődleges.
 *
 * Nem a nyelvi szótárban élnek, mert nem fordítandó szövegek, hanem adatok:
 * hét helyen kellene ugyanazt a számot javítani, ha változik. A lábléc és a
 * kapcsolatoldal továbbra is a szótárbeli központi számot mutatja — ez a kettő
 * szándékosan külön, mert a szerviz külön hívószámot kapott.
 */
export const SZERVIZ_TELEFONOK = ['+36 70 341 5535', '+36 30 279 6679'] as const;

/** Hívható alak a telefonszámból: a `tel:` séma a szóközöket nem szereti. */
export function telLink(szam: string) {
  return `tel:${szam.replace(/[^\d+]/g, '')}`;
}

/** Abszolút URL egy (nyelv nélküli) útvonalból, pl. absUrl('hu/termekek'). */
export function absUrl(path: string) {
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`;
}

/**
 * Egységes oldal-metaadatok: cím, leírás, canonical és hreflang alternatívák,
 * Open Graph / Twitter kártya. A `path` a nyelvi előtag NÉLKÜLI útvonal
 * (pl. 'termekek/cimkenyomtatok' vagy '' a főoldalhoz).
 */
/** Open Graph nyelvkódok — a hreflang-gal együtt ez mondja meg a közösségi
 *  megosztóknak és a keresőknek, melyik nyelvi változatot látják. */
const OG_LOCALE: Record<Locale, string> = {
  hu: 'hu_HU',
  // A brit változat en_GB — eddig tévesen en_US-ként hirdette magát, holott a
  // szövege brit helyesírású. Az amerikai kapta meg az en_US-t.
  en: 'en_GB',
  us: 'en_US',
  de: 'de_DE',
  it: 'it_IT',
  es: 'es_ES',
  ko: 'ko_KR',
  zh: 'zh_CN',
};

/**
 * Szöveg SZÉLESSÉGE a találati listában, latin karakterre vetítve.
 *
 * A keresők a címet és a leírást nem karakterszámra vágják, hanem képpontra.
 * A latin írásnál a kettő elég jól együtt mozog, a koreainál és a kínainál
 * viszont nem: ott egy jegy nagyjából két latin karakter széles. Ha a hosszt
 * puszta `.length`-szel mérnénk, a CJK-lapok leírását a KÓD töltené fel a
 * kétszeresére — a jellemzőket addig fűzné hozzá, amíg 95 JEGY össze nem jön,
 * ami már 190 karakternyi szélesség. Mérve is így volt: a koreai lapok leírása
 * 247 egységnél tartott a 165-ös keret helyett.
 */
function szelesseg(szoveg: string): number {
  let sz = 0;
  for (const jel of szoveg) sz += (jel.codePointAt(0) ?? 0) > 0x2e80 ? 2 : 1;
  return sz;
}

/** Az első olyan pozíció, ahonnan a szöveg szélessége meghaladja a keretet. */
function vagasHatar(szoveg: string, keret: number): number {
  let sz = 0;
  let i = 0;
  for (const jel of szoveg) {
    sz += (jel.codePointAt(0) ?? 0) > 0x2e80 ? 2 : 1;
    if (sz > keret) return i;
    i += jel.length;
  }
  return szoveg.length;
}

/**
 * A találati listában a cím kb. 60-62 karakternél elvágódik. A cégnév-utótagot
 * a gyökér-elrendezés fűzi hozzá (`%s | Blueway Trade Kft.`), tehát az oldalnak
 * ennyivel kevesebb marad.
 */
const CIM_HATAR = 62;
const CIM_TARTALEK = CIM_HATAR - ' | Blueway Trade Kft.'.length;

/**
 * Hosszú cím megrövidítése — de csak ott, ahol értelmes vágáspont van.
 *
 * A címeink kétrészesek: „HQ 5314 / 5316 Vákuumszalagos applikátor — CAB
 * HERMES Q", „Vonalkódok nyomtatása: irány, inverz kódok, 2D és validálás".
 * A második rész a morzsamenüből és a H1-ből úgyis kiderül, a találati
 * listában viszont épp az szorítja ki a lényeget. Ha nincs jó vágáspont,
 * inkább hosszú marad: a csonka cím rosszabb, mint a hosszú.
 */
function rovidCim(cim: string): string {
  if (szelesseg(cim) <= CIM_TARTALEK) return cim;
  // A kínai és a japán a teljes szélességű kettőspontot használja (：), szóköz
  // nélkül — enélkül a kínai címeknél nem volt vágáspont, és a kétrészes cím
  // teljes hosszában ment ki a találati listába.
  for (const jel of [': ', '：', ' — ', ' – ', ' - ']) {
    const i = cim.indexOf(jel);
    // A vágás akkor is megéri, ha a maradék még mindig hosszabb a keretnél:
    // a keresők a cím VÉGÉT vágják le, tehát minden lespórolt karakter azt
    // segíti, hogy a lényeg és a cégnév kiférjen. Csak azt kötjük ki, hogy a
    // megmaradó rész önmagában is értelmes legyen — és ezt SZÉLESSÉGBEN mérjük,
    // nem karakterben: a koreai „라벨 소재와 접착제" kilenc jegy, de tizennyolc
    // karakternyi széles és teljes értékű cím. Karakterre mérve elbukott a
    // tizenkettes korláton, és a lap a teljes, kétrészes címmel ment ki.
    // Az `i >= 0` nem formaság: nem talált elválasztóra az indexOf −1-et ad,
    // és a `slice(0, -1)` a cím UTOLSÓ BETŰJÉT vágná le — pontosan ez történt,
    // amíg a szélességi mérés kiszorította a régi `i >= 12` feltételt, amely
    // mellékesen a −1-et is kizárta.
    if (i >= 0 && szelesseg(cim.slice(0, i)) >= 12) return cim.slice(0, i);
  }
  return cim;
}

/** A leírás a keresőben kb. 155-160 karakterig látszik. */
const LEIRAS_MAX = 158;
/** Ennél rövidebb leírás kihasználatlanul hagyja a helyet. */
const LEIRAS_CEL = 95;

/**
 * A leírás összeállítása: a rövidet a termék SAJÁT adataival egészítjük ki
 * (jellemzők, paraméterek), a hosszút szóhatáron vágjuk.
 *
 * Szándékosan nem általános reklámszöveggel töltjük fel: az minden oldalon
 * ugyanaz lenne, tehát semmit nem mondana a keresőnek arról, miben más ez az
 * oldal. A jellemzők viszont termékenként eltérnek, és tényszerűek.
 */
/** Érdemi szavak a mondatból — az egyezés vizsgálatához. */
function szavak(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((x) => x.length >= 4);
}

/**
 * Mond-e újat ez a mondat, vagy csak ismétli, ami már benne van?
 *
 * Kell, mert a rövid ajánló és az első jellemző gyakran ugyanaz más szavakkal:
 * a CAB HERMES Q ajánlója „Print & apply rendszer gyártósorra", az első
 * jellemzője „Valós idejű print & apply" — egymás után kiírva ez üresjárat.
 */
function ujatMond(meglevo: string, uj: string): boolean {
  const van = new Set(szavak(meglevo));
  const jott = szavak(uj);
  if (!jott.length) return false;
  const ismert = jott.filter((w) => van.has(w)).length;
  return ismert / jott.length < 0.6;
}

function leirasOsszeall(alap: string, tovabbi: readonly string[] = []): string {
  let d = alap.trim();
  for (const x of tovabbi) {
    if (szelesseg(d) >= LEIRAS_CEL) break;
    const t = (x ?? '').trim();
    if (!t || d.includes(t) || !ujatMond(d, t)) continue;
    d = `${d} ${/[.!?]$/.test(t) ? t : `${t}.`}`;
  }
  if (szelesseg(d) <= LEIRAS_MAX) return d;
  const vagott = d.slice(0, vagasHatar(d, LEIRAS_MAX));
  const szohatar = vagott.lastIndexOf(' ');
  // A vágás után maradó kötőszó vagy névelő („— a…") csúnyán néz ki a
  // találati listában, ezért a végéről a rövid töredékszavakat is levesszük.
  const tiszta = (szohatar > 60 ? vagott.slice(0, szohatar) : vagott)
    .replace(/(\s+\p{L}{1,3})?[\s,;:—–-]*$/u, '')
    .replace(/[\s,;:—–-]+$/, '');
  return `${tiszta}…`;
}

export function pageMetadata({
  lang,
  path,
  title,
  description,
  image,
  extra,
}: {
  lang: Locale;
  path: string;
  title: string;
  description: string;
  /** Abszolút vagy site-relatív OG-kép; alapértelmezés a brand OG-kép. */
  image?: string;
  /**
   * További tényszerű mondatok, amikből a rövid leírás kiegészülhet — például
   * a termék főbb jellemzői. Csak addig épülnek be, amíg a leírás el nem éri
   * a hasznos hosszt.
   */
  extra?: readonly string[];
}): Metadata {
  const suffix = path ? `/${path.replace(/^\/+/, '')}` : '';
  const canonical = absUrl(`${lang}${suffix}`);
  const ogImage = image ?? absUrl('images/og.png');
  const cim = rovidCim(title);
  const leiras = leirasOsszeall(description, extra);
  return {
    title: cim,
    description: leiras,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(locales.map((l) => [HREFLANG[l], absUrl(`${l}${suffix}`)])),
        'x-default': absUrl(`hu${suffix}`),
      },
    },
    openGraph: {
      title: cim,
      description: leiras,
      url: canonical,
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      type: 'website',
      // A méret csak a saját OG-képre igaz. A termékfotók más arányúak és
      // más felbontásúak; az 1200×630 ott hamis adat lenne, és a megosztás-
      // előnézet ez alapján vágná meg a képet. Méret nélkül a szolgáltatás a
      // képből olvassa ki.
      images: [image ? { url: ogImage } : { url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: cim,
      description: leiras,
      images: [ogImage],
    },
  };
}
