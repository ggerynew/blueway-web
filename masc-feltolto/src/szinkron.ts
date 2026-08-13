/**
 * Egy cég kapcsolata és szinkronizálása.
 *
 * Ez a modul köti össze a darabokat: a cég adatait, a belépést, a figyelt
 * mappákat és a feltöltési nyilvántartást. Egy példány egy céget képvisel —
 * a felületen egy sor a főképernyőn, és egy külön ablak.
 *
 * MIÉRT ÉL TOVÁBB A KAPCSOLAT
 *
 * A parancssori változat minden futáskor újra belépett. Az asztali programnál
 * ez pazarlás lenne: a felhasználó megnyitja reggel, és a nap során többször
 * kerülnek be bizonylatok. Ezért a belépett munkamenetet megtartjuk, és a
 * szinkronizálás már csak feltölt. Ha a munkamenet közben lejár, azt a
 * kiszolgáló válaszából vesszük észre, és a felület jelzi — újracsatlakozni
 * egy gombnyomás.
 *
 * MIÉRT ESEMÉNYEKKEL BESZÉL
 *
 * A feltöltés hosszú művelet. Ha a felület csak a végén kapna választ, a
 * felhasználó percekig nem látna semmit, és azt hinné, megállt a program.
 * Ezért minden állapotváltozás és naplósor azonnal esemény formájában megy
 * ki, az ablak pedig menet közben frissül.
 */
import { EventEmitter } from 'node:events';

import { Allapottar, type FajlNezet } from './allapottar.js';
import { belepEsKotetek, gyokeretValaszt } from './bejelentkezes.js';
import type { Bizonylat } from './bizonylatok.js';
import type { ElfinderFajl, ElfinderKliens } from './elfinder.js';
import type { Ceg } from './cegtar.js';
import { feltoltesLefuttat } from './feltolto.js';
import { Naplo } from './naplo.js';
import { SutisKeres } from './sutis-keres.js';

export type KapcsolatAllapot = 'lecsatlakozva' | 'csatlakozik' | 'csatlakozva' | 'hiba';

/** Amit a felület lát egy cégről. */
export interface CegNezet {
  cegId: string;
  nev: string;
  allapot: KapcsolatAllapot;
  /** Rövid, emberi mondat: mi történt legutóbb. */
  uzenet: string;
  /** A belépés után megtalált kötet neve — ez igazolja, hogy jó helyen járunk. */
  kotetNev?: string;
  szinkronFut: boolean;
  osszegzes: { varakozik: number; feltoltve: number; hibas: number };
  /** Az utolsó sikeres szinkronizálás ideje (Unix ms), ha volt. */
  utolsoSzinkron?: number;
}

/** Egy naplósor a felület számára. */
export interface NaploSor {
  jel: string;
  uzenet: string;
  ido: number;
}

export class CegKapcsolat extends EventEmitter {
  ceg: Ceg;
  allapottar: Allapottar;

  private allapot: KapcsolatAllapot = 'lecsatlakozva';
  private uzenet = 'Nincs csatlakozva.';
  private kliens?: ElfinderKliens;
  private kotet?: ElfinderFajl;
  private szinkronFut = false;
  private utolsoSzinkron?: number;
  private naplo: Naplo;
  /** A legutóbbi naplósorok — az ablak megnyitásakor ezt mutatjuk. */
  private naploSorok: NaploSor[] = [];

  constructor(ceg: Ceg, allapottar: Allapottar) {
    super();
    this.ceg = ceg;
    this.allapottar = allapottar;
    this.naplo = new Naplo({
      nemaKepernyo: true,
      titkok: ceg.lepesek.map((l) => l.jelszo),
      figyelo: (jel, uzenet) => this.naplotRogzit(jel, uzenet),
    });
  }

  private naplotRogzit(jel: string, uzenet: string): void {
    const sor: NaploSor = { jel, uzenet, ido: Date.now() };
    this.naploSorok.push(sor);
    // Nem növesztjük korlátlanul: a program napokig futhat egyben.
    if (this.naploSorok.length > 500) this.naploSorok.splice(0, this.naploSorok.length - 500);
    this.emit('naplo', sor);
  }

  naplo_sorok(): NaploSor[] {
    return [...this.naploSorok];
  }

