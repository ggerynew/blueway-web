import { localize, type LocalizedText, type Sourced } from '@/lib/products';

export interface GuideSection {
  title: LocalizedText;
  paragraphs: LocalizedText[];
  bullets?: LocalizedText[];
  /** Kiemelt link a szekció végén (nyelvi előtag nélküli útvonal). */
  link?: { href: string; label: LocalizedText };
  /** Letölthető fájlok (a public mappán belüli útvonallal). */
  files?: { href: string; label: LocalizedText }[];
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
const guidesSource: Sourced<Guide[]> = [
  {
    slug: 'festekszalag-valaszto',
    title: {
      hu: 'Festékszalag-választó: wax, wax-resin vagy resin?',
      en: 'Ribbon guide: wax, wax-resin or resin?', de: 'Farbband-Ratgeber: Wax, Wax-Resin oder Resin?', ko: '리본 가이드: Wax, Wax-Resin, Resin 중 무엇을 선택할까요?', zh: '碳带选型指南：蜡基、混合基还是树脂基？',
    },
    short: {
      hu: 'Melyik termotranszfer szalag való a feladathoz? Ár, alapanyag és felhasználás egy ábrán.',
      en: 'Which thermal transfer ribbon fits the job? Price, substrate and application on one chart.', de: 'Welches Thermotransfer-Farbband passt zur Aufgabe? Preis, Untergrund und Anwendung in einer Übersicht.', ko: '어떤 열전사 리본이 작업에 적합할까요? 가격, 소재, 용도를 하나의 차트로 정리했습니다.', zh: '哪种热转印碳带适合您的任务？价格、承印材料与应用一图看懂。',
    },
    lead: {
      hu: 'A termotranszfer nyomtatás minősége és tartóssága a címke alapanyagán és a festékszalagon múlik. A három szalagcsalád — wax, wax-resin és resin — egy skálán helyezkedik el: balról jobbra nő az ár és a tartósság, a papírtól a speciális műanyagokig.',
      en: 'The quality and durability of thermal transfer printing depend on the label material and the ribbon. The three ribbon families — wax, wax-resin and resin — sit on one scale: price and durability grow from left to right, from paper to specialty synthetics.', de: 'Qualität und Haltbarkeit des Thermotransferdrucks hängen vom Etikettenmaterial und vom Farbband ab. Die drei Farbbandfamilien — Wax, Wax-Resin und Resin — liegen auf einer Skala: Preis und Beständigkeit steigen von links nach rechts, von Papier bis zu Spezialkunststoffen.', ko: '열전사 인쇄의 품질과 내구성은 라벨 소재와 리본에 따라 결정됩니다. Wax, Wax-Resin, Resin의 세 가지 리본 제품군은 하나의 척도 위에 놓입니다. 왼쪽에서 오른쪽으로, 종이에서 특수 합성 소재로 갈수록 가격과 내구성이 높아집니다.', zh: '热转印打印的质量与耐久性取决于标签材料和碳带。三大碳带系列——蜡基、混合基与树脂基——处在同一条坐标轴上：从左到右，价格与耐久性逐步提升，承印材料也从纸张过渡到特种合成材料。',
    },
    sections: [
      {
        title: { hu: 'Wax — a gazdaságos alapszalag', en: 'Wax — the economical baseline', de: 'Wax — die wirtschaftliche Basis', ko: 'Wax — 경제적인 기본 선택', zh: '蜡基——经济实惠的基础选择' },
        paragraphs: [
          {
            hu: 'A viasz alapú festék a legkedvezőbb árú választás, és papír címkékhez való: a megolvadó viasz az egyenetlen, mattkasírozott vagy natúr (vellum) papír felületébe simul, így sötét, kontrasztos nyomatot ad. Nagy nyomtatási sebességet bír, viszont a nyomat dörzsölésre és vegyszerekre érzékenyebb.',
            en: 'Wax-based ink is the most affordable choice and is made for paper labels: the melting wax settles into the uneven surface of uncoated or matte-coated (vellum) paper, giving a dark, high-contrast print. It supports high print speeds, but the print is more sensitive to abrasion and chemicals.', de: 'Farbe auf Wachsbasis ist die günstigste Wahl und für Papieretiketten gemacht: Das schmelzende Wachs legt sich in die unebene Oberfläche von ungestrichenem oder matt gestrichenem (Vellum-)Papier und ergibt ein dunkles, kontrastreiches Druckbild. Sie erlaubt hohe Druckgeschwindigkeiten, der Druck ist jedoch empfindlicher gegenüber Abrieb und Chemikalien.', ko: 'Wax 기반 잉크는 가장 경제적인 선택으로 종이 라벨용으로 만들어졌습니다. 용융된 왁스가 무코팅 또는 매트 코팅(벨럼) 종이의 고르지 않은 표면에 스며들어 어둡고 대비가 높은 인쇄를 제공합니다. 고속 인쇄를 지원하지만, 인쇄면은 마모와 화학물질에 상대적으로 취약합니다.', zh: '蜡基油墨是最经济的选择，专为纸质标签而生：熔化的蜡渗入未涂布或哑光涂布（胶版）纸张的粗糙表面，形成深黑、高对比度的打印效果。它支持高速打印，但打印内容对摩擦与化学品较为敏感。',
          },
        ],
        bullets: [
          { hu: 'Alapanyag: natúr és mattkasírozott papír, karton', en: 'Substrate: uncoated and matte-coated paper, cardboard', de: 'Untergrund: ungestrichenes und matt gestrichenes Papier, Karton', ko: '소재: 무코팅 및 매트 코팅 종이, 판지', zh: '承印材料：未涂布及哑光涂布纸、纸板' },
          { hu: 'Tipikus felhasználás: doboz- és szállítmánycímkék, logisztika, polccímkék, árazás', en: 'Typical use: box and shipping labels, logistics, shelf labels, pricing', de: 'Typische Anwendung: Karton- und Versandetiketten, Logistik, Regaletiketten, Preisauszeichnung', ko: '대표 용도: 박스 및 배송 라벨, 물류, 선반 라벨, 가격 표시', zh: '典型应用：纸箱与运输标签、物流、货架标签、价格标示' },
          { hu: 'Élettartam-igény: órák–hetek, beltéri környezet', en: 'Durability need: hours to weeks, indoor environment', de: 'Haltbarkeitsbedarf: Stunden bis Wochen, Innenbereich', ko: '내구성 요구: 수 시간에서 수 주, 실내 환경', zh: '耐久性要求：数小时至数周，室内环境' },
        ],
      },
      {
        title: { hu: 'Wax-resin — a sokoldalú középút', en: 'Wax-resin — the versatile middle ground', de: 'Wax-Resin — der vielseitige Mittelweg', ko: 'Wax-Resin — 다재다능한 중간 선택', zh: '混合基——用途广泛的中间选择' },
        paragraphs: [
          {
            hu: 'A viasz és műgyanta keveréke jobb dörzs- és maszatolásállóságot ad, és már a sima, fényes műnyomó papíron, valamint a gazdaságos műanyag fóliákon (PP, PE) is tartós nyomatot képez. A legtöbb termékcímkéhez ez a legjobb ár/érték arányú választás.',
            en: 'The blend of wax and resin offers better smear and scratch resistance, and prints durably on smooth glossy coated paper as well as economical synthetic films (PP, PE). For most product labels this is the best value choice.', de: 'Die Mischung aus Wachs und Harz bietet bessere Wisch- und Kratzfestigkeit und druckt dauerhaft auf glattem, glänzend gestrichenem Papier sowie auf wirtschaftlichen Kunststofffolien (PP, PE). Für die meisten Produktetiketten ist sie die Wahl mit dem besten Preis-Leistungs-Verhältnis.', ko: '왁스와 레진의 블렌드는 더 우수한 번짐 및 긁힘 저항성을 제공하며, 매끄러운 유광 코팅지는 물론 경제적인 합성 필름(PP, PE)에도 내구성 있게 인쇄됩니다. 대부분의 제품 라벨에는 이 제품군이 가성비가 가장 뛰어난 선택입니다.', zh: '蜡与树脂的混合配方提供更好的抗涂抹与抗刮擦性能，可在光滑的光面涂布纸以及经济型合成薄膜（PP、PE）上实现耐久打印。对于大多数产品标签，这是性价比最高的选择。',
          },
        ],
        bullets: [
          { hu: 'Alapanyag: műnyomó és fényes papír, PP / PE fólia', en: 'Substrate: coated and glossy paper, PP / PE film', de: 'Untergrund: gestrichenes und Glanzpapier, PP-/PE-Folie', ko: '소재: 코팅지 및 유광지, PP / PE 필름', zh: '承印材料：涂布纸与光面纸、PP / PE 薄膜' },
          { hu: 'Tipikus felhasználás: termék- és élelmiszercímkék, kozmetika, egészségügy, kertészet, kültéri raktári címkék', en: 'Typical use: product and food labels, cosmetics, healthcare, horticulture, outdoor warehouse labels', de: 'Typische Anwendung: Produkt- und Lebensmitteletiketten, Kosmetik, Gesundheitswesen, Gartenbau, Lageretiketten im Außenbereich', ko: '대표 용도: 제품 및 식품 라벨, 화장품, 헬스케어, 원예, 옥외 창고 라벨', zh: '典型应用：产品与食品标签、化妆品、医疗保健、园艺、户外仓储标签' },
          { hu: 'Élettartam-igény: hónapok–évek, mérsékelt igénybevétel', en: 'Durability need: months to years, moderate exposure', de: 'Haltbarkeitsbedarf: Monate bis Jahre, moderate Beanspruchung', ko: '내구성 요구: 수개월에서 수년, 중간 수준의 노출', zh: '耐久性要求：数月至数年，中等暴露环境' },
        ],
      },
      {
        title: { hu: 'Resin — a legtartósabb megoldás', en: 'Resin — the most durable option', de: 'Resin — die beständigste Option', ko: 'Resin — 가장 내구성이 뛰어난 선택', zh: '树脂基——最耐久的选择' },
        paragraphs: [
          {
            hu: 'A tiszta műgyanta festék a legdrágább, cserébe hő-, vegyszer-, oldószer- és dörzsálló nyomatot ad a speciális műanyag alapanyagokon: PET (poliészter), poliimid, vinil, PVC. Olyan címkékhez való, amelyeknek az alkatrész teljes élettartama alatt olvashatónak kell maradniuk — akár olaj, üzemanyag, alkohol vagy tartós napfény mellett is. Vegyi anyagok jelölésénél a GHS / BS5609 tanúsított szalag-címke párosítás is követelmény lehet.',
            en: 'Pure resin ink is the most expensive, but in return it delivers heat-, chemical-, solvent- and abrasion-resistant print on specialty synthetics: PET (polyester), polyimide, vinyl, PVC. It suits labels that must stay readable for the whole life of a component — even with oil, fuel, alcohol or prolonged sunlight. For chemical labeling a GHS / BS5609 certified ribbon-label combination may be required.', de: 'Reine Harzfarbe ist am teuersten, liefert dafür aber hitze-, chemikalien-, lösungsmittel- und abriebbeständigen Druck auf Spezialkunststoffen: PET (Polyester), Polyimid, Vinyl, PVC. Sie eignet sich für Etiketten, die über die gesamte Lebensdauer eines Bauteils lesbar bleiben müssen — auch bei Öl, Kraftstoff, Alkohol oder längerer Sonneneinstrahlung. Für die Chemikalienkennzeichnung kann eine GHS-/BS5609-zertifizierte Farbband-Etiketten-Kombination erforderlich sein.', ko: '순수 Resin 잉크는 가장 비싸지만, 그만큼 PET(폴리에스터), 폴리이미드, 비닐, PVC 등 특수 합성 소재에서 내열성, 내화학성, 내용제성, 내마모성을 갖춘 인쇄를 제공합니다. 오일, 연료, 알코올이나 장시간의 햇빛에 노출되더라도 부품의 전체 수명 동안 판독 가능해야 하는 라벨에 적합합니다. 화학물질 라벨링에는 GHS / BS5609 인증을 받은 리본-라벨 조합이 요구될 수 있습니다.', zh: '纯树脂油墨价格最高，但可在特种合成材料——PET（聚酯）、聚酰亚胺、乙烯基、PVC——上实现耐高温、耐化学品、耐溶剂与耐磨的打印。适用于必须在部件整个生命周期内保持可读的标签——即使接触油污、燃油、酒精或长期日晒。化学品标签可能要求经 GHS / BS5609 认证的碳带-标签组合。',
          },
        ],
        bullets: [
          { hu: 'Alapanyag: PET, poliimid, vinil, PVC és más műszaki fóliák', en: 'Substrate: PET, polyimide, vinyl, PVC and other technical films', de: 'Untergrund: PET, Polyimid, Vinyl, PVC und andere technische Folien', ko: '소재: PET, 폴리이미드, 비닐, PVC 및 기타 기능성 필름', zh: '承印材料：PET、聚酰亚胺、乙烯基、PVC 及其他技术薄膜' },
          { hu: 'Tipikus felhasználás: autóipar, elektronika (NYÁK-címkék), vegyipar (GHS / BS5609), laboratórium, gyógyszeripar, kültéri eszközcímkék', en: 'Typical use: automotive, electronics (PCB labels), chemicals (GHS / BS5609), laboratory, pharma, outdoor asset labels', de: 'Typische Anwendung: Automobil, Elektronik (PCB-Etiketten), Chemie (GHS / BS5609), Labor, Pharma, Inventaretiketten im Außenbereich', ko: '대표 용도: 자동차, 전자(PCB 라벨), 화학(GHS / BS5609), 실험실, 제약, 옥외 자산 라벨', zh: '典型应用：汽车、电子（PCB 标签）、化工（GHS / BS5609）、实验室、制药、户外资产标签' },
          { hu: 'Élettartam-igény: évek–évtizedek, extrém igénybevétel', en: 'Durability need: years to decades, extreme exposure', de: 'Haltbarkeitsbedarf: Jahre bis Jahrzehnte, extreme Beanspruchung', ko: '내구성 요구: 수년에서 수십 년, 극한 노출', zh: '耐久性要求：数年至数十年，极端暴露环境' },
        ],
      },
      {
        title: { hu: 'Hogyan válasszunk?', en: 'How to choose?', de: 'Wie wählt man?', ko: '어떻게 선택할까요?', zh: '如何选择？' },
        paragraphs: [
          {
            hu: 'Először a címke alapanyagát kell a feladathoz igazítani (megjelenés, tartósság, környezeti hatások), és ehhez választható a megfelelő szalag. Ökölszabály: amilyen igénybevételt a címkének ki kell bírnia, ugyanazt a nyomatnak is bírnia kell. Kérdés esetén segítünk a konkrét nyomtató–címke–szalag hármas összehangolásában — a legtöbb kombinációt teszteljük is.',
            en: 'First match the label substrate to the task (appearance, durability, environmental exposure), then pick the ribbon to suit it. Rule of thumb: whatever exposure the label must survive, the print must survive too. We are happy to help match the exact printer-label-ribbon combination — most combinations we also test.', de: 'Stimmen Sie zuerst das Etikettenmaterial auf die Aufgabe ab (Aussehen, Haltbarkeit, Umwelteinflüsse), und wählen Sie dann das passende Farbband. Faustregel: Was das Etikett überstehen muss, muss auch der Druck überstehen. Wir helfen gern, die exakte Drucker-Etikett-Farbband-Kombination zu finden — die meisten Kombinationen testen wir auch.', ko: '먼저 작업에 맞는 라벨 소재(외관, 내구성, 환경 노출)를 정한 다음, 그에 맞는 리본을 선택하십시오. 경험 법칙: 라벨이 견뎌야 하는 노출은 인쇄면도 견뎌야 합니다. 프린터-라벨-리본의 정확한 조합 매칭을 기꺼이 도와드리며, 대부분의 조합은 직접 테스트도 진행합니다.', zh: '首先根据任务要求（外观、耐久性、环境暴露）选定标签材料，再据此挑选碳带。经验法则：标签需要承受什么样的环境，打印内容也必须同样承受得住。我们乐于协助匹配打印机-标签-碳带的精确组合——大多数组合我们还会进行实测。',
          },
        ],
      },
    ],
  },
  {
    slug: 'cimkeanyagok',
    title: {
      hu: 'Címkeanyagok és ragasztók: melyiket mikor?',
      en: 'Label materials and adhesives: which one and when?', de: 'Etikettenmaterialien und Klebstoffe: welcher und wann?', ko: '라벨 소재와 접착제: 언제 어떤 것을 사용할까요?', zh: '标签材料与胶粘剂：何时选用哪一种？',
    },
    short: {
      hu: 'Papírtól a poliészterig, visszaszedhetőtől a mélyfagyasztós ragasztóig — áttekintő a címke felépítéséről.',
      en: 'From paper to polyester, removable to deep-freeze adhesives — an overview of label construction.', de: 'Von Papier bis Polyester, von ablösbaren bis Tiefkühlklebstoffen — ein Überblick über den Etikettenaufbau.', ko: '종이부터 폴리에스터까지, 리무버블부터 냉동용 접착제까지 — 라벨 구조에 대한 개요.', zh: '从纸张到聚酯，从可移除到深冷冻胶粘剂——标签结构一览。',
    },
    lead: {
      hu: 'Egy öntapadós címke három rétegből áll: felső anyag (erre nyomtatunk), ragasztó és hordozó (liner). A megfelelő kombináció a felülettől, a hőmérséklettől és a címke élettartamától függ.',
      en: 'A self-adhesive label has three layers: face material (the printed layer), adhesive and liner. The right combination depends on the surface, the temperature and the label lifetime.', de: 'Ein Selbstklebeetikett besteht aus drei Schichten: Obermaterial (der bedruckten Schicht), Klebstoff und Trägermaterial. Die richtige Kombination hängt von Oberfläche, Temperatur und Lebensdauer des Etiketts ab.', ko: '점착 라벨은 세 개의 층으로 구성됩니다: 표면 소재(인쇄되는 층), 접착제, 라이너. 올바른 조합은 부착 표면, 온도, 라벨 수명에 따라 달라집니다.', zh: '自粘标签由三层构成：面材（承印层）、胶粘剂与底纸。正确的组合取决于粘贴表面、温度与标签使用寿命。',
    },
    sections: [
      {
        title: { hu: 'Felső anyagok (amire nyomtatunk)', en: 'Face materials (what we print on)', de: 'Obermaterialien (worauf gedruckt wird)', ko: '표면 소재(인쇄되는 소재)', zh: '面材（打印载体）' },
        paragraphs: [
          {
            hu: 'A leggyakoribb felső anyagok az ártól és a tartósságtól függően:',
            en: 'The most common face materials, by price and durability:', de: 'Die gängigsten Obermaterialien, nach Preis und Beständigkeit:', ko: '가격과 내구성 기준으로 가장 일반적인 표면 소재는 다음과 같습니다:', zh: '按价格与耐久性排列的最常用面材：',
          },
        ],
        bullets: [
          { hu: 'Natúr (vellum) papír — a gazdaságos alapválasztás logisztikai és irodai címkékhez, wax szalaggal', en: 'Uncoated (vellum) paper — the economical baseline for logistics and office labels, with wax ribbon', de: 'Ungestrichenes (Vellum-)Papier — die wirtschaftliche Basis für Logistik- und Büroetiketten, mit Wax-Farbband', ko: '무코팅(벨럼) 종이 — 물류 및 사무용 라벨을 위한 경제적인 기본 선택, Wax 리본과 함께 사용', zh: '未涂布（胶版）纸——物流与办公标签的经济基础选择，搭配蜡基碳带' },
          { hu: 'Műnyomó (fényes) papír — szebb megjelenés termékcímkékhez, wax-resin szalaggal', en: 'Coated (glossy) paper — nicer look for product labels, with wax-resin ribbon', de: 'Gestrichenes (Glanz-)Papier — edlere Optik für Produktetiketten, mit Wax-Resin-Farbband', ko: '코팅(유광) 종이 — 제품 라벨에 더 보기 좋은 외관, Wax-Resin 리본과 함께 사용', zh: '涂布（光面）纸——外观更佳，适合产品标签，搭配混合基碳带' },
          { hu: 'PP (polipropilén) fólia — víz- és vegyszerálló, jó ár/érték; kozmetika, vegyi áru, kültér', en: 'PP (polypropylene) film — water- and chemical-resistant, good value; cosmetics, chemicals, outdoor', de: 'PP-Folie (Polypropylen) — wasser- und chemikalienbeständig, gutes Preis-Leistungs-Verhältnis; Kosmetik, Chemie, Außenbereich', ko: 'PP(폴리프로필렌) 필름 — 내수성과 내화학성을 갖춘 가성비 소재; 화장품, 화학, 옥외용', zh: 'PP（聚丙烯）薄膜——防水耐化学品，性价比高；化妆品、化工、户外' },
          { hu: 'PE (polietilén) fólia — rugalmas, gyűrhető felületekre (flakonok, tubusok)', en: 'PE (polyethylene) film — flexible, for squeezable surfaces (bottles, tubes)', de: 'PE-Folie (Polyethylen) — flexibel, für quetschbare Oberflächen (Flaschen, Tuben)', ko: 'PE(폴리에틸렌) 필름 — 유연하여 눌리는 표면(보틀, 튜브)에 적합', zh: 'PE（聚乙烯）薄膜——柔韧，适用于可挤压表面（瓶身、软管）' },
          { hu: 'PET (poliészter) — méret- és hőstabil, resin szalaggal évtizedes élettartam; adattáblák, eszközcímkék, elektronika', en: 'PET (polyester) — dimensionally and thermally stable, decades of life with resin ribbon; rating plates, asset labels, electronics', de: 'PET (Polyester) — form- und temperaturstabil, Jahrzehnte Lebensdauer mit Resin-Farbband; Typenschilder, Inventaretiketten, Elektronik', ko: 'PET(폴리에스터) — 치수 및 열 안정성이 뛰어나 Resin 리본과 함께 수십 년의 수명 제공; 명판, 자산 라벨, 전자 제품', zh: 'PET（聚酯）——尺寸与热稳定性佳，搭配树脂基碳带可使用数十年；铭牌、资产标签、电子行业' },
          { hu: 'Speciális anyagok — poliimid (forrasztásálló NYÁK-címkék), textil, biztonsági (VOID) és roncsolódó anyagok', en: 'Specialty materials — polyimide (solder-resistant PCB labels), textile, security (VOID) and destructible stocks', de: 'Spezialmaterialien — Polyimid (lötbeständige PCB-Etiketten), Textil, Sicherheits- (VOID) und zerstörbare Materialien', ko: '특수 소재 — 폴리이미드(내납땜성 PCB 라벨), 텍스타일, 보안(VOID) 및 파괴형 소재', zh: '特种材料——聚酰亚胺（耐焊接 PCB 标签）、纺织材料、防伪（VOID）与易碎材料' },
        ],
      },
      {
        title: { hu: 'Ragasztótípusok', en: 'Adhesive types', de: 'Klebstofftypen', ko: '접착제 유형', zh: '胶粘剂类型' },
        paragraphs: [
          {
            hu: 'A ragasztót a felülethez és a felragasztás hőmérsékletéhez kell választani — utólag már nehéz korrigálni:',
            en: 'Choose the adhesive for the surface and the application temperature — it is hard to correct afterwards:', de: 'Wählen Sie den Klebstoff passend zu Oberfläche und Verarbeitungstemperatur — nachträglich lässt sich das kaum korrigieren:', ko: '접착제는 부착 표면과 적용 온도에 맞게 선택하십시오 — 나중에 수정하기 어렵습니다:', zh: '请根据粘贴表面与施贴温度选择胶粘剂——事后很难补救：',
          },
        ],
        bullets: [
          { hu: 'Permanens — az általános választás: sima, tiszta felületen tartósan ragad', en: 'Permanent — the general choice: bonds durably to smooth, clean surfaces', de: 'Permanent — die Standardwahl: haftet dauerhaft auf glatten, sauberen Oberflächen', ko: '영구형 — 일반적인 선택: 매끄럽고 깨끗한 표면에 내구성 있게 접착', zh: '永久型——通用选择：在光滑洁净的表面上持久粘合' },
          { hu: 'Erős (high-tack) — durva, poros vagy alacsony felületi energiájú felületekre (raklap, fa, egyes műanyagok)', en: 'High-tack — for rough, dusty or low-surface-energy surfaces (pallets, wood, certain plastics)', de: 'High-Tack — für raue, staubige oder niederenergetische Oberflächen (Paletten, Holz, bestimmte Kunststoffe)', ko: '고점착형 — 거칠거나 먼지가 많거나 표면 에너지가 낮은 표면용(팔레트, 목재, 일부 플라스틱)', zh: '高粘型——适用于粗糙、多尘或低表面能表面（托盘、木材、某些塑料）' },
          { hu: 'Visszaszedhető (removable) — nyom nélkül eltávolítható: üveg, elektronika, akciós árjelzés', en: 'Removable — peels off without residue: glass, electronics, promotional pricing', de: 'Ablösbar — lässt sich rückstandsfrei abziehen: Glas, Elektronik, Aktionspreise', ko: '리무버블 — 잔여물 없이 제거 가능: 유리, 전자 제품, 프로모션 가격 표시', zh: '可移除型——揭下不留残胶：玻璃、电子产品、促销价签' },
          { hu: 'Hűtőházi — +5 °C körüli, nedves-hideg környezetben is ragad (friss élelmiszer, hűtött logisztika)', en: 'Chilled — bonds in damp, cold environments around +5 °C (fresh food, chilled logistics)', de: 'Kühlklebstoff — haftet in feuchten, kalten Umgebungen um +5 °C (Frischwaren, Kühllogistik)', ko: '냉장용 — 약 +5 °C의 습하고 차가운 환경에서 접착(신선 식품, 냉장 물류)', zh: '冷藏型——在 +5 °C 左右的潮湿低温环境中粘合（生鲜食品、冷链物流）' },
          { hu: 'Mélyfagyasztós (deep-freeze) — akár −40 °C-on is felragasztható és ott is tapad (fagyasztott élelmiszer, hűtőházak)', en: 'Deep-freeze — can be applied and holds down to −40 °C (frozen food, cold stores)', de: 'Tiefkühlklebstoff — verklebbar und haftend bis −40 °C (Tiefkühlkost, Kühlhäuser)', ko: '냉동용 — 최저 −40 °C까지 부착 및 유지 가능(냉동식품, 냉동 창고)', zh: '深冷冻型——可在低至 −40 °C 的条件下施贴并保持粘合（冷冻食品、冷库）' },
          { hu: 'Speciális ragasztók — nedves felületre tapadó, magas hőállóságú, illetve élelmiszer-közvetlen (ISEGA) minősítésű változatok', en: 'Specialty adhesives — wet-surface, high-temperature and direct food contact (ISEGA) certified variants', de: 'Spezialklebstoffe — Varianten für nasse Oberflächen, hohe Temperaturen und mit Zulassung für direkten Lebensmittelkontakt (ISEGA)', ko: '특수 접착제 — 습윤 표면용, 고온용, 식품 직접 접촉(ISEGA) 인증 제품', zh: '特种胶粘剂——湿表面、耐高温以及通过直接食品接触（ISEGA）认证的型号' },
        ],
      },
      {
        title: { hu: 'Gyors párosító', en: 'Quick matcher', de: 'Schnellzuordnung', ko: '빠른 매칭 가이드', zh: '快速匹配' },
        paragraphs: [
          {
            hu: 'Néhány tipikus feladat és a bevált kombináció:',
            en: 'A few typical tasks and the proven combination:', de: 'Einige typische Aufgaben und die bewährte Kombination:', ko: '대표적인 작업과 검증된 조합 몇 가지:', zh: '几种典型任务及经过验证的组合：',
          },
        ],
        bullets: [
          { hu: 'Szállítmánycímke, csomagküldés → vellum papír + permanens ragasztó + wax szalag', en: 'Shipping label, parcels → vellum paper + permanent adhesive + wax ribbon', de: 'Versandetikett, Pakete → Vellum-Papier + Permanentklebstoff + Wax-Farbband', ko: '배송 라벨, 소포 → 벨럼 종이 + 영구형 접착제 + Wax 리본', zh: '运输标签、包裹 → 胶版纸 + 永久型胶粘剂 + 蜡基碳带' },
          { hu: 'Termékcímke polcra → műnyomó papír + permanens + wax-resin', en: 'Retail product label → coated paper + permanent + wax-resin', de: 'Produktetikett im Einzelhandel → gestrichenes Papier + permanent + Wax-Resin', ko: '소매 제품 라벨 → 코팅지 + 영구형 + Wax-Resin', zh: '零售产品标签 → 涂布纸 + 永久型 + 混合基' },
          { hu: 'Fagyasztott élelmiszer → papír vagy PP + mélyfagyasztós ragasztó + wax-resin', en: 'Frozen food → paper or PP + deep-freeze adhesive + wax-resin', de: 'Tiefkühlkost → Papier oder PP + Tiefkühlklebstoff + Wax-Resin', ko: '냉동식품 → 종이 또는 PP + 냉동용 접착제 + Wax-Resin', zh: '冷冻食品 → 纸张或 PP + 深冷冻胶粘剂 + 混合基' },
          { hu: 'Vegyi áru (GHS) → PP/PE fólia + permanens + resin (BS5609 tanúsítással)', en: 'Chemicals (GHS) → PP/PE film + permanent + resin (BS5609 certified)', de: 'Chemikalien (GHS) → PP-/PE-Folie + permanent + Resin (BS5609-zertifiziert)', ko: '화학물질(GHS) → PP/PE 필름 + 영구형 + Resin(BS5609 인증)', zh: '化学品（GHS）→ PP/PE 薄膜 + 永久型 + 树脂基（BS5609 认证）' },
          { hu: 'Adattábla, elektronika → PET vagy poliimid + erős ragasztó + resin', en: 'Rating plate, electronics → PET or polyimide + high-tack adhesive + resin', de: 'Typenschild, Elektronik → PET oder Polyimid + High-Tack-Klebstoff + Resin', ko: '명판, 전자 제품 → PET 또는 폴리이미드 + 고점착 접착제 + Resin', zh: '铭牌、电子产品 → PET 或聚酰亚胺 + 高粘型胶粘剂 + 树脂基' },
          { hu: 'Akciós ár, üvegfelület → papír + visszaszedhető ragasztó + wax', en: 'Promotions, glass surfaces → paper + removable adhesive + wax', de: 'Aktionen, Glasflächen → Papier + ablösbarer Klebstoff + Wax', ko: '프로모션, 유리 표면 → 종이 + 리무버블 접착제 + Wax', zh: '促销、玻璃表面 → 纸张 + 可移除型胶粘剂 + 蜡基' },
        ],
      },
      {
        title: { hu: 'Egyedi címkegyártás', en: 'Custom label production', de: 'Individuelle Etikettenproduktion', ko: '맞춤형 라벨 제작', zh: '定制标签生产' },
        paragraphs: [
          {
            hu: 'Egyedi méretben, anyagból és kivitelben gyártunk címkét — a fenti kombinációkban segítünk választani, mintát is biztosítunk. Használja címke-ajánlatkérő űrlapunkat, ahol a méretek megadását ábra segíti.',
            en: 'We produce labels in custom sizes, materials and constructions — we help pick from the combinations above and provide samples. Use our label quote form, where a diagram helps with the dimensions.', de: 'Wir fertigen Etiketten in individuellen Größen, Materialien und Konstruktionen — wir helfen bei der Auswahl aus den obigen Kombinationen und stellen Muster bereit. Nutzen Sie unser Etiketten-Angebotsformular, in dem eine Zeichnung bei den Abmessungen hilft.', ko: '맞춤형 크기, 소재, 구조의 라벨을 제작합니다. 위 조합 중에서의 선택을 도와드리며 샘플도 제공합니다. 치수 입력을 돕는 도면이 포함된 라벨 견적 양식을 이용해 주십시오.', zh: '我们可按定制尺寸、材料与结构生产标签——协助您从上述组合中选择，并提供样品。请使用我们的标签询价表单，其中的示意图可帮助您确定尺寸。',
          },
        ],
        link: {
          href: '/cimke-ajanlatkero',
          label: { hu: 'Címke-ajánlatkérő űrlap megnyitása', en: 'Open the label quote form', de: 'Zum Etiketten-Angebotsformular', ko: '라벨 견적 양식 열기', zh: '打开标签询价表单' },
        },
      },
    ],
  },
  {
    slug: 'cimkezo-rendszer-tervezese',
    title: {
      hu: 'Automata címkézés tervezése: milyen adatokat kérünk?',
      en: 'Planning an automatic labeling system: what data we need', de: 'Planung einer automatischen Etikettieranlage: welche Daten wir benötigen', ko: '자동 라벨링 시스템 기획: 어떤 데이터가 필요한가', zh: '规划自动贴标系统：我们需要哪些数据',
    },
    short: {
      hu: 'Címkéző gép kiválasztásához a címke, a termék és a folyamat adatai kellenek — végigvezetjük a teljes listán.',
      en: 'Choosing a labeling machine needs data on the label, the product and the process — here is the full checklist.', de: 'Die Auswahl einer Etikettiermaschine erfordert Daten zum Etikett, zum Produkt und zum Prozess — hier ist die vollständige Checkliste.', ko: '라벨링 장비를 선정하려면 라벨, 제품, 공정에 대한 데이터가 필요합니다 — 전체 체크리스트를 안내합니다.', zh: '选择贴标设备需要标签、产品和工艺三方面的数据 —— 以下是完整的检查清单。',
    },
    lead: {
      hu: 'Az automata címkézés nem egyetlen gép, hanem rendszer: nyomtató, applikátor, felrakófej, érzékelők és tartószerkezet együtt. Ahhoz, hogy a rendszer az első próbálkozásra jól működjön, néhány adatot előre tisztázni kell. Az alábbi lista a cab hivatalos címkézési adatlapja (Checkliste Etikettierung) alapján készült — ugyanezeket az adatokat kérjük Öntől is, amikor címkéző rendszert tervezünk.',
      en: 'Automatic labeling is not a single machine but a system: printer, applicator, tamp pad, sensors and mounting frame together. For the system to work right the first time, a few things must be clarified up front. The list below follows cab’s official labeling checklist (Checkliste Etikettierung) — these are the same details we ask for when we design a labeling system.', de: 'Automatisches Etikettieren ist keine einzelne Maschine, sondern ein System: Etikettendrucker, Applikator, Druckstempel, Sensoren und Traggestell zusammen. Damit das System auf Anhieb richtig funktioniert, müssen einige Punkte vorab geklärt werden. Die folgende Liste folgt der offiziellen Checkliste Etikettierung von cab — es sind dieselben Angaben, die wir abfragen, wenn wir eine Etikettieranlage auslegen.', ko: '자동 라벨링은 단일 장비가 아니라 하나의 시스템입니다. 라벨 프린터, 어플리케이터, 태핑 패드, 센서, 장착 프레임이 함께 작동합니다. 시스템이 처음부터 올바르게 동작하려면 몇 가지 사항을 사전에 명확히 해야 합니다. 아래 목록은 cab의 공식 라벨링 체크리스트(Checkliste Etikettierung)를 따른 것으로, 저희가 라벨링 시스템을 설계할 때 요청하는 것과 동일한 정보입니다.', zh: '自动贴标不是一台单独的机器，而是一套系统：标签打印机、贴标模块、贴标头、传感器和安装机架共同构成整体。为了让系统一次就能正常运行，有几件事必须事先明确。下面的清单依据 cab 的官方贴标检查表（Checkliste Etikettierung）编制 —— 这些正是我们设计贴标系统时需要了解的细节。',
    },
    sections: [
      {
        title: { hu: '1. A címke adatai', en: '1. Label data', de: '1. Etikettendaten', ko: '1. 라벨 데이터', zh: '1. 标签数据' },
        paragraphs: [
          {
            hu: 'A címke mérete és felépítése határozza meg a nyomtató fejszélességét, a tekercstartó méretét és az applikátor típusát. A méreteket a futásirányhoz képest adjuk meg: B a szélesség, H a hossz (magasság) futásirányban, A a címkeköz, C a hordozószalag teljes szélessége, R a sarok lekerekítése.',
            en: 'The size and construction of the label determine the printhead width, the unwinder size and the applicator type. Dimensions are given relative to the running direction: B is the width, H the length (height) in running direction, A the gap between labels, C the total liner width, R the corner radius.', de: 'Größe und Aufbau des Etiketts bestimmen die Druckkopfbreite, die Größe des Abwicklers und den Applikatortyp. Die Maße beziehen sich auf die Laufrichtung: B ist die Breite, H die Länge (Höhe) in Laufrichtung, A der Abstand zwischen den Etiketten, C die Gesamtbreite des Trägermaterials, R der Eckenradius.', ko: '라벨의 크기와 구성은 프린트헤드 폭, 언와인더 크기, 어플리케이터 유형을 결정합니다. 치수는 진행 방향을 기준으로 표기하며, B는 폭, H는 진행 방향의 길이(높이), A는 라벨 간 간격, C는 라이너 전체 폭, R은 모서리 반경입니다.', zh: '标签的尺寸和结构决定打印头宽度、放卷器尺寸和贴标模块类型。尺寸以走纸方向为基准给出：B 为宽度，H 为走纸方向上的长度（高度），A 为标签间距，C 为底纸总宽度，R 为圆角半径。',
          },
        ],
        bullets: [
          { hu: 'Címkeméret: szélesség (B), hossz (H), címkeköz (A), hordozó szélessége (C), sarok lekerekítés (R) — és a hozzájuk tartozó tűrések', en: 'Label size: width (B), length (H), gap (A), liner width (C), corner radius (R) — and the applicable tolerances', de: 'Etikettengröße: Breite (B), Länge (H), Abstand (A), Breite des Trägermaterials (C), Eckenradius (R) — sowie die geltenden Toleranzen', ko: '라벨 크기: 폭(B), 길이(H), 간격(A), 라이너 폭(C), 모서리 반경(R) — 그리고 해당 공차', zh: '标签尺寸：宽度（B）、长度（H）、间距（A）、底纸宽度（C）、圆角半径（R）—— 以及适用的公差' },
          { hu: 'Tekercsadatok: külső átmérő (Ø D), magátmérő (Ø d), belülre vagy kívülre tekercselt', en: 'Roll data: outer diameter (Ø D), core diameter (Ø d), wound inside or outside', de: 'Rollendaten: Außendurchmesser (Ø D), Kerndurchmesser (Ø d), innen oder außen gewickelt', ko: '라벨 롤 데이터: 외경(Ø D), 지관 내경(Ø d), 내권 또는 외권', zh: '标签卷数据：外径（Ø D）、卷芯内径（Ø d）、内卷或外卷' },
          { hu: 'Címke alapanyaga és vastagsága, a hordozó (liner) anyaga és vastagsága, a címke színe', en: 'Face material and thickness, liner material and thickness, label colour', de: 'Obermaterial und dessen Dicke, Trägermaterial und dessen Dicke, Etikettenfarbe', ko: '표면재의 재질과 두께, 라이너의 재질과 두께, 라벨 색상', zh: '面材材质和厚度、底纸材质和厚度、标签颜色' },
          { hu: 'Festékszalag: szélesség, minőség (wax / wax-resin / resin), futáshossz, tekercselés iránya', en: 'Thermal transfer ribbon: width, quality (wax / wax-resin / resin), length, winding direction', de: 'Thermotransfer-Farbband: Breite, Qualität (Wachs / Wachs-Harz / Harz), Länge, Wickelrichtung', ko: '열전사 리본: 폭, 품질(왁스 / 왁스-레진 / 레진), 길이, 권취 방향', zh: '热转印碳带：宽度、类型（蜡基／混合基／树脂基）、长度、卷绕方向' },
          { hu: 'Van-e címkeminta és méretezett rajz — ezek felgyorsítják a tervezést', en: 'Whether a label sample and a dimensioned drawing are available — these speed up the design', de: 'Ob ein Etikettenmuster und eine bemaßte Zeichnung vorliegen — diese beschleunigen die Auslegung', ko: '라벨 샘플과 치수 기입 도면의 확보 여부 — 이는 설계 속도를 높여 줍니다', zh: '是否具备标签样品和标注尺寸的图纸 —— 这些能加快设计进度' },
        ],
      },
      {
        title: { hu: '2. A termék adatai', en: '2. Product data', de: '2. Produktdaten', ko: '2. 제품 데이터', zh: '2. 产品数据' },
        paragraphs: [
          {
            hu: 'A címkézendő termék anyaga és mérete dönti el, hogy milyen felrakási módszer működik: a ragasztó máshogy tapad kartonra, üvegre vagy szilikonos felületre, és a mérettűrés befolyásolja a felrakófej lökethosszát.',
            en: 'The material and size of the product decide which application method works: adhesive behaves differently on cardboard, glass or a silicone surface, and dimensional tolerance affects the stroke length of the tamp pad.', de: 'Material und Größe des Produkts entscheiden darüber, welches Aufbringverfahren funktioniert: Der Klebstoff verhält sich auf Karton, Glas oder einer Silikonoberfläche unterschiedlich, und die Maßtoleranz wirkt sich auf die Hublänge des Druckstempels aus.', ko: '제품의 재질과 크기는 어떤 부착 방식이 적합한지를 결정합니다. 접착제는 판지, 유리, 실리콘 표면에서 각각 다르게 거동하며, 치수 공차는 태핑 패드의 스트로크 길이에 영향을 줍니다.', zh: '产品的材质和尺寸决定采用哪种贴标方式：不干胶在纸板、玻璃或硅胶表面上的附着表现各不相同，而尺寸公差会影响贴标头的行程长度。',
          },
        ],
        bullets: [
          { hu: 'Anyag: karton/papír, üveg, gumi, műanyag fólia, fém, fa vagy egyéb', en: 'Material: cardboard/paper, glass, rubber, plastic film, metal, wood or other', de: 'Material: Karton/Papier, Glas, Gummi, Kunststofffolie, Metall, Holz oder Sonstiges', ko: '재질: 판지/종이, 유리, 고무, 플라스틱 필름, 금속, 목재 또는 기타', zh: '材质：纸板／纸张、玻璃、橡胶、塑料薄膜、金属、木材或其他' },
          { hu: 'A munkadarab tömege (kg) és méretei — állandó vagy változó méret (tól–ig értékekkel)', en: 'Weight of the workpiece (kg) and its dimensions — constant or variable size (with from–to values)', de: 'Gewicht des Werkstücks (kg) und dessen Abmessungen — gleichbleibende oder variable Größe (mit Von-bis-Werten)', ko: '작업물의 중량(kg)과 치수 — 크기가 일정한지 가변인지(최소–최대 값 포함)', zh: '工件重量（kg）及其尺寸 —— 尺寸恒定或可变（并给出起止数值）' },
          { hu: 'Termékminta és rajz a címkézési pozícióval megjelölve', en: 'Product sample and a drawing with the labeling position marked', de: 'Produktmuster und eine Zeichnung mit eingezeichneter Etikettierposition', ko: '제품 샘플과 라벨 부착 위치가 표시된 도면', zh: '产品样品，以及标明贴标位置的图纸' },
        ],
      },
      {
        title: { hu: '3. A címkézési folyamat', en: '3. The labeling process', de: '3. Der Etikettierprozess', ko: '3. 라벨링 공정', zh: '3. 贴标工艺' },
        paragraphs: [
          {
            hu: 'Itt derül ki, hogy elég-e egy kézi indítású állomás, vagy teljesen automata, szállítószalagra épített rendszer kell. A ciklusidő és a termékek közötti távolság közvetlenül meghatározza, melyik applikátor bírja a tempót.',
            en: 'This is where it turns out whether a manually triggered station is enough or a fully automatic, conveyor-mounted system is needed. Cycle time and the gap between products directly determine which applicator can keep up.', de: 'Hier zeigt sich, ob eine manuell ausgelöste Station ausreicht oder ob eine vollautomatische, am Förderband montierte Anlage erforderlich ist. Taktzeit und Abstand zwischen den Produkten bestimmen unmittelbar, welcher Applikator mithalten kann.', ko: '여기에서 수동으로 트리거하는 스테이션으로 충분한지, 아니면 컨베이어에 장착되는 완전 자동 시스템이 필요한지가 드러납니다. 사이클 타임과 제품 간 간격은 어떤 어플리케이터가 속도를 맞출 수 있는지를 직접적으로 결정합니다.', zh: '在这一环节可以判断是手动触发的贴标工位已经足够，还是需要安装在输送线上的全自动系统。节拍时间和产品之间的间距直接决定哪种贴标模块能够跟上生产。',
          },
        ],
        bullets: [
          { hu: 'Termék be- és kiadagolása: kézi vagy automata', en: 'Product feed and discharge: manual or automatic', de: 'Produktzuführung und -abführung: manuell oder automatisch', ko: '제품 공급 및 배출: 수동 또는 자동', zh: '产品进料和出料：手动或自动' },
          { hu: 'A címkézés indítása: lábkapcsoló, kézi nyomógomb, érzékelő, PLC-jel vagy termékfelvétel érzékelővel', en: 'Triggering: foot switch, hand button, sensor, PLC signal or product pick-up with sensor', de: 'Auslösung: Fußschalter, Handtaster, Sensor, SPS-Signal oder Produktaufnahme mit Sensor', ko: '트리거 방식: 풋 스위치, 수동 버튼, 센서, PLC 신호 또는 센서를 이용한 제품 감지', zh: '触发方式：脚踏开关、手动按钮、传感器、PLC 信号或带传感器的产品取件' },
          { hu: 'A termék a címkézés alatt áll vagy mozog — mozgás esetén állandó vagy változó szállítási sebesség (mm/s) és a termékek közötti távolság (mm)', en: 'Is the product at rest or in motion during labeling — if moving, constant or variable transport speed (mm/s) and the gap between products (mm)', de: 'Ob das Produkt beim Etikettieren steht oder sich bewegt — bei Bewegung: gleichbleibende oder variable Transportgeschwindigkeit (mm/s) und der Abstand zwischen den Produkten (mm)', ko: '라벨링 중 제품이 정지 상태인지 이동 상태인지 — 이동하는 경우 이송 속도(mm/s)가 일정한지 가변인지와 제품 간 간격(mm)', zh: '贴标时产品处于静止还是运动状态 —— 若为运动状态，需说明输送速度（mm/s）恒定还是可变，以及产品之间的间距（mm）' },
          { hu: 'Teljesítményadatok: termék/perc, ciklusidő (s), üzemóra/nap, gyártási nap/év, éves címkeszám vagy nyomtatási futáshossz', en: 'Performance data: products/minute, cycle time (s), operating hours/day, production days/year, annual number of applications or print length', de: 'Leistungsdaten: Produkte/Minute, Taktzeit (s), Betriebsstunden/Tag, Produktionstage/Jahr, jährliche Anzahl der Etikettierungen oder Drucklänge', ko: '성능 데이터: 분당 제품 수, 사이클 타임(s), 1일 가동 시간, 연간 생산 일수, 연간 부착 횟수 또는 인쇄 길이', zh: '产能数据：产品数／分钟、节拍时间（s）、每天运行小时数、每年生产天数、年贴标次数或打印长度' },
          { hu: 'Van-e termékfelvevő (fészek), és azt ki készíti', en: 'Is there a product nest, and who builds it', de: 'Ob eine Produktaufnahme vorhanden ist und wer sie baut', ko: '제품 안착부의 유무와 그 제작 주체', zh: '是否设有产品定位座，由谁制作' },
        ],
      },
      {
        title: { hu: '4. A címke helye és a felület', en: '4. Label position and surface', de: '4. Etikettenposition und Oberfläche', ko: '4. 라벨 위치와 표면', zh: '4. 标签位置和表面' },
        paragraphs: [
          {
            hu: 'A felrakás iránya (elölről, oldalról, felülről, alulról, sarokra hajtva, hengerpalástra) és a felület alakja szabja meg az applikátor és a felrakófej kivitelét. A pozíciótűrés itt kulcskérdés: ±0,2 mm-es pontosság egészen más gépet igényel, mint ±2 mm.',
            en: 'The application direction (from the front, side, top, bottom, wrapped around a corner, onto a cylinder) and the shape of the surface define the applicator and pad design. Position tolerance is key here: ±0.2 mm accuracy calls for a very different machine than ±2 mm.', de: 'Die Aufbringrichtung (von vorn, von der Seite, von oben, von unten, um eine Ecke gewickelt, auf einen Zylinder) und die Form der Oberfläche bestimmen die Auslegung von Applikator und Druckstempel. Entscheidend ist dabei die Positionstoleranz: Eine Genauigkeit von ±0,2 mm erfordert eine ganz andere Maschine als ±2 mm.', ko: '부착 방향(전면, 측면, 상면, 하면, 모서리 감싸기, 원통면)과 표면 형상은 어플리케이터와 패드 설계를 결정합니다. 여기서는 위치 공차가 핵심입니다. ±0.2 mm의 정밀도는 ±2 mm와는 전혀 다른 장비를 요구합니다.', zh: '贴标方向（从正面、侧面、顶部、底部、绕棱边包覆、贴到圆柱面上）以及表面形状决定贴标模块和压头的设计。位置公差在这里是关键：±0.2 mm 的精度要求与 ±2 mm 所需的设备完全不同。',
          },
        ],
        bullets: [
          { hu: 'Felrakás iránya: elölről, oldalról, felülről, alulról, kombinálva, sarokra átfordítva, hengerre oldalról vagy felülről, zászlósan, kúpos felületre', en: 'Application direction: front, side, top, bottom, combined, wrapped over a corner, onto a cylinder from the side or top, as a flag, onto a conical surface', de: 'Aufbringrichtung: von vorn, von der Seite, von oben, von unten, kombiniert, um eine Ecke gewickelt, auf einen Zylinder von der Seite oder von oben, als Fahnenetikett, auf eine konische Oberfläche', ko: '부착 방향: 전면, 측면, 상면, 하면, 복합, 모서리 감싸기, 원통면에 측면 또는 상면에서, 플래그 라벨 형태, 원뿔면', zh: '贴标方向：正面、侧面、顶部、底部、组合方式、绕棱边包覆、从侧面或顶部贴到圆柱面上、旗式标签、贴到锥面上' },
          { hu: 'A címke pozíciója a terméken: X és Y méret a megadott ±tűréssel (±0,2 mm-től ±10 mm-ig)', en: 'Label position on the product: X and Y dimensions with the required ± tolerance (from ±0.2 mm to ±10 mm)', de: 'Etikettenposition auf dem Produkt: Maße in X und Y mit der geforderten ±-Toleranz (von ±0,2 mm bis ±10 mm)', ko: '제품상의 라벨 위치: 요구되는 ± 공차(±0.2 mm에서 ±10 mm까지)를 포함한 X 및 Y 치수', zh: '标签在产品上的位置：X 和 Y 方向尺寸及所需的 ± 公差（从 ±0.2 mm 到 ±10 mm）' },
          { hu: 'A címkézendő felület jellege: sík, hullámos, kúpos, mélyített, rugalmas vagy merev; homorú/domború esetén a sugár (mm)', en: 'Nature of the labeled surface: flat, wavy, conical, recessed, flexible or rigid; for concave/convex surfaces the radius (mm)', de: 'Beschaffenheit der zu etikettierenden Oberfläche: eben, wellig, konisch, vertieft, flexibel oder starr; bei konkaven/konvexen Oberflächen der Radius (mm)', ko: '라벨이 부착되는 표면의 특성: 평면, 물결형, 원뿔형, 함몰형, 유연 또는 강성; 오목/볼록 표면의 경우 반경(mm)', zh: '被贴表面的性质：平面、波纹面、锥面、凹陷面、柔性或刚性；凹面／凸面还需给出半径（mm）' },
          { hu: 'A szállítás iránya a szalagon (előre balra / hátra jobbra) — ez dönti el a bal- vagy jobboldali (L/R) gépkivitelt', en: 'Transport direction on the conveyor (forward to the left / backward to the right) — this decides the left- or right-hand (L/R) machine version', de: 'Transportrichtung auf dem Förderband (vorwärts nach links / rückwärts nach rechts) — davon hängt die links- oder rechtsseitige Maschinenausführung (L/R) ab', ko: '컨베이어의 이송 방향(좌측으로 전진 / 우측으로 후진) — 이는 좌측형 또는 우측형(L/R) 장비 사양을 결정합니다', zh: '输送机上的输送方向（向左为前进／向右为后退）—— 这决定设备采用左手还是右手（L/R）版本' },
        ],
      },
      {
        title: { hu: '5. Nyomtató és applikátor', en: '5. Printer and applicator', de: '5. Etikettendrucker und Applikator', ko: '5. 라벨 프린터와 어플리케이터', zh: '5. 打印机和贴标模块' },
        paragraphs: [
          {
            hu: 'A fenti adatokból már kiválasztható a nyomtató (HERMES Q, Hermes C vagy SQUIX) és hozzá az applikátor. A nyomtatónál a fejszélesség (2", 4", 6"), a felbontás (200/300/600 dpi), a beépítési oldal (L/R) és a tekercstartó mérete (205 vagy 305 mm) a döntő paraméter.',
            en: 'From the data above the printer (HERMES Q, Hermes C or SQUIX) and its applicator can be selected. For the printer the decisive parameters are the printhead width (2", 4", 6"), resolution (200/300/600 dpi), the installation side (L/R) and the unwinder size (205 or 305 mm).', de: 'Aus den obigen Daten lassen sich der Drucker (HERMES Q, Hermes C oder SQUIX) und der zugehörige Applikator auswählen. Beim Drucker sind die Druckkopfbreite (2", 4", 6"), die Auflösung (200/300/600 dpi), die Einbauseite (L/R) und die Größe des Abwicklers (205 oder 305 mm) die entscheidenden Parameter.', ko: '위의 데이터를 바탕으로 프린터(HERMES Q, Hermes C 또는 SQUIX)와 그에 맞는 어플리케이터를 선정할 수 있습니다. 프린터의 경우 프린트헤드 폭(2", 4", 6"), 해상도(200/300/600 dpi), 설치 방향(L/R), 언와인더 크기(205 또는 305 mm)가 결정적인 사양입니다.', zh: '根据以上数据即可选定打印机（HERMES Q、Hermes C 或 SQUIX）及其贴标模块。对打印机而言，决定性参数是打印头宽度（2"、4"、6"）、分辨率（200/300/600 dpi）、安装方向（L/R）和放卷器尺寸（205 或 305 mm）。',
          },
        ],
        bullets: [
          { hu: 'Applikátor típusa: karos (3014/3016), löketes (4014, 4114, 4414), forgó-löketes (4214), zászlós (4712), fúvó (6114) és egyedi kivitelek', en: 'Applicator type: swing-arm (3014/3016), stroke (4014, 4114, 4414), rotate-and-stroke (4214), flag (4712), blow-on (6114) and custom versions', de: 'Applikatortyp: Schwenkarm (3014/3016), Hub (4014, 4114, 4414), Dreh-Hub (4214), Fahnenapplikator (4712), Blasapplikator (6114) sowie Sonderausführungen', ko: '어플리케이터 유형: 스윙 암(3014/3016), 스트로크(4014, 4114, 4414), 회전 스트로크(4214), 플래그(4712), 블로우온(6114) 및 맞춤 사양', zh: '贴标模块类型：摆臂式（3014/3016）、行程式（4014、4114、4414）、旋转行程式（4214）、旗式（4712）、吹气式（6114）以及定制版本' },
          { hu: 'Löket- vagy karhossz (mm), forgásszög (90° vagy 180°)', en: 'Stroke or arm length (mm), rotation angle (90° or 180°)', de: 'Hub- oder Armlänge (mm), Drehwinkel (90° oder 180°)', ko: '스트로크 또는 암 길이(mm), 회전 각도(90° 또는 180°)', zh: '行程或摆臂长度（mm）、旋转角度（90° 或 180°）' },
          { hu: 'A nyomtató alsó éle és a termék közötti minimális és maximális távolság (mm)', en: 'Minimum and maximum distance between the printer’s bottom edge and the product (mm)', de: 'Minimaler und maximaler Abstand zwischen der Unterkante des Druckers und dem Produkt (mm)', ko: '프린터 하단면과 제품 사이의 최소 및 최대 거리(mm)', zh: '打印机下边缘与产品之间的最小和最大距离（mm）' },
          { hu: 'Sűrített levegő: karbantartó egység, nyomáscsökkentő a löketszelephez, esetleg fúvószelep', en: 'Compressed air: service unit, pressure reducer for the stroke cylinder, optionally a blow valve', de: 'Druckluft: Druckluftwartungseinheit, Druckminderer für den Hubzylinder, optional ein Blasventil', ko: '압축 공기: 서비스 유닛, 스트로크 실린더용 감압 밸브, 선택 사양으로 블로우 밸브', zh: '压缩空气：气源处理单元、行程气缸用减压阀，可选配吹气阀' },
          { hu: 'Adatátvitel és szoftver: Ethernet, USB, WLAN, PROFINET; cablabel S3, NiceLabel vagy más címkéző szoftver, illetve PLC-vezérlés', en: 'Connectivity and software: Ethernet, USB, WLAN, PROFINET; cablabel S3, NiceLabel or other labeling software, or PLC control', de: 'Anbindung und Software: Ethernet, USB, WLAN, PROFINET; cablabel S3, NiceLabel oder eine andere Etikettiersoftware, oder Steuerung über SPS', ko: '연결성 및 소프트웨어: Ethernet, USB, WLAN, PROFINET; cablabel S3, NiceLabel 또는 기타 라벨링 소프트웨어, 혹은 PLC 제어', zh: '接口和软件：Ethernet、USB、WLAN、PROFINET；cablabel S3、NiceLabel 或其他标签软件，或 PLC 控制' },
        ],
      },
      {
        title: { hu: '6. Felrakófej (bélyegző) kiválasztása', en: '6. Choosing the tamp pad', de: '6. Auswahl des Druckstempels', ko: '6. 태핑 패드 선정', zh: '6. 压头的选择' },
        paragraphs: [
          {
            hu: 'A címke átadása a termékre több módon történhet, és ehhez igazodik a felrakófej felülete is. Egy sima műanyag doboz mást kíván, mint egy rugalmas fóliazacskó vagy egy szilikonos alkatrész.',
            en: 'The label can be transferred to the product in several ways, and the pad surface follows suit. A smooth plastic box calls for something different than a flexible film bag or a silicone part.', de: 'Das Etikett lässt sich auf verschiedene Weise auf das Produkt übertragen, und die Stempeloberfläche richtet sich danach. Eine glatte Kunststoffbox erfordert etwas anderes als ein flexibler Folienbeutel oder ein Silikonteil.', ko: '라벨은 여러 방식으로 제품에 전달될 수 있으며, 패드 표면도 이에 맞춰 달라집니다. 매끄러운 플라스틱 상자에는 유연한 필름 백이나 실리콘 부품과는 다른 사양이 필요합니다.', zh: '标签可以通过多种方式转移到产品上，压头表面也随之不同。光滑的塑料盒所需的方案，与柔性薄膜袋或硅胶件完全不同。',
          },
        ],
        bullets: [
          { hu: 'Átadási mód: bélyegzés, rugós bélyegzés, ráfújás, ráhengerlés, körbecímkézés, zászlós felrakás, formára igazítás (szilikon), mechanikus adagolómodul', en: 'Transfer method: tamping, sprung tamping, blow-on, roll-on, wrap-around, flag application, form-fitting (silicone), mechanical dispensing module', de: 'Übertragungsverfahren: Stempeln, gefedertes Stempeln, Anblasen, Anrollen, Umwickeln, Fahnenetikettierung, formschlüssig (Silikon), mechanisches Spendemodul', ko: '전달 방식: 태핑, 스프링 태핑, 블로우온, 롤온, 감싸 붙이기, 플래그 라벨 부착, 형상 밀착(실리콘), 기계식 디스펜싱 모듈', zh: '转移方式：直压式、弹簧压式、吹气式、滚压式、包覆式、旗式贴标、贴合成型（硅胶）、机械剥标模块' },
          { hu: 'Bélyegzőfelület: csupasz, csúszófóliás/teflonos, csillapított + csúszófóliás, gumis (Bumpon), szilikonos, címkeütközővel', en: 'Pad surface: blank, gliding film/PTFE-coated, damped + gliding film, rubber (Bumpon), silicone, with label stop', de: 'Stempeloberfläche: blank, mit Gleitfolie/PTFE-beschichtet, gedämpft + Gleitfolie, Gummi (Bumpon), Silikon, mit Etikettenanschlag', ko: '패드 표면: 무처리, 슬라이딩 필름/PTFE 코팅, 완충 + 슬라이딩 필름, 고무(Bumpon), 실리콘, 라벨 스토퍼 부착', zh: '压头表面：无涂层、滑动膜／PTFE 涂层、缓冲＋滑动膜、橡胶（Bumpon）、硅胶、带标签止挡' },
          { hu: 'Univerzális bélyegzők bevett méretekben (pl. 90×90, 116×102, 116×152 mm) vagy egyedi forma', en: 'Universal pads in standard sizes (e.g. 90×90, 116×102, 116×152 mm) or a custom shape', de: 'Universalstempel in Standardgrößen (z. B. 90×90, 116×102, 116×152 mm) oder eine Sonderform', ko: '표준 규격의 범용 패드(예: 90×90, 116×102, 116×152 mm) 또는 맞춤 형상', zh: '标准尺寸的通用压头（例如 90×90、116×102、116×152 mm）或定制形状' },
          { hu: 'Gyorscserélő rendszer, ha több címkeformátum váltakozik — adja meg a második/harmadik formátumot és a napi váltások számát', en: 'Quick-change system if several label formats alternate — state the second/third format and the number of changeovers per day', de: 'Schnellwechselsystem, wenn mehrere Etikettenformate wechseln — bitte das zweite/dritte Format und die Anzahl der Umrüstungen pro Tag angeben', ko: '여러 라벨 규격을 번갈아 사용하는 경우 퀵 체인지 시스템 — 두 번째/세 번째 규격과 1일 교체 횟수를 기재해 주십시오', zh: '若需交替使用多种标签规格，则配置快换系统 —— 请说明第二／第三种规格以及每天的换型次数' },
        ],
      },
      {
        title: { hu: '7. Zászlócímkézés kábelekre', en: '7. Flag labeling on cables', de: '7. Fahnenetikettierung an Kabeln', ko: '7. 케이블 플래그 라벨링', zh: '7. 线缆旗式贴标' },
        paragraphs: [
          {
            hu: 'A kábelekre és vezetékekre felhajtott „zászló” alakú címke külön adatlapot kap, mert szűkebbek a mérethatárok. A cab 4712-es zászlóapplikátorával a címke a kábel köré fordul, és a két vége összeragad — az így keletkező felület marad olvasható.',
            en: 'The wrapped “flag” label on cables and wires has its own checklist because the size limits are tighter. With cab’s 4712 flag applicator the label wraps around the cable and its two ends stick together — the resulting tab stays readable.', de: 'Das umwickelte „Fahnenetikett“ an Kabeln und Leitungen hat eine eigene Checkliste, weil die Größengrenzen enger sind. Mit dem Fahnenapplikator 4712 von cab wird das Etikett um das Kabel gelegt und seine beiden Enden verkleben miteinander — die so entstehende Fahne bleibt lesbar.', ko: '케이블과 전선에 감아 붙이는 “플래그 라벨”은 크기 제한이 더 엄격하기 때문에 별도의 체크리스트가 필요합니다. cab의 4712 플래그 어플리케이터에서는 라벨이 케이블을 감싸고 양쪽 끝이 서로 맞붙으며, 이렇게 형성된 탭은 판독 가능한 상태로 유지됩니다.', zh: '线缆和导线上的包覆式“旗式”标签有其专属的检查清单，因为尺寸限制更为严格。使用 cab 4712 旗式贴标模块时，标签绕线缆包覆一周，两端相互粘合 —— 由此形成的标签旗保持清晰可读。',
          },
        ],
        bullets: [
          { hu: 'Címke: szélesség (B) 50–100 mm, magasság (H) 10–50 mm, címkeköz (A) 2–5 mm, hordozószélesség (C) 62–106 mm', en: 'Label: width (B) 50–100 mm, height (H) 10–50 mm, gap (A) 2–5 mm, liner width (C) 62–106 mm', de: 'Etikett: Breite (B) 50–100 mm, Höhe (H) 10–50 mm, Abstand (A) 2–5 mm, Breite des Trägermaterials (C) 62–106 mm', ko: '라벨: 폭(B) 50–100 mm, 높이(H) 10–50 mm, 간격(A) 2–5 mm, 라이너 폭(C) 62–106 mm', zh: '标签：宽度（B）50–100 mm、高度（H）10–50 mm、间距（A）2–5 mm、底纸宽度（C）62–106 mm' },
          { hu: 'Zászlóhossz (L) 20–45 mm; kábelátmérő 3–16 mm, a belső átmérő tartománya 1–3 mm', en: 'Flag length (L) 20–45 mm; cable diameter 3–16 mm, inner diameter range 1–3 mm', de: 'Fahnenlänge (L) 20–45 mm; Kabeldurchmesser 3–16 mm, Innendurchmesserbereich 1–3 mm', ko: '플래그 길이(L) 20–45 mm; 케이블 직경 3–16 mm, 내경 범위 1–3 mm', zh: '旗部长度（L）20–45 mm；线缆直径 3–16 mm，内径范围 1–3 mm' },
          { hu: '60 mm-nél keskenyebb címkéhez távtartó szükséges a nyomtatóban', en: 'Labels narrower than 60 mm require a spacer in the printer', de: 'Etiketten mit einer Breite unter 60 mm erfordern ein Distanzstück im Drucker', ko: '폭이 60 mm 미만인 라벨에는 프린터에 스페이서가 필요합니다', zh: '宽度小于 60 mm 的标签需要在打印机内加装隔片' },
          { hu: 'A kábel egyik oldalán legalább 60 mm szabad hely kell — csatlakozó, hajlítás vagy lépcső nélkül', en: 'At least 60 mm of free space is needed on one side of the cable — with no connector, bend or step', de: 'Auf einer Seite des Kabels werden mindestens 60 mm freier Raum benötigt — ohne Stecker, Biegung oder Absatz', ko: '케이블의 한쪽에 최소 60 mm의 여유 공간이 필요하며, 커넥터나 굴곡, 단차가 없어야 합니다', zh: '线缆一侧至少需要 60 mm 的自由空间 —— 其间不得有连接器、弯曲或台阶' },
          { hu: 'A kábel merev vagy rugalmas voltát is jelezni kell, mert ez befolyásolja a felfogatást', en: 'Whether the cable is rigid or flexible must be stated, as it affects the fixture', de: 'Es ist anzugeben, ob das Kabel starr oder flexibel ist, da dies die Aufnahmevorrichtung beeinflusst', ko: '케이블이 강성인지 유연한지 반드시 명시해야 하며, 이는 고정 지그에 영향을 줍니다', zh: '必须说明线缆是刚性还是柔性的，因为这会影响夹具设计' },
        ],
      },
      {
        title: { hu: '8. Amit küldjön el nekünk', en: '8. What to send us', de: '8. Was Sie uns senden sollten', ko: '8. 보내주실 자료', zh: '8. 请提供给我们的资料' },
        paragraphs: [
          {
            hu: 'Minél több adat áll rendelkezésre, annál pontosabb az ajánlat és annál kisebb az esély a beüzemeléskori meglepetésekre. A legfontosabb mellékletek:',
            en: 'The more data available, the more precise the quotation and the smaller the chance of surprises at commissioning. The most important attachments:', de: 'Je mehr Daten vorliegen, desto genauer das Angebot und desto geringer die Gefahr von Überraschungen bei der Inbetriebnahme. Die wichtigsten Anlagen:', ko: '확보된 데이터가 많을수록 견적이 정확해지고 시운전 단계에서 예상치 못한 문제가 발생할 가능성이 줄어듭니다. 가장 중요한 첨부 자료는 다음과 같습니다:', zh: '可用的数据越多，报价就越精确，调试时出现意外的可能性也越小。最重要的附件：',
          },
        ],
        bullets: [
          { hu: 'Méretezett címkerajz és lehetőleg egy teljes mintatekercs (a festékszalagból is)', en: 'A dimensioned label drawing and ideally a full sample roll (of the ribbon as well)', de: 'Eine bemaßte Etikettenzeichnung und idealerweise eine vollständige Musterrolle (auch vom Farbband)', ko: '치수가 기입된 라벨 도면과, 가능하다면 온전한 샘플 롤(리본 포함)', zh: '标注尺寸的标签图纸，最好还有一整卷样品（碳带样品同样如此）' },
          { hu: 'Termékrajz a címke helyének megjelölésével, valamint termékminta', en: 'Product drawing with the label position marked, plus a product sample', de: 'Produktzeichnung mit eingezeichneter Etikettenposition sowie ein Produktmuster', ko: '라벨 위치가 표시된 제품 도면과 제품 샘플', zh: '标明贴标位置的产品图纸，以及产品样品' },
          { hu: 'A beépítési helyzet rajza — 3D modell (STP) vagy 2D rajz (PDF) formájában', en: 'Drawing of the installation situation — as a 3D model (STP) or a 2D drawing (PDF)', de: 'Zeichnung der Einbausituation — als 3D-Modell (STP) oder als 2D-Zeichnung (PDF)', ko: '설치 환경 도면 — 3D 모델(STP) 또는 2D 도면(PDF)', zh: '安装现场的图纸 —— 3D 模型（STP）或 2D 图纸（PDF）' },
          { hu: 'Műszaki elvárások (specifikáció), ha van, valamint fotó vagy rövid videó a jelenlegi folyamatról', en: 'Technical specification if available, plus a photo or short video of the current process', de: 'Technisches Lastenheft, sofern vorhanden, sowie ein Foto oder ein kurzes Video des aktuellen Prozesses', ko: '기술 사양서가 있는 경우 해당 자료, 그리고 현재 공정의 사진 또는 짧은 동영상', zh: '如有技术规格书请一并提供，另附现有工艺的照片或短视频' },
          { hu: 'A kívánt szállítási határidő és a tervezett éves mennyiség', en: 'The required delivery date and the planned annual volume', de: 'Der gewünschte Liefertermin und die geplante Jahresstückzahl', ko: '요구 납기일과 계획된 연간 물량', zh: '所需交货日期和计划年产量' },
        ],
        files: [
          {
            href: '/datasheets/cab-checkliste-etikettierung.pdf',
            label: { hu: 'cab címkézési adatlap (PDF)', en: 'cab labeling checklist (PDF)', de: 'cab Checkliste Etikettierung (PDF)', ko: 'cab 라벨링 체크리스트 (PDF)', zh: 'cab 贴标项目清单 (PDF)' },
          },
          {
            href: '/datasheets/cab-checkliste-fahnenetikett.pdf',
            label: { hu: 'cab zászlócímke adatlap (PDF)', en: 'cab flag label checklist (PDF)', de: 'cab Checkliste Fahnenetikett (PDF)', ko: 'cab 플래그 라벨 체크리스트 (PDF)', zh: 'cab 旗式标签项目清单 (PDF)' },
          },
        ],
        link: {
          href: '/kapcsolat',
          label: { hu: 'Küldje el az adatokat — segítünk a tervezésben', en: 'Send us the data — we help with the design', de: 'Senden Sie uns die Daten — wir helfen bei der Auslegung', ko: '데이터를 보내주시면 설계를 도와드리겠습니다', zh: '把数据发给我们 —— 我们协助完成方案设计' },
        },
      },
    ],
  },
  {
    slug: 'ragaszto-adagolok',
    title: {
      hu: 'Szalag- és címkeadagolók: mikor éri meg?',
      en: 'Tape and label dispensers: when do they pay off?', de: 'Band- und Etikettenspender: Wann lohnen sie sich?', ko: '테이프 및 라벨 디스펜서: 언제 도입할 가치가 있을까요?', zh: '胶带与标签剥离机：何时值得投入？',
    },
    short: {
      hu: 'Kézi vágás helyett pontos, ismételhető darabolás — röviden arról, mit érdemes tudni az adagolókról.',
      en: 'Precise, repeatable cutting instead of cutting by hand — a short guide to dispensers.', de: 'Präzises, wiederholbares Schneiden statt Abreißen von Hand — ein kurzer Leitfaden zu Spendern.', ko: '손으로 자르는 대신 정확하고 반복 가능한 절단. 디스펜서에 대한 짧은 안내입니다.', zh: '用精确、可重复的切割取代手工撕取——剥离机简明指南。',
    },
    lead: {
      hu: 'Ha naponta sokszor kell azonos hosszúságú ragasztószalagot vagy címkét leszakítani, egy asztali adagoló pár hét alatt megtérül: nincs több elrontott hossz, gyűrődés vagy elkezdett szalagvég keresgélése.',
      en: 'If you tear off tape or labels to the same length many times a day, a benchtop dispenser pays for itself within weeks: no more wrong lengths, creases or hunting for the start of the roll.', de: 'Wenn Sie täglich viele Male Klebeband oder Etiketten in gleicher Länge abreißen, amortisiert sich ein Tischspender innerhalb weniger Wochen: keine falschen Längen mehr, kein Verknittern und kein Suchen nach dem Rollenanfang.', ko: '매일 같은 길이의 테이프나 라벨을 여러 번 떼어내야 한다면, 탁상형 디스펜서는 몇 주 안에 투자 비용을 회수합니다. 길이 오류, 구겨짐, 롤 시작점 찾기가 사라집니다.', zh: '如果每天需要多次撕取相同长度的胶带或标签，台式剥离机通常几周内即可收回成本：不再出现长度错误、褶皱，也无需再寻找卷料的起始端。',
    },
    sections: [
      {
        title: { hu: 'Szalagadagolók (TDA)', en: 'Tape dispensers (TDA)', de: 'Bandspender (TDA)', ko: '테이프 디스펜서 (TDA)', zh: '胶带切割机 (TDA)' },
        paragraphs: [
          {
            hu: 'Az elektromos szalagadagoló beállított hosszra vágja a ragasztószalagot, és a következő darabot már előre is tolja, így a kezelő csak leveszi. A START TDA sorozat 6–150 mm széles szalagot kezel, a vágáshossz 40–9999 mm között állítható, több gyakori hossz pedig memóriába menthető.',
            en: 'An electric tape dispenser cuts tape to a preset length and feeds the next piece forward, so the operator only has to pick it up. The START TDA series handles tape 6–150 mm wide, the cut length is adjustable between 40 and 9999 mm, and frequently used lengths can be stored in memory.', de: 'Ein elektrischer Bandspender schneidet das Klebeband auf eine voreingestellte Länge und schiebt das nächste Stück vor, sodass der Bediener es nur noch abnehmen muss. Die START TDA-Serie verarbeitet Bänder von 6–150 mm Breite, die Schnittlänge ist zwischen 40 und 9999 mm einstellbar, und häufig genutzte Längen lassen sich speichern.', ko: '전동 테이프 디스펜서는 설정된 길이로 테이프를 절단하고 다음 조각을 미리 밀어내므로, 작업자는 집어 들기만 하면 됩니다. START TDA 시리즈는 폭 6–150 mm 테이프를 처리하며, 절단 길이는 40–9999 mm 범위에서 설정할 수 있고 자주 쓰는 길이는 메모리에 저장할 수 있습니다.', zh: '电动胶带切割机按预设长度切断胶带，并将下一段预先送出，操作员只需取走即可。START TDA 系列可处理宽度 6–150 mm 的胶带，切割长度可在 40–9999 mm 之间设定，常用长度还可存入记忆位。',
          },
          {
            hu: 'Erős tapadású technikai szalagokhoz (VHB, ACX, habszalag) külön, nem tapadó kivitelű görgőkkel szerelt változat készül — ez akadályozza meg, hogy a szalag a gépre ragadjon.',
            en: 'For high-tack technical tapes (VHB, ACX, foam) there is a version with non-stick feed rollers — this keeps the tape from sticking to the machine itself.', de: 'Für hochhaftende technische Bänder (VHB, ACX, Schaumband) gibt es eine Ausführung mit antihaftbeschichteten Vorschubrollen — so klebt das Band nicht an der Maschine selbst fest.', ko: '고점착 기술용 테이프(VHB, ACX, 폼 테이프)를 위해 비점착 이송 롤러를 적용한 사양이 있습니다. 테이프가 장비 자체에 달라붙는 것을 방지합니다.', zh: '针对高粘性技术胶带（VHB、ACX、泡棉胶带），提供配备不粘送料辊的机型，可防止胶带粘附在设备上。',
          },
        ],
      },
      {
        title: { hu: 'Címkeadagolók (LD / LDX)', en: 'Label dispensers (LD / LDX)', de: 'Etikettenspender (LD / LDX)', ko: '라벨 디스펜서 (LD / LDX)', zh: '标签剥离机 (LD / LDX)' },
        paragraphs: [
          {
            hu: 'A címkeadagoló lefejti az öntapadós címkét a hordozóról, és félig kitolva megállítja, hogy egy mozdulattal fel lehessen venni. Kis címkékhez a kompakt LD3000 való, nagy, hosszú címkékhez az LDX8100, amely 203 mm széles címkét is kezel, 198 mm/s sebességgel.',
            en: 'A label dispenser peels the self-adhesive label off the liner and stops it half-way out, so it can be picked up in a single motion. The compact LD3000 suits small labels, while the LDX8100 handles labels up to 203 mm wide at 198 mm/s.', de: 'Ein Etikettenspender löst das Selbstklebeetikett vom Trägermaterial und stoppt es halb ausgeschoben, sodass es in einer Bewegung entnommen werden kann. Der kompakte LD3000 eignet sich für kleine Etiketten, der LDX8100 verarbeitet Etiketten bis 203 mm Breite mit 198 mm/s.', ko: '라벨 디스펜서는 점착 라벨을 라이너에서 벗겨내 절반쯤 나온 상태에서 정지시켜, 한 동작으로 집어 들 수 있게 합니다. 소형 라벨에는 콤팩트한 LD3000이, 최대 폭 203 mm 라벨에는 198 mm/s 속도의 LDX8100이 적합합니다.', zh: '标签剥离机将不干胶标签从底纸上剥离，并在送出一半时停住，便于一次取用。紧凑型 LD3000 适合小标签，LDX8100 则可处理最大宽度 203 mm 的标签，速度达 198 mm/s。',
          },
        ],
      },
      {
        title: { hu: 'Mit adjon meg ajánlatkéréskor?', en: 'What to tell us when asking for a quote', de: 'Was Sie bei der Anfrage angeben sollten', ko: '견적 요청 시 알려주실 사항', zh: '询价时请告知我们的信息' },
        paragraphs: [
          {
            hu: 'Elég néhány adat ahhoz, hogy a megfelelő típust ajánljuk:',
            en: 'A few details are enough for us to recommend the right model:', de: 'Wenige Angaben genügen, damit wir das passende Modell empfehlen können:', ko: '몇 가지 정보만으로 적합한 모델을 추천해 드릴 수 있습니다.', zh: '只需几项信息，我们即可为您推荐合适的机型：',
          },
        ],
        bullets: [
          { hu: 'A szalag vagy címke szélessége és a kívánt hossz (fix vagy több változó hossz)', en: 'Width of the tape or label and the required length (fixed or several varying lengths)', de: 'Breite des Bandes oder Etiketts und die benötigte Länge (feste oder mehrere wechselnde Längen)', ko: '테이프 또는 라벨의 폭과 필요한 길이 (고정 길이 또는 여러 가변 길이)', zh: '胶带或标签的宽度以及所需长度（固定长度或多种可变长度）' },
          { hu: 'A szalag típusa — hagyományos ragasztószalag vagy erős tapadású technikai szalag', en: 'Type of tape — ordinary adhesive tape or a high-tack technical tape', de: 'Art des Bandes — herkömmliches Klebeband oder hochhaftendes technisches Band', ko: '테이프 종류 — 일반 접착 테이프 또는 고점착 기술용 테이프', zh: '胶带类型——普通胶带或高粘性技术胶带' },
          { hu: 'Napi darabszám és a tekercs átmérője', en: 'Daily piece count and the roll diameter', de: 'Tagesstückzahl und Rollendurchmesser', ko: '일일 사용 수량과 롤 외경', zh: '每日用量与卷料外径' },
        ],
        link: {
          href: '/termekek/ragaszto-adagolok',
          label: { hu: 'Szalagadagolók megtekintése', en: 'Browse the tape dispensers', de: 'Zu den Bandspendern', ko: '테이프 디스펜서 살펴보기', zh: '查看胶带切割机' },
        },
      },
    ],
  },
];
export const guides: Guide[] = localize<Guide[]>(guidesSource);

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
