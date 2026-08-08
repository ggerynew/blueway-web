/**
 * Alkatrészkereső — a gyári cab alkatrészlisták kereshető formában.
 *
 * ADATFORRÁS
 *   A public/alkatreszek.json a 60 gyári alkatrészlistából készül
 *   (scripts/alkatresz-index.py). 2730 egyedi cikkszám, 48 géptípus.
 *   Minden mező a gyári dokumentumból származik: nem következtetünk ki és nem
 *   egészítünk ki semmit, mert egy téves cikkszám rossz alkatrész
 *   megrendelését jelentené.
 *
 * MIÉRT A BÖNGÉSZŐBEN KERES
 *   Az index tömörítve 26 kB. Ennyiért nem érdemes szerveroldali végpontot
 *   üzemeltetni: így a keresés azonnali, offline is működik az első betöltés
 *   után, és a tárhelyen sem terhel semmit. Az adat egyébként sem titok —
 *   nyilvános gyári alkatrészjegyzék.
 *
 * A NYELVI KÉRDÉS
 *   A gyári megnevezések angolul vannak („Printhead"), a vevő viszont a saját
 *   nyelvén ír be („nyomtatófej", „Druckkopf"). A SZOTAR ezt hidalja át: a
 *   beírt szót angol kulcsszavakra fordítja, és azokkal keres. Ragozott alakra
 *   is illeszkedik, mert a beírt szó ELEJÉT hasonlítjuk („nyomtatófejet" →
 *   „nyomtatófej"). A kínai és koreai szavakban nincs szóhatár, ezért azokat
 *   részletként keressük a teljes kérdésben.
 */
import { asset } from '@/lib/asset';

/** A tömör index alakja — lásd a generátor `tomorit` függvényét. */
export interface AlkatreszIndex {
  forras: string;
  gepek: { id: string; nev: string; k: string[] }[];
  csoportok: string[];
  /**
   * [cikkszám, megnevezés, gép-sorszámok, egység-sorszámok, SPR-osztály]
   *
   * A gép és az egység sorszáma EGYMÁSHOZ TARTOZIK: a c[i] az a szerelési
   * egység, amelyben az alkatrész a g[i] gép gyári listájában szerepel
   * (−1, ha ott nincs megnevezve).
   */
  t: [string, string, number[], number[], string][];
}

export interface Talalat {
  cikkszam: string;
  megnevezes: string;
  /** Mely géptípusokba való — a vevőnek ez mondja meg, hogy jó helyen jár-e. */
  gepek: string[];
  /** Szerelési egység(ek), ahol a gyári rajzon szerepel. */
  egysegek: string[];
  /** A cab raktározási ajánlása: A a leginkább ajánlott, D a legkevésbé. */
  spr: string;
  pont: number;
  /** Illeszkedett-e maga a MEGNEVEZÉS (nem csak a szerelési egység neve). */
  nevre: boolean;
}

/** Cikkszám alakja a cab listáiban: 7 számjegy, pont, 3 számjegy. */
const CIKKSZAM = /\b\d{7}[.,]\d{3}\b/;
/** A vevő a végződést gyakran lehagyja — a 7 jegyű törzsszám is elég. */
const CIKKSZAM_TORZS = /\b\d{7}\b/;

