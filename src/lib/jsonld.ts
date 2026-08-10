import { getDictionary, type Locale } from '@/lib/i18n';
import { categories, manufacturers } from '@/lib/products';
import { SITE_NAME, SITE_URL, absUrl } from '@/lib/site';

/**
 * A weblap entitásgráfja — a strukturált adat gerince.
 *
 * Korábban minden oldal a maga kis Organization-blokkját írta ki, egymástól
 * függetlenül. A kereső és az AI-válaszmotor ilyenkor nem tudja biztosan, hogy
 * a hetven oldalon szereplő „Blueway Trade Kft." mind ugyanaz a cég — csak
 * sejti a névegyezésből. Ezért kap a szervezet és a weblap egy-egy állandó
 * `@id`-t, és minden más csomópont EZEKRE hivatkozik ahelyett, hogy újra
 * leírná őket.
 *
 *   https://blueway.hu/#szervezet   — a cég
 *   https://blueway.hu/#weblap      — maga a weblap
 *
 * A horgony a séma szerinti szokásos alak: az URL a weblapé, a `#` utáni rész
 * pedig azt mondja meg, a lapon belül melyik dologról van szó.
 */

export const SZERVEZET_ID = `${SITE_URL}/#szervezet`;
export const WEBLAP_ID = `${SITE_URL}/#weblap`;

/** Hivatkozás a szervezetre — ez megy minden „publisher", „seller" mezőbe. */
export const szervezetRef = { '@id': SZERVEZET_ID } as const;
export const weblapRef = { '@id': WEBLAP_ID } as const;

/** A telephely — a számlázási cím szándékosan nem ez, az nem nyilvános hely. */
export const CIM = {
  '@type': 'PostalAddress',
  streetAddress: 'Déri Miksa u. 10/A.',
  addressLocality: 'Nagytarcsa',
  addressRegion: 'Pest',
  postalCode: '2142',
  addressCountry: 'HU',
} as const;

const TERKEP_KERDES = 'Déri Miksa u. 10/A, 2142 Nagytarcsa, Hungary';
export const TERKEP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  TERKEP_KERDES,
)}`;

/**
 * A telephely koordinátája — a Google cégprofilból, nem a címből becsülve.
 *
 * Ez a különbségtétel nem elméleti: a Déri Miksa utca egy ipari parkban van,
 * ahol a házszám szerinti geokódolás simán a szomszéd telekre esik. Aki a
 * navigációt innen indítja, a kapunk elé érkezzen, ne a kerítés túloldalára.
 */
export const KOORDINATA = { szelesseg: 47.5139066, hosszusag: 19.2793119 } as const;

/**
 * Útvonaltervezés indítása a két itthon használt alkalmazásba.
 *
 * Mindkettő SIMA HIVATKOZÁS, nem beágyazás: amíg a látogató rá nem kattint,
 * egyetlen kérés sem megy ki a Google-höz vagy a Waze-hez. Ezért nem is
 * tartoznak a süti-hozzájárulás alá — ellentétben az alattuk lévő beágyazott
 * térképpel, ami csak elfogadás után töltődik.
 *
 * Mobilon mindkét cím a telepített alkalmazást nyitja meg, ha van; ha nincs,
 * a böngészős változat jön be. Külön alkalmazás-séma (waze://) ezért nem
 * kell, sőt ártana: telepített alkalmazás híján az hibaüzenetet adna.
 */
const KOORD = `${KOORDINATA.szelesseg},${KOORDINATA.hosszusag}`;
export const NAVIGACIO = {
  google: `https://www.google.com/maps/dir/?api=1&destination=${KOORD}`,
  waze: `https://waze.com/ul?ll=${KOORD}&navigate=yes`,
} as const;

/**
 * A cég csomópontja.
 *
 * Két típussal: Organization ÉS LocalBusiness. Az előbbi a cégazonosításhoz
 * kell (adószám, cégjegyzékszám, márkakapcsolatok), az utóbbi ahhoz, hogy a
 * telephely földrajzi helyként is értelmet nyerjen — „címkenyomtató Budapest
 * környékén" típusú keresésnél ez a különbség.
 *
 * A koordináta a Google cégprofilból való, nem a címből becsülve: a
 * geokódolás egy ipari parkban simán a szomszéd telekre esne.
 */
