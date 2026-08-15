# -*- coding: utf-8 -*-
"""Ábrák a lézeres fókusztávolsághoz: objektívek, fókuszmélység, fókuszeltolás.

Az adatok forrása a cab XENO adatlap (public/datasheets/cab-laser-xeno.pdf,
6. oldal „Technical data", 5. oldal „Shifting the focus with XENO 4S").

Miért rajzoljuk újra, ahelyett hogy kivágnánk a PDF-ből? Két okból. Egyrészt
a gyártói ábra angol feliratú raszter- illetve vektorgrafika, amelynek a
továbbközlésére nincs írásos engedélyünk — a videóknál épp ez a kérdés áll
nyitva. Másrészt a saját rajz nyelvenként készül: a XENO 4S terméklapját a
német és a koreai vevő is olvassa, és egy magyar feliratú ábra ott nem ér
semmit. A SZÁMOK viszont szigorúan a gyártói adatlapból valók, egy helyen
felsorolva (LENCSEK, SIKOK) — ha az adatlap változik, itt kell átírni.

A harmadik ábra (fókuszmélység) nem az adatlapból másolt görbe, hanem
számított: a Gauss-nyaláb w(z) képlete az adatlap saját foltátmérő- és
M²-adataiból. Ezért a szkript előbb ellenőrzi a számolást egy tankönyvi
összefüggésen, és csak akkor rajzol.

Futtatás a projekt gyökeréből: python3 scripts/lezer-fokusz-abrak.py
"""
import math
import os
import sys

KI = 'public/images/lezer'
os.makedirs(KI, exist_ok=True)

SANS = 'ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
TINTA, HALVANY, VONAL = '#0f172a', '#64748b', '#cbd5e1'
KEK, VILKEK, PIROS, BOROSTYAN = '#1d4ed8', '#0284c7', '#b91c1c', '#b45309'
PAPIR = '#f8fafc'

# Az ábrafájlok nyelvei. Az amerikai változat szándékosan hiányzik: ezekben a
# feliratokban nincs olyan szó, amelyet a brit és az amerikai angol másképp ír
# („marking field", „operation distance", „lens"), tehát a `us` oldalak az
# angol ábrát kapják — lásd az ABRA_NYELV térképet a src/lib/i18n.ts-ben.
NYELVEK = ['hu', 'en', 'de', 'it', 'es', 'ko', 'zh']


# ——————————————————————————————————————————————————————————————
# Adatok az adatlapból
# ——————————————————————————————————————————————————————————————
# objektív, munkatávolság (mm), tűrés (mm), jelölőmező (mm), foltátmérő (µm), dpi
LENCSEK = [
    ('100.2', 149, 4, '69 × 69', 25, 1000),
    ('160.2', 210, 8, '112 × 112', 35, 725),
    ('254.2', 310, 8, '180 × 180', 50, 500),
    ('420.2', 549, 20, '290 × 290', 85, 300),
]

# A XENO 4S két objektívje. Panelenként: az eltolás szélső értéke, és a három
# sík (eltolás mm, munkatávolság mm, jelölőmező mm).
SIKOK = [
    ('160.2', 35, [(35, 175, 100), (0, 210, 112), (-35, 245, 135)]),
    ('254.2', 70, [(70, 240, 160), (0, 310, 180), (-70, 380, 250)]),
]

HULLAMHOSSZ = 1.064   # µm — Ytterbium fiber lézer
M2 = 1.8              # az adatlap felső korlátja (M² < 1,8)


def rayleigh(folt_atmero_um: float) -> float:
    """Rayleigh-hossz milliméterben a fókuszfolt átmérőjéből.

    z_R = π·w₀² / (M²·λ). Ez az a távolság a fókusztól, ahol a nyalábsugár
    √2-szeresére nő — tehát a teljesítménysűrűség a felére esik. A gyakorlati
    „élességmélység" ennek a néhányszorosa, nem az adatlap ±8 mm-es
    munkatávolság-tűrése: az utóbbi a beállítási sáv, nem az a tartomány,
    amelyen belül a jelölés minősége nem változik.
    """
    w0 = folt_atmero_um / 2
    return math.pi * w0 * w0 / (M2 * HULLAMHOSSZ) / 1000


