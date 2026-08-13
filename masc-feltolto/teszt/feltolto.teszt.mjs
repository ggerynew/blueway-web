/**
 * A feltöltő próbái a teszt-konnektor ellen.
 *
 * Amit itt ellenőrzünk, az nem a „lefut-e" kérdés, hanem a három dolog, ami
 * könyvelési anyagnál számít:
 *
 *   1. a bizonylat FELMEGY, változatlan tartalommal, a jó hónapba
 *   2. NEM megy fel kétszer — az újrafuttatás nem duplázza a tételeket
 *   3. ami fent van, azt NEM ÍRJUK FELÜL magunktól
 *
 * Futtatás:  npm run masc:teszt
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, statSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { mockIndit, fajlokatOsszeszed } from './mock-masc.mjs';
import { Naplo } from '../src/naplo.ts';
import { SutisKeres } from '../src/sutis-keres.ts';
import { belep, gyokeretValaszt } from '../src/bejelentkezes.ts';
import { feltoltesLefuttat } from '../src/feltolto.ts';
import { bizonylatokatGyujt, honapotErtelmez, datumbolHonap } from '../src/bizonylatok.ts';
import { beallitasokatBetolt, BeallitasHiba } from '../src/beallitasok.ts';

/** Ideiglenes munkamappa egy próbához. */
function munkamappa() {
  return mkdtempSync(join(tmpdir(), 'masc-teszt-'));
}

/** Elkapja a képernyőre írt sorokat, hogy a figyelmeztetésekre is állíthassunk. */
function kimenettelFut(muvelet) {
  const sorok = [];
  const eredetiLog = console.log;
  console.log = (...ervek) => sorok.push(ervek.join(' '));
  const visszaad = muvelet();
  const befejez = () => {
    console.log = eredetiLog;
    return sorok;
  };
  return visszaad instanceof Promise
    ? visszaad.then((ertek) => ({ ertek, sorok: befejez() }))
    : Promise.resolve({ ertek: visszaad, sorok: befejez() });
}

/** Kész terep: futó mock, bejelentkezett kliens, kiválasztott kötet. */
async function terepetKeszit() {
  const gyoker = munkamappa();
  const mock = await mockIndit({ gyoker });
  const naplo = new Naplo({ titkok: [mock.suti] });
  const keres = new SutisKeres(naplo);
  const beallitasok = {
    konnektor: mock.konnektor,
    suti: mock.suti,
    mezoFelhasznalo: 'felhasznalo',
    mezoJelszo: 'jelszo',
    gyoker: 'Feltöltés',
  };
  const { kliens, gyokerek } = await belep(beallitasok, keres, naplo);
  const kotet = gyokeretValaszt(gyokerek, 'Feltöltés');
  return { mock, naplo, kliens, kotet, gyokerek, helyi: gyoker };
}

/** Bizonylat készítése a lemezen, adott tartalommal és dátummal. */
function bizonylatotIr(mappa, nev, tartalom, datum) {
  mkdirSync(mappa, { recursive: true });
  const ut = join(mappa, nev);
  writeFileSync(ut, tartalom);
  if (datum) {
    const masodperc = Math.floor(datum.getTime() / 1000);
    utimesSync(ut, masodperc, masodperc);
  }
  return ut;
}

const ALAP_OPCIOK = { fajlDatum: false, proba: false, felulir: false };

