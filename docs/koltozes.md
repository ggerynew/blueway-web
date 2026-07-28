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

| beállítás | állapot | teendő |
|---|---|---|
| PHP | **8.5** | ✔ kész |
| WWW redirect | **engedélyezve** | ✔ kész |
| SSL tanúsítvány | `visszavonva` | **blokkoló** — lásd a 0/a. szakaszt |
| SSL redirect | `letiltva` | a tanúsítvány kiállása **után** kapcsold be |
| A rekord | `81.2.194.244` | átállítás `185.129.138.202`-re (ez maga az élesítés) |
| Dynamic cache | `letiltva` | maradjon így |
| SSH | `letiltva` | a költözés idejére érdemes bekapcsolni |

Részletek:

1. **SSL-tanúsítvány — `visszavonva`.** Ez az egyetlen blokkoló. A weblap
   kanonikus URL-jei, a `hreflang`-ok, a sitemap és a robots.txt mind
   `https://`-sel mutatnak a domainre. Amíg nincs érvényes tanúsítvány, a
   `https://blueway.hu` egyáltalán nem tölt be. A lépések a 0/a. szakaszban.

2. **SSL redirect — `letiltva`.** Kapcsold be, de **csak azután, hogy a
   tanúsítvány kiállt** — előbb bekapcsolva minden látogató hibaoldalt kapna. Ha
   ezt használod, a `.htaccess`-ben lévő HTTPS-blokk maradjon kikommentezve:
   elég az egyik, és a szolgáltató sajátja hamarabb lefut.

3. **PHP — 8.5.** Beállítva. A `send.php` PHP 7.0-tól fut, és 8.4-en, `E_ALL`
   hibajelzéssel minden ága végig ellenőrizve — figyelmeztetés és deprecation
   nélkül. A 8.5 ennél is újabb, de a szkript semmilyen elavuló elemet nem
   használ; az első próbaküldésnél azért érdemes ránézni a hibanaplóra.

4. **WWW redirect — engedélyezve.** Beállítva. A weblap kanonikus URL-jei a www
   nélküli alakra mutatnak, tehát a `www` → `blueway.hu` irány a helyes.

Amivel nem kell foglalkozni:

- **Levelezés.** Külön postafiók nem kell: a `send.php` feladója és címzettje is
  `info@blueway.hu`, és a tárhelyen már van 10 postafiók. Ez azért fontos, mert
  ha feladóként a látogató címét írnánk be, az SPF/DKIM megbukna, és a levél spam
  mappába kerülne. A látogató címe `Reply-To`-ba megy, tehát a Válasz gomb neki
  válaszol.
- **Dynamic cache.** Maradjon letiltva. A weblap statikus fájlokból áll, a
  gyorsítótárazást a `.htaccess` fejlécei intézik; a szolgáltató dinamikus
  gyorsítótára ehhez nem tesz hozzá, viszont hibakeresésnél zavaró tud lenni.
- **SSH — letiltva.** Nem kötelező, de **érdemes bekapcsolni a
  költözésre**: a feltöltendő anyag ~138 MB, 1362 fájlban. FTP-n ez sok száz
  külön kapcsolat és könnyen félbeszakad; `rsync`-kel vagy `scp`-vel egyetlen
  menetben, folytathatóan megy át.

## 0/a. SSL újraigénylése

A DYNAMIC webtárhelyhez jár ingyenes **DV SSL** tanúsítvány (kiállító: Actalis,
wildcard, az aldomainekre is érvényes). Nem alapértelmezetten aktív, magadtól
igényelheted.

### Jelenlegi állapot: az igénylés elutasítva

Az ügyfélközpont erre a hibára fut: *„A szolgáltatás nem megfelelő az ingyenes
DV SSL tanúsítványhoz.”* Ez nem a visszavonás utáni 14 napos tiltás, hanem azt
jelenti, hogy a feltételek valamelyike nem teljesül.

**Az ok: az A rekord nem erre a tárhelyre mutat.**

A többi feltétel teljesül — a domain a FORPSI-nál van (aktív, lejárat 2034. 09. 30.),
a névszerverek is a FORPSI-é (`ns.forpsi.it`, `ns.forpsi.net`), tehát a DNS-t is
innen lehet szerkeszteni. Egyedül ez az egy nem stimmel:

| | |
|---|---|
| `blueway.hu` és `www.blueway.hu` A rekordja | `81.2.194.244` (visszafejtve: `244.194.forpsi.net`) |
| A tárhely web IP-je | `185.129.138.202` |

A domain tehát egy **másik, régebbi FORPSI gépre** mutat — arra, amelyiken a
mostani weblap fut —, nem arra a tárhelyre, amelyikhez a tanúsítványt kérnénk.
Az ingyenes DV SSL kimondott feltétele, hogy „a domain … beállított A rekordja
Forpsi webtárhelyre mutat”; ezen bukik el az igénylés.

