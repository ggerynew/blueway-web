/**
 * elFinder kliens — a MASC fájlkezelőjének protokollja.
 *
 * MIÉRT ÍGY, ÉS NEM BÖNGÉSZŐVEL
 *
 * A masc.hu-n egy elFinder 2.1.57 fut (a „Erről a programról" ablak szerint,
 * protokoll 2.1057). Az elFinder felülete JavaScript, de MÖGÖTTE egy
 * dokumentált JSON-protokoll van: a böngésző is csak parancsokat küld egy
 * „konnektor" végpontnak (`cmd=open`, `cmd=mkdir`, `cmd=upload`), és JSON-t
 * kap vissza. Ezért nem kell böngészőt vezérelni: ugyanazokat a kéréseket
 * elküldjük mi is. Ez gyorsabb, ütemezhető, nem törik el a felület
 * átszínezésétől, és nincs szükség grafikus környezetre a gépen.
 *
 * A HASH-EKRŐL
 *
 * Az elFinder minden mappát és fájlt egy „hash" azonosítóval nevez meg —
 * ilyet láttunk a böngésző címsorában is: `#elf_l1_MjAyNg`. Ez két részből
 * áll: a kötet azonosítója (`l1_`), utána az útvonal base64-e, amiben a
 * `+ / =` jelek helyén `- _ .` áll, a végéről a pontok levágva
 * (`MjAyNg` = „2026").
 *
 * Kiszámítani MI SZÁNDÉKOSAN NEM számítjuk. Az elFinder ugyanis titkosíthatja
 * is az útvonalat (a `crypt()` felüldefiniálható), és a kötet azonosítója a
 * beállítás változásakor elcsúszhat. Ehelyett navigálunk: megnyitjuk a
 * gyökeret, NÉV szerint megkeressük a mappát, és a szervertől kapott hash-t
 * használjuk. A név stabil, a hash nem.
 */
import type { Naplo } from './naplo.ts';
import type { SutisKeres } from './sutis-keres.ts';

export interface ElfinderFajl {
  hash: string;
  /** A szülőmappa hash-e. Kötetgyökérnél hiányzik vagy önmagára mutat. */
  phash?: string;
  name: string;
  /** Mappánál `directory`. */
  mime: string;
  size?: number;
  /** Módosítás ideje, Unix másodpercben. */
  ts?: number;
  read?: number | boolean;
  write?: number | boolean;
  locked?: number | boolean;
  /** 1, ha a mappának van almappája. */
  dirs?: number;
  /** Csak kötetgyökéren. */
  volumeid?: string;
}

interface NyitasValasz {
  cwd?: ElfinderFajl;
  files?: ElfinderFajl[];
  /** Hány fájl mehet egy feltöltési kérésben. Az elFinder alapértéke 20. */
  uplMaxFile?: number | string;
  /** Legnagyobb feltölthető méret, pl. „16M". */
  uplMaxSize?: string;
}

/** Feltöltésre szánt bizonylat, már beolvasva. */
export interface FeltoltendoFajl {
  nev: string;
  tartalom: Buffer;
  /** Módosítás ideje Unix másodpercben — a szerveren is ez lesz beállítva. */
  mtime: number;
}

export class ElfinderHiba extends Error {}

/**
 * Az elFinder hibakódjainak magyar megfelelője.
 *
 * A konnektor nem szöveget, hanem kódot küld (`errAccess`), a fordítást a
 * böngészőben a felület végzi. Nálunk nincs felület, tehát itt kell lefordítani
 * — különben a felhasználó egy értelmezhetetlen angol azonosítót lát.
 */
const HIBAK: Record<string, string> = {
  errUnknownCmd: 'ismeretlen parancs — nem ez a konnektor URL-je?',
  errAccess: 'nincs jogosultság (lejárt a munkamenet? jelentkezz be újra)',
  errPerm: 'a művelet nem engedélyezett ezen a mappán',
  errConf: 'a kiszolgáló elFinder-beállítása hibás',
  errJSON: 'a kiszolgáló nem tudott JSON-t előállítani',
  errNoVolumes: 'nincs elérhető kötet — nincs bejelentkezve a felhasználó?',
  errCmdParams: 'hiányos vagy hibás parancsparaméter',
  errFileNotFound: 'a fájl nem található',
  errFolderNotFound: 'a mappa nem található',
  errTrgFolderNotFound: 'a célmappa nem található',
  errExists: 'már van ilyen nevű elem',
  errInvName: 'érvénytelen név',
  errMkdir: 'a mappát nem sikerült létrehozni',
  errOpen: 'a megnyitás nem sikerült',
  errSave: 'a mentés nem sikerült',
  errUploadCommon: 'a feltöltés nem sikerült',
  errUploadFile: 'ezt a fájlt nem sikerült feltölteni',
  errUploadNoFiles: 'nem érkezett fájl a feltöltésben',
  errUploadTotalSize: 'a küldemény összmérete túl nagy',
  errUploadFileSize: 'a fájl nagyobb a megengedettnél',
  errUploadMime: 'ez a fájltípus nem engedélyezett',
  errUploadTransfer: 'az átvitel megszakadt',
  errUploadTemp: 'a kiszolgáló nem tudott ideiglenes fájlt létrehozni',
  errNotFolder: 'nem mappa',
  errNotFile: 'nem fájl',
  errRename: 'az átnevezés nem sikerült',
  errLocked: 'az elem zárolt, nem módosítható',
};