export function szervezetNode(lang: Locale) {
  const dict = getDictionary(lang);
  return {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': SZERVEZET_ID,
    name: SITE_NAME,
    // A rövid hívónév, ahogy a vevők emlegetik — a kereső így is összeköti.
    alternateName: 'Blueway',
    legalName: 'Blueway Trade Korlátolt Felelősségű Társaság',
    url: absUrl(lang),
    logo: {
      '@type': 'ImageObject',
      url: absUrl('images/brand/blueway-logo-still.png'),
    },
    image: absUrl('images/og.png'),
    description: dict.hero.lead,
    email: 'info@blueway.hu',
    telephone: '+36302796679',
    foundingDate: '2014',
    taxID: '25051632-2-13',
    vatID: 'HU25051632',
    // A cégjegyzékszám a magyar cégnyilvántartás azonosítója — ettől köthető
    // a weblapon szereplő cég egy konkrét, hivatalosan bejegyzett céghez.
    identifier: [
      { '@type': 'PropertyValue', name: 'Cégjegyzékszám', value: '13-09-206022' },
      { '@type': 'PropertyValue', name: 'Adószám', value: '25051632-2-13' },
    ],
    address: CIM,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: KOORDINATA.szelesseg,
      longitude: KOORDINATA.hosszusag,
    },
    hasMap: TERKEP_URL,
    // Hétköznap 8-tól 15-ig. A hétvégét nem soroljuk fel külön: ami nincs a
    // listán, azt a keresők zárva értelmezik, a kiírt „zárva" bejegyzés pedig
    // több validátort megzavar.
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '15:00',
      },
    ],
    areaServed: { '@type': 'Country', name: 'Hungary' },
    sameAs: ['https://www.facebook.com/share/1Bb1i3eHqk/'],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: '+36302796679',
        email: 'info@blueway.hu',
        availableLanguage: ['hu', 'en', 'de'],
        areaServed: 'HU',
      },
      {
        '@type': 'ContactPoint',
        contactType: 'technical support',
        telephone: '+36703415535',
        email: 'info@blueway.hu',
        availableLanguage: ['hu', 'en'],
        areaServed: 'HU',
      },
    ],
    // Miről szól ez a cég. A kategórianevekből és a forgalmazott márkákból
    // épül, tehát nem külön karbantartandó lista: ha új kategória vagy gyártó
    // kerül a kínálatba, ez magától követi.
    knowsAbout: [
      ...categories.map((c) => c.name[lang]),
      ...manufacturers.map((m) => m.name),
    ],
    // A kínálat szerkezete — ebből tudja a kereső, hogy nem egyetlen terméket
    // árulunk, hanem hét, egymástól jól elkülönülő géptípus-családot.
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: dict.nav.products,
      itemListElement: categories.map((c) => ({
        '@type': 'OfferCatalog',
        name: c.name[lang],
        url: absUrl(`${lang}/termekek/${c.slug}`),
      })),
    },
  };
}

/** A weblap csomópontja — a kiadója a fenti szervezet. */
export function weblapNode(lang: Locale) {
  return {
    '@type': 'WebSite',
    '@id': WEBLAP_ID,
    name: SITE_NAME,
    url: absUrl(lang),
    inLanguage: lang,
    publisher: szervezetRef,
  };
}

/**
 * Morzsamenü a főoldallal kezdve.
 *
 * A főoldal eddig hiányzott a láncból, pedig a kereső abból tudja, hogy a
 * termékoldal nem gyökérszintű lap, hanem két kattintásra van a nyitólaptól.
 */
export function morzsa(lang: Locale, elemek: { name: string; path: string }[]) {
  const dict = getDictionary(lang);
  const lista = [{ name: dict.nav.home, path: '' }, ...elemek];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: lista.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.name,
      item: absUrl(e.path ? `${lang}/${e.path}` : lang),
    })),
  };
}

/** Egy oldal saját `@graph`-ja, a szokásos `@context` burkolattal. */
export function graf(nodes: unknown[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
