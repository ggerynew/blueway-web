# -*- coding: utf-8 -*-
"""A tudástár vonalkód-cikkének ábrái: SVG-k a public/images/vonalkod mappába.

Miért saját kódoló, és miért SVG? A weblapon a kód nem díszítés: aki elolvassa
a cikket, le fogja olvasni a telefonjával. Egy raszteres kép a nagyítás során
elmosódik, és a leolvasó nem találja meg a modulhatárt; az SVG minden méretben
éles marad. A rajzolatot ezért modulhálóra illesztjük, nem képpontra.

MINDEN itt előállított kódot visszaolvasunk a zxing dekóderrel (lásd a fájl
végén), tehát ami a cikkbe kerül, arról bizonyítottan tudjuk, mit tartalmaz.
"""
import os

KI = 'public/images/vonalkod'
os.makedirs(KI, exist_ok=True)

# ——————————————————————————————————————————————————————————————
# Code 128 / GS1-128
# ——————————————————————————————————————————————————————————————
C128 = [
    '212222','222122','222221','121223','121322','131222','122213','122312',
    '132212','221213','221312','231212','112232','122132','122231','113222',
    '123122','123221','223211','221132','221231','213212','223112','312131',
    '311222','321122','321221','312212','322112','322211','212123','212321',
    '232121','111323','131123','131321','112313','132113','132311','211313',
    '231113','231311','112133','112331','132131','113123','113321','133121',
    '313121','211331','231131','213113','213311','213131','311123','311321',
    '331121','312113','312311','332111','314111','221411','431111','111224',
    '111422','121124','121421','141122','141221','112214','112412','122114',
    '122411','142112','142211','241211','221114','413111','241112','134111',
    '111242','121142','121241','114212','124112','124211','411212','421112',
    '421211','212141','214121','412121','111143','111341','131141','114113',
    '114311','411113','411311','113141','114131','311141','411131',
    '211412','211214','211232','2331112',
]
FNC1, START_B, START_C, STOP = 102, 104, 105, 106


def code128_ertekek(adat, gs1=False):
    """Adatból Code 128 kódértékek. A számpárokat C készletben tömörítjük.

    A GS1-128 abban különbözik a sima Code 128-tól, hogy az első karakter egy
    FNC1: ez mondja meg a leolvasónak, hogy a tartalom alkalmazásazonosítókból
    (AI) áll. Az adatban a `|` jelöli a mezőelválasztó FNC1-et — a változó
    hosszú AI-k végén ez zárja le a mezőt.
    """
    ertekek = []
    i, keszlet = 0, None
    if gs1:
        # a legelső mező is számpárokkal indul, ha lehet
        keszlet = 'C' if _szamlanc(adat, 0) >= 4 else 'B'
        ertekek.append(START_C if keszlet == 'C' else START_B)
        ertekek.append(FNC1)
    else:
        keszlet = 'C' if _szamlanc(adat, 0) >= 4 else 'B'
        ertekek.append(START_C if keszlet == 'C' else START_B)

    while i < len(adat):
        if adat[i] == '|':                      # mezőelválasztó FNC1
            ertekek.append(FNC1)
            i += 1
            continue
        if keszlet == 'C':
            if _szamlanc(adat, i) >= 2:
                ertekek.append(int(adat[i:i + 2]))
                i += 2
                continue
            ertekek.append(100)                 # Code B váltás
            keszlet = 'B'
            continue
        # B készlet
        if _szamlanc(adat, i) >= 6 or (_szamlanc(adat, i) >= 4 and i + _szamlanc(adat, i) == len(adat)):
            ertekek.append(99)                  # Code C váltás
            keszlet = 'C'
            continue
        ertekek.append(ord(adat[i]) - 32)
        i += 1

    ellenorzo = ertekek[0]
    for helyi, e in enumerate(ertekek[1:], start=1):
        ellenorzo += helyi * e
    ertekek.append(ellenorzo % 103)
    ertekek.append(STOP)
    return ertekek


def _szamlanc(s, i):
    """Hány számjegy áll egymás után az i. helytől (a | megszakítja)."""
    n = 0
    while i + n < len(s) and s[i + n].isdigit():
        n += 1
    return n


