import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A süti-hozzájárulás kezelőjének tartalmi lenyomata.
 *
 * Miért kell: a `.htaccess` minden .js fájlt egy évre, „immutable"-ként
 * gyorsítótáraz. Ez a Next.js csomagjaira helyes — azok nevében ott a
 * lenyomat, tehát új tartalom = új név. A hozzájárulás-kezelő viszont a
 * public mappából megy, FIX néven: ha a tartalma változik, a böngésző attól
 * még a régit futtatja, méghozzá egy évig, és nincs mód rászólni.
 *
 * Épp ez történt: a lapváltáskor újra alkalmazó javítás kikerült a
 * szerverre, de a visszatérő látogató változatlanul a régi szkriptet
 * futtatta — a kapcsolatoldalra kattintva nem jelent meg a térkép, csak
 * teljes újratöltés után.
 *
 * A megoldás a cím megváltoztatása: a fájl tartalmából számolt rövid
 * lenyomat kerül a lekérdezésbe (…/blueway-cookie-consent.js?v=1a2b3c4d).
 * Ha a szkript változik, változik a cím is, tehát a böngésző újat kér —
 * ha nem változik, marad az egyéves gyorsítótár. A lenyomat a buildkor
 * dől el, futásidőben semmi költsége nincs.
 */
export const SUTI_VERZIO = createHash('sha256')
  .update(readFileSync(join(process.cwd(), 'public', 'js', 'blueway-cookie-consent.js')))
  .digest('hex')
  .slice(0, 8);
