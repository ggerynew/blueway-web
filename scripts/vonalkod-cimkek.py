# -*- coding: utf-8 -*-
"""Összetett ábrák a vonalkód-cikkhez: szerkezeti rajzok és címke-makettek.

A makettek nem illusztrációk: a bennük lévő vonalkódok ugyanazzal a kódolóval
készülnek, mint a különálló ábrák, és a visszaolvasó ellenőrzés is kiterjed
rájuk. Aki a cikkből dolgozik, tehát valódi, leolvasható mintát lát.

Futtatás a projekt gyökeréből: python3 scripts/vonalkod-cimkek.py
"""
import importlib.util
import os

spec = importlib.util.spec_from_file_location('v', 'scripts/vonalkod-abrak.py')
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)

KI = 'public/images/vonalkod'
os.makedirs(KI, exist_ok=True)

BETU = v.BETU
SANS = 'ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif'

TORZS = '599012345678'
GTIN13 = TORZS + v.gs1_ellenorzo(TORZS)
GTIN14 = '1' + TORZS + v.gs1_ellenorzo('1' + TORZS)
SSCC = '35990123000000123' + v.gs1_ellenorzo('35990123000000123')

TINTA, HALVANY, VONAL, KEK = '#0f172a', '#64748b', '#cbd5e1', '#1d4ed8'


def savok(sav, x0, y0, modul, magassag):
    """A sávminta SVG-téglalapokká, egy adott pontból kezdve."""
    r, i = [], 0
    while i < len(sav):
        if sav[i] == '1':
            j = i
            while j < len(sav) and sav[j] == '1':
                j += 1
            r.append(f'<rect x="{x0 + i * modul:.1f}" y="{y0}" width="{(j - i) * modul:.1f}" '
                     f'height="{magassag}" fill="#000000"/>')
            i = j
        else:
            i += 1
    return r


def szoveg(x, y, t, meret=13, betu=None, szin=TINTA, sulyt='normal', igazit='start'):
    return (f'<text x="{x}" y="{y}" font-family="{betu or SANS}" font-size="{meret}" '
            f'fill="{szin}" font-weight="{sulyt}" text-anchor="{igazit}">{t}</text>')


# ——————————————————————————————————————————————————————————————
# 1. A GTIN felépítése
# ——————————————————————————————————————————————————————————————
def gtin_felepites():
    SZ, MA, BAL = 900, 330, 60
    r = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SZ} {MA}" width="{SZ}" height="{MA}" role="img">',
         f'<rect width="{SZ}" height="{MA}" fill="#ffffff"/>']

    def sav(y, cim, reszek, jegymeret=26):
        r.append(szoveg(BAL, y - 12, cim, 13, SANS, HALVANY, '600'))
        x = BAL
        for felirat, jegyek, szin in reszek:
            w = len(jegyek) * (jegymeret * 0.66) + 16
            r.append(f'<rect x="{x}" y="{y}" width="{w:.1f}" height="46" rx="6" fill="{szin}"/>')
            r.append(szoveg(x + w / 2, y + 32, jegyek, jegymeret, BETU, '#ffffff' if szin != '#e2e8f0' else TINTA,
                            '600', 'middle'))
            r.append(szoveg(x + w / 2, y + 64, felirat, 12, SANS, HALVANY, 'normal', 'middle'))
            x += w + 8
        return x

    sav(50, 'GTIN-13 — fogyasztói egység (EAN-13 vonalkódban)', [
        ('GS1 cégelőtag', '5990123', '#1d4ed8'),
        ('cikkszám', '45678', '#0284c7'),
        ('ellenőrző', GTIN13[-1], '#0f172a'),
    ])
    sav(212, 'GTIN-14 — gyűjtőcsomagolás (ITF-14 vagy GS1-128 vonalkódban)', [
        ('szintjelző', GTIN14[0], '#b45309'),
        ('GS1 cégelőtag', '5990123', '#1d4ed8'),
        ('cikkszám', '45678', '#0284c7'),
        ('ellenőrző', GTIN14[-1], '#0f172a'),
    ])
    r.append(f'<path d="M 30 126 L 30 148 L 46 148" fill="none" stroke="{VONAL}" stroke-width="2"/>')
    r.append(f'<path d="M 30 236 L 30 166 L 46 166" fill="none" stroke="{VONAL}" stroke-width="2"/>')
    r.append(szoveg(BAL, 162, 'ugyanaz a törzs — elöl a szintjelző, a végén ÚJ ellenőrző szám',
                    13, SANS, KEK, '600'))
    r.append('</svg>')
    return '\n'.join(r)