export function normal(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Amit a vevő beírhat → a gyári listákban szereplő angol kulcsszavak.
 *
 * A kulcsok ékezet nélkül, kisbetűvel állnak (a `normal` ezt állítja elő).
 * A magyar és a német alakoknál a SZÓTŐ szerepel, hogy a ragozott változat is
 * illeszkedjen: „szenzor" a „szenzort"-ra is, „walze" a „walzen"-re is.
 */
const SZOTAR: Record<string, string[]> = {
  // ——— nyomtatófej, nyomtatás ———
  nyomtatofej: ['printhead'], nyomofej: ['printhead'], termofej: ['printhead'],
  // A vevő ritkán írja ki: „A4+ fej" a tipikus kérdés.
  fej: ['printhead'], kopf: ['printhead'],
  druckkopf: ['printhead'], thermokopf: ['printhead'],
  'testina di stampa': ['printhead'], testina: ['printhead'],
  'cabezal de impresion': ['printhead'], cabezal: ['printhead'],
  printhead: ['printhead'], 'print head': ['printhead'],
  프린트헤드: ['printhead'], 인쇄헤드: ['printhead'],
  打印头: ['printhead'], 印字头: ['printhead'],

  // ——— hengerek, görgők ———
  nyomohenger: ['print roller', 'roller'], gumihenger: ['roller'],
  henger: ['roller', 'cylinder'], gorgo: ['roller'], tekercs: ['roll'],
  walze: ['roller'], druckwalze: ['print roller', 'roller'], rolle: ['roller'],
  rullo: ['roller'], rodillo: ['roller'],
  roller: ['roller'], 롤러: ['roller'], 滚轮: ['roller'], 胶辊: ['roller'],

  // ——— érzékelők ———
  erzekelo: ['sensor'], szenzor: ['sensor'], cimkeerzekelo: ['label sensor', 'sensor'],
  fenysorompo: ['sensor'], sensor: ['sensor'], lichtschranke: ['sensor'],
  sensore: ['sensor'], 센서: ['sensor'], 传感器: ['sensor'],

  // ——— hajtás ———
  motor: ['motor'], leptetomotor: ['stepper motor', 'motor'],
  schrittmotor: ['stepper motor', 'motor'], motore: ['motor'], 모터: ['motor'],
  电机: ['motor'], 马达: ['motor'],
  szij: ['belt'], fogasszij: ['belt'], riemen: ['belt'], zahnriemen: ['belt'],
  cinghia: ['belt'], correa: ['belt'], belt: ['belt'], 벨트: ['belt'], 皮带: ['belt'],
  // A „kerék" nem fogaskerék: a gyári listákban a Wheel és a Gear külön tétel.
  fogaskerek: ['gear'], kerek: ['wheel', 'gear'], rad: ['wheel'],
  szijtarcsa: ['pulley'], zahnrad: ['gear'], getriebe: ['gear'],
  ingranaggio: ['gear'], engranaje: ['gear'], gear: ['gear'], 기어: ['gear'], 齿轮: ['gear'],
  tengely: ['shaft', 'axle'], welle: ['shaft'], achse: ['axle'],
  albero: ['shaft'], eje: ['shaft'], 축: ['shaft'], 轴: ['shaft'],
  csapagy: ['bearing'], lager: ['bearing'], cuscinetto: ['bearing'],
  rodamiento: ['bearing'], bearing: ['bearing'], 베어링: ['bearing'], 轴承: ['bearing'],
  tengelykapcsolo: ['clutch'], kupplung: ['clutch'],

  // ——— elektronika ———
  panel: ['pcb', 'panel'], alaplap: ['pcb', 'cpu'], kartya: ['pcb'],
  vezerlopanel: ['control panel'], kezeloegyseg: ['control panel'],
  platine: ['pcb'], leiterplatte: ['pcb'], bedienfeld: ['control panel'],
  scheda: ['pcb'], placa: ['pcb'], pcb: ['pcb'], 기판: ['pcb'], 电路板: ['pcb'],
  tapegyseg: ['power supply'], tap: ['power supply'], netzteil: ['power supply'],
  alimentatore: ['power supply'], 'fuente de alimentacion': ['power supply'],
  'power supply': ['power supply'], 전원: ['power supply'], 电源: ['power supply'],
  kijelzo: ['display'], display: ['display'], anzeige: ['display'],
  pantalla: ['display'], 디스플레이: ['display'], 显示: ['display'],
  kabel: ['cable'], vezetek: ['cable'], cavo: ['cable'], cable: ['cable'],
  케이블: ['cable'], 电缆: ['cable'], 线缆: ['cable'],
  kapcsolo: ['switch'], schalter: ['switch'], interruttore: ['switch'],
  interruptor: ['switch'], switch: ['switch'],
  biztositek: ['fuse'], sicherung: ['fuse'], fusibile: ['fuse'], fusible: ['fuse'],
  billentyuzet: ['keyboard'], tastatur: ['keyboard'], tastiera: ['keyboard'],
  teclado: ['keyboard'],

  // ——— festékszalag, címke útja ———
  festekszalag: ['ribbon', 'transfer ribbon'], karbonszalag: ['ribbon'],
  szalag: ['ribbon'], farbband: ['ribbon'], transferband: ['transfer ribbon'],
  nastro: ['ribbon'], cinta: ['ribbon'], ribbon: ['ribbon'],
  리본: ['ribbon'], 色带: ['ribbon'], 碳带: ['ribbon'],
  letekercselo: ['unwinder'], lecsevelo: ['unwinder'], abwickler: ['unwinder'],
  feltekercselo: ['rewinder'], visszatekercselo: ['rewinder'], aufwickler: ['rewinder'],
  rewinder: ['rewinder'], unwinder: ['unwinder'],
  agy: ['hub'], tekercstarto: ['hub', 'roll retainer'], nabe: ['hub'],
  mozzo: ['hub'], cubo: ['hub'], hub: ['hub'],
  terelo: ['guide'], vezeto: ['guide'], fuhrung: ['guide'], guida: ['guide'],
  guia: ['guide'], guide: ['guide'],
  kes: ['knife', 'cutter'], vago: ['cutter', 'knife'], messer: ['knife'],
  schneider: ['cutter'], coltello: ['knife'], cuchilla: ['knife'],

  // ——— pneumatika, applikátor ———
  szelep: ['valve'], ventil: ['valve'], valvola: ['valve'], valvula: ['valve'],
  valve: ['valve'], 밸브: ['valve'], 阀: ['valve'],
  vakuum: ['vacuum'], vakuumszivattyu: ['vacuum generator', 'vacuum'],
  vacuum: ['vacuum'], vuoto: ['vacuum'],
  tomlo: ['tube', 'hose'], cso: ['tube'], schlauch: ['tube'], tubo: ['tube'],
  pneumatika: ['pneumatic'], pneumatik: ['pneumatic'],
  munkahenger: ['cylinder'], zylinder: ['cylinder'], cilindro: ['cylinder'],
  cylinder: ['cylinder'],
  tapadokorong: ['pad'], parna: ['pad'], talp: ['pad', 'plate', 'foot'],
  saugplatte: ['pad'], stempel: ['pad'],
  applikator: ['applicator'], applicator: ['applicator'],

  // ——— mechanika, kötőelemek ———
  csavar: ['screw'], schraube: ['screw'], vite: ['screw'], tornillo: ['screw'],
  screw: ['screw'], 나사: ['screw'], 螺丝: ['screw'], 螺钉: ['screw'],
  anya: ['nut'], mutter: ['nut'], dado: ['nut'], tuerca: ['nut'],
  alatet: ['washer'], scheibe: ['washer'], rondella: ['washer'], arandela: ['washer'],
  rugo: ['spring'], feder: ['spring'], molla: ['spring'], muelle: ['spring'],
  resorte: ['spring'], spring: ['spring'], 스프링: ['spring'], 弹簧: ['spring'],
  gyuru: ['ring'], ring: ['ring'], anello: ['ring'], anillo: ['ring'],
  persely: ['bushing'], buchse: ['bushing'], boccola: ['bushing'],
  casquillo: ['bushing'],
  tavtarto: ['spacer'], abstandshalter: ['spacer'],
  kar: ['lever', 'arm'], hebel: ['lever'], leva: ['lever'], palanca: ['lever'],
  konzol: ['bracket'], tarto: ['holder', 'bracket'], halter: ['holder'],
  winkel: ['bracket'], supporto: ['holder'], soporte: ['holder'],
  utkozo: ['stopper'], anschlag: ['stopper'],
  burkolat: ['cover', 'covering'], fedel: ['cover'], fedlap: ['cover'],
  abdeckung: ['cover'], deckel: ['cover'], haube: ['cover'],
  coperchio: ['cover'], tapa: ['cover'], cubierta: ['cover'],
  cover: ['cover'], 커버: ['cover'], 盖板: ['cover'], 外壳: ['cover'],
  haz: ['housing', 'shell'], gehause: ['housing'],
  lemez: ['plate'], blech: ['plate'], platte: ['plate'], piastra: ['plate'],
  chapa: ['plate'], plate: ['plate'],
  tomites: ['seal'], dichtung: ['seal'], guarnizione: ['seal'], junta: ['seal'],
  csatlakozo: ['connector', 'fitting'], stecker: ['connector'],
  verschraubung: ['fitting'], connettore: ['connector'], conector: ['connector'],
  ventilator: ['fan'], lufter: ['fan'], ventola: ['fan'], fan: ['fan'],
  szuro: ['filter'], filter: ['filter'], filtro: ['filter'],
  sin: ['rail'], schiene: ['rail'],

  // ——— további hétköznapi szavak, amiket a gyári listák is ismernek ———
  // Csak olyan angol kulcs kerül ide, ami tényleg előfordul a jegyzékben;
  // egy nem létező szóra mutató bejegyzés csak halott súly lenne.
  keret: ['frame'], vaz: ['frame'], rahmen: ['frame'],
  gomb: ['knob', 'button'], forgatogomb: ['knob'],
  kefe: ['brush'], burste: ['brush'],
  lampa: ['lamp'], vilagitas: ['lamp'], lampe: ['lamp'],
  csap: ['pin'], csapszeg: ['pin', 'bolt'], stift: ['pin'], bolzen: ['bolt'],
  zar: ['lock'], retesz: ['lock'], zarszerkezet: ['locking', 'lock'],
  verriegelung: ['locking', 'lock'],
  magnes: ['magnet'], magnet: ['magnet'],
  penge: ['blade'], klinge: ['blade'],
  cimke: ['label'], etikett: ['label'],
  fuss: ['foot'],
  bilincs: ['clamp', 'clip'], kapocs: ['clip'], schelle: ['clamp'],
  hazszerkezet: ['shell'], burkolatelem: ['shell'],
  csillapito: ['damper'], dampfer: ['damper'],
};

const SZOTAR_KULCSOK = Object.keys(SZOTAR);
/** Latin betűs kulcs: a beírt szó ELEJÉT hasonlítjuk (ragozás miatt). */
const LATIN = /^[a-z0-9 '-]+$/;

/**
 * Mennyi ragadhat a szótő végére.
 *
 * A magyar toldalékol: „nyomtatófejet", „csavarokat". Puszta előtag-illesztés
 * viszont túl bőkezű: a „tapadókorong" a „táp" tővel kezdődik, a „kártya" a
 * „kar"-ral. Ezért a megengedett végződés a tő hosszához igazodik — rövid
 * tőnél legfeljebb két betű, hosszabbnál négy.
 */
function ragHatar(to: string): number {
  return Math.min(4, Math.max(2, to.length - 1));
}

/**
 * A beírt kérdésből angol kulcsszavak. Ha a beírt szó nincs a szótárban,
 * változatlanul is bekerül — a megnevezések sok angol szót tartalmaznak,
 * és a vevő gyakran eleve angolul ír („printhead", „ribbon").
 */
export function angolra(kerdes: string): string[] {
  const n = normal(kerdes);
  const szavak = n.split(/[^\p{L}\p{N}.'-]+/u).filter((x) => x.length >= 2);
  const ki = new Set<string>();

  for (const kulcs of SZOTAR_KULCSOK) {
    const talalt = LATIN.test(kulcs)
      ? szavak.some(
          (sz) =>
            (sz.startsWith(kulcs) && sz.length - kulcs.length <= ragHatar(kulcs)) ||
            // Rövidebbre írta, mint a szótő: „nyomtató" a „nyomtatófej"-hez.
            (sz.length >= 4 && kulcs.startsWith(sz)),
        )
      : n.includes(kulcs);
    if (talalt) SZOTAR[kulcs].forEach((x) => ki.add(x));
  }
  for (const sz of szavak) {
    if (sz.length >= 3) ki.add(sz);
  }
  return [...ki];
}

/**
 * A géptípus nevét kivesszük a keresőszavak közül.
 *
 * A típusnév a SZŰRÉS dolga, nem a rangsorolásé. Enélkül a „SQUIX 4
 * nyomtatófej" kérdésre a „Printhead 4.3/200 SQUIX RFID" került előre a sima
 * nyomtatófej elé — pusztán azért, mert a nevében is szerepel a SQUIX szó.
 * A gép már úgyis szűkíti a kört; a szónak nem szabad még pontot is adnia.
 */
function gepNelkul(index: AlkatreszIndex, kerdes: string): string {
  let n = normal(kerdes);
  for (const g of index.gepek) {
    for (const kulcs of g.k) {
      const k = normal(kulcs);
      if (k.length >= 2 && n.includes(k)) n = n.split(k).join(' ');
    }
  }
  return n.trim();
}

/** A kérdésben szereplő géptípusok (azonosítók). */
export function gepFelismeres(index: AlkatreszIndex, kerdes: string): string[] {
  const n = normal(kerdes);
  const tomor = n.replace(/[\s.]/g, '');
  const ki: { id: string; hossz: number }[] = [];
  for (const g of index.gepek) {
    for (const kulcs of g.k) {
      const k = normal(kulcs);
      if (k.length < 2) continue;
      if (n.includes(k) || tomor.includes(k.replace(/[\s.]/g, ''))) {
        ki.push({ id: g.id, hossz: k.length });
        break;
      }
    }
  }
  // A hosszabb egyezés a pontosabb: a „SQUIX 4.3" előrébb való a „SQUIX 4"-nél.
  return ki.sort((a, b) => b.hossz - a.hossz).map((x) => x.id);
}

/**
 * A cab ajánlási osztálya HOLTVERSENY-ELDÖNTŐ, nem fő szempont.
 *
 * Korábban A = 6 pont volt, ami többet ért, mint egy találat magában a
 * megnevezésben (3 pont) — így egy „A" osztályú szabványcsavar megelőzte a
 * valóban keresett alkatrészt. Az osztály azt mondja meg, mit érdemes
 * raktáron tartani; azt nem, hogy a vevő most mit keres.
 */
const SPR_PONT: Record<string, number> = { A: 1.2, B: 0.8, C: 0.4, D: 0.2 };

/** Találat a megnevezésben: ez a fő szempont. */
const NEV_PONT = 4;
/** A megnevezés ELEJÉN álló találat még jobb („Printhead 4/203"). */
const NEV_ELEJEN = 2;
/** A szerelési egység neve csak támpont: sok alkatrész osztozik rajta. */
const CSOPORT_PONT = 1;

export interface KeresesEredmeny {
  talalatok: Talalat[];
  /** Hány géptípust érintenek a találatok — ebből tudjuk, kell-e kérdezni. */
  erintettGepek: string[];
  /** Cikkszámra keresett-e a vevő. */
  cikkszamra: boolean;
}

export function keres(
  index: AlkatreszIndex,
  kerdes: string,
  gepId?: string | null,
  hatar = 12,
): KeresesEredmeny {
  const gepNev = index.gepek.map((g) => g.nev);
  const gepIdx = gepId ? index.gepek.findIndex((g) => g.id === gepId) : -1;

  // 1. Cikkszám: ha a vevő számot írt be, az pontos keresés — a szöveges
  //    találgatás csak félrevinné. A törzsszám (7 jegy) is elég.
  const teljes = kerdes.match(CIKKSZAM)?.[0].replace(',', '.');
  const torzs = teljes ? null : kerdes.match(CIKKSZAM_TORZS)?.[0];
  if (teljes || torzs) {
    const sorok = index.t.filter(([cikk]) =>
      teljes ? cikk === teljes : cikk.startsWith(`${torzs}.`),
    );
    if (sorok.length) {
      return {
        talalatok: sorok.map((s) => sorra(s, gepNev, index.csoportok, 100)),
        erintettGepek: [...new Set(sorok.flatMap((s) => s[2].map((i) => gepNev[i])))],
        cikkszamra: true,
      };
    }
  }

  // 2. Szöveges keresés a megnevezésben és a szerelési egység nevében.
  const kulcsok = angolra(gepNelkul(index, kerdes));
  if (!kulcsok.length) return { talalatok: [], erintettGepek: [], cikkszamra: false };

  const pontozott: Talalat[] = [];
  for (const sor of index.t) {
    // Ha ismerjük a gépet, csak az ő listájában szereplő tételek jöhetnek —
    // és a szerelési egység is CSAK az, ami annál a gépnél áll. Enélkül egy
    // 28 gépben előforduló csavar tizenöt egységnév alatt illeszkedne.
    const hely = gepIdx >= 0 ? sor[2].indexOf(gepIdx) : -1;
    if (gepIdx >= 0 && hely < 0) continue;
    const egyseg =
      hely >= 0
        ? normal(index.csoportok[sor[3][hely]] ?? '')
        : sor[3].map((i) => (i >= 0 ? normal(index.csoportok[i]) : '')).join(' ');

    const nev = normal(sor[1]);
    let nevPont = 0;
    let csoportPont = 0;
    for (const k of kulcsok) {
      if (k.length < 3) continue;
      if (nev.includes(k)) nevPont += NEV_PONT + (nev.startsWith(k) ? NEV_ELEJEN : 0);
      if (egyseg.includes(k)) csoportPont += CSOPORT_PONT;
    }
    if (!nevPont && !csoportPont) continue;

    let pont = nevPont + csoportPont + (SPR_PONT[sor[4]] ?? 0);
    // Gép nélkül a mindenhol előforduló szabványelem hátrébb való: ilyenkor
    // nincs mihez kötni, tehát a jellegzetes tétel a hasznosabb válasz.
    if (gepIdx < 0 && sor[2].length > 8) pont -= 1;
    pontozott.push({ ...sorra(sor, gepNev, index.csoportok, pont), nevre: nevPont > 0 });
  }

  // Ha van olyan találat, amelynek a MEGNEVEZÉSE illeszkedik, akkor a pusztán
  // szerelési egység alapján bekerülteket eldobjuk. „Nyomtatófej"-re a
  // nyomtatófej a válasz, nem a nyomtatófej-egység összes rögzítőcsavarja.
  const nevesek = pontozott.filter((t) => t.nevre);
  const vegleges = nevesek.length ? nevesek : pontozott;

  vegleges.sort((a, b) => b.pont - a.pont || a.cikkszam.localeCompare(b.cikkszam));
  return {
    talalatok: vegleges.slice(0, hatar),
    erintettGepek: [...new Set(vegleges.flatMap((t) => t.gepek))],
    cikkszamra: false,
  };
}

function sorra(
  sor: AlkatreszIndex['t'][number],
  gepNev: string[],
  csoportok: string[],
  pont: number,
): Talalat {
  return {
    cikkszam: sor[0],
    megnevezes: sor[1],
    gepek: sor[2].map((i) => gepNev[i]),
    egysegek: [...new Set(sor[3].filter((i) => i >= 0).map((i) => csoportok[i]))],
    spr: sor[4],
    pont,
    nevre: true,
  };
}

// ——— betöltés ————————————————————————————————————————————————————
let gyorsitotar: Promise<AlkatreszIndex> | null = null;

/**
 * Az index egyszer töltődik le, a keresőfül első megnyitásakor.
 *
 * A cím végén a fájl tartalmi lenyomata áll (a next.config.mjs számolja
 * buildkor). Enélkül egy frissített alkatrészlista nem érne el a visszatérő
 * látogatóhoz: a .htaccess a JSON-ra nem ír elő lejáratot, tehát a böngésző a
 * saját becslésére hagyatkozik, és napokig a régit használja.
 */
export function betoltIndex(): Promise<AlkatreszIndex> {
  if (!gyorsitotar) {
    const verzio = process.env.NEXT_PUBLIC_ALKATRESZ_V;
    gyorsitotar = fetch(asset(`/alkatreszek.json${verzio ? `?v=${verzio}` : ''}`))
      .then((r) => {
        if (!r.ok) throw new Error(`alkatreszek.json: ${r.status}`);
        return r.json() as Promise<AlkatreszIndex>;
      })
      .catch((hiba) => {
        gyorsitotar = null; // újrapróbálható maradjon
        throw hiba;
      });
  }
  return gyorsitotar;
}
