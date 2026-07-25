import { localize, type LocalizedText, type Sourced } from '@/lib/products';

export interface GuideSection {
  title: LocalizedText;
  paragraphs: LocalizedText[];
  bullets?: LocalizedText[];
  /** Kiemelt link a szekció végén (nyelvi előtag nélküli útvonal). */
  link?: { href: string; label: LocalizedText };
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
];
export const guides: Guide[] = localize<Guide[]>(guidesSource);

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
