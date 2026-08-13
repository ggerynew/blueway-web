/**
 * Az asztali változat próbái: több cég, lépcsős belépés, állapotkövetés.
 *
 * Négy dolgot bizonyítunk, mert ezek voltak a kérés lényegi pontjai:
 *
 *   1. a KÉTLÉPCSŐS belépés végigmegy — portál, majd onnan a cég felülete —,
 *      és a második lépcső címét nem kell tudni: az átirányítás elvezet oda
 *   2. a cégek adatai eltárolhatók, a JELSZÓ pedig nem kerül olvashatóan lemezre
 *   3. LÁTSZIK fájlonként, mi ment fel és mi nem
 *   4. ami elakadt, az a KÖVETKEZŐ FUTÁSKOR magától újra sorra kerül
 *
 * Az Electront ez a fájl nem indítja el — nem is kell: az egész tudás a
 * ../src alatt van, az Electron csak ablakot ad neki.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { mockIndit, fajlokatOsszeszed } from './mock-masc.mjs';
import { Naplo } from '../dist/src/naplo.js';
import { SutisKeres } from '../dist/src/sutis-keres.js';
import {
  belepEsKotetek,
  belepesiUrlapotKiolvas,
  lepcsokonVegig,
} from '../dist/src/bejelentkezes.js';
import { Cegtar, cegetEllenoriz, uresCeg, NINCS_TITKOSITAS } from '../dist/src/cegtar.js';
import { Allapottar } from '../dist/src/allapottar.js';
import { CegKapcsolat, Kapcsolattar } from '../dist/src/szinkron.js';

function munkamappa() {
  return mkdtempSync(join(tmpdir(), 'masc-asztal-'));
}

function bizonylatotIr(mappa, nev, tartalom) {
  mkdirSync(mappa, { recursive: true });
  const ut = join(mappa, nev);
  writeFileSync(ut, tartalom);
  return ut;
}

/** Egy próbacég a futó teszt-konnektorhoz, kétlépcsős belépéssel. */
function cegetKeszit(mock, mappak) {
  return {
    ...uresCeg(),
    nev: 'Blueway Trade Kft.',
    konnektor: mock.konnektor,
    gyoker: 'Feltöltés',
    lepesek: mock.lepesek,
    mappak,
    automata: true,
    rekurziv: false,
    fajlDatum: false,
    kiterjesztesek: [],
  };
}

/* ──────────────────────────────────────────────────────────────────────
   1. Lépcsős belépés
   ────────────────────────────────────────────────────────────────────── */