def code128_sav(adat, gs1=False):
    """Bináris sávminta: '1' = fekete modul, '0' = fehér."""
    ki = []
    for e in code128_ertekek(adat, gs1):
        minta = C128[e]
        fekete = True
        for w in minta:
            ki.append(('1' if fekete else '0') * int(w))
            fekete = not fekete
    return ''.join(ki)


# ——————————————————————————————————————————————————————————————
# EAN-13 / EAN-8
# ——————————————————————————————————————————————————————————————
EAN_L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
EAN_G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
EAN_R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100']
EAN_PARITAS = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']


def gs1_ellenorzo(szamjegyek):
    """GS1 mod-10 ellenőrző szám: jobbról 3-1-3-1… súlyozás.

    Ugyanez a szabály adja a GTIN-8, GTIN-12, GTIN-13, GTIN-14 és az SSCC
    utolsó számjegyét — a hossz csak azt dönti el, hol kezdődik a 3-as súly.
    """
    osszeg = 0
    for i, jegy in enumerate(reversed(szamjegyek)):
        osszeg += int(jegy) * (3 if i % 2 == 0 else 1)
    return str((10 - osszeg % 10) % 10)


def ean13_sav(kod13):
    assert len(kod13) == 13
    bal, jobb = kod13[1:7], kod13[7:]
    minta = EAN_PARITAS[int(kod13[0])]
    ki = ['101']
    for jegy, p in zip(bal, minta):
        ki.append((EAN_L if p == 'L' else EAN_G)[int(jegy)])
    ki.append('01010')
    for jegy in jobb:
        ki.append(EAN_R[int(jegy)])
    ki.append('101')
    return ''.join(ki)


# ——————————————————————————————————————————————————————————————
# ITF-14 (Interleaved 2 of 5)
# ——————————————————————————————————————————————————————————————
ITF = ['NNWWN','WNNNW','NWNNW','WWNNN','NNWNW','WNWNN','NWWNN','NNNWW','WNNWN','NWNWN']


def itf_sav(szam, szeles=3):
    assert len(szam) % 2 == 0
    ki = ['1010']                                # indítójel: N N N N
    for i in range(0, len(szam), 2):
        a, b = ITF[int(szam[i])], ITF[int(szam[i + 1])]
        for j in range(5):                       # sáv és köz összefésülve
            ki.append('1' * (szeles if a[j] == 'W' else 1))
            ki.append('0' * (szeles if b[j] == 'W' else 1))
    ki.append('1' * szeles + '0' + '1')          # zárójel: W N N
    return ''.join(ki)


# ——————————————————————————————————————————————————————————————
# Code 39
# ——————————————————————————————————————————————————————————————
C39 = {
    '0':'NNNWWNWNN','1':'WNNWNNNNW','2':'NNWWNNNNW','3':'WNWWNNNNN','4':'NNNWWNNNW',
    '5':'WNNWWNNNN','6':'NNWWWNNNN','7':'NNNWNNWNW','8':'WNNWNNWNN','9':'NNWWNNWNN',
    'A':'WNNNNWNNW','B':'NNWNNWNNW','C':'WNWNNWNNN','D':'NNNNWWNNW','E':'WNNNWWNNN',
    'F':'NNWNWWNNN','G':'NNNNNWWNW','H':'WNNNNWWNN','I':'NNWNNWWNN','J':'NNNNWWWNN',
    'K':'WNNNNNNWW','L':'NNWNNNNWW','M':'WNWNNNNWN','N':'NNNNWNNWW','O':'WNNNWNNWN',
    'P':'NNWNWNNWN','Q':'NNNNNNWWW','R':'WNNNNNWWN','S':'NNWNNNWWN','T':'NNNNWNWWN',
    'U':'WWNNNNNNW','V':'NWWNNNNNW','W':'WWWNNNNNN','X':'NWNNWNNNW','Y':'WWNNWNNNN',
    'Z':'NWWNWNNNN','-':'NWNNNNWNW','.':'WWNNNNWNN',' ':'NWWNNNWNN','*':'NWNNWNWNN',
    '$':'NWNWNWNNN','/':'NWNWNNNWN','+':'NWNNNWNWN','%':'NNNWNWNWN',
}


