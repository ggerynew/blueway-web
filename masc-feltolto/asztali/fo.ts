/**
 * Az asztali program fő folyamata: ablakok, üzenetváltás, ütemezés.
 *
 * Ez a réteg SZÁNDÉKOSAN VÉKONY. Minden érdemi tudás a ../src alatt van, ami
 * Electron nélkül fut és tesztelhető — a belépés, a feltöltés, a
 * nyilvántartás. Itt csak az van, amit tényleg az Electron ad: ablakok,
 * fájlválasztó, jelszavak védett tárolása.
 *
 * KÉT DOLOG, AMI ITT DŐL EL
 *
 * Egyetlen példány futhat. Ha a felhasználó kétszer kattint az ikonra, a
 * második indulás nem indíthat párhuzamos feltöltést ugyanabból a mappából —
 * abból duplikált bizonylat lenne. A második indítás ezért az elsőt hozza
 * előre.
 *
 * Induláskor magától nekifut. Amit tegnap nem sikerült feltölteni, az a
 * nyilvántartásban „hibás" állapotban áll; az indulási szinkron ezeket
 * ugyanúgy felveszi, mint az újakat. Ehhez a felhasználónak semmit nem kell
 * tennie — pontosan ez volt a kérés.
 */
import { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } from 'electron';
import { join } from 'node:path';

import { Allapottar, allapotUtvonala } from '../src/allapottar.js';
import { Cegtar, cegtarUtvonala, uresCeg, type Ceg, type Titkosito } from '../src/cegtar.js';
import { Kapcsolattar, type CegKapcsolat, type NaploSor } from '../src/szinkron.js';

/** Milyen sűrűn nézzük át magunktól a mappákat (ezredmásodperc). */
const SZINKRON_UTEM = 5 * 60 * 1000;

/**
 * Jelszavak védelme a Windows saját tárolójával (DPAPI).
 *
 * A titkosított érték csak ezen a gépen, csak ezzel a Windows-felhasználóval
 * fejthető vissza — a cégek.json fájlt elmásolva a jelszavak használhatatlanok.
 */
const titkosito: Titkosito = {
  elerheto: () => {
    try {
      return safeStorage.isEncryptionAvailable();
    } catch {
      return false;
    }
  },
  titkosit: (szoveg) => safeStorage.encryptString(szoveg).toString('base64'),
  visszafejt: (titkos) => safeStorage.decryptString(Buffer.from(titkos, 'base64')),
};

let cegtar: Cegtar;
const kapcsolattar = new Kapcsolattar();
let foAblak: BrowserWindow | undefined;
const cegAblakok = new Map<string, BrowserWindow>();
let utemezo: NodeJS.Timeout | undefined;

function feluletUt(fajl: string): string {
  return join(app.getAppPath(), 'asztali', 'felulet', fajl);
}

/** Üzenet minden nyitott ablaknak. */
function mindenkinek(csatorna: string, ...ervek: unknown[]): void {
  for (const ablak of BrowserWindow.getAllWindows()) {
    if (!ablak.isDestroyed()) ablak.webContents.send(csatorna, ...ervek);
  }
}

/**
 * A cég adatai a felület felé — jelszó NÉLKÜL.
 *
 * A jelszót nem küldjük ki az ablakba: a szerkesztőmezőben üresen jelenik meg,
 * és ha a felhasználó nem ír bele újat, marad a régi. Így a jelszó nem kerül
 * bele az űrlap DOM-jába, és nem is látszik, ha valaki a képernyőt mutatja.
 */
function cegetKikuld(ceg: Ceg): unknown {
  return {
    ...ceg,
    lepesek: ceg.lepesek.map((lepes) => ({
      ...lepes,
      jelszo: '',
      vanJelszo: lepes.jelszo !== '',
    })),
  };
}

/** A felületről érkező cég visszaalakítása: az üres jelszó a régit jelenti. */
function cegetVisszavesz(bejovo: Ceg, eredeti?: Ceg): Ceg {
  return {
    ...bejovo,
    lepesek: bejovo.lepesek.map((lepes, index) => ({
      ...lepes,
      jelszo: lepes.jelszo !== '' ? lepes.jelszo : (eredeti?.lepesek[index]?.jelszo ?? ''),
    })),
  };
}

