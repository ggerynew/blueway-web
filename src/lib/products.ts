import type { Locale } from './i18n';

export type LocalizedText = Record<Locale, string>;

/** Adatbeviteli forma: hu + en kötelező, a többi nyelv opcionális (angol fallback). */
export type LocalizedSource = { hu: string; en: string } & Partial<
  Record<Exclude<Locale, 'hu' | 'en'>, string>
>;
export type Sourced<T> = T extends LocalizedText
  ? LocalizedSource
  : T extends string | number | boolean | null | undefined
    ? T
    : T extends readonly (infer U)[]
      ? Sourced<U>[]
      : T extends object
        ? { [K in keyof T]: Sourced<T[K]> }
        : T;

/** A hiányzó fordításokat angolra ejti vissza minden LocalizedText mezőben. */
export function localize<T>(data: Sourced<T>): T {
  const fill = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(fill);
    if (node && typeof node === 'object') {
      const rec = node as Record<string, unknown>;
      if (typeof rec.hu === 'string' && typeof rec.en === 'string') {
        return { de: rec.en, ko: rec.en, zh: rec.en, it: rec.en, es: rec.en, ...rec };
      }
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(rec)) out[k] = fill(rec[k]);
      return out;
    }
    return node;
  };
  return fill(data) as T;
}

/** A terméknév a megadott nyelven; ahol nincs fordítás, a típusnév marad. */
export function productName(product: Product, lang: Locale): string {
  return product.displayName?.[lang] ?? product.name;
}

export interface Category {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
}

export interface Product {
  slug: string;
  category: string;
  /** Típusnév — egyben azonosító a szövegbeli hivatkozásokhoz. */
  name: string;
  /**
   * Megjelenítendő név, ha a típusnév köznyelvi szót tartalmaz (pl. „DNP
   * festékszalagok”), és az minden nyelven magyarul jelenne meg.
   */
  displayName?: LocalizedText;
  brand: string;
  short: LocalizedText;
  description: LocalizedText;
  features: LocalizedText[];
  /** Termékfotó a public mappán belül; ha hiányzik, placeholder jelenik meg. */
  image?: string;
  /** Letölthető adatlap (PDF) a public mappán belül. */
  datasheet?: string;
  /**
   * A gyártó hivatalos letöltési linkje az ingyenes verzióhoz. Szándékosan
   * külső URL, nem helyben tárolt fájl: így mindig a friss kiadás töltődik
   * le, és a telepítő terjesztése a gyártó oldaláról történik.
   */
  download?: string;
  /**
   * A letöltés gomb felirata, ha nem az alapértelmezett „ingyenes verzió"
   * illik rá — a NiceLabel például nem ingyenes kiadás, hanem 30 napos
   * próbaverzió, és a gombnak ezt kell mondania.
   */
  downloadLabel?: LocalizedText;
  /** YouTube videó azonosító (beágyazáshoz) */
  videoId?: string;
  /** Márkalogó felülbírálás, ha a márka nem szerepel a gyártók között (pl. Loftware) */
  brandLogo?: string;
  /** További, gombként megjelenő videók saját megnevezéssel */
  extraVideos?: { videoId: string; label: LocalizedText }[];
  /** GLB modell útvonala a public mappán belül */
  model3d?: string;
  /** true, amíg a 3D modell csak bemutató minta, nem a valós termék */
  model3dIsDemo?: boolean;
  /** Kapcsolódó applikátorok (pl. HERMES Q print & apply) */
  applicators?: Applicator[];
  /**
   * Ugyanannak a gépnek a változatai (pl. Purex 400 / 400i / 400i PVC).
   *
   * Nem külön termék: a gép ugyanaz, csak a szűrés, a szekrénymagasság vagy a
   * bevonat más az adott feladathoz. Ezért nem kap saját aloldalt, hanem a
   * terméklapon egy táblázatban látszik — öt változat különbségét prózában
   * nem lehet olvashatóan leírni.
   */
  variants?: ProductVariant[];
  /**
   * A változatok blokk bevezetője, ha az alapértelmezett nem illik rá.
   *
   * A szótárbeli szöveg az elszívókra készült („a szűrés, a szekrénymagasság
   * és a bevonat különbözik”), az pedig például az RFID-antennáknál értelmetlen
   * lenne. Ha nincs megadva, marad a szótárbeli.
   */
  variantsLead?: LocalizedText;
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

/** Egy termékváltozat: mire való, miben tér el, és hol az adatlapja. */
export interface ProductVariant {
  /** Típusjelzés, ahogy a gyártó írja (pl. „400i PVC”). */
  name: string;
  /** Mire való ez a változat — a gyártó saját megfogalmazása alapján. */
  purpose: LocalizedText;
  /** A változatot megkülönböztető adatok (magasság, tömeg, szűrők). */
  params?: ApplicatorParam[];
  /** A változat gyári adatlapja a public mappán belül. */
  datasheet?: string;
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
  /**
   * Alkalmazási területek: hol és mire használják a gyártó gépeit.
   *
   * Elszívóknál ez a legfontosabb kérdés — nem a gép adatai döntenek, hanem
   * hogy milyen folyamat milyen szennyezőt termel. Ezért iparáganként külön
   * bekezdés, nem egyetlen felsorolás.
   */
  industries?: { name: LocalizedText; text: LocalizedText }[];
}

const manufacturersSource: Sourced<Manufacturer[]> = [
  {
    slug: 'cab',
    brand: 'CAB',
    name: 'cab',
    logo: '/images/brand/cab-logo.png',
    description: {
      hu: 'Címkenyomtatók, print & apply rendszerek, címkeadagolók és gravírozó lézerek — német gyártás, az ipar minden területére.',
      en: 'Label printers, print & apply systems, label dispensers and marking lasers — German engineering for every area of industry.', it: 'Stampanti per etichette, sistemi stampa e applica, spellicolatori di etichette e laser per marcatura — ingegneria tedesca per ogni settore industriale.', es: 'Impresoras de etiquetas, sistemas de imprimir y aplicar, dispensadores de etiquetas y láseres de marcaje — ingeniería alemana para cada área de la industria.', de: 'Etikettendrucker, Print-and-Apply-Systeme, Etikettenspender und Markierlaser — deutsche Ingenieurskunst für jeden Industriebereich.', ko: '라벨 프린터, 프린트 & 어플라이 시스템, 라벨 디스펜서 및 마킹 레이저 — 산업 전 분야를 위한 독일 엔지니어링.', zh: '标签打印机、打印贴标系统、标签剥离机与激光打标机——德国工程品质，覆盖工业各个领域。',
    },
  },
  {
    slug: 'postek',
    brand: 'POSTEK',
    name: 'POSTEK',
    logo: '/images/brand/postek-logo.png',
    description: {
      hu: 'Robusztus ipari és asztali címkenyomtatók egyszerű nyomtatási feladatoktól az RFID-címkézésig, kiváló ár-érték aránnyal.',
      en: 'Robust industrial and desktop label printers from simple printing tasks to RFID labeling, with excellent value for money.', it: 'Stampanti per etichette industriali e desktop robuste, dalle semplici attività di stampa all’etichettatura RFID, con un eccellente rapporto qualità-prezzo.', es: 'Impresoras de etiquetas industriales y de sobremesa robustas, desde tareas de impresión sencillas hasta el etiquetado RFID, con una excelente relación calidad-precio.', de: 'Robuste Industrie- und Desktop-Etikettendrucker von einfachen Druckaufgaben bis zur RFID-Etikettierung, mit hervorragendem Preis-Leistungs-Verhältnis.', ko: '간단한 인쇄 작업부터 RFID 라벨링까지, 뛰어난 가성비를 갖춘 견고한 산업용 및 데스크톱 라벨 프린터.', zh: '坚固的工业级与桌面型标签打印机，从简单打印任务到 RFID 标签打印，性价比出色。',
    },
  },
  {
    slug: 'tykma-electrox',
    brand: 'Tykma Electrox',
    name: 'TYKMA Electrox',
    logo: '/images/brand/tykma-logo.png',
    description: {
      hu: 'Ipari fiber-, CO₂- és UV-lézeres jelölő- és gravírozórendszerek több mint 60 év tapasztalattal — asztali gépektől az integrációs lézerekig.',
      en: 'Industrial fiber, CO₂ and UV laser marking and engraving systems with over 60 years of experience — from benchtop machines to integration lasers.', it: 'Sistemi industriali di marcatura e incisione laser in fibra, CO₂ e UV con oltre 60 anni di esperienza — dalle macchine da banco ai laser da integrazione.', es: 'Sistemas industriales de marcaje y grabado láser de fibra, CO₂ y UV con más de 60 años de experiencia — desde máquinas de sobremesa hasta láseres de integración.', de: 'Industrielle Faser-, CO₂- und UV-Systeme für Lasermarkierung und Gravur mit über 60 Jahren Erfahrung — vom Tischgerät bis zum Integrationslaser.', ko: '60년 이상의 경험을 바탕으로 한 산업용 파이버, CO₂ 및 UV 레이저 마킹·각인 시스템 — 벤치탑 장비부터 통합형 레이저까지.', zh: '工业级光纤、CO₂ 与 UV 激光打标与雕刻系统，拥有 60 余年经验——从台式设备到集成式激光器。',
    },
  },
  {
    slug: 'dnp',
    brand: 'DNP',
    name: 'DNP',
    logo: '/images/brand/dnp-logo.png',
    description: {
      hu: 'Prémium termotranszfer festékszalagok — wax, wax/resin és resin kivitelben, a világ egyik vezető gyártójától.',
      en: 'Premium thermal transfer ribbons — wax, wax/resin and resin, from one of the world’s leading manufacturers.', it: 'Ribbon a trasferimento termico premium — Wax, Wax-Resin e Resin, da uno dei principali produttori al mondo.', es: 'Ribbons de transferencia térmica premium — Wax, Wax-Resin y Resin, de uno de los principales fabricantes del mundo.', de: 'Premium-Thermotransfer-Farbbänder — Wax, Wax-Resin und Resin, von einem der weltweit führenden Hersteller.', ko: '프리미엄 열전사 리본 — 세계 유수의 제조사가 생산하는 Wax, Wax/Resin 및 Resin 타입.', zh: '高品质热转印碳带——蜡基、混合基与树脂基，出自全球领先制造商之一。',
    },
  },
  {
    slug: 'armor-iimak',
    brand: 'ARMOR-IIMAK',
    name: 'ARMOR-IIMAK',
    logo: '/images/brand/armor-iimak-logo.png',
    description: {
      hu: 'Termotranszfer festékszalagok flat-head és near-edge nyomtatókhoz — wax, wax/resin és resin családok.',
      en: 'Thermal transfer ribbons for flat-head and near-edge printers — wax, wax/resin and resin families.', it: 'Ribbon a trasferimento termico per stampanti flat-head e near-edge — famiglie Wax, Wax-Resin e Resin.', es: 'Ribbons de transferencia térmica para impresoras flat-head y near-edge — familias Wax, Wax-Resin y Resin.', de: 'Thermotransfer-Farbbänder für Flat-Head- und Near-Edge-Drucker — Wax-, Wax-Resin- und Resin-Familien.', ko: '플랫 헤드 및 니어 엣지 프린터용 열전사 리본 — Wax, Wax/Resin 및 Resin 제품군.', zh: '适用于平压式与近端式打印机的热转印碳带——蜡基、混合基与树脂基系列。',
    },
  },
  {
    slug: 'start-international',
    brand: 'START International',
    name: 'START International',
    logo: '/images/brand/start-logo.jpg',
    description: {
      hu: 'Elektromos, automata címkeadagoló és szalagadagoló gépek ipari felhasználásra — amerikai gyártás, robusztus fémfelépítéssel.',
      en: 'Electric, automatic label and tape dispensers for industrial use — US-made, with robust metal construction.', it: 'Spellicolatori automatici elettrici di etichette e dispenser per nastro adesivo per uso industriale — produzione USA, con robusta struttura metallica.', es: 'Dispensadores eléctricos y automáticos de etiquetas y de cinta adhesiva para uso industrial — fabricados en EE. UU., con una robusta construcción metálica.', de: 'Elektrische, automatische Etiketten- und Klebebandspender für den Industrieeinsatz — hergestellt in den USA, mit robuster Metallkonstruktion.', ko: '산업용 전동 자동 라벨 및 테이프 디스펜서 — 견고한 금속 구조의 미국산 제품.', zh: '工业用电动自动标签剥离机与胶带切割机——美国制造，坚固的金属结构。',
    },
  },
  {
    slug: 'purex',
    brand: 'Purex',
    name: 'Purex International',
    logo: '/images/brand/purex-logo.webp',
    industries: [
      {
        name: { hu: 'Lézeres jelölés és gravírozás', en: 'Laser marking and engraving', it: 'Marcatura e incisione laser', es: 'Marcaje y grabado láser', de: 'Laserbeschriftung und -gravur', ko: '레이저 마킹 및 각인', zh: '激光打标与雕刻' },
        text: {
          hu: 'A lézer elégeti vagy elpárologtatja az anyag felszínét, és az így keletkező részecskék és gőzök nemcsak a kezelőt veszélyeztetik: lerakódnak az optikán, és rontják a lézer teljesítményét. A gravírozás mélyebb barázdát vág, mint a felületi jelölés, tehát több anyagot párologtat el — ott nagyobb elszívás kell. PVC jelölésekor sósav is keletkezik, ami a berendezést is marja; erre való a PVC-változat.',
          en: 'The laser burns or vaporises the surface of the material, and the resulting particles and vapours do not only endanger the operator: they settle on the optics and degrade laser performance. Engraving cuts deeper grooves than surface marking, so it vaporises more material and needs more extraction. Marking PVC also releases hydrochloric acid, which corrodes the equipment itself — that is what the PVC version is for.', it: 'Il laser brucia o vaporizza la superficie del materiale e le particelle e i vapori che ne derivano non mettono in pericolo solo l’operatore: si depositano sulle ottiche e riducono le prestazioni del laser. L’incisione crea solchi più profondi della marcatura superficiale, quindi vaporizza più materiale e richiede un’aspirazione maggiore. La marcatura del PVC libera anche acido cloridrico, che corrode l’apparecchiatura stessa: a questo serve la versione PVC.', es: 'El láser quema o vaporiza la superficie del material, y las partículas y vapores resultantes no solo ponen en peligro al operario: se depositan en la óptica y degradan el rendimiento del láser. El grabado corta surcos más profundos que el marcaje superficial, por lo que vaporiza más material y necesita más extracción. El marcaje de PVC libera además ácido clorhídrico, que corroe el propio equipo: para eso está la versión de PVC.', de: 'Der Laser verbrennt oder verdampft die Materialoberfläche, und die dabei entstehenden Partikel und Dämpfe gefährden nicht nur den Bediener: Sie setzen sich auf der Optik ab und mindern die Laserleistung. Gravieren erzeugt tiefere Rillen als eine Oberflächenmarkierung, verdampft also mehr Material und erfordert mehr Absaugung. Beim Beschriften von PVC entsteht zudem Salzsäure, die das Gerät selbst angreift — dafür gibt es die PVC-Ausführung.', ko: '레이저는 소재 표면을 태우거나 기화시키며, 이때 발생하는 입자와 증기는 작업자만 위협하는 것이 아닙니다. 광학계에 쌓여 레이저 성능을 떨어뜨립니다. 각인은 표면 마킹보다 깊은 홈을 파므로 기화되는 물질이 많아 더 큰 집진 용량이 필요합니다. PVC를 마킹하면 염산도 발생해 장비 자체를 부식시키므로 PVC 전용 버전이 필요합니다.', zh: '激光会灼烧或气化材料表面，由此产生的颗粒和蒸气不仅危害操作人员，还会沉积在光学元件上、降低激光性能。雕刻切出的沟槽比表面打标更深，气化的材料更多，因而需要更大的抽风量。打标 PVC 时还会产生盐酸，会腐蚀设备本身——这正是 PVC 版本的用途。',
        },
      },
      {
        name: { hu: 'Elektronikai gyártás', en: 'Electronics manufacturing', it: 'Produzione elettronica', es: 'Fabricación electrónica', de: 'Elektronikfertigung', ko: '전자 제조', zh: '电子制造' },
        text: {
          hu: 'Kézi, szelektív és hullámforrasztás, konformbevonatolás, lézeres panelszétválasztás: a hő és a nyomás fémgőzt szabadít fel, a bevonatok pedig oldószergőzt. Ezek tartós belélegzése maradandó tüdőkárosodáshoz vezet. Több forrasztóhely egyetlen gépről is ellátható, így nem kell munkaállomásonként külön berendezés.',
          en: 'Hand, selective and wave soldering, conformal coating, laser depaneling: heat and pressure release metal vapours, and coatings release solvent fumes. Long-term inhalation leads to irreversible lung damage. Several soldering positions can be served from a single machine, so a separate unit per workstation is not needed.', it: 'Saldatura manuale, selettiva e a onda, conformal coating, depanelizzazione laser: calore e pressione liberano vapori metallici e i rivestimenti emettono vapori di solvente. L’inalazione prolungata provoca danni polmonari irreversibili. Da una sola macchina si possono servire più postazioni di saldatura, evitando un’unità separata per ogni banco.', es: 'Soldadura manual, selectiva y por ola, recubrimiento conformado, despaneleado láser: el calor y la presión liberan vapores metálicos y los recubrimientos emiten vapores de disolvente. La inhalación prolongada provoca daños pulmonares irreversibles. Desde una sola máquina se pueden atender varios puestos de soldadura, evitando una unidad por cada puesto de trabajo.', de: 'Hand-, Selektiv- und Wellenlöten, Schutzlackierung, Laser-Nutzentrennen: Hitze und Druck setzen Metalldämpfe frei, Beschichtungen Lösemitteldämpfe. Dauerhaftes Einatmen führt zu irreversiblen Lungenschäden. Mehrere Lötplätze lassen sich von einer Maschine versorgen, ein eigenes Gerät je Arbeitsplatz ist also nicht nötig.', ko: '수동·선택·웨이브 솔더링, 컨포멀 코팅, 레이저 디패널링 공정에서는 열과 압력으로 금속 증기가, 코팅에서는 용제 증기가 발생합니다. 장기간 흡입하면 되돌릴 수 없는 폐 손상으로 이어집니다. 한 대로 여러 솔더링 지점을 담당할 수 있어 작업대마다 별도 장비를 둘 필요가 없습니다.', zh: '手工焊、选择性焊、波峰焊、三防漆涂覆、激光分板：高温与压力会释放金属蒸气，涂层则释放溶剂蒸气。长期吸入会造成不可逆的肺部损伤。一台设备可服务多个焊接工位，无需每个工位单独配置。',
        },
      },
      {
        name: { hu: '3D nyomtatás (additív gyártás)', en: 'Additive manufacturing (3D printing)', it: 'Produzione additiva (stampa 3D)', es: 'Fabricación aditiva (impresión 3D)', de: 'Additive Fertigung (3D-Druck)', ko: '적층 제조(3D 프린팅)', zh: '增材制造（3D 打印）' },
        text: {
          hu: 'Az FDM, az SLS és a DLP eljárás egyaránt illékony szerves vegyületeket (VOC) és ultrafinom részecskéket bocsát ki — az ABS filament és a folyékony gyanta kikeményítése különösen. A belélegzésük légúti panaszt, szem- és orrnyálkahártya-gyulladást okozhat. Az elszívás nem lassítja a nyomtatási folyamatot.',
          en: 'FDM, SLS and DLP processes all emit volatile organic compounds (VOCs) and ultrafine particles — ABS filament and the curing of liquid resin especially. Inhaling them can cause respiratory complaints and inflammation of the eyes and nasal mucosa. Extraction does not slow the printing process.', it: 'I processi FDM, SLS e DLP emettono tutti composti organici volatili (COV) e particelle ultrafini, in particolare il filamento ABS e la polimerizzazione della resina liquida. La loro inalazione può causare disturbi respiratori e infiammazione degli occhi e della mucosa nasale. L’aspirazione non rallenta il processo di stampa.', es: 'Los procesos FDM, SLS y DLP emiten compuestos orgánicos volátiles (COV) y partículas ultrafinas, especialmente el filamento ABS y el curado de resina líquida. Su inhalación puede provocar molestias respiratorias e inflamación de los ojos y la mucosa nasal. La extracción no ralentiza el proceso de impresión.', de: 'FDM-, SLS- und DLP-Verfahren geben flüchtige organische Verbindungen (VOC) und ultrafeine Partikel ab — besonders ABS-Filament und das Aushärten von Flüssigharz. Das Einatmen kann Atembeschwerden sowie Reizungen von Augen und Nasenschleimhaut verursachen. Die Absaugung verlangsamt den Druckprozess nicht.', ko: 'FDM, SLS, DLP 공정은 모두 휘발성 유기화합물(VOC)과 초미세 입자를 배출하며, 특히 ABS 필라멘트와 액상 레진 경화 과정에서 두드러집니다. 이를 흡입하면 호흡기 이상과 눈·코 점막 염증이 생길 수 있습니다. 집진은 출력 공정을 늦추지 않습니다.', zh: 'FDM、SLS 与 DLP 工艺都会释放挥发性有机化合物（VOC）和超细颗粒物，ABS 线材与液态树脂固化尤为明显。吸入后可能引起呼吸道不适以及眼、鼻黏膜发炎。抽风不会拖慢打印过程。',
        },
      },
      {
        name: { hu: 'Fogtechnika', en: 'Dental laboratories', it: 'Odontotecnica', es: 'Laboratorios dentales', de: 'Dentaltechnik', ko: '치과 기공', zh: '牙科技工' },
        text: {
          hu: 'A cirkónium-oxid (Zr) csiszolásakor keletkező por és a monomergőzök tartós terhelést jelentenek a fogtechnikai laborokban. Mindkettő ultrafinom, tehát a hagyományos porszívó nem fogja meg — HEPA-szűrés kell hozzá.',
          en: 'The dust produced when grinding zirconia (Zr) and monomer fumes are a constant burden in dental laboratories. Both are ultrafine, so an ordinary vacuum cleaner will not capture them — HEPA filtration is required.', it: 'La polvere prodotta dalla molatura della zirconia (Zr) e i vapori dei monomeri rappresentano un carico costante nei laboratori odontotecnici. Entrambi sono ultrafini, quindi un normale aspirapolvere non li trattiene: serve la filtrazione HEPA.', es: 'El polvo generado al mecanizar zirconia (Zr) y los vapores de monómeros suponen una carga constante en los laboratorios dentales. Ambos son ultrafinos, por lo que una aspiradora convencional no los retiene: hace falta filtración HEPA.', de: 'Der beim Schleifen von Zirkonoxid (Zr) entstehende Staub und Monomerdämpfe belasten Dentallabore dauerhaft. Beide sind ultrafein, ein gewöhnlicher Staubsauger hält sie also nicht zurück — dafür ist HEPA-Filtration nötig.', ko: '지르코니아(Zr)를 연마할 때 생기는 분진과 모노머 증기는 치과 기공소에 지속적인 부담이 됩니다. 둘 다 초미세 입자여서 일반 진공청소기로는 포집되지 않으며 HEPA 여과가 필요합니다.', zh: '打磨氧化锆（Zr）产生的粉尘与单体蒸气会持续危害牙科技工室。二者均为超细颗粒，普通吸尘器无法捕集，必须采用 HEPA 过滤。',
        },
      },
      {
        name: { hu: 'Járműipar', en: 'Automotive', it: 'Settore automotive', es: 'Sector de automoción', de: 'Automobilindustrie', ko: '자동차 산업', zh: '汽车行业' },
        text: {
          hu: 'Alkatrészgyártásnál a vágás, hegesztés és felületkezelés füstöt és port termel; a fényezésnél króm- és ólomtartalmú festékrészecskék kerülnek a levegőbe; a műhelyben járó motor pedig szén-monoxidot, nitrogén-oxidokat, formaldehidet és benzolt bocsát ki. Mindhárom más szűrést kíván.',
          en: 'In parts manufacturing, cutting, welding and surface treatment produce fume and dust; painting puts paint particles containing chromium and lead into the air; and an engine running in the workshop emits carbon monoxide, nitrogen oxides, formaldehyde and benzene. All three call for different filtration.', it: 'Nella produzione di componenti, taglio, saldatura e trattamento superficiale generano fumi e polveri; la verniciatura immette nell’aria particelle di vernice contenenti cromo e piombo; un motore acceso in officina emette monossido di carbonio, ossidi di azoto, formaldeide e benzene. I tre casi richiedono filtrazioni diverse.', es: 'En la fabricación de piezas, el corte, la soldadura y el tratamiento superficial generan humo y polvo; el pintado libera al aire partículas de pintura con cromo y plomo; y un motor en marcha dentro del taller emite monóxido de carbono, óxidos de nitrógeno, formaldehído y benceno. Los tres casos exigen filtraciones distintas.', de: 'In der Teilefertigung erzeugen Schneiden, Schweißen und Oberflächenbehandlung Rauch und Staub; beim Lackieren gelangen chrom- und bleihaltige Lackpartikel in die Luft; und ein in der Werkstatt laufender Motor stößt Kohlenmonoxid, Stickoxide, Formaldehyd und Benzol aus. Alle drei erfordern eine unterschiedliche Filterung.', ko: '부품 제조에서는 절단, 용접, 표면 처리로 흄과 분진이 발생하고, 도장에서는 크롬과 납이 포함된 도료 입자가 공기 중으로 퍼지며, 작업장에서 가동되는 엔진은 일산화탄소, 질소산화물, 폼알데하이드, 벤젠을 배출합니다. 세 경우 모두 서로 다른 여과 방식이 필요합니다.', zh: '零部件制造中的切割、焊接与表面处理会产生烟尘；喷漆会将含铬、含铅的漆雾颗粒带入空气；车间内运转的发动机则排放一氧化碳、氮氧化物、甲醛与苯。三者所需的过滤方式各不相同。',
        },
      },
      {
        name: { hu: 'Laborok, gyógyszer- és vegyipar', en: 'Laboratories, pharmaceutical and chemical', it: 'Laboratori, farmaceutico e chimico', es: 'Laboratorios, farmacia y química', de: 'Labore, Pharma und Chemie', ko: '실험실, 제약 및 화학', zh: '实验室、制药与化工' },
        text: {
          hu: 'Oldószerek (aceton, etil-acetát), hatóanyag-szintézis, tisztatéri munka: itt a gázfázis a fő kockázat, nem a por. Ehhez erősebb kémiai szűrés kell, ózonnal járó folyamatoknál pedig önálló ózonérzékelő — a szűrő telítődését ugyanis szagról nem lehet megbízhatóan észrevenni.',
          en: 'Solvents (acetone, ethyl acetate), active-ingredient synthesis, cleanroom work: here the gas phase is the main risk, not dust. This calls for heavier chemical filtration, and for processes involving ozone, a dedicated ozone sensor — because filter saturation cannot be reliably detected by smell.', it: 'Solventi (acetone, acetato di etile), sintesi di principi attivi, lavoro in camera bianca: qui il rischio principale è la fase gassosa, non la polvere. Serve una filtrazione chimica più spinta e, nei processi che comportano ozono, un sensore dedicato all’ozono, perché la saturazione del filtro non è rilevabile in modo affidabile dall’odore.', es: 'Disolventes (acetona, acetato de etilo), síntesis de principios activos, trabajo en sala limpia: aquí el riesgo principal es la fase gaseosa, no el polvo. Esto exige una filtración química más exigente y, en procesos con ozono, un sensor de ozono específico, porque la saturación del filtro no puede detectarse de forma fiable por el olor.', de: 'Lösemittel (Aceton, Ethylacetat), Wirkstoffsynthese, Reinraumarbeit: Hier ist die Gasphase das Hauptrisiko, nicht der Staub. Das erfordert eine stärkere Chemiefiltration und bei Prozessen mit Ozon einen eigenen Ozonsensor — denn die Sättigung des Filters lässt sich am Geruch nicht zuverlässig erkennen.', ko: '용제(아세톤, 에틸아세테이트), 원료의약품 합성, 클린룸 작업에서는 분진보다 기체 상태가 주된 위험입니다. 이를 위해 더 강한 화학 여과가 필요하며, 오존이 발생하는 공정에서는 전용 오존 센서가 필요합니다. 필터 포화 여부는 냄새로 확실히 알 수 없기 때문입니다.', zh: '溶剂（丙酮、乙酸乙酯）、原料药合成、洁净室作业：此处主要风险是气相物质而非粉尘。这需要更强的化学过滤；对于涉及臭氧的工艺，还需配备专用臭氧传感器——因为滤芯是否饱和无法凭气味可靠判断。',
        },
      },
    ],
    description: {
      hu: 'Angol gyártó füst- és porelszívó berendezésekre, 1985 óta. HEPA- és aktívszén-szűrés, automatikus légmennyiség-szabályozás, gáz- és részecskeérzékelők — a lézeres jelöléstől a forrasztáson át a gyógyszeriparig.',
      en: 'British manufacturer of fume and dust extraction systems since 1985. HEPA and activated carbon filtration, automatic airflow control, gas and particle sensors — from laser marking through soldering to pharmaceuticals.', it: 'Produttore britannico di sistemi di aspirazione di fumi e polveri dal 1985. Filtrazione HEPA e a carbone attivo, controllo automatico della portata d’aria, sensori di gas e particelle — dalla marcatura laser alla saldatura fino al settore farmaceutico.', es: 'Fabricante británico de sistemas de extracción de humos y polvo desde 1985. Filtración HEPA y de carbón activo, control automático del caudal de aire, sensores de gas y partículas — desde el marcaje láser y la soldadura hasta la industria farmacéutica.', de: 'Britischer Hersteller von Rauch- und Staubabsauganlagen seit 1985. HEPA- und Aktivkohlefiltration, automatische Luftmengenregelung, Gas- und Partikelsensoren — von der Laserbeschriftung über das Löten bis zur Pharmaindustrie.', ko: '1985년부터 흄 및 분진 집진 장비를 생산하는 영국 제조사입니다. HEPA·활성탄 여과, 자동 풍량 제어, 가스 및 입자 센서를 갖추었으며, 레이저 마킹부터 납땜, 제약 분야까지 폭넓게 사용됩니다.', zh: '英国烟尘净化设备制造商，创立于 1985 年。采用 HEPA 与活性炭过滤、自动风量控制、气体与颗粒物传感器，应用范围涵盖激光打标、焊接乃至制药行业。',
    },
  },
];
export const manufacturers: Manufacturer[] = localize<Manufacturer[]>(manufacturersSource);

const categoriesSource: Sourced<Category[]> = [
  {
    slug: 'cimkenyomtatok',
    name: { hu: 'Címkenyomtatók', en: 'Label printers', it: 'Stampanti per etichette', es: 'Impresoras de etiquetas', de: 'Etikettendrucker', ko: '라벨 프린터', zh: '标签打印机' },
    description: {
      hu: 'Asztali és ipari vonalkódnyomtatók különböző méretekben és kijelzőkkel.',
      en: 'Desktop and industrial barcode printers in various sizes and display options.', it: 'Stampanti di codici a barre desktop e industriali in varie dimensioni e opzioni di display.', es: 'Impresoras de códigos de barras de sobremesa e industriales en distintos tamaños y opciones de pantalla.', de: 'Desktop- und Industrie-Barcodedrucker in verschiedenen Größen und Display-Varianten.', ko: '다양한 크기와 디스플레이 옵션을 갖춘 데스크톱 및 산업용 바코드 프린터.', zh: '多种尺寸与显示配置的桌面型及工业级条码打印机。',
    },
  },
  {
    slug: 'cimkezo-gepek',
    name: { hu: 'Címkéző gépek', en: 'Labeling machines', it: 'Etichettatrici', es: 'Etiquetadoras', de: 'Etikettiermaschinen', ko: '라벨링 머신', zh: '贴标机' },
    description: {
      hu: 'Nyomtató-felrakó kombinációk és automata pneumatikus címkéző egységek.',
      en: 'Print-and-apply combinations and automatic pneumatic labeling units.', it: 'Combinazioni stampa e applica e unità di etichettatura pneumatiche automatiche.', es: 'Combinaciones de imprimir y aplicar y unidades de etiquetado neumáticas automáticas.', de: 'Print-and-Apply-Kombinationen und automatische pneumatische Etikettiereinheiten.', ko: '프린트 & 어플라이 복합 시스템 및 자동 공압식 라벨링 유닛.', zh: '打印贴标一体系统与自动气动贴标单元。',
    },
  },
  {
    slug: 'cimke-adagolo-gepek',
    name: { hu: 'Címke adagoló gépek', en: 'Label dispensers', it: 'Spellicolatori di etichette', es: 'Dispensadores de etiquetas', de: 'Etikettenspender', ko: '라벨 디스펜서', zh: '标签剥离机' },
    description: {
      hu: 'Automata címkeadagolás és -vágás, különböző kapacitásokkal.',
      en: 'Automatic label dispensing and cutting with various capacities.', it: 'Spellicolatura e taglio automatici delle etichette con diverse capacità.', es: 'Dispensado y corte automático de etiquetas con distintas capacidades.', de: 'Automatisches Spenden und Schneiden von Etiketten mit verschiedenen Kapazitäten.', ko: '다양한 처리 용량의 자동 라벨 디스펜싱 및 커팅.', zh: '自动标签剥离与切割，多种产能可选。',
    },
  },
  {
    slug: 'lezer-gravirozok',
    name: { hu: 'Lézer gravírozók', en: 'Laser engravers', it: 'Incisori laser', es: 'Grabadoras láser', de: 'Lasergravierer', ko: '레이저 각인기', zh: '激光打标机' },
    description: {
      hu: 'Fém és műanyag jelölésére alkalmas lézerek, kompakt jelölőállomások.',
      en: 'Lasers for marking metal and plastic, compact marking stations.', it: 'Laser per la marcatura di metalli e plastica, stazioni di marcatura compatte.', es: 'Láseres para marcar metal y plástico, estaciones de marcaje compactas.', de: 'Laser zur Markierung von Metall und Kunststoff, kompakte Markierstationen.', ko: '금속 및 플라스틱 마킹용 레이저, 컴팩트 마킹 스테이션.', zh: '用于金属与塑料打标的激光器，以及紧凑型打标工作站。',
    },
  },
  {
    slug: 'szoftverek',
    name: { hu: 'Szoftverek', en: 'Software', it: 'Software', es: 'Software', de: 'Software', ko: '소프트웨어', zh: '软件' },
    description: {
      hu: 'Címketervező és -nyomtató szoftverek, valamint egyedi fejlesztések.',
      en: 'Label design and printing software, plus custom development.', it: 'Software per la progettazione e la stampa di etichette, oltre a sviluppi su misura.', es: 'Software de diseño e impresión de etiquetas, además de desarrollo a medida.', de: 'Software für Etikettengestaltung und -druck sowie individuelle Entwicklung.', ko: '라벨 디자인 및 인쇄 소프트웨어와 맞춤형 개발.', zh: '标签设计与打印软件，以及定制开发。',
    },
  },
  {
    slug: 'cimkek-es-festekszalagok',
    name: { hu: 'Címkék és festékszalagok', en: 'Labels and ribbons', it: 'Etichette e ribbon', es: 'Etiquetas y ribbons', de: 'Etiketten und Farbbänder', ko: '라벨 및 리본', zh: '标签与碳带' },
    description: {
      hu: 'Papír, hőpapír és műanyag alapanyagok, többféle ragasztóval; festékszalag minden nyomtatótípushoz.',
      en: 'Paper, thermal paper and plastic materials with various adhesives; ribbons for every printer type.', it: 'Materiali in carta, carta termica e plastica con vari adesivi; ribbon per ogni tipo di stampante.', es: 'Materiales de papel, papel térmico y plásticos con distintos adhesivos; ribbons para cada tipo de impresora.', de: 'Papier-, Thermopapier- und Kunststoffmaterialien mit verschiedenen Klebstoffen; Farbbänder für jeden Druckertyp.', ko: '다양한 접착제를 적용한 종이, 감열지 및 플라스틱 소재와 모든 프린터 유형에 맞는 리본.', zh: '多种胶粘剂的纸质、热敏纸与塑料材料；适配各类打印机的碳带。',
    },
  },
  {
    slug: 'ragaszto-adagolok',
    name: { hu: 'Ragasztó adagolók', en: 'Tape dispensers', it: 'Dispenser per nastro adesivo', es: 'Dispensadores de cinta adhesiva', de: 'Klebebandspender', ko: '테이프 디스펜서', zh: '胶带切割机' },
    description: {
      hu: 'Szalagadagoló berendezések ipari felhasználásra.',
      en: 'Tape dispensing equipment for industrial use.', it: 'Apparecchiature per l’erogazione di nastro adesivo per uso industriale.', es: 'Equipos de dispensado de cinta adhesiva para uso industrial.', de: 'Klebeband-Spendegeräte für den Industrieeinsatz.', ko: '산업용 테이프 디스펜싱 장비.', zh: '工业用胶带切割设备。',
    },
  },
  {
    slug: 'fust-es-porelszivok',
    name: { hu: 'Füst- és porelszívó berendezések', en: 'Fume and dust extraction', it: 'Aspirazione di fumi e polveri', es: 'Extracción de humos y polvo', de: 'Rauch- und Staubabsaugung', ko: '흄 및 분진 집진 장비', zh: '烟尘净化设备' },
    description: {
      hu: 'Szűrt elszívás lézeres jelöléshez, forrasztáshoz és más füstöt vagy port termelő folyamatokhoz — HEPA- és aktívszén-szűréssel.',
      en: 'Filtered extraction for laser marking, soldering and other fume- or dust-producing processes — with HEPA and activated carbon filtration.', it: 'Aspirazione filtrata per marcatura laser, saldatura e altri processi che generano fumi o polveri — con filtrazione HEPA e a carbone attivo.', es: 'Extracción filtrada para marcaje láser, soldadura y otros procesos que generan humos o polvo, con filtración HEPA y de carbón activo.', de: 'Gefilterte Absaugung für Laserbeschriftung, Löten und andere rauch- oder staubbildende Prozesse — mit HEPA- und Aktivkohlefiltration.', ko: '레이저 마킹, 납땜 등 흄이나 분진이 발생하는 공정을 위한 여과식 집진 — HEPA 및 활성탄 필터 적용.', zh: '用于激光打标、焊接及其他产生烟雾或粉尘的工艺的过滤式净化——采用 HEPA 与活性炭过滤。',
    },
  },
];
export const categories: Category[] = localize<Category[]>(categoriesSource);

const productsSource: Sourced<Product[]> = [
  {
    slug: 'cab-squix-2',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 2',
    brand: 'CAB',
    short: {
      hu: 'Keskeny ipari modell 2"-es nyomtatófejjel, nagy mennyiségű nyomtatásra.',
      en: 'Narrow industrial model with a 2" printhead for high-volume printing.', it: 'Modello industriale stretto con testina di stampa da 2" per grandi volumi di stampa.', es: 'Modelo industrial estrecho con cabezal de impresión de 2" para la impresión de grandes volúmenes.', de: 'Schmales Industriemodell mit 2"-Druckkopf für hohe Druckvolumen.', ko: '대량 인쇄를 위한 2" 프린트 헤드를 갖춘 폭이 좁은 산업용 모델.', zh: '配备 2" 打印头的窄幅工业机型，适合大批量打印。',
    },
    description: {
      hu: 'A SQUIX 2 a keskeny címkék specialistája a SQUIX családban: 300 vagy 600 dpi felbontás, akár 250 mm/s nyomtatási sebesség és 56,9 mm nyomtatási szélesség. Ipari megbízhatóság kis címkeméretekhez, balra igazított anyagvezetéssel, robusztus alumínium mechanikával és a teljes SQUIX tartozékpalettával.',
      en: 'The SQUIX 2 specialises in narrow labels within the SQUIX family: 300 or 600 dpi resolution, up to 250 mm/s print speed and 56.9 mm print width. Industrial reliability for small label sizes, with a left-aligned media guide, a robust aluminium mechanism and the full SQUIX range of accessories.', it: 'La SQUIX 2 è specializzata nelle etichette strette all’interno della famiglia SQUIX: risoluzione 300 o 600 dpi, velocità di stampa fino a 250 mm/s e larghezza di stampa 56,9 mm. Affidabilità industriale per etichette di piccolo formato, con guida materiale allineata a sinistra, robusto meccanismo in alluminio e l’intera gamma di accessori SQUIX.', es: 'La SQUIX 2 se especializa en etiquetas estrechas dentro de la familia SQUIX: resolución de 300 o 600 dpi, velocidad de impresión de hasta 250 mm/s y 56,9 mm de ancho de impresión. Fiabilidad industrial para formatos de etiqueta pequeños, con guía de material alineada a la izquierda, un robusto mecanismo de aluminio y toda la gama de accesorios SQUIX.', de: 'Der SQUIX 2 ist der Spezialist für schmale Etiketten innerhalb der SQUIX-Familie: 300 oder 600 dpi Auflösung, bis zu 250 mm/s Druckgeschwindigkeit und 56,9 mm Druckbreite. Industrielle Zuverlässigkeit für kleine Etikettenformate, mit linksbündiger Materialführung, robuster Aluminiummechanik und dem vollen SQUIX-Zubehörprogramm.', ko: 'SQUIX 2는 SQUIX 제품군 중 좁은 라벨에 특화된 모델입니다. 300 또는 600 dpi 해상도, 최대 250 mm/s 인쇄 속도, 56.9 mm 인쇄 폭을 제공합니다. 좌측 정렬 미디어 가이드, 견고한 알루미늄 메커니즘, SQUIX 전체 액세서리 라인업과 함께 소형 라벨에 산업용 신뢰성을 제공합니다.', zh: 'SQUIX 2 是 SQUIX 系列中专为窄幅标签打造的机型：300 或 600 dpi 分辨率，打印速度最高 250 mm/s，打印宽度 56.9 mm。为小尺寸标签提供工业级可靠性，配备左对齐介质导向、坚固的铝制机构以及完整的 SQUIX 配件系列。',
    },
    features: [
      { hu: '300 / 600 dpi felbontás', en: '300 / 600 dpi resolution', it: 'Risoluzione 300 / 600 dpi', es: 'Resolución de 300 / 600 dpi', de: '300 / 600 dpi Auflösung', ko: '300 / 600 dpi 해상도', zh: '300 / 600 dpi 分辨率' },
      { hu: 'Nyomtatási sebesség akár 250 mm/s', en: 'Print speed up to 250 mm/s', it: 'Velocità di stampa fino a 250 mm/s', es: 'Velocidad de impresión de hasta 250 mm/s', de: 'Druckgeschwindigkeit bis 250 mm/s', ko: '최대 250 mm/s 인쇄 속도', zh: '打印速度最高 250 mm/s' },
      { hu: 'Nyomtatási szélesség 56,9 mm (2")', en: 'Print width 56.9 mm (2")', it: 'Larghezza di stampa 56,9 mm (2")', es: 'Ancho de impresión 56,9 mm (2")', de: 'Druckbreite 56,9 mm (2")', ko: '인쇄 폭 56.9 mm (2")', zh: '打印宽度 56.9 mm（2"）' },
      { hu: 'Keskeny, kis címkékhez', en: 'For narrow, small labels', it: 'Per etichette strette e di piccolo formato', es: 'Para etiquetas estrechas y pequeñas', de: 'Für schmale, kleine Etiketten', ko: '폭이 좁은 소형 라벨용', zh: '适用于窄小标签' },
      { hu: 'SQUIX elektronika és tartozékok', en: 'SQUIX electronics and accessories', it: 'Elettronica e accessori SQUIX', es: 'Electrónica y accesorios SQUIX', de: 'SQUIX-Elektronik und -Zubehör', ko: 'SQUIX 전자 플랫폼 및 액세서리', zh: 'SQUIX 电子平台与配件' },
    ],
    image: '/images/products/cab-squix-2.webp',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
  },
  {
    slug: 'cab-squix-4',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 4',
    brand: 'CAB',
    short: {
      hu: 'Ipari címkenyomtató 4"-es fejjel, robusztus alumínium vázzal.',
      en: 'Industrial label printer with a 4" head and robust aluminium chassis.', it: 'Stampante per etichette industriale con testina da 4" e robusto telaio in alluminio.', es: 'Impresora de etiquetas industrial con cabezal de 4" y robusto chasis de aluminio.', de: 'Industrie-Etikettendrucker mit 4"-Kopf und robustem Aluminiumchassis.', ko: '4" 헤드와 견고한 알루미늄 섀시를 갖춘 산업용 라벨 프린터.', zh: '配备 4" 打印头与坚固铝制机身的工业标签打印机。',
    },
    description: {
      hu: 'A SQUIX 4 a cab legkeresettebb ipari címkenyomtatója, folyamatos, nagy mennyiségű nyomtatásra tervezve. 300 vagy 600 dpi felbontás, akár 300 mm/s nyomtatási sebesség és 105,7 mm nyomtatási szélesség. Balra igazított anyagvezetés, robusztus alumínium mechanika és váz, nagy sebességű processzor, intuitív kezelés érintőkijelzőn. Széles tartozék- és szoftverpaletta: letépő, adagoló (belső visszatekercselővel) vagy vágó kivitel, külső le- és visszatekercselő, RFID. Önállóan, PC-vel vagy hálózatban is üzemeltethető.',
      en: 'The SQUIX 4 is cab’s best-selling industrial label printer, designed for continuous, high-volume printing. 300 or 600 dpi resolution, up to 300 mm/s print speed and 105.7 mm print width. Left-aligned media guide, a robust aluminium print mechanism and chassis, a high-speed processor and intuitive touchscreen operation. A wide range of accessories and software: tear-off, peel-off (with internal rewinder) or cutter versions, external un-/rewinders, RFID. Runs stand-alone, with a PC or in a network.', it: 'La SQUIX 4 è la stampante per etichette industriale più venduta di cab, progettata per la stampa continua di grandi volumi. Risoluzione 300 o 600 dpi, velocità di stampa fino a 300 mm/s e larghezza di stampa 105,7 mm. Guida materiale allineata a sinistra, robusto meccanismo di stampa e telaio in alluminio, processore ad alta velocità e utilizzo intuitivo tramite touchscreen. Ampia gamma di accessori e software: versioni con strappo, spellicolatura (con riavvolgitore interno) o taglierina, svolgitori/riavvolgitori esterni, RFID. Funziona in autonomia, con un PC o in rete.', es: 'La SQUIX 4 es la impresora de etiquetas industrial más vendida de cab, diseñada para la impresión continua de grandes volúmenes. Resolución de 300 o 600 dpi, hasta 300 mm/s de velocidad de impresión y 105,7 mm de ancho de impresión. Guía de material alineada a la izquierda, un robusto mecanismo de impresión y chasis de aluminio, un procesador de alta velocidad y manejo intuitivo por pantalla táctil. Amplia gama de accesorios y software: versiones tear-off, de despegado (con rebobinador interno) o con cizalla, desbobinadores/rebobinadores externos, RFID. Funciona de forma autónoma, con un PC o en red.', de: 'Der SQUIX 4 ist der meistverkaufte Industrie-Etikettendrucker von cab, ausgelegt für kontinuierlichen Druck mit hohen Volumen. 300 oder 600 dpi Auflösung, bis zu 300 mm/s Druckgeschwindigkeit und 105,7 mm Druckbreite. Linksbündige Materialführung, robuste Druckmechanik und Chassis aus Aluminium, ein schneller Prozessor und intuitive Touchscreen-Bedienung. Umfangreiches Zubehör- und Softwareangebot: Versionen mit Abreißkante, Spendefunktion (mit internem Aufwickler) oder Messer, externe Ab-/Aufwickler, RFID. Läuft stand-alone, am PC oder im Netzwerk.', ko: 'SQUIX 4는 cab에서 가장 많이 판매되는 산업용 라벨 프린터로, 연속 대량 인쇄를 위해 설계되었습니다. 300 또는 600 dpi 해상도, 최대 300 mm/s 인쇄 속도, 105.7 mm 인쇄 폭을 제공합니다. 좌측 정렬 미디어 가이드, 견고한 알루미늄 인쇄 메커니즘과 섀시, 고속 프로세서, 직관적인 터치스크린 조작을 갖추었습니다. 폭넓은 액세서리와 소프트웨어를 지원합니다: 티어오프, 필오프(내장 리와인더 포함) 또는 커터 버전, 외장 언와인더/리와인더, RFID. 단독 운용, PC 연결 또는 네트워크 환경에서 사용할 수 있습니다.', zh: 'SQUIX 4 是 cab 最畅销的工业标签打印机，专为连续大批量打印而设计。300 或 600 dpi 分辨率，打印速度最高 300 mm/s，打印宽度 105.7 mm。左对齐介质导向、坚固的铝制打印机构与机身、高速处理器以及直观的触摸屏操作。丰富的配件与软件：撕离、剥离（带内部回卷器）或切刀版本，外部放卷/回卷器，RFID。可独立运行、连接 PC 或接入网络。',
    },
    features: [
      { hu: '300 / 600 dpi felbontás', en: '300 / 600 dpi resolution', it: 'Risoluzione 300 / 600 dpi', es: 'Resolución de 300 / 600 dpi', de: '300 / 600 dpi Auflösung', ko: '300 / 600 dpi 해상도', zh: '300 / 600 dpi 分辨率' },
      { hu: 'Nyomtatási sebesség akár 300 mm/s', en: 'Print speed up to 300 mm/s', it: 'Velocità di stampa fino a 300 mm/s', es: 'Velocidad de impresión de hasta 300 mm/s', de: 'Druckgeschwindigkeit bis 300 mm/s', ko: '최대 300 mm/s 인쇄 속도', zh: '打印速度最高 300 mm/s' },
      { hu: 'Nyomtatási szélesség 105,7 mm (4")', en: 'Print width 105.7 mm (4")', it: 'Larghezza di stampa 105,7 mm (4")', es: 'Ancho de impresión 105,7 mm (4")', de: 'Druckbreite 105,7 mm (4")', ko: '인쇄 폭 105.7 mm (4")', zh: '打印宽度 105.7 mm（4"）' },
      { hu: 'Balra igazított anyagvezetés, alumínium mechanika', en: 'Left-aligned media guide, aluminium mechanism', it: 'Guida materiale allineata a sinistra, meccanismo in alluminio', es: 'Guía de material alineada a la izquierda, mecanismo de aluminio', de: 'Linksbündige Materialführung, Aluminiummechanik', ko: '좌측 정렬 미디어 가이드, 알루미늄 메커니즘', zh: '左对齐介质导向，铝制机构' },
      { hu: 'Letépő, adagoló vagy vágó kivitel', en: 'Tear-off, peel-off or cutter version', it: 'Versione con strappo, spellicolatura o taglierina', es: 'Versión tear-off, de despegado o con cizalla', de: 'Abreiß-, Spende- oder Messerversion', ko: '티어오프, 필오프 또는 커터 버전', zh: '撕离、剥离或切刀版本' },
      { hu: 'Ethernet, USB, RS-232, opcionális Wi-Fi / RFID', en: 'Ethernet, USB, RS-232, optional Wi-Fi / RFID', it: 'Ethernet, USB, RS-232, opzionale Wi-Fi / RFID', es: 'Ethernet, USB, RS-232, Wi-Fi / RFID opcionales', de: 'Ethernet, USB, RS-232, optional Wi-Fi / RFID', ko: 'Ethernet, USB, RS-232, 옵션 Wi-Fi / RFID', zh: 'Ethernet、USB、RS-232，可选 Wi-Fi / RFID' },
    ],
    image: '/images/products/cab-squix-4.webp',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
  },
  {
    slug: 'cab-squix-4m',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 4 M',
    brand: 'CAB',
    image: '/images/products/cab-squix-4m.webp',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
    short: {
      hu: 'Ipari nyomtató kifejezetten apró címkékhez és keskeny, végtelenített anyagokhoz.',
      en: 'Industrial printer specifically for very small labels and slim continuous materials.', it: 'Stampante industriale specifica per etichette molto piccole e materiali continui stretti.', es: 'Impresora industrial específica para etiquetas muy pequeñas y materiales continuos estrechos.', de: 'Industriedrucker speziell für sehr kleine Etiketten und schmale Endlosmaterialien.', ko: '초소형 라벨과 폭이 좁은 연속 소재 전용 산업용 프린터.', zh: '专为极小标签与细窄连续材料设计的工业打印机。',
    },
    description: {
      hu: 'A SQUIX 4 M a nagyon kicsi címkék és keskeny, végtelenített anyagok (pl. lapított zsugorcsövek) precíz nyomtatására készült, középre igazított anyagvezetéssel — így nincs szükség beállításra anyagváltáskor. 300 vagy 600 dpi felbontás, akár 300 mm/s sebesség, és a SQUIX ipari megbízhatósága, teljes tartozékpalettával.',
      en: 'The SQUIX 4 M is built for precise printing of very small labels and slim continuous materials (e.g. pressed tubes), with a centered media guide — so no adjustment is needed when changing materials. 300 or 600 dpi resolution, up to 300 mm/s, and SQUIX industrial reliability with the full range of accessories.', it: 'La SQUIX 4 M è realizzata per la stampa precisa di etichette molto piccole e materiali continui stretti (ad es. tubetti pressati), con guida materiale centrata — non è quindi necessaria alcuna regolazione al cambio di materiale. Risoluzione 300 o 600 dpi, fino a 300 mm/s e l’affidabilità industriale SQUIX con l’intera gamma di accessori.', es: 'La SQUIX 4 M está construida para la impresión precisa de etiquetas muy pequeñas y materiales continuos estrechos (p. ej. tubos prensados), con guía de material centrada, de modo que no hace falta ningún ajuste al cambiar de material. Resolución de 300 o 600 dpi, hasta 300 mm/s, y la fiabilidad industrial SQUIX con toda la gama de accesorios.', de: 'Der SQUIX 4 M ist für den präzisen Druck sehr kleiner Etiketten und schmaler Endlosmaterialien (z. B. gepresster Schläuche) gebaut, mit zentrierter Materialführung — beim Materialwechsel ist daher keine Justierung nötig. 300 oder 600 dpi Auflösung, bis zu 300 mm/s und die industrielle SQUIX-Zuverlässigkeit mit dem vollen Zubehörprogramm.', ko: 'SQUIX 4 M은 초소형 라벨과 폭이 좁은 연속 소재(예: 압착 튜브)의 정밀 인쇄를 위해 제작되었으며, 중앙 정렬 미디어 가이드를 채택하여 소재 교체 시 별도의 조정이 필요 없습니다. 300 또는 600 dpi 해상도, 최대 300 mm/s 속도, 그리고 SQUIX의 산업용 신뢰성과 전체 액세서리 라인업을 제공합니다.', zh: 'SQUIX 4 M 专为精确打印极小标签与细窄连续材料（如压制套管）而打造，采用居中介质导向——更换材料时无需调整。300 或 600 dpi 分辨率，最高 300 mm/s，具备 SQUIX 工业级可靠性并支持全系列配件。',
    },
    features: [
      { hu: 'Apró címkékhez és keskeny, végtelenített anyagokhoz', en: 'For small labels and slim continuous materials', it: 'Per etichette piccole e materiali continui stretti', es: 'Para etiquetas pequeñas y materiales continuos estrechos', de: 'Für kleine Etiketten und schmale Endlosmaterialien', ko: '소형 라벨 및 폭이 좁은 연속 소재용', zh: '适用于小标签与细窄连续材料' },
      { hu: 'Középre igazított anyagvezetés', en: 'Centered media guide', it: 'Guida materiale centrata', es: 'Guía de material centrada', de: 'Zentrierte Materialführung', ko: '중앙 정렬 미디어 가이드', zh: '居中介质导向' },
      { hu: '300 / 600 dpi felbontás, akár 300 mm/s', en: '300 / 600 dpi resolution, up to 300 mm/s', it: 'Risoluzione 300 / 600 dpi, fino a 300 mm/s', es: 'Resolución de 300 / 600 dpi, hasta 300 mm/s', de: '300 / 600 dpi Auflösung, bis zu 300 mm/s', ko: '300 / 600 dpi 해상도, 최대 300 mm/s', zh: '300 / 600 dpi 分辨率，最高 300 mm/s' },
      { hu: 'SQUIX elektronika és tartozékok', en: 'SQUIX electronics and accessories', it: 'Elettronica e accessori SQUIX', es: 'Electrónica y accesorios SQUIX', de: 'SQUIX-Elektronik und -Zubehör', ko: 'SQUIX 전자 플랫폼 및 액세서리', zh: 'SQUIX 电子平台与配件' },
    ],
  },
  {
    slug: 'cab-squix-4mt',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 4 MT',
    brand: 'CAB',
    image: '/images/products/cab-squix-4mt.webp',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
    short: {
      hu: 'Ipari nyomtató textil alapanyagokhoz — mosás- és varrócímkékhez.',
      en: 'Industrial printer for textile materials — wash-care and sewn-in labels.', it: 'Stampante industriale per materiali tessili — etichette di manutenzione e da cucire.', es: 'Impresora industrial para materiales textiles — etiquetas de composición y cosidas.', de: 'Industriedrucker für Textilmaterialien — Waschpflege- und eingenähte Etiketten.', ko: '텍스타일 소재용 산업용 프린터 — 세탁 라벨 및 봉제 라벨.', zh: '面向纺织材料的工业打印机——洗涤标与缝入式标签。',
    },
    description: {
      hu: 'A SQUIX 4 MT textilszalagok és mosáscímkék nyomtatására optimalizált, középre igazított anyagvezetésű változat. Magas hőenergiát igénylő textileknél a festékszalag a nyomtatás után a szalaghoz tapadhat — ezt a beépített húzógörgő megbízhatóan leválasztja az anyagról. A textiliparra szabott anyagkezelés és a SQUIX platform megbízhatósága.',
      en: 'The SQUIX 4 MT is optimised for printing textile ribbons and wash-care labels, with a centered media guide. When textiles require high heat, the ribbon may stick to the tape after printing — a built-in draw roller reliably separates it from the material. Media handling tailored to the textile industry, with SQUIX platform reliability.', it: 'La SQUIX 4 MT è ottimizzata per la stampa di nastri tessili ed etichette di manutenzione, con guida materiale centrata. Quando i tessuti richiedono calore elevato, il ribbon può aderire al nastro dopo la stampa — un rullo di traino integrato lo separa in modo affidabile dal materiale. Gestione del materiale su misura per l’industria tessile, con l’affidabilità della piattaforma SQUIX.', es: 'La SQUIX 4 MT está optimizada para imprimir cintas textiles y etiquetas de composición, con guía de material centrada. Cuando los textiles requieren mucho calor, el ribbon puede quedarse pegado a la cinta tras la impresión; un rodillo de tracción integrado lo separa del material de forma fiable. Manejo del material adaptado a la industria textil, con la fiabilidad de la plataforma SQUIX.', de: 'Der SQUIX 4 MT ist für den Druck von Textilbändern und Waschpflege-Etiketten optimiert, mit zentrierter Materialführung. Wenn Textilien hohe Temperaturen erfordern, kann das Farbband nach dem Druck am Band haften bleiben — eine integrierte Zugwalze trennt es zuverlässig vom Material. Materialhandling, zugeschnitten auf die Textilindustrie, mit der Zuverlässigkeit der SQUIX-Plattform.', ko: 'SQUIX 4 MT는 텍스타일 리본과 세탁 라벨 인쇄에 최적화되어 있으며 중앙 정렬 미디어 가이드를 갖추었습니다. 텍스타일에 높은 열이 필요한 경우 인쇄 후 리본이 테이프에 달라붙을 수 있는데, 내장 드로우 롤러가 이를 소재에서 확실하게 분리합니다. 텍스타일 산업에 맞춘 미디어 핸들링과 SQUIX 플랫폼의 신뢰성을 제공합니다.', zh: 'SQUIX 4 MT 针对纺织带与洗涤标打印进行了优化，采用居中介质导向。当纺织材料需要高温打印时，碳带可能在打印后粘附在织带上——内置牵引辊可将其与材料可靠分离。介质处理专为纺织行业量身定制，并具备 SQUIX 平台的可靠性。',
    },
    features: [
      { hu: 'Textilszalag és mosáscímke nyomtatása', en: 'Printing textile ribbons & wash-care labels', it: 'Stampa di nastri tessili ed etichette di manutenzione', es: 'Impresión de cintas textiles y etiquetas de composición', de: 'Druck von Textilbändern & Waschpflege-Etiketten', ko: '텍스타일 리본 및 세탁 라벨 인쇄', zh: '打印纺织带与洗涤标' },
      { hu: 'Húzógörgő a festékszalag leválasztásához', en: 'Draw roller to separate the ribbon', it: 'Rullo di traino per separare il ribbon', es: 'Rodillo de tracción para separar el ribbon', de: 'Zugwalze zur Trennung des Farbbands', ko: '리본 분리를 위한 드로우 롤러', zh: '牵引辊分离碳带' },
      { hu: 'Középre igazított anyagvezetés', en: 'Centered media guide', it: 'Guida materiale centrata', es: 'Guía de material centrada', de: 'Zentrierte Materialführung', ko: '중앙 정렬 미디어 가이드', zh: '居中介质导向' },
      { hu: 'SQUIX platform megbízhatósága', en: 'SQUIX platform reliability', it: 'Affidabilità della piattaforma SQUIX', es: 'Fiabilidad de la plataforma SQUIX', de: 'Zuverlässigkeit der SQUIX-Plattform', ko: 'SQUIX 플랫폼의 신뢰성', zh: 'SQUIX 平台可靠性' },
    ],
  },
  {
    slug: 'cab-squix-6',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX 6.3',
    brand: 'CAB',
    image: '/images/products/cab-squix-6.webp',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
    short: {
      hu: 'Ipari címkenyomtató 6"-es fejjel, széles címkékhez és nagy mennyiséghez.',
      en: 'Industrial label printer with a 6" head for wide labels and high volumes.', it: 'Stampante per etichette industriale con testina da 6" per etichette larghe e grandi volumi.', es: 'Impresora de etiquetas industrial con cabezal de 6" para etiquetas anchas y grandes volúmenes.', de: 'Industrie-Etikettendrucker mit 6"-Kopf für breite Etiketten und hohe Volumen.', ko: '넓은 라벨과 대량 인쇄를 위한 6" 헤드 탑재 산업용 라벨 프린터.', zh: '配备 6" 打印头的工业标签打印机，适用于宽幅标签与大批量打印。',
    },
    description: {
      hu: 'A SQUIX 6.3 a SQUIX család legszélesebb ipari tagja Odette-, UCC- és GS1-címkékhez a logisztikában: 203 vagy 300 dpi felbontás, akár 250 mm/s sebesség és 168 mm nyomtatási szélesség. Robusztus alumínium mechanika és váz, balra igazított anyagvezetés, és a teljes SQUIX tartozékpaletta a nagy formátumú, folyamatos nyomtatáshoz.',
      en: 'The SQUIX 6.3 is the widest industrial member of the SQUIX family, for Odette, UCC and GS1 labels in logistics: 203 or 300 dpi resolution, up to 250 mm/s and 168 mm print width. A robust aluminium mechanism and chassis, left-aligned media guide and the full SQUIX range of accessories for large-format, continuous printing.', it: 'La SQUIX 6.3 è il membro industriale più largo della famiglia SQUIX, per etichette Odette, UCC e GS1 nella logistica: risoluzione 203 o 300 dpi, fino a 250 mm/s e larghezza di stampa 168 mm. Robusto meccanismo e telaio in alluminio, guida materiale allineata a sinistra e l’intera gamma di accessori SQUIX per la stampa continua di grande formato.', es: 'La SQUIX 6.3 es el miembro industrial más ancho de la familia SQUIX, para etiquetas Odette, UCC y GS1 en logística: resolución de 203 o 300 dpi, hasta 250 mm/s y 168 mm de ancho de impresión. Un robusto mecanismo y chasis de aluminio, guía de material alineada a la izquierda y toda la gama de accesorios SQUIX para la impresión continua de gran formato.', de: 'Der SQUIX 6.3 ist das breiteste Industriemodell der SQUIX-Familie, für Odette-, UCC- und GS1-Etiketten in der Logistik: 203 oder 300 dpi Auflösung, bis zu 250 mm/s und 168 mm Druckbreite. Robuste Aluminiummechanik und -chassis, linksbündige Materialführung und das volle SQUIX-Zubehörprogramm für großformatigen, kontinuierlichen Druck.', ko: 'SQUIX 6.3은 SQUIX 제품군 중 가장 넓은 폭의 산업용 모델로, 물류 분야의 Odette, UCC 및 GS1 라벨에 적합합니다. 203 또는 300 dpi 해상도, 최대 250 mm/s 속도, 168 mm 인쇄 폭을 제공합니다. 견고한 알루미늄 메커니즘과 섀시, 좌측 정렬 미디어 가이드, 그리고 대형 연속 인쇄를 위한 SQUIX 전체 액세서리 라인업을 갖추었습니다.', zh: 'SQUIX 6.3 是 SQUIX 系列中最宽的工业机型，适用于物流领域的 Odette、UCC 和 GS1 标签：203 或 300 dpi 分辨率，最高 250 mm/s，打印宽度 168 mm。坚固的铝制机构与机身、左对齐介质导向，以及面向大幅面连续打印的完整 SQUIX 配件系列。',
    },
    features: [
      { hu: '203 / 300 dpi felbontás', en: '203 / 300 dpi resolution', it: 'Risoluzione 203 / 300 dpi', es: 'Resolución de 203 / 300 dpi', de: '203 / 300 dpi Auflösung', ko: '203 / 300 dpi 해상도', zh: '203 / 300 dpi 分辨率' },
      { hu: 'Nyomtatási sebesség akár 250 mm/s', en: 'Print speed up to 250 mm/s', it: 'Velocità di stampa fino a 250 mm/s', es: 'Velocidad de impresión de hasta 250 mm/s', de: 'Druckgeschwindigkeit bis 250 mm/s', ko: '최대 250 mm/s 인쇄 속도', zh: '打印速度最高 250 mm/s' },
      { hu: 'Nyomtatási szélesség 168 mm (6")', en: 'Print width 168 mm (6")', it: 'Larghezza di stampa 168 mm (6")', es: 'Ancho de impresión 168 mm (6")', de: 'Druckbreite 168 mm (6")', ko: '인쇄 폭 168 mm (6")', zh: '打印宽度 168 mm（6"）' },
      { hu: 'Odette, UCC és GS1 logisztikai címkékhez', en: 'For Odette, UCC and GS1 logistics labels', it: 'Per etichette logistiche Odette, UCC e GS1', es: 'Para etiquetas logísticas Odette, UCC y GS1', de: 'Für Odette-, UCC- und GS1-Logistiketiketten', ko: 'Odette, UCC 및 GS1 물류 라벨용', zh: '适用于 Odette、UCC 与 GS1 物流标签' },
      { hu: 'Letépő, adagoló vagy vágó kivitel', en: 'Tear-off, peel-off or cutter version', it: 'Versione con strappo, spellicolatura o taglierina', es: 'Versión tear-off, de despegado o con cizalla', de: 'Abreiß-, Spende- oder Messerversion', ko: '티어오프, 필오프 또는 커터 버전', zh: '撕离、剥离或切刀版本' },
    ],
  },
  {
    slug: 'cab-squix-rfid',
    category: 'cimkenyomtatok',
    name: 'CAB SQUIX RFID',
    brand: 'CAB',
    image: '/images/products/cab-squix-rfid.webp',
    datasheet: '/datasheets/cab-squix.pdf',
    videoId: 'o2eKZGETCPk',
    short: {
      hu: 'Ipari SQUIX beépített UHF RFID modullal: a chip írása és a címke nyomtatása egy menetben.',
      en: 'Industrial SQUIX with an integral UHF RFID module: the chip is written and the label printed in one pass.', it: 'SQUIX industriale con modulo UHF RFID integrato: il chip viene scritto e l’etichetta stampata in un unico passaggio.', es: 'SQUIX industrial con módulo UHF RFID integrado: el chip se graba y la etiqueta se imprime en una sola pasada.', de: 'Industrieller SQUIX mit integriertem UHF-RFID-Modul: Der Chip wird beschrieben und das Etikett gedruckt — in einem Durchlauf.', ko: 'UHF RFID 모듈을 내장한 산업용 SQUIX: 칩 기록과 라벨 인쇄가 한 번에 이루어집니다.', zh: '内置 UHF RFID 模块的工业级 SQUIX：一次走纸即完成芯片写入与标签打印。',
    },
    description: {
      hu: 'A SQUIX RFID nem külön gép, hanem a megszokott ipari SQUIX beépíthető UHF RFID modullal. A modul a készülékházba kerül, az író-olvasó antenna pedig vagy a nyomtatófejre, vagy az adagolóegységre. A chip írása és olvasása közvetlenül a címke nyomtatása előtt történik, így ugyanabban a menetben elkészül az okoscímke; ha a chip nem válaszol vagy hibás, a nyomtató a címkét érvénytelennek jelöli (Void Label), és az nem kerül a termékre.\n\nA cab katalógusa szerint a modul a balra igazított anyagvezetésű SQUIX 4.3 és SQUIX 4, valamint a középre igazított SQUIX 4.3 M és SQUIX 4 M típusokba építhető; a SQUIX 6.3 és 8.3 RFID-változata a katalógusban tervezettként szerepel. Felbontás a típustól függően 203, 300 vagy 600 dpi, nyomtatási sebesség akár 300 mm/s, nyomtatási szélesség 104–108,4 mm.\n\nSzabvány: UHF EPC Class 1 Gen 2, ISO/IEC 18000-63, ETSI és FCC frekvenciákkal — ugyanaz a gép tud európai és amerikai sávban dolgozni. A címkekalibrálás megkeresi az adott címkéhez tartozó legjobb írási-olvasási beállítást, és a jelleggörbe ki is nyomtatható. A TID, EPC és User Memory memóriabankok menet közben olvashatók, és a kijelzőn megjelennek. Programozás JScript és ZPL2 nyelven, címketervezés cablabel S3-mal.',
      en: 'The SQUIX RFID is not a separate machine but the familiar industrial SQUIX with an integral UHF RFID module. The module sits inside the chassis; the read/write antenna is mounted either on the print head or on the feeding unit. The chip is read and written immediately before the label is printed, so the smart label is finished in the same pass; if the chip does not respond or is faulty, the printer marks the label invalid (Void Label) and it never reaches the product.\n\nAccording to cab’s catalogue the module can be fitted to the left-aligned SQUIX 4.3 and SQUIX 4, and to the centred SQUIX 4.3 M and SQUIX 4 M; RFID versions of the SQUIX 6.3 and 8.3 are listed as in planning. Resolution is 203, 300 or 600 dpi depending on the model, print speed up to 300 mm/s and print width 104–108.4 mm.\n\nStandard: UHF EPC Class 1 Gen 2, ISO/IEC 18000-63, with ETSI and FCC frequencies — the same machine can work in the European and the US band. Tag calibration finds the best read/write setting for the label in use, and the characteristic curve can be printed out. The TID, EPC and User Memory banks can be read on-the-fly and are shown on the display. Programming in JScript and ZPL2, label design with cablabel S3.', it: 'La SQUIX RFID non è una macchina a sé, ma la consueta SQUIX industriale con modulo UHF RFID integrabile. Il modulo è alloggiato nello chassis; l’antenna di lettura/scrittura è montata sulla testina di stampa oppure sull’unità di alimentazione. Il chip viene letto e scritto immediatamente prima della stampa dell’etichetta, così la smart label è pronta nello stesso passaggio; se il chip non risponde o è difettoso, la stampante contrassegna l’etichetta come non valida (Void Label) e questa non arriva al prodotto.\n\nSecondo il catalogo cab il modulo può essere installato sulle SQUIX 4.3 e SQUIX 4 con guida allineata a sinistra e sulle SQUIX 4.3 M e SQUIX 4 M con guida centrata; le versioni RFID delle SQUIX 6.3 e 8.3 sono indicate come in pianificazione. La risoluzione è di 203, 300 o 600 dpi a seconda del modello, la velocità di stampa fino a 300 mm/s e la larghezza di stampa 104–108,4 mm.\n\nStandard: UHF EPC Class 1 Gen 2, ISO/IEC 18000-63, con frequenze ETSI e FCC — la stessa macchina può lavorare in banda europea e statunitense. La calibrazione del tag individua la migliore impostazione di lettura/scrittura per l’etichetta in uso e la curva caratteristica può essere stampata. I banchi TID, EPC e User Memory sono leggibili al volo e vengono mostrati sul display. Programmazione in JScript e ZPL2, progettazione etichette con cablabel S3.', es: 'La SQUIX RFID no es una máquina aparte, sino la habitual SQUIX industrial con módulo UHF RFID integrable. El módulo se aloja en el chasis; la antena de lectura/escritura se monta en el cabezal de impresión o en la unidad de alimentación. El chip se lee y se graba inmediatamente antes de imprimir la etiqueta, de modo que la etiqueta inteligente queda terminada en la misma pasada; si el chip no responde o está defectuoso, la impresora marca la etiqueta como no válida (Void Label) y esta no llega al producto.\n\nSegún el catálogo de cab, el módulo puede montarse en las SQUIX 4.3 y SQUIX 4 con guía alineada a la izquierda y en las SQUIX 4.3 M y SQUIX 4 M con guía centrada; las versiones RFID de las SQUIX 6.3 y 8.3 figuran como en planificación. La resolución es de 203, 300 o 600 dpi según el modelo, la velocidad de impresión de hasta 300 mm/s y el ancho de impresión de 104–108,4 mm.\n\nEstándar: UHF EPC Class 1 Gen 2, ISO/IEC 18000-63, con frecuencias ETSI y FCC: la misma máquina puede trabajar en la banda europea y en la estadounidense. La calibración del tag localiza el mejor ajuste de lectura/escritura para la etiqueta empleada y la curva característica puede imprimirse. Los bancos TID, EPC y User Memory se leen sobre la marcha y se muestran en la pantalla. Programación en JScript y ZPL2, diseño de etiquetas con cablabel S3.', de: 'Der SQUIX RFID ist keine eigene Maschine, sondern der gewohnte industrielle SQUIX mit integrierbarem UHF-RFID-Modul. Das Modul sitzt im Gehäuse, die Schreib-/Leseantenne entweder am Druckkopf oder an einer Zuführeinheit. Der Chip wird unmittelbar vor dem Druck des Etiketts gelesen und beschrieben, das Smart Label entsteht also im selben Durchlauf; antwortet der Chip nicht oder ist er fehlerhaft, kennzeichnet der Drucker das Etikett als ungültig (Void Label), und es gelangt nicht an das Produkt.\n\nLaut cab-Katalog lässt sich das Modul in die linksbündig führenden SQUIX 4.3 und SQUIX 4 sowie in die mittig führenden SQUIX 4.3 M und SQUIX 4 M einbauen; RFID-Versionen des SQUIX 6.3 und 8.3 sind im Katalog als in Planung geführt. Die Auflösung beträgt je nach Typ 203, 300 oder 600 dpi, die Druckgeschwindigkeit bis zu 300 mm/s und die Druckbreite 104–108,4 mm.\n\nStandard: UHF EPC Class 1 Gen 2, ISO/IEC 18000-63, mit ETSI- und FCC-Frequenzen — dieselbe Maschine arbeitet im europäischen wie im US-Band. Die Tag-Kalibrierung ermittelt die beste Schreib-/Leseeinstellung für das eingesetzte Etikett, die Kennlinie lässt sich ausdrucken. Die Speicherbänke TID, EPC und User Memory können im Lauf gelesen und am Display angezeigt werden. Programmierung in JScript und ZPL2, Etikettengestaltung mit cablabel S3.', ko: 'SQUIX RFID는 별도의 기계가 아니라, 익숙한 산업용 SQUIX에 UHF RFID 모듈을 내장한 것입니다. 모듈은 본체 안에 들어가고, 읽기/쓰기 안테나는 프린트 헤드 또는 피딩 유닛에 장착됩니다. 칩의 읽기와 쓰기는 라벨 인쇄 직전에 이루어지므로 스마트 라벨이 같은 공정에서 완성됩니다. 칩이 응답하지 않거나 불량이면 프린터가 해당 라벨을 무효(Void Label)로 표시하여 제품에 부착되지 않습니다.\n\ncab 카탈로그에 따르면 이 모듈은 좌측 정렬 방식의 SQUIX 4.3과 SQUIX 4, 중앙 정렬 방식의 SQUIX 4.3 M과 SQUIX 4 M에 장착할 수 있으며, SQUIX 6.3과 8.3의 RFID 버전은 계획 중으로 표기되어 있습니다. 해상도는 기종에 따라 203, 300 또는 600 dpi이며, 인쇄 속도는 최대 300 mm/s, 인쇄 폭은 104~108.4 mm입니다.\n\n규격: UHF EPC Class 1 Gen 2, ISO/IEC 18000-63, ETSI 및 FCC 주파수 지원 — 동일한 기계로 유럽과 미국 대역 모두에서 작업할 수 있습니다. 태그 캘리브레이션은 사용 중인 라벨에 가장 적합한 읽기/쓰기 설정을 찾아 주며, 특성 곡선을 인쇄할 수도 있습니다. TID, EPC, User Memory 뱅크는 진행 중에 읽어 화면에 표시할 수 있습니다. JScript와 ZPL2로 프로그래밍하고, cablabel S3로 라벨을 디자인합니다.', zh: 'SQUIX RFID 并非独立机型，而是在常见的工业级 SQUIX 上内置 UHF RFID 模块。模块装在机身内部，读写天线则安装在打印头或送纸单元上。芯片的读取与写入在标签打印前一刻完成，因此智能标签在同一次走纸中即可制成；若芯片无响应或存在故障，打印机会将该标签标记为无效（Void Label），使其不会贴到产品上。\n\n根据 cab 目录，该模块可安装于左对齐介质导向的 SQUIX 4.3 与 SQUIX 4，以及居中导向的 SQUIX 4.3 M 与 SQUIX 4 M；SQUIX 6.3 和 8.3 的 RFID 版本在目录中标注为规划中。分辨率视机型为 203、300 或 600 dpi，打印速度最高 300 mm/s，打印宽度 104–108.4 mm。\n\n标准：UHF EPC Class 1 Gen 2、ISO/IEC 18000-63，支持 ETSI 与 FCC 频段——同一台机器即可在欧洲与美国频段工作。标签校准可为所用标签找到最佳读写设置，并可打印特性曲线。TID、EPC 与 User Memory 存储区可在运行中读取并显示在屏幕上。使用 JScript 与 ZPL2 编程，用 cablabel S3 设计标签。',
    },
    features: [
      { hu: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', en: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', it: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', es: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', de: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', ko: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', zh: 'UHF EPC Class 1 Gen 2、ISO/IEC 18000-63' },
      { hu: 'Négy antennaváltozat: OM, RS, HS, OM + RS', en: 'Four antenna options: OM, RS, HS, OM + RS', it: 'Quattro varianti di antenna: OM, RS, HS, OM + RS', es: 'Cuatro variantes de antena: OM, RS, HS, OM + RS', de: 'Vier Antennenvarianten: OM, RS, HS, OM + RS', ko: '네 가지 안테나 구성: OM, RS, HS, OM + RS', zh: '四种天线方案：OM、RS、HS、OM + RS' },
      { hu: 'Írás és olvasás közvetlenül nyomtatás előtt, hibás címke érvénytelenítése (Void Label)', en: 'Read/write immediately before printing, faulty labels marked invalid (Void Label)', it: 'Lettura/scrittura subito prima della stampa, etichette difettose contrassegnate come non valide (Void Label)', es: 'Lectura/escritura justo antes de imprimir, etiquetas defectuosas marcadas como no válidas (Void Label)', de: 'Schreiben/Lesen unmittelbar vor dem Druck, fehlerhafte Etiketten werden ungültig gekennzeichnet (Void Label)', ko: '인쇄 직전 읽기/쓰기, 불량 라벨은 무효 표시(Void Label)', zh: '打印前一刻完成读写，故障标签标记为无效（Void Label）' },
      { hu: 'Címkekalibrálás nyomtatható jelleggörbével', en: 'Tag calibration with a printable characteristic curve', it: 'Calibrazione del tag con curva caratteristica stampabile', es: 'Calibración del tag con curva característica imprimible', de: 'Tag-Kalibrierung mit druckbarer Kennlinie', ko: '특성 곡선 인쇄가 가능한 태그 캘리브레이션', zh: '标签校准，特性曲线可打印' },
      { hu: 'TID, EPC és User Memory olvasása menet közben', en: 'TID, EPC and User Memory read on-the-fly', it: 'Lettura al volo di TID, EPC e User Memory', es: 'Lectura sobre la marcha de TID, EPC y User Memory', de: 'TID, EPC und User Memory im Lauf lesen', ko: '진행 중 TID, EPC, User Memory 읽기', zh: '运行中读取 TID、EPC 与 User Memory' },
      { hu: 'ETSI és FCC frekvenciák', en: 'ETSI and FCC frequencies', it: 'Frequenze ETSI e FCC', es: 'Frecuencias ETSI y FCC', de: 'ETSI- und FCC-Frequenzen', ko: 'ETSI 및 FCC 주파수', zh: 'ETSI 与 FCC 频段' },
      { hu: 'JScript, ZPL2, cablabel S3', en: 'JScript, ZPL2, cablabel S3', it: 'JScript, ZPL2, cablabel S3', es: 'JScript, ZPL2, cablabel S3', de: 'JScript, ZPL2, cablabel S3', ko: 'JScript, ZPL2, cablabel S3', zh: 'JScript、ZPL2、cablabel S3' },
    ],
    variantsLead: {
      hu: 'Az antenna helye és érzékenysége dönti el, milyen okoscímkét tud írni a gép — ezt a címke fajtájához és a felülethez kell választani, nem fordítva.',
      en: 'The position and sensitivity of the antenna decide which smart labels the printer can write — pick it to match the label and the surface, not the other way round.', it: 'La posizione e la sensibilità dell’antenna determinano quali smart label la stampante è in grado di scrivere: la scelta va fatta in base all’etichetta e alla superficie, non viceversa.', es: 'La posición y la sensibilidad de la antena determinan qué etiquetas inteligentes puede grabar la impresora: hay que elegirla en función de la etiqueta y de la superficie, no al revés.', de: 'Position und Empfindlichkeit der Antenne entscheiden, welche Smart Labels der Drucker beschreiben kann — die Wahl richtet sich nach Etikett und Untergrund, nicht umgekehrt.', ko: '안테나의 위치와 감도가 프린터로 기록할 수 있는 스마트 라벨을 결정합니다. 라벨과 부착면에 맞춰 선택해야 하며, 그 반대가 아닙니다.', zh: '天线的位置与灵敏度决定了打印机能写入哪些智能标签——应根据标签与被贴表面来选择，而不是反过来。',
    },
    variants: [
      {
        name: 'UHF RFID OM',
        purpose: {
          hu: 'On Metal: fémfelületre kerülő címkékhez. Az antenna a nyomtatófejen ül, ezért a chiphez a lehető legközelebb ír — a fémre tervezett, kisméretű címkéknél ez a járható út.',
          en: 'On Metal: for labels applied to metal surfaces. The antenna sits on the print head, so it writes as close to the chip as possible — the workable route for the small tags designed for metal.', it: 'On Metal: per etichette applicate su superfici metalliche. L’antenna è sulla testina di stampa, quindi scrive il più vicino possibile al chip — la via praticabile per i tag di piccole dimensioni progettati per il metallo.', es: 'On Metal: para etiquetas aplicadas sobre superficies metálicas. La antena va en el cabezal de impresión, de modo que graba lo más cerca posible del chip: la vía practicable para los tags pequeños diseñados para metal.', de: 'On Metal: für Etiketten, die auf Metalloberflächen kommen. Die Antenne sitzt am Druckkopf und schreibt damit so nah wie möglich am Chip — der gangbare Weg bei den kleinen, für Metall ausgelegten Tags.', ko: 'On Metal: 금속 표면에 부착하는 라벨용. 안테나가 프린트 헤드에 위치하여 칩에 최대한 가까이서 기록합니다. 금속용으로 설계된 소형 태그에 적합한 방식입니다.', zh: 'On Metal：用于贴附到金属表面的标签。天线位于打印头上，因此能尽可能贴近芯片写入——这是为金属设计的小尺寸标签的可行方案。',
        },
        params: [
          { label: { hu: 'Antenna helye', en: 'Antenna position', it: 'Posizione dell’antenna', es: 'Posición de la antena', de: 'Antennenposition', ko: '안테나 위치', zh: '天线位置' }, value: { hu: 'Nyomtatófejen', en: 'On the print head', it: 'Sulla testina di stampa', es: 'En el cabezal de impresión', de: 'Am Druckkopf', ko: '프린트 헤드', zh: '打印头上' } },
          { label: { hu: 'Modul', en: 'Module', it: 'Modulo', es: 'Módulo', de: 'Modul', ko: '모듈', zh: '模块' }, value: { hu: 'UHF RFID OM 4', en: 'UHF RFID OM 4', it: 'UHF RFID OM 4', es: 'UHF RFID OM 4', de: 'UHF RFID OM 4', ko: 'UHF RFID OM 4', zh: 'UHF RFID OM 4' } },
          { label: { hu: 'Melyik géphez', en: 'Available on', it: 'Disponibile su', es: 'Disponible en', de: 'Verfügbar für', ko: '적용 기종', zh: '适用机型' }, value: { hu: 'SQUIX 4.3, 4, 4.3 M, 4 M', en: 'SQUIX 4.3, 4, 4.3 M, 4 M', it: 'SQUIX 4.3, 4, 4.3 M, 4 M', es: 'SQUIX 4.3, 4, 4.3 M, 4 M', de: 'SQUIX 4.3, 4, 4.3 M, 4 M', ko: 'SQUIX 4.3, 4, 4.3 M, 4 M', zh: 'SQUIX 4.3、4、4.3 M、4 M' } },
        ],
      },
      {
        name: 'UHF RFID RS',
        purpose: {
          hu: 'Regular Sensitivity: a szokásos érzékenységű, alapértelmezett választás. A cab katalógusa szerint minden elterjedt RFID-címkéhez ez a szabvány megoldás — ha nincs különleges igény, ez kell.',
          en: 'Regular Sensitivity: the standard-sensitivity, default choice. According to cab’s catalogue this is the standard solution for all common RFID labels — with no special requirement, this is the one.', it: 'Regular Sensitivity: la scelta predefinita, a sensibilità standard. Secondo il catalogo cab è la soluzione standard per tutte le etichette RFID più diffuse — in assenza di esigenze particolari, è questa.', es: 'Regular Sensitivity: la opción por defecto, de sensibilidad estándar. Según el catálogo de cab es la solución estándar para todas las etiquetas RFID habituales; sin requisitos especiales, es la indicada.', de: 'Regular Sensitivity: die Standardwahl mit üblicher Empfindlichkeit. Laut cab-Katalog die Standardlösung für alle gängigen RFID-Etiketten — ohne besondere Anforderung ist das die richtige.', ko: 'Regular Sensitivity: 표준 감도의 기본 선택입니다. cab 카탈로그에 따르면 일반적으로 사용되는 모든 RFID 라벨에 적합한 표준 솔루션이며, 특별한 요구가 없다면 이 구성을 선택합니다.', zh: 'Regular Sensitivity：常规灵敏度，默认选择。按 cab 目录，这是适用于所有常见 RFID 标签的标准方案——若无特殊需求，选它即可。',
        },
        params: [
          { label: { hu: 'Antenna helye', en: 'Antenna position', it: 'Posizione dell’antenna', es: 'Posición de la antena', de: 'Antennenposition', ko: '안테나 위치', zh: '天线位置' }, value: { hu: 'Adagolóegységen', en: 'On the feeding unit', it: 'Sull’unità di alimentazione', es: 'En la unidad de alimentación', de: 'An der Zuführeinheit', ko: '피딩 유닛', zh: '送纸单元上' } },
          { label: { hu: 'Modul', en: 'Module', it: 'Modulo', es: 'Módulo', de: 'Modul', ko: '모듈', zh: '模块' }, value: { hu: 'UHF RFID RS 4 / RS 6 / RS 8', en: 'UHF RFID RS 4 / RS 6 / RS 8', it: 'UHF RFID RS 4 / RS 6 / RS 8', es: 'UHF RFID RS 4 / RS 6 / RS 8', de: 'UHF RFID RS 4 / RS 6 / RS 8', ko: 'UHF RFID RS 4 / RS 6 / RS 8', zh: 'UHF RFID RS 4 / RS 6 / RS 8' } },
          { label: { hu: 'Melyik géphez', en: 'Available on', it: 'Disponibile su', es: 'Disponible en', de: 'Verfügbar für', ko: '적용 기종', zh: '适用机型' }, value: { hu: 'SQUIX 4.3, 4, 4.3 M, 4 M — a 6.3 és 8.3 tervezett', en: 'SQUIX 4.3, 4, 4.3 M, 4 M — the 6.3 and 8.3 are in planning', it: 'SQUIX 4.3, 4, 4.3 M, 4 M — le 6.3 e 8.3 sono in pianificazione', es: 'SQUIX 4.3, 4, 4.3 M, 4 M — las 6.3 y 8.3 están en planificación', de: 'SQUIX 4.3, 4, 4.3 M, 4 M — der 6.3 und 8.3 in Planung', ko: 'SQUIX 4.3, 4, 4.3 M, 4 M — 6.3과 8.3은 계획 중', zh: 'SQUIX 4.3、4、4.3 M、4 M——6.3 与 8.3 规划中' } },
        ],
      },
      {
        name: 'UHF RFID HS',
        purpose: {
          hu: 'High Sensitivity: nagy érzékenységű antenna azokhoz a címkékhez, amelyeknek sajátos a sugárzási képe — jellemzően a nagyon apró chipekhez, amiket a szokásos antenna már nem ér el megbízhatóan.',
          en: 'High Sensitivity: a high-sensitivity antenna for labels with specific radiation characteristics — typically the very small tags that a regular antenna can no longer reach reliably.', it: 'High Sensitivity: antenna ad alta sensibilità per etichette con caratteristiche di irradiazione particolari — tipicamente i tag molto piccoli che un’antenna normale non raggiunge più in modo affidabile.', es: 'High Sensitivity: antena de alta sensibilidad para etiquetas con características de radiación específicas; normalmente los tags muy pequeños que una antena normal ya no alcanza de forma fiable.', de: 'High Sensitivity: hochempfindliche Antenne für Etiketten mit besonderer Abstrahlcharakteristik — typischerweise sehr kleine Tags, die eine normale Antenne nicht mehr zuverlässig erreicht.', ko: 'High Sensitivity: 방사 특성이 특수한 라벨을 위한 고감도 안테나입니다. 일반 안테나로는 안정적으로 도달하기 어려운 초소형 태그에 주로 사용합니다.', zh: 'High Sensitivity：面向辐射特性特殊的标签的高灵敏度天线——通常用于常规天线已难以可靠读写的极小芯片。',
        },
        params: [
          { label: { hu: 'Antenna helye', en: 'Antenna position', it: 'Posizione dell’antenna', es: 'Posición de la antena', de: 'Antennenposition', ko: '안테나 위치', zh: '天线位置' }, value: { hu: 'Adagolóegységen', en: 'On the feeding unit', it: 'Sull’unità di alimentazione', es: 'En la unidad de alimentación', de: 'An der Zuführeinheit', ko: '피딩 유닛', zh: '送纸单元上' } },
          { label: { hu: 'Modul', en: 'Module', it: 'Modulo', es: 'Módulo', de: 'Modul', ko: '모듈', zh: '模块' }, value: { hu: 'UHF RFID HS 4 / HS 6 / HS 8', en: 'UHF RFID HS 4 / HS 6 / HS 8', it: 'UHF RFID HS 4 / HS 6 / HS 8', es: 'UHF RFID HS 4 / HS 6 / HS 8', de: 'UHF RFID HS 4 / HS 6 / HS 8', ko: 'UHF RFID HS 4 / HS 6 / HS 8', zh: 'UHF RFID HS 4 / HS 6 / HS 8' } },
          { label: { hu: 'Melyik géphez', en: 'Available on', it: 'Disponibile su', es: 'Disponible en', de: 'Verfügbar für', ko: '적용 기종', zh: '适用机型' }, value: { hu: 'SQUIX 4.3, 4, 4.3 M, 4 M — a 6.3 és 8.3 tervezett', en: 'SQUIX 4.3, 4, 4.3 M, 4 M — the 6.3 and 8.3 are in planning', it: 'SQUIX 4.3, 4, 4.3 M, 4 M — le 6.3 e 8.3 sono in pianificazione', es: 'SQUIX 4.3, 4, 4.3 M, 4 M — las 6.3 y 8.3 están en planificación', de: 'SQUIX 4.3, 4, 4.3 M, 4 M — der 6.3 und 8.3 in Planung', ko: 'SQUIX 4.3, 4, 4.3 M, 4 M — 6.3과 8.3은 계획 중', zh: 'SQUIX 4.3、4、4.3 M、4 M——6.3 与 8.3 规划中' } },
        ],
      },
      {
        name: 'UHF RFID OM + RS',
        purpose: {
          hu: 'Mindkét antenna egyszerre: egy a nyomtatófejen, egy az adagolóegységen. Mindkettő önállóan, egyesével írja és olvassa a címkéket — így egy gépen futhat fémre való és hagyományos okoscímke is, antennacsere nélkül.',
          en: 'Both antennas at once: one on the print head, one on the feeding unit. Each reads and writes labels one by one, so on-metal and ordinary smart labels can run on the same machine without swapping antennas.', it: 'Entrambe le antenne insieme: una sulla testina di stampa, una sull’unità di alimentazione. Ciascuna legge e scrive le etichette una a una, così sulla stessa macchina possono girare smart label per metallo e ordinarie senza cambiare antenna.', es: 'Ambas antenas a la vez: una en el cabezal de impresión y otra en la unidad de alimentación. Cada una lee y graba las etiquetas de una en una, de modo que en la misma máquina pueden correr etiquetas inteligentes para metal y convencionales sin cambiar de antena.', de: 'Beide Antennen zugleich: eine am Druckkopf, eine an der Zuführeinheit. Jede liest und beschreibt die Etiketten einzeln, sodass auf derselben Maschine On-Metal- und gewöhnliche Smart Labels laufen können, ohne die Antenne zu tauschen.', ko: '두 안테나를 동시에 사용합니다. 하나는 프린트 헤드에, 다른 하나는 피딩 유닛에 장착되며 각각 라벨을 하나씩 읽고 기록합니다. 따라서 안테나 교체 없이 한 대의 기계에서 금속용과 일반 스마트 라벨을 모두 처리할 수 있습니다.', zh: '两支天线同时配备：一支在打印头，一支在送纸单元。各自逐张读写标签，因此同一台机器无需更换天线即可处理金属专用与普通智能标签。',
        },
        params: [
          { label: { hu: 'Antenna helye', en: 'Antenna position', it: 'Posizione dell’antenna', es: 'Posición de la antena', de: 'Antennenposition', ko: '안테나 위치', zh: '天线位置' }, value: { hu: 'Nyomtatófejen és adagolóegységen', en: 'On the print head and the feeding unit', it: 'Sulla testina di stampa e sull’unità di alimentazione', es: 'En el cabezal de impresión y en la unidad de alimentación', de: 'Am Druckkopf und an der Zuführeinheit', ko: '프린트 헤드 및 피딩 유닛', zh: '打印头与送纸单元上' } },
          { label: { hu: 'Modul', en: 'Module', it: 'Modulo', es: 'Módulo', de: 'Modul', ko: '모듈', zh: '模块' }, value: { hu: 'UHF RFID OM / RS 4', en: 'UHF RFID OM / RS 4', it: 'UHF RFID OM / RS 4', es: 'UHF RFID OM / RS 4', de: 'UHF RFID OM / RS 4', ko: 'UHF RFID OM / RS 4', zh: 'UHF RFID OM / RS 4' } },
          { label: { hu: 'Melyik géphez', en: 'Available on', it: 'Disponibile su', es: 'Disponible en', de: 'Verfügbar für', ko: '적용 기종', zh: '适用机型' }, value: { hu: 'SQUIX 4.3, 4, 4.3 M, 4 M', en: 'SQUIX 4.3, 4, 4.3 M, 4 M', it: 'SQUIX 4.3, 4, 4.3 M, 4 M', es: 'SQUIX 4.3, 4, 4.3 M, 4 M', de: 'SQUIX 4.3, 4, 4.3 M, 4 M', ko: 'SQUIX 4.3, 4, 4.3 M, 4 M', zh: 'SQUIX 4.3、4、4.3 M、4 M' } },
        ],
      },
    ],
  },
  {
    slug: 'cab-eos2',
    category: 'cimkenyomtatok',
    name: 'CAB EOS2',
    brand: 'CAB',
    short: {
      hu: 'Asztali vonalkódnyomtató tetszetős kivitelben — ügyfélszolgálatokra is.',
      en: 'Desktop barcode printer with an attractive design — suitable for front-office use.', it: 'Stampante di codici a barre desktop dal design accattivante — adatta all’uso in front-office.', es: 'Impresora de códigos de barras de sobremesa con un diseño atractivo — apta para la zona de atención al cliente.', de: 'Desktop-Barcodedrucker in attraktivem Design — auch für den Front-Office-Einsatz geeignet.', ko: '세련된 디자인의 데스크톱 바코드 프린터 — 프런트 오피스 사용에도 적합합니다.', zh: '外观时尚的桌面型条码打印机——适合前台办公环境使用。',
    },
    description: {
      hu: 'Az EOS2 kompakt asztali nyomtató, amely a megbízható címkenyomtatást magas kezelési komforttal ötvözi. 203 vagy 300 dpi felbontás, akár 150 mm/s sebesség, 108 mm nyomtatási szélesség és 152 mm-ig terjedő címketekercs-átmérő. Termotranszfer és direkt termál nyomtatás; mobil, akkumulátorról (24 V) táplálható változatban is elérhető. Formatervezése miatt ügyféltérben is megállja a helyét.',
      en: 'The EOS2 is a compact desktop printer combining reliable label printing with high operating comfort. 203 or 300 dpi resolution, up to 150 mm/s, 108 mm print width and label roll diameters up to 152 mm. Thermal transfer and direct thermal printing; also available as a mobile version powered from a battery (24 V). Its design makes it a good fit even in customer-facing areas.', it: 'La EOS2 è una stampante desktop compatta che unisce una stampa di etichette affidabile a un elevato comfort d’uso. Risoluzione 203 o 300 dpi, fino a 150 mm/s, larghezza di stampa 108 mm e diametro dei rotoli di etichette fino a 152 mm. Stampa a trasferimento termico e termica diretta; disponibile anche in versione mobile alimentata a batteria (24 V). Il suo design la rende adatta anche alle aree a contatto con il cliente.', es: 'La EOS2 es una impresora de sobremesa compacta que combina una impresión de etiquetas fiable con un gran confort de manejo. Resolución de 203 o 300 dpi, hasta 150 mm/s, 108 mm de ancho de impresión y rollos de etiquetas de hasta 152 mm de diámetro. Impresión por transferencia térmica y térmico directo; también disponible en versión móvil alimentada por batería (24 V). Su diseño la hace adecuada incluso en zonas de cara al cliente.', de: 'Der EOS2 ist ein kompakter Desktop-Drucker, der zuverlässigen Etikettendruck mit hohem Bedienkomfort verbindet. 203 oder 300 dpi Auflösung, bis zu 150 mm/s, 108 mm Druckbreite und Etikettenrollendurchmesser bis 152 mm. Thermotransfer- und Thermodirektdruck; auch als mobile, akkubetriebene Version (24 V) erhältlich. Sein Design macht ihn auch für Bereiche mit Kundenkontakt zur guten Wahl.', ko: 'EOS2는 신뢰성 있는 라벨 인쇄와 높은 조작 편의성을 결합한 컴팩트 데스크톱 프린터입니다. 203 또는 300 dpi 해상도, 최대 150 mm/s 속도, 108 mm 인쇄 폭, 최대 152 mm의 라벨 롤 직경을 지원합니다. 열전사 및 감열 인쇄 방식을 지원하며, 배터리(24 V)로 구동되는 모바일 버전도 제공됩니다. 세련된 디자인으로 고객 응대 공간에도 잘 어울립니다.', zh: 'EOS2 是一款紧凑型桌面打印机，兼具可靠的标签打印与出色的操作舒适性。203 或 300 dpi 分辨率，最高 150 mm/s，打印宽度 108 mm，标签卷直径最大 152 mm。支持热转印与热敏打印；亦提供由电池（24 V）供电的移动版本。其设计使它同样适合面向客户的场所。',
    },
    features: [
      { hu: '203 / 300 dpi, akár 150 mm/s', en: '203 / 300 dpi, up to 150 mm/s', it: '203 / 300 dpi, fino a 150 mm/s', es: '203 / 300 dpi, hasta 150 mm/s', de: '203 / 300 dpi, bis zu 150 mm/s', ko: '203 / 300 dpi, 최대 150 mm/s', zh: '203 / 300 dpi，最高 150 mm/s' },
      { hu: 'Nyomtatási szélesség 108 mm', en: 'Print width 108 mm', it: 'Larghezza di stampa 108 mm', es: 'Ancho de impresión 108 mm', de: 'Druckbreite 108 mm', ko: '인쇄 폭 108 mm', zh: '打印宽度 108 mm' },
      { hu: 'Címketekercs átmérő max. 152 mm', en: 'Label roll diameter up to 152 mm', it: 'Diametro rotolo etichette fino a 152 mm', es: 'Diámetro del rollo de etiquetas hasta 152 mm', de: 'Etikettenrollendurchmesser bis 152 mm', ko: '라벨 롤 직경 최대 152 mm', zh: '标签卷直径最大 152 mm' },
      { hu: 'Termotranszfer és direkt termál', en: 'Thermal transfer and direct thermal', it: 'Trasferimento termico e termico diretto', es: 'Transferencia térmica y térmico directo', de: 'Thermotransfer- und Thermodirektdruck', ko: '열전사 및 감열 방식', zh: '热转印与热敏打印' },
      { hu: 'Opcionális mobil (akkumulátoros) kivitel', en: 'Optional mobile (battery) version', it: 'Versione mobile (a batteria) opzionale', es: 'Versión móvil (batería) opcional', de: 'Optionale mobile (Akku-)Version', ko: '옵션 모바일(배터리) 버전', zh: '可选移动（电池）版本' },
    ],
    image: '/images/products/cab-eos2.webp',
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
      en: 'Desktop barcode printer that also takes large label rolls.', it: 'Stampante di codici a barre desktop che accoglie anche rotoli di etichette di grandi dimensioni.', es: 'Impresora de códigos de barras de sobremesa que admite además rollos de etiquetas grandes.', de: 'Desktop-Barcodedrucker, der auch große Etikettenrollen aufnimmt.', ko: '대형 라벨 롤도 장착 가능한 데스크톱 바코드 프린터.', zh: '可容纳大直径标签卷的桌面型条码打印机。',
    },
    description: {
      hu: 'Az EOS5 az EOS2 nagyobb testvére: ugyanaz a kezelési komfort és felbontás (203 / 300 dpi, akár 150 mm/s, 108 mm szélesség), de nagyméretű, 203 mm átmérőjű címketekercsekkel is használható. Termotranszfer és direkt termál nyomtatás; mobil, akkumulátoros (24 V) változatban is elérhető.',
      en: 'The EOS5 is the bigger sibling of the EOS2: the same operating comfort and resolution (203 / 300 dpi, up to 150 mm/s, 108 mm width), but it also accepts large label rolls up to 203 mm in diameter. Thermal transfer and direct thermal printing; also available as a mobile, battery-powered (24 V) version.', it: 'La EOS5 è la sorella maggiore della EOS2: stesso comfort d’uso e stessa risoluzione (203 / 300 dpi, fino a 150 mm/s, larghezza 108 mm), ma accoglie anche rotoli di etichette di grandi dimensioni fino a 203 mm di diametro. Stampa a trasferimento termico e termica diretta; disponibile anche in versione mobile alimentata a batteria (24 V).', es: 'La EOS5 es la hermana mayor de la EOS2: el mismo confort de manejo y la misma resolución (203 / 300 dpi, hasta 150 mm/s, 108 mm de ancho), pero admite además rollos de etiquetas de hasta 203 mm de diámetro. Impresión por transferencia térmica y térmico directo; también disponible en versión móvil alimentada por batería (24 V).', de: 'Der EOS5 ist der große Bruder des EOS2: gleicher Bedienkomfort und gleiche Auflösung (203 / 300 dpi, bis zu 150 mm/s, 108 mm Breite), zusätzlich nimmt er große Etikettenrollen bis 203 mm Durchmesser auf. Thermotransfer- und Thermodirektdruck; auch als mobile, akkubetriebene Version (24 V) erhältlich.', ko: 'EOS5는 EOS2의 상위 모델입니다. 동일한 조작 편의성과 해상도(203 / 300 dpi, 최대 150 mm/s, 108 mm 폭)를 제공하면서 직경 최대 203 mm의 대형 라벨 롤도 장착할 수 있습니다. 열전사 및 감열 인쇄를 지원하며, 배터리(24 V) 구동 모바일 버전도 제공됩니다.', zh: 'EOS5 是 EOS2 的加大版：同样的操作舒适性与分辨率（203 / 300 dpi，最高 150 mm/s，宽度 108 mm），同时可容纳直径最大 203 mm 的大标签卷。支持热转印与热敏打印；亦提供电池（24 V）供电的移动版本。',
    },
    features: [
      { hu: 'Címketekercs átmérő max. 203 mm', en: 'Label roll diameter up to 203 mm', it: 'Diametro rotolo etichette fino a 203 mm', es: 'Diámetro del rollo de etiquetas hasta 203 mm', de: 'Etikettenrollendurchmesser bis 203 mm', ko: '라벨 롤 직경 최대 203 mm', zh: '标签卷直径最大 203 mm' },
      { hu: '203 / 300 dpi, akár 150 mm/s', en: '203 / 300 dpi, up to 150 mm/s', it: '203 / 300 dpi, fino a 150 mm/s', es: '203 / 300 dpi, hasta 150 mm/s', de: '203 / 300 dpi, bis zu 150 mm/s', ko: '203 / 300 dpi, 최대 150 mm/s', zh: '203 / 300 dpi，最高 150 mm/s' },
      { hu: 'Nyomtatási szélesség 108 mm', en: 'Print width 108 mm', it: 'Larghezza di stampa 108 mm', es: 'Ancho de impresión 108 mm', de: 'Druckbreite 108 mm', ko: '인쇄 폭 108 mm', zh: '打印宽度 108 mm' },
      { hu: 'Termotranszfer és direkt termál', en: 'Thermal transfer and direct thermal', it: 'Trasferimento termico e termico diretto', es: 'Transferencia térmica y térmico directo', de: 'Thermotransfer- und Thermodirektdruck', ko: '열전사 및 감열 방식', zh: '热转印与热敏打印' },
      { hu: 'Opcionális mobil (akkumulátoros) kivitel', en: 'Optional mobile (battery) version', it: 'Versione mobile (a batteria) opzionale', es: 'Versión móvil (batería) opcional', de: 'Optionale mobile (Akku-)Version', ko: '옵션 모바일(배터리) 버전', zh: '可选移动（电池）版本' },
    ],
    image: '/images/products/cab-eos5.webp',
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
      en: 'Simple, easy-to-use barcode printer for smaller jobs.', it: 'Stampante di codici a barre semplice e facile da usare per lavori di piccole dimensioni.', es: 'Impresora de códigos de barras sencilla y fácil de usar para trabajos de menor volumen.', de: 'Einfacher, leicht bedienbarer Barcodedrucker für kleinere Aufgaben.', ko: '소규모 작업을 위한 간편하고 사용하기 쉬운 바코드 프린터.', zh: '操作简便的入门级条码打印机，适合较小规模的打印任务。',
    },
    description: {
      hu: 'A MACH1 megbízható, 4"-es asztali nyomtató bevált technikával, a belépő árszegmensben — kis és közepes mennyiségű nyomtatásra. Termotranszfer és direkt termál nyomtatás, 203 vagy 300 dpi felbontás, akár 127 mm/s sebesség, 108 mm nyomtatási szélesség és 118 mm-ig terjedő anyagszélesség. Nyomógombos kezelés LED-kijelzővel, tömör, duplafalú felépítés, cablabel S3 szoftver. RS232, USB, Ethernet.',
      en: 'The MACH1 is a reliable 4" desktop printer in proven technology, in the entry price segment — for small to medium print volumes. Thermal transfer and direct thermal printing, 203 or 300 dpi resolution, up to 127 mm/s, 108 mm print width and material widths up to 118 mm. Button operation with an LED display, solid double-walled construction and cablabel S3 software. RS232, USB, Ethernet.', it: 'La MACH1 è un’affidabile stampante desktop da 4" con tecnologia collaudata, nella fascia di prezzo d’ingresso — per volumi di stampa da piccoli a medi. Stampa a trasferimento termico e termica diretta, risoluzione 203 o 300 dpi, fino a 127 mm/s, larghezza di stampa 108 mm e larghezze materiale fino a 118 mm. Utilizzo tramite tasti con display a LED, solida costruzione a doppia parete e software cablabel S3. RS232, USB, Ethernet.', es: 'La MACH1 es una fiable impresora de sobremesa de 4" con tecnología probada, en el segmento de precio de entrada, para volúmenes de impresión pequeños y medios. Impresión por transferencia térmica y térmico directo, resolución de 203 o 300 dpi, hasta 127 mm/s, 108 mm de ancho de impresión y materiales de hasta 118 mm de ancho. Manejo por botones con display LED, construcción sólida de doble pared y software cablabel S3. RS232, USB, Ethernet.', de: 'Der MACH1 ist ein zuverlässiger 4"-Desktop-Drucker in bewährter Technik im Einstiegssegment — für kleine bis mittlere Druckvolumen. Thermotransfer- und Thermodirektdruck, 203 oder 300 dpi Auflösung, bis zu 127 mm/s, 108 mm Druckbreite und Materialbreiten bis 118 mm. Tastenbedienung mit LED-Anzeige, solide doppelwandige Konstruktion und cablabel S3 Software. RS232, USB, Ethernet.', ko: 'MACH1은 검증된 기술을 적용한 엔트리 가격대의 신뢰성 있는 4" 데스크톱 프린터로, 소규모에서 중간 규모의 인쇄량에 적합합니다. 열전사 및 감열 인쇄, 203 또는 300 dpi 해상도, 최대 127 mm/s 속도, 108 mm 인쇄 폭, 최대 118 mm의 소재 폭을 지원합니다. LED 디스플레이와 버튼 조작, 견고한 이중벽 구조, cablabel S3 소프트웨어를 제공합니다. RS232, USB, Ethernet.', zh: 'MACH1 是一款采用成熟技术的可靠 4" 桌面打印机，定位入门价位——适合中小批量打印。支持热转印与热敏打印，203 或 300 dpi 分辨率，最高 127 mm/s，打印宽度 108 mm，材料宽度最大 118 mm。按键操作配 LED 显示，坚固的双层壁结构，附带 cablabel S3 软件。RS232、USB、Ethernet。',
    },
    features: [
      { hu: '203 / 300 dpi, akár 127 mm/s', en: '203 / 300 dpi, up to 127 mm/s', it: '203 / 300 dpi, fino a 127 mm/s', es: '203 / 300 dpi, hasta 127 mm/s', de: '203 / 300 dpi, bis zu 127 mm/s', ko: '203 / 300 dpi, 최대 127 mm/s', zh: '203 / 300 dpi，最高 127 mm/s' },
      { hu: 'Nyomtatási szélesség 108 mm (4")', en: 'Print width 108 mm (4")', it: 'Larghezza di stampa 108 mm (4")', es: 'Ancho de impresión 108 mm (4")', de: 'Druckbreite 108 mm (4")', ko: '인쇄 폭 108 mm (4")', zh: '打印宽度 108 mm（4"）' },
      { hu: 'Termotranszfer és direkt termál', en: 'Thermal transfer and direct thermal', it: 'Trasferimento termico e termico diretto', es: 'Transferencia térmica y térmico directo', de: 'Thermotransfer- und Thermodirektdruck', ko: '열전사 및 감열 방식', zh: '热转印与热敏打印' },
      { hu: 'Nyomógombos kezelés, LED-kijelző', en: 'Button operation, LED display', it: 'Utilizzo tramite tasti, display a LED', es: 'Manejo por botones, display LED', de: 'Tastenbedienung, LED-Anzeige', ko: '버튼 조작, LED 디스플레이', zh: '按键操作，LED 显示' },
      { hu: 'RS232, USB, Ethernet; cablabel S3', en: 'RS232, USB, Ethernet; cablabel S3', it: 'RS232, USB, Ethernet; cablabel S3', es: 'RS232, USB, Ethernet; cablabel S3', de: 'RS232, USB, Ethernet; cablabel S3', ko: 'RS232, USB, Ethernet; cablabel S3', zh: 'RS232、USB、Ethernet；cablabel S3' },
    ],
    image: '/images/products/cab-mach1.webp',
    datasheet: '/datasheets/cab-mach12.pdf',
  },
  {
    slug: 'cab-mach2',
    category: 'cimkenyomtatok',
    name: 'CAB MACH2',
    brand: 'CAB',
    short: {
      hu: 'Kisebb feladatokhoz, kijelzővel és egyszerű memóriakezeléssel.',
      en: 'For smaller jobs, with a display and simple memory handling.', it: 'Per lavori di piccole dimensioni, con display e gestione semplice della memoria.', es: 'Para trabajos de menor volumen, con pantalla y gestión sencilla de la memoria.', de: 'Für kleinere Aufgaben, mit Display und einfacher Speicherverwaltung.', ko: '디스플레이와 간편한 메모리 관리 기능을 갖춘 소규모 작업용 모델.', zh: '适合较小规模任务，配备显示屏与简便的存储管理。',
    },
    description: {
      hu: 'A MACH2 a MACH1 magasabb kényelmi szintű változata: színes LCD-kijelző és cab navigátor-panel az intuitív, többnyelvű kezeléshez, közvetlenül a nyomtatón. 4"-es asztali nyomtató, termotranszfer és direkt termál, 203 vagy 300 dpi felbontás, akár 177 mm/s sebesség, 108 mm nyomtatási szélesség. Tömör, duplafalú felépítés, cablabel S3 szoftver, RS232 / USB / Ethernet.',
      en: 'The MACH2 is the higher-comfort variant of the MACH1: a colored LCD display and cab navigator pad for intuitive, multilingual operation directly on the printer. A 4" desktop printer, thermal transfer and direct thermal, 203 or 300 dpi resolution, up to 177 mm/s, 108 mm print width. Solid double-walled construction, cablabel S3 software, RS232 / USB / Ethernet.', it: 'La MACH2 è la variante a maggiore comfort della MACH1: display LCD a colori e navigator pad cab per un utilizzo intuitivo e multilingue direttamente sulla stampante. Stampante desktop da 4", a trasferimento termico e termica diretta, risoluzione 203 o 300 dpi, fino a 177 mm/s, larghezza di stampa 108 mm. Solida costruzione a doppia parete, software cablabel S3, RS232 / USB / Ethernet.', es: 'La MACH2 es la variante de mayor confort de la MACH1: display LCD en color y pad de navegación cab para un manejo intuitivo y multilingüe directamente en la impresora. Impresora de sobremesa de 4", transferencia térmica y térmico directo, resolución de 203 o 300 dpi, hasta 177 mm/s, 108 mm de ancho de impresión. Construcción sólida de doble pared, software cablabel S3, RS232 / USB / Ethernet.', de: 'Der MACH2 ist die komfortablere Variante des MACH1: farbiges LCD-Display und cab Navigator-Pad für intuitive, mehrsprachige Bedienung direkt am Drucker. Ein 4"-Desktop-Drucker, Thermotransfer- und Thermodirektdruck, 203 oder 300 dpi Auflösung, bis zu 177 mm/s, 108 mm Druckbreite. Solide doppelwandige Konstruktion, cablabel S3 Software, RS232 / USB / Ethernet.', ko: 'MACH2는 MACH1의 고급 편의성 버전입니다. 컬러 LCD 디스플레이와 cab 내비게이터 패드로 프린터에서 직접 직관적인 다국어 조작이 가능합니다. 4" 데스크톱 프린터로 열전사 및 감열 인쇄, 203 또는 300 dpi 해상도, 최대 177 mm/s 속도, 108 mm 인쇄 폭을 지원합니다. 견고한 이중벽 구조, cablabel S3 소프트웨어, RS232 / USB / Ethernet.', zh: 'MACH2 是 MACH1 的高舒适度版本：彩色 LCD 显示屏与 cab 导航键盘，可直接在打印机上进行直观的多语言操作。4" 桌面打印机，支持热转印与热敏打印，203 或 300 dpi 分辨率，最高 177 mm/s，打印宽度 108 mm。坚固的双层壁结构，cablabel S3 软件，RS232 / USB / Ethernet。',
    },
    features: [
      { hu: '203 / 300 dpi, akár 177 mm/s', en: '203 / 300 dpi, up to 177 mm/s', it: '203 / 300 dpi, fino a 177 mm/s', es: '203 / 300 dpi, hasta 177 mm/s', de: '203 / 300 dpi, bis zu 177 mm/s', ko: '203 / 300 dpi, 최대 177 mm/s', zh: '203 / 300 dpi，最高 177 mm/s' },
      { hu: 'Színes LCD-kijelző és navigátor-panel', en: 'Colored LCD display and navigator pad', it: 'Display LCD a colori e navigator pad', es: 'Display LCD en color y pad de navegación', de: 'Farbiges LCD-Display und Navigator-Pad', ko: '컬러 LCD 디스플레이 및 내비게이터 패드', zh: '彩色 LCD 显示屏与导航键盘' },
      { hu: 'Nyomtatási szélesség 108 mm (4")', en: 'Print width 108 mm (4")', it: 'Larghezza di stampa 108 mm (4")', es: 'Ancho de impresión 108 mm (4")', de: 'Druckbreite 108 mm (4")', ko: '인쇄 폭 108 mm (4")', zh: '打印宽度 108 mm（4"）' },
      { hu: 'Termotranszfer és direkt termál', en: 'Thermal transfer and direct thermal', it: 'Trasferimento termico e termico diretto', es: 'Transferencia térmica y térmico directo', de: 'Thermotransfer- und Thermodirektdruck', ko: '열전사 및 감열 방식', zh: '热转印与热敏打印' },
      { hu: 'RS232, USB, Ethernet; cablabel S3', en: 'RS232, USB, Ethernet; cablabel S3', it: 'RS232, USB, Ethernet; cablabel S3', es: 'RS232, USB, Ethernet; cablabel S3', de: 'RS232, USB, Ethernet; cablabel S3', ko: 'RS232, USB, Ethernet; cablabel S3', zh: 'RS232、USB、Ethernet；cablabel S3' },
    ],
    image: '/images/products/cab-mach2.webp',
    datasheet: '/datasheets/cab-mach12.pdf',
  },
  {
    slug: 'cab-mach4s',
    category: 'cimkenyomtatok',
    name: 'CAB MACH 4S',
    brand: 'CAB',
    short: {
      hu: 'Asztali modell nagyobb nyomtatási feladatokhoz, SQUIX elektronikával.',
      en: 'Desktop model for larger printing jobs, with SQUIX electronics.', it: 'Modello desktop per lavori di stampa più impegnativi, con elettronica SQUIX.', es: 'Modelo de sobremesa para trabajos de impresión mayores, con electrónica SQUIX.', de: 'Desktop-Modell für größere Druckaufgaben, mit SQUIX-Elektronik.', ko: 'SQUIX 전자 플랫폼을 갖춘 대규모 인쇄 작업용 데스크톱 모델.', zh: '面向较大打印任务的桌面机型，搭载 SQUIX 电子平台。',
    },
    description: {
      hu: 'A MACH 4S egy ipari nyomtató minden jellemzőjét hozza asztali méretben, kis helyigénnyel. Kiváló minőségű mechanika és váz, nagy, színes érintőkijelző önmagyarázó szimbólumokkal; a címke és a festékszalag elölről fűzhető be, a középre igazított anyagvezetés miatt nincs szükség beállításra. 203 / 300 / 600 dpi felbontás, akár 300 mm/s sebesség, 105,7–108,4 mm nyomtatási szélesség, legkisebb címke 5×5 mm. Letépő, adagoló (peel) és vágó kivitel. Minden szükséges interfész alapfelszereltségben.',
      en: 'The MACH 4S offers all the features of an industrial printer in a desktop size with a small footprint. High-quality print mechanics and chassis, a large colored touch display with self-explanatory symbols; labels and ribbon load from the front, and the centered media guide needs no adjustment. 203 / 300 / 600 dpi resolution, up to 300 mm/s, 105.7–108.4 mm print width, smallest label 5×5 mm. Tear-off, peel-off and cutter versions. All required interfaces as standard.', it: 'La MACH 4S offre tutte le caratteristiche di una stampante industriale in formato desktop con ingombro ridotto. Meccanica di stampa e telaio di alta qualità, ampio display touch a colori con simboli autoesplicativi; etichette e ribbon si caricano dal fronte e la guida materiale centrata non richiede regolazioni. Risoluzione 203 / 300 / 600 dpi, fino a 300 mm/s, larghezza di stampa 105,7–108,4 mm, etichetta minima 5×5 mm. Versioni con strappo, spellicolatura e taglierina. Tutte le interfacce necessarie di serie.', es: 'La MACH 4S ofrece todas las prestaciones de una impresora industrial en un tamaño de sobremesa con una huella reducida. Mecánica de impresión y chasis de alta calidad, una gran pantalla táctil en color con símbolos autoexplicativos; las etiquetas y el ribbon se cargan por delante y la guía de material centrada no necesita ajuste. Resolución de 203 / 300 / 600 dpi, hasta 300 mm/s, 105,7–108,4 mm de ancho de impresión, etiqueta mínima de 5×5 mm. Versiones tear-off, de despegado y con cizalla. Todas las interfaces necesarias de serie.', de: 'Der MACH 4S bietet alle Eigenschaften eines Industriedruckers im Desktop-Format mit kleiner Stellfläche. Hochwertige Druckmechanik und Chassis, großes farbiges Touchdisplay mit selbsterklärenden Symbolen; Etiketten und Farbband werden von vorn eingelegt, die zentrierte Materialführung benötigt keine Justierung. 203 / 300 / 600 dpi Auflösung, bis zu 300 mm/s, 105,7–108,4 mm Druckbreite, kleinstes Etikett 5×5 mm. Abreiß-, Spende- und Messerversionen. Alle erforderlichen Schnittstellen serienmäßig.', ko: 'MACH 4S는 작은 설치 면적의 데스크톱 크기에 산업용 프린터의 모든 기능을 담았습니다. 고품질 인쇄 메커니즘과 섀시, 직관적인 심벌을 표시하는 대형 컬러 터치 디스플레이를 갖추었으며, 라벨과 리본은 전면에서 장착하고 중앙 정렬 미디어 가이드는 별도의 조정이 필요 없습니다. 203 / 300 / 600 dpi 해상도, 최대 300 mm/s 속도, 105.7–108.4 mm 인쇄 폭, 최소 라벨 크기 5×5 mm를 지원합니다. 티어오프, 필오프 및 커터 버전이 있으며 필요한 모든 인터페이스가 기본 제공됩니다.', zh: 'MACH 4S 以小巧的桌面尺寸提供工业打印机的全部功能。高品质打印机构与机身，大尺寸彩色触摸屏配一目了然的图标；标签与碳带从正面装载，居中介质导向无需调整。203 / 300 / 600 dpi 分辨率，最高 300 mm/s，打印宽度 105.7–108.4 mm，最小标签 5×5 mm。提供撕离、剥离与切刀版本。标配所有必需接口。',
    },
    features: [
      { hu: '203 / 300 / 600 dpi, akár 300 mm/s', en: '203 / 300 / 600 dpi, up to 300 mm/s', it: '203 / 300 / 600 dpi, fino a 300 mm/s', es: '203 / 300 / 600 dpi, hasta 300 mm/s', de: '203 / 300 / 600 dpi, bis zu 300 mm/s', ko: '203 / 300 / 600 dpi, 최대 300 mm/s', zh: '203 / 300 / 600 dpi，最高 300 mm/s' },
      { hu: 'Nyomtatási szélesség max. 108,4 mm', en: 'Print width up to 108.4 mm', it: 'Larghezza di stampa fino a 108,4 mm', es: 'Ancho de impresión hasta 108,4 mm', de: 'Druckbreite bis 108,4 mm', ko: '인쇄 폭 최대 108.4 mm', zh: '打印宽度最大 108.4 mm' },
      { hu: 'Középre igazított anyagvezetés, elölről fűzés', en: 'Centered media guide, front loading', it: 'Guida materiale centrata, caricamento frontale', es: 'Guía de material centrada, carga frontal', de: 'Zentrierte Materialführung, Einlegen von vorn', ko: '중앙 정렬 미디어 가이드, 전면 장착', zh: '居中介质导向，正面装载' },
      { hu: 'Nagy színes érintőkijelző', en: 'Large colored touch display', it: 'Ampio display touch a colori', es: 'Gran pantalla táctil en color', de: 'Großes farbiges Touchdisplay', ko: '대형 컬러 터치 디스플레이', zh: '大尺寸彩色触摸屏' },
      { hu: 'Letépő, adagoló és vágó kivitel', en: 'Tear-off, peel-off and cutter versions', it: 'Versioni con strappo, spellicolatura e taglierina', es: 'Versiones tear-off, de despegado y con cizalla', de: 'Abreiß-, Spende- und Messerversionen', ko: '티어오프, 필오프 및 커터 버전', zh: '撕离、剥离与切刀版本' },
    ],
    image: '/images/products/cab-mach4s.webp',
    datasheet: '/datasheets/cab-mach4s.pdf',
  },
  {
    slug: 'cab-xc4',
    category: 'cimkenyomtatok',
    name: 'CAB XC4',
    brand: 'CAB',
    short: {
      hu: 'Kétszínű nyomtatás 4"-es fejjel — GHS veszélyesanyag-címkékhez.',
      en: 'Two-colour printing with a 4" head — for GHS hazard labels.', it: 'Stampa bicolore con testina da 4" — per etichette di pericolo GHS.', es: 'Impresión a dos colores con cabezal de 4" — para etiquetas de peligro GHS.', de: 'Zweifarbiger Druck mit 4"-Kopf — für GHS-Gefahrstoffetiketten.', ko: '4" 헤드를 갖춘 2색 인쇄 — GHS 위험물 라벨용.', zh: '配备 4" 打印头的双色打印——适用于 GHS 危险品标签。',
    },
    description: {
      hu: 'Az XC4 (XC Q4) két, egymás után elhelyezett termotranszfer nyomtatóegységgel egy menetben, egy címkére nyomtat kétszínűen — kifejezetten a GHS szerinti veszélyesanyag-jelölésekhez fejlesztve. 300 dpi felbontás, akár 150 mm/s sebesség, 105,7 mm nyomtatási szélesség, 20–116 mm címkeszélesség. A fűtés fejenként külön szabályozható; ha csak a 2. fejjel nyomtat, az 1. fej menüből felemelhető. Automatikus festékszalag-takarékosság.',
      en: 'The XC4 (XC Q4) prints two colours on a single label in one pass using two in-line thermal transfer print units — developed specifically for GHS hazard labeling. 300 dpi resolution, up to 150 mm/s, 105.7 mm print width, 20–116 mm label width. Heating is assigned separately to each head; when printing with head 2 only, head 1 is lifted via the menu. Automated ribbon saving.', it: 'La XC4 (XC Q4) stampa due colori su una singola etichetta in un solo passaggio utilizzando due gruppi di stampa a trasferimento termico in linea — sviluppata specificamente per l’etichettatura di pericolo GHS. Risoluzione 300 dpi, fino a 150 mm/s, larghezza di stampa 105,7 mm, larghezza etichetta 20–116 mm. Il riscaldamento è assegnato separatamente a ciascuna testina; stampando solo con la testina 2, la testina 1 viene sollevata tramite menu. Risparmio automatico del ribbon.', es: 'La XC4 (XC Q4) imprime dos colores en una misma etiqueta en una sola pasada mediante dos unidades de impresión por transferencia térmica en línea, desarrollada específicamente para el etiquetado de peligro GHS. Resolución de 300 dpi, hasta 150 mm/s, 105,7 mm de ancho de impresión, 20–116 mm de ancho de etiqueta. El calentamiento se asigna por separado a cada cabezal; al imprimir solo con el cabezal 2, el cabezal 1 se levanta desde el menú. Ahorro automatizado de ribbon.', de: 'Der XC4 (XC Q4) druckt mit zwei Inline-Thermotransfer-Druckwerken zwei Farben in einem Durchgang auf ein Etikett — speziell für die GHS-Gefahrstoffkennzeichnung entwickelt. 300 dpi Auflösung, bis zu 150 mm/s, 105,7 mm Druckbreite, 20–116 mm Etikettenbreite. Die Heizung wird jedem Kopf separat zugewiesen; wird nur mit Kopf 2 gedruckt, lässt sich Kopf 1 über das Menü anheben. Automatisierte Farbbandeinsparung.', ko: 'XC4(XC Q4)는 인라인으로 배치된 2개의 열전사 인쇄 유닛을 사용하여 한 번의 패스로 라벨 한 장에 2색을 인쇄하며, GHS 위험물 라벨링을 위해 특별히 개발되었습니다. 300 dpi 해상도, 최대 150 mm/s 속도, 105.7 mm 인쇄 폭, 20–116 mm 라벨 폭을 지원합니다. 가열은 각 헤드에 개별적으로 할당되며, 헤드 2만으로 인쇄할 때는 메뉴를 통해 헤드 1을 들어 올립니다. 자동 리본 절약 기능을 갖추었습니다.', zh: 'XC4（XC Q4）通过两个串联的热转印打印单元，一次走纸即可在同一标签上打印两种颜色——专为 GHS 危险品标签打印而开发。300 dpi 分辨率，最高 150 mm/s，打印宽度 105.7 mm，标签宽度 20–116 mm。两个打印头独立控制加热；仅用 2 号打印头打印时，可通过菜单抬起 1 号打印头。自动碳带节省功能。',
    },
    features: [
      { hu: 'Kétszínű nyomtatás egy menetben, két fejjel', en: 'Two-colour printing in one pass, two heads', it: 'Stampa bicolore in un passaggio, due testine', es: 'Impresión a dos colores en una pasada, dos cabezales', de: 'Zweifarbiger Druck in einem Durchgang, zwei Köpfe', ko: '한 번의 패스로 2색 인쇄, 2개 헤드', zh: '一次走纸双色打印，双打印头' },
      { hu: '300 dpi, akár 150 mm/s', en: '300 dpi, up to 150 mm/s', it: '300 dpi, fino a 150 mm/s', es: '300 dpi, hasta 150 mm/s', de: '300 dpi, bis zu 150 mm/s', ko: '300 dpi, 최대 150 mm/s', zh: '300 dpi，最高 150 mm/s' },
      { hu: 'Nyomtatási szélesség 105,7 mm (4")', en: 'Print width 105.7 mm (4")', it: 'Larghezza di stampa 105,7 mm (4")', es: 'Ancho de impresión 105,7 mm (4")', de: 'Druckbreite 105,7 mm (4")', ko: '인쇄 폭 105.7 mm (4")', zh: '打印宽度 105.7 mm（4"）' },
      { hu: 'Fejenként külön fűtésszabályzás', en: 'Separate heating per head', it: 'Riscaldamento separato per testina', es: 'Calentamiento independiente por cabezal', de: 'Separate Heizung je Kopf', ko: '헤드별 개별 가열', zh: '每个打印头独立加热' },
      { hu: 'GHS-megfelelő címkézés', en: 'GHS-compliant labeling', it: 'Etichettatura conforme GHS', es: 'Etiquetado conforme a GHS', de: 'GHS-konforme Kennzeichnung', ko: 'GHS 규정 준수 라벨링', zh: '符合 GHS 的标签打印' },
    ],
    image: '/images/products/cab-xc4.webp',
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
      en: 'Two-colour printing with a 6" head — for GHS hazard labels.', it: 'Stampa bicolore con testina da 6" — per etichette di pericolo GHS.', es: 'Impresión a dos colores con cabezal de 6" — para etiquetas de peligro GHS.', de: 'Zweifarbiger Druck mit 6"-Kopf — für GHS-Gefahrstoffetiketten.', ko: '6" 헤드를 갖춘 2색 인쇄 — GHS 위험물 라벨용.', zh: '配备 6" 打印头的双色打印——适用于 GHS 危险品标签。',
    },
    description: {
      hu: 'Az XC6 (XC Q6.3) az XC4 szélesebb változata: két, egymás után elhelyezett termotranszfer fejjel egy menetben nyomtat kétszínű címkéket, akár 162,6 mm szélességben (46–176 mm címkeszélesség). 300 dpi felbontás, akár 150 mm/s sebesség. Fejenként külön fűtésszabályzás, automatikus festékszalag-takarékosság — nagyobb méretű GHS veszélyesanyag-címkékhez.',
      en: 'The XC6 (XC Q6.3) is the wider variant of the XC4: two in-line thermal transfer heads print two-colour labels in one pass up to 162.6 mm wide (46–176 mm label width). 300 dpi resolution, up to 150 mm/s. Separate heating per head and automated ribbon saving — for larger GHS hazard labels.', it: 'La XC6 (XC Q6.3) è la variante più larga della XC4: due testine a trasferimento termico in linea stampano etichette bicolori in un solo passaggio fino a 162,6 mm di larghezza (larghezza etichetta 46–176 mm). Risoluzione 300 dpi, fino a 150 mm/s. Riscaldamento separato per testina e risparmio automatico del ribbon — per etichette di pericolo GHS di formato maggiore.', es: 'La XC6 (XC Q6.3) es la variante más ancha de la XC4: dos cabezales de transferencia térmica en línea imprimen etiquetas a dos colores en una sola pasada de hasta 162,6 mm de ancho (46–176 mm de ancho de etiqueta). Resolución de 300 dpi, hasta 150 mm/s. Calentamiento independiente por cabezal y ahorro automatizado de ribbon — para etiquetas de peligro GHS de mayor tamaño.', de: 'Der XC6 (XC Q6.3) ist die breitere Variante des XC4: Zwei Inline-Thermotransfer-Köpfe drucken zweifarbige Etiketten in einem Durchgang bis 162,6 mm Breite (46–176 mm Etikettenbreite). 300 dpi Auflösung, bis zu 150 mm/s. Separate Heizung je Kopf und automatisierte Farbbandeinsparung — für größere GHS-Gefahrstoffetiketten.', ko: 'XC6(XC Q6.3)은 XC4의 광폭 버전입니다. 인라인 열전사 헤드 2개가 한 번의 패스로 최대 162.6 mm 폭(라벨 폭 46–176 mm)의 2색 라벨을 인쇄합니다. 300 dpi 해상도, 최대 150 mm/s 속도를 지원합니다. 헤드별 개별 가열과 자동 리본 절약 기능으로 대형 GHS 위험물 라벨에 적합합니다.', zh: 'XC6（XC Q6.3）是 XC4 的宽幅版本：两个串联的热转印打印头一次走纸即可打印最宽 162.6 mm 的双色标签（标签宽度 46–176 mm）。300 dpi 分辨率，最高 150 mm/s。每个打印头独立加热并具备自动碳带节省功能——适用于更大的 GHS 危险品标签。',
    },
    features: [
      { hu: 'Kétszínű nyomtatás egy menetben, két fejjel', en: 'Two-colour printing in one pass, two heads', it: 'Stampa bicolore in un passaggio, due testine', es: 'Impresión a dos colores en una pasada, dos cabezales', de: 'Zweifarbiger Druck in einem Durchgang, zwei Köpfe', ko: '한 번의 패스로 2색 인쇄, 2개 헤드', zh: '一次走纸双色打印，双打印头' },
      { hu: '300 dpi, akár 150 mm/s', en: '300 dpi, up to 150 mm/s', it: '300 dpi, fino a 150 mm/s', es: '300 dpi, hasta 150 mm/s', de: '300 dpi, bis zu 150 mm/s', ko: '300 dpi, 최대 150 mm/s', zh: '300 dpi，最高 150 mm/s' },
      { hu: 'Nyomtatási szélesség 162,6 mm (6")', en: 'Print width 162.6 mm (6")', it: 'Larghezza di stampa 162,6 mm (6")', es: 'Ancho de impresión 162,6 mm (6")', de: 'Druckbreite 162,6 mm (6")', ko: '인쇄 폭 162.6 mm (6")', zh: '打印宽度 162.6 mm（6"）' },
      { hu: 'Fejenként külön fűtésszabályzás', en: 'Separate heating per head', it: 'Riscaldamento separato per testina', es: 'Calentamiento independiente por cabezal', de: 'Separate Heizung je Kopf', ko: '헤드별 개별 가열', zh: '每个打印头独立加热' },
      { hu: 'GHS-megfelelő címkézés', en: 'GHS-compliant labeling', it: 'Etichettatura conforme GHS', es: 'Etiquetado conforme a GHS', de: 'GHS-konforme Kennzeichnung', ko: 'GHS 규정 준수 라벨링', zh: '符合 GHS 的标签打印' },
    ],
    image: '/images/products/cab-xc6.webp',
    datasheet: '/datasheets/cab-xcq.pdf',
    videoId: 'xqlxvt3fOX4',
  },
  {
    slug: 'cab-xd-q',
    category: 'cimkenyomtatok',
    name: 'CAB XD Q',
    brand: 'CAB',
    image: '/images/products/cab-xd-q.webp',
    datasheet: '/datasheets/cab-xdq.pdf',
    short: {
      hu: 'Kétoldalas nyomtatás egy menetben — függőcímkékhez és flexibilis anyagokhoz.',
      en: 'Double-sided printing in a single pass — for tags and flexible materials.', it: 'Stampa fronte-retro in un solo passaggio — per cartellini e materiali flessibili.', es: 'Impresión a doble cara en una sola pasada — para etiquetas colgantes y materiales flexibles.', de: 'Beidseitiger Druck in einem Durchgang — für Anhänger und flexible Materialien.', ko: '한 번의 패스로 양면 인쇄 — 태그 및 유연한 소재용.', zh: '一次走纸即可双面打印——适用于吊牌与柔性材料。',
    },
    description: {
      hu: 'Az XD Q két nyomtatófejjel egyszerre nyomtatja a hordozó mindkét oldalát — textilszalagokra, kartoncímkékre, lapított zsugorcsövekre, valamint végtelenített szintetikus, papír- és kartonanyagokra, végtelenített vagy kész kivitelben. Ideális kétoldalas függőcímkékhez és flexibilis anyagokhoz, 4" és 6" szélességben, a legújabb cab elektronikai platformra építve.',
      en: 'The XD Q prints both sides of the web simultaneously with two printheads — on textile tapes, cardboard tags, pressed tubes, and continuous synthetic, paper or cardboard materials, continuous or ready-for-use. Ideal for double-sided tags and flexible materials, in 4" and 6" widths, built on the latest cab electronics platform.', it: 'La XD Q stampa simultaneamente entrambi i lati del nastro con due testine di stampa — su nastri tessili, cartellini in cartoncino, tubetti pressati e materiali continui sintetici, in carta o cartoncino, in continuo o pronti all’uso. Ideale per cartellini fronte-retro e materiali flessibili, nelle larghezze da 4" e 6", basata sulla più recente piattaforma elettronica cab.', es: 'La XD Q imprime ambas caras de la banda simultáneamente con dos cabezales de impresión: sobre cintas textiles, etiquetas colgantes de cartón, tubos prensados y materiales sintéticos, de papel o de cartón continuos, en continuo o listos para su uso. Ideal para etiquetas colgantes a doble cara y materiales flexibles, en anchos de 4" y 6", sobre la plataforma electrónica cab más reciente.', de: 'Der XD Q bedruckt mit zwei Druckköpfen beide Seiten der Materialbahn gleichzeitig — Textilbänder, Kartonanhänger, gepresste Schläuche sowie endlose Kunststoff-, Papier- oder Kartonmaterialien, endlos oder gebrauchsfertig. Ideal für beidseitige Anhänger und flexible Materialien, in 4"- und 6"-Breiten, aufgebaut auf der neuesten cab Elektronikplattform.', ko: 'XD Q는 2개의 프린트 헤드로 웹의 양면을 동시에 인쇄합니다 — 텍스타일 테이프, 판지 태그, 압착 튜브, 그리고 연속형 합성수지·종이·판지 소재에 연속형 또는 즉시 사용 형태로 인쇄합니다. 양면 태그와 유연한 소재에 이상적이며, 4" 및 6" 폭으로 제공되고 최신 cab 전자 플랫폼을 기반으로 합니다.', zh: 'XD Q 通过两个打印头同时打印料带的正反两面——可打印纺织带、纸板吊牌、压制套管，以及连续或预制成型的合成材料、纸张或纸板材料。是双面吊牌与柔性材料的理想选择，提供 4" 与 6" 两种宽度，基于最新的 cab 电子平台打造。',
    },
    features: [
      { hu: 'Kétoldalas nyomtatás egy menetben, két fejjel', en: 'Double-sided printing in one pass, two heads', it: 'Stampa fronte-retro in un passaggio, due testine', es: 'Impresión a doble cara en una pasada, dos cabezales', de: 'Beidseitiger Druck in einem Durchgang, zwei Köpfe', ko: '한 번의 패스로 양면 인쇄, 2개 헤드', zh: '一次走纸双面打印，双打印头' },
      { hu: '4" és 6" nyomtatási szélesség', en: '4" and 6" print widths', it: 'Larghezze di stampa da 4" e 6"', es: 'Anchos de impresión de 4" y 6"', de: '4"- und 6"-Druckbreiten', ko: '4" 및 6" 인쇄 폭', zh: '4" 与 6" 打印宽度' },
      { hu: 'Textil, karton, présbújtatott cső, végtelenített anyag', en: 'Textile, cardboard, pressed tubes, continuous media', it: 'Tessuti, cartoncino, tubetti pressati, materiali continui', es: 'Textil, cartón, tubos prensados, materiales continuos', de: 'Textil, Karton, gepresste Schläuche, Endlosmedien', ko: '텍스타일, 판지, 압착 튜브, 연속 미디어', zh: '纺织材料、纸板、压制套管、连续介质' },
      { hu: 'Legújabb cab elektronikai platform', en: 'Latest cab electronics platform', it: 'Piattaforma elettronica cab più recente', es: 'Plataforma electrónica cab más reciente', de: 'Neueste cab Elektronikplattform', ko: '최신 cab 전자 플랫폼', zh: '最新 cab 电子平台' },
    ],
  },

  // ——— CAB — Print & apply (címkéző gépek) ———
  {
    slug: 'cab-hermes-q',
    category: 'cimkezo-gepek',
    name: 'CAB HERMES Q',
    brand: 'CAB',
    image: '/images/products/cab-hermes-q.webp',
    datasheet: '/datasheets/cab-hermes-q.pdf',
    videoId: 'HG9eudLWxfM',
    short: {
      hu: 'Print & apply rendszer gyártósorra — pontos címkefelhelyezés valós időben.',
      en: 'Print & apply system for production lines — precise real-time label application.', it: 'Sistema stampa e applica per linee di produzione — applicazione precisa delle etichette in tempo reale.', es: 'Sistema de imprimir y aplicar para líneas de producción — aplicación precisa de etiquetas en tiempo real.', de: 'Print-and-Apply-System für Produktionslinien — präzise Etikettierung in Echtzeit.', ko: '생산 라인용 프린트 & 어플라이 시스템 — 정밀한 실시간 라벨 부착.', zh: '面向生产线的打印贴标系统——精确的实时贴标。',
    },
    description: {
      hu: 'A HERMES Q print & apply rendszer a legújabb cab nyomtatógeneráció elektronikájára épül: nagy teljesítményű CPU és pontos címkefelhelyezés hengeres, ferde vagy íves felületekre roll-on, blow-on vagy tamp-on applikátorral.',
      en: 'The HERMES Q print & apply system is built on the electronics of the latest cab printer generation: a powerful CPU and precise label application onto cylindrical, oblique or curved surfaces with roll-on, blow-on or tamp-on applicators.', it: 'Il sistema stampa e applica HERMES Q è basato sull’elettronica della più recente generazione di stampanti cab: una CPU potente e un’applicazione precisa delle etichette su superfici cilindriche, oblique o curve con applicatori roll-on, blow-on o tamp-on.', es: 'El sistema de imprimir y aplicar HERMES Q se basa en la electrónica de la última generación de impresoras cab: una CPU potente y la aplicación precisa de etiquetas sobre superficies cilíndricas, oblicuas o curvas con aplicadores roll-on, blow-on o tamp-on.', de: 'Das Print-and-Apply-System HERMES Q basiert auf der Elektronik der neuesten cab Druckergeneration: leistungsstarke CPU und präzise Etikettierung auf zylindrischen, schrägen oder gewölbten Oberflächen mit Roll-on-, Blow-on- oder Tamp-on-Applikatoren.', ko: 'HERMES Q 프린트 & 어플라이 시스템은 최신 cab 프린터 세대의 전자 플랫폼을 기반으로 합니다. 강력한 CPU와 함께 롤온, 블로우온 또는 탬프온 어플리케이터로 원통형, 경사면 또는 곡면에 라벨을 정밀하게 부착합니다.', zh: 'HERMES Q 打印贴标系统基于最新一代 cab 打印机的电子平台打造：强劲的 CPU，配合滚贴式、吹贴式或压贴式贴标模块，可将标签精确贴附于圆柱面、斜面或曲面。',
    },
    features: [
      { hu: 'Valós idejű print & apply', en: 'Real-time print & apply', it: 'Stampa e applica in tempo reale', es: 'Imprimir y aplicar en tiempo real', de: 'Print & Apply in Echtzeit', ko: '실시간 프린트 & 어플라이', zh: '实时打印贴标' },
      { hu: 'Roll-on / blow-on / tamp-on applikátorok', en: 'Roll-on / blow-on / tamp-on applicators', it: 'Applicatori roll-on / blow-on / tamp-on', es: 'Aplicadores roll-on / blow-on / tamp-on', de: 'Roll-on- / Blow-on- / Tamp-on-Applikatoren', ko: '롤온 / 블로우온 / 탬프온 어플리케이터', zh: '滚贴式 / 吹贴式 / 压贴式贴标模块' },
      { hu: 'Bal és jobb kivitel', en: 'Left and right versions', it: 'Versioni sinistra e destra', es: 'Versiones a izquierda y a derecha', de: 'Links- und Rechtsversionen', ko: '좌측 및 우측 버전', zh: '左右两种版本' },
      { hu: 'Gyártósori integráció', en: 'Production-line integration', it: 'Integrazione nella linea di produzione', es: 'Integración en línea de producción', de: 'Integration in Produktionslinien', ko: '생산 라인 통합', zh: '生产线集成' },
    ],
    orientation: {
      image: '/images/applicators/hermes-q-left-right.webp',
      title: { hu: 'Két orientáció, három nyomtatófej-szélesség', en: 'Two orientations, three printhead widths', it: 'Due orientamenti, tre larghezze di testina', es: 'Dos orientaciones, tres anchos de cabezal de impresión', de: 'Zwei Ausrichtungen, drei Druckkopfbreiten', ko: '2가지 방향, 3가지 프린트 헤드 폭', zh: '两种方向，三种打印头宽度' },
      text: {
        hu: 'A HERMES Q két kivitelben érhető el — jobbos (right) és balos (left) orientációban —, így bármelyik oldalról beépíthető a gyártósorba. A nyomtató modulok 2, 4 és 6 coll széles nyomtatófejjel rendelhetők.',
        en: 'The HERMES Q is available in two versions — right-hand and left-hand orientation — so it can be integrated into a production line from either side. The printer modules are available with 2", 4" and 6" wide printheads.', it: 'La HERMES Q è disponibile in due versioni — con orientamento destro e sinistro — per poter essere integrata in una linea di produzione da entrambi i lati. I moduli di stampa sono disponibili con testine di stampa larghe 2", 4" e 6".', es: 'El HERMES Q está disponible en dos versiones — con orientación a la derecha y a la izquierda — para poder integrarse en una línea de producción desde cualquiera de los dos lados. Los módulos de impresión están disponibles con cabezales de impresión de 2", 4" y 6" de ancho.', de: 'Der HERMES Q ist in zwei Versionen erhältlich — rechts- und linksorientiert — und lässt sich so von beiden Seiten in eine Produktionslinie integrieren. Die Druckermodule sind mit 2"-, 4"- und 6"-Druckköpfen verfügbar.', ko: 'HERMES Q는 오른쪽 및 왼쪽 방향의 두 가지 버전으로 제공되어 생산 라인의 어느 쪽에서도 통합할 수 있습니다. 프린터 모듈은 2", 4" 및 6" 폭의 프린트 헤드로 제공됩니다.', zh: 'HERMES Q 提供右向与左向两种版本，可从任意一侧集成到生产线中。打印模块提供 2"、4" 与 6" 宽度的打印头。',
      },
    },
    applicators: [
      {
        slug: 'hq-3014',
        image: '/images/applicators/hq-3014.webp',
        name: { hu: 'HQ 3014 / 3016 Karos felrakó', en: 'HQ 3014 / 3016 Arm applicator', it: 'Applicatore a braccio HQ 3014 / 3016', es: 'Aplicador de brazo HQ 3014 / 3016', de: 'HQ 3014 / 3016 Schwenkarm-Applikator', ko: 'HQ 3014 / 3016 암 어플리케이터', zh: 'HQ 3014 / 3016 摆臂式贴标模块' },
        description: {
          hu: 'Nagyobb címkékhez, termék elejének, oldalának vagy hátának címkézése. Két változat: 4" és 6" szélességhez.',
          en: 'For larger labels — labeling the front, side or back of the product. Two versions: for 4" and 6" width.', it: 'Per etichette di formato maggiore — etichettatura del fronte, del lato o del retro del prodotto. Due versioni: per larghezza 4" e 6".', es: 'Para etiquetas de mayor tamaño — etiquetado de la parte frontal, lateral o trasera del producto. Dos versiones: para anchura de 4" y 6".', de: 'Für größere Etiketten — Etikettierung vorn, seitlich oder hinten am Produkt. Zwei Ausführungen: für 4" und 6" Breite.', ko: '대형 라벨용 — 제품의 전면, 측면 또는 후면 라벨링. 4"와 6" 폭용 두 가지 버전.', zh: '适用于较大标签——在产品正面、侧面或背面贴标。 两种版本：适用于 4" 和 6" 宽度。',
        },
        longDescription: {
          hu: 'Címkék valós idejű felhelyezése felülről vagy oldalról mozgásban lévő csomagokra — jellemzően a csomag elejére vagy hátuljára. A párna a lehúzóél előtt veszi fel a nyomtatás közben készülő címkét, majd a forgó kar 0–90°-ban a termékre viszi. A 4"-os gépekhez (HERMES Q4 / Q4.3) a 3014, a 6"-oshoz (HERMES Q6.3) a 3016 való — a két változat csak ebben tér el; a pontos műszaki adatok a letölthető adatlapon.',
          en: 'Applies labels in real time from the top or side onto packages in motion — preferably to the front or back of a package. The pad picks up the label while it is printed, and the pivot arm transfers it to the product at 0–90°. The 3014 fits the 4" machines (HERMES Q4 / Q4.3), the 3016 the 6" one (HERMES Q6.3) — that is the only difference between them; exact technical data are in the downloadable datasheet.', it: 'Applica le etichette in tempo reale dall’alto o lateralmente su confezioni in movimento — preferibilmente sul fronte o sul retro della confezione. Il tampone applicatore preleva l’etichetta mentre viene stampata e il braccio oscillante la trasferisce sul prodotto a 0–90°. Il 3014 è destinato alle macchine da 4" (HERMES Q4 / Q4.3), il 3016 a quella da 6" (HERMES Q6.3): è l’unica differenza tra le due versioni; i dati tecnici precisi sono nella scheda tecnica scaricabile.', es: 'Aplica etiquetas en tiempo real desde arriba o desde el lateral sobre paquetes en movimiento, preferentemente en la parte frontal o trasera del paquete. El pad aplicador recoge la etiqueta mientras se imprime y el brazo pivotante la transfiere al producto a 0–90°. El 3014 corresponde a las máquinas de 4" (HERMES Q4 / Q4.3) y el 3016 a la de 6" (HERMES Q6.3): es la única diferencia entre ambas versiones; los datos técnicos exactos están en la ficha técnica descargable.', de: 'Bringt Etiketten in Echtzeit von oben oder von der Seite auf bewegte Verpackungen auf — bevorzugt auf die Vorder- oder Rückseite eines Pakets. Der Stempel übernimmt das Etikett während des Drucks, und der Schwenkarm überträgt es im Winkel von 0–90° auf das Produkt. Der 3014 passt zu den 4"-Geräten (HERMES Q4 / Q4.3), der 3016 zum 6"-Gerät (HERMES Q6.3) — nur darin unterscheiden sich die beiden Ausführungen; die genauen technischen Daten stehen im herunterladbaren Datenblatt.', ko: '이동 중인 패키지의 상단 또는 측면에서 실시간으로 라벨을 부착하며, 주로 패키지의 전면이나 후면에 부착합니다. 패드가 인쇄되는 라벨을 픽업하고, 피벗 암이 0–90° 범위에서 라벨을 제품에 전달합니다. 3014는 4" 장비(HERMES Q4 / Q4.3)용, 3016은 6" 장비(HERMES Q6.3)용이며 두 버전의 차이는 이것뿐입니다. 정확한 기술 데이터는 다운로드 가능한 데이터시트에 있습니다.', zh: '从顶部或侧面向运动中的包装实时贴标——优先贴于包装的正面或背面。吸盘在标签打印的同时将其吸取，摆臂以 0–90° 将标签转贴到产品上。 3014 适用于 4" 机型（HERMES Q4 / Q4.3），3016 适用于 6" 机型（HERMES Q6.3）——两种版本仅此区别；详细技术参数见可下载的数据表。',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width', it: 'Larghezza etichetta', es: 'Ancho de etiqueta', de: 'Etikettenbreite', ko: '라벨 폭', zh: '标签宽度' }, value: { hu: '25–174 mm', en: '25–174 mm', it: '25–174 mm', es: '25–174 mm', de: '25–174 mm', ko: '25–174 mm', zh: '25–174 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height', it: 'Altezza etichetta', es: 'Altura de etiqueta', de: 'Etikettenhöhe', ko: '라벨 높이', zh: '标签高度' }, value: { hu: '8–250 mm', en: '8–250 mm', it: '8–250 mm', es: '8–250 mm', de: '8–250 mm', ko: '8–250 mm', zh: '8–250 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state', it: 'Stato del prodotto', es: 'Estado del producto', de: 'Produktzustand', ko: '제품 상태', zh: '产品状态' }, value: { hu: 'mozgásban vagy álló', en: 'in motion or at rest', it: 'in movimento o fermo', es: 'en movimiento o parado', de: 'in Bewegung oder im Stillstand', ko: '이동 중 또는 정지 상태', zh: '运动或静止' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction', it: 'Direzione di applicazione', es: 'Dirección de aplicación', de: 'Etikettierrichtung', ko: '부착 방향', zh: '贴标方向' }, value: { hu: 'felülről, oldalról, elölről, hátulról', en: 'from top, side, front, back', it: 'dall’alto, laterale, frontale, posteriore', es: 'desde arriba, lateral, frontal, trasera', de: 'von oben, seitlich, vorn, hinten', ko: '상단, 측면, 전면, 후면에서', zh: '从顶部、侧面、正面、背面' } },
          { label: { hu: 'Csomagmagasság', en: 'Package height', it: 'Altezza confezione', es: 'Altura del paquete', de: 'Pakethöhe', ko: '패키지 높이', zh: '包装高度' }, value: { hu: 'változó', en: 'variable', it: 'variabile', es: 'variable', de: 'variabel', ko: '가변', zh: '可变' } },
          { label: { hu: 'Karhossz', en: 'Pivot arm length', it: 'Lunghezza braccio oscillante', es: 'Longitud del brazo pivotante', de: 'Schwenkarmlänge', ko: '피벗 암 길이', zh: '摆臂长度' }, value: { hu: '200–600 mm', en: '200–600 mm', it: '200–600 mm', es: '200–600 mm', de: '200–600 mm', ko: '200–600 mm', zh: '200–600 mm' } },
          { label: { hu: 'Elfordulási szög', en: 'Pivot angle', it: 'Angolo di rotazione', es: 'Ángulo de giro', de: 'Schwenkwinkel', ko: '피벗 각도', zh: '摆动角度' }, value: { hu: '0–90°', en: '0–90°', it: '0–90°', es: '0–90°', de: '0–90°', ko: '0–90°', zh: '0–90°' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate', it: 'Cadenza di ciclo', es: 'Cadencia de ciclo', de: 'Taktrate', ko: '사이클 속도', zh: '贴标节拍' }, value: { hu: '~15 címke/perc', en: '~15 labels/min', it: '~15 etichette/min', es: '~15 etiquetas/min', de: 'ca. 15 Etiketten/min', ko: '약 15매/분', zh: '约 15 张/分钟' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air', it: 'Aria compressa', es: 'Aire comprimido', de: 'Druckluft', ko: '압축 공기', zh: '压缩空气' }, value: { hu: '4,5 bar', en: '4.5 bar', it: '4,5 bar', es: '4,5 bar', de: '4,5 bar', ko: '4.5 bar', zh: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption', it: 'Assorbimento', es: 'Consumo eléctrico', de: 'Leistungsaufnahme', ko: '소비 전력', zh: '功耗' }, value: { hu: 'max. 15 W', en: 'max. 15 W', it: 'max. 15 W', es: 'máx. 15 W', de: 'max. 15 W', ko: '최대 15 W', zh: '最大 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '9–12 kg', en: '9–12 kg', it: '9–12 kg', es: '9–12 kg', de: '9–12 kg', ko: '9–12 kg', zh: '9–12 kg' } },
        ],
      },
      {
        slug: 'hq-4014',
        image: '/images/applicators/hq-4014.webp',
        name: { hu: 'HQ 4014 / 4016 Stroke applikátor', en: 'HQ 4014 / 4016 Stroke applicator', it: 'Applicatore a corsa HQ 4014 / 4016', es: 'Aplicador de carrera HQ 4014 / 4016', de: 'HQ 4014 / 4016 Hub-Applikator', ko: 'HQ 4014 / 4016 스트로크 어플리케이터', zh: 'HQ 4014 / 4016 行程式贴标模块' },
        description: {
          hu: 'Egyszerű címkézéshez. Két változat: 4" és 6" szélességhez.',
          en: 'For simple labeling. Two versions: for 4" and 6" width.', it: 'Per un’etichettatura semplice. Due versioni: per larghezza 4" e 6".', es: 'Para un etiquetado sencillo. Dos versiones: para anchura de 4" y 6".', de: 'Für einfache Etikettierung. Zwei Ausführungen: für 4" und 6" Breite.', ko: '간단한 라벨링용. 4"와 6" 폭용 두 가지 버전.', zh: '适用于简单贴标任务。 两种版本：适用于 4" 和 6" 宽度。',
        },
        longDescription: {
          hu: 'Címkék valós idejű felhelyezése minden oldalról csomagokra. A párna típusa határozza meg, hogy a csomag álljon-e vagy mozgásban is címkézhető. A lökethenger hossza adja meg a csomag és a lehúzóél közötti maximális távolságot. A 4"-os gépekhez (HERMES Q4 / Q4.3) a 4014, a 6"-oshoz (HERMES Q6.3) a 4016 való — a két változat csak ebben tér el; a pontos műszaki adatok a letölthető adatlapon.',
          en: 'Applies labels in real time from all sides onto packages. The type of pad defines whether a package has to be at rest or can be in motion. The stroke cylinder length defines the maximum distance between the package and the peel-off plate. The 4014 fits the 4" machines (HERMES Q4 / Q4.3), the 4016 the 6" one (HERMES Q6.3) — that is the only difference between them; exact technical data are in the downloadable datasheet.', it: 'Applica le etichette in tempo reale da tutti i lati sulle confezioni. Il tipo di tampone applicatore determina se la confezione deve essere ferma o può essere in movimento. La lunghezza del cilindro di corsa definisce la distanza massima tra la confezione e la piastra di spellicolatura. Il 4014 è destinato alle macchine da 4" (HERMES Q4 / Q4.3), il 4016 a quella da 6" (HERMES Q6.3): è l’unica differenza tra le due versioni; i dati tecnici precisi sono nella scheda tecnica scaricabile.', es: 'Aplica etiquetas en tiempo real desde todos los lados sobre paquetes. El tipo de pad aplicador define si el paquete debe estar parado o puede estar en movimiento. La longitud del cilindro de carrera define la distancia máxima entre el paquete y la placa de despegado. El 4014 corresponde a las máquinas de 4" (HERMES Q4 / Q4.3) y el 4016 a la de 6" (HERMES Q6.3): es la única diferencia entre ambas versiones; los datos técnicos exactos están en la ficha técnica descargable.', de: 'Bringt Etiketten in Echtzeit von allen Seiten auf Verpackungen auf. Der Stempeltyp bestimmt, ob ein Paket im Stillstand sein muss oder in Bewegung sein darf. Die Länge des Hubzylinders bestimmt den maximalen Abstand zwischen Paket und Spendekante. Der 4014 passt zu den 4"-Geräten (HERMES Q4 / Q4.3), der 4016 zum 6"-Gerät (HERMES Q6.3) — nur darin unterscheiden sich die beiden Ausführungen; die genauen technischen Daten stehen im herunterladbaren Datenblatt.', ko: '패키지의 모든 면에 실시간으로 라벨을 부착합니다. 패드 유형에 따라 패키지가 정지 상태여야 하는지 이동 중이어도 되는지가 결정됩니다. 스트로크 실린더 길이는 패키지와 필오프 플레이트 사이의 최대 거리를 결정합니다. 4014는 4" 장비(HERMES Q4 / Q4.3)용, 4016은 6" 장비(HERMES Q6.3)용이며 두 버전의 차이는 이것뿐입니다. 정확한 기술 데이터는 다운로드 가능한 데이터시트에 있습니다.', zh: '可从各个方向向包装实时贴标。吸盘类型决定包装必须静止还是可以处于运动状态。行程气缸长度决定包装与剥离板之间的最大距离。 4014 适用于 4" 机型（HERMES Q4 / Q4.3），4016 适用于 6" 机型（HERMES Q6.3）——两种版本仅此区别；详细技术参数见可下载的数据表。',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width', it: 'Larghezza etichetta', es: 'Ancho de etiqueta', de: 'Etikettenbreite', ko: '라벨 폭', zh: '标签宽度' }, value: { hu: '20–174 mm', en: '20–174 mm', it: '20–174 mm', es: '20–174 mm', de: '20–174 mm', ko: '20–174 mm', zh: '20–174 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height', it: 'Altezza etichetta', es: 'Altura de etiqueta', de: 'Etikettenhöhe', ko: '라벨 높이', zh: '标签高度' }, value: { hu: '20–210 mm', en: '20–210 mm', it: '20–210 mm', es: '20–210 mm', de: '20–210 mm', ko: '20–210 mm', zh: '20–210 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state', it: 'Stato del prodotto', es: 'Estado del producto', de: 'Produktzustand', ko: '제품 상태', zh: '产品状态' }, value: { hu: 'álló (párnától függően mozgásban)', en: 'at rest (in motion depending on pad)', it: 'fermo (in movimento a seconda del tampone)', es: 'parado (en movimiento según el pad aplicador)', de: 'im Stillstand (in Bewegung je nach Stempel)', ko: '정지 상태(패드에 따라 이동 중 가능)', zh: '静止（视吸盘类型可运动）' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction', it: 'Direzione di applicazione', es: 'Dirección de aplicación', de: 'Etikettierrichtung', ko: '부착 방향', zh: '贴标方向' }, value: { hu: 'felülről, alulról, oldalról', en: 'from top, below, side', it: 'dall’alto, dal basso, laterale', es: 'desde arriba, desde abajo, lateral', de: 'von oben, unten, seitlich', ko: '상단, 하단, 측면에서', zh: '从顶部、底部、侧面' } },
          { label: { hu: 'Csomagmagasság', en: 'Package height', it: 'Altezza confezione', es: 'Altura del paquete', de: 'Pakethöhe', ko: '패키지 높이', zh: '包装高度' }, value: { hu: 'változó', en: 'variable', it: 'variabile', es: 'variable', de: 'variabel', ko: '가변', zh: '可变' } },
          { label: { hu: 'Termék távolsága az egység aljától', en: 'Distance to bottom of unit', it: 'Distanza dal fondo dell’unità', es: 'Distancia al borde inferior de la unidad', de: 'Abstand zur Geräteunterkante', ko: '유닛 하단까지의 거리', zh: '距设备底部距离' }, value: { hu: 'max. 130–530 mm', en: 'up to 130–530 mm', it: 'fino a 130–530 mm', es: 'hasta 130–530 mm', de: 'bis 130–530 mm', ko: '최대 130–530 mm', zh: '最大 130–530 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate', it: 'Cadenza di ciclo', es: 'Cadencia de ciclo', de: 'Taktrate', ko: '사이클 속도', zh: '贴标节拍' }, value: { hu: '~25 címke/perc', en: '~25 labels/min', it: '~25 etichette/min', es: '~25 etiquetas/min', de: 'ca. 25 Etiketten/min', ko: '약 25매/분', zh: '约 25 张/分钟' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air', it: 'Aria compressa', es: 'Aire comprimido', de: 'Druckluft', ko: '압축 공기', zh: '压缩空气' }, value: { hu: '4,5 bar', en: '4.5 bar', it: '4,5 bar', es: '4,5 bar', de: '4,5 bar', ko: '4.5 bar', zh: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption', it: 'Assorbimento', es: 'Consumo eléctrico', de: 'Leistungsaufnahme', ko: '소비 전력', zh: '功耗' }, value: { hu: 'max. 15 W', en: 'max. 15 W', it: 'max. 15 W', es: 'máx. 15 W', de: 'max. 15 W', ko: '최대 15 W', zh: '最大 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '5–9,5 kg', en: '5–9.5 kg', it: '5–9,5 kg', es: '5–9,5 kg', de: '5–9,5 kg', ko: '5–9.5 kg', zh: '5–9.5 kg' } },
        ],
      },
      {
        slug: 'hq-4114',
        image: '/images/applicators/hq-4114.webp',
        name: { hu: 'HQ 4114 / 4116 Stroke applikátor', en: 'HQ 4114 / 4116 Stroke applicator', it: 'Applicatore a corsa HQ 4114 / 4116', es: 'Aplicador de carrera HQ 4114 / 4116', de: 'HQ 4114 / 4116 Hub-Applikator', ko: 'HQ 4114 / 4116 스트로크 어플리케이터', zh: 'HQ 4114 / 4116 行程式贴标模块' },
        description: {
          hu: 'Nagy pontosságú címkézés kis címkékhez (min. 4x4mm). Két változat: 2"/4" és 6" szélességhez.',
          en: 'High-precision labeling for small labels (min. 4x4 mm). Two versions: for 2"/4" and 6" width.', it: 'Etichettatura ad alta precisione per etichette piccole (min. 4x4 mm). Due versioni: per larghezza 2"/4" e 6".', es: 'Etiquetado de alta precisión para etiquetas pequeñas (mín. 4x4 mm). Dos versiones: para anchura de 2"/4" y 6".', de: 'Hochpräzise Etikettierung für kleine Etiketten (min. 4x4 mm). Zwei Ausführungen: für 2"/4" und 6" Breite.', ko: '소형 라벨(최소 4x4 mm)을 위한 고정밀 라벨링. 2"/4" 및 6" 폭용 두 가지 버전.', zh: '针对小标签（最小 4x4 mm）的高精度贴标。 两种版本：适用于 2"/4" 和 6" 宽度。',
        },
        longDescription: {
          hu: 'Kis és közepes címkék valós idejű felhelyezése minden oldalról. A párna a lehúzóél előtt veszi fel a nyomtatás közben készülő címkét, majd rövid löketű henger viszi vízszintesen pozícióba. Formapárnával hengeres és íves felületekre is. A 2"-os és 4"-os gépekhez (HERMES Q2, Q4 / Q4.3) a 4114, a 6"-oshoz (HERMES Q6.3) a 4116 való — a két változat csak ebben tér el; a pontos műszaki adatok a letölthető adatlapon.',
          en: 'Applies very small and midsized labels in real time from all sides. The pad picks up the label while it is printed and a short stroke cylinder brings it into position horizontally. With a form pad it labels cylindrical and curved surfaces too. The 4114 fits the 2" and 4" machines (HERMES Q2, Q4 / Q4.3), the 4116 the 6" one (HERMES Q6.3) — that is the only difference between them; exact technical data are in the downloadable datasheet.', it: 'Applica in tempo reale etichette molto piccole e di medio formato da tutti i lati. Il tampone applicatore preleva l’etichetta mentre viene stampata e un cilindro a corsa breve la porta in posizione orizzontalmente. Con un tampone sagomato etichetta anche superfici cilindriche e curve. Il 4114 è destinato alle macchine da 2" e 4" (HERMES Q2, Q4 / Q4.3), il 4116 a quella da 6" (HERMES Q6.3): è l’unica differenza tra le due versioni; i dati tecnici precisi sono nella scheda tecnica scaricabile.', es: 'Aplica etiquetas muy pequeñas y medianas en tiempo real desde todos los lados. El pad aplicador recoge la etiqueta mientras se imprime y un cilindro de carrera corta la lleva a su posición horizontalmente. Con un pad conformado etiqueta también superficies cilíndricas y curvas. El 4114 corresponde a las máquinas de 2" y 4" (HERMES Q2, Q4 / Q4.3) y el 4116 a la de 6" (HERMES Q6.3): es la única diferencia entre ambas versiones; los datos técnicos exactos están en la ficha técnica descargable.', de: 'Bringt sehr kleine und mittelgroße Etiketten in Echtzeit von allen Seiten auf. Der Stempel übernimmt das Etikett während des Drucks, ein kurzer Hubzylinder bringt es horizontal in Position. Mit einem Formstempel etikettiert er auch zylindrische und gewölbte Oberflächen. Der 4114 passt zu den 2"- und 4"-Geräten (HERMES Q2, Q4 / Q4.3), der 4116 zum 6"-Gerät (HERMES Q6.3) — nur darin unterscheiden sich die beiden Ausführungen; die genauen technischen Daten stehen im herunterladbaren Datenblatt.', ko: '초소형 및 중형 라벨을 모든 면에서 실시간으로 부착합니다. 패드가 인쇄되는 라벨을 픽업하고 쇼트 스트로크 실린더가 이를 수평 위치로 이동시킵니다. 폼 패드를 사용하면 원통형 표면과 곡면에도 라벨을 부착할 수 있습니다. 4114는 2" 및 4" 장비(HERMES Q2, Q4 / Q4.3)용, 4116은 6" 장비(HERMES Q6.3)용이며 두 버전의 차이는 이것뿐입니다. 정확한 기술 데이터는 다운로드 가능한 데이터시트에 있습니다.', zh: '可从各个方向实时贴附极小及中等尺寸的标签。吸盘在标签打印的同时将其吸取，短行程气缸将其水平送至贴标位置。配合成型吸盘还可为圆柱面与曲面贴标。 4114 适用于 2" 和 4" 机型（HERMES Q2、Q4 / Q4.3），4116 适用于 6" 机型（HERMES Q6.3）——两种版本仅此区别；详细技术参数见可下载的数据表。',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width', it: 'Larghezza etichetta', es: 'Ancho de etiqueta', de: 'Etikettenbreite', ko: '라벨 폭', zh: '标签宽度' }, value: { hu: '10–174 mm', en: '10–174 mm', it: '10–174 mm', es: '10–174 mm', de: '10–174 mm', ko: '10–174 mm', zh: '10–174 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height', it: 'Altezza etichetta', es: 'Altura de etiqueta', de: 'Etikettenhöhe', ko: '라벨 높이', zh: '标签高度' }, value: { hu: '8–80 mm', en: '8–80 mm', it: '8–80 mm', es: '8–80 mm', de: '8–80 mm', ko: '8–80 mm', zh: '8–80 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state', it: 'Stato del prodotto', es: 'Estado del producto', de: 'Produktzustand', ko: '제품 상태', zh: '产品状态' }, value: { hu: 'álló', en: 'at rest', it: 'fermo', es: 'parado', de: 'im Stillstand', ko: '정지 상태', zh: '静止' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction', it: 'Direzione di applicazione', es: 'Dirección de aplicación', de: 'Etikettierrichtung', ko: '부착 방향', zh: '贴标方向' }, value: { hu: 'felülről, alulról, oldalról', en: 'from top, below, side', it: 'dall’alto, dal basso, laterale', es: 'desde arriba, desde abajo, lateral', de: 'von oben, unten, seitlich', ko: '상단, 하단, 측면에서', zh: '从顶部、底部、侧面' } },
          { label: { hu: 'Termékmagasság', en: 'Product height', it: 'Altezza prodotto', es: 'Altura del producto', de: 'Produkthöhe', ko: '제품 높이', zh: '产品高度' }, value: { hu: 'változó', en: 'variable', it: 'variabile', es: 'variable', de: 'variabel', ko: '가변', zh: '可变' } },
          { label: { hu: 'Termék távolsága az egység aljától', en: 'Distance to bottom of unit', it: 'Distanza dal fondo dell’unità', es: 'Distancia al borde inferior de la unidad', de: 'Abstand zur Geräteunterkante', ko: '유닛 하단까지의 거리', zh: '距设备底部距离' }, value: { hu: 'max. 135–535 mm', en: 'up to 135–535 mm', it: 'fino a 135–535 mm', es: 'hasta 135–535 mm', de: 'bis 135–535 mm', ko: '최대 135–535 mm', zh: '最大 135–535 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate', it: 'Cadenza di ciclo', es: 'Cadencia de ciclo', de: 'Taktrate', ko: '사이클 속도', zh: '贴标节拍' }, value: { hu: '~20 címke/perc', en: '~20 labels/min', it: '~20 etichette/min', es: '~20 etiquetas/min', de: 'ca. 20 Etiketten/min', ko: '약 20매/분', zh: '约 20 张/分钟' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air', it: 'Aria compressa', es: 'Aire comprimido', de: 'Druckluft', ko: '압축 공기', zh: '压缩空气' }, value: { hu: '4,5 bar', en: '4.5 bar', it: '4,5 bar', es: '4,5 bar', de: '4,5 bar', ko: '4.5 bar', zh: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption', it: 'Assorbimento', es: 'Consumo eléctrico', de: 'Leistungsaufnahme', ko: '소비 전력', zh: '功耗' }, value: { hu: 'max. 15 W', en: 'max. 15 W', it: 'max. 15 W', es: 'máx. 15 W', de: 'max. 15 W', ko: '최대 15 W', zh: '最大 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '5–9 kg', en: '5–9 kg', it: '5–9 kg', es: '5–9 kg', de: '5–9 kg', ko: '5–9 kg', zh: '5–9 kg' } },
        ],
        videoId: 'P-9HXQJ-Lds',
      },
      {
        slug: 'hq-4214',
        image: '/images/applicators/hq-4214.webp',
        name: { hu: 'HQ 4214 Stroke turn applikátor', en: 'HQ 4214 Stroke turn applicator', it: 'Applicatore a corsa e rotazione HQ 4214', es: 'Aplicador de carrera y giro HQ 4214', de: 'HQ 4214 Dreh-Hub-Applikator', ko: 'HQ 4214 스트로크 턴 어플리케이터', zh: 'HQ 4214 行程回转式贴标模块' },
        description: {
          hu: 'Kis címkék minden oldalról, nehezen beépíthető helyeken is.',
          en: 'Small labels from all sides, also in hard-to-install positions.', it: 'Etichette piccole da tutti i lati, anche in posizioni di installazione difficili.', es: 'Etiquetas pequeñas desde todos los lados, también en posiciones de montaje difíciles.', de: 'Kleine Etiketten von allen Seiten, auch in schwer zugänglichen Einbaulagen.', ko: '설치가 어려운 위치에서도 모든 면에 소형 라벨을 부착합니다.', zh: '从各个方向贴附小标签，亦适用于难以安装设备的位置。',
        },
        longDescription: {
          hu: 'Nagyon kis vagy közepes címkék valós idejű felhelyezése minden oldalról, ahol az egység nehezen építhető be. A párnát forgóhenger vízszintesen legfeljebb 180°-ban a felhelyezési síkba fordítja, majd a lökethenger a termékre viszi a címkét.',
          en: 'Applies very small or midsized labels in real time from all sides where the unit is difficult to install. A rotary cylinder pivots the pad by up to 180° horizontally into the application plane, then a stroke cylinder transfers the label to the product.', it: 'Applica in tempo reale etichette molto piccole o di medio formato da tutti i lati, dove l’unità è difficile da installare. Un cilindro rotante ruota il tampone applicatore fino a 180° orizzontalmente nel piano di applicazione, quindi un cilindro di corsa trasferisce l’etichetta sul prodotto.', es: 'Aplica etiquetas muy pequeñas o medianas en tiempo real desde todos los lados allí donde la unidad es difícil de instalar. Un cilindro rotativo gira el pad aplicador hasta 180° en horizontal hasta el plano de aplicación y, a continuación, un cilindro de carrera transfiere la etiqueta al producto.', de: 'Bringt sehr kleine oder mittelgroße Etiketten in Echtzeit von allen Seiten auf, wo der Einbau des Geräts schwierig ist. Ein Drehzylinder schwenkt den Stempel horizontal um bis zu 180° in die Etikettierebene, anschließend überträgt ein Hubzylinder das Etikett auf das Produkt.', ko: '유닛 설치가 어려운 곳에서 초소형 또는 중형 라벨을 모든 면에 실시간으로 부착합니다. 로터리 실린더가 패드를 수평으로 최대 180°까지 회전시켜 부착 평면에 위치시키고, 이어서 스트로크 실린더가 라벨을 제품에 전달합니다.', zh: '在设备难以安装的位置，从各个方向实时贴附极小或中等尺寸的标签。回转气缸将吸盘在水平方向最大旋转 180° 至贴标平面，随后行程气缸将标签转贴到产品上。',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width', it: 'Larghezza etichetta', es: 'Ancho de etiqueta', de: 'Etikettenbreite', ko: '라벨 폭', zh: '标签宽度' }, value: { hu: '4–80 mm', en: '4–80 mm', it: '4–80 mm', es: '4–80 mm', de: '4–80 mm', ko: '4–80 mm', zh: '4–80 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height', it: 'Altezza etichetta', es: 'Altura de etiqueta', de: 'Etikettenhöhe', ko: '라벨 높이', zh: '标签高度' }, value: { hu: '4–40 mm', en: '4–40 mm', it: '4–40 mm', es: '4–40 mm', de: '4–40 mm', ko: '4–40 mm', zh: '4–40 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state', it: 'Stato del prodotto', es: 'Estado del producto', de: 'Produktzustand', ko: '제품 상태', zh: '产品状态' }, value: { hu: 'álló (fújópárnával mozgásban)', en: 'at rest (in motion with blow-on pad)', it: 'fermo (in movimento con tampone a soffio)', es: 'parado (en movimiento con pad de soplado)', de: 'im Stillstand (in Bewegung mit Blasstempel)', ko: '정지 상태(블로우온 패드 사용 시 이동 중 가능)', zh: '静止（配吹贴吸盘可运动）' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction', it: 'Direzione di applicazione', es: 'Dirección de aplicación', de: 'Etikettierrichtung', ko: '부착 방향', zh: '贴标方向' }, value: { hu: 'felülről, alulról, oldalról', en: 'from top, below, side', it: 'dall’alto, dal basso, laterale', es: 'desde arriba, desde abajo, lateral', de: 'von oben, unten, seitlich', ko: '상단, 하단, 측면에서', zh: '从顶部、底部、侧面' } },
          { label: { hu: 'Vízszintes elfordulás', en: 'Horizontal rotation', it: 'Rotazione orizzontale', es: 'Giro horizontal', de: 'Horizontale Drehung', ko: '수평 회전', zh: '水平旋转' }, value: { hu: '90°, 0° (180° max. 15 mm magas címkénél)', en: '90°, 0° (180° for labels up to 15 mm high)', it: '90°, 0° (180° per etichette fino a 15 mm di altezza)', es: '90°, 0° (180° para etiquetas de hasta 15 mm de altura)', de: '90°, 0° (180° bei Etiketten bis 15 mm Höhe)', ko: '90°, 0°(높이 15 mm 이하 라벨은 180°)', zh: '90°、0°（标签高度不超过 15 mm 时可 180°）' } },
          { label: { hu: 'Termék távolsága az egység aljától', en: 'Distance to bottom of unit', it: 'Distanza dal fondo dell’unità', es: 'Distancia al borde inferior de la unidad', de: 'Abstand zur Geräteunterkante', ko: '유닛 하단까지의 거리', zh: '距设备底部距离' }, value: { hu: 'max. 135–335 mm', en: 'up to 135–335 mm', it: 'fino a 135–335 mm', es: 'hasta 135–335 mm', de: 'bis 135–335 mm', ko: '최대 135–335 mm', zh: '最大 135–335 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate', it: 'Cadenza di ciclo', es: 'Cadencia de ciclo', de: 'Taktrate', ko: '사이클 속도', zh: '贴标节拍' }, value: { hu: '~20 címke/perc', en: '~20 labels/min', it: '~20 etichette/min', es: '~20 etiquetas/min', de: 'ca. 20 Etiketten/min', ko: '약 20매/분', zh: '约 20 张/分钟' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air', it: 'Aria compressa', es: 'Aire comprimido', de: 'Druckluft', ko: '압축 공기', zh: '压缩空气' }, value: { hu: '4,5 bar', en: '4.5 bar', it: '4,5 bar', es: '4,5 bar', de: '4,5 bar', ko: '4.5 bar', zh: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption', it: 'Assorbimento', es: 'Consumo eléctrico', de: 'Leistungsaufnahme', ko: '소비 전력', zh: '功耗' }, value: { hu: 'max. 15 W', en: 'max. 15 W', it: 'max. 15 W', es: 'máx. 15 W', de: 'max. 15 W', ko: '최대 15 W', zh: '最大 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '5–7,5 kg', en: '5–7.5 kg', it: '5–7,5 kg', es: '5–7,5 kg', de: '5–7,5 kg', ko: '5–7.5 kg', zh: '5–7.5 kg' } },
        ],
        videoId: '0QethJtANc0',
      },
      {
        slug: 'hq-4414',
        image: '/images/applicators/hq-4414.webp',
        name: { hu: 'HQ 4414 Stroke applikátor', en: 'HQ 4414 Stroke applicator', it: 'Applicatore a corsa HQ 4414', es: 'Aplicador de carrera HQ 4414', de: 'HQ 4414 Hub-Applikator', ko: 'HQ 4414 스트로크 어플리케이터', zh: 'HQ 4414 行程式贴标模块' },
        description: {
          hu: 'Kis és közepes címkék minden oldalról, x-y irányban állítható pozícióval.',
          en: 'Small and midsized labels from all sides, with an x-y adjustable position.', it: 'Etichette piccole e di medio formato da tutti i lati, con posizione regolabile x-y.', es: 'Etiquetas pequeñas y medianas desde todos los lados, con posición ajustable en x-y.', de: 'Kleine und mittelgroße Etiketten von allen Seiten, mit in x- und y-Richtung justierbarer Position.', ko: '소형 및 중형 라벨을 모든 면에 부착, x-y 방향 위치 조정 가능.', zh: '从各个方向贴附小型及中型标签，贴标位置可在 x-y 方向调节。',
        },
        longDescription: {
          hu: 'Nagyon kis és közepes címkék valós idejű felhelyezése minden oldalról. A felhelyezési pozíció x és y irányban is finoman állítható. A párnát két rövid löketű henger viszi pontosan a helyére, majd a lökethenger a termékre helyezi a címkét.',
          en: 'Applies very small and midsized labels in real time from all sides. The application position is finely adjustable in both x and y directions. Two short stroke cylinders bring the pad exactly into position, then a stroke cylinder places the label on the product.', it: 'Applica in tempo reale etichette molto piccole e di medio formato da tutti i lati. La posizione di applicazione è regolabile con precisione sia in direzione x sia in direzione y. Due cilindri a corsa breve portano il tampone applicatore esattamente in posizione, quindi un cilindro di corsa depone l’etichetta sul prodotto.', es: 'Aplica etiquetas muy pequeñas y medianas en tiempo real desde todos los lados. La posición de aplicación se ajusta con precisión tanto en dirección x como en y. Dos cilindros de carrera corta llevan el pad aplicador exactamente a su posición y, después, un cilindro de carrera coloca la etiqueta sobre el producto.', de: 'Bringt sehr kleine und mittelgroße Etiketten in Echtzeit von allen Seiten auf. Die Etikettierposition ist in x- und y-Richtung fein justierbar. Zwei kurze Hubzylinder bringen den Stempel exakt in Position, anschließend setzt ein Hubzylinder das Etikett auf das Produkt.', ko: '초소형 및 중형 라벨을 모든 면에서 실시간으로 부착합니다. 부착 위치는 x와 y 방향 모두 미세 조정이 가능합니다. 2개의 쇼트 스트로크 실린더가 패드를 정확한 위치로 이동시킨 후, 스트로크 실린더가 라벨을 제품에 부착합니다.', zh: '可从各个方向实时贴附极小及中等尺寸的标签。贴标位置可在 x 和 y 两个方向精细调节。两个短行程气缸将吸盘精确定位，随后行程气缸将标签贴到产品上。',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width', it: 'Larghezza etichetta', es: 'Ancho de etiqueta', de: 'Etikettenbreite', ko: '라벨 폭', zh: '标签宽度' }, value: { hu: '4–114 mm', en: '4–114 mm', it: '4–114 mm', es: '4–114 mm', de: '4–114 mm', ko: '4–114 mm', zh: '4–114 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height', it: 'Altezza etichetta', es: 'Altura de etiqueta', de: 'Etikettenhöhe', ko: '라벨 높이', zh: '标签高度' }, value: { hu: '4–80 mm', en: '4–80 mm', it: '4–80 mm', es: '4–80 mm', de: '4–80 mm', ko: '4–80 mm', zh: '4–80 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state', it: 'Stato del prodotto', es: 'Estado del producto', de: 'Produktzustand', ko: '제품 상태', zh: '产品状态' }, value: { hu: 'álló', en: 'at rest', it: 'fermo', es: 'parado', de: 'im Stillstand', ko: '정지 상태', zh: '静止' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction', it: 'Direzione di applicazione', es: 'Dirección de aplicación', de: 'Etikettierrichtung', ko: '부착 방향', zh: '贴标方向' }, value: { hu: 'felülről, alulról, oldalról', en: 'from top, below, side', it: 'dall’alto, dal basso, laterale', es: 'desde arriba, desde abajo, lateral', de: 'von oben, unten, seitlich', ko: '상단, 하단, 측면에서', zh: '从顶部、底部、侧面' } },
          { label: { hu: 'Termékmagasság', en: 'Product height', it: 'Altezza prodotto', es: 'Altura del producto', de: 'Produkthöhe', ko: '제품 높이', zh: '产品高度' }, value: { hu: 'változó', en: 'variable', it: 'variabile', es: 'variable', de: 'variabel', ko: '가변', zh: '可变' } },
          { label: { hu: 'Pozícióállítás (x / y)', en: 'Position adjustment (x / y)', it: 'Regolazione della posizione (x / y)', es: 'Ajuste de posición (x / y)', de: 'Positionsjustierung (x / y)', ko: '위치 조정(x / y)', zh: '位置调节（x / y）' }, value: { hu: 'x 3–7 mm, y 11–15 mm', en: 'x 3–7 mm, y 11–15 mm', it: 'x 3–7 mm, y 11–15 mm', es: 'x 3–7 mm, y 11–15 mm', de: 'x 3–7 mm, y 11–15 mm', ko: 'x 3–7 mm, y 11–15 mm', zh: 'x 3–7 mm，y 11–15 mm' } },
          { label: { hu: 'Termék távolsága az egység aljától', en: 'Distance to bottom of unit', it: 'Distanza dal fondo dell’unità', es: 'Distancia al borde inferior de la unidad', de: 'Abstand zur Geräteunterkante', ko: '유닛 하단까지의 거리', zh: '距设备底部距离' }, value: { hu: 'max. 135–335 mm', en: 'up to 135–335 mm', it: 'fino a 135–335 mm', es: 'hasta 135–335 mm', de: 'bis 135–335 mm', ko: '최대 135–335 mm', zh: '最大 135–335 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate', it: 'Cadenza di ciclo', es: 'Cadencia de ciclo', de: 'Taktrate', ko: '사이클 속도', zh: '贴标节拍' }, value: { hu: '~25 címke/perc', en: '~25 labels/min', it: '~25 etichette/min', es: '~25 etiquetas/min', de: 'ca. 25 Etiketten/min', ko: '약 25매/분', zh: '约 25 张/分钟' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air', it: 'Aria compressa', es: 'Aire comprimido', de: 'Druckluft', ko: '압축 공기', zh: '压缩空气' }, value: { hu: '4,5 bar', en: '4.5 bar', it: '4,5 bar', es: '4,5 bar', de: '4,5 bar', ko: '4.5 bar', zh: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption', it: 'Assorbimento', es: 'Consumo eléctrico', de: 'Leistungsaufnahme', ko: '소비 전력', zh: '功耗' }, value: { hu: 'max. 15 W', en: 'max. 15 W', it: 'max. 15 W', es: 'máx. 15 W', de: 'max. 15 W', ko: '최대 15 W', zh: '最大 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '5–6 kg', en: '5–6 kg', it: '5–6 kg', es: '5–6 kg', de: '5–6 kg', ko: '5–6 kg', zh: '5–6 kg' } },
        ],
      },
      {
        slug: 'hq-4714',
        image: '/images/applicators/hq-4714.webp',
        name: { hu: 'HQ 4714 Zászló címkéző', en: 'HQ 4714 Flag applicator', it: 'Applicatore a bandierina HQ 4714', es: 'Aplicador de bandera HQ 4714', de: 'HQ 4714 Fahnen-Applikator', ko: 'HQ 4714 플래그 어플리케이터', zh: 'HQ 4714 旗形贴标模块' },
        description: {
          hu: 'Kábelek címkézése nagy pontossággal.',
          en: 'High-precision labeling of cables.', it: 'Etichettatura ad alta precisione di cavi.', es: 'Etiquetado de alta precisión de cables.', de: 'Hochpräzise Etikettierung von Kabeln.', ko: '케이블의 고정밀 라벨링.', zh: '线缆的高精度贴标。',
        },
        longDescription: {
          hu: 'Címkék valós idejű, pontos felhelyezése kerek anyagokra — kábelekre, tömlőkre, csövekre. A párna felveszi a nyomtatás közben készülő címkét, majd egy vezérelt henger körbevezeti az anyag körül: a címke két vége összeragad, azután zászló formában a termékre simul.',
          en: 'Applies labels precisely in real time onto round materials such as cables, hoses or pipes. The pad picks up the label while it is printed, then a cam-controlled cylinder guides it around the material: both label ends stick together and the label is tamped as a flag.', it: 'Applica le etichette con precisione e in tempo reale su materiali tondi come cavi, tubi flessibili o tubazioni. Il tampone applicatore preleva l’etichetta mentre viene stampata, quindi un cilindro comandato a camma la guida attorno al materiale: le due estremità dell’etichetta si uniscono e l’etichetta viene applicata a bandierina.', es: 'Aplica etiquetas con precisión y en tiempo real sobre materiales redondos como cables, mangueras o tubos. El pad aplicador recoge la etiqueta mientras se imprime y, a continuación, un cilindro controlado por leva la guía alrededor del material: los dos extremos de la etiqueta se pegan entre sí y la etiqueta se aplica en forma de bandera.', de: 'Bringt Etiketten in Echtzeit präzise auf runde Materialien wie Kabel, Schläuche oder Rohre auf. Der Stempel übernimmt das Etikett während des Drucks, dann führt es ein kurvengesteuerter Zylinder um das Material: Beide Etikettenenden kleben zusammen, und das Etikett wird als Fahne angedrückt.', ko: '케이블, 호스, 파이프 등 원형 소재에 실시간으로 라벨을 정밀하게 부착합니다. 패드가 인쇄되는 라벨을 픽업한 후 캠 제어 실린더가 라벨을 소재 둘레로 감싸도록 안내합니다. 라벨의 양 끝이 서로 접착되어 라벨이 플래그 형태로 부착됩니다.', zh: '可将标签实时精确贴附于线缆、软管或管材等圆形材料上。吸盘在标签打印的同时将其吸取，随后由凸轮控制的气缸引导标签环绕材料：标签两端相互粘合，以旗形方式贴附。',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width', it: 'Larghezza etichetta', es: 'Ancho de etiqueta', de: 'Etikettenbreite', ko: '라벨 폭', zh: '标签宽度' }, value: { hu: '50–100 mm', en: '50–100 mm', it: '50–100 mm', es: '50–100 mm', de: '50–100 mm', ko: '50–100 mm', zh: '50–100 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height', it: 'Altezza etichetta', es: 'Altura de etiqueta', de: 'Etikettenhöhe', ko: '라벨 높이', zh: '标签高度' }, value: { hu: '10–50 mm', en: '10–50 mm', it: '10–50 mm', es: '10–50 mm', de: '10–50 mm', ko: '10–50 mm', zh: '10–50 mm' } },
          { label: { hu: 'Átmérő (kábel/cső)', en: 'Diameter (cable/pipe)', it: 'Diametro (cavo/tubo)', es: 'Diámetro (cable/tubo)', de: 'Durchmesser (Kabel/Rohr)', ko: '직경(케이블/파이프)', zh: '直径（线缆/管材）' }, value: { hu: '3–16 mm', en: '3–16 mm', it: '3–16 mm', es: '3–16 mm', de: '3–16 mm', ko: '3–16 mm', zh: '3–16 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state', it: 'Stato del prodotto', es: 'Estado del producto', de: 'Produktzustand', ko: '제품 상태', zh: '产品状态' }, value: { hu: 'álló', en: 'at rest', it: 'fermo', es: 'parado', de: 'im Stillstand', ko: '정지 상태', zh: '静止' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction', it: 'Direzione di applicazione', es: 'Dirección de aplicación', de: 'Etikettierrichtung', ko: '부착 방향', zh: '贴标方向' }, value: { hu: 'felülről, alulról, oldalról; függőlegesen 0–180° forgatva', en: 'from top, below, side; rotated vertically 0–180°', it: 'dall’alto, dal basso, laterale; ruotato verticalmente 0–180°', es: 'desde arriba, desde abajo, lateral; girado en vertical 0–180°', de: 'von oben, unten, seitlich; vertikal um 0–180° gedreht', ko: '상단, 하단, 측면에서; 수직 방향 0–180° 회전', zh: '从顶部、底部、侧面；可垂直旋转 0–180°' } },
          { label: { hu: 'Termék távolsága az egység aljától', en: 'Distance to bottom of unit', it: 'Distanza dal fondo dell’unità', es: 'Distancia al borde inferior de la unidad', de: 'Abstand zur Geräteunterkante', ko: '유닛 하단까지의 거리', zh: '距设备底部距离' }, value: { hu: 'min. 70 mm, max. 260 mm', en: 'min. 70 mm, max. 260 mm', it: 'min. 70 mm, max. 260 mm', es: 'mín. 70 mm, máx. 260 mm', de: 'min. 70 mm, max. 260 mm', ko: '최소 70 mm, 최대 260 mm', zh: '最小 70 mm，最大 260 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate', it: 'Cadenza di ciclo', es: 'Cadencia de ciclo', de: 'Taktrate', ko: '사이클 속도', zh: '贴标节拍' }, value: { hu: '~15 címke/perc', en: '~15 labels/min', it: '~15 etichette/min', es: '~15 etiquetas/min', de: 'ca. 15 Etiketten/min', ko: '약 15매/분', zh: '约 15 张/分钟' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air', it: 'Aria compressa', es: 'Aire comprimido', de: 'Druckluft', ko: '압축 공기', zh: '压缩空气' }, value: { hu: '4,5 bar', en: '4.5 bar', it: '4,5 bar', es: '4,5 bar', de: '4,5 bar', ko: '4.5 bar', zh: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption', it: 'Assorbimento', es: 'Consumo eléctrico', de: 'Leistungsaufnahme', ko: '소비 전력', zh: '功耗' }, value: { hu: 'max. 15 W', en: 'max. 15 W', it: 'max. 15 W', es: 'máx. 15 W', de: 'max. 15 W', ko: '최대 15 W', zh: '最大 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '8 kg', en: '8 kg', it: '8 kg', es: '8 kg', de: '8 kg', ko: '8 kg', zh: '8 kg' } },
        ],
        videoId: 'SV0G6Z2yb-4',
      },
      {
        slug: 'hq-6114',
        image: '/images/applicators/hq-6114.webp',
        name: { hu: 'HQ 6114 Ráfújó címkéző', en: 'HQ 6114 Blow-on applicator', it: 'Applicatore blow-on HQ 6114', es: 'Aplicador de soplado HQ 6114', de: 'HQ 6114 Blasapplikator', ko: 'HQ 6114 블로우온 어플리케이터', zh: 'HQ 6114 吹贴式贴标模块' },
        description: {
          hu: 'Törékeny vagy egyenetlen felületek címkézése, nagy sebességgel.',
          en: 'Labeling fragile or uneven surfaces at high speed.', it: 'Etichettatura di superfici fragili o irregolari ad alta velocità.', es: 'Etiquetado de superficies frágiles o irregulares a alta velocidad.', de: 'Etikettierung empfindlicher oder unebener Oberflächen mit hoher Geschwindigkeit.', ko: '깨지기 쉽거나 고르지 않은 표면의 고속 라벨링.', zh: '高速贴标易碎或不平整的表面。',
        },
        longDescription: {
          hu: 'Címkék felhelyezése álló vagy mozgásban lévő csomagokra érintés nélkül. A címkét ventilátor tartja meg, majd egymáshoz igazított fúvókákon át erős légsugár fújja a felületre. A címke méretétől függően akár 200 mm távolság is áthidalható.',
          en: 'Applies labels contactlessly onto packages in motion or at rest. Each label is held by a fan and blown off through aligned nozzles by a powerful blast of air. Depending on the label size, a distance of up to 200 mm can be bridged.', it: 'Applica le etichette senza contatto su confezioni in movimento o ferme. Ogni etichetta è trattenuta da una ventola e soffiata via attraverso ugelli allineati da un potente getto d’aria. A seconda del formato dell’etichetta è possibile coprire una distanza fino a 200 mm.', es: 'Aplica etiquetas sin contacto sobre paquetes en movimiento o parados. Cada etiqueta es retenida por un ventilador y expulsada por un potente chorro de aire a través de boquillas alineadas. Según el tamaño de la etiqueta puede salvarse una distancia de hasta 200 mm.', de: 'Bringt Etiketten berührungslos auf bewegte oder ruhende Verpackungen auf. Jedes Etikett wird von einem Lüfter gehalten und durch einen kräftigen Luftstoß über ausgerichtete Düsen abgeblasen. Je nach Etikettengröße lässt sich ein Abstand von bis zu 200 mm überbrücken.', ko: '이동 중이거나 정지 상태인 패키지에 비접촉 방식으로 라벨을 부착합니다. 각 라벨은 팬으로 고정되며 정렬된 노즐을 통한 강력한 공기 분사로 부착됩니다. 라벨 크기에 따라 최대 200 mm의 거리까지 커버할 수 있습니다.', zh: '以非接触方式向运动或静止的包装贴标。每张标签由风扇吸持，再通过对准的喷嘴以强力气流吹出。根据标签尺寸，可跨越最大 200 mm 的距离。',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width', it: 'Larghezza etichetta', es: 'Ancho de etiqueta', de: 'Etikettenbreite', ko: '라벨 폭', zh: '标签宽度' }, value: { hu: '50–114 mm', en: '50–114 mm', it: '50–114 mm', es: '50–114 mm', de: '50–114 mm', ko: '50–114 mm', zh: '50–114 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height', it: 'Altezza etichetta', es: 'Altura de etiqueta', de: 'Etikettenhöhe', ko: '라벨 높이', zh: '标签高度' }, value: { hu: '50–125 mm', en: '50–125 mm', it: '50–125 mm', es: '50–125 mm', de: '50–125 mm', ko: '50–125 mm', zh: '50–125 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state', it: 'Stato del prodotto', es: 'Estado del producto', de: 'Produktzustand', ko: '제품 상태', zh: '产品状态' }, value: { hu: 'álló vagy mozgásban', en: 'at rest or in motion', it: 'fermo o in movimento', es: 'parado o en movimiento', de: 'im Stillstand oder in Bewegung', ko: '정지 또는 이동 중', zh: '静止或运动' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction', it: 'Direzione di applicazione', es: 'Dirección de aplicación', de: 'Etikettierrichtung', ko: '부착 방향', zh: '贴标方向' }, value: { hu: 'felülről, alulról, oldalról', en: 'from top, below, side', it: 'dall’alto, dal basso, laterale', es: 'desde arriba, desde abajo, lateral', de: 'von oben, unten, seitlich', ko: '상단, 하단, 측면에서', zh: '从顶部、底部、侧面' } },
          { label: { hu: 'Csomagmagasság', en: 'Package height', it: 'Altezza confezione', es: 'Altura del paquete', de: 'Pakethöhe', ko: '패키지 높이', zh: '包装高度' }, value: { hu: 'változó', en: 'variable', it: 'variabile', es: 'variable', de: 'variabel', ko: '가변', zh: '可变' } },
          { label: { hu: 'Csomag távolsága a lehúzóéltől', en: 'Distance to peel-off plate', it: 'Distanza dalla piastra di spellicolatura', es: 'Distancia a la placa de despegado', de: 'Abstand zur Spendekante', ko: '필오프 플레이트까지의 거리', zh: '距剥离板距离' }, value: { hu: 'max. 200 mm', en: 'up to 200 mm', it: 'fino a 200 mm', es: 'hasta 200 mm', de: 'bis 200 mm', ko: '최대 200 mm', zh: '最大 200 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate', it: 'Cadenza di ciclo', es: 'Cadencia de ciclo', de: 'Taktrate', ko: '사이클 속도', zh: '贴标节拍' }, value: { hu: 'max. 100 címke/perc', en: 'up to 100 labels/min', it: 'fino a 100 etichette/min', es: 'hasta 100 etiquetas/min', de: 'bis 100 Etiketten/min', ko: '최대 100매/분', zh: '最高 100 张/分钟' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air', it: 'Aria compressa', es: 'Aire comprimido', de: 'Druckluft', ko: '압축 공기', zh: '压缩空气' }, value: { hu: '4,5 bar', en: '4.5 bar', it: '4,5 bar', es: '4,5 bar', de: '4,5 bar', ko: '4.5 bar', zh: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption', it: 'Assorbimento', es: 'Consumo eléctrico', de: 'Leistungsaufnahme', ko: '소비 전력', zh: '功耗' }, value: { hu: 'max. 90 W', en: 'max. 90 W', it: 'max. 90 W', es: 'máx. 90 W', de: 'max. 90 W', ko: '최대 90 W', zh: '最大 90 W' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '4 kg', en: '4 kg', it: '4 kg', es: '4 kg', de: '4 kg', ko: '4 kg', zh: '4 kg' } },
        ],
      },
      {
        slug: 'hq-5314',
        image: '/images/applicators/hq-5314.webp',
        name: { hu: 'HQ 5314 / 5316 Vákuumszalagos applikátor', en: 'HQ 5314 / 5316 Vacuum-belt applicator', it: 'Applicatore a nastro aspirante HQ 5314 / 5316', es: 'Aplicador de cinta de vacío HQ 5314 / 5316', de: 'HQ 5314 / 5316 Vakuumband-Applikator', ko: 'HQ 5314 / 5316 진공 벨트 어플리케이터', zh: 'HQ 5314 / 5316 真空带式贴标模块' },
        description: {
          hu: 'Címkézés nagy sebességgel, mozgásban lévő termékeknél. Két változat: 4" és 6" szélességhez.',
          en: 'High-speed labeling of products in motion. Two versions: for 4" and 6" width.', it: 'Etichettatura ad alta velocità di prodotti in movimento. Due versioni: per larghezza 4" e 6".', es: 'Etiquetado a alta velocidad de productos en movimiento. Dos versiones: para anchura de 4" y 6".', de: 'Hochgeschwindigkeits-Etikettierung bewegter Produkte. Zwei Ausführungen: für 4" und 6" Breite.', ko: '이동 중인 제품의 고속 라벨링. 4"와 6" 폭용 두 가지 버전.', zh: '对运动中的产品进行高速贴标。两种版本：适用于 4" 和 6" 宽度。',
        },
        longDescription: {
          hu: 'Címkék valós idejű felhelyezése minden oldalról, sík felületekre, mozgásban lévő csomagokra. A nyomtatott címkét vákuumszalag viszi a felhelyezési pontra, a felhelyezést külső jel indítja. A két típus abban tér el, hogy melyik nyomtatószélességhez való: az 5314 a 4"-os (HERMES Q4 / Q4.3), az 5316 a 6"-os (HERMES Q6.3) gépekhez — ebből adódik a fogadott címkeszélesség és a tömeg is. Minden más adatuk azonos. A címkemagasság határa a szalag hosszától függ (256, 356 vagy 456 mm).',
          en: 'Applies labels in real time from all sides onto plane surfaces of packages in motion. A vacuum belt conveys the printed label to the point of transfer, and application is triggered by an external signal. The two versions differ in the print width they belong to: the 5314 fits the 4" machines (HERMES Q4 / Q4.3), the 5316 the 6" ones (HERMES Q6.3) — hence the different label width and weight. All their other data are identical. The label height limit depends on the belt length (256, 356 or 456 mm).', it: 'Applica le etichette in tempo reale da tutti i lati su superfici piane di confezioni in movimento. Un nastro aspirante trasporta l’etichetta stampata fino al punto di trasferimento e l’applicazione è attivata da un segnale esterno. Le due versioni differiscono per la larghezza di stampa a cui sono destinate: il 5314 per le macchine da 4" (HERMES Q4 / Q4.3), il 5316 per quelle da 6" (HERMES Q6.3) — da qui la diversa larghezza etichetta e il diverso peso. Tutti gli altri dati sono identici. Il limite di altezza dell’etichetta dipende dalla lunghezza del nastro (256, 356 o 456 mm).', es: 'Aplica etiquetas en tiempo real desde todos los lados sobre superficies planas de paquetes en movimiento. Una cinta de vacío transporta la etiqueta impresa hasta el punto de transferencia y la aplicación se activa mediante una señal externa. Las dos versiones se diferencian por la anchura de impresión a la que corresponden: el 5314 para las máquinas de 4" (HERMES Q4 / Q4.3) y el 5316 para las de 6" (HERMES Q6.3), de ahí la distinta anchura de etiqueta y el distinto peso. Todos sus demás datos son idénticos. El límite de altura de etiqueta depende de la longitud de la cinta (256, 356 o 456 mm).', de: 'Bringt Etiketten in Echtzeit von allen Seiten auf ebene Oberflächen bewegter Verpackungen auf. Ein Vakuumband befördert das gedruckte Etikett zum Übergabepunkt; die Etikettierung wird durch ein externes Signal ausgelöst. Die beiden Ausführungen unterscheiden sich in der Druckbreite, zu der sie gehören: der 5314 passt zu den 4"-Geräten (HERMES Q4 / Q4.3), der 5316 zu den 6"-Geräten (HERMES Q6.3) — daraus ergeben sich die unterschiedliche Etikettenbreite und das unterschiedliche Gewicht. Alle übrigen Daten sind identisch. Die Grenze der Etikettenhöhe hängt von der Bandlänge ab (256, 356 oder 456 mm).', ko: '이동 중인 패키지의 평면에 모든 면에서 실시간으로 라벨을 부착합니다. 진공 벨트가 인쇄된 라벨을 전달 지점까지 이송하며, 부착은 외부 신호로 트리거됩니다. 두 버전은 해당하는 인쇄 폭에서 차이가 납니다. 5314는 4" 장비(HERMES Q4 / Q4.3)용, 5316은 6" 장비(HERMES Q6.3)용이며, 이에 따라 라벨 폭과 중량이 달라집니다. 그 외의 모든 데이터는 동일합니다. 라벨 높이 한계는 벨트 길이에 따라 정해집니다(256, 356 또는 456 mm).', zh: '可从各个方向向运动中包装的平面实时贴标。真空传送带将打印好的标签输送至转贴点，贴标由外部信号触发。两种版本的区别在于所对应的打印宽度：5314 适用于 4" 机型（HERMES Q4 / Q4.3），5316 适用于 6" 机型（HERMES Q6.3）——由此产生标签宽度和重量的差异。其余各项数据完全相同。标签高度上限取决于传送带长度（256、356 或 456 mm）。',
        },
        params: [
          { label: { hu: 'Címkeszélesség — 5314 (4")', en: 'Label width — 5314 (4")', it: 'Larghezza etichetta — 5314 (4")', es: 'Ancho de etiqueta — 5314 (4")', de: 'Etikettenbreite — 5314 (4")', ko: '라벨 폭 — 5314(4")', zh: '标签宽度 — 5314（4"）' }, value: { hu: '20–114 mm', en: '20–114 mm', it: '20–114 mm', es: '20–114 mm', de: '20–114 mm', ko: '20–114 mm', zh: '20–114 mm' } },
          { label: { hu: 'Címkeszélesség — 5316 (6")', en: 'Label width — 5316 (6")', it: 'Larghezza etichetta — 5316 (6")', es: 'Ancho de etiqueta — 5316 (6")', de: 'Etikettenbreite — 5316 (6")', ko: '라벨 폭 — 5316(6")', zh: '标签宽度 — 5316（6"）' }, value: { hu: '46–174 mm', en: '46–174 mm', it: '46–174 mm', es: '46–174 mm', de: '46–174 mm', ko: '46–174 mm', zh: '46–174 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height', it: 'Altezza etichetta', es: 'Altura de etiqueta', de: 'Etikettenhöhe', ko: '라벨 높이', zh: '标签高度' }, value: { hu: '60–256 / 60–356 / 60–456 mm (szalaghossz szerint)', en: '60–256 / 60–356 / 60–456 mm (by belt length)', it: '60–256 / 60–356 / 60–456 mm (secondo la lunghezza del nastro)', es: '60–256 / 60–356 / 60–456 mm (según la longitud de la cinta)', de: '60–256 / 60–356 / 60–456 mm (je Bandlänge)', ko: '60–256 / 60–356 / 60–456 mm(벨트 길이에 따라)', zh: '60–256 / 60–356 / 60–456 mm（取决于传送带长度）' } },
          { label: { hu: 'Termék állapota', en: 'Product state', it: 'Stato del prodotto', es: 'Estado del producto', de: 'Produktzustand', ko: '제품 상태', zh: '产品状态' }, value: { hu: 'mozgásban', en: 'in motion', it: 'in movimento', es: 'en movimiento', de: 'in Bewegung', ko: '이동 중', zh: '运动' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction', it: 'Direzione di applicazione', es: 'Dirección de aplicación', de: 'Etikettierrichtung', ko: '부착 방향', zh: '贴标方向' }, value: { hu: 'felülről, alulról, oldalról (sík felületre)', en: 'from top, below, side (plane surfaces)', it: 'dall’alto, dal basso, laterale (superfici piane)', es: 'desde arriba, desde abajo, lateral (superficies planas)', de: 'von oben, unten, seitlich (ebene Flächen)', ko: '상단, 하단, 측면에서(평면)', zh: '从顶部、底部、侧面（平面）' } },
          { label: { hu: 'Csomagmagasság', en: 'Package height', it: 'Altezza confezione', es: 'Altura del paquete', de: 'Pakethöhe', ko: '패키지 높이', zh: '包装高度' }, value: { hu: 'egyenletes', en: 'uniform', it: 'uniforme', es: 'uniforme', de: 'einheitlich', ko: '균일', zh: '一致' } },
          { label: { hu: 'Csomagsebesség', en: 'Package speed', it: 'Velocità della confezione', es: 'Velocidad del paquete', de: 'Paketgeschwindigkeit', ko: '패키지 속도', zh: '包装速度' }, value: { hu: 'max. 0,5 m/s (legalább a szalag sebességével egyező)', en: 'up to 0.5 m/s (at least the belt speed)', it: 'fino a 0,5 m/s (almeno pari alla velocità del nastro)', es: 'hasta 0,5 m/s (al menos la velocidad de la cinta)', de: 'bis 0,5 m/s (mindestens Bandgeschwindigkeit)', ko: '최대 0.5 m/s(벨트 속도 이상)', zh: '最高 0.5 m/s（不低于传送带速度）' } },
          { label: { hu: 'Csomagok közti rés', en: 'Gap between packages', it: 'Distanza tra le confezioni', es: 'Separación entre paquetes', de: 'Abstand zwischen Paketen', ko: '패키지 간 간격', zh: '包装间距' }, value: { hu: 'min. 0,5 m', en: 'at least 0.5 m', it: 'almeno 0,5 m', es: 'al menos 0,5 m', de: 'mind. 0,5 m', ko: '최소 0.5 m', zh: '至少 0.5 m' } },
          { label: { hu: 'Vákuumszalag sebessége', en: 'Vacuum-belt speed', it: 'Velocità del nastro aspirante', es: 'Velocidad de la cinta de vacío', de: 'Vakuumbandgeschwindigkeit', ko: '진공 벨트 속도', zh: '真空带速度' }, value: { hu: '100–500 mm/s', en: '100–500 mm/s', it: '100–500 mm/s', es: '100–500 mm/s', de: '100–500 mm/s', ko: '100–500 mm/s', zh: '100–500 mm/s' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate', it: 'Cadenza di ciclo', es: 'Cadencia de ciclo', de: 'Taktrate', ko: '사이클 속도', zh: '贴标节拍' }, value: { hu: 'max. 30 címke/perc', en: 'up to 30 labels/min', it: 'fino a 30 etichette/min', es: 'hasta 30 etiquetas/min', de: 'bis 30 Etiketten/min', ko: '최대 30매/분', zh: '最高 30 张/分钟' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption', it: 'Assorbimento', es: 'Consumo eléctrico', de: 'Leistungsaufnahme', ko: '소비 전력', zh: '功耗' }, value: { hu: 'max. 90 W', en: 'max. 90 W', it: 'max. 90 W', es: 'máx. 90 W', de: 'max. 90 W', ko: '최대 90 W', zh: '最大 90 W' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '5314: 7 kg / 5316: 8 kg', en: '5314: 7 kg / 5316: 8 kg', it: '5314: 7 kg / 5316: 8 kg', es: '5314: 7 kg / 5316: 8 kg', de: '5314: 7 kg / 5316: 8 kg', ko: '5314: 7 kg / 5316: 8 kg', zh: '5314：7 kg / 5316：8 kg' } },
        ],
      },
      {
        slug: 'hq-4514',
        image: '/images/applicators/hq-4514.webp',
        name: { hu: 'HQ 4514 Swing Stroke applikátor', en: 'HQ 4514 Swing stroke applicator', it: 'Applicatore a rotazione e corsa HQ 4514', es: 'Aplicador de carrera oscilante HQ 4514', de: 'HQ 4514 Schwenk-Hub-Applikator', ko: 'HQ 4514 스윙 스트로크 어플리케이터', zh: 'HQ 4514 摆动行程式贴标模块' },
        description: {
          hu: 'Belső címkézés.',
          en: 'Inside labeling.', it: 'Etichettatura interna.', es: 'Etiquetado interior.', de: 'Innenetikettierung.', ko: '내부 라벨링.', zh: '内表面贴标。',
        },
        longDescription: {
          hu: 'Címkék valós idejű felhelyezése minden oldalról, profilok és csövek belső felületeire. A párnát forgóhenger a felhelyezési síkba fordítja, a lökethenger pontosan a helyére viszi a címkét. A fújópárna 5–10 mm távolságból, légsugárral helyezi fel a címkét.',
          en: 'Applies labels in real time from all sides onto inner surfaces of profiles and pipes. A rotary cylinder pivots the pad to the application level and a stroke cylinder places the label exactly on spot. The blow-on pad applies the label from 5–10 mm away by a blast of air.', it: 'Applica le etichette in tempo reale da tutti i lati su superfici interne di profilati e tubi. Un cilindro rotante porta il tampone applicatore sul piano di applicazione e un cilindro di corsa depone l’etichetta esattamente nel punto desiderato. Il tampone a soffio applica l’etichetta da una distanza di 5–10 mm mediante un getto d’aria.', es: 'Aplica etiquetas en tiempo real desde todos los lados sobre superficies interiores de perfiles y tubos. Un cilindro rotativo gira el pad aplicador hasta el plano de aplicación y un cilindro de carrera coloca la etiqueta exactamente en el punto previsto. El pad de soplado aplica la etiqueta desde una distancia de 5–10 mm mediante un chorro de aire.', de: 'Bringt Etiketten in Echtzeit von allen Seiten auf Innenflächen von Profilen und Rohren auf. Ein Drehzylinder schwenkt den Stempel auf die Etikettierebene, ein Hubzylinder setzt das Etikett exakt an die richtige Stelle. Der Blasstempel bringt das Etikett aus 5–10 mm Entfernung per Luftstoß auf.', ko: '프로파일과 파이프의 내부 표면에 모든 면에서 실시간으로 라벨을 부착합니다. 로터리 실린더가 패드를 부착 높이까지 회전시키고 스트로크 실린더가 라벨을 정확한 지점에 부착합니다. 블로우온 패드는 5–10 mm 거리에서 공기 분사로 라벨을 부착합니다.', zh: '可从各个方向向型材与管材的内表面实时贴标。回转气缸将吸盘摆动至贴标平面，行程气缸将标签精确贴至指定位置。吹贴吸盘可在 5–10 mm 距离外以气流将标签吹贴到位。',
        },
        params: [
          { label: { hu: 'Címkeszélesség', en: 'Label width', it: 'Larghezza etichetta', es: 'Ancho de etiqueta', de: 'Etikettenbreite', ko: '라벨 폭', zh: '标签宽度' }, value: { hu: '10–80 mm', en: '10–80 mm', it: '10–80 mm', es: '10–80 mm', de: '10–80 mm', ko: '10–80 mm', zh: '10–80 mm' } },
          { label: { hu: 'Címkemagasság', en: 'Label height', it: 'Altezza etichetta', es: 'Altura de etiqueta', de: 'Etikettenhöhe', ko: '라벨 높이', zh: '标签高度' }, value: { hu: '10–60 mm', en: '10–60 mm', it: '10–60 mm', es: '10–60 mm', de: '10–60 mm', ko: '10–60 mm', zh: '10–60 mm' } },
          { label: { hu: 'Termék állapota', en: 'Product state', it: 'Stato del prodotto', es: 'Estado del producto', de: 'Produktzustand', ko: '제품 상태', zh: '产品状态' }, value: { hu: 'álló', en: 'at rest', it: 'fermo', es: 'parado', de: 'im Stillstand', ko: '정지 상태', zh: '静止' } },
          { label: { hu: 'Felhelyezés iránya', en: 'Application direction', it: 'Direzione di applicazione', es: 'Dirección de aplicación', de: 'Etikettierrichtung', ko: '부착 방향', zh: '贴标方向' }, value: { hu: 'felülről, alulról, oldalról (belső felületre is)', en: 'from top, below, side (inner surfaces too)', it: 'dall’alto, dal basso, laterale (anche superfici interne)', es: 'desde arriba, desde abajo, lateral (también superficies interiores)', de: 'von oben, unten, seitlich (auch Innenflächen)', ko: '상단, 하단, 측면에서(내부 표면 포함)', zh: '从顶部、底部、侧面（含内表面）' } },
          { label: { hu: 'Termékmagasság', en: 'Product height', it: 'Altezza prodotto', es: 'Altura del producto', de: 'Produkthöhe', ko: '제품 높이', zh: '产品高度' }, value: { hu: 'egyenletes', en: 'uniform', it: 'uniforme', es: 'uniforme', de: 'einheitlich', ko: '균일', zh: '一致' } },
          { label: { hu: 'Függőleges elfordulás', en: 'Vertical pivot', it: 'Rotazione verticale', es: 'Giro vertical', de: 'Vertikaler Schwenk', ko: '수직 피벗', zh: '垂直摆动' }, value: { hu: '120°', en: '120°', it: '120°', es: '120°', de: '120°', ko: '120°', zh: '120°' } },
          { label: { hu: 'Távolság a címke felső széléig', en: 'Distance to upper label edge', it: 'Distanza dal bordo superiore dell’etichetta', es: 'Distancia al borde superior de la etiqueta', de: 'Abstand zur oberen Etikettenkante', ko: '라벨 상단 가장자리까지의 거리', zh: '距标签上缘距离' }, value: { hu: 'max. 150–350 mm', en: 'up to 150–350 mm', it: 'fino a 150–350 mm', es: 'hasta 150–350 mm', de: 'bis 150–350 mm', ko: '최대 150–350 mm', zh: '最大 150–350 mm' } },
          { label: { hu: 'Ciklusidő', en: 'Cycle rate', it: 'Cadenza di ciclo', es: 'Cadencia de ciclo', de: 'Taktrate', ko: '사이클 속도', zh: '贴标节拍' }, value: { hu: '~20 címke/perc', en: '~20 labels/min', it: '~20 etichette/min', es: '~20 etiquetas/min', de: 'ca. 20 Etiketten/min', ko: '약 20매/분', zh: '约 20 张/分钟' } },
          { label: { hu: 'Sűrített levegő', en: 'Compressed air', it: 'Aria compressa', es: 'Aire comprimido', de: 'Druckluft', ko: '압축 공기', zh: '压缩空气' }, value: { hu: '4,5 bar', en: '4.5 bar', it: '4,5 bar', es: '4,5 bar', de: '4,5 bar', ko: '4.5 bar', zh: '4.5 bar' } },
          { label: { hu: 'Teljesítményfelvétel', en: 'Power consumption', it: 'Assorbimento', es: 'Consumo eléctrico', de: 'Leistungsaufnahme', ko: '소비 전력', zh: '功耗' }, value: { hu: 'max. 15 W', en: 'max. 15 W', it: 'max. 15 W', es: 'máx. 15 W', de: 'max. 15 W', ko: '최대 15 W', zh: '最大 15 W' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '6–7 kg', en: '6–7 kg', it: '6–7 kg', es: '6–7 kg', de: '6–7 kg', ko: '6–7 kg', zh: '6–7 kg' } },
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
      en: 'The smallest servo-driven labeling head in its class for automated lines.', it: 'La più piccola testa di etichettatura servocomandata della sua classe per linee automatizzate.', es: 'El cabezal etiquetador servoaccionado más pequeño de su clase para líneas automatizadas.', de: 'Der kleinste servogetriebene Etikettierkopf seiner Klasse für automatisierte Linien.', ko: '자동화 라인을 위한 동급 최소형 서보 구동 라벨링 헤드.', zh: '同级别中最小的伺服驱动贴标头，适用于自动化产线。',
    },
    description: {
      hu: 'Az IXOR a teljesítménykategória legkisebb szervo-hajtású címkéző feje. Moduláris építőelemekkel teljesen automata címkéző gépekbe, kiegészítő állványokkal pedig gyártósori szalaghoz integrálható; az előnyomtatott címkéket gyorsan és pontosan helyezi fel termékekre vagy csomagolásra. Öntött alumínium alapegység, nagy nyomatékú AC szervomotor, IP66 / NEMA 250 12-es védettség. Szalagsebesség modelltől függően akár 25 / 50 / 100 / 200 m/perc, tekercsátmérő max. 310–410 mm, anyagszélesség akár 306 mm.',
      en: 'The IXOR is the smallest servo-driven labeling head in its performance class. A modular construction kit integrates it into fully automatic labeling machines, and accessory stands mount it to a production-line conveyor; pre-printed labels are applied to products or packaging fast and precisely. A cast-aluminium base unit, a high-torque AC servo motor and IP66 / NEMA 250 type 12 protection. Web speed up to 25 / 50 / 100 / 200 m/min depending on model, roll diameter up to 310–410 mm, material width up to 306 mm.', it: 'La IXOR è la più piccola testa di etichettatura servocomandata della sua classe di prestazioni. Un kit di costruzione modulare la integra in etichettatrici completamente automatiche e i supporti accessori la fissano al nastro trasportatore della linea di produzione; le etichette prestampate vengono applicate su prodotti o imballaggi in modo rapido e preciso. Unità base in alluminio pressofuso, servomotore AC ad alta coppia e protezione IP66 / NEMA 250 type 12. Velocità del nastro fino a 25 / 50 / 100 / 200 m/min a seconda del modello, diametro rotolo fino a 310–410 mm, larghezza materiale fino a 306 mm.', es: 'El IXOR es el cabezal etiquetador servoaccionado más pequeño de su clase de rendimiento. Un kit de construcción modular lo integra en etiquetadoras totalmente automáticas y los soportes accesorios lo montan sobre la cinta transportadora de una línea de producción; las etiquetas preimpresas se aplican sobre productos o envases de forma rápida y precisa. Base de aluminio fundido, un servomotor de CA de alto par y protección IP66 / NEMA 250 tipo 12. Velocidad de banda de hasta 25 / 50 / 100 / 200 m/min según el modelo, diámetro de rollo de hasta 310–410 mm y ancho de material de hasta 306 mm.', de: 'Der IXOR ist der kleinste servogetriebene Etikettierkopf seiner Leistungsklasse. Ein modularer Baukasten integriert ihn in vollautomatische Etikettiermaschinen, Zubehörstative montieren ihn an ein Förderband der Produktionslinie; vorgedruckte Etiketten werden schnell und präzise auf Produkte oder Verpackungen aufgebracht. Grundeinheit aus Aluminiumguss, drehmomentstarker AC-Servomotor und Schutzart IP66 / NEMA 250 Typ 12. Bahngeschwindigkeit je nach Modell bis 25 / 50 / 100 / 200 m/min, Rollendurchmesser bis 310–410 mm, Materialbreite bis 306 mm.', ko: 'IXOR는 동급 성능 클래스에서 가장 작은 서보 구동 라벨링 헤드입니다. 모듈식 구성 키트로 전자동 라벨링 머신에 통합할 수 있으며, 액세서리 스탠드로 생산 라인 컨베이어에 장착합니다. 사전 인쇄된 라벨을 제품이나 포장에 빠르고 정밀하게 부착합니다. 주조 알루미늄 베이스 유닛, 고토크 AC 서보 모터, IP66 / NEMA 250 type 12 보호 등급을 갖추었습니다. 모델에 따라 웹 속도 최대 25 / 50 / 100 / 200 m/min, 롤 직경 최대 310–410 mm, 소재 폭 최대 306 mm를 지원합니다.', zh: 'IXOR 是同性能级别中最小的伺服驱动贴标头。模块化组件系统可将其集成到全自动贴标机中，配件支架可将其安装到生产线输送机上；预印标签可快速、精确地贴附到产品或包装上。铸铝基座单元、高扭矩 AC 伺服电机以及 IP66 / NEMA 250 type 12 防护等级。走带速度视型号最高 25 / 50 / 100 / 200 m/min，卷径最大 310–410 mm，材料宽度最大 306 mm。',
    },
    features: [
      { hu: 'Legkisebb szervo-hajtású címkéző fej a kategóriában', en: 'Smallest servo-driven labeling head in its class', it: 'La più piccola testa di etichettatura servocomandata della sua classe', es: 'El cabezal etiquetador servoaccionado más pequeño de su clase', de: 'Kleinster servogetriebener Etikettierkopf seiner Klasse', ko: '동급 최소형 서보 구동 라벨링 헤드', zh: '同级别中最小的伺服驱动贴标头' },
      { hu: 'Szalagsebesség akár 25–200 m/perc (modelltől függően)', en: 'Web speed up to 25–200 m/min (model-dependent)', it: 'Velocità del nastro fino a 25–200 m/min (in base al modello)', es: 'Velocidad de banda de hasta 25–200 m/min (según modelo)', de: 'Bahngeschwindigkeit bis 25–200 m/min (modellabhängig)', ko: '웹 속도 최대 25–200 m/min(모델별 상이)', zh: '走带速度最高 25–200 m/min（视型号而定）' },
      { hu: 'Öntött alumínium alapegység, IP66 / NEMA 12', en: 'Cast-aluminium base unit, IP66 / NEMA 12', it: 'Unità base in alluminio pressofuso, IP66 / NEMA 12', es: 'Base de aluminio fundido, IP66 / NEMA 12', de: 'Grundeinheit aus Aluminiumguss, IP66 / NEMA 12', ko: '주조 알루미늄 베이스 유닛, IP66 / NEMA 12', zh: '铸铝基座单元，IP66 / NEMA 12' },
      { hu: 'Anyagszélesség akár 306 mm, tekercs max. 410 mm', en: 'Material width up to 306 mm, roll up to 410 mm', it: 'Larghezza materiale fino a 306 mm, rotolo fino a 410 mm', es: 'Ancho de material hasta 306 mm, rollo hasta 410 mm', de: 'Materialbreite bis 306 mm, Rolle bis 410 mm', ko: '소재 폭 최대 306 mm, 롤 최대 410 mm', zh: '材料宽度最大 306 mm，卷径最大 410 mm' },
      { hu: 'Moduláris gép- és szalagintegráció', en: 'Modular machine / conveyor integration', it: 'Integrazione modulare in macchina / su nastro trasportatore', es: 'Integración modular en máquina / cinta transportadora', de: 'Modulare Maschinen-/Förderbandintegration', ko: '모듈식 머신 / 컨베이어 통합', zh: '模块化设备 / 输送机集成' },
    ],
    image: '/images/products/cab-ixor.webp',
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
      en: 'Labeling head for precision insert-labeling — films, membranes, seals.', it: 'Testa di etichettatura per l’etichettatura di precisione di inserti — pellicole, membrane, guarnizioni.', es: 'Cabezal etiquetador para el etiquetado de inserción de precisión — láminas, membranas, juntas.', de: 'Etikettierkopf für präzises Einlege-Etikettieren — Folien, Membranen, Dichtungen.', ko: '정밀 인서트 라벨링용 라벨링 헤드 — 필름, 멤브레인, 씰.', zh: '用于精密嵌入式贴标的贴标头——薄膜、隔膜、密封件。',
    },
    description: {
      hu: 'A ROXI robusztus felépítésű, korszerű elektronikájú és kezelésű címkéző fej precíz behelyező-címkézéshez — kedvező áron, nagy teljesítménnyel. A címkeszalag akár 30 m/perc sebességgel futhat, a tekercsátmérő max. 310 mm, az anyagszélesség max. 180 mm; függőleges és vízszintes beépítés is lehetséges. HERMES HQ applikátorokkal álló termékek címkézésére, valamint magas pontosságú ipari alkalmazásokra is bevethető. Az IXOR+ fejjel közös szoftver- és firmware-alap.',
      en: 'The ROXI is a solidly built labeling head with modern electronics and usability for precise insert-labeling — small in price, great in performance. The label web can run up to 30 m/min, roll diameter up to 310 mm, material width up to 180 mm; both vertical and horizontal installation are possible. With HERMES HQ applicators it also labels items at rest and serves high-accuracy industrial applications. Shares its software and firmware base with the IXOR+ head.', it: 'La ROXI è una testa di etichettatura dalla costruzione solida, con elettronica e usabilità moderne, per l’etichettatura di precisione di inserti — piccola nel prezzo, grande nelle prestazioni. Il nastro etichette può scorrere fino a 30 m/min, il diametro del rotolo arriva a 310 mm e la larghezza del materiale a 180 mm; è possibile sia l’installazione verticale sia quella orizzontale. Con gli applicatori HERMES HQ etichetta anche prodotti fermi e serve applicazioni industriali ad alta precisione. Condivide la base software e firmware con la testa IXOR+.', es: 'El ROXI es un cabezal etiquetador de construcción sólida con electrónica y usabilidad modernas para un etiquetado de inserción preciso: pequeño en precio, grande en prestaciones. La banda de etiquetas puede avanzar hasta 30 m/min, el diámetro de rollo alcanza los 310 mm y el ancho de material los 180 mm; es posible tanto la instalación vertical como la horizontal. Con los aplicadores HERMES HQ etiqueta también productos parados y cubre aplicaciones industriales de alta precisión. Comparte la base de software y firmware con el cabezal IXOR+.', de: 'Der ROXI ist ein solide gebauter Etikettierkopf mit moderner Elektronik und Bedienbarkeit für präzises Einlege-Etikettieren — klein im Preis, groß in der Leistung. Die Etikettenbahn läuft mit bis zu 30 m/min, Rollendurchmesser bis 310 mm, Materialbreite bis 180 mm; vertikaler und horizontaler Einbau sind möglich. Mit HERMES HQ Applikatoren etikettiert er auch ruhende Objekte und bedient hochgenaue Industrieanwendungen. Teilt sich die Software- und Firmwarebasis mit dem Etikettierkopf IXOR+.', ko: 'ROXI는 현대적인 전자 플랫폼과 편의성을 갖춘 견고한 구조의 정밀 인서트 라벨링용 라벨링 헤드입니다 — 가격은 낮고 성능은 뛰어납니다. 라벨 웹은 최대 30 m/min으로 구동되며, 롤 직경 최대 310 mm, 소재 폭 최대 180 mm를 지원하고 수직 및 수평 설치가 모두 가능합니다. HERMES HQ 어플리케이터와 함께 사용하면 정지 상태의 제품에도 라벨을 부착할 수 있어 고정밀 산업 애플리케이션에도 대응합니다. IXOR+ 헤드와 소프트웨어 및 펌웨어 기반을 공유합니다.', zh: 'ROXI 是一款结构坚固的贴标头，配备现代化电子系统并且易于使用，专为精密嵌入式贴标而设计——价格不高，性能出众。标签走带速度最高 30 m/min，卷径最大 310 mm，材料宽度最大 180 mm；支持垂直与水平两种安装方式。配合 HERMES HQ 贴标模块还可为静止物品贴标，满足高精度工业应用需求。与 IXOR+ 贴标头共享软件与固件基础。',
    },
    features: [
      { hu: 'Precíziós behelyező-címkézés', en: 'Precision insert-labeling', it: 'Etichettatura di precisione di inserti', es: 'Etiquetado de inserción de precisión', de: 'Präzises Einlege-Etikettieren', ko: '정밀 인서트 라벨링', zh: '精密嵌入式贴标' },
      { hu: 'Szalagsebesség akár 30 m/perc', en: 'Web speed up to 30 m/min', it: 'Velocità del nastro fino a 30 m/min', es: 'Velocidad de banda de hasta 30 m/min', de: 'Bahngeschwindigkeit bis 30 m/min', ko: '웹 속도 최대 30 m/min', zh: '走带速度最高 30 m/min' },
      { hu: 'Tekercs max. 310 mm, anyagszélesség max. 180 mm', en: 'Roll up to 310 mm, material width up to 180 mm', it: 'Rotolo fino a 310 mm, larghezza materiale fino a 180 mm', es: 'Rollo hasta 310 mm, ancho de material hasta 180 mm', de: 'Rolle bis 310 mm, Materialbreite bis 180 mm', ko: '롤 최대 310 mm, 소재 폭 최대 180 mm', zh: '卷径最大 310 mm，材料宽度最大 180 mm' },
      { hu: 'HERMES HQ applikátorokkal', en: 'Works with HERMES HQ applicators', it: 'Compatibile con gli applicatori HERMES HQ', es: 'Compatible con los aplicadores HERMES HQ', de: 'Kompatibel mit HERMES HQ Applikatoren', ko: 'HERMES HQ 어플리케이터와 호환', zh: '兼容 HERMES HQ 贴标模块' },
      { hu: 'Függőleges és vízszintes beépítés', en: 'Vertical and horizontal installation', it: 'Installazione verticale e orizzontale', es: 'Instalación vertical y horizontal', de: 'Vertikaler und horizontaler Einbau', ko: '수직 및 수평 설치', zh: '垂直与水平安装' },
    ],
    image: '/images/products/cab-roxi.webp',
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
      en: 'Print-and-peel module for automated machines and applicators.', it: 'Modulo stampa e spellicolatura per macchine automatizzate e applicatori.', es: 'Módulo de impresión y despegado para máquinas automatizadas y aplicadores.', de: 'Druck- und Spendemodul für automatisierte Maschinen und Applikatoren.', ko: '자동화 머신 및 어플리케이터를 위한 프린트 앤드 필 모듈.', zh: '面向自动化设备与贴标模块的打印剥离模块。',
    },
    description: {
      hu: 'A PX Q nyomtató- és leválasztó modult teljesen automatikus ipari nyomtatásra és címkézésre tervezték, a legújabb cab elektronikai platformra (nagy teljesítményű CPU) építve; a PX korábbi modul utódja. Bármely beépítési helyzetben integrálható, bal- és jobbos kivitelben. 203 / 300 / 600 dpi felbontás, akár 300 mm/s sebesség és 168 mm-ig terjedő nyomtatási szélesség — így Odette- és UCC-címkékhez is alkalmas. SOTI Connect a központi felügyelethez.',
      en: 'The PX Q print-and-peel module is designed for fully automatic industrial printing and labeling, built on the latest cab electronics platform (powerful CPU); it is the successor to the PX module. It can be integrated in any mounting orientation, in left-hand and right-hand versions. 203 / 300 / 600 dpi resolution, up to 300 mm/s and print widths up to 168 mm — suitable for Odette and UCC labels too. SOTI Connect for central management.', it: 'Il modulo stampa e spellicolatura PX Q è progettato per la stampa e l’etichettatura industriali completamente automatiche ed è basato sulla più recente piattaforma elettronica cab (CPU potente); è il successore del modulo PX. Può essere integrato con qualsiasi orientamento di montaggio, in versione sinistra e destra. Risoluzione 203 / 300 / 600 dpi, fino a 300 mm/s e larghezze di stampa fino a 168 mm — adatto anche a etichette Odette e UCC. SOTI Connect per la gestione centralizzata.', es: 'El módulo de impresión y despegado PX Q está diseñado para la impresión y el etiquetado industriales totalmente automáticos, sobre la plataforma electrónica cab más reciente (CPU potente); es el sucesor del módulo PX. Puede integrarse en cualquier orientación de montaje, en versiones a izquierda y a derecha. Resolución de 203 / 300 / 600 dpi, hasta 300 mm/s y anchos de impresión de hasta 168 mm, apto también para etiquetas Odette y UCC. SOTI Connect para la gestión centralizada.', de: 'Das Druck- und Spendemodul PX Q ist für vollautomatisches industrielles Drucken und Etikettieren konzipiert und basiert auf der neuesten cab Elektronikplattform (leistungsstarke CPU); es ist der Nachfolger des PX-Moduls. Es lässt sich in jeder Einbaulage integrieren, in Links- und Rechtsversionen. 203 / 300 / 600 dpi Auflösung, bis zu 300 mm/s und Druckbreiten bis 168 mm — auch für Odette- und UCC-Etiketten geeignet. SOTI Connect für zentrales Management.', ko: 'PX Q 프린트 앤드 필 모듈은 전자동 산업용 인쇄 및 라벨링을 위해 설계되었으며, 최신 cab 전자 플랫폼(강력한 CPU)을 기반으로 하는 PX 모듈의 후속 제품입니다. 어떤 장착 방향으로도 통합할 수 있으며 왼쪽 및 오른쪽 버전으로 제공됩니다. 203 / 300 / 600 dpi 해상도, 최대 300 mm/s 속도, 최대 168 mm 인쇄 폭을 지원하여 Odette 및 UCC 라벨에도 적합합니다. SOTI Connect를 통한 중앙 관리를 지원합니다.', zh: 'PX Q 打印剥离模块专为全自动工业打印与贴标而设计，基于最新的 cab 电子平台（强劲 CPU）打造；是 PX 模块的后继产品。可以任意安装方向集成，提供左向与右向版本。203 / 300 / 600 dpi 分辨率，最高 300 mm/s，打印宽度最大 168 mm——同样适用于 Odette 与 UCC 标签。支持 SOTI Connect 集中管理。',
    },
    features: [
      { hu: '203 / 300 / 600 dpi, akár 300 mm/s', en: '203 / 300 / 600 dpi, up to 300 mm/s', it: '203 / 300 / 600 dpi, fino a 300 mm/s', es: '203 / 300 / 600 dpi, hasta 300 mm/s', de: '203 / 300 / 600 dpi, bis zu 300 mm/s', ko: '203 / 300 / 600 dpi, 최대 300 mm/s', zh: '203 / 300 / 600 dpi，最高 300 mm/s' },
      { hu: 'Nyomtatási szélesség max. 168 mm', en: 'Print width up to 168 mm', it: 'Larghezza di stampa fino a 168 mm', es: 'Ancho de impresión hasta 168 mm', de: 'Druckbreite bis 168 mm', ko: '인쇄 폭 최대 168 mm', zh: '打印宽度最大 168 mm' },
      { hu: 'Bal- és jobbos kivitel, bármely beépítési helyzet', en: 'Left- and right-hand versions, any mounting orientation', it: 'Versioni sinistra e destra, qualsiasi orientamento di montaggio', es: 'Versiones a izquierda y a derecha, cualquier orientación de montaje', de: 'Links- und Rechtsversionen, jede Einbaulage', ko: '왼쪽 및 오른쪽 버전, 모든 장착 방향', zh: '左向与右向版本，任意安装方向' },
      { hu: 'Teljesen automatikus ipari üzem (PX utód)', en: 'Fully automatic industrial operation (PX successor)', it: 'Funzionamento industriale completamente automatico (successore del PX)', es: 'Funcionamiento industrial totalmente automático (sucesor del PX)', de: 'Vollautomatischer Industriebetrieb (PX-Nachfolger)', ko: '전자동 산업용 운용(PX 후속 모델)', zh: '全自动工业运行（PX 后继型号）' },
      { hu: 'Applikátor / OEM integráció', en: 'Applicator / OEM integration', it: 'Integrazione in applicatori / OEM', es: 'Integración en aplicador / OEM', de: 'Applikator- / OEM-Integration', ko: '어플리케이터 / OEM 통합', zh: '贴标模块 / OEM 集成' },
    ],
    image: '/images/products/cab-pxq.webp',
    datasheet: '/datasheets/cab-pxq.pdf',
    videoId: 'AOjwwv_yzbc',
  },
  {
    slug: 'cab-hermes-q-rfid',
    category: 'cimkezo-gepek',
    name: 'CAB HERMES Q RFID',
    brand: 'CAB',
    image: '/images/products/cab-hermes-q-rfid.webp',
    datasheet: '/datasheets/cab-hermes-q.pdf',
    videoId: 'HG9eudLWxfM',
    short: {
      hu: 'Print & apply rendszer UHF RFID modullal: chipírás, nyomtatás és felhelyezés egy ütemben.',
      en: 'Print & apply system with a UHF RFID module: writing the chip, printing and applying in one cycle.', it: 'Sistema stampa e applica con modulo UHF RFID: scrittura del chip, stampa e applicazione in un unico ciclo.', es: 'Sistema imprimir y aplicar con módulo UHF RFID: grabación del chip, impresión y aplicación en un solo ciclo.', de: 'Print-&-Apply-System mit UHF-RFID-Modul: Chip beschreiben, drucken und aufbringen in einem Takt.', ko: 'UHF RFID 모듈을 갖춘 프린트 앤 어플라이 시스템: 칩 기록, 인쇄, 부착이 한 사이클에 이루어집니다.', zh: '带 UHF RFID 模块的即打即贴系统：写芯片、打印与贴标在同一节拍内完成。',
    },
    description: {
      hu: 'A HERMES Q RFID ugyanaz a print & apply rendszer, mint a HERMES Q, beépíthető UHF RFID modullal. Az író-olvasó antenna közvetlenül a nyomtatófejre vagy az adagolóegységre kerül, így a chip írása a nyomtatással egy ütemben megtörténik, majd az applikátor felteszi a címkét a termékre — külön RFID-állomás nélkül.\n\nA legfontosabb különbség az asztali nyomtatóhoz képest, hogy itt a hibás címke nem csak elrontott anyag: ha felkerül a termékre, egy olvashatatlan chip megy tovább a gyártósoron. A cab katalógusa szerint a HQ 4214 lengő-emelő applikátorral a hibás címke kivethető, tehát nem kerül fel a termékre.\n\nA modul a HERMES Q4.3, Q4 és Q6.3 típusokhoz rendelhető — a HERMES Q2-höz a katalógus szerint nem. Két antennaváltozat közül lehet választani: RS és HS. A nyomtatási adatok a géppel azonosak: 200, 300 vagy 600 dpi, 250–300 mm/s sebesség és 104–168 mm nyomtatási szélesség a típustól függően. Egy megkötés van: ha a modult gyárilag szerelik be, az automatikus festékszalag-takarékos üzem nem kérhető mellé.\n\nA modul a cab UHF RFID kínálatából való (UHF EPC Class 1 Gen 2, ISO/IEC 18000-63), ugyanaz, mint a SQUIX nyomtatókban. Az applikátorválaszték változatlan — a felrakó fejeket a HERMES Q oldalán találja.',
      en: 'The HERMES Q RFID is the same print & apply system as the HERMES Q, with an integral UHF RFID module. The read/write antenna is fitted directly to the print head or the feeding unit, so the chip is written in the same cycle as the printing, and the applicator then places the label on the product — with no separate RFID station.\n\nThe key difference from a desktop printer is that here a faulty label is not just wasted stock: once it is on the product, an unreadable chip travels on down the line. According to cab’s catalogue, with the HQ 4214 stroke-turn applicator a defective label can be ejected, so it never reaches the product.\n\nThe module can be ordered for the HERMES Q4.3, Q4 and Q6.3 — according to the catalogue not for the HERMES Q2. Two antenna versions are available: RS and HS. Print data are those of the machine itself: 200, 300 or 600 dpi, 250–300 mm/s and 104–168 mm print width depending on the model. One restriction: if the module is fitted at the factory, automatic ribbon saving cannot be ordered alongside it.\n\nThe module comes from cab’s UHF RFID range (UHF EPC Class 1 Gen 2, ISO/IEC 18000-63), the same one used in the SQUIX printers. The applicator range is unchanged — the application heads are listed on the HERMES Q page.', it: 'La HERMES Q RFID è lo stesso sistema stampa e applica della HERMES Q, con modulo UHF RFID integrabile. L’antenna di lettura/scrittura è montata direttamente sulla testina di stampa o sull’unità di alimentazione, così il chip viene scritto nello stesso ciclo della stampa e l’applicatore posiziona poi l’etichetta sul prodotto — senza una stazione RFID separata.\n\nLa differenza principale rispetto a una stampante da tavolo è che qui un’etichetta difettosa non è solo materiale sprecato: una volta applicata sul prodotto, un chip illeggibile prosegue lungo la linea. Secondo il catalogo cab, con l’applicatore a corsa e rotazione HQ 4214 l’etichetta difettosa può essere espulsa, quindi non arriva mai al prodotto.\n\nIl modulo è ordinabile per HERMES Q4.3, Q4 e Q6.3 — secondo il catalogo non per la HERMES Q2. Sono disponibili due versioni di antenna: RS e HS. I dati di stampa sono quelli della macchina: 200, 300 o 600 dpi, 250–300 mm/s e larghezza di stampa 104–168 mm a seconda del modello. Un vincolo: se il modulo viene montato in fabbrica, non è possibile ordinare anche il risparmio automatico del ribbon.\n\nIl modulo proviene dalla gamma UHF RFID di cab (UHF EPC Class 1 Gen 2, ISO/IEC 18000-63), la stessa impiegata nelle stampanti SQUIX. La gamma di applicatori è invariata — le teste di applicazione sono elencate nella pagina della HERMES Q.', es: 'La HERMES Q RFID es el mismo sistema imprimir y aplicar que la HERMES Q, con módulo UHF RFID integrable. La antena de lectura/escritura se monta directamente en el cabezal de impresión o en la unidad de alimentación, de modo que el chip se graba en el mismo ciclo que la impresión y el aplicador coloca después la etiqueta sobre el producto, sin una estación RFID aparte.\n\nLa diferencia esencial frente a una impresora de sobremesa es que aquí una etiqueta defectuosa no es solo material desperdiciado: una vez colocada en el producto, un chip ilegible sigue avanzando por la línea. Según el catálogo de cab, con el aplicador de carrera y giro HQ 4214 la etiqueta defectuosa puede expulsarse, de modo que nunca llega al producto.\n\nEl módulo puede pedirse para las HERMES Q4.3, Q4 y Q6.3; según el catálogo, no para la HERMES Q2. Hay dos versiones de antena: RS y HS. Los datos de impresión son los de la propia máquina: 200, 300 o 600 dpi, 250–300 mm/s y 104–168 mm de ancho de impresión según el modelo. Una restricción: si el módulo se monta en fábrica, no puede pedirse además el ahorro automático de ribbon.\n\nEl módulo procede de la gama UHF RFID de cab (UHF EPC Class 1 Gen 2, ISO/IEC 18000-63), la misma que se usa en las impresoras SQUIX. La gama de aplicadores no cambia: los cabezales de aplicación figuran en la página de la HERMES Q.', de: 'Der HERMES Q RFID ist dasselbe Print-&-Apply-System wie der HERMES Q, mit integrierbarem UHF-RFID-Modul. Die Schreib-/Leseantenne sitzt direkt am Druckkopf oder an einer Zuführeinheit, der Chip wird also im selben Takt wie der Druck beschrieben, und der Applikator bringt das Etikett anschließend auf das Produkt — ohne eigene RFID-Station.\n\nDer entscheidende Unterschied zum Tischdrucker: Hier ist ein fehlerhaftes Etikett nicht nur verlorenes Material. Ist es erst einmal am Produkt, läuft ein unlesbarer Chip weiter durch die Linie. Laut cab-Katalog lässt sich mit dem Hub-Dreh-Applikator HQ 4214 ein fehlerhaftes Etikett ausschleusen, sodass es gar nicht erst an das Produkt gelangt.\n\nDas Modul ist für HERMES Q4.3, Q4 und Q6.3 bestellbar — laut Katalog nicht für den HERMES Q2. Zwei Antennenvarianten stehen zur Wahl: RS und HS. Die Druckdaten entsprechen denen der Maschine: 200, 300 oder 600 dpi, 250–300 mm/s und 104–168 mm Druckbreite je nach Typ. Eine Einschränkung: Wird das Modul ab Werk eingebaut, ist die automatische Farbbandsparautomatik nicht zusätzlich bestellbar.\n\nDas Modul stammt aus dem UHF-RFID-Programm von cab (UHF EPC Class 1 Gen 2, ISO/IEC 18000-63), demselben wie in den SQUIX-Druckern. Das Applikatorenangebot bleibt unverändert — die Applikatoren finden Sie auf der Seite des HERMES Q.', ko: 'HERMES Q RFID는 HERMES Q와 동일한 프린트 앤 어플라이 시스템에 UHF RFID 모듈을 장착한 것입니다. 읽기/쓰기 안테나는 프린트 헤드 또는 피딩 유닛에 직접 장착되므로 칩 기록이 인쇄와 같은 사이클에 이루어지고, 이어서 어플리케이터가 라벨을 제품에 부착합니다. 별도의 RFID 스테이션이 필요 없습니다.\n\n데스크톱 프린터와의 결정적 차이는, 여기서는 불량 라벨이 단순한 자재 손실에 그치지 않는다는 점입니다. 일단 제품에 부착되면 읽을 수 없는 칩이 그대로 라인을 따라 흘러갑니다. cab 카탈로그에 따르면 HQ 4214 스트로크 턴 어플리케이터를 사용하면 불량 라벨을 배출할 수 있어 제품에 부착되지 않습니다.\n\n이 모듈은 HERMES Q4.3, Q4, Q6.3용으로 주문할 수 있으며, 카탈로그에 따르면 HERMES Q2에는 제공되지 않습니다. 안테나는 RS와 HS 두 가지 중에서 선택합니다. 인쇄 사양은 기계 자체와 동일합니다. 기종에 따라 200, 300 또는 600 dpi, 250~300 mm/s, 인쇄 폭 104~168 mm입니다. 한 가지 제약이 있습니다. 모듈을 공장에서 장착하는 경우 자동 리본 절약 기능은 함께 주문할 수 없습니다.\n\n모듈은 cab의 UHF RFID 제품군(UHF EPC Class 1 Gen 2, ISO/IEC 18000-63)에 속하며, SQUIX 프린터에 사용되는 것과 동일합니다. 어플리케이터 라인업은 그대로이며, 각 어플리케이터는 HERMES Q 페이지에서 확인할 수 있습니다.', zh: 'HERMES Q RFID 与 HERMES Q 是同一套即打即贴系统，只是加装了 UHF RFID 模块。读写天线直接安装在打印头或送纸单元上，因此芯片写入与打印在同一节拍完成，随后由贴标模块把标签贴到产品上——无需单独的 RFID 工位。\n\n与桌面打印机最关键的差别在于：这里的不良标签不只是浪费材料。一旦贴到产品上，一枚无法读取的芯片就会继续沿产线流转。按 cab 目录，使用 HQ 4214 行程旋转式贴标模块可将不良标签排出，使其根本不会贴到产品上。\n\n该模块可为 HERMES Q4.3、Q4 和 Q6.3 订购；按目录，HERMES Q2 不提供。天线有 RS 与 HS 两种可选。打印参数与机器本身一致：视机型为 200、300 或 600 dpi，250–300 mm/s，打印宽度 104–168 mm。有一项限制：若模块在出厂时装配，则不能同时选配自动碳带节省功能。\n\n模块来自 cab 的 UHF RFID 产品线（UHF EPC Class 1 Gen 2、ISO/IEC 18000-63），与 SQUIX 打印机所用相同。贴标模块的选择不变——各款贴标头见 HERMES Q 页面。',
    },
    features: [
      { hu: 'Chipírás, nyomtatás és felhelyezés egy ütemben', en: 'Writing the chip, printing and applying in one cycle', it: 'Scrittura del chip, stampa e applicazione in un unico ciclo', es: 'Grabación del chip, impresión y aplicación en un solo ciclo', de: 'Chip beschreiben, drucken und aufbringen in einem Takt', ko: '칩 기록, 인쇄, 부착이 한 사이클에', zh: '写芯片、打印与贴标在同一节拍内完成' },
      { hu: 'Két antennaváltozat: RS és HS', en: 'Two antenna versions: RS and HS', it: 'Due versioni di antenna: RS e HS', es: 'Dos versiones de antena: RS y HS', de: 'Zwei Antennenvarianten: RS und HS', ko: '두 가지 안테나 버전: RS와 HS', zh: '两种天线版本：RS 与 HS' },
      { hu: 'HERMES Q4.3, Q4 és Q6.3 típusokhoz — a Q2-höz nem', en: 'For the HERMES Q4.3, Q4 and Q6.3 — not for the Q2', it: 'Per HERMES Q4.3, Q4 e Q6.3 — non per la Q2', es: 'Para HERMES Q4.3, Q4 y Q6.3 — no para la Q2', de: 'Für HERMES Q4.3, Q4 und Q6.3 — nicht für den Q2', ko: 'HERMES Q4.3, Q4, Q6.3용 — Q2에는 제공되지 않음', zh: '适用于 HERMES Q4.3、Q4 与 Q6.3——Q2 不提供' },
      { hu: 'HQ 4214 applikátorral a hibás címke kivethető', en: 'With the HQ 4214 applicator a defective label can be ejected', it: 'Con l’applicatore HQ 4214 l’etichetta difettosa può essere espulsa', es: 'Con el aplicador HQ 4214 la etiqueta defectuosa puede expulsarse', de: 'Mit dem Applikator HQ 4214 lässt sich ein fehlerhaftes Etikett ausschleusen', ko: 'HQ 4214 어플리케이터로 불량 라벨 배출 가능', zh: '配 HQ 4214 贴标模块可排出不良标签' },
      { hu: 'Az antenna a nyomtatófejen vagy az adagolóegységen', en: 'Antenna on the print head or the feeding unit', it: 'Antenna sulla testina di stampa o sull’unità di alimentazione', es: 'Antena en el cabezal de impresión o en la unidad de alimentación', de: 'Antenne am Druckkopf oder an der Zuführeinheit', ko: '프린트 헤드 또는 피딩 유닛에 안테나 장착', zh: '天线位于打印头或送纸单元上' },
      { hu: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', en: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', it: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', es: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', de: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', ko: 'UHF EPC Class 1 Gen 2, ISO/IEC 18000-63', zh: 'UHF EPC Class 1 Gen 2、ISO/IEC 18000-63' },
    ],
    orientation: {
      image: '/images/applicators/hermes-q-rfid-modul.webp',
      title: {
        hu: 'Hol ül az antenna',
        en: 'Where the antenna sits', it: 'Dove si trova l’antenna', es: 'Dónde va la antena', de: 'Wo die Antenne sitzt', ko: '안테나의 위치', zh: '天线装在哪里',
      },
      text: {
        hu: 'Az író-olvasó antenna közvetlenül a nyomtatófejre vagy az adagolóegységre kerül — a chip tehát azelőtt kapja meg az adatot, hogy a címke elhagyná a gépet. Ez az elhelyezés dönti el, milyen okoscímkét tud kezelni a rendszer, ezért az antennaváltozatot (RS vagy HS) a címkéhez kell választani, nem fordítva.',
        en: 'The read/write antenna is fitted directly to the print head or to the feeding unit — so the chip receives its data before the label leaves the machine. This position determines which smart labels the system can handle, so the antenna version (RS or HS) must be chosen to match the label, not the other way round.', it: 'L’antenna di lettura/scrittura è montata direttamente sulla testina di stampa o sull’unità di alimentazione: il chip riceve quindi i dati prima che l’etichetta lasci la macchina. Questa posizione determina quali smart label il sistema è in grado di gestire, perciò la versione di antenna (RS o HS) va scelta in base all’etichetta, non viceversa.', es: 'La antena de lectura/escritura se monta directamente en el cabezal de impresión o en la unidad de alimentación, de modo que el chip recibe sus datos antes de que la etiqueta salga de la máquina. Esta posición determina qué etiquetas inteligentes puede manejar el sistema, así que la versión de antena (RS o HS) debe elegirse en función de la etiqueta, no al revés.', de: 'Die Schreib-/Leseantenne sitzt direkt am Druckkopf oder an einer Zuführeinheit — der Chip erhält seine Daten also, bevor das Etikett die Maschine verlässt. Diese Position entscheidet, welche Smart Labels das System verarbeiten kann; die Antennenvariante (RS oder HS) richtet sich daher nach dem Etikett, nicht umgekehrt.', ko: '읽기/쓰기 안테나는 프린트 헤드 또는 피딩 유닛에 직접 장착되므로, 라벨이 기계를 빠져나가기 전에 칩에 데이터가 기록됩니다. 이 위치가 시스템이 처리할 수 있는 스마트 라벨의 범위를 결정하므로, 안테나 버전(RS 또는 HS)은 라벨에 맞추어 선택해야 하며 그 반대가 아닙니다.', zh: '读写天线直接安装在打印头或送纸单元上——因此在标签离开机器之前，芯片就已写入数据。该位置决定了系统能够处理哪些智能标签，所以天线版本（RS 或 HS）应根据标签来选择，而不是反过来。',
      },
    },
    variantsLead: {
      hu: 'A HERMES Q-hoz két antennaváltozat rendelhető — a SQUIX-szel ellentétben itt nincs fémre való (OM) kivitel.',
      en: 'Two antenna versions can be ordered for the HERMES Q — unlike the SQUIX, there is no on-metal (OM) version here.', it: 'Per la HERMES Q sono ordinabili due versioni di antenna: a differenza della SQUIX, qui non esiste la variante per metallo (OM).', es: 'Para la HERMES Q pueden pedirse dos versiones de antena: a diferencia de la SQUIX, aquí no existe la variante para metal (OM).', de: 'Für den HERMES Q sind zwei Antennenvarianten bestellbar — anders als beim SQUIX gibt es hier keine On-Metal-Variante (OM).', ko: 'HERMES Q에는 두 가지 안테나 버전을 주문할 수 있습니다. SQUIX와 달리 금속용(OM) 버전은 제공되지 않습니다.', zh: 'HERMES Q 可订购两种天线版本——与 SQUIX 不同，这里没有金属专用（OM）版本。',
    },
    variants: [
      {
        name: 'UHF RFID modul RS',
        purpose: {
          hu: 'Regular Sensitivity: a szokásos érzékenységű, alapértelmezett választás — az elterjedt RFID-címkékhez ez a szabvány megoldás.',
          en: 'Regular Sensitivity: the standard-sensitivity, default choice — the standard solution for common RFID labels.', it: 'Regular Sensitivity: la scelta predefinita a sensibilità standard — la soluzione standard per le etichette RFID più diffuse.', es: 'Regular Sensitivity: la opción por defecto, de sensibilidad estándar — la solución estándar para las etiquetas RFID habituales.', de: 'Regular Sensitivity: die Standardwahl mit üblicher Empfindlichkeit — die Standardlösung für gängige RFID-Etiketten.', ko: 'Regular Sensitivity: 표준 감도의 기본 선택으로, 일반적인 RFID 라벨에 적합한 표준 솔루션입니다.', zh: 'Regular Sensitivity：常规灵敏度的默认选择——适用于常见 RFID 标签的标准方案。',
        },
        params: [
          { label: { hu: 'Melyik géphez', en: 'Available on', it: 'Disponibile su', es: 'Disponible en', de: 'Verfügbar für', ko: '적용 기종', zh: '适用机型' }, value: { hu: 'HERMES Q4.3, Q4, Q6.3', en: 'HERMES Q4.3, Q4, Q6.3', it: 'HERMES Q4.3, Q4, Q6.3', es: 'HERMES Q4.3, Q4, Q6.3', de: 'HERMES Q4.3, Q4, Q6.3', ko: 'HERMES Q4.3, Q4, Q6.3', zh: 'HERMES Q4.3、Q4、Q6.3' } },
          { label: { hu: 'Rendelési jelzés', en: 'Order code suffix', it: 'Codice di ordinazione', es: 'Sufijo de pedido', de: 'Bestellkennung', ko: '주문 코드', zh: '订购代号' }, value: { hu: '.486', en: '.486', it: '.486', es: '.486', de: '.486', ko: '.486', zh: '.486' } },
        ],
      },
      {
        name: 'UHF RFID modul HS',
        purpose: {
          hu: 'High Sensitivity: nagy érzékenységű antenna azokhoz a címkékhez, amelyeknek sajátos a sugárzási képe — jellemzően a nagyon apró chipekhez.',
          en: 'High Sensitivity: a high-sensitivity antenna for labels with specific radiation characteristics — typically the very small tags.', it: 'High Sensitivity: antenna ad alta sensibilità per etichette con caratteristiche di irradiazione particolari — tipicamente i tag molto piccoli.', es: 'High Sensitivity: antena de alta sensibilidad para etiquetas con características de radiación específicas — normalmente los tags muy pequeños.', de: 'High Sensitivity: hochempfindliche Antenne für Etiketten mit besonderer Abstrahlcharakteristik — typischerweise sehr kleine Tags.', ko: 'High Sensitivity: 방사 특성이 특수한 라벨, 주로 초소형 태그를 위한 고감도 안테나입니다.', zh: 'High Sensitivity：面向辐射特性特殊的标签的高灵敏度天线——通常用于极小芯片。',
        },
        params: [
          { label: { hu: 'Melyik géphez', en: 'Available on', it: 'Disponibile su', es: 'Disponible en', de: 'Verfügbar für', ko: '적용 기종', zh: '适用机型' }, value: { hu: 'HERMES Q4.3, Q4, Q6.3', en: 'HERMES Q4.3, Q4, Q6.3', it: 'HERMES Q4.3, Q4, Q6.3', es: 'HERMES Q4.3, Q4, Q6.3', de: 'HERMES Q4.3, Q4, Q6.3', ko: 'HERMES Q4.3, Q4, Q6.3', zh: 'HERMES Q4.3、Q4、Q6.3' } },
          { label: { hu: 'Rendelési jelzés', en: 'Order code suffix', it: 'Codice di ordinazione', es: 'Sufijo de pedido', de: 'Bestellkennung', ko: '주문 코드', zh: '订购代号' }, value: { hu: '.488', en: '.488', it: '.488', es: '.488', de: '.488', ko: '.488', zh: '.488' } },
        ],
      },
    ],
  },
  {
    slug: 'cab-hermes-c',
    category: 'cimkezo-gepek',
    name: 'CAB HERMES C',
    brand: 'CAB',
    short: {
      hu: 'A világ első kétszínű print & apply rendszere — GHS veszélyesanyag-címkékhez.',
      en: 'The world’s first two-colour print & apply system — for GHS hazard labels.', it: 'Il primo sistema stampa e applica bicolore al mondo — per etichette di pericolo GHS.', es: 'El primer sistema de imprimir y aplicar a dos colores del mundo — para etiquetas de peligro GHS.', de: 'Das weltweit erste zweifarbige Print-and-Apply-System — für GHS-Gefahrstoffetiketten.', ko: '세계 최초의 2색 프린트 & 어플라이 시스템 — GHS 위험물 라벨용.', zh: '全球首套双色打印贴标系统——适用于 GHS 危险品标签。',
    },
    description: {
      hu: 'A HERMES C a világ első címkéző rendszere, amely egy munkamenetben nyomtat és helyez fel kétszínű címkéket. Kifejezetten a GHS szerinti osztályozás és címkézés (Classification and Labeling Inventory) alkalmazásaira fejlesztették és optimalizálták: a veszélyjelek piros keretét és a fekete szöveget egyszerre, valós időben nyomtatja és applikálja a gyártósoron, megbízható ipari kivitelben.',
      en: 'The HERMES C is the world’s first labeling system to print and apply two-colour labels in one operation. It was developed and optimised specifically for applications under the GHS Classification and Labeling Inventory: the red frame of the hazard pictograms and the black text are printed and applied simultaneously, in real time, on the production line — in a reliable industrial build.', it: 'La HERMES C è il primo sistema di etichettatura al mondo a stampare e applicare etichette bicolori in un’unica operazione. È stata sviluppata e ottimizzata specificamente per le applicazioni previste dal GHS Classification and Labeling Inventory: la cornice rossa dei pittogrammi di pericolo e il testo nero vengono stampati e applicati simultaneamente, in tempo reale, sulla linea di produzione — con una costruzione industriale affidabile.', es: 'El HERMES C es el primer sistema de etiquetado del mundo que imprime y aplica etiquetas a dos colores en una sola operación. Se desarrolló y optimizó específicamente para aplicaciones sujetas al Inventario de Clasificación y Etiquetado GHS: el marco rojo de los pictogramas de peligro y el texto en negro se imprimen y aplican simultáneamente, en tiempo real, en la línea de producción, con una construcción industrial fiable.', de: 'Der HERMES C ist das weltweit erste Etikettiersystem, das zweifarbige Etiketten in einem Arbeitsgang druckt und aufbringt. Er wurde speziell für Anwendungen nach dem GHS Classification and Labeling Inventory entwickelt und optimiert: Der rote Rahmen der Gefahrenpiktogramme und der schwarze Text werden gleichzeitig, in Echtzeit, an der Produktionslinie gedruckt und aufgebracht — in zuverlässiger Industrieausführung.', ko: 'HERMES C는 2색 라벨을 한 번의 작업으로 인쇄하고 부착하는 세계 최초의 라벨링 시스템입니다. GHS 분류·표시 체계에 따른 응용 분야를 위해 특별히 개발 및 최적화되었습니다. 위험물 픽토그램의 빨간색 테두리와 검은색 텍스트가 생산 라인에서 실시간으로 동시에 인쇄 및 부착되며, 신뢰성 있는 산업용 구조로 제작되었습니다.', zh: 'HERMES C 是全球首套可在一次作业中打印并贴附双色标签的贴标系统。它专为 GHS 分类与标签目录下的应用而开发和优化：危险品象形图的红色边框与黑色文字在生产线上实时同步打印并贴附——以可靠的工业级结构呈现。',
    },
    features: [
      { hu: 'Kétszínű print & apply egy munkamenetben', en: 'Two-colour print & apply in one operation', it: 'Stampa e applica bicolore in un’unica operazione', es: 'Imprimir y aplicar a dos colores en una sola operación', de: 'Zweifarbiges Print & Apply in einem Arbeitsgang', ko: '한 번의 작업으로 2색 프린트 & 어플라이', zh: '一次作业完成双色打印贴标' },
      { hu: 'GHS veszélyesanyag-címkékhez optimalizálva', en: 'Optimised for GHS hazard labels', it: 'Ottimizzata per etichette di pericolo GHS', es: 'Optimizado para etiquetas de peligro GHS', de: 'Optimiert für GHS-Gefahrstoffetiketten', ko: 'GHS 위험물 라벨에 최적화', zh: '针对 GHS 危险品标签优化' },
      { hu: 'Valós idejű gyártósori címkézés', en: 'Real-time production-line labeling', it: 'Etichettatura in tempo reale sulla linea di produzione', es: 'Etiquetado en línea de producción en tiempo real', de: 'Etikettierung an der Produktionslinie in Echtzeit', ko: '실시간 생산 라인 라벨링', zh: '生产线实时贴标' },
      { hu: 'HERMES termékcsalád, ipari kivitel', en: 'HERMES family, industrial build', it: 'Famiglia HERMES, costruzione industriale', es: 'Familia HERMES, construcción industrial', de: 'HERMES-Familie, Industrieausführung', ko: 'HERMES 제품군, 산업용 구조', zh: 'HERMES 系列，工业级结构' },
    ],
    image: '/images/products/cab-hermes-c.webp',
    datasheet: '/datasheets/cab-hermes-c.pdf',
  },

  // ——— CAB — Címke-adagoló gépek ———
  {
    slug: 'cab-hs',
    category: 'cimke-adagolo-gepek',
    name: 'CAB HS',
    brand: 'CAB',
    image: '/images/products/cab-hs.webp',
    datasheet: '/datasheets/cab-hsvs.pdf',
    short: {
      hu: 'Címkeadagoló minden címkemérethez — hézag nélkül vágott vagy stancolt címkékhez.',
      en: 'Label dispenser for every label size — for gap-free cut or die-cut labels.', it: 'Spellicolatore di etichette per ogni formato — per etichette tagliate o fustellate senza spazio intermedio.', es: 'Dispensador de etiquetas para cualquier formato de etiqueta — para etiquetas cortadas o troqueladas sin separación.', de: 'Etikettenspender für jede Etikettengröße — für lückenlos geschnittene oder gestanzte Etiketten.', ko: '모든 라벨 크기에 대응하는 라벨 디스펜서 — 간격 없이 컷팅된 라벨 또는 다이컷 라벨용.', zh: '适用于各种标签尺寸的标签剥离机——支持无间隔切割或模切标签。',
    },
    description: {
      hu: 'A HS adagoló bármilyen címkeméretet egyszerűen adagol; a címkék hézag nélkül is stancolhatók vagy vághatók, a kézi felhelyezés gyorsításához.',
      en: 'The HS dispenser feeds any label size with ease; labels can be die-cut or cut without any gap in between, speeding up manual application.', it: 'Lo spellicolatore HS alimenta con facilità qualsiasi formato di etichetta; le etichette possono essere fustellate o tagliate senza alcuno spazio intermedio, accelerando l’applicazione manuale.', es: 'El dispensador HS alimenta con facilidad cualquier formato de etiqueta; las etiquetas pueden estar troqueladas o cortadas sin ninguna separación entre ellas, lo que acelera la aplicación manual.', de: 'Der HS-Spender führt jede Etikettengröße mühelos zu; Etiketten können gestanzt oder ohne Zwischenabstand geschnitten sein, was die manuelle Etikettierung beschleunigt.', ko: 'HS 디스펜서는 어떤 크기의 라벨도 손쉽게 공급합니다. 라벨은 다이컷 형태 또는 간격 없이 컷팅된 형태 모두 사용할 수 있어 수동 부착 작업 속도를 높입니다.', zh: 'HS 剥离机可轻松送出任何尺寸的标签；标签可为模切标签，也可为无间隔切割的标签，从而加快手工贴标速度。',
    },
    features: [
      { hu: 'Bármilyen címkeméret', en: 'Any label size', it: 'Qualsiasi formato di etichetta', es: 'Cualquier formato de etiqueta', de: 'Jede Etikettengröße', ko: '모든 라벨 크기', zh: '任意标签尺寸' },
      { hu: 'Hézag nélküli adagolás', en: 'Gap-free dispensing', it: 'Spellicolatura senza spazi intermedi', es: 'Dispensado sin separación entre etiquetas', de: 'Lückenloses Spenden', ko: '간격 없는 디스펜싱', zh: '无间隔剥离' },
      { hu: 'Fotocellás vezérlés', en: 'Photocell control', it: 'Controllo tramite fotocellula', es: 'Control por fotocélula', de: 'Fotozellensteuerung', ko: '포토셀 제어', zh: '光电传感器控制' },
      { hu: 'Asztali kivitel', en: 'Desktop unit', it: 'Unità da tavolo', es: 'Equipo de sobremesa', de: 'Tischgerät', ko: '데스크톱 유닛', zh: '桌面型设备' },
    ],
  },
  {
    slug: 'cab-vs',
    category: 'cimke-adagolo-gepek',
    name: 'CAB VS',
    brand: 'CAB',
    image: '/images/products/cab-vs.webp',
    datasheet: '/datasheets/cab-hsvs.pdf',
    short: {
      hu: 'Kompakt címkeadagoló munkaállomásokra, egyszerű, gyors kézi címkézéshez.',
      en: 'Compact label dispenser for workstations — simple, fast manual labeling.', it: 'Spellicolatore di etichette compatto per postazioni di lavoro — etichettatura manuale semplice e rapida.', es: 'Dispensador de etiquetas compacto para puestos de trabajo — etiquetado manual sencillo y rápido.', de: 'Kompakter Etikettenspender für Arbeitsplätze — einfache, schnelle manuelle Etikettierung.', ko: '작업대용 컴팩트 라벨 디스펜서 — 간편하고 빠른 수동 라벨링.', zh: '面向工位的紧凑型标签剥离机——简单快捷的手工贴标。',
    },
    description: {
      hu: 'A VS adagoló kompakt kivitelben gyorsítja a kézi címkézést munkaállomásokon, megbízható címkeleválasztással.',
      en: 'The VS dispenser accelerates manual labeling at workstations in a compact format, with reliable label separation.', it: 'Lo spellicolatore VS accelera l’etichettatura manuale nelle postazioni di lavoro in formato compatto, con una separazione affidabile delle etichette.', es: 'El dispensador VS acelera el etiquetado manual en los puestos de trabajo en un formato compacto, con una separación fiable de las etiquetas.', de: 'Der VS-Spender beschleunigt die manuelle Etikettierung am Arbeitsplatz in kompaktem Format, mit zuverlässiger Etikettentrennung.', ko: 'VS 디스펜서는 컴팩트한 형태로 작업대에서의 수동 라벨링을 가속하며, 신뢰성 있는 라벨 분리 기능을 제공합니다.', zh: 'VS 剥离机以紧凑的机身加快工位上的手工贴标速度，标签分离可靠。',
    },
    features: [
      { hu: 'Kompakt asztali kivitel', en: 'Compact desktop unit', it: 'Unità da tavolo compatta', es: 'Equipo de sobremesa compacto', de: 'Kompaktes Tischgerät', ko: '컴팩트 데스크톱 유닛', zh: '紧凑型桌面设备' },
      { hu: 'Megbízható címkeleválasztás', en: 'Reliable label separation', it: 'Separazione affidabile delle etichette', es: 'Separación fiable de las etiquetas', de: 'Zuverlässige Etikettentrennung', ko: '신뢰성 있는 라벨 분리', zh: '可靠的标签分离' },
      { hu: 'Állítható különböző méretekhez', en: 'Adjustable for various sizes', it: 'Regolabile per vari formati', es: 'Ajustable para distintos formatos', de: 'Einstellbar für verschiedene Größen', ko: '다양한 크기에 맞게 조정 가능', zh: '可调节适配多种尺寸' },
      { hu: 'Munkaállomási használat', en: 'Workstation use', it: 'Uso in postazione di lavoro', es: 'Uso en puesto de trabajo', de: 'Einsatz am Arbeitsplatz', ko: '작업대 사용', zh: '工位使用' },
    ],
  },

  // ——— CAB — Lézeres jelölők ———
  {
    slug: 'cab-xeno-4',
    category: 'lezer-gravirozok',
    name: 'CAB XENO 4',
    brand: 'CAB',
    short: {
      hu: 'Fiber jelölő lézer (20/30/50 W) fémek, műanyagok és festett felületek gravírozásához.',
      en: 'Fiber marking laser (20/30/50 W) for metals, plastics and painted surfaces.', it: 'Laser di marcatura in fibra (20/30/50 W) per metalli, plastica e superfici verniciate.', es: 'Láser de marcaje de fibra (20/30/50 W) para metales, plásticos y superficies pintadas.', de: 'Faser-Markierlaser (20/30/50 W) für Metalle, Kunststoffe und lackierte Oberflächen.', ko: '금속, 플라스틱 및 도장 표면용 파이버 마킹 레이저(20/30/50 W).', zh: '光纤打标激光器（20/30/50 W），适用于金属、塑料与喷漆表面。',
    },
    description: {
      hu: 'A XENO 4 új generációs fiber lézer 20, 30 vagy 50 W kimenő teljesítménnyel — dióda-pumpált, léghűtéses. Két egységből áll: a beépített lézerforrást tartalmazó vezérlőből és a szálon csatlakozó, tetszőleges helyzetben beépíthető szkennerfejből. Az integrált fókuszkereső egyszerűsíti a munkadarab pozicionálását; a különböző síkmezős (F-theta) objektívekkel 69×69 mm-től 290×290 mm-ig terjedő jelölőmezők érhetők el. Ipar 4.0-kész, TCP/IP-vezérlés és -felügyelet. Jelöl fémen, műanyagon és festett felületen.',
      en: 'The XENO 4 is a new-generation fiber laser with 20, 30 or 50 W output power — diode-pumped and air-cooled. It consists of two units: a control unit with an integral beam source, and a scan head connected via a fiber that can be mounted in any orientation. The integrated focus finder simplifies workpiece positioning; different plano-spherical lenses cover marking fields from 69×69 mm to 290×290 mm. Industry 4.0-ready with TCP/IP control and monitoring. Marks metal, plastics and painted surfaces.', it: 'Lo XENO 4 è un laser in fibra di nuova generazione con potenza di uscita di 20, 30 o 50 W — pompato a diodi e raffreddato ad aria. È composto da due unità: un’unità di controllo con sorgente del fascio integrata e una testa di scansione collegata tramite fibra, montabile con qualsiasi orientamento. Il cercatore di fuoco integrato semplifica il posizionamento del pezzo; diverse lenti piano-sferiche coprono campi di marcatura da 69×69 mm a 290×290 mm. Pronto per Industry 4.0 con controllo e monitoraggio TCP/IP. Marca metalli, plastica e superfici verniciate.', es: 'El XENO 4 es un láser de fibra de nueva generación con 20, 30 o 50 W de potencia de salida, bombeado por diodo y refrigerado por aire. Consta de dos unidades: una unidad de control con la fuente del haz integrada y un cabezal de escaneo conectado mediante una fibra que puede montarse en cualquier orientación. El buscador de foco integrado simplifica el posicionamiento de la pieza; distintas lentes planoesféricas cubren campos de marcaje de 69×69 mm a 290×290 mm. Preparado para la Industria 4.0 con control y supervisión por TCP/IP. Marca metal, plásticos y superficies pintadas.', de: 'Der XENO 4 ist ein Faserlaser der neuen Generation mit 20, 30 oder 50 W Ausgangsleistung — diodengepumpt und luftgekühlt. Er besteht aus zwei Einheiten: einer Steuereinheit mit integrierter Strahlquelle und einem über eine Faser verbundenen Scankopf, der in beliebiger Ausrichtung montiert werden kann. Der integrierte Fokusfinder vereinfacht die Positionierung des Werkstücks; verschiedene plansphärische Linsen decken Markierfelder von 69×69 mm bis 290×290 mm ab. Industrie-4.0-fähig mit Steuerung und Überwachung über TCP/IP. Markiert Metall, Kunststoffe und lackierte Oberflächen.', ko: 'XENO 4는 20, 30 또는 50 W 출력의 신세대 파이버 레이저로, 다이오드 펌핑 방식과 공랭식을 채택했습니다. 빔 소스 일체형 컨트롤 유닛과, 파이버로 연결되어 어떤 방향으로도 장착할 수 있는 스캔 헤드의 두 유닛으로 구성됩니다. 통합 포커스 파인더가 공작물 위치 설정을 간소화하며, 다양한 평면 구면 렌즈로 69×69 mm에서 290×290 mm까지의 마킹 필드를 커버합니다. TCP/IP 제어 및 모니터링으로 Industry 4.0에 대응합니다. 금속, 플라스틱, 도장 표면을 마킹합니다.', zh: 'XENO 4 是新一代光纤激光器，输出功率 20、30 或 50 W——二极管泵浦、风冷设计。由两个单元组成：内置光束源的控制单元，以及通过光纤连接、可以任意方向安装的扫描头。集成的焦点定位器简化工件定位；不同的平面球面透镜可覆盖 69×69 mm 至 290×290 mm 的打标范围。支持工业 4.0，可通过 TCP/IP 控制与监控。可打标金属、塑料与喷漆表面。',
    },
    features: [
      { hu: '20 / 30 / 50 W ytterbium fiber lézer, léghűtéses', en: '20 / 30 / 50 W ytterbium fiber laser, air-cooled', it: 'Laser in fibra allo itterbio da 20 / 30 / 50 W, raffreddato ad aria', es: 'Láser de fibra de iterbio de 20 / 30 / 50 W, refrigerado por aire', de: '20 / 30 / 50 W Ytterbium-Faserlaser, luftgekühlt', ko: '20 / 30 / 50 W 이터븀 파이버 레이저, 공랭식', zh: '20 / 30 / 50 W 镱光纤激光器，风冷' },
      { hu: 'Jelölőmező 69×69 – 290×290 mm (objektívtől függően)', en: 'Marking field 69×69 – 290×290 mm (lens-dependent)', it: 'Campo di marcatura 69×69 – 290×290 mm (in base alla lente)', es: 'Campo de marcaje 69×69 – 290×290 mm (según lente)', de: 'Markierfeld 69×69 – 290×290 mm (linsenabhängig)', ko: '마킹 필드 69×69 – 290×290 mm(렌즈별 상이)', zh: '打标范围 69×69 – 290×290 mm（视透镜而定）' },
      { hu: 'Integrált fókuszkereső, kompakt szkennerfej', en: 'Integrated focus finder, compact scan head', it: 'Cercatore di fuoco integrato, testa di scansione compatta', es: 'Buscador de foco integrado, cabezal de escaneo compacto', de: 'Integrierter Fokusfinder, kompakter Scankopf', ko: '통합 포커스 파인더, 컴팩트 스캔 헤드', zh: '集成焦点定位器，紧凑型扫描头' },
      { hu: 'Jelölési sebesség > 5000 mm/s', en: 'Marking speed > 5,000 mm/s', it: 'Velocità di marcatura > 5.000 mm/s', es: 'Velocidad de marcaje > 5.000 mm/s', de: 'Markiergeschwindigkeit > 5.000 mm/s', ko: '마킹 속도 5,000 mm/s 초과', zh: '打标速度 > 5,000 mm/s' },
      { hu: 'Ipar 4.0, TCP/IP vezérlés és felügyelet', en: 'Industry 4.0, TCP/IP control and monitoring', it: 'Industry 4.0, controllo e monitoraggio TCP/IP', es: 'Industria 4.0, control y supervisión por TCP/IP', de: 'Industrie 4.0, Steuerung und Überwachung über TCP/IP', ko: 'Industry 4.0, TCP/IP 제어 및 모니터링', zh: '工业 4.0，TCP/IP 控制与监控' },
      { hu: 'cabLase jelölőszoftver', en: 'cabLase marking software', it: 'Software di marcatura cabLase', es: 'Software de marcaje cabLase', de: 'cabLase Markiersoftware', ko: 'cabLase 마킹 소프트웨어', zh: 'cabLase 打标软件' },
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
      hu: 'Kompakt all-in-one asztali lézerjelölő rendszer fémhez és műanyaghoz.',
      en: 'Compact all-in-one desktop laser marking system for metal and plastic.', it: 'Sistema di marcatura laser da tavolo compatto all-in-one per metallo e plastica.', es: 'Sistema de marcaje láser de sobremesa todo en uno y compacto para metal y plástico.', de: 'Kompaktes All-in-One-Desktop-Lasermarkiersystem für Metall und Kunststoff.', ko: '금속 및 플라스틱용 컴팩트 올인원 데스크톱 레이저 마킹 시스템.', zh: '紧凑型一体化桌面激光打标系统，适用于金属与塑料。',
    },
    description: {
      hu: 'A XENO 1 kompakt, kis helyigényű asztali jelölőrendszer nagy munkatérrel, fémek és műanyagok jelölésére. Teljesen felszerelt, zárt (1. lézerosztályú) rendszer: motoros ajtó, motoros Z-tengely akár 210 mm munkadarab-magasságig, fókuszkereső, belső LED-világítás és opcionális forgótengely hengeres darabokhoz. A 20 vagy 30 W-os fiber lézerrel a jelölőmező objektívtől függően 112×112 vagy 180×180 mm. A XENO 1+ változat IPG lézerforrással és 2+2 év garanciával érkezik. cabLase jelölőszoftver.',
      en: 'The XENO 1 is a compact, space-saving desktop marking system with a large work area for marking metals and plastics. A fully equipped, enclosed Class-1 system: motor-driven door, motor-driven Z-axis for workpieces up to 210 mm high, focus finder, interior LED lighting and an optional rotary axis for cylindrical items. With the 20 or 30 W fiber laser the marking field is 112×112 or 180×180 mm depending on the lens. The XENO 1+ variant comes with an IPG beam source and a 2+2-year warranty. cabLase marking software.', it: 'Lo XENO 1 è un sistema di marcatura da tavolo compatto e salvaspazio con un ampio piano di lavoro per la marcatura di metalli e plastica. Un sistema completo e chiuso in Classe 1: porta motorizzata, asse Z motorizzato per pezzi fino a 210 mm di altezza, cercatore di fuoco, illuminazione LED interna e asse rotativo opzionale per pezzi cilindrici. Con il laser in fibra da 20 o 30 W il campo di marcatura è di 112×112 o 180×180 mm a seconda della lente. La variante XENO 1+ è dotata di sorgente del fascio IPG e garanzia 2+2 anni. Software di marcatura cabLase.', es: 'El XENO 1 es un sistema de marcaje de sobremesa compacto y de dimensiones reducidas con una amplia área de trabajo para marcar metales y plásticos. Un sistema Clase 1 cerrado y totalmente equipado: puerta motorizada, eje Z motorizado para piezas de hasta 210 mm de altura, buscador de foco, iluminación LED interior y un eje rotativo opcional para piezas cilíndricas. Con el láser de fibra de 20 o 30 W el campo de marcaje es de 112×112 o 180×180 mm según la lente. La variante XENO 1+ incorpora una fuente de haz IPG y una garantía de 2+2 años. Software de marcaje cabLase.', de: 'Der XENO 1 ist ein kompaktes, platzsparendes Desktop-Markiersystem mit großem Arbeitsbereich zum Markieren von Metallen und Kunststoffen. Ein voll ausgestattetes, geschlossenes System der Laserklasse 1: motorisch angetriebene Tür, motorische Z-Achse für Werkstücke bis 210 mm Höhe, Fokusfinder, LED-Innenbeleuchtung und optionale Drehachse für zylindrische Teile. Mit dem 20- oder 30-W-Faserlaser beträgt das Markierfeld je nach Linse 112×112 oder 180×180 mm. Die Variante XENO 1+ kommt mit IPG-Strahlquelle und 2+2 Jahren Garantie. cabLase Markiersoftware.', ko: 'XENO 1은 금속과 플라스틱 마킹을 위한 넓은 작업 영역을 갖춘 컴팩트하고 공간 절약형의 데스크톱 마킹 시스템입니다. 완전 장비를 갖춘 밀폐형 Class 1 시스템으로, 전동 도어, 최대 210 mm 높이의 공작물에 대응하는 전동 Z축, 포커스 파인더, 내부 LED 조명, 원통형 부품을 위한 옵션 로터리 축을 제공합니다. 20 또는 30 W 파이버 레이저 사용 시 렌즈에 따라 마킹 필드는 112×112 또는 180×180 mm입니다. XENO 1+ 버전은 IPG 빔 소스와 2+2년 보증을 제공합니다. cabLase 마킹 소프트웨어.', zh: 'XENO 1 是一款紧凑、节省空间的桌面打标系统，拥有较大的工作区域，可打标金属与塑料。配置齐全的封闭式 1 类激光系统：电动门、电动 Z 轴（工件高度最大 210 mm）、焦点定位器、内部 LED 照明，以及用于圆柱形工件的可选旋转轴。配备 20 或 30 W 光纤激光器时，打标范围视透镜为 112×112 或 180×180 mm。XENO 1+ 版本配备 IPG 光束源并提供 2+2 年保修。附 cabLase 打标软件。',
    },
    features: [
      { hu: 'Kompakt, zárt asztali rendszer (1. lézerosztály)', en: 'Compact enclosed desktop system (Class 1)', it: 'Sistema da tavolo compatto e chiuso (Classe 1)', es: 'Sistema de sobremesa compacto y cerrado (Clase 1)', de: 'Kompaktes geschlossenes Desktop-System (Klasse 1)', ko: '컴팩트 밀폐형 데스크톱 시스템(Class 1)', zh: '紧凑型封闭桌面系统（1 类激光）' },
      { hu: '20 / 30 W fiber lézer', en: '20 / 30 W fiber laser', it: 'Laser in fibra da 20 / 30 W', es: 'Láser de fibra de 20 / 30 W', de: '20 / 30 W Faserlaser', ko: '20 / 30 W 파이버 레이저', zh: '20 / 30 W 光纤激光器' },
      { hu: 'Jelölőmező 112×112 vagy 180×180 mm', en: 'Marking field 112×112 or 180×180 mm', it: 'Campo di marcatura 112×112 o 180×180 mm', es: 'Campo de marcaje 112×112 o 180×180 mm', de: 'Markierfeld 112×112 oder 180×180 mm', ko: '마킹 필드 112×112 또는 180×180 mm', zh: '打标范围 112×112 或 180×180 mm' },
      { hu: 'Motoros ajtó és Z-tengely (max. 210 mm)', en: 'Motor-driven door and Z-axis (up to 210 mm)', it: 'Porta e asse Z motorizzati (fino a 210 mm)', es: 'Puerta y eje Z motorizados (hasta 210 mm)', de: 'Motorische Tür und Z-Achse (bis 210 mm)', ko: '전동 도어 및 Z축(최대 210 mm)', zh: '电动门与电动 Z 轴（最大 210 mm）' },
      { hu: 'Integrált fókuszkereső, belső LED-világítás', en: 'Integrated focus finder, interior LED lighting', it: 'Cercatore di fuoco integrato, illuminazione LED interna', es: 'Buscador de foco integrado, iluminación LED interior', de: 'Integrierter Fokusfinder, LED-Innenbeleuchtung', ko: '통합 포커스 파인더, 내부 LED 조명', zh: '集成焦点定位器，内部 LED 照明' },
      { hu: 'Opcionális forgótengely hengeres darabokhoz', en: 'Optional rotary axis for cylindrical parts', it: 'Asse rotativo opzionale per pezzi cilindrici', es: 'Eje rotativo opcional para piezas cilíndricas', de: 'Optionale Drehachse für zylindrische Teile', ko: '원통형 부품용 옵션 로터리 축', zh: '可选旋转轴，适用于圆柱形工件' },
    ],
    image: '/images/products/cab-xeno-1.webp',
    datasheet: '/datasheets/cab-laser-xeno.pdf',
    videoId: 'eDgChgvtAzc',
  },
  {
    slug: 'cab-xeno-3',
    category: 'lezer-gravirozok',
    name: 'CAB XENO 3',
    brand: 'CAB',
    short: {
      hu: 'Integrált táblajelölő lézerrendszer fém és műanyag táblák tartós jelölésére.',
      en: 'Integrated laser system for permanent marking of metal and plastic plates.', it: 'Sistema laser integrato per la marcatura permanente di targhette in metallo e plastica.', es: 'Sistema láser integrado para el marcaje permanente de placas de metal y plástico.', de: 'Integriertes Lasersystem zur dauerhaften Markierung von Metall- und Kunststoffplatten.', ko: '금속 및 플라스틱 플레이트의 영구 마킹을 위한 통합형 레이저 시스템.', zh: '用于金属与塑料铭牌永久打标的集成式激光系统。',
    },
    description: {
      hu: 'A XENO 3 integrált lézerrendszer fém és műanyag táblák (típustáblák) tartós jelölésére. A fiber lézerforrás, a vezérlés és a munkatér közös, 1. lézerosztályú biztonsági házban van; kompakt kialakítása asztali használatot tesz lehetővé. A cserélhető magazinokkal különböző táblaméretek dolgozhatók fel: 40×20 – 120×100 mm méretű, 0,5–1 mm vastag táblák, akár 50 mm magas kötegben. A 20 vagy 30 W-os fiber lézer jelölése tartósan olvasható marad zord környezetben is; kiválóan alkalmas fémgravírozáshoz és a felső réteg eltávolításához.',
      en: 'The XENO 3 is an integrated laser system for permanently marking metal and plastic plates (type plates). The fiber beam source, control unit and work area are housed in a joint Class-1 laser safety enclosure; its compact design suits desktop operation. Replaceable magazines process different plate sizes: plates 40×20 – 120×100 mm, 0.5–1 mm thick, stackable up to 50 mm high. Markings by the 20 or 30 W fiber laser stay clearly legible even in rough environments; particularly suited to metal engraving and top-layer ablation.', it: 'Lo XENO 3 è un sistema laser integrato per la marcatura permanente di targhette in metallo e plastica (targhette identificative). La sorgente del fascio in fibra, l’unità di controllo e il piano di lavoro sono racchiusi in una cabina di sicurezza laser comune in Classe 1; il design compatto è adatto al funzionamento da tavolo. Caricatori intercambiabili consentono di lavorare targhette di formati diversi: targhette da 40×20 a 120×100 mm, spessore 0,5–1 mm, impilabili fino a 50 mm di altezza. Le marcature eseguite dal laser in fibra da 20 o 30 W restano perfettamente leggibili anche in ambienti gravosi; particolarmente adatto all’incisione di metalli e all’ablazione dello strato superficiale.', es: 'El XENO 3 es un sistema láser integrado para marcar de forma permanente placas de metal y plástico (placas de características). La fuente del haz de fibra, la unidad de control y el área de trabajo se alojan en una envolvente conjunta de seguridad láser Clase 1; su diseño compacto es apto para el trabajo de sobremesa. Los cargadores intercambiables procesan distintos tamaños de placa: placas de 40×20 – 120×100 mm, de 0,5–1 mm de espesor, apilables hasta 50 mm de altura. Los marcajes realizados con el láser de fibra de 20 o 30 W permanecen claramente legibles incluso en entornos exigentes; especialmente indicado para el grabado en metal y la ablación de la capa superior.', de: 'Der XENO 3 ist ein integriertes Lasersystem zur dauerhaften Markierung von Metall- und Kunststoffplatten (Typenschildern). Faserstrahlquelle, Steuereinheit und Arbeitsbereich sind in einem gemeinsamen Lasersicherheitsgehäuse der Klasse 1 untergebracht; das kompakte Design eignet sich für den Desktop-Betrieb. Wechselbare Magazine verarbeiten unterschiedliche Plattengrößen: Platten 40×20 – 120×100 mm, 0,5–1 mm dick, stapelbar bis 50 mm Höhe. Markierungen des 20- oder 30-W-Faserlasers bleiben auch in rauen Umgebungen klar lesbar; besonders geeignet für Metallgravur und Deckschicht-Abtrag.', ko: 'XENO 3은 금속 및 플라스틱 플레이트(명판)의 영구 마킹을 위한 통합형 레이저 시스템입니다. 파이버 빔 소스, 컨트롤 유닛, 작업 영역이 하나의 Class 1 레이저 안전 인클로저에 통합되어 있으며, 컴팩트한 설계로 데스크톱 운용에 적합합니다. 교체형 매거진으로 다양한 플레이트 크기를 처리합니다: 플레이트 40×20 – 120×100 mm, 두께 0.5–1 mm, 적층 높이 최대 50 mm. 20 또는 30 W 파이버 레이저의 마킹은 거친 환경에서도 선명하게 판독 가능하며, 특히 금속 각인과 상부 레이어 제거에 적합합니다.', zh: 'XENO 3 是一套用于金属与塑料铭牌（型号牌）永久打标的集成式激光系统。光纤光束源、控制单元与工作区共同置于 1 类激光安全防护罩内；紧凑的设计适合桌面使用。可更换料匣可处理不同尺寸的铭牌：铭牌尺寸 40×20 – 120×100 mm，厚度 0.5–1 mm，堆叠高度最大 50 mm。20 或 30 W 光纤激光器的打标即使在恶劣环境下也能保持清晰可读；尤其适合金属雕刻与表层剥蚀。',
    },
    features: [
      { hu: 'Integrált táblajelölő rendszer (1. lézerosztály)', en: 'Integrated plate-marking system (Class 1)', it: 'Sistema integrato di marcatura di targhette (Classe 1)', es: 'Sistema integrado de marcaje de placas (Clase 1)', de: 'Integriertes Platten-Markiersystem (Klasse 1)', ko: '통합형 플레이트 마킹 시스템(Class 1)', zh: '集成式铭牌打标系统（1 类激光）' },
      { hu: '20 / 30 W fiber lézer', en: '20 / 30 W fiber laser', it: 'Laser in fibra da 20 / 30 W', es: 'Láser de fibra de 20 / 30 W', de: '20 / 30 W Faserlaser', ko: '20 / 30 W 파이버 레이저', zh: '20 / 30 W 光纤激光器' },
      { hu: 'Táblaméret 40×20 – 120×100 mm, 0,5–1 mm vastag', en: 'Plate size 40×20 – 120×100 mm, 0.5–1 mm thick', it: 'Formato targhetta 40×20 – 120×100 mm, spessore 0,5–1 mm', es: 'Tamaño de placa 40×20 – 120×100 mm, 0,5–1 mm de espesor', de: 'Plattengröße 40×20 – 120×100 mm, 0,5–1 mm dick', ko: '플레이트 크기 40×20 – 120×100 mm, 두께 0.5–1 mm', zh: '铭牌尺寸 40×20 – 120×100 mm，厚度 0.5–1 mm' },
      { hu: 'Cserélhető magazinok, akár 50 mm kötegmagasság', en: 'Replaceable magazines, up to 50 mm stack height', it: 'Caricatori intercambiabili, altezza pila fino a 50 mm', es: 'Cargadores intercambiables, hasta 50 mm de altura de pila', de: 'Wechselbare Magazine, bis 50 mm Stapelhöhe', ko: '교체형 매거진, 적층 높이 최대 50 mm', zh: '可更换料匣，堆叠高度最大 50 mm' },
      { hu: 'Tartós, jól olvasható jelölés zord környezetben', en: 'Durable, legible marking in harsh environments', it: 'Marcatura durevole e leggibile in ambienti gravosi', es: 'Marcaje duradero y legible en entornos exigentes', de: 'Dauerhafte, lesbare Markierung in rauen Umgebungen', ko: '거친 환경에서도 판독 가능한 내구성 있는 마킹', zh: '恶劣环境下依然持久清晰的打标' },
      { hu: 'cabLase szoftver, hálózati vezérlés', en: 'cabLase software, network control', it: 'Software cabLase, controllo in rete', es: 'Software cabLase, control en red', de: 'cabLase Software, Netzwerksteuerung', ko: 'cabLase 소프트웨어, 네트워크 제어', zh: 'cabLase 软件，网络控制' },
    ],
    image: '/images/products/cab-xeno-3.webp',
    datasheet: '/datasheets/cab-laser-xeno.pdf',
    videoId: 'b3xeRtxdFy8',
  },
  {
    slug: 'cab-lm-plus',
    category: 'lezer-gravirozok',
    name: 'CAB LM+',
    brand: 'CAB',
    short: {
      hu: 'Lézeres címke-jelölő és -vágó: különböző méretű címkék közvetlenül a tekercsről.',
      en: 'Laser label marker & cutter: various label sizes straight from the roll.', it: 'Marcatore e taglierina laser per etichette: formati diversi direttamente dal rotolo.', es: 'Marcador y cortador láser de etiquetas: distintos formatos de etiqueta directamente desde el rollo.', de: 'Laser-Etikettenmarkierer & -schneider: verschiedene Etikettengrößen direkt von der Rolle.', ko: '레이저 라벨 마커 & 커터: 롤에서 바로 다양한 크기의 라벨 제작.', zh: '激光标签打标与切割机：直接从卷料打标多种尺寸的标签。',
    },
    description: {
      hu: 'Az LM+ lézeres címke-jelölő (LabelMarker) különböző méretű címkéket jelöl és egy munkamenetben ki is vág közvetlenül a tekercsről — külön szerszám vagy stancszerszám nélkül. Minden gyakori, lézerrel jelölhető fóliaanyaggal működik; az anyagszélesség 25–120 mm, a címkemagasság max. 180 mm, a tekercs külső átmérője max. 300 mm (76 mm mag). A kész címkék az integrált vágókéssel egyenként leválaszthatók vagy opcionális külső felcsévélőre tekerhetők. Tipikus felhasználás: kábeljelölés, típustáblák, biztonsági és figyelmeztető címkék, VIN-címkék, leltár- és kalibrációs matricák. cabLase Editor 5 és cabLabelMarker szoftver.',
      en: 'The LM+ laser label marker (LabelMarker) precisely marks and, in a single pass, cuts labels of different sizes straight from the roll — without additional tools or dies. It works with all common laser-markable foil materials; material width 25–120 mm, label height up to 180 mm, roll outer diameter up to 300 mm (76 mm core). Finished labels can be separated with the integrated cutting blade or wound onto an optional external rewinder. Typical uses: cable marking, type plates, safety and warning labels, VIN labels, inventory and calibration stickers. cabLase Editor 5 and cabLabelMarker software.', it: 'Il marcatore laser per etichette LM+ (LabelMarker) marca con precisione e, in un unico passaggio, taglia etichette di formati diversi direttamente dal rotolo — senza utensili o fustelle aggiuntive. Funziona con tutti i comuni materiali in film marcabili a laser; larghezza materiale 25–120 mm, altezza etichetta fino a 180 mm, diametro esterno del rotolo fino a 300 mm (anima da 76 mm). Le etichette finite possono essere separate con la lama di taglio integrata oppure avvolte su un riavvolgitore esterno opzionale. Impieghi tipici: marcatura di cavi, targhette identificative, etichette di sicurezza e di avvertimento, etichette VIN, adesivi di inventario e di taratura. Software cabLase Editor 5 e cabLabelMarker.', es: 'El marcador láser de etiquetas LM+ (LabelMarker) marca con precisión y, en una sola pasada, corta etiquetas de distintos tamaños directamente desde el rollo, sin herramientas ni troqueles adicionales. Funciona con todos los materiales de lámina marcables por láser habituales; ancho de material de 25–120 mm, altura de etiqueta de hasta 180 mm, diámetro exterior de rollo de hasta 300 mm (mandril de 76 mm). Las etiquetas terminadas pueden separarse con la cuchilla de corte integrada o enrollarse en un rebobinador externo opcional. Usos típicos: marcaje de cables, placas de características, etiquetas de seguridad y advertencia, etiquetas VIN, adhesivos de inventario y calibración. Software cabLase Editor 5 y cabLabelMarker.', de: 'Der Laser-Etikettenmarkierer LM+ (LabelMarker) markiert präzise und schneidet in einem Durchgang Etiketten unterschiedlicher Größen direkt von der Rolle — ohne zusätzliche Werkzeuge oder Stanzen. Er verarbeitet alle gängigen lasermarkierbaren Folienmaterialien; Materialbreite 25–120 mm, Etikettenhöhe bis 180 mm, Rollenaußendurchmesser bis 300 mm (76-mm-Kern). Fertige Etiketten lassen sich mit der integrierten Schneidklinge trennen oder auf einen optionalen externen Aufwickler wickeln. Typische Anwendungen: Kabelkennzeichnung, Typenschilder, Sicherheits- und Warnetiketten, VIN-Etiketten, Inventar- und Kalibrieraufkleber. cabLase Editor 5 und cabLabelMarker Software.', ko: 'LM+ 레이저 라벨 마커(LabelMarker)는 별도의 공구나 금형 없이 롤에서 바로 다양한 크기의 라벨을 정밀하게 마킹하고 한 번의 패스로 컷팅합니다. 모든 일반 레이저 마킹용 포일 소재와 호환되며, 소재 폭 25–120 mm, 라벨 높이 최대 180 mm, 롤 외경 최대 300 mm(76 mm 코어)를 지원합니다. 완성된 라벨은 내장 커팅 블레이드로 분리하거나 옵션 외장 리와인더에 감을 수 있습니다. 대표적인 용도: 케이블 마킹, 명판, 안전·경고 라벨, VIN 라벨, 재물조사 및 교정 스티커. cabLase Editor 5 및 cabLabelMarker 소프트웨어.', zh: 'LM+ 激光标签打标机（LabelMarker）可直接从卷料上精确打标并在一次作业中切割不同尺寸的标签——无需额外工具或模具。兼容所有常见的可激光打标薄膜材料；材料宽度 25–120 mm，标签高度最大 180 mm，卷料外径最大 300 mm（76 mm 卷芯）。成品标签可用集成切刀分离，或卷绕到可选的外部回卷器上。典型应用：线缆标识、型号牌、安全与警示标签、VIN 标签、资产与校准标贴。附 cabLase Editor 5 与 cabLabelMarker 软件。',
    },
    features: [
      { hu: 'Címkék jelölése ÉS vágása egy menetben', en: 'Marks AND cuts labels in one pass', it: 'Marca E taglia le etichette in un unico passaggio', es: 'Marca Y corta etiquetas en una sola pasada', de: 'Markiert UND schneidet Etiketten in einem Durchgang', ko: '한 번의 패스로 라벨 마킹과 컷팅 동시 수행', zh: '一次作业完成标签打标与切割' },
      { hu: 'Anyagszélesség 25–120 mm, címkemagasság max. 180 mm', en: 'Material width 25–120 mm, label height up to 180 mm', it: 'Larghezza materiale 25–120 mm, altezza etichetta fino a 180 mm', es: 'Ancho de material 25–120 mm, altura de etiqueta hasta 180 mm', de: 'Materialbreite 25–120 mm, Etikettenhöhe bis 180 mm', ko: '소재 폭 25–120 mm, 라벨 높이 최대 180 mm', zh: '材料宽度 25–120 mm，标签高度最大 180 mm' },
      { hu: 'Tekercsről, max. 300 mm külső átmérő (76 mm mag)', en: 'From the roll, up to 300 mm outer diameter (76 mm core)', it: 'Dal rotolo, fino a 300 mm di diametro esterno (anima da 76 mm)', es: 'Desde el rollo, hasta 300 mm de diámetro exterior (mandril de 76 mm)', de: 'Von der Rolle, bis 300 mm Außendurchmesser (76-mm-Kern)', ko: '롤에서 바로, 외경 최대 300 mm(76 mm 코어)', zh: '直接从卷料打标，外径最大 300 mm（76 mm 卷芯）' },
      { hu: 'Integrált vágókés vagy opcionális felcsévélő', en: 'Integrated cutter or optional rewinder', it: 'Taglierina integrata o riavvolgitore opzionale', es: 'Cuchilla integrada o rebobinador opcional', de: 'Integrierter Schneider oder optionaler Aufwickler', ko: '내장 커터 또는 옵션 리와인더', zh: '集成切刀或可选回卷器' },
      { hu: 'Nincs szükség stanc- vagy egyéb szerszámra', en: 'No dies or additional tooling needed', it: 'Nessuna fustella o attrezzatura aggiuntiva necessaria', es: 'Sin troqueles ni utillaje adicional', de: 'Keine Stanzen oder zusätzlichen Werkzeuge nötig', ko: '금형이나 추가 공구 불필요', zh: '无需模具或额外工装' },
      { hu: '1. lézerosztály, cabLase szoftver', en: 'Class 1, cabLase software', it: 'Classe 1, software cabLase', es: 'Clase 1, software cabLase', de: 'Klasse 1, cabLase Software', ko: 'Class 1, cabLase 소프트웨어', zh: '1 类激光，cabLase 软件' },
    ],
    image: '/images/products/cab-lm-plus.webp',
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
      en: 'Class-1 laser marking station for series production, with XENO 4.', it: 'Stazione di marcatura laser in Classe 1 per la produzione in serie, con XENO 4.', es: 'Estación de marcaje láser Clase 1 para producción en serie, con XENO 4.', de: 'Lasermarkierstation der Klasse 1 für die Serienproduktion, mit XENO 4.', ko: 'XENO 4를 탑재한 양산용 Class 1 레이저 마킹 스테이션.', zh: '面向批量生产的 1 类激光打标工作站，搭载 XENO 4。',
    },
    description: {
      hu: 'Az LSG+100E lézerbiztonsági jelölőállomás ipari megoldás alkatrészek sorozatjelölésére a XENO 4 fiber lézerrel. Robusztus fémkialakítás nagy, 980×460×980 mm-es munkatérrel; a 19"-os rackben elfér a lézerforrás és egy ipari PC is. Motoros ajtó (<2 s nyitás/zárás), 440 mm löketű Z-tengely, 0,02 mm pozicionálási pontosság, akár 50 kg munkadarabsúly. 1. lézerosztályú, CE-jóváhagyással.',
      en: 'The LSG+100E laser safety housing is an industrial solution for series marking of parts with the XENO 4 fiber laser. Rugged metal design with a large 980×460×980 mm work area; the 19" rack fits the beam source and an industrial PC. Motor-driven door (<2 s open/close), a 440 mm-stroke Z-axis, 0.02 mm positioning accuracy and up to 50 kg workpiece weight. Class 1, CE approved.', it: 'La cabina di sicurezza laser LSG+100E è una soluzione industriale per la marcatura in serie di pezzi con il laser in fibra XENO 4. Struttura metallica robusta con un ampio piano di lavoro da 980×460×980 mm; il rack da 19" alloggia la sorgente del fascio e un PC industriale. Porta motorizzata (apertura/chiusura <2 s), asse Z con corsa di 440 mm, precisione di posizionamento di 0,02 mm e peso del pezzo fino a 50 kg. Classe 1, omologata CE.', es: 'La envolvente de seguridad láser LSG+100E es una solución industrial para el marcaje en serie de piezas con el láser de fibra XENO 4. Construcción metálica robusta con una amplia área de trabajo de 980×460×980 mm; el rack de 19" aloja la fuente del haz y un PC industrial. Puerta motorizada (apertura/cierre en <2 s), eje Z con 440 mm de recorrido, precisión de posicionamiento de 0,02 mm y hasta 50 kg de peso de pieza. Clase 1, homologada CE.', de: 'Das Lasersicherheitsgehäuse LSG+100E ist eine Industrielösung für die Serienmarkierung von Teilen mit dem Faserlaser XENO 4. Robuste Metallkonstruktion mit großem Arbeitsbereich von 980×460×980 mm; das 19"-Rack nimmt die Strahlquelle und einen Industrie-PC auf. Motorische Tür (<2 s Öffnen/Schließen), Z-Achse mit 440 mm Hub, 0,02 mm Positioniergenauigkeit und bis zu 50 kg Werkstückgewicht. Klasse 1, CE-zugelassen.', ko: 'LSG+100E 레이저 안전 하우징은 XENO 4 파이버 레이저로 부품을 연속 마킹하기 위한 산업용 솔루션입니다. 980×460×980 mm의 넓은 작업 영역을 갖춘 견고한 금속 설계이며, 19" 랙에 빔 소스와 산업용 PC를 장착할 수 있습니다. 전동 도어(개폐 2초 미만), 440 mm 스트로크 Z축, 0.02 mm 위치 정밀도, 최대 50 kg의 공작물 중량을 지원합니다. Class 1, CE 인증.', zh: 'LSG+100E 激光安全防护罩是使用 XENO 4 光纤激光器批量打标零件的工业解决方案。坚固的金属结构，工作区域达 980×460×980 mm；19" 机架可容纳光束源与工业 PC。电动门（开/关小于 2 秒）、440 mm 行程 Z 轴、0.02 mm 定位精度，工件重量最大 50 kg。1 类激光，通过 CE 认证。',
    },
    features: [
      { hu: '1. lézerosztályú ipari jelölőállomás', en: 'Class-1 industrial marking station', it: 'Stazione di marcatura industriale in Classe 1', es: 'Estación de marcaje industrial Clase 1', de: 'Industrielle Markierstation der Klasse 1', ko: 'Class 1 산업용 마킹 스테이션', zh: '1 类激光工业打标工作站' },
      { hu: 'Sorozatjelölés XENO 4-gyel', en: 'Series marking with XENO 4', it: 'Marcatura in serie con XENO 4', es: 'Marcaje en serie con XENO 4', de: 'Serienmarkierung mit XENO 4', ko: 'XENO 4를 이용한 연속 마킹', zh: '使用 XENO 4 进行批量打标' },
      { hu: 'Munkatér 980×460×980 mm, Z-löket 440 mm', en: 'Work area 980×460×980 mm, Z-stroke 440 mm', it: 'Piano di lavoro 980×460×980 mm, corsa Z 440 mm', es: 'Área de trabajo 980×460×980 mm, recorrido Z 440 mm', de: 'Arbeitsbereich 980×460×980 mm, Z-Hub 440 mm', ko: '작업 영역 980×460×980 mm, Z 스트로크 440 mm', zh: '工作区域 980×460×980 mm，Z 轴行程 440 mm' },
      { hu: 'Motoros ajtó, 0,02 mm pozicionálás', en: 'Motor-driven door, 0.02 mm positioning', it: 'Porta motorizzata, posizionamento a 0,02 mm', es: 'Puerta motorizada, posicionamiento de 0,02 mm', de: 'Motorische Tür, 0,02 mm Positionierung', ko: '전동 도어, 0.02 mm 위치 정밀도', zh: '电动门，0.02 mm 定位精度' },
      { hu: '19"-os rack a lézerforrásnak és ipari PC-nek', en: '19" rack for laser source & industrial PC', it: 'Rack da 19" per sorgente laser e PC industriale', es: 'Rack de 19" para la fuente láser y el PC industrial', de: '19"-Rack für Strahlquelle & Industrie-PC', ko: '레이저 소스 및 산업용 PC용 19" 랙', zh: '19" 机架容纳激光源与工业 PC' },
    ],
    image: '/images/products/cab-lsg100-plus.webp',
    datasheet: '/datasheets/cab-laser-xeno.pdf',
  },
  {
    slug: 'cab-af5',
    category: 'fust-es-porelszivok',
    name: 'CAB AF5',
    brand: 'CAB',
    short: {
      hu: 'Elszívó- és szűrőrendszer a lézeres jelöléshez — védi a kezelőt és az optikát.',
      en: 'Extraction and filter system for laser marking — protects operator and optics.', it: 'Sistema di aspirazione e filtrazione per la marcatura laser — protegge operatore e ottiche.', es: 'Sistema de aspiración y filtración para marcaje láser — protege al operario y a la óptica.', de: 'Absaug- und Filtersystem für die Lasermarkierung — schützt Bediener und Optik.', ko: '레이저 마킹용 집진·필터 시스템 — 작업자와 광학계를 보호합니다.', zh: '激光打标用抽排过滤系统——保护操作人员与光学部件。',
    },
    description: {
      hu: 'Az AF5 elszívó- és szűrőberendezés a lézeres jelölés során keletkező mérgező port és gázt szívja el, védve a kezelő egészségét, valamint a jelölőteret és a lencsét a szennyeződéstől — így a lézer teljesítménye is megmarad. Nagy teljesítményű turbina szívja el a levegőt rugalmas tömlőn át; a port az elő- és a szálló-por-szűrő (H13) választja le, a gázokat aktívszén-szűrő köti meg, a tisztított levegő visszakerül a környezetbe. Moduláris felépítés, egyszerű szűrőcsere. Szívóteljesítmény akár 230 m³/h. A XENO rendszerek és az LSG+100E tartozéka.',
      en: 'The AF5 extraction and filter device removes the toxic dust and gases generated during laser marking, protecting the operator’s health as well as the marking area and lens from contamination — so laser power is maintained. A high-performance turbine extracts the air through a flexible hose; dust is separated by the pre-filter and the H13 suspended-particle filter, gases are absorbed by the active-carbon filter, and cleaned air is returned to the environment. Modular design with easy filter replacement. Suction power up to 230 m³/h. An accessory for the XENO systems and the LSG+100E.', it: 'Il dispositivo di aspirazione e filtrazione AF5 rimuove le polveri e i gas tossici generati durante la marcatura laser, proteggendo la salute dell’operatore così come l’area di marcatura e la lente dalla contaminazione — mantenendo così la potenza del laser. Una turbina ad alte prestazioni aspira l’aria attraverso un tubo flessibile; la polvere viene separata dal prefiltro e dal filtro a particelle sospese H13, i gas vengono assorbiti dal filtro a carboni attivi e l’aria depurata viene restituita all’ambiente. Struttura modulare con facile sostituzione dei filtri. Potenza di aspirazione fino a 230 m³/h. Accessorio per i sistemi XENO e per la LSG+100E.', es: 'El equipo de aspiración y filtración AF5 elimina el polvo y los gases tóxicos generados durante el marcaje láser, protegiendo tanto la salud del operario como el área de marcaje y la lente frente a la contaminación, de modo que se mantiene la potencia del láser. Una turbina de altas prestaciones aspira el aire a través de una manguera flexible; el polvo se separa mediante el prefiltro y el filtro de partículas en suspensión H13, los gases se absorben en el filtro de carbón activo y el aire limpio se devuelve al ambiente. Diseño modular con un cambio de filtro sencillo. Capacidad de aspiración de hasta 230 m³/h. Accesorio para los sistemas XENO y la LSG+100E.', de: 'Das Absaug- und Filtergerät AF5 entfernt die bei der Lasermarkierung entstehenden giftigen Stäube und Gase und schützt so die Gesundheit des Bedieners sowie Markierbereich und Linse vor Verschmutzung — die Laserleistung bleibt erhalten. Eine Hochleistungsturbine saugt die Luft über einen flexiblen Schlauch ab; Staub wird vom Vorfilter und dem H13-Schwebstofffilter abgeschieden, Gase absorbiert der Aktivkohlefilter, und die gereinigte Luft wird an die Umgebung zurückgeführt. Modulares Design mit einfachem Filterwechsel. Saugleistung bis 230 m³/h. Ein Zubehör für die XENO-Systeme und das LSG+100E.', ko: 'AF5 집진·필터 장치는 레이저 마킹 중 발생하는 유해 분진과 가스를 제거하여 작업자의 건강은 물론 마킹 영역과 렌즈를 오염으로부터 보호하고 레이저 출력을 유지합니다. 고성능 터빈이 플렉시블 호스를 통해 공기를 흡입하며, 분진은 프리 필터와 H13 부유 입자 필터로 분리되고 가스는 활성탄 필터에 흡착된 후 정화된 공기가 다시 배출됩니다. 필터 교체가 쉬운 모듈식 설계입니다. 흡입 성능 최대 230 m³/h. XENO 시스템 및 LSG+100E용 액세서리입니다.', zh: 'AF5 抽排过滤装置可清除激光打标过程中产生的有毒粉尘与气体，既保护操作人员的健康，也防止打标区域与透镜受到污染——从而保持激光功率。高性能涡轮通过柔性软管抽取空气；粉尘由预过滤器和 H13 悬浮颗粒过滤器分离，气体由活性炭过滤器吸附，净化后的空气返回环境。模块化设计，滤芯更换方便。抽风量最高 230 m³/h。是 XENO 系统与 LSG+100E 的配件。',
    },
    features: [
      { hu: 'Elszívás és többfokozatú szűrés', en: 'Extraction and multi-stage filtration', it: 'Aspirazione e filtrazione a più stadi', es: 'Aspiración y filtración multietapa', de: 'Absaugung und mehrstufige Filtration', ko: '집진 및 다단계 여과', zh: '抽排与多级过滤' },
      { hu: 'Szívóteljesítmény akár 230 m³/h', en: 'Suction power up to 230 m³/h', it: 'Potenza di aspirazione fino a 230 m³/h', es: 'Capacidad de aspiración de hasta 230 m³/h', de: 'Saugleistung bis 230 m³/h', ko: '흡입 성능 최대 230 m³/h', zh: '抽风量最高 230 m³/h' },
      { hu: 'Elő-, H13 szálló-por- és aktívszén-szűrő', en: 'Pre-, H13 suspended-particle and active-carbon filter', it: 'Prefiltro, filtro a particelle sospese H13 e filtro a carboni attivi', es: 'Prefiltro, filtro de partículas en suspensión H13 y filtro de carbón activo', de: 'Vor-, H13-Schwebstoff- und Aktivkohlefilter', ko: '프리 필터, H13 부유 입자 필터 및 활성탄 필터', zh: '预过滤器、H13 悬浮颗粒过滤器与活性炭过滤器' },
      { hu: 'Moduláris, egyszerű szűrőcsere', en: 'Modular, easy filter replacement', it: 'Modulare, facile sostituzione dei filtri', es: 'Modular, con cambio de filtro sencillo', de: 'Modular, einfacher Filterwechsel', ko: '모듈식, 간편한 필터 교체', zh: '模块化设计，滤芯更换方便' },
      { hu: 'Védi a kezelő egészségét és az optikát', en: 'Protects operator health and optics', it: 'Protegge la salute dell’operatore e le ottiche', es: 'Protege la salud del operario y la óptica', de: 'Schützt Bedienergesundheit und Optik', ko: '작업자 건강 및 광학계 보호', zh: '保护操作人员健康与光学部件' },
      { hu: 'XENO rendszerekhez és LSG+100E-hez', en: 'For XENO systems and the LSG+100E', it: 'Per i sistemi XENO e la LSG+100E', es: 'Para los sistemas XENO y la LSG+100E', de: 'Für XENO-Systeme und das LSG+100E', ko: 'XENO 시스템 및 LSG+100E용', zh: '适用于 XENO 系统与 LSG+100E' },
    ],
    image: '/images/products/cab-af5.webp',
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
      en: 'cab label design and printing software with full device control.', it: 'Software cab per la progettazione e la stampa di etichette con controllo completo dei dispositivi.', es: 'Software cab de diseño e impresión de etiquetas con control total del equipo.', de: 'cab Software für Etikettengestaltung und -druck mit voller Gerätesteuerung.', ko: '장비를 완전하게 제어하는 cab 라벨 디자인 및 인쇄 소프트웨어.', zh: 'cab 标签设计与打印软件，具备完整的设备控制功能。',
    },
    description: {
      hu: 'A cablabel S3 a cab saját címketervező szoftvere: WYSIWYG szerkesztő, adatbázis-kapcsolat és a cab nyomtatók, print & apply rendszerek és lézerek teljes körű vezérlése egy felületről.',
      en: 'cablabel S3 is cab’s own label design software: a WYSIWYG editor, database connectivity and full control of cab printers, print & apply systems and lasers from a single interface.', it: 'cablabel S3 è il software di progettazione etichette proprietario di cab: un editor WYSIWYG, connettività ai database e il controllo completo di stampanti, sistemi stampa e applica e laser cab da un’unica interfaccia.', es: 'cablabel S3 es el software propio de diseño de etiquetas de cab: un editor WYSIWYG, conectividad con bases de datos y control total de las impresoras, los sistemas de imprimir y aplicar y los láseres cab desde una única interfaz.', de: 'cablabel S3 ist die hauseigene Etikettensoftware von cab: WYSIWYG-Editor, Datenbankanbindung und volle Steuerung von cab Druckern, Print-and-Apply-Systemen und Lasern über eine einzige Oberfläche.', ko: 'cablabel S3는 cab의 자체 라벨 디자인 소프트웨어입니다. WYSIWYG 에디터, 데이터베이스 연결, 그리고 단일 인터페이스에서 cab 프린터, 프린트 & 어플라이 시스템, 레이저를 완전하게 제어합니다.', zh: 'cablabel S3 是 cab 自主开发的标签设计软件：WYSIWYG 编辑器、数据库连接，并可在单一界面中全面控制 cab 打印机、打印贴标系统与激光器。',
    },
    features: [
      { hu: 'WYSIWYG címketervező', en: 'WYSIWYG label editor', it: 'Editor di etichette WYSIWYG', es: 'Editor de etiquetas WYSIWYG', de: 'WYSIWYG-Etiketteneditor', ko: 'WYSIWYG 라벨 에디터', zh: 'WYSIWYG 标签编辑器' },
      { hu: 'Adatbázis-kapcsolat', en: 'Database connectivity', it: 'Connettività ai database', es: 'Conectividad con bases de datos', de: 'Datenbankanbindung', ko: '데이터베이스 연결', zh: '数据库连接' },
      { hu: 'Nyomtató, print & apply és lézer vezérlés', en: 'Controls printers, print & apply and lasers', it: 'Controlla stampanti, sistemi stampa e applica e laser', es: 'Controla impresoras, sistemas de imprimir y aplicar y láseres', de: 'Steuert Drucker, Print & Apply und Laser', ko: '프린터, 프린트 & 어플라이 시스템, 레이저 제어', zh: '控制打印机、打印贴标系统与激光器' },
      { hu: 'Több kiadásban', en: 'Available in multiple editions', it: 'Disponibile in più edizioni', es: 'Disponible en varias ediciones', de: 'In mehreren Editionen erhältlich', ko: '다양한 에디션으로 제공', zh: '提供多种版本' },
    ],
    datasheet: '/datasheets/cab-cablabel-s3.pdf',
    download: 'https://www.cab.de/media/pushfile.cfm?file=2227',
  },
  {
    slug: 'nicelabel',
    category: 'szoftverek',
    name: 'NiceLabel',
    brand: 'Loftware',
    image: '/images/brand/loftware-logo.png',
    brandLogo: '/images/brand/loftware-logo.png',
    download: 'https://www.loftware.com/products/labeling/nicelabel-designer/trial-download',
    downloadLabel: {
      hu: 'Ingyenes 30 napos próbaverzió',
      en: 'Free 30-day trial', de: 'Kostenlose 30-Tage-Testversion', it: 'Prova gratuita di 30 giorni', es: 'Prueba gratuita de 30 días', ko: '30일 무료 체험판', zh: '30 天免费试用',
    },
    short: {
      hu: 'A világ egyik legelterjedtebb címketervező és -nyomtató szoftvere a Loftware-től.',
      en: 'One of the world’s most widely used label design and printing software, by Loftware.', it: 'Uno dei software di progettazione e stampa di etichette più diffusi al mondo, di Loftware.', es: 'Uno de los software de diseño e impresión de etiquetas más utilizados del mundo, de Loftware.', de: 'Eine der weltweit meistgenutzten Softwarelösungen für Etikettengestaltung und -druck, von Loftware.', ko: 'Loftware가 제공하는, 세계에서 가장 널리 사용되는 라벨 디자인 및 인쇄 소프트웨어 중 하나.', zh: '全球使用最广泛的标签设计与打印软件之一，由 Loftware 出品。',
    },
    description: {
      hu: 'A NiceLabel — ma a Loftware része — a világ egyik legelterjedtebb címketervező és -nyomtató szoftvere. WYSIWYG tervezőjével gyorsan készíthetők professzionális címkék: minden gyakori 1D és 2D vonalkód (EAN, Code 128, GS1-128, QR, DataMatrix stb.), változó adatok, sorszámozás és adatbázis-kapcsolat (Excel, SQL) támogatott, több ezer nyomtatómodellhez saját illesztőprogrammal. Nyomtatási űrlapokkal a felhasználók hibamentesen, kattintásra nyomtathatnak. Az egyszerű asztali tervezőtől a felhőalapú, vállalati szintű címkekezelő rendszerekig számos verzióban érhető el — kérjen ajánlatot, és segítünk kiválasztani az igényeinek megfelelő kiadást.',
      en: 'NiceLabel — now part of Loftware — is one of the world’s most widely used label design and printing software. Its WYSIWYG designer builds professional labels fast: every common 1D and 2D barcode (EAN, Code 128, GS1-128, QR, DataMatrix etc.), variable data, serialization and database connectivity (Excel, SQL) are supported, with native drivers for thousands of printer models. Print forms let operators print error-free with a single click. It is available in many editions, from the simple desktop designer to cloud-based, enterprise-grade label management systems — request a quote and we will help you choose the right one.', it: 'NiceLabel — oggi parte di Loftware — è uno dei software di progettazione e stampa di etichette più diffusi al mondo. Il suo designer WYSIWYG consente di creare rapidamente etichette professionali: sono supportati tutti i comuni codici a barre 1D e 2D (EAN, Code 128, GS1-128, QR, DataMatrix ecc.), dati variabili, serializzazione e connettività ai database (Excel, SQL), con driver nativi per migliaia di modelli di stampante. Le maschere di stampa permettono agli operatori di stampare senza errori con un solo clic. È disponibile in numerose edizioni, dal semplice designer desktop ai sistemi di label management cloud di livello enterprise — richieda un preventivo e la aiuteremo a scegliere quello giusto.', es: 'NiceLabel — ahora parte de Loftware — es uno de los software de diseño e impresión de etiquetas más utilizados del mundo. Su diseñador WYSIWYG permite crear etiquetas profesionales rápidamente: admite todos los códigos de barras 1D y 2D habituales (EAN, Code 128, GS1-128, QR, DataMatrix, etc.), datos variables, serialización y conectividad con bases de datos (Excel, SQL), con controladores nativos para miles de modelos de impresora. Los formularios de impresión permiten al operario imprimir sin errores con un solo clic. Está disponible en numerosas ediciones, desde el sencillo diseñador de escritorio hasta sistemas de gestión de etiquetas en la nube de nivel empresarial: solicite un presupuesto y le ayudaremos a elegir la adecuada.', de: 'NiceLabel — heute Teil von Loftware — ist eine der weltweit meistgenutzten Softwarelösungen für Etikettengestaltung und -druck. Der WYSIWYG-Designer erstellt schnell professionelle Etiketten: Alle gängigen 1D- und 2D-Barcodes (EAN, Code 128, GS1-128, QR, DataMatrix usw.), variable Daten, Serialisierung und Datenbankanbindung (Excel, SQL) werden unterstützt, mit nativen Treibern für Tausende Druckermodelle. Druckmasken lassen Bediener mit einem Klick fehlerfrei drucken. Erhältlich in vielen Editionen, vom einfachen Desktop-Designer bis zu cloudbasierten Label-Management-Systemen für Unternehmen — fordern Sie ein Angebot an, wir helfen bei der Auswahl der passenden Edition.', ko: 'NiceLabel은 — 현재 Loftware 소속 — 세계에서 가장 널리 사용되는 라벨 디자인 및 인쇄 소프트웨어 중 하나입니다. WYSIWYG 디자이너로 전문적인 라벨을 빠르게 제작할 수 있습니다. 모든 일반 1D 및 2D 바코드(EAN, Code 128, GS1-128, QR, DataMatrix 등), 가변 데이터, 시리얼라이제이션, 데이터베이스 연결(Excel, SQL)을 지원하며 수천 종의 프린터 모델용 네이티브 드라이버를 제공합니다. 인쇄 폼을 사용하면 작업자가 클릭 한 번으로 오류 없이 인쇄할 수 있습니다. 간단한 데스크톱 디자이너부터 클라우드 기반의 엔터프라이즈급 라벨 관리 시스템까지 다양한 에디션이 있으며, 견적을 요청하시면 적합한 제품 선택을 도와드립니다.', zh: 'NiceLabel——现已归属 Loftware——是全球使用最广泛的标签设计与打印软件之一。其 WYSIWYG 设计器可快速制作专业标签：支持所有常见的一维与二维条码（EAN、Code 128、GS1-128、QR、DataMatrix 等）、可变数据、序列化与数据库连接（Excel、SQL），并为数千种打印机型号提供原生驱动。打印表单让操作人员一键即可无差错打印。产品提供多种版本，从简单的桌面设计器到基于云的企业级标签管理系统——欢迎询价，我们将帮助您选择合适的版本。',
    },
    features: [
      { hu: 'WYSIWYG címketervezés, minden gyakori 1D/2D vonalkód', en: 'WYSIWYG label design, every common 1D/2D barcode', it: 'Progettazione etichette WYSIWYG, tutti i comuni codici a barre 1D/2D', es: 'Diseño de etiquetas WYSIWYG, todos los códigos de barras 1D/2D habituales', de: 'WYSIWYG-Etikettengestaltung, alle gängigen 1D-/2D-Barcodes', ko: 'WYSIWYG 라벨 디자인, 모든 일반 1D/2D 바코드', zh: 'WYSIWYG 标签设计，支持所有常见一维/二维条码' },
      { hu: 'Adatbázis-kapcsolat (Excel, SQL) és változó adatok', en: 'Database connectivity (Excel, SQL) and variable data', it: 'Connettività ai database (Excel, SQL) e dati variabili', es: 'Conectividad con bases de datos (Excel, SQL) y datos variables', de: 'Datenbankanbindung (Excel, SQL) und variable Daten', ko: '데이터베이스 연결(Excel, SQL) 및 가변 데이터', zh: '数据库连接（Excel、SQL）与可变数据' },
      { hu: 'Több ezer nyomtatómodell natív támogatása', en: 'Native support for thousands of printer models', it: 'Supporto nativo per migliaia di modelli di stampante', es: 'Compatibilidad nativa con miles de modelos de impresora', de: 'Native Unterstützung für Tausende Druckermodelle', ko: '수천 종의 프린터 모델 네이티브 지원', zh: '原生支持数千种打印机型号' },
      { hu: 'Nyomtatási űrlapok a hibamentes nyomtatáshoz', en: 'Print forms for error-free printing', it: 'Maschere di stampa per una stampa senza errori', es: 'Formularios de impresión para imprimir sin errores', de: 'Druckmasken für fehlerfreies Drucken', ko: '오류 없는 인쇄를 위한 인쇄 폼', zh: '打印表单确保无差错打印' },
      { hu: 'Az asztali tervezőtől a vállalati címkekezelésig', en: 'From desktop designer to enterprise label management', it: 'Dal designer desktop al label management enterprise', es: 'Desde el diseñador de escritorio hasta la gestión de etiquetas empresarial', de: 'Vom Desktop-Designer bis zum Enterprise-Label-Management', ko: '데스크톱 디자이너부터 엔터프라이즈 라벨 관리까지', zh: '从桌面设计器到企业级标签管理' },
      { hu: 'Segítünk a megfelelő verzió kiválasztásában', en: 'We help you choose the right edition', it: 'La aiutiamo a scegliere l’edizione giusta', es: 'Le ayudamos a elegir la edición adecuada', de: 'Wir helfen bei der Auswahl der passenden Edition', ko: '적합한 에디션 선택을 지원합니다', zh: '我们帮助您选择合适的版本' },
    ],
  },
  {
    slug: 'egyedi-szoftverfejlesztes',
    category: 'szoftverek',
    name: 'Egyedi szoftverfejlesztés',
    displayName: { hu: 'Egyedi szoftverfejlesztés', en: 'Custom software development', de: 'Individuelle Softwareentwicklung', it: 'Sviluppo software su misura', es: 'Desarrollo de software a medida', ko: '맞춤형 소프트웨어 개발', zh: '定制软件开发' },
    brand: 'Blueway Trade',
    image: '/images/products/egyedi-szoftver.webp',
    short: {
      hu: 'Egyedi szoftverek tervezése és kivitelezése az Ön folyamataira szabva.',
      en: 'Custom software designed and built around your processes.', it: 'Software su misura, progettato e sviluppato attorno ai suoi processi.', es: 'Software a medida diseñado y desarrollado en torno a sus procesos.', de: 'Individuelle Software, entworfen und entwickelt rund um Ihre Prozesse.', ko: '귀사의 프로세스에 맞춰 설계하고 구축하는 맞춤형 소프트웨어.', zh: '围绕您的流程设计与开发的定制软件。',
    },
    description: {
      hu: 'Egyedi szoftverek tervezését és kivitelezését vállaljuk — a címkézési és jelölési munkafolyamatok automatizálásától az adatbázis- és rendszerintegrációig, teljesen az Ön igényeire szabva.',
      en: 'We design and build custom software — from automating labeling and marking workflows to database and system integration, tailored entirely to your needs.', it: 'Progettiamo e sviluppiamo software su misura — dall’automazione dei flussi di lavoro di etichettatura e marcatura all’integrazione con database e sistemi, interamente adattato alle sue esigenze.', es: 'Diseñamos y desarrollamos software a medida, desde la automatización de flujos de trabajo de etiquetado y marcaje hasta la integración con bases de datos y sistemas, adaptado por completo a sus necesidades.', de: 'Wir entwerfen und entwickeln individuelle Software — von der Automatisierung von Etikettier- und Markierabläufen bis zur Datenbank- und Systemintegration, ganz auf Ihre Anforderungen zugeschnitten.', ko: '라벨링 및 마킹 워크플로 자동화부터 데이터베이스 및 시스템 통합까지, 귀사의 요구에 전적으로 맞춘 맞춤형 소프트웨어를 설계하고 구축합니다.', zh: '我们设计并开发定制软件——从贴标与打标流程自动化到数据库与系统集成，完全按照您的需求量身打造。',
    },
    features: [
      { hu: 'Igény szerinti fejlesztés', en: 'Development to your requirements', it: 'Sviluppo secondo le sue specifiche', es: 'Desarrollo según sus requisitos', de: 'Entwicklung nach Ihren Anforderungen', ko: '요구 사항에 맞춘 개발', zh: '按您的需求开发' },
      { hu: 'Munkafolyamat-automatizálás', en: 'Workflow automation', it: 'Automazione dei flussi di lavoro', es: 'Automatización de flujos de trabajo', de: 'Workflow-Automatisierung', ko: '워크플로 자동화', zh: '工作流程自动化' },
      { hu: 'Adatbázis- és rendszerintegráció', en: 'Database and system integration', it: 'Integrazione con database e sistemi', es: 'Integración con bases de datos y sistemas', de: 'Datenbank- und Systemintegration', ko: '데이터베이스 및 시스템 통합', zh: '数据库与系统集成' },
      { hu: 'Címke- és jelölésvezérlés', en: 'Label and marking control', it: 'Controllo di etichettatura e marcatura', es: 'Control de etiquetado y marcaje', de: 'Etiketten- und Markiersteuerung', ko: '라벨 및 마킹 제어', zh: '标签与打标控制' },
    ],
  },

  // ——— POSTEK — címkenyomtató sorozatok ———
  {
    slug: 'postek-ox',
    category: 'cimkenyomtatok',
    name: 'POSTEK OX',
    brand: 'POSTEK',
    image: '/images/products/postek-ox.webp',
    videoId: '3WoA_Zb9zb4',
    extraVideos: [
      {
        videoId: 'bEGEA6W-omo',
        label: {
          hu: 'Automata fej nyitás és nyomás állítás',
          en: 'Automatic head opening and pressure adjustment', it: 'Apertura automatica della testina e regolazione della pressione', es: 'Apertura automática del cabezal y ajuste de la presión', de: 'Automatische Kopföffnung und Anpressdruck-Justierung', ko: '자동 헤드 개방 및 압력 조정', zh: '自动打印头开合与压力调节',
        },
      },
    ],
    datasheet: '/datasheets/postek-ox-datasheet.pdf',
    short: {
      hu: 'Ipari csúcskategóriás nyomtató integrált vizuális ellenőrzéssel és RFID-vel.',
      en: 'Flagship industrial printer with integrated visual verification and RFID.', it: 'Stampante industriale di punta con verifica visiva integrata e RFID.', es: 'Impresora industrial insignia con verificación visual integrada y RFID.', de: 'Flaggschiff-Industriedrucker mit integrierter visueller Verifizierung und RFID.', ko: '통합 비주얼 검증과 RFID를 갖춘 플래그십 산업용 프린터.', zh: '旗舰级工业打印机，集成视觉检测与 RFID。',
    },
    description: {
      hu: 'A POSTEK OX sorozat a kínálat csúcsa: 200/300/600 dpi, akár 18 ips sebesség, négymagos processzor, 4,5"-es érintőkijelző és integrált vizuális ellenőrzés, amely 1D/2D vonalkódokat minősít ANSI/ISO szerint. Opcionális RFID- és verifikációs csomagok. Modellek: OX2, OX3, OX6 (+ OX218/OX318, RFID: OXr).',
      en: 'The POSTEK OX series is the top of the range: 200/300/600 dpi, up to 18 ips, a quad-core processor, a 4.5" touchscreen and integrated visual verification that grades 1D/2D barcodes to ANSI/ISO. Optional RFID and verification packages. Models: OX2, OX3, OX6 (+ OX218/OX318, RFID: OXr).', it: 'La serie POSTEK OX è il vertice della gamma: 200/300/600 dpi, fino a 18 ips, processore quad-core, touchscreen da 4,5" e verifica visiva integrata che classifica i codici a barre 1D/2D secondo ANSI/ISO. Pacchetti RFID e di verifica opzionali. Modelli: OX2, OX3, OX6 (+ OX218/OX318, RFID: OXr).', es: 'La serie POSTEK OX es la gama más alta: 200/300/600 dpi, hasta 18 ips, un procesador de cuatro núcleos, una pantalla táctil de 4,5" y verificación visual integrada que clasifica los códigos de barras 1D/2D según ANSI/ISO. Paquetes opcionales de RFID y de verificación. Modelos: OX2, OX3, OX6 (+ OX218/OX318, RFID: OXr).', de: 'Die POSTEK OX-Serie ist die Spitze des Sortiments: 200/300/600 dpi, bis zu 18 ips, Quad-Core-Prozessor, 4,5"-Touchscreen und integrierte visuelle Verifizierung, die 1D-/2D-Barcodes nach ANSI/ISO bewertet. Optionale RFID- und Verifizierungspakete. Modelle: OX2, OX3, OX6 (+ OX218/OX318, RFID: OXr).', ko: 'POSTEK OX 시리즈는 최상위 라인업입니다. 200/300/600 dpi, 최대 18 ips, 쿼드코어 프로세서, 4.5" 터치스크린, 그리고 1D/2D 바코드를 ANSI/ISO 기준으로 등급 판정하는 통합 비주얼 검증 기능을 갖추었습니다. 옵션으로 RFID 및 검증 패키지를 제공합니다. 모델: OX2, OX3, OX6(+ OX218/OX318, RFID: OXr).', zh: 'POSTEK OX 系列是产品线中的旗舰：200/300/600 dpi，最高 18 ips，四核处理器，4.5" 触摸屏，以及可按 ANSI/ISO 标准对一维/二维条码进行等级评定的集成视觉检测。可选 RFID 与检测套件。型号：OX2、OX3、OX6（另有 OX218/OX318，RFID 版：OXr）。',
    },
    features: [
      { hu: '200 / 300 / 600 dpi', en: '200 / 300 / 600 dpi', it: '200 / 300 / 600 dpi', es: '200 / 300 / 600 dpi', de: '200 / 300 / 600 dpi', ko: '200 / 300 / 600 dpi', zh: '200 / 300 / 600 dpi' },
      { hu: 'Akár 18 ips sebesség', en: 'Up to 18 ips', it: 'Fino a 18 ips', es: 'Hasta 18 ips', de: 'Bis zu 18 ips', ko: '최대 18 ips', zh: '最高 18 ips' },
      { hu: 'Integrált 1D/2D vizuális ellenőrzés', en: 'Integrated 1D/2D visual verification', it: 'Verifica visiva 1D/2D integrata', es: 'Verificación visual 1D/2D integrada', de: 'Integrierte visuelle 1D-/2D-Verifizierung', ko: '통합 1D/2D 비주얼 검증', zh: '集成一维/二维视觉检测' },
      { hu: '4,5" érintőkijelző', en: '4.5" touchscreen', it: 'Touchscreen da 4,5"', es: 'Pantalla táctil de 4,5"', de: '4,5"-Touchscreen', ko: '4.5" 터치스크린', zh: '4.5" 触摸屏' },
      { hu: 'Opcionális RFID', en: 'Optional RFID', it: 'RFID opzionale', es: 'RFID opcional', de: 'Optionales RFID', ko: '옵션 RFID', zh: '可选 RFID' },
    ],
  },
  {
    slug: 'postek-tx',
    category: 'cimkenyomtatok',
    name: 'POSTEK TX',
    brand: 'POSTEK',
    image: '/images/products/postek-tx.webp',
    videoId: 'qAcJTzTMTnI',
    datasheet: '/datasheets/postek-tx-datasheet.pdf',
    short: {
      hu: 'Valódi ipari nyomtató HEAT™ technológiával, nagy terhelhetőséghez.',
      en: 'True industrial printer with HEAT™ technology for heavy-duty use.', it: 'Vera stampante industriale con tecnologia HEAT™ per impieghi gravosi.', es: 'Auténtica impresora industrial con tecnología HEAT™ para uso intensivo.', de: 'Echter Industriedrucker mit HEAT™-Technologie für den harten Dauereinsatz.', ko: '고부하 사용을 위한 HEAT™ 기술의 진정한 산업용 프린터.', zh: '搭载 HEAT™ 技术的真正工业级打印机，适合重载使用。',
    },
    description: {
      hu: 'A POSTEK TX sorozat valódi ipari nyomtató: 64-bites négymagos processzor, HEAT™ nyomtatási algoritmus és ADAPT™ ±0,5 mm-es anyagpozicionálás. Direkt termál és termotranszfer mód. Modellek: TX2r (203 dpi, 16 ips), TX3r (300 dpi, 12 ips), TX6r (600 dpi).',
      en: 'The POSTEK TX series is a true industrial printer: a 64-bit quad-core processor, the HEAT™ printing algorithm and ADAPT™ media positioning to ±0.5 mm. Direct thermal and thermal transfer. Models: TX2r (203 dpi, 16 ips), TX3r (300 dpi, 12 ips), TX6r (600 dpi).', it: 'La serie POSTEK TX è una vera stampante industriale: processore quad-core a 64 bit, algoritmo di stampa HEAT™ e posizionamento del materiale ADAPT™ a ±0,5 mm. Termico diretto e trasferimento termico. Modelli: TX2r (203 dpi, 16 ips), TX3r (300 dpi, 12 ips), TX6r (600 dpi).', es: 'La serie POSTEK TX es una auténtica impresora industrial: un procesador de cuatro núcleos de 64 bits, el algoritmo de impresión HEAT™ y el posicionamiento de material ADAPT™ de ±0,5 mm. Térmico directo y transferencia térmica. Modelos: TX2r (203 dpi, 16 ips), TX3r (300 dpi, 12 ips), TX6r (600 dpi).', de: 'Die POSTEK TX-Serie ist ein echter Industriedrucker: 64-Bit-Quad-Core-Prozessor, der HEAT™-Druckalgorithmus und ADAPT™-Materialpositionierung auf ±0,5 mm. Thermodirekt- und Thermotransferdruck. Modelle: TX2r (203 dpi, 16 ips), TX3r (300 dpi, 12 ips), TX6r (600 dpi).', ko: 'POSTEK TX 시리즈는 진정한 산업용 프린터입니다. 64비트 쿼드코어 프로세서, HEAT™ 인쇄 알고리즘, ±0.5 mm 정밀도의 ADAPT™ 미디어 포지셔닝을 갖추었습니다. 감열 및 열전사 방식을 지원합니다. 모델: TX2r(203 dpi, 16 ips), TX3r(300 dpi, 12 ips), TX6r(600 dpi).', zh: 'POSTEK TX 系列是真正的工业级打印机：64 位四核处理器、HEAT™ 打印算法以及可将介质定位精度控制在 ±0.5 mm 的 ADAPT™ 技术。支持热敏与热转印。型号：TX2r（203 dpi，16 ips）、TX3r（300 dpi，12 ips）、TX6r（600 dpi）。',
    },
    features: [
      { hu: '203 / 300 / 600 dpi modellek', en: '203 / 300 / 600 dpi models', it: 'Modelli 203 / 300 / 600 dpi', es: 'Modelos de 203 / 300 / 600 dpi', de: '203 / 300 / 600 dpi Modelle', ko: '203 / 300 / 600 dpi 모델', zh: '203 / 300 / 600 dpi 型号' },
      { hu: 'HEAT™ nyomtatási minőség', en: 'HEAT™ print quality', it: 'Qualità di stampa HEAT™', es: 'Calidad de impresión HEAT™', de: 'HEAT™-Druckqualität', ko: 'HEAT™ 인쇄 품질', zh: 'HEAT™ 打印品质' },
      { hu: 'ADAPT™ ±0,5 mm pozicionálás', en: 'ADAPT™ ±0.5 mm positioning', it: 'Posizionamento ADAPT™ ±0,5 mm', es: 'Posicionamiento ADAPT™ de ±0,5 mm', de: 'ADAPT™ ±0,5 mm Positionierung', ko: 'ADAPT™ ±0.5 mm 포지셔닝', zh: 'ADAPT™ ±0.5 mm 定位' },
      { hu: '4,5" színes érintőkijelző', en: '4.5" color touchscreen', it: 'Touchscreen a colori da 4,5"', es: 'Pantalla táctil en color de 4,5"', de: '4,5"-Farb-Touchscreen', ko: '4.5" 컬러 터치스크린', zh: '4.5" 彩色触摸屏' },
      { hu: 'Direkt termál és termotranszfer', en: 'Direct thermal & thermal transfer', it: 'Termico diretto e trasferimento termico', es: 'Térmico directo y transferencia térmica', de: 'Thermodirekt- & Thermotransferdruck', ko: '감열 & 열전사', zh: '热敏与热转印' },
    ],
  },
  {
    slug: 'postek-gx',
    category: 'cimkenyomtatok',
    name: 'POSTEK GX',
    brand: 'POSTEK',
    image: '/images/products/postek-gx.webp',
    videoId: 'XcnaxfjbTwc',
    datasheet: '/datasheets/postek-gx-datasheet.pdf',
    short: {
      hu: 'Asztali kivitel ipari teljesítménnyel, kompakt helyigénnyel.',
      en: 'Desktop format with industrial performance in a compact footprint.', it: 'Formato desktop con prestazioni industriali in uno spazio ridotto.', es: 'Formato de sobremesa con prestaciones industriales en unas dimensiones reducidas.', de: 'Desktop-Format mit Industrieleistung auf kompakter Stellfläche.', ko: '컴팩트한 설치 면적에 산업용 성능을 담은 데스크톱 포맷.', zh: '桌面尺寸，工业性能，占地紧凑。',
    },
    description: {
      hu: 'A POSTEK GX sorozat asztali méretben hozza az ipari teljesítményt: 4,5"-es érintőkijelző, nagy pontosságú anyagpozicionálás, direkt termál és termotranszfer. Modellek: GX2 (203 dpi, 10 ips), GX3 (300 dpi, 8 ips), GX6 (600 dpi, 5 ips), opcionális RFID (GXr).',
      en: 'The POSTEK GX series brings industrial performance in a desktop size: a 4.5" touchscreen, high-precision media positioning, direct thermal and thermal transfer. Models: GX2 (203 dpi, 10 ips), GX3 (300 dpi, 8 ips), GX6 (600 dpi, 5 ips), optional RFID (GXr).', it: 'La serie POSTEK GX porta prestazioni industriali in formato desktop: touchscreen da 4,5", posizionamento del materiale ad alta precisione, termico diretto e trasferimento termico. Modelli: GX2 (203 dpi, 10 ips), GX3 (300 dpi, 8 ips), GX6 (600 dpi, 5 ips), RFID opzionale (GXr).', es: 'La serie POSTEK GX ofrece prestaciones industriales en un tamaño de sobremesa: una pantalla táctil de 4,5", posicionamiento de material de alta precisión, térmico directo y transferencia térmica. Modelos: GX2 (203 dpi, 10 ips), GX3 (300 dpi, 8 ips), GX6 (600 dpi, 5 ips), RFID opcional (GXr).', de: 'Die POSTEK GX-Serie bringt Industrieleistung im Desktop-Format: 4,5"-Touchscreen, hochpräzise Materialpositionierung, Thermodirekt- und Thermotransferdruck. Modelle: GX2 (203 dpi, 10 ips), GX3 (300 dpi, 8 ips), GX6 (600 dpi, 5 ips), optionales RFID (GXr).', ko: 'POSTEK GX 시리즈는 데스크톱 크기에 산업용 성능을 제공합니다. 4.5" 터치스크린, 고정밀 미디어 포지셔닝, 감열 및 열전사 방식을 지원합니다. 모델: GX2(203 dpi, 10 ips), GX3(300 dpi, 8 ips), GX6(600 dpi, 5 ips), 옵션 RFID(GXr).', zh: 'POSTEK GX 系列以桌面尺寸带来工业级性能：4.5" 触摸屏、高精度介质定位，支持热敏与热转印。型号：GX2（203 dpi，10 ips）、GX3（300 dpi，8 ips）、GX6（600 dpi，5 ips），可选 RFID（GXr）。',
    },
    features: [
      { hu: 'Kompakt asztali kivitel', en: 'Compact desktop format', it: 'Formato desktop compatto', es: 'Formato de sobremesa compacto', de: 'Kompaktes Desktop-Format', ko: '컴팩트 데스크톱 포맷', zh: '紧凑桌面尺寸' },
      { hu: '203 / 300 / 600 dpi modellek', en: '203 / 300 / 600 dpi models', it: 'Modelli 203 / 300 / 600 dpi', es: 'Modelos de 203 / 300 / 600 dpi', de: '203 / 300 / 600 dpi Modelle', ko: '203 / 300 / 600 dpi 모델', zh: '203 / 300 / 600 dpi 型号' },
      { hu: '4,5" érintőkijelző', en: '4.5" touchscreen', it: 'Touchscreen da 4,5"', es: 'Pantalla táctil de 4,5"', de: '4,5"-Touchscreen', ko: '4.5" 터치스크린', zh: '4.5" 触摸屏' },
      { hu: 'Nagy pontosságú pozicionálás', en: 'High-precision positioning', it: 'Posizionamento ad alta precisione', es: 'Posicionamiento de alta precisión', de: 'Hochpräzise Positionierung', ko: '고정밀 포지셔닝', zh: '高精度定位' },
      { hu: 'Opcionális RFID', en: 'Optional RFID', it: 'RFID opzionale', es: 'RFID opcional', de: 'Optionales RFID', ko: '옵션 RFID', zh: '可选 RFID' },
    ],
  },
  {
    slug: 'postek-c168',
    category: 'cimkenyomtatok',
    name: 'POSTEK C168',
    brand: 'POSTEK',
    image: '/images/products/postek-c168.webp',
    datasheet: '/datasheets/postek-c168-datasheet.pdf',
    short: {
      hu: 'Kereskedelmi asztali nyomtató egyszerű, mindennapi címkézéshez.',
      en: 'Commercial desktop printer for simple, everyday labeling.', it: 'Stampante desktop commerciale per l’etichettatura quotidiana più semplice.', es: 'Impresora comercial de sobremesa para el etiquetado sencillo del día a día.', de: 'Kommerzieller Desktop-Drucker für die einfache, tägliche Etikettierung.', ko: '간편한 일상 라벨링을 위한 상업용 데스크톱 프린터.', zh: '面向日常简单标签打印的商用桌面打印机。',
    },
    description: {
      hu: 'A POSTEK C168 sorozat kompakt, tartós kereskedelmi asztali nyomtató: egyrészes váz, megbízható mechanika és minőségi nyomtatófejek. Direkt termál és termotranszfer, 4" nyomtatási szélességig. Modellek: C168/200s (203 dpi, 4 ips), C168/300s (300 dpi, 3 ips).',
      en: 'The POSTEK C168 series is a compact, durable commercial desktop printer: a one-piece chassis, reliable mechanics and high-end printheads. Direct thermal and thermal transfer, up to 4" print width. Models: C168/200s (203 dpi, 4 ips), C168/300s (300 dpi, 3 ips).', it: 'La serie POSTEK C168 è una stampante desktop commerciale compatta e durevole: telaio monoblocco, meccanica affidabile e testine di stampa di alta gamma. Termico diretto e trasferimento termico, larghezza di stampa fino a 4". Modelli: C168/200s (203 dpi, 4 ips), C168/300s (300 dpi, 3 ips).', es: 'La serie POSTEK C168 es una impresora comercial de sobremesa compacta y duradera: chasis de una sola pieza, mecánica fiable y cabezales de impresión de gama alta. Térmico directo y transferencia térmica, hasta 4" de ancho de impresión. Modelos: C168/200s (203 dpi, 4 ips), C168/300s (300 dpi, 3 ips).', de: 'Die POSTEK C168-Serie ist ein kompakter, langlebiger kommerzieller Desktop-Drucker: einteiliges Chassis, zuverlässige Mechanik und hochwertige Druckköpfe. Thermodirekt- und Thermotransferdruck, bis zu 4" Druckbreite. Modelle: C168/200s (203 dpi, 4 ips), C168/300s (300 dpi, 3 ips).', ko: 'POSTEK C168 시리즈는 컴팩트하고 내구성 있는 상업용 데스크톱 프린터입니다. 일체형 섀시, 신뢰성 있는 메커니즘, 고급 프린트 헤드를 갖추었습니다. 감열 및 열전사 방식, 최대 4" 인쇄 폭을 지원합니다. 모델: C168/200s(203 dpi, 4 ips), C168/300s(300 dpi, 3 ips).', zh: 'POSTEK C168 系列是紧凑耐用的商用桌面打印机：一体式机身、可靠的机械结构与高端打印头。支持热敏与热转印，打印宽度最大 4"。型号：C168/200s（203 dpi，4 ips）、C168/300s（300 dpi，3 ips）。',
    },
    features: [
      { hu: 'Kompakt, egyrészes váz', en: 'Compact one-piece chassis', it: 'Telaio monoblocco compatto', es: 'Chasis compacto de una sola pieza', de: 'Kompaktes einteiliges Chassis', ko: '컴팩트 일체형 섀시', zh: '紧凑的一体式机身' },
      { hu: '203 / 300 dpi modellek', en: '203 / 300 dpi models', it: 'Modelli 203 / 300 dpi', es: 'Modelos de 203 / 300 dpi', de: '203 / 300 dpi Modelle', ko: '203 / 300 dpi 모델', zh: '203 / 300 dpi 型号' },
      { hu: '4" nyomtatási szélességig', en: 'Up to 4" print width', it: 'Larghezza di stampa fino a 4"', es: 'Hasta 4" de ancho de impresión', de: 'Bis zu 4" Druckbreite', ko: '최대 4" 인쇄 폭', zh: '打印宽度最大 4"' },
      { hu: 'Direkt termál és termotranszfer', en: 'Direct thermal & thermal transfer', it: 'Termico diretto e trasferimento termico', es: 'Térmico directo y transferencia térmica', de: 'Thermodirekt- & Thermotransferdruck', ko: '감열 & 열전사', zh: '热敏与热转印' },
      { hu: 'RS-232 és USB', en: 'RS-232 & USB', it: 'RS-232 e USB', es: 'RS-232 y USB', de: 'RS-232 & USB', ko: 'RS-232 & USB', zh: 'RS-232 与 USB' },
    ],
  },

  // ——— TYKMA Electrox — lézeres jelölő- és gravírozórendszerek ———
  {
    slug: 'tykma-minilase',
    category: 'lezer-gravirozok',
    name: 'TYKMA Minilase',
    brand: 'Tykma Electrox',
    image: '/images/products/tykma-minilase.webp',
    datasheet: '/datasheets/tykma-electrox-brochure.pdf',
    short: {
      hu: 'Asztali Class 1 fiber lézerjelölő — gyors, karbantartásmentes, nagy darabszámhoz.',
      en: 'Benchtop Class 1 fiber laser marker — fast, maintenance-free, for high volumes.', it: 'Marcatore laser in fibra da banco in Classe 1 — rapido, esente da manutenzione, per grandi volumi.', es: 'Marcador láser de fibra de sobremesa Clase 1 — rápido, sin mantenimiento, para grandes volúmenes.', de: 'Faserlaser-Markiergerät der Klasse 1 als Tischgerät — schnell, wartungsfrei, für hohe Stückzahlen.', ko: '벤치탑 Class 1 파이버 레이저 마커 — 빠르고 유지보수가 필요 없는 대량 생산용.', zh: '台式 1 类光纤激光打标机——快速、免维护，适合大批量生产。',
    },
    description: {
      hu: 'A Minilase kompakt, Class 1 asztali fiber lézerjelölő rendszer, amelyet nagy darabszámú gyártáshoz terveztek. Háromoldalas, pneumatikus függőleges ajtó szabadalmaztatott biztonsági rendszerrel, léghűtéses, karbantartásmentes fiber lézerforrás. Az „Easy" üzemmódban az ajtózárás–jelölés–ajtónyitás sorozat automatikus. Motoros fókuszmagasság-állítás beépített fókuszkeresővel; opcionális forgatóegység 360°-os palástjelöléshez.',
      en: 'The Minilase is a compact Class 1 benchtop fiber laser marking system built for high-volume production. A three-sided pneumatic vertical door with a patented safety system, and an air-cooled, maintenance-free fiber laser source. In Easy mode the door-close / mark / door-open sequence is automated. Motorised focal-height adjustment with a built-in focus finder; an optional rotary device enables 360° radial marking.', it: 'Il Minilase è un sistema compatto di marcatura laser in fibra da banco in Classe 1, realizzato per la produzione ad alti volumi. Porta verticale pneumatica su tre lati con sistema di sicurezza brevettato e sorgente laser in fibra raffreddata ad aria ed esente da manutenzione. In modalità Easy la sequenza chiusura porta / marcatura / apertura porta è automatizzata. Regolazione motorizzata dell’altezza focale con cercatore di fuoco integrato; un dispositivo rotativo opzionale consente la marcatura radiale a 360°.', es: 'El Minilase es un sistema compacto de marcaje láser de fibra de sobremesa Clase 1 construido para la producción de grandes volúmenes. Puerta vertical neumática de tres lados con un sistema de seguridad patentado y una fuente láser de fibra refrigerada por aire y sin mantenimiento. En el modo Easy, la secuencia de cierre de puerta, marcaje y apertura está automatizada. Ajuste motorizado de la altura focal con buscador de foco integrado; un dispositivo rotativo opcional permite el marcaje radial de 360°.', de: 'Der Minilase ist ein kompaktes Faserlaser-Markiersystem der Klasse 1 als Tischgerät, gebaut für die Produktion hoher Stückzahlen. Dreiseitige pneumatische Vertikaltür mit patentiertem Sicherheitssystem und luftgekühlte, wartungsfreie Faserlaserquelle. Im Easy-Modus läuft die Sequenz Tür schließen / Markieren / Tür öffnen automatisiert ab. Motorische Fokushöhenverstellung mit integriertem Fokusfinder; eine optionale Dreheinrichtung ermöglicht radiales 360°-Markieren.', ko: 'Minilase는 대량 생산을 위해 제작된 컴팩트한 Class 1 벤치탑 파이버 레이저 마킹 시스템입니다. 특허받은 안전 시스템을 갖춘 3면 공압식 수직 도어와 공랭식·무보수 파이버 레이저 소스를 채택했습니다. Easy 모드에서는 도어 닫힘 / 마킹 / 도어 열림 시퀀스가 자동으로 진행됩니다. 내장 포커스 파인더와 함께 전동식 초점 높이 조정을 제공하며, 옵션 로터리 장치로 360° 원주 마킹이 가능합니다.', zh: 'Minilase 是一款紧凑型 1 类台式光纤激光打标系统，专为大批量生产打造。三面气动升降门配专利安全系统，风冷免维护光纤激光源。在 Easy 模式下，关门/打标/开门流程自动完成。电动焦距调节配内置焦点定位器；可选旋转装置可实现 360° 径向打标。',
    },
    features: [
      { hu: 'Class 1 — nyílt térben is biztonságos', en: 'Class 1 — safe in an open environment', it: 'Classe 1 — sicuro in ambiente aperto', es: 'Clase 1: seguro en un entorno abierto', de: 'Klasse 1 — sicher in offener Umgebung', ko: 'Class 1 — 개방 환경에서도 안전', zh: '1 类激光——开放环境下安全使用' },
      { hu: 'MOPA fiber lézer, 20 / 50 W', en: 'MOPA fiber laser, 20 / 50 W', it: 'Laser in fibra MOPA, 20 / 50 W', es: 'Láser de fibra MOPA, 20 / 50 W', de: 'MOPA-Faserlaser, 20 / 50 W', ko: 'MOPA 파이버 레이저, 20 / 50 W', zh: 'MOPA 光纤激光器，20 / 50 W' },
      { hu: 'Automatikus pneumatikus ajtó', en: 'Automatic pneumatic door', it: 'Porta pneumatica automatica', es: 'Puerta neumática automática', de: 'Automatische pneumatische Tür', ko: '자동 공압식 도어', zh: '自动气动门' },
      { hu: 'Léghűtéses, karbantartásmentes', en: 'Air-cooled, maintenance-free', it: 'Raffreddato ad aria, esente da manutenzione', es: 'Refrigerado por aire, sin mantenimiento', de: 'Luftgekühlt, wartungsfrei', ko: '공랭식, 유지보수 불필요', zh: '风冷，免维护' },
      { hu: 'Beépített fókuszkereső', en: 'Built-in focus finder', it: 'Cercatore di fuoco integrato', es: 'Buscador de foco integrado', de: 'Integrierter Fokusfinder', ko: '내장 포커스 파인더', zh: '内置焦点定位器' },
      { hu: '36 hónap garancia', en: '36-month warranty', it: 'Garanzia di 36 mesi', es: 'Garantía de 36 meses', de: '36 Monate Garantie', ko: '36개월 보증', zh: '36 个月保修' },
    ],
  },
  {
    slug: 'tykma-minilase-xl',
    category: 'lezer-gravirozok',
    name: 'TYKMA Minilase XL',
    brand: 'Tykma Electrox',
    image: '/images/products/tykma-minilase-xl.webp',
    datasheet: '/datasheets/tykma-electrox-brochure.pdf',
    short: {
      hu: 'Nagyobb, nyitott munkaterű fiber lézerjelölő — akár Class 4 üzemmódban is.',
      en: 'Larger, open-interior fiber laser marker — with optional Class 4 operation.', it: 'Marcatore laser in fibra più grande, a interno aperto — con funzionamento opzionale in Classe 4.', es: 'Marcador láser de fibra de mayor tamaño y de interior abierto — con funcionamiento opcional en Clase 4.', de: 'Größerer Faserlaser-Markierer mit offenem Innenraum — mit optionalem Klasse-4-Betrieb.', ko: '더 크고 내부가 개방된 파이버 레이저 마커 — 옵션으로 Class 4 운용 가능.', zh: '更大的开放式内腔光纤激光打标机——可选 4 类激光运行模式。',
    },
    description: {
      hu: 'A Minilase XL a Minilase család legnagyobb munkaterű, nyitott belsejű asztali tagja — akár 508 mm széles alkatrészek jelöléséhez. A szervizkulccsal és figyelmeztető lámpával Class 4 (nyitott ajtós) jelölés is lehetséges. Automatikus üzemmód, motoros fókuszmagasság-állítás (opcionálisan programozható), többféle lézertípussal (fiber akár 100 W-ig) rendelhető.',
      en: 'The Minilase XL is the largest, open-interior benchtop member of the Minilase line — for marking parts up to 508 mm wide. With a service key and warning light, Class 4 (open-door) marking is also possible. Automatic mode, motorised focal-height adjustment (optionally programmable), available with a variety of laser types (fiber up to 100 W).', it: 'Il Minilase XL è il modello da banco a interno aperto più grande della linea Minilase — per la marcatura di pezzi fino a 508 mm di larghezza. Con chiave di servizio e lampada di segnalazione è possibile anche la marcatura in Classe 4 (a porta aperta). Modalità automatica, regolazione motorizzata dell’altezza focale (opzionalmente programmabile), disponibile con diversi tipi di laser (fibra fino a 100 W).', es: 'El Minilase XL es el miembro de sobremesa de interior abierto más grande de la línea Minilase, para marcar piezas de hasta 508 mm de ancho. Con una llave de servicio y una luz de advertencia también es posible el marcaje en Clase 4 (con la puerta abierta). Modo automático, ajuste motorizado de la altura focal (opcionalmente programable) y disponible con distintos tipos de láser (fibra de hasta 100 W).', de: 'Der Minilase XL ist das größte Tischgerät der Minilase-Linie mit offenem Innenraum — zum Markieren von Teilen bis 508 mm Breite. Mit Serviceschlüssel und Warnleuchte ist auch Klasse-4-Markierung (bei offener Tür) möglich. Automatikmodus, motorische Fokushöhenverstellung (optional programmierbar), erhältlich mit verschiedenen Lasertypen (Faser bis 100 W).', ko: 'Minilase XL은 Minilase 라인 중 가장 크고 내부가 개방된 벤치탑 모델로, 최대 508 mm 폭의 부품을 마킹할 수 있습니다. 서비스 키와 경고등을 사용하면 Class 4(도어 개방) 마킹도 가능합니다. 자동 모드, 전동식 초점 높이 조정(옵션으로 프로그래밍 가능)을 제공하며 다양한 레이저 유형(파이버 최대 100 W)으로 선택할 수 있습니다.', zh: 'Minilase XL 是 Minilase 产品线中尺寸最大、内腔开放的台式机型——可打标最宽 508 mm 的零件。借助服务钥匙与警示灯，还可进行 4 类（开门）打标。自动模式，电动焦距调节（可选编程控制），提供多种激光器类型（光纤最高 100 W）。',
    },
    features: [
      { hu: 'Tág, nyitott munkatér', en: 'Large, open working area', it: 'Ampia area di lavoro aperta', es: 'Amplia área de trabajo abierta', de: 'Großer, offener Arbeitsbereich', ko: '넓고 개방된 작업 영역', zh: '宽敞的开放式工作区域' },
      { hu: 'MOPA fiber lézer, 20–100 W', en: 'MOPA fiber laser, 20–100 W', it: 'Laser in fibra MOPA, 20–100 W', es: 'Láser de fibra MOPA, 20–100 W', de: 'MOPA-Faserlaser, 20–100 W', ko: 'MOPA 파이버 레이저, 20–100 W', zh: 'MOPA 光纤激光器，20–100 W' },
      { hu: 'Opcionális Class 4 üzemmód', en: 'Optional Class 4 operation', it: 'Funzionamento opzionale in Classe 4', es: 'Funcionamiento opcional en Clase 4', de: 'Optionaler Klasse-4-Betrieb', ko: '옵션 Class 4 운용', zh: '可选 4 类激光运行模式' },
      { hu: 'Programozható fókusz opció', en: 'Programmable focus option', it: 'Opzione fuoco programmabile', es: 'Opción de foco programable', de: 'Programmierbare Fokusoption', ko: '프로그래밍 가능한 포커스 옵션', zh: '可编程焦距选项' },
      { hu: 'Léghűtéses, karbantartásmentes', en: 'Air-cooled, maintenance-free', it: 'Raffreddato ad aria, esente da manutenzione', es: 'Refrigerado por aire, sin mantenimiento', de: 'Luftgekühlt, wartungsfrei', ko: '공랭식, 유지보수 불필요', zh: '风冷，免维护' },
      { hu: '36 hónap garancia', en: '36-month warranty', it: 'Garanzia di 36 mesi', es: 'Garantía de 36 meses', de: '36 Monate Garantie', ko: '36개월 보증', zh: '36 个月保修' },
    ],
  },
  {
    slug: 'tykma-vereo',
    category: 'lezer-gravirozok',
    name: 'TYKMA Vereo',
    brand: 'Tykma Electrox',
    image: '/images/products/tykma-vereo.webp',
    datasheet: '/datasheets/tykma-electrox-brochure.pdf',
    short: {
      hu: 'Kompakt fiber integrációs lézer gyártósorokba és munkacellákba.',
      en: 'Compact fiber integration laser for production lines and work cells.', it: 'Laser in fibra compatto da integrazione per linee di produzione e celle di lavoro.', es: 'Láser de fibra de integración compacto para líneas de producción y células de trabajo.', de: 'Kompakter Faser-Integrationslaser für Produktionslinien und Arbeitszellen.', ko: '생산 라인 및 워크셀을 위한 컴팩트 파이버 통합형 레이저.', zh: '面向生产线与工作单元的紧凑型光纤集成激光器。',
    },
    description: {
      hu: 'A Vereo ultrakompakt, robusztus, marógépi alumíniumházas jelölőfejjel szerelt fiber integrációs lézer, amelyet automatizált gyártósorokba és egyedi zárt terekbe való beépítésre terveztek. Léghűtéses, karbantartásmentes fiber forrás; egyszerű USB-kapcsolat PC-hez, dedikált I/O és menet közbeni („marking on the fly") jelölés.',
      en: 'The Vereo is a fiber integration laser with an ultra-compact, robust machined-aluminium marking head, designed for integration into automated production lines and custom enclosures. An air-cooled, maintenance-free fiber source; a simple USB connection to a PC, dedicated I/O and marking on the fly.', it: 'Il Vereo è un laser in fibra da integrazione con testa di marcatura ultracompatta e robusta in alluminio lavorato, progettato per l’integrazione in linee di produzione automatizzate e in cabine personalizzate. Sorgente in fibra raffreddata ad aria ed esente da manutenzione; semplice collegamento USB a un PC, I/O dedicati e marcatura al volo.', es: 'El Vereo es un láser de fibra de integración con un cabezal de marcaje ultracompacto y robusto, mecanizado en aluminio, diseñado para su integración en líneas de producción automatizadas y envolventes a medida. Fuente de fibra refrigerada por aire y sin mantenimiento; una sencilla conexión USB a un PC, E/S dedicadas y marcaje al vuelo.', de: 'Der Vereo ist ein Faser-Integrationslaser mit ultrakompaktem, robustem Markierkopf aus gefrästem Aluminium, konzipiert für die Integration in automatisierte Produktionslinien und kundenspezifische Gehäuse. Luftgekühlte, wartungsfreie Faserquelle; einfache USB-Verbindung zum PC, dedizierte I/O und Marking on the fly.', ko: 'Vereo는 초소형의 견고한 절삭 가공 알루미늄 마킹 헤드를 갖춘 파이버 통합형 레이저로, 자동화 생산 라인과 맞춤형 인클로저에 통합하도록 설계되었습니다. 공랭식·무보수 파이버 소스, PC와의 간편한 USB 연결, 전용 I/O, 온더플라이 마킹을 지원합니다.', zh: 'Vereo 是一款光纤集成激光器，配备超紧凑、坚固的机加工铝制打标头，专为集成到自动化生产线与定制防护罩中而设计。风冷免维护光纤光源；通过简单的 USB 连接 PC，配备专用 I/O，支持飞行打标。',
    },
    features: [
      { hu: 'Ultrakompakt jelölőfej', en: 'Ultra-compact marking head', it: 'Testa di marcatura ultracompatta', es: 'Cabezal de marcaje ultracompacto', de: 'Ultrakompakter Markierkopf', ko: '초소형 마킹 헤드', zh: '超紧凑打标头' },
      { hu: 'MOPA fiber lézerforrás', en: 'MOPA fiber laser source', it: 'Sorgente laser in fibra MOPA', es: 'Fuente láser de fibra MOPA', de: 'MOPA-Faserlaserquelle', ko: 'MOPA 파이버 레이저 소스', zh: 'MOPA 光纤激光源' },
      { hu: 'Gyártósori integrációra tervezve', en: 'Designed for line integration', it: 'Progettato per l’integrazione in linea', es: 'Diseñado para la integración en línea', de: 'Konzipiert für Linienintegration', ko: '라인 통합을 위한 설계', zh: '专为产线集成设计' },
      { hu: 'Dedikált I/O, marking on the fly', en: 'Dedicated I/O, marking on the fly', it: 'I/O dedicati, marcatura al volo', es: 'E/S dedicadas, marcaje al vuelo', de: 'Dedizierte I/O, Marking on the fly', ko: '전용 I/O, 온더플라이 마킹', zh: '专用 I/O，支持飞行打标' },
      { hu: 'Léghűtéses, karbantartásmentes', en: 'Air-cooled, maintenance-free', it: 'Raffreddato ad aria, esente da manutenzione', es: 'Refrigerado por aire, sin mantenimiento', de: 'Luftgekühlt, wartungsfrei', ko: '공랭식, 유지보수 불필요', zh: '风冷，免维护' },
    ],
  },
  {
    slug: 'tykma-vereo-smart',
    category: 'lezer-gravirozok',
    name: 'TYKMA Vereo Smart',
    brand: 'Tykma Electrox',
    image: '/images/products/tykma-vereo-smart.webp',
    datasheet: '/datasheets/tykma-electrox-brochure.pdf',
    short: {
      hu: 'Integrációs lézer PC nélkül — érintőképernyő és vezérlés bármely eszközről.',
      en: 'Integration laser without a PC — touchscreen and control from any device.', it: 'Laser da integrazione senza PC — touchscreen e controllo da qualsiasi dispositivo.', es: 'Láser de integración sin PC — pantalla táctil y control desde cualquier dispositivo.', de: 'Integrationslaser ohne PC — Touchscreen und Steuerung von jedem Gerät.', ko: 'PC가 필요 없는 통합형 레이저 — 터치스크린과 모든 기기에서의 제어.', zh: '无需 PC 的集成激光器——触摸屏操作，任意设备均可控制。',
    },
    description: {
      hu: 'A Vereo Smart integrációs lézer beépített vezérlővel önálló, PC nélküli működésre képes: a jelölőprogramokat a fedélzeti tárolón tartja. Előlapi érintőképernyő, hálózati csatlakozás és plug-and-play interfész a gyakori PLC-márkákhoz. A saját fejlesztésű felületről a lézer bármely eszközről (PC, tablet, telefon, PLC) vezérelhető és felügyelhető — szoftvertelepítés nélkül.',
      en: 'The Vereo Smart integration laser can run standalone with no PC thanks to an integrated controller: marking programs are kept in on-board storage. A front touchscreen interface, network connectivity and a plug-and-play interface for common PLC brands. Its proprietary interface lets you control and monitor the laser from any device (PC, tablet, phone, PLC) — with no software to install.', it: 'Il laser da integrazione Vereo Smart può funzionare in autonomia senza PC grazie a un controller integrato: i programmi di marcatura sono conservati nella memoria di bordo. Interfaccia touchscreen frontale, connettività di rete e interfaccia plug-and-play per i marchi di PLC più diffusi. La sua interfaccia proprietaria consente di controllare e monitorare il laser da qualsiasi dispositivo (PC, tablet, smartphone, PLC) — senza alcun software da installare.', es: 'El láser de integración Vereo Smart puede funcionar de forma autónoma sin PC gracias a un controlador integrado: los programas de marcaje se guardan en la memoria interna. Interfaz de pantalla táctil frontal, conectividad de red e interfaz plug-and-play para las marcas de PLC más habituales. Su interfaz propia permite controlar y supervisar el láser desde cualquier dispositivo (PC, tablet, teléfono, PLC), sin necesidad de instalar software.', de: 'Der Integrationslaser Vereo Smart läuft dank integriertem Controller auch ohne PC standalone: Markierprogramme liegen im internen Speicher. Touchscreen-Oberfläche an der Front, Netzwerkanbindung und Plug-and-Play-Schnittstelle für gängige SPS-Marken. Über die proprietäre Oberfläche lässt sich der Laser von jedem Gerät (PC, Tablet, Telefon, SPS) steuern und überwachen — ohne Softwareinstallation.', ko: 'Vereo Smart 통합형 레이저는 내장 컨트롤러 덕분에 PC 없이 단독으로 운용할 수 있으며, 마킹 프로그램은 온보드 스토리지에 저장됩니다. 전면 터치스크린 인터페이스, 네트워크 연결, 주요 PLC 브랜드용 플러그 앤드 플레이 인터페이스를 제공합니다. 전용 인터페이스를 통해 소프트웨어 설치 없이 어떤 기기(PC, 태블릿, 휴대폰, PLC)에서도 레이저를 제어하고 모니터링할 수 있습니다.', zh: 'Vereo Smart 集成激光器凭借内置控制器可脱离 PC 独立运行：打标程序保存在机载存储中。正面触摸屏界面、网络连接，以及适配常见 PLC 品牌的即插即用接口。其专有界面让您可以从任何设备（PC、平板、手机、PLC）控制和监控激光器——无需安装任何软件。',
    },
    features: [
      { hu: 'Önálló működés PC nélkül', en: 'Standalone operation, no PC', it: 'Funzionamento autonomo, senza PC', es: 'Funcionamiento autónomo, sin PC', de: 'Standalone-Betrieb ohne PC', ko: 'PC 없는 단독 운용', zh: '独立运行，无需 PC' },
      { hu: 'Előlapi érintőképernyő', en: 'Front touchscreen interface', it: 'Interfaccia touchscreen frontale', es: 'Interfaz de pantalla táctil frontal', de: 'Touchscreen-Oberfläche an der Front', ko: '전면 터치스크린 인터페이스', zh: '正面触摸屏界面' },
      { hu: 'Vezérlés bármely eszközről', en: 'Control from any device', it: 'Controllo da qualsiasi dispositivo', es: 'Control desde cualquier dispositivo', de: 'Steuerung von jedem Gerät', ko: '모든 기기에서 제어', zh: '任意设备均可控制' },
      { hu: 'Plug-and-play PLC-interfész', en: 'Plug-and-play PLC interface', it: 'Interfaccia PLC plug-and-play', es: 'Interfaz PLC plug-and-play', de: 'Plug-and-Play-SPS-Schnittstelle', ko: '플러그 앤드 플레이 PLC 인터페이스', zh: '即插即用 PLC 接口' },
      { hu: 'Hálózati csatlakozás, adatcsere', en: 'Network connectivity, data exchange', it: 'Connettività di rete, scambio di dati', es: 'Conectividad de red, intercambio de datos', de: 'Netzwerkanbindung, Datenaustausch', ko: '네트워크 연결, 데이터 교환', zh: '网络连接，数据交换' },
    ],
  },
  {
    slug: 'tykma-virtus',
    category: 'lezer-gravirozok',
    name: 'TYKMA Virtus',
    brand: 'Tykma Electrox',
    image: '/images/products/tykma-virtus.webp',
    datasheet: '/datasheets/tykma-electrox-brochure.pdf',
    short: {
      hu: 'Kompakt, belépő szintű Class 4 fiber lézerjelölő és -gravírozó.',
      en: 'Compact, entry-level Class 4 fiber laser marker and engraver.', it: 'Marcatore e incisore laser in fibra compatto in Classe 4, di fascia d’ingresso.', es: 'Marcador y grabador láser de fibra Clase 4 compacto y de gama de entrada.', de: 'Kompakter Klasse-4-Faserlaser für Markierung und Gravur im Einstiegssegment.', ko: '컴팩트한 엔트리급 Class 4 파이버 레이저 마커 및 각인기.', zh: '紧凑型入门级 4 类光纤激光打标与雕刻机。',
    },
    description: {
      hu: 'A Virtus kompakt, Class 4 fiber lézerjelölő és -gravírozó rendszer, akár 60 W-os MOPA fiber forrással — nagy csúcsteljesítmény és gyors feldolgozás fémeken, műanyagokon, bevonatos felületeken. Állítható Z-tengely és rögzítő szerszámlap; léghűtéses, karbantartásmentes, alacsony fogyasztású. Ideális gyártósorokba, munkacellákba és asztali használatra; hivatalos rendszer Cerakote® bevonatok jelöléséhez és ablálásához.',
      en: 'The Virtus is a compact Class 4 fiber laser marking and engraving system with a MOPA fiber source up to 60 W — high peak power and fast processing on metals, plastics and coated surfaces. Adjustable Z-axis and a tooling fixture plate; air-cooled, maintenance-free and low-consumption. Ideal for lines, work cells and benchtop use; an official system for marking and ablating Cerakote® coatings.', it: 'Il Virtus è un sistema compatto di marcatura e incisione laser in fibra in Classe 4 con sorgente in fibra MOPA fino a 60 W — elevata potenza di picco e lavorazione rapida su metalli, plastica e superfici rivestite. Asse Z regolabile e piastra di fissaggio per attrezzature; raffreddato ad aria, esente da manutenzione e a basso consumo. Ideale per linee, celle di lavoro e uso da banco; sistema ufficiale per la marcatura e l’ablazione dei rivestimenti Cerakote®.', es: 'El Virtus es un sistema compacto de marcaje y grabado láser de fibra Clase 4 con una fuente de fibra MOPA de hasta 60 W: alta potencia de pico y procesado rápido sobre metales, plásticos y superficies recubiertas. Eje Z ajustable y placa de fijación de utillaje; refrigerado por aire, sin mantenimiento y de bajo consumo. Ideal para líneas, células de trabajo y uso de sobremesa; sistema oficial para el marcaje y la ablación de recubrimientos Cerakote®.', de: 'Der Virtus ist ein kompaktes Klasse-4-Faserlasersystem für Markierung und Gravur mit MOPA-Faserquelle bis 60 W — hohe Spitzenleistung und schnelle Bearbeitung von Metallen, Kunststoffen und beschichteten Oberflächen. Verstellbare Z-Achse und Aufspannplatte für Vorrichtungen; luftgekühlt, wartungsfrei und verbrauchsarm. Ideal für Linien, Arbeitszellen und den Tischeinsatz; ein offizielles System zum Markieren und Abtragen von Cerakote®-Beschichtungen.', ko: 'Virtus는 최대 60 W의 MOPA 파이버 소스를 갖춘 컴팩트 Class 4 파이버 레이저 마킹·각인 시스템으로, 금속, 플라스틱, 코팅 표면에서 높은 피크 출력과 빠른 가공을 제공합니다. 조정 가능한 Z축과 툴링 고정 플레이트를 갖추었으며 공랭식, 무보수, 저소비 설계입니다. 라인, 워크셀, 벤치탑 사용에 이상적이며 Cerakote® 코팅의 마킹 및 제거를 위한 공식 시스템입니다.', zh: 'Virtus 是一款紧凑型 4 类光纤激光打标与雕刻系统，配备最高 60 W 的 MOPA 光纤光源——高峰值功率，可快速加工金属、塑料与涂层表面。可调 Z 轴与工装夹具板；风冷、免维护、低能耗。是产线、工作单元与台式应用的理想之选；亦是 Cerakote® 涂层打标与剥蚀的官方指定系统。',
    },
    features: [
      { hu: 'MOPA fiber lézer, akár 60 W', en: 'MOPA fiber laser, up to 60 W', it: 'Laser in fibra MOPA, fino a 60 W', es: 'Láser de fibra MOPA, hasta 60 W', de: 'MOPA-Faserlaser, bis 60 W', ko: 'MOPA 파이버 레이저, 최대 60 W', zh: 'MOPA 光纤激光器，最高 60 W' },
      { hu: 'Állítható Z-tengely + szerszámlap', en: 'Adjustable Z-axis + tooling plate', it: 'Asse Z regolabile + piastra per attrezzature', es: 'Eje Z ajustable + placa de utillaje', de: 'Verstellbare Z-Achse + Aufspannplatte', ko: '조정 가능한 Z축 + 툴링 플레이트', zh: '可调 Z 轴 + 工装板' },
      { hu: 'Gyártósori és asztali integráció', en: 'Line and benchtop integration', it: 'Integrazione in linea e uso da banco', es: 'Integración en línea y de sobremesa', de: 'Linien- und Tischintegration', ko: '라인 및 벤치탑 통합', zh: '产线与台式集成' },
      { hu: 'Léghűtéses, karbantartásmentes', en: 'Air-cooled, maintenance-free', it: 'Raffreddato ad aria, esente da manutenzione', es: 'Refrigerado por aire, sin mantenimiento', de: 'Luftgekühlt, wartungsfrei', ko: '공랭식, 유지보수 불필요', zh: '风冷，免维护' },
      { hu: 'Cerakote® jelölésre hitelesítve', en: 'Certified for Cerakote® marking', it: 'Certificato per la marcatura Cerakote®', es: 'Certificado para el marcaje de Cerakote®', de: 'Zertifiziert für Cerakote®-Markierung', ko: 'Cerakote® 마킹 인증', zh: '获得 Cerakote® 打标认证' },
    ],
  },

  // ——— Festékszalagok (termotranszfer) ———
  {
    slug: 'dnp-festekszalagok',
    category: 'cimkek-es-festekszalagok',
    name: 'DNP festékszalagok',
    displayName: { hu: 'DNP festékszalagok', en: 'DNP thermal transfer ribbons', de: 'DNP Farbbänder', it: 'Ribbon DNP', es: 'Ribbons DNP', ko: 'DNP 열전사 리본', zh: 'DNP 碳带' },
    brand: 'DNP',
    image: '/images/brand/dnp-logo.png',
    datasheet: '/datasheets/dnp-ttr-brochure.pdf',
    short: {
      hu: 'Prémium termotranszfer festékszalagok — wax, wax/resin és resin kivitelben.',
      en: 'Premium thermal transfer ribbons — in wax, wax/resin and resin.', it: 'Ribbon a trasferimento termico premium — Wax, Wax-Resin e Resin.', es: 'Ribbons de transferencia térmica premium — en Wax, Wax-Resin y Resin.', de: 'Premium-Thermotransfer-Farbbänder — als Wax, Wax-Resin und Resin.', ko: '프리미엄 열전사 리본 — Wax, Wax/Resin 및 Resin 타입.', zh: '高品质热转印碳带——蜡基、混合基与树脂基。',
    },
    description: {
      hu: 'A DNP (Dai Nippon Printing) a világ egyik vezető termotranszfer festékszalag-gyártója. Teljes kínálat wax, wax/resin és resin szalagokból: a világszerte elismert TR4085Plus prémium wax szalagtól a nagy ellenállású resin szalagokig. Ideális szállítási, logisztikai, gyógyszeripari, vegyipari és kültéri címkézéshez, papír és szintetikus címkékre egyaránt.',
      en: 'DNP (Dai Nippon Printing) is one of the world’s leading manufacturers of thermal transfer ribbons. A complete range of wax, wax/resin and resin ribbons: from the globally renowned TR4085Plus premium wax to highly resistant resin ribbons. Ideal for shipping, logistics, pharmaceutical, chemical and outdoor labeling, on both paper and synthetic labels.', it: 'DNP (Dai Nippon Printing) è uno dei principali produttori al mondo di ribbon a trasferimento termico. Una gamma completa di ribbon Wax, Wax-Resin e Resin: dal rinomato ribbon Wax premium TR4085Plus ai ribbon Resin ad altissima resistenza. Ideali per l’etichettatura di spedizione, logistica, farmaceutica, chimica e per esterni, su etichette sia in carta sia sintetiche.', es: 'DNP (Dai Nippon Printing) es uno de los principales fabricantes mundiales de ribbons de transferencia térmica. Una gama completa de ribbons Wax, Wax-Resin y Resin: desde el mundialmente reconocido Wax premium TR4085Plus hasta ribbons Resin de alta resistencia. Ideales para el etiquetado de expediciones, logística, farmacia, química y exteriores, tanto sobre etiquetas de papel como sintéticas.', de: 'DNP (Dai Nippon Printing) ist einer der weltweit führenden Hersteller von Thermotransfer-Farbbändern. Ein komplettes Sortiment an Wax-, Wax-Resin- und Resin-Farbbändern: vom weltweit renommierten Premium-Wax TR4085Plus bis zu hochbeständigen Resin-Farbbändern. Ideal für Versand, Logistik, Pharma-, Chemie- und Außenetikettierung, auf Papier- wie Kunststoffetiketten.', ko: 'DNP(Dai Nippon Printing)는 세계 유수의 열전사 리본 제조사 중 하나입니다. 세계적으로 명성 높은 TR4085Plus 프리미엄 Wax부터 고내구성 Resin 리본까지, Wax, Wax/Resin 및 Resin 리본의 완전한 라인업을 제공합니다. 종이 및 합성수지 라벨 모두에서 배송, 물류, 제약, 화학 및 옥외 라벨링에 이상적입니다.', zh: 'DNP（Dai Nippon Printing）是全球领先的热转印碳带制造商之一。提供完整的蜡基、混合基与树脂基碳带系列：从享誉全球的 TR4085Plus 高级蜡基碳带到高耐性树脂基碳带。是运输、物流、制药、化工与户外标签打印的理想选择，适用于纸质与合成标签。',
    },
    features: [
      { hu: 'Wax, wax/resin és resin kivitel', en: 'Wax, wax/resin and resin grades', it: 'Qualità Wax, Wax-Resin e Resin', es: 'Calidades Wax, Wax-Resin y Resin', de: 'Wax-, Wax-Resin- und Resin-Qualitäten', ko: 'Wax, Wax/Resin 및 Resin 등급', zh: '蜡基、混合基与树脂基等级' },
      { hu: 'TR4085Plus prémium wax szalag', en: 'TR4085Plus premium wax ribbon', it: 'Ribbon Wax premium TR4085Plus', es: 'Ribbon Wax premium TR4085Plus', de: 'TR4085Plus Premium-Wax-Farbband', ko: 'TR4085Plus 프리미엄 Wax 리본', zh: 'TR4085Plus 高级蜡基碳带' },
      { hu: 'Nagy tartósságú resin szalagok', en: 'Highly durable resin ribbons', it: 'Ribbon Resin ad elevata durabilità', es: 'Ribbons Resin de alta durabilidad', de: 'Hochbeständige Resin-Farbbänder', ko: '고내구성 Resin 리본', zh: '高耐久树脂基碳带' },
      { hu: 'Papír és szintetikus címkékhez', en: 'For paper and synthetic labels', it: 'Per etichette in carta e sintetiche', es: 'Para etiquetas de papel y sintéticas', de: 'Für Papier- und Kunststoffetiketten', ko: '종이 및 합성수지 라벨용', zh: '适用于纸质与合成标签' },
    ],
  },
  {
    slug: 'armor-iimak-festekszalagok',
    category: 'cimkek-es-festekszalagok',
    name: 'ARMOR-IIMAK festékszalagok',
    displayName: { hu: 'ARMOR-IIMAK festékszalagok', en: 'ARMOR-IIMAK thermal transfer ribbons', de: 'ARMOR-IIMAK Farbbänder', it: 'Ribbon ARMOR-IIMAK', es: 'Ribbons ARMOR-IIMAK', ko: 'ARMOR-IIMAK 열전사 리본', zh: 'ARMOR-IIMAK 碳带' },
    brand: 'ARMOR-IIMAK',
    image: '/images/brand/armor-iimak-logo.png',
    datasheet: '/datasheets/armor-iimak-ribbons-overview.pdf',
    short: {
      hu: 'Termotranszfer festékszalagok flat-head és near-edge nyomtatókhoz.',
      en: 'Thermal transfer ribbons for flat-head and near-edge printers.', it: 'Ribbon a trasferimento termico per stampanti flat-head e near-edge.', es: 'Ribbons de transferencia térmica para impresoras flat-head y near-edge.', de: 'Thermotransfer-Farbbänder für Flat-Head- und Near-Edge-Drucker.', ko: '플랫 헤드 및 니어 엣지 프린터용 열전사 리본.', zh: '适用于平压式与近端式打印机的热转印碳带。',
    },
    description: {
      hu: 'Az ARMOR-IIMAK a termotranszfer festékszalagok egyik piacvezető gyártója. Három szalagcsalád — wax (AWR 1), wax/resin (APR 1, APR 6, APR 600) és resin (AXR 1, AXR 7, AXR 100, AXR 600, AXR 800/900) — flat-head és near-edge nyomtatókhoz, papír- és szintetikus címkékhez, valamint flexibilis csomagolóanyagokhoz. Nagy sebességű nyomtatás (akár 1 m/s) és kiváló nyomatállóság.',
      en: 'ARMOR-IIMAK is a market leader in thermal transfer ribbons. Three ribbon families — wax (AWR 1), wax/resin (APR 1, APR 6, APR 600) and resin (AXR 1, AXR 7, AXR 100, AXR 600, AXR 800/900) — for flat-head and near-edge printers, for paper and synthetic labels as well as flexible packaging. High-speed printing (up to 1 m/s) with excellent print resistance.', it: 'ARMOR-IIMAK è leader di mercato nei ribbon a trasferimento termico. Tre famiglie di ribbon — Wax (AWR 1), Wax-Resin (APR 1, APR 6, APR 600) e Resin (AXR 1, AXR 7, AXR 100, AXR 600, AXR 800/900) — per stampanti flat-head e near-edge, per etichette in carta e sintetiche nonché per imballaggi flessibili. Stampa ad alta velocità (fino a 1 m/s) con un’eccellente resistenza della stampa.', es: 'ARMOR-IIMAK es líder del mercado en ribbons de transferencia térmica. Tres familias de ribbon — Wax (AWR 1), Wax-Resin (APR 1, APR 6, APR 600) y Resin (AXR 1, AXR 7, AXR 100, AXR 600, AXR 800/900) — para impresoras flat-head y near-edge, para etiquetas de papel y sintéticas, así como para envases flexibles. Impresión a alta velocidad (hasta 1 m/s) con una excelente resistencia de la impresión.', de: 'ARMOR-IIMAK ist ein Marktführer bei Thermotransfer-Farbbändern. Drei Farbbandfamilien — Wax (AWR 1), Wax-Resin (APR 1, APR 6, APR 600) und Resin (AXR 1, AXR 7, AXR 100, AXR 600, AXR 800/900) — für Flat-Head- und Near-Edge-Drucker, für Papier- und Kunststoffetiketten sowie flexible Verpackungen. Hochgeschwindigkeitsdruck (bis 1 m/s) mit hervorragender Druckbeständigkeit.', ko: 'ARMOR-IIMAK은 열전사 리본 시장의 선도 기업입니다. Wax(AWR 1), Wax/Resin(APR 1, APR 6, APR 600), Resin(AXR 1, AXR 7, AXR 100, AXR 600, AXR 800/900)의 세 가지 리본 제품군을 플랫 헤드 및 니어 엣지 프린터용으로 제공하며, 종이·합성수지 라벨은 물론 연포장에도 사용할 수 있습니다. 뛰어난 인쇄 내구성과 함께 고속 인쇄(최대 1 m/s)를 지원합니다.', zh: 'ARMOR-IIMAK 是热转印碳带领域的市场领导者。三大碳带系列——蜡基（AWR 1）、混合基（APR 1、APR 6、APR 600）与树脂基（AXR 1、AXR 7、AXR 100、AXR 600、AXR 800/900）——适用于平压式与近端式打印机，可打印纸质与合成标签以及软包装。支持高速打印（最高 1 m/s），打印耐性出色。',
    },
    features: [
      { hu: 'Wax, wax/resin és resin családok', en: 'Wax, wax/resin and resin families', it: 'Famiglie Wax, Wax-Resin e Resin', es: 'Familias Wax, Wax-Resin y Resin', de: 'Wax-, Wax-Resin- und Resin-Familien', ko: 'Wax, Wax/Resin 및 Resin 제품군', zh: '蜡基、混合基与树脂基系列' },
      { hu: 'Flat-head és near-edge nyomtatókhoz', en: 'For flat-head and near-edge printers', it: 'Per stampanti flat-head e near-edge', es: 'Para impresoras flat-head y near-edge', de: 'Für Flat-Head- und Near-Edge-Drucker', ko: '플랫 헤드 및 니어 엣지 프린터용', zh: '适用于平压式与近端式打印机' },
      { hu: 'Nagy sebességű nyomtatás (akár 1 m/s)', en: 'High-speed printing (up to 1 m/s)', it: 'Stampa ad alta velocità (fino a 1 m/s)', es: 'Impresión a alta velocidad (hasta 1 m/s)', de: 'Hochgeschwindigkeitsdruck (bis 1 m/s)', ko: '고속 인쇄(최대 1 m/s)', zh: '高速打印（最高 1 m/s）' },
      { hu: 'Kiváló nyomatállóság', en: 'Excellent print resistance', it: 'Eccellente resistenza della stampa', es: 'Excelente resistencia de la impresión', de: 'Hervorragende Druckbeständigkeit', ko: '뛰어난 인쇄 내구성', zh: '出色的打印耐性' },
    ],
  },
  {
    slug: 'start-ld3000',
    category: 'cimke-adagolo-gepek',
    name: 'START LD3000',
    brand: 'START International',
    image: '/images/products/ld3000.webp',
    datasheet: '/datasheets/start-ld3000.pdf',
    short: {
      hu: 'Nagy sebességű elektromos címkeadagoló kis címkékhez, kis munkaterületre.',
      en: 'High-speed electric label dispenser for small labels and small work areas.', it: 'Spellicolatore elettrico ad alta velocità per etichette piccole e aree di lavoro ridotte.', es: 'Dispensador eléctrico de etiquetas de alta velocidad para etiquetas pequeñas y espacios de trabajo reducidos.', de: 'Elektrischer Hochgeschwindigkeits-Etikettenspender für kleine Etiketten und kleine Arbeitsbereiche.', ko: '소형 라벨 및 좁은 작업 공간을 위한 고속 전동 라벨 디스펜서.', zh: '面向小标签与小型工作区域的高速电动标签剥离机。',
    },
    description: {
      hu: 'Az LD3000 nagy sebességű elektromos címkeadagoló kis címkékhez és kivágott alkatrészekhez (papír, poliészter, vinil, acetát, hab, fólia). Fotoszenzor gondoskodik a pontos lehúzásról, adagolásról és továbbításról, a hordozó automatikusan felcsévélődik. Szerszám nélkül állítható, tartós anodizált alumínium ház. 12 V DC, mellékelt 100–240 V univerzális adapterrel. Amerikai gyártás.',
      en: 'The LD3000 is a high-speed electric label dispenser for small labels and die-cut parts (paper, polyester, vinyl, acetate, foam, foil). A photosensor ensures accurate peeling, dispensing and advancing, and the liner is automatically rewound. Tool-free adjustment, durable anodized aluminum housing. 12V DC with an included 100–240V universal transformer. Made in the U.S.A.', it: 'L’LD3000 è uno spellicolatore elettrico ad alta velocità per etichette piccole e parti fustellate (carta, poliestere, vinile, acetato, schiuma, film). Un fotosensore garantisce spellicolatura, erogazione e avanzamento precisi e il liner viene riavvolto automaticamente. Regolazione senza utensili, robusto alloggiamento in alluminio anodizzato. 12V DC con trasformatore universale 100–240V incluso. Prodotto negli U.S.A.', es: 'El LD3000 es un dispensador eléctrico de etiquetas de alta velocidad para etiquetas pequeñas y piezas troqueladas (papel, poliéster, vinilo, acetato, espuma, lámina). Un fotosensor garantiza un despegado, dispensado y avance precisos, y el liner se rebobina automáticamente. Ajuste sin herramientas y carcasa duradera de aluminio anodizado. 12 V CC con transformador universal de 100–240 V incluido. Fabricado en EE. UU.', de: 'Der LD3000 ist ein elektrischer Hochgeschwindigkeits-Etikettenspender für kleine Etiketten und Stanzteile (Papier, Polyester, Vinyl, Acetat, Schaumstoff, Folie). Ein Fotosensor sorgt für präzises Ablösen, Spenden und Vorschieben, das Trägermaterial wird automatisch aufgewickelt. Werkzeuglose Einstellung, langlebiges Gehäuse aus eloxiertem Aluminium. 12 V DC mit mitgeliefertem 100–240-V-Universalnetzteil. Hergestellt in den USA.', ko: 'LD3000은 소형 라벨과 다이컷 부품(종이, 폴리에스터, 비닐, 아세테이트, 폼, 포일)을 위한 고속 전동 라벨 디스펜서입니다. 포토센서가 정확한 박리, 디스펜싱, 이송을 보장하며 라이너는 자동으로 리와인딩됩니다. 공구 없이 조정 가능하고 내구성 있는 아노다이징 알루미늄 하우징을 갖추었습니다. 12V DC 구동에 100–240V 범용 트랜스포머가 포함됩니다. 미국산.', zh: 'LD3000 是一款高速电动标签剥离机，适用于小标签与模切件（纸张、聚酯、乙烯基、醋酸酯、泡棉、箔材）。光电传感器确保精确的剥离、送出与走带，底纸自动回卷。免工具调节，耐用的阳极氧化铝外壳。12V DC 供电，随附 100–240V 通用变压器。美国制造。',
    },
    features: [
      { hu: 'Címkeszélesség 6–57 mm, hossz 6–76 mm', en: 'Label width 6–57 mm, length 6–76 mm', it: 'Larghezza etichetta 6–57 mm, lunghezza 6–76 mm', es: 'Ancho de etiqueta 6–57 mm, longitud 6–76 mm', de: 'Etikettenbreite 6–57 mm, Länge 6–76 mm', ko: '라벨 폭 6–57 mm, 길이 6–76 mm', zh: '标签宽度 6–57 mm，长度 6–76 mm' },
      { hu: 'Adagolási sebesség 56 mm/s', en: 'Feed speed 56 mm/s', it: 'Velocità di avanzamento 56 mm/s', es: 'Velocidad de avance 56 mm/s', de: 'Vorschubgeschwindigkeit 56 mm/s', ko: '이송 속도 56 mm/s', zh: '送标速度 56 mm/s' },
      { hu: 'Fotoszenzoros pontosság, automatikus hordozó-felcsévélés', en: 'Photosensor accuracy, automatic liner rewind', it: 'Precisione con fotosensore, riavvolgimento automatico del liner', es: 'Precisión por fotosensor, rebobinado automático del liner', de: 'Fotosensor-Genauigkeit, automatische Trägermaterial-Aufwicklung', ko: '포토센서 정밀도, 자동 라이너 리와인딩', zh: '光电传感器精度，底纸自动回卷' },
      { hu: 'Max. tekercsátmérő 190 mm (1"/3" mag)', en: 'Max. roll diameter 190 mm (1"/3" core)', it: 'Diametro massimo rotolo 190 mm (anima da 1"/3")', es: 'Diámetro máx. de rollo 190 mm (mandril de 1"/3")', de: 'Max. Rollendurchmesser 190 mm (1"-/3"-Kern)', ko: '최대 롤 직경 190 mm(1"/3" 코어)', zh: '最大卷径 190 mm（1"/3" 卷芯）' },
      { hu: 'Anodizált alumínium ház', en: 'Anodized aluminum housing', it: 'Alloggiamento in alluminio anodizzato', es: 'Carcasa de aluminio anodizado', de: 'Gehäuse aus eloxiertem Aluminium', ko: '아노다이징 알루미늄 하우징', zh: '阳极氧化铝外壳' },
    ],
  },
  {
    slug: 'start-ld3500',
    category: 'cimke-adagolo-gepek',
    name: 'START LD3500',
    brand: 'START International',
    image: '/images/products/ld3500.webp',
    datasheet: '/datasheets/start-ld3500.pdf',
    short: {
      hu: 'Elektromos címkeadagoló átlátszó és nehezen kezelhető anyagokhoz.',
      en: 'Electric label dispenser for clear and challenging materials.', it: 'Spellicolatore elettrico per materiali trasparenti e difficili.', es: 'Dispensador eléctrico de etiquetas para materiales transparentes y difíciles.', de: 'Elektrischer Etikettenspender für transparente und anspruchsvolle Materialien.', ko: '투명 및 까다로운 소재를 위한 전동 라벨 디스펜서.', zh: '适用于透明及高难度材料的电动标签剥离机。',
    },
    description: {
      hu: 'Az LD3500 kifejezetten átlátszó, tamper-evident, wafer-seal és karton-lezáró címkékhez, valamint más nehezen kezelhető átlátszó anyagokhoz készült. Függőleges leválasztólemez segíti a fotoszenzor pontos beállítását átlátszó anyagoknál. Automatikus lehúzás és hordozó-felcsévélés, szerszám nélküli állítás, anodizált alumínium ház. 12 V DC univerzális adapterrel. Amerikai gyártás.',
      en: 'The LD3500 is designed for clear, tamper-evident, wafer-seal and carton-sealing labels and other challenging clear materials. A vertical strip plate improves photosensor adjustment for detecting clear materials. Automatic peeling and liner rewind, tool-free adjustment, anodized aluminum housing. 12V DC with universal transformer. Made in the U.S.A.', it: 'L’LD3500 è progettato per etichette trasparenti, antimanomissione, wafer-seal e per la sigillatura di cartoni, oltre che per altri materiali trasparenti difficili. Una piastra di distacco verticale migliora la regolazione del fotosensore per il rilevamento dei materiali trasparenti. Spellicolatura e riavvolgimento del liner automatici, regolazione senza utensili, alloggiamento in alluminio anodizzato. 12V DC con trasformatore universale. Prodotto negli U.S.A.', es: 'El LD3500 está diseñado para etiquetas transparentes, de seguridad (tamper-evident), wafer-seal y de cierre de cajas, así como para otros materiales transparentes difíciles. Una placa de despegado vertical mejora el ajuste del fotosensor para detectar materiales transparentes. Despegado y rebobinado del liner automáticos, ajuste sin herramientas y carcasa de aluminio anodizado. 12 V CC con transformador universal. Fabricado en EE. UU.', de: 'Der LD3500 ist für transparente, manipulationssichere, Wafer-Seal- und Kartonverschluss-Etiketten sowie andere anspruchsvolle transparente Materialien konzipiert. Eine vertikale Spendekante verbessert die Fotosensor-Justierung zur Erkennung transparenter Materialien. Automatisches Ablösen und Aufwickeln des Trägermaterials, werkzeuglose Einstellung, Gehäuse aus eloxiertem Aluminium. 12 V DC mit Universalnetzteil. Hergestellt in den USA.', ko: 'LD3500은 투명 라벨, 개봉 확인(탬퍼 에비던트) 라벨, 웨이퍼 씰, 카톤 씰링 라벨 등 까다로운 투명 소재를 위해 설계되었습니다. 수직 스트립 플레이트가 투명 소재 감지를 위한 포토센서 조정을 개선합니다. 자동 박리 및 라이너 리와인딩, 공구 없는 조정, 아노다이징 알루미늄 하우징을 갖추었습니다. 12V DC, 범용 트랜스포머 포함. 미국산.', zh: 'LD3500 专为透明标签、防拆标签、封口圆标、封箱标签及其他高难度透明材料设计。垂直剥离板改善了光电传感器对透明材料的检测调节。自动剥离与底纸回卷，免工具调节，阳极氧化铝外壳。12V DC 供电，配通用变压器。美国制造。',
    },
    features: [
      { hu: 'Átlátszó / tamper-evident címkékhez', en: 'For clear / tamper-evident labels', it: 'Per etichette trasparenti / antimanomissione', es: 'Para etiquetas transparentes / de seguridad', de: 'Für transparente / manipulationssichere Etiketten', ko: '투명 / 개봉 확인 라벨용', zh: '适用于透明 / 防拆标签' },
      { hu: 'Címkeszélesség 6–57 mm, hossz 13–101 mm', en: 'Label width 6–57 mm, length 13–101 mm', it: 'Larghezza etichetta 6–57 mm, lunghezza 13–101 mm', es: 'Ancho de etiqueta 6–57 mm, longitud 13–101 mm', de: 'Etikettenbreite 6–57 mm, Länge 13–101 mm', ko: '라벨 폭 6–57 mm, 길이 13–101 mm', zh: '标签宽度 6–57 mm，长度 13–101 mm' },
      { hu: 'Függőleges leválasztólemez a pontos érzékeléshez', en: 'Vertical strip plate for accurate detection', it: 'Piastra di distacco verticale per un rilevamento preciso', es: 'Placa de despegado vertical para una detección precisa', de: 'Vertikale Spendekante für präzise Erkennung', ko: '정확한 감지를 위한 수직 스트립 플레이트', zh: '垂直剥离板确保精确检测' },
      { hu: 'Adagolási sebesség 56 mm/s', en: 'Feed speed 56 mm/s', it: 'Velocità di avanzamento 56 mm/s', es: 'Velocidad de avance 56 mm/s', de: 'Vorschubgeschwindigkeit 56 mm/s', ko: '이송 속도 56 mm/s', zh: '送标速度 56 mm/s' },
      { hu: 'Fotoszenzoros pontosság, automatikus hordozó-felcsévélés', en: 'Photosensor accuracy, automatic liner rewind', it: 'Precisione con fotosensore, riavvolgimento automatico del liner', es: 'Precisión por fotosensor, rebobinado automático del liner', de: 'Fotosensor-Genauigkeit, automatische Trägermaterial-Aufwicklung', ko: '포토센서 정밀도, 자동 라이너 리와인딩', zh: '光电传感器精度，底纸自动回卷' },
    ],
  },
  {
    slug: 'start-ld6050',
    category: 'cimke-adagolo-gepek',
    name: 'START LD6050',
    brand: 'START International',
    image: '/images/products/ld6050.webp',
    datasheet: '/datasheets/start-ld6050.pdf',
    short: {
      hu: 'Nagy sebességű elektromos címkeadagoló szélesebb, 121 mm-es címkékhez.',
      en: 'High-speed electric label dispenser for wider, 121 mm labels.', it: 'Spellicolatore elettrico ad alta velocità per etichette più larghe, da 121 mm.', es: 'Dispensador eléctrico de etiquetas de alta velocidad para etiquetas más anchas, de 121 mm.', de: 'Elektrischer Hochgeschwindigkeits-Etikettenspender für breitere Etiketten bis 121 mm.', ko: '더 넓은 121 mm 라벨을 위한 고속 전동 라벨 디스펜서.', zh: '面向较宽（121 mm）标签的高速电动标签剥离机。',
    },
    description: {
      hu: 'Az LD6050 nagy sebességű elektromos címkeadagoló szélesebb, akár 4,75" (121 mm) széles címkékhez és kivágott alkatrészekhez. Fotoszenzoros lehúzás és továbbítás, automatikus hordozó-felcsévélés, szerszám nélküli állítás és tartós fémfelépítés. Amerikai gyártás.',
      en: 'The LD6050 is a high-speed electric label dispenser for wider labels and die-cut parts up to 4.75" (121 mm) wide. Photosensor peeling and advancing, automatic liner rewind, tool-free adjustment and durable metal construction. Made in the U.S.A.', it: 'L’LD6050 è uno spellicolatore elettrico ad alta velocità per etichette più larghe e parti fustellate fino a 4,75" (121 mm) di larghezza. Spellicolatura e avanzamento con fotosensore, riavvolgimento automatico del liner, regolazione senza utensili e robusta costruzione metallica. Prodotto negli U.S.A.', es: 'El LD6050 es un dispensador eléctrico de etiquetas de alta velocidad para etiquetas y piezas troqueladas más anchas, de hasta 4,75" (121 mm) de ancho. Despegado y avance por fotosensor, rebobinado automático del liner, ajuste sin herramientas y construcción metálica duradera. Fabricado en EE. UU.', de: 'Der LD6050 ist ein elektrischer Hochgeschwindigkeits-Etikettenspender für breitere Etiketten und Stanzteile bis 4,75" (121 mm) Breite. Fotosensorgesteuertes Ablösen und Vorschieben, automatische Aufwicklung des Trägermaterials, werkzeuglose Einstellung und langlebige Metallkonstruktion. Hergestellt in den USA.', ko: 'LD6050은 최대 4.75"(121 mm) 폭의 넓은 라벨과 다이컷 부품을 위한 고속 전동 라벨 디스펜서입니다. 포토센서 방식의 박리와 이송, 자동 라이너 리와인딩, 공구 없는 조정, 내구성 있는 금속 구조를 갖추었습니다. 미국산.', zh: 'LD6050 是一款高速电动标签剥离机，适用于宽度最大 4.75"（121 mm）的较宽标签与模切件。光电传感器控制剥离与走带，底纸自动回卷，免工具调节，耐用的金属结构。美国制造。',
    },
    features: [
      { hu: 'Címkeszélesség akár 121 mm', en: 'Label width up to 121 mm', it: 'Larghezza etichetta fino a 121 mm', es: 'Ancho de etiqueta hasta 121 mm', de: 'Etikettenbreite bis 121 mm', ko: '라벨 폭 최대 121 mm', zh: '标签宽度最大 121 mm' },
      { hu: 'Nagy sebességű adagolás', en: 'High-speed dispensing', it: 'Spellicolatura ad alta velocità', es: 'Dispensado a alta velocidad', de: 'Hochgeschwindigkeits-Spenden', ko: '고속 디스펜싱', zh: '高速剥离' },
      { hu: 'Fotoszenzoros pontosság', en: 'Photosensor accuracy', it: 'Precisione con fotosensore', es: 'Precisión por fotosensor', de: 'Fotosensor-Genauigkeit', ko: '포토센서 정밀도', zh: '光电传感器精度' },
      { hu: 'Automatikus hordozó-felcsévélés', en: 'Automatic liner rewind', it: 'Riavvolgimento automatico del liner', es: 'Rebobinado automático del liner', de: 'Automatische Trägermaterial-Aufwicklung', ko: '자동 라이너 리와인딩', zh: '底纸自动回卷' },
      { hu: 'Tartós fémfelépítés', en: 'Durable metal construction', it: 'Robusta costruzione metallica', es: 'Construcción metálica duradera', de: 'Langlebige Metallkonstruktion', ko: '내구성 있는 금속 구조', zh: '耐用金属结构' },
    ],
  },
  {
    slug: 'start-ld8100',
    category: 'cimke-adagolo-gepek',
    name: 'START LD8100',
    brand: 'START International',
    image: '/images/products/ld8100.webp',
    datasheet: '/datasheets/start-ld8100.pdf',
    short: {
      hu: 'Szupergyors elektromos címkeadagoló hosszú, széles csomagoló-címkékhez.',
      en: 'Super-speed electric label dispenser for long, wide packaging labels.', it: 'Spellicolatore elettrico superveloce per etichette da imballaggio lunghe e larghe.', es: 'Dispensador eléctrico de etiquetas superrápido para etiquetas de envase largas y anchas.', de: 'Superschneller elektrischer Etikettenspender für lange, breite Verpackungsetiketten.', ko: '길고 넓은 포장 라벨을 위한 초고속 전동 라벨 디스펜서.', zh: '面向长幅宽幅包装标签的超高速电动标签剥离机。',
    },
    description: {
      hu: 'Az LD8100 szupergyors elektromos címkeadagoló hosszú, csomagolás jellegű címkékhez és kivágott alkatrészekhez. Nagy nyomatékú motor kezeli a nagy átmérőjű (max. 305 mm) tekercsek súlyát, állítható leválasztólemez a nehezen leváló címkékhez. Fotoszenzoros pontosság, automatikus hordozó-felcsévélés, teljes fémfelépítés. Címkeszélesség 6–127 mm, hossz 13–305 mm. Amerikai gyártás.',
      en: 'The LD8100 is a super-speed electric label dispenser for long, packaging-type labels and die-cut parts. A high-torque motor handles the weight of large-diameter rolls (max. 305 mm) and an adjustable strip plate helps with hard-to-release labels. Photosensor accuracy, automatic liner rewind, all-metal construction. Label width 6–127 mm, length 13–305 mm. Made in the U.S.A.', it: 'L’LD8100 è uno spellicolatore elettrico superveloce per etichette lunghe di tipo imballaggio e parti fustellate. Un motore ad alta coppia gestisce il peso dei rotoli di grande diametro (max. 305 mm) e una piastra di distacco regolabile facilita il distacco delle etichette più ostiche. Precisione con fotosensore, riavvolgimento automatico del liner, costruzione interamente metallica. Larghezza etichetta 6–127 mm, lunghezza 13–305 mm. Prodotto negli U.S.A.', es: 'El LD8100 es un dispensador eléctrico de etiquetas superrápido para etiquetas largas de tipo envase y piezas troqueladas. Un motor de alto par soporta el peso de rollos de gran diámetro (máx. 305 mm) y una placa de despegado ajustable ayuda con las etiquetas difíciles de despegar. Precisión por fotosensor, rebobinado automático del liner y construcción totalmente metálica. Ancho de etiqueta 6–127 mm, longitud 13–305 mm. Fabricado en EE. UU.', de: 'Der LD8100 ist ein superschneller elektrischer Etikettenspender für lange Etiketten im Verpackungsformat und Stanzteile. Ein drehmomentstarker Motor bewältigt das Gewicht großer Rollen (max. 305 mm), eine verstellbare Spendekante hilft bei schwer ablösbaren Etiketten. Fotosensor-Genauigkeit, automatische Aufwicklung des Trägermaterials, Vollmetallkonstruktion. Etikettenbreite 6–127 mm, Länge 13–305 mm. Hergestellt in den USA.', ko: 'LD8100은 길이가 긴 포장용 라벨과 다이컷 부품을 위한 초고속 전동 라벨 디스펜서입니다. 고토크 모터가 대직경 롤(최대 305 mm)의 무게를 처리하며, 조정 가능한 스트립 플레이트가 박리가 어려운 라벨 처리를 돕습니다. 포토센서 정밀도, 자동 라이너 리와인딩, 전체 금속 구조를 갖추었습니다. 라벨 폭 6–127 mm, 길이 13–305 mm. 미국산.', zh: 'LD8100 是一款超高速电动标签剥离机，适用于长幅包装类标签与模切件。高扭矩电机可承受大直径卷料（最大 305 mm）的重量，可调剥离板有助于处理难以剥离的标签。光电传感器精度，底纸自动回卷，全金属结构。标签宽度 6–127 mm，长度 13–305 mm。美国制造。',
    },
    features: [
      { hu: 'Címkeszélesség 6–127 mm, hossz 13–305 mm', en: 'Label width 6–127 mm, length 13–305 mm', it: 'Larghezza etichetta 6–127 mm, lunghezza 13–305 mm', es: 'Ancho de etiqueta 6–127 mm, longitud 13–305 mm', de: 'Etikettenbreite 6–127 mm, Länge 13–305 mm', ko: '라벨 폭 6–127 mm, 길이 13–305 mm', zh: '标签宽度 6–127 mm，长度 13–305 mm' },
      { hu: 'Max. tekercsátmérő 305 mm', en: 'Max. roll diameter 305 mm', it: 'Diametro massimo rotolo 305 mm', es: 'Diámetro máx. de rollo 305 mm', de: 'Max. Rollendurchmesser 305 mm', ko: '최대 롤 직경 305 mm', zh: '最大卷径 305 mm' },
      { hu: 'Nagy nyomatékú motor nehéz tekercsekhez', en: 'High-torque motor for heavy rolls', it: 'Motore ad alta coppia per rotoli pesanti', es: 'Motor de alto par para rollos pesados', de: 'Drehmomentstarker Motor für schwere Rollen', ko: '대형 롤을 위한 고토크 모터', zh: '高扭矩电机应对重型卷料' },
      { hu: 'Állítható leválasztólemez', en: 'Adjustable strip plate', it: 'Piastra di distacco regolabile', es: 'Placa de despegado ajustable', de: 'Verstellbare Spendekante', ko: '조정 가능한 스트립 플레이트', zh: '可调剥离板' },
      { hu: 'Teljes fémfelépítés', en: 'All-metal construction', it: 'Costruzione interamente metallica', es: 'Construcción totalmente metálica', de: 'Vollmetallkonstruktion', ko: '전체 금속 구조', zh: '全金属结构' },
    ],
  },
  {
    slug: 'start-ldx8050',
    category: 'cimke-adagolo-gepek',
    name: 'START LDX8050',
    brand: 'START International',
    image: '/images/products/ldx8050.webp',
    datasheet: '/datasheets/start-ldx8050.pdf',
    short: {
      hu: 'Nagy sebességű címkeadagoló hosszú, széles (max. 203 mm) címkékhez.',
      en: 'High-speed label dispenser for long, wide labels (up to 203 mm).', it: 'Spellicolatore ad alta velocità per etichette lunghe e larghe (fino a 203 mm).', es: 'Dispensador de etiquetas de alta velocidad para etiquetas largas y anchas (hasta 203 mm).', de: 'Hochgeschwindigkeits-Etikettenspender für lange, breite Etiketten (bis 203 mm).', ko: '길고 넓은 라벨(최대 203 mm)을 위한 고속 라벨 디스펜서.', zh: '面向长幅宽幅标签（最大 203 mm）的高速标签剥离机。',
    },
    description: {
      hu: 'Az LDX8050 nagy sebességű elektromos címkeadagoló hosszú, széles csomagoló-címkékhez, akár 8" (203 mm) szélességig. Nagy nyomatékú motor a nagy átmérőjű (max. 305 mm) tekercsekhez, állítható leválasztólemez, fotoszenzoros pontosság, automatikus hordozó-felcsévélés. Adagolási sebesség 99 mm/s. Amerikai gyártás.',
      en: 'The LDX8050 is a high-speed electric label dispenser for long, wide packaging labels up to 8" (203 mm) wide. High-torque motor for large-diameter rolls (max. 305 mm), adjustable strip plate, photosensor accuracy, automatic liner rewind. Feed speed 99 mm/s. Made in the U.S.A.', it: 'L’LDX8050 è uno spellicolatore elettrico ad alta velocità per etichette da imballaggio lunghe e larghe fino a 8" (203 mm). Motore ad alta coppia per rotoli di grande diametro (max. 305 mm), piastra di distacco regolabile, precisione con fotosensore, riavvolgimento automatico del liner. Velocità di avanzamento 99 mm/s. Prodotto negli U.S.A.', es: 'El LDX8050 es un dispensador eléctrico de etiquetas de alta velocidad para etiquetas de envase largas y anchas de hasta 8" (203 mm) de ancho. Motor de alto par para rollos de gran diámetro (máx. 305 mm), placa de despegado ajustable, precisión por fotosensor y rebobinado automático del liner. Velocidad de avance 99 mm/s. Fabricado en EE. UU.', de: 'Der LDX8050 ist ein elektrischer Hochgeschwindigkeits-Etikettenspender für lange, breite Verpackungsetiketten bis 8" (203 mm) Breite. Drehmomentstarker Motor für große Rollen (max. 305 mm), verstellbare Spendekante, Fotosensor-Genauigkeit, automatische Aufwicklung des Trägermaterials. Vorschubgeschwindigkeit 99 mm/s. Hergestellt in den USA.', ko: 'LDX8050은 최대 8"(203 mm) 폭의 길고 넓은 포장 라벨을 위한 고속 전동 라벨 디스펜서입니다. 대직경 롤(최대 305 mm)용 고토크 모터, 조정 가능한 스트립 플레이트, 포토센서 정밀도, 자동 라이너 리와인딩을 갖추었습니다. 이송 속도 99 mm/s. 미국산.', zh: 'LDX8050 是一款高速电动标签剥离机，适用于宽度最大 8"（203 mm）的长幅宽幅包装标签。高扭矩电机适配大直径卷料（最大 305 mm），可调剥离板，光电传感器精度，底纸自动回卷。送标速度 99 mm/s。美国制造。',
    },
    features: [
      { hu: 'Címkeszélesség 6–203 mm, hossz 13–305 mm', en: 'Label width 6–203 mm, length 13–305 mm', it: 'Larghezza etichetta 6–203 mm, lunghezza 13–305 mm', es: 'Ancho de etiqueta 6–203 mm, longitud 13–305 mm', de: 'Etikettenbreite 6–203 mm, Länge 13–305 mm', ko: '라벨 폭 6–203 mm, 길이 13–305 mm', zh: '标签宽度 6–203 mm，长度 13–305 mm' },
      { hu: 'Adagolási sebesség 99 mm/s', en: 'Feed speed 99 mm/s', it: 'Velocità di avanzamento 99 mm/s', es: 'Velocidad de avance 99 mm/s', de: 'Vorschubgeschwindigkeit 99 mm/s', ko: '이송 속도 99 mm/s', zh: '送标速度 99 mm/s' },
      { hu: 'Max. tekercsátmérő 305 mm', en: 'Max. roll diameter 305 mm', it: 'Diametro massimo rotolo 305 mm', es: 'Diámetro máx. de rollo 305 mm', de: 'Max. Rollendurchmesser 305 mm', ko: '최대 롤 직경 305 mm', zh: '最大卷径 305 mm' },
      { hu: 'Nagy nyomatékú motor', en: 'High-torque motor', it: 'Motore ad alta coppia', es: 'Motor de alto par', de: 'Drehmomentstarker Motor', ko: '고토크 모터', zh: '高扭矩电机' },
      { hu: 'Fotoszenzoros pontosság', en: 'Photosensor accuracy', it: 'Precisione con fotosensore', es: 'Precisión por fotosensor', de: 'Fotosensor-Genauigkeit', ko: '포토센서 정밀도', zh: '光电传感器精度' },
    ],
  },
  {
    slug: 'start-ldx8100',
    category: 'cimke-adagolo-gepek',
    name: 'START LDX8100',
    brand: 'START International',
    image: '/images/products/ldx8100.webp',
    datasheet: '/datasheets/start-ldx8100.pdf',
    short: {
      hu: 'Szupergyors címkeadagoló hosszú, széles címkékhez, 198 mm/s sebességgel.',
      en: 'Super-speed label dispenser for long, wide labels at 198 mm/s.', it: 'Spellicolatore superveloce per etichette lunghe e larghe a 198 mm/s.', es: 'Dispensador de etiquetas superrápido para etiquetas largas y anchas a 198 mm/s.', de: 'Superschneller Etikettenspender für lange, breite Etiketten mit 198 mm/s.', ko: '198 mm/s 속도로 길고 넓은 라벨을 처리하는 초고속 라벨 디스펜서.', zh: '以 198 mm/s 处理长幅宽幅标签的超高速标签剥离机。',
    },
    description: {
      hu: 'Az LDX8100 szupergyors elektromos címkeadagoló hosszú, széles csomagoló-címkékhez — az LDX8050 gyorsabb változata, 7,8" (198 mm/s) adagolási sebességgel. Nagy nyomatékú motor a nagy átmérőjű (max. 305 mm) tekercsekhez, állítható leválasztólemez, fotoszenzoros pontosság, automatikus hordozó-felcsévélés. Címkeszélesség 6–203 mm, hossz 13–305 mm. Amerikai gyártás.',
      en: 'The LDX8100 is a super-speed electric label dispenser for long, wide packaging labels — the faster version of the LDX8050 at 7.8" (198 mm/s) feed speed. High-torque motor for large-diameter rolls (max. 305 mm), adjustable strip plate, photosensor accuracy, automatic liner rewind. Label width 6–203 mm, length 13–305 mm. Made in the U.S.A.', it: 'L’LDX8100 è uno spellicolatore elettrico superveloce per etichette da imballaggio lunghe e larghe — la versione più rapida dell’LDX8050, con velocità di avanzamento di 7,8" (198 mm/s). Motore ad alta coppia per rotoli di grande diametro (max. 305 mm), piastra di distacco regolabile, precisione con fotosensore, riavvolgimento automatico del liner. Larghezza etichetta 6–203 mm, lunghezza 13–305 mm. Prodotto negli U.S.A.', es: 'El LDX8100 es un dispensador eléctrico de etiquetas superrápido para etiquetas de envase largas y anchas: la versión más rápida del LDX8050, con una velocidad de avance de 7,8" (198 mm/s). Motor de alto par para rollos de gran diámetro (máx. 305 mm), placa de despegado ajustable, precisión por fotosensor y rebobinado automático del liner. Ancho de etiqueta 6–203 mm, longitud 13–305 mm. Fabricado en EE. UU.', de: 'Der LDX8100 ist ein superschneller elektrischer Etikettenspender für lange, breite Verpackungsetiketten — die schnellere Version des LDX8050 mit 7,8" (198 mm/s) Vorschubgeschwindigkeit. Drehmomentstarker Motor für große Rollen (max. 305 mm), verstellbare Spendekante, Fotosensor-Genauigkeit, automatische Aufwicklung des Trägermaterials. Etikettenbreite 6–203 mm, Länge 13–305 mm. Hergestellt in den USA.', ko: 'LDX8100은 길고 넓은 포장 라벨을 위한 초고속 전동 라벨 디스펜서로, 7.8"(198 mm/s)의 이송 속도를 갖춘 LDX8050의 고속 버전입니다. 대직경 롤(최대 305 mm)용 고토크 모터, 조정 가능한 스트립 플레이트, 포토센서 정밀도, 자동 라이너 리와인딩을 갖추었습니다. 라벨 폭 6–203 mm, 길이 13–305 mm. 미국산.', zh: 'LDX8100 是一款超高速电动标签剥离机，适用于长幅宽幅包装标签——是 LDX8050 的提速版本，送标速度达 7.8"（198 mm/s）。高扭矩电机适配大直径卷料（最大 305 mm），可调剥离板，光电传感器精度，底纸自动回卷。标签宽度 6–203 mm，长度 13–305 mm。美国制造。',
    },
    features: [
      { hu: 'Címkeszélesség 6–203 mm, hossz 13–305 mm', en: 'Label width 6–203 mm, length 13–305 mm', it: 'Larghezza etichetta 6–203 mm, lunghezza 13–305 mm', es: 'Ancho de etiqueta 6–203 mm, longitud 13–305 mm', de: 'Etikettenbreite 6–203 mm, Länge 13–305 mm', ko: '라벨 폭 6–203 mm, 길이 13–305 mm', zh: '标签宽度 6–203 mm，长度 13–305 mm' },
      { hu: 'Adagolási sebesség 198 mm/s', en: 'Feed speed 198 mm/s', it: 'Velocità di avanzamento 198 mm/s', es: 'Velocidad de avance 198 mm/s', de: 'Vorschubgeschwindigkeit 198 mm/s', ko: '이송 속도 198 mm/s', zh: '送标速度 198 mm/s' },
      { hu: 'Max. tekercsátmérő 305 mm', en: 'Max. roll diameter 305 mm', it: 'Diametro massimo rotolo 305 mm', es: 'Diámetro máx. de rollo 305 mm', de: 'Max. Rollendurchmesser 305 mm', ko: '최대 롤 직경 305 mm', zh: '最大卷径 305 mm' },
      { hu: 'Nagy nyomatékú motor', en: 'High-torque motor', it: 'Motore ad alta coppia', es: 'Motor de alto par', de: 'Drehmomentstarker Motor', ko: '고토크 모터', zh: '高扭矩电机' },
      { hu: 'Fotoszenzoros pontosság', en: 'Photosensor accuracy', it: 'Precisione con fotosensore', es: 'Precisión por fotosensor', de: 'Fotosensor-Genauigkeit', ko: '포토센서 정밀도', zh: '光电传感器精度' },
    ],
  },
  {
    slug: 'start-zcm1000',
    category: 'ragaszto-adagolok',
    name: 'START ZCM1000',
    brand: 'START International',
    image: '/images/products/zcm1000.webp',
    datasheet: '/datasheets/start-zcm1000.pdf',
    short: {
      hu: 'Elektromos, automata szalagadagoló akár 51 mm széles szalaghoz — a sor legkisebb tagja.',
      en: 'Electric automatic tape dispenser for tape up to 51 mm wide — the smallest of the range.', it: 'Dispenser per nastro adesivo automatico elettrico per nastri fino a 51 mm di larghezza: il più piccolo della gamma.', es: 'Dispensador de cinta adhesiva automático eléctrico para cintas de hasta 51 mm de ancho: el más pequeño de la gama.', de: 'Elektrischer automatischer Klebebandspender für Bänder bis 51 mm Breite — das kleinste Modell der Reihe.', ko: '최대 51 mm 폭 테이프용 전동 자동 테이프 디스펜서 — 제품군 중 가장 작은 모델.', zh: '电动自动胶带切割机，适用于最宽 51 mm 的胶带——系列中最小的机型。',
    },
    description: {
      hu: 'A ZCM1000 (az eredeti M1000) elektromos, automata szalagadagoló: a beállított hosszúságú szalagot magától előtolja és elvágja, akár 2˝ (51 mm) szélességig. A hossz digitálisan, LED-kijelzőn állítható 20 és 999 mm között, a vágáspontosság ±1 mm. A kimeneten fotocella érzékeli a szalagot, így az adagolás egyenletes; nyomógombbal kézzel is működtethető. A nyomógörgő szorítása a szalag vastagságához igazítható, a vágás egyenes szalagvéget ad. A 3 az 1-ben magtartó 25, 35 és 76 mm-es magátmérőt fogad, a tekercs külső átmérője legfeljebb 178 mm. Acél váz, lángálló antisztatikus burkolat; a vágókés élettartama kb. 200 000 vágás.',
      en: 'The ZCM1000 (the original M1000) is an electric, automatic tape dispenser that feeds and cuts tape to a preset length, up to 2˝ (51 mm) wide. The length is set digitally on the LED display between 20 and 999 mm, with ±1 mm cutting accuracy. A photosensor at the outlet detects the tape for consistent feeding; it can also be operated manually with a push button. Feed roller pressure is adjustable for tape thickness, and the cut leaves a straight tape end. The 3-in-1 core holder accepts 25, 35 and 76 mm cores, with a roll outside diameter of up to 178 mm. Steel frame with a flame-retardant, anti-static cabinet; estimated blade life is about 200,000 cuts.', it: 'Lo ZCM1000 (l’originale M1000) è un dispenser per nastro adesivo elettrico e automatico: avanza e taglia il nastro alla lunghezza impostata, fino a 2˝ (51 mm) di larghezza. La lunghezza si imposta digitalmente sul display LED tra 20 e 999 mm, con una precisione di taglio di ±1 mm. Un fotosensore all’uscita rileva il nastro per un’alimentazione costante; il funzionamento è possibile anche manualmente con un pulsante. La pressione del rullo di trascinamento è regolabile in base allo spessore del nastro e il taglio lascia un bordo netto. Il porta-anima 3 in 1 accetta anime da 25, 35 e 76 mm, con un diametro esterno del rotolo fino a 178 mm. Telaio in acciaio e carrozzeria in composito antistatico e ignifugo; la durata stimata della lama è di circa 200.000 tagli.', es: 'El ZCM1000 (el M1000 original) es un dispensador de cinta adhesiva eléctrico y automático: avanza y corta la cinta a la longitud programada, hasta 2˝ (51 mm) de ancho. La longitud se ajusta digitalmente en la pantalla LED entre 20 y 999 mm, con una precisión de corte de ±1 mm. Un fotosensor en la salida detecta la cinta para una alimentación constante; también puede accionarse manualmente con un pulsador. La presión del rodillo de arrastre es ajustable según el grosor de la cinta y el corte deja un borde recto. El portamandriles 3 en 1 admite mandriles de 25, 35 y 76 mm, con un diámetro exterior de rollo de hasta 178 mm. Bastidor de acero y carcasa de material compuesto antiestático e ignífugo; la vida útil estimada de la cuchilla es de unos 200.000 cortes.', de: 'Der ZCM1000 (der originale M1000) ist ein elektrischer, automatischer Klebebandspender: Er transportiert das Band auf die eingestellte Länge vor und schneidet es ab, bei einer Breite bis 2˝ (51 mm). Die Länge wird digital am LED-Display zwischen 20 und 999 mm eingestellt, die Schnittgenauigkeit beträgt ±1 mm. Ein Fotosensor am Auslauf erkennt das Band für einen gleichmäßigen Vorschub; der Betrieb ist auch manuell per Taster möglich. Der Anpressdruck der Vorschubrolle lässt sich an die Banddicke anpassen, der Schnitt ergibt eine gerade Bandkante. Der 3-in-1-Kernhalter nimmt Kerne von 25, 35 und 76 mm auf, der Rollenaußendurchmesser darf bis 178 mm betragen. Stahlrahmen und Gehäuse aus flammhemmendem, antistatischem Verbundwerkstoff; die geschätzte Messerlebensdauer liegt bei etwa 200.000 Schnitten.', ko: 'ZCM1000(오리지널 M1000)은 전동 자동 테이프 디스펜서로, 설정한 길이만큼 테이프를 자동으로 이송하고 절단합니다. 테이프 폭은 최대 2˝(51 mm)입니다. 길이는 LED 디스플레이에서 20~999 mm 범위로 디지털 설정하며, 절단 정밀도는 ±1 mm입니다. 배출구의 포토센서가 테이프를 감지해 균일하게 이송하고, 푸시버튼으로 수동 조작도 가능합니다. 이송 롤러의 압력은 테이프 두께에 맞게 조정할 수 있으며, 절단면은 직선으로 마감됩니다. 3-in-1 코어 홀더는 25, 35, 76 mm 코어를 지원하고, 롤 외경은 최대 178 mm입니다. 강철 프레임과 난연·정전기 방지 복합재 하우징을 갖추었으며, 커터 수명은 약 200,000회 절단입니다.', zh: 'ZCM1000（原版 M1000）是一款电动自动胶带切割机：可按设定长度自动送带并切断，胶带宽度最大 2˝（51 mm）。长度通过 LED 显示屏以数字方式在 20 至 999 mm 之间设定，切割精度为 ±1 mm。出口处的光电传感器检测胶带，确保送带稳定，也可用按钮手动操作。送带滚轮压力可根据胶带厚度调节，切口平直。3 合 1 卷芯座支持 25、35 和 76 mm 卷芯，卷料外径最大 178 mm。钢制机架，外壳采用阻燃防静电复合材料；刀片寿命约为 200,000 次切割。',
    },
    features: [
      { hu: 'Szalagszélesség 7–51 mm', en: 'Tape width 7–51 mm', it: 'Larghezza nastro 7–51 mm', es: 'Ancho de cinta 7–51 mm', de: 'Klebebandbreite 7–51 mm', ko: '테이프 폭 7–51 mm', zh: '胶带宽度 7–51 mm' },
      { hu: 'Vágáshossz 20–999 mm, ±1 mm pontosság', en: 'Cut length 20–999 mm, ±1 mm accuracy', it: 'Lunghezza di taglio 20–999 mm, precisione ±1 mm', es: 'Longitud de corte 20–999 mm, precisión ±1 mm', de: 'Schnittlänge 20–999 mm, Genauigkeit ±1 mm', ko: '커팅 길이 20–999 mm, 정밀도 ±1 mm', zh: '切割长度 20–999 mm，精度 ±1 mm' },
      { hu: 'Fotocellás vagy nyomógombos indítás', en: 'Photocell or push-button actuation', it: 'Azionamento con fotocellula o pulsante', es: 'Accionamiento por fotocélula o pulsador', de: 'Auslösung per Fotozelle oder Taster', ko: '포토셀 또는 푸시버튼 작동', zh: '光电传感器或按钮启动' },
      { hu: 'Digitális (LED) hosszbeállítás', en: 'Digital (LED) length adjustment', it: 'Regolazione digitale (LED) della lunghezza', es: 'Ajuste digital (LED) de la longitud', de: 'Digitale (LED) Längeneinstellung', ko: '디지털(LED) 길이 조정', zh: '数字（LED）长度设定' },
      { hu: 'Max. tekercsátmérő 178 mm, 3 az 1-ben magtartó (25/35/76 mm)', en: 'Max. roll diameter 178 mm, 3-in-1 core holder (25/35/76 mm)', it: 'Diametro massimo rotolo 178 mm, porta-anima 3 in 1 (25/35/76 mm)', es: 'Diámetro máx. de rollo 178 mm, portamandriles 3 en 1 (25/35/76 mm)', de: 'Max. Rollendurchmesser 178 mm, 3-in-1-Kernhalter (25/35/76 mm)', ko: '최대 롤 직경 178 mm, 3-in-1 코어 홀더(25/35/76 mm)', zh: '最大卷径 178 mm，3 合 1 卷芯座（25/35/76 mm）' },
      { hu: 'Vágókés élettartama kb. 200 000 vágás', en: 'Estimated blade life about 200,000 cuts', it: 'Durata stimata della lama circa 200.000 tagli', es: 'Vida útil estimada de la cuchilla unos 200.000 cortes', de: 'Geschätzte Messerlebensdauer ca. 200.000 Schnitte', ko: '커터 수명 약 200,000회 절단', zh: '刀片寿命约 200,000 次切割' },
    ],
  },
  {
    slug: 'start-tda060',
    category: 'ragaszto-adagolok',
    name: 'START TDA060',
    brand: 'START International',
    image: '/images/products/tda060.webp',
    datasheet: '/datasheets/start-tda060.pdf',
    short: {
      hu: 'A legtöbbet tudó szalagadagoló 60 mm-ig: 8 memóriahely, számláló, két tekercs.',
      en: 'The most versatile tape dispenser up to 60 mm: 8 memories, counter, two rolls.', it: 'Il dispenser più versatile fino a 60 mm: 8 memorie, contatore, due rotoli.', es: 'El dispensador más versátil hasta 60 mm: 8 memorias, contador, dos rollos.', de: 'Der vielseitigste Klebebandspender bis 60 mm: 8 Speicherplätze, Zähler, zwei Rollen.', ko: '60 mm까지 가장 다재다능한 테이프 디스펜서: 메모리 8개, 카운터, 2롤 지원.', zh: '60 mm 以内功能最全面的胶带切割机：8 组记忆、计数器、双卷供带。',
    },
    description: {
      hu: 'A TDA060 a sorozat legtöbbet tudó elektromos szalagadagolója: a beállított hosszúságú szalagot magától előtolja és elvágja, 5 mm-től 9999 mm-ig, akár 2,3˝ (60 mm) szélességig. Nyolc hossz tárolható memóriában, a beépített számláló felfelé vagy lefelé is számol, az adagolási sebesség állítható, és két tekercs egyidejű adagolására is képes. A kimeneten fotocella érzékeli a szalagot; nyomógombbal kézzel is működtethető. A vágáspontosság ±1 mm, a vágás egyenes szalagvéget ad. Sokféle szalagot fogad — cellofán, papír, szövet, kétoldalas, filament, akril —, sőt ragasztó nélküli anyagokat is (szalag, tömlő). A 3 az 1-ben magtartó 25, 35 és 76 mm-es magátmérőt fogad, a tekercs külső átmérője legfeljebb 190 mm. Acél váz, lángálló antisztatikus burkolat; a tápellátás 110–240 V között automatikusan igazodik.',
      en: 'The TDA060 is the most versatile electric tape dispenser of the range: it feeds and cuts tape to a preset length from 5 mm to 9,999 mm, up to 2.3˝ (60 mm) wide. Eight lengths can be stored in memory, the built-in counter counts up or down, the feed speed is adjustable, and it can dispense from two rolls at once. A photosensor at the outlet detects the tape; it can also be operated manually with a push button. Cutting accuracy is ±1 mm and the cut leaves a straight tape end. It handles a wide variety of tapes — cellophane, kraft, cloth, double-sided, filament, acrylic — and even non-adhesive materials such as ribbon or tubing. The 3-in-1 core holder accepts 25, 35 and 76 mm cores, with a roll outside diameter of up to 190 mm. Steel frame with a flame-retardant, anti-static cabinet; the power supply adapts automatically between 110 and 240 V.', it: 'Il TDA060 è il dispenser per nastro adesivo elettrico più versatile della gamma: avanza e taglia il nastro alla lunghezza impostata, da 5 mm a 9.999 mm, fino a 2,3˝ (60 mm) di larghezza. Otto lunghezze possono essere memorizzate, il contatore integrato conta in avanti o a scalare, la velocità di avanzamento è regolabile e può alimentare due rotoli contemporaneamente. Un fotosensore all’uscita rileva il nastro; il funzionamento è possibile anche manualmente con un pulsante. La precisione di taglio è di ±1 mm e il taglio lascia un bordo netto. Accetta un’ampia varietà di nastri — cellophane, kraft, tela, biadesivo, filamento, acrilico — e anche materiali non adesivi come nastri o tubi. Il porta-anima 3 in 1 accetta anime da 25, 35 e 76 mm, con un diametro esterno del rotolo fino a 190 mm. Telaio in acciaio e carrozzeria in composito antistatico e ignifugo; l’alimentazione si adatta automaticamente tra 110 e 240 V.', es: 'El TDA060 es el dispensador de cinta adhesiva eléctrico más versátil de la gama: avanza y corta la cinta a la longitud programada, de 5 mm a 9.999 mm, hasta 2,3˝ (60 mm) de ancho. Pueden guardarse ocho longitudes en memoria, el contador integrado cuenta de forma ascendente o descendente, la velocidad de avance es ajustable y admite el suministro simultáneo de dos rollos. Un fotosensor en la salida detecta la cinta; también puede accionarse manualmente con un pulsador. La precisión de corte es de ±1 mm y el corte deja un borde recto. Acepta una gran variedad de cintas — celofán, kraft, tela, doble cara, filamento, acrílico — e incluso materiales sin adhesivo como cintas o tubos. El portamandriles 3 en 1 admite mandriles de 25, 35 y 76 mm, con un diámetro exterior de rollo de hasta 190 mm. Bastidor de acero y carcasa de material compuesto antiestático e ignífugo; la alimentación se adapta automáticamente entre 110 y 240 V.', de: 'Der TDA060 ist der vielseitigste elektrische Klebebandspender der Reihe: Er transportiert das Band auf die eingestellte Länge vor und schneidet es ab, von 5 mm bis 9.999 mm, bei einer Breite bis 2,3˝ (60 mm). Acht Längen lassen sich speichern, der eingebaute Zähler zählt auf- oder abwärts, die Vorschubgeschwindigkeit ist einstellbar, und zwei Rollen können gleichzeitig verarbeitet werden. Ein Fotosensor am Auslauf erkennt das Band; der Betrieb ist auch manuell per Taster möglich. Die Schnittgenauigkeit beträgt ±1 mm, der Schnitt ergibt eine gerade Bandkante. Er verarbeitet viele Bandarten — Zellophan, Kraftpapier, Gewebe, doppelseitig, Filament, Acryl — und sogar nicht klebende Materialien wie Bänder oder Schläuche. Der 3-in-1-Kernhalter nimmt Kerne von 25, 35 und 76 mm auf, der Rollenaußendurchmesser darf bis 190 mm betragen. Stahlrahmen und Gehäuse aus flammhemmendem, antistatischem Verbundwerkstoff; die Stromversorgung stellt sich automatisch zwischen 110 und 240 V ein.', ko: 'TDA060은 제품군 중 가장 다재다능한 전동 테이프 디스펜서입니다. 설정한 길이만큼 테이프를 자동으로 이송하고 절단하며, 길이는 5 mm에서 9,999 mm까지, 폭은 최대 2.3˝(60 mm)입니다. 여덟 가지 길이를 메모리에 저장할 수 있고, 내장 카운터는 증가·감소 방식 모두 지원하며, 이송 속도를 조절할 수 있고 두 개의 롤을 동시에 사용할 수도 있습니다. 배출구의 포토센서가 테이프를 감지하며, 푸시버튼으로 수동 조작도 가능합니다. 절단 정밀도는 ±1 mm이며 절단면은 직선으로 마감됩니다. 셀로판, 크라프트, 천, 양면, 필라멘트, 아크릴 등 다양한 테이프는 물론 리본이나 튜브 같은 비접착 소재도 처리합니다. 3-in-1 코어 홀더는 25, 35, 76 mm 코어를 지원하고 롤 외경은 최대 190 mm입니다. 강철 프레임과 난연·정전기 방지 복합재 하우징을 갖추었으며, 전원은 110~240 V 범위에서 자동으로 조정됩니다.', zh: 'TDA060 是该系列中功能最全面的电动胶带切割机：可按设定长度自动送带并切断，长度范围 5 mm 至 9,999 mm，胶带宽度最大 2.3˝（60 mm）。可存储八组长度，内置计数器支持递增或递减计数，送带速度可调，并支持双卷同时供带。出口处的光电传感器检测胶带，也可用按钮手动操作。切割精度为 ±1 mm，切口平直。可处理多种胶带——玻璃纸、牛皮纸、布基、双面、纤维、丙烯酸——甚至可处理丝带、软管等无胶材料。3 合 1 卷芯座支持 25、35 和 76 mm 卷芯，卷料外径最大 190 mm。钢制机架，外壳采用阻燃防静电复合材料；电源在 110 至 240 V 之间自动适配。',
    },
    features: [
      { hu: 'Szalagszélesség 5–60 mm', en: 'Tape width 5–60 mm', it: 'Larghezza nastro 5–60 mm', es: 'Ancho de cinta 5–60 mm', de: 'Klebebandbreite 5–60 mm', ko: '테이프 폭 5–60 mm', zh: '胶带宽度 5–60 mm' },
      { hu: 'Vágáshossz 5–9999 mm, ±1 mm pontosság', en: 'Cut length 5–9999 mm, ±1 mm accuracy', it: 'Lunghezza di taglio 5–9999 mm, precisione ±1 mm', es: 'Longitud de corte 5–9999 mm, precisión ±1 mm', de: 'Schnittlänge 5–9999 mm, Genauigkeit ±1 mm', ko: '커팅 길이 5–9999 mm, 정밀도 ±1 mm', zh: '切割长度 5–9999 mm，精度 ±1 mm' },
      { hu: '8 programozható memóriahely, fel/le számláló', en: '8 programmable memories, up/down counter', it: '8 memorie programmabili, contatore avanti/indietro', es: '8 memorias programables, contador ascendente/descendente', de: '8 programmierbare Speicherplätze, Auf-/Abwärtszähler', ko: '프로그램 가능한 메모리 8개, 증감 카운터', zh: '8 组可编程记忆，递增/递减计数器' },
      { hu: 'Két tekercs egyidejű adagolása, állítható sebesség', en: 'Two-roll dispensing, adjustable speed', it: 'Erogazione da due rotoli, velocità regolabile', es: 'Suministro de dos rollos, velocidad ajustable', de: 'Abgabe von zwei Rollen, einstellbare Geschwindigkeit', ko: '2롤 동시 공급, 속도 조절 가능', zh: '双卷同时供带，速度可调' },
      { hu: 'Ragasztó nélküli anyagokhoz is (szalag, tömlő)', en: 'Also for non-adhesive materials (ribbon, tubing)', it: 'Anche per materiali non adesivi (nastri, tubi)', es: 'También para materiales sin adhesivo (cintas, tubos)', de: 'Auch für nicht klebende Materialien (Bänder, Schläuche)', ko: '비접착 소재(리본, 튜브)도 사용 가능', zh: '亦可处理无胶材料（丝带、软管）' },
      { hu: 'Max. tekercsátmérő 190 mm, 3 az 1-ben magtartó (25/35/76 mm)', en: 'Max. roll diameter 190 mm, 3-in-1 core holder (25/35/76 mm)', it: 'Diametro massimo rotolo 190 mm, porta-anima 3 in 1 (25/35/76 mm)', es: 'Diámetro máx. de rollo 190 mm, portamandriles 3 en 1 (25/35/76 mm)', de: 'Max. Rollendurchmesser 190 mm, 3-in-1-Kernhalter (25/35/76 mm)', ko: '최대 롤 직경 190 mm, 3-in-1 코어 홀더(25/35/76 mm)', zh: '最大卷径 190 mm，3 合 1 卷芯座（25/35/76 mm）' },
    ],
  },
  {
    slug: 'start-tda080',
    category: 'ragaszto-adagolok',
    name: 'START TDA080',
    brand: 'START International',
    image: '/images/products/tda080.webp',
    datasheet: '/datasheets/start-tda080.pdf',
    short: {
      hu: 'Elektromos, automata nagy teherbírású szalagadagoló akár 80 mm széles szalaghoz.',
      en: 'Electric automatic heavy-duty tape dispenser for tape up to 80 mm wide.', it: 'Dispenser per nastro adesivo automatico elettrico per impieghi gravosi, per nastri fino a 80 mm di larghezza.', es: 'Dispensador de cinta adhesiva automático, eléctrico y de uso intensivo para cinta de hasta 80 mm de ancho.', de: 'Elektrischer automatischer Heavy-Duty-Klebebandspender für Bänder bis 80 mm Breite.', ko: '최대 80 mm 폭 테이프를 위한 전동 자동 헤비듀티 테이프 디스펜서.', zh: '适用于最宽 80 mm 胶带的重载型电动自动胶带切割机。',
    },
    description: {
      hu: 'A TDA080 elektromos, nagy teherbírású automata szalagadagoló, amely a legtöbb szalagtípust automatikusan adagolja és vágja, akár 3,15" (80 mm) szélességig. A kívánt hossz digitálisan programozható, a vágáspontosság ±1 mm. Négy üzemmód: kézi adagolás/kézi vágás, kézi adagolás és vágás, automata adagolás és vágás, valamint intervallumos adagolás és vágás. Tömör fémfelépítés, biztonsági retesz, 3" (76 mm) mag. Amerikai tervezés.',
      en: 'The TDA080 is an electric, heavy-duty automatic tape dispenser that automatically dispenses and cuts most types of tape up to 3.15" (80 mm) wide. The desired length is digitally programmable with ±1 mm cutting accuracy. Four operating modes: manual feed/manual cut, manual feed & cut, auto feed & cut, and interval feed & cut. Solid metal construction, safety interlock, 3" (76 mm) core. Designed in the U.S.A.', it: 'Il TDA080 è un dispenser per nastro adesivo automatico elettrico per impieghi gravosi, che eroga e taglia automaticamente la maggior parte dei tipi di nastro fino a 3,15" (80 mm) di larghezza. La lunghezza desiderata è programmabile digitalmente con una precisione di taglio di ±1 mm. Quattro modalità operative: avanzamento manuale/taglio manuale, avanzamento e taglio manuali, avanzamento e taglio automatici e avanzamento e taglio a intervalli. Solida costruzione metallica, interblocco di sicurezza, anima da 3" (76 mm). Progettato negli U.S.A.', es: 'El TDA080 es un dispensador de cinta adhesiva automático, eléctrico y de uso intensivo que dispensa y corta automáticamente la mayoría de tipos de cinta de hasta 3,15" (80 mm) de ancho. La longitud deseada es programable digitalmente con una precisión de corte de ±1 mm. Cuatro modos de funcionamiento: avance manual/corte manual, avance y corte manuales, avance y corte automáticos, y avance y corte por intervalos. Construcción metálica sólida, enclavamiento de seguridad y mandril de 3" (76 mm). Diseñado en EE. UU.', de: 'Der TDA080 ist ein elektrischer, automatischer Heavy-Duty-Klebebandspender, der die meisten Klebebandtypen bis 3,15" (80 mm) Breite automatisch spendet und schneidet. Die gewünschte Länge ist digital programmierbar mit ±1 mm Schnittgenauigkeit. Vier Betriebsmodi: manueller Vorschub/manueller Schnitt, manueller Vorschub & Schnitt, automatischer Vorschub & Schnitt sowie Intervall-Vorschub & Schnitt. Solide Metallkonstruktion, Sicherheitsverriegelung, 3"-Kern (76 mm). Entwickelt in den USA.', ko: 'TDA080은 최대 3.15"(80 mm) 폭의 대부분의 테이프를 자동으로 디스펜싱하고 커팅하는 전동 헤비듀티 자동 테이프 디스펜서입니다. 원하는 길이를 디지털 방식으로 프로그래밍할 수 있으며 커팅 정밀도는 ±1 mm입니다. 4가지 작동 모드를 제공합니다: 수동 이송/수동 커팅, 수동 이송 & 커팅, 자동 이송 & 커팅, 인터벌 이송 & 커팅. 견고한 금속 구조, 안전 인터록, 3"(76 mm) 코어. 미국에서 설계되었습니다.', zh: 'TDA080 是一款重载型电动自动胶带切割机，可自动送出并切割宽度最大 3.15"（80 mm）的大多数类型胶带。所需长度可数字化编程，切割精度 ±1 mm。四种工作模式：手动送带/手动切割、手动送带并切割、自动送带并切割、间隔送带并切割。坚固的金属结构，安全联锁，3"（76 mm）卷芯。美国设计。',
    },
    features: [
      { hu: 'Szalagszélesség 6–80 mm', en: 'Tape width 6–80 mm', it: 'Larghezza nastro 6–80 mm', es: 'Ancho de cinta 6–80 mm', de: 'Klebebandbreite 6–80 mm', ko: '테이프 폭 6–80 mm', zh: '胶带宽度 6–80 mm' },
      { hu: 'Vágáshossz 40–9999 mm', en: 'Cut length 40–9999 mm', it: 'Lunghezza di taglio 40–9999 mm', es: 'Longitud de corte 40–9999 mm', de: 'Schnittlänge 40–9999 mm', ko: '커팅 길이 40–9999 mm', zh: '切割长度 40–9999 mm' },
      { hu: 'Vágáspontosság ±1 mm', en: 'Cutting accuracy ±1 mm', it: 'Precisione di taglio ±1 mm', es: 'Precisión de corte ±1 mm', de: 'Schnittgenauigkeit ±1 mm', ko: '커팅 정밀도 ±1 mm', zh: '切割精度 ±1 mm' },
      { hu: '4 üzemmód', en: '4 operating modes', it: '4 modalità operative', es: '4 modos de funcionamiento', de: '4 Betriebsmodi', ko: '4가지 작동 모드', zh: '4 种工作模式' },
      { hu: 'Max. tekercsátmérő 220 mm, 3" mag', en: 'Max. roll diameter 220 mm, 3" core', it: 'Diametro massimo rotolo 220 mm, anima da 3"', es: 'Diámetro máx. de rollo 220 mm, mandril de 3"', de: 'Max. Rollendurchmesser 220 mm, 3"-Kern', ko: '최대 롤 직경 220 mm, 3" 코어', zh: '最大卷径 220 mm，3" 卷芯' },
    ],
  },
  {
    slug: 'start-tda080-ns',
    category: 'ragaszto-adagolok',
    name: 'START TDA080-NS',
    brand: 'START International',
    image: '/images/products/tda080-ns.webp',
    datasheet: '/datasheets/start-tda080-ns.pdf',
    short: {
      hu: 'Szalagadagoló erős tapadású, technikai szalagokhoz (VHB, ACX, hab).',
      en: 'Tape dispenser for high-adhesive, technical tapes (VHB, ACX, foam).', it: 'Dispenser per nastro adesivo per nastri tecnici ad alta adesività (VHB, ACX, schiuma).', es: 'Dispensador de cinta adhesiva para cintas técnicas de alta adherencia (VHB, ACX, espuma).', de: 'Klebebandspender für stark haftende, technische Bänder (VHB, ACX, Schaumstoff).', ko: '고점착·기능성 테이프(VHB, ACX, 폼)용 테이프 디스펜서.', zh: '适用于高粘性技术胶带（VHB、ACX、泡棉）的胶带切割机。',
    },
    description: {
      hu: 'A TDA080-NS a TDA080 módosított változata: speciális, lapos adagológörgőkkel a nagy tapadású és technikai szalagokhoz (pl. VHB, ACX, hab, kétoldalas, PET, fátyolszövet). Automatikusan adagolja és vágja szinte az összes szalagtípust akár 3,15" (80 mm) szélességig. Digitálisan programozható hossz, ±1 mm vágáspontosság, négy üzemmód, tömör fémfelépítés. 3" (76 mm) mag. Amerikai tervezés.',
      en: 'The TDA080-NS is a modified TDA080 with special flat advancement rollers for high-adhesive and technical tapes (e.g. VHB, ACX, foam, double-sided, PET, fleece). It automatically dispenses and cuts virtually any tape up to 3.15" (80 mm) wide. Digitally programmable length, ±1 mm cutting accuracy, four operating modes, solid metal construction. 3" (76 mm) core. Designed in the U.S.A.', it: 'Il TDA080-NS è un TDA080 modificato con speciali rulli di avanzamento piatti per nastri ad alta adesività e tecnici (ad es. VHB, ACX, schiuma, biadesivi, PET, tessuto non tessuto). Eroga e taglia automaticamente praticamente qualsiasi nastro fino a 3,15" (80 mm) di larghezza. Lunghezza programmabile digitalmente, precisione di taglio di ±1 mm, quattro modalità operative, solida costruzione metallica. Anima da 3" (76 mm). Progettato negli U.S.A.', es: 'El TDA080-NS es un TDA080 modificado con rodillos de avance planos especiales para cintas técnicas y de alta adherencia (p. ej. VHB, ACX, espuma, doble cara, PET, fieltro). Dispensa y corta automáticamente prácticamente cualquier cinta de hasta 3,15" (80 mm) de ancho. Longitud programable digitalmente, precisión de corte de ±1 mm, cuatro modos de funcionamiento y construcción metálica sólida. Mandril de 3" (76 mm). Diseñado en EE. UU.', de: 'Der TDA080-NS ist ein modifizierter TDA080 mit speziellen flachen Vorschubrollen für stark haftende und technische Klebebänder (z. B. VHB, ACX, Schaumstoff, doppelseitig, PET, Vlies). Er spendet und schneidet automatisch praktisch jedes Klebeband bis 3,15" (80 mm) Breite. Digital programmierbare Länge, ±1 mm Schnittgenauigkeit, vier Betriebsmodi, solide Metallkonstruktion. 3"-Kern (76 mm). Entwickelt in den USA.', ko: 'TDA080-NS는 고점착 및 기능성 테이프(예: VHB, ACX, 폼, 양면, PET, 플리스)를 위한 특수 평면 이송 롤러를 장착한 TDA080의 개조 버전입니다. 최대 3.15"(80 mm) 폭의 거의 모든 테이프를 자동으로 디스펜싱하고 커팅합니다. 디지털 방식의 길이 프로그래밍, ±1 mm 커팅 정밀도, 4가지 작동 모드, 견고한 금속 구조를 갖추었습니다. 3"(76 mm) 코어. 미국에서 설계되었습니다.', zh: 'TDA080-NS 是 TDA080 的改进版本，配备特殊的平面送带辊，适用于高粘性及技术类胶带（如 VHB、ACX、泡棉、双面胶、PET、无纺布）。可自动送出并切割几乎所有宽度最大 3.15"（80 mm）的胶带。长度可数字化编程，切割精度 ±1 mm，四种工作模式，坚固的金属结构。3"（76 mm）卷芯。美国设计。',
    },
    features: [
      { hu: 'Erős tapadású / technikai szalagokhoz', en: 'For high-adhesive / technical tapes', it: 'Per nastri ad alta adesività / tecnici', es: 'Para cintas de alta adherencia / técnicas', de: 'Für stark haftende / technische Klebebänder', ko: '고점착 / 기능성 테이프용', zh: '适用于高粘性 / 技术类胶带' },
      { hu: 'Speciális lapos adagológörgők', en: 'Special flat advancement rollers', it: 'Speciali rulli di avanzamento piatti', es: 'Rodillos de avance planos especiales', de: 'Spezielle flache Vorschubrollen', ko: '특수 평면 이송 롤러', zh: '特殊平面送带辊' },
      { hu: 'Szalagszélesség 6–80 mm', en: 'Tape width 6–80 mm', it: 'Larghezza nastro 6–80 mm', es: 'Ancho de cinta 6–80 mm', de: 'Klebebandbreite 6–80 mm', ko: '테이프 폭 6–80 mm', zh: '胶带宽度 6–80 mm' },
      { hu: 'Vágáshossz 40–9999 mm, ±1 mm pontosság', en: 'Cut length 40–9999 mm, ±1 mm accuracy', it: 'Lunghezza di taglio 40–9999 mm, precisione ±1 mm', es: 'Longitud de corte 40–9999 mm, precisión de ±1 mm', de: 'Schnittlänge 40–9999 mm, ±1 mm Genauigkeit', ko: '커팅 길이 40–9999 mm, ±1 mm 정밀도', zh: '切割长度 40–9999 mm，精度 ±1 mm' },
      { hu: '4 üzemmód, tömör fémfelépítés', en: '4 operating modes, solid metal build', it: '4 modalità operative, solida struttura metallica', es: '4 modos de funcionamiento, construcción metálica sólida', de: '4 Betriebsmodi, solide Metallkonstruktion', ko: '4가지 작동 모드, 견고한 금속 구조', zh: '4 种工作模式，坚固金属结构' },
    ],
  },
  {
    slug: 'start-tda150-m',
    category: 'ragaszto-adagolok',
    name: 'START TDA150-M',
    brand: 'START International',
    image: '/images/products/tda150-m.webp',
    datasheet: '/datasheets/start-tda150-m.pdf',
    short: {
      hu: 'Nagy teherbírású szalagadagoló akár 150 mm széles szalaghoz, 5 hossz memóriával.',
      en: 'Heavy-duty tape dispenser for tape up to 150 mm wide, with 5-length memory.', it: 'Dispenser per nastro adesivo per impieghi gravosi, per nastri fino a 150 mm di larghezza, con memoria di 5 lunghezze.', es: 'Dispensador de cinta adhesiva de uso intensivo para cinta de hasta 150 mm de ancho, con memoria de 5 longitudes.', de: 'Heavy-Duty-Klebebandspender für Bänder bis 150 mm Breite, mit Speicher für 5 Längen.', ko: '5개 길이 메모리를 갖춘, 최대 150 mm 폭 테이프용 헤비듀티 테이프 디스펜서.', zh: '适用于最宽 150 mm 胶带的重载型胶带切割机，具备 5 组长度记忆。',
    },
    description: {
      hu: 'A TDA150-M elektromos, nagy teherbírású automata szalagadagoló nagyon széles, akár 5,9" (150 mm) szalagokhoz, programozható 5 hosszúság-memóriával. Digitálisan beállítható hossz, ±1 mm vágáspontosság, négy üzemmód, guillotine egyenes vágás. Biztonsági rendszer megakadályozza a vágó működését, ha idegen tárgy (ujj, szerszám) van jelen. Tömör fémfelépítés, minden fém fogaskerék és görgő, 3" (76 mm) mag. Amerikai gyártás.',
      en: 'The TDA150-M is an electric, heavy-duty automatic tape dispenser for very wide tapes up to 5.9" (150 mm), with a programmable 5-length memory. Digitally adjustable length, ±1 mm cutting accuracy, four operating modes, guillotine straight cut. A safety system prevents cutter activation when a foreign object (finger, tool) is present. Solid metal construction with all-metal gears and rollers, 3" (76 mm) core. Made in the U.S.A.', it: 'Il TDA150-M è un dispenser per nastro adesivo automatico elettrico per impieghi gravosi, adatto a nastri molto larghi fino a 5,9" (150 mm), con memoria programmabile di 5 lunghezze. Lunghezza regolabile digitalmente, precisione di taglio di ±1 mm, quattro modalità operative, taglio dritto a ghigliottina. Un sistema di sicurezza impedisce l’attivazione della lama in presenza di un corpo estraneo (dito, utensile). Solida costruzione metallica con ingranaggi e rulli interamente in metallo, anima da 3" (76 mm). Prodotto negli U.S.A.', es: 'El TDA150-M es un dispensador de cinta adhesiva automático, eléctrico y de uso intensivo para cintas muy anchas de hasta 5,9" (150 mm), con una memoria programable de 5 longitudes. Longitud ajustable digitalmente, precisión de corte de ±1 mm, cuatro modos de funcionamiento y corte recto tipo guillotina. Un sistema de seguridad impide la activación de la cuchilla cuando hay un objeto extraño (un dedo, una herramienta). Construcción metálica sólida con engranajes y rodillos totalmente metálicos, mandril de 3" (76 mm). Fabricado en EE. UU.', de: 'Der TDA150-M ist ein elektrischer, automatischer Heavy-Duty-Klebebandspender für sehr breite Klebebänder bis 5,9" (150 mm), mit programmierbarem Speicher für 5 Längen. Digital einstellbare Länge, ±1 mm Schnittgenauigkeit, vier Betriebsmodi, gerader Guillotineschnitt. Ein Sicherheitssystem verhindert die Auslösung des Messers, wenn ein Fremdkörper (Finger, Werkzeug) erkannt wird. Solide Metallkonstruktion mit Zahnrädern und Rollen komplett aus Metall, 3"-Kern (76 mm). Hergestellt in den USA.', ko: 'TDA150-M은 최대 5.9"(150 mm)의 초광폭 테이프를 위한 전동 헤비듀티 자동 테이프 디스펜서로, 프로그래밍 가능한 5개 길이 메모리를 갖추었습니다. 디지털 길이 조정, ±1 mm 커팅 정밀도, 4가지 작동 모드, 기요틴 방식의 직선 커팅을 제공합니다. 안전 시스템이 이물질(손가락, 공구)이 감지되면 커터 작동을 방지합니다. 전체 금속 기어와 롤러를 갖춘 견고한 금속 구조, 3"(76 mm) 코어. 미국산.', zh: 'TDA150-M 是一款重载型电动自动胶带切割机，适用于宽度最大 5.9"（150 mm）的超宽胶带，具备可编程的 5 组长度记忆。长度数字化可调，切割精度 ±1 mm，四种工作模式，铡刀式直线切割。安全系统可在有异物（手指、工具）存在时阻止切刀动作。坚固的金属结构，全金属齿轮与辊轮，3"（76 mm）卷芯。美国制造。',
    },
    features: [
      { hu: 'Szalagszélesség 6–150 mm', en: 'Tape width 6–150 mm', it: 'Larghezza nastro 6–150 mm', es: 'Ancho de cinta 6–150 mm', de: 'Klebebandbreite 6–150 mm', ko: '테이프 폭 6–150 mm', zh: '胶带宽度 6–150 mm' },
      { hu: 'Programozható 5 hossz memória', en: 'Programmable 5-length memory', it: 'Memoria programmabile di 5 lunghezze', es: 'Memoria programable de 5 longitudes', de: 'Programmierbarer Speicher für 5 Längen', ko: '프로그래밍 가능한 5개 길이 메모리', zh: '可编程 5 组长度记忆' },
      { hu: 'Vágáshossz 40–9999 mm, ±1 mm pontosság', en: 'Cut length 40–9999 mm, ±1 mm accuracy', it: 'Lunghezza di taglio 40–9999 mm, precisione ±1 mm', es: 'Longitud de corte 40–9999 mm, precisión de ±1 mm', de: 'Schnittlänge 40–9999 mm, ±1 mm Genauigkeit', ko: '커팅 길이 40–9999 mm, ±1 mm 정밀도', zh: '切割长度 40–9999 mm，精度 ±1 mm' },
      { hu: 'Biztonsági vágóvédelem', en: 'Safety cutter guard', it: 'Protezione di sicurezza della lama', es: 'Protección de seguridad de la cuchilla', de: 'Sicherheits-Messerschutz', ko: '안전 커터 가드', zh: '切刀安全防护' },
      { hu: 'Minden fém fogaskerék és görgő', en: 'All-metal gears and rollers', it: 'Ingranaggi e rulli interamente in metallo', es: 'Engranajes y rodillos totalmente metálicos', de: 'Zahnräder und Rollen komplett aus Metall', ko: '전체 금속 기어 및 롤러', zh: '全金属齿轮与辊轮' },
    ],
  },
  {
    slug: 'purex-400',
    category: 'fust-es-porelszivok',
    name: 'Purex 400',
    brand: 'Purex',
    image: '/images/products/purex-400.webp',
    datasheet: '/datasheets/purex-400i.pdf',
    short: {
      hu: 'A legismertebb Purex sor: 400 m³/h elszívás lézeres jelöléshez, kódoláshoz, elektronikához.',
      en: 'The best-known Purex range: 400 m³/h extraction for laser marking, coding and electronics.', it: 'La gamma Purex più conosciuta: 400 m³/h di aspirazione per marcatura laser, codifica ed elettronica.', es: 'La gama Purex más conocida: 400 m³/h de extracción para marcaje láser, codificación y electrónica.', de: 'Die bekannteste Purex-Reihe: 400 m³/h Absaugung für Laserbeschriftung, Codierung und Elektronik.', ko: '가장 널리 알려진 Purex 제품군: 레이저 마킹, 코딩, 전자 산업을 위한 400 m³/h 집진.', zh: '最知名的 Purex 系列：400 m³/h 抽风量，适用于激光打标、喷码与电子行业。',
    },
    description: {
      hu: 'A 400-as sor a Purex legismertebb elszívó családja: 400 m³/h légmennyiség, kompakt szekrény, és olyan biztonsági megoldások, amelyek a kezelőt és a környezetet is védik. HEPA- és aktívszén-szűrés fogja meg a részecskéket és a gázokat, az automatikus elektronikus szabályozás pedig akkor is tartja az elszívási teljesítményt, amikor a szűrő már telítődik — így nem lassan, észrevétlenül romlik a védelem. Gáz- és részecskeérzékelő figyelmeztet, a gép pedig a csatlakoztatott berendezéssel együtt indítható. Öt változatban készül: az alap 400 és 400i mellett PVC-, ózon- és festékszublimációs kivitelben. Jellemző területek: lézeres gravírozás és kódolás, elektronika, 3D-nyomtatás, gyógyszer- és orvostechnika, laborok.',
      en: 'The 400 range is Purex’s best-known extraction family: 400 m³/h airflow, a compact cabinet, and fail-safes that protect both the operator and the environment. HEPA and activated carbon filtration capture particles and gases, while automatic electronic flow control keeps the extraction rate up even as the filter loads — so protection does not degrade slowly and unnoticed. Gas and particle sensors warn the operator, and the unit can be started together with the connected machine. It comes in five versions: the basic 400 and 400i plus PVC, ozone and dye-sublimation variants. Typical fields: laser engraving and coding, electronics, 3D printing, pharmaceutical and medical, laboratories.', it: 'La gamma 400 è la famiglia di aspiratori più conosciuta di Purex: 400 m³/h di portata d’aria, mobile compatto e sistemi di sicurezza che proteggono sia l’operatore sia l’ambiente. La filtrazione HEPA e a carbone attivo trattiene particelle e gas, mentre il controllo elettronico automatico mantiene la portata di aspirazione anche quando il filtro si carica: la protezione non si degrada lentamente e senza segnali. I sensori di gas e particelle avvisano l’operatore e l’unità può essere avviata insieme alla macchina collegata. È disponibile in cinque versioni: le 400 e 400i di base più le varianti PVC, ozono e sublimazione. Settori tipici: incisione e codifica laser, elettronica, stampa 3D, farmaceutico e medico, laboratori.', es: 'La gama 400 es la familia de extractores más conocida de Purex: 400 m³/h de caudal, armario compacto y sistemas de seguridad que protegen tanto al operario como al entorno. La filtración HEPA y de carbón activo retiene partículas y gases, mientras que el control electrónico automático mantiene la capacidad de extracción incluso cuando el filtro se va colmatando, de modo que la protección no se degrada de forma lenta e inadvertida. Los sensores de gas y partículas avisan al operario y la unidad puede arrancar junto con la máquina conectada. Se fabrica en cinco versiones: las 400 y 400i básicas más las variantes de PVC, ozono y sublimación. Campos habituales: grabado y codificación láser, electrónica, impresión 3D, farmacia y sanidad, laboratorios.', de: 'Die 400er-Reihe ist die bekannteste Absaugfamilie von Purex: 400 m³/h Luftmenge, kompaktes Gehäuse und Sicherheitsfunktionen, die Bediener und Umgebung schützen. HEPA- und Aktivkohlefilter halten Partikel und Gase zurück, und die automatische elektronische Regelung hält die Absaugleistung auch dann, wenn der Filter zusetzt — der Schutz lässt also nicht langsam und unbemerkt nach. Gas- und Partikelsensoren warnen den Bediener, und das Gerät lässt sich gemeinsam mit der angeschlossenen Maschine starten. Es gibt fünf Ausführungen: die Basisgeräte 400 und 400i sowie PVC-, Ozon- und Sublimationsvarianten. Typische Bereiche: Lasergravur und Codierung, Elektronik, 3D-Druck, Pharma und Medizintechnik, Labore.', ko: '400 제품군은 Purex의 가장 널리 알려진 집진 계열입니다. 풍량 400 m³/h, 컴팩트한 캐비닛, 그리고 작업자와 환경을 함께 보호하는 안전 장치를 갖추었습니다. HEPA와 활성탄 필터가 입자와 가스를 포집하고, 자동 전자식 풍량 제어가 필터가 막혀가도 집진 성능을 유지하므로 보호 성능이 서서히 눈에 띄지 않게 떨어지지 않습니다. 가스·입자 센서가 작업자에게 경고하며, 연결된 장비와 함께 시동할 수 있습니다. 기본형 400과 400i에 PVC, 오존, 승화 전사 전용 버전을 더해 총 다섯 가지로 제공됩니다. 주요 적용 분야는 레이저 각인 및 코딩, 전자, 3D 프린팅, 제약·의료, 실험실입니다.', zh: '400 系列是 Purex 最知名的净化机型：风量 400 m³/h、机箱紧凑，并配备保护操作人员与环境的安全机制。HEPA 与活性炭滤芯捕集颗粒物和气体，自动电子风量控制在滤芯逐渐堵塞时仍维持抽风量，因此防护性能不会缓慢而不被察觉地下降。气体与颗粒物传感器会提醒操作人员，设备也可随所连机器一同启动。共五种版本：基础型 400 与 400i，以及 PVC、臭氧和热升华专用版本。典型应用领域包括激光雕刻与喷码、电子、3D 打印、制药与医疗、实验室。',
    },
    features: [
      { hu: 'Légmennyiség 400 m³/h, hangszint <60 dBA', en: 'Airflow 400 m³/h, sound level <60 dBA', it: 'Portata d’aria 400 m³/h, livello sonoro <60 dBA', es: 'Caudal de aire 400 m³/h, nivel sonoro <60 dBA', de: 'Luftmenge 400 m³/h, Schallpegel <60 dBA', ko: '풍량 400 m³/h, 소음 <60 dBA', zh: '风量 400 m³/h，噪声 <60 dBA' },
      { hu: 'Automatikus légmennyiség-szabályozás: a szűrő telítődésével sem csökken az elszívás', en: 'Automatic flow control: extraction rate stays constant as the filter blocks', it: 'Controllo automatico della portata: l’aspirazione resta costante anche quando il filtro si intasa', es: 'Control automático del caudal: la extracción se mantiene constante aunque el filtro se colmate', de: 'Automatische Luftmengenregelung: Die Absaugleistung bleibt konstant, auch wenn der Filter zusetzt', ko: '자동 풍량 제어: 필터가 막혀도 집진량이 일정하게 유지됩니다', zh: '自动风量控制：即使滤芯逐渐堵塞，抽风量仍保持恒定' },
      { hu: 'HEPA- és aktívszén-szűrés, gyorsan cserélhető labirint előszűrő', en: 'HEPA and activated carbon filtration, quick-change labyrinth pre-filter', it: 'Filtrazione HEPA e a carbone attivo, prefiltro a labirinto a sostituzione rapida', es: 'Filtración HEPA y de carbón activo, prefiltro de laberinto de cambio rápido', de: 'HEPA- und Aktivkohlefiltration, schnell wechselbarer Labyrinth-Vorfilter', ko: 'HEPA·활성탄 여과, 빠르게 교체 가능한 래버린스 프리필터', zh: 'HEPA 与活性炭过滤，可快速更换的迷宫式前置滤芯' },
      { hu: 'Gáz- és részecskeérzékelő figyelmezteti a kezelőt', en: 'Gas and particle sensors warn the operator', it: 'Sensori di gas e particelle avvisano l’operatore', es: 'Sensores de gas y partículas que avisan al operario', de: 'Gas- und Partikelsensoren warnen den Bediener', ko: '가스 및 입자 센서가 작업자에게 경고합니다', zh: '气体与颗粒物传感器提醒操作人员' },
      { hu: 'Távindítás a csatlakoztatott géppel (interfészkészlet)', en: 'Remote start from the connected machine (interfacing kit)', it: 'Avvio remoto dalla macchina collegata (kit di interfacciamento)', es: 'Arranque remoto desde la máquina conectada (kit de interfaz)', de: 'Fernstart durch die angeschlossene Maschine (Interface-Kit)', ko: '연결된 장비에서 원격 시동(인터페이스 키트)', zh: '可由所连设备远程启动（接口套件）' },
      { hu: 'Öt változat: 400, 400i, 400i PVC, 400i Ozone, 400i Dye Sub', en: 'Five versions: 400, 400i, 400i PVC, 400i Ozone, 400i Dye Sub', it: 'Cinque versioni: 400, 400i, 400i PVC, 400i Ozone, 400i Dye Sub', es: 'Cinco versiones: 400, 400i, 400i PVC, 400i Ozone, 400i Dye Sub', de: 'Fünf Ausführungen: 400, 400i, 400i PVC, 400i Ozone, 400i Dye Sub', ko: '다섯 가지 버전: 400, 400i, 400i PVC, 400i Ozone, 400i Dye Sub', zh: '五种版本：400、400i、400i PVC、400i Ozone、400i Dye Sub' },
    ],
    variants: [
      {
        name: '400',
        purpose: {
          hu: 'A legkisebb helyet igénylő változat: alacsony szekrény, mégis a teljes 400 m³/h. Jellemzően az elektronikai iparban, ahol a hely szűkös.',
          en: 'The version with the smallest footprint: a low cabinet, yet the full 400 m³/h. Typically used in electronics, where space is tight.', it: 'La versione con l’ingombro minore: mobile basso, ma tutta la portata di 400 m³/h. Tipicamente usata nell’elettronica, dove lo spazio è limitato.', es: 'La versión que ocupa menos espacio: armario bajo, pero con los 400 m³/h completos. Se usa habitualmente en electrónica, donde el espacio es escaso.', de: 'Die Ausführung mit dem geringsten Platzbedarf: niedriges Gehäuse, dennoch die vollen 400 m³/h. Typisch in der Elektronik, wo der Platz knapp ist.', ko: '설치 공간이 가장 작은 버전으로, 캐비닛이 낮지만 400 m³/h 풍량을 그대로 냅니다. 공간이 좁은 전자 산업에서 주로 사용됩니다.', zh: '占地面积最小的版本：机箱较低，但仍具备完整的 400 m³/h 风量。常用于空间紧张的电子行业。',
        },
        datasheet: '/datasheets/purex-400.pdf',
        params: [
          { label: { hu: 'Szekrénymagasság', en: 'Cabinet height', it: 'Altezza mobile', es: 'Altura del armario', de: 'Gehäusehöhe', ko: '캐비닛 높이', zh: '机箱高度' }, value: { hu: '710 mm', en: '710 mm', it: '710 mm', es: '710 mm', de: '710 mm', ko: '710 mm', zh: '710 mm' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '60 kg', en: '60 kg', it: '60 kg', es: '60 kg', de: '60 kg', ko: '60 kg', zh: '60 kg' } },
          { label: { hu: 'Főszűrő', en: 'Main filter', it: 'Filtro principale', es: 'Filtro principal', de: 'Hauptfilter', ko: '메인 필터', zh: '主滤芯' }, value: { hu: 'HEPA + aktívszén', en: 'HEPA + activated carbon', it: 'HEPA + carbone attivo', es: 'HEPA + carbón activo', de: 'HEPA + Aktivkohle', ko: 'HEPA + 활성탄', zh: 'HEPA + 活性炭' } },
          { label: { hu: 'Előszűrő', en: 'Pre-filter', it: 'Prefiltro', es: 'Prefiltro', de: 'Vorfilter', ko: '프리필터', zh: '前置滤芯' }, value: { hu: 'F5 lap', en: 'F5 pad', it: 'Pad F5', es: 'Almohadilla F5', de: 'F5-Matte', ko: 'F5 패드', zh: 'F5 滤棉' } },
        ],
      },
      {
        name: '400i',
        purpose: {
          hu: 'A sor legelterjedtebb tagja, a lézeres gravírozás és kódolás jellemző választása: nagy elszívási teljesítmény kompakt méretben, labirint előszűrővel, ami hosszabb szűrőélettartamot ad.',
          en: 'The most widely used member of the range and the usual choice for laser engraving and coding: a high extraction rate in a compact size, with a labyrinth pre-filter for longer filter life.', it: 'Il modello più diffuso della gamma e la scelta abituale per incisione e codifica laser: elevata capacità di aspirazione in dimensioni compatte, con prefiltro a labirinto per una maggiore durata dei filtri.', es: 'El modelo más extendido de la gama y la elección habitual para grabado y codificación láser: gran capacidad de extracción en un tamaño compacto, con prefiltro de laberinto para una mayor vida útil de los filtros.', de: 'Das verbreitetste Modell der Reihe und die üblliche Wahl für Lasergravur und Codierung: hohe Absaugleistung bei kompakter Größe, mit Labyrinth-Vorfilter für längere Filterlebensdauer.', ko: '제품군에서 가장 널리 쓰이는 모델로, 레이저 각인과 코딩에 흔히 선택됩니다. 컴팩트한 크기에 높은 집진 성능을 담았고, 래버린스 프리필터로 필터 수명이 더 깁니다.', zh: '该系列中应用最广的机型，也是激光雕刻与喷码的常规选择：体积紧凑而抽风能力强，配迷宫式前置滤芯以延长滤芯寿命。',
        },
        datasheet: '/datasheets/purex-400i.pdf',
        params: [
          { label: { hu: 'Szekrénymagasság', en: 'Cabinet height', it: 'Altezza mobile', es: 'Altura del armario', de: 'Gehäusehöhe', ko: '캐비닛 높이', zh: '机箱高度' }, value: { hu: '1070 mm', en: '1070 mm', it: '1070 mm', es: '1070 mm', de: '1070 mm', ko: '1070 mm', zh: '1070 mm' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '50 kg', en: '50 kg', it: '50 kg', es: '50 kg', de: '50 kg', ko: '50 kg', zh: '50 kg' } },
          { label: { hu: 'Főszűrő', en: 'Main filter', it: 'Filtro principale', es: 'Filtro principal', de: 'Hauptfilter', ko: '메인 필터', zh: '主滤芯' }, value: { hu: 'HEPA + aktívszén', en: 'HEPA + activated carbon', it: 'HEPA + carbone attivo', es: 'HEPA + carbón activo', de: 'HEPA + Aktivkohle', ko: 'HEPA + 활성탄', zh: 'HEPA + 活性炭' } },
          { label: { hu: 'Előszűrő', en: 'Pre-filter', it: 'Prefiltro', es: 'Prefiltro', de: 'Vorfilter', ko: '프리필터', zh: '前置滤芯' }, value: { hu: 'F6 labirint', en: 'F6 labyrinth', it: 'Labirinto F6', es: 'Laberinto F6', de: 'F6-Labyrinth', ko: 'F6 래버린스', zh: 'F6 迷宫式' } },
        ],
      },
      {
        name: '400i PVC',
        purpose: {
          hu: 'PVC lézeres jelöléséhez. A PVC-ből felszabaduló gőz korrozív, ezért ennek a változatnak a belső felületei külön bevonatot kapnak, a szűrés pedig erősebb (F8/F9 előszűrő, kémiai felszívó lap).',
          en: 'For laser marking PVC. The fumes released from PVC are corrosive, so the internal surfaces of this version are specially coated and the filtration is heavier (F8/F9 pre-filter, chemical absorbent pad).', it: 'Per la marcatura laser del PVC. I fumi liberati dal PVC sono corrosivi, quindi le superfici interne di questa versione hanno un rivestimento speciale e la filtrazione è più spinta (prefiltro F8/F9, pad assorbente chimico).', es: 'Para el marcaje láser de PVC. Los humos que libera el PVC son corrosivos, por lo que las superficies internas de esta versión llevan un recubrimiento especial y la filtración es más exigente (prefiltro F8/F9, almohadilla absorbente química).', de: 'Für die Laserbeschriftung von PVC. Die aus PVC freigesetzten Dämpfe sind korrosiv, daher sind die Innenflächen dieser Ausführung speziell beschichtet und die Filterung ist stärker (F8/F9-Vorfilter, chemische Absorptionsmatte).', ko: 'PVC 레이저 마킹용입니다. PVC에서 발생하는 흄은 부식성이 있어 이 버전은 내부 표면에 특수 코팅을 적용하고 여과 단계를 강화했습니다(F8/F9 프리필터, 화학 흡수 패드).', zh: '用于 PVC 激光打标。PVC 释放的烟气具腐蚀性，因此该版本内表面经过特殊涂层处理，过滤等级也更高（F8/F9 前置滤芯、化学吸附棉）。',
        },
        datasheet: '/datasheets/purex-400i-pvc.pdf',
        params: [
          { label: { hu: 'Szekrénymagasság', en: 'Cabinet height', it: 'Altezza mobile', es: 'Altura del armario', de: 'Gehäusehöhe', ko: '캐비닛 높이', zh: '机箱高度' }, value: { hu: '1195 mm', en: '1195 mm', it: '1195 mm', es: '1195 mm', de: '1195 mm', ko: '1195 mm', zh: '1195 mm' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '70 kg', en: '70 kg', it: '70 kg', es: '70 kg', de: '70 kg', ko: '70 kg', zh: '70 kg' } },
          { label: { hu: 'Előszűrő', en: 'Pre-filter', it: 'Prefiltro', es: 'Prefiltro', de: 'Vorfilter', ko: '프리필터', zh: '前置滤芯' }, value: { hu: 'F8/F9 labirint + kémiai felszívó lap', en: 'F8/F9 labyrinth + chemical absorbent pad', it: 'Labirinto F8/F9 + pad assorbente chimico', es: 'Laberinto F8/F9 + almohadilla absorbente química', de: 'F8/F9-Labyrinth + chemische Absorptionsmatte', ko: 'F8/F9 래버린스 + 화학 흡수 패드', zh: 'F8/F9 迷宫式 + 化学吸附棉' } },
          { label: { hu: 'Korrózióvédelem', en: 'Corrosion protection', it: 'Protezione dalla corrosione', es: 'Protección contra la corrosión', de: 'Korrosionsschutz', ko: '부식 방지', zh: '防腐蚀' }, value: { hu: 'belső bevonat', en: 'internal coating', it: 'rivestimento interno', es: 'recubrimiento interno', de: 'Innenbeschichtung', ko: '내부 코팅', zh: '内部涂层' } },
        ],
      },
      {
        name: '400i Ozone',
        purpose: {
          hu: 'Ózonnal járó folyamatokhoz — jellemzően az orvostechnikában. Kettős HEPA és kémiai szűrés, valamint önálló ózonérzékelő, ami közvetlenül erre a gázra figyel.',
          en: 'For processes involving ozone — typically in medical applications. Twin HEPA and chemical filtration plus a dedicated ozone sensor that watches for that gas specifically.', it: 'Per processi che comportano ozono, tipicamente nel settore medico. Doppia filtrazione HEPA e chimica più un sensore dedicato all’ozono che sorveglia specificamente questo gas.', es: 'Para procesos que implican ozono, habitualmente en el sector médico. Filtración HEPA doble y química, más un sensor de ozono específico que vigila ese gas en concreto.', de: 'Für Prozesse mit Ozon — typischerweise in der Medizintechnik. Doppelte HEPA- und Chemiefiltration sowie ein eigener Ozonsensor, der speziell auf dieses Gas achtet.', ko: '오존이 발생하는 공정용으로, 주로 의료 분야에서 사용됩니다. 트윈 HEPA와 화학 여과에 더해 이 가스를 전용으로 감시하는 오존 센서를 갖추었습니다.', zh: '适用于涉及臭氧的工艺，多见于医疗领域。采用双 HEPA 与化学过滤，并配备专门监测臭氧的独立传感器。',
        },
        datasheet: '/datasheets/purex-400i-ozone.pdf',
        params: [
          { label: { hu: 'Szekrénymagasság', en: 'Cabinet height', it: 'Altezza mobile', es: 'Altura del armario', de: 'Gehäusehöhe', ko: '캐비닛 높이', zh: '机箱高度' }, value: { hu: '1195 mm', en: '1195 mm', it: '1195 mm', es: '1195 mm', de: '1195 mm', ko: '1195 mm', zh: '1195 mm' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '70 kg', en: '70 kg', it: '70 kg', es: '70 kg', de: '70 kg', ko: '70 kg', zh: '70 kg' } },
          { label: { hu: 'Főszűrő', en: 'Main filter', it: 'Filtro principale', es: 'Filtro principal', de: 'Hauptfilter', ko: '메인 필터', zh: '主滤芯' }, value: { hu: 'kettős HEPA + kémiai', en: 'twin HEPA + chemical', it: 'doppio HEPA + chimico', es: 'HEPA doble + químico', de: 'Doppel-HEPA + chemisch', ko: '트윈 HEPA + 화학', zh: '双 HEPA + 化学' } },
          { label: { hu: 'Külön érzékelő', en: 'Dedicated sensor', it: 'Sensore dedicato', es: 'Sensor específico', de: 'Eigener Sensor', ko: '전용 센서', zh: '专用传感器' }, value: { hu: 'ózon', en: 'ozone', it: 'ozono', es: 'ozono', de: 'Ozon', ko: '오존', zh: '臭氧' } },
        ],
      },
      {
        name: '400i Dye Sub',
        purpose: {
          hu: 'Festékszublimációs nyomtatáshoz. A folyamat során folyadék is keletkezik, ezért ez a változat koaleszcens szűrőt kap: összegyűjti a felesleget, amit utána egyszerűen le lehet csapolni.',
          en: 'For dye-sublimation printing. The process also produces liquid, so this version has a coalescing filter that collects the excess, which can then simply be drained off.', it: 'Per la stampa a sublimazione. Il processo genera anche liquido, quindi questa versione è dotata di un filtro coalescente che raccoglie l’eccesso, poi facilmente scaricabile.', es: 'Para la impresión por sublimación. El proceso también genera líquido, por lo que esta versión incorpora un filtro coalescente que recoge el exceso, que después puede vaciarse fácilmente.', de: 'Für den Sublimationsdruck. Beim Prozess entsteht auch Flüssigkeit, daher hat diese Ausführung einen Koaleszenzfilter, der den Überschuss sammelt und anschließend einfach abgelassen werden kann.', ko: '승화 전사 인쇄용입니다. 이 공정에서는 액체도 발생하므로, 이 버전은 여분의 액체를 모아 손쉽게 배출할 수 있는 응집 필터를 갖추었습니다.', zh: '用于热升华印刷。该工艺还会产生液体，因此此版本配备聚结滤芯，可收集多余液体并方便排放。',
        },
        datasheet: '/datasheets/purex-400i-dye-sub.pdf',
        params: [
          { label: { hu: 'Szekrénymagasság', en: 'Cabinet height', it: 'Altezza mobile', es: 'Altura del armario', de: 'Gehäusehöhe', ko: '캐비닛 높이', zh: '机箱高度' }, value: { hu: '1070 mm', en: '1070 mm', it: '1070 mm', es: '1070 mm', de: '1070 mm', ko: '1070 mm', zh: '1070 mm' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '60 kg', en: '60 kg', it: '60 kg', es: '60 kg', de: '60 kg', ko: '60 kg', zh: '60 kg' } },
          { label: { hu: 'Külön szűrő', en: 'Additional filter', it: 'Filtro aggiuntivo', es: 'Filtro adicional', de: 'Zusätzlicher Filter', ko: '추가 필터', zh: '附加滤芯' }, value: { hu: 'koaleszcens, lecsapolható', en: 'coalescing, drainable', it: 'coalescente, scaricabile', es: 'coalescente, drenable', de: 'Koaleszenz, ablassbar', ko: '응집식, 배출 가능', zh: '聚结式，可排液' } },
          { label: { hu: 'Előszűrő', en: 'Pre-filter', it: 'Prefiltro', es: 'Prefiltro', de: 'Vorfilter', ko: '프리필터', zh: '前置滤芯' }, value: { hu: 'F6 labirint', en: 'F6 labyrinth', it: 'Labirinto F6', es: 'Laberinto F6', de: 'F6-Labyrinth', ko: 'F6 래버린스', zh: 'F6 迷宫式' } },
        ],
      },
    ],
  },
  {
    slug: 'purex-800',
    category: 'fust-es-porelszivok',
    name: 'Purex 800',
    brand: 'Purex',
    image: '/images/products/purex-800.webp',
    datasheet: '/datasheets/purex-800i-2-tier.pdf',
    short: {
      hu: 'Kétszeres légmennyiség: 800 m³/h nagyobb terhelésre vagy több elszívási pontra.',
      en: 'Double the airflow: 800 m³/h for heavier loads or several extraction points.', it: 'Portata d’aria doppia: 800 m³/h per carichi maggiori o più punti di aspirazione.', es: 'El doble de caudal: 800 m³/h para cargas mayores o varios puntos de extracción.', de: 'Doppelte Luftmenge: 800 m³/h für höhere Lasten oder mehrere Absaugpunkte.', ko: '풍량 두 배: 부하가 크거나 집진 지점이 여러 곳일 때를 위한 800 m³/h.', zh: '风量翻倍：800 m³/h，适用于更大负荷或多个抽风点。',
    },
    description: {
      hu: 'A 800-as sor ugyanazt a felépítést és biztonsági megoldásokat adja, mint a 400-as, de kétszeres légmennyiséggel: 800 m³/h és 2,4 kW. Akkor ez a helyes választás, ha egy folyamat sok füstöt vagy port termel, vagy ha egyetlen gépről több elszívási pontot kell ellátni. HEPA- és aktívszén-szűrés, automatikus légmennyiség-szabályozás, gáz- és részecskeérzékelő itt is alapfelszereltség. Négy változatban készül: a kompakt 800, a kétszintes 800i, a háromszintes 800i (két főszűrővel, tehát nagyobb szűrőkapacitással és hosszabb csereidővel), valamint a PVC-kivitel korrózióvédő bevonattal.',
      en: 'The 800 range offers the same construction and fail-safes as the 400, but with double the airflow: 800 m³/h and 2.4 kW. This is the right choice when a process produces a lot of fume or dust, or when several extraction points have to be served from one machine. HEPA and activated carbon filtration, automatic flow control and gas and particle sensors are standard here too. It comes in four versions: the compact 800, the 2-tier 800i, the 3-tier 800i (with two main filters, hence more filter capacity and longer intervals between changes), and the PVC version with a corrosion-resistant coating.', it: 'La gamma 800 offre la stessa costruzione e gli stessi sistemi di sicurezza della 400, ma con portata d’aria doppia: 800 m³/h e 2,4 kW. È la scelta giusta quando un processo genera molti fumi o polveri, oppure quando da una sola macchina occorre servire più punti di aspirazione. Anche qui filtrazione HEPA e a carbone attivo, controllo automatico della portata e sensori di gas e particelle sono di serie. È disponibile in quattro versioni: la compatta 800, la 800i a 2 livelli, la 800i a 3 livelli (con due filtri principali, quindi maggiore capacità filtrante e intervalli di sostituzione più lunghi) e la versione PVC con rivestimento anticorrosione.', es: 'La gama 800 ofrece la misma construcción y los mismos sistemas de seguridad que la 400, pero con el doble de caudal: 800 m³/h y 2,4 kW. Es la elección correcta cuando un proceso genera mucho humo o polvo, o cuando hay que atender varios puntos de extracción desde una sola máquina. La filtración HEPA y de carbón activo, el control automático del caudal y los sensores de gas y partículas también son de serie. Se fabrica en cuatro versiones: la compacta 800, la 800i de 2 niveles, la 800i de 3 niveles (con dos filtros principales, es decir, mayor capacidad de filtración e intervalos de cambio más largos) y la versión de PVC con recubrimiento anticorrosión.', de: 'Die 800er-Reihe bietet denselben Aufbau und dieselben Sicherheitsfunktionen wie die 400er, jedoch mit doppelter Luftmenge: 800 m³/h und 2,4 kW. Das ist die richtige Wahl, wenn ein Prozess viel Rauch oder Staub erzeugt oder wenn mehrere Absaugpunkte von einer Maschine versorgt werden müssen. HEPA- und Aktivkohlefiltration, automatische Luftmengenregelung sowie Gas- und Partikelsensoren gehören auch hier zur Serienausstattung. Es gibt vier Ausführungen: die kompakte 800, die zweistufige 800i, die dreistufige 800i (mit zwei Hauptfiltern, also mehr Filterkapazität und längeren Wechselintervallen) und die PVC-Ausführung mit Korrosionsschutzbeschichtung.', ko: '800 제품군은 400 제품군과 동일한 구조와 안전 장치를 갖추면서 풍량은 두 배입니다(800 m³/h, 2.4 kW). 공정에서 흄이나 분진이 많이 발생하거나, 한 대로 여러 집진 지점을 담당해야 할 때 적합합니다. HEPA·활성탄 여과, 자동 풍량 제어, 가스·입자 센서는 여기서도 기본입니다. 네 가지 버전으로 제공됩니다: 컴팩트한 800, 2단 800i, 3단 800i(메인 필터 2개로 여과 용량이 크고 교체 주기가 깁니다), 그리고 방식 코팅을 적용한 PVC 버전입니다.', zh: '800 系列与 400 系列结构和安全机制相同，但风量翻倍：800 m³/h、2.4 kW。当工艺产生大量烟雾或粉尘，或需由一台设备服务多个抽风点时，它是正确选择。HEPA 与活性炭过滤、自动风量控制、气体与颗粒物传感器同样为标准配置。共四种版本：紧凑型 800、双层 800i、三层 800i（配两个主滤芯，过滤容量更大、更换周期更长）以及带防腐涂层的 PVC 版本。',
    },
    features: [
      { hu: 'Légmennyiség 800 m³/h, 2,4 kW, hangszint <60 dBA', en: 'Airflow 800 m³/h, 2.4 kW, sound level <60 dBA', it: 'Portata d’aria 800 m³/h, 2,4 kW, livello sonoro <60 dBA', es: 'Caudal de aire 800 m³/h, 2,4 kW, nivel sonoro <60 dBA', de: 'Luftmenge 800 m³/h, 2,4 kW, Schallpegel <60 dBA', ko: '풍량 800 m³/h, 2.4 kW, 소음 <60 dBA', zh: '风量 800 m³/h，2.4 kW，噪声 <60 dBA' },
      { hu: 'Egy gépről több elszívási pont is ellátható', en: 'Several extraction points can be served from one machine', it: 'Da una sola macchina si possono servire più punti di aspirazione', es: 'Desde una sola máquina se pueden atender varios puntos de extracción', de: 'Mehrere Absaugpunkte lassen sich von einer Maschine versorgen', ko: '한 대로 여러 집진 지점을 담당할 수 있습니다', zh: '一台设备可服务多个抽风点' },
      { hu: 'Automatikus légmennyiség-szabályozás: a szűrő telítődésével sem csökken az elszívás', en: 'Automatic flow control: extraction rate stays constant as the filter blocks', it: 'Controllo automatico della portata: l’aspirazione resta costante anche quando il filtro si intasa', es: 'Control automático del caudal: la extracción se mantiene constante aunque el filtro se colmate', de: 'Automatische Luftmengenregelung: Die Absaugleistung bleibt konstant, auch wenn der Filter zusetzt', ko: '자동 풍량 제어: 필터가 막혀도 집진량이 일정하게 유지됩니다', zh: '自动风量控制：即使滤芯逐渐堵塞，抽风量仍保持恒定' },
      { hu: 'HEPA- és aktívszén-szűrés, gáz- és részecskeérzékelő', en: 'HEPA and activated carbon filtration, gas and particle sensors', it: 'Filtrazione HEPA e a carbone attivo, sensori di gas e particelle', es: 'Filtración HEPA y de carbón activo, sensores de gas y partículas', de: 'HEPA- und Aktivkohlefiltration, Gas- und Partikelsensoren', ko: 'HEPA·활성탄 여과, 가스 및 입자 센서', zh: 'HEPA 与活性炭过滤，气体与颗粒物传感器' },
      { hu: 'Négy változat: 800, 800i 2-Tier, 800i 3-Tier, 800i PVC', en: 'Four versions: 800, 800i 2-Tier, 800i 3-Tier, 800i PVC', it: 'Quattro versioni: 800, 800i 2-Tier, 800i 3-Tier, 800i PVC', es: 'Cuatro versiones: 800, 800i 2-Tier, 800i 3-Tier, 800i PVC', de: 'Vier Ausführungen: 800, 800i 2-Tier, 800i 3-Tier, 800i PVC', ko: '네 가지 버전: 800, 800i 2-Tier, 800i 3-Tier, 800i PVC', zh: '四种版本：800、800i 2-Tier、800i 3-Tier、800i PVC' },
    ],
    variants: [
      {
        name: '800',
        purpose: {
          hu: 'A kompakt kivitel: alacsony szekrény a teljes 800 m³/h-val, ha a hely szűkös. Egyszerű lapos előszűrővel.',
          en: 'The compact version: a low cabinet with the full 800 m³/h, for when space is tight. With a simple flat pre-filter.', it: 'La versione compatta: mobile basso con tutta la portata di 800 m³/h, quando lo spazio è limitato. Con un semplice prefiltro piatto.', es: 'La versión compacta: armario bajo con los 800 m³/h completos, cuando el espacio es escaso. Con un prefiltro plano sencillo.', de: 'Die kompakte Ausführung: niedriges Gehäuse mit den vollen 800 m³/h, wenn der Platz knapp ist. Mit einfachem Flach-Vorfilter.', ko: '컴팩트 버전: 공간이 좁을 때를 위한 낮은 캐비닛에 800 m³/h 풍량을 그대로 담았습니다. 단순한 평판형 프리필터를 사용합니다.', zh: '紧凑版本：机箱较低但具备完整 800 m³/h 风量，适合空间紧张的场合。配简易平板式前置滤芯。',
        },
        datasheet: '/datasheets/purex-800.pdf',
        params: [
          { label: { hu: 'Szekrénymagasság', en: 'Cabinet height', it: 'Altezza mobile', es: 'Altura del armario', de: 'Gehäusehöhe', ko: '캐비닛 높이', zh: '机箱高度' }, value: { hu: '740 mm', en: '740 mm', it: '740 mm', es: '740 mm', de: '740 mm', ko: '740 mm', zh: '740 mm' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '78 kg', en: '78 kg', it: '78 kg', es: '78 kg', de: '78 kg', ko: '78 kg', zh: '78 kg' } },
          { label: { hu: 'Főszűrő', en: 'Main filter', it: 'Filtro principale', es: 'Filtro principal', de: 'Hauptfilter', ko: '메인 필터', zh: '主滤芯' }, value: { hu: 'HEPA + aktívszén', en: 'HEPA + activated carbon', it: 'HEPA + carbone attivo', es: 'HEPA + carbón activo', de: 'HEPA + Aktivkohle', ko: 'HEPA + 활성탄', zh: 'HEPA + 活性炭' } },
          { label: { hu: 'Előszűrő', en: 'Pre-filter', it: 'Prefiltro', es: 'Prefiltro', de: 'Vorfilter', ko: '프리필터', zh: '前置滤芯' }, value: { hu: 'F5 lap', en: 'F5 pad', it: 'Pad F5', es: 'Almohadilla F5', de: 'F5-Matte', ko: 'F5 패드', zh: 'F5 滤棉' } },
        ],
      },
      {
        name: '800i 2-Tier',
        purpose: {
          hu: 'Kétszintes szekrény egy főszűrővel és labirint előszűrővel: hosszabb szűrőélettartam, mint a kompakt kivitelben. A sor általános célú tagja.',
          en: 'A 2-tier cabinet with one main filter and a labyrinth pre-filter: longer filter life than the compact version. The general-purpose member of the range.', it: 'Mobile a 2 livelli con un filtro principale e prefiltro a labirinto: durata dei filtri maggiore rispetto alla versione compatta. È il modello generalista della gamma.', es: 'Armario de 2 niveles con un filtro principal y prefiltro de laberinto: mayor vida útil de los filtros que en la versión compacta. Es el modelo de uso general de la gama.', de: 'Zweistufiges Gehäuse mit einem Hauptfilter und Labyrinth-Vorfilter: längere Filterlebensdauer als bei der kompakten Ausführung. Das Allrounder-Modell der Reihe.', ko: '메인 필터 1개와 래버린스 프리필터를 갖춘 2단 캐비닛으로, 컴팩트 버전보다 필터 수명이 깁니다. 제품군의 범용 모델입니다.', zh: '双层机箱，配一个主滤芯与迷宫式前置滤芯：滤芯寿命长于紧凑版本。是该系列的通用机型。',
        },
        datasheet: '/datasheets/purex-800i-2-tier.pdf',
        params: [
          { label: { hu: 'Szekrénymagasság', en: 'Cabinet height', it: 'Altezza mobile', es: 'Altura del armario', de: 'Gehäusehöhe', ko: '캐비닛 높이', zh: '机箱高度' }, value: { hu: '1155 mm', en: '1155 mm', it: '1155 mm', es: '1155 mm', de: '1155 mm', ko: '1155 mm', zh: '1155 mm' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '83 kg', en: '83 kg', it: '83 kg', es: '83 kg', de: '83 kg', ko: '83 kg', zh: '83 kg' } },
          { label: { hu: 'Főszűrő', en: 'Main filter', it: 'Filtro principale', es: 'Filtro principal', de: 'Hauptfilter', ko: '메인 필터', zh: '主滤芯' }, value: { hu: '1 × HEPA + aktívszén', en: '1 × HEPA + activated carbon', it: '1 × HEPA + carbone attivo', es: '1 × HEPA + carbón activo', de: '1 × HEPA + Aktivkohle', ko: '1 × HEPA + 활성탄', zh: '1 × HEPA + 活性炭' } },
          { label: { hu: 'Előszűrő', en: 'Pre-filter', it: 'Prefiltro', es: 'Prefiltro', de: 'Vorfilter', ko: '프리필터', zh: '前置滤芯' }, value: { hu: 'F6 labirint', en: 'F6 labyrinth', it: 'Labirinto F6', es: 'Laberinto F6', de: 'F6-Labyrinth', ko: 'F6 래버린스', zh: 'F6 迷宫式' } },
        ],
      },
      {
        name: '800i 3-Tier',
        purpose: {
          hu: 'Háromszintes szekrény KÉT főszűrővel — külön HEPA és külön kémiai szűrő —, F8/F9 labirint előszűrővel. Nagyobb szűrőkapacitás, tehát ritkább csere és jobb gázmegkötés, ha a folyamat sok oldószergőzt termel.',
          en: 'A 3-tier cabinet with TWO main filters — a separate HEPA and a separate chemical filter — and an F8/F9 labyrinth pre-filter. More filter capacity, hence less frequent changes and better gas retention when a process produces a lot of solvent vapour.', it: 'Mobile a 3 livelli con DUE filtri principali — uno HEPA e uno chimico separati — e prefiltro a labirinto F8/F9. Maggiore capacità filtrante, quindi sostituzioni meno frequenti e migliore ritenzione dei gas quando il processo genera molti vapori di solvente.', es: 'Armario de 3 niveles con DOS filtros principales — uno HEPA y otro químico por separado — y prefiltro de laberinto F8/F9. Mayor capacidad de filtración, por tanto cambios menos frecuentes y mejor retención de gases cuando el proceso genera muchos vapores de disolvente.', de: 'Dreistufiges Gehäuse mit ZWEI Hauptfiltern — je ein separater HEPA- und Chemiefilter — sowie F8/F9-Labyrinth-Vorfilter. Mehr Filterkapazität, also seltenere Wechsel und bessere Gasbindung, wenn ein Prozess viel Lösemitteldampf erzeugt.', ko: '메인 필터 2개(HEPA와 화학 필터를 각각)와 F8/F9 래버린스 프리필터를 갖춘 3단 캐비닛입니다. 여과 용량이 커서 교체 주기가 길고, 용제 증기가 많이 발생하는 공정에서 가스 포집 성능이 더 좋습니다.', zh: '三层机箱，配两个主滤芯——HEPA 与化学滤芯各一——以及 F8/F9 迷宫式前置滤芯。过滤容量更大，因此更换更少，且在产生大量溶剂蒸气的工艺中气体吸附效果更好。',
        },
        datasheet: '/datasheets/purex-800i-3-tier.pdf',
        params: [
          { label: { hu: 'Szekrénymagasság', en: 'Cabinet height', it: 'Altezza mobile', es: 'Altura del armario', de: 'Gehäusehöhe', ko: '캐비닛 높이', zh: '机箱高度' }, value: { hu: '1155 mm', en: '1155 mm', it: '1155 mm', es: '1155 mm', de: '1155 mm', ko: '1155 mm', zh: '1155 mm' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '95 kg', en: '95 kg', it: '95 kg', es: '95 kg', de: '95 kg', ko: '95 kg', zh: '95 kg' } },
          { label: { hu: 'Főszűrő', en: 'Main filter', it: 'Filtro principale', es: 'Filtro principal', de: 'Hauptfilter', ko: '메인 필터', zh: '主滤芯' }, value: { hu: '2 × (HEPA és kémiai külön)', en: '2 × (separate HEPA and chemical)', it: '2 × (HEPA e chimico separati)', es: '2 × (HEPA y químico por separado)', de: '2 × (HEPA und chemisch getrennt)', ko: '2 × (HEPA와 화학 별도)', zh: '2 ×（HEPA 与化学分开）' } },
          { label: { hu: 'Előszűrő', en: 'Pre-filter', it: 'Prefiltro', es: 'Prefiltro', de: 'Vorfilter', ko: '프리필터', zh: '前置滤芯' }, value: { hu: 'F8/F9 labirint', en: 'F8/F9 labyrinth', it: 'Labirinto F8/F9', es: 'Laberinto F8/F9', de: 'F8/F9-Labyrinth', ko: 'F8/F9 래버린스', zh: 'F8/F9 迷宫式' } },
        ],
      },
      {
        name: '800i PVC',
        purpose: {
          hu: 'A háromszintes felépítés PVC-hez: két PVC-specifikus főszűrő, szemcsés és kémiai felszívó lap, valamint korrózióvédő bevonat a belső felületeken. A sor legnagyobb szűrőkapacitása.',
          en: 'The 3-tier build for PVC: two PVC-specific main filters, granular and chemical absorbent pads, and a corrosion-resistant coating on the internal surfaces. The largest filter capacity in the range.', it: 'La struttura a 3 livelli per il PVC: due filtri principali specifici per PVC, pad assorbenti granulari e chimici e un rivestimento anticorrosione sulle superfici interne. La massima capacità filtrante della gamma.', es: 'La estructura de 3 niveles para PVC: dos filtros principales específicos para PVC, almohadillas absorbentes granulares y químicas, y un recubrimiento anticorrosión en las superficies internas. La mayor capacidad de filtración de la gama.', de: 'Der dreistufige Aufbau für PVC: zwei PVC-spezifische Hauptfilter, granulare und chemische Absorptionsmatten sowie eine Korrosionsschutzbeschichtung auf den Innenflächen. Die größte Filterkapazität der Reihe.', ko: 'PVC용 3단 구성입니다. PVC 전용 메인 필터 2개, 과립형 및 화학 흡수 패드, 내부 표면 방식 코팅을 갖추었습니다. 제품군 중 여과 용량이 가장 큽니다.', zh: '面向 PVC 的三层结构：两个 PVC 专用主滤芯、颗粒与化学吸附棉，以及内表面防腐涂层。为该系列中过滤容量最大的机型。',
        },
        datasheet: '/datasheets/purex-800i-pvc.pdf',
        params: [
          { label: { hu: 'Szekrénymagasság', en: 'Cabinet height', it: 'Altezza mobile', es: 'Altura del armario', de: 'Gehäusehöhe', ko: '캐비닛 높이', zh: '机箱高度' }, value: { hu: '1155 mm', en: '1155 mm', it: '1155 mm', es: '1155 mm', de: '1155 mm', ko: '1155 mm', zh: '1155 mm' } },
          { label: { hu: 'Tömeg', en: 'Weight', it: 'Peso', es: 'Peso', de: 'Gewicht', ko: '중량', zh: '重量' }, value: { hu: '100 kg', en: '100 kg', it: '100 kg', es: '100 kg', de: '100 kg', ko: '100 kg', zh: '100 kg' } },
          { label: { hu: 'Főszűrő', en: 'Main filter', it: 'Filtro principale', es: 'Filtro principal', de: 'Hauptfilter', ko: '메인 필터', zh: '主滤芯' }, value: { hu: '2 × PVC-specifikus', en: '2 × PVC-specific', it: '2 × specifici per PVC', es: '2 × específicos para PVC', de: '2 × PVC-spezifisch', ko: '2 × PVC 전용', zh: '2 × PVC 专用' } },
          { label: { hu: 'Korrózióvédelem', en: 'Corrosion protection', it: 'Protezione dalla corrosione', es: 'Protección contra la corrosión', de: 'Korrosionsschutz', ko: '부식 방지', zh: '防腐蚀' }, value: { hu: 'belső bevonat', en: 'internal coating', it: 'rivestimento interno', es: 'recubrimiento interno', de: 'Innenbeschichtung', ko: '내부 코팅', zh: '内部涂层' } },
        ],
      },
    ],
  },
  {
    slug: 'purex-ifume',
    category: 'fust-es-porelszivok',
    name: 'Purex iFume 400i',
    brand: 'Purex',
    image: '/images/products/purex-ifume.webp',
    datasheet: '/datasheets/purex-ifume-400i.pdf',
    short: {
      hu: 'Lézeres kódoláshoz és jelöléshez: 400 m³/h, színes érintőkijelző, 100–230 V bárhol a világon.',
      en: 'For laser coding and marking: 400 m³/h, colour touch screen, 100–230 V anywhere in the world.', it: 'Per codifica e marcatura laser: 400 m³/h, touch screen a colori, 100–230 V in tutto il mondo.', es: 'Para codificación y marcaje láser: 400 m³/h, pantalla táctil en color, 100–230 V en cualquier parte del mundo.', de: 'Für Lasercodierung und -beschriftung: 400 m³/h, Farb-Touchscreen, 100–230 V weltweit.', ko: '레이저 코딩 및 마킹용: 400 m³/h, 컬러 터치스크린, 전 세계 100–230 V 대응.', zh: '用于激光喷码与打标：400 m³/h，彩色触摸屏，全球 100–230 V 通用。',
    },
    description: {
      hu: 'Az iFume 400i kifejezetten a lézeres kódolás és jelölés mellé készült. Ugyanaz a 400 m³/h légmennyiség és ugyanaz a HEPA + aktívszén szűrés, mint a 400i-ben, két lényeges különbséggel: teljes színes érintőkijelzőt kapott a menüszerű kezelőfelület helyett, és 100–230 V között bárhol a világon ugyanazt a teljesítményt adja — nem kell feszültségváltozat szerint rendelni. Az automatikus légmennyiség-szabályozás itt is tartja az elszívást a szűrő telítődésével, a gáz- és részecskeérzékelő pedig figyelmeztet, ha a szűrő cserére szorul.',
      en: 'The iFume 400i was built specifically to accompany laser coding and marking. It has the same 400 m³/h airflow and the same HEPA + activated carbon filtration as the 400i, with two meaningful differences: a full-colour touch screen instead of the menu-style interface, and the same performance anywhere in the world between 100 and 230 V — no need to order a voltage-specific variant. Automatic flow control keeps the extraction rate up as the filter loads here too, and gas and particle sensors warn when a filter needs changing.', it: 'L’iFume 400i è stato progettato specificamente per accompagnare la codifica e la marcatura laser. Ha la stessa portata di 400 m³/h e la stessa filtrazione HEPA + carbone attivo della 400i, con due differenze sostanziali: un touch screen a colori invece dell’interfaccia a menu e le stesse prestazioni in tutto il mondo tra 100 e 230 V, senza dover ordinare una variante specifica per la tensione. Anche qui il controllo automatico della portata mantiene l’aspirazione mentre il filtro si carica, e i sensori di gas e particelle avvisano quando un filtro va sostituito.', es: 'El iFume 400i se diseñó específicamente para acompañar la codificación y el marcaje láser. Tiene el mismo caudal de 400 m³/h y la misma filtración HEPA + carbón activo que el 400i, con dos diferencias importantes: una pantalla táctil en color en lugar de la interfaz de menús, y el mismo rendimiento en cualquier parte del mundo entre 100 y 230 V, sin necesidad de pedir una variante según la tensión. Aquí también el control automático del caudal mantiene la extracción a medida que el filtro se colmata, y los sensores de gas y partículas avisan cuando hay que cambiar un filtro.', de: 'Der iFume 400i wurde speziell als Begleiter für Lasercodierung und -beschriftung entwickelt. Er hat die gleiche Luftmenge von 400 m³/h und die gleiche HEPA-+-Aktivkohle-Filtration wie der 400i, mit zwei wesentlichen Unterschieden: einen Farb-Touchscreen anstelle der menügeführten Bedienung und weltweit gleiche Leistung zwischen 100 und 230 V — eine spannungsspezifische Variante muss nicht bestellt werden. Auch hier hält die automatische Luftmengenregelung die Absaugleistung, während der Filter zusetzt, und Gas- und Partikelsensoren warnen, wenn ein Filter gewechselt werden muss.', ko: 'iFume 400i는 레이저 코딩·마킹 공정에 맞춰 개발된 모델입니다. 400i와 동일한 400 m³/h 풍량과 HEPA + 활성탄 여과를 갖추었으나 두 가지가 다릅니다. 메뉴식 조작부 대신 풀컬러 터치스크린을 사용하고, 100~230 V 범위에서 전 세계 어디서나 동일한 성능을 내므로 전압별 사양을 따로 주문할 필요가 없습니다. 자동 풍량 제어가 필터가 막혀가도 집진량을 유지하며, 가스·입자 센서가 필터 교체 시점을 알려 줍니다.', zh: 'iFume 400i 专为配合激光喷码与打标而设计。它与 400i 具有相同的 400 m³/h 风量和 HEPA + 活性炭过滤，但有两点重要差异：采用全彩触摸屏而非菜单式操作界面；在 100 至 230 V 范围内于全球各地性能一致，无需按电压选订不同版本。此处的自动风量控制同样能在滤芯逐渐堵塞时维持抽风量，气体与颗粒物传感器则会在需要更换滤芯时提醒。',
    },
    features: [
      { hu: 'Teljes színes érintőkijelző', en: 'Full-colour touch screen display', it: 'Display touch screen a colori', es: 'Pantalla táctil a todo color', de: 'Farb-Touchscreen-Display', ko: '풀컬러 터치스크린 디스플레이', zh: '全彩触摸屏显示' },
      { hu: '100–230 V, teljesítményveszteség nélkül bárhol a világon', en: '100–230 V, no loss of performance anywhere in the world', it: '100–230 V, senza perdita di prestazioni in tutto il mondo', es: '100–230 V, sin pérdida de rendimiento en cualquier parte del mundo', de: '100–230 V, weltweit ohne Leistungsverlust', ko: '100–230 V, 전 세계에서 성능 저하 없이 사용', zh: '100–230 V，全球通用且性能不减' },
      { hu: 'Légmennyiség 400 m³/h, 1,2 kW, hangszint <60 dBA', en: 'Airflow 400 m³/h, 1.2 kW, sound level <60 dBA', it: 'Portata d’aria 400 m³/h, 1,2 kW, livello sonoro <60 dBA', es: 'Caudal de aire 400 m³/h, 1,2 kW, nivel sonoro <60 dBA', de: 'Luftmenge 400 m³/h, 1,2 kW, Schallpegel <60 dBA', ko: '풍량 400 m³/h, 1.2 kW, 소음 <60 dBA', zh: '风量 400 m³/h，1.2 kW，噪声 <60 dBA' },
      { hu: 'HEPA + aktívszén főszűrő, F6 labirint előszűrő', en: 'HEPA + activated carbon main filter, F6 labyrinth pre-filter', it: 'Filtro principale HEPA + carbone attivo, prefiltro a labirinto F6', es: 'Filtro principal HEPA + carbón activo, prefiltro de laberinto F6', de: 'Hauptfilter HEPA + Aktivkohle, F6-Labyrinth-Vorfilter', ko: 'HEPA + 활성탄 메인 필터, F6 래버린스 프리필터', zh: 'HEPA + 活性炭主滤芯，F6 迷宫式前置滤芯' },
      { hu: 'Automatikus légmennyiség-szabályozás, gáz- és részecskeérzékelő', en: 'Automatic flow control, gas and particle sensors', it: 'Controllo automatico della portata, sensori di gas e particelle', es: 'Control automático del caudal, sensores de gas y partículas', de: 'Automatische Luftmengenregelung, Gas- und Partikelsensoren', ko: '자동 풍량 제어, 가스 및 입자 센서', zh: '自动风量控制，气体与颗粒物传感器' },
      { hu: 'Szekrény 1070 × 528 × 465 mm, 60 kg', en: 'Cabinet 1070 × 528 × 465 mm, 60 kg', it: 'Mobile 1070 × 528 × 465 mm, 60 kg', es: 'Armario 1070 × 528 × 465 mm, 60 kg', de: 'Gehäuse 1070 × 528 × 465 mm, 60 kg', ko: '캐비닛 1070 × 528 × 465 mm, 60 kg', zh: '机箱 1070 × 528 × 465 mm，60 kg' },
    ],
  },
];
export const products: Product[] = localize<Product[]>(productsSource);

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
