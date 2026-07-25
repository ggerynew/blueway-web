import type { LocalizedText } from '@/lib/products';

export interface GuideSection {
  title: LocalizedText;
  paragraphs: LocalizedText[];
  bullets?: LocalizedText[];
}

export interface Guide {
  slug: string;
  title: LocalizedText;
  short: LocalizedText;
  lead: LocalizedText;
  sections: GuideSection[];
}

/**
 * Tudástár-cikkek. A festékszalag-ismertető a DNP hivatalos szalagválasztó
 * anyagai (Product Reference Guide, dnpribbons.com) alapján készült.
 */
export const guides: Guide[] = [
  {
    slug: 'festekszalag-valaszto',
    title: {
      hu: 'Festékszalag-választó: wax, wax-resin vagy resin?',
      en: 'Ribbon guide: wax, wax-resin or resin?',
    },
    short: {
      hu: 'Melyik termotranszfer szalag való a feladathoz? Ár, alapanyag és felhasználás egy ábrán.',
      en: 'Which thermal transfer ribbon fits the job? Price, substrate and application on one chart.',
    },
    lead: {
      hu: 'A termotranszfer nyomtatás minősége és tartóssága a címke alapanyagán és a festékszalagon múlik. A három szalagcsalád — wax, wax-resin és resin — egy skálán helyezkedik el: balról jobbra nő az ár és a tartósság, a papírtól a speciális műanyagokig.',
      en: 'The quality and durability of thermal transfer printing depend on the label material and the ribbon. The three ribbon families — wax, wax-resin and resin — sit on one scale: price and durability grow from left to right, from paper to specialty synthetics.',
    },
    sections: [
      {
        title: { hu: 'Wax — a gazdaságos alapszalag', en: 'Wax — the economical baseline' },
        paragraphs: [
          {
            hu: 'A viasz alapú festék a legkedvezőbb árú választás, és papír címkékhez való: a megolvadó viasz az egyenetlen, mattkasírozott vagy natúr (vellum) papír felületébe simul, így sötét, kontrasztos nyomatot ad. Nagy nyomtatási sebességet bír, viszont a nyomat dörzsölésre és vegyszerekre érzékenyebb.',
            en: 'Wax-based ink is the most affordable choice and is made for paper labels: the melting wax settles into the uneven surface of uncoated or matte-coated (vellum) paper, giving a dark, high-contrast print. It supports high print speeds, but the print is more sensitive to abrasion and chemicals.',
          },
        ],
        bullets: [
          { hu: 'Alapanyag: natúr és mattkasírozott papír, karton', en: 'Substrate: uncoated and matte-coated paper, cardboard' },
          { hu: 'Tipikus felhasználás: doboz- és szállítmánycímkék, logisztika, polccímkék, árazás', en: 'Typical use: box and shipping labels, logistics, shelf labels, pricing' },
          { hu: 'Élettartam-igény: órák–hetek, beltéri környezet', en: 'Durability need: hours to weeks, indoor environment' },
        ],
      },
      {
        title: { hu: 'Wax-resin — a sokoldalú középút', en: 'Wax-resin — the versatile middle ground' },
        paragraphs: [
          {
            hu: 'A viasz és műgyanta keveréke jobb dörzs- és maszatolásállóságot ad, és már a sima, fényes műnyomó papíron, valamint a gazdaságos műanyag fóliákon (PP, PE) is tartós nyomatot képez. A legtöbb termékcímkéhez ez a legjobb ár/érték arányú választás.',
            en: 'The blend of wax and resin offers better smear and scratch resistance, and prints durably on smooth glossy coated paper as well as economical synthetic films (PP, PE). For most product labels this is the best value choice.',
          },
        ],
        bullets: [
          { hu: 'Alapanyag: műnyomó és fényes papír, PP / PE fólia', en: 'Substrate: coated and glossy paper, PP / PE film' },
          { hu: 'Tipikus felhasználás: termék- és élelmiszercímkék, kozmetika, egészségügy, kertészet, kültéri raktári címkék', en: 'Typical use: product and food labels, cosmetics, healthcare, horticulture, outdoor warehouse labels' },
          { hu: 'Élettartam-igény: hónapok–évek, mérsékelt igénybevétel', en: 'Durability need: months to years, moderate exposure' },
        ],
      },
      {
        title: { hu: 'Resin — a legtartósabb megoldás', en: 'Resin — the most durable option' },
        paragraphs: [
          {
            hu: 'A tiszta műgyanta festék a legdrágább, cserébe hő-, vegyszer-, oldószer- és dörzsálló nyomatot ad a speciális műanyag alapanyagokon: PET (poliészter), poliimid, vinil, PVC. Olyan címkékhez való, amelyeknek az alkatrész teljes élettartama alatt olvashatónak kell maradniuk — akár olaj, üzemanyag, alkohol vagy tartós napfény mellett is. Vegyi anyagok jelölésénél a GHS / BS5609 tanúsított szalag-címke párosítás is követelmény lehet.',
            en: 'Pure resin ink is the most expensive, but in return it delivers heat-, chemical-, solvent- and abrasion-resistant print on specialty synthetics: PET (polyester), polyimide, vinyl, PVC. It suits labels that must stay readable for the whole life of a component — even with oil, fuel, alcohol or prolonged sunlight. For chemical labeling a GHS / BS5609 certified ribbon-label combination may be required.',
          },
        ],
        bullets: [
          { hu: 'Alapanyag: PET, poliimid, vinil, PVC és más műszaki fóliák', en: 'Substrate: PET, polyimide, vinyl, PVC and other technical films' },
          { hu: 'Tipikus felhasználás: autóipar, elektronika (NYÁK-címkék), vegyipar (GHS / BS5609), laboratórium, gyógyszeripar, kültéri eszközcímkék', en: 'Typical use: automotive, electronics (PCB labels), chemicals (GHS / BS5609), laboratory, pharma, outdoor asset labels' },
          { hu: 'Élettartam-igény: évek–évtizedek, extrém igénybevétel', en: 'Durability need: years to decades, extreme exposure' },
        ],
      },
      {
        title: { hu: 'Hogyan válasszunk?', en: 'How to choose?' },
        paragraphs: [
          {
            hu: 'Először a címke alapanyagát kell a feladathoz igazítani (megjelenés, tartósság, környezeti hatások), és ehhez választható a megfelelő szalag. Ökölszabály: amilyen igénybevételt a címkének ki kell bírnia, ugyanazt a nyomatnak is bírnia kell. Kérdés esetén segítünk a konkrét nyomtató–címke–szalag hármas összehangolásában — a legtöbb kombinációt teszteljük is.',
            en: 'First match the label substrate to the task (appearance, durability, environmental exposure), then pick the ribbon to suit it. Rule of thumb: whatever exposure the label must survive, the print must survive too. We are happy to help match the exact printer-label-ribbon combination — most combinations we also test.',
          },
        ],
      },
    ],
  },
  {
    slug: 'cimkeanyagok',
    title: {
      hu: 'Címkeanyagok és ragasztók: melyiket mikor?',
      en: 'Label materials and adhesives: which one and when?',
    },
    short: {
      hu: 'Papírtól a poliészterig, visszaszedhetőtől a mélyfagyasztós ragasztóig — áttekintő a címke felépítéséről.',
      en: 'From paper to polyester, removable to deep-freeze adhesives — an overview of label construction.',
    },
    lead: {
      hu: 'Egy öntapadós címke három rétegből áll: felső anyag (erre nyomtatunk), ragasztó és hordozó (liner). A megfelelő kombináció a felülettől, a hőmérséklettől és a címke élettartamától függ.',
      en: 'A self-adhesive label has three layers: face material (the printed layer), adhesive and liner. The right combination depends on the surface, the temperature and the label lifetime.',
    },
    sections: [
      {
        title: { hu: 'Felső anyagok (amire nyomtatunk)', en: 'Face materials (what we print on)' },
        paragraphs: [
          {
            hu: 'A leggyakoribb felső anyagok az ártól és a tartósságtól függően:',
            en: 'The most common face materials, by price and durability:',
          },
        ],
        bullets: [
          { hu: 'Natúr (vellum) papír — a gazdaságos alapválasztás logisztikai és irodai címkékhez, wax szalaggal', en: 'Uncoated (vellum) paper — the economical baseline for logistics and office labels, with wax ribbon' },
          { hu: 'Műnyomó (fényes) papír — szebb megjelenés termékcímkékhez, wax-resin szalaggal', en: 'Coated (glossy) paper — nicer look for product labels, with wax-resin ribbon' },
          { hu: 'PP (polipropilén) fólia — víz- és vegyszerálló, jó ár/érték; kozmetika, vegyi áru, kültér', en: 'PP (polypropylene) film — water- and chemical-resistant, good value; cosmetics, chemicals, outdoor' },
          { hu: 'PE (polietilén) fólia — rugalmas, gyűrhető felületekre (flakonok, tubusok)', en: 'PE (polyethylene) film — flexible, for squeezable surfaces (bottles, tubes)' },
          { hu: 'PET (poliészter) — méret- és hőstabil, resin szalaggal évtizedes élettartam; adattáblák, eszközcímkék, elektronika', en: 'PET (polyester) — dimensionally and thermally stable, decades of life with resin ribbon; rating plates, asset labels, electronics' },
          { hu: 'Speciális anyagok — poliimid (forrasztásálló NYÁK-címkék), textil, biztonsági (VOID) és roncsolódó anyagok', en: 'Specialty materials — polyimide (solder-resistant PCB labels), textile, security (VOID) and destructible stocks' },
        ],
      },
      {
        title: { hu: 'Ragasztótípusok', en: 'Adhesive types' },
        paragraphs: [
          {
            hu: 'A ragasztót a felülethez és a felragasztás hőmérsékletéhez kell választani — utólag már nehéz korrigálni:',
            en: 'Choose the adhesive for the surface and the application temperature — it is hard to correct afterwards:',
          },
        ],
        bullets: [
          { hu: 'Permanens — az általános választás: sima, tiszta felületen tartósan ragad', en: 'Permanent — the general choice: bonds durably to smooth, clean surfaces' },
          { hu: 'Erős (high-tack) — durva, poros vagy alacsony felületi energiájú felületekre (raklap, fa, egyes műanyagok)', en: 'High-tack — for rough, dusty or low-surface-energy surfaces (pallets, wood, certain plastics)' },
          { hu: 'Visszaszedhető (removable) — nyom nélkül eltávolítható: üveg, elektronika, akciós árjelzés', en: 'Removable — peels off without residue: glass, electronics, promotional pricing' },
          { hu: 'Hűtőházi — +5 °C körüli, nedves-hideg környezetben is ragad (friss élelmiszer, hűtött logisztika)', en: 'Chilled — bonds in damp, cold environments around +5 °C (fresh food, chilled logistics)' },
          { hu: 'Mélyfagyasztós (deep-freeze) — akár −40 °C-on is felragasztható és ott is tapad (fagyasztott élelmiszer, hűtőházak)', en: 'Deep-freeze — can be applied and holds down to −40 °C (frozen food, cold stores)' },
          { hu: 'Speciális ragasztók — nedves felületre tapadó, magas hőállóságú, illetve élelmiszer-közvetlen (ISEGA) minősítésű változatok', en: 'Specialty adhesives — wet-surface, high-temperature and direct food contact (ISEGA) certified variants' },
        ],
      },
      {
        title: { hu: 'Gyors párosító', en: 'Quick matcher' },
        paragraphs: [
          {
            hu: 'Néhány tipikus feladat és a bevált kombináció:',
            en: 'A few typical tasks and the proven combination:',
          },
        ],
        bullets: [
          { hu: 'Szállítmánycímke, csomagküldés → vellum papír + permanens ragasztó + wax szalag', en: 'Shipping label, parcels → vellum paper + permanent adhesive + wax ribbon' },
          { hu: 'Termékcímke polcra → műnyomó papír + permanens + wax-resin', en: 'Retail product label → coated paper + permanent + wax-resin' },
          { hu: 'Fagyasztott élelmiszer → papír vagy PP + mélyfagyasztós ragasztó + wax-resin', en: 'Frozen food → paper or PP + deep-freeze adhesive + wax-resin' },
          { hu: 'Vegyi áru (GHS) → PP/PE fólia + permanens + resin (BS5609 tanúsítással)', en: 'Chemicals (GHS) → PP/PE film + permanent + resin (BS5609 certified)' },
          { hu: 'Adattábla, elektronika → PET vagy poliimid + erős ragasztó + resin', en: 'Rating plate, electronics → PET or polyimide + high-tack adhesive + resin' },
          { hu: 'Akciós ár, üvegfelület → papír + visszaszedhető ragasztó + wax', en: 'Promotions, glass surfaces → paper + removable adhesive + wax' },
        ],
      },
      {
        title: { hu: 'Egyedi címkegyártás', en: 'Custom label production' },
        paragraphs: [
          {
            hu: 'Egyedi méretben, anyagból és kivitelben gyártunk címkét — a fenti kombinációkban segítünk választani, mintát is biztosítunk. Használja címke-ajánlatkérő űrlapunkat, ahol a méreteket ábra segíti.',
            en: 'We produce labels in custom sizes, materials and constructions — we help pick from the combinations above and provide samples. Use our label quote form, where a diagram helps with the dimensions.',
          },
        ],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
