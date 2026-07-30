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
  /** [cikkszám, megnevezés, gép-sorszámok, egység-sorszámok, SPR-osztály] */
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
  fogaskerek: ['gear'], kerek: ['gear'], zahnrad: ['gear'], getriebe: ['gear'],
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
  tapadokorong: ['pad'], parna: ['pad'], talp: ['pad', 'plate'],
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
};

const SZOTAR_KULCSOK = Object.keys(SZOTAR);
/** Latin betűs kulcs: a beírt szó ELEJÉT hasonlítjuk (ragozás miatt). */
const LATIN = /^[a-z0-9 '-]+$/;
/** Három betűnél rövidebb tő túl sok szóba beleillik („kar" a „kártyá"-ba). */
const ROVID = 3;

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
      ? szavak.some((sz) =>
          kulcs.length <= ROVID
            ? sz === kulcs
            : sz.startsWith(kulcs) || (sz.length >= 4 && kulcs.startsWith(sz)),
        )
      : n.includes(kulcs);
    if (talalt) SZOTAR[kulcs].forEach((x) => ki.add(x));
  }
  for (const sz of szavak) {
    if (sz.length >= 3) ki.add(sz);
  }
  return [...ki];
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

/** A cab ajánlási osztálya rangsorolásra: A a legfontosabb raktári tétel. */
const SPR_PONT: Record<string, number> = { A: 6, B: 4, C: 2, D: 1 };

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
  const kulcsok = angolra(kerdes);
  if (!kulcsok.length) return { talalatok: [], erintettGepek: [], cikkszamra: false };

  const pontozott: Talalat[] = [];
  for (const sor of index.t) {
    if (gepIdx >= 0 && !sor[2].includes(gepIdx)) continue;
    const nev = normal(sor[1]);
    const egyseg = sor[3].map((i) => normal(index.csoportok[i])).join(' ');
    let pont = 0;
    for (const k of kulcsok) {
      if (!k) continue;
      if (nev.includes(k)) pont += nev.startsWith(k) ? 5 : 3;
      if (egyseg.includes(k)) pont += 2;
    }
    if (!pont) continue;
    pont += SPR_PONT[sor[4]] ?? 0;
    // Kevesebb gépbe való alkatrész jellemzően a jellegzetes, keresett tétel;
    // a mindenhol előforduló szabványcsavar hátrébb való.
    if (sor[2].length > 6) pont -= 2;
    pontozott.push(sorra(sor, gepNev, index.csoportok, pont));
  }

  pontozott.sort((a, b) => b.pont - a.pont || a.cikkszam.localeCompare(b.cikkszam));
  return {
    talalatok: pontozott.slice(0, hatar),
    erintettGepek: [...new Set(pontozott.flatMap((t) => t.gepek))],
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
    egysegek: sor[3].map((i) => csoportok[i]),
    spr: sor[4],
    pont,
  };
}

// ——— betöltés ————————————————————————————————————————————————————
let gyorsitotar: Promise<AlkatreszIndex> | null = null;

/** Az index egyszer töltődik le, a keresőfül első megnyitásakor. */
export function betoltIndex(): Promise<AlkatreszIndex> {
  if (!gyorsitotar) {
    gyorsitotar = fetch(asset('/alkatreszek.json'))
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
