# MASC bizonylat-feltöltő

Bizonylatokat tölt fel a könyvelőnk fájlkezelőjébe (masc.hu), a megszokott
**kötet / ÉÉÉÉ / HH** mappaszerkezet szerint — kattintgatás helyett egyetlen
paranccsal.

```
npm run masc:feltolt -- ./bizonylatok --proba    # mit csinálna?
npm run masc:feltolt -- ./bizonylatok            # és most tényleg
```

---

## Miért nem böngészőt vezérel

A masc.hu-n egy **elFinder 2.1.57** fájlkezelő fut. A felülete JavaScript, de
mögötte egy dokumentált JSON-protokoll van: a böngésző is csak parancsokat küld
egy „konnektor" végpontnak (`cmd=open`, `cmd=mkdir`, `cmd=upload`), és JSON-t kap
vissza. Ugyanezeket a kéréseket küldi ez a program is.

Ez lényegesen jobb, mint böngészőt automatizálni:

- **nem törik el**, ha a felület kinézete változik
- **ütemezhető** — nem kell grafikus felület a géphez
- **gyors**: a hónap összes bizonylata egyetlen kérésben megy fel
- **ellenőrizhető** — a protokoll teszt-konnektor ellen kipróbálható

## Amit nem enged meg magának

Könyvelési anyagról van szó, ezért a program szándékosan óvatos:

| Helyzet | Mit tesz |
|---|---|
| A fájl már fent van, azonos mérettel | Kihagyja. Az újrafuttatás nem duplázza a tételeket. |
| Fent van, de **más a mérete** | Kihagyja, és **szól**. Nem dönti el helyetted, melyik a jó. |
| Kifejezetten kéred (`--felulir`) | Felülírja. |
| A fájl 0 bájtos | Megáll. A csonka fájl feltöltve ártatlannak látszik — ez a csapda. |
| A kötet csak olvasható | Meg sem próbálja. |

---

## Beállítás — egyszer, tíz perc

### 1. A konnektor címe

Az elFinder nem a látható weblap címén beszél. Így tudod meg a valódit:

1. jelentkezz be a **masc.hu**-ra a böngésződben
2. **F12** → **Hálózat** (Network) fül
3. kattints a bal oldali fán egy mappára
4. megjelenik egy kérés, amelynek a címében `cmd=open` szerepel
5. **annak** a címe kell, a `?` jel előtti részig

Például: `https://masc.hu/elfinder/php/connector.php`

### 2. A beállításfájl

```bash
cp masc-feltolto/masc.env.pelda masc-feltolto/masc.env
```

Nyisd meg, és töltsd ki. A bejelentkezéshez **két mód** közül lehet választani:

**„A" mód — munkamenet-süti** (egyszerűbb, ezzel kezdj)

F12 → **Alkalmazás** (Application) → Sütik → masc.hu. Keresd a `PHPSESSID`
(vagy hasonló nevű) sort, és másold be `név=érték` alakban:

```
MASC_SUTI=PHPSESSID=a1b2c3d4e5f6
```

Hátránya: a süti egy-két hetente lejár, olyankor újra ki kell másolni. Ezt a
program egyértelműen megmondja, nem rejtélyes hibával áll le.

**„B" mód — felhasználónév és jelszó** (ütemezett futáshoz)

```
MASC_BELEPES_URL=https://masc.hu/index.php
MASC_FELHASZNALO=...
MASC_JELSZO=...
```

