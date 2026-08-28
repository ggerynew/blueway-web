# Az amerikai indulás — cégadatok, dokumentumok, hatósági követelmények

Ez a jegyzet a `bluewaytrade.us` élesítéséhez készült. Két része van: mi hiányzik
a cégadatokból, és milyen dokumentumok kellenek egy amerikai weblaphoz.

> **Nem jogi tanácsadás.** A hivatkozott jogszabályokat és határidőket
> ellenőriztem és a forrást minden pontnál megadom, de az ÁSZF és az
> adatvédelmi tájékoztató végleges szövegét amerikai ügyvéddel, az adózási
> részt amerikai könyvelővel kell átnézetni. Az itt leírtak a **munka
> előkészítését** szolgálják: hogy tudjuk, mit kell kérdezni és mibe kerül.

---

## 1. A cégadatok — a CSC-kivonatból megerősítve (2026-08-28)

Gáspár átadta a CSC (Corporation Service Company) nyilvántartásának
Entity Summary lapját. Ez a korábbi feltevések egy részét megerősíti, egy
lényeges ponton viszont **felülírja: a cég nem pennsylvaniai, hanem
Delaware-i LLC.**

| adat | érték (a CSC-kivonatból) |
|---|---|
| Bejegyzett név | **Blueway Trade, LLC** (vesszővel) |
| Bejegyzés állama | **Delaware** |
| Alapítás dátuma | 2022. január 20. |
| Cégforma | Limited Liability Company |
| FEIN (szövetségi adószám) | 88-0880046 |
| Üzleti év vége | december 31. |
| Tevékenység | „solutions for label printing, laser marking, spares support and services" |
| Nyilvántartó / kapcsolt szolgáltató | CSC (a kivonat az ő entity-management portáljukról való — feltehetően ők a delaware-i registered agent is, ezt érdemes megerősíteni) |

A webkeresés közben megerősítette, hogy a régi `bluewaytrade.us` kapcsolat
oldala a **206 Hickory Lane, Douglassville, PA 19468** címet, a
`+1 310-957-1497` telefonszámot és a `bluewaytradeus@gmail.com` címet
hirdette. Vagyis az adat a cég saját, korábbi honlapjáról származik, nem a
kereső tévedése. Két dolog továbbra is tisztázandó, mielőtt közzétesszük:

1. **Az irányítószám**: Douglassville irányítószáma 19518, a 19468
   Royersford környéke. Valamelyik elem hibás volt a régi lapon is — a
   pontos, postailag helyes címet Gáspárnak kell megerősítenie.
2. **Douglassville nem Philadelphia** — negyven mérföldre északnyugatra van,
   Berks megyében. A korábbi „Philadelphia" iránymutatás és a tényleges cím
   ellentmond egymásnak, és ez pénzre fordul: a philadelphiai városi engedély
   és a városi nyereségadó CSAK városbeli tevékenységre jár (lásd a 3. pontot).

### Ami még hiányzik a weblaphoz

- a **Delaware file number** (a CSC-kivonat saját azonosítója — CSC Entity ID
  4308651 — nem azonos vele; a state file number a `icis.corp.delaware.gov`
  keresőben vagy a CSC-portálon látszik)
- a **közzéteendő üzleti cím** megerősítve, helyes irányítószámmal
- **regisztrált-e a cég Pennsylvaniában külföldi (foreign) LLC-ként?** Ha a
  telephely PA-ban van, ez kötelező (lásd a 2. pontot)
- amerikai **telefonszám** és **e-mail cím** véglegesen (a gmail.com nem
  szerencsés egy ipari beszállítónál — érdemes `@bluewaytrade.us` címet
  csinálni; a +1 310-es Los Angeles-i körzetszám egy PA-beli cégnél szintén
  kérdés)
- **PA sales tax license** száma, ha már megvan
- Az **EIN-t nem tesszük ki a weblapra** — az USA-ban nincs impresszum-
  kötelezettség, az adószámot csak W-9-en, számlán, vámpapíron kell megadni.

---

## 2. Cégszintű teendők — Delaware az anyaállam, Pennsylvania a telephely

A cég Delaware-ben van bejegyezve, a tevékenység viszont (a cím alapján)
Pennsylvaniában zajlik. Ez két államban ad éves teendőt:

### Delaware (a bejegyzés állama)

