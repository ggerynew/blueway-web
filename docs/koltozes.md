# Költözés a FORPSI tárhelyre

A weblap statikus export: nincs mögötte futó alkalmazás, csak fájlok. A
költözés ezért fájlfeltöltés — a lényeg a sorrend és néhány beállítás, ami
nélkül a linkek vagy az űrlapok nem működnének.

## A tárhely adatai

| | |
|---|---|
| Termék | DYNAMIC webtárhely, `blueway.hu` |
| Megrendelő azonosító | W00080673 |
| FTP-szerver | `ftpx.forpsi.com` |
| Web IP (DNS A) | `185.129.138.202` |
| Operációs rendszer | Linux |

## 0. Előkészítés a FORPSI-oldalon

A tárhely jelenlegi állapota alapján négy dolgot kell átállítani. Az első
kettő **blokkoló**: nélkülük az új weblap nem tud élesen működni.

1. **SSL-tanúsítvány — jelenleg `visszavonva`.** Ez blokkoló. A weblap kanonikus
   URL-jei, a `hreflang`-ok, a sitemap és a robots.txt mind `https://`-sel
   mutatnak a domainre. Amíg nincs érvényes tanúsítvány, a `https://blueway.hu`
   egyáltalán nem tölt be, és a kereső is hibás címekre futna. Ezt kell először
   újra kiállíttatni.

2. **PHP — jelenleg `7.0`.** Az ügyfélfiókban állítsd **8.x-re**. A `send.php`
   7.0-tól elfut, tehát elvileg működne, de a 7.0 2019 óta nem kap biztonsági
   javítást, és a tárhelyen más is futhat rajta. A szkript PHP 8.4-en, `E_ALL`
   hibajelzéssel végig ellenőrizve — minden ága figyelmeztetés és deprecation
   nélkül fut.

3. **WWW redirect — jelenleg `letiltva`.** Kapcsold be. Enélkül a
   `www.blueway.hu` és a `blueway.hu` is kiszolgálja ugyanazt a tartalmat két
   külön címen, ami a keresőnek duplikált tartalom. A weblap kanonikus URL-jei a
   **www nélküli** alakra mutatnak, tehát a `www` → `blueway.hu` irány a helyes.

4. **SSL redirect — jelenleg `letiltva`.** Kapcsold be, de **csak azután, hogy a
   tanúsítvány kiállt**. Ha ezt használod, a `.htaccess`-ben lévő HTTPS-blokk
   maradjon kikommentezve — elég az egyik, és a szolgáltató sajátja hamarabb fut
   le, mint a mi átírási szabályunk.

Amivel nem kell foglalkozni:

- **Levelezés.** Külön postafiók nem kell: a `send.php` feladója és címzettje is
  `info@blueway.hu`, és a tárhelyen már van 10 postafiók. Ez azért fontos, mert
  ha feladóként a látogató címét írnánk be, az SPF/DKIM megbukna, és a levél spam
  mappába kerülne. A látogató címe `Reply-To`-ba megy, tehát a Válasz gomb neki
  válaszol.
- **Dynamic cache.** Hagyd letiltva. A weblap statikus fájlokból áll, a
  gyorsítótárazást a `.htaccess` fejlécei intézik; a szolgáltató dinamikus
  gyorsítótára ehhez nem tesz hozzá, viszont hibakeresésnél zavaró tud lenni.
- **SSH — jelenleg letiltva.** Nem kötelező, de **érdemes bekapcsolni a
  költözésre**: a feltöltendő anyag ~138 MB, 1362 fájlban. FTP-n ez sok száz
  külön kapcsolat és könnyen félbeszakad; `rsync`-kel vagy `scp`-vel egyetlen
  menetben, folytathatóan megy át.

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

Az anyag ~138 MB, 1362 fájl (a zömét az adatlap-PDF-ek adják). SSH-val:

```bash
rsync -avz --delete out/ <felhasznalo>@ftpx.forpsi.com:<webgyoker>/
rsync -avz server/.htaccess server/send.php server/.user.ini \
  <felhasznalo>@ftpx.forpsi.com:<webgyoker>/
```

A `--delete` a régi weblap fájljait is eltakarítja. **Csak akkor használd, ha a
régi oldalról már van mentésed**, és a webgyökérben nincs más, amire szükség van
(pl. a levelezés vagy egy aldomain fájljai). Ha bizonytalan, hagyd el, és a
régi fájlokat töröld kézzel, miután az új oldal működik.

FTP-n ugyanez sok száz külön kapcsolat, és félbeszakadás esetén nehéz megmondani,
mi ment át — ezért érdemes az SSH-t bekapcsolni a költözés idejére.

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
185.129.138.202 blueway.hu www.blueway.hu
```

Amit végig kell nézni:

- a nyitóoldal és néhány mély link (termékoldal, tudástár-cikk, GYIK) — ezek
  bizonyítják, hogy a `.htaccess` átírás működik;
- nyelvváltás a zászlókkal;
- **egy próba-ajánlatkérés elküldése**, csatolt fájllal is — és nézd meg a
  postafiókot, a spam mappát is;
- a süti-sáv megjelenik-e, és a beállítások menthetők-e.

## 4. Élesítés után

- **HTTPS- és WWW-átirányítás.** Mindkettőt az ügyfélfiókban kapcsold be
  (SSL redirect, WWW redirect), miután a tanúsítvány kiállt. A `.htaccess`-ben
  lévő HTTPS-blokk maradjon kikommentezve — ez a tartalék arra az esetre, ha a
  szolgáltatói kapcsoló valamiért nem elérhető.
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