/** A hibamezőből olvasható magyar mondatot csinál. */
function hibatFordit(hiba: unknown): string {
  const darabok = Array.isArray(hiba) ? hiba : [hiba];
  const forditva = darabok.map((d) => {
    const kod = String(d);
    return HIBAK[kod] ?? kod;
  });
  return forditva.join(' — ');
}

export class ElfinderKliens {
  private konnektor: string;
  private keres: SutisKeres;
  private naplo: Naplo;
  /** A szerver által jelzett korlát: hány fájl mehet egy kérésben. */
  private maxFajlKeresenkent = 20;

  constructor(konnektor: string, keres: SutisKeres, naplo: Naplo) {
    this.konnektor = konnektor;
    this.keres = keres;
    this.naplo = naplo;
  }

  /** A válasz feldolgozása: JSON-e, és nincs-e benne hibamező. */
  private async valasztFeldolgoz(valasz: Response, mit: string): Promise<Record<string, unknown>> {
    const szoveg = await valasz.text();

    let adat: Record<string, unknown>;
    try {
      adat = JSON.parse(szoveg) as Record<string, unknown>;
    } catch {
      // A leggyakoribb eset: lejárt a munkamenet, és a szerver a belépési
      // HTML-lapot küldte vissza JSON helyett. Ezt érdemes néven nevezni,
      // mert a nyers HTML-részlet semmit nem mond a felhasználónak.
      const ugyNez = szoveg.trimStart().slice(0, 200).toLowerCase();
      if (ugyNez.startsWith('<')) {
        throw new ElfinderHiba(
          `A(z) „${mit}" kérésre a kiszolgáló weblapot küldött JSON helyett ` +
            `(HTTP ${valasz.status}). Ez majdnem biztosan lejárt munkamenet: ` +
            'másold ki újra a sütit a böngészőből, vagy állíts be űrlapos belépést.',
        );
      }
      throw new ElfinderHiba(
        `A(z) „${mit}" kérésre értelmezhetetlen válasz jött (HTTP ${valasz.status}): ` +
          `${szoveg.slice(0, 200)}`,
      );
    }

    if (adat.error !== undefined && adat.error !== null) {
      // Az elFinder olykor üres hibatömböt küld sikeres művelet mellé is.
      const uresTomb = Array.isArray(adat.error) && adat.error.length === 0;
      if (!uresTomb) {
        throw new ElfinderHiba(`${mit}: ${hibatFordit(adat.error)}`);
      }
    }
    if (adat.warning !== undefined && adat.warning !== null) {
      const figyelmeztetes = hibatFordit(adat.warning);
      if (figyelmeztetes !== '') this.naplo.figyelem(`${mit}: ${figyelmeztetes}`);
    }

    if (!valasz.ok) {
      throw new ElfinderHiba(`${mit}: a kiszolgáló HTTP ${valasz.status} kóddal felelt`);
    }

    return adat;
  }

  /** GET-parancs a konnektornak. */
  private async parancs(
    cmd: string,
    parameterek: Record<string, string> = {},
  ): Promise<Record<string, unknown>> {
    const url = new URL(this.konnektor);
    url.searchParams.set('cmd', cmd);
    for (const [kulcs, ertek] of Object.entries(parameterek)) {
      url.searchParams.set(kulcs, ertek);
    }
    const valasz = await this.keres.keres(url.toString());
    return this.valasztFeldolgoz(valasz, `cmd=${cmd}`);
  }

  /**
   * Mappa megnyitása. Cél nélkül, `init=1`-gyel a kötetek gyökerét adja —
   * ezzel kezdődik minden munkamenet.
   */
  async nyit(celHash?: string): Promise<NyitasValasz> {
    const parameterek: Record<string, string> = { tree: '1' };
    if (celHash) {
      parameterek.target = celHash;
    } else {
      parameterek.init = '1';
      parameterek.target = '';
    }
    const adat = (await this.parancs('open', parameterek)) as NyitasValasz;

    const korlat = Number(adat.uplMaxFile);
    if (Number.isFinite(korlat) && korlat > 0) this.maxFajlKeresenkent = korlat;

    return adat;
  }

