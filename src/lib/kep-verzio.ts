import { fajlLenyomat } from '@/lib/fajl-lenyomat';

/**
 * Kép útvonala a tartalmi lenyomatával — a féléves gyorsítótár megkerülésére.
 *
 * A `.htaccess` a képeket fél évre gyorsítótáraztatja a böngészővel. Ez a
 * sávszélesség miatt így helyes, de van egy ára: ha egy kép TARTALMA változik
 * és a NEVE nem, a visszatérő látogató hónapokig a régit látja. Nem elméleti
 * gond — a Minilase-fotókról levett talajárnyék épp így nem jelent meg a
 * telefonon, pedig a szerveren már az új kép állt.
 *
 * Ugyanez a hiba a weblap életében háromszor fordult elő: előbb a
 * süti-hozzájárulás kezelőjével (emiatt maradt el a térkép a kapcsolatoldalon),
 * aztán a logóval, most a termékfotókkal. Az első kettőt egy-egy kézi
 * megoldás javította a maga helyén; ez itt az általános.
 *
 * A visszaadott útvonal SZÁNDÉKOSAN nem megy át az `asset()`-en: a hívó helyek
 * egy része továbbadja egy komponensnek, ami maga hívja meg az `asset()`-et.
 * Ha itt is megtennénk, az alapútvonal kétszer kerülne a cím elé. Így a
 * használat mindenütt ugyanaz marad: `asset(kepVerzio(...))`.
 *
 * Csak KÉPRE való. Az adatlap-PDF-ek együtt 200 MB fölött vannak, azokat
 * buildenként végigolvasni a lenyomatért értelmetlen ár — ott marad az
 * egyhónapos gyorsítótár.
 */
const gyorsitotar = new Map<string, string>();

// A két aláírás azért kell, mert a termékkép mezője nem kötelező: ahol biztos
// van kép, ott a hívó `string`-et kap vissza és rögtön `asset()`-be adhatja;
// ahol lehet hiányzó, ott a hiány végigmegy a láncon.
export function kepVerzio(utvonal: string): string;
export function kepVerzio(utvonal: string | undefined): string | undefined;
export function kepVerzio(utvonal: string | undefined): string | undefined {
  if (!utvonal) return utvonal;

  const kesz = gyorsitotar.get(utvonal);
  if (kesz !== undefined) return kesz;

  let eredmeny = utvonal;
  try {
    eredmeny = `${utvonal}?v=${fajlLenyomat(utvonal)}`;
  } catch {
    // Nincs ilyen fájl. Nem itt szólunk érte: a kimenetet ellenőrző audit
    // úgyis kiírja a hiányzó eszközöket, és egy elgépelt képútvonal miatt
    // nem érdemes az egész buildet elbuktatni.
  }

  gyorsitotar.set(utvonal, eredmeny);
  return eredmeny;
}
