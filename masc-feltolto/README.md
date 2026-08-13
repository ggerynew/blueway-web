# MASC bizonylat-feltöltő

Windows-program, amely a gépen lévő mappákból feltölti a bizonylatokat a
könyvelőnk fájlkezelőjébe (masc.hu), a megszokott **kötet / ÉÉÉÉ / HH**
szerkezet szerint — **több cég** anyagát, cégenként külön ablakban.

A főképernyőn látszik minden cég neve és kapcsolatának állapota; csatlakozni és
lecsatlakozni gombnyomásra is lehet. A cégablakban fájlonként látszik, mi ment
fel és mi nem — ami elakadt, azt a program a következő indításakor magától
újrapróbálja.

---

## Miben áll a munkája

**Kétlépcsős belépés.** A MASC előbb a MASC Kft. portáljára léptet be, majd
onnan azonnal egy másodikat kér, ami a konkrét cég felületét nyitja meg. A
program ezt lépcsőkként kezeli: az első lépcső adatai jellemzően minden cégnél
azonosak, a második cégenként más. A második lépcső **címét nem kell tudni** —
a portál átirányít oda, és a program onnan folytatja. Ha egy cégnél három
lépcső van, az is felvehető.

**Nem böngészőt vezérel.** A masc.hu-n elFinder 2.1.57 fut, aminek dokumentált
JSON-protokollja van: a böngésző is csak parancsokat küld egy „konnektor"
végpontnak. A program ugyanezeket küldi. Így nem törik el a felület
átszínezésétől, gyors (a hónap összes bizonylata egy kérésben megy fel), és
ellenőrizhető.

**Nyilvántartást vezet.** Minden cégnek van egy állapotfájlja arról, melyik
bizonylat ment fel, melyik vár, és melyik akadt el — mi az oka. Ezért a
program csatlakozás nélkül is meg tudja mutatni, mi van hátra, és ezért tudja
az elakadtakat magától újrapróbálni.

## Amit nem enged meg magának

Könyvelési anyagról van szó, ezért a program szándékosan óvatos:

| Helyzet | Mit tesz |
|---|---|
| A fájl már fent van, azonos mérettel | Feltöltöttnek jelöli. Nem tölti fel újra. |
| Fent van, de **más a mérete** | Kihagyja, és **hibaként mutatja az okkal**. Nem dönti el helyetted, melyik a jó. |
| A bizonylatot kicserélték a lemezen | Észreveszi (tartalom-ujjlenyomat), és újra feltölti. |
| A fájl 0 bájtos | Nem tölti fel. A csonka fájl feltöltve ártatlannak látszik — ez a csapda. |
| A kötet csak olvasható | Meg sem próbálja. |
| Két példány indul a programból | A második az elsőt hozza előre. Párhuzamos feltöltés nincs. |

---

## Telepítés

A telepítő a GitHubon készül el, mert Windows kell hozzá:

1. GitHub → **Actions** → **„MASC feltöltő — Windows telepítő"**
2. **Run workflow**
3. A futás végén, az **Artifacts** szakaszban töltsd le a zipet
4. Bontsd ki, és futtasd a benne lévő `.exe` telepítőt

> A telepítő nincs kódaláírással ellátva, ezért a Windows SmartScreen első
> indításkor „Ismeretlen közzétevő" figyelmeztetést ad. **További információ →
> Futtatás mindenképpen.** Aláíró tanúsítvány beszerzése után ez elmarad.

Fejlesztői gépen a telepítés kihagyható:

```bash
cd masc-feltolto
npm ci
npm run asztal
```

---

## Első beállítás

### 1. A konnektor címe

Az elFinder nem a látható weblap címén beszél. Így tudod meg a valódit:

1. jelentkezz be a **masc.hu**-ra a böngésződben
2. **F12** → **Hálózat** (Network) fül
3. kattints a bal oldali fán egy mappára
4. megjelenik egy kérés, amelynek a címében `cmd=open` szerepel
5. **annak** a címe kell, a `?` jel előtti részig

Például: `https://masc.hu/elfinder/php/connector.php`

Ez a cím minden cégnél ugyanaz — de a cég beállításainál külön szerepel, mert
elvben eltérhet.

### 2. Cég felvétele

A főképernyőn **Új cég**, majd:

