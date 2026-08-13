/**
 * Cégek tára — mit tudunk egy cégről, és hol tartjuk a jelszavát.
 *
 * A program több céget kezel: mindegyiknek saját belépési lépcsői, saját
 * feltöltési kötete és saját figyelt mappái vannak. Ez a modul tárolja őket
 * egyetlen JSON-fájlban, a felhasználó adatmappájában (Windowson az
 * AppData\Roaming alatt) — nem a program mellett, mert oda a telepítés után
 * nem feltétlenül lehet írni.
 *
 * A JELSZAVAKRÓL
 *
 * Jelszót nyílt szöveggel lemezre írni nem szabad. Az Electron `safeStorage`-e
 * a Windows saját védelmét (DPAPI) használja: a titkosított érték csak azon a
 * gépen és csak azzal a Windows-felhasználóval fejthető vissza. Ez a modul
 * viszont NEM ismeri az Electront — egy `Titkosito` felületet vár. Így a
 * cégtár tesztelhető Electron nélkül, és később másik titkosítóra is
 * cserélhető.
 *
 * Ha a titkosítás nem elérhető (ritka, de pl. Linuxon kulcstartó nélkül
 * előfordul), a jelszót NEM ÍRJUK LE. Inkább kérjük el újra minden indításkor,
 * mint hogy olvashatóan a lemezen hagyjuk. A felület ezt kiírja.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

import type { BelepesLepes } from './bejelentkezes.js';

/** Titkosító felület — az Electron a safeStorage-ot adja be ide. */
export interface Titkosito {
  /** Van-e működő titkosítás ezen a gépen. */
  elerheto(): boolean;
  /** Nyílt szöveg → base64 titkos. */
  titkosit(szoveg: string): string;
  /** base64 titkos → nyílt szöveg. */
  visszafejt(titkos: string): string;
}

/** Titkosítás nélküli tartalék: nem ír le jelszót. */
export const NINCS_TITKOSITAS: Titkosito = {
  elerheto: () => false,
  titkosit: (szoveg) => szoveg,
  visszafejt: (titkos) => titkos,
};

export interface Ceg {
  id: string;
  /** Ez látszik a főképernyőn és az ablak címsorában. */
  nev: string;
  /** Az elFinder konnektor URL-je. */
  konnektor: string;
  /** A feltöltési kötet nevének jellemző részlete. */
  gyoker: string;
  /** Belépési lépcsők sorrendben: portál, majd a cég felülete. */
  lepesek: BelepesLepes[];
  /** Figyelt helyi mappák, ahonnan a bizonylatok jönnek. */
  mappak: string[];
  /** Induláskor csatlakozzon-e magától. */
  automata: boolean;
  /** Almappákat is nézzen-e a figyelt mappákban. */
  rekurziv: boolean;
  /** Minden fájl a saját dátuma szerinti hónapba (különben az aktuálisba). */
  fajlDatum: boolean;
  /** Elfogadott kiterjesztések; üres = az alapértelmezett lista. */
  kiterjesztesek: string[];
}

/** Új, üres cég — a felület ezzel nyit „új cég" esetén. */
export function uresCeg(): Ceg {
  return {
    id: randomUUID(),
    nev: '',
    konnektor: '',
    gyoker: 'Feltöltés',
    lepesek: [
      { cimke: 'MASC portál', url: '', felhasznalo: '', jelszo: '' },
      { cimke: 'Cég felülete', url: '', felhasznalo: '', jelszo: '' },
    ],
    mappak: [],
    automata: true,
    rekurziv: false,
    fajlDatum: false,
    kiterjesztesek: [],
  };
}

/** A lemezen tárolt alak: a jelszó helyén titkosított érték áll. */
interface TaroltLepes extends Omit<BelepesLepes, 'jelszo'> {
  /** Titkosított jelszó (base64). Hiányzik, ha nem menthettük. */
  jelszoTitkos?: string;
}
interface TaroltCeg extends Omit<Ceg, 'lepesek'> {
  lepesek: TaroltLepes[];
}
interface TaroltAllomany {
  valtozat: number;
  cegek: TaroltCeg[];
}

export class CegtarHiba extends Error {}

export class Cegtar {
  private fajl: string;
  private titkosito: Titkosito;
  /**
   * Azok a jelszavak, amiket nem tudtunk lemezre menteni (nincs titkosítás).
   * A program futása alatt itt élnek, hogy ne kelljen újra begépelni.
   */
  private ideiglenesJelszavak = new Map<string, string>();

  constructor(fajl: string, titkosito: Titkosito) {
    this.fajl = fajl;
    this.titkosito = titkosito;
  }

  /** Menthető-e egyáltalán jelszó ezen a gépen. */
  jelszoMentheto(): boolean {
    return this.titkosito.elerheto();
  }

  private kulcs(cegId: string, lepesIndex: number): string {
    return `${cegId}#${lepesIndex}`;
  }

