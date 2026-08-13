/**
 * Bejelentkezés a MASC-ba.
 *
 * Kétféle út van, és tudatosan a KÖRÜLMÉNYESEBB az alapértelmezett:
 *
 *   1. Munkamenet-süti (MASC_SUTI). A böngészőből másolod ki. Cserébe, hogy
 *      egy-két hetente újra ki kell másolni, viszont BIZTOSAN működik: nem kell
 *      kitalálnunk, hogy néz ki a belépési űrlap.
 *
 *   2. Űrlapos belépés (MASC_BELEPES_URL + felhasználó + jelszó). Ez fut
 *      magától, ütemezve is. Csakhogy a mezőnevekre tippelni kell, ezért
 *      állíthatók (MASC_MEZO_*), és a rejtett mezőket (CSRF-jegy) is
 *      visszaküldjük — enélkül a legtöbb PHP-s portál elutasítja a belépést.
 *
 * Mindkét út végén UGYANAZ az ellenőrzés: megnyitunk egy kötetet. Ha nincs
 * kötet, akkor nem vagyunk bent — hiába kaptunk 200-as választ a belépésre.
 * Ezt fájdalmas tapasztalatból érdemes így csinálni: a hibás jelszóra sok
 * portál a belépési lapot küldi vissza 200-zal, nem hibakóddal.
 */
import type { Beallitasok } from './beallitasok.ts';
import type { Naplo } from './naplo.ts';
import type { SutisKeres } from './sutis-keres.ts';
import { ElfinderKliens, type ElfinderFajl } from './elfinder.ts';

export class BelepesHiba extends Error {}

/**
 * A belépési lap rejtett mezői (CSRF-jegy, `_token`, `csrf_name` stb.).
 *
 * Szándékosan egyszerű mintaillesztés, nem HTML-elemző: egyetlen űrlapot
 * keresünk egy ismert lapon, és a rejtett mezőket visszaküldjük változatlanul.
 * Ha a lapon több űrlap van (pl. keresőmező is), a fölösleges mezők átküldése
 * a belépést nem zavarja.
 */
function rejtettMezok(html: string): Record<string, string> {
  const mezok: Record<string, string> = {};
  const inputMinta = /<input\b[^>]*>/gi;
  for (const talalat of html.matchAll(inputMinta)) {
    const cimke = talalat[0];
    if (!/type\s*=\s*['"]?hidden['"]?/i.test(cimke)) continue;
    const nev = /name\s*=\s*['"]([^'"]+)['"]/i.exec(cimke)?.[1];
    if (!nev) continue;
    const ertek = /value\s*=\s*['"]([^'"]*)['"]/i.exec(cimke)?.[1] ?? '';
    mezok[nev] = ertek;
  }
  return mezok;
}

/**
 * Belép, majd visszaadja a használható klienst és a kötetgyökereket.
 */
export async function belep(
  beallitasok: Beallitasok,
  keres: SutisKeres,
  naplo: Naplo,
): Promise<{ kliens: ElfinderKliens; gyokerek: ElfinderFajl[] }> {
  const kliens = new ElfinderKliens(beallitasok.konnektor, keres, naplo);

  if (beallitasok.suti) {
    keres.sutitBeallit(beallitasok.suti);
    naplo.reszlet(`Süti beállítva: ${keres.sutiNevek().join(', ')}`);
  } else {
    const belepesUrl = beallitasok.belepesUrl as string;
    naplo.info(`Bejelentkezés: ${belepesUrl}`);

    // Először a lapot kérjük le. Két dolgot ad: a munkamenet-sütit (amit a
    // belépéskor a szerver majd „felavat"), és a rejtett mezőket.
    let rejtett: Record<string, string> = {};
    try {
      const lap = await keres.keres(belepesUrl);
      const html = await lap.text();
      rejtett = rejtettMezok(html);
      if (Object.keys(rejtett).length > 0) {
        naplo.reszlet(`Rejtett űrlapmezők: ${Object.keys(rejtett).join(', ')}`);
      }
    } catch (hiba) {
      throw new BelepesHiba(
        `A belépési lap nem érhető el (${belepesUrl}): ${(hiba as Error).message}`,
      );
    }

    const urlap = new URLSearchParams(rejtett);
    urlap.set(beallitasok.mezoFelhasznalo, beallitasok.felhasznalo as string);
    urlap.set(beallitasok.mezoJelszo, beallitasok.jelszo as string);

    const valasz = await keres.keres(belepesUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: urlap.toString(),
    });
    naplo.reszlet(`A belépés válasza: HTTP ${valasz.status}`);

    if (!keres.vanSuti()) {
      throw new BelepesHiba(
        'A belépés után nem kaptunk munkamenet-sütit. Ellenőrizd a\n' +
          'MASC_BELEPES_URL címet és a mezőneveket (MASC_MEZO_FELHASZNALO,\n' +
          'MASC_MEZO_JELSZO) — a helyes nevek a belépési lap forrásában látszanak.',
      );
    }
  }

  // A tényleges próba: kapunk-e kötetet. Ez dönti el, bent vagyunk-e.
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
        'jelenti, hogy nem vagyunk bejelentkezve (lejárt vagy rossz süti),\n' +
        'vagy a felhasználónak nincs jogosultsága egyik mappához sem.',
    );
  }

  naplo.siker(`Bejelentkezve — ${gyokerek.length} kötet érhető el.`);
  return { kliens, gyokerek };
}

/**
 * A feltöltési kötet kiválasztása névtöredék alapján.
 *
 * A MASC fáján két kötet van: a feltöltési és a könyvelési. Nem mindegy, melyikbe
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
        'Állítsd be a MASC_GYOKER értékét a fentiek egyikének egy részletére.',
    );
  }
  throw new BelepesHiba(
    `A „${toredek}" névtöredékre ${talalatok.length} kötet is illeszkedik:\n` +
      `${talalatok.map((g) => `  • ${g.name}`).join('\n')}\n` +
      'Adj meg pontosabb MASC_GYOKER értéket.',
  );
}
