# -*- coding: utf-8 -*-
"""Ábrák az RFID-cikkhez: okoscímke felépítése, frekvenciák, EPC-memória,
a nyomtató kódolási útvonala és a felület hatása.

Itt nincs mit „visszaolvasni”, mint a vonalkódoknál — ezek magyarázó rajzok.
Egy dolgot viszont ellenőrizni tudunk és kell is: az EPC-példát. Az SGTIN-96
kódolót a GS1 Tag Data Standard kanonikus példájával vetjük össze, és a rajz
csak akkor készül el, ha az egyezik.

Futtatás a projekt gyökeréből: python3 scripts/rfid-abrak.py
"""
import os
import sys

KI = 'public/images/rfid'
os.makedirs(KI, exist_ok=True)

BETU = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
SANS = 'ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
TINTA, HALVANY, VONAL = '#0f172a', '#64748b', '#cbd5e1'
KEK, VILKEK, BOROSTYAN, ZOLD, PIROS = '#1d4ed8', '#0284c7', '#b45309', '#15803d', '#b91c1c'
PAPIR, REZ = '#f8fafc', '#d97706'


# ——————————————————————————————————————————————————————————————
# SGTIN-96 — a GS1 Tag Data Standard szerint
# ——————————————————————————————————————————————————————————————
PARTICIO = [(0, 40, 12, 4, 1), (1, 37, 11, 7, 2), (2, 34, 10, 11, 3), (3, 30, 9, 14, 4),
            (4, 27, 8, 17, 5), (5, 24, 7, 20, 6), (6, 20, 6, 24, 7)]


def sgtin96(cegelotag, cikkszam, sorozat, szuro=1):
    """EPC hexadecimális alak a cégelőtagból, a cikkszámból és a sorozatszámból.

    A partíció mezője mondja meg a leolvasónak, hol ér véget a cégelőtag és hol
    kezdődik a cikkszám — a kettő együtt mindig 44 bit, csak a határ mozog.
    """
    p = next(x for x in PARTICIO if x[2] == len(cegelotag))
    _, ce_bit, _, cikk_bit, cikk_jegy = p
    if len(cikkszam) != cikk_jegy:
        sys.exit(f'a cikkszám {len(cikkszam)} jegyű, {cikk_jegy} kellene')
    bitek = (f'{0x30:08b}{szuro:03b}{p[0]:03b}'
             f'{int(cegelotag):0{ce_bit}b}{int(cikkszam):0{cikk_bit}b}{sorozat:038b}')
    return f'{int(bitek, 2):024X}', bitek


# a kódoló ellenőrzése a szabvány saját példáján, mielőtt bármit rajzolnánk
_hex, _ = sgtin96('0614141', '812345', 6789, szuro=3)
if _hex != '3074257BF7194E4000001A85':
    sys.exit(f'az SGTIN-96 kódoló hibás: {_hex}')

CEGELOTAG, CIKKSZAM, SOROZAT = '5990123', '045678', 1
EPC_HEX, EPC_BIT = sgtin96(CEGELOTAG, CIKKSZAM, SOROZAT, szuro=1)


def sz(x, y, t, meret=13, betu=None, szin=TINTA, sulyt='normal', igazit='start'):
    return (f'<text x="{x}" y="{y}" font-family="{betu or SANS}" font-size="{meret}" '
            f'fill="{szin}" font-weight="{sulyt}" text-anchor="{igazit}">{t}</text>')


def fej(szeles, magas):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {szeles} {magas}" '
            f'width="{szeles}" height="{magas}" role="img">',
            f'<rect width="{szeles}" height="{magas}" fill="#ffffff"/>']


