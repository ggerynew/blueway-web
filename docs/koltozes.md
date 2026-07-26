# Költözés a FORPSI tárhelyre

A weblap statikus export: nincs mögötte futó alkalmazás, csak fájlok. A
költözés ezért fájlfeltöltés — a lényeg a sorrend és néhány beállítás, ami
nélkül a linkek vagy az űrlapok nem működnének.

## 0. Előkészítés a FORPSI-oldalon

- **PHP-verzió.** A klaszterre költöztetés a meglévő PHP-verziót megtartja, tehát
  előfordulhat, hogy a tárhely még 5.x-en vagy 7.0-n áll. Az ügyfélfiókban állítsd
  **8.x-re**. A `send.php` 7.0-tól fut, de a régi verziók évek óta nem kapnak
  biztonsági javítást.
- **Levelezés.** Külön postafiók nem kell: a `send.php` feladója és címzettje is
  `info@blueway.hu`. Ez azért fontos, mert ha feladóként a látogató címét írnánk
  be, az SPF/DKIM megbukna, és a levél spam mappába kerülne. A látogató címe
  `Reply-To`-ba megy, tehát a Válasz gomb neki válaszol.
- **Tanúsítvány.** A weblap kanonikus URL-jei és a sitemap `https://`-t használnak,
  tehát a HTTPS-nek működnie kell, mielőtt élesítjük.

## 1. Build

```bash
npm ci
npm run build:live
```

Ez üres base path-tal épít, és a `https://blueway.hu` címet írja a kanonikus
URL-ekbe, a sitemapbe és a robots.txt-be. Más domain esetén:

```bash
NEXT_PUBLIC_SITE_URL=https://<domain> \
NEXT_PUBLIC_FORM_ENDPOINT=https://<domain>/send.php \
npm run build:live
```

Az eredmény az `out/` mappában van.

## 2. Feltöltés

A weboldal gyökerébe:

1. az `out/` mappa **tartalma** (nem maga a mappa);
2. `server/.htaccess`;
3. `server/send.php`;
4. `server/.user.ini`.

A `.htaccess` és a `.user.ini` rejtett fájl — az FTP-kliensben be kell kapcsolni
a rejtett fájlok mutatását, különben kimaradnak.

### Miért kell a `.htaccess`

A weblap linkjei kiterjesztés nélküliek (`/hu/rolunk`), a fájlok viszont
`hu/rolunk.html` néven állnak. A GitHub Pages ezt magától feloldja, az Apache
**nem** — enélkül a nyitóoldalon kívül minden link 404 lenne. A `.htaccess`
átírási szabálya ezt oldja meg, és beállítja a 404-es oldalt, a gyorsítótárazást
és a tömörítést is.

### A `send.php` beállítása

A `RECIPIENT` és a `FROM` is `info@blueway.hu`, tehát alapból nincs mit
átírni benne. Más címzetthez a fájl elején a `RECIPIENT`-et állítsd át.

A `.user.ini` a feltöltési korlátot emeli 12 MB-ra: a weblap 10 MB-ig enged
csatolmányt, a PHP alapértéke viszont sokszor csak 2 MB, és a túllépés néma
hibát okozna.

## 3. Ellenőrzés élesítés előtt

A FORPSI a `hosts` fájllal engedi tesztelni az új klasztert még átállás előtt:

```
185.129.138.110 blueway.hu www.blueway.hu
```

Amit végig kell nézni:

- a nyitóoldal és néhány mély link (termékoldal, tudástár-cikk, GYIK) — ezek
  bizonyítják, hogy a `.htaccess` átírás működik;
- nyelvváltás a zászlókkal;
- **egy próba-ajánlatkérés elküldése**, csatolt fájllal is — és nézd meg a
  postafiókot, a spam mappát is;
- a süti-sáv megjelenik-e, és a beállítások menthetők-e.

## 4. Élesítés után

- **HTTPS-átirányítás.** A `.htaccess`-ben a HTTPS blokk kikommentezve van.
  Kapcsold be, miután a tanúsítvány kiállt.
- **Search Console.** Vedd fel a domaint, és küldd be a `https://blueway.hu/sitemap.xml`
  címet. 605 URL van benne.
- **Régi URL-ek.** Ha a mostani weblapnak más az útvonalszerkezete, a régi
  címekről 301-es átirányítás kell az újakra, különben a meglévő találatok
  404-re futnak. Ehhez a régi oldaltérkép kell — szólj, és megírom a
  szabályokat a `.htaccess`-be.
- **GoatCounter.** A statisztikában eddig `/blueway-web/...` útvonalak
  szerepeltek, ezután `/hu/...` alakúak lesznek. A régi adatok megmaradnak.
- **Formspree.** A `send.php` átvette a szerepét, a Formspree-fiók elhagyható.
  Érdemes egy-két hétig meghagyni, amíg biztos, hogy a saját végpont hibátlanul
  kézbesít.

## Ha valami nem megy

- **Minden link 404** → a `.htaccess` nem került fel, vagy a tárhelyen nincs
  engedélyezve az `AllowOverride`. Ez utóbbin a FORPSI ügyfélszolgálata segít.
- **Az űrlap hibát ad** → nézd meg a böngésző konzolját. Ha a `send.php` 500-at
  ad, a PHP-verzió a gyanús; ha 413-at, a `.user.ini` nem került fel.
- **Az űrlap megnyitja a levelezőt küldés helyett** → a végpont nem elérhető.
  Ez a beépített tartalék, tehát nem vész el érdeklődés, de a végpontot javítani kell.
