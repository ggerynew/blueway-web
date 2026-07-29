# Élesítési forgatókönyv — költözés a FORPSI tárhelyre

A weblap statikus export: nincs mögötte futó alkalmazás, csak fájlok. A költözés
ezért fájlfeltöltés plusz néhány beállítás. Ez a dokumentum a **végrehajtás
sorrendjét** írja le; a magyarázatok a lépések alatt vannak.

## A tárhely adatai

| | |
|---|---|
| Termék | DYNAMIC webtárhely, `blueway.hu` |
| Megrendelő azonosító | W00080673 |
| FTP-szerver | `ftpx.forpsi.com` |
| Tárhely web IP-je | `185.129.138.202` |
| A domain jelenlegi A rekordja | `81.2.194.244` (a régi weblap) |
| Névszerverek | `ns.forpsi.it`, `ns.forpsi.net` |
| PHP | 8.5 ✔ |
| WWW redirect | engedélyezve ✔ |
| SSL tanúsítvány | visszavonva — a 6. lépés állítja helyre |
| SSL redirect | letiltva — a 7. lépésben kapcsoljuk be |
| Dynamic cache | letiltva — maradjon így |

## Előfeltétel: nagyobb csomag

**A mostani 100 MB kevés.** A legenerált weblap 141 MB:

| rész | méret |
|---|---|
| adatlapok (32 PDF) | 69 MB |
| HTML-oldalak (607 db, 7 nyelven) | 41 MB |
| kliensoldali navigáció adatai (`.txt`) | 22 MB |
| képek, videó, JS, CSS | 9 MB |

A PDF-ek utólagos tömörítése nem járható út: a legnagyobból (7 MB, 36 oldal)
mindössze 1,6 MB a kép, a többi vektoros rajz és betűkészlet.

Jó hír, hogy a mai Linux csomagokban **mindháromban korlátlan a tárhely** — tehát
a méret önmagában nem szempont a választásnál:

| | Easy | Advanced | Professional |
|---|---|---|---|
| tárhely | korlátlan | korlátlan | korlátlan |
| fő domainek | 1 | max. 3 | max. 10 |
| adatbázisok | 1 | 3 | 10 |
| e-mail fiók max. mérete | 10 GB | 20 GB | 30 GB |

**Az Advanced elég ehhez a weblaphoz.** Adatbázis nem kell (statikus oldal + egy
PHP szkript), egy fő domain van.

A postafiók-kapacitás a mostani csomagban 30 GB, az Advanceben 20 GB. Ez itt nem
korlát: a levelezés úgy van beállítva, hogy az Outlook által letöltött, 14 napnál
régebbi leveleket a szerver automatikusan törli, tehát a szerveroldali tárhely
tartósan alacsony marad.

> Ennek egy következménye viszont a weblap szempontjából is van: a `send.php` az
> `info@blueway.hu` címre küldi az ajánlatkéréseket, tehát azokra is vonatkozik a
> 14 napos takarítás. Ha egy megkeresés csak azon a gépen marad meg, amelyik
> letöltötte, érdemes lehet az ajánlatkéréseket külön mappába vagy címre is
> archiválni.

Az akciós ár csak az első évre szól; a megújítási ár ennél magasabb. A váltás
előtt érdemes megnézni a **második évi** díjat is, mert hosszú távon az számít.

## A lépések áttekintése

| # | lépés | mikor | mennyi idő |
|---|---|---|---|
| 1 | SPF és DMARC felvétele | bármikor, akár most | 5 perc + fél óra terjedés |
| 2 | Build | élesítés napján | 2 perc |
| 3 | Feltöltés | élesítés napján | 15–60 perc |
| 4 | Tesztelés `hosts` fájllal | feltöltés után | 15 perc |
| 5 | **A rekord átállítása = élesítés** | amikor a teszt rendben | 1 perc + fél óra terjedés |
| 6 | SSL igénylése és telepítése | az 5. után fél órával | max. 2 óra |
| 7 | SSL redirect bekapcsolása | a tanúsítvány telepítése után | 1 perc |
| 8 | Utómunka | utána | — |

A 2–4. lépés alatt a látogatók még a régi weblapot látják, tehát nyugodtan lehet
vele bíbelődni. Az éles váltás az 5. lépés.