# ——————————————————————————————————————————————————————————————
# 1. Az okoscímke felépítése
# ——————————————————————————————————————————————————————————————
def cimke_felepites():
    SZ, MA = 900, 320
    r = fej(SZ, MA)
    r.append(sz(24, 30, 'Az RFID-okoscímke felépítése', 15, SANS, TINTA, '600'))

    # — bal oldal: felülnézet —
    r.append(sz(24, 62, 'FELÜLNÉZET', 10, SANS, HALVANY, '700'))
    bx, by, bw, bh = 24, 76, 380, 150
    r.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="8" fill="{PAPIR}" stroke="{VONAL}" stroke-width="2"/>')
    ky = by + bh / 2
    r.append(f'<path d="M {bx+40} {ky} L {bx+165} {ky}" stroke="{REZ}" stroke-width="7" stroke-linecap="round"/>')
    r.append(f'<path d="M {bx+215} {ky} L {bx+340} {ky}" stroke="{REZ}" stroke-width="7" stroke-linecap="round"/>')
    for dx in (40, 340):
        r.append(f'<path d="M {bx+dx} {ky-26} L {bx+dx} {ky+26}" stroke="{REZ}" stroke-width="7" stroke-linecap="round"/>')
    r.append(f'<rect x="{bx+182}" y="{ky-16}" width="36" height="32" rx="4" fill="{TINTA}"/>')
    r.append(sz(bx + 200, ky + 6, 'chip', 11, SANS, '#ffffff', '700', 'middle'))
    r.append(sz(bx + 190, ky - 42, 'antenna (alumínium vagy réz)', 11, SANS, REZ, '600', 'middle'))
    r.append(sz(bx + bw / 2, by + bh + 22, 'a nyomtatható felület a fólia fölött van', 11, SANS, HALVANY, 'normal', 'middle'))

    # — jobb oldal: metszet. A rétegsáv keskeny, hogy a feliratnak maradjon hely. —
    jx, jw = 452, 186
    r.append(sz(jx, 62, 'METSZET', 10, SANS, HALVANY, '700'))
    retegek = [
        ('címkeanyag — ide nyomtatunk', '#ffffff', 26),
        ('inlay: fólia + antenna + chip', '#fef3c7', 34),
        ('ragasztó', '#e0f2fe', 20),
        ('szilikonozott hordozó (liner)', '#f1f5f9', 24),
    ]
    y = 76
    for nev, szin, h in retegek:
        r.append(f'<rect x="{jx}" y="{y}" width="{jw}" height="{h}" fill="{szin}" stroke="{VONAL}" stroke-width="1.5"/>')
        r.append(sz(jx + jw + 14, y + h / 2 + 4, nev, 12, SANS, TINTA))
        y += h
    # a chip dudora, a nyíl a rétegek FÖLÉ mutat, ahol van hely
    r.append(f'<rect x="{jx+80}" y="102" width="30" height="14" fill="{TINTA}"/>')
    r.append(f'<path d="M {jx+95} 102 L {jx+95} 60" stroke="{PIROS}" stroke-width="1.5"/>')
    r.append(sz(jx + 102, 56, 'a chip 0,1–0,2 mm-es dudort ad', 11, SANS, PIROS, '600'))
    r.append(sz(jx, y + 34, 'Ezért nem szabad a chip fölé nyomtatni: a nyomtatófej nekifeszül', 12, SANS, HALVANY))
    r.append(sz(jx, y + 52, 'a dudornak, és pontok mennek tönkre rajta.', 12, SANS, HALVANY))
    r.append('</svg>')
    return '\n'.join(r)


# ——————————————————————————————————————————————————————————————
# 2. Frekvenciasávok
# ——————————————————————————————————————————————————————————————
def frekvenciak():
    SZ, MA = 900, 330
    r = fej(SZ, MA)
    r.append(sz(24, 30, 'A három RFID-frekvenciasáv', 15, SANS, TINTA, '600'))
    fejlec = [('SÁV', 24), ('FREKVENCIA', 150), ('OLVASÁSI TÁV', 300), ('FÉM / FOLYADÉK', 450), ('TIPIKUS HASZNÁLAT', 640)]
    for cim, x in fejlec:
        r.append(sz(x, 62, cim, 10, SANS, HALVANY, '700'))
    sorok = [
        ('LF', '125 / 134 kHz', 'néhány cm', 'alig zavarja', 'állatjelölés, beléptetés', '#94a3b8'),
        ('HF / NFC', '13,56 MHz', '10 cm-ig', 'fém zavarja', 'okostelefon, jegy, könyvtár', VILKEK),
        ('UHF', '865–868 MHz (EU)', '2–10 m', 'mindkettő erősen', 'logisztika, raktár, kiskereskedelem', KEK),
    ]
    y = 84
    for sav, frek, tav, zavar, hasznalat, szin in sorok:
        r.append(f'<rect x="24" y="{y}" width="852" height="54" rx="8" fill="{"#eff6ff" if sav == "UHF" else "#f8fafc"}"/>')
        r.append(f'<rect x="24" y="{y}" width="6" height="54" rx="3" fill="{szin}"/>')
        r.append(sz(44, y + 33, sav, 15, SANS, szin, '700'))
        r.append(sz(150, y + 33, frek, 13, BETU, TINTA))
        r.append(sz(300, y + 33, tav, 13, SANS, TINTA))
        r.append(sz(450, y + 33, zavar, 13, SANS, TINTA))
        r.append(sz(640, y + 33, hasznalat, 13, SANS, TINTA))
        y += 62
    r.append(f'<rect x="24" y="{y+8}" width="852" height="58" rx="8" fill="#fef3c7"/>')
    r.append(sz(44, y + 32, 'A címkenyomtatóval írható okoscímke szinte mindig UHF, EPC Gen2 (ISO/IEC 18000-63).', 13, SANS, TINTA, '600'))
    r.append(sz(44, y + 52, 'Észak-Amerikában a sáv 902–928 MHz: a csak arra hangolt címke Európában rosszabbul szól.', 12, SANS, HALVANY))
    r.append('</svg>')
    return '\n'.join(r)


