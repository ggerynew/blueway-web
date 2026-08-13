/**
 * A felület próbái igazi böngészőmotorban.
 *
 * MIÉRT ÍGY
 *
 * Az ablakok tartalma sima HTML és JavaScript — ugyanaz fut az Electronban,
 * mint itt a Chromiumban. A különbség csak a `window.masc` híd: éles
 * futásban a fő folyamathoz vezet, itt egy próbabábuhoz. Így a felület
 * viselkedése az Electron elindítása NÉLKÜL is ellenőrizhető.
 *
 * Ez nem formaság. A felület hétszáz sornyi kézzel írt DOM-kezelés, amiben
 * egyetlen elgépelt azonosító is üres képernyőt okoz — a felhasználó pedig
 * ilyenkor csak annyit lát, hogy „nem működik". Ezek a próbák pontosan ezt a
 * fajta hibát fogják meg.
 *
 * AMIT EZ NEM BIZONYÍT
 *
 * Azt nem, hogy az Electron elindul és az ablakok megjelennek — ahhoz maga az
 * Electron kellene, aminek a binárisát a fejlesztői környezet hálózata nem
 * engedi letölteni. A híd túloldalát (fo.ts) a többi próba fedi le.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const FELULET = join(dirname(fileURLToPath(import.meta.url)), '..', 'asztali', 'felulet');

let bongeszo;

/**
 * A böngésző futtatható állománya.
 *
 * A Playwright a saját változatához tartozó könyvtárban keresné, ami nem
 * feltétlenül az, ami a gépen van (fejlesztői homokozó, CI-futtató). Ha a
 * MASC_BONGESZO környezeti változó meg van adva, azt használjuk — így a
 * próbák ott is futnak, ahol a böngésző máshol lakik.
 */
function bongeszoUtja() {
  return process.env.MASC_BONGESZO ?? undefined;
}

before(async () => {
  const utvonal = bongeszoUtja();
  bongeszo = await chromium.launch(utvonal ? { executablePath: utvonal } : {});
});

after(async () => {
  await bongeszo?.close();
});

/** Két próbacég, ahogy a fő folyamat átadná őket. */
function probaCegek() {
  return [
    {
      ceg: {
        id: 'ceg-1',
        nev: 'Blueway Trade Kft.',
        konnektor: 'https://masc.hu/connector.php',
        gyoker: 'Feltöltés',
        mappak: ['C:\\Bizonylatok\\Blueway'],
        automata: true,
        rekurziv: false,
        fajlDatum: false,
        kiterjesztesek: [],
        lepesek: [
          { cimke: 'MASC portál', url: 'https://masc.hu/', felhasznalo: 'blueway', jelszo: '', vanJelszo: true },
          { cimke: 'Blueway Trade', url: '', felhasznalo: 'trade', jelszo: '', vanJelszo: true },
        ],
      },
      nezet: {
        cegId: 'ceg-1',
        nev: 'Blueway Trade Kft.',
        allapot: 'csatlakozva',
        uzenet: 'Csatlakozva — Blueway Trade Kft - Feltöltés',
        szinkronFut: false,
        osszegzes: { varakozik: 2, feltoltve: 7, hibas: 1 },
      },
    },
    {
      ceg: {
        id: 'ceg-2',
        nev: 'Másik Kft.',
        konnektor: 'https://masc.hu/connector.php',
        gyoker: 'Feltöltés',
        mappak: [],
        automata: false,
        rekurziv: false,
        fajlDatum: false,
        kiterjesztesek: [],
        lepesek: [{ cimke: 'MASC portál', url: 'https://masc.hu/', felhasznalo: 'masik', jelszo: '', vanJelszo: false }],
      },
      nezet: {
        cegId: 'ceg-2',
        nev: 'Másik Kft.',
        allapot: 'hiba',
        uzenet: 'Hibás jelszó a második lépcsőn.',
        szinkronFut: false,
        osszegzes: { varakozik: 0, feltoltve: 0, hibas: 0 },
      },
    },
  ];
}