  nezet(): CegNezet {
    const nezet: CegNezet = {
      cegId: this.ceg.id,
      nev: this.ceg.nev,
      allapot: this.allapot,
      uzenet: this.uzenet,
      szinkronFut: this.szinkronFut,
      osszegzes: this.allapottar.osszegzes(),
    };
    if (this.kotet) nezet.kotetNev = this.kotet.name;
    if (this.utolsoSzinkron !== undefined) nezet.utolsoSzinkron = this.utolsoSzinkron;
    return nezet;
  }

  private allapotot(allapot: KapcsolatAllapot, uzenet: string): void {
    this.allapot = allapot;
    this.uzenet = uzenet;
    this.emit('valtozas', this.nezet());
  }

  csatlakozva(): boolean {
    return this.allapot === 'csatlakozva' && this.kliens !== undefined;
  }

  /** A cég adatainak cseréje (szerkesztés után). A kapcsolat bontásra kerül. */
  cegetFrissit(ceg: Ceg): void {
    this.ceg = ceg;
    this.lecsatlakoz('A beállítások módosultak — csatlakozz újra.');
  }

  /**
   * Belépés a lépcsőkön, majd a feltöltési kötet megkeresése.
   *
   * A kötetet MOST keressük meg, nem a feltöltéskor: így a hibás kötetnév
   * azonnal kiderül, nem csak akkor, amikor már bizonylatot küldenénk.
   */
  async csatlakoz(): Promise<void> {
    if (this.allapot === 'csatlakozik') return;

    this.allapotot('csatlakozik', 'Bejelentkezés…');
    const keres = new SutisKeres(this.naplo);

    try {
      const { kliens, gyokerek } = await belepEsKotetek(
        { konnektor: this.ceg.konnektor, lepesek: this.ceg.lepesek },
        keres,
        this.naplo,
      );
      const kotet = gyokeretValaszt(gyokerek, this.ceg.gyoker);

      if (kotet.write === 0 || kotet.write === false) {
        throw new Error(`A(z) „${kotet.name}" kötet csak olvasható — ide nem lehet feltölteni.`);
      }

      this.kliens = kliens;
      this.kotet = kotet;
      this.allapotot('csatlakozva', `Csatlakozva — ${kotet.name}`);
      this.naplo.siker(`Kötet: ${kotet.name}`);
    } catch (hiba) {
      this.kliens = undefined;
      delete this.kotet;
      const uzenet = (hiba as Error).message;
      this.naplo.hiba(uzenet);
      this.allapotot('hiba', uzenet);
      throw hiba;
    }
  }

  /**
   * Lecsatlakozás.
   *
   * Nincs mit „bontani": a HTTP munkamenet a sütiben él, azt eldobjuk. A
   * kiszolgálón a munkamenet magától jár le — kijelentkezési végpontot
   * szándékosan nem hívunk, mert annak a címét nem ismerjük, és egy rossz
   * tipp a felhasználó BÖNGÉSZŐBELI munkamenetét is kiléptethetné.
   */
  lecsatlakoz(uzenet = 'Lecsatlakozva.'): void {
    this.kliens = undefined;
    delete this.kotet;
    this.allapotot('lecsatlakozva', uzenet);
  }

  /** A figyelt mappák átnézése — csatlakozás nélkül is működik. */
  atvizsgal(): FajlNezet[] {
    const lista = this.allapottar.atvizsgal(this.ceg.mappak, {
      rekurziv: this.ceg.rekurziv,
      kiterjesztesek: this.ceg.kiterjesztesek.length > 0 ? this.ceg.kiterjesztesek : undefined,
      fajlDatum: this.ceg.fajlDatum,
    });
    this.emit('valtozas', this.nezet());
    return lista;
  }

  fajlok(): FajlNezet[] {
    return this.allapottar.osszes();
  }