def nyalabsugar(w0_um: float, z_mm: float, zr_mm: float) -> float:
    """A nyalábsugár µm-ben a fókusztól z távolságra: w(z) = w₀·√(1+(z/z_R)²)."""
    return w0_um * math.sqrt(1 + (z_mm / zr_mm) ** 2)


# A képlet ellenőrzése a saját definícióján: a Rayleigh-hossznál a sugár
# pontosan √2-szeres. Ha ez elromlik, a fókuszmélység-görbe hazudna, és ezt
# ránézésre senki nem venné észre.
_zr = rayleigh(50)
if abs(nyalabsugar(25, _zr, _zr) / 25 - math.sqrt(2)) > 1e-9:
    sys.exit('a Gauss-nyaláb képlete hibás')
# Nagyságrendi próba: az 50 µm-es folt Rayleigh-hossza kb. 1 mm.
if not 0.9 < _zr < 1.2:
    sys.exit(f'a Rayleigh-hossz gyanús: {_zr:.2f} mm')


# ——————————————————————————————————————————————————————————————
# Feliratok nyelvenként
# ——————————————————————————————————————————————————————————————
SZOVEG = {
    'hu': {
        'tizedes': ',',
        'a_cim': 'A fókusz eltolása: egy objektív, három jelölési sík',
        'a_objektiv': '{o} objektív',
        'a_eltolas_cim': 'fókuszeltolás ±{e} mm',
        'munkatav': 'Munkatávolság',
        'mezo': 'Jelölőmező',
        'fej': 'szkennerfej',
        'eltolas': 'eltolás',
        'alap': 'alaphelyzet',
        'a_megj': 'A függőleges lépték a szkennerfej és az első sík között meg van szakítva; '
                  'a három sík távolsága egymáshoz képest arányos.',
        'b_cim': 'Objektív, munkatávolság, jelölőmező és felbontás',
        'b_objektiv': 'Objektív',
        'b_munkatav': 'Munkatávolság',
        'b_mezo': 'Jelölőmező',
        'b_folt': 'Foltátmérő',
        'b_dpi': 'Felbontás',
        'b_eltolas': 'Fókuszeltolás',
        'b_nincs': 'nincs',
        'b_megj': 'Nagyobb mező = nagyobb folt = kisebb felbontás és kisebb teljesítménysűrűség. '
                  'A választás mindig ez a csere.',
        'c_cim': 'Mit ront a fókuszon kívüli munkadarab?',
        'c_x': 'Eltérés a fókuszsíktól (mm)',
        'c_y': 'Foltátmérő (µm)',
        'c_megj': 'Gauss-nyaláb közelítés az adatlap foltátmérő- és M²-adataiból. '
                  'A folt átmérőjével a teljesítménysűrűség a négyzetével esik.',
        'c_zr': 'Rayleigh-hossz',
        'forras': 'Forrás: cab XENO adatlap, „Technical data".',
    },
    'en': {
        'tizedes': '.',
        'a_cim': 'Shifting the focus: one lens, three marking planes',
        'a_objektiv': 'lens {o}',
        'a_eltolas_cim': 'focus shift ±{e} mm',
        'munkatav': 'Operation distance',
        'mezo': 'Marking field',
        'fej': 'scan head',
        'eltolas': 'shift',
        'alap': 'nominal',
        'a_megj': 'The vertical scale is interrupted between the scan head and the first plane; '
                  'the three planes are drawn to scale relative to each other.',
        'b_cim': 'Lens, operation distance, marking field and resolution',
        'b_objektiv': 'Lens',
        'b_munkatav': 'Operation distance',
        'b_mezo': 'Marking field',
        'b_folt': 'Spot diameter',
        'b_dpi': 'Resolution',
        'b_eltolas': 'Focus shift',
        'b_nincs': 'none',
        'b_megj': 'A larger field means a larger spot, hence lower resolution and lower power '
                  'density. The choice is always this trade.',
        'c_cim': 'What does an out-of-focus workpiece cost?',
        'c_x': 'Distance from the focal plane (mm)',
        'c_y': 'Spot diameter (µm)',
        'c_megj': 'Gaussian-beam approximation from the spot diameter and M² figures of the '
                  'data sheet. Power density falls with the square of the spot diameter.',
        'c_zr': 'Rayleigh length',
        'forras': 'Source: cab XENO data sheet, “Technical data”.',
    },
    'de': {
        'tizedes': ',',
        'a_cim': 'Fokusverschiebung: eine Linse, drei Markierebenen',
        'a_objektiv': 'Linse {o}',
        'a_eltolas_cim': 'Fokusverschiebung ±{e} mm',
        'munkatav': 'Arbeitsabstand',
        'mezo': 'Markierfeld',
        'fej': 'Scankopf',
        'eltolas': 'Verschiebung',
        'alap': 'Grundstellung',
        'a_megj': 'Der vertikale Maßstab ist zwischen Scankopf und erster Ebene unterbrochen; '
                  'die drei Ebenen stehen zueinander maßstäblich.',
        'b_cim': 'Linse, Arbeitsabstand, Markierfeld und Auflösung',
        'b_objektiv': 'Linse',
        'b_munkatav': 'Arbeitsabstand',
        'b_mezo': 'Markierfeld',
        'b_folt': 'Spotdurchmesser',
        'b_dpi': 'Auflösung',
        'b_eltolas': 'Fokusverschiebung',
        'b_nincs': 'keine',
        'b_megj': 'Größeres Feld heißt größerer Spot, also geringere Auflösung und geringere '
                  'Leistungsdichte. Die Wahl ist immer dieser Tausch.',
        'c_cim': 'Was kostet ein Werkstück außerhalb des Fokus?',
        'c_x': 'Abstand von der Fokusebene (mm)',
        'c_y': 'Spotdurchmesser (µm)',
        'c_megj': 'Gaußstrahl-Näherung aus den Spotdurchmesser- und M²-Angaben des Datenblatts. '
                  'Die Leistungsdichte fällt mit dem Quadrat des Spotdurchmessers.',
        'c_zr': 'Rayleigh-Länge',
        'forras': 'Quelle: cab XENO Datenblatt, „Technical data".',
    },
    'it': {
        'tizedes': ',',
        'a_cim': 'Spostamento del fuoco: una lente, tre piani di marcatura',
        'a_objektiv': 'lente {o}',
        'a_eltolas_cim': 'spostamento del fuoco ±{e} mm',
        'munkatav': 'Distanza di lavoro',
        'mezo': 'Campo di marcatura',
        'fej': 'testa di scansione',
        'eltolas': 'spostamento',
        'alap': 'posizione base',
        'a_megj': 'La scala verticale è interrotta tra la testa di scansione e il primo piano; '
                  'i tre piani sono in scala tra loro.',
        'b_cim': 'Lente, distanza di lavoro, campo di marcatura e risoluzione',
        'b_objektiv': 'Lente',
        'b_munkatav': 'Distanza di lavoro',
        'b_mezo': 'Campo di marcatura',
        'b_folt': 'Diametro dello spot',
        'b_dpi': 'Risoluzione',
        'b_eltolas': 'Spostamento del fuoco',
        'b_nincs': 'assente',
        'b_megj': 'Campo più grande significa spot più grande, quindi minore risoluzione e minore '
                  'densità di potenza. La scelta è sempre questo scambio.',
        'c_cim': 'Quanto costa un pezzo fuori fuoco?',
        'c_x': 'Distanza dal piano focale (mm)',
        'c_y': 'Diametro dello spot (µm)',
        'c_megj': 'Approssimazione a fascio gaussiano dai dati di spot e M² della scheda tecnica. '
                  'La densità di potenza cala con il quadrato del diametro dello spot.',
        'c_zr': 'Lunghezza di Rayleigh',
        'forras': 'Fonte: scheda tecnica cab XENO, «Technical data».',
    },
    'es': {
        'tizedes': ',',
        'a_cim': 'Desplazamiento del foco: una lente, tres planos de marcaje',
        'a_objektiv': 'lente {o}',
        'a_eltolas_cim': 'desplazamiento de foco ±{e} mm',
        'munkatav': 'Distancia de trabajo',
        'mezo': 'Campo de marcaje',
        'fej': 'cabezal de escaneo',
        'eltolas': 'desplazamiento',
        'alap': 'posición base',
        'a_megj': 'La escala vertical está interrumpida entre el cabezal y el primer plano; '
                  'los tres planos guardan la escala entre sí.',
        'b_cim': 'Lente, distancia de trabajo, campo de marcaje y resolución',
        'b_objektiv': 'Lente',
        'b_munkatav': 'Distancia de trabajo',
        'b_mezo': 'Campo de marcaje',
        'b_folt': 'Diámetro del punto',
        'b_dpi': 'Resolución',
        'b_eltolas': 'Desplazamiento de foco',
        'b_nincs': 'ninguno',
        'b_megj': 'Un campo mayor significa un punto mayor, es decir, menor resolución y menor '
                  'densidad de potencia. La elección es siempre ese intercambio.',
        'c_cim': '¿Qué cuesta una pieza fuera de foco?',
        'c_x': 'Distancia al plano focal (mm)',
        'c_y': 'Diámetro del punto (µm)',
        'c_megj': 'Aproximación de haz gaussiano a partir del diámetro de punto y el M² de la '
                  'ficha técnica. La densidad de potencia cae con el cuadrado del diámetro.',
        'c_zr': 'Longitud de Rayleigh',
        'forras': 'Fuente: ficha técnica cab XENO, «Technical data».',
    },
    'ko': {
        'tizedes': '.',
        'a_cim': '초점 이동: 하나의 렌즈, 세 개의 마킹 평면',
        'a_objektiv': '{o} 렌즈',
        'a_eltolas_cim': '초점 이동 ±{e} mm',
        'munkatav': '작업 거리',
        'mezo': '마킹 필드',
        'fej': '스캔 헤드',
        'eltolas': '이동',
        'alap': '기준 위치',
        'a_megj': '스캔 헤드와 첫 평면 사이의 세로 축척은 생략되어 있습니다. 세 평면 사이의 간격은 서로 비례합니다.',
        'b_cim': '렌즈, 작업 거리, 마킹 필드, 해상도',
        'b_objektiv': '렌즈',
        'b_munkatav': '작업 거리',
        'b_mezo': '마킹 필드',
        'b_folt': '스폿 지름',
        'b_dpi': '해상도',
        'b_eltolas': '초점 이동',
        'b_nincs': '없음',
        'b_megj': '필드가 클수록 스폿이 커지고, 해상도와 출력 밀도는 낮아집니다. 선택은 언제나 이 맞바꿈입니다.',
        'c_cim': '초점을 벗어난 공작물은 무엇을 잃는가',
        'c_x': '초점면으로부터의 거리 (mm)',
        'c_y': '스폿 지름 (µm)',
        'c_megj': '데이터시트의 스폿 지름과 M² 값에서 계산한 가우시안 빔 근사. 출력 밀도는 스폿 지름의 제곱에 반비례합니다.',
        'c_zr': '레일리 길이',
        'forras': '출처: cab XENO 데이터시트, “Technical data”.',
    },
    'zh': {
        'tizedes': '.',
        'a_cim': '焦点位移：一个透镜，三个打标平面',
        'a_objektiv': '{o} 透镜',
        'a_eltolas_cim': '焦点位移 ±{e} mm',
        'munkatav': '工作距离',
        'mezo': '打标范围',
        'fej': '扫描头',
        'eltolas': '位移',
        'alap': '基准位置',
        'a_megj': '扫描头与第一个平面之间的纵向比例已断开；三个平面之间的间距彼此成比例。',
        'b_cim': '透镜、工作距离、打标范围与分辨率',
        'b_objektiv': '透镜',
        'b_munkatav': '工作距离',
        'b_mezo': '打标范围',
        'b_folt': '光斑直径',
        'b_dpi': '分辨率',
        'b_eltolas': '焦点位移',
        'b_nincs': '无',
        'b_megj': '范围越大，光斑越大，分辨率和功率密度越低。选型永远是这个取舍。',
        'c_cim': '工件离焦要付出什么代价？',
        'c_x': '与焦平面的距离（mm）',
        'c_y': '光斑直径（µm）',
        'c_megj': '依据数据表的光斑直径与 M² 数据所作的高斯光束近似。功率密度随光斑直径的平方下降。',
        'c_zr': '瑞利长度',
        'forras': '来源：cab XENO 数据表，“Technical data”。',
    },
}