function probaFajlok() {
  return [
    {
      ut: 'C:\\Bizonylatok\\Blueway\\szamla-001.pdf',
      nev: 'szamla-001.pdf',
      meret: 24576,
      modositva: Date.UTC(2026, 7, 3),
      ujjlenyomat: 'aaa',
      allapot: 'feltoltve',
      celMappa: '2026/08',
      ido: Date.UTC(2026, 7, 12, 9, 30),
      probalkozas: 0,
      letezik: true,
    },
    {
      ut: 'C:\\Bizonylatok\\Blueway\\szamla-002.pdf',
      nev: 'szamla-002.pdf',
      meret: 1048576,
      modositva: Date.UTC(2026, 7, 4),
      ujjlenyomat: 'bbb',
      allapot: 'hibas',
      celMappa: '2026/08',
      ido: Date.UTC(2026, 7, 12, 9, 31),
      hiba: 'Az átvitel megszakadt.',
      probalkozas: 2,
      letezik: true,
    },
    {
      ut: 'C:\\Bizonylatok\\Blueway\\szamla-003.pdf',
      nev: 'szamla-003.pdf',
      meret: 900,
      modositva: Date.UTC(2026, 7, 5),
      ujjlenyomat: 'ccc',
      allapot: 'varakozik',
      celMappa: '2026/08',
      ido: Date.UTC(2026, 7, 12, 9, 32),
      probalkozas: 0,
      letezik: true,
    },
  ];
}

/**
 * Lap megnyitása a híd próbabábujával.
 *
 * A bábu minden hívást naplóz, hogy a próbák ellenőrizhessék: a gombnyomás
 * tényleg a helyes kérést indítja el.
 */
async function lapotNyit(fajl, { cegek = probaCegek(), fajlok = probaFajlok(), kereses = '' } = {}) {
  const lap = await bongeszo.newPage();
  const hibak = [];
  lap.on('pageerror', (hiba) => hibak.push(String(hiba)));
  lap.on('console', (uzenet) => {
    if (uzenet.type() === 'error') hibak.push(uzenet.text());
  });

  await lap.addInitScript(
    ({ cegek, fajlok }) => {
      window.__hivasok = [];
      const jegyez = (nev, ...ervek) => window.__hivasok.push({ nev, ervek });

      window.masc = {
        cegek: {
          lista: async () => (jegyez('cegek.lista'), cegek),
          uj: async () => (jegyez('cegek.uj'), {
            id: 'uj-ceg',
            nev: '',
            konnektor: '',
            gyoker: 'Feltöltés',
            mappak: [],
            automata: true,
            rekurziv: false,
            fajlDatum: false,
            kiterjesztesek: [],
            lepesek: [
              { cimke: 'MASC portál', url: '', felhasznalo: '', jelszo: '' },
              { cimke: 'Cég felülete', url: '', felhasznalo: '', jelszo: '' },
            ],
          }),
          ment: async (ceg) => (jegyez('cegek.ment', ceg), { rendben: true }),
          torol: async (id) => (jegyez('cegek.torol', id), { rendben: true }),
          jelszoMenthetoE: async () => true,
        },
        ceg: {
          adat: async (id) => (jegyez('ceg.adat', id), {
            ceg: cegek[0].ceg,
            nezet: cegek[0].nezet,
            fajlok,
            naplo: [
              { jel: '✓', uzenet: 'Bejelentkezve — 2 kötet érhető el.', ido: Date.now() },
              { jel: '✗', uzenet: 'szamla-002.pdf — az átvitel megszakadt.', ido: Date.now() },
            ],
          }),
          csatlakoz: async (id) => (jegyez('ceg.csatlakoz', id), { rendben: true }),
          lecsatlakoz: async (id) => (jegyez('ceg.lecsatlakoz', id), { rendben: true }),
          szinkron: async (id) => (jegyez('ceg.szinkron', id), { rendben: true }),
          atvizsgal: async (id) => (jegyez('ceg.atvizsgal', id), fajlok),
          fajlok: async (id) => (jegyez('ceg.fajlok', id), fajlok),
          ujraSorba: async (id, ut) => (jegyez('ceg.ujraSorba', id, ut), { rendben: true }),
          ablak: async (id) => (jegyez('ceg.ablak', id), { rendben: true }),
        },
        mappatValaszt: async () => (jegyez('mappatValaszt'), ['C:\\Bizonylatok\\Uj']),
        fajltMutat: async (ut) => (jegyez('fajltMutat', ut), { rendben: true }),
        amikorValtozas: () => () => {},
        amikorNaplo: () => () => {},
        amikorFajl: () => () => {},
        amikorCegekFrissultek: () => () => {},
      };
    },
    { cegek, fajlok },
  );

  const cim = pathToFileURL(join(FELULET, fajl)).href + kereses;
  await lap.goto(cim);
  // A felület adatot kér induláskor; várjuk meg, hogy megérkezzen.
  await lap.waitForFunction(() => window.__hivasok && window.__hivasok.length > 0);
  return { lap, hibak };
}

