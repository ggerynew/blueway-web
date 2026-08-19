# Az amerikai indulás — cégadatok, dokumentumok, hatósági követelmények

Ez a jegyzet a `bluewaytrade.us` élesítéséhez készült. Két része van: mi hiányzik
a cégadatokból, és milyen dokumentumok kellenek egy amerikai weblaphoz.

> **Nem jogi tanácsadás.** A hivatkozott jogszabályokat és határidőket
> ellenőriztem és a forrást minden pontnál megadom, de az ÁSZF és az
> adatvédelmi tájékoztató végleges szövegét amerikai ügyvéddel, az adózási
> részt amerikai könyvelővel kell átnézetni. Az itt leírtak a **munka
> előkészítését** szolgálják: hogy tudjuk, mit kell kérdezni és mibe kerül.

---

## 1. A cégadatokat nem sikerült hitelesen lekérni

Megpróbáltam, és három forrás is zárva van ebből a környezetből:

| forrás | eredmény |
|---|---|
| Pennsylvania Department of State cégkereső (`file.dos.pa.gov`) | a kimenő forgalom szűrője blokkolja |
| OpenCorporates | blokkolva |
| `bluewaytrade.us` közvetlen lekérése | blokkolva |

A webkeresés visszaadott egy címet — 206 Hickory Lane, Douglassville, PA, egy
`+1 310-957-1497` telefonszámot és egy `bluewaytradeus@gmail.com` címet —, a
`bluewaytrade.us/contact` lapra hivatkozva. **Ezt nem írtam sehova, mert három
dolog nem stimmel benne:**

1. A mi átmeneti lapunk (`server/us-atmeneti/index.html`) egyetlen fájl, és nem
   tartalmaz sem címet, sem telefonszámot — csak az `info@blueway.hu`-t. Vagyis
   ez vagy egy régebbi, a domainen korábban élt lap gyorsítótárazott
   maradványa, vagy a kereső összefoglalójának tévedése.
2. Az irányítószám nem illik a településhez: Douglassville 19518, a 19468
   Royersford/Collegeville.
3. **Douglassville nem Philadelphia** — negyven mérföldre északnyugatra van,
   Berks megyében. Ez nem szőrszálhasogatás: a philadelphiai városi engedély és
   a városi nyereségadó CSAK akkor jár, ha a tevékenység a városban van (lásd a
   3. pontot). Pénzben mérhető a különbség.

### Amit kérek tőled, hogy a weblapra kerülhessen

A hiteles forrás a PA Department of State cégkeresője (ingyenes,
`file.dos.pa.gov/search/business`) — ott a cég neve alapján kijön a lap, és le
lehet tölteni a bejegyző okiratot. Ami a weblaphoz kell:

- a cég **pontos bejegyzett neve** (Blueway Trade LLC?)
- **PA entity number** (a cégkeresőben látszik)
- **bejegyzett székhely (registered office)** Pennsylvaniában — ez nyilvános adat
- a **közzéteendő üzleti cím**: Philadelphia vagy Douglassville?
- **EIN** (szövetségi adószám)
- amerikai **telefonszám** és **e-mail cím** (a gmail.com nem szerencsés egy
  ipari beszállítónál — érdemes `@bluewaytrade.us` címet csinálni)
- pennsylvaniai LLC-e, vagy máshol (Delaware, Wyoming) bejegyzett cég, amely PA-ban
  külföldiként regisztrált
- **PA sales tax license** száma, ha már megvan
- **Philadelphia Commercial Activity License** száma, ha a város érintett

---

## 2. Cégszintű teendők — Pennsylvania

| teendő | részletek |
|---|---|
| Certificate of Organization | DSCB:15-8821 nyomtatvány, PA Department of State |
| Bejegyzett iroda | PA-beli cím kell, vagy szolgáltató (CROP) |
| **Éves jelentés (Annual Report)** | **minden év szeptember 30.**, 7 USD |
| EIN | IRS SS-4 — bankszámlához, vámhoz, adózáshoz kell |
| PA sales tax license | tárgyi eszköz értékesítéséhez |

**Az éves jelentés új és fontos:** a 2022. évi 122. törvény váltotta le a
tízévenkénti bejelentést, 2025-től érvényes. A hivatal 2026-ig nem szab ki
késedelmi bírságot, **2027-től viszont** a határidő utáni hat hónapon belüli
mulasztás **hivatalból való megszüntetéssel** jár. Ezt naptárba kell tenni.

### FinCEN tényleges tulajdonosi bejelentés (BOI): NEM kell

Ez friss hír, és megspórol egy körös adminisztrációt. A FinCEN 2026. augusztus
14-én hatályba lépett végleges rendelete **véglegesen megszünteti** a Corporate
Transparency Act szerinti bejelentési kötelezettséget minden **Egyesült
Államokban alapított** társaságra — az LLC-kre is —, és a korábban beadott
adatokat törli az adatbázisból.

Egy dolgot érdemes tudni: a mentesség az **amerikai alapítású** cégeké. Ha a
`bluewaytrade.us` mögé nem új amerikai LLC kerülne, hanem a magyar Kft.
regisztrálna külföldi vállalkozásként, az más elbírálás alá esik.

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
tevékenység nem a városban zajlik, a fenti négy sorból egy sem jár.

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
- amerikai elérhetőség, cégadatok, EIN a láblécben
- hüvelyk és láb a metrikus adatok mellett
- FDA-, FCC- és NRTL-vonatkozások a lézerlapokon
- amerikai lézerbiztonsági (ANSI Z136.1) tudástár-cikk

Vagyis a jogi munka és az indexelési probléma ugyanaz a feladat. Ahogy az
amerikai tartalom elkészül, a párhuzamos-oldal jelzés magától megszűnik.

---

## Források

- FinCEN BOI végleges rendelet: [Treasury sajtóközlemény](https://home.treasury.gov/news/press-releases/sb0603) · [Sidley Austin elemzés](https://www.sidley.com/en/insights/newsupdates/2026/08/us-fincen-issues-final-rule-ending-beneficial-ownership-reporting-requirement) · [FinCEN BOI](https://www.fincen.gov/boi)
- PA éves jelentés: [PA Department of State](https://www.pa.gov/agencies/dos/programs/business/types-of-filings-and-registrations/annual-reports)
- Philadelphia engedély és BIRT: [Commercial Activity License](https://www.phila.gov/services/permits-violations-licenses/get-a-license/business-licenses/activity/get-a-commercial-activity-license/) · [BIRT](https://www.phila.gov/services/payments-assistance-taxes/taxes/business-taxes/business-taxes-by-type/business-income-receipts-tax-birt/) · [a mentesség megszűnése](https://www.phila.gov/2025-08-05-city-of-philadelphia-clarifies-business-income-receipts-tax-birt-policy-to-ease-transition-for-businesses-impacted-by-the-exemption-change/)
- FDA lézer: [Importing Radiation-Emitting Electronic Products](https://www.fda.gov/industry/importing-fda-regulated-products/importing-radiation-emitting-electronic-products) · [Form FDA 2877](https://www.fda.gov/media/72236/download) · [Getting a Radiation Emitting Product to Market](https://www.fda.gov/radiation-emitting-products/electronic-product-radiation-control-program/getting-radiation-emitting-product-market-frequently-asked-questions)
- FCC Class A és a cab jóváhagyások: `public/datasheets/cab-laser-xeno.pdf`, 6. oldal („Approvals CE, FCC Class A")
