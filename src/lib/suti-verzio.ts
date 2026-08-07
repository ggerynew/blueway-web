import { fajlLenyomat } from '@/lib/fajl-lenyomat';

/**
 * A süti-hozzájárulás kezelőjének tartalmi lenyomata.
 *
 * A miértje a fajlLenyomat leírásában áll: a public mappából fix néven
 * kiszolgált fájlokat a böngésző hónapokig a gyorsítótárból veszi elő, ezért
 * a címükbe kell tenni a tartalom lenyomatát. Épp ez a szkript volt az első
 * eset, ahol ez kiderült — a lapváltáskor újra alkalmazó javítás kikerült a
 * szerverre, a visszatérő látogató mégis a régit futtatta.
 */
export const SUTI_VERZIO = fajlLenyomat('js/blueway-cookie-consent.js');