describe('bizonylatok összegyűjtése', () => {
  test('csak az engedett kiterjesztéseket veszi fel', () => {
    const mappa = munkamappa();
    bizonylatotIr(mappa, 'szamla.pdf', 'egy');
    bizonylatotIr(mappa, 'kep.jpg', 'kettő');
    bizonylatotIr(mappa, 'jegyzet.exe', 'három');
    bizonylatotIr(mappa, '~$nyitott.docx', 'négy');
    bizonylatotIr(mappa, '.rejtett.pdf', 'öt');

    const talalt = bizonylatokatGyujt([mappa]).map((b) => b.nev);
    assert.deepEqual(talalt, ['kep.jpg', 'szamla.pdf']);
  });

  test('almappát csak --rekurziv mellett néz', () => {
    const mappa = munkamappa();
    bizonylatotIr(mappa, 'fo.pdf', 'x');
    bizonylatotIr(join(mappa, 'alatta'), 'melyen.pdf', 'y');

    assert.deepEqual(bizonylatokatGyujt([mappa]).map((b) => b.nev), ['fo.pdf']);
    assert.deepEqual(
      bizonylatokatGyujt([mappa], { rekurziv: true }).map((b) => b.nev).sort(),
      ['fo.pdf', 'melyen.pdf'],
    );
  });

  test('az üres fájl megállítja a futást', () => {
    const mappa = munkamappa();
    bizonylatotIr(mappa, 'csonka.pdf', '');
    assert.throws(() => bizonylatokatGyujt([mappa]), /üres \(0 bájt\)/);
  });

  test('névvel megadott, ki nem szolgálható fájl nem csendben marad ki', () => {
    const mappa = munkamappa();
    const ut = bizonylatotIr(mappa, 'program.exe', 'x');
    assert.throws(() => bizonylatokatGyujt([ut]), /nincs az engedettek közt/);
  });

  test('ugyanaz a fájl kétszer megadva egyszer kerül fel', () => {
    const mappa = munkamappa();
    const ut = bizonylatotIr(mappa, 'szamla.pdf', 'x');
    assert.equal(bizonylatokatGyujt([mappa, ut]).length, 1);
  });
});

describe('hónap értelmezése', () => {
  test('több írásmódot elfogad', () => {
    assert.deepEqual(honapotErtelmez('2026-07'), { ev: '2026', ho: '07' });
    assert.deepEqual(honapotErtelmez('2026.7'), { ev: '2026', ho: '07' });
    assert.deepEqual(honapotErtelmez('202612'), { ev: '2026', ho: '12' });
  });

  test('a hibás megadást elutasítja', () => {
    assert.throws(() => honapotErtelmez('2026-13'), /1 és 12 között/);
    assert.throws(() => honapotErtelmez('júliusban'), /ÉÉÉÉ-HH/);
  });

  test('a dátumból vezető nullás hónap lesz', () => {
    assert.deepEqual(datumbolHonap(new Date(2026, 5, 14)), { ev: '2026', ho: '06' });
  });
});

describe('beállítások', () => {
  /** A MASC_* változók törlése, hogy a próba ne a futtató környezetén múljon. */
  function tisztaKornyezet(t) {
    const eredeti = { ...process.env };
    t.after(() => {
      process.env = eredeti;
    });
    for (const kulcs of Object.keys(process.env)) {
      if (kulcs.startsWith('MASC_')) delete process.env[kulcs];
    }
  }

  test('konnektor URL nélkül nem indul el', (t) => {
    tisztaKornyezet(t);
    assert.throws(() => beallitasokatBetolt(), BeallitasHiba);
    assert.throws(() => beallitasokatBetolt(), /MASC_KONNEKTOR/);
  });

  test('bejelentkezési adat nélkül nem indul el', (t) => {
    tisztaKornyezet(t);
    process.env.MASC_KONNEKTOR = 'https://masc.hu/connector.php';
    assert.throws(() => beallitasokatBetolt(), /hogyan jelentkezzünk be/);
  });

  test('titkosítatlan kapcsolatot csak localhoston enged', (t) => {
    tisztaKornyezet(t);
    process.env.MASC_SUTI = 'A=B';
    process.env.MASC_KONNEKTOR = 'http://masc.hu/connector.php';
    assert.throws(() => beallitasokatBetolt(), /csak https/);

    process.env.MASC_KONNEKTOR = 'http://127.0.0.1:8080/connector.php';
    assert.equal(beallitasokatBetolt().konnektor, 'http://127.0.0.1:8080/connector.php');
  });

  test('a környezeti változó erősebb a fájlnál', (t) => {
    tisztaKornyezet(t);
    const mappa = munkamappa();
    const konfig = join(mappa, 'masc.env');
    writeFileSync(
      konfig,
      '# megjegyzés\nMASC_KONNEKTOR=https://fajlbol.hu/connector.php\nMASC_SUTI="A=B"\nMASC_GYOKER=Feltöltés\n',
    );

    assert.equal(beallitasokatBetolt(konfig).konnektor, 'https://fajlbol.hu/connector.php');
    assert.equal(beallitasokatBetolt(konfig).suti, 'A=B', 'az idézőjel nem kerülhet az értékbe');

    process.env.MASC_KONNEKTOR = 'https://kornyezetbol.hu/connector.php';
    assert.equal(beallitasokatBetolt(konfig).konnektor, 'https://kornyezetbol.hu/connector.php');
  });
});

