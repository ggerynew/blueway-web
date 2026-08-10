/**
 * A kezdőlapi videósáv klipjeinek előállítása.
 *
 * A szakaszokat NEM ez a szkript határozza meg: a `src/lib/bemutato-videok.ts`
 * `forras` mezőjéből olvassa ki őket. Így a vágási pont egyetlen helyen él, és
 * nem tud elcsúszni attól, amit a weblap magáról állít.
 *
 * Amit minden klippel csinál:
 *   - letölti a forrásfájlt (ha van `letoltes` cím), különben helyi fájlt vár;
 *   - kivágja a megadott szakaszt;
 *   - TÖRLI a hangsávot: a sáv néma, a hang csak méret;
 *   - 540 képpont magasra kicsinyít — a csempe ~470 képpont széles;
 *   - két formátumot ad: MP4/H.264 a Safarinak (kötelező) és WebM/VP9 a
 *     többieknek (azonos minőségnél harmadával kisebb);
 *   - poszterképet vág az első képkockából;
 *   - kiír egy-egy ELLENŐRZŐ KÉPKOCKÁT a szakasz elejéről és végéről;
 *   - és egy KONTAKTLAPOT a teljes forrásról, 16 képkockán.
 *
 * Az utolsó két pont nem díszítés. Az időpontokat a YouTube-változaton mértük;
 * ha a gyártó saját fájlja más vágás, a szakasz máshová esik, és ezt látni kell,
 * mielőtt élesbe megy. A két végpont képe megmondja, hogy a mostani vágás jó-e;
 * a kontaktlap azt, hogy hova kellene tenni, ha nem. Minden a scratch mappába
 * kerül, nem a repóba.
 *
 * Használat:
 *   node --experimental-strip-types --import ./scripts/ts-betolto.mjs \
 *        scripts/bemutato-klipek.mjs [--helyi <mappa>]
 *
 * A `--helyi` megadásakor a letöltés helyett abból a mappából vesz fájlt
 * `<id>.*` néven — ide kerülnek a kézzel kapott (FTP-vel, levélben érkezett)
 * forrásanyagok. A `--ujra` a már meglévő klipeket is újravágja.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { bemutatoCsempek } from '../src/lib/bemutato-videok';

const FF = process.env.FFMPEG ?? 'ffmpeg';
const FFPROBE = process.env.FFPROBE ?? 'ffprobe';
const CEL_VIDEO = 'public/videos/bemutato';
const CEL_KEP = 'public/images/bemutato';
const MUNKA = process.env.MUNKA_MAPPA ?? '/tmp/bemutato-forras';
/** Az ellenőrző képkockák helye — szándékosan a repón KÍVÜL. */
const ELLENORZO = process.env.ELLENORZO_MAPPA ?? '/tmp/bemutato-ellenorzes';
/**
 * Miből készült az egyes klipek.
 *
 * Enélkül a „már megvan, hagyd békén” szabály csendben hazudik: ha valaki
 * átírja a vágási pontokat a bemutato-videok.ts-ben, a szkript a RÉGI fájlt
 * találja a helyén, kihagyja, és a weblap attól kezdve mást állít magáról,
 * mint amit mutat. Ez a nyilvántartás dönti el, hogy a meglévő klip a MOSTANI
 * vágásból való-e.
 */
const NYILVANTARTAS = 'scripts/bemutato-vagas.json';

const ervek = process.argv.slice(2);
const helyiMappa = ervek.includes('--helyi') ? ervek[ervek.indexOf('--helyi') + 1] : null;
const ujravagas = ervek.includes('--ujra');

for (const mappa of [CEL_VIDEO, CEL_KEP, MUNKA, ELLENORZO]) mkdirSync(mappa, { recursive: true });

function ff(...args) {
  execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
}

/**
 * A forrásfájl hossza másodpercben — ebből derül ki, ha más a vágás.
 *
 * Szándékosan ffprobe, nem `ffmpeg -i`: az utóbbi kimeneti fájl nélkül
 * 1-es kóddal lép ki („At least one output file must be specified”), amitől
 * a szkript elhasal, pedig csak kérdezni akartunk. Ezen az első éles futás
 * el is bukott.
 */
function hosszMasodpercben(fajl) {
  try {
    const ki = execFileSync(
      FFPROBE,
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', fajl],
      { encoding: 'utf8' },
    );
    const mp = parseFloat(String(ki).trim());
    return Number.isFinite(mp) ? mp : null;
  } catch {
    return null;
  }
}

async function letolt(cim, cel) {
  if (existsSync(cel)) {
    console.log(`   már letöltve: ${cel}`);
    return;
  }
  console.log(`   letöltés: ${cim}`);
  const valasz = await fetch(cim);
  if (!valasz.ok) throw new Error(`${valasz.status} ${valasz.statusText} — ${cim}`);
  writeFileSync(cel, Buffer.from(await valasz.arrayBuffer()));
}