def code39_sav(szoveg, szeles=3):
    ki = []
    for kar in f'*{szoveg}*':
        minta = C39[kar]
        for j, e in enumerate(minta):
            szin = '1' if j % 2 == 0 else '0'
            ki.append(szin * (szeles if e == 'W' else 1))
        ki.append('0')                            # karakterköz
    return ''.join(ki[:-1])


# ——————————————————————————————————————————————————————————————
# GS1 DataBar — BWIPP-ből átvett sávminta
# ——————————————————————————————————————————————————————————————
def kep_modulok(kep):
    """PIL képből modulmátrix, ha a kép pontosan 1 képpont = 1 modul léptékű."""
    szurke = kep.convert('L')
    px = szurke.load()
    return [[px[x, y] < 128 for x in range(szurke.width)] for y in range(szurke.height)]


def kep_sav(kep):
    """Lineáris kód képéből a modulsor ('1'/'0'), a fehér margó nélkül.

    Miért képből? A GS1 DataBar kódolása (ISO/IEC 24724) kombinatorikus, és a
    kézzel írt implementációban a hiba észrevétlen marad. A BWIPP a szabvány
    referencia-implementációja: azzal rajzoltatjuk ki, és csak a kész rajzot
    vesszük át — a kódolást a referencia végzi.
    """
    szurke = kep.convert('L')
    px = szurke.load()
    legjobb, legtobb = 0, -1
    for y in range(szurke.height):
        valt = sum(1 for x in range(1, szurke.width) if (px[x, y] < 128) != (px[x - 1, y] < 128))
        if valt > legtobb:
            legtobb, legjobb = valt, y
    sor = ['1' if px[x, legjobb] < 128 else '0' for x in range(szurke.width)]
    elso = sor.index('1')
    utolso = len(sor) - 1 - sor[::-1].index('1')
    return ''.join(sor[elso:utolso + 1])


# ——————————————————————————————————————————————————————————————
# SVG kirajzolás
# ——————————————————————————————————————————————————————————————
# Idézőjel nélküli családnevek: az SVG-attribútum maga is idézőjelben áll,
# a beágyazott idézőjel ott érvénytelen XML-t adna.
BETU = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'


def svg_1d(sav, felirat, cim=None, magassag=70, modul=2, csendzona=10,
           vezerjel=None, felirat_meret=13):
    """Lineáris kód SVG-ként, alatta az ember által olvasható felirattal.

    A csendzóna (a kód két oldalán hagyott üres sáv) nem díszítés: e nélkül a
    leolvasó nem találja meg a kód elejét. Modulban mérjük, ahogy a szabvány.
    """
    sz = (len(sav) + 2 * csendzona) * modul
    fel = 22 if cim else 0
    alj = felirat_meret + 12 if felirat else 4
    ma = fel + magassag + alj
    r = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {sz} {ma}" '
         f'width="{sz}" height="{ma}" role="img">']
    r.append(f'<rect width="{sz}" height="{ma}" fill="#ffffff"/>')
    if cim:
        r.append(f'<text x="{sz/2}" y="15" text-anchor="middle" font-family="{BETU}" '
                 f'font-size="12" fill="#64748b">{cim}</text>')
    x = csendzona * modul
    i = 0
    while i < len(sav):
        if sav[i] == '1':
            j = i
            while j < len(sav) and sav[j] == '1':
                j += 1
            h = magassag
            # a vezérjelek (EAN indító/közép/záró) hosszabbak, ez a kód arca
            if vezerjel and any(i < v[1] and j > v[0] for v in vezerjel):
                h = magassag + 8
            r.append(f'<rect x="{x + i*modul}" y="{fel}" width="{(j-i)*modul}" height="{h}" fill="#000000"/>')
            i = j
        else:
            i += 1
    if felirat:
        y = fel + magassag + felirat_meret + (3 if vezerjel else 1)
        r.append(f'<text x="{sz/2}" y="{y}" text-anchor="middle" font-family="{BETU}" '
                 f'font-size="{felirat_meret}" letter-spacing="1" fill="#0f172a">{felirat}</text>')
    r.append('</svg>')
    return '\n'.join(r)