| teendő | részletek |
|---|---|
| **Éves LLC-adó (annual tax)** | **300 USD átalány, minden év június 1.** Nem függ a forgalomtól; késedelemnél 200 USD bírság + havi 1,5% kamat. LLC-nek éves jelentést Delaware-ben NEM kell beadnia — csak ezt az adót fizetni. |
| Registered agent | Delaware-i megbízott kötelező — a kivonat alapján ez a CSC, aminek éves díja van. |
| Certificate of Good Standing | ha bank, vevő vagy másik állam kéri, a CSC-n vagy a Division of Corporationsnél lekérhető. |

### Pennsylvania (a telephely állama)

| teendő | részletek |
|---|---|
| **Foreign registration** | Ha a tényleges telephely PA-ban van, a delaware-i LLC-nek PA-ban külföldi társaságként regisztrálnia kell (Foreign Registration Statement, DSCB:15-412, 250 USD egyszeri díj). **Tisztázandó, megtörtént-e.** |
| **Éves jelentés (Annual Report)** | **minden év szeptember 30.**, 7 USD — a PA-ban regisztrált külföldi LLC-kre is vonatkozik |
| PA sales tax license | tárgyi eszköz PA-beli értékesítéséhez |

**A PA éves jelentés új és fontos:** a 2022. évi 122. törvény váltotta le a
tízévenkénti bejelentést, 2025-től érvényes. A hivatal 2026-ig nem szab ki
késedelmi bírságot, **2027-től viszont** a határidő utáni hat hónapon belüli
mulasztás a regisztráció **hivatalból való megszüntetésével** jár. A naptárba
tehát két dátum kell: **június 1. (Delaware, 300 USD)** és — ha a PA-regisztráció
él — **szeptember 30. (Pennsylvania, 7 USD)**.

### FinCEN tényleges tulajdonosi bejelentés (BOI): NEM kell

Ez friss hír, és megspórol egy körös adminisztrációt. A FinCEN 2026. augusztus
14-én hatályba lépett végleges rendelete **véglegesen megszünteti** a Corporate
Transparency Act szerinti bejelentési kötelezettséget minden **Egyesült
Államokban alapított** társaságra — az LLC-kre is —, és a korábban beadott
adatokat törli az adatbázisból.

A CSC-kivonat ezt le is zárja: a Blueway Trade, LLC **delaware-i, tehát
amerikai alapítású** cég, vagyis a mentesség rá vonatkozik — FinCEN BOI-
bejelentés nem kell. (A kivonat CTA Classification és FinCEN ID mezője üres,
ami ezzel összhangban van.)

---

## 3. Cégszintű teendők — Philadelphia (csak ha a város érintett)

| teendő | részletek |
|---|---|
| **Commercial Activity License** | **Minden** vállalkozásnak kell, amely a városban üzletel — annak is, amelyik a városhatáron kívül ül, de Philadelphiába értékesít |
| **BIRT** (Business Income & Receipts Tax) | városi nyereség- és bevételi adó |
| Net Profits Tax | ha a tulajdonos philadelphiai jövedelmet szerez |
| Wage Tax | ha lesz alkalmazott |

**2026-tól itt is változott a helyzet:** a város **eltörölte a 100 000 dolláros
BIRT-mentességet**. A 2026-os adóévtől **minden** philadelphiai tevékenységű
vállalkozásnak be kell adnia a BIRT-bevallást, mérettől függetlenül. Aki
korábban a küszöb alatt volt, annak az első bevallásnál nem kell előleget
fizetnie, de a bevallás kötelező.

Ez az a pont, ahol a Douglassville / Philadelphia kérdés pénzre fordul. Ha a
tevékenység nem a városban zajlik, a fenti négy sorból egy sem jár. A most
megerősített cím (Douglassville, Berks megye) alapján ez a szakasz
**valószínűleg nem érinti a céget** — csak akkor válik élővé, ha ténylegesen
Philadelphiában is folyik tevékenység.

---

## 4. Dokumentumok a weblapra

### 4.1 Terms of Sale — nem a magyar ÁSZF fordítása

A magyar ÁSZF nem ültethető át. Más a jogrend: az árueladásra az Egyesült
Államokban a **UCC 2. cikke** vonatkozik (Pennsylvaniában: 13 Pa.C.S.), és
két dolog van, amit CSAK ez a dokumentum tud elvégezni:

- **Szavatosságkizárás.** A UCC alapból beleérti az eladhatósági
  (merchantability) szavatosságot minden kereskedő eladásába. Kizárni csak úgy
  lehet, ha a szöveg kimondja a „merchantability" szót, és **feltűnő**
  (conspicuous) — nagybetűvel vagy kiemelve. Aki ezt elrontja, teljes
  szavatosságot vállalt anélkül, hogy tudná.
- **Felelősségkorlátozás** — a közvetett és következményi károk kizárása.