describe('lépcsős belépés', () => {
  test('a belépési űrlapot a jelszómezőről ismeri fel, nem a sorrendből', () => {
    const html = `
      <form action="/kereses"><input type="text" name="q"></form>
      <form action="/belep"><input type="hidden" name="jegy" value="J1">
        <input type="text" name="azonosito"><input type="password" name="kulcs"></form>`;
    const urlap = belepesiUrlapotKiolvas(html, 'https://masc.hu/lap');

    assert.equal(urlap.cel, 'https://masc.hu/belep', 'az űrlap saját címére kell posztolni');
    assert.equal(urlap.felhasznaloMezo, 'azonosito');
    assert.equal(urlap.jelszoMezo, 'kulcs');
    assert.deepEqual(urlap.rejtett, { jegy: 'J1' });
  });

  test('action nélküli űrlap a saját lapjára posztol', () => {
    const html = '<form><input type="text" name="u"><input type="password" name="p"></form>';
    assert.equal(belepesiUrlapotKiolvas(html, 'https://masc.hu/be').cel, 'https://masc.hu/be');
  });

  test('két lépcsőn végigmegy, és a másodikhoz nem kell címet tudni', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const naplo = new Naplo({ nemaKepernyo: true });
    const keres = new SutisKeres(naplo);

    const utvonal = await lepcsokonVegig(mock.lepesek, keres, naplo);

    assert.equal(utvonal.length, 2);
    // A portál sütije és a cég sütije is megvan — ez igazolja, hogy tényleg
    // mindkét lépcső lefutott, nem csak az első.
    assert.ok(keres.sutiNevek().includes('MASCSESSID'), 'a portál munkamenete hiányzik');
    assert.ok(keres.sutiNevek().includes('CEGSESSID'), 'a cég munkamenete hiányzik');
    await mock.leallit();
  });

  test('csak az első lépcsővel nem enged be a konnektor', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const naplo = new Naplo({ nemaKepernyo: true });
    const keres = new SutisKeres(naplo);

    await assert.rejects(
      belepEsKotetek(
        { konnektor: mock.konnektor, lepesek: [mock.lepesek[0]] },
        keres,
        naplo,
      ),
      /lejárt munkamenet|nem vagyunk bejelentkezve|weblapot küldött/,
      'a portálra belépve még nem szabad látnunk a cég mappáit',
    );
    await mock.leallit();
  });

  test('mindkét lépcső után megvannak a kötetek', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const naplo = new Naplo({ nemaKepernyo: true });
    const keres = new SutisKeres(naplo);

    const { gyokerek } = await belepEsKotetek(
      { konnektor: mock.konnektor, lepesek: mock.lepesek },
      keres,
      naplo,
    );
    assert.equal(gyokerek.length, 2);
    await mock.leallit();
  });

  test('rossz jelszó a MÁSODIK lépcsőn is kiderül', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const naplo = new Naplo({ nemaKepernyo: true });
    const keres = new SutisKeres(naplo);
    const rosszLepesek = [mock.lepesek[0], { ...mock.lepesek[1], jelszo: 'rossz' }];

    await assert.rejects(
      belepEsKotetek({ konnektor: mock.konnektor, lepesek: rosszLepesek }, keres, naplo),
      /lejárt munkamenet|nem vagyunk bejelentkezve|weblapot küldött/,
    );
    await mock.leallit();
  });
});

/* ──────────────────────────────────────────────────────────────────────
   2. Cégek tára
   ────────────────────────────────────────────────────────────────────── */