# ——————————————————————————————————————————————————————————————
# 3. EPC Gen2 memória és az SGTIN-96
# ——————————————————————————————————————————————————————————————
def epc_memoria():
    SZ, MA = 900, 400
    r = fej(SZ, MA)
    r.append(sz(24, 30, 'Mi van a chipben, és mit írunk bele?', 15, SANS, TINTA, '600'))
    bankok = [
        ('00', 'Reserved', 'kill- és hozzáférési jelszó', '#f1f5f9', TINTA),
        ('01', 'EPC', 'ide kerül az azonosító', '#dbeafe', KEK),
        ('10', 'TID', 'a chip gyári száma — nem írható', '#f1f5f9', TINTA),
        ('11', 'User', 'szabad terület, ha a chipben van', '#f1f5f9', TINTA),
    ]
    x = 24
    for kod, nev, leiras, szin, szoveg in bankok:
        w = 208
        r.append(f'<rect x="{x}" y="52" width="{w}" height="86" rx="8" fill="{szin}" stroke="{VONAL}" stroke-width="1.5"/>')
        r.append(sz(x + 14, 74, f'bank {kod}', 10, BETU, HALVANY, '700'))
        r.append(sz(x + 14, 98, nev, 16, SANS, szoveg, '700'))
        r.append(sz(x + 14, 122, leiras, 11, SANS, HALVANY))
        x += w + 6

    r.append(sz(24, 176, 'AZ EPC ÖSSZERAKÁSA — SGTIN-96, a GTIN-ből és egy sorozatszámból', 10, SANS, HALVANY, '700'))
    mezok = [
        ('fejléc', '30', '8 bit', '#475569'),
        ('szűrő', '1', '3 bit', '#64748b'),
        ('partíció', '5', '3 bit', '#94a3b8'),
        ('cégelőtag', CEGELOTAG, '24 bit', KEK),
        ('cikkszám', CIKKSZAM, '20 bit', VILKEK),
        ('sorozatszám', str(SOROZAT), '38 bit', BOROSTYAN),
    ]
    x = 24
    for nev, ertek, bit, szin in mezok:
        w = max(72, len(ertek) * 15 + 30)
        r.append(f'<rect x="{x}" y="192" width="{w}" height="48" rx="6" fill="{szin}"/>')
        r.append(sz(x + w / 2, 222, ertek, 18, BETU, '#ffffff', '600', 'middle'))
        r.append(sz(x + w / 2, 258, nev, 11, SANS, HALVANY, 'normal', 'middle'))
        r.append(sz(x + w / 2, 274, bit, 10, BETU, VONAL, 'normal', 'middle'))
        x += w + 8

    r.append(f'<path d="M 24 294 L {x-8} 294" stroke="{VONAL}" stroke-width="1.5"/>')
    r.append(sz(24, 322, 'összesen 96 bit, a chipben ezt látja a leolvasó:', 12, SANS, HALVANY))
    r.append(f'<rect x="24" y="336" width="500" height="40" rx="6" fill="{TINTA}"/>')
    r.append(sz(274, 363, EPC_HEX, 19, BETU, '#ffffff', '600', 'middle'))
    r.append(sz(540, 352, 'A sorozatszám tesz különbséget két', 12, SANS, HALVANY))
    r.append(sz(540, 370, 'egyforma termék között — ezt a vonalkód nem tudja.', 12, SANS, HALVANY))
    r.append('</svg>')
    return '\n'.join(r)


