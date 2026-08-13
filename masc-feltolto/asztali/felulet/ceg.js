/**
 * Egy cég ablaka: mappák, bizonylatok állapota, napló.
 *
 * A kérés magja itt teljesül: LÁTSZIK, mely fájlokat sikerült feltölteni és
 * melyeket nem. A hibás tételek nem tűnnek el — ott maradnak a listában az
 * okkal együtt, és a következő indításkor magától újra sorra kerülnek. Aki
 * nem akar addig várni, az „Újra" gombbal azonnal visszateheti a sorba.
 */
'use strict';

const cegId = new URLSearchParams(window.location.search).get('ceg');

let fajlok = [];
let szuro = 'mind';
let allapot = null;

const elem = (azonosito) => document.getElementById(azonosito);

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

const FAJL_SZOVEG = {
  varakozik: 'Feltöltésre vár',
  feltoltve: 'Feltöltve',
  hibas: 'Hibás',
};

/** Emberi méret: a bájtszám önmagában nehezen olvasható. */
function meretet(bajt) {
  if (bajt < 1024) return `${bajt} B`;
  if (bajt < 1024 * 1024) return `${(bajt / 1024).toFixed(1)} kB`;
  return `${(bajt / 1024 / 1024).toFixed(1)} MB`;
}

function idot(ezredmasodperc) {
  if (!ezredmasodperc) return '';
  const datum = new Date(ezredmasodperc);
  return datum.toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ── Fejléc ─────────────────────────────────────────────────────────── */

function fejlecetRajzol() {
  if (!allapot) return;

  elem('allapot').textContent = ALLAPOT_SZOVEG[allapot.allapot] ?? allapot.allapot;
  elem('allapot').className = `allapot ${allapot.allapot}`;

  let uzenet = allapot.uzenet;
  if (allapot.utolsoSzinkron) {
    uzenet += ` · Utolsó szinkronizálás: ${idot(allapot.utolsoSzinkron)}`;
  }
  elem('uzenet').textContent = uzenet;

  const csatlakozva = allapot.allapot === 'csatlakozva';
  const folyamatban = allapot.allapot === 'csatlakozik';

  const kapcsolo = elem('kapcsolo');
  kapcsolo.textContent = csatlakozva ? 'Lecsatlakozás' : 'Csatlakozás';
  kapcsolo.className = csatlakozva ? '' : 'elsodleges';
  kapcsolo.disabled = folyamatban;

  elem('szinkron').disabled = allapot.szinkronFut || folyamatban;
  elem('szinkron').textContent = allapot.szinkronFut ? 'Szinkronizál…' : 'Szinkronizálás';
}

/* ── Bizonylatok ────────────────────────────────────────────────────── */

function fajlokatRajzol() {
  const doboz = elem('fajl-doboz');
  doboz.replaceChildren();

  const szurtek = szuro === 'mind' ? fajlok : fajlok.filter((f) => f.allapot === szuro);

  if (szurtek.length === 0) {
    const ures = szoveges(
      'div',
      fajlok.length === 0
        ? 'Még nincs átnézve egyetlen mappa sem. Kattints a „Mappák átnézése" gombra.'
        : 'Ebben a szűrésben nincs bizonylat.',
      'ures',
    );
    doboz.append(ures);
    return;
  }

  const tabla = document.createElement('table');
  tabla.className = 'tabla';

  const fejsor = document.createElement('tr');
  for (const cim of ['Bizonylat', 'Cél', 'Méret', 'Állapot', 'Mikor', '']) {
    fejsor.append(szoveges('th', cim));
  }
  // Az append() nem adja vissza a beillesztett elemet, ezért nem láncolható.
  // (Ezen a felület első változata elhasalt: a táblázat néma kivétellel
  // elmaradt, és vele a napló is.)
  const fejlec = document.createElement('thead');
  fejlec.append(fejsor);
  tabla.append(fejlec);

  const test = document.createElement('tbody');
  for (const fajl of szurtek) {
    const sor = document.createElement('tr');

    const nevCella = document.createElement('td');
    nevCella.append(szoveges('div', fajl.nev, 'fajlnev'));
    nevCella.append(szoveges('div', fajl.ut, 'utvonal'));
    if (!fajl.letezik) {
      nevCella.append(szoveges('div', 'A fájl már nincs meg a lemezen.', 'hianyzik'));
    }
    if (fajl.hiba) {
      nevCella.append(szoveges('div', fajl.hiba, 'hibauzenet'));
    }
    sor.append(nevCella);

    sor.append(szoveges('td', fajl.celMappa));
    sor.append(szoveges('td', meretet(fajl.meret)));

    const allapotCella = document.createElement('td');
    allapotCella.append(
      szoveges('span', FAJL_SZOVEG[fajl.allapot] ?? fajl.allapot, `jelzo ${fajl.allapot}`),
    );
    if (fajl.allapot === 'hibas' && fajl.probalkozas > 0) {
      allapotCella.append(szoveges('div', `${fajl.probalkozas}. próbálkozás`, 'hianyzik'));
    }
    sor.append(allapotCella);

    sor.append(szoveges('td', idot(fajl.ido)));

    const gombCella = document.createElement('td');
    if (fajl.allapot === 'hibas' && fajl.letezik) {
      const ujra = szoveges('button', 'Újra', 'apro');
      ujra.onclick = async () => {
        await window.masc.ceg.ujraSorba(cegId, fajl.ut);
        await frissit();
      };
      gombCella.append(ujra);
    }
    const mutat = szoveges('button', 'Mutasd', 'apro');
    mutat.disabled = !fajl.letezik;
    mutat.onclick = () => window.masc.fajltMutat(fajl.ut);
    gombCella.append(mutat);
    sor.append(gombCella);

    test.append(sor);
  }
  tabla.append(test);
  doboz.append(tabla);
}

/* ── Napló ──────────────────────────────────────────────────────────── */

const JEL_OSZTALY = {
  '✓': 'jel-siker',
  '✗': 'jel-hiba',
  '!': 'jel-figyelem',
  '·': 'jel-halk',
  '…': 'jel-halk',
};

function naploSort(sor) {
  const csomo = document.createElement('div');
  csomo.className = JEL_OSZTALY[sor.jel] ?? '';
  csomo.textContent = `${sor.jel} ${sor.uzenet}`;
  return csomo;
}

function naplotRajzol(sorok) {
  const doboz = elem('naplo');
  doboz.replaceChildren();
  for (const sor of sorok) doboz.append(naploSort(sor));
  doboz.scrollTop = doboz.scrollHeight;
}

/* ── Mappák ─────────────────────────────────────────────────────────── */

function mappakatRajzol(mappak) {
  const lista = elem('mappak');
  lista.replaceChildren();
  if (mappak.length === 0) {
    const ures = szoveges('li', 'Nincs megadva figyelt mappa — vedd fel a főképernyő „Beállítások" gombjával.');
    lista.append(ures);
    return;
  }
  for (const mappa of mappak) {
    const sor = document.createElement('li');
    sor.append(szoveges('span', mappa));
    lista.append(sor);
  }
}

/* ── Frissítés ──────────────────────────────────────────────────────── */

async function frissit() {
  const adat = await window.masc.ceg.adat(cegId);
  if (!adat) {
    document.body.replaceChildren(szoveges('div', 'Ez a cég már nem létezik.', 'ures'));
    return;
  }

  document.title = adat.ceg.nev;
  elem('ceg-nev').textContent = adat.ceg.nev;
  allapot = adat.nezet;
  fajlok = adat.fajlok;

  fejlecetRajzol();
  mappakatRajzol(adat.ceg.mappak ?? []);
  fajlokatRajzol();
  naplotRajzol(adat.naplo ?? []);
}

function bekot() {
  elem('kapcsolo').onclick = async () => {
    const gomb = elem('kapcsolo');
    gomb.disabled = true;
    if (allapot && allapot.allapot === 'csatlakozva') {
      await window.masc.ceg.lecsatlakoz(cegId);
    } else {
      await window.masc.ceg.csatlakoz(cegId);
    }
    await frissit();
  };

  elem('szinkron').onclick = async () => {
    elem('szinkron').disabled = true;
    await window.masc.ceg.szinkron(cegId);
    await frissit();
  };

  elem('atvizsgal').onclick = async () => {
    elem('atvizsgal').disabled = true;
    await window.masc.ceg.atvizsgal(cegId);
    elem('atvizsgal').disabled = false;
    await frissit();
  };

  for (const gomb of elem('szuro').querySelectorAll('button')) {
    gomb.onclick = () => {
      szuro = gomb.dataset.szuro;
      for (const masik of elem('szuro').querySelectorAll('button')) {
        masik.classList.toggle('aktiv', masik === gomb);
      }
      fajlokatRajzol();
    };
  }

  // Csak a saját cégünk eseményei érdekelnek: a többi ablak is ezeket kapja.
  window.masc.amikorValtozas((nezet) => {
    if (!nezet || nezet.cegId !== cegId) return;
    allapot = nezet;
    fejlecetRajzol();
  });

  window.masc.amikorNaplo((azonosito, sor) => {
    if (azonosito !== cegId) return;
    const doboz = elem('naplo');
    doboz.append(naploSort(sor));
    doboz.scrollTop = doboz.scrollHeight;
  });

  window.masc.amikorFajl((azonosito) => {
    if (azonosito !== cegId) return;
    // A fájl állapota megváltozott: a listát a fő folyamattól kérjük újra,
    // hogy biztosan a nyilvántartás igazát mutassuk, ne a saját tippünket.
    void window.masc.ceg.fajlok(cegId).then((lista) => {
      fajlok = lista;
      fajlokatRajzol();
    });
  });
}

async function indul() {
  bekot();
  await frissit();
}

void indul();