describe('cégtár', () => {
  /** Álltitkosító: megfordítja a szöveget. Nem véd semmit, csak kimutatja,
   *  hogy a mentés tényleg átengedte rajta a jelszót. */
  const alTitkosito = {
    elerheto: () => true,
    titkosit: (szoveg) => Buffer.from([...szoveg].reverse().join(''), 'utf8').toString('base64'),
    visszafejt: (titkos) => [...Buffer.from(titkos, 'base64').toString('utf8')].reverse().join(''),
  };

  function keszCeg(mappa) {
    return {
      ...uresCeg(),
      nev: 'Blueway Trade Kft.',
      konnektor: 'https://masc.hu/connector.php',
      gyoker: 'Feltöltés',
      lepesek: [
        { cimke: 'MASC portál', url: 'https://masc.hu/', felhasznalo: 'blueway', jelszo: 'titok1' },
        { cimke: 'Blueway Trade', url: '', felhasznalo: 'trade', jelszo: 'titok2' },
      ],
      mappak: [mappa],
    };
  }

  test('a cég visszaolvasható, a jelszóval együtt', () => {
    const mappa = munkamappa();
    const fajl = join(mappa, 'cegek.json');
    const tar = new Cegtar(fajl, alTitkosito);

    tar.rogzit(keszCeg(mappa));
    const [ceg] = tar.betolt();

    assert.equal(ceg.nev, 'Blueway Trade Kft.');
    assert.equal(ceg.lepesek.length, 2);
    assert.equal(ceg.lepesek[0].jelszo, 'titok1');
    assert.equal(ceg.lepesek[1].jelszo, 'titok2');
  });

  test('a jelszó nem olvasható a lemezre írt fájlban', () => {
    const mappa = munkamappa();
    const fajl = join(mappa, 'cegek.json');
    new Cegtar(fajl, alTitkosito).rogzit(keszCeg(mappa));

    const nyers = readFileSync(fajl, 'utf8');
    assert.ok(!nyers.includes('titok1'), 'a jelszó nyílt szöveggel szerepel a fájlban');
    assert.ok(!nyers.includes('titok2'), 'a jelszó nyílt szöveggel szerepel a fájlban');
    assert.ok(nyers.includes('jelszoTitkos'), 'a titkosított mezőnek ott kell lennie');
  });

  test('titkosítás nélkül a jelszó egyáltalán nem kerül lemezre', () => {
    const mappa = munkamappa();
    const fajl = join(mappa, 'cegek.json');
    const tar = new Cegtar(fajl, NINCS_TITKOSITAS);

    tar.rogzit(keszCeg(mappa));

    const nyers = readFileSync(fajl, 'utf8');
    assert.ok(!nyers.includes('titok1'), 'titkosítás nélkül a jelszót ki kell hagyni');
    assert.ok(!nyers.includes('jelszoTitkos'));
    assert.equal(tar.jelszoMentheto(), false);
    // A futás erejéig viszont megmarad, hogy ne kelljen újra begépelni.
    assert.equal(tar.betolt()[0].lepesek[0].jelszo, 'titok1');
  });

  test('több cég külön él, és törölhető', () => {
    const mappa = munkamappa();
    const tar = new Cegtar(join(mappa, 'cegek.json'), alTitkosito);

    const elso = keszCeg(mappa);
    const masodik = { ...keszCeg(mappa), id: 'masodik-ceg', nev: 'Másik Kft.' };
    tar.rogzit(elso);
    tar.rogzit(masodik);

    assert.deepEqual(tar.betolt().map((c) => c.nev).sort(), ['Blueway Trade Kft.', 'Másik Kft.']);

    tar.torol('masodik-ceg');
    assert.deepEqual(tar.betolt().map((c) => c.nev), ['Blueway Trade Kft.']);
  });

  test('a hiányos cégre érthető hibalistát ad', () => {
    const hibak = cegetEllenoriz(uresCeg());
    const egyben = hibak.join(' | ');
    assert.match(egyben, /cég nevét/);
    assert.match(egyben, /konnektor/);
    assert.match(egyben, /felhasználónév/);
    assert.match(egyben, /figyelt mappát/);
  });

  test('titkosítatlan konnektort nem fogad el', () => {
    const ceg = { ...uresCeg(), konnektor: 'http://masc.hu/connector.php' };
    assert.match(cegetEllenoriz(ceg).join(' | '), /csak https/);
  });
});

/* ──────────────────────────────────────────────────────────────────────
   3. Állapotkövetés
   ────────────────────────────────────────────────────────────────────── */