describe('bejelentkezés', () => {
  test('süti nélkül a belépési lapot kapjuk — és ezt felismerjük', async () => {
    const gyoker = munkamappa();
    const mock = await mockIndit({ gyoker });
    const naplo = new Naplo();
    const keres = new SutisKeres(naplo);
    await assert.rejects(
      belep(
        { konnektor: mock.konnektor, suti: 'MASCSESSID=rossz', mezoFelhasznalo: 'a', mezoJelszo: 'b', gyoker: 'Feltöltés' },
        keres,
        naplo,
      ),
      /lejárt munkamenet/,
    );
    await mock.leallit();
  });

  test('űrlapos belépés a rejtett CSRF-mezővel együtt működik', async () => {
    const gyoker = munkamappa();
    const mock = await mockIndit({ gyoker });
    const naplo = new Naplo({ titkok: ['titok'] });
    const keres = new SutisKeres(naplo);
    const { gyokerek } = await belep(
      {
        konnektor: mock.konnektor,
        belepesUrl: mock.belepesUrl,
        felhasznalo: 'blueway',
        jelszo: 'titok',
        mezoFelhasznalo: 'felhasznalo',
        mezoJelszo: 'jelszo',
        gyoker: 'Feltöltés',
      },
      keres,
      naplo,
    );
    assert.equal(gyokerek.length, 2);
    await mock.leallit();
  });

  test('rossz jelszónál nem hisszük magunkat bent lévőnek', async () => {
    const gyoker = munkamappa();
    const mock = await mockIndit({ gyoker });
    const naplo = new Naplo();
    const keres = new SutisKeres(naplo);
    await assert.rejects(
      belep(
        {
          konnektor: mock.konnektor,
          belepesUrl: mock.belepesUrl,
          felhasznalo: 'blueway',
          jelszo: 'rossz',
          mezoFelhasznalo: 'felhasznalo',
          mezoJelszo: 'jelszo',
          gyoker: 'Feltöltés',
        },
        keres,
        naplo,
      ),
      /nem kaptunk munkamenet-sütit|lejárt munkamenet/,
    );
    await mock.leallit();
  });

  test('a kötetválasztás egyértelmű nevet kíván', async () => {
    const { gyokerek, mock } = await terepetKeszit();
    assert.equal(gyokeretValaszt(gyokerek, 'Könyvelés').name, 'Blueway Trade Kft - Könyvelés');
    assert.throws(() => gyokeretValaszt(gyokerek, 'Blueway'), /2 kötet is illeszkedik/);
    assert.throws(() => gyokeretValaszt(gyokerek, 'Nincsilyen'), /Nincs .* nevű kötet/);
    await mock.leallit();
  });
});

