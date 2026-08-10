import { localize, type LocalizedText, type Sourced } from '@/lib/products';

/**
 * A kezdőlapi videósáv tartalma.
 *
 * A klipek SAJÁT KISZOLGÁLÓRÓL mennek, nem beágyazott YouTube-lejátszóból.
 * Ennek három oka van, és mindhárom mérhető:
 *
 *  1. A hurok pontos. A fájl MAGA a kívánt szakasz, tehát a `<video loop>` a
 *     szabvány szerint ismétli — nincs mit eltalálni. A YouTube-lejátszónál a
 *     szakasz-hurok csak visszaugratással érhető el, ami némán elromolhat, ha
 *     a Google változtat a lejátszón.
 *  2. Nem nyúlunk a Content-Security-Policy-hoz. A `media-src 'self'` már ma
 *     engedi a saját videót; a YouTube lejátszó-API-jához a `script-src`-be
 *     kellene bevenni a Google-t, vagyis idegen kód futna a MI origónkban.
 *  3. A látogató nem lép kapcsolatba harmadik féllel a nyitóoldal puszta
 *     megnyitásával. A terméklapon a videó csak a „Videó” fülre kattintva
 *     töltődik — ott a látogató kéri. Egy magától induló sáv nem kérés.
 *
 * A `forras` mező azért van itt, hogy a klip eredete ne vesszen el: melyik
 * felvételből, melyik másodperctől meddig vágtuk. A vágás a repón kívül,
 * ffmpeg-gel történik (lásd scripts/bemutato-klipek.sh).
 */
export interface BemutatoVideo {
  /**
   * H.264/MP4 — ez a KÖTELEZŐ változat. A Safari (macOS, iPhone, iPad) csak
   * ezt játssza le; enélkül az Apple-eszközökön néma poszter maradna.
   */
  mp4: string;
  /**
   * VP9/WebM — ha van, a Chrome, a Firefox és az Edge ezt kapja, mert azonos
   * képminőségnél nagyjából harmadával kisebb. Nem kötelező: hiányában
   * mindenki az MP4-et kapja.
   */
  webm?: string;
  /** Álló előnézeti kép — ez látszik betöltés előtt és álló lejátszásnál. */
  poszter: string;
  /** A klip hossza másodpercben. Csak tájékoztató: a jelzősáv haladását a
   *  videó saját `timeupdate` eseménye adja, nem ez. */
  hossz: number;
  /** Mit mutat EZ a felvétel. Több klipnél a jelzősáv címkéje lesz. */
  cim?: LocalizedText;
  /**
   * Honnan vágtuk. A `kezdet`/`veg` másodpercben, a LETÖLTÖTT fájl
   * időtengelyén.
   *
   * FIGYELEM: az időpontokat eredetileg a YouTube-változaton mértük. Ha a
   * gyártó saját fájlja más vágás (például nincs benne a főcím), akkor a
   * szakasz máshová esik — ezért a vágószkript minden klipnél kiír egy-egy
   * képkockát a szakasz elejéről és végéről, hogy szemre ellenőrizhető
   * legyen, mielőtt élesbe kerül.
   */
  forras?: {
    /** A gyártó saját fájlja, ha van — ebből vágunk. */
    letoltes?: string;
    /** A nyilvános YouTube-változat azonosítója — a nyilvántartás miatt. */
    videoId?: string;
    kezdet: number;
    veg: number;
  };
}

export interface BemutatoCsempe {
  /** Állandó azonosító: React-kulcs, és később horgony is lehet. */
  id: string;
  /** A csempe témája. Akkor is ez a neve, ha több klip fut alatta. */
  cim: LocalizedText;
  /** Sorrendben. MA egyelemű; a második elemtől a jelzősáv magától megjelenik. */
  videok: BemutatoVideo[];
}

/**
 * A sáv tartalma.
 *
 * A klipfájlok NINCSENEK a repóban, amíg a gyártói forrásanyag meg nem
 * érkezik. Ez nem hiányosság, hanem védelem: a kezdőlap a hiányzó fájlú
 * csempét egyszerűen kihagyja (lásd a [lang]/page.tsx szűrését), tehát a
 * sáv nem tud félkészen kimenni élesbe. Amint a fájl a helyére kerül, a
 * csempe magától megjelenik — kódot nem kell hozzá írni.
 */
const forras: Sourced<BemutatoCsempe[]> = [
  {
    id: 'hermes-q',
    cim: {
      hu: 'CAB HERMES Q — nyomtatás és felragasztás egy menetben',
      en: 'CAB HERMES Q — print and apply in one pass',
    },
    videok: [
      {
        mp4: '/videos/bemutato/hermes-q.mp4',
        webm: '/videos/bemutato/hermes-q.webm',
        poszter: '/images/bemutato/hermes-q.webp',
        hossz: 30,
        forras: { videoId: 'P-9HXQJ-Lds', kezdet: 8, veg: 38 },
      },
    ],
  },
  {
    id: 'gyz6',
    cim: {
      // A felvétel tartalmát a gyártói anyag megérkezésekor pontosítjuk — a
      // videó azonosítója a katalógusban sehol nem szerepel, tehát találgatás
      // helyett általános, de igaz cím áll itt.
      hu: 'Ipari címkézés működés közben',
      en: 'Industrial labelling in operation',
    },
    videok: [
      {
        mp4: '/videos/bemutato/gyz6.mp4',
        webm: '/videos/bemutato/gyz6.webm',
        poszter: '/images/bemutato/gyz6.webp',
        hossz: 61,
        forras: { videoId: 'gyz6JmDsWIc', kezdet: 11, veg: 72 },
      },
    ],
  },
  {
    id: 'lm-plus',
    cim: {
      hu: 'CAB LM+ — lézeres jelölés',
      en: 'CAB LM+ — laser marking',
    },
    videok: [
      {
        mp4: '/videos/bemutato/lm-plus.mp4',
        webm: '/videos/bemutato/lm-plus.webm',
        poszter: '/images/bemutato/lm-plus.webp',
        hossz: 53,
        forras: {
          // A gyártó fájlja MÁS VÁGÁS, mint a YouTube-változat: az utóbbi
          // több felvételből összeállított, két percnél hosszabb montázs,
          // ez viszont egyetlen, 58 másodperces jelenet. A 6→120 mp-es
          // szakasz tehát ide nem értelmezhető — az egész felvételt
          // használjuk, a végén lévő cab.de főcím nélkül, ami a hurokban
          // minden körben felvillanna.
          letoltes: 'https://www.cab.de/media/videos/lmplus02_robot_form_pad.mp4',
          videoId: 'Q7-qCKuZ708',
          kezdet: 0,
          veg: 53,
        },
      },
    ],
  },
];

export const bemutatoCsempek: BemutatoCsempe[] = localize<BemutatoCsempe[]>(forras);