---

## 1. SPF és DMARC felvétele

**Ez független a költözéstől — akár most megcsinálható**, és a mostani szerverre
is érvényes lesz.

A zónában van DKIM (`f2019._domainkey`), de **SPF és DMARC nincs**. Enélkül a
weblapról küldött ajánlatkérések könnyebben landolnak a spam mappában.

1. Ügyfélközpont → **Domainek** → `blueway.hu` → **DNS-rekordok szerkesztése**
2. Új rekord:
   - Típus: **TXT**
   - Hostname: **üresen hagyni**
   - TTL: 1800 (marad)
   - Érték: `v=spf1 a mx include:_spf.forpsi.com ~all`
3. Még egy új rekord:
   - Típus: **TXT**
   - Hostname: **`_dmarc`**
   - Érték: `v=DMARC1; p=none; rua=mailto:info@blueway.hu`

Az `a` mechanizmus azt a gépet engedélyezi, amire a domain A rekordja mutat —
vagyis a webszervert, ahonnan a `send.php` küld. Az `mx` és az `include` a FORPSI
levelezőszervereit fedi le.

A `~all` (softfail) a biztonságos kezdés: idegen szerverről érkező levél átmegy,
csak gyanúsnak jelölődik. Ha egy-két hét múlva biztos, hogy semmi más nem küld a
domainről (hírlevél, számlázó, CRM), akkor érdemes `-all`-ra szigorítani.

A DMARC `p=none` figyelő üzemmód: nem dob el semmit, csak jelentést kérünk.

> Egy domainhez **csak egy** SPF rekord tartozhat. Ha később másik szolgáltató is
> küldene, annak az `include`-ját ebbe a rekordba kell beírni, nem újat felvenni.

---

## 2. Build

```bash
npm ci
npm run build:live
```

Ez üres base path-tal épít, és a `https://blueway.hu` címet írja a kanonikus
URL-ekbe, a sitemapbe és a robots.txt-be. Az eredmény az `out/` mappában van
(~138 MB, 1362 fájl — a zömét az adatlap-PDF-ek adják).

Más domain esetén:

```bash
NEXT_PUBLIC_SITE_URL=https://<domain> \
NEXT_PUBLIC_FORM_ENDPOINT=https://<domain>/send.php \
npm run build:live
```

---

## 3. Feltöltés

A weboldal gyökerébe négy dolog kerül:

1. az `out/` mappa **tartalma** (nem maga a mappa);
2. `server/.htaccess`;
3. `server/send.php`;
4. `server/.user.ini`.

A `.htaccess` és a `.user.ini` **rejtett fájl** — az FTP-kliensben be kell
kapcsolni a rejtett fájlok mutatását, különben kimaradnak. Enélkül a weblap nem
fog működni (lásd lentebb).

### SSH-val (ajánlott)

Az SSH-t az ügyfélközpontban lehet bekapcsolni. 1362 fájl FTP-n sok száz külön
kapcsolat, és félbeszakadás esetén nehéz megmondani, mi ment át; `rsync`-kel egy
menetben, folytathatóan megy:

```bash
rsync -avz out/ <felhasznalo>@ftpx.forpsi.com:<webgyoker>/
rsync -avz server/.htaccess server/send.php server/.user.ini \
  <felhasznalo>@ftpx.forpsi.com:<webgyoker>/
```

A régi weblap fájljait a `--delete` kapcsoló takarítaná el, de **csak akkor
használd, ha a régi oldalról már van mentésed**, és a webgyökérben nincs más,
amire szükség van. Biztonságosabb kihagyni, és a régi fájlokat kézzel törölni,
miután az új oldal működik.

### Miért kell a `.htaccess`

A weblap linkjei kiterjesztés nélküliek (`/hu/rolunk`), a fájlok viszont
`hu/rolunk.html` néven állnak. A GitHub Pages ezt magától feloldja, az Apache
**nem** — enélkül a nyitóoldalon kívül minden link 404 lenne. A `.htaccess`
átírási szabálya ezt oldja meg, és beállítja a 404-es oldalt, a gyorsítótárazást
és a tömörítést is.

### Miért kell a `.user.ini`