describe('állapottár', () => {
  test('az új fájl feltöltésre vár', () => {
    const adat = munkamappa();
    const forras = munkamappa();
    bizonylatotIr(forras, 'szamla.pdf', 'tartalom');

    const tar = new Allapottar(join(adat, 'allapot.json'));
    const lista = tar.atvizsgal([forras], {});

    assert.equal(lista.length, 1);
    assert.equal(lista[0].allapot, 'varakozik');
    assert.equal(lista[0].letezik, true);
    assert.deepEqual(tar.osszegzes(), { varakozik: 1, feltoltve: 0, hibas: 0 });
  });

  test('a feltöltöttet nem veszi elő újra', () => {
    const adat = munkamappa();
    const forras = munkamappa();
    const ut = bizonylatotIr(forras, 'szamla.pdf', 'tartalom');

    const tar = new Allapottar(join(adat, 'allapot.json'));
    tar.atvizsgal([forras], {});
    tar.jelol(ut, 'feltoltve');
    tar.ment();

    tar.atvizsgal([forras], {});
    assert.deepEqual(tar.feltoltendok(), []);
    assert.deepEqual(tar.osszegzes(), { varakozik: 0, feltoltve: 1, hibas: 0 });
  });

  test('a MEGVÁLTOZOTT tartalmú fájl újra feltöltendő', () => {
    const adat = munkamappa();
    const forras = munkamappa();
    const ut = bizonylatotIr(forras, 'szamla.pdf', 'első változat');

    const tar = new Allapottar(join(adat, 'allapot.json'));
    tar.atvizsgal([forras], {});
    tar.jelol(ut, 'feltoltve');
    tar.ment();

    // Javított számla, ugyanazon a néven.
    writeFileSync(ut, 'javított változat, más hosszal');
    tar.atvizsgal([forras], {});

    assert.equal(tar.feltoltendok().length, 1, 'a kicserélt bizonylatnak újra fel kell mennie');
  });

  test('a hibás bejegyzés a feltöltendők közt marad, és számolja a próbákat', () => {
    const adat = munkamappa();
    const forras = munkamappa();
    const ut = bizonylatotIr(forras, 'szamla.pdf', 'tartalom');

    const tar = new Allapottar(join(adat, 'allapot.json'));
    tar.atvizsgal([forras], {});
    tar.jelol(ut, 'hibas', 'megszakadt a hálózat');
    tar.jelol(ut, 'hibas', 'megszakadt a hálózat');
    tar.ment();

    const [bejegyzes] = tar.osszes();
    assert.equal(bejegyzes.allapot, 'hibas');
    assert.equal(bejegyzes.hiba, 'megszakadt a hálózat');
    assert.equal(bejegyzes.probalkozas, 2);
    assert.equal(tar.feltoltendok().length, 1, 'a hibásat újra kell próbálni');
  });

  test('a nyilvántartás túléli az újraindulást', () => {
    const adat = munkamappa();
    const forras = munkamappa();
    const ut = bizonylatotIr(forras, 'szamla.pdf', 'tartalom');
    const fajl = join(adat, 'allapot.json');

    const elso = new Allapottar(fajl);
    elso.atvizsgal([forras], {});
    elso.jelol(ut, 'hibas', 'elakadt');
    elso.ment();

    // Új példány, mintha a programot újraindítottuk volna.
    const masodik = new Allapottar(fajl);
    assert.equal(masodik.feltoltendok().length, 1);
    assert.equal(masodik.osszes()[0].hiba, 'elakadt');
  });

  test('a lemezről eltűnt fájlt jelöli, és nem próbálja feltölteni', () => {
    const adat = munkamappa();
    const forras = munkamappa();
    const ut = bizonylatotIr(forras, 'szamla.pdf', 'tartalom');

    const tar = new Allapottar(join(adat, 'allapot.json'));
    tar.atvizsgal([forras], {});

    unlinkSync(ut);
    assert.equal(tar.osszes()[0].letezik, false);
    assert.deepEqual(tar.feltoltendok(), [], 'a nem létező fájlt ne akarjuk feltölteni');
  });

  test('a sérült állapotfájl nem akasztja meg a programot', () => {
    const adat = munkamappa();
    const forras = munkamappa();
    bizonylatotIr(forras, 'szamla.pdf', 'tartalom');
    const fajl = join(adat, 'allapot.json');
    writeFileSync(fajl, '{ ez nem érvényes JSON');

    const tar = new Allapottar(fajl);
    assert.doesNotThrow(() => tar.atvizsgal([forras], {}));
    assert.equal(tar.feltoltendok().length, 1);
  });

  test('nem létező figyelt mappa nem hiba', () => {
    const adat = munkamappa();
    const tar = new Allapottar(join(adat, 'allapot.json'));
    assert.doesNotThrow(() => tar.atvizsgal([join(adat, 'nincs-ilyen')], {}));
  });
});

/* ──────────────────────────────────────────────────────────────────────
   4. Egy cég kapcsolata — a teljes menet
   ────────────────────────────────────────────────────────────────────── */