def svg_2d(matrix, cim=None, modul=6, csendzona=2, felirat=None, sor_magassag=1):
    """Kétdimenziós kód SVG-ként. A matrix sorai True/False vagy 1/0 értékek."""
    n_sor, n_oszlop = len(matrix), len(matrix[0])
    sorma = modul * sor_magassag
    sz = (n_oszlop + 2 * csendzona) * modul
    fel = 22 if cim else csendzona * modul
    alj = 20 if felirat else csendzona * modul
    ma = fel + n_sor * sorma + alj
    r = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {sz} {ma}" '
         f'width="{sz}" height="{ma}" role="img">']
    r.append(f'<rect width="{sz}" height="{ma}" fill="#ffffff"/>')
    if cim:
        r.append(f'<text x="{sz/2}" y="15" text-anchor="middle" font-family="{BETU}" '
                 f'font-size="12" fill="#64748b">{cim}</text>')
    for y, sor in enumerate(matrix):
        x = 0
        while x < n_oszlop:
            if sor[x]:
                x2 = x
                while x2 < n_oszlop and sor[x2]:
                    x2 += 1
                r.append(f'<rect x="{(csendzona+x)*modul}" y="{fel + y*sorma}" '
                         f'width="{(x2-x)*modul}" height="{sorma}" fill="#000000"/>')
                x = x2
            else:
                x += 1
    if felirat:
        r.append(f'<text x="{sz/2}" y="{ma-6}" text-anchor="middle" font-family="{BETU}" '
                 f'font-size="11" fill="#0f172a">{felirat}</text>')
    r.append('</svg>')
    return '\n'.join(r)


def svg_itf14(sav, felirat, modul=2, magassag=70, csendzona=10, felirat_meret=15):
    """ITF-14 tartókerettel (bearer bar).

    A keret nem dísz: a hullámkartonra nyomott ITF könnyen „elveszít” egy
    sávot a szélén, ha a leolvasó ferdén lát rá. A körbefutó vastag keret
    ezt a részleges leolvasást fizikailag megakadályozza.

    Az ember által olvasható szám a kereten BELÜL áll, ahogy a szabvány
    mutatja — ezért a fehér belső mezőnek a szám sormagasságát is tartania
    kell, különben a keret alsó éle átvágja a számokat.
    """
    keret = 4 * modul
    felirat_hely = felirat_meret + 10
    belso_sz = (len(sav) + 2 * csendzona) * modul
    belso_ma = magassag + felirat_hely
    sz = belso_sz + 2 * keret
    ma = belso_ma + 2 * keret
    r = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {sz} {ma}" width="{sz}" height="{ma}" role="img">']
    r.append(f'<rect width="{sz}" height="{ma}" fill="#000000"/>')
    r.append(f'<rect x="{keret}" y="{keret}" width="{belso_sz}" height="{belso_ma}" fill="#ffffff"/>')
    x0 = keret + csendzona * modul
    i = 0
    while i < len(sav):
        if sav[i] == '1':
            j = i
            while j < len(sav) and sav[j] == '1':
                j += 1
            r.append(f'<rect x="{x0 + i*modul}" y="{keret}" width="{(j-i)*modul}" height="{magassag}" fill="#000000"/>')
            i = j
        else:
            i += 1
    r.append(f'<text x="{sz/2}" y="{keret + magassag + felirat_meret + 2}" text-anchor="middle" '
             f'font-family="{BETU}" font-size="{felirat_meret}" letter-spacing="2" fill="#0f172a">{felirat}</text>')
    r.append('</svg>')
    return '\n'.join(r)


def ean8_sav(kod8):
    ki = ['101']
    for jegy in kod8[:4]:
        ki.append(EAN_L[int(jegy)])
    ki.append('01010')
    for jegy in kod8[4:]:
        ki.append(EAN_R[int(jegy)])
    ki.append('101')
    return ''.join(ki)
