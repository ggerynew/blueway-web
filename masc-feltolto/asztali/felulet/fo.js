/**
 * A főképernyő működése.
 *
 * Az ablak semmit nem tud a hálózatról és a fájlrendszerről: mindent a
 * `window.masc` hídon keresztül kér a fő folyamattól. Ez a fájl tehát
 * kizárólag megjelenítés és felhasználói szándék — épp ezért kipróbálható
 * böngészőben is, a híd helyére tett próbabábuval.
 *
 * A LISTA MINDIG A VALÓSÁGOT MUTATJA
 *
 * Az állapotot nem itt tartjuk nyilván: a fő folyamat minden változásnál
 * eseményt küld, és mi újrarajzolunk. Így nem fordulhat elő, hogy a képernyő
 * „csatlakozva" állapotot mutat, miközben a kapcsolat rég elszállt.
 */
'use strict';

/** A legutóbb kapott cégadatok — a szerkesztő űrlap ebből indul. */
let cegek = [];
/** A szerkesztés alatt álló cég másolata. */
let szerkesztett = null;

const elem = (azonosito) => document.getElementById(azonosito);

/** Szövegcsomó biztonságos beillesztése — HTML-t sosem építünk füzérből. */
function szoveges(cimke, szoveg, osztaly) {
  const csomo = document.createElement(cimke);
  if (osztaly) csomo.className = osztaly;
  csomo.textContent = szoveg;
  return csomo;
}

const ALLAPOT_SZOVEG = {
  lecsatlakozva: 'Nincs csatlakozva',
  csatlakozik: 'Csatlakozás…',
  csatlakozva: 'Csatlakozva',
  hiba: 'Hiba',
};

/** Egy cég kártyája a főképernyőn. */
function kartyat(ceg, nezet) {
  const kartya = document.createElement('div');
  kartya.className = 'ceg-kartya';

  const fej = document.createElement('div');
  fej.className = 'ceg-fej';
  fej.append(szoveges('span', ceg.nev, 'ceg-nev'));
  fej.append(szoveges('span', ALLAPOT_SZOVEG[nezet.allapot] ?? nezet.allapot, `allapot ${nezet.allapot}`));
  kartya.append(fej);

  kartya.append(szoveges('div', nezet.uzenet, 'ceg-uzenet'));

  const szamlalok = document.createElement('div');
  szamlalok.className = 'szamlalok';
  const parok = [
    ['varakozik', 'feltöltésre vár', nezet.osszegzes.varakozik],
    ['feltoltve', 'feltöltve', nezet.osszegzes.feltoltve],
    ['hibas', 'hibás', nezet.osszegzes.hibas],
  ];
  for (const [kulcs, cimke, ertek] of parok) {
    const doboz = document.createElement('span');
    doboz.className = `szamlalo ${kulcs}`;
    doboz.append(szoveges('b', String(ertek)), document.createTextNode(` ${cimke}`));
    szamlalok.append(doboz);
  }
  kartya.append(szamlalok);

  const gombok = document.createElement('div');
  gombok.className = 'ceg-gombok';

  // Csatlakozás és lecsatlakozás — a kérés szerint gombnyomásra is megy,
  // nem csak automatikusan.
  const csatlakozva = nezet.allapot === 'csatlakozva';
  const folyamatban = nezet.allapot === 'csatlakozik';

  const kapcsoloGomb = szoveges('button', csatlakozva ? 'Lecsatlakozás' : 'Csatlakozás');
  if (!csatlakozva) kapcsoloGomb.className = 'elsodleges';
  kapcsoloGomb.disabled = folyamatban;
  kapcsoloGomb.onclick = async () => {
    kapcsoloGomb.disabled = true;
    if (csatlakozva) await window.masc.ceg.lecsatlakoz(ceg.id);
    else await window.masc.ceg.csatlakoz(ceg.id);
    await rajzol();
  };
  gombok.append(kapcsoloGomb);

  const szinkronGomb = szoveges('button', nezet.szinkronFut ? 'Szinkronizál…' : 'Szinkronizálás');
  szinkronGomb.disabled = nezet.szinkronFut || folyamatban;
  szinkronGomb.onclick = async () => {
    szinkronGomb.disabled = true;
    await window.masc.ceg.szinkron(ceg.id);
    await rajzol();
  };
  gombok.append(szinkronGomb);

  const ablakGomb = szoveges('button', 'Megnyitás külön ablakban');
  ablakGomb.onclick = () => window.masc.ceg.ablak(ceg.id);
  gombok.append(ablakGomb);

  const szerkesztGomb = szoveges('button', 'Beállítások');
  szerkesztGomb.onclick = () => urlapotNyit(ceg);
  gombok.append(szerkesztGomb);

  const torolGomb = szoveges('button', 'Törlés', 'veszelyes');
  torolGomb.onclick = async () => {
    // Szándékosan nem törlünk visszakérdezés nélkül: a cég törlésével a
    // belépési adatai és a feltöltési nyilvántartása is elvész.
    const biztos = window.confirm(
      `Biztosan törlöd a(z) „${ceg.nev}" céget?\n\n` +
        'A belépési adatai és a feltöltési nyilvántartása is törlődik. ' +
        'A bizonylatok a lemezen és a MASC-ban érintetlenül maradnak.',
    );
    if (!biztos) return;
    await window.masc.cegek.torol(ceg.id);
    await rajzol();
  };
  gombok.append(torolGomb);

  kartya.append(gombok);
  return kartya;
}

