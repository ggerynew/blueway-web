/**
 * Feltöltési állapotok — mi ment fel, mi nem, és mit kell újrapróbálni.
 *
 * MIÉRT KELL EZ, HA A KISZOLGÁLÓT IS MEG TUDJUK KÉRDEZNI
 *
 * A feltöltő eddig a MASC mappalistájából tudta, mi van már fent. Ez jó
 * védelem a duplázás ellen, de két dologra alkalmatlan:
 *
 *   - a felületnek CSATLAKOZÁS NÉLKÜL is meg kell mutatnia, mi vár feltöltésre
 *   - a hibás feltöltés OKÁT meg kell őrizni a következő indulásig, hogy a
 *     program magától újrapróbálhassa, és a felhasználó lássa, min bukott el
 *
 * Ezért minden cégnek van egy állapotfájlja. A kiszolgálói ellenőrzés emellett
 * megmarad — az a végső szó, ez pedig a nyilvántartás.
 *
 * A FÁJL AZONOSSÁGÁRÓL
 *
 * A fájlt az útvonala azonosítja, a tartalmát viszont az ujjlenyomata (sha256).
 * Ha egy bizonylatot kicserélnek ugyanazon a néven — javított számla, újra
 * beszkennelt papír —, az ujjlenyomat megváltozik, és a fájl visszakerül a
 * feltöltendők közé. Név szerint ezt nem lehetne észrevenni.
 *
 * Az ujjlenyomatot nem számoljuk újra minden átvizsgálásnál: ha a méret és a
 * módosítási idő is stimmel a nyilvántartotthoz, elhisszük a korábbit. Így egy
 * több száz fájlos mappa átnézése is pillanatok alatt megvan.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { bizonylatokatGyujt, datumbolHonap, honapotFormaz, type Honap } from './bizonylatok.js';

export type FajlAllapot = 'varakozik' | 'feltoltve' | 'hibas';

export interface FajlBejegyzes {
  /** Teljes helyi útvonal — ez az azonosító. */
  ut: string;
  nev: string;
  meret: number;
  /** Módosítás ideje, Unix ezredmásodperc. */
  modositva: number;
  /** A tartalom sha256-lenyomata. */
  ujjlenyomat: string;
  allapot: FajlAllapot;
  /** Hová került vagy kerül: „2026/08". */
  celMappa: string;
  /** Az utolsó állapotváltozás ideje. */
  ido: number;
  /** Miért nem sikerült — csak `hibas` állapotnál. */
  hiba?: string;
  /** Hányszor próbáltuk eddig. */
  probalkozas: number;
}

/** Amit a felület lát: a bejegyzés + megvan-e még a fájl a lemezen. */
export interface FajlNezet extends FajlBejegyzes {
  letezik: boolean;
}

interface TaroltAllapot {
  valtozat: number;
  bejegyzesek: FajlBejegyzes[];
}

/** Egy fájl tartalmának lenyomata. */
export function ujjlenyomatot(ut: string): string {
  return createHash('sha256').update(readFileSync(ut)).digest('hex');
}

/** A cég állapotfájljának útvonala. */
export function allapotUtvonala(adatMappa: string, cegId: string): string {
  return join(adatMappa, `allapot-${cegId}.json`);
}

export class Allapottar {
  private fajl: string;
  private bejegyzesek = new Map<string, FajlBejegyzes>();
  private betoltve = false;

  constructor(fajl: string) {
    this.fajl = fajl;
  }

  private biztosBetoltes(): void {
    if (this.betoltve) return;
    this.betoltve = true;
    if (!existsSync(this.fajl)) return;
    try {
      const tarolt = JSON.parse(readFileSync(this.fajl, 'utf8')) as TaroltAllapot;
      for (const bejegyzes of tarolt.bejegyzesek ?? []) {
        this.bejegyzesek.set(bejegyzes.ut, bejegyzes);
      }
    } catch {
      // A sérült állapotfájl nem foszthatja meg a felhasználót a programtól:
      // a nyilvántartás újraépíthető, a bizonylatok megvannak. A kiszolgálói
      // ellenőrzés ilyenkor is megvéd a duplázástól.
      this.bejegyzesek.clear();
    }
  }

  ment(): void {
    const tarolt: TaroltAllapot = {
      valtozat: 1,
      bejegyzesek: [...this.bejegyzesek.values()],
    };
    mkdirSync(dirname(this.fajl), { recursive: true });
    const ideiglenes = `${this.fajl}.uj`;
    writeFileSync(ideiglenes, JSON.stringify(tarolt, null, 2), 'utf8');
    renameSync(ideiglenes, this.fajl);
  }

  /** Minden nyilvántartott bejegyzés, a legutóbb változott elöl. */
  osszes(): FajlNezet[] {
    this.biztosBetoltes();
    return [...this.bejegyzesek.values()]
      .map((b) => ({ ...b, letezik: existsSync(b.ut) }))
      .sort((a, b) => b.ido - a.ido);
  }