describe('feltöltés', () => {
  test('létrehozza az ÉV/HÓ mappát, és felviszi a bizonylatot', async () => {
    const { mock, naplo, kliens, kotet } = await terepetKeszit();
    const forras = munkamappa();
    bizonylatotIr(forras, 'szamla-001.pdf', 'ez a számla tartalma');

    const bizonylatok = bizonylatokatGyujt([forras]);
    const osszegzes = await feltoltesLefuttat(
      kliens, kotet, bizonylatok,
      { ...ALAP_OPCIOK, honap: { ev: '2026', ho: '08' } },
      naplo,
    );

    assert.equal(osszegzes.feltoltve, 1);
    assert.equal(osszegzes.hibas, 0);
    const felment = join(mock.kotetek.l1_.mappa, '2026', '08', 'szamla-001.pdf');
    assert.ok(existsSync(felment), 'a fájlnak a 2026/08 mappában kell lennie');
    assert.equal(readFileSync(felment, 'utf8'), 'ez a számla tartalma');
    await mock.leallit();
  });

  test('a bizonylat eredeti dátuma is átmegy', async () => {
    const { mock, naplo, kliens, kotet } = await terepetKeszit();
    const forras = munkamappa();
    const regen = new Date(2026, 6, 3, 10, 30, 0);
    bizonylatotIr(forras, 'regi.pdf', 'tartalom', regen);

    await feltoltesLefuttat(
      kliens, kotet, bizonylatokatGyujt([forras]),
      { ...ALAP_OPCIOK, honap: { ev: '2026', ho: '07' } },
      naplo,
    );

    const felment = join(mock.kotetek.l1_.mappa, '2026', '07', 'regi.pdf');
    const elteres = Math.abs(statSync(felment).mtimeMs - regen.getTime());
    assert.ok(elteres < 2000, `a módosítási időnek át kell mennie (eltérés: ${elteres} ms)`);
    await mock.leallit();
  });

  test('a --fajl-datum minden bizonylatot a saját hónapjába tesz', async () => {
    const { mock, naplo, kliens, kotet } = await terepetKeszit();
    const forras = munkamappa();
    bizonylatotIr(forras, 'junius.pdf', 'a', new Date(2026, 5, 10));
    bizonylatotIr(forras, 'julius.pdf', 'b', new Date(2026, 6, 10));

    await feltoltesLefuttat(
      kliens, kotet, bizonylatokatGyujt([forras]),
      { ...ALAP_OPCIOK, fajlDatum: true },
      naplo,
    );

    assert.deepEqual(fajlokatOsszeszed(mock.kotetek.l1_.mappa), [
      '2026/06/junius.pdf',
      '2026/07/julius.pdf',
    ]);
    await mock.leallit();
  });

  test('újrafuttatás nem duplázza a bizonylatot', async () => {
    const { mock, naplo, kliens, kotet } = await terepetKeszit();
    const forras = munkamappa();
    bizonylatotIr(forras, 'szamla.pdf', 'változatlan');
    const bizonylatok = bizonylatokatGyujt([forras]);
    const opciok = { ...ALAP_OPCIOK, honap: { ev: '2026', ho: '08' } };

    const elso = await feltoltesLefuttat(kliens, kotet, bizonylatok, opciok, naplo);
    const masodik = await feltoltesLefuttat(kliens, kotet, bizonylatok, opciok, naplo);

    assert.equal(elso.feltoltve, 1);
    assert.equal(masodik.feltoltve, 0, 'másodszorra nem szabad újra feltölteni');
    assert.equal(masodik.kihagyva, 1);
    assert.deepEqual(fajlokatOsszeszed(mock.kotetek.l1_.mappa), ['2026/08/szamla.pdf']);
    await mock.leallit();
  });

  test('azonos név, más méret: kihagyja és figyelmeztet', async () => {
    const { mock, naplo, kliens, kotet } = await terepetKeszit();
    const forras = munkamappa();
    const opciok = { ...ALAP_OPCIOK, honap: { ev: '2026', ho: '08' } };

    bizonylatotIr(forras, 'szamla.pdf', 'eredeti');
    await feltoltesLefuttat(kliens, kotet, bizonylatokatGyujt([forras]), opciok, naplo);

    bizonylatotIr(forras, 'szamla.pdf', 'egészen más, hosszabb tartalom');
    const { ertek: osszegzes, sorok } = await kimenettelFut(() =>
      feltoltesLefuttat(kliens, kotet, bizonylatokatGyujt([forras]), opciok, naplo),
    );

    assert.equal(osszegzes.feltoltve, 0);
    assert.equal(osszegzes.kihagyva, 1);
    assert.ok(sorok.some((s) => s.includes('más méretű')), 'szólnia kell az eltérésről');
    const felment = join(mock.kotetek.l1_.mappa, '2026', '08', 'szamla.pdf');
    assert.equal(readFileSync(felment, 'utf8'), 'eredeti', 'a fent lévőt nem szabad bántani');
    await mock.leallit();
  });

  test('--felulir mellett viszont felülírja', async () => {
    const { mock, naplo, kliens, kotet } = await terepetKeszit();
    const forras = munkamappa();
    const opciok = { ...ALAP_OPCIOK, honap: { ev: '2026', ho: '08' } };

    bizonylatotIr(forras, 'szamla.pdf', 'eredeti');
    await feltoltesLefuttat(kliens, kotet, bizonylatokatGyujt([forras]), opciok, naplo);

    bizonylatotIr(forras, 'szamla.pdf', 'javított');
    await feltoltesLefuttat(kliens, kotet, bizonylatokatGyujt([forras]), { ...opciok, felulir: true }, naplo);

    const felment = join(mock.kotetek.l1_.mappa, '2026', '08', 'szamla.pdf');
    assert.equal(readFileSync(felment, 'utf8'), 'javított');
    assert.deepEqual(fajlokatOsszeszed(mock.kotetek.l1_.mappa), ['2026/08/szamla.pdf']);
    await mock.leallit();
  });

  test('a próbafutás semmit nem hoz létre', async () => {
    const { mock, naplo, kliens, kotet } = await terepetKeszit();
    const forras = munkamappa();
    bizonylatotIr(forras, 'szamla.pdf', 'x');

    const osszegzes = await feltoltesLefuttat(
      kliens, kotet, bizonylatokatGyujt([forras]),
      { ...ALAP_OPCIOK, proba: true, honap: { ev: '2026', ho: '08' } },
      naplo,
    );

    assert.equal(osszegzes.feltoltve, 1, 'a próba beszámol arról, mi menne fel');
    assert.deepEqual(fajlokatOsszeszed(mock.kotetek.l1_.mappa), [], 'de a kiszolgálón semmi nem lett');
    await mock.leallit();
  });

  test('a kiszolgálói adagkorlátnál több fájl is felmegy', async () => {
    // A teszt-konnektor uplMaxFile értéke 3, és a negyediktől hibázik —
    // tehát ez a próba az adagolást méri, nem a jóindulatot.
    const { mock, naplo, kliens, kotet } = await terepetKeszit();
    const forras = munkamappa();
    const vart = [];
    for (let i = 1; i <= 7; i++) {
      const nev = `szamla-${String(i).padStart(3, '0')}.pdf`;
      bizonylatotIr(forras, nev, `tartalom ${i}`);
      vart.push(`2026/08/${nev}`);
    }

    const osszegzes = await feltoltesLefuttat(
      kliens, kotet, bizonylatokatGyujt([forras]),
      { ...ALAP_OPCIOK, honap: { ev: '2026', ho: '08' } },
      naplo,
    );

    assert.equal(osszegzes.feltoltve, 7);
    assert.equal(osszegzes.hibas, 0);
    assert.deepEqual(fajlokatOsszeszed(mock.kotetek.l1_.mappa), vart.sort());
    await mock.leallit();
  });

  test('sikeres feltöltés után archivál', async () => {
    const { mock, naplo, kliens, kotet } = await terepetKeszit();
    const forras = munkamappa();
    const archivum = munkamappa();
    const ut = bizonylatotIr(forras, 'szamla.pdf', 'x');

    await feltoltesLefuttat(
      kliens, kotet, bizonylatokatGyujt([forras]),
      { ...ALAP_OPCIOK, honap: { ev: '2026', ho: '08' }, archivum },
      naplo,
    );

    assert.ok(!existsSync(ut), 'a feltöltött fájl nem maradhat a bejövő mappában');
    assert.ok(existsSync(join(archivum, '2026', '08', 'szamla.pdf')));
    await mock.leallit();
  });

  test('csak olvasható kötetbe nem sikerül a mappakészítés', async () => {
    const { mock, naplo, kliens, gyokerek } = await terepetKeszit();
    const konyveles = gyokeretValaszt(gyokerek, 'Könyvelés');
    const forras = munkamappa();
    bizonylatotIr(forras, 'szamla.pdf', 'x');

    const osszegzes = await feltoltesLefuttat(
      kliens, konyveles, bizonylatokatGyujt([forras]),
      { ...ALAP_OPCIOK, honap: { ev: '2026', ho: '08' } },
      naplo,
    );

    assert.equal(osszegzes.feltoltve, 0);
    assert.equal(osszegzes.hibas, 1);
    await mock.leallit();
  });
});