const hivasokat = (lap) => lap.evaluate(() => window.__hivasok.map((h) => h.nev));

/* ── Főképernyő ─────────────────────────────────────────────────────── */

describe('főképernyő', () => {
  test('kiírja a cégneveket és a kapcsolat állapotát', async () => {
    const { lap, hibak } = await lapotNyit('fo.html');

    const nevek = await lap.locator('.ceg-nev').allTextContents();
    assert.deepEqual(nevek, ['Blueway Trade Kft.', 'Másik Kft.']);

    // A kérés szerint a főképernyőn a csatlakozás és a cégnév szerepel.
    const allapotok = await lap.locator('.ceg-kartya .allapot').allTextContents();
    assert.deepEqual(allapotok, ['Csatlakozva', 'Hiba']);

    assert.match(await lap.locator('#alcim').textContent(), /2 cég · 1 csatlakozva/);
    assert.deepEqual(hibak, [], 'a lapon nem lehet JavaScript-hiba');
    await lap.close();
  });

  test('a számlálók mutatják, mi vár feltöltésre és mi hibás', async () => {
    const { lap } = await lapotNyit('fo.html');
    const elso = lap.locator('.ceg-kartya').first();

    assert.match(await elso.locator('.szamlalo.varakozik').textContent(), /2 feltöltésre vár/);
    assert.match(await elso.locator('.szamlalo.feltoltve').textContent(), /7 feltöltve/);
    assert.match(await elso.locator('.szamlalo.hibas').textContent(), /1 hibás/);
    await lap.close();
  });

  test('a csatlakozott cégnél Lecsatlakozás, a hibásnál Csatlakozás gomb van', async () => {
    const { lap } = await lapotNyit('fo.html');

    const elso = lap.locator('.ceg-kartya').first();
    const masodik = lap.locator('.ceg-kartya').nth(1);
    assert.equal(await elso.locator('.ceg-gombok button').first().textContent(), 'Lecsatlakozás');
    assert.equal(await masodik.locator('.ceg-gombok button').first().textContent(), 'Csatlakozás');
    await lap.close();
  });

  test('a gombok a helyes műveletet indítják', async () => {
    const { lap } = await lapotNyit('fo.html');
    const elso = lap.locator('.ceg-kartya').first();

    await elso.locator('.ceg-gombok button', { hasText: 'Lecsatlakozás' }).click();
    await elso.locator('.ceg-gombok button', { hasText: 'Szinkronizálás' }).click();
    await elso.locator('.ceg-gombok button', { hasText: 'Megnyitás külön ablakban' }).click();

    const hivasok = await hivasokat(lap);
    assert.ok(hivasok.includes('ceg.lecsatlakoz'));
    assert.ok(hivasok.includes('ceg.szinkron'));
    assert.ok(hivasok.includes('ceg.ablak'));
    await lap.close();
  });

  test('a törlés visszakérdez, és Mégse esetén nem töröl', async () => {
    const { lap } = await lapotNyit('fo.html');
    lap.on('dialog', (parbeszed) => void parbeszed.dismiss());

    await lap.locator('.ceg-kartya').first().locator('button', { hasText: 'Törlés' }).click();
    await lap.waitForTimeout(120);

    assert.ok(!(await hivasokat(lap)).includes('cegek.torol'), 'Mégse után nem szabad törölni');
    await lap.close();
  });
});

