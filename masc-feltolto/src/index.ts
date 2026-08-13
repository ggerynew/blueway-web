#!/usr/bin/env node
/**
 * MASC bizonylat-feltöltő — parancssori belépési pont.
 *
 * Használat dióhéjban:
 *
 *     npm run masc:felderit              # mi van a MASC-ban? (ezzel kezdj)
 *     npm run masc:feltolt -- <mappa> --proba
 *     npm run masc:feltolt -- <mappa>
 *
 * A `--proba` a legfontosabb kapcsoló: kiírja, mit CSINÁLNA, de nem nyúl
 * semmihez. Éles adatnál mindig ezzel érdemes kezdeni.
 */
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BeallitasHiba, beallitasokatBetolt, titkok } from './beallitasok.js';
import { belep, gyokeretValaszt } from './bejelentkezes.js';
import {
  ALAP_KITERJESZTESEK,
  bizonylatokatGyujt,
  GyujtesHiba,
  honapotErtelmez,
  honapotFormaz,
  type Honap,
} from './bizonylatok.js';
import type { ElfinderFajl, ElfinderKliens } from './elfinder.js';
import { feltoltesLefuttat, type FeltoltesOpciok } from './feltolto.js';
import { Naplo } from './naplo.js';
import { SutisKeres } from './sutis-keres.js';

const PROJEKT_MAPPA = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ALAP_KONFIG = join(PROJEKT_MAPPA, 'masc.env');

const SUGO = `
MASC bizonylat-feltöltő

  Bizonylatokat tölt fel a masc.hu fájlkezelőjébe, a
  „<kötet> / ÉÉÉÉ / HH" mappaszerkezet szerint.

PARANCSOK

  felderit              Kiírja, milyen kötetek és mappák érhetők el, a
                        hash-ükkel együtt. Beállítás után ezzel kezdj:
                        ebből derül ki, jó-e a süti és a MASC_GYOKER.

  feltolt <út>...       A megadott fájlok, illetve mappák tartalmának
                        feltöltése.

KAPCSOLÓK

  --proba               Nem tölt fel és nem hoz létre semmit, csak leírja,
                        mi történne. ÉLES ADATNÁL EZZEL KEZDJ.
  --ho ÉÉÉÉ-HH          Célhónap (alap: az aktuális hónap).
  --fajl-datum          Minden bizonylat a saját módosítási dátuma szerinti
                        hónapba kerüljön, ne egy közösbe.
  --felulir             A fent lévő, azonos nevű fájl felülírása.
                        Enélkül az ilyet kihagyjuk.
  --rekurziv            A megadott mappa almappáit is bejárja.
  --archivum <mappa>    Sikeres feltöltés után ide MOZGATJA a helyi fájlt
                        (mappa/ÉÉÉÉ/HH alá).
  --kiterjesztes a,b    Az elfogadott kiterjesztések felülírása.
                        Alap: ${ALAP_KITERJESZTESEK.join(', ')}
  --beallitas <fájl>    Konfigfájl útvonala (alap: masc-feltolto/masc.env).
  --naplo <fájl>        A történtek fájlba írása is.
  --bobeszedu           Részletes kimenet (minden HTTP-kérés).
  --sugo                Ez a súgó.

BEÁLLÍTÁS

  A hozzáférési adatok a masc-feltolto/masc.env fájlba kerülnek (ezt a
  .gitignore kizárja a repóból), vagy környezeti változóba. A minta a
  masc.env.pelda fájlban van, a részletes leírás a README.md-ben.
`;

interface Kapcsolok {
  parancs: string;
  utak: string[];
  proba: boolean;
  felulir: boolean;
  rekurziv: boolean;
  fajlDatum: boolean;
  bobeszedu: boolean;
  sugo: boolean;
  honap?: Honap;
  archivum?: string;
  kiterjesztesek?: string[];
  beallitasFajl: string;
  naploFajl?: string;
}

class KapcsoloHiba extends Error {}