/** Kapcsolat egy céghez, eseményekkel a felület felé bekötve. */
function kapcsolatot(ceg: Ceg): CegKapcsolat {
  const meglevo = kapcsolattar.keres(ceg.id);
  if (meglevo) return meglevo;

  const kapcsolat = kapcsolattar.szerez(ceg, (cegId) =>
    new Allapottar(allapotUtvonala(app.getPath('userData'), cegId)),
  );
  kapcsolat.on('valtozas', (nezet: unknown) => mindenkinek('ceg:valtozas', nezet));
  kapcsolat.on('naplo', (sor: NaploSor) => mindenkinek('ceg:naplo', ceg.id, sor));
  kapcsolat.on('fajl', (ut: string, allapot: string, uzenet?: string) =>
    mindenkinek('ceg:fajl', ceg.id, ut, allapot, uzenet),
  );
  return kapcsolat;
}

/** Minden nyilvántartott céghez kapcsolat, hogy a főképernyő listázni tudja. */
function kapcsolatokatFrissit(): CegKapcsolat[] {
  const cegek = cegtar.betolt();
  const ismertek = new Set(cegek.map((c) => c.id));

  for (const kapcsolat of kapcsolattar.osszes()) {
    if (!ismertek.has(kapcsolat.ceg.id)) kapcsolattar.eltavolit(kapcsolat.ceg.id);
  }
  return cegek.map((ceg) => {
    const kapcsolat = kapcsolatot(ceg);
    // A cég adatai a fájlban változhattak, amíg a kapcsolat élt.
    if (kapcsolat.ceg !== ceg) kapcsolat.ceg = ceg;
    return kapcsolat;
  });
}