/* ── Cég felvétele ──────────────────────────────────────────────────── */

describe('cég felvétele', () => {
  test('az űrlap két belépési lépcsővel nyílik', async () => {
    const { lap, hibak } = await lapotNyit('fo.html');
    await lap.locator('#uj-ceg').click();

    assert.ok(await lap.locator('#ceg-parbeszed').isVisible());
    assert.equal(await lap.locator('.lepcso').count(), 2, 'alapból két lépcső kell');
    assert.deepEqual(await lap.locator('.lepcso-sorszam').allTextContents(), ['1', '2']);
    assert.deepEqual(hibak, []);
    await lap.close();
  });

  test('további lépcső vehető fel, és törölhető', async () => {
    const { lap } = await lapotNyit('fo.html');
    await lap.locator('#uj-ceg').click();

    await lap.locator('#lepcso-hozzaad').click();
    assert.equal(await lap.locator('.lepcso').count(), 3);

    await lap.locator('.lepcso').nth(2).locator('button', { hasText: 'Törlés' }).click();
    assert.equal(await lap.locator('.lepcso').count(), 2);
    await lap.close();
  });

  test('mappa tallózással kerül a listába', async () => {
    const { lap } = await lapotNyit('fo.html');
    await lap.locator('#uj-ceg').click();

    assert.match(await lap.locator('#mappa-lista').textContent(), /Még nincs megadva mappa/);
    await lap.locator('#mappa-hozzaad').click();
    assert.match(await lap.locator('#mappa-lista').textContent(), /C:\\Bizonylatok\\Uj/);
    await lap.close();
  });

  test('a mentés a beírt adatokkal hívja a programot', async () => {
    const { lap } = await lapotNyit('fo.html');
    await lap.locator('#uj-ceg').click();

    await lap.locator('#mezo-nev').fill('Harmadik Kft.');
    await lap.locator('#mezo-konnektor').fill('https://masc.hu/connector.php');
    await lap.locator('#mezo-gyoker').fill('Feltöltés');
    await lap.locator('.lepcso').first().locator('input[type=text]').nth(2).fill('portalos');
    await lap.locator('.lepcso').first().locator('input[type=password]').fill('jelszo1');
    await lap.locator('#mappa-hozzaad').click();
    await lap.locator('#urlap-ment').click();

    const mentes = await lap.evaluate(() =>
      window.__hivasok.find((h) => h.nev === 'cegek.ment'),
    );
    assert.ok(mentes, 'a mentésnek el kell jutnia a programig');
    assert.equal(mentes.ervek[0].nev, 'Harmadik Kft.');
    assert.equal(mentes.ervek[0].lepesek[0].felhasznalo, 'portalos');
    assert.equal(mentes.ervek[0].lepesek[0].jelszo, 'jelszo1');
    assert.deepEqual(mentes.ervek[0].mappak, ['C:\\Bizonylatok\\Uj']);
    await lap.close();
  });

  test('a mentett jelszó nem kerül ki az ablakba', async () => {
    const { lap } = await lapotNyit('fo.html');
    await lap.locator('.ceg-kartya').first().locator('button', { hasText: 'Beállítások' }).click();

    const jelszoMezo = lap.locator('.lepcso').first().locator('input[type=password]');
    assert.equal(await jelszoMezo.inputValue(), '', 'a jelszó értéke nem jelenhet meg');
    assert.match(await jelszoMezo.getAttribute('placeholder'), /mentve/);
    await lap.close();
  });
});