# ——————————————————————————————————————————————————————————————
# 2. Az SSCC felépítése
# ——————————————————————————————————————————————————————————————
def sscc_felepites():
    SZ, MA, BAL = 900, 190, 60
    r = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SZ} {MA}" width="{SZ}" height="{MA}" role="img">',
         f'<rect width="{SZ}" height="{MA}" fill="#ffffff"/>']
    r.append(szoveg(BAL, 28, 'SSCC — logisztikai egység (raklap) azonosítója, 18 számjegy', 13, SANS, HALVANY, '600'))
    x = BAL
    for felirat, jegyek, szin, alcim in [
        ('kiterjesztő', SSCC[0], '#b45309', '0–9'),
        ('GS1 cégelőtag', SSCC[1:8], '#1d4ed8', 'a GS1-től'),
        ('sorozatszám', SSCC[8:17], '#0284c7', 'raklaponként új'),
        ('ellenőrző', SSCC[17], '#0f172a', 'számított'),
    ]:
        w = len(jegyek) * 17 + 16
        r.append(f'<rect x="{x}" y="46" width="{w}" height="50" rx="6" fill="{szin}"/>')
        r.append(szoveg(x + w / 2, 81, jegyek, 26, BETU, '#ffffff', '600', 'middle'))
        r.append(szoveg(x + w / 2, 115, felirat, 12, SANS, HALVANY, 'normal', 'middle'))
        r.append(szoveg(x + w / 2, 132, alcim, 11, SANS, VONAL, 'normal', 'middle'))
        x += w + 8
    r.append(szoveg(BAL, 168, 'A kiterjesztő és a cégelőtag együtt sem több 8 számjegynél, '
                            'így a sorozatszámra mindig 9 marad — összesen 17 + 1 ellenőrző.',
                    13, SANS, HALVANY))
    r.append('</svg>')
    return '\n'.join(r)


# ——————————————————————————————————————————————————————————————
# 3. A vonalkód anatómiája
# ——————————————————————————————————————————————————————————————
def anatomia():
    SZ, MA = 900, 285
    modul, mag = 4, 130
    sav = v.ean13_sav(GTIN13)
    x0 = 150
    r = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SZ} {MA}" width="{SZ}" height="{MA}" role="img">',
         f'<rect width="{SZ}" height="{MA}" fill="#ffffff"/>']
    # csendzóna sávok
    r.append(f'<rect x="{x0 - 11 * modul}" y="60" width="{11 * modul}" height="{mag + 8}" fill="#fef3c7"/>')
    r.append(f'<rect x="{x0 + len(sav) * modul}" y="60" width="{7 * modul}" height="{mag + 8}" fill="#fef3c7"/>')
    vez = [(0, 3), (45, 50), (92, 95)]
    i = 0
    while i < len(sav):
        if sav[i] == '1':
            j = i
            while j < len(sav) and sav[j] == '1':
                j += 1
            h = mag + 8 if any(i < b and j > a for a, b in vez) else mag
            r.append(f'<rect x="{x0 + i * modul}" y="60" width="{(j - i) * modul}" height="{h}" fill="#000000"/>')
            i = j
        else:
            i += 1
    r.append(szoveg(x0 - 11 * modul / 2, 212, '11 X', 12, BETU, '#b45309', '600', 'middle'))
    r.append(szoveg(x0 + len(sav) * modul + 7 * modul / 2, 212, '7 X', 12, BETU, '#b45309', '600', 'middle'))
    r.append(szoveg(x0 - 11 * modul / 2, 46, 'csendzóna', 11, SANS, '#b45309', '600', 'middle'))
    r.append(szoveg(x0 + len(sav) * modul + 7 * modul / 2, 46, 'csendzóna', 11, SANS, '#b45309', '600', 'middle'))
    # X-méret nyíl
    xx = x0 + 3 * modul
    r.append(f'<path d="M {xx} 252 L {xx + modul} 252" stroke="{KEK}" stroke-width="2"/>')
    r.append(f'<path d="M {xx} 247 L {xx} 257 M {xx + modul} 247 L {xx + modul} 257" stroke="{KEK}" stroke-width="2"/>')
    r.append(f'<path d="M {xx + modul} 252 L {xx + 44} 252" fill="none" stroke="{KEK}" stroke-width="1.5"/>')
    r.append(szoveg(xx + 52, 257, 'X-méret: a legkeskenyebb sáv szélessége', 13, SANS, KEK, '600'))
    # sávmagasság nyíl
    r.append(f'<path d="M {x0 + len(sav) * modul + 7 * modul + 30} 60 L {x0 + len(sav) * modul + 7 * modul + 30} {60 + mag}" '
             f'stroke="{KEK}" stroke-width="2"/>')
    r.append(szoveg(x0 + len(sav) * modul + 7 * modul + 40, 125, 'sávmagasság', 12, SANS, KEK))
    r.append(szoveg(x0 + len(sav) * modul / 2, 212, GTIN13, 16, BETU, TINTA, '600', 'middle'))
    r.append(szoveg(24, 28, 'Amitől egy vonalkód leolvasható', 15, SANS, TINTA, '600'))
    r.append('</svg>')
    return '\n'.join(r)


