/**
 * A feltöltés menete: honnan hová, mi menjen, és mi ne.
 *
 * A legfontosabb szabály itt van kimondva: AMI MÁR FENT VAN, AZT NEM BÁNTJUK.
 * A program újrafuttatható — ha a hálózat a huszadik fájlnál elszáll, a
 * következő futás ott folytatja, és nem tölti fel kétszer az előzőket. Ez
 * könyvelési anyagnál nem kényelmi kérdés: a duplikált bizonylat kétszer
 * könyvelt tételt jelenthet.
 *
 * Az azonos nevű, de MÁS MÉRETŰ fájl külön eset. Ilyenkor nem tudjuk, melyik
 * a jó, ezért nem döntünk a felhasználó helyett: kihagyjuk és szólunk. A
 * felülírás csak kifejezett kérésre (`--felulir`) történik.
 */
import { copyFileSync, mkdirSync, readFileSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

import type { Bizonylat, Honap } from './bizonylatok.ts';
import { datumbolHonap, honapotFormaz } from './bizonylatok.ts';
import type { ElfinderFajl, ElfinderKliens, FeltoltendoFajl } from './elfinder.ts';
import type { Naplo } from './naplo.ts';

export interface FeltoltesOpciok {
  /** Rögzített célhónap. Ha nincs megadva, a mai hónap (vagy a fájl dátuma). */
  honap?: Honap;
  /** Minden fájl a SAJÁT módosítási dátuma szerinti mappába kerüljön. */
  fajlDatum: boolean;
  /** Próbafutás: semmit nem hoz létre és nem tölt fel. */
  proba: boolean;
  /** Azonos nevű fájl felülírása. */
  felulir: boolean;
  /** Sikeres feltöltés után ide mozgatjuk a helyi fájlt. */
  archivum?: string;
}

export interface Osszegzes {
  feltoltve: number;
  kihagyva: number;
  hibas: number;
}

/** A célhónap egy bizonylathoz. */
function celHonap(bizonylat: Bizonylat, opciok: FeltoltesOpciok): Honap {
  if (opciok.fajlDatum) return datumbolHonap(bizonylat.modositva);
  if (opciok.honap) return opciok.honap;
  return datumbolHonap(new Date());
}

/**
 * Mappa megkeresése, és ha nincs, létrehozása.
 *
 * Próbafutásban nem hozunk létre semmit — ilyenkor `undefined`-ot adunk vissza,
 * és a hívó tudja, hogy innentől csak beszámolni tud, ellenőrizni nem.
 */
async function mappatBiztosit(
  kliens: ElfinderKliens,
  szulo: ElfinderFajl,
  nev: string,
  proba: boolean,
  naplo: Naplo,
): Promise<ElfinderFajl | undefined> {
  const meglevo = await kliens.almappa(szulo.hash, nev);
  if (meglevo) return meglevo;

  // Próbafutásban a hívó írja ki, mi hiányzik: onnan a TELJES útvonal látszik
  // („2026/08"), innen csak az egyik szintje látszana.
  if (proba) return undefined;

  // A mappa létrehozásához a szülőre írásjog kell. Ha nincs, a kiszolgáló
  // hibaüzenete önmagában rejtélyes — itt legalább látszik, min bukott el.
  if (szulo.write === 0 || szulo.write === false) {
    throw new Error(`A(z) „${szulo.name}" mappába nincs írásjogod, így a(z) „${nev}" nem hozható létre.`);
  }

  const uj = await kliens.mappatLetrehoz(szulo.hash, nev);
  naplo.siker(`Létrehozva a(z) „${nev}" mappa.`);
  return uj;
}

/** A helyi fájl elmozgatása az archívumba, sikeres feltöltés után. */
function archival(bizonylat: Bizonylat, archivum: string, honap: Honap, naplo: Naplo): void {
  const celMappa = join(archivum, honap.ev, honap.ho);
  mkdirSync(celMappa, { recursive: true });
  const cel = join(celMappa, bizonylat.nev);
  try {
    renameSync(bizonylat.utvonal, cel);
  } catch {
    // A rename köteteken átívelve nem működik (pl. hálózati meghajtóról a
    // helyi lemezre), ilyenkor másolunk és törlünk.
    copyFileSync(bizonylat.utvonal, cel);
    unlinkSync(bizonylat.utvonal);
  }
  naplo.reszlet(`Archiválva: ${cel}`);
}

/**
 * A teljes feltöltés lebonyolítása.
 */
export async function feltoltesLefuttat(
  kliens: ElfinderKliens,
  gyoker: ElfinderFajl,
  bizonylatok: Bizonylat[],
  opciok: FeltoltesOpciok,
  naplo: Naplo,
): Promise<Osszegzes> {
  const osszegzes: Osszegzes = { feltoltve: 0, kihagyva: 0, hibas: 0 };

  // Hónapok szerint csoportosítunk, hogy mappánként egyszer kelljen listázni
  // és egyetlen kérésben mehessen az adott hónap összes bizonylata.
  const csoportok = new Map<string, { honap: Honap; tetelek: Bizonylat[] }>();
  for (const bizonylat of bizonylatok) {
    const honap = celHonap(bizonylat, opciok);
    const kulcs = honapotFormaz(honap);
    const csoport = csoportok.get(kulcs) ?? { honap, tetelek: [] };
    csoport.tetelek.push(bizonylat);
    csoportok.set(kulcs, csoport);
  }

  const rendezettKulcsok = [...csoportok.keys()].sort();

  for (const kulcs of rendezettKulcsok) {
    const csoport = csoportok.get(kulcs);
    if (!csoport) continue;
    const { honap, tetelek } = csoport;

    naplo.ures();
    naplo.info(`── ${gyoker.name} / ${kulcs} — ${tetelek.length} bizonylat`);

    let celMappa: ElfinderFajl | undefined;
    try {
      const evMappa = await mappatBiztosit(kliens, gyoker, honap.ev, opciok.proba, naplo);
      celMappa = evMappa
        ? await mappatBiztosit(kliens, evMappa, honap.ho, opciok.proba, naplo)
        : undefined;
      if (opciok.proba && !celMappa) {
        naplo.info(`  (próba) létrehozná a(z) „${kulcs}" mappát`);
      }
    } catch (hiba) {
      naplo.hiba(`A(z) ${kulcs} célmappa nem készült el: ${(hiba as Error).message}`);
      osszegzes.hibas += tetelek.length;
      continue;
    }

    // Mi van már fent? Ebből derül ki, mit hagyhatunk ki.
    const meglevok = new Map<string, number>();
    if (celMappa) {
      try {
        for (const elem of await kliens.gyerekek(celMappa.hash)) {
          if (elem.mime !== 'directory') meglevok.set(elem.name, elem.size ?? -1);
        }
      } catch (hiba) {
        naplo.hiba(`A(z) ${kulcs} mappa tartalma nem olvasható: ${(hiba as Error).message}`);
        osszegzes.hibas += tetelek.length;
        continue;
      }
    }

    const kuldendok: { bizonylat: Bizonylat; adat: FeltoltendoFajl }[] = [];

    for (const bizonylat of tetelek) {
      const meglevoMeret = meglevok.get(bizonylat.nev);

      if (meglevoMeret !== undefined && !opciok.felulir) {
        if (meglevoMeret === bizonylat.meret) {
          naplo.kihagy(`${bizonylat.nev} — már fent van, azonos méretben`);
        } else {
          naplo.figyelem(
            `${bizonylat.nev} — KIHAGYVA: fent már van ilyen nevű fájl, de más méretű ` +
              `(fent ${meglevoMeret} bájt, itt ${bizonylat.meret} bájt). ` +
              'Ha a helyi példány a jó, futtasd újra a --felulir kapcsolóval.',
          );
        }
        osszegzes.kihagyva++;
        continue;
      }

      if (opciok.proba) {
        const megjegyzes = meglevoMeret !== undefined ? ' (felülírná)' : '';
        naplo.info(`  (próba) feltöltené: ${bizonylat.nev}${megjegyzes}`);
        osszegzes.feltoltve++;
        continue;
      }

      try {
        kuldendok.push({
          bizonylat,
          adat: {
            nev: bizonylat.nev,
            tartalom: readFileSync(bizonylat.utvonal),
            mtime: Math.floor(bizonylat.modositva.getTime() / 1000),
          },
        });
      } catch (hiba) {
        naplo.hiba(`${bizonylat.nev} — nem olvasható: ${(hiba as Error).message}`);
        osszegzes.hibas++;
      }
    }

    if (kuldendok.length === 0 || !celMappa) continue;

    try {
      const felment = await kliens.feltolt(
        celMappa.hash,
        kuldendok.map((k) => k.adat),
        opciok.felulir,
      );
      const felmentNevek = new Set(felment.map((f) => f.name));

      for (const { bizonylat } of kuldendok) {
        // A kiszolgáló átnevezhet ütközéskor (szamla.pdf → szamla-1.pdf),
        // ezért a saját néven kívül azt is elfogadjuk, ha csak egy fájl ment.
        const sikeres = felmentNevek.has(bizonylat.nev) || felment.length === kuldendok.length;
        if (!sikeres) {
          naplo.hiba(`${bizonylat.nev} — a kiszolgáló nem igazolta vissza`);
          osszegzes.hibas++;
          continue;
        }
        naplo.siker(`${bizonylat.nev} — feltöltve (${bizonylat.meret} bájt)`);
        osszegzes.feltoltve++;

        if (opciok.archivum) {
          try {
            archival(bizonylat, opciok.archivum, honap, naplo);
          } catch (hiba) {
            // A feltöltés megtörtént — az archiválás hibája ne minősítse
            // sikertelennek. De szólni kell, mert a fájl a helyén maradt.
            naplo.figyelem(`${bizonylat.nev} — feltöltve, de az archiválás nem sikerült: ` +
              `${(hiba as Error).message}`);
          }
        }
      }
    } catch (hiba) {
      naplo.hiba(`A(z) ${kulcs} hónap feltöltése megszakadt: ${(hiba as Error).message}`);
      osszegzes.hibas += kuldendok.length;
    }
  }

  return osszegzes;
}