Emellett ide való a szállítási feltétel (Incoterms), a fizetési határidő és
késedelmi kamat, a tulajdonjog-fenntartás, a visszaküldés rendje (B2B-ben
lehet szigorúbb, mint a fogyasztói), a jogvita fóruma és az alkalmazandó jog.

### 4.2 Privacy Policy — gyakorlatilag kötelező

Nem szövetségi törvény írja elő, hanem Kalifornia: a **CalOPPA**
(Cal. Bus. & Prof. Code §22575) minden kereskedelmi weblaptól megköveteli az
adatvédelmi tájékoztatót, amely kaliforniai lakostól személyes adatot gyűjt —
egy ajánlatkérő űrlap ilyen.

2026-ban **20 államnak** van átfogó adatvédelmi törvénye. A legtöbb küszöbhöz
köti a hatályt (jellemzően 25 millió dollár árbevétel vagy 100 000 fogyasztó),
amit egy induló forgalmazó nem ér el — **de nem mind:** Delaware, Montana és
Nevada küszöb nélküli, Texas pedig nem árbevételhez, hanem az SBA
kisvállalati definíciójához köti. Ezért a tájékoztatót nem az „elérjük-e a
küszöböt" alapján kell megírni, hanem egyszerűen rendesen.

### 4.3 Sütik — az amerikai modell más

Az USA-ban **értesítés és leiratkozás** a modell, nem előzetes hozzájárulás.
A meglévő EU-s süti-sávunk ennél többet tud, tehát megtartható — de a
szövegét át kell írni: a „GDPR szerinti jogalap" fordulat ott értelmetlen.

### 4.4 Ami még kell

- **CAN-SPAM** — minden kereskedelmi e-mailben fizikai postacím és működő
  leiratkozás. Ez az ajánlatküldésre is áll.
- **TCPA** — ha valaha SMS-t vagy automatizált hívást indítunk a megadott
  számra, ahhoz külön, kifejezett írásos hozzájárulás kell. Az űrlapon jelölni.
- **Akadálymentesség (ADA / WCAG 2.1 AA)** — ez a legvalóságosabb perkockázat
  egy amerikai weblapon; az ilyen keresetek száma évi több ezer. A weblap már
  átment egy akadálymentességi körön, tehát jó helyzetből indulunk; egy
  akadálymentességi nyilatkozat és egy bejelentési e-mail cím kell mellé.
- **FTC származási állítások** — „Made in USA" csak akkor írható, ha az; az
  importált árun a származási ország feltüntetése kötelező (19 U.S.C. §1304).

### 4.5 Ami NEM kell

- a magyar adatkezelési tájékoztató lefordítása (más jogrend)
- DMCA-ügynök bejelentése (nincs felhasználói tartalom)
- előzetes süti-hozzájárulás

---

## 5. A termékoldali rész — ez a nagyobb tétel

Lézerberendezést importálni és forgalmazni az USA-ban külön engedélyezési
rendszer alá esik, és ez a rész **nem a weblapról szól, hanem a működésről**.

### 5.1 FDA CDRH — lézertermékek

A sugárzó elektronikus termékek szabályozása (21 CFR 1040.10 és 1040.11) alá
minden lézertermék beletartozik. A gyakorlatban:

- a gyártónak **Product Reportot** kell benyújtania a CDRH-hoz, amiből a
  terméknek **accession number**e lesz;
