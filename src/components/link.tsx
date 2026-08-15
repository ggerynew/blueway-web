import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * Belső hivatkozás — a next/link, előtöltés nélküli alapértelmezéssel.
 *
 * MIÉRT VAN EGYÁLTALÁN
 *   A next/link alapból ELŐTÖLTI minden olyan hivatkozás célját, amely a
 *   látótérbe kerül. Egy alkalmazásban ez jó csere: pár kilobájt adatért
 *   azonnali lapváltás. Itt viszont statikus kivitelű weblap fut, és az
 *   „előtöltés” a lap TELJES tartalmát jelenti — lapunként 45-55 kB. A
 *   fogalomtár lapján mérve 16 kérés, 739 kB, csupa olyan lapért, amit az
 *   olvasó nagy valószínűséggel meg sem nyit. Közben egy tényleges lapváltás
 *   tömörítve 20 kB, tehát kattintásra is azonnali érzetű.
 *
 *   Ez a felismerés nem új: a csempefal (2,3 MB) és a lábléc előtöltése már
 *   külön-külön ki lett kapcsolva, mindkettő mérés után. Ez a burkoló ugyanazt
 *   a döntést emeli az alapértelmezés szintjére, hogy a következő listánál ne
 *   kelljen újra észrevenni.
 *
 * HASZNÁLAT
 *   Ugyanúgy, mint a next/link-et. Ahol egy hivatkozás célja mégis indokoltan
 *   előtöltendő (olyan lap, ahova a látogatók többsége biztosan továbbmegy),
 *   ott a `prefetch` kézzel megadható — a kiírt érték felülírja az itteni
 *   alapértelmezést, mert a `...props` a `prefetch={false}` UTÁN terül szét.
 */
export function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