  /**
   * Szinkronizálás: mappák átnézése, majd a hátralévők feltöltése.
   *
   * Ide tartozik az ÚJRAPRÓBÁLKOZÁS is: a nyilvántartásban hibásként szereplő
   * fájlok ugyanúgy a feltöltendők közé kerülnek, mint az újak. Ezért elég a
   * programot elindítani ahhoz, hogy a tegnap elakadt bizonylatok felmenjenek.
   */
  async szinkronizal(): Promise<{ feltoltve: number; hibas: number; kihagyva: number }> {
    if (this.szinkronFut) {
      throw new Error('Ennél a cégnél már fut egy szinkronizálás.');
    }

    this.szinkronFut = true;
    this.emit('valtozas', this.nezet());

    try {
      this.atvizsgal();
      const feltoltendok = this.allapottar.feltoltendok();

      if (feltoltendok.length === 0) {
        this.naplo.info('Nincs feltöltendő bizonylat.');
        this.utolsoSzinkron = Date.now();
        return { feltoltve: 0, hibas: 0, kihagyva: 0 };
      }

      if (!this.csatlakozva()) await this.csatlakoz();
      const kliens = this.kliens;
      const kotet = this.kotet;
      if (!kliens || !kotet) throw new Error('Nincs élő kapcsolat a szinkronizáláshoz.');

      this.naplo.info(`${feltoltendok.length} bizonylat feltöltésre vár.`);

      const bizonylatok: Bizonylat[] = feltoltendok.map((b) => ({
        utvonal: b.ut,
        nev: b.nev,
        meret: b.meret,
        modositva: new Date(b.modositva),
      }));

      const osszegzes = await feltoltesLefuttat(
        kliens,
        kotet,
        bizonylatok,
        {
          fajlDatum: this.ceg.fajlDatum,
          proba: false,
          felulir: false,
          jelentes: (ut, allapot, uzenet) => {
            this.allapottar.jelol(ut, allapot, uzenet);
            // Fájlonként mentünk: ha a program váratlanul leáll, ne vesszen
            // el, hogy meddig jutottunk.
            this.allapottar.ment();
            this.emit('fajl', ut, allapot, uzenet);
            this.emit('valtozas', this.nezet());
          },
        },
        this.naplo,
      );

      this.allapottar.ment();
      this.utolsoSzinkron = Date.now();

      // A lejárt munkamenet ugyanúgy hibaként érkezik, mint bármi más. Ha
      // MINDEN elbukott, az szinte biztosan a kapcsolat, nem a fájlok baja —
      // ilyenkor a kapcsolatot is hibásnak jelöljük, hogy a felület újra-
      // csatlakozást ajánljon.
      if (osszegzes.feltoltve === 0 && osszegzes.hibas === feltoltendok.length) {
        this.allapotot('hiba', 'Egyetlen bizonylat sem ment fel — lejárt a munkamenet?');
      }

      return osszegzes;
    } finally {
      this.szinkronFut = false;
      this.emit('valtozas', this.nezet());
    }
  }

  /** Egy hibás fájl visszatétele a sorba, kézi kérésre. */
  ujraSorba(ut: string): void {
    this.allapottar.ujraSorba(ut);
    this.allapottar.ment();
    this.emit('valtozas', this.nezet());
  }
}

/**
 * Az összes cég kapcsolatait tartja nyilván.
 *
 * Az azonosító szerinti nyilvántartás azért kell, mert a cégablakok külön
 * élnek: egy ablak a saját cégének a kapcsolatát keresi meg, nem sorszám
 * szerint — a sorrend ugyanis a cégek törlésével felborulna.
 */
export class Kapcsolattar {
  private kapcsolatok = new Map<string, CegKapcsolat>();

  /** Meglévő kapcsolat, vagy új létrehozása. */
  szerez(ceg: Ceg, allapottarKeszito: (cegId: string) => Allapottar): CegKapcsolat {
    const meglevo = this.kapcsolatok.get(ceg.id);
    if (meglevo) return meglevo;
    const uj = new CegKapcsolat(ceg, allapottarKeszito(ceg.id));
    this.kapcsolatok.set(ceg.id, uj);
    return uj;
  }

  keres(cegId: string): CegKapcsolat | undefined {
    return this.kapcsolatok.get(cegId);
  }

  osszes(): CegKapcsolat[] {
    return [...this.kapcsolatok.values()];
  }

  eltavolit(cegId: string): void {
    this.kapcsolatok.get(cegId)?.lecsatlakoz();
    this.kapcsolatok.delete(cegId);
  }
}
