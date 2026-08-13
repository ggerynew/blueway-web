/**
 * Bejelentkezés a MASC-ba — LÉPCSŐSEN.
 *
 * A MASC belépése nem egy űrlap, hanem kettő egymás után:
 *
 *   1. lépcső — a MASC Kft. portálja. Ide a szolgáltatótól kapott
 *      felhasználónévvel és jelszóval lépünk be.
 *   2. lépcső — a portál AZONNAL kér egy másodikat, és ez nyitja meg egy
 *      konkrét cég (pl. Blueway Trade Kft.) felületét.
 *
 * Ez a kettősség adja a program szerkezetét is: az első lépcső jellemzően
 * minden cégnél ugyanaz, a második cégenként más. Ezért a belépés itt nem
 * két rögzített lépés, hanem egy LISTA — ha egy cégnél egy lépcső is elég,
 * vagy épp három van, ugyanez a kód viszi végig.
 *
 * KÉT DOLGOT NEM TALÁLGATUNK
 *
 * Melyik űrlapot töltsük ki: azt, amelyikben van jelszómező. Egy lapon ott
 * lehet a keresődoboz vagy a hírlevél-feliratkozás is; a jelszómező viszont
 * egyértelműen a belépést jelöli.
 *
 * Hová küldjük: az űrlap saját `action` címére. A második lépcső űrlapja
 * gyakran máshová posztol, mint ahol a lap maga van — ha a lap címére
 * küldenénk, a belépés némán elveszne.
 *
 * ÉS AMIT MINDIG ELLENŐRZÜNK
 *
 * A végén megnyitunk egy kötetet. Ha nincs kötet, akkor nem vagyunk bent —
 * hiába kaptunk 200-as választ. Hibás jelszóra ugyanis a legtöbb portál nem
 * hibakóddal felel, hanem visszaadja a belépési lapot, 200-zal.
 */
import type { Naplo } from './naplo.js';
import type { SutisKeres } from './sutis-keres.js';
import { ElfinderKliens, type ElfinderFajl } from './elfinder.js';

export class BelepesHiba extends Error {}

/** Egy belépési lépcső. */
export interface BelepesLepes {
  /** Emberi név a naplóhoz és a felülethez: „MASC portál", „Blueway Trade". */
  cimke: string;
  /**
   * A lap címe, ahol az űrlap van.
   *
   * Üresen hagyható: ilyenkor ott folytatjuk, ahová az előző lépcső után
   * kerültünk. A második lépcsőnél rendszerint épp ez a helyes — a portál
   * belépés után magától átdob a cégválasztóra.
   */
  url?: string;
  felhasznalo: string;
  jelszo: string;
  /** Az űrlapmező neve. Üresen hagyva a lapról olvassuk ki. */
  mezoFelhasznalo?: string;
  mezoJelszo?: string;
}

interface UrlapLeiras {
  /** Ide kell posztolni (már teljes URL-lé oldva). */
  cel: string;
  /** Rejtett mezők (CSRF-jegy stb.), változatlanul visszaküldendők. */
  rejtett: Record<string, string>;
  /** A lapon talált jelszómező neve. */
  jelszoMezo?: string;
  /** A jelszómező előtti szöveges/e-mail mező neve — ez a felhasználónév. */
  felhasznaloMezo?: string;
}