describe('parancssori felület', () => {
  const BELEPESI_PONT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'index.ts');

  /**
   * A programot úgy indítjuk, ahogy a felhasználó tenné: külön folyamatban.
   *
   * SZÁNDÉKOSAN ASZINKRON. A spawnSync itt holtpontot okozna: a teszt-konnektor
   * ENNEK a folyamatnak az eseményhurkán fut, a spawnSync pedig azt blokkolja —
   * a gyerek örökre várná a HTTP-választ, amit a szülő nem tudna kiszolgálni.
   *
   * A MASC_* változókat kivesszük a környezetből, hogy a fejlesztői gép
   * beállításai ne szivárogjanak be a próbába.
   */
  function futtat(ervek, konfigUt) {
    const kornyezet = { ...process.env };
    for (const kulcs of Object.keys(kornyezet)) {
      if (kulcs.startsWith('MASC_')) delete kornyezet[kulcs];
    }
    const gyerek = spawn(
      process.execPath,
      ['--experimental-strip-types', BELEPESI_PONT, ...ervek, '--beallitas', konfigUt],
      { env: kornyezet },
    );

    let stdout = '';
    let stderr = '';
    gyerek.stdout.setEncoding('utf8');
    gyerek.stderr.setEncoding('utf8');
    gyerek.stdout.on('data', (d) => { stdout += d; });
    gyerek.stderr.on('data', (d) => { stderr += d; });

    return new Promise((kesz, hiba) => {
      gyerek.on('error', hiba);
      gyerek.on('close', (status) => kesz({ status, stdout, stderr }));
    });
  }

  /** Kitöltött beállításfájl a futó teszt-konnektorhoz. */
  function konfigotIr(mock) {
    const ut = join(munkamappa(), 'masc.env');
    writeFileSync(
      ut,
      `MASC_KONNEKTOR=${mock.konnektor}\nMASC_SUTI=${mock.suti}\nMASC_GYOKER=Feltöltés\n`,
    );
    return ut;
  }

  test('a felderit parancs kiírja a köteteket', async () => {
    const mock = await mockIndit({ gyoker: munkamappa() });
    const eredmeny = await futtat(['felderit'], konfigotIr(mock));

    assert.equal(eredmeny.status, 0, eredmeny.stderr);
    assert.match(eredmeny.stdout, /Blueway Trade Kft - Feltöltés/);
    assert.match(eredmeny.stdout, /Blueway Trade Kft - Könyvelés/);
    assert.match(eredmeny.stdout, /csak olvasható/, 'a könyvelési kötet jogát jeleznie kell');
    await mock.leallit();
  });

  test('a feltoltés végigmegy, és 0-val tér vissza', async () => {
    const mock = await mockIndit({ gyoker: munkamappa() });
    const forras = munkamappa();
    bizonylatotIr(forras, 'szamla-42.pdf', 'negyvenkettő');

    const eredmeny = await futtat(['feltolt', forras, '--ho', '2026-08'], konfigotIr(mock));

    assert.equal(eredmeny.status, 0, eredmeny.stderr);
    assert.match(eredmeny.stdout, /1 feltöltve, 0 kihagyva, 0 hibás/);
    assert.deepEqual(fajlokatOsszeszed(mock.kotetek.l1_.mappa), ['2026/08/szamla-42.pdf']);
    await mock.leallit();
  });

  test('a --proba nem nyúl a kiszolgálóhoz', async () => {
    const mock = await mockIndit({ gyoker: munkamappa() });
    const forras = munkamappa();
    bizonylatotIr(forras, 'szamla.pdf', 'x');

    const eredmeny = await futtat(['feltolt', forras, '--ho', '2026-08', '--proba'], konfigotIr(mock));

    assert.equal(eredmeny.status, 0, eredmeny.stderr);
    assert.match(eredmeny.stdout, /PRÓBAFUTÁS/);
    assert.deepEqual(fajlokatOsszeszed(mock.kotetek.l1_.mappa), []);
    await mock.leallit();
  });

  test('rossz kapcsolóra érthető hibával, 2-vel áll le', async () => {
    const mock = await mockIndit({ gyoker: munkamappa() });
    const konfig = konfigotIr(mock);

    const ismeretlen = await futtat(['feltolt', '--nincsilyen'], konfig);
    assert.equal(ismeretlen.status, 2);
    assert.match(ismeretlen.stderr, /Ismeretlen kapcsoló/);

    const utNelkul = await futtat(['feltolt'], konfig);
    assert.equal(utNelkul.status, 2);
    assert.match(utNelkul.stdout + utNelkul.stderr, /Nem adtál meg fájlt vagy mappát/);

    const utkozo = await futtat(['feltolt', '.', '--ho', '2026-08', '--fajl-datum'], konfig);
    assert.equal(utkozo.status, 2);
    assert.match(utkozo.stderr, /egyszerre nem adható meg/);

    await mock.leallit();
  });

  test('a süti nem szivárog ki a kimenetre', async () => {
    const mock = await mockIndit({ gyoker: munkamappa() });
    const forras = munkamappa();
    bizonylatotIr(forras, 'szamla.pdf', 'x');

    const eredmeny = await futtat(
      ['feltolt', forras, '--ho', '2026-08', '--bobeszedu'],
      konfigotIr(mock),
    );

    const teljesKimenet = eredmeny.stdout + eredmeny.stderr;
    assert.equal(eredmeny.status, 0, eredmeny.stderr);
    assert.ok(
      !teljesKimenet.includes('teszt-munkamenet-123'),
      'a munkamenet-süti értéke még bőbeszédű módban sem jelenhet meg',
    );
    await mock.leallit();
  });
});
