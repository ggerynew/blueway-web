/**
 * Beállítások betöltése és ellenőrzése.
 *
 * A hozzáférési adatok NEM a repóban vannak, hanem egy `masc.env` fájlban a
 * projekt mappájában (a .gitignore kizárja). Ugyanezek környezeti változóból
 * is jöhetnek — így a program ütemezve, GitHub Actionsben vagy Feladatütemezőn
 * keresztül is fut, ahol fájl helyett titkokat adunk át.
 *
 * A sorrend: környezeti változó ELŐBBRE való a fájlnál. Ütemezett futásnál ez
 * a fontos, mert ott a fájl legfeljebb egy régi, ottfelejtett példány lehet.
 */
import { readFileSync, existsSync } from 'node:fs';

export interface Beallitasok {
  /** Az elFinder konnektor teljes URL-je (ide megy minden parancs). */
  konnektor: string;
  /** Munkamenet-süti, ahogy a böngészőből kimásoltad: `PHPSESSID=...`. */
  suti?: string;
  /** Űrlapos bejelentkezéshez: a belépési oldal URL-je. */
  belepesUrl?: string;
  felhasznalo?: string;
  jelszo?: string;
  /** Az űrlap mezőneve — telephelyenként más lehet. */
  mezoFelhasznalo: string;
  mezoJelszo: string;
  /**
   * Melyik kötetbe töltsünk. Névtöredék: a MASC fáján a „Blueway Trade Kft -
   * Feltöltés" kötet neve szerepel, ebből a „Feltöltés" elég az azonosításhoz.
   * Ez azért nem a kötet hash-e, mert a hash a szerver újraindításakor vagy a
   * kötet átkötésekor megváltozhat, a név nem.
   */
  gyoker: string;
}

/** A `.env` alakú fájlok egyszerű beolvasása. */
function envFajlBeolvas(utvonal: string): Record<string, string> {
  const eredmeny: Record<string, string> = {};
  const tartalom = readFileSync(utvonal, 'utf8');
  for (const nyersSor of tartalom.split(/\r?\n/)) {
    const sor = nyersSor.trim();
    if (sor === '' || sor.startsWith('#')) continue;
    const hatar = sor.indexOf('=');
    if (hatar === -1) continue;
    const kulcs = sor.slice(0, hatar).trim();
    let ertek = sor.slice(hatar + 1).trim();
    // Az idézőjel elhagyható, de ha ott van, ne kerüljön bele az értékbe.
    // Jelszóban gyakran van szóköz vagy `#`, ezért idézőjelbe szokás tenni.
    if (
      (ertek.startsWith('"') && ertek.endsWith('"') && ertek.length > 1) ||
      (ertek.startsWith("'") && ertek.endsWith("'") && ertek.length > 1)
    ) {
      ertek = ertek.slice(1, -1);
    }
    eredmeny[kulcs] = ertek;
  }
  return eredmeny;
}

export class BeallitasHiba extends Error {}

/**
 * Összeállítja a beállításokat a környezetből és a megadott fájlból.
 *
 * @param fajlUtvonal a konfigfájl útvonala; ha nincs ilyen fájl, csak a
 *   környezeti változók számítanak (ütemezett futásnál ez a szokásos)
 */
export function beallitasokatBetolt(fajlUtvonal?: string): Beallitasok {
  const fajlbol: Record<string, string> =
    fajlUtvonal && existsSync(fajlUtvonal) ? envFajlBeolvas(fajlUtvonal) : {};

  const ertek = (kulcs: string): string | undefined => {
    const kornyezetbol = process.env[kulcs];
    if (kornyezetbol !== undefined && kornyezetbol !== '') return kornyezetbol;
    const f = fajlbol[kulcs];
    return f !== undefined && f !== '' ? f : undefined;
  };

  const konnektor = ertek('MASC_KONNEKTOR');
  if (!konnektor) {
    throw new BeallitasHiba(
      'Hiányzik a MASC_KONNEKTOR — az elFinder konnektor URL-je.\n' +
        'Hogyan tudod meg: nyisd meg a masc.hu-t bejelentkezve, F12 →\n' +
        'Hálózat (Network) fül, majd kattints egy mappára a fán. A megjelenő\n' +
        'kérés címe a konnektor URL-je (általában .../connector.php).',
    );
  }
  let ellenorzottUrl: URL;
  try {
    ellenorzottUrl = new URL(konnektor);
  } catch {
    throw new BeallitasHiba(`A MASC_KONNEKTOR nem érvényes URL: ${konnektor}`);
  }
  if (ellenorzottUrl.protocol !== 'https:' && ellenorzottUrl.hostname !== 'localhost' &&
      ellenorzottUrl.hostname !== '127.0.0.1') {
    // Bizonylat és munkamenet-süti megy át a vonalon: titkosítás nélkül nem.
    // A localhost kivétel a teszt-konnektor miatt kell.
    throw new BeallitasHiba(
      `A MASC_KONNEKTOR csak https:// lehet (kapott: ${ellenorzottUrl.protocol}//). ` +
        'Titkosítatlan kapcsolaton a munkamenet-süti és a bizonylat is olvasható.',
    );
  }

  const suti = ertek('MASC_SUTI');
  const belepesUrl = ertek('MASC_BELEPES_URL');
  const felhasznalo = ertek('MASC_FELHASZNALO');
  const jelszo = ertek('MASC_JELSZO');

  if (!suti && !(belepesUrl && felhasznalo && jelszo)) {
    throw new BeallitasHiba(
      'Nincs megadva, hogyan jelentkezzünk be. Kétféle mód van:\n' +
        '  1) MASC_SUTI — a böngészőből kimásolt munkamenet-süti (a legegyszerűbb)\n' +
        '  2) MASC_BELEPES_URL + MASC_FELHASZNALO + MASC_JELSZO — űrlapos belépés\n' +
        'A részletek a masc-feltolto/README.md fájlban.',
    );
  }

  return {
    konnektor,
    suti,
    belepesUrl,
    felhasznalo,
    jelszo,
    mezoFelhasznalo: ertek('MASC_MEZO_FELHASZNALO') ?? 'username',
    mezoJelszo: ertek('MASC_MEZO_JELSZO') ?? 'password',
    gyoker: ertek('MASC_GYOKER') ?? 'Feltöltés',
  };
}

/** A naplóból kitiltandó szövegek — ezek soha nem kerülhetnek kimenetre. */
export function titkok(b: Beallitasok): string[] {
  return [b.suti, b.jelszo].filter((t): t is string => typeof t === 'string' && t !== '');
}