| Mező | Mi kerül bele |
|---|---|
| **Cégnév** | Ez látszik a főképernyőn és az ablak címsorában. |
| **Konnektor URL** | Az 1. pontban kiderített cím. |
| **Feltöltési kötet neve** | Elég egy jellemző részlet: a „Blueway Trade Kft - Feltöltés" kötethez a `Feltöltés` megfelel. |
| **1. lépcső** | A MASC-portál címe (`https://masc.hu/`), felhasználónév, jelszó. |
| **2. lépcső** | A cég belépője. **A címet hagyd üresen** — a portál átirányít oda. Csak a felhasználónév és a jelszó kell. |
| **Figyelt mappák** | Tallózással; több is lehet. Ezekbe kerülnek a bizonylatok ezen a gépen. |

A belépési űrlap mezőneveit a program **magától felismeri**: azt az űrlapot
keresi a lapon, amelyikben jelszómező van, és annak a saját címére küld. A
rejtett mezőket (CSRF-jegy) visszaküldi. Ha egy lapon mégsem sikerül a
felismerés, a lépcső alatti „Ha az űrlap mezőnevei szokatlanok" résznél kézzel
megadhatók.

### 3. Próba

Mentés után a cég kártyáján a **Csatlakozás** gomb. Ha zöld „Csatlakozva"
felirat jelenik meg a kötet nevével, kész vagy. Utána **Szinkronizálás**.

---

## Napi működés

**Induláskor magától.** Amelyik cégnél be van kapcsolva az „Induláskor
csatlakozzon és szinkronizáljon magától", ott a program indulás után belép és
feltölt — beleértve azt, ami korábban elakadt. Ehhez semmit nem kell tenni.

**Napközben ötpercenként.** A csatlakozott, automata cégeknél a program magától
átnézi a mappákat, és felviszi az újonnan bekerült bizonylatokat.

**Kézzel bármikor.** A főképernyőn cégenként **Szinkronizálás**, vagy fent az
**Összes szinkronizálása**. A cégablakban ugyanez, plusz **Mappák átnézése**,
ami csatlakozás nélkül is megmutatja, mi vár feltöltésre.

### A cégablak

Bizonylatonként egy sor: név, célmappa, méret, állapot, időpont.

- **Feltöltve** — fent van a MASC-ban
- **Feltöltésre vár** — még nem ment fel
- **Hibás** — elakadt; **a sorban ott az oka is**

A hibás sornál az **Újra** gombbal azonnal visszatehető a sorba, ha közben
elhárult az akadály (megjött a hálózat, javult a jogosultság). Enélkül is
sorra kerül a következő indításkor.

A **Mutasd** gomb az Intézőben nyitja meg a fájl helyét. Megnyitni
szándékosan nem nyitja meg: bizonylatokról van szó, egy véletlen kattintás ne
indítson el semmit.

Alul a napló mutatja, mi történt — ugyanaz, ami a program belsejében zajlik.

---

## Hol vannak az adatok

Windowson a `%APPDATA%\masc-feltolto` mappában:

| Fájl | Mit tartalmaz |
|---|---|
| `cegek.json` | A cégek adatai. A **jelszavak titkosítva**, a Windows saját védelmével (DPAPI). |
| `allapot-<cég>.json` | Cégenként a feltöltési nyilvántartás. |

A titkosított jelszó **csak azon a gépen és csak azzal a Windows-felhasználóval**
fejthető vissza, amelyikkel készült — a fájlt elmásolva használhatatlan. Ha a
titkosítás valamiért nem érhető el, a program **nem írja lemezre** a jelszót,
inkább újra elkéri; a főképernyő ilyenkor ezt ki is írja.

A jelszó a naplóba sem kerül bele, és a szerkesztő űrlapon sem jelenik meg:
üresen hagyva marad a mentett.

---

## Parancssori használat

A program parancssorból is működik — ütemezett futtatáshoz vagy hibakereséshez.
Ez az útvonal egyetlen céggel dolgozik, `masc.env` fájlból:

```bash
npm run felderit                    # milyen kötetek érhetők el?
npm run feltolt -- ./mappa --proba  # mit csinálna?
npm run feltolt -- ./mappa          # és most tényleg
```

A beállítások mintája a `masc.env.pelda` fájlban. A kapcsolók listája:
`npm run feltolt -- --sugo`.

Kilépési kód: `0` rendben, `1` legalább egy bizonylat nem ment fel, `2` hibás
használat.

---

## Ha elakadsz