- az importőr minden vámkezelésnél kitölti a **Form FDA 2877**-et
  („Declaration for Imported Electronic Products Subject to Radiation Control
  Standards"), és ezen hivatkozik az accession numberre;
- az importőr és az első forgalmazó **nyilvántartást vezet** és jelenti a
  hibákat (21 CFR 1002, 1003, 1004).

**Kérdés a cab felé, mielőtt bármi elindul:** megvan-e a XENO-sorozat és az LM+
accession numbere, és ki lesz az importőr of record. Ha a cab amerikai
leányvállalata (cab Technology, Inc., Chelmsford, MA) az importőr, a
teendőink egy része megszűnik — ezt a distributor szerződésben kell tisztázni.

### 5.2 FCC — ez már megvan

A cab XENO adatlapja kimondja: **„Approvals CE, FCC Class A"**. A Class A
digitális eszközökre a 47 CFR Part 15 Subpart B vonatkozik; a kötelező Class A
figyelmeztető szöveget a felhasználói kézikönyvben kell szerepeltetni.

### 5.3 NRTL (UL) — amiről a vevő kérdezni fog

A CE-jelölés az Egyesült Államokban nem helyettesíti az elektromos
biztonsági elfogadást. Az OSHA 1910.303 „acceptable" fogalma NRTL-listázott
(UL, Intertek, TÜV) vagy helyszínen bevizsgált (field labeling) berendezést
jelent. Egy német gépnél ez rendszerint helyszíni bevizsgálás, és ezt a
vevő üzembiztonsági felelőse kérni fogja. Érdemes előre tudni az árát.

### 5.4 A vevő oldalán: ANSI Z136.1

3B és 4 osztályú lézerhez az amerikai gyakorlat lézerbiztonsági felelőst (LSO)
és írott lézerbiztonsági programot kíván. Ez nekünk értékesítési érv is: erről
egy amerikai tudástár-cikk hasznosabb, mint bármilyen termékszöveg.

### 5.5 Egyéb

- **Prop 65** (Kalifornia): ha ragasztó, festékszalag vagy címkeanyag megy
  Kaliforniába, figyelmeztetés kellhet.
- **Vám**: EIN, importőri szám, HTS-besorolás, esetleg folyamatos
  vámbiztosíték (continuous bond), származási ország jelölése.
- **Forgalmi adó**: a *South Dakota v. Wayfair* utáni gazdasági jelenlét —
  államonként külön regisztráció, ha átlépjük a küszöböt.

---

## 6. Amit ez a weblapon jelent

És itt egy dolog egybeesik. A Search Console 2026 augusztusában jelezte, hogy
az `/us/` lapokat nem indexeli külön, mert 98,1%-ban azonosak az `/en/`
változattal — a különbség csak a brit és az amerikai írásmód. A fenti lista
viszont pont az, amitől az amerikai lapok **tartalmilag** különböznének:

- saját Terms of Sale és Privacy Policy (nem fordítás)
- amerikai elérhetőség és cégadatok a láblécben: „Blueway Trade, LLC",
  a megerősített cím, telefonszám, e-mail (az EIN nem oda való)
- hüvelyk és láb a metrikus adatok mellett
- FDA-, FCC- és NRTL-vonatkozások a lézerlapokon
- amerikai lézerbiztonsági (ANSI Z136.1) tudástár-cikk

Vagyis a jogi munka és az indexelési probléma ugyanaz a feladat. Ahogy az
amerikai tartalom elkészül, a párhuzamos-oldal jelzés magától megszűnik.

---

## Források

- FinCEN BOI végleges rendelet: [Treasury sajtóközlemény](https://home.treasury.gov/news/press-releases/sb0603) · [Sidley Austin elemzés](https://www.sidley.com/en/insights/newsupdates/2026/08/us-fincen-issues-final-rule-ending-beneficial-ownership-reporting-requirement) · [FinCEN BOI](https://www.fincen.gov/boi)
- Cégadatok: CSC Entity Summary kivonat, Gáspártól (2026-08-28) — Blueway
  Trade, LLC, Delaware, alapítva 2022-01-20, FEIN 88-0880046
- Delaware LLC éves adó: [Division of Corporations — Annual Report and Tax Instructions](https://corp.delaware.gov/paytaxes/) (300 USD, június 1., LLC-nek éves jelentés nincs)
- PA foreign registration: [PA Department of State — Foreign Associations](https://www.pa.gov/agencies/dos/programs/business/registration-forms) (DSCB:15-412)
- PA éves jelentés: [PA Department of State](https://www.pa.gov/agencies/dos/programs/business/types-of-filings-and-registrations/annual-reports)
- Philadelphia engedély és BIRT: [Commercial Activity License](https://www.phila.gov/services/permits-violations-licenses/get-a-license/business-licenses/activity/get-a-commercial-activity-license/) · [BIRT](https://www.phila.gov/services/payments-assistance-taxes/taxes/business-taxes/business-taxes-by-type/business-income-receipts-tax-birt/) · [a mentesség megszűnése](https://www.phila.gov/2025-08-05-city-of-philadelphia-clarifies-business-income-receipts-tax-birt-policy-to-ease-transition-for-businesses-impacted-by-the-exemption-change/)
- FDA lézer: [Importing Radiation-Emitting Electronic Products](https://www.fda.gov/industry/importing-fda-regulated-products/importing-radiation-emitting-electronic-products) · [Form FDA 2877](https://www.fda.gov/media/72236/download) · [Getting a Radiation Emitting Product to Market](https://www.fda.gov/radiation-emitting-products/electronic-product-radiation-control-program/getting-radiation-emitting-product-market-frequently-asked-questions)
- FCC Class A és a cab jóváhagyások: `public/datasheets/cab-laser-xeno.pdf`, 6. oldal („Approvals CE, FCC Class A")
