import type { Locale } from './i18n';

export type LocalizedText = Record<Locale, string>;

export interface Category {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
}

export interface Product {
  slug: string;
  category: string;
  name: string;
  brand: string;
  short: LocalizedText;
  description: LocalizedText;
  features: LocalizedText[];
  /** Termékfotó a public mappán belül; ha hiányzik, placeholder jelenik meg. */
  image?: string;
  /** Letölthető adatlap (PDF) a public mappán belül. */
  datasheet?: string;
  /** YouTube videó azonosító (beágyazáshoz) */
  videoId?: string;
  /** GLB modell útvonala a public mappán belül */
  model3d?: string;
  /** true, amíg a 3D modell csak bemutató minta, nem a valós termék */
  model3dIsDemo?: boolean;
  /** Kapcsolódó applikátorok (pl. HERMES Q print & apply) */
  applicators?: Applicator[];
  /** Orientáció / kivitel bemutató blokk (pl. HERMES Q jobbos-balos) */
  orientation?: {
    image: string;
    title: LocalizedText;
    text: LocalizedText;
  };
}

export interface ApplicatorParam {
  label: LocalizedText;
  value: LocalizedText;
}

export interface Applicator {
  /** URL-slug az applikátor aloldalához */
  slug: string;
  image: string;
  name: LocalizedText;
  description: LocalizedText;
  /** Hosszabb ismertető az applikátor aloldalán */
  longDescription?: LocalizedText;
  /** Műszaki paraméterek táblázata */
  params?: ApplicatorParam[];
  /** YouTube videó azonosító (linkeléshez) */
  videoId?: string;
}

export interface Manufacturer {
  slug: string;
  /** A Product.brand mezővel egyező megjelenítendő név. */
  brand: string;
  name: string;
  /** Logó a public mappán belül; ha hiányzik, a név szövegként jelenik meg. */
  logo?: string;
  description: LocalizedText;
}

export const manufacturers: Manufacturer[] = [
  {
    slug: 'cab',
    brand: 'CAB',
    name: 'cab',
    logo: '/images/brand/cab-logo.png',
    description: {
      hu: 'Címkenyomtatók, print & apply rendszerek, címkeadagolók és gravírozó lézerek — német gyártás, az ipar minden területére.',
      en: 'Label printers, print & apply systems, label dispensers and marking lasers — German engineering for every area of industry.',
    },
  },
  {
    slug: 'postek',
    brand: 'POSTEK',
    name: 'POSTEK',
    logo: '/images/brand/postek-logo.png',
    description: {
      hu: 'Robusztus ipari és asztali címkenyomtatók egyszerű nyomtatási feladatoktól az RFID-címkézésig, kiváló ár-érték aránnyal.',
      en: 'Robust industrial and desktop label printers from simple printing tasks to RFID labeling, with excellent value for money.',
    },
  },
  {
    slug: 'tykma-electrox',
    brand: 'Tykma Electrox',
    name: 'TYKMA Electrox',
    logo: '/images/brand/tykma-logo.png',
    description: {
      hu: 'Ipari fiber-, CO₂- és UV-lézeres jelölő- és gravírozórendszerek több mint 60 év tapasztalattal — asztali gépektől az integrációs lézerekig.',
      en: 'Industrial fiber, CO₂ and UV laser marking and engraving systems with over 60 years of experience — from benchtop machines to integration lasers.',
    },
  },
  {
    slug: 'dnp',
    brand: 'DNP',
    name: 'DNP',
    logo: '/images/brand/dnp-logo.png',
    description: {
      hu: 'Prémium termotranszfer festékszalagok — wax, wax/resin és resin kivitelben, a világ egyik vezető gyártójától.',
      en: 'Premium thermal transfer ribbons — wax, wax/resin and resin, from one of the world’s leading manufacturers.',
    },
  },
  {
    slug: 'armor-iimak',
    brand: 'ARMOR-IIMAK',
    name: 'ARMOR-IIMAK',
    logo: '/images/brand/armor-iimak-logo.png',
    description: {
      hu: 'Termotranszfer festékszalagok flat-head és near-edge nyomtatókhoz — wax, wax/resin és resin családok.',
      en: 'Thermal transfer ribbons for flat-head and near-edge printers — wax, wax/resin and resin families.',
    },
  },
  {
    slug: 'start-international',
    brand: 'START International',
    name: 'START International',
    logo: '/images/brand/start-logo.jpg',
    description: {
      hu: 'Elektromos, automata címkeadagoló és szalagadagoló gépek ipari felhasználásra — amerikai gyártás, robusztus fémfelépítéssel.',
      en: 'Electric, automatic label and tape dispensers for industrial use — US-made, with robust metal construction.',
    },
  },
];

export const categories: Category[] = [
  {
    slug: 'cimkenyomtatok',
    name: { hu: 'Címkenyomtatók', en: 'Label printers' },
    description: {
      hu: 'Asztali és ipari vonalkódnyomtatók különböző méretekben és kijelzőkkel.',
      en: 'Desktop and industrial barcode printers in various sizes and display options.',
    },
  },
  {
    slug: 'cimkezo-gepek',
    name: { hu: 'Címkéző gépek', en: 'Labeling machines' },
    description: {
      hu: 'Nyomtató-felrakó kombinációk és automata pneumatikus címkéző egységek.',
      en: 'Print-and-apply combinations and automatic pneumatic labeling units.',
    },
  },
  {
    slug: 'cimke-adagolo-gepek',
    name: { hu: 'Címke adagoló gépek', en: 'Label dispensers' },
    description: {
      hu: 'Automata címkeadagolás és -vágás, különböző kapacitásokkal.',
      en: 'Automatic label dispensing and cutting with various capacities.',
    },
  },
  {
    slug: 'lezer-gravirozok',
    name: { hu: 'Lézer gravírozók', en: 'Laser engravers' },
    description: {
      hu: 'Fém és műanyag jelölésére alkalmas lézerek, kompakt jelölőállomások.',
      en: 'Lasers for marking metal and plastic, compact marking stations.',
    },
  },
  {
    slug: 'szoftverek',
    name: { hu: 'Szoftverek', en: 'Software' },
    description: {
      hu: 'Címketervező és -nyomtató szoftverek, valamint egyedi fejlesztések.',
      en: 'Label design and printing software, plus custom development.',
    },
  },
  {
    slug: 'cimkek-es-festekszalagok',
    name: { hu: 'Címkék és festékszalagok', en: 'Labels and ribbons' },
    description: {
      hu: 'Papír, hőpapír és műanyag alapanyagok, többféle ragasztóval; festékszalag minden nyomtatótípushoz.',
      en: 'Paper, thermal paper and plastic materials with various adhesives; ribbons for every printer type.',
    },
  },
  {
    slug: 'ragaszto-adagolok',
    name: { hu: 'Ragasztó adagolók', en: 'Tape dispensers' },
    description: {
      hu: 'Szalagadagoló berendezések ipari felhasználásra.',
      en: 'Tape dispensing equipment for industrial use.',
    },
  },
];