**„A kiszolgáló weblapot küldött JSON helyett"** — lejárt a munkamenet.
Csatlakozz újra.

**„A kiszolgáló egyetlen kötetet sem adott vissza"** — a belépés nem sikerült.
Kétlépcsős belépésnél ez gyakran azt jelenti, hogy a **második** lépcső bukott
el: a portálra bejutottunk, a cég felületére nem. Ellenőrizd a 2. lépcső
felhasználónevét és jelszavát.

**„nem találtam belépési űrlapot"** — a lapon nincs jelszómező ott, ahol
vártuk. Add meg kézzel a mezőneveket a lépcső beállításainál.

**„ismeretlen parancs — nem ez a konnektor URL-je?"** — a cím létező lapra
mutat, de az nem az elFinder konnektora. Nézd meg újra a Hálózat fülön.

**„a fájltípus nem engedélyezett"** — a MASC oldalán van szűrés. A könyvelővel
kell egyeztetni, milyen kiterjesztést fogad.

---

## Fejlesztés

```bash
cd masc-feltolto
npm ci
npm run teszt          # a program próbái (teszt-konnektor ellen)
npm run teszt:felulet  # a felület próbái böngészőmotorban
npm run ellenoriz      # típusellenőrzés
npm run asztal         # a program indítása fejlesztői módban
```

### Felépítés

Az érdemi tudás **Electronon kívül** van, hogy tesztelhető legyen; az Electron
csak ablakot ad neki.

| Fájl | Miért felel |
|---|---|
| `src/elfinder.ts` | az elFinder protokoll: `open`, `mkdir`, `upload` |
| `src/bejelentkezes.ts` | lépcsős belépés, űrlapfelismerés, kötetválasztás |
| `src/sutis-keres.ts` | HTTP munkamenet-sütivel, átirányítás-követéssel |
| `src/bizonylatok.ts` | fájlgyűjtés, szűrés, hónap meghatározása |
| `src/feltolto.ts` | a menet: célmappa, kihagyás, feltöltés, visszajelzés |
| `src/cegtar.ts` | cégek tárolása, jelszavak titkosítása |
| `src/allapottar.ts` | mi ment fel, mi nem, mit kell újrapróbálni |
| `src/szinkron.ts` | egy cég kapcsolata és szinkronizálása |
| `src/index.ts` | a parancssori változat |
| `asztali/fo.ts` | Electron: ablakok, üzenetváltás, ütemezés |
| `asztali/hid.cjs` | a híd az ablak és a program között |
| `asztali/felulet/` | a két képernyő (HTML, CSS, JavaScript) |

A forrás TypeScript, a kimenet a `dist/` alatt (`npm run epit`). Ezért
hivatkoznak az importok `.js`-re, holott a fájl `.ts` — ez az ESM szabvány
útja. Futásidejű függősége nincs: a Node beépített `fetch`, `FormData` és
`Blob` eszközeit használja.

### A próbákról

A tesztek soha nem nyúlnak a masc.hu-hoz. Helyette egy helyben futó
teszt-konnektor ellen mennek (`teszt/mock-masc.mjs`), amely utánozza az
elFinder hash-számítását, hibaválaszait, adagkorlátját — és a **kétlépcsős
belépést** is, más mezőnevekkel és más űrlapcímmel a második lépcsőn, hogy a
felismerés tényleg próbát álljon.

A felület próbái igazi böngészőmotorban futnak, a hídra tett próbabábuval:
ugyanaz a HTML és JavaScript, ami az Electron ablakaiban.

### Ami még nincs kipróbálva élesben

A program **csak a teszt-konnektor ellen** futott: a fejlesztői környezet
hálózata nem éri el a masc.hu-t. Az **Electron elindulása** sincs kipróbálva —
a binárisát a homokozó nem tudja letölteni; a Windows-telepítő gyártása ezért
fut a GitHub Windows-futtatóján.

Amit ez érint, és amit az első éles beállításnál érdemes végignézni:

- a konnektor pontos címe (ezért kell kézzel megadni)
- a második lépcső űrlapjának felismerése (ha nem megy, a mezőnevek kézzel is
  megadhatók)
- a MASC esetleges fájltípus- vagy méretkorlátai

Első cégnél érdemes egy mappában egyetlen bizonylattal kezdeni, és a
cégablakban megnézni, hogy „Feltöltve" lett-e.