A PHP alapértelmezett feltöltési korlátja gyakran 2 MB, a weblap viszont 10 MB-ig
enged csatolmányt. A `.user.ini` 12 MB-ra emeli; enélkül a nagyobb csatolmánnyal
küldött ajánlatkérés néma hibára futna.

### A `send.php` beállítása

A `RECIPIENT` és a `FROM` is `info@blueway.hu`, tehát alapból **nincs mit átírni
benne**. Más címzetthez a fájl elején a `RECIPIENT`-et állítsd át.

---

## 3/a. Automatikus feltöltés GitHubról

A kézi feltöltés csak az első alkalommal kell. Utána a
`.github/workflows/deploy-forpsi.yml` munkafolyamat minden `main`-re érkező
változtatást kitesz a tárhelyre — tartalmi javítás után nincs teendő, pár perccel
később már az éles oldalon van.

A munkafolyamat addig **nem csinál semmit**, amíg nincsenek beállítva a
hozzáférési adatok, tehát nyugodtan ott lehet a repóban a bekapcsolás előtt is.

### Beállítás

A secretek helye:
`https://github.com/ggerynew/blueway-web/settings/secrets/actions`
(vagy: a repó oldalán **Settings** → bal oldalt *Secrets and variables* →
**Actions**), majd a zöld **New repository secret** gomb. Minden secret egy külön
felvétel: felül a **Name**, alul a **Secret** mező, aztán **Add secret**.

A beírt érték utólag **nem olvasható vissza**, csak felülírható — ez normális.
A titkos adatok (jelszó, privát kulcs) ne menjenek se e-mailben, se csevegésben:
közvetlenül ide másold őket.

**SSH-val** (ez az ajánlott — gyorsabb, és csak a változott fájlokat viszi át):

| secret | érték |
|---|---|
| `FORPSI_SSH_HOST` | `ftpx.forpsi.com` |
| `FORPSI_SSH_USER` | az SSH felhasználónév |
| `FORPSI_SSH_KEY` | a privát kulcs teljes tartalma |
| `FORPSI_WEB_ROOT` | a webgyökér útvonala a szerveren |

**FTP-vel** (ha az SSH nincs bekapcsolva):

| secret | érték |
|---|---|
| `FORPSI_FTP_HOST` | `ftpx.forpsi.com` |
| `FORPSI_FTP_USER` | az FTP felhasználónév — lásd alább |
| `FORPSI_FTP_PASSWORD` | az FTP jelszó |
| `FORPSI_WEB_ROOT` | `/www` |

Ha mindkettő be van állítva, az SSH-t használja.

#### Hol van az FTP felhasználónév és jelszó

Ügyfélközpont → **Webtárhely** → `blueway.hu` → **FTP** fül. Itt látszik a
felhasználónév és a kiszolgáló neve, és innen újra is küldethető a jelszó, ha
nincs meg (a régi jelszó ilyenkor megszűnik).

A FORPSI Linux tárhelyén **kétféle** FTP felhasználónév van, és mindkettő
tartalmaz pontot:

| fiók | felhasználónév | mit lát |
|---|---|---|
| a weboldalé | `www.blueway.hu` | csak ezt a weboldalt — **ez kell nekünk** |
| a fő fiók | `bXXXXXXX.multi` | a szolgáltatás összes weboldalát |

**A rendelésszám (`W0008xxxx` alakú) nem FTP belépő** — ez a leggyakoribb
tévedés, és pontosan `530 Login authentication failed` a következménye.

A weboldal FTP fiókjával belépve három mappát látsz — `www`, `subdoms`,
`backups-forpsi`. A weblap a **`www`** mappába való, ezért `/www` a webgyökér.

### Az SSH-kulcs elkészítése

Az SSH-hoz kulcspár kell: a **publikus** fele a szerverre kerül, a **privát** fele
a GitHub secretbe. Jelszó helyett ez azonosít.

A saját gépeden (Windowson PowerShellben is megy):

```bash
ssh-keygen -t ed25519 -C "github-deploy blueway" -f blueway-deploy -N ""
```

Két fájl készül a mappában:

- `blueway-deploy.pub` — ez a **publikus** kulcs. Ennek a tartalmát kell a FORPSI
  ügyfélközpontban az SSH-hozzáféréshez megadni (vagy a szerveren a
  `~/.ssh/authorized_keys` fájlba beírni).
