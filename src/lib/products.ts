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
}

export interface Applicator {
  image: string;
  name: LocalizedText;
  description: LocalizedText;
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
    applicators: [
      {
        image: '/images/applicators/hq-tamp.jpg',
        name: { hu: 'Szúrópárnás (tamp-on) applikátor', en: 'Tamp-on applicator' },
        description: {
          hu: 'A szúrópárna a kinyomtatott címkét sík felületre nyomja rá, valós időben.',
          en: 'The tamp pad presses the printed label onto flat surfaces, in real time.',
        },
        videoId: 'HG9eudLWxfM',
      },
      {
        image: '/images/applicators/hq-formpad.jpg',
        name: { hu: 'Formapárnás (form pad) applikátor', en: 'Form-pad applicator' },
        description: {
          hu: 'Formapárna íves és hengeres felületekre — pontos, buborékmentes felhelyezés.',
          en: 'A form pad for curved and cylindrical surfaces — precise, bubble-free application.',
        },
        videoId: 'P-9HXQJ-Lds',
      },
      {
        image: '/images/applicators/hq-blow.jpg',
        name: { hu: 'Fújó (blow-on) applikátor', en: 'Blow-on applicator' },
        description: {
          hu: 'A címkét légsugár fújja a felületre 5–10 mm távolságból, érintés nélkül.',
          en: 'The label is blown onto the surface from 5–10 mm away, contactlessly.',
        },
        videoId: 'mzq7QKgfb1Q',
      },
      {
        image: '/images/applicators/hq-flag.jpg',
        name: { hu: 'Zászlós (flag) applikátor', en: 'Flag applicator' },
        description: {
          hu: 'Zászlós applikátor (HQ 4712): kábelekre és kerek tárgyakra hajtja rá a címkét zászlóként.',
          en: 'Flag applicator (HQ 4712): wraps the label as a flag onto cables and round objects.',
        },
        videoId: 'SV0G6Z2yb-4',
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

export function getProductsByBrand(brand: string): Product[] {
  return products.filter((p) => p.brand === brand);
}

/** Márka → logó feloldás a gyártók listája alapján. */
export function getBrandLogo(brand: string): string | undefined {
  return manufacturers.find((m) => m.brand === brand)?.logo;
}
