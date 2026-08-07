import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Egy public/ mappában lévő fájl tartalmi lenyomata, a cím végére.
 *
 * Miért kell: a `.htaccess` a képeket fél évre, a szkripteket egy évre
 * gyorsítótáraztatja. Ez a Next.js saját csomagjaira helyes — azok nevében
 * ott a lenyomat, tehát új tartalom = új név. A public mappából kiszolgált
 * fájlok viszont FIX néven mennek: ha a tartalmuk változik, a böngésző attól
 * még a régit használja, méghozzá hónapokig, és nincs mód rászólni.
 *
 * Ez már kétszer megtörtént. Először a süti-hozzájárulás kezelőjével: a
 * javítás kikerült a szerverre, a visszatérő látogató mégis a régi szkriptet
 * futtatta, és a kapcsolatoldalon nem jelent meg a térkép. Másodszor a
 * logóval: a fogaskerekek belsejéből kivett fehér háttér sem látszana annál,
 * aki járt már az oldalon.
 *
 * A megoldás a cím megváltoztatása: a fájl tartalmából számolt rövid lenyomat
 * kerül a lekérdezésbe (…/blueway-logo-anim.webp?v=1a2b3c4d). Ha a fájl
 * változik, változik a cím is, tehát a böngésző újat kér — ha nem változik,
 * marad a hónapokig tartó gyorsítótár. A lenyomat a buildkor dől el,
 * futásidőben semmi költsége nincs.
 *
 * @param utvonal a public mappán BELÜLI útvonal, kezdő perjel nélkül
 */
export function fajlLenyomat(utvonal: string): string {
  return createHash('sha256')
    .update(readFileSync(join(process.cwd(), 'public', ...utvonal.split('/'))))
    .digest('hex')
    .slice(0, 8);
}