- `blueway-deploy` — ez a **privát** kulcs. A teljes tartalmát, a
  `-----BEGIN...` és `-----END...` sorokkal együtt, a `FORPSI_SSH_KEY` secretbe
  kell bemásolni.

A privát kulcsot senkinek ne add ki, és ne töltsd fel sehová.

### A webgyökér útvonala

**Ezen a tárhelyen: `/www`.**

Az FTP gyökerében ezek a könyvtárak vannak:

| könyvtár | mi ez |
|---|---|
| `www` | **a webgyökér — ide megy a weblap** |
| `www_` | egy korábbi weblap félretett példánya (2016) |
| `app`, `src`, `data`, `vendor` | a régi PHP-alkalmazás fájljai, a webgyökéren kívül |
| `backups-forpsi` | a szolgáltató mentései (csak olvasható) |
| `stat`, `tmp`, `softaculous` | statisztika, ideiglenes fájlok, telepítő |

A weblap fájljai **csak a `www` mappába** kerülnek; a többihez nem nyúlunk.
Ellenőrzésképp nyisd meg a `www`-t: ott kell lennie a mostani weblap
nyitófájljának.

> **Figyelem a nyitóoldalra.** Ha a `www`-ben marad a régi `index.php`, az
> Apache alapból azt részesíti előnyben az `index.html`-lel szemben — a régi
> weblap jelenne meg az új helyett. A `.htaccess` ezért kimondja, hogy a
> nyitóoldal az `index.html`. A régi fájlokat érdemes ettől függetlenül
> eltakarítani, miután az új oldal működik.

### Mit csinál

1. Az éles domainre épít (üres base path, `https://blueway.hu`, `send.php`).
2. A `server/` fájljait (`.htaccess`, `send.php`, `.user.ini`) a feltöltendő
   mappába másolja — így azok is frissülnek.
3. **Leáll, ha a build gyanús**: ha 500-nál kevesebb fájl készült, vagy hiányzik
   az `index.html` vagy a `send.php`. Egy elrontott build így nem törli le a
   működő weblapot.
4. Feltölti — csak a megváltozott fájlokat. Az első teljes szinkron után egy-egy
   tartalmi javítás néhány másodperc.
5. Megnézi, hogy a `https://blueway.hu/hu` 200-zal válaszol-e. Ha nem, csak
   figyelmeztet (a DNS-átállítás előtt ez természetes).

A secretek felvétele után nem kell push-ra várni: **Actions** → *Deploy to
FORPSI* → **Run workflow** — így rögtön kipróbálható.

**A szerveren lévő, buildben nem szereplő fájlokat alapból nem törli** — a régi
weblap maradványai megmaradnak, amíg kézzel el nem takarítod. Ha egyszer teljes
takarítást szeretnél: Actions → *Deploy to FORPSI* → **Run workflow**, és pipáld
be a törlést. Ezt csak akkor, ha a régi oldalról már van mentés.

### Ami megmarad

A GitHub Pages-es deploy nem szűnik meg: az továbbra is épül minden változtatásra,
és jó **előnézetnek** — ott meg lehet nézni egy módosítást, mielőtt az élesre
kerül.

---

## 4. Tesztelés `hosts` fájllal

Az új oldal így megnézhető, mielőtt a világ is látná. A gépeden a `hosts` fájlba
(Windows: `C:\Windows\System32\drivers\etc\hosts`) vedd fel:

```
185.129.138.202 blueway.hu www.blueway.hu
```

Amit végig kell nézni:

- **a nyitóoldal és néhány mély link** (termékoldal, tudástár-cikk, GYIK) — ezek
  bizonyítják, hogy a `.htaccess` átírás működik. Ha ezek 404-et adnak, a
  `.htaccess` nem került fel;
- nyelvváltás a zászlókkal;
- **egy próba-ajánlatkérés elküldése**, csatolt fájllal is — és nézd meg a
  postafiókot, a spam mappát is;
- a süti-sáv megjelenik-e, és a beállítások menthetők-e.

A teszt végén **vedd ki a sort a `hosts` fájlból**, különben a saját géped
továbbra is az új IP-t használja, és nem azt látod, amit a látogatók.