# ——————————————————————————————————————————————————————————————
# 4. Kartoncímke
# ——————————————————————————————————————————————————————————————
def karton_cimke():
    SZ, MA = 760, 486
    modul = 1.7
    adat = f'01{GTIN14}10L2608A|15270131'
    sav = v.code128_sav(adat, gs1=True)
    r = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SZ} {MA}" width="{SZ}" height="{MA}" role="img">',
         f'<rect width="{SZ}" height="{MA}" fill="#ffffff" stroke="{VONAL}" stroke-width="2"/>']
    r.append(szoveg(28, 44, 'Blueway Trade Kft.', 20, SANS, TINTA, '700'))
    r.append(szoveg(28, 66, '2142 Nagytarcsa, Déri Miksa u. 10/A.', 13, SANS, HALVANY))
    r.append(szoveg(SZ - 28, 44, 'GYŰJTŐCSOMAG', 13, SANS, HALVANY, '600', 'end'))
    r.append(szoveg(SZ - 28, 66, '24 db / karton', 15, SANS, TINTA, '600', 'end'))
    r.append(f'<line x1="28" y1="84" x2="{SZ - 28}" y2="84" stroke="{VONAL}" stroke-width="1.5"/>')

    y = 118
    for cimke, ertek in [('TERMÉK', 'Példa termék, 500 g'),
                         ('GTIN (01)', f'{GTIN14[0]} {GTIN14[1:8]} {GTIN14[8:13]} {GTIN14[13]}'),
                         ('SARZS (10)', 'L2608A'),
                         ('MIN. MEGŐRZI (15)', '2027-01-31')]:
        r.append(szoveg(28, y, cimke, 11, SANS, HALVANY, '600'))
        r.append(szoveg(190, y, ertek, 16, BETU, TINTA, '600'))
        y += 30

    # ITF-14 balra, GS1-128 jobbra — a kettő ugyanazt a GTIN-t hordozza
    r.append(szoveg(28, 258, 'GS1-128 — GTIN + sarzs + dátum', 11, SANS, HALVANY, '600'))
    r.extend(savok(sav, 28, 272, modul, 84))
    r.append(szoveg(28, 374, f'(01) {GTIN14}  (10) L2608A  (15) 270131', 13, BETU, TINTA))
    r.append(szoveg(28, 404, 'ITF-14 — csak a GTIN, hullámkartonra nyomva', 11, SANS, HALVANY, '600'))
    itf = v.itf_sav(GTIN14)
    m = 1.7
    kw = len(itf) * m + 44
    r.append(f'<rect x="28" y="414" width="{kw:.0f}" height="52" fill="#000000"/>')
    r.append(f'<rect x="36" y="422" width="{kw - 16:.0f}" height="36" fill="#ffffff"/>')
    r.extend(savok(itf, 50, 422, m, 36))
    r.append(szoveg(28 + kw + 24, 448, f'{GTIN14[0]} {GTIN14[1:8]} {GTIN14[8:13]} {GTIN14[13]}',
                    16, BETU, TINTA, '600'))
    r.append('</svg>')
    return '\n'.join(r), adat


