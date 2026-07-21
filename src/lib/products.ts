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
  /** YouTube videó azonosító (beágyazáshoz) */
  videoId?: string;
  /** GLB modell útvonala a public mappán belül */
  model3d?: string;
  /** true, amíg a 3D modell csak bemutató minta, nem a valós termék */
  model3dIsDemo?: boolean;
}

export interface Manufacturer {
  slug: string;
  /** A Product.brand mezővel egyező megjelenítendő név. */
  brand: string;
  name: string;
  description: LocalizedText;
}

export const manufacturers: Manufacturer[] = [
  {
    slug: 'cab',
    brand: 'CAB',
    name: 'cab',
    description: {
      hu: 'Címkenyomtatók, print & apply rendszerek, címkeadagolók és gravírozó lézerek — német gyártás, az ipar minden területére.',
      en: 'Label printers, print & apply systems, label dispensers and marking lasers — German engineering for every area of industry.',
    },
  },
  {
    slug: 'postek',
    brand: 'POSTEK',
    name: 'POSTEK',
    description: {
      hu: 'Robusztus ipari és asztali címkenyomtatók egyszerű nyomtatási feladatoktól az RFID-címkézésig, kiváló ár-érték aránnyal.',
      en: 'Robust industrial and desktop label printers from simple printing tasks to RFID labeling, with excellent value for money.',
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
      hu: 'NiceLabel és LabelJoy címketervező és -nyomtató szoftverek.',
      en: 'NiceLabel and LabelJoy label design and printing software.',
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
    image: '/images/products/squix4.jpg',
    videoId: 'o2eKZGETCPk',
    model3d: '/models/demo.glb',
    model3dIsDemo: true,
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
    image: '/images/products/squix2.jpg',
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
    image: '/images/products/eos2.jpg',
    videoId: 'RqS25uZIMnU',
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
    image: '/images/products/eos5.jpg',
    videoId: 'RqS25uZIMnU',
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
    image: '/images/products/mach1.jpg',
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
    image: '/images/products/mach2.jpg',
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
    image: '/images/products/mach4s.jpg',
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
    image: '/images/products/xc4.jpg',
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
    image: '/images/products/xc6.jpg',
  },

  // ——— CAB — további címkenyomtatók ———
  {
    slug: 'cab-squix-6',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 6.3',
    brand: 'CAB',
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
  },

  // ——— CAB — Címke-adagoló gépek ———
  {
    slug: 'cab-hs',
    category: 'cimke-adagolo-gepek',
    name: 'CAB HS',
    brand: 'CAB',
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
  },
  {
    slug: 'cab-fl-plus',
    category: 'lezer-gravirozok',
    name: 'CAB FL+',
    brand: 'CAB',
    short: {
      hu: 'Precíz, gyors és gazdaságos cab fiber lézerek ipari jelöléshez.',
      en: 'Precise, fast and economical cab fiber lasers for industrial marking.',
    },
    description: {
      hu: 'Az FL+ fiber lézerek a precíz, gyors és gazdaságos ipari jelölés eszközei — tartós, karbantartásmentes jelölés fémeken és műszaki műanyagokon.',
      en: 'The FL+ fiber lasers deliver precise, fast and economical industrial marking — durable, maintenance-free marking on metals and technical plastics.',
    },
    features: [
      { hu: 'Precíz, gyors fiber jelölés', en: 'Precise, fast fiber marking' },
      { hu: 'Alacsony üzemeltetési költség', en: 'Low operating cost' },
      { hu: 'Fém és műszaki műanyag', en: 'Metals and technical plastics' },
      { hu: 'Integrációs lehetőségek', en: 'Integration options' },
    ],
  },

  // ——— CAB — Szoftver ———
  {
    slug: 'cab-cablabel-s3',
    category: 'szoftverek',
    name: 'cablabel S3',
    brand: 'CAB',
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
  },

  // ——— POSTEK — címkenyomtató sorozatok ———
  {
    slug: 'postek-ox',
    category: 'cimkenyomtatok',
    name: 'POSTEK OX',
    brand: 'POSTEK',
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