  betolt(): Ceg[] {
    if (!existsSync(this.fajl)) return [];

    let allomany: TaroltAllomany;
    try {
      allomany = JSON.parse(readFileSync(this.fajl, 'utf8')) as TaroltAllomany;
    } catch (hiba) {
      throw new CegtarHiba(
        `A cégek fájlja (${this.fajl}) nem olvasható: ${(hiba as Error).message}`,
      );
    }

    return (allomany.cegek ?? []).map((tarolt) => ({
      ...uresCeg(),
      ...tarolt,
      lepesek: (tarolt.lepesek ?? []).map((lepes, index) => {
        let jelszo = this.ideiglenesJelszavak.get(this.kulcs(tarolt.id, index)) ?? '';
        if (lepes.jelszoTitkos && this.titkosito.elerheto()) {
          try {
            jelszo = this.titkosito.visszafejt(lepes.jelszoTitkos);
          } catch {
            // Másik gépen vagy másik Windows-felhasználóval a titkosított
            // érték nem fejthető vissza. Ez nem hiba, csak újra be kell írni.
            jelszo = '';
          }
        }
        const { jelszoTitkos: _elhagyva, ...tobbi } = lepes;
        return { ...tobbi, jelszo };
      }),
    }));
  }

  ment(cegek: Ceg[]): void {
    const allomany: TaroltAllomany = {
      valtozat: 1,
      cegek: cegek.map((ceg) => ({
        ...ceg,
        lepesek: ceg.lepesek.map((lepes, index) => {
          const { jelszo, ...tobbi } = lepes;
          if (!jelszo) return tobbi;

          if (this.titkosito.elerheto()) {
            return { ...tobbi, jelszoTitkos: this.titkosito.titkosit(jelszo) };
          }
          // Nincs titkosítás: a jelszó a memóriában marad, a lemezre nem megy.
          this.ideiglenesJelszavak.set(this.kulcs(ceg.id, index), jelszo);
          return tobbi;
        }),
      })),
    };

    mkdirSync(dirname(this.fajl), { recursive: true });
    // Előbb ideiglenes fájlba, majd átnevezés: így egy félbeszakadt mentés
    // nem hagy csonka cégfájlt a lemezen.
    const ideiglenes = `${this.fajl}.uj`;
    writeFileSync(ideiglenes, JSON.stringify(allomany, null, 2), 'utf8');
    renameSync(ideiglenes, this.fajl);
  }

  /** Egy cég beszúrása vagy frissítése, azonosító szerint. */
  rogzit(ceg: Ceg): Ceg[] {
    const hibak = cegetEllenoriz(ceg);
    if (hibak.length > 0) {
      throw new CegtarHiba(`A cég adatai hiányosak:\n  • ${hibak.join('\n  • ')}`);
    }
    const cegek = this.betolt();
    const index = cegek.findIndex((c) => c.id === ceg.id);
    if (index === -1) cegek.push(ceg);
    else cegek[index] = ceg;
    this.ment(cegek);
    return cegek;
  }

  torol(cegId: string): Ceg[] {
    const cegek = this.betolt().filter((c) => c.id !== cegId);
    this.ment(cegek);
    return cegek;
  }
}

/**
 * Egy cég adatainak ellenőrzése — a felület ezt írja ki mentés előtt.
 *
 * Azért itt van, és nem a felületen: a parancssori és az asztali használat
 * ugyanazokat a szabályokat kell hogy alkalmazza.
 */
export function cegetEllenoriz(ceg: Ceg): string[] {
  const hibak: string[] = [];

  if (!ceg.nev.trim()) hibak.push('A cég nevét meg kell adni.');

  if (!ceg.konnektor.trim()) {
    hibak.push('A konnektor URL-jét meg kell adni.');
  } else {
    let url: URL | undefined;
    try {
      url = new URL(ceg.konnektor);
    } catch {
      hibak.push(`A konnektor nem érvényes URL: ${ceg.konnektor}`);
    }
    if (url && url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      hibak.push('A konnektor csak https:// lehet — jelszó és bizonylat megy át rajta.');
    }
  }

  if (!ceg.gyoker.trim()) hibak.push('A feltöltési kötet nevét (vagy egy részletét) meg kell adni.');

  if (ceg.lepesek.length === 0) {
    hibak.push('Legalább egy belépési lépcső kell.');
  }
  ceg.lepesek.forEach((lepes, index) => {
    const hol = `${index + 1}. lépcső („${lepes.cimke || 'névtelen'}")`;
    if (!lepes.felhasznalo.trim()) hibak.push(`${hol}: hiányzik a felhasználónév.`);
    if (!lepes.jelszo.trim()) hibak.push(`${hol}: hiányzik a jelszó.`);
    // Az első lépcsőnek muszáj tudnia, hol kezdje; a többi mehet onnan,
    // ahová az előző vitt.
    if (index === 0 && !lepes.url?.trim()) {
      hibak.push(`${hol}: az első lépcsőnél meg kell adni a belépési lap címét.`);
    }
  });

  if (ceg.mappak.length === 0) {
    hibak.push('Legalább egy figyelt mappát meg kell adni, ahonnan a bizonylatok jönnek.');
  }

  return hibak;
}

/** A cégek fájljának szokásos helye a felhasználó adatmappájában. */
export function cegtarUtvonala(adatMappa: string): string {
  return join(adatMappa, 'cegek.json');
}