/* ── Cégablak ───────────────────────────────────────────────────────── */

describe('cégablak', () => {
  test('fájlonként mutatja, mi ment fel és mi nem', async () => {
    const { lap, hibak } = await lapotNyit('ceg.html', { kereses: '?ceg=ceg-1' });

    const sorok = lap.locator('.tabla tbody tr');
    assert.equal(await sorok.count(), 3);

    assert.deepEqual(await lap.locator('.tabla .jelzo').allTextContents(), [
      'Feltöltve',
      'Hibás',
      'Feltöltésre vár',
    ]);
    // A hiba oka ott van a sorban — nem kell utánanézni a naplóban.
    assert.match(await lap.locator('.hibauzenet').textContent(), /Az átvitel megszakadt/);
    assert.match(await sorok.nth(1).textContent(), /2\. próbálkozás/);
    assert.deepEqual(hibak, []);
    await lap.close();
  });

  test('a szűrő csak a kért állapotot mutatja', async () => {
    const { lap } = await lapotNyit('ceg.html', { kereses: '?ceg=ceg-1' });

    await lap.locator('#szuro button', { hasText: 'Hibás' }).click();
    assert.equal(await lap.locator('.tabla tbody tr').count(), 1);
    assert.deepEqual(await lap.locator('.tabla .jelzo').allTextContents(), ['Hibás']);

    await lap.locator('#szuro button', { hasText: 'Mind' }).click();
    assert.equal(await lap.locator('.tabla tbody tr').count(), 3);
    await lap.close();
  });

  test('a hibás sorban ott az Újra gomb, és működik', async () => {
    const { lap } = await lapotNyit('ceg.html', { kereses: '?ceg=ceg-1' });

    const hibasSor = lap.locator('.tabla tbody tr').nth(1);
    await hibasSor.locator('button', { hasText: 'Újra' }).click();

    const hivas = await lap.evaluate(() => window.__hivasok.find((h) => h.nev === 'ceg.ujraSorba'));
    assert.ok(hivas);
    assert.match(hivas.ervek[1], /szamla-002\.pdf$/);

    // A feltöltött sornál nincs mit újrapróbálni.
    const jóSor = lap.locator('.tabla tbody tr').first();
    assert.equal(await jóSor.locator('button', { hasText: 'Újra' }).count(), 0);
    await lap.close();
  });

  test('a fejlécben a cégnév és a kapcsolat állapota látszik', async () => {
    const { lap } = await lapotNyit('ceg.html', { kereses: '?ceg=ceg-1' });

    assert.equal(await lap.locator('#ceg-nev').textContent(), 'Blueway Trade Kft.');
    assert.equal(await lap.locator('#allapot').textContent(), 'Csatlakozva');
    assert.equal(await lap.locator('#kapcsolo').textContent(), 'Lecsatlakozás');
    assert.match(await lap.locator('#mappak').textContent(), /C:\\Bizonylatok\\Blueway/);
    await lap.close();
  });

  test('a napló megjelenik, a hibás sor kiemelve', async () => {
    const { lap } = await lapotNyit('ceg.html', { kereses: '?ceg=ceg-1' });

    assert.match(await lap.locator('#naplo').textContent(), /Bejelentkezve/);
    assert.equal(await lap.locator('#naplo .jel-hiba').count(), 1);
    await lap.close();
  });

  test('a méretek emberi alakban jelennek meg', async () => {
    const { lap } = await lapotNyit('ceg.html', { kereses: '?ceg=ceg-1' });
    const meretek = await lap.locator('.tabla tbody tr td:nth-child(3)').allTextContents();
    assert.deepEqual(meretek, ['24.0 kB', '1.0 MB', '900 B']);
    await lap.close();
  });
});