# ——————————————————————————————————————————————————————————————
# 5. Raklapcímke (GS1 Logistic Label)
# ——————————————————————————————————————————————————————————————
def raklap_cimke():
    """A GS1 szabvány szerinti háromsávos elrendezés, A5 arányban (148×210 mm).

    A lépték 4 egység = 1 mm, így a szabvány milliméteres előírásai közvetlenül
    ellenőrizhetők a rajzon: mindhárom GS1-128 sávmagassága 128 egység, azaz a
    logisztikai címkére előírt 32 mm.
    """
    SZ, MA = 592, 840          # 4 egység = 1 mm → A5
    modul, SAVMAG = 2.0, 128   # 128 egység = 32 mm, a GS1 minimuma
    a_adat = f'02{GTIN14}3724'          # (02) fix 14 jegy → nem kell elválasztó
    b_adat = '1527013110L2608A'         # a fix hosszú (15) elöl → elválasztó sem kell
    c_adat = f'00{SSCC}'
    r = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SZ} {MA}" width="{SZ}" height="{MA}" role="img">',
         f'<rect width="{SZ}" height="{MA}" fill="#ffffff" stroke="{VONAL}" stroke-width="2"/>']
    M = 24

    # — 1. sáv: szállítmányozói / szabad mező —
    r.append(szoveg(M, 30, 'FELADÓ', 10, SANS, HALVANY, '700'))
    r.append(szoveg(M, 50, 'Blueway Trade Kft.', 15, SANS, TINTA, '700'))
    r.append(szoveg(M, 68, '2142 Nagytarcsa, Déri Miksa u. 10/A.', 11, SANS, HALVANY))
    r.append(szoveg(M + 300, 30, 'CÍMZETT', 10, SANS, HALVANY, '700'))
    r.append(szoveg(M + 300, 50, 'Vevő Kft.', 15, SANS, TINTA, '700'))
    r.append(szoveg(M + 300, 68, '1097 Budapest, Példa út 1.', 11, SANS, HALVANY))
    r.append(f'<line x1="{M}" y1="84" x2="{SZ - M}" y2="84" stroke="{VONAL}" stroke-width="1.5"/>')
    r.append(szoveg(SZ - M, 102, '1. sáv — szállítmányozói adatok, szabad formátum', 10, SANS, VONAL, 'normal', 'end'))

    # — 2. sáv: ember által olvasható adatok —
    y = 136
    for cimke, ertek in [('TARTALOM GTIN (02)', f'{GTIN14[0]} {GTIN14[1:8]} {GTIN14[8:13]} {GTIN14[13]}'),
                         ('MENNYISÉG (37)', '24 karton'),
                         ('SARZS (10)', 'L2608A'),
                         ('MIN. MEGŐRZI (15)', '2027-01-31')]:
        r.append(szoveg(M, y, cimke, 10, SANS, HALVANY, '700'))
        r.append(szoveg(M + 200, y, ertek, 16, BETU, TINTA, '600'))
        y += 30
    r.append(f'<line x1="{M}" y1="{y - 8}" x2="{SZ - M}" y2="{y - 8}" stroke="{VONAL}" stroke-width="1.5"/>')
    r.append(szoveg(SZ - M, y + 10, '2. sáv — ugyanaz emberi szemnek', 10, SANS, VONAL, 'normal', 'end'))

    # — 3. sáv: vonalkódok, legalul mindig az SSCC —
    yb = y + 28
    for adat, hri in [(a_adat, f'(02) {GTIN14}  (37) 24'), (b_adat, '(15) 270131  (10) L2608A')]:
        sav = v.code128_sav(adat, gs1=True)
        sz_sav = len(sav) * modul
        r.extend(savok(sav, (SZ - sz_sav) / 2, yb, modul, SAVMAG))
        r.append(szoveg(SZ / 2, yb + SAVMAG + 18, hri, 13, BETU, TINTA, '600', 'middle'))
        yb += SAVMAG + 34

    r.append(f'<line x1="{M}" y1="{yb - 4}" x2="{SZ - M}" y2="{yb - 4}" stroke="{VONAL}" stroke-width="1"/>')
    r.append(szoveg(M, yb + 16, 'SSCC — a logisztikai egység azonosítója', 10, SANS, HALVANY, '700'))
    sav = v.code128_sav(c_adat, gs1=True)
    sz_sav = len(sav) * modul
    r.extend(savok(sav, (SZ - sz_sav) / 2, yb + 26, modul, SAVMAG))
    r.append(szoveg(SZ / 2, yb + SAVMAG + 48, f'(00) {SSCC[0]} {SSCC[1:8]} {SSCC[8:17]} {SSCC[17]}',
                    14, BETU, TINTA, '700', 'middle'))
    r.append(szoveg(SZ - M, yb + SAVMAG + 70, '3. sáv — vonalkódok; az SSCC mindig legalul, önálló kódban',
                    10, SANS, VONAL, 'normal', 'end'))
    r.append('</svg>')
    return '\n'.join(r), (a_adat, b_adat, c_adat)


if __name__ == '__main__':
    kesz = {}
    kesz['gtin-felepites.svg'] = gtin_felepites()
    kesz['sscc-felepites.svg'] = sscc_felepites()
    kesz['vonalkod-anatomia.svg'] = anatomia()
    kesz['karton-cimke.svg'], karton_adat = karton_cimke()
    kesz['raklap-cimke.svg'], raklap_adatok = raklap_cimke()
    for nev, svg in kesz.items():
        open(os.path.join(KI, nev), 'w', encoding='utf-8').write(svg)
        print(f'  {nev:26} {len(svg):6} bájt')
    print('\nA makettekbe kódolt adat:')
    print('  karton :', karton_adat.replace('|', ' <FNC1> '))
    for a in raklap_adatok:
        print('  raklap :', a)