function kapcsolokatErtelmez(ervek: string[]): Kapcsolok {
  const k: Kapcsolok = {
    parancs: '',
    utak: [],
    proba: false,
    felulir: false,
    rekurziv: false,
    fajlDatum: false,
    bobeszedu: false,
    sugo: false,
    beallitasFajl: ALAP_KONFIG,
  };

  // Az értéket váró kapcsolóknál a következő elemet elvesszük; ha nincs, az
  // hiba — különben a hiányzó érték csendben útvonallá változna.
  const ertekKovetkezik = (index: number, nev: string): string => {
    const ertek = ervek[index + 1];
    if (ertek === undefined || ertek.startsWith('--')) {
      throw new KapcsoloHiba(`A(z) ${nev} kapcsoló után értéket kell írni.`);
    }
    return ertek;
  };

  for (let i = 0; i < ervek.length; i++) {
    const erv = ervek[i] as string;
    switch (erv) {
      case '--proba':
        k.proba = true;
        break;
      case '--felulir':
        k.felulir = true;
        break;
      case '--rekurziv':
        k.rekurziv = true;
        break;
      case '--fajl-datum':
        k.fajlDatum = true;
        break;
      case '--bobeszedu':
        k.bobeszedu = true;
        break;
      case '--sugo':
      case '-h':
      case '--help':
        k.sugo = true;
        break;
      case '--ho':
        k.honap = honapotErtelmez(ertekKovetkezik(i, '--ho'));
        i++;
        break;
      case '--archivum':
        k.archivum = ertekKovetkezik(i, '--archivum');
        i++;
        break;
      case '--kiterjesztes':
        k.kiterjesztesek = ertekKovetkezik(i, '--kiterjesztes')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s !== '');
        i++;
        break;
      case '--beallitas':
        k.beallitasFajl = ertekKovetkezik(i, '--beallitas');
        i++;
        break;
      case '--naplo':
        k.naploFajl = ertekKovetkezik(i, '--naplo');
        i++;
        break;
      default:
        if (erv.startsWith('--')) {
          throw new KapcsoloHiba(`Ismeretlen kapcsoló: ${erv}. A lehetőségek: --sugo`);
        }
        if (k.parancs === '') k.parancs = erv;
        else k.utak.push(erv);
    }
  }

  if (k.fajlDatum && k.honap) {
    throw new KapcsoloHiba(
      'A --ho és a --fajl-datum egyszerre nem adható meg: vagy közös hónapba ' +
        'megy minden, vagy mindegyik a saját dátuma szerintibe.',
    );
  }

  return k;
}

/** A `felderit` parancs: a kötetek és az első két szint kiírása. */
async function felderit(kliens: ElfinderKliens, gyokerek: ElfinderFajl[], naplo: Naplo): Promise<void> {
  naplo.ures();
  naplo.info('Elérhető kötetek:');
  for (const gyoker of gyokerek) {
    const irhato = gyoker.write === 0 || gyoker.write === false ? ' [csak olvasható]' : '';
    naplo.info(`  ▸ ${gyoker.name}${irhato}`);
    naplo.info(`      hash: ${gyoker.hash}`);

    let evek: ElfinderFajl[];
    try {
      evek = (await kliens.gyerekek(gyoker.hash)).filter((f) => f.mime === 'directory');
    } catch (hiba) {
      naplo.figyelem(`      a tartalma nem olvasható: ${(hiba as Error).message}`);
      continue;
    }

    for (const ev of evek) {
      const honapok = (await kliens.gyerekek(ev.hash))
        .filter((f) => f.mime === 'directory')
        .map((f) => f.name)
        .sort();
      const felsorolas = honapok.length > 0 ? honapok.join(', ') : '(üres)';
      naplo.info(`      ${ev.name}/ → ${felsorolas}`);
    }
  }
  naplo.ures();
  naplo.info('Ha a feltöltési kötet neve más, mint amit vársz, állítsd a MASC_GYOKER értékét.');
}