async function rajzol() {
  const adatok = await window.masc.cegek.lista();
  cegek = adatok.map((a) => a.ceg);

  const lista = elem('ceg-lista');
  lista.replaceChildren();
  for (const { ceg, nezet } of adatok) lista.append(kartyat(ceg, nezet));

  elem('ures').hidden = adatok.length > 0;
  elem('mind-szinkron').disabled = adatok.length === 0;

  const csatlakozott = adatok.filter((a) => a.nezet.allapot === 'csatlakozva').length;
  elem('alcim').textContent =
    adatok.length === 0 ? '' : `${adatok.length} cég · ${csatlakozott} csatlakozva`;
}

/* ── A cég szerkesztő űrlapja ───────────────────────────────────────── */

/** Egy belépési lépcső mezői. */
function lepcsotRajzol(lepes, index, osszesen) {
  const doboz = document.createElement('div');
  doboz.className = 'lepcso';

  const fej = document.createElement('div');
  fej.className = 'lepcso-fej';
  fej.append(szoveges('span', String(index + 1), 'lepcso-sorszam'));

  const cimkeMezo = document.createElement('input');
  cimkeMezo.type = 'text';
  cimkeMezo.value = lepes.cimke ?? '';
  cimkeMezo.placeholder = index === 0 ? 'MASC portál' : 'Cég felülete';
  cimkeMezo.oninput = () => {
    lepes.cimke = cimkeMezo.value;
  };
  const cimkeBurok = document.createElement('div');
  cimkeBurok.className = 'lepcso-cim';
  cimkeBurok.append(cimkeMezo);
  fej.append(cimkeBurok);

  if (osszesen > 1) {
    const torol = szoveges('button', 'Törlés', 'apro veszelyes');
    torol.type = 'button';
    torol.onclick = () => {
      szerkesztett.lepesek.splice(index, 1);
      lepcsoketRajzol();
    };
    fej.append(torol);
  }
  doboz.append(fej);

  const urlCimke = document.createElement('label');
  urlCimke.append(szoveges('span', index === 0 ? 'Belépési lap címe' : 'Belépési lap címe (elhagyható)'));
  const urlMezo = document.createElement('input');
  urlMezo.type = 'text';
  urlMezo.value = lepes.url ?? '';
  urlMezo.placeholder = index === 0 ? 'https://masc.hu/' : 'üresen: ahová az előző lépcső vitt';
  urlMezo.oninput = () => {
    lepes.url = urlMezo.value;
  };
  urlCimke.append(urlMezo);
  urlCimke.append(
    szoveges(
      'span',
      index === 0
        ? 'Az a lap, ahol a MASC bejelentkezési űrlapja van.'
        : 'Üresen hagyva ott folytatjuk, ahová az előző belépés vitt — a MASC ' +
            'rendszerint magától átdob a második belépőre.',
      'sugo',
    ),
  );
  doboz.append(urlCimke);

  const par = document.createElement('div');
  par.className = 'mezopar';

  const felhasznaloCimke = document.createElement('label');
  felhasznaloCimke.append(szoveges('span', 'Felhasználónév'));
  const felhasznaloMezo = document.createElement('input');
  felhasznaloMezo.type = 'text';
  felhasznaloMezo.value = lepes.felhasznalo ?? '';
  felhasznaloMezo.oninput = () => {
    lepes.felhasznalo = felhasznaloMezo.value;
  };
  felhasznaloCimke.append(felhasznaloMezo);
  par.append(felhasznaloCimke);

  const jelszoCimke = document.createElement('label');
  jelszoCimke.append(szoveges('span', 'Jelszó'));
  const jelszoMezo = document.createElement('input');
  jelszoMezo.type = 'password';
  jelszoMezo.value = '';
  // A mentett jelszót nem küldjük ki az ablakba. Üresen hagyva marad a régi.
  jelszoMezo.placeholder = lepes.vanJelszo ? '•••••••• (mentve)' : '';
  jelszoMezo.oninput = () => {
    lepes.jelszo = jelszoMezo.value;
  };
  jelszoCimke.append(jelszoMezo);
  if (lepes.vanJelszo) {
    jelszoCimke.append(szoveges('span', 'Üresen hagyva marad a mentett jelszó.', 'sugo'));
  }
  par.append(jelszoCimke);
  doboz.append(par);

  const reszletek = document.createElement('details');
  reszletek.className = 'reszletek';
  reszletek.append(szoveges('summary', 'Ha az űrlap mezőnevei szokatlanok'));
  const mezoPar = document.createElement('div');
  mezoPar.className = 'mezopar';
  for (const [kulcs, cimke] of [
    ['mezoFelhasznalo', 'Felhasználónév mező neve'],
    ['mezoJelszo', 'Jelszó mező neve'],
  ]) {
    const cimkeElem = document.createElement('label');
    cimkeElem.append(szoveges('span', cimke));
    const mezo = document.createElement('input');
    mezo.type = 'text';
    mezo.value = lepes[kulcs] ?? '';
    mezo.placeholder = 'magától felismeri';
    mezo.oninput = () => {
      lepes[kulcs] = mezo.value;
    };
    cimkeElem.append(mezo);
    mezoPar.append(cimkeElem);
  }
  reszletek.append(mezoPar);
  reszletek.append(
    szoveges(
      'span',
      'A program magától megkeresi a belépési űrlapot a lapon. Csak akkor ' +
        'töltsd ki ezeket, ha a felismerés nem sikerül.',
      'sugo',
    ),
  );
  doboz.append(reszletek);

  return doboz;
}