# ——————————————————————————————————————————————————————————————
# 4. A nyomtató kódolási útvonala
# ——————————————————————————————————————————————————————————————
def nyomtatasi_ut():
    SZ, MA = 900, 440
    r = fej(SZ, MA)
    r.append(sz(24, 30, 'Hogyan ír a címkenyomtató a chipbe?', 15, SANS, TINTA, '600'))

    # a szalag útja — lejjebb, hogy a nyomtatófej ne érjen a felsoroláshoz
    yp = 232
    r.append(f'<path d="M 120 {yp} L 830 {yp}" stroke="{VONAL}" stroke-width="3"/>')
    # tekercs
    r.append(f'<circle cx="78" cy="{yp-26}" r="44" fill="{PAPIR}" stroke="{VONAL}" stroke-width="2"/>')
    r.append(f'<circle cx="78" cy="{yp-26}" r="13" fill="#ffffff" stroke="{VONAL}" stroke-width="2"/>')
    r.append(sz(78, yp + 42, 'tekercs', 11, SANS, HALVANY, 'normal', 'middle'))

    # címkék a szalagon, mindegyikben chip
    OSZT = 150
    for i in range(5):
        x = 140 + i * OSZT
        r.append(f'<rect x="{x}" y="{yp-34}" width="{OSZT-14}" height="34" rx="3" fill="#ffffff" stroke="{VONAL}" stroke-width="1.5"/>')
        r.append(f'<path d="M {x+18} {yp-17} L {x+58} {yp-17} M {x+78} {yp-17} L {x+118} {yp-17}" stroke="{REZ}" stroke-width="3"/>')
        r.append(f'<rect x="{x+60}" y="{yp-24}" width="16" height="14" rx="2" fill="{TINTA}"/>')

    # kódoló antenna
    r.append(f'<rect x="360" y="{yp+22}" width="130" height="40" rx="6" fill="#dbeafe" stroke="{KEK}" stroke-width="2"/>')
    r.append(sz(425, yp + 47, 'kódoló antenna', 12, SANS, KEK, '700', 'middle'))
    for dy in (0, 8, 16):
        r.append(f'<path d="M {400+dy} {yp+20} Q 425 {yp+4-dy} {450-dy} {yp+20}" fill="none" stroke="{KEK}" stroke-width="1.5" opacity="0.6"/>')

    # nyomtatófej
    r.append(f'<rect x="620" y="{yp-96}" width="150" height="46" rx="6" fill="{TINTA}"/>')
    r.append(sz(695, yp - 68, 'nyomtatófej', 12, SANS, '#ffffff', '700', 'middle'))
    r.append(f'<path d="M 695 {yp-50} L 695 {yp-36}" stroke="{TINTA}" stroke-width="2"/>')

    # osztás nyíl
    r.append(f'<path d="M 140 {yp+92} L {140+OSZT} {yp+92}" stroke="{BOROSTYAN}" stroke-width="2"/>')
    r.append(f'<path d="M 140 {yp+86} L 140 {yp+98} M {140+OSZT} {yp+86} L {140+OSZT} {yp+98}" stroke="{BOROSTYAN}" stroke-width="2"/>')
    r.append(sz(140 + OSZT / 2, yp + 114, 'címkeosztás', 12, SANS, BOROSTYAN, '600', 'middle'))

    r.append(sz(24, 62, '1.', 13, SANS, KEK, '700'))
    r.append(sz(44, 62, 'A címke előbb a kódoló antenna fölött halad el: a nyomtató beírja az EPC-t, majd vissza is olvassa.', 13, SANS, TINTA))
    r.append(sz(24, 84, '2.', 13, SANS, KEK, '700'))
    r.append(sz(44, 84, 'Csak ezután nyomtat. Ha az írás nem sikerült, a címkét áthúzza (VOID) és a következőre lép.', 13, SANS, TINTA))
    r.append(sz(24, 106, '3.', 13, SANS, KEK, '700'))
    r.append(sz(44, 106, 'A chipnek a címkén belül oda kell esnie, ahol a kódoló antenna éri — a címke nem cserélhető szabadon.', 13, SANS, TINTA))

    r.append(f'<rect x="24" y="{yp+134}" width="852" height="52" rx="8" fill="#fef3c7"/>')
    r.append(sz(44, yp + 158, 'Túl kicsi címkeosztásnál a tér a SZOMSZÉD chipet is eléri, és rossz címkére íródik az adat.', 13, SANS, TINTA, '600'))
    r.append(sz(44, yp + 178, 'Ezért ír elő a nyomtató minimális osztást, és ezért kell mintát küldeni a címkéből a beállításhoz.', 12, SANS, HALVANY))
    r.append('</svg>')
    return '\n'.join(r)