async function fo(): Promise<number> {
  const ervek = process.argv.slice(2);
  let kapcsolok: Kapcsolok;
  try {
    kapcsolok = kapcsolokatErtelmez(ervek);
  } catch (hiba) {
    console.error(`✗ ${(hiba as Error).message}`);
    return 2;
  }

  if (kapcsolok.sugo || kapcsolok.parancs === '' || kapcsolok.parancs === 'sugo') {
    console.log(SUGO);
    return kapcsolok.parancs === '' && !kapcsolok.sugo ? 2 : 0;
  }

  if (kapcsolok.parancs !== 'felderit' && kapcsolok.parancs !== 'feltolt') {
    console.error(`✗ Ismeretlen parancs: ${kapcsolok.parancs}. Ismert: felderit, feltolt`);
    return 2;
  }

  // A beállításokat a naplózás ELŐTT töltjük be, hogy a titkokat a napló már
  // az első sortól rejteni tudja.
  let beallitasok;
  try {
    if (kapcsolok.beallitasFajl === ALAP_KONFIG && !existsSync(ALAP_KONFIG)) {
      console.error(
        `✗ Nincs beállításfájl: ${ALAP_KONFIG}\n` +
          '  Készítsd el a masc.env.pelda alapján:\n' +
          `      cp ${join(PROJEKT_MAPPA, 'masc.env.pelda')} ${ALAP_KONFIG}\n` +
          '  majd töltsd ki. A részletek: masc-feltolto/README.md',
      );
      return 2;
    }
    beallitasok = beallitasokatBetolt(kapcsolok.beallitasFajl);
  } catch (hiba) {
    if (hiba instanceof BeallitasHiba) {
      console.error(`✗ ${hiba.message}`);
      return 2;
    }
    throw hiba;
  }

  const naplo = new Naplo({
    bobeszedu: kapcsolok.bobeszedu,
    fajl: kapcsolok.naploFajl,
    titkok: titkok(beallitasok),
  });

  // A bizonylatokat a bejelentkezés ELŐTT gyűjtjük össze: ha a megadott
  // útvonalban hiba van, ne a kiszolgáló terhelése után derüljön ki.
  let bizonylatok: ReturnType<typeof bizonylatokatGyujt> = [];
  if (kapcsolok.parancs === 'feltolt') {
    if (kapcsolok.utak.length === 0) {
      naplo.hiba('Nem adtál meg fájlt vagy mappát. Például: feltolt ./bizonylatok');
      return 2;
    }
    try {
      bizonylatok = bizonylatokatGyujt(kapcsolok.utak, {
        rekurziv: kapcsolok.rekurziv,
        kiterjesztesek: kapcsolok.kiterjesztesek,
      });
    } catch (hiba) {
      if (hiba instanceof GyujtesHiba) {
        naplo.hiba(hiba.message);
        return 2;
      }
      throw hiba;
    }
    if (bizonylatok.length === 0) {
      naplo.figyelem('A megadott helyen nincs feltölthető bizonylat — nincs mit tenni.');
      return 0;
    }
    naplo.info(`${bizonylatok.length} bizonylat a feltöltésre.`);
  }

  const keres = new SutisKeres(naplo);
  let kliens: ElfinderKliens;
  let gyokerek: ElfinderFajl[];
  try {
    ({ kliens, gyokerek } = await belep(beallitasok, keres, naplo));
  } catch (hiba) {
    naplo.hiba((hiba as Error).message);
    return 1;
  }

  if (kapcsolok.parancs === 'felderit') {
    await felderit(kliens, gyokerek, naplo);
    return 0;
  }

  let gyoker: ElfinderFajl;
  try {
    gyoker = gyokeretValaszt(gyokerek, beallitasok.gyoker);
  } catch (hiba) {
    naplo.hiba((hiba as Error).message);
    return 1;
  }

  if (gyoker.write === 0 || gyoker.write === false) {
    naplo.hiba(`A(z) „${gyoker.name}" kötet csak olvasható — ide nem tudunk feltölteni.`);
    return 1;
  }

  const opciok: FeltoltesOpciok = {
    honap: kapcsolok.honap,
    fajlDatum: kapcsolok.fajlDatum,
    proba: kapcsolok.proba,
    felulir: kapcsolok.felulir,
    archivum: kapcsolok.archivum,
  };

  if (kapcsolok.proba) naplo.info('PRÓBAFUTÁS — semmi nem kerül fel, semmi nem jön létre.');
  if (!kapcsolok.fajlDatum) {
    const honap = kapcsolok.honap ?? {
      ev: String(new Date().getFullYear()),
      ho: String(new Date().getMonth() + 1).padStart(2, '0'),
    };
    naplo.info(`Célhónap: ${honapotFormaz(honap)} — a(z) „${gyoker.name}" köteten belül.`);
  }

  const osszegzes = await feltoltesLefuttat(kliens, gyoker, bizonylatok, opciok, naplo);

  naplo.ures();
  naplo.info(
    `Összegzés: ${osszegzes.feltoltve} feltöltve, ${osszegzes.kihagyva} kihagyva, ` +
      `${osszegzes.hibas} hibás.`,
  );

  return osszegzes.hibas > 0 ? 1 : 0;
}

fo()
  .then((kod) => {
    process.exitCode = kod;
  })
  .catch((hiba: unknown) => {
    // Ide csak az kerül, amire nem számítottunk. A verem is kell, mert ilyenkor
    // a hibajelentéshez az kell, nem az üzenet.
    console.error('✗ Váratlan hiba:');
    console.error(hiba);
    process.exitCode = 1;
  });