export const products: Product[] = [
  {
    slug: 'cab-squix-4',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 4',
    brand: 'CAB',
    short: {
      hu: 'Ipari címkenyomtató 4"-es fejjel, robusztus alumínium vázzal.',
      en: 'Industrial label printer with a 4" head and robust aluminium chassis.',
    },
    description: {
      hu: 'A SQUIX 4 a cab ipari címkenyomtatóinak zászlóshajója: nagy mennyiségű, folyamatos nyomtatásra tervezték. Robusztus alumínium váz, intuitív kezelőfelület, és széles tartozékpaletta — vágó, adagoló, visszatekercselő.',
      en: 'The SQUIX 4 is the flagship of cab industrial label printers, designed for continuous, high-volume printing. Robust aluminium chassis, intuitive operation and a wide range of accessories — cutter, dispenser, rewinder.',
    },
    features: [
      { hu: '4" (105,7 mm) nyomtatási szélesség', en: '4" (105.7 mm) print width' },
      { hu: '300 / 600 dpi felbontás', en: '300 / 600 dpi resolution' },
      { hu: 'Robusztus alumínium váz', en: 'Robust aluminium chassis' },
      { hu: 'Ethernet, USB, RS-232, opcionális Wi-Fi', en: 'Ethernet, USB, RS-232, optional Wi-Fi' },
      { hu: 'Vágó, adagoló és visszatekercselő opciók', en: 'Cutter, dispenser and rewinder options' },
    ],
    image: '/images/products/cab-squix-4.png',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
  },
  {
    slug: 'cab-squix-2',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 2',
    brand: 'CAB',
    short: {
      hu: 'Ipari, keskeny, 2"-es nyomtatófejjel rendelkező modell nagy mennyiségű nyomtatásra.',
      en: 'Narrow industrial model with a 2" printhead for high-volume printing.',
    },
    description: {
      hu: 'A SQUIX 2 a keskeny címkék specialistája: ipari megbízhatóság kis címkeméretekhez, a SQUIX család minden előnyével.',
      en: 'The SQUIX 2 specialises in narrow labels: industrial reliability for small label sizes, with all the benefits of the SQUIX family.',
    },
    features: [
      { hu: '2" nyomtatási szélesség', en: '2" print width' },
      { hu: 'Ipari kivitel folyamatos üzemre', en: 'Industrial build for continuous operation' },
      { hu: 'SQUIX elektronika és kezelőfelület', en: 'SQUIX electronics and interface' },
    ],
    image: '/images/products/cab-squix-2.png',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
  },
  {
    slug: 'cab-eos2',
    category: 'cimkenyomtatok',
    name: 'CAB EOS2',
    brand: 'CAB',
    short: {
      hu: 'Asztali vonalkódnyomtató tetszetős kivitelben — ügyfélszolgálatokra is.',
      en: 'Desktop barcode printer with an attractive design — suitable for front-office use.',
    },
    description: {
      hu: 'Az EOS2 kompakt asztali nyomtató, amely a megbízható címkenyomtatást magas kezelési komforttal ötvözi. Formatervezése miatt ügyféltérben is megállja a helyét.',
      en: 'The EOS2 is a compact desktop printer combining reliable label printing with high operating comfort. Its design makes it a good fit even in customer-facing areas.',
    },
    features: [
      { hu: 'Kompakt asztali kivitel', en: 'Compact desktop format' },
      { hu: 'Érintőkijelzős kezelés', en: 'Touchscreen operation' },
      { hu: 'Egyszerű anyagbefűzés', en: 'Easy media loading' },
    ],
    image: '/images/products/cab-eos2.png',
    datasheet: '/datasheets/cab-eos.pdf',
    videoId: 'mFCv2GaNkg0',
  },
  {
    slug: 'cab-eos5',
    category: 'cimkenyomtatok',
    name: 'CAB EOS5',
    brand: 'CAB',
    short: {
      hu: 'Asztali vonalkódnyomtató nagyméretű címketekercsekhez is.',
      en: 'Desktop barcode printer that also takes large label rolls.',
    },
    description: {
      hu: 'Az EOS5 az EOS2 nagyobb testvére: ugyanaz a kezelési komfort, de nagyméretű, 200 mm átmérőjű címketekercsekkel is használható.',
      en: 'The EOS5 is the bigger sibling of the EOS2: the same operating comfort, but it also accepts large, 200 mm diameter label rolls.',
    },
    features: [
      { hu: '200 mm tekercsátmérőig', en: 'Roll diameter up to 200 mm' },
      { hu: 'Érintőkijelzős kezelés', en: 'Touchscreen operation' },
      { hu: 'Asztali kivitel nagy kapacitással', en: 'Desktop format with high capacity' },
    ],
    image: '/images/products/cab-eos5.png',
    datasheet: '/datasheets/cab-eos.pdf',
    videoId: 'mFCv2GaNkg0',
  },
  {
    slug: 'cab-mach1',
    category: 'cimkenyomtatok',
    name: 'CAB MACH1',
    brand: 'CAB',
    short: {
      hu: 'Egyszerű, könnyen kezelhető vonalkódnyomtató kisebb feladatokhoz.',
      en: 'Simple, easy-to-use barcode printer for smaller jobs.',
    },
    description: {
      hu: 'A MACH1 belépő szintű nyomtató kisebb nyomtatási feladatokhoz — egyszerű, megbízható, könnyen kezelhető.',
      en: 'The MACH1 is an entry-level printer for smaller printing tasks — simple, reliable and easy to operate.',
    },
    features: [
      { hu: 'Belépő szintű, kompakt modell', en: 'Entry-level compact model' },
      { hu: 'Egyszerű kezelés', en: 'Simple operation' },
    ],
    image: '/images/products/cab-mach1.png',
    datasheet: '/datasheets/cab-mach12.pdf',
  },
  {
    slug: 'cab-mach2',
    category: 'cimkenyomtatok',
    name: 'CAB MACH2',
    brand: 'CAB',
    short: {
      hu: 'Kisebb feladatokhoz, kijelzővel és egyszerű memóriakezeléssel.',
      en: 'For smaller jobs, with a display and simple memory handling.',
    },
    description: {
      hu: 'A MACH2 a MACH1 kijelzővel szerelt változata: állapotinformációk és memóriakezelés közvetlenül a nyomtatón.',
      en: 'The MACH2 is the display-equipped variant of the MACH1: status information and memory handling directly on the printer.',
    },
    features: [
      { hu: 'Kijelzővel szerelt kivitel', en: 'Equipped with a display' },
      { hu: 'Memóriakezelés a nyomtatón', en: 'On-printer memory handling' },
    ],
    image: '/images/products/cab-mach2.png',
    datasheet: '/datasheets/cab-mach12.pdf',
  },
  {
    slug: 'cab-mach4s',
    category: 'cimkenyomtatok',
    name: 'CAB MACH4S',
    brand: 'CAB',
    short: {
      hu: 'Asztali modell nagyobb nyomtatási feladatokhoz, SQUIX elektronikával.',
      en: 'Desktop model for larger printing jobs, with SQUIX electronics.',
    },
    description: {
      hu: 'A MACH4S asztali méretben hozza az ipari SQUIX elektronikát és kezelőfelületet — nagyobb feladatokhoz is elegendő teljesítménnyel.',
      en: 'The MACH4S brings the industrial SQUIX electronics and interface in a desktop size — with enough performance for larger jobs.',
    },
    features: [
      { hu: 'SQUIX elektronika és kezelőfelület', en: 'SQUIX electronics and interface' },
      { hu: 'Asztali méret, ipari tudás', en: 'Desktop size, industrial capability' },
    ],
    image: '/images/products/cab-mach4s.png',
    datasheet: '/datasheets/cab-mach4s.pdf',
  },
  {
    slug: 'cab-xc4',
    category: 'cimkenyomtatok',
    name: 'CAB XC4',
    brand: 'CAB',
    short: {
      hu: 'Kétszínű nyomtatás 4"-es fejjel — GHS veszélyesanyag-címkékhez.',
      en: 'Two-colour printing with a 4" head — for GHS hazard labels.',
    },
    description: {
      hu: 'Az XC4 két nyomtatófejjel egy menetben nyomtat kétszínű címkéket — kifejezetten a GHS veszélyesanyag-jelölésekhez fejlesztve.',
      en: 'The XC4 prints two-colour labels in a single pass with two printheads — developed specifically for GHS hazard labeling.',
    },
    features: [
      { hu: 'Kétszínű nyomtatás egy menetben', en: 'Two-colour printing in one pass' },
      { hu: '4" nyomtatási szélesség', en: '4" print width' },
      { hu: 'GHS-megfelelő címkézés', en: 'GHS-compliant labeling' },
    ],
    image: '/images/products/cab-xc4.png',
    datasheet: '/datasheets/cab-xcq.pdf',
    videoId: 'xqlxvt3fOX4',
  },
  {
    slug: 'cab-xc6',
    category: 'cimkenyomtatok',
    name: 'CAB XC6',
    brand: 'CAB',
    short: {
      hu: 'Kétszínű nyomtatás 6"-es fejjel — GHS veszélyesanyag-címkékhez.',
      en: 'Two-colour printing with a 6" head — for GHS hazard labels.',
    },
    description: {
      hu: 'Az XC6 az XC4 szélesebb változata: 6"-es fejekkel nagyobb méretű kétszínű GHS címkék nyomtatására is alkalmas.',
      en: 'The XC6 is the wider variant of the XC4: with 6" heads it prints larger two-colour GHS labels.',
    },
    features: [
      { hu: 'Kétszínű nyomtatás egy menetben', en: 'Two-colour printing in one pass' },
      { hu: '6" nyomtatási szélesség', en: '6" print width' },
      { hu: 'GHS-megfelelő címkézés', en: 'GHS-compliant labeling' },
    ],
    image: '/images/products/cab-xc6.png',
    datasheet: '/datasheets/cab-xcq.pdf',
    videoId: 'xqlxvt3fOX4',
  },

  // ——— CAB — további címkenyomtatók ———
  {
    slug: 'cab-squix-6',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 6.3',
    brand: 'CAB',
    image: '/images/products/cab-squix-6.png',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
    short: {
      hu: 'Ipari címkenyomtató 6"-es fejjel, széles címkékhez és nagy mennyiséghez.',
      en: 'Industrial label printer with a 6" head for wide labels and high volumes.',
    },
    description: {
      hu: 'A SQUIX 6.3 a SQUIX család legszélesebb ipari tagja: 6" (168,9 mm) nyomtatási szélesség, robusztus alumínium váz és a teljes SQUIX tartozékpaletta a nagy formátumú, folyamatos nyomtatáshoz.',
      en: 'The SQUIX 6.3 is the widest industrial member of the SQUIX family: 6" (168.9 mm) print width, a robust aluminium chassis and the full SQUIX range of accessories for large-format, continuous printing.',
    },
    features: [
      { hu: '6" (168,9 mm) nyomtatási szélesség', en: '6" (168.9 mm) print width' },
      { hu: '300 dpi felbontás', en: '300 dpi resolution' },
      { hu: 'Robusztus alumínium váz', en: 'Robust aluminium chassis' },
      { hu: 'Vágó, adagoló és visszatekercselő opciók', en: 'Cutter, dispenser and rewinder options' },
    ],
  },
  {
    slug: 'cab-squix-4m',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 4 M',
    brand: 'CAB',
    image: '/images/products/cab-squix-4m.png',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
    short: {
      hu: 'Ipari nyomtató kifejezetten apró címkékhez és keskeny, végtelenített anyagokhoz.',
      en: 'Industrial printer specifically for very small labels and slim continuous materials.',
    },
    description: {
      hu: 'A SQUIX 4 M-et a nagyon kicsi címkék és keskeny, végtelenített anyagok precíz nyomtatására fejlesztették — pontos anyagvezetés és a SQUIX ipari megbízhatósága.',
      en: 'The SQUIX 4 M is developed for precise printing of very small labels and slim continuous materials — accurate media guidance with SQUIX industrial reliability.',
    },
    features: [
      { hu: 'Apró címkékhez és keskeny anyagokhoz', en: 'For small labels and slim media' },
      { hu: 'Pontos anyagvezetés', en: 'Precise media guidance' },
      { hu: '300 / 600 dpi felbontás', en: '300 / 600 dpi resolution' },
      { hu: 'SQUIX elektronika', en: 'SQUIX electronics' },
    ],
  },
  {
    slug: 'cab-squix-4mt',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 4 MT',
    brand: 'CAB',
    image: '/images/products/cab-squix-4mt.png',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
    short: {
      hu: 'Ipari nyomtató textil alapanyagokhoz — mosás- és varrócímkékhez.',
      en: 'Industrial printer for textile materials — wash-care and sewn-in labels.',
    },
    description: {
      hu: 'A SQUIX 4 MT textilszalagok és mosáscímkék nyomtatására optimalizált változat, a textiliparra szabott anyagkezeléssel.',
      en: 'The SQUIX 4 MT is optimised for printing textile ribbons and wash-care labels, with media handling tailored to the textile industry.',
    },
    features: [
      { hu: 'Textilszalag és mosáscímke', en: 'Textile ribbons & wash-care labels' },
      { hu: 'Textilre hangolt anyagkezelés', en: 'Textile-tuned media handling' },
      { hu: '300 dpi felbontás', en: '300 dpi resolution' },
      { hu: 'SQUIX platform', en: 'SQUIX platform' },
    ],
  },
  {
    slug: 'cab-xd-q',
    category: 'cimkenyomtatok',
    name: 'CAB XD Q',
    brand: 'CAB',
    image: '/images/products/cab-xd-q.png',
    datasheet: '/datasheets/cab-xdq.pdf',
    short: {
      hu: 'Kétoldalas nyomtatás egy menetben — függőcímkékhez és flexibilis anyagokhoz.',
      en: 'Double-sided printing in a single pass — for tags and flexible materials.',
    },
    description: {
      hu: 'Az XD Q két nyomtatófejjel egyszerre nyomtatja a hordozó mindkét oldalát — ideális kétoldalas függőcímkékhez és flexibilis anyagokhoz, 4" és 6" szélességben.',
      en: 'The XD Q prints both sides of the web simultaneously with two printheads — ideal for double-sided tags and flexible materials, in 4" and 6" widths.',
    },
    features: [
      { hu: 'Kétoldalas nyomtatás egy menetben', en: 'Double-sided printing in one pass' },
      { hu: '4" és 6" szélesség', en: '4" and 6" widths' },
      { hu: 'Két nyomtatófej', en: 'Two printheads' },
      { hu: 'SQUIX elektronika', en: 'SQUIX electronics' },
    ],
  },

  // ——— CAB — Print & apply (címkéző gépek) ———
  {
    slug: 'cab-hermes-q',
    category: 'cimkezo-gepek',
    name: 'CAB HERMES Q',
    brand: 'CAB',
    image: '/images/products/cab-hermes-q.png',
    datasheet: '/datasheets/cab-hermes-q.pdf',
    videoId: 'HG9eudLWxfM',
    short: {
      hu: 'Print & apply rendszer gyártósorra — pontos címkefelhelyezés valós időben.',
      en: 'Print & apply system for production lines — precise real-time label application.',
    },
    description: {
      hu: 'A HERMES Q print & apply rendszer a legújabb cab nyomtatógeneráció elektronikájára épül: nagy teljesítményű CPU és pontos címkefelhelyezés hengeres, ferde vagy íves felületekre roll-on, blow-on vagy tamp-on applikátorral.',
      en: 'The HERMES Q print & apply system is built on the electronics of the latest cab printer generation: a powerful CPU and precise label application onto cylindrical, oblique or curved surfaces with roll-on, blow-on or tamp-on applicators.',
    },
    features: [
      { hu: 'Valós idejű print & apply', en: 'Real-time print & apply' },
      { hu: 'Roll-on / blow-on / tamp-on applikátorok', en: 'Roll-on / blow-on / tamp-on applicators' },
      { hu: 'Bal és jobb kivitel', en: 'Left and right versions' },
      { hu: 'Gyártósori integráció', en: 'Production-line integration' },
    ],
    orientation: {
      image: '/images/applicators/hermes-q-left-right.jpg',
      title: { hu: 'Két orientáció, három nyomtatófej-szélesség', en: 'Two orientations, three printhead widths' },
      text: {
        hu: 'A HERMES Q két kivitelben érhető el — jobbos (right) és balos (left) orientációban —, így bármelyik oldalról beépíthető a gyártósorba. A nyomtató modulok 2, 4 és 6 coll széles nyomtatófejjel rendelhetők.',
        en: 'The HERMES Q is available in two versions — right-hand and left-hand orientation — so it can be integrated into a production line from either side. The printer modules are available with 2", 4" and 6" wide printheads.',
      },
    },
    applicators: [
      {
        slug: 'hq-3014',
        image: '/images/applicators/hq-3014.jpg',
        name: { hu: '3014/3016 Karos felrakó', en: '3014/3016 Arm applicator' },
        description: {
          hu: 'Nagyobb címkékhez, termék elejének, oldalának, vagy hátának címkézése.',
          en: 'For larger labels — labeling the front, side or back of the product.',
        },
        longDescription: {
          hu: 'Címkék valós idejű felhelyezése felülről vagy oldalról mozgásban lévő csomagokra — jellemzően a csomag elejére vagy hátuljára. A párna a lehúzóél előtt veszi fel a nyomtatás közben készülő címkét, majd a forgó kar 0–90°-ban a termékre viszi.',
          en: 'Applies labels in real time from the top or side onto packages in motion — preferably to the front or back of a package. The pad picks up the label while it is printed, and the pivot arm transfers it to the product at 0–90°.',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width' }, value: { hu: '25–174 mm', en: '25–174 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height' }, value: { hu: '8–250 mm', en: '8–250 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state' }, value: { hu: 'mozgásban vagy álló', en: 'in motion or at rest' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction' }, value: { hu: 'felülről, oldalról, elölről, hátulról', en: 'from top, side, front, back' } },
          { label: { hu: 'Csomagmagasság', en: 'Package height' }, value: { hu: 'változó', en: 'variable' } },
          { label: { hu: 'Karhossz', en: 'Pivot arm length' }, value: { hu: '200–600 mm', en: '200–600 mm' } },
          { label: { hu: 'Elfordulási szög', en: 'Pivot angle' }, value: { hu: '0–90°', en: '0–90°' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate' }, value: { hu: '~15 címke/perc', en: '~15 labels/min' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air' }, value: { hu: '4,5 bar', en: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption' }, value: { hu: 'max. 15 W', en: 'max. 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight' }, value: { hu: '9–12 kg', en: '9–12 kg' } },
        ],
      },
      {
        slug: 'hq-4014',
        image: '/images/applicators/hq-4014.jpg',
        name: { hu: '4014 Stroke applikátor', en: '4014 Stroke applicator' },
        description: {
          hu: 'Egyszerű címkézéshez.',
          en: 'For simple labeling.',
        },
        longDescription: {
          hu: 'Címkék valós idejű felhelyezése minden oldalról csomagokra. A párna típusa határozza meg, hogy a csomag álljon-e vagy mozgásban is címkézhető. A lökethenger hossza adja meg a csomag és a lehúzóél közötti maximális távolságot.',
          en: 'Applies labels in real time from all sides onto packages. The type of pad defines whether a package has to be at rest or can be in motion. The stroke cylinder length defines the maximum distance between the package and the peel-off plate.',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width' }, value: { hu: '20–174 mm', en: '20–174 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height' }, value: { hu: '20–210 mm', en: '20–210 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state' }, value: { hu: 'álló (párnától függően mozgásban)', en: 'at rest (in motion depending on pad)' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction' }, value: { hu: 'felülről, alulról, oldalról', en: 'from top, below, side' } },
          { label: { hu: 'Csomagmagasság', en: 'Package height' }, value: { hu: 'változó', en: 'variable' } },
          { label: { hu: 'Termék távolsága az egység aljától', en: 'Distance to bottom of unit' }, value: { hu: 'max. 130–530 mm', en: 'up to 130–530 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate' }, value: { hu: '~25 címke/perc', en: '~25 labels/min' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air' }, value: { hu: '4,5 bar', en: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption' }, value: { hu: 'max. 15 W', en: 'max. 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight' }, value: { hu: '5–9,5 kg', en: '5–9.5 kg' } },
        ],
      },
      {
        slug: 'hq-4114',
        image: '/images/applicators/hq-4114.jpg',
        name: { hu: '4114 Stroke applikátor', en: '4114 Stroke applicator' },
        description: {
          hu: 'Nagy pontosságú címkézés kis címkékhez (min. 4x4mm).',
          en: 'High-precision labeling for small labels (min. 4x4 mm).',
        },
        longDescription: {
          hu: 'Kis és közepes címkék valós idejű felhelyezése minden oldalról. A párna a lehúzóél előtt veszi fel a nyomtatás közben készülő címkét, majd rövid löketű henger viszi vízszintesen pozícióba. Formapárnával hengeres és íves felületekre is.',
          en: 'Applies very small and midsized labels in real time from all sides. The pad picks up the label while it is printed and a short stroke cylinder brings it into position horizontally. With a form pad it labels cylindrical and curved surfaces too.',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width' }, value: { hu: '10–174 mm', en: '10–174 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height' }, value: { hu: '8–80 mm', en: '8–80 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state' }, value: { hu: 'álló', en: 'at rest' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction' }, value: { hu: 'felülről, alulról, oldalról', en: 'from top, below, side' } },
          { label: { hu: 'Termékmagasság', en: 'Product height' }, value: { hu: 'változó', en: 'variable' } },
          { label: { hu: 'Termék távolsága az egység aljától', en: 'Distance to bottom of unit' }, value: { hu: 'max. 135–535 mm', en: 'up to 135–535 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate' }, value: { hu: '~20 címke/perc', en: '~20 labels/min' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air' }, value: { hu: '4,5 bar', en: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption' }, value: { hu: 'max. 15 W', en: 'max. 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight' }, value: { hu: '5–9 kg', en: '5–9 kg' } },
        ],
        videoId: 'P-9HXQJ-Lds',
      },
      {
        slug: 'hq-4214',
        image: '/images/applicators/hq-4214.jpg',
        name: { hu: '4214 Stroke turn applikátor', en: '4214 Stroke turn applicator' },
        description: {
          hu: 'Kis címkék minden oldalról, nehezen beépíthető helyeken is.',
          en: 'Small labels from all sides, also in hard-to-install positions.',
        },
        longDescription: {
          hu: 'Nagyon kis vagy közepes címkék valós idejű felhelyezése minden oldalról, ahol az egység nehezen építhető be. A párnát forgóhenger vízszintesen legfeljebb 180°-ban a felhelyezési síkba fordítja, majd a lökethenger a termékre viszi a címkét.',
          en: 'Applies very small or midsized labels in real time from all sides where the unit is difficult to install. A rotary cylinder pivots the pad by up to 180° horizontally into the application plane, then a stroke cylinder transfers the label to the product.',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width' }, value: { hu: '4–80 mm', en: '4–80 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height' }, value: { hu: '4–40 mm', en: '4–40 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state' }, value: { hu: 'álló (fújópárnával mozgásban)', en: 'at rest (in motion with blow-on pad)' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction' }, value: { hu: 'felülről, alulról, oldalról', en: 'from top, below, side' } },
          { label: { hu: 'Vízszintes elfordulás', en: 'Horizontal rotation' }, value: { hu: '90°, 0° (180° max. 15 mm magas címkénél)', en: '90°, 0° (180° for labels up to 15 mm high)' } },
          { label: { hu: 'Termék távolsága az egység aljától', en: 'Distance to bottom of unit' }, value: { hu: 'max. 135–335 mm', en: 'up to 135–335 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate' }, value: { hu: '~20 címke/perc', en: '~20 labels/min' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air' }, value: { hu: '4,5 bar', en: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption' }, value: { hu: 'max. 15 W', en: 'max. 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight' }, value: { hu: '5–7,5 kg', en: '5–7.5 kg' } },
        ],
        videoId: '0QethJtANc0',
      },
      {
        slug: 'hq-4414',
        image: '/images/applicators/hq-4414.jpg',
        name: { hu: '4414 Stroke applikátor', en: '4414 Stroke applicator' },
        description: {
          hu: 'Kis és közepes címkék minden oldalról, x-y irányban állítható pozícióval.',
          en: 'Small and midsized labels from all sides, with an x-y adjustable position.',
        },
        longDescription: {
          hu: 'Nagyon kis és közepes címkék valós idejű felhelyezése minden oldalról. A felhelyezési pozíció x és y irányban is finoman állítható. A párnát két rövid löketű henger viszi pontosan a helyére, majd a lökethenger a termékre helyezi a címkét.',
          en: 'Applies very small and midsized labels in real time from all sides. The application position is finely adjustable in both x and y directions. Two short stroke cylinders bring the pad exactly into position, then a stroke cylinder places the label on the product.',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width' }, value: { hu: '4–114 mm', en: '4–114 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height' }, value: { hu: '4–80 mm', en: '4–80 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state' }, value: { hu: 'álló', en: 'at rest' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction' }, value: { hu: 'felülről, alulról, oldalról', en: 'from top, below, side' } },
          { label: { hu: 'Termékmagasság', en: 'Product height' }, value: { hu: 'változó', en: 'variable' } },
          { label: { hu: 'Pozícióállítás (x / y)', en: 'Position adjustment (x / y)' }, value: { hu: 'x 3–7 mm, y 11–15 mm', en: 'x 3–7 mm, y 11–15 mm' } },
          { label: { hu: 'Termék távolsága az egység aljától', en: 'Distance to bottom of unit' }, value: { hu: 'max. 135–335 mm', en: 'up to 135–335 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate' }, value: { hu: '~25 címke/perc', en: '~25 labels/min' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air' }, value: { hu: '4,5 bar', en: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption' }, value: { hu: 'max. 15 W', en: 'max. 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight' }, value: { hu: '5–6 kg', en: '5–6 kg' } },
        ],
      },
      {
        slug: 'hq-4714',
        image: '/images/applicators/hq-4714.jpg',
        name: { hu: '4714 Zászló címkéző', en: '4714 Flag applicator' },
        description: {
          hu: 'Kábelek címkézése nagy pontossággal.',
          en: 'High-precision labeling of cables.',
        },
        longDescription: {
          hu: 'Címkék valós idejű, pontos felhelyezése kerek anyagokra — kábelekre, tömlőkre, csövekre. A párna felveszi a nyomtatás közben készülő címkét, majd egy vezérelt henger körbevezeti az anyag körül: a címke két vége összeragad, azután zászló formában a termékre simul.',
          en: 'Applies labels precisely in real time onto round materials such as cables, hoses or pipes. The pad picks up the label while it is printed, then a cam-controlled cylinder guides it around the material: both label ends stick together and the label is tamped as a flag.',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width' }, value: { hu: '50–100 mm', en: '50–100 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height' }, value: { hu: '10–50 mm', en: '10–50 mm' } },
          { label: { hu: 'Átmérő (kábel/cső)', en: 'Diameter (cable/pipe)' }, value: { hu: '3–16 mm', en: '3–16 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state' }, value: { hu: 'álló', en: 'at rest' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction' }, value: { hu: 'felülről, alulról, oldalról; függőlegesen 0–180° forgatva', en: 'from top, below, side; rotated vertically 0–180°' } },
          { label: { hu: 'Termék távolsága az egység aljától', en: 'Distance to bottom of unit' }, value: { hu: 'min. 70 mm, max. 260 mm', en: 'min. 70 mm, max. 260 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate' }, value: { hu: '~15 címke/perc', en: '~15 labels/min' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air' }, value: { hu: '4,5 bar', en: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption' }, value: { hu: 'max. 15 W', en: 'max. 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight' }, value: { hu: '8 kg', en: '8 kg' } },
        ],
        videoId: 'SV0G6Z2yb-4',
      },
      {
        slug: 'hq-6014',
        image: '/images/applicators/hq-6014.jpg',
        name: { hu: '6014 Ráfújó címkéző', en: '6014 Blow-on applicator' },
        description: {
          hu: 'Törékeny, vagy egyenetlen felületek címkézése, nagy sebességgel.',
          en: 'Labeling fragile or uneven surfaces at high speed.',
        },
        longDescription: {
          hu: 'Címkék felhelyezése álló vagy mozgásban lévő csomagokra érintés nélkül. A címkét ventilátor tartja meg, majd egymáshoz igazított fúvókákon át erős légsugár fújja a felületre. A címke méretétől függően akár 200 mm távolság is áthidalható.',
          en: 'Applies labels contactlessly onto packages in motion or at rest. Each label is held by a fan and blown off through aligned nozzles by a powerful blast of air. Depending on the label size, a distance of up to 200 mm can be bridged.',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width' }, value: { hu: '50–114 mm', en: '50–114 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height' }, value: { hu: '50–125 mm', en: '50–125 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state' }, value: { hu: 'álló vagy mozgásban', en: 'at rest or in motion' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction' }, value: { hu: 'felülről, alulról, oldalról', en: 'from top, below, side' } },
          { label: { hu: 'Csomagmagasság', en: 'Package height' }, value: { hu: 'változó', en: 'variable' } },
          { label: { hu: 'Csomag távolsága a lehúzóéltől', en: 'Distance to peel-off plate' }, value: { hu: 'max. 200 mm', en: 'up to 200 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate' }, value: { hu: 'max. 100 címke/perc', en: 'up to 100 labels/min' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air' }, value: { hu: '4,5 bar', en: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption' }, value: { hu: 'max. 90 W', en: 'max. 90 W' } },
          { label: { hu: 'Tömeg', en: 'Weight' }, value: { hu: '4 kg', en: '4 kg' } },
        ],
      },
      {
        slug: 'hq-5314',
        image: '/images/applicators/hq-5314.jpg',
        name: { hu: '5314 Vákuumszalagos applikátor', en: '5314 Vacuum-belt applicator' },
        description: {
          hu: 'Címkézés nagy sebességgel, mozgásban lévő termékeknél.',
          en: 'High-speed labeling of products in motion.',
        },
        longDescription: {
          hu: 'Címkék valós idejű felhelyezése minden oldalról, sík felületekre, mozgásban lévő csomagokra. A nyomtatott címkét vákuumszalag viszi a felhelyezési pontra, a felhelyezést külső jel indítja.',
          en: 'Applies labels in real time from all sides onto plane surfaces of packages in motion. A vacuum belt conveys the printed label to the point of transfer, and application is triggered by an external signal.',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width' }, value: { hu: '20–174 mm', en: '20–174 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height' }, value: { hu: '60–456 mm', en: '60–456 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state' }, value: { hu: 'mozgásban', en: 'in motion' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction' }, value: { hu: 'felülről, alulról, oldalról (sík felületre)', en: 'from top, below, side (plane surfaces)' } },
          { label: { hu: 'Csomagmagasság', en: 'Package height' }, value: { hu: 'egyenletes', en: 'uniform' } },
          { label: { hu: 'Csomagsebesség', en: 'Package speed' }, value: { hu: 'max. 0,5 m/s', en: 'up to 0.5 m/s' } },
          { label: { hu: 'Vákuumszalag sebessége', en: 'Vacuum-belt speed' }, value: { hu: '100–500 mm/s', en: '100–500 mm/s' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate' }, value: { hu: 'max. 30 címke/perc', en: 'up to 30 labels/min' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption' }, value: { hu: 'max. 90 W', en: 'max. 90 W' } },
          { label: { hu: 'Tömeg', en: 'Weight' }, value: { hu: '7–8 kg', en: '7–8 kg' } },
        ],
      },
      {
        slug: 'hq-4514',
        image: '/images/applicators/hq-4514.jpg',
        name: { hu: '4514 Swing Stroke applikátor', en: '4514 Swing stroke applicator' },
        description: {
          hu: 'Belső címkézés.',
          en: 'Inside labeling.',
        },
        longDescription: {
          hu: 'Címkék valós idejű felhelyezése minden oldalról, profilok és csövek belső felületeire. A párnát forgóhenger a felhelyezési síkba fordítja, a lökethenger pontosan a helyére viszi a címkét. A fújópárna 5–10 mm távolságból, légsugárral helyezi fel a címkét.',
          en: 'Applies labels in real time from all sides onto inner surfaces of profiles and pipes. A rotary cylinder pivots the pad to the application level and a stroke cylinder places the label exactly on spot. The blow-on pad applies the label from 5–10 mm away by a blast of air.',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width' }, value: { hu: '10–80 mm', en: '10–80 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height' }, value: { hu: '10–60 mm', en: '10–60 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state' }, value: { hu: 'álló', en: 'at rest' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction' }, value: { hu: 'felülről, alulról, oldalról (belső felületre is)', en: 'from top, below, side (inner surfaces too)' } },
          { label: { hu: 'Termékmagasság', en: 'Product height' }, value: { hu: 'egyenletes', en: 'uniform' } },
          { label: { hu: 'Függőleges elfordulás', en: 'Vertical pivot' }, value: { hu: '120°', en: '120°' } },
          { label: { hu: 'Távolság a címke felső széléig', en: 'Distance to upper label edge' }, value: { hu: 'max. 150–350 mm', en: 'up to 150–350 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate' }, value: { hu: '~20 címke/perc', en: '~20 labels/min' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air' }, value: { hu: '4,5 bar', en: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption' }, value: { hu: 'max. 15 W', en: 'max. 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight' }, value: { hu: '6–7 kg', en: '6–7 kg' } },
        ],
        videoId: 'mzq7QKgfb1Q',
      },
    ],
  },
  {
    slug: 'cab-ixor',
    category: 'cimkezo-gepek',
    name: 'CAB IXOR',
    brand: 'CAB',
    short: {
      hu: 'A kategória legkisebb szervo-hajtású címkéző feje automata sorokhoz.',
      en: 'The smallest servo-driven labeling head in its class for automated lines.',
    },
    description: {
      hu: 'Az IXOR a teljesítménykategória legkisebb szervo-hajtású címkéző feje; moduláris felépítéssel teljesen automata címkéző gépekbe és gyártósori szalagokra integrálható.',
      en: 'The IXOR is the smallest servo-driven labeling head in its performance class; its modular design integrates into fully automatic labeling machines and production-line conveyors.',
    },
    features: [
      { hu: 'Szervo-hajtású címkéző fej', en: 'Servo-driven labeling head' },
      { hu: 'Kompakt, moduláris felépítés', en: 'Compact, modular design' },
      { hu: 'Szalag- és gépintegráció', en: 'Conveyor / machine integration' },
      { hu: 'Nagy felhelyezési pontosság', en: 'High placement accuracy' },
    ],
    image: '/images/products/cab-ixor.jpg',
    datasheet: '/datasheets/cab-ixor.pdf',
    videoId: 'te_UCjKplTI',
  },

  {
    slug: 'cab-roxi',
    category: 'cimkezo-gepek',
    name: 'CAB ROXI',
    brand: 'CAB',
    short: {
      hu: 'Címkéző fej precíziós behelyező-címkézéshez — fóliák, membránok, tömítések.',
      en: 'Labeling head for precision insert-labeling — films, membranes, seals.',
    },
    description: {
      hu: 'A ROXI robusztus felépítésű, korszerű elektronikájú címkéző fej fóliák, membránok, tömítések és hővezető alkatrészek precíz behelyező-címkézéséhez. HERMES applikátorokkal magas pontosságú ipari alkalmazásokban is bevethető.',
      en: 'The ROXI is a solidly built labeling head with modern electronics for precision insert-labeling of films, membranes, seals and thermally conductive components. With HERMES applicators it also serves high-accuracy industrial applications.',
    },
    features: [
      { hu: 'Precíziós behelyező-címkézés', en: 'Precision insert-labeling' },
      { hu: 'Fólia, membrán, tömítés, hővezető alkatrész', en: 'Films, membranes, seals, thermal components' },
      { hu: 'HERMES applikátorokkal', en: 'Works with HERMES applicators' },
      { hu: 'Korszerű cab elektronika', en: 'Modern cab electronics' },
    ],
    image: '/images/products/cab-roxi.png',
    datasheet: '/datasheets/cab-roxi.pdf',
    videoId: '1gc7P-fNwJc',
  },
  {
    slug: 'cab-pxq',
    category: 'cimkezo-gepek',
    name: 'CAB PX Q',
    brand: 'CAB',
    short: {
      hu: 'Nyomtató- és leválasztó modul automata gépekbe és applikátorokba.',
      en: 'Print-and-peel module for automated machines and applicators.',
    },
    description: {
      hu: 'A PX Q nyomtató- és leválasztó modult teljesen automatikus ipari nyomtatásra és címkézésre tervezték, a legújabb cab elektronikai platformra építve — applikátorokba és OEM gépekbe integrálható.',
      en: 'The PX Q print-and-peel module is designed for fully automatic industrial printing and labeling, built on the latest cab electronics platform — for integration into applicators and OEM machines.',
    },
    features: [
      { hu: 'Nyomtató- és leválasztó modul', en: 'Print-and-peel module' },
      { hu: 'Teljesen automatikus üzem', en: 'Full automation' },
      { hu: 'Legújabb cab elektronikai platform', en: 'Latest cab electronics platform' },
      { hu: 'Applikátor / OEM integráció', en: 'Applicator / OEM integration' },
    ],
    image: '/images/products/cab-pxq.png',
    datasheet: '/datasheets/cab-pxq.pdf',
    videoId: 'AOjwwv_yzbc',
  },
  {
    slug: 'cab-hermes-c',
    category: 'cimkezo-gepek',
    name: 'CAB HERMES C',
    brand: 'CAB',
    short: {
      hu: 'Print & apply rendszer a HERMES családból, ipari címkézéshez.',
      en: 'Print & apply system from the HERMES family for industrial labeling.',
    },
    description: {
      hu: 'A HERMES C a cab print & apply kínálatának tagja: nyomtat és valós időben helyezi fel a címkéket a gyártósoron, megbízható ipari kivitelben.',
      en: 'The HERMES C is part of cab’s print & apply range: it prints and applies labels in real time on the production line, in a reliable industrial build.',
    },
    features: [
      { hu: 'Valós idejű print & apply', en: 'Real-time print & apply' },
      { hu: 'Gyártósori címkézés', en: 'Production-line labeling' },
      { hu: 'HERMES termékcsalád', en: 'HERMES family' },
      { hu: 'Ipari kivitel', en: 'Industrial build' },
    ],
    image: '/images/products/cab-hermes-c.png',
    datasheet: '/datasheets/cab-hermes-c.pdf',
  },

  // ——— CAB — Címke-adagoló gépek ———
  {
    slug: 'cab-hs',
    category: 'cimke-adagolo-gepek',
    name: 'CAB HS',
    brand: 'CAB',
    image: '/images/products/cab-hs.png',
    datasheet: '/datasheets/cab-hsvs.pdf',
    short: {
      hu: 'Címkeadagoló minden címkemérethez — hézag nélkül vágott vagy stancolt címkékhez.',
      en: 'Label dispenser for every label size — for gap-free cut or die-cut labels.',
    },
    description: {
      hu: 'A HS adagoló bármilyen címkeméretet egyszerűen adagol; a címkék hézag nélkül is stancolhatók vagy vághatók, a kézi felhelyezés gyorsításához.',
      en: 'The HS dispenser feeds any label size with ease; labels can be die-cut or cut without any gap in between, speeding up manual application.',
    },
    features: [
      { hu: 'Bármilyen címkeméret', en: 'Any label size' },
      { hu: 'Hézag nélküli adagolás', en: 'Gap-free dispensing' },
      { hu: 'Fotocellás vezérlés', en: 'Photocell control' },
      { hu: 'Asztali kivitel', en: 'Desktop unit' },
    ],
  },
  {
    slug: 'cab-vs',
    category: 'cimke-adagolo-gepek',
    name: 'CAB VS',
    brand: 'CAB',
    image: '/images/products/cab-vs.png',
    datasheet: '/datasheets/cab-hsvs.pdf',
    short: {
      hu: 'Kompakt címkeadagoló munkaállomásokra, egyszerű, gyors kézi címkézéshez.',
      en: 'Compact label dispenser for workstations — simple, fast manual labeling.',
    },
    description: {
      hu: 'A VS adagoló kompakt kivitelben gyorsítja a kézi címkézést munkaállomásokon, megbízható címkeleválasztással.',
      en: 'The VS dispenser accelerates manual labeling at workstations in a compact format, with reliable label separation.',
    },
    features: [
      { hu: 'Kompakt asztali kivitel', en: 'Compact desktop unit' },
      { hu: 'Megbízható címkeleválasztás', en: 'Reliable label separation' },
      { hu: 'Állítható különböző méretekhez', en: 'Adjustable for various sizes' },
      { hu: 'Munkaállomási használat', en: 'Workstation use' },
    ],
  },

  // ——— CAB — Lézeres jelölők ———
  {
    slug: 'cab-xeno-4',
    category: 'lezer-gravirozok',
    name: 'CAB XENO 4',
    brand: 'CAB',
    short: {
      hu: 'Fiber gravírozó lézer műanyagok, fémek és festett felületek jelölésére.',
      en: 'Fiber marking laser for plastics, metals and painted surfaces.',
    },
    description: {
      hu: 'A XENO 4 új generációs fiber lézer 20, 30 vagy 50 W teljesítménnyel — dióda-pumpált, léghűtéses jelölőrendszer műanyagok, fémek és festett felületek gravírozására, jelölőállomásba építve.',
      en: 'The XENO 4 is a new-generation fiber laser with 20, 30 or 50 W output — a diode-pumped, air-cooled marking system for engraving plastics, metals and painted surfaces, built into a marking station.',
    },
    features: [
      { hu: '20 / 30 / 50 W fiber lézer', en: '20 / 30 / 50 W fiber laser' },
      { hu: 'Dióda-pumpált, léghűtéses', en: 'Diode-pumped, air-cooled' },
      { hu: 'Műanyag, fém, festett felület', en: 'Plastics, metals, painted surfaces' },
      { hu: 'Jelölőállomásba építve', en: 'Marking-station integration' },
    ],
    image: '/images/products/cab-xeno-4.jpg',
    datasheet: '/datasheets/cab-laser-xeno.pdf',
  },
  {
    slug: 'cab-xeno-1',
    category: 'lezer-gravirozok',
    name: 'CAB XENO 1',
    brand: 'CAB',
    short: {
      hu: 'Kompakt pulzáló fiber lézer fém és műanyag jelölésére.',
      en: 'Compact pulsed fiber laser for marking metal and plastic.',
    },
    description: {
      hu: 'A XENO 1 kompakt, pulzáló fiber lézer fémek és műanyagok jelölésére — belépő szintű, léghűtéses jelölőmegoldás, könnyen integrálható jelölőállomásokba.',
      en: 'The XENO 1 is a compact pulsed fiber laser for marking metals and plastics — an entry-level, air-cooled marking solution that integrates easily into marking stations.',
    },
    features: [
      { hu: 'Kompakt pulzáló fiber lézer', en: 'Compact pulsed fiber laser' },
      { hu: 'Fém és műanyag jelölés', en: 'Marks metal and plastic' },
      { hu: 'Léghűtéses', en: 'Air-cooled' },
      { hu: 'Jelölőállomásba építhető', en: 'Marking-station integration' },
    ],
    image: '/images/products/cab-xeno-1.jpg',
    datasheet: '/datasheets/cab-laser-xeno.pdf',
    videoId: 'eDgChgvtAzc',
  },
  {
    slug: 'cab-xeno-3',
    category: 'lezer-gravirozok',
    name: 'CAB XENO 3',
    brand: 'CAB',
    short: {
      hu: 'Fiber jelölő lézer a XENO családból, ipari jelöléshez.',
      en: 'Fiber marking laser from the XENO family for industrial marking.',
    },
    description: {
      hu: 'A XENO 3 a XENO fiber lézercsalád tagja — megbízható, léghűtéses ipari jelölés fémeken és műszaki műanyagokon, jelölőállomásba építve.',
      en: 'The XENO 3 is part of the XENO fiber laser family — reliable, air-cooled industrial marking on metals and technical plastics, integrated into a marking station.',
    },
    features: [
      { hu: 'XENO fiber lézercsalád', en: 'XENO fiber laser family' },
      { hu: 'Léghűtéses', en: 'Air-cooled' },
      { hu: 'Fém és műszaki műanyag', en: 'Metals and technical plastics' },
      { hu: 'Jelölőállomásba építve', en: 'Marking-station integration' },
    ],
    image: '/images/products/cab-xeno-3.jpg',
    datasheet: '/datasheets/cab-laser-xeno.pdf',
    videoId: 'b3xeRtxdFy8',
  },
  {
    slug: 'cab-lm-plus',
    category: 'lezer-gravirozok',
    name: 'CAB LM+',
    brand: 'CAB',
    short: {
      hu: 'Lézeres címke-jelölő: címkék pontos jelölése és vágása szerszám nélkül.',
      en: 'Laser label marker: precise marking and cutting of labels without tools.',
    },
    description: {
      hu: 'Az LM+ lézeres címke-jelölő végtelenített alapanyagból különböző méretű címkéket jelöl és vág ki pontosan, további szerszámok nélkül.',
      en: 'The LM+ laser label marker precisely marks and cuts labels of different sizes out of continuous material, without the need for additional tools.',
    },
    features: [
      { hu: 'Címkék jelölése és vágása', en: 'Marks and cuts labels' },
      { hu: 'Végtelenített alapanyagból', en: 'From continuous material' },
      { hu: 'Különböző címkeméretek', en: 'Various label sizes' },
      { hu: 'Nincs szükség külön szerszámra', en: 'No additional tooling' },
    ],
    image: '/images/products/cab-lm-plus.jpg',
    datasheet: '/datasheets/cab-laser-xeno.pdf',
    videoId: 'Q7-qCKuZ708',
  },
  {
    slug: 'cab-lsg100-plus',
    category: 'lezer-gravirozok',
    name: 'CAB LSG+100',
    brand: 'CAB',
    short: {
      hu: 'Lézeres jelölőállomás (1. lézerosztály) sorozatgyártáshoz, XENO 4-gyel.',
      en: 'Class-1 laser marking station for series production, with XENO 4.',
    },
    description: {
      hu: 'Az LSG+100 lézerbiztonsági jelölőállomás ipari megoldás alkatrészek sorozatjelölésére a XENO 4 fiber lézerrel. Robusztus fémház, nagy munkatér, és 19"-os rack a lézerforrásnak és egy ipari PC-nek.',
      en: 'The LSG+100 laser safety housing is an industrial solution for series marking of parts with the XENO 4 fiber laser. Rugged metal housing, a large work area and a 19" rack for the laser source and an industrial PC.',
    },
    features: [
      { hu: '1. lézerosztályú biztonsági ház', en: 'Class-1 laser safety housing' },
      { hu: 'Sorozatjelölés XENO 4-gyel', en: 'Series marking with XENO 4' },
      { hu: 'Nagy munkatér', en: 'Large work area' },
      { hu: '19"-os rack a lézerforrásnak és ipari PC-nek', en: '19" rack for laser source & industrial PC' },
    ],
    image: '/images/products/cab-lsg100-plus.jpg',
    datasheet: '/datasheets/cab-laser-xeno.pdf',
  },
  {
    slug: 'cab-af5',
    category: 'lezer-gravirozok',
    name: 'CAB AF5',
    brand: 'CAB',
    short: {
      hu: 'Elszívó- és szűrőrendszer a lézeres jelöléshez — védi a kezelőt és az optikát.',
      en: 'Extraction and filter system for laser marking — protects operator and optics.',
    },
    description: {
      hu: 'Az AF5 elszívó- és szűrőberendezés a lézeres jelölés során keletkező füstöt és port szívja el, védve a kezelő egészségét, valamint a jelölőteret és a lencsét a szennyeződéstől. Az LSG+100 / XENO rendszerek tartozéka.',
      en: 'The AF5 extraction and filter device removes the smoke and dust generated during laser marking, protecting the operator’s health as well as the marking area and lens from contamination. An accessory for the LSG+100 / XENO systems.',
    },
    features: [
      { hu: 'Elszívás és szűrés', en: 'Extraction and filtration' },
      { hu: 'Védi a kezelő egészségét', en: 'Protects operator health' },
      { hu: 'Tisztán tartja az optikát és a jelölőteret', en: 'Keeps optics and marking area clean' },
      { hu: 'Az LSG+100 / XENO tartozéka', en: 'Accessory for LSG+100 / XENO' },
    ],
    image: '/images/products/cab-af5.jpg',
    datasheet: '/datasheets/cab-laser-xeno.pdf',
  },

  // ——— CAB — Szoftver ———
  {
    slug: 'cab-cablabel-s3',
    category: 'szoftverek',
    name: 'cablabel S3',
    brand: 'CAB',
    image: '/images/brand/cab-logo.png',
    short: {
      hu: 'cab címketervező és -nyomtató szoftver, teljes körű eszközvezérléssel.',
      en: 'cab label design and printing software with full device control.',
    },
    description: {
      hu: 'A cablabel S3 a cab saját címketervező szoftvere: WYSIWYG szerkesztő, adatbázis-kapcsolat és a cab nyomtatók, print & apply rendszerek és lézerek teljes körű vezérlése egy felületről.',
      en: 'cablabel S3 is cab’s own label design software: a WYSIWYG editor, database connectivity and full control of cab printers, print & apply systems and lasers from a single interface.',
    },
    features: [
      { hu: 'WYSIWYG címketervező', en: 'WYSIWYG label editor' },
      { hu: 'Adatbázis-kapcsolat', en: 'Database connectivity' },
      { hu: 'Nyomtató, print & apply és lézer vezérlés', en: 'Controls printers, print & apply and lasers' },
      { hu: 'Több kiadásban', en: 'Available in multiple editions' },
    ],
    datasheet: '/datasheets/cab-cablabel-s3.pdf',
  },
  {
    slug: 'egyedi-szoftverfejlesztes',
    category: 'szoftverek',
    name: 'Egyedi szoftverfejlesztés',
    brand: 'Blueway Trade',
    image: '/images/products/egyedi-szoftver.png',
    short: {
      hu: 'Egyedi szoftverek tervezése és kivitelezése az Ön folyamataira szabva.',
      en: 'Custom software designed and built around your processes.',
    },
    description: {
      hu: 'Egyedi szoftverek tervezését és kivitelezését vállaljuk — a címkézési és jelölési munkafolyamatok automatizálásától az adatbázis- és rendszerintegrációig, teljesen az Ön igényeire szabva.',
      en: 'We design and build custom software — from automating labeling and marking workflows to database and system integration, tailored entirely to your needs.',
    },
    features: [
      { hu: 'Igény szerinti fejlesztés', en: 'Development to your requirements' },
      { hu: 'Munkafolyamat-automatizálás', en: 'Workflow automation' },
      { hu: 'Adatbázis- és rendszerintegráció', en: 'Database and system integration' },
      { hu: 'Címke- és jelölésvezérlés', en: 'Label and marking control' },
    ],
  },

  // ——— POSTEK — címkenyomtató sorozatok ———
  {
    slug: 'postek-ox',
    category: 'cimkenyomtatok',
    name: 'POSTEK OX',
    brand: 'POSTEK',
    image: '/images/products/postek-ox.png',
    videoId: 'BVSxFLYtC5U',
    datasheet: '/datasheets/postek-ox-datasheet.pdf',
    short: {
      hu: 'Ipari csúcskategóriás nyomtató integrált vizuális ellenőrzéssel és RFID-vel.',
      en: 'Flagship industrial printer with integrated visual verification and RFID.',
    },
    description: {
      hu: 'A POSTEK OX sorozat a kínálat csúcsa: 200/300/600 dpi, akár 18 ips sebesség, négymagos processzor, 4,5"-es érintőkijelző és integrált vizuális ellenőrzés, amely 1D/2D vonalkódokat minősít ANSI/ISO szerint. Opcionális RFID- és verifikációs csomagok. Modellek: OX2, OX3, OX6 (+ OX218/OX318, RFID: OXr).',
      en: 'The POSTEK OX series is the top of the range: 200/300/600 dpi, up to 18 ips, a quad-core processor, a 4.5" touchscreen and integrated visual verification that grades 1D/2D barcodes to ANSI/ISO. Optional RFID and verification packages. Models: OX2, OX3, OX6 (+ OX218/OX318, RFID: OXr).',
    },
    features: [
      { hu: '200 / 300 / 600 dpi', en: '200 / 300 / 600 dpi' },
      { hu: 'Akár 18 ips sebesség', en: 'Up to 18 ips' },
      { hu: 'Integrált 1D/2D vizuális ellenőrzés', en: 'Integrated 1D/2D visual verification' },
      { hu: '4,5" érintőkijelző', en: '4.5" touchscreen' },
      { hu: 'Opcionális RFID', en: 'Optional RFID' },
    ],
  },
  {
    slug: 'postek-tx',
    category: 'cimkenyomtatok',
    name: 'POSTEK TX',
    brand: 'POSTEK',
    image: '/images/products/postek-tx.png',
    videoId: 'qAcJTzTMTnI',
    datasheet: '/datasheets/postek-tx-datasheet.pdf',
    short: {
      hu: 'Valódi ipari nyomtató HEAT™ technológiával, nagy terhelhetőséghez.',
      en: 'True industrial printer with HEAT™ technology for heavy-duty use.',
    },
    description: {
      hu: 'A POSTEK TX sorozat valódi ipari nyomtató: 64-bites négymagos processzor, HEAT™ nyomtatási algoritmus és ADAPT™ ±0,5 mm-es anyagpozicionálás. Direkt termál és termotranszfer mód. Modellek: TX2r (203 dpi, 16 ips), TX3r (300 dpi, 12 ips), TX6r (600 dpi).',
      en: 'The POSTEK TX series is a true industrial printer: a 64-bit quad-core processor, the HEAT™ printing algorithm and ADAPT™ media positioning to ±0.5 mm. Direct thermal and thermal transfer. Models: TX2r (203 dpi, 16 ips), TX3r (300 dpi, 12 ips), TX6r (600 dpi).',
    },
    features: [
      { hu: '203 / 300 / 600 dpi modellek', en: '203 / 300 / 600 dpi models' },
      { hu: 'HEAT™ nyomtatási minőség', en: 'HEAT™ print quality' },
      { hu: 'ADAPT™ ±0,5 mm pozicionálás', en: 'ADAPT™ ±0.5 mm positioning' },
      { hu: '4,5" színes érintőkijelző', en: '4.5" color touchscreen' },
      { hu: 'Direkt termál és termotranszfer', en: 'Direct thermal & thermal transfer' },
    ],
  },
  {
    slug: 'postek-gx',
    category: 'cimkenyomtatok',
    name: 'POSTEK GX',
    brand: 'POSTEK',
    image: '/images/products/postek-gx.png',
    videoId: 'XcnaxfjbTwc',
    datasheet: '/datasheets/postek-gx-datasheet.pdf',
    short: {
      hu: 'Asztali kivitel ipari teljesítménnyel, kompakt helyigénnyel.',
      en: 'Desktop format with industrial performance in a compact footprint.',
    },
    description: {
      hu: 'A POSTEK GX sorozat asztali méretben hozza az ipari teljesítményt: 4,5"-es érintőkijelző, nagy pontosságú anyagpozicionálás, direkt termál és termotranszfer. Modellek: GX2 (203 dpi, 10 ips), GX3 (300 dpi, 8 ips), GX6 (600 dpi, 5 ips), opcionális RFID (GXr).',
      en: 'The POSTEK GX series brings industrial performance in a desktop size: a 4.5" touchscreen, high-precision media positioning, direct thermal and thermal transfer. Models: GX2 (203 dpi, 10 ips), GX3 (300 dpi, 8 ips), GX6 (600 dpi, 5 ips), optional RFID (GXr).',
    },
    features: [
      { hu: 'Kompakt asztali kivitel', en: 'Compact desktop format' },
      { hu: '203 / 300 / 600 dpi modellek', en: '203 / 300 / 600 dpi models' },
      { hu: '4,5" érintőkijelző', en: '4.5" touchscreen' },
      { hu: 'Nagy pontosságú pozicionálás', en: 'High-precision positioning' },
      { hu: 'Opcionális RFID', en: 'Optional RFID' },
    ],
  },
  {
    slug: 'postek-c168',
    category: 'cimkenyomtatok',
    name: 'POSTEK C168',
    brand: 'POSTEK',
    image: '/images/products/postek-c168.jpg',
    datasheet: '/datasheets/postek-c168-datasheet.pdf',
    short: {
      hu: 'Kereskedelmi asztali nyomtató egyszerű, mindennapi címkézéshez.',
      en: 'Commercial desktop printer for simple, everyday labeling.',
    },
    description: {
      hu: 'A POSTEK C168 sorozat kompakt, tartós kereskedelmi asztali nyomtató: egyrészes váz, megbízható mechanika és minőségi nyomtatófejek. Direkt termál és termotranszfer, 4" nyomtatási szélességig. Modellek: C168/200s (203 dpi, 4 ips), C168/300s (300 dpi, 3 ips).',
      en: 'The POSTEK C168 series is a compact, durable commercial desktop printer: a one-piece chassis, reliable mechanics and high-end printheads. Direct thermal and thermal transfer, up to 4" print width. Models: C168/200s (203 dpi, 4 ips), C168/300s (300 dpi, 3 ips).',
    },
    features: [
      { hu: 'Kompakt, egyrészes váz', en: 'Compact one-piece chassis' },
      { hu: '203 / 300 dpi modellek', en: '203 / 300 dpi models' },
      { hu: '4" nyomtatási szélességig', en: 'Up to 4" print width' },
      { hu: 'Direkt termál és termotranszfer', en: 'Direct thermal & thermal transfer' },
      { hu: 'RS-232 és USB', en: 'RS-232 & USB' },
    ],
  },

  // ——— TYKMA Electrox — lézeres jelölő- és gravírozórendszerek ———
  {
    slug: 'tykma-minilase',
    category: 'lezer-gravirozok',
    name: 'TYKMA Minilase',
    brand: 'Tykma Electrox',
    image: '/images/products/tykma-minilase.jpg',
    datasheet: '/datasheets/tykma-electrox-brochure.pdf',
    short: {
      hu: 'Asztali Class 1 fiber lézerjelölő — gyors, karbantartásmentes, nagy darabszámhoz.',
      en: 'Benchtop Class 1 fiber laser marker — fast, maintenance-free, for high volumes.',
    },
    description: {
      hu: 'A Minilase kompakt, Class 1 asztali fiber lézerjelölő rendszer, amelyet nagy darabszámú gyártáshoz terveztek. Háromoldalas, pneumatikus függőleges ajtó szabadalmaztatott biztonsági rendszerrel, léghűtéses, karbantartásmentes fiber lézerforrás. Az „Easy" üzemmódban az ajtózárás–jelölés–ajtónyitás sorozat automatikus. Motoros fókuszmagasság-állítás beépített fókuszkeresővel; opcionális forgatóegység 360°-os palástjelöléshez.',
      en: 'The Minilase is a compact Class 1 benchtop fiber laser marking system built for high-volume production. A three-sided pneumatic vertical door with a patented safety system, and an air-cooled, maintenance-free fiber laser source. In Easy mode the door-close / mark / door-open sequence is automated. Motorised focal-height adjustment with a built-in focus finder; an optional rotary device enables 360° radial marking.',
    },
    features: [
      { hu: 'Class 1 — nyílt térben is biztonságos', en: 'Class 1 — safe in an open environment' },
      { hu: 'MOPA fiber lézer, 20 / 50 W', en: 'MOPA fiber laser, 20 / 50 W' },
      { hu: 'Automatikus pneumatikus ajtó', en: 'Automatic pneumatic door' },
      { hu: 'Léghűtéses, karbantartásmentes', en: 'Air-cooled, maintenance-free' },
      { hu: 'Beépített fókuszkereső', en: 'Built-in focus finder' },
      { hu: '36 hónap garancia', en: '36-month warranty' },
    ],
  },
  {
    slug: 'tykma-minilase-xl',
    category: 'lezer-gravirozok',
    name: 'TYKMA Minilase XL',
    brand: 'Tykma Electrox',
    image: '/images/products/tykma-minilase-xl.jpg',
    datasheet: '/datasheets/tykma-electrox-brochure.pdf',
    short: {
      hu: 'Nagyobb, nyitott munkaterű fiber lézerjelölő — akár Class 4 üzemmódban is.',
      en: 'Larger, open-interior fiber laser marker — with optional Class 4 operation.',
    },
    description: {
      hu: 'A Minilase XL a Minilase család legnagyobb munkaterű, nyitott belsejű asztali tagja — akár 508 mm széles alkatrészek jelöléséhez. A szervizkulccsal és figyelmeztető lámpával Class 4 (nyitott ajtós) jelölés is lehetséges. Automatikus üzemmód, motoros fókuszmagasság-állítás (opcionálisan programozható), többféle lézertípussal (fiber akár 100 W-ig) rendelhető.',
      en: 'The Minilase XL is the largest, open-interior benchtop member of the Minilase line — for marking parts up to 508 mm wide. With a service key and warning light, Class 4 (open-door) marking is also possible. Automatic mode, motorised focal-height adjustment (optionally programmable), available with a variety of laser types (fiber up to 100 W).',
    },
    features: [
      { hu: 'Tág, nyitott munkatér', en: 'Large, open working area' },
      { hu: 'MOPA fiber lézer, 20–100 W', en: 'MOPA fiber laser, 20–100 W' },
      { hu: 'Opcionális Class 4 üzemmód', en: 'Optional Class 4 operation' },
      { hu: 'Programozható fókusz opció', en: 'Programmable focus option' },
      { hu: 'Léghűtéses, karbantartásmentes', en: 'Air-cooled, maintenance-free' },
      { hu: '36 hónap garancia', en: '36-month warranty' },
    ],
  },
  {
    slug: 'tykma-vereo',
    category: 'lezer-gravirozok',
    name: 'TYKMA Vereo',
    brand: 'Tykma Electrox',
    image: '/images/products/tykma-vereo.jpg',
    datasheet: '/datasheets/tykma-electrox-brochure.pdf',
    short: {
      hu: 'Kompakt fiber integrációs lézer gyártósorokba és munkacellákba.',
      en: 'Compact fiber integration laser for production lines and work cells.',
    },
    description: {
      hu: 'A Vereo ultrakompakt, robusztus, marógépi alumíniumházas jelölőfejjel szerelt fiber integrációs lézer, amelyet automatizált gyártósorokba és egyedi zárt terekbe való beépítésre terveztek. Léghűtéses, karbantartásmentes fiber forrás; egyszerű USB-kapcsolat PC-hez, dedikált I/O és menet közbeni („marking on the fly") jelölés.',
      en: 'The Vereo is a fiber integration laser with an ultra-compact, robust machined-aluminium marking head, designed for integration into automated production lines and custom enclosures. An air-cooled, maintenance-free fiber source; a simple USB connection to a PC, dedicated I/O and marking on the fly.',
    },
    features: [
      { hu: 'Ultrakompakt jelölőfej', en: 'Ultra-compact marking head' },
      { hu: 'MOPA fiber lézerforrás', en: 'MOPA fiber laser source' },
      { hu: 'Gyártósori integrációra tervezve', en: 'Designed for line integration' },
      { hu: 'Dedikált I/O, marking on the fly', en: 'Dedicated I/O, marking on the fly' },
      { hu: 'Léghűtéses, karbantartásmentes', en: 'Air-cooled, maintenance-free' },
    ],
  },
  {
    slug: 'tykma-vereo-smart',
    category: 'lezer-gravirozok',
    name: 'TYKMA Vereo Smart',
    brand: 'Tykma Electrox',
    image: '/images/products/tykma-vereo-smart.jpg',
    datasheet: '/datasheets/tykma-electrox-brochure.pdf',
    short: {
      hu: 'Integrációs lézer PC nélkül — érintőképernyő és vezérlés bármely eszközről.',
      en: 'Integration laser without a PC — touchscreen and control from any device.',
    },
    description: {
      hu: 'A Vereo Smart integrációs lézer beépített vezérlővel önálló, PC nélküli működésre képes: a jelölőprogramokat a fedélzeti tárolón tartja. Előlapi érintőképernyő, hálózati csatlakozás és plug-and-play interfész a gyakori PLC-márkákhoz. A saját fejlesztésű felületről a lézer bármely eszközről (PC, tablet, telefon, PLC) vezérelhető és felügyelhető — szoftvertelepítés nélkül.',
      en: 'The Vereo Smart integration laser can run standalone with no PC thanks to an integrated controller: marking programs are kept in on-board storage. A front touchscreen interface, network connectivity and a plug-and-play interface for common PLC brands. Its proprietary interface lets you control and monitor the laser from any device (PC, tablet, phone, PLC) — with no software to install.',
    },
    features: [
      { hu: 'Önálló működés PC nélkül', en: 'Standalone operation, no PC' },
      { hu: 'Előlapi érintőképernyő', en: 'Front touchscreen interface' },
      { hu: 'Vezérlés bármely eszközről', en: 'Control from any device' },
      { hu: 'Plug-and-play PLC-interfész', en: 'Plug-and-play PLC interface' },
      { hu: 'Hálózati csatlakozás, adatcsere', en: 'Network connectivity, data exchange' },
    ],
  },
  {
    slug: 'tykma-virtus',
    category: 'lezer-gravirozok',
    name: 'TYKMA Virtus',
    brand: 'Tykma Electrox',
    image: '/images/products/tykma-virtus.jpg',
    datasheet: '/datasheets/tykma-electrox-brochure.pdf',
    short: {
      hu: 'Kompakt, belépő szintű Class 4 fiber lézerjelölő és -gravírozó.',
      en: 'Compact, entry-level Class 4 fiber laser marker and engraver.',
    },
    description: {
      hu: 'A Virtus kompakt, Class 4 fiber lézerjelölő és -gravírozó rendszer, akár 60 W-os MOPA fiber forrással — nagy csúcsteljesítmény és gyors feldolgozás fémeken, műanyagokon, bevonatos felületeken. Állítható Z-tengely és rögzítő szerszámlap; léghűtéses, karbantartásmentes, alacsony fogyasztású. Ideális gyártósorokba, munkacellákba és asztali használatra; hivatalos rendszer Cerakote® bevonatok jelöléséhez és ablálásához.',
      en: 'The Virtus is a compact Class 4 fiber laser marking and engraving system with a MOPA fiber source up to 60 W — high peak power and fast processing on metals, plastics and coated surfaces. Adjustable Z-axis and a tooling fixture plate; air-cooled, maintenance-free and low-consumption. Ideal for lines, work cells and benchtop use; an official system for marking and ablating Cerakote® coatings.',
    },
    features: [
      { hu: 'MOPA fiber lézer, akár 60 W', en: 'MOPA fiber laser, up to 60 W' },
      { hu: 'Állítható Z-tengely + szerszámlap', en: 'Adjustable Z-axis + tooling plate' },
      { hu: 'Gyártósori és asztali integráció', en: 'Line and benchtop integration' },
      { hu: 'Léghűtéses, karbantartásmentes', en: 'Air-cooled, maintenance-free' },
      { hu: 'Cerakote® jelölésre hitelesítve', en: 'Certified for Cerakote® marking' },
    ],
  },

  // ——— Festékszalagok (termotranszfer) ———
  {
    slug: 'dnp-festekszalagok',
    category: 'cimkek-es-festekszalagok',
    name: 'DNP festékszalagok',
    brand: 'DNP',
    image: '/images/brand/dnp-logo.png',
    datasheet: '/datasheets/dnp-ttr-brochure.pdf',
    short: {
      hu: 'Prémium termotranszfer festékszalagok — wax, wax/resin és resin kivitelben.',
      en: 'Premium thermal transfer ribbons — in wax, wax/resin and resin.',
    },
    description: {
      hu: 'A DNP (Dai Nippon Printing) a világ egyik vezető termotranszfer festékszalag-gyártója. Teljes kínálat wax, wax/resin és resin szalagokból: a világszerte elismert TR4085Plus prémium wax szalagtól a nagy ellenállású resin szalagokig. Ideális szállítási, logisztikai, gyógyszeripari, vegyipari és kültéri címkézéshez, papír és szintetikus címkékre egyaránt.',
      en: 'DNP (Dai Nippon Printing) is one of the world’s leading manufacturers of thermal transfer ribbons. A complete range of wax, wax/resin and resin ribbons: from the globally renowned TR4085Plus premium wax to highly resistant resin ribbons. Ideal for shipping, logistics, pharmaceutical, chemical and outdoor labeling, on both paper and synthetic labels.',
    },
    features: [
      { hu: 'Wax, wax/resin és resin kivitel', en: 'Wax, wax/resin and resin grades' },
      { hu: 'TR4085Plus prémium wax szalag', en: 'TR4085Plus premium wax ribbon' },
      { hu: 'Nagy tartósságú resin szalagok', en: 'Highly durable resin ribbons' },
      { hu: 'Papír és szintetikus címkékhez', en: 'For paper and synthetic labels' },
    ],
  },
  {
    slug: 'armor-iimak-festekszalagok',
    category: 'cimkek-es-festekszalagok',
    name: 'ARMOR-IIMAK festékszalagok',
    brand: 'ARMOR-IIMAK',
    image: '/images/brand/armor-iimak-logo.png',
    datasheet: '/datasheets/armor-iimak-ribbons-overview.pdf',
    short: {
      hu: 'Termotranszfer festékszalagok flat-head és near-edge nyomtatókhoz.',
      en: 'Thermal transfer ribbons for flat-head and near-edge printers.',
    },
    description: {
      hu: 'Az ARMOR-IIMAK a termotranszfer festékszalagok egyik piacvezető gyártója. Három szalagcsalád — wax (AWR 1), wax/resin (APR 1, APR 6, APR 600) és resin (AXR 1, AXR 7, AXR 100, AXR 600, AXR 800/900) — flat-head és near-edge nyomtatókhoz, papír- és szintetikus címkékhez, valamint flexibilis csomagolóanyagokhoz. Nagy sebességű nyomtatás (akár 1 m/s) és kiváló nyomatállóság.',
      en: 'ARMOR-IIMAK is a market leader in thermal transfer ribbons. Three ribbon families — wax (AWR 1), wax/resin (APR 1, APR 6, APR 600) and resin (AXR 1, AXR 7, AXR 100, AXR 600, AXR 800/900) — for flat-head and near-edge printers, for paper and synthetic labels as well as flexible packaging. High-speed printing (up to 1 m/s) with excellent print resistance.',
    },
    features: [
      { hu: 'Wax, wax/resin és resin családok', en: 'Wax, wax/resin and resin families' },
      { hu: 'Flat-head és near-edge nyomtatókhoz', en: 'For flat-head and near-edge printers' },
      { hu: 'Nagy sebességű nyomtatás (akár 1 m/s)', en: 'High-speed printing (up to 1 m/s)' },
      { hu: 'Kiváló nyomatállóság', en: 'Excellent print resistance' },
    ],
  },
  {
    slug: 'start-ld3000',
    category: 'cimke-adagolo-gepek',
    name: 'START LD3000',
    brand: 'START International',
    image: '/images/products/ld3000.jpg',
    datasheet: '/datasheets/start-ld3000.pdf',
    short: {
      hu: 'Nagy sebességű elektromos címkeadagoló kis címkékhez, kis munkaterületre.',
      en: 'High-speed electric label dispenser for small labels and small work areas.',
    },
    description: {
      hu: 'Az LD3000 nagy sebességű elektromos címkeadagoló kis címkékhez és kivágott alkatrészekhez (papír, poliészter, vinil, acetát, hab, fólia). Fotoszenzor gondoskodik a pontos lehúzásról, adagolásról és továbbításról, a hordozó automatikusan felcsévélődik. Szerszám nélkül állítható, tartós anodizált alumínium ház. 12 V DC, mellékelt 100–240 V univerzális adapterrel. Amerikai gyártás.',
      en: 'The LD3000 is a high-speed electric label dispenser for small labels and die-cut parts (paper, polyester, vinyl, acetate, foam, foil). A photosensor ensures accurate peeling, dispensing and advancing, and the liner is automatically rewound. Tool-free adjustment, durable anodized aluminum housing. 12V DC with an included 100–240V universal transformer. Made in the U.S.A.',
    },
    features: [
      { hu: 'Címkeszélesség 6–57 mm, hossz 6–76 mm', en: 'Label width 6–57 mm, length 6–76 mm' },
      { hu: 'Adagolási sebesség 56 mm/s', en: 'Feed speed 56 mm/s' },
      { hu: 'Fotoszenzoros pontosság, automatikus hordozó-felcsévélés', en: 'Photosensor accuracy, automatic liner rewind' },
      { hu: 'Max. tekercsátmérő 190 mm (1"/3" mag)', en: 'Max. roll diameter 190 mm (1"/3" core)' },
      { hu: 'Anodizált alumínium ház', en: 'Anodized aluminum housing' },
    ],
  },
  {
    slug: 'start-ld3500',
    category: 'cimke-adagolo-gepek',
    name: 'START LD3500',
    brand: 'START International',
    image: '/images/products/ld3500.jpg',
    datasheet: '/datasheets/start-ld3500.pdf',
    short: {
      hu: 'Elektromos címkeadagoló átlátszó és nehezen kezelhető anyagokhoz.',
      en: 'Electric label dispenser for clear and challenging materials.',
    },
    description: {
      hu: 'Az LD3500 kifejezetten átlátszó, tamper-evident, wafer-seal és karton-lezáró címkékhez, valamint más nehezen kezelhető átlátszó anyagokhoz készült. Függőleges leválasztólemez segíti a fotoszenzor pontos beállítását átlátszó anyagoknál. Automatikus lehúzás és hordozó-felcsévélés, szerszám nélküli állítás, anodizált alumínium ház. 12 V DC univerzális adapterrel. Amerikai gyártás.',
      en: 'The LD3500 is designed for clear, tamper-evident, wafer-seal and carton-sealing labels and other challenging clear materials. A vertical strip plate improves photosensor adjustment for detecting clear materials. Automatic peeling and liner rewind, tool-free adjustment, anodized aluminum housing. 12V DC with universal transformer. Made in the U.S.A.',
    },
    features: [
      { hu: 'Átlátszó / tamper-evident címkékhez', en: 'For clear / tamper-evident labels' },
      { hu: 'Címkeszélesség 6–57 mm, hossz 13–101 mm', en: 'Label width 6–57 mm, length 13–101 mm' },
      { hu: 'Függőleges leválasztólemez a pontos érzékeléshez', en: 'Vertical strip plate for accurate detection' },
      { hu: 'Adagolási sebesség 56 mm/s', en: 'Feed speed 56 mm/s' },
      { hu: 'Fotoszenzoros pontosság, automatikus hordozó-felcsévélés', en: 'Photosensor accuracy, automatic liner rewind' },
    ],
  },
  {
    slug: 'start-ld6050',
    category: 'cimke-adagolo-gepek',
    name: 'START LD6050',
    brand: 'START International',
    image: '/images/products/ld6050.jpg',
    datasheet: '/datasheets/start-ld6050.pdf',
    short: {
      hu: 'Nagy sebességű elektromos címkeadagoló szélesebb, 121 mm-es címkékhez.',
      en: 'High-speed electric label dispenser for wider, 121 mm labels.',
    },
    description: {
      hu: 'Az LD6050 nagy sebességű elektromos címkeadagoló szélesebb, akár 4,75" (121 mm) széles címkékhez és kivágott alkatrészekhez. Fotoszenzoros lehúzás és továbbítás, automatikus hordozó-felcsévélés, szerszám nélküli állítás és tartós fémfelépítés. Amerikai gyártás.',
      en: 'The LD6050 is a high-speed electric label dispenser for wider labels and die-cut parts up to 4.75" (121 mm) wide. Photosensor peeling and advancing, automatic liner rewind, tool-free adjustment and durable metal construction. Made in the U.S.A.',
    },
    features: [
      { hu: 'Címkeszélesség akár 121 mm', en: 'Label width up to 121 mm' },
      { hu: 'Nagy sebességű adagolás', en: 'High-speed dispensing' },
      { hu: 'Fotoszenzoros pontosság', en: 'Photosensor accuracy' },
      { hu: 'Automatikus hordozó-felcsévélés', en: 'Automatic liner rewind' },
      { hu: 'Tartós fémfelépítés', en: 'Durable metal construction' },
    ],
  },
  {
    slug: 'start-ld8100',
    category: 'cimke-adagolo-gepek',
    name: 'START LD8100',
    brand: 'START International',
    image: '/images/products/ld8100.jpg',
    datasheet: '/datasheets/start-ld8100.pdf',
    short: {
      hu: 'Szupergyors elektromos címkeadagoló hosszú, széles csomagoló-címkékhez.',
      en: 'Super-speed electric label dispenser for long, wide packaging labels.',
    },
    description: {
      hu: 'Az LD8100 szupergyors elektromos címkeadagoló hosszú, csomagolás jellegű címkékhez és kivágott alkatrészekhez. Nagy nyomatékú motor kezeli a nagy átmérőjű (max. 305 mm) tekercsek súlyát, állítható leválasztólemez a nehezen leváló címkékhez. Fotoszenzoros pontosság, automatikus hordozó-felcsévélés, teljes fémfelépítés. Címkeszélesség 6–127 mm, hossz 13–305 mm. Amerikai gyártás.',
      en: 'The LD8100 is a super-speed electric label dispenser for long, packaging-type labels and die-cut parts. A high-torque motor handles the weight of large-diameter rolls (max. 305 mm) and an adjustable strip plate helps with hard-to-release labels. Photosensor accuracy, automatic liner rewind, all-metal construction. Label width 6–127 mm, length 13–305 mm. Made in the U.S.A.',
    },
    features: [
      { hu: 'Címkeszélesség 6–127 mm, hossz 13–305 mm', en: 'Label width 6–127 mm, length 13–305 mm' },
      { hu: 'Max. tekercsátmérő 305 mm', en: 'Max. roll diameter 305 mm' },
      { hu: 'Nagy nyomatékú motor nehéz tekercsekhez', en: 'High-torque motor for heavy rolls' },
      { hu: 'Állítható leválasztólemez', en: 'Adjustable strip plate' },
      { hu: 'Teljes fémfelépítés', en: 'All-metal construction' },
    ],
  },
  {
    slug: 'start-ldx8050',
    category: 'cimke-adagolo-gepek',
    name: 'START LDX8050',
    brand: 'START International',
    image: '/images/products/ldx8050.jpg',
    datasheet: '/datasheets/start-ldx8050.pdf',
    short: {
      hu: 'Nagy sebességű címkeadagoló hosszú, széles (max. 203 mm) címkékhez.',
      en: 'High-speed label dispenser for long, wide labels (up to 203 mm).',
    },
    description: {
      hu: 'Az LDX8050 nagy sebességű elektromos címkeadagoló hosszú, széles csomagoló-címkékhez, akár 8" (203 mm) szélességig. Nagy nyomatékú motor a nagy átmérőjű (max. 305 mm) tekercsekhez, állítható leválasztólemez, fotoszenzoros pontosság, automatikus hordozó-felcsévélés. Adagolási sebesség 99 mm/s. Amerikai gyártás.',
      en: 'The LDX8050 is a high-speed electric label dispenser for long, wide packaging labels up to 8" (203 mm) wide. High-torque motor for large-diameter rolls (max. 305 mm), adjustable strip plate, photosensor accuracy, automatic liner rewind. Feed speed 99 mm/s. Made in the U.S.A.',
    },
    features: [
      { hu: 'Címkeszélesség 6–203 mm, hossz 13–305 mm', en: 'Label width 6–203 mm, length 13–305 mm' },
      { hu: 'Adagolási sebesség 99 mm/s', en: 'Feed speed 99 mm/s' },
      { hu: 'Max. tekercsátmérő 305 mm', en: 'Max. roll diameter 305 mm' },
      { hu: 'Nagy nyomatékú motor', en: 'High-torque motor' },
      { hu: 'Fotoszenzoros pontosság', en: 'Photosensor accuracy' },
    ],
  },
  {
    slug: 'start-ldx8100',
    category: 'cimke-adagolo-gepek',
    name: 'START LDX8100',
    brand: 'START International',
    image: '/images/products/ldx8100.jpg',
    datasheet: '/datasheets/start-ldx8100.pdf',
    short: {
      hu: 'Szupergyors címkeadagoló hosszú, széles címkékhez, 198 mm/s sebességgel.',
      en: 'Super-speed label dispenser for long, wide labels at 198 mm/s.',
    },
    description: {
      hu: 'Az LDX8100 szupergyors elektromos címkeadagoló hosszú, széles csomagoló-címkékhez — az LDX8050 gyorsabb változata, 7,8" (198 mm/s) adagolási sebességgel. Nagy nyomatékú motor a nagy átmérőjű (max. 305 mm) tekercsekhez, állítható leválasztólemez, fotoszenzoros pontosság, automatikus hordozó-felcsévélés. Címkeszélesség 6–203 mm, hossz 13–305 mm. Amerikai gyártás.',
      en: 'The LDX8100 is a super-speed electric label dispenser for long, wide packaging labels — the faster version of the LDX8050 at 7.8" (198 mm/s) feed speed. High-torque motor for large-diameter rolls (max. 305 mm), adjustable strip plate, photosensor accuracy, automatic liner rewind. Label width 6–203 mm, length 13–305 mm. Made in the U.S.A.',
    },
    features: [
      { hu: 'Címkeszélesség 6–203 mm, hossz 13–305 mm', en: 'Label width 6–203 mm, length 13–305 mm' },
      { hu: 'Adagolási sebesség 198 mm/s', en: 'Feed speed 198 mm/s' },
      { hu: 'Max. tekercsátmérő 305 mm', en: 'Max. roll diameter 305 mm' },
      { hu: 'Nagy nyomatékú motor', en: 'High-torque motor' },
      { hu: 'Fotoszenzoros pontosság', en: 'Photosensor accuracy' },
    ],
  },
  {
    slug: 'start-tda080',
    category: 'ragaszto-adagolok',
    name: 'START TDA080',
    brand: 'START International',
    image: '/images/products/tda080.jpg',
    datasheet: '/datasheets/start-tda080.pdf',
    short: {
      hu: 'Elektromos, automata nagy teherbírású szalagadagoló akár 80 mm széles szalaghoz.',
      en: 'Electric automatic heavy-duty tape dispenser for tape up to 80 mm wide.',
    },
    description: {
      hu: 'A TDA080 elektromos, nagy teherbírású automata szalagadagoló, amely a legtöbb szalagtípust automatikusan adagolja és vágja, akár 3,15" (80 mm) szélességig. A kívánt hossz digitálisan programozható, a vágáspontosság ±1 mm. Négy üzemmód: kézi adagolás/kézi vágás, kézi adagolás és vágás, automata adagolás és vágás, valamint intervallumos adagolás és vágás. Tömör fémfelépítés, biztonsági retesz, 3" (76 mm) mag. Amerikai tervezés.',
      en: 'The TDA080 is an electric, heavy-duty automatic tape dispenser that automatically dispenses and cuts most types of tape up to 3.15" (80 mm) wide. The desired length is digitally programmable with ±1 mm cutting accuracy. Four operating modes: manual feed/manual cut, manual feed & cut, auto feed & cut, and interval feed & cut. Solid metal construction, safety interlock, 3" (76 mm) core. Designed in the U.S.A.',
    },
    features: [
      { hu: 'Szalagszélesség 6–80 mm', en: 'Tape width 6–80 mm' },
      { hu: 'Vágáshossz 40–9999 mm', en: 'Cut length 40–9999 mm' },
      { hu: 'Vágáspontosság ±1 mm', en: 'Cutting accuracy ±1 mm' },
      { hu: '4 üzemmód', en: '4 operating modes' },
      { hu: 'Max. tekercsátmérő 220 mm, 3" mag', en: 'Max. roll diameter 220 mm, 3" core' },
    ],
  },
  {
    slug: 'start-tda080-ns',
    category: 'ragaszto-adagolok',
    name: 'START TDA080-NS',
    brand: 'START International',
    image: '/images/products/tda080-ns.jpg',
    datasheet: '/datasheets/start-tda080-ns.pdf',
    short: {
      hu: 'Szalagadagoló erős tapadású, technikai szalagokhoz (VHB, ACX, hab).',
      en: 'Tape dispenser for high-adhesive, technical tapes (VHB, ACX, foam).',
    },
    description: {
      hu: 'A TDA080-NS a TDA080 módosított változata: speciális, lapos adagológörgőkkel a nagy tapadású és technikai szalagokhoz (pl. VHB, ACX, hab, kétoldalas, PET, fátyol). Automatikusan adagolja és vágja szinte az összes szalagtípust akár 3,15" (80 mm) szélességig. Digitálisan programozható hossz, ±1 mm vágáspontosság, négy üzemmód, tömör fémfelépítés. 3" (76 mm) mag. Amerikai tervezés.',
      en: 'The TDA080-NS is a modified TDA080 with special flat advancement rollers for high-adhesive and technical tapes (e.g. VHB, ACX, foam, double-sided, PET, fleece). It automatically dispenses and cuts virtually any tape up to 3.15" (80 mm) wide. Digitally programmable length, ±1 mm cutting accuracy, four operating modes, solid metal construction. 3" (76 mm) core. Designed in the U.S.A.',
    },
    features: [
      { hu: 'Erős tapadású / technikai szalagokhoz', en: 'For high-adhesive / technical tapes' },
      { hu: 'Speciális lapos adagológörgők', en: 'Special flat advancement rollers' },
      { hu: 'Szalagszélesség 6–80 mm', en: 'Tape width 6–80 mm' },
      { hu: 'Vágáshossz 40–9999 mm, ±1 mm pontosság', en: 'Cut length 40–9999 mm, ±1 mm accuracy' },
      { hu: '4 üzemmód, tömör fémfelépítés', en: '4 operating modes, solid metal build' },
    ],
  },
  {
    slug: 'start-tda150-m',
    category: 'ragaszto-adagolok',
    name: 'START TDA150-M',
    brand: 'START International',
    image: '/images/products/tda150-m.jpg',
    datasheet: '/datasheets/start-tda150-m.pdf',
    short: {
      hu: 'Nagy teherbírású szalagadagoló akár 150 mm széles szalaghoz, 5 hossz memóriával.',
      en: 'Heavy-duty tape dispenser for tape up to 150 mm wide, with 5-length memory.',
    },
    description: {
      hu: 'A TDA150-M elektromos, nagy teherbírású automata szalagadagoló nagyon széles, akár 5,9" (150 mm) szalagokhoz, programozható 5 hosszúság-memóriával. Digitálisan beállítható hossz, ±1 mm vágáspontosság, négy üzemmód, guillotine egyenes vágás. Biztonsági rendszer megakadályozza a vágó működését, ha idegen tárgy (ujj, szerszám) van jelen. Tömör fémfelépítés, minden fém fogaskerék és görgő, 3" (76 mm) mag. Amerikai gyártás.',
      en: 'The TDA150-M is an electric, heavy-duty automatic tape dispenser for very wide tapes up to 5.9" (150 mm), with a programmable 5-length memory. Digitally adjustable length, ±1 mm cutting accuracy, four operating modes, guillotine straight cut. A safety system prevents cutter activation when a foreign object (finger, tool) is present. Solid metal construction with all-metal gears and rollers, 3" (76 mm) core. Made in the U.S.A.',
    },
    features: [
      { hu: 'Szalagszélesség 6–150 mm', en: 'Tape width 6–150 mm' },
      { hu: 'Programozható 5 hossz memória', en: 'Programmable 5-length memory' },
      { hu: 'Vágáshossz 40–9999 mm, ±1 mm pontosság', en: 'Cut length 40–9999 mm, ±1 mm accuracy' },
      { hu: 'Biztonsági vágóvédelem', en: 'Safety cutter guard' },
      { hu: 'Minden fém fogaskerék és görgő', en: 'All-metal gears and rollers' },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.category === categorySlug);
}

export function getProduct(categorySlug: string, productSlug: string): Product | undefined {
  return products.find((p) => p.category === categorySlug && p.slug === productSlug);
}

export function getManufacturer(slug: string): Manufacturer | undefined {
  return manufacturers.find((m) => m.slug === slug);
}

export function getApplicator(
  categorySlug: string,
  productSlug: string,
  applicatorSlug: string,
): { product: Product; applicator: Applicator } | undefined {
  const product = getProduct(categorySlug, productSlug);
  const applicator = product?.applicators?.find((a) => a.slug === applicatorSlug);
  if (!product || !applicator) return undefined;
  return { product, applicator };
}

export function getProductsByBrand(brand: string): Product[] {
  return products.filter((p) => p.brand === brand);
}

/** Márka → logó feloldás a gyártók listája alapján. */
export function getBrandLogo(brand: string): string | undefined {
  return manufacturers.find((m) => m.brand === brand)?.logo;
}
