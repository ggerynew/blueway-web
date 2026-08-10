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
  /**
   * Kisebb, 360 képpont magas változat — a keskeny csempéknek.
   *
   * Nem takarékossági finomkodás, hanem mérés eredménye. A sáv csempéi a
   * lap keretén belül ~341 képpont szélesek, telefonon ~350; ehhez képest a
   * 960×540-es kép több mint kétszeres túlmintavétel, a dekódolása viszont
   * a teljes árat elkéri. Amikor mind a három klip egyszerre ment egy
   * telefonon, a görgetés 60 kép/mp-ről 30-ra esett — pontosan az a fajta
   * szaggatás, ami miatt a kezdőlapról egy díszítő effekt már kirepült.
   *
   * A kisebb változat a képpontok 44%-át tartalmazza, tehát a dekódolás
   * nagyjából harmadába kerül. Nem kötelező: hiányában a nagy megy.
   */
  kicsi?: { mp4: string; webm?: string };
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
    /**
     * Egy vagy több szakasz, sorrendben egymás után fűzve.
     *
     * A többes szám nem elméleti: a gyártói felvételek jellemzően montázsok,
     * amikben a gép működése két-három rövid ablakban látszik, közte pedig
     * olyasmi, aminek a kezdőlapon nincs helye (gyári szerelés, főcím). Egy
     * összefüggő szakasz ilyenkor vagy vág le használható részt, vagy benne
     * hagyja a fölöslegeset.
     */
    szakaszok: Array<{ kezdet: number; veg: number }>;
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
        kicsi: {
          mp4: '/videos/bemutato/hermes-q-kicsi.mp4',
          webm: '/videos/bemutato/hermes-q-kicsi.webm',
        },
        poszter: '/images/bemutato/hermes-q.webp',
        hossz: 30,
        forras: {
          // A gyártó saját fájlja. A vágási pontok EGYELŐRE a YouTube-változat
          // időtengelyéről valók — a kontaktlap fogja megmondani, hova esnek
          // ebben a fájlban. Az LM+-nál kiderült, hogy a cab.de-fájlok külön
          // vágások, főcímmel az elején és a végén.
          letoltes: 'https://www.cab.de/media/videos/HERMESQ_4114_FormPad_720p.mp4',
          videoId: 'P-9HXQJ-Lds',
          szakaszok: [{ kezdet: 8, veg: 38 }],
        },
      },
    ],
  },
  {
    id: 'squix',
    cim: {
      hu: 'CAB SQUIX — címkenyomtatás gyártósoron',
      en: 'CAB SQUIX — label printing on the production line',
    },
    videok: [
      {
        mp4: '/videos/bemutato/squix.mp4',
        webm: '/videos/bemutato/squix.webm',
        kicsi: {
          mp4: '/videos/bemutato/squix-kicsi.mp4',
          webm: '/videos/bemutato/squix-kicsi.webm',
        },
        poszter: '/images/bemutato/squix.webp',
        hossz: 24,
        forras: {
          // Ez a felvétel sokáig névtelen volt: a YouTube-azonosító a
          // katalógusban sehol nem szerepelt, ezért „Ipari címkézés működés
          // közben” általános cím állt itt. A gyártói fájl neve mondta meg,
          // mit mutat — SQUIX.
          //
          // A forrás nem termékbemutató, hanem gyárlátogatás: a 72 percnyi…
          // pontosabban 72 másodpercnyi anyag nagyobbik fele a nyomtató
          // GYÁRTÁSA — marás hűtőfolyadékkal, szerelősor, panelbeültetés,
          // vonalkódos végellenőrzés. A kezdőlapon a gépnek dolgoznia kell,
          // nem készülnie, ezért csak a két működés-ablak marad:
          //
          //   15→29  a nyomtató a címketekerccsel, táblagépes távvezérlés
          //   47→57  kifutó nyomtatott címkeszalag, kijelzőkezelés, adagolás
          //
          // A köztes 29→47 és a záró 57→ végig gyári munka. A két ablakot a
          // vágószkript egymás után fűzi, így 24 másodperc lesz belőle.
          letoltes: 'https://www.cab.de/media/videos/SQUIXINACTION_EN_1080p.mp4',
          videoId: 'gyz6JmDsWIc',
          szakaszok: [
            { kezdet: 15, veg: 29 },
            { kezdet: 47, veg: 57 },
          ],
        },
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
        kicsi: {
          mp4: '/videos/bemutato/lm-plus-kicsi.mp4',
          webm: '/videos/bemutato/lm-plus-kicsi.webm',
        },
        poszter: '/images/bemutato/lm-plus.webp',
        hossz: 48,
        forras: {
          // A gyártó fájlja MÁS VÁGÁS, mint a YouTube-változat: az utóbbi
          // több felvételből összeállított, két percnél hosszabb montázs,
          // ez viszont egyetlen, 58 másodperces jelenet. A 6→120 mp-es
          // szakasz tehát ide nem értelmezhető.
          //
          // A határokat kontaktlapon néztem meg: az elején cab-főcím áll
          // (fekete címlap, a 4. másodpercre már a gép látszik), a végén
          // szintén cab.de-főcím. Mindkettő felvillanna a hurok minden
          // körében, ezért a szakasz a kettő közé esik.
          letoltes: 'https://www.cab.de/media/videos/lmplus02_robot_form_pad.mp4',
          videoId: 'Q7-qCKuZ708',
          szakaszok: [{ kezdet: 5, veg: 53 }],
        },
      },
    ],
  },
];

export const bemutatoCsempek: BemutatoCsempe[] = localize<BemutatoCsempe[]>(forras);