# ——————————————————————————————————————————————————————————————
# SVG-alapok
# ——————————————————————————————————————————————————————————————
def xml(t) -> str:
    return str(t).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def sz(x, y, t, meret=13, betu=None, szin=TINTA, sulyt='normal', igazit='start', extra=''):
    return (f'<text x="{x}" y="{y}" font-family="{betu or SANS}" font-size="{meret}" '
            f'fill="{szin}" font-weight="{sulyt}" text-anchor="{igazit}"{extra}>{xml(t)}</text>')


def szelesseg(szoveg: str, meret: float) -> float:
    """Egy felirat becsült szélessége képpontban.

    Az SVG nem tördel és nem is jelzi, ha a szöveg kilóg a doboz alól — a
    spanyol „cabezal de escaneo" pontosan így lógott ki a szkennerfej fekete
    téglalapjából, miközben a magyar „szkennerfej" belefért. A CJK-jegyek
    nagyjából a betűmérettel egyező szélesek, a latin betűk ennek a felénél
    valamivel keskenyebbek.
    """
    return sum(meret if ord(j) > 0x2E80 else meret * 0.55 for j in szoveg)


def fej(szeles, magas):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {szeles} {magas}" '
            f'width="{szeles}" height="{magas}" role="img">',
            f'<rect width="{szeles}" height="{magas}" fill="#ffffff"/>',
            '<defs><marker id="ny" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" '
            'markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="' + HALVANY +
            '"/></marker><marker id="nyv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" '
            'markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="' + HALVANY +
            '" transform="rotate(180 5 5)"/></marker></defs>']


