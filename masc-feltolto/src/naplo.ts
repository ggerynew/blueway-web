/**
 * Naplózás — emberi szemnek és utólagos ellenőrzésre.
 *
 * A feltöltés könyvelési bizonylatokkal dolgozik, ezért a „megtörtént-e"
 * kérdésre hónapokkal később is válaszolni kell tudni. A képernyőre rövid,
 * magyar mondatok mennek, a naplófájlba pedig időbélyeges sorok — ugyanaz az
 * esemény, két olvasónak.
 *
 * Titkot nem írunk ki: a süti és a jelszó soha nem kerül se képernyőre, se
 * fájlba. Ezért van a `rejt()` — a hibaüzenetekbe ugyanis a legváratlanabb
 * helyen csúszik bele egy fejléc.
 */
import { appendFileSync } from 'node:fs';

export interface NaploBeallitas {
  /** Részletes kimenet: minden HTTP-kérés és válasz fejléce. */
  bobeszedu?: boolean;
  /** Ide is írjuk a sorokat, ha meg van adva. */
  fajl?: string;
  /** Ezek a szövegrészletek soha nem jelenhetnek meg (süti, jelszó). */
  titkok?: string[];
  /**
   * Minden sor átadása egy figyelőnek — az asztali felület ezzel mutatja a
   * futás naplóját az ablakban. A titkok itt is ki vannak takarva: a figyelő
   * ugyanazt a rejtett szöveget kapja, mint a képernyő.
   */
  figyelo?: (jel: string, uzenet: string) => void;
  /** Ne írjunk a képernyőre — csak a figyelőnek és a fájlnak. */
  nemaKepernyo?: boolean;
}

export class Naplo {
  private bobeszedu: boolean;
  private fajl?: string;
  private titkok: string[];
  private figyelo?: (jel: string, uzenet: string) => void;
  private nemaKepernyo: boolean;

  constructor(beallitas: NaploBeallitas = {}) {
    this.bobeszedu = beallitas.bobeszedu ?? false;
    this.fajl = beallitas.fajl;
    this.figyelo = beallitas.figyelo;
    this.nemaKepernyo = beallitas.nemaKepernyo ?? false;
    // Az üres füzért ki kell szűrni, különben minden karakterhatárra illeszkedne.
    this.titkok = (beallitas.titkok ?? []).filter((t) => t.length > 3);
  }

  /** Kicseréli a titkokat a szövegben, mielőtt bárhová kikerülne. */
  private rejt(szoveg: string): string {
    let eredmeny = szoveg;
    for (const titok of this.titkok) {
      eredmeny = eredmeny.split(titok).join('«rejtve»');
    }
    return eredmeny;
  }

  private ir(jel: string, uzenet: string): void {
    const tiszta = this.rejt(uzenet);
    if (!this.nemaKepernyo) console.log(`${jel} ${tiszta}`);
    if (this.figyelo) {
      try {
        this.figyelo(jel, tiszta);
      } catch {
        // A felület hibája ne állítsa meg a feltöltést.
      }
    }
    if (this.fajl) {
      const ido = new Date().toISOString();
      try {
        appendFileSync(this.fajl, `${ido} ${jel} ${tiszta}\n`, 'utf8');
      } catch {
        // A naplófájl hibája nem állíthatja meg a feltöltést — a képernyőre
        // már kiírtuk a sort, az a fontosabb.
      }
    }
  }

  /** Semleges tájékoztatás. */
  info(uzenet: string): void {
    this.ir(' ', uzenet);
  }

  /** Sikeres lépés. */
  siker(uzenet: string): void {
    this.ir('✓', uzenet);
  }

  /** Kihagyott, de nem hibás eset (pl. a fájl már fent van). */
  kihagy(uzenet: string): void {
    this.ir('·', uzenet);
  }

  /** Figyelmeztetés: a futás megy tovább, de érdemes megnézni. */
  figyelem(uzenet: string): void {
    this.ir('!', uzenet);
  }

  /** Hiba. */
  hiba(uzenet: string): void {
    this.ir('✗', uzenet);
  }

  /** Csak `--bobeszedu` mellett látszik. */
  reszlet(uzenet: string): void {
    if (this.bobeszedu) this.ir('…', uzenet);
  }

  /** Üres sor a szakaszok közé — a naplófájlba nem megy. */
  ures(): void {
    console.log('');
  }
}