> Ebben a fázisban a `https://blueway.hu` még nem fog működni (nincs tanúsítvány)
> — `http://`-val nézd.

---

## 5. A rekord átállítása — ez az élesítés

Ügyfélközpont → **Domainek** → `blueway.hu` → **DNS-rekordok szerkesztése**.

Két rekordot kell átírni `81.2.194.244`-ről `185.129.138.202`-re:

| Hostname | Típus | Új érték |
|---|---|---|
| `blueway.hu` | A | `185.129.138.202` |
| `www.blueway.hu` | A | `185.129.138.202` |

A TTL 1800 másodperc, tehát a változás **kb. fél óra alatt** terjed szét. Ettől a
pillanattól az új weblap az éles.

A levelezést ez **nem érinti**: az MX és a levelezéshez tartozó CNAME-ek
(`imap`, `pop3`, `smtp`, `webmail`) változatlanul a FORPSI szervereire mutatnak.

---

## 6. SSL igénylése és telepítése

Az A rekord átállítása után **kb. fél órát várj**, aztán:

1. Ügyfélközpont → **Webtárhelyek** → `blueway.hu`
2. Az **Alap információk** lapon az `SSL tanúsítvány` sorban: **Kezelés**
3. Pipa: *„Egyetértek az SSL tanúsítványokkal kapcsolatos szerződési
   feltételekkel”* → **Tanúsítvány igénylése**
4. Amikor megjön az e-mail, hogy telepíthető: **Kezelés** → **Telepítés**
5. A kiállítás és telepítés együtt legfeljebb **2 óra**. Utána a Státusz
   `telepítve`, és a Telepítés gomb helyén `Eltávolítás` jelenik meg.

Egyéb dokumentumot nem kell küldeni.

### Miért csak most — az öt feltétel

Eddig az igénylés erre futott: *„A szolgáltatás nem megfelelő az ingyenes DV SSL
tanúsítványhoz.”* A FORPSI tudásbázisa (a528. cikk) pontosan öt feltételt sorol
fel; a jelenlegi állás:

| # | feltétel | állapot |
|---|---|---|
| 1 | a BlazeArts Kft. (FORPSI) a domain regisztrátora, nem IDN | ✔ |
| 2 | FORPSI névszerverek, **és az A rekord FORPSI webtárhelyre mutat** | NS ✔ · **A rekord: ez a gyanús** |
| 3 | a domain és a webtárhely **fő kapcsolattartója megegyezik** | ellenőrizendő |
| 4 | a FORPSI a webtárhely-szolgáltató | ✔ |
| 5 | nincs másik megrendelt és aktivált SSL a tárhelyen | ✔ (a régi visszavonva) |

A **2. pont** a legvalószínűbb ok: az A rekord egy régebbi FORPSI gépre mutat
(`81.2.194.244`), nem arra a tárhelyre, amelyikhez a tanúsítványt kérjük
(`185.129.138.202`). Ezt az 5. lépés amúgy is javítja — ezért kell utána
újrapróbálni.

A **3. pontot viszont érdemes már most megnézni**, mert ha az a baj, a DNS-váltás
nem fogja megoldani: az ügyfélközpontban a domain és a webtárhely adatlapján a fő
kapcsolattartónak ugyanannak kell lennie.

Ha az igénylés a DNS-váltás után is elutasítana, írj az ügyfélszolgálatnak a
`W00080673` azonosítóval, és kérdezd meg, **pontosan melyik feltétel nem
teljesül** — a panel üzenete ezt nem árulja el.

A tanúsítvány csak másod- és harmadszintű nevekhez jár (`blueway.hu` ✔), és
ékezetes (IDN) domainhez nem.

### A tanúsítványról

Kiállító: Actalis, wildcard (az aldomainekre is érvényes), érvényesség **1 év**.
A lejárat előtt 7 nappal automatikusan, díjmentesen megújul, ha a feltételek
továbbra is teljesülnek. A privát kulcs nem exportálható — a tanúsítvány csak
FORPSI tárhelyen használható.

Fizetős tanúsítványra **nincs szükség**. Ha valamiért mégis, a legolcsóbb
(Actalis DV SSL, 2.500 Ft+áfa/év) ugyanazt a DV szintet adja, mint a drágábbak; a
magasabb ár csak márkanevet és egy soha le nem hívott garanciaösszeget fedez.