# ——————————————————————————————————————————————————————————————
# 1. ábra — a fókusz eltolása
# ——————————————————————————————————————————————————————————————
SZ_A, MA_A = 920, 590
VIZ = 0.62          # px / mm vízszintesen (jelölőmező)
Y_SIK = [300, 380, 460]
Y_FEJ, MA_FEJ = 112, 44


def panel_eltolas(x0, cx, objektiv, eltolas_max, sikok, t):
    r = []
    r.append(sz(cx, 64, t['a_objektiv'].format(o=objektiv), 15, SANS, TINTA, '700', 'middle'))
    r.append(sz(cx, 84, t['a_eltolas_cim'].format(e=eltolas_max), 12, SANS, KEK, '600', 'middle'))

    # szkennerfej — a doboz a felirathoz igazodik, nem fordítva
    fej_sz = max(116, szelesseg(t['fej'], 12) + 32)
    r.append(f'<rect x="{cx-fej_sz/2:.1f}" y="{Y_FEJ}" width="{fej_sz:.1f}" height="{MA_FEJ}" '
             f'rx="6" fill="{TINTA}"/>')
    r.append(sz(cx, Y_FEJ + 28, t['fej'], 12, SANS, '#ffffff', '600', 'middle'))

    # a nyaláb burkolója: a fejtől a legtávolabbi (legszélesebb) síkig
    also_fel = sikok[2][2] * VIZ / 2
    r.append(f'<path d="M{cx-12} {Y_FEJ+MA_FEJ} L{cx-also_fel:.1f} {Y_SIK[2]} '
             f'L{cx+also_fel:.1f} {Y_SIK[2]} L{cx+12} {Y_FEJ+MA_FEJ} Z" '
             f'fill="{VILKEK}" fill-opacity="0.10"/>')
    r.append(f'<line x1="{cx}" y1="{Y_FEJ+MA_FEJ}" x2="{cx}" y2="{Y_SIK[2]}" '
             f'stroke="{PIROS}" stroke-width="1.6"/>')

    # a lépték megszakítása: a fej és az első sík közti távolság nem arányos
    for dy in (0, 12):
        y = 180 + dy
        r.append(f'<path d="M{x0+16} {y} l 24 -6 l 24 12 l 24 -12 l 24 12 l 24 -12 l 24 12 '
                 f'l 24 -12 l 24 12 l 24 -12 l 24 12 l 24 -12 l 24 12 l 24 -6" '
                 f'fill="none" stroke="{VONAL}" stroke-width="1.4"/>')

    # Oszlopfeliratok. A méretvonalak elforgatott feliratai a 195–320 sávot
    # foglalják el, a szkennerfej doboza pedig — nyelvtől függő szélességgel —
    # a 112–156 sávot; a fejléceknek így mindkettő fölött a helyük.
    r.append(sz(x0 + 6, 104, t['munkatav'], 11, SANS, HALVANY, '700'))
    r.append(sz(cx + 88, 104, t['mezo'], 11, SANS, HALVANY, '700'))

    for i, (elt, tav, mezo) in enumerate(sikok):
        y = Y_SIK[i]
        fel = mezo * VIZ / 2
        alap = elt == 0
        szin = KEK if alap else VILKEK

        # a jelölési sík
        r.append(f'<line x1="{cx-fel:.1f}" y1="{y}" x2="{cx+fel:.1f}" y2="{y}" '
                 f'stroke="{szin}" stroke-width="{3 if alap else 2}"/>')
        for jel in (-1, 1):
            r.append(f'<line x1="{cx+jel*fel:.1f}" y1="{y-6}" x2="{cx+jel*fel:.1f}" y2="{y+6}" '
                     f'stroke="{szin}" stroke-width="{3 if alap else 2}"/>')

        # méretvonal a fejtől a síkig, egymásba ágyazva
        mx = cx - 78 - i * 22
        r.append(f'<line x1="{mx}" y1="{Y_FEJ+MA_FEJ}" x2="{mx}" y2="{y}" stroke="{HALVANY}" '
                 f'stroke-width="1" marker-start="url(#nyv)" marker-end="url(#ny)"/>')
        r.append(f'<line x1="{mx}" y1="{y}" x2="{cx-fel:.1f}" y2="{y}" stroke="{VONAL}" '
                 f'stroke-width="1" stroke-dasharray="3 3"/>')
        r.append(sz(mx - 5, (Y_FEJ + MA_FEJ + y) / 2, f'{tav} mm ±8', 12, MONO, TINTA,
                    'normal', 'middle',
                    f' transform="rotate(-90 {mx-5} {(Y_FEJ+MA_FEJ+y)/2:.0f})"'))

        # a mező mérete és az eltolás
        r.append(f'<line x1="{cx+fel:.1f}" y1="{y}" x2="{cx+82}" y2="{y}" stroke="{VONAL}" '
                 f'stroke-width="1" stroke-dasharray="3 3"/>')
        r.append(sz(cx + 88, y - 2, f'{mezo} × {mezo} mm', 13, SANS, TINTA, '600'))
        # valódi mínuszjel, nem kötőjel: a szám olvasható marad kis méretben is
        felirat = t['alap'] if alap else f'{t["eltolas"]} {elt:+d} mm'.replace('-', '\u2212')
        r.append(sz(cx + 88, y + 15, felirat, 11, SANS, HALVANY))
    return r