# ——————————————————————————————————————————————————————————————
# 5. A felület hatása
# ——————————————————————————————————————————————————————————————
def felulet_hatas():
    SZ, MA = 900, 392
    r = fej(SZ, MA)
    r.append(sz(24, 30, 'Miről olvasunk? A felület dönti el a hatótávot', 15, SANS, TINTA, '600'))
    esetek = [
        ('Karton, fa, műanyag', 'a hullám átmegy rajta', 'teljes hatótáv', ZOLD, 1.0,
         'ez az alapeset, erre tervezik a szabvány címkét'),
        ('Fém felület', 'a fém rövidre zárja az antennát', 'gyakorlatilag 0', PIROS, 0.04,
         'ide külön „on-metal” címke kell, távtartó réteggel'),
        ('Folyadék, nedves áru', 'a víz elnyeli a 868 MHz-et', 'töredékére esik', BOROSTYAN, 0.25,
         'távtartó vagy más címkehely segít, HF/NFC kevésbé érzékeny'),
    ]
    y = 58
    for cim, ok, eredmeny, szin, arany, tanacs in esetek:
        r.append(f'<rect x="24" y="{y}" width="852" height="80" rx="8" fill="#f8fafc"/>')
        r.append(f'<rect x="24" y="{y}" width="6" height="80" rx="3" fill="{szin}"/>')
        r.append(sz(46, y + 26, cim, 14, SANS, TINTA, '700'))
        r.append(sz(46, y + 48, ok, 12, SANS, HALVANY))
        r.append(sz(46, y + 68, tanacs, 12, SANS, HALVANY))
        # hatótáv-sáv
        sav_x, sav_w = 560, 250
        r.append(f'<rect x="{sav_x}" y="{y+30}" width="{sav_w}" height="14" rx="7" fill="#e2e8f0"/>')
        r.append(f'<rect x="{sav_x}" y="{y+30}" width="{max(6, sav_w*arany):.0f}" height="14" rx="7" fill="{szin}"/>')
        r.append(sz(sav_x, y + 24, eredmeny, 11, SANS, szin, '700'))
        y += 88
    r.append(sz(24, y + 22, 'A számok nagyságrendek: a valós hatótáv a chiptől, a leolvasó teljesítményétől és a környezettől is függ.',
                12, SANS, HALVANY))
    r.append(sz(24, y + 42, 'Ezért kell a végleges terméken, a végleges címkehelyen próbálni — laborban minden működik.',
                12, SANS, HALVANY))
    r.append('</svg>')
    return '\n'.join(r)


if __name__ == '__main__':
    abrak = {
        'rfid-cimke-felepites.svg': cimke_felepites(),
        'rfid-frekvenciak.svg': frekvenciak(),
        'rfid-epc-memoria.svg': epc_memoria(),
        'rfid-nyomtatasi-ut.svg': nyomtatasi_ut(),
        'rfid-felulet.svg': felulet_hatas(),
    }
    for nev, svg in abrak.items():
        open(os.path.join(KI, nev), 'w', encoding='utf-8').write(svg)
        print(f'  {nev:28} {len(svg):6} bájt')
    print(f'\nAz SGTIN-96 kódoló egyezik a GS1 hivatkozási példájával.')
    print(f'A cikk EPC-példája: GTIN 5990123456783 + sorozatszám {SOROZAT} → {EPC_HEX}')