  /**
   * A kötetgyökerek listája.
   *
   * A kötetgyökeret az ismerteti fel, hogy nincs szülője: az elFinder a
   * gyökér `phash` mezőjét hamisra (`false`) állítja. A képernyőképen két ilyen
   * volt: „Blueway Trade Kft - Feltöltés" és „Blueway Trade Kft - Kö…".
   */
  async gyokerek(): Promise<ElfinderFajl[]> {
    const adat = await this.nyit();
    const fajlok = adat.files ?? [];
    const talalt = fajlok.filter((f) => f.mime === 'directory' && !f.phash);
    if (talalt.length === 0 && adat.cwd && !adat.cwd.phash) return [adat.cwd];
    return talalt;
  }

  /** Egy mappa közvetlen gyerekei. */
  async gyerekek(mappaHash: string): Promise<ElfinderFajl[]> {
    const adat = await this.nyit(mappaHash);
    const fajlok = adat.files ?? [];
    // A válasz a fa miatt más mappák elemeit is tartalmazhatja, ezért a
    // szülő szerint szűrünk — enélkül idegen mappa fájljait néznénk sajátnak.
    return fajlok.filter((f) => f.phash === mappaHash);
  }

  /** Almappa keresése név szerint. */
  async almappa(szuloHash: string, nev: string): Promise<ElfinderFajl | undefined> {
    const gyerekek = await this.gyerekek(szuloHash);
    return gyerekek.find((f) => f.mime === 'directory' && f.name === nev);
  }

  /** Mappa létrehozása. */
  async mappatLetrehoz(szuloHash: string, nev: string): Promise<ElfinderFajl> {
    const adat = await this.parancs('mkdir', { target: szuloHash, name: nev });
    const hozzaadott = (adat.added as ElfinderFajl[] | undefined) ?? [];
    const uj = hozzaadott.find((f) => f.name === nev) ?? hozzaadott[0];
    if (!uj) {
      throw new ElfinderHiba(
        `A(z) „${nev}" mappa létrehozására a kiszolgáló nem küldött vissza elemet.`,
      );
    }
    return uj;
  }

  /**
   * Fájlok feltöltése egy mappába.
   *
   * A kiszolgáló korlátozza, hány fájl mehet egy kérésben (`uplMaxFile`,
   * alapban 20), ezért adagokra bontjuk. A `mtime[]` mezővel a bizonylat
   * eredeti dátuma is átmegy — enélkül a MASC-ban minden fájl a feltöltés
   * pillanatát viselné, és a könyvelő nem látná, mikor kelt a papír.
   */
  async feltolt(
    celHash: string,
    fajlok: FeltoltendoFajl[],
    felulir: boolean,
  ): Promise<ElfinderFajl[]> {
    const feltoltve: ElfinderFajl[] = [];

    for (let i = 0; i < fajlok.length; i += this.maxFajlKeresenkent) {
      const adag = fajlok.slice(i, i + this.maxFajlKeresenkent);
      const urlap = new FormData();
      urlap.set('cmd', 'upload');
      urlap.set('target', celHash);
      // 0 esetén az elFinder nem írja felül, hanem új néven menti (szamla-1.pdf).
      urlap.set('overwrite', felulir ? '1' : '0');
      for (const fajl of adag) {
        // A Buffer-t másolat nélkül átadni nem lehet: a Blob a saját
        // pufferét várja, ezért itt egy Uint8Array-nézetet adunk át.
        const nezet = new Uint8Array(fajl.tartalom);
        urlap.append('upload[]', new Blob([nezet]), fajl.nev);
        urlap.append('mtime[]', String(fajl.mtime));
      }

      const valasz = await this.keres.keres(this.konnektor, { method: 'POST', body: urlap });
      const adat = await this.valasztFeldolgoz(valasz, 'cmd=upload');
      const hozzaadott = (adat.added as ElfinderFajl[] | undefined) ?? [];

      if (hozzaadott.length < adag.length) {
        // Néma részleges siker: az elFinder ilyenkor gyakran csak `warning`-ot
        // küld. Ha nem szólnánk, a felhasználó azt hinné, minden felment.
        const felmentNevek = new Set(hozzaadott.map((f) => f.name));
        const hianyzo = adag.filter((f) => !felmentNevek.has(f.nev)).map((f) => f.nev);
        if (hianyzo.length > 0) {
          throw new ElfinderHiba(
            `A kiszolgáló nem vette át: ${hianyzo.join(', ')}. ` +
              'Gyakori ok: a fájltípus nem engedélyezett, vagy túl nagy a fájl.',
          );
        }
      }

      feltoltve.push(...hozzaadott);
    }

    return feltoltve;
  }
}