function foAblakotNyit(): void {
  foAblak = new BrowserWindow({
    width: 940,
    height: 660,
    minWidth: 720,
    minHeight: 480,
    title: 'MASC bizonylat-feltöltő',
    backgroundColor: '#f4f1f6',
    webPreferences: {
      preload: join(app.getAppPath(), 'asztali', 'hid.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  foAblak.removeMenu();
  void foAblak.loadFile(feluletUt('fo.html'));
  foAblak.on('closed', () => {
    foAblak = undefined;
  });
}

function cegAblakotNyit(cegId: string): void {
  const meglevo = cegAblakok.get(cegId);
  if (meglevo && !meglevo.isDestroyed()) {
    meglevo.focus();
    return;
  }

  const ceg = cegtar.betolt().find((c) => c.id === cegId);
  if (!ceg) return;

  const ablak = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 760,
    minHeight: 500,
    title: ceg.nev,
    backgroundColor: '#f4f1f6',
    webPreferences: {
      preload: join(app.getAppPath(), 'asztali', 'hid.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  ablak.removeMenu();
  void ablak.loadFile(feluletUt('ceg.html'), { query: { ceg: cegId } });
  ablak.on('closed', () => cegAblakok.delete(cegId));
  cegAblakok.set(cegId, ablak);
}

/**
 * Indulási menet: csatlakozás és szinkronizálás minden automata cégnél.
 *
 * Sorban, nem egyszerre: a MASC ugyanaz a kiszolgáló minden cégnél, és a
 * párhuzamos belépés összeakaszthatja a munkameneteket.
 */
async function indulasiSzinkron(): Promise<void> {
  for (const kapcsolat of kapcsolatokatFrissit()) {
    if (!kapcsolat.ceg.automata) continue;
    try {
      await kapcsolat.csatlakoz();
      await kapcsolat.szinkronizal();
    } catch {
      // A hibát a kapcsolat már naplózta és az állapotába is beírta; a
      // felület mutatja. Egy cég elakadása nem foghatja meg a többit.
    }
  }
}

/** Időzített szinkron: a nap közben bekerülő bizonylatokért. */
async function utemezettSzinkron(): Promise<void> {
  for (const kapcsolat of kapcsolattar.osszes()) {
    if (!kapcsolat.ceg.automata) continue;
    if (kapcsolat.nezet().szinkronFut) continue;
    try {
      await kapcsolat.szinkronizal();
    } catch {
      // Ugyanaz: a felület jelzi, a következő ütemre újra próbáljuk.
    }
  }
}

function uzenetkezelestBeallit(): void {
  ipcMain.handle('cegek:lista', () =>
    kapcsolatokatFrissit().map((k) => ({ ceg: cegetKikuld(k.ceg), nezet: k.nezet() })),
  );

  ipcMain.handle('cegek:uj', () => cegetKikuld(uresCeg()));

  ipcMain.handle('cegek:jelszoMenthetoE', () => cegtar.jelszoMentheto());

  ipcMain.handle('cegek:ment', (_esemeny, bejovo: Ceg) => {
    const eredeti = cegtar.betolt().find((c) => c.id === bejovo.id);
    const ceg = cegetVisszavesz(bejovo, eredeti);
    cegtar.rogzit(ceg);

    const kapcsolat = kapcsolattar.keres(ceg.id);
    if (kapcsolat) kapcsolat.cegetFrissit(ceg);

    const ablak = cegAblakok.get(ceg.id);
    if (ablak && !ablak.isDestroyed()) ablak.setTitle(ceg.nev);

    mindenkinek('cegek:frissult');
    return { rendben: true };
  });

  ipcMain.handle('cegek:torol', (_esemeny, cegId: string) => {
    cegtar.torol(cegId);
    kapcsolattar.eltavolit(cegId);
    cegAblakok.get(cegId)?.close();
    mindenkinek('cegek:frissult');
    return { rendben: true };
  });

  ipcMain.handle('ceg:adat', (_esemeny, cegId: string) => {
    const ceg = cegtar.betolt().find((c) => c.id === cegId);
    if (!ceg) return undefined;
    const kapcsolat = kapcsolatot(ceg);
    return {
      ceg: cegetKikuld(ceg),
      nezet: kapcsolat.nezet(),
      fajlok: kapcsolat.fajlok(),
      naplo: kapcsolat.naplo_sorok(),
    };
  });

  ipcMain.handle('ceg:csatlakoz', async (_esemeny, cegId: string) => {
    const kapcsolat = kapcsolattar.keres(cegId);
    if (!kapcsolat) return { rendben: false, uzenet: 'Ismeretlen cég.' };
    try {
      await kapcsolat.csatlakoz();
      return { rendben: true };
    } catch (hiba) {
      return { rendben: false, uzenet: (hiba as Error).message };
    }
  });

  ipcMain.handle('ceg:lecsatlakoz', (_esemeny, cegId: string) => {
    kapcsolattar.keres(cegId)?.lecsatlakoz();
    return { rendben: true };
  });

  ipcMain.handle('ceg:szinkron', async (_esemeny, cegId: string) => {
    const kapcsolat = kapcsolattar.keres(cegId);
    if (!kapcsolat) return { rendben: false, uzenet: 'Ismeretlen cég.' };
    try {
      const osszegzes = await kapcsolat.szinkronizal();
      return { rendben: true, osszegzes };
    } catch (hiba) {
      return { rendben: false, uzenet: (hiba as Error).message };
    }
  });

  ipcMain.handle('ceg:atvizsgal', (_esemeny, cegId: string) => {
    const kapcsolat = kapcsolattar.keres(cegId);
    if (!kapcsolat) return [];
    try {
      return kapcsolat.atvizsgal();
    } catch (hiba) {
      return { hiba: (hiba as Error).message };
    }
  });

  ipcMain.handle('ceg:fajlok', (_esemeny, cegId: string) =>
    kapcsolattar.keres(cegId)?.fajlok() ?? [],
  );

  ipcMain.handle('ceg:ujraSorba', (_esemeny, cegId: string, ut: string) => {
    kapcsolattar.keres(cegId)?.ujraSorba(ut);
    return { rendben: true };
  });

  ipcMain.handle('ceg:ablak', (_esemeny, cegId: string) => {
    cegAblakotNyit(cegId);
    return { rendben: true };
  });

  ipcMain.handle('mappa:valaszt', async (esemeny) => {
    const ablak = BrowserWindow.fromWebContents(esemeny.sender);
    const valasz = ablak
      ? await dialog.showOpenDialog(ablak, { properties: ['openDirectory', 'multiSelections'] })
      : await dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] });
    return valasz.canceled ? [] : valasz.filePaths;
  });

  ipcMain.handle('fajl:mutat', (_esemeny, ut: string) => {
    // Megmutatja a fájlt az Intézőben. Megnyitni NEM nyitjuk meg: a program
    // bizonylatokkal dolgozik, és egy véletlen kattintás ne indítson el
    // semmit a felhasználó gépén.
    shell.showItemInFolder(ut);
    return { rendben: true };
  });
}

// Egyetlen példány: a párhuzamos futás ugyanabból a mappából duplikált
// feltöltést okozhatna.
const egyediZar = app.requestSingleInstanceLock();
if (!egyediZar) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (foAblak) {
      if (foAblak.isMinimized()) foAblak.restore();
      foAblak.focus();
    }
  });

  void app.whenReady().then(async () => {
    cegtar = new Cegtar(cegtarUtvonala(app.getPath('userData')), titkosito);
    uzenetkezelestBeallit();
    foAblakotNyit();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) foAblakotNyit();
    });

    await indulasiSzinkron();
    utemezo = setInterval(() => void utemezettSzinkron(), SZINKRON_UTEM);
  });

  app.on('window-all-closed', () => {
    if (utemezo) clearInterval(utemezo);
    if (process.platform !== 'darwin') app.quit();
  });
}