function lepcsoketRajzol() {
  const doboz = elem('lepcsok');
  doboz.replaceChildren();
  szerkesztett.lepesek.forEach((lepes, index) => {
    doboz.append(lepcsotRajzol(lepes, index, szerkesztett.lepesek.length));
  });
}

function mappakatRajzol() {
  const lista = elem('mappa-lista');
  lista.replaceChildren();

  if (szerkesztett.mappak.length === 0) {
    lista.append(szoveges('li', 'Még nincs megadva mappa.', 'ures-sor'));
    return;
  }

  szerkesztett.mappak.forEach((mappa, index) => {
    const sor = document.createElement('li');
    sor.append(szoveges('span', mappa));
    const torol = szoveges('button', 'Törlés', 'apro veszelyes');
    torol.type = 'button';
    torol.onclick = () => {
      szerkesztett.mappak.splice(index, 1);
      mappakatRajzol();
    };
    sor.append(torol);
    lista.append(sor);
  });
}

function urlapotNyit(ceg) {
  // Mély másolat: a Mégse tényleg dobja el a módosításokat.
  szerkesztett = JSON.parse(JSON.stringify(ceg));
  szerkesztett.lepesek ??= [];
  szerkesztett.mappak ??= [];

  elem('parbeszed-cim').textContent = ceg.nev ? ceg.nev : 'Új cég';
  elem('mezo-nev').value = szerkesztett.nev ?? '';
  elem('mezo-konnektor').value = szerkesztett.konnektor ?? '';
  elem('mezo-gyoker').value = szerkesztett.gyoker ?? 'Feltöltés';
  elem('mezo-automata').checked = szerkesztett.automata !== false;
  elem('mezo-rekurziv').checked = szerkesztett.rekurziv === true;
  elem('mezo-fajldatum').checked = szerkesztett.fajlDatum === true;
  elem('mezo-kiterjesztesek').value = (szerkesztett.kiterjesztesek ?? []).join(', ');
  elem('urlap-hibak').hidden = true;

  lepcsoketRajzol();
  mappakatRajzol();
  elem('ceg-parbeszed').showModal();
}

