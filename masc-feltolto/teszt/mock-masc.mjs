/**
 * Teszt-konnektor: egy kicsi, de HŰSÉGES elFinder-utánzat.
 *
 * MIÉRT KELL
 *
 * A masc.hu-hoz nincs próbafiókunk, és éles könyvelési mappába nem lehet
 * „hadd lássuk, mi történik" alapon feltölteni. A protokollt viszont
 * ellenőrizni kell — különben csak reménykednénk benne, hogy jó. Ez a
 * kiszolgáló ugyanazokat a parancsokat érti és ugyanolyan alakú választ ad,
 * mint az igazi elFinder, így a kliens minden lépése kipróbálható.
 *
 * MIBEN HŰSÉGES
 *
 *   - a hash-számítás pontosan az elFinder `encode()`-ja: az útvonal base64-e,
 *     `+/=` helyett `-_.`, a végéről a pontok levágva, elé a kötet azonosítója
 *   - a gyökér útvonala `/`, ahogy az elFinderben (`MjAyNg` = „2026")
 *   - két kötet, mint a MASC-on: egy írható feltöltési és egy csak olvasható
 *   - hibánál `{"error": "errValami"}`, nem HTTP-hibakód
 *   - `uplMaxFile` szándékosan 3, hogy az adagolás is próbát álljon
 *   - munkamenet nélkül a BELÉPÉSI LAPOT küldi vissza, nem hibát — pontosan
 *     ez a valódi rendszerek csapdája, és a kliensnek ezt fel kell ismernie
 */
import { createServer } from 'node:http';
import { mkdirSync, readdirSync, statSync, writeFileSync, existsSync, utimesSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const FELTOLTES_KOTET = 'l1_';
const KONYVELES_KOTET = 'l2_';
const SUTI_NEV = 'MASCSESSID';
const ERVENYES_SUTI = 'teszt-munkamenet-123';
const CSRF_JEGY = 'csrf-abc123';

/** Az elFinder útvonal-kódolása. */
export function hashol(kotetId, relativUt) {
  const ut = relativUt === '' ? '/' : relativUt;
  const b64 = Buffer.from(ut, 'utf8').toString('base64');
  const biztonsagos = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '.');
  return kotetId + biztonsagos.replace(/\.+$/, '');
}

function kibont(hash) {
  const kotetId = hash.slice(0, 3);
  const rest = hash.slice(3);
  const b64 = rest.replace(/-/g, '+').replace(/_/g, '/');
  const parnal = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const ut = Buffer.from(parnal, 'base64').toString('utf8');
  return { kotetId, relativUt: ut === '/' ? '' : ut };
}

/**
 * @param {{gyoker: string, jelszavas?: boolean}} beallitas
 *   gyoker: a lemezen az a mappa, amiben a két kötet könyvtára készül
 *   jelszavas: ha igaz, űrlapos belépés kell; egyébként elég a jó süti
 */