  /**
   * A figyelt mappák átvizsgálása és összevetése a nyilvántartással.
   *
   * A visszaadott lista a MOSTANI állapot: az új fájlok `varakozik` állapottal
   * kerülnek be, a megváltozott tartalmúak visszakerülnek `varakozik`-ba, a
   * változatlanul feltöltöttek pedig maradnak, ahol voltak.
   */
  atvizsgal(
    mappak: string[],
    opciok: { rekurziv?: boolean; kiterjesztesek?: string[]; fajlDatum?: boolean; honap?: Honap },
  ): FajlNezet[] {
    this.biztosBetoltes();

    const letezoMappak = mappak.filter((m) => existsSync(m));
    const talaltak = letezoMappak.length > 0
      ? bizonylatokatGyujt(letezoMappak, {
          rekurziv: opciok.rekurziv,
          kiterjesztesek: opciok.kiterjesztesek,
        })
      : [];

    const most = Date.now();
    for (const bizonylat of talaltak) {
      const korabbi = this.bejegyzesek.get(bizonylat.utvonal);
      const modositva = bizonylat.modositva.getTime();

      // Ha a méret és az idő is egyezik, a tartalom is ugyanaz — nem olvassuk
      // be újra a fájlt csak azért, hogy ugyanazt a lenyomatot kapjuk.
      const valtozatlan =
        korabbi !== undefined &&
        korabbi.meret === bizonylat.meret &&
        korabbi.modositva === modositva;

      const ujjlenyomat = valtozatlan
        ? (korabbi as FajlBejegyzes).ujjlenyomat
        : ujjlenyomatot(bizonylat.utvonal);

      const celMappa = honapotFormaz(
        opciok.fajlDatum
          ? datumbolHonap(bizonylat.modositva)
          : (opciok.honap ?? datumbolHonap(new Date())),
      );

      if (korabbi && korabbi.ujjlenyomat === ujjlenyomat) {
        // Ugyanaz a fájl: az állapotát megtartjuk. A célmappát viszont
        // frissítjük — a hónap fordulhatott, mióta bekerült.
        korabbi.meret = bizonylat.meret;
        korabbi.modositva = modositva;
        if (korabbi.allapot !== 'feltoltve') korabbi.celMappa = celMappa;
        continue;
      }

      this.bejegyzesek.set(bizonylat.utvonal, {
        ut: bizonylat.utvonal,
        nev: bizonylat.nev,
        meret: bizonylat.meret,
        modositva,
        ujjlenyomat,
        // A megváltozott tartalmú fájl újra feltöltendő — akkor is, ha a
        // korábbi példánya már fent van.
        allapot: 'varakozik',
        celMappa,
        ido: most,
        probalkozas: 0,
      });
    }

    this.ment();
    return this.osszes();
  }

  /** Amit fel kell tölteni: az új és a korábban elakadt fájlok. */
  feltoltendok(): FajlBejegyzes[] {
    this.biztosBetoltes();
    return [...this.bejegyzesek.values()]
      .filter((b) => b.allapot !== 'feltoltve' && existsSync(b.ut))
      .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
  }

  /** Egy fájl állapotának rögzítése. A mentés a hívó dolga (`ment()`). */
  jelol(ut: string, allapot: FajlAllapot, hiba?: string): void {
    this.biztosBetoltes();
    const bejegyzes = this.bejegyzesek.get(ut);
    if (!bejegyzes) return;
    bejegyzes.allapot = allapot;
    bejegyzes.ido = Date.now();
    if (allapot === 'feltoltve') {
      delete bejegyzes.hiba;
    } else {
      bejegyzes.hiba = hiba;
      if (allapot === 'hibas') bejegyzes.probalkozas += 1;
    }
  }

  /**
   * Egy hibás bejegyzés visszatétele a sorba, kézi kérésre.
   *
   * A felületen ez az „Újra" gomb: a felhasználó tudja, hogy közben elhárult
   * az akadály (megjött a hálózat, javult a jogosultság), és nem akar a
   * következő indulásig várni.
   */
  ujraSorba(ut: string): void {
    this.biztosBetoltes();
    const bejegyzes = this.bejegyzesek.get(ut);
    if (!bejegyzes) return;
    bejegyzes.allapot = 'varakozik';
    bejegyzes.ido = Date.now();
    delete bejegyzes.hiba;
  }

  /** Nyilvántartásból törlés — a lemezen lévő fájlhoz nem nyúl. */
  elfelejt(ut: string): void {
    this.biztosBetoltes();
    this.bejegyzesek.delete(ut);
  }

  /** Számláló a főképernyőre. */
  osszegzes(): { varakozik: number; feltoltve: number; hibas: number } {
    this.biztosBetoltes();
    const osszeg = { varakozik: 0, feltoltve: 0, hibas: 0 };
    for (const bejegyzes of this.bejegyzesek.values()) osszeg[bejegyzes.allapot] += 1;
    return osszeg;
  }
}