describe('cég kapcsolata és szinkronizálása', () => {
  test('kétlépcsős belépéssel csatlakozik, és feltölt', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const forras = munkamappa();
    const adat = munkamappa();
    bizonylatotIr(forras, 'szamla-001.pdf', 'a számla');

    const kapcsolat = new CegKapcsolat(
      cegetKeszit(mock, [forras]),
      new Allapottar(join(adat, 'allapot.json')),
    );

    await kapcsolat.csatlakoz();
    assert.equal(kapcsolat.nezet().allapot, 'csatlakozva');
    assert.equal(kapcsolat.nezet().kotetNev, 'Blueway Trade Kft - Feltöltés');

    const osszegzes = await kapcsolat.szinkronizal();
    assert.equal(osszegzes.feltoltve, 1);
    assert.equal(fajlokatOsszeszed(mock.kotetek.l1_.mappa).length, 1);
    assert.equal(kapcsolat.fajlok()[0].allapot, 'feltoltve');
    await mock.leallit();
  });

  test('a szinkronizálás magától csatlakozik, ha még nincs kapcsolat', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const forras = munkamappa();
    const adat = munkamappa();
    bizonylatotIr(forras, 'szamla.pdf', 'x');

    const kapcsolat = new CegKapcsolat(
      cegetKeszit(mock, [forras]),
      new Allapottar(join(adat, 'allapot.json')),
    );

    const osszegzes = await kapcsolat.szinkronizal();
    assert.equal(osszegzes.feltoltve, 1);
    assert.equal(kapcsolat.nezet().allapot, 'csatlakozva');
    await mock.leallit();
  });

  test('AMI ELAKADT, AZT A KÖVETKEZŐ FUTÁS MAGÁTÓL ÚJRAPRÓBÁLJA', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const forras = munkamappa();
    const adat = munkamappa();
    const allapotFajl = join(adat, 'allapot.json');
    bizonylatotIr(forras, 'szamla.pdf', 'a számla');

    // Első futás: a kiszolgáló elutasítja a feltöltést.
    mock.feltoltestElbuktat(true);
    const elso = new CegKapcsolat(cegetKeszit(mock, [forras]), new Allapottar(allapotFajl));
    const elsoOsszegzes = await elso.szinkronizal();

    assert.equal(elsoOsszegzes.feltoltve, 0);
    assert.equal(elso.fajlok()[0].allapot, 'hibas');
    assert.match(elso.fajlok()[0].hiba, /megszakadt|átvitel/i);
    assert.deepEqual(fajlokatOsszeszed(mock.kotetek.l1_.mappa), []);

    // A program bezárul, majd újraindul — új példány, ugyanaz az állapotfájl.
    mock.feltoltestElbuktat(false);
    const masodik = new CegKapcsolat(cegetKeszit(mock, [forras]), new Allapottar(allapotFajl));

    // Nincs külön kérés a felhasználótól: az indulási szinkron ugyanez a hívás.
    const masodikOsszegzes = await masodik.szinkronizal();

    assert.equal(masodikOsszegzes.feltoltve, 1, 'a tegnap elakadt bizonylatnak most fel kell mennie');
    assert.deepEqual(fajlokatOsszeszed(mock.kotetek.l1_.mappa), [`${kellHonap()}/szamla.pdf`]);
    assert.equal(masodik.fajlok()[0].allapot, 'feltoltve');
    await mock.leallit();
  });

  test('lecsatlakozás után újra lehet csatlakozni', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const adat = munkamappa();
    const kapcsolat = new CegKapcsolat(
      cegetKeszit(mock, [munkamappa()]),
      new Allapottar(join(adat, 'allapot.json')),
    );

    await kapcsolat.csatlakoz();
    assert.equal(kapcsolat.csatlakozva(), true);

    kapcsolat.lecsatlakoz();
    assert.equal(kapcsolat.csatlakozva(), false);
    assert.equal(kapcsolat.nezet().allapot, 'lecsatlakozva');

    await kapcsolat.csatlakoz();
    assert.equal(kapcsolat.csatlakozva(), true, 'gombnyomásra újra kell tudni csatlakozni');
    await mock.leallit();
  });

  test('rossz jelszónál hiba állapotba kerül, érthető üzenettel', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const adat = munkamappa();
    const ceg = cegetKeszit(mock, [munkamappa()]);
    ceg.lepesek = [ceg.lepesek[0], { ...ceg.lepesek[1], jelszo: 'rossz' }];

    const kapcsolat = new CegKapcsolat(ceg, new Allapottar(join(adat, 'allapot.json')));
    await assert.rejects(kapcsolat.csatlakoz());

    assert.equal(kapcsolat.nezet().allapot, 'hiba');
    assert.ok(kapcsolat.nezet().uzenet.length > 10, 'a hibaüzenetnek mondania kell valamit');
    await mock.leallit();
  });

  test('a felület menet közben értesül a változásokról', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const forras = munkamappa();
    const adat = munkamappa();
    bizonylatotIr(forras, 'szamla.pdf', 'x');

    const kapcsolat = new CegKapcsolat(
      cegetKeszit(mock, [forras]),
      new Allapottar(join(adat, 'allapot.json')),
    );

    const allapotok = [];
    const fajlEsemenyek = [];
    let naploSorok = 0;
    kapcsolat.on('valtozas', (nezet) => allapotok.push(nezet.allapot));
    kapcsolat.on('fajl', (ut, allapot) => fajlEsemenyek.push(allapot));
    kapcsolat.on('naplo', () => (naploSorok += 1));

    await kapcsolat.szinkronizal();

    assert.ok(allapotok.includes('csatlakozik'), 'a csatlakozás közbeni állapotnak látszania kell');
    assert.ok(allapotok.includes('csatlakozva'));
    assert.deepEqual(fajlEsemenyek, ['feltoltve']);
    assert.ok(naploSorok > 0, 'a naplónak el kell jutnia a felületig');
    await mock.leallit();
  });

  test('a jelszó a naplóba sem kerül bele', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const adat = munkamappa();
    const kapcsolat = new CegKapcsolat(
      cegetKeszit(mock, [munkamappa()]),
      new Allapottar(join(adat, 'allapot.json')),
    );

    await kapcsolat.csatlakoz();
    const egyben = kapcsolat.naplo_sorok().map((s) => s.uzenet).join('\n');
    assert.ok(!egyben.includes('trade-titok'), 'a jelszó megjelent a naplóban');
    await mock.leallit();
  });

  test('a kapcsolattár cégenként külön kapcsolatot tart', async () => {
    const mock = await mockIndit({ gyoker: munkamappa(), lepcsok: 2 });
    const adat = munkamappa();
    const tar = new Kapcsolattar();

    const elsoCeg = cegetKeszit(mock, [munkamappa()]);
    const masodikCeg = { ...cegetKeszit(mock, [munkamappa()]), id: 'masik', nev: 'Másik Kft.' };
    const keszito = (cegId) => new Allapottar(join(adat, `allapot-${cegId}.json`));

    const elso = tar.szerez(elsoCeg, keszito);
    const masodik = tar.szerez(masodikCeg, keszito);

    assert.notEqual(elso, masodik);
    assert.equal(tar.szerez(elsoCeg, keszito), elso, 'ugyanarra a cégre ugyanazt kell adnia');
    assert.equal(tar.osszes().length, 2);

    tar.eltavolit('masik');
    assert.equal(tar.osszes().length, 1);
    assert.equal(tar.keres('masik'), undefined);
    await mock.leallit();
  });
});

/** Az aktuális hónap „ÉÉÉÉ/HH" alakban — a célmappa ez alapján készül. */
function kellHonap() {
  const most = new Date();
  return `${most.getFullYear()}/${String(most.getMonth() + 1).padStart(2, '0')}`;
}