**Vagyis a megoldás és az élesítés ugyanaz a lépés:** az A rekordot át kell
állítani `185.129.138.202`-re. A TTL 1800 másodperc, tehát a változás nagyjából
fél óra alatt terjed szét; utána újra kell próbálni az SSL-igénylést.

Ezért a helyes sorrend:

1. Az új weblap felmegy a tárhelyre (a domain még a régire mutat, tehát a
   látogatók nem látnak semmit a váltásból).
2. `hosts` fájllal leteszteled az új oldalt az új IP-n — lásd a 3. szakaszt.
3. Az A rekord átállítása `185.129.138.202`-re (`blueway.hu` és `www.blueway.hu`
   is). Ettől a pillanattól az új weblap az éles.
4. Fél óra múlva SSL-igénylés — most már teljesülnie kell a feltételnek.
5. A tanúsítvány telepítése után **SSL redirect** bekapcsolása.

Ha az igénylés a 4. lépésnél mégis elutasítana, írj az ügyfélszolgálatnak a
`W00080673` azonosítóval, és kérdezd meg, pontosan melyik feltétel nem teljesül —
a panel üzenete ezt nem árulja el.

### Hiányzó levelezési rekordok

A DNS-zóna exportjából kiderült, hogy **nincs SPF és nincs DMARC rekord** (DKIM
van: `f2019._domainkey`). Ez a mi szempontunkból is számít: a `send.php` az
`info@blueway.hu` címről küld a webszerverről, és SPF nélkül az ajánlatkérések
könnyebben landolnak a spam mappában.

A FORPSI által javasolt SPF, a domain **TXT** rekordjaként (Hostname üresen):

```
v=spf1 a mx include:_spf.forpsi.com ~all
```

Az `a` mechanizmus a domain A rekordjában szereplő gépet engedélyezi — vagyis a
webszervert, ahonnan a `send.php` küld. Az `mx` és az `include` a FORPSI
levelezőszervereit fedi le.

- A `~all` (softfail) a biztonságos kezdés: az idegen szerverről érkező levél
  átmegy, de gyanúsnak jelölődik.
- Ha egy-két hét alatt kiderült, hogy semmi más nem küld a domainről (hírlevél,
  számlázó, CRM), akkor érdemes `-all`-ra szigorítani.

DMARC ugyanígy, TXT rekordként, `_dmarc` hostnévvel — figyelő üzemmódban indulva:

```
v=DMARC1; p=none; rua=mailto:info@blueway.hu
```

Egy domainhez **csak egy** SPF rekord tartozhat; ha később másik szolgáltató is
küldene, annak az `include`-ját ebbe kell beleírni, nem új rekordba.

### Az igénylés menete

1. Ügyfélközpont → bal oldali menü: **Webtárhelyek** → a listából `blueway.hu`.
2. Az **Alap információk** lapon, az `SSL tanúsítvány` sorban: **Kezelés**.
3. Pipa: *„Egyetértek az SSL tanúsítványokkal kapcsolatos szerződési
   feltételekkel”*, majd **Tanúsítvány igénylése**.
4. Amikor megjön az e-mail, hogy telepíthető: **Kezelés** → **Telepítés**.
5. A kiállítás és telepítés együtt **legfeljebb 2 óra**. Utána a Státusz
   `telepítve`, és a Telepítés gomb helyén `Eltávolítás` jelenik meg.

Egyéb dokumentumot nem kell küldeni.

### Amit előtte érdemes ellenőrizni

Az ingyenes DV SSL feltételei — ha valamelyik nem teljesül, az igénylés elakad:

- a tárhelyhez **nincs másik aktivált SSL** (pl. Let's Encrypt);
- a domain **FORPSI névszervereken** fut ✔ (`ns.forpsi.it`, `ns.forpsi.net`), és
  az A rekordja a FORPSI tárhelyre mutat — **ez az, ami még nem teljesül**;
- a domain regisztrátora is a FORPSI (BlazeArts Kft.) ✔;
- a domain és a tárhely fő kapcsolattartója **ugyanaz**;
- a tanúsítvány kiállítása előtt a szolgáltató biztonsági ellenőrzést futtat a
  weblapon — ha a **régi oldal fertőzött**, nem állítják ki. Ez a mi esetünkben
  érv amellett, hogy előbb menjen fel az új, statikus weblap, és utána kérjük a
  tanúsítványt.

### A megújítás

A tanúsítvány a kiállítástól számítva **1 évig** érvényes, és a lejárat előtt 7
nappal automatikusan, díjmentesen megújul, ha a fenti feltételek továbbra is
teljesülnek. A privát kulcs nem exportálható — a tanúsítvány csak FORPSI
tárhelyen használható.

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