function urlapotOsszeszed() {
  szerkesztett.nev = elem('mezo-nev').value.trim();
  szerkesztett.konnektor = elem('mezo-konnektor').value.trim();
  szerkesztett.gyoker = elem('mezo-gyoker').value.trim();
  szerkesztett.automata = elem('mezo-automata').checked;
  szerkesztett.rekurziv = elem('mezo-rekurziv').checked;
  szerkesztett.fajlDatum = elem('mezo-fajldatum').checked;
  szerkesztett.kiterjesztesek = elem('mezo-kiterjesztesek')
    .value.split(',')
    .map((k) => k.trim().replace(/^\./, ''))
    .filter((k) => k !== '');
  return szerkesztett;
}

function hibakatMutat(uzenet) {
  const doboz = elem('urlap-hibak');
  doboz.replaceChildren();
  doboz.append(szoveges('strong', 'A mentés nem sikerült:'));
  const lista = document.createElement('ul');
  // A fő folyamat soronként adja vissza a hiányokat, „• " előtaggal.
  for (const sor of String(uzenet).split('\n')) {
    const tiszta = sor.replace(/^\s*•\s*/, '').trim();
    if (tiszta === '' || tiszta.endsWith(':')) continue;
    lista.append(szoveges('li', tiszta));
  }
  doboz.append(lista);
  doboz.hidden = false;
  doboz.scrollIntoView({ block: 'nearest' });
}

async function urlapotMent() {
  const ceg = urlapotOsszeszed();
  try {
    const valasz = await window.masc.cegek.ment(ceg);
    if (valasz && valasz.rendben === false) {
      hibakatMutat(valasz.uzenet ?? 'Ismeretlen hiba.');
      return;
    }
  } catch (hiba) {
    hibakatMutat(hiba && hiba.message ? hiba.message : String(hiba));
    return;
  }
  elem('ceg-parbeszed').close();
  await rajzol();
}

/* ── Bekötés ────────────────────────────────────────────────────────── */

function bekot() {
  elem('uj-ceg').onclick = async () => urlapotNyit(await window.masc.cegek.uj());
  elem('ures-uj-ceg').onclick = async () => urlapotNyit(await window.masc.cegek.uj());
  elem('urlap-megse').onclick = () => elem('ceg-parbeszed').close();
  elem('urlap-ment').onclick = urlapotMent;

  elem('lepcso-hozzaad').onclick = () => {
    szerkesztett.lepesek.push({ cimke: '', url: '', felhasznalo: '', jelszo: '' });
    lepcsoketRajzol();
  };

  elem('mappa-hozzaad').onclick = async () => {
    const valasztott = await window.masc.mappatValaszt();
    for (const mappa of valasztott) {
      if (!szerkesztett.mappak.includes(mappa)) szerkesztett.mappak.push(mappa);
    }
    mappakatRajzol();
  };

  elem('mind-szinkron').onclick = async () => {
    const gomb = elem('mind-szinkron');
    gomb.disabled = true;
    gomb.textContent = 'Szinkronizálás…';
    // Sorban, nem egyszerre: ugyanaz a kiszolgáló minden cégnél.
    for (const ceg of cegek) await window.masc.ceg.szinkron(ceg.id);
    gomb.textContent = 'Összes szinkronizálása';
    gomb.disabled = false;
    await rajzol();
  };

  // A fő folyamat minden változásnál szól — így a képernyő akkor is friss,
  // ha a szinkron magától indult el.
  window.masc.amikorValtozas(() => void rajzol());
  window.masc.amikorCegekFrissultek(() => void rajzol());
}

async function indul() {
  bekot();
  elem('jelszo-figyelmeztetes').hidden = await window.masc.cegek.jelszoMenthetoE();
  await rajzol();
}

void indul();