export function mockIndit(beallitas) {
  const kotetek = {
    [FELTOLTES_KOTET]: {
      nev: 'Blueway Trade Kft - Feltöltés',
      mappa: join(beallitas.gyoker, 'feltoltes'),
      irhato: true,
    },
    [KONYVELES_KOTET]: {
      nev: 'Blueway Trade Kft - Könyvelés',
      mappa: join(beallitas.gyoker, 'konyveles'),
      irhato: false,
    },
  };
  for (const kotet of Object.values(kotetek)) mkdirSync(kotet.mappa, { recursive: true });

  /** Egy lemezbeli elem leírása elFinder-alakban. */
  function elemLeiras(kotetId, relativUt) {
    const kotet = kotetek[kotetId];
    const teljes = relativUt === '' ? kotet.mappa : join(kotet.mappa, relativUt);
    const adat = statSync(teljes);
    const mappa = adat.isDirectory();
    const gyoker = relativUt === '';
    const szuloRelativ = gyoker ? null : relativUt.split(sep).slice(0, -1).join(sep);

    const leiras = {
      hash: hashol(kotetId, relativUt),
      name: gyoker ? kotet.nev : relativUt.split(sep).pop(),
      mime: mappa ? 'directory' : 'application/octet-stream',
      size: mappa ? 0 : adat.size,
      ts: Math.floor(adat.mtimeMs / 1000),
      read: 1,
      write: kotet.irhato ? 1 : 0,
      locked: 0,
    };
    if (mappa) leiras.dirs = readdirSync(teljes, { withFileTypes: true }).some((b) => b.isDirectory()) ? 1 : 0;
    if (gyoker) {
      leiras.volumeid = kotetId;
      // Az elFinder a kötetgyökér phash mezőjét hamisra állítja — a kliens
      // ebből ismeri fel, hogy gyökérrel van dolga.
      leiras.phash = false;
    } else {
      leiras.phash = hashol(kotetId, szuloRelativ ?? '');
    }
    return leiras;
  }

  function gyerekLeirasok(kotetId, relativUt) {
    const kotet = kotetek[kotetId];
    const teljes = relativUt === '' ? kotet.mappa : join(kotet.mappa, relativUt);
    return readdirSync(teljes).map((nev) =>
      elemLeiras(kotetId, relativUt === '' ? nev : join(relativUt, nev)),
    );
  }

  const belepesiLap = `<!doctype html><html lang="hu"><body>
    <h1>MASC — bejelentkezés</h1>
    <form method="post" action="/belepes">
      <input type="hidden" name="csrf" value="${CSRF_JEGY}">
      <input type="text" name="felhasznalo">
      <input type="password" name="jelszo">
      <button type="submit">Belépés</button>
    </form></body></html>`;

  function bejelentkezett(keres) {
    const suti = keres.headers.cookie ?? '';
    return suti.includes(`${SUTI_NEV}=${ERVENYES_SUTI}`);
  }

  function jsonValasz(valasz, adat, kod = 200) {
    const test = JSON.stringify(adat);
    valasz.writeHead(kod, { 'content-type': 'application/json; charset=utf-8' });
    valasz.end(test);
  }

  const kiszolgalo = createServer(async (keres, valasz) => {
    const url = new URL(keres.url ?? '/', 'http://127.0.0.1');

    // — Belépési lap és belépés —
    if (url.pathname === '/belepes') {
      if (keres.method === 'GET') {
        valasz.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        valasz.end(belepesiLap);
        return;
      }
      const darabok = [];
      for await (const d of keres) darabok.push(d);
      const urlap = new URLSearchParams(Buffer.concat(darabok).toString('utf8'));
      const jo =
        urlap.get('csrf') === CSRF_JEGY &&
        urlap.get('felhasznalo') === 'blueway' &&
        urlap.get('jelszo') === 'titok';
      if (!jo) {
        // Rossz jelszóra a valódi portálok is 200-zal, a belépési lappal
        // felelnek — süti nélkül. A kliensnek ezt kell észrevennie.
        valasz.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        valasz.end(belepesiLap);
        return;
      }
      valasz.writeHead(302, {
        'set-cookie': `${SUTI_NEV}=${ERVENYES_SUTI}; Path=/; HttpOnly`,
        location: '/',
      });
      valasz.end();
      return;
    }

    // — Konnektor —
    if (url.pathname !== '/connector.php') {
      valasz.writeHead(404, { 'content-type': 'text/plain' });
      valasz.end('nincs ilyen');
      return;
    }

    if (!bejelentkezett(keres)) {
      valasz.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      valasz.end(belepesiLap);
      return;
    }

    let parancs = url.searchParams.get('cmd');
    let urlapAdat = null;

    if (keres.method === 'POST') {
      const darabok = [];
      for await (const d of keres) darabok.push(d);
      const test = Buffer.concat(darabok);
      const tipus = keres.headers['content-type'] ?? '';
      // A multipart szétszedését a beépített Response.formData() végzi —
      // ugyanaz a kód, ami a böngészőben is.
      urlapAdat = await new Response(test, { headers: { 'content-type': tipus } }).formData();
      parancs = urlapAdat.get('cmd') ?? parancs;
    }

    try {
      if (parancs === 'open') {
        const cel = url.searchParams.get('target');
        if (!cel) {
          const gyokerek = Object.keys(kotetek).map((id) => elemLeiras(id, ''));
          const elso = Object.keys(kotetek)[0];
          jsonValasz(valasz, {
            api: 2.1,
            cwd: gyokerek[0],
            files: [...gyokerek, ...gyerekLeirasok(elso, '')],
            uplMaxFile: 3,
            uplMaxSize: '16M',
            options: { path: kotetek[elso].nev, disabled: [], separator: '/' },
          });
          return;
        }
        const { kotetId, relativUt } = kibont(cel);
        if (!kotetek[kotetId]) return jsonValasz(valasz, { error: 'errFolderNotFound' });
        jsonValasz(valasz, {
          api: 2.1,
          cwd: elemLeiras(kotetId, relativUt),
          files: gyerekLeirasok(kotetId, relativUt),
          uplMaxFile: 3,
          uplMaxSize: '16M',
        });
        return;
      }

      if (parancs === 'mkdir') {
        const cel = url.searchParams.get('target');
        const nev = url.searchParams.get('name');
        if (!cel || !nev) return jsonValasz(valasz, { error: 'errCmdParams' });
        const { kotetId, relativUt } = kibont(cel);
        if (!kotetek[kotetId]?.irhato) return jsonValasz(valasz, { error: 'errPerm' });
        const ujRelativ = relativUt === '' ? nev : join(relativUt, nev);
        const teljes = join(kotetek[kotetId].mappa, ujRelativ);
        if (existsSync(teljes)) return jsonValasz(valasz, { error: 'errExists' });
        mkdirSync(teljes);
        jsonValasz(valasz, { added: [elemLeiras(kotetId, ujRelativ)] });
        return;
      }

      if (parancs === 'upload') {
        if (!urlapAdat) return jsonValasz(valasz, { error: 'errUploadNoFiles' });
        const cel = urlapAdat.get('target');
        const { kotetId, relativUt } = kibont(String(cel));
        if (!kotetek[kotetId]?.irhato) return jsonValasz(valasz, { error: 'errPerm' });

        const fajlok = urlapAdat.getAll('upload[]');
        const idok = urlapAdat.getAll('mtime[]');
        const felulir = urlapAdat.get('overwrite') === '1';
        if (fajlok.length === 0) return jsonValasz(valasz, { error: 'errUploadNoFiles' });
        if (fajlok.length > 3) return jsonValasz(valasz, { error: 'errUploadTotalSize' });

        const hozzaadott = [];
        for (const [index, fajl] of fajlok.entries()) {
          let nev = fajl.name;
          const celUt = join(kotetek[kotetId].mappa, relativUt, nev);
          if (existsSync(celUt) && !felulir) {
            // Az elFinder ütközéskor nem hibázik, hanem új néven ment.
            const pont = nev.lastIndexOf('.');
            const alap = pont === -1 ? nev : nev.slice(0, pont);
            const kiterj = pont === -1 ? '' : nev.slice(pont);
            nev = `${alap}-1${kiterj}`;
          }
          const vegsoUt = join(kotetek[kotetId].mappa, relativUt, nev);
          writeFileSync(vegsoUt, Buffer.from(await fajl.arrayBuffer()));
          const ido = Number(idok[index]);
          if (Number.isFinite(ido) && ido > 0) utimesSync(vegsoUt, ido, ido);
          hozzaadott.push(elemLeiras(kotetId, join(relativUt, nev)));
        }
        jsonValasz(valasz, { added: hozzaadott });
        return;
      }

      jsonValasz(valasz, { error: 'errUnknownCmd' });
    } catch (hiba) {
      jsonValasz(valasz, { error: ['errUploadCommon', String(hiba?.message ?? hiba)] });
    }
  });

  return new Promise((kesz) => {
    kiszolgalo.listen(0, '127.0.0.1', () => {
      const cim = kiszolgalo.address();
      kesz({
        kiszolgalo,
        konnektor: `http://127.0.0.1:${cim.port}/connector.php`,
        belepesUrl: `http://127.0.0.1:${cim.port}/belepes`,
        suti: `${SUTI_NEV}=${ERVENYES_SUTI}`,
        kotetek,
        leallit: () => new Promise((k) => kiszolgalo.close(k)),
      });
    });
  });
}

/** A lemezre került fájlok relatív útvonalai — a tesztek ezt hasonlítják össze. */
export function fajlokatOsszeszed(mappa) {
  const eredmeny = [];
  const bejar = (aktualis) => {
    for (const bejegyzes of readdirSync(aktualis, { withFileTypes: true })) {
      const teljes = join(aktualis, bejegyzes.name);
      if (bejegyzes.isDirectory()) bejar(teljes);
      else eredmeny.push(relative(mappa, teljes).split(sep).join('/'));
    }
  };
  bejar(mappa);
  return eredmeny.sort();
}