def abra_eltolas(t):
    r = fej(SZ_A, MA_A)
    r.append(sz(24, 32, t['a_cim'], 16, SANS, TINTA, '700'))
    r.append(f'<line x1="460" y1="52" x2="460" y2="500" stroke="{VONAL}" stroke-width="1"/>')
    r += panel_eltolas(16, 220, *SIKOK[0], t)
    r += panel_eltolas(476, 680, *SIKOK[1], t)
    r.append(sz(24, 530, t['a_megj'], 11, SANS, HALVANY))
    r.append(sz(24, 552, t['forras'], 11, SANS, HALVANY))
    r.append('</svg>')
    return '\n'.join(r)


# ——————————————————————————————————————————————————————————————
# 2. ábra — objektívtáblázat
# ——————————————————————————————————————————————————————————————
def abra_objektivek(t):
    SZ, MA = 800, 320
    r = fej(SZ, MA)
    r.append(sz(24, 32, t['b_cim'], 16, SANS, TINTA, '700'))

    oszlop = [(36, t['b_objektiv'], 'start'), (232, t['b_munkatav'], 'end'),
              (382, t['b_mezo'], 'end'), (502, t['b_folt'], 'end'),
              (612, t['b_dpi'], 'end'), (764, t['b_eltolas'], 'end')]
    for x, cim, ig in oszlop:
        r.append(sz(x, 70, cim, 10, SANS, HALVANY, '700', ig))
    r.append(f'<line x1="24" y1="78" x2="776" y2="78" stroke="{VONAL}" stroke-width="1"/>')

    # A 4S sorai ugyanazt az objektívet használják, mint a XENO 4 — a különbség
    # csak az eltolás, ezért nem külön sorok, hanem az utolsó oszlop.
    ELTOLAS = {'160.2': '±35 mm', '254.2': '±70 mm'}
    y = 90
    for nev, tav, tur, mezo, folt, dpi in LENCSEK:
        van = nev in ELTOLAS
        r.append(f'<rect x="24" y="{y}" width="752" height="34" rx="5" '
                 f'fill="{"#eff6ff" if van else PAPIR}"/>')
        r.append(sz(36, y + 22, nev, 14, MONO, TINTA, '700'))
        r.append(sz(232, y + 22, f'{tav} ± {tur} mm', 13, MONO, TINTA, 'normal', 'end'))
        r.append(sz(382, y + 22, f'{mezo} mm', 13, MONO, TINTA, 'normal', 'end'))
        r.append(sz(502, y + 22, f'~{folt} µm', 13, MONO, TINTA, 'normal', 'end'))
        r.append(sz(612, y + 22, f'{dpi} dpi', 13, MONO, TINTA, 'normal', 'end'))
        r.append(sz(764, y + 22, ELTOLAS.get(nev, t['b_nincs']), 13, MONO,
                    KEK if van else HALVANY, '700' if van else 'normal', 'end'))
        y += 40

    r.append(sz(24, y + 24, t['b_megj'], 11, SANS, HALVANY))
    r.append(sz(24, y + 46, t['forras'], 11, SANS, HALVANY))
    r.append('</svg>')
    return '\n'.join(r)


