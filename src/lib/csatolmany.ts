/**
 * A csatolmányok együttes mérete legfeljebb ennyi.
 *
 * Mérve, nem becsülve: a tárhely levelezője a ~10 MB-nál nagyobb levelet
 * némán eldobja, a base64-kódolás pedig a csatolmányt ~37%-kal hizlalja —
 * 7 MB csatolmányból ~9,6 MB levél lesz, ez még átfér; 8 MB-ból 10,9 MB,
 * az nem érkezett meg.
 *
 * EZ AZ EGYETLEN HELY, ahol a korlát szerepel. Korábban öt helyen állt, és
 * kettőben elcsúszott: a címke-ajánlatkérő és a termék-ajánlatkérő 10 MB-nál
 * húzta meg a határt, miközben a képernyőn ott állt a „legfeljebb 7 MB", a
 * szerver pedig 7 fölött visszautasított. A látogató tehát feltöltött nyolc
 * megabájtot, aztán kapott egy általános hibaüzenetet.
 *
 * A szerveroldali párja a send.php MAX_TOTAL_SIZE értéke. Azt PHP-ban nem
 * lehet innen importálni, ezért a build végén egy őrszem összeveti a kettőt,
 * és elhasal, ha eltérnek (scripts/finalize-static.mjs).
 */
export const MAX_CSATOLMANY = 7 * 1024 * 1024;