/** A vágás azonosítója: ha ez változik, a klip újravágandó. */
function vagasUjjlenyomat(forras) {
  return JSON.stringify({
    be: forras.letoltes ?? forras.videoId ?? null,
    szakaszok: forras.szakaszok.map((sz) => [sz.kezdet, sz.veg]),
  });
}

let nyilvantartas = {};
try {
  nyilvantartas = JSON.parse(readFileSync(NYILVANTARTAS, 'utf8'));
} catch {
  // Első futás, vagy sérült a fájl — mindent újravágunk. Ez a biztos irány.
}

let kesz = 0;
let kimaradt = 0;

for (const csempe of bemutatoCsempek) {
  for (const [i, video] of csempe.videok.entries()) {
    const nev = csempe.videok.length > 1 ? `${csempe.id}-${i + 1}` : csempe.id;
    const forras = video.forras;
    if (!forras) {
      console.log(`${nev}: kimarad — nincs forrás-leírás`);
      kimaradt += 1;
      continue;
    }

    const ujjlenyomat = vagasUjjlenyomat(forras);

    // Ami már megvan UGYANEBBŐL A VÁGÁSBÓL, azt békén hagyjuk.
    //
    // Nem sebességi kérdés: a kész klipek ELLENŐRZÖTT fájlok. A futtató
    // ffmpeg-je más verzió, mint a fejlesztői gépé, tehát az újravágás
    // bitre eltérő — de tartalmilag azonos — fájlt adna, ami a repóban
    // értelmetlen, felülvizsgálhatatlan diffként jelenne meg. Aki tényleg
    // újra akarja vágni, kéri: --ujra.
    //
    // A vágási pont MEGVÁLTOZÁSA viszont nem ilyen: ott az új fájl kell.
    //
    // A feltétel MINDEN kimenetet felsorol, nem csak az mp4-et. Így ha a
    // szkript egy új változattal bővül — ahogy a kis felbontásúval bővült —,
    // a hiányzó fájl magától újravágást kér, és nem kell rá emlékezni.
    const kimenetek = [
      `${CEL_VIDEO}/${nev}.mp4`,
      `${CEL_VIDEO}/${nev}.webm`,
      `${CEL_VIDEO}/${nev}-kicsi.mp4`,
      `${CEL_VIDEO}/${nev}-kicsi.webm`,
      `${CEL_KEP}/${nev}.webp`,
    ];
    if (!ujravagas && kimenetek.every((f) => existsSync(f)) && nyilvantartas[nev] === ujjlenyomat) {
      console.log(`${nev}: kimarad — már megvan, ugyanebből a vágásból`);
      kimaradt += 1;
      continue;
    }

    // A bemenet: helyi mappából vagy letöltésből.
    let be = null;
    if (helyiMappa) {
      const talalt = readdirSync(helyiMappa).find((f) => f.startsWith(`${csempe.id}.`));
      if (talalt) be = join(helyiMappa, talalt);
    }
    if (!be && forras.letoltes) {
      be = join(MUNKA, `${csempe.id}-forras.mp4`);
      try {
        await letolt(forras.letoltes, be);
      } catch (hiba) {
        console.log(`${nev}: kimarad — a letöltés nem sikerült: ${hiba.message}`);
        kimaradt += 1;
        continue;
      }
    }
    if (!be) {
      console.log(`${nev}: kimarad — nincs sem helyi fájl, sem letöltési cím`);
      kimaradt += 1;
      continue;
    }

    const szakaszok = forras.szakaszok;
    const hossz = szakaszok.reduce((ossz, sz) => ossz + (sz.veg - sz.kezdet), 0);
    const vegsoVeg = Math.max(...szakaszok.map((sz) => sz.veg));
    console.log(
      `${nev}: ${szakaszok.map((sz) => `${sz.kezdet}→${sz.veg}`).join(' + ')} ` +
        `= ${hossz} mp (forrás: ${be})`,
    );

    // A forrás teljes hossza — ha rövidebb, mint a kért szakasz vége, a
    // vágási pontok nem ehhez a vágáshoz készültek.
    const teljes = hosszMasodpercben(be);
    if (teljes !== null) {
      console.log(`   a forrás teljes hossza: ${teljes.toFixed(1)} mp`);
      if (teljes < vegsoVeg) {
        console.log(
          `   FIGYELEM: a kért szakasz vége (${vegsoVeg} mp) TÚLNYÚLIK a forráson ` +
            `(${teljes.toFixed(1)} mp). A vágási pontokat a YouTube-változaton mértük — ` +
            'ez a fájl más vágás. A klip rövidebb lesz a kértnél.',
        );
      }
    } else {
      console.log('   a forrás hossza nem olvasható ki (ffprobe)');
    }

    const mp4 = `${CEL_VIDEO}/${nev}.mp4`;

    // A szakaszokat EGY menetben vágjuk ki és fűzzük össze.
    //
    // A `trim` a forrás időtengelyén dolgozik, a `setpts=PTS-STARTPTS` pedig
    // minden darabot nullára húz vissza — enélkül a `concat` a darabok közé
    // beengedné az eredeti időbélyegek közti hézagot, és a klip közepén állna
    // egyet a kép. Egy szakasznál is ugyanez az út fut: egy ág, egy concat.
    const agak = szakaszok
      .map((sz, k) => `[0:v]trim=${sz.kezdet}:${sz.veg},setpts=PTS-STARTPTS[sz${k}]`)
      .join(';');
    const bemenetek = szakaszok.map((_, k) => `[sz${k}]`).join('');
    const szuro =
      `${agak};${bemenetek}concat=n=${szakaszok.length}:v=1:a=0,scale=-2:540[ki]`;

    ff('-i', be, '-filter_complex', szuro, '-map', '[ki]',
       '-an',
       '-c:v', 'libx264', '-profile:v', 'high', '-crf', '24', '-preset', 'slow',
       '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4);

    ff('-i', mp4, '-an', '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0',
       '-row-mt', '1', `${CEL_VIDEO}/${nev}.webm`);

    // Kisebb, 360 képpont magas változat a keskeny csempéknek.
    //
    // A sáv csempéi ~341 képpont szélesek, telefonon ~350 — a 960×540-es
    // kép ehhez képest túlmintavétel. Ez a változat a képpontok 44%-át
    // tartalmazza, és a sáv súlyát felezi (5,70 → 2,34 MB asztali gépen).
    // A képfrissítésen nem segít: azt a fejlesztői homokozóban a HIÁNYZÓ
    // hardveres dekódolás fogta vissza, nem a felbontás.
    const kicsiMp4 = `${CEL_VIDEO}/${nev}-kicsi.mp4`;
    ff('-i', mp4, '-an', '-vf', 'scale=-2:360',
       '-c:v', 'libx264', '-profile:v', 'high', '-crf', '25', '-preset', 'slow',
       '-pix_fmt', 'yuv420p', '-movflags', '+faststart', kicsiMp4);

    ff('-i', kicsiMp4, '-an', '-c:v', 'libvpx-vp9', '-crf', '35', '-b:v', '0',
       '-row-mt', '1', `${CEL_VIDEO}/${nev}-kicsi.webm`);

    ff('-i', mp4, '-frames:v', '1', '-c:v', 'libwebp', '-q:v', '78',
       `${CEL_KEP}/${nev}.webp`);

    // Ellenőrző képkockák: MINDEN szakasz eleje és vége, a FORRÁS
    // időtengelyén. Több szakasznál ez fontosabb, mint egynél: itt már a
    // szakaszok HATÁRA is vágás, ott is bekerülhet oda nem illő képkocka.
    for (const [k, sz] of szakaszok.entries()) {
      const jel = szakaszok.length > 1 ? `-${k + 1}` : '';
      ff('-ss', String(sz.kezdet), '-i', be, '-frames:v', '1',
         `${ELLENORZO}/${nev}${jel}-eleje.png`);
      ff('-ss', String(Math.max(0, sz.veg - 0.5)), '-i', be, '-frames:v', '1',
         `${ELLENORZO}/${nev}${jel}-vege.png`);
    }

    // És egy kontaktlap a TELJES forrásról, 16 képkockán.
    //
    // Ez azért van itt, mert a két végpont képe csak azt mondja meg, hogy a
    // mostani vágás jó-e — azt nem, hogy hova KELLENE tenni, ha nem jó. Az
    // LM+-nál emiatt kellett kétszer futtatni: az első kör után derült ki,
    // hogy a fájl elején és végén is cab-főcím áll, és a helyes szakaszt egy
    // külön kontaktlapról kellett kimérni. Egy futás, egy kép, kész.
    if (teljes !== null && teljes > 0) {
      const lepes = Math.max(teljes / 16, 0.1);
      ff('-i', be, '-vf', `fps=1/${lepes.toFixed(3)},scale=320:-2,tile=4x4`,
         '-frames:v', '1', `${ELLENORZO}/${nev}-kontakt.png`);
      console.log(`   kontaktlap: ${(lepes).toFixed(1)} mp-enként egy kocka`);
    }

    nyilvantartas[nev] = ujjlenyomat;
    kesz += 1;
  }
}

if (kesz) {
  writeFileSync(NYILVANTARTAS, `${JSON.stringify(nyilvantartas, null, 2)}\n`);
}

console.log(`\n${kesz} klip elkészült, ${kimaradt} kimaradt.`);
if (kesz) {
  console.log(`Ellenőrző képkockák: ${ELLENORZO}`);
  console.log('A kezdőlap a meglévő fájlú csempéket magától megjeleníti — kód nem kell hozzá.');
}