# ——————————————————————————————————————————————————————————————
# 3. ábra — fókuszmélység
# ——————————————————————————————————————————————————————————————
def abra_fokuszmelyseg(t):
    SZ, MA = 800, 410
    BX, BY, BSZ, BMA = 90, 70, 620, 250     # a diagram kerete
    X_MAX, Y_MAX = 3.0, 250.0               # mm, illetve µm
    tiz = t['tizedes']
    r = fej(SZ, MA)
    r.append(sz(24, 32, t['c_cim'], 16, SANS, TINTA, '700'))

    def px(z):
        return BX + (z + X_MAX) / (2 * X_MAX) * BSZ

    def py(d):
        return BY + BMA - min(d, Y_MAX) / Y_MAX * BMA

    def szam(ertek, jegy=2):
        return f'{ertek:.{jegy}f}'.replace('.', tiz)

    # rács
    for d in range(0, int(Y_MAX) + 1, 50):
        y = py(d)
        r.append(f'<line x1="{BX}" y1="{y:.1f}" x2="{BX+BSZ}" y2="{y:.1f}" stroke="{VONAL}" '
                 f'stroke-width="1" stroke-dasharray="2 4"/>')
        r.append(sz(BX - 10, y + 4, d, 11, MONO, HALVANY, 'normal', 'end'))
    for z in range(-3, 4):
        x = px(z)
        r.append(f'<line x1="{x:.1f}" y1="{BY}" x2="{x:.1f}" y2="{BY+BMA}" stroke="{VONAL}" '
                 f'stroke-width="1" stroke-dasharray="2 4"/>')
        r.append(sz(x, BY + BMA + 18, str(z).replace('-', '\u2212'), 11, MONO, HALVANY,
                    'normal', 'middle'))
    r.append(f'<line x1="{BX}" y1="{BY+BMA}" x2="{BX+BSZ}" y2="{BY+BMA}" stroke="{TINTA}" '
             f'stroke-width="1.2"/>')
    r.append(f'<line x1="{BX}" y1="{BY}" x2="{BX}" y2="{BY+BMA}" stroke="{TINTA}" '
             f'stroke-width="1.2"/>')
    r.append(sz(BX + BSZ / 2, BY + BMA + 42, t['c_x'], 12, SANS, HALVANY, 'normal', 'middle'))
    r.append(sz(28, BY + BMA / 2, t['c_y'], 12, SANS, HALVANY, 'normal', 'middle',
                f' transform="rotate(-90 28 {BY+BMA/2:.0f})"'))

    # A két objektív görbéje, és alul az a sáv, amelyen belül a folt a
    # √2-szeresénél nem nagyobb — ez a gyakorlati „élességmélység".
    for (nev, _t, _tu, _m, folt, _d), szin, y_zr in ((LENCSEK[1], BOROSTYAN, 292),
                                                     (LENCSEK[2], KEK, 310)):
        zr = rayleigh(folt)
        pontok = []
        z = -X_MAX
        while z <= X_MAX + 1e-9:
            pontok.append(f'{px(z):.1f},{py(2*nyalabsugar(folt/2, z, zr)):.1f}')
            z += 0.05
        r.append(f'<polyline points="{" ".join(pontok)}" fill="none" stroke="{szin}" '
                 f'stroke-width="2.2"/>')
        r.append(sz(px(X_MAX) - 8, py(2 * nyalabsugar(folt / 2, X_MAX, zr)) - 12,
                    f'{nev}  ({folt} µm)', 13, SANS, szin, '700', 'end'))
        r.append(f'<line x1="{px(-zr):.1f}" y1="{y_zr}" x2="{px(zr):.1f}" y2="{y_zr}" '
                 f'stroke="{szin}" stroke-width="2"/>')
        for jel in (-1, 1):
            r.append(f'<line x1="{px(jel*zr):.1f}" y1="{y_zr-4}" x2="{px(jel*zr):.1f}" '
                     f'y2="{y_zr+4}" stroke="{szin}" stroke-width="2"/>')
        r.append(sz(px(zr) + 10, y_zr + 4,
                    f'{nev}: {t["c_zr"]} ±{szam(zr)} mm', 11, SANS, szin))

    r.append(sz(24, MA - 30, t['c_megj'], 11, SANS, HALVANY))
    r.append(sz(24, MA - 12, t['forras'], 11, SANS, HALVANY))
    r.append('</svg>')
    return '\n'.join(r)


if __name__ == '__main__':
    for nyelv in NYELVEK:
        t = SZOVEG[nyelv]
        for alap, keszit in (('fokusz-eltolas', abra_eltolas),
                             ('objektivek', abra_objektivek),
                             ('fokuszmelyseg', abra_fokuszmelyseg)):
            nev = f'{alap}-{nyelv}.svg'
            svg = keszit(t)
            open(os.path.join(KI, nev), 'w', encoding='utf-8').write(svg)
            print(f'  {nev:28} {len(svg):6} bájt')
    print(f'\nRayleigh-hossz: 160.2 → ±{rayleigh(35):.2f} mm, 254.2 → ±{rayleigh(50):.2f} mm')