---

## 7. SSL redirect bekapcsolása

**Csak azután, hogy a tanúsítvány telepítve van** — előbb bekapcsolva minden
látogató hibaoldalt kapna.

Ügyfélközpont → **Webtárhelyek** → `blueway.hu` → `SSL redirect` sor →
**engedélyezés**.

A `.htaccess`-ben lévő HTTPS-blokk maradjon kikommentezve: elég az egyik, és a
szolgáltatóé hamarabb lefut, mint a mi átírási szabályunk. (Ha valamiért mégis a
`.htaccess`-est használnád, a fájl elején lévő blokkot vedd elő — az áll minden
más szabály előtt, ez pedig fontos: a lentebbi átírások `[L]` jelzője miatt egy
alább elhelyezett HTTPS-szabály vagy le sem futna, vagy a `.html`-re végződő
címre irányítana át.)

Ezután ellenőrizd, hogy a `http://blueway.hu` átdob-e `https://blueway.hu`-ra, és
hogy a `www.blueway.hu` a www nélküli alakra megy-e (a WWW redirect már be van
kapcsolva).

---

## 8. Utómunka

- **Search Console.** Vedd fel a domaint, és küldd be a
  `https://blueway.hu/sitemap.xml` címet. 605 URL van benne.
- **Régi URL-ek.** Ha a mostani weblapnak más az útvonalszerkezete, a régi
  címekről 301-es átirányítás kell az újakra, különben a meglévő találatok
  404-re futnak. Ehhez a régi oldaltérkép kell — szólj, és megírom a szabályokat
  a `.htaccess`-be.
- **Formspree kivezetése.** A `send.php` átvette a szerepét, a Formspree-fiók
  elhagyható. Érdemes egy-két hétig meghagyni, amíg biztos, hogy a saját végpont
  hibátlanul kézbesít.
- **GoatCounter.** A statisztikában eddig `/blueway-web/...` útvonalak
  szerepeltek, ezután `/hu/...` alakúak lesznek. A régi adatok megmaradnak.
- **SPF szigorítása.** Egy-két hét után `~all` helyett `-all`, ha semmi más nem
  küld a domainről.

---

## Ha valami nem megy

| tünet | ok |
|---|---|
| A nyitóoldalon kívül **minden link 404** | a `.htaccess` nem került fel (rejtett fájl!), vagy a tárhelyen nincs engedélyezve az `AllowOverride` — ez utóbbin az ügyfélszolgálat segít |
| Az automata feltöltés **530 Login authentication failed**, pedig a TotalCommander belép | a kiszolgáló ezt a *gépet* utasítja el, nem az adatokat. Jellemzően IP-korlátozás van az FTP fiókon (Ügyfélközpont → FTP fül); a GitHub futtatójának IP-címe minden futásnál változik, ezért azt nem lehet felvenni — ilyenkor vagy le kell venni a korlátozást, vagy SSH-ra váltani. A workflow diagnosztikája kiírja a kiszolgáló pontos válaszait |
| Az űrlap **413**-at ad | a `.user.ini` nem került fel |
| Az űrlap **500**-at ad | a `send.php` hibára fut — nézd meg a tárhely hibanaplóját |
| Az űrlap **megnyitja a levelezőt** küldés helyett | a végpont nem érhető el. Ez a beépített tartalék, tehát érdeklődés nem vész el, de a `send.php`-t javítani kell |
| A levél **spam mappába** kerül | hiányzik vagy hibás az SPF (1. lépés) |
| A `https://` **nem tölt be** | a tanúsítvány még nincs telepítve (6. lépés) |
| A nyitóoldalak helyett **fájllista vagy 403** jelenik meg | régi `.htaccess` van fenn. A Next.js egyszerre készít `hu/` mappát és `hu.html` fájlt; az átírási szabály nem vizsgálhatja, hogy a kért útvonal mappa-e. A repóban lévő mostani `.htaccess` ezt már kezeli |
| **Az egész oldal 500**-at ad, pedig a fájlok fenn vannak | a `.htaccess` egy sorát nem engedi a tárhely. Kommentezd ki az utoljára hozzáadott sort, és próbáld újra — jellemzően az `Options` sor szokott ilyen lenni |
