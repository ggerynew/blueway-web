/**
 * Bizonylatok összegyűjtése a lemezről, és a célmappa meghatározása.
 *
 * A MASC fáján a bizonylatok ÉV/HÓNAP mappákba mennek (a képernyőképen:
 * 2026 alatt 06, 07, 08). Ez a modul dönti el, melyik fájl melyik hónapba
 * tartozik, és melyik fájllal ne is foglalkozzunk.
 */
import { readdirSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

export interface Bizonylat {
  /** Teljes útvonal a lemezen. */
  utvonal: string;
  /** A fájl neve, ezen a néven kerül fel. */
  nev: string;
  meret: number;
  /** Módosítás ideje (a fájl „dátuma"). */
  modositva: Date;
}

/**
 * Alapból elfogadott kiterjesztések.
 *
 * A PDF és a kép a beszkennelt papír, az XML az elektronikus számla
 * (NAV-formátum). A táblázatokat is beengedjük, mert a pénztárbizonylat és a
 * költségösszesítő gyakran abban készül.
 */
export const ALAP_KITERJESZTESEK = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'tif',
  'tiff',
  'xml',
  'csv',
  'xls',
  'xlsx',
  'doc',
  'docx',
];

/**
 * Fájlok, amiket sosem viszünk fel.
 *
 * A `~$` kezdetű az Office nyitott dokumentumának zárolófájlja, a `.part` és
 * `.crdownload` a félkész letöltés — ezek feltöltése garantáltan hibás
 * bizonylatot eredményezne. A rejtett fájlok (`.` kezdet) rendszerszemét.
 */
function szemet(nev: string): boolean {
  if (nev.startsWith('.')) return true;
  if (nev.startsWith('~$')) return true;
  if (/\.(part|crdownload|tmp|filepart)$/i.test(nev)) return true;
  if (/^(thumbs\.db|desktop\.ini)$/i.test(nev)) return true;
  return false;
}

export class GyujtesHiba extends Error {}

/**
 * Bizonylatok összeszedése a megadott útvonalakról.
 *
 * Az útvonal lehet fájl (akkor csak az) vagy mappa (akkor annak a tartalma).
 * A mappát alapból CSAK EGY SZINTEN nézzük: a `--rekurziv` nélküli működés
 * védelem, nehogy egy rosszul megadott útvonalról a fél gép felmenjen a
 * könyvelőhöz.
 */
export function bizonylatokatGyujt(
  utak: string[],
  opciok: { rekurziv?: boolean; kiterjesztesek?: string[] } = {},
): Bizonylat[] {
  const engedett = new Set(
    (opciok.kiterjesztesek ?? ALAP_KITERJESZTESEK).map((k) => k.toLowerCase().replace(/^\./, '')),
  );
  const talaltak: Bizonylat[] = [];
  // Ugyanaz a fájl két úton is bekerülhet (pl. a mappája és ő maga is meg van
  // adva); a feloldott útvonal alapján egyszer vesszük.
  const latott = new Set<string>();

  const fajltFelvesz = (utvonal: string, kotelezo: boolean): void => {
    const nev = basename(utvonal);
    if (szemet(nev)) {
      if (kotelezo) {
        throw new GyujtesHiba(`Ez a fájl nem tölthető fel (ideiglenes vagy rendszerfájl): ${nev}`);
      }
      return;
    }
    const kiterjesztes = extname(nev).slice(1).toLowerCase();
    if (!engedett.has(kiterjesztes)) {
      if (kotelezo) {
        throw new GyujtesHiba(
          `A(z) „${nev}" kiterjesztése (.${kiterjesztes || '—'}) nincs az engedettek közt: ` +
            `${[...engedett].join(', ')}. A --kiterjesztes kapcsolóval bővíthető.`,
        );
      }
      return;
    }
    const teljes = resolve(utvonal);
    if (latott.has(teljes)) return;
    const adat = statSync(teljes);
    if (adat.size === 0) {
      // A nulla bájtos fájl mindig hiba: félbeszakadt mentés vagy másolás.
      // Feltöltve viszont teljesen ártatlannak látszik a könyvelő listájában.
      throw new GyujtesHiba(`A(z) „${nev}" fájl üres (0 bájt) — ezt nem töltjük fel.`);
    }
    latott.add(teljes);
    talaltak.push({ utvonal: teljes, nev, meret: adat.size, modositva: adat.mtime });
  };

  const mappatBejar = (mappa: string, melyseg: number): void => {
    for (const bejegyzes of readdirSync(mappa, { withFileTypes: true })) {
      const teljes = join(mappa, bejegyzes.name);
      if (bejegyzes.isDirectory()) {
        if (opciok.rekurziv && !szemet(bejegyzes.name)) mappatBejar(teljes, melyseg + 1);
        continue;
      }
      if (bejegyzes.isFile()) fajltFelvesz(teljes, false);
    }
  };

  for (const ut of utak) {
    let adat;
    try {
      adat = statSync(ut);
    } catch {
      throw new GyujtesHiba(`Nincs ilyen fájl vagy mappa: ${ut}`);
    }
    if (adat.isDirectory()) {
      mappatBejar(ut, 0);
    } else {
      // Ha valaki NÉVVEL adott meg egy fájlt, és mi csendben kihagyjuk,
      // az félrevezető — ezért itt a kihagyás hibát jelent.
      fajltFelvesz(ut, true);
    }
  }

  // Névsor: a napló és a próbafutás így összevethető két futás között.
  talaltak.sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
  return talaltak;
}

export interface Honap {
  ev: string;
  /** Két számjegy, vezető nullával — a MASC fáján is így vannak (06, 07, 08). */
  ho: string;
}

export function honapotFormaz(h: Honap): string {
  return `${h.ev}/${h.ho}`;
}

/** Dátumból év/hónap mappanév. */
export function datumbolHonap(datum: Date): Honap {
  return {
    ev: String(datum.getFullYear()),
    ho: String(datum.getMonth() + 1).padStart(2, '0'),
  };
}

/** A `--ho 2026-07` alakú megadás értelmezése. */
export function honapotErtelmez(szoveg: string): Honap {
  const talalat = /^(\d{4})[-./]?(\d{1,2})$/.exec(szoveg.trim());
  if (!talalat) {
    throw new GyujtesHiba(`A hónapot ÉÉÉÉ-HH alakban add meg (pl. 2026-07), kaptam: „${szoveg}"`);
  }
  const ev = talalat[1] as string;
  const ho = Number(talalat[2]);
  if (ho < 1 || ho > 12) {
    throw new GyujtesHiba(`Nincs ${ho}. hónap — a hónap 1 és 12 között lehet.`);
  }
  return { ev, ho: String(ho).padStart(2, '0') };
}