A belépési űrlap mezőneveit a lap forrásából olvasd ki (jobb gomb → „Oldal
forrásának megtekintése", keresd az `<input name="...">` részeket). Ha nem a
szokásos `username`/`password`, írd felül:

```
MASC_MEZO_FELHASZNALO=felhasznalo
MASC_MEZO_JELSZO=jelszo
```

A rejtett mezőket (CSRF-jegy) a program magától visszaküldi.

> A `masc.env` fájlt a `.gitignore` kizárja, és egy GitHub-ellenőrzés is
> figyeli, nehogy véletlenül beküldd. Ha mégis megtörtént: vedd ki a fájlt,
> és **cseréld le a jelszót** — a git történetéből utólag kiszedni sokkal
> nehezebb, mint új jelszót kérni.

### 3. Próba

```bash
npm run masc:felderit
```

Kiírja az elérhető köteteket és a bennük lévő év/hónap mappákat. Ha ezt látod,
készen vagy:

```
 Elérhető kötetek:
   ▸ Blueway Trade Kft - Feltöltés
       hash: l1_Lw
       2026/ → 06, 07, 08
   ▸ Blueway Trade Kft - Könyvelés [csak olvasható]
```

Ha a feltöltési kötet neve más, mint amit vársz, állítsd a `MASC_GYOKER`
értékét a nevének egy jellemző részletére.

---

## Használat

```bash
# Az aktuális hónapba, előbb szárazon
npm run masc:feltolt -- ./bizonylatok --proba

# Élesben
npm run masc:feltolt -- ./bizonylatok

# Egy korábbi hónapba
npm run masc:feltolt -- ./juliusi-szamlak --ho 2026-07

# Minden fájl a saját dátuma szerinti hónapba
npm run masc:feltolt -- ./vegyes --fajl-datum

# Egyetlen fájl
npm run masc:feltolt -- ./szamla-123.pdf

# Feltöltés után a helyi fájlt tegye át az archívumba
npm run masc:feltolt -- ./bejovo --archivum ./feltoltve
```

A `--` a parancs és a saját kapcsolóink közé kell — enélkül az npm magának
tartaná meg őket.

### Kapcsolók

| Kapcsoló | Mit csinál |
|---|---|
| `--proba` | Nem tölt fel és nem hoz létre semmit, csak leírja, mi történne. |
| `--ho ÉÉÉÉ-HH` | Célhónap. Alap: az aktuális hónap. |
| `--fajl-datum` | Minden bizonylat a saját módosítási dátuma szerinti hónapba. |
| `--felulir` | A fent lévő, azonos nevű fájl felülírása. |
| `--rekurziv` | A megadott mappa almappáit is bejárja. |
| `--archivum <mappa>` | Sikeres feltöltés után ide **mozgatja** a helyi fájlt (`mappa/ÉÉÉÉ/HH` alá). |
| `--kiterjesztes pdf,xml` | Az elfogadott kiterjesztések felülírása. |
| `--naplo <fájl>` | A történteket fájlba is írja, időbélyeggel. |
| `--bobeszedu` | Minden HTTP-kérés kiírása. Hibakereséshez. |

Alapból elfogadott kiterjesztések: `pdf, jpg, jpeg, png, tif, tiff, xml, csv,
xls, xlsx, doc, docx`. Az ideiglenes fájlokat (`~$…`, `.part`, rejtett fájlok)
mindig kihagyja.

### Kilépési kód

| Kód | Jelentés |
|---|---|
| `0` | Minden rendben (a kihagyott, már fent lévő fájl is rendben van) |
| `1` | Legalább egy bizonylat nem ment fel, vagy a bejelentkezés nem sikerült |
| `2` | Hibás használat: rossz kapcsoló, hiányzó beállítás, nem létező útvonal |

Ütemezett futásnál erre érdemes figyelni: a `0`-tól eltérő kód azt jelenti,
hogy valakinek meg kell néznie.

---

## Ha elakadsz

**„A kiszolgáló weblapot küldött JSON helyett"** — lejárt a munkamenet. Másold
ki újra a sütit, vagy állj át űrlapos belépésre.

**„A kiszolgáló egyetlen kötetet sem adott vissza"** — nem vagyunk bent. Rossz
vagy lejárt süti, esetleg rossz konnektor-cím.

**„ismeretlen parancs — nem ez a konnektor URL-je?"** — a cím egy létező lapra
mutat, de az nem az elFinder konnektora. Nézd meg újra a Hálózat fülön.

**„a fájltípus nem engedélyezett"** — a MASC oldalán van szűrés. A könyvelővel
kell egyeztetni, milyen kiterjesztést fogad.

Részletes kimenethez: `--bobeszedu`. Ez minden HTTP-kérést kiír — a sütit és a
jelszót viszont akkor sem, azok mindig `«rejtve»` alakban jelennek meg.

---

## Fejlesztés

```bash
npm run masc:teszt        # próbák a teszt-konnektor ellen
npm run masc:ellenoriz    # típusellenőrzés
```

Nincs futásidejű függősége: a Node 22 beépített `fetch`, `FormData` és `Blob`
eszközeit használja, a típusokat pedig a Node veti le futáskor
(`--experimental-strip-types`), tehát fordítási lépés sincs.

| Fájl | Miért felel |
|---|---|
| `src/index.ts` | parancssor, kapcsolók, kilépési kód |
| `src/beallitasok.ts` | konfig betöltése és ellenőrzése |
| `src/bejelentkezes.ts` | süti vagy űrlapos belépés, kötetválasztás |
| `src/sutis-keres.ts` | HTTP munkamenet-sütivel, átirányítás-követéssel |
| `src/elfinder.ts` | az elFinder protokoll: `open`, `mkdir`, `upload` |
| `src/bizonylatok.ts` | fájlgyűjtés, szűrés, hónap meghatározása |
| `src/feltolto.ts` | a menet: célmappa, kihagyás, feltöltés, archiválás |
| `teszt/mock-masc.mjs` | elFinder-utánzó teszt-konnektor |

A tesztek soha nem nyúlnak a masc.hu-hoz. Helyette egy helyben futó
teszt-konnektor ellen mennek, amely az elFinder hash-számítását
(`l1_` + az útvonal base64-e, `+/=` helyett `-_.`) és hibaválaszait is
utánozza — így a protokoll éles hozzáférés nélkül is ellenőrizhető.

### Ami még nincs kipróbálva élesben

A program eddig **csak a teszt-konnektor ellen** futott: a fejlesztői környezet
hálózata nem éri el a masc.hu-t. A protokoll a dokumentált elFinder 2.1 szerint
készült, de az első éles futást érdemes `--proba` kapcsolóval kezdeni, és
egyetlen fájllal folytatni. Ami a valóságban eltérhet:

- a konnektor pontos címe (ezért kell kézzel megadni)
- az űrlapos belépés mezőnevei (ezért állíthatók)
- a MASC esetleges fájltípus- vagy méretkorlátai