/** Egy `<input …>` címke attribútumai. */
function inputAttributumok(cimke: string): { type: string; name?: string; value: string } {
  const tipus = /type\s*=\s*['"]?([a-z]+)['"]?/i.exec(cimke)?.[1]?.toLowerCase() ?? 'text';
  const nev = /name\s*=\s*['"]([^'"]+)['"]/i.exec(cimke)?.[1];
  const ertek = /value\s*=\s*['"]([^'"]*)['"]/i.exec(cimke)?.[1] ?? '';
  return { type: tipus, name: nev, value: ertek };
}

/**
 * A belépési űrlap kiolvasása a lapból.
 *
 * Szándékosan mintaillesztés, nem teljes HTML-elemző: egyetlen ismert lapon
 * egyetlen űrlapot keresünk. Cserébe nincs függősége a programnak.
 */
export function belepesiUrlapotKiolvas(html: string, lapUrl: string): UrlapLeiras {
  const urlapok = [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)];
  // A jelszómező árulja el, melyik a belépés. Ha nincs ilyen űrlap (mert a
  // lap szokatlan felépítésű), az egész dokumentumot nézzük egy űrlapnak.
  const belepes =
    urlapok.find((u) => /type\s*=\s*['"]?password['"]?/i.test(u[2] ?? '')) ?? null;

  const fejlec = belepes?.[1] ?? '';
  const torzs = belepes?.[2] ?? html;

  const action = /action\s*=\s*['"]([^'"]*)['"]/i.exec(fejlec)?.[1];
  // Üres vagy hiányzó action esetén a böngésző is a saját lapjára posztol.
  const cel = action && action.trim() !== '' ? new URL(action, lapUrl).toString() : lapUrl;

  const rejtett: Record<string, string> = {};
  let jelszoMezo: string | undefined;
  let felhasznaloMezo: string | undefined;

  for (const talalat of torzs.matchAll(/<input\b[^>]*>/gi)) {
    const { type, name, value } = inputAttributumok(talalat[0]);
    if (!name) continue;
    if (type === 'hidden') {
      rejtett[name] = value;
    } else if (type === 'password') {
      jelszoMezo ??= name;
    } else if ((type === 'text' || type === 'email') && !jelszoMezo) {
      // Csak a jelszómező ELŐTTI szöveges mezőt fogadjuk el felhasználónévnek:
      // ami utána jön, az már jellemzően más (pl. „jegyezz meg" vagy kereső).
      felhasznaloMezo ??= name;
    }
  }

  return { cel, rejtett, jelszoMezo, felhasznaloMezo };
}

/**
 * Végigmegy a belépési lépcsőkön.
 *
 * @returns az egyes lépcsők után elért címek — hibakereséshez hasznos
 */
export async function lepcsokonVegig(
  lepesek: BelepesLepes[],
  keres: SutisKeres,
  naplo: Naplo,
): Promise<string[]> {
  if (lepesek.length === 0) {
    throw new BelepesHiba('Nincs megadva egyetlen belépési lépcső sem.');
  }

  const utvonal: string[] = [];
  let kovetkezoUrl = '';

  for (const [index, lepes] of lepesek.entries())  {
    const sorszam = `${index + 1}/${lepesek.length}`;
    const lapUrl = lepes.url && lepes.url.trim() !== '' ? lepes.url : kovetkezoUrl;

    if (!lapUrl) {
      throw new BelepesHiba(
        `A(z) ${sorszam}. lépcsőnél („${lepes.cimke}") nincs cím, és az előző ` +
          'lépcső sem hagyott hova továbbmenni. Add meg a lap címét.',
      );
    }

    naplo.info(`Belépés ${sorszam} — ${lepes.cimke}`);
    naplo.reszlet(`  lap: ${lapUrl}`);

    let html: string;
    try {
      const lap = await keres.keres(lapUrl);
      html = await lap.text();
    } catch (hiba) {
      throw new BelepesHiba(
        `A(z) „${lepes.cimke}" belépési lap nem érhető el (${lapUrl}): ${(hiba as Error).message}`,
      );
    }

    const urlap = belepesiUrlapotKiolvas(html, keres.vegsoUrl || lapUrl);

    // A beállításban megadott mezőnév erősebb: ha a felhasználó tudja, mi a
    // helyes, ne írja felül a találgatásunk.
    const felhasznaloMezo = lepes.mezoFelhasznalo?.trim() || urlap.felhasznaloMezo;
    const jelszoMezo = lepes.mezoJelszo?.trim() || urlap.jelszoMezo;

    if (!felhasznaloMezo || !jelszoMezo) {
      throw new BelepesHiba(
        `A(z) „${lepes.cimke}" lapon nem találtam belépési űrlapot ` +
          `(felhasználó mező: ${felhasznaloMezo ?? 'nincs'}, jelszó mező: ${jelszoMezo ?? 'nincs'}).\n` +
          'Add meg a mezőneveket kézzel a cég beállításainál — a lap forrásában ' +
          'az <input name="..."> részeknél látszanak.',
      );
    }
    naplo.reszlet(`  űrlap: ${urlap.cel} (mezők: ${felhasznaloMezo}, ${jelszoMezo})`);
    if (Object.keys(urlap.rejtett).length > 0) {
      naplo.reszlet(`  rejtett mezők: ${Object.keys(urlap.rejtett).join(', ')}`);
    }

    const adat = new URLSearchParams(urlap.rejtett);
    adat.set(felhasznaloMezo, lepes.felhasznalo);
    adat.set(jelszoMezo, lepes.jelszo);

    const valasz = await keres.keres(urlap.cel, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: adat.toString(),
    });
    naplo.reszlet(`  válasz: HTTP ${valasz.status} → ${keres.vegsoUrl}`);

    // A következő lépcső ott folytatja, ahová ez a belépés vitt minket.
    kovetkezoUrl = keres.vegsoUrl;
    utvonal.push(kovetkezoUrl);

    if (!keres.vanSuti()) {
      throw new BelepesHiba(
        `A(z) „${lepes.cimke}" belépés után nem kaptunk munkamenet-sütit. ` +
          'Ellenőrizd a címet, a felhasználónevet és a jelszót.',
      );
    }
  }

  return utvonal;
}

/**
 * Teljes belépés: lépcsők végigjárása, majd a kötetek lekérése.
 *
 * A süti-alapú belépés (`suti`) rövidzár: ilyenkor nincs lépcső, a böngészőből
 * kimásolt munkamenettel dolgozunk. Ez a parancssori használat kényelmi útja.
 */
export async function belepEsKotetek(
  beallitas: {
    konnektor: string;
    suti?: string;
    lepesek?: BelepesLepes[];
  },
  keres: SutisKeres,
  naplo: Naplo,
): Promise<{ kliens: ElfinderKliens; gyokerek: ElfinderFajl[] }> {
  const kliens = new ElfinderKliens(beallitas.konnektor, keres, naplo);

  if (beallitas.suti) {
    keres.sutitBeallit(beallitas.suti);
    naplo.reszlet(`Süti beállítva: ${keres.sutiNevek().join(', ')}`);
  } else if (beallitas.lepesek && beallitas.lepesek.length > 0) {
    await lepcsokonVegig(beallitas.lepesek, keres, naplo);
  } else {
    throw new BelepesHiba(
      'Nincs megadva, hogyan jelentkezzünk be: sem munkamenet-süti, sem belépési lépcső.',
    );
  }

  let gyokerek: ElfinderFajl[];
  try {
    gyokerek = await kliens.gyokerek();
  } catch (hiba) {
    throw new BelepesHiba(
      `Bejelentkezés után a kötetek lekérése nem sikerült: ${(hiba as Error).message}`,
    );
  }

  if (gyokerek.length === 0) {
    throw new BelepesHiba(
      'A kiszolgáló egyetlen kötetet sem adott vissza. Ez rendszerint azt\n' +
        'jelenti, hogy nem vagyunk bejelentkezve (rossz jelszó vagy lejárt\n' +
        'munkamenet), vagy a felhasználónak nincs jogosultsága egyik mappához sem.',
    );
  }

  naplo.siker(`Bejelentkezve — ${gyokerek.length} kötet érhető el.`);
  return { kliens, gyokerek };
}

/**
 * A parancssori beállításokból induló belépés.
 *
 * Csak összefordítja a régi, egylépcsős konfigurációt az új lépcsős alakra —
 * hogy a parancssor és az asztali program UGYANAZT a belépési kódot használja.
 */
export async function belep(
  beallitasok: {
    konnektor: string;
    suti?: string;
    belepesUrl?: string;
    felhasznalo?: string;
    jelszo?: string;
    mezoFelhasznalo: string;
    mezoJelszo: string;
  },
  keres: SutisKeres,
  naplo: Naplo,
): Promise<{ kliens: ElfinderKliens; gyokerek: ElfinderFajl[] }> {
  const lepesek: BelepesLepes[] = [];
  if (!beallitasok.suti && beallitasok.belepesUrl) {
    lepesek.push({
      cimke: 'MASC',
      url: beallitasok.belepesUrl,
      felhasznalo: beallitasok.felhasznalo ?? '',
      jelszo: beallitasok.jelszo ?? '',
      mezoFelhasznalo: beallitasok.mezoFelhasznalo,
      mezoJelszo: beallitasok.mezoJelszo,
    });
  }
  return belepEsKotetek(
    { konnektor: beallitasok.konnektor, suti: beallitasok.suti, lepesek },
    keres,
    naplo,
  );
}

/**
 * A feltöltési kötet kiválasztása névtöredék alapján.
 *
 * A MASC fáján több kötet van (feltöltési, könyvelési). Nem mindegy, melyikbe
 * írunk, ezért a találatnak egyértelműnek kell lennie — több egyező névnél
 * inkább megállunk, mint hogy rossz helyre töltsük a bizonylatokat.
 */
export function gyokeretValaszt(gyokerek: ElfinderFajl[], toredek: string): ElfinderFajl {
  const kicsi = toredek.toLocaleLowerCase('hu');
  const talalatok = gyokerek.filter((g) => g.name.toLocaleLowerCase('hu').includes(kicsi));

  if (talalatok.length === 1) return talalatok[0] as ElfinderFajl;

  const lista = gyokerek.map((g) => `  • ${g.name}`).join('\n');
  if (talalatok.length === 0) {
    throw new BelepesHiba(
      `Nincs „${toredek}" nevű kötet. Az elérhetők:\n${lista}\n` +
        'Állítsd be a kötet nevének egy jellemző részletét.',
    );
  }
  throw new BelepesHiba(
    `A „${toredek}" névtöredékre ${talalatok.length} kötet is illeszkedik:\n` +
      `${talalatok.map((g) => `  • ${g.name}`).join('\n')}\n` +
      'Adj meg pontosabb névtöredéket.',
  );
}
