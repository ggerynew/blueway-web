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
  image: string;
  /** YouTube videó azonosító (beágyazáshoz) */
  videoId?: string;
  /** GLB modell útvonala a public mappán belül */
  model3d?: string;
  /** true, amíg a 3D modell csak bemutató minta, nem a valós termék */
  model3dIsDemo?: boolean;
}

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
